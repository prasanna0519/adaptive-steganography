import numpy as np
import cv2
from skimage.metrics import structural_similarity as compare_ssim
from app.steganography.image_analysis import ImageAnalyzer

class ImageQualityMetrics:
    @staticmethod
    def calculate_mse(img1: np.ndarray, img2: np.ndarray) -> float:
        """Calculates Mean Squared Error between two images."""
        diff = img1.astype(np.float64) - img2.astype(np.float64)
        err = np.mean(diff ** 2)
        return float(err)

    @staticmethod
    def calculate_psnr(img1: np.ndarray, img2: np.ndarray) -> float:
        """Calculates Peak Signal-to-Noise Ratio in dB."""
        mse = ImageQualityMetrics.calculate_mse(img1, img2)
        if mse == 0:
            return 99.99  # Identical images
        max_pixel = 255.0
        psnr = 20 * np.log10(max_pixel / np.sqrt(mse))
        return float(psnr)

    @staticmethod
    def calculate_ssim(img1: np.ndarray, img2: np.ndarray) -> float:
        """Calculates Structural Similarity Index (SSIM)."""
        # Ensure identical shapes
        if img1.shape != img2.shape:
            return 0.0

        # Handle multichannel SSIM
        if len(img1.shape) == 3 and img1.shape[2] == 3:
            val = compare_ssim(img1, img2, channel_axis=2)
        elif len(img1.shape) == 3 and img1.shape[2] == 4:
            val = compare_ssim(img1[:, :, :3], img2[:, :, :3], channel_axis=2)
        else:
            val = compare_ssim(img1, img2)
        return float(val)

    @classmethod
    def generate_diff_visualization(cls, cover_img: np.ndarray, stego_img: np.ndarray, amplification: int = 10) -> str:
        """
        Generates 10x amplified pixel difference image base64 data string.
        """
        if cover_img.shape != stego_img.shape:
            # Resize stego to cover if needed
            stego_img = cv2.resize(stego_img, (cover_img.shape[1], cover_img.shape[0]))

        diff = np.abs(cover_img.astype(np.float64) - stego_img.astype(np.float64))
        amp_diff = np.clip(diff * amplification, 0, 255).astype(np.uint8)
        
        # Colorize diff map for enhanced visual visibility
        if len(amp_diff.shape) == 3:
            gray_diff = cv2.cvtColor(amp_diff, cv2.COLOR_RGB2GRAY)
        else:
            gray_diff = amp_diff

        color_diff = cv2.applyColorMap(gray_diff, cv2.COLORMAP_HOT)
        color_diff_rgb = cv2.cvtColor(color_diff, cv2.COLOR_BGR2RGB)
        
        return ImageAnalyzer.np_to_base64_png(color_diff_rgb)

    @classmethod
    def evaluate_quality(cls, cover_img: np.ndarray, stego_img: np.ndarray) -> dict:
        """
        Evaluates MSE, PSNR, SSIM, and generates visual difference overlay.
        """
        mse = cls.calculate_mse(cover_img, stego_img)
        psnr = cls.calculate_psnr(cover_img, stego_img)
        ssim = cls.calculate_ssim(cover_img, stego_img)
        diff_b64 = cls.generate_diff_visualization(cover_img, stego_img, amplification=10)

        return {
            "mse": round(mse, 6),
            "psnr_db": round(psnr, 2),
            "ssim": round(ssim, 4),
            "difference_b64": diff_b64
        }
