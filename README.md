# Digital Krishi Officer 🌱

**An AI-powered agricultural advisor for farmers in India, providing multilingual support, real-time data, and intelligent crop disease diagnosis.**

This project is a fully-featured, full-stack application designed to act as a "Digital Agriculture Officer." It bridges the information gap for farmers by providing instant, accessible, and localized expert advice on a wide range of agricultural topics. The system leverages a fine-tuned computer vision model, a local knowledge base (RAG), and live external APIs to deliver accurate, context-aware responses in multiple Indian languages.

---

## 📋 Core Features

* **🗣️ Strictly Multilingual AI:** Chat in **English**, **Kannada**, or **Malayalam**. The AI is strictly instructed to respond in the selected language, even if the user asks a question in a different language. The UI also translates dynamically.
* **📸 AI-Powered Image Diagnosis:** Upload an image or use your device's camera to get an instant diagnosis of plant diseases. The system uses a **custom-trained computer vision model** to identify specific conditions.
* **🧠 Local Knowledge Base (RAG):** The AI's knowledge is augmented with local documents. It can answer specific questions about regional advisories and government schemes that are not part of its general knowledge.
* **🌦️ Real-Time Weather Tool:** Get current weather and multi-day forecasts for any Indian city by asking naturally in the chat.
* **📈 Real-Time Market Price Tool:** Fetch the latest wholesale commodity prices from local Indian markets (mandis) via the official AGMARKNET API.
* **📝 Context-Aware Session Memory:** The chatbot remembers the previous turns of the current conversation, allowing for natural follow-up questions (e.g., asking "what is the treatment for that?" after a disease has been identified).
* **📱 Modern & Responsive UI:** The user interface is designed to be clean, intuitive, and fully responsive, working seamlessly on both mobile devices and desktop screens. It includes modern features like image previews and direct camera access.

---

## 🤖 The AI Engine Explained

The "brain" of this application consists of three specialized AI components working together.

### 1. The Image Classifier (`classifier.py`)
This is the specialist that diagnoses plant diseases.
* **Model:** A **MobileNetV2** deep learning model, chosen for its efficiency and accuracy on mobile devices.
* **Training:** The base model was fine-tuned using the `train.py` script on the public **PlantVillage dataset**, a collection of over 70,000 images.
* **Capabilities:** It is trained to accurately identify **38 different classes** of plant diseases and healthy leaves across 14 species, including Apple, Corn, Grape, Potato, and Tomato. The final trained model is saved as `plant_disease_classifier.pth`.
* **Limitations:** The model's accuracy is highest on images that are similar to its training data (clear photos of single leaves). Its performance may be lower on blurry images, photos with complex backgrounds, or diseases it was not trained on. This is a "domain shift" problem common to all vision models.

### 2. The Local Knowledge Base (`load_db.py`)
This is the AI's specialized, local memory.
* **Technology:** It uses a **ChromaDB vector database** and **Sentence Transformer** models to create a searchable knowledge base from local text files.
* **Function:** The `load_db.py` script is a one-time setup tool that reads all `.txt` files from the `/documents` folder, converts the text into numerical representations (embeddings), and stores them in the local `db` folder. This allows the main application to perform semantic searches to find the most relevant local information for a user's query.

### 3. The Live Data Tools (`tools.py`)
This file contains the Python functions that connect our application to the real world.
* **Function:** It defines the `get_weather` and `get_market_price` functions.
* **Mechanism:** These functions make live API calls to external services (WeatherAPI.com and data.gov.in) to fetch up-to-the-minute data. The AI agent in `main.py` can choose to call these functions when it detects a relevant user query.

### 4. The LLM Agent (`main.py`)
This is the central orchestrator that manages the conversation.
* **Model:** It uses a powerful Large Language Model (**Llama 3.1**) via the high-speed **Groq API**.
* **Function:** It acts as an intelligent "agent." Based on the user's question and the conversation history, it decides whether to:
    * Have a general chat.
    * Search the local knowledge base (RAG) for a specific answer.
    * Use a tool from `tools.py` (like `get_weather` or `get_market_price`).
    * Translate the results into the user's selected language.

---

## 🚀 Getting Started: Local Setup

Follow these instructions to get the project running on your local machine.

### Prerequisites

* [Git](https://git-scm.com/downloads) and **[Git LFS](https://git-lfs.github.com/)** (This is crucial for downloading the model file).
* [Python](https://www.python.org/downloads/) (3.10 or newer)
* [Node.js](https://nodejs.org/) (v18 or newer)

### Backend Setup

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd digital-krishi-ui
    ```
    *After cloning, Git LFS will automatically download the large `plant_disease_classifier.pth` file. This may take a moment.*

2.  **Navigate to the Backend Directory:**
    ```bash
    cd backend
    ```

3.  **Create and Activate a Virtual Environment:**
    ```bash
    # Create the environment
    python -m venv .venv

    # Activate it (Windows)
    .\.venv\Scripts\activate

    # Activate it (macOS/Linux)
    source .venv/bin/activate
    ```

4.  **Install Python Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Set Up Environment Variables (API Keys):**
    * Create a new file in the `backend` directory named `.env`.
    * Add your secret API keys to this file. **This file is ignored by Git and must not be shared.**
        ```
        GROQ_API_KEY="gsk_...Your_Groq_Key_Here"
        WEATHERAPI_API_KEY="Your_WeatherAPI.com_Key_Here"
        DATAGOV_API_KEY="Your_Data.gov.in_Key_Here"
        ```

6.  **Build the Local Knowledge Base (CRITICAL STEP):**
    * Run the ingestion script **once**. This will read the files in the `documents` folder and create the local `db` folder that the AI uses for its memory.
        ```bash
        python load_db.py
        ```

### Frontend Setup

1.  **Navigate to the Frontend Directory:**
    ```bash
    # From the project root
    cd frontend
    ```

2.  **Install Node.js Dependencies:**
    ```bash
    npm install
    ```

---

## ▶️ Running the Application

You need to run the backend and frontend servers in two separate terminals.

1.  **Run the Backend Server:**
    * Open a terminal in the `backend` directory.
    * Make sure your virtual environment is activated.
    * Run the Uvicorn server:
        ```bash
        uvicorn main:app --reload --port 8000
        ```
    * The backend will be running at `http://localhost:8000`.

2.  **Run the Frontend Server:**
    * Open a **new** terminal in the `frontend` directory.
    * Run the Next.js development server:
        ```bash
        npm run dev
        ```
    * The frontend will be running at `http://localhost:3000`.

3.  **Open the App:** Open `http://localhost:3000` in your web browser.

---

## ✨ Future Enhancements

This project serves as a powerful foundation. The next logical steps to expand its capabilities include:

* **Voice Integration:** Add Speech-to-Text (STT) and Text-to-Speech (TTS) capabilities so farmers can ask questions and hear responses by voice.
* **WhatsApp Bot:** Integrate the AI agent with the WhatsApp Business API to make it accessible on the most popular messaging platform in India.
* **IVR Phone Support:** Create an Interactive Voice Response (IVR) system that allows farmers without smartphones to call a number and interact with the AI over a standard phone call.
* **Persistent Memory:** Integrate a cloud database like Firebase Firestore to save user chat histories, allowing for long-term memory and personalization.
* **Model Expansion:** Continuously train and expand the image classifier with more diverse, locally sourced images to improve its accuracy and cover more crops and diseases.   

---

## ☁️ Deployment

This application is designed to be deployed for free:
* **Backend:** Containerized with `Dockerfile` and deployed to **Hugging Face Spaces**.
* **Frontend:** Deployed to **Vercel**, with the `NEXT_PUBLIC_API_URL` environment variable pointing to the public URL of the Hugging Face Space.
