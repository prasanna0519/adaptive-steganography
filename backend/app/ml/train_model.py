import os
import sys
import json
import numpy as np
import cv2
from PIL import Image
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

# Ensure backend app in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.ml.steganalysis_model import SteganalysisCNN
from app.ml.dataset import SteganalysisDataset
from app.steganography.adaptive_embedding import AdaptiveEmbedder
from app.crypto.aes_gcm import AES256GCMCipher

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../data'))
COVER_DIR = os.path.join(DATA_DIR, 'cover')
STEGO_DIR = os.path.join(DATA_DIR, 'stego')
MODEL_DIR = os.path.join(DATA_DIR, 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'steganalysis_cnn.pth')
METRICS_PATH = os.path.join(MODEL_DIR, 'steganalysis_metrics.json')

def generate_synthetic_dataset(num_samples: int = 60):
    """
    Generates synthetic cover/stego image pairs for model training & baseline evaluation.
    """
    os.makedirs(COVER_DIR, exist_ok=True)
    os.makedirs(STEGO_DIR, exist_ok=True)
    os.makedirs(MODEL_DIR, exist_ok=True)

    print(f"Generating {num_samples} synthetic Cover & Stego image pairs...")
    
    sample_messages = [
        "Top secret intelligence report for project viva.",
        "Secure key exchange protocol iteration #402.",
        "Adaptive steganography payload with high complexity.",
        "Confidential encryption ciphertext test vector."
    ]

    for i in range(num_samples):
        cover_path = os.path.join(COVER_DIR, f"cover_{i:03d}.png")
        stego_path = os.path.join(STEGO_DIR, f"stego_{i:03d}.png")

        if os.path.exists(cover_path) and os.path.exists(stego_path):
            continue

        # Generate varied synthetic cover image (gradients, textures, shapes)
        h, w = 256, 256
        if i % 3 == 0:
            # Texture noise + gradient
            x = np.linspace(0, 1, w)
            y = np.linspace(0, 1, h)
            xx, yy = np.meshgrid(x, y)
            pattern = (np.sin(xx * 10) + np.cos(yy * 10)) * 60 + 128
            noise = np.random.normal(0, 15, (h, w))
            img_gray = np.clip(pattern + noise, 0, 255).astype(np.uint8)
        elif i % 3 == 1:
            # Geometric shapes with Gaussian blur
            img_gray = np.full((h, w), 180, dtype=np.uint8)
            cv2.circle(img_gray, (128, 128), 60, (50,), -1)
            cv2.rectangle(img_gray, (30, 30), (90, 90), (100,), -1)
            img_gray = cv2.GaussianBlur(img_gray, (7, 7), 2.0)
            img_gray = (img_gray + np.random.randint(-10, 10, (h, w))).clip(0, 255).astype(np.uint8)
        else:
            # Random natural texture pattern
            img_gray = np.random.randint(40, 220, (h, w), dtype=np.uint8)
            img_gray = cv2.medianBlur(img_gray, 5)

        # Convert to RGB
        cover_rgb = cv2.cvtColor(img_gray, cv2.COLOR_GRAY2RGB)
        cv2.imwrite(cover_path, cv2.cvtColor(cover_rgb, cv2.COLOR_RGB2BGR))

        # Embed secret payload to create stego image
        key_hex = AES256GCMCipher.generate_key_hex()
        msg = sample_messages[i % len(sample_messages)]
        try:
            res = AdaptiveEmbedder.embed_payload(cover_rgb, msg, key_hex)
            stego_rgb = res["stego_image_np"]
            cv2.imwrite(stego_path, cv2.cvtColor(stego_rgb, cv2.COLOR_RGB2BGR))
        except Exception as e:
            # Fallback direct LSB noise if image too small
            stego_rgb = cover_rgb.copy()
            stego_rgb[:, :, 0] ^= 1
            cv2.imwrite(stego_path, cv2.cvtColor(stego_rgb, cv2.COLOR_RGB2BGR))

    print("Synthetic dataset generation complete.")


def train_steganalysis_model(epochs: int = 15, batch_size: int = 8):
    """
    Trains PyTorch Steganalysis CNN model and saves metrics & model weights.
    """
    generate_synthetic_dataset(num_samples=60)

    # Collect cover and stego file lists
    cover_files = sorted([os.path.join(COVER_DIR, f) for f in os.listdir(COVER_DIR) if f.endswith('.png')])
    stego_files = sorted([os.path.join(STEGO_DIR, f) for f in os.listdir(STEGO_DIR) if f.endswith('.png')])

    num_pairs = min(len(cover_files), len(stego_files))
    cover_files = cover_files[:num_pairs]
    stego_files = stego_files[:num_pairs]

    # Grouped Train/Test split to avoid data leakage (pair-wise split)
    indices = np.arange(num_pairs)
    np.random.seed(42)
    np.random.shuffle(indices)

    split = int(0.75 * num_pairs)
    train_idx = indices[:split]
    test_idx = indices[split:]

    train_paths = [cover_files[i] for i in train_idx] + [stego_files[i] for i in train_idx]
    train_labels = [0] * len(train_idx) + [1] * len(train_idx)

    test_paths = [cover_files[i] for i in test_idx] + [stego_files[i] for i in test_idx]
    test_labels = [0] * len(test_idx) + [1] * len(test_idx)

    train_dataset = SteganalysisDataset(train_paths, train_labels)
    test_dataset = SteganalysisDataset(test_paths, test_labels)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training Steganalysis CNN on device: {device}")

    model = SteganalysisCNN().to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-4)

    # Training loop
    model.train()
    for epoch in range(epochs):
        running_loss = 0.0
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)

        epoch_loss = running_loss / len(train_dataset)
        if (epoch + 1) % 5 == 0 or epoch == epochs - 1:
            print(f"Epoch [{epoch+1}/{epochs}] - Loss: {epoch_loss:.4f}")

    # Model Evaluation
    model.eval()
    all_preds = []
    all_probs = []
    all_targets = []

    with torch.no_grad():
        for inputs, labels in test_loader:
            inputs = inputs.to(device)
            outputs = model(inputs)
            probs = torch.softmax(outputs, dim=1)[:, 1]
            _, preds = torch.max(outputs, 1)

            all_preds.extend(preds.cpu().numpy())
            all_probs.extend(probs.cpu().numpy())
            all_targets.extend(labels.numpy())

    acc = float(accuracy_score(all_targets, all_preds))
    prec = float(precision_score(all_targets, all_preds, zero_division=0))
    rec = float(recall_score(all_targets, all_preds, zero_division=0))
    f1 = float(f1_score(all_targets, all_preds, zero_division=0))
    try:
        auc = float(roc_auc_score(all_targets, all_probs))
    except Exception:
        auc = 0.50

    cm = confusion_matrix(all_targets, all_preds).tolist()

    metrics = {
        "is_trained": True,
        "model_name": "SteganalysisCNN_SRM_v1",
        "epochs": epochs,
        "train_samples": len(train_paths),
        "test_samples": len(test_paths),
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(auc, 4),
        "confusion_matrix": cm
    }

    # Save trained model weights & metrics
    torch.save(model.state_dict(), MODEL_PATH)
    with open(METRICS_PATH, 'w') as f:
        json.dump(metrics, f, indent=2)

    print("Model training complete!")
    print(f"Saved model to: {MODEL_PATH}")
    print(f"Metrics: Acc={acc:.2f}, F1={f1:.2f}, AUC={auc:.2f}")

    return metrics

if __name__ == "__main__":
    train_steganalysis_model()
