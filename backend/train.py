# backend/train.py

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms
import os
from tqdm import tqdm # A library to show a progress bar

def train_model():
    """
    This script will fine-tune a pre-trained MobileNetV2 model on our
    tomato disease dataset. The trained model will be saved to a file.
    """
    # --- 1. Configuration ---
    # Define paths and training parameters
    data_dir = 'dataset'
    train_dir = os.path.join(data_dir, 'train')
    valid_dir = os.path.join(data_dir, 'valid')
    
    # Training hyperparameters
    NUM_EPOCHS = 5  # An epoch is one full pass through the entire dataset
    BATCH_SIZE = 32 # Process images in batches of 32
    LEARNING_RATE = 0.001

    # --- 2. Data Augmentation and Normalization ---
    # Define transformations for the training and validation sets
    # For training, we apply random transformations to make our model more robust
    train_transforms = transforms.Compose([
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # For validation, we only resize and normalize
    valid_transforms = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # --- 3. Load the Data ---
    # Use ImageFolder to load our organized dataset
    train_dataset = datasets.ImageFolder(train_dir, train_transforms)
    valid_dataset = datasets.ImageFolder(valid_dir, valid_transforms)

    # Create data loaders to feed data to the model in batches
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    valid_loader = DataLoader(valid_dataset, batch_size=BATCH_SIZE)

    # Get the number of classes (i.e., the number of disease folders)
    num_classes = len(train_dataset.classes)
    print(f"Found {num_classes} classes: {train_dataset.classes}")

    # --- 4. Load the Pre-trained Model and Modify It ---
    # Load MobileNetV2, pre-trained on ImageNet
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)

    # **This is the key step of fine-tuning**
    # We replace the final layer (the "classifier") with a new one that
    # has the correct number of outputs for our specific dataset.
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, num_classes)
    
    # Check if a GPU is available and move the model to it
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    print(f"Using device: {device}")

    # --- 5. Define Loss Function and Optimizer ---
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

    # --- 6. The Training Loop ---
    print("\nStarting training...")
    for epoch in range(NUM_EPOCHS):
        model.train()  # Set model to training mode
        running_loss = 0.0
        
        # Use tqdm for a nice progress bar
        progress_bar = tqdm(train_loader, desc=f"Epoch {epoch+1}/{NUM_EPOCHS}")
        for inputs, labels in progress_bar:
            inputs, labels = inputs.to(device), labels.to(device)

            # Zero the parameter gradients
            optimizer.zero_grad()

            # Forward pass
            outputs = model(inputs)
            loss = criterion(outputs, labels)

            # Backward pass and optimize
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            progress_bar.set_postfix(loss=loss.item())

        epoch_loss = running_loss / len(train_dataset)
        print(f"Epoch {epoch+1}/{NUM_EPOCHS} -> Training Loss: {epoch_loss:.4f}")

    # --- 7. Save the Trained Model ---
    # The saved file will contain the "knowledge" our model has learned.
    save_path = 'tomato_classifier.pth'
    torch.save(model.state_dict(), save_path)
    print(f"\nTraining complete. Model saved to {save_path}")

# This makes the script runnable from the command line
if __name__ == '__main__':
    train_model()
