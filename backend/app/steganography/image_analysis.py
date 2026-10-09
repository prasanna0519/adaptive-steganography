import cv2
import numpy as np
from PIL import Image
import io
import base64

class ImageAnalyzer:
    @staticmethod
    def compute_edge_map(gray_img: np.ndarray) -> np.ndarray:
        """Computes normalized Sobel edge magnitude map."""
        sobelx = cv2.Sobel(gray_img, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray_img, cv2.CV_64F, 0, 1, ksize=3)
        magnitude = cv2.magnitude(sobelx, sobely)
        if magnitude.max() > 0:
            magnitude = magnitude / magnitude.max()
        return magnitude

    @staticmethod
    def compute_texture_map(gray_img: np.ndarray, window_size: int = 5) -> np.ndarray:
        """Computes normalized local variance/texture map."""
        img_float = gray_img.astype(np.float64) / 255.0
        mean = cv2.blur(img_float, (window_size, window_size))
        mean_sq = cv2.blur(img_float ** 2, (window_size, window_size))
        variance = mean_sq - (mean ** 2)
        variance = np.maximum(variance, 0.0)
        if variance.max() > 0:
            variance = variance / variance.max()
        return variance

    @staticmethod
    def compute_local_entropy(gray_img: np.ndarray, block_size: int = 8) -> np.ndarray:
        """Computes local Shannon entropy map over non-overlapping blocks."""
        h, w = gray_img.shape
        entropy_map = np.zeros((h, w), dtype=np.float64)
        
        for y in range(0, h - block_size + 1, block_size):
            for x in range(0, w - block_size + 1, block_size):
                block = gray_img[y:y+block_size, x:x+block_size]
                hist, _ = np.histogram(block, bins=256, range=(0, 256))
                hist = hist[hist > 0] / float(block.size)
                entropy = -np.sum(hist * np.log2(hist))
                entropy_map[y:y+block_size, x:x+block_size] = entropy
                
        max_entropy = np.log2(256)
        return np.clip(entropy_map / max_entropy, 0.0, 1.0)

    @classmethod
    def analyze_suitability(cls, image_np: np.ndarray) -> dict:
        """
        Analyzes image characteristics on zero-LSB plane (image_np & 0xFE) to guarantee 
        100% deterministic suitability map invariance between cover and stego images.
        """
        # Clear LSB plane for invariant feature calculation
        zero_lsb_np = image_np & 0xFE

        if len(zero_lsb_np.shape) == 3 and zero_lsb_np.shape[2] == 3:
            gray = cv2.cvtColor(zero_lsb_np, cv2.COLOR_RGB2GRAY)
        elif len(zero_lsb_np.shape) == 3 and zero_lsb_np.shape[2] == 4:
            gray = cv2.cvtColor(zero_lsb_np, cv2.COLOR_RGBA2GRAY)
        else:
            gray = zero_lsb_np

        edge_map = cls.compute_edge_map(gray)
        texture_map = cls.compute_texture_map(gray)
        entropy_map = cls.compute_local_entropy(gray)

        # Weighted combination for candidate embedding suitability
        suitability_map = 0.40 * edge_map + 0.30 * texture_map + 0.30 * entropy_map
        if suitability_map.max() > 0:
            suitability_map = suitability_map / suitability_map.max()

        h, w = gray.shape
        total_pixels = h * w
        channels = 3 if len(image_np.shape) == 3 else 1
        
        max_capacity_bits = total_pixels * channels
        max_capacity_bytes = max_capacity_bits // 8

        # Colorized Heatmap
        heatmap_uint8 = (suitability_map * 255).astype(np.uint8)
        color_heatmap = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
        color_heatmap_rgb = cv2.cvtColor(color_heatmap, cv2.COLOR_BGR2RGB)
        
        if len(image_np.shape) == 3 and image_np.shape[2] == 4:
            base_rgb = cv2.cvtColor(image_np, cv2.COLOR_RGBA2RGB)
        else:
            base_rgb = image_np
            
        blended = cv2.addWeighted(base_rgb, 0.5, color_heatmap_rgb, 0.5, 0)

        heatmap_b64 = cls.np_to_base64_png(color_heatmap_rgb)
        overlay_b64 = cls.np_to_base64_png(blended)

        return {
            "width": w,
            "height": h,
            "total_pixels": total_pixels,
            "channels": channels,
            "max_capacity_bytes": max_capacity_bytes,
            "avg_suitability": float(np.mean(suitability_map)),
            "edge_score": float(np.mean(edge_map)),
            "texture_score": float(np.mean(texture_map)),
            "entropy_score": float(np.mean(entropy_map)),
            "suitability_map": suitability_map,
            "heatmap_b64": heatmap_b64,
            "overlay_b64": overlay_b64
        }

    @staticmethod
    def np_to_base64_png(arr: np.ndarray) -> str:
        """Converts RGB numpy array to base64 PNG data string."""
        pil_img = Image.fromarray(arr.astype(np.uint8))
        buf = io.BytesIO()
        pil_img.save(buf, format="PNG")
        b64_str = base64.b64encode(buf.getvalue()).decode('utf-8')
        return f"data:image/png;base64,{b64_str}"
