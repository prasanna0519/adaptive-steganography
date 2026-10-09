import os
import numpy as np
import cv2

SAMPLES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/samples'))
os.makedirs(SAMPLES_DIR, exist_ok=True)

# Sample 1: Geometric Texture Pattern
h, w = 384, 384
x = np.linspace(0, 1, w)
y = np.linspace(0, 1, h)
xx, yy = np.meshgrid(x, y)
r = np.sqrt((xx - 0.5)**2 + (yy - 0.5)**2)
pattern1 = (np.sin(r * 20) * 100 + 128).astype(np.uint8)
img1 = cv2.applyColorMap(pattern1, cv2.COLORMAP_VIRIDIS)
cv2.imwrite(os.path.join(SAMPLES_DIR, 'sample_cover_1.png'), img1)

# Sample 2: Textured High-Complexity Gradient
pattern2 = (np.sin(xx * 15) * np.cos(yy * 15) * 120 + 128).astype(np.uint8)
noise = np.random.normal(0, 20, (h, w)).astype(np.float32)
img2_gray = np.clip(pattern2.astype(np.float32) + noise, 0, 255).astype(np.uint8)
img2 = cv2.applyColorMap(img2_gray, cv2.COLORMAP_PLASMA)
cv2.imwrite(os.path.join(SAMPLES_DIR, 'sample_cover_2.png'), img2)

# Sample 3: Geometric Shapes
img3 = np.full((h, w, 3), 40, dtype=np.uint8)
cv2.circle(img3, (192, 192), 100, (6, 182, 212), -1)
cv2.rectangle(img3, (50, 50), (150, 150), (139, 92, 246), -1)
cv2.rectangle(img3, (220, 220), (330, 330), (16, 185, 129), -1)
img3 = cv2.GaussianBlur(img3, (5, 5), 1.5)
cv2.imwrite(os.path.join(SAMPLES_DIR, 'sample_cover_3.png'), img3)

print("Sample cover images created in data/samples/")
