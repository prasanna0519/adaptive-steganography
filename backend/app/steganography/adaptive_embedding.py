import numpy as np
import io
from PIL import Image
from typing import Tuple, Dict, Any
from app.crypto.aes_gcm import AES256GCMCipher
from app.steganography.image_analysis import ImageAnalyzer

class AdaptiveEmbedder:
    MAGIC_BYTES = b"ASTG"
    VERSION_BYTE = b"\x01"

    @classmethod
    def create_payload_header(cls, nonce: bytes, tag: bytes, ciphertext: bytes) -> bytes:
        """
        Constructs binary payload header:
        [MAGIC: 4B][VERSION: 1B][PAYLOAD_LEN: 4B (uint32)][NONCE: 12B][TAG: 16B][CIPHERTEXT: NB]
        """
        payload_len = len(ciphertext)
        len_bytes = payload_len.to_bytes(4, byteorder='big')
        return cls.MAGIC_BYTES + cls.VERSION_BYTE + len_bytes + nonce + tag + ciphertext

    @classmethod
    def get_deterministic_pixel_sequence(
        cls, suitability_map: np.ndarray, channels: int, total_bits_needed: int, key_hex: str
    ) -> list:
        """
        Generates a deterministic sequence of (row, col, channel) locations:
        1. Quantizes suitability map into integer levels (0-63) for 100% stability against LSB modifications (+/-1).
        2. Sorts locations by quantized suitability level (highest suitability preferred first).
        3. Shuffles locations within suitability tiers using key-derived PRNG seed.
        """
        h, w = suitability_map.shape
        seed = AES256GCMCipher.derive_seed_from_key(key_hex)
        rng = np.random.default_rng(seed)

        # Quantize suitability map into 64 discrete bins to prevent LSB noise rank shifts
        quantized = (suitability_map * 63).astype(np.uint8)

        # Create all candidate (r, c, ch) tuples
        total_pixels = h * w
        coords_per_ch = total_pixels
        
        # Build coordinate lists grouped by quantized level
        tiers = {lvl: [] for lvl in range(64)}
        
        for r in range(h):
            for c in range(w):
                lvl = int(quantized[r, c])
                for ch in range(channels):
                    tiers[lvl].append((r, c, ch))

        selected_locations = []
        # Traverse tiers from highest suitability (63) down to lowest (0)
        for lvl in range(63, -1, -1):
            tier_coords = tiers[lvl]
            if not tier_coords:
                continue
            # Shuffle tier coords using key-derived PRNG
            rng.shuffle(tier_coords)
            selected_locations.extend(tier_coords)
            if len(selected_locations) >= total_bits_needed:
                break

        if len(selected_locations) < total_bits_needed:
            raise ValueError(f"Payload size ({total_bits_needed} bits) exceeds cover image capacity ({len(selected_locations)} bits).")

        return selected_locations[:total_bits_needed]

    @classmethod
    def embed_payload(
        cls, cover_image_np: np.ndarray, plaintext: str, key_hex: str
    ) -> Dict[str, Any]:
        """
        Encrypts text with AES-256-GCM and adaptively embeds payload into cover image LSBs.
        Returns dict containing stego image array, metrics, and payload metadata.
        """
        # 1. AES-256-GCM Encryption
        plaintext_bytes = plaintext.encode('utf-8')
        enc_res = AES256GCMCipher.encrypt(plaintext_bytes, key_hex)
        
        # 2. Build full binary payload
        full_payload_bytes = cls.create_payload_header(
            enc_res["nonce"], enc_res["tag"], enc_res["ciphertext"]
        )
        
        # Convert bytes to bit array
        payload_bits = []
        for byte in full_payload_bytes:
            for i in range(7, -1, -1):
                payload_bits.append((byte >> i) & 1)
                
        total_bits = len(payload_bits)

        # 3. Analyze Cover Image Suitability
        analysis = ImageAnalyzer.analyze_suitability(cover_image_np)
        suitability_map = analysis["suitability_map"]
        
        # Ensure 3-channel RGB uint8 image
        stego_img = cover_image_np.copy()
        if len(stego_img.shape) == 2:
            stego_img = cv2.cvtColor(stego_img, cv2.COLOR_GRAY2RGB)
        elif stego_img.shape[2] == 4:
            stego_img = cv2.cvtColor(stego_img, cv2.COLOR_RGBA2RGB)
            
        h, w, ch = stego_img.shape

        # 4. Get deterministic location sequence derived from secret key and suitability map
        target_locations = cls.get_deterministic_pixel_sequence(
            suitability_map, ch, total_bits, key_hex
        )

        # 5. Perform LSB Embedding
        bits_changed = 0
        for bit_idx, (r, c, channel) in enumerate(target_locations):
            current_val = stego_img[r, c, channel]
            target_bit = payload_bits[bit_idx]
            new_val = (current_val & 0xFE) | target_bit
            if new_val != current_val:
                bits_changed += 1
            stego_img[r, c, channel] = new_val

        embedding_ratio = total_bits / (h * w * ch)

        return {
            "stego_image_np": stego_img,
            "nonce_hex": enc_res["nonce_hex"],
            "tag_hex": enc_res["tag_hex"],
            "ciphertext_hex": enc_res["ciphertext_hex"],
            "payload_bytes_len": len(full_payload_bytes),
            "payload_bits_len": total_bits,
            "bits_changed": bits_changed,
            "embedding_ratio": float(embedding_ratio),
            "suitability_analysis": analysis
        }
