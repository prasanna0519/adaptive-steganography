import os
import cv2
import numpy as np
import torch
from torch.utils.data import Dataset

class SteganalysisDataset(Dataset):
    """
    Dataset class for loading Cover (0) and Stego (1) image pairs.
    """
    def __init__(self, file_paths: list, labels: list, image_size: int = 256):
        self.file_paths = file_paths
        self.labels = labels
        self.image_size = image_size

    def __len__(self):
        return len(self.file_paths)

    def __getitem__(self, idx):
        path = self.file_paths[idx]
        label = self.labels[idx]

        # Load image in grayscale
        img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            # Fallback zero array if corrupted
            img = np.zeros((self.image_size, self.image_size), dtype=np.uint8)
        else:
            img = cv2.resize(img, (self.image_size, self.image_size))

        # Normalize to [0, 1] tensor shape (1, H, W)
        tensor = torch.from_numpy(img.astype(np.float32) / 255.0).unsqueeze(0)
        return tensor, torch.tensor(label, dtype=torch.long)
