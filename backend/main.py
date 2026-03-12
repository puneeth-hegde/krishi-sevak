import os
import json
import shutil
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import chromadb
from sentence_transformers import SentenceTransformer

# Import our custom modules
from classifier import classify_real_image
from tools import get_weather, get_market_price

# --- INITIALIZATION ---
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- API KEY & MODEL VALIDATION ---
api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY not found in .env file. Please create a .env file in the backend folder and add your key.")
# Using a stable, fast model that is confirmed to be available.
MODEL_NAME = "llama-3.3-70b-versatile"

# --- CLIENTS INITIALIZATION ---
app = FastAPI(title="Digital Agriculture Officer API")
groq_client = Groq(api_key=api_key)

# Initialize the RAG components
try:
    db_client = chromadb.PersistentClient(path="db")
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    collection = db_client.get_collection("local_knowledge")
    RAG_ENABLED = True
    logger.info("RAG system initialized successfully.")
except Exception as e:
    RAG_ENABLED = False
    logger.warning(f"RAG system failed to initialize: {e}. It will be disabled.")

# --- CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    history: list[ChatMessage]
    language: str = "English"

# --- TOOL DEFINITIONS ---
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the weather forecast for a specific city in India. Can get current weather or a forecast for up to 3 days.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "The city name, e.g., Mysuru"},
                    # BUG FIX: Changed type to string to prevent validation error
                    "days": {"type": "string", "description": "Number of days for the forecast, from '1' (current) to '3'. Defaults to '1'."},
                },
                "required": ["city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_market_price",
            "description": "Get the latest wholesale market price for a specific agricultural commodity in a given market and state.",
            "parameters": {
                "type": "object",
                "properties": {
                    "commodity": {"type": "string", "description": "The agricultural commodity, e.g., Onion, Coconut"},
                    "market": {"type": "string", "description": "The specific market name, e.g., Mysore, Hubli"},
                    "state": {"type": "string", "description": "The state name, e.g., Karnataka"}
                },
                "required": ["commodity", "state"],
            },
        },
    },
]

# --- API ENDPOINTS ---
@app.get("/")
def read_root():
    return {"status": "Digital Agriculture Officer API is running."}

@app.post("/chat")
async def handle_chat(request: ChatRequest):
    # BUG FIX: Use .dict() for compatibility with Pydantic v1/v2
    messages = [msg.dict() for msg in request.history]
    try:
        # --- FINAL, UNIFIED SYSTEM PROMPT ---
        system_prompt = f"""You are a helpful Digital Agriculture Officer. A user has selected their preferred language as {request.language}.

        IMPORTANT AND FINAL RULES:
        1.  **STRICT LANGUAGE:** Your entire response MUST BE in {request.language}. Even if the user asks a question in English, you must reply in {request.language}. Do not switch languages for any reason.
        2.  **HANDLE TOOL ERRORS:** If a tool (like weather or market price) returns a 'sorry' or 'error' message, you MUST translate that specific message into {request.language} and present it clearly to the user.
        3.  **IGNORE OLD CONTEXT:** If you use a tool and the user asks a new, unrelated question, you MUST ignore the previous tool's result and answer the new question directly.
        """
        
        messages_with_system_prompt = [{"role": "system", "content": system_prompt}] + messages

        # Step 1: Check if a tool needs to be called
        initial_response = groq_client.chat.completions.create(model=MODEL_NAME, messages=messages_with_system_prompt, tools=tools, tool_choice="auto")
        response_message = initial_response.choices[0].message
        tool_calls = response_message.tool_calls

        # Step 2: If a tool is called, execute it and respond
        if tool_calls:
            available_tools = {"get_weather": get_weather, "get_market_price": get_market_price}
            function_name = tool_calls[0].function.name
            function_to_call = available_tools[function_name]
            function_args = json.loads(tool_calls[0].function.arguments)
            
            function_response = function_to_call(**function_args)
            
            messages.append(response_message)
            messages.append({"role": "tool", "tool_call_id": tool_calls[0].id, "name": function_name, "content": function_response})
            
            final_response = groq_client.chat.completions.create(model=MODEL_NAME, messages=[{"role": "system", "content": system_prompt}] + messages)
            return {"reply": final_response.choices[0].message.content}

        # Step 3: If no tool is called, proceed with RAG and general chat
        user_query = messages[-1]['content']
        context = ""
        if RAG_ENABLED:
            try:
                results = collection.query(query_texts=[user_query], n_results=1)
                if results.get('documents') and results['documents'][0]:
                    context = "\n\nUse this local context to answer:\n--- CONTEXT ---\n" + "\n".join(results['documents'][0]) + "\n--- END CONTEXT ---"
            except Exception as e:
                logger.error(f"Error querying RAG DB: {e}")

        system_prompt_with_context = f"{system_prompt}{context}"
        final_messages = [{"role": "system", "content": system_prompt_with_context}] + [msg for msg in messages if msg['role'] != 'system']
        
        chat_completion = groq_client.chat.completions.create(model=MODEL_NAME, messages=final_messages)
        return {"reply": chat_completion.choices[0].message.content}
    except Exception as e:
        logger.error(f"An error occurred in /chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get a response from the AI model.")

DIAGNOSIS_HEADERS = {
    "English": {"identification": "Identification", "actions": "Immediate Actions", "treatment": "Treatment Plan", "prevention": "Prevention Tips"},
    "Kannada": {"identification": "ಗುರುತಿಸುವಿಕೆ", "actions": "ತಕ್ಷಣದ ಕ್ರಮಗಳು", "treatment": "ಚಿಕಿತ್ಸಾ ಯೋಜನೆ", "prevention": "ತಡೆಗಟ್ಟುವಿಕೆ ಸಲಹೆಗಳು"},
    "Malayalam": {"identification": "ತಿരിച്ചറിയൽ", "actions": "ഉടനടി സ്വീകരിക്കേണ്ട നടപടികൾ", "treatment": "ചികിത്സാ പദ്ധതി", "prevention": "പ്രതിരോധത്തിനുള്ള നുറുങ്ങുകൾ"}
}

@app.post("/diagnose")
async def handle_diagnose(file: UploadFile = File(...), language: str = Form("English")):
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not save file.")
    try:
        result = classify_real_image(file_path)
        disease, confidence = result["disease"], result["confidence"]
        headers = DIAGNOSIS_HEADERS.get(language, DIAGNOSIS_HEADERS["English"])
        prompt = f"""An image analysis model identified: '{disease}' ({confidence:.0%} confidence). Your task is to act as an expert Digital Agriculture Officer. Based ONLY on this identification, provide a helpful advisory. 
        
        IMPORTANT, STRICT RULE: YOUR ENTIRE RESPONSE MUST BE IN {language} ONLY. Do not use any other language. 
        
        USE MARKDOWN FOR FORMATTING: Use headings (##), bold text (**), and lists (-). 
        If the object is a plant-related issue, provide a full advisory using the provided headers. 
        If the object is NOT a plant-related issue, simply state what you see and mention that it does not appear to be a crop problem. 
        
        Structure the advisory using these exact headers in {language} if applicable: 
        - ## {headers['identification']} 
        - ## {headers['actions']} 
        - ## {headers['treatment']} 
        - ## {headers['prevention']}
        """
        chat_completion = groq_client.chat.completions.create(messages=[{'role': 'user', 'content': prompt}], model=MODEL_NAME)
        response_content = chat_completion.choices[0].message.content
        return {"detected_disease": disease, "confidence": confidence, "advisory": response_content}
    except Exception as e:
        logger.error(f"An error occurred in /diagnose endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process the image.")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)