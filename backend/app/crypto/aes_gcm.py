import secrets
import hashlib
try:
    from Crypto.Cipher import AES
except ImportError:
    from Cryptodome.Cipher import AES

class AES256GCMCipher:
    @staticmethod
    def generate_key_hex() -> str:
        """Generates a cryptographically secure 256-bit (32-byte) key as a hex string."""
        return secrets.token_hex(32)

    @staticmethod
    def derive_seed_from_key(key_hex: str) -> int:
        """Derives a deterministic 32-bit integer seed from the secret key for PRNG seeding."""
        key_bytes = bytes.fromhex(key_hex) if len(key_hex) == 64 else key_hex.encode('utf-8')
        digest = hashlib.sha256(key_bytes).digest()
        return int.from_bytes(digest[:4], byteorder='big')

    @staticmethod
    def encrypt(plaintext_bytes: bytes, key_hex: str) -> dict:
        """
        Encrypts plaintext bytes using AES-256-GCM.
        Returns dict containing nonce (12 bytes), tag (16 bytes), and ciphertext (bytes).
        """
        try:
            key_bytes = bytes.fromhex(key_hex)
            if len(key_bytes) != 32:
                key_bytes = hashlib.sha256(key_hex.encode('utf-8')).digest()
        except ValueError:
            key_bytes = hashlib.sha256(key_hex.encode('utf-8')).digest()

        nonce = secrets.token_bytes(12)
        cipher = AES.new(key_bytes, AES.MODE_GCM, nonce=nonce)
        
        ciphertext, tag = cipher.encrypt_and_digest(plaintext_bytes)
        
        return {
            "nonce": nonce,
            "tag": tag,
            "ciphertext": ciphertext,
            "nonce_hex": nonce.hex(),
            "tag_hex": tag.hex(),
            "ciphertext_hex": ciphertext.hex()
        }

    @staticmethod
    def decrypt(ciphertext: bytes, key_hex: str, nonce: bytes, tag: bytes) -> bytes:
        """
        Decrypts ciphertext using AES-256-GCM and verifies authentication tag.
        Raises ValueError on tag invalidation / wrong key.
        """
        try:
            key_bytes = bytes.fromhex(key_hex)
            if len(key_bytes) != 32:
                key_bytes = hashlib.sha256(key_hex.encode('utf-8')).digest()
        except ValueError:
            key_bytes = hashlib.sha256(key_hex.encode('utf-8')).digest()

        cipher = AES.new(key_bytes, AES.MODE_GCM, nonce=nonce)
        try:
            plaintext = cipher.decrypt_and_verify(ciphertext, tag)
            return plaintext
        except (ValueError, KeyError) as e:
            raise ValueError("Authentication failed. Invalid key, corrupted ciphertext, or modified payload.") from e
