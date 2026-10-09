import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import cv2

# High-Pass Preprocessing Filters (Spatial Rich Model SRM residual kernel initialization)
SRM_KV_KERNEL = np.array([
    [-1,  2, -1],
    [ 2, -4,  2],
    [-1,  2, -1]
], dtype=np.float32) / 4.0

class SteganalysisCNN(nn.Module):
    """
    Convolutional Neural Network tailored for LSB Steganalysis.
    Uses high-pass spatial residual preprocessing filter followed by deep convolutional blocks.
    """
    def __init__(self):
        super(SteganalysisCNN, self).__init__()
        
        # High pass residual layer (1 input channel -> 30 feature maps, kernel_size=3)
        self.preprocessing = nn.Conv2d(1, 30, kernel_size=3, padding=1, bias=False)
        self._init_preprocessing_weights()

        # Conv Block 1
        self.block1 = nn.Sequential(
            nn.Conv2d(30, 30, kernel_size=3, padding=1),
            nn.BatchNorm2d(30),
            nn.ReLU(),
            nn.AvgPool2d(kernel_size=2, stride=2)
        )

        # Conv Block 2
        self.block2 = nn.Sequential(
            nn.Conv2d(30, 60, kernel_size=3, padding=1),
            nn.BatchNorm2d(60),
            nn.ReLU(),
            nn.AvgPool2d(kernel_size=2, stride=2)
        )

        # Conv Block 3
        self.block3 = nn.Sequential(
            nn.Conv2d(60, 120, kernel_size=3, padding=1),
            nn.BatchNorm2d(120),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((4, 4))
        )

        # Fully Connected Classification Head (2 output classes: 0 = Cover, 1 = Stego)
        self.fc = nn.Sequential(
            nn.Linear(120 * 4 * 4, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 2)
        )

    def _init_preprocessing_weights(self):
        """Initializes preprocessing layer with SRM noise residual kernels."""
        with torch.no_grad():
            kv_tensor = torch.from_numpy(SRM_KV_KERNEL).unsqueeze(0).unsqueeze(0)
            for i in range(30):
                noise = torch.randn_like(kv_tensor) * 0.01
                self.preprocessing.weight[i, 0] = kv_tensor[0, 0] + noise[0, 0]

    def forward(self, x):
        # Input shape: (B, 1, H, W)
        x = self.preprocessing(x)
        x = self.block1(x)
        x = self.block2(x)
        x = self.block3(x)
        x = x.view(x.size(0), -1)
        out = self.fc(x)
        return out


class SteganalysisFeatureExtractor:
    @staticmethod
    def extract_spatial_features(gray_img: np.ndarray) -> dict:
        """Extracts spatial domain residual and variance features."""
        img_float = gray_img.astype(np.float32)
        laplacian = cv2.Laplacian(img_float, cv2.CV_32F)
        residual_variance = float(np.var(laplacian))
        local_var = float(np.var(img_float))
        
        corr_h = float(np.corrcoef(img_float[:, :-1].ravel(), img_float[:, 1:].ravel())[0, 1])

        return {
            "residual_variance": round(residual_variance, 4),
            "global_variance": round(local_var, 4),
            "horizontal_correlation": round(corr_h, 4)
        }

    @staticmethod
    def extract_frequency_features(gray_img: np.ndarray) -> dict:
        """Extracts 2D Discrete Cosine Transform (DCT) high-frequency energy ratio."""
        h, w = gray_img.shape
        crop = gray_img[:min(h, 256), :min(w, 256)].astype(np.float32)
        dct_coeffs = cv2.dct(crop)
        
        total_energy = np.sum(np.abs(dct_coeffs))
        dc_energy = np.abs(dct_coeffs[0, 0])
        high_freq_energy = np.sum(np.abs(dct_coeffs[crop.shape[0]//2:, crop.shape[1]//2:]))

        high_freq_ratio = float(high_freq_energy / (total_energy + 1e-8))

        return {
            "dc_coefficient": round(float(dc_energy), 2),
            "high_frequency_ratio": round(high_freq_ratio, 6)
        }
