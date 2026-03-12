import torch
from torchvision import models, transforms
from PIL import Image
import logging
import os

logger = logging.getLogger(__name__)

# --- 1. DEFINE THE MODEL ARCHITECTURE ---
# We must first create an instance of the same model architecture we used for training.
model = models.mobilenet_v2(weights=None) # We start with an untrained model structure

# --- 2. DEFINE THE CLASS NAMES ---
# This is the exact list of 38 classes your model was trained on.
# The order MUST be the same as the one discovered by the training script.
CLASS_NAMES = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy', 'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy',
    'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Potato___Early_blight',
    'Potato___Late_blight', 'Potato___healthy', 'Raspberry___healthy', 'Soybean___healthy',
    'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy',
    'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy'
]

# --- 3. CUSTOMIZE THE FINAL LAYER ---
# We need to replace the model's final layer with a new one that has the correct number of outputs (38 for our classes).
num_classes = len(CLASS_NAMES)
model.classifier[1] = torch.nn.Linear(in_features=model.classifier[1].in_features, out_features=num_classes)

# --- 4. LOAD YOUR TRAINED WEIGHTS ---
# This is where we load the "brain" you trained.
model_path = "plant_disease_classifier.pth"
if os.path.exists(model_path):
    try:
        # Load the weights into the model structure. We use map_location to ensure it works on CPU if needed.
        model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu'), weights_only=False))
        logger.info(f"Successfully loaded fine-tuned model from {model_path}")
    except Exception as e:
        logger.error(f"Error loading model weights: {e}")
else:
    logger.error(f"Model file not found at {model_path}. Make sure the trained model is in the backend folder and named correctly.")

model.eval() # Set the model to evaluation mode (very important!)

# --- 5. DEFINE IMAGE TRANSFORMATIONS (Must be the same as in training) ---
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# --- 6. THE CLASSIFICATION FUNCTION ---
def classify_real_image(image_path: str) -> dict:
    """
    Opens an image, preprocesses it, and uses our fine-tuned model to predict the plant disease.
    """
    try:
        img = Image.open(image_path).convert('RGB')
        input_tensor = preprocess(img)
        input_batch = input_tensor.unsqueeze(0) # Create a mini-batch as expected by the model

        with torch.no_grad(): # We don't need to calculate gradients for inference
            output = model(input_batch)
        
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        confidence, predicted_idx = torch.max(probabilities, 0)
        
        # Map the prediction index to our custom class name from the list
        predicted_class_name = CLASS_NAMES[predicted_idx.item()]
        
        # Clean up the name for better display (e.g., 'Tomato___Bacterial_spot' -> 'Tomato Bacterial Spot')
        clean_name = predicted_class_name.replace("___", " ").replace("_", " ")

        logger.info(f"Fine-tuned classifier result: '{clean_name}' with confidence {confidence.item():.2f}")
        
        return {"disease": clean_name, "confidence": confidence.item()}

    except Exception as e:
        logger.error(f"Error during image classification: {e}")
        return {"disease": "Error during analysis", "confidence": 0.0}

