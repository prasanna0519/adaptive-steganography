import numpy as np
import cv2
from typing import Dict, Any
from app.crypto.aes_gcm import AES256GCMCipher
from app.steganography.image_analysis import ImageAnalyzer
from app.steganography.adaptive_embedding import AdaptiveEmbedder

class PayloadExtractor:
    HEADER_MIN_BYTES = 4 + 1 + 4 + 12 + 16  # Magic(4) + Version(1) + Len(4) + Nonce(12) + Tag(16) = 37 bytes = 296 bits

    @classmethod
    def extract_payload(cls, stego_img_np: np.ndarray, key_hex: str) -> str:
        """
        Extracts encrypted payload from stego image using secret key and decrypts original plaintext.
        Raises ValueError if key is incorrect, image is modified, or header is invalid.
        """
        # Ensure 3-channel RGB image
        if len(stego_img_np.shape) == 2:
            stego_img = cv2.cvtColor(stego_img_np, cv2.COLOR_GRAY2RGB)
        elif stego_img_np.shape[2] == 4:
            stego_img = cv2.cvtColor(stego_img_np, cv2.COLOR_RGBA2RGB)
        else:
            stego_img = stego_img_np.copy()

        h, w, ch = stego_img.shape

        # 1. Analyze suitability map of stego image (quantized stability matches cover)
        analysis = ImageAnalyzer.analyze_suitability(stego_img)
        suitability_map = analysis["suitability_map"]

        # 2. First extract minimum header bits (296 bits = 37 bytes)
        min_bits_needed = cls.HEADER_MIN_BYTES * 8
        try:
            header_locations = AdaptiveEmbedder.get_deterministic_pixel_sequence(
                suitability_map, ch, min_bits_needed, key_hex
            )
        except ValueError as e:
            raise ValueError("Stego image capacity is too small or image is invalid.") from e

        # Extract bits
        header_bits = []
        for r, c, channel in header_locations:
            header_bits.append(stego_img[r, c, channel] & 1)

        # Convert bits to bytes
        header_bytes = bytearray()
        for i in range(0, len(header_bits), 8):
            byte_val = 0
            for b in range(8):
                byte_val = (byte_val << 1) | header_bits[i + b]
            header_bytes.append(byte_val)

        # Parse header
        magic = header_bytes[:4]
        if magic != AdaptiveEmbedder.MAGIC_BYTES:
            raise ValueError("Authentication failed. Invalid secret key or no valid payload detected in image.")

        version = header_bytes[4:5]
        payload_len = int.from_bytes(header_bytes[5:9], byteorder='big')
        nonce = bytes(header_bytes[9:21])
        tag = bytes(header_bytes[21:37])

        if payload_len <= 0 or payload_len > (h * w * ch // 8):
            raise ValueError("Invalid payload header. Key may be wrong or image has been modified.")

        # 3. Extract complete payload bits (Header + Ciphertext)
        total_payload_bytes_len = cls.HEADER_MIN_BYTES + payload_len
        total_bits_needed = total_payload_bytes_len * 8

        all_locations = AdaptiveEmbedder.get_deterministic_pixel_sequence(
            suitability_map, ch, total_bits_needed, key_hex
        )

        all_bits = []
        for r, c, channel in all_locations:
            all_bits.append(stego_img[r, c, channel] & 1)

        full_bytes = bytearray()
        for i in range(0, len(all_bits), 8):
            byte_val = 0
            for b in range(8):
                byte_val = (byte_val << 1) | all_bits[i + b]
            full_bytes.append(byte_val)

        ciphertext = bytes(full_bytes[37:])

        # 4. Decrypt & Authenticate via AES-256-GCM
        try:
            plaintext_bytes = AES256GCMCipher.decrypt(ciphertext, key_hex, nonce, tag)
            return plaintext_bytes.decode('utf-8')
        except UnicodeDecodeError:
            raise ValueError("Payload authentication succeeded, but message content is corrupted UTF-8.")
