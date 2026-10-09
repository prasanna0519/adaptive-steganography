import os
import json
import torch
import cv2
import numpy as np
from app.ml.steganalysis_model import SteganalysisCNN, SteganalysisFeatureExtractor
from app.steganography.image_analysis import ImageAnalyzer

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../data'))
MODEL_PATH = os.path.join(DATA_DIR, 'models', 'steganalysis_cnn.pth')
METRICS_PATH = os.path.join(DATA_DIR, 'models', 'steganalysis_metrics.json')

class SteganalysisInference:
    _model_instance = None
    _metrics_cache = None

    @classmethod
    def get_metrics(cls) -> dict:
        """Loads cached training metrics or returns untrained default status."""
        if os.path.exists(METRICS_PATH):
            try:
                with open(METRICS_PATH, 'r') as f:
                    return json.load(f)
            except Exception:
                pass
        return {
            "is_trained": False,
            "model_name": "SteganalysisCNN_SRM_v1",
            "accuracy": None,
            "precision": None,
            "recall": None,
            "f1_score": None,
            "roc_auc": None,
            "message": "Model not trained — training required."
        }

    @classmethod
    def load_model(cls):
        """Lazy loads PyTorch model weights."""
        if cls._model_instance is not None:
            return cls._model_instance

        if not os.path.exists(MODEL_PATH):
            return None

        try:
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            model = SteganalysisCNN().to(device)
            model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
            model.eval()
            cls._model_instance = model
            return model
        except Exception as e:
            print(f"Error loading steganalysis model weights: {e}")
            return None

    @classmethod
    def predict(cls, image_np: np.ndarray) -> dict:
        """
        Runs Steganalysis inference on uploaded image.
        Returns prediction classification, probability, features, and model metrics.
        """
        # Ensure 2D grayscale array for model & features
        if len(image_np.shape) == 3 and image_np.shape[2] in [3, 4]:
            gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
        else:
            gray = image_np

        # Feature Extraction
        spatial_feats = SteganalysisFeatureExtractor.extract_spatial_features(gray)
        freq_feats = SteganalysisFeatureExtractor.extract_frequency_features(gray)
        
        # Load trained PyTorch CNN
        model = cls.load_model()
        metrics = cls.get_metrics()

        if model is None or not metrics.get("is_trained", False):
            # Model not trained state — fallback estimation based strictly on pixel residual variance
            res_var = spatial_feats["residual_variance"]
            # Baseline heuristic range for fallback signal
            est_prob = float(np.clip(0.15 + (res_var / 500.0) * 0.35, 0.05, 0.85))
            classification = "Stego Image" if est_prob >= 0.50 else "Cover Image"
            
            return {
                "is_trained": False,
                "classification": classification,
                "stego_probability": round(est_prob, 4),
                "stego_probability_pct": f"{round(est_prob * 100, 1)}%",
                "model_name": "Untrained / Fallback Steganalysis Estimator",
                "model_metrics": metrics,
                "spatial_features": spatial_feats,
                "frequency_features": freq_feats,
                "notice": "Model not trained — predictions are baseline feature estimates until model is trained."
            }

        # Real PyTorch Neural Network Inference
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        resized = cv2.resize(gray, (256, 256))
        tensor = torch.from_numpy(resized.astype(np.float32) / 255.0).unsqueeze(0).unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model(tensor)
            probs = torch.softmax(outputs, dim=1)[0]
            stego_prob = float(probs[1].item())

        classification = "Stego Image" if stego_prob >= 0.50 else "Cover Image"

        return {
            "is_trained": True,
            "classification": classification,
            "stego_probability": round(stego_prob, 4),
            "stego_probability_pct": f"{round(stego_prob * 100, 1)}%",
            "model_name": metrics.get("model_name", "SteganalysisCNN_SRM_v1"),
            "model_metrics": metrics,
            "spatial_features": spatial_feats,
            "frequency_features": freq_feats,
            "notice": "Estimated Steganalysis Detection Probability according to the trained model."
        }
