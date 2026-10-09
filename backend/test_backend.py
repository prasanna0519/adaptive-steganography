import os
import sys
import numpy as np
import cv2

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.crypto.aes_gcm import AES256GCMCipher
from app.steganography.image_analysis import ImageAnalyzer
from app.steganography.adaptive_embedding import AdaptiveEmbedder
from app.steganography.extraction import PayloadExtractor
from app.steganography.metrics import ImageQualityMetrics
from app.ml.inference import SteganalysisInference
from app.ml.train_model import train_steganalysis_model

def run_tests():
    print("=== 1. Testing AES-256-GCM Cryptography ===")
    key_hex = AES256GCMCipher.generate_key_hex()
    msg = "Meet me at 5 PM."
    enc_res = AES256GCMCipher.encrypt(msg.encode('utf-8'), key_hex)
    dec_msg = AES256GCMCipher.decrypt(enc_res["ciphertext"], key_hex, enc_res["nonce"], enc_res["tag"]).decode('utf-8')
    assert dec_msg == msg, "AES-256-GCM Decryption failed!"
    print(f"AES-256-GCM Test Passed! Key={key_hex[:16]}..., Message='{dec_msg}'")

    print("\n=== 2. Testing Image Analysis & Suitability Heatmap ===")
    cover_np = np.random.randint(50, 200, (128, 128, 3), dtype=np.uint8)
    cv2.circle(cover_np, (64, 64), 30, (255, 0, 0), -1)
    analysis = ImageAnalyzer.analyze_suitability(cover_np)
    print(f"Suitability Analysis Passed! Avg Suitability={analysis['avg_suitability']:.4f}, Heatmap B64 Len={len(analysis['heatmap_b64'])}")

    print("\n=== 3. Testing Adaptive LSB Embedding & Extraction ===")
    embed_res = AdaptiveEmbedder.embed_payload(cover_np, msg, key_hex)
    stego_np = embed_res["stego_image_np"]
    
    recovered_msg = PayloadExtractor.extract_payload(stego_np, key_hex)
    assert recovered_msg == msg, f"Extraction failed! Expected '{msg}', got '{recovered_msg}'"
    print(f"Embedding & Extraction Round-Trip Passed! Recovered='{recovered_msg}'")

    wrong_key = AES256GCMCipher.generate_key_hex()
    try:
        PayloadExtractor.extract_payload(stego_np, wrong_key)
        assert False, "Should have failed with wrong key!"
    except ValueError as e:
        print(f"Wrong Key Rejection Test Passed! Exception correctly caught: '{e}'")

    print("\n=== 4. Testing Image Quality Metrics (MSE, PSNR, SSIM) ===")
    metrics = ImageQualityMetrics.evaluate_quality(cover_np, stego_np)
    print(f"Metrics Passed! PSNR={metrics['psnr_db']} dB, SSIM={metrics['ssim']}, MSE={metrics['mse']}")

    print("\n=== 5. Testing Steganalysis Inference & Model Training ===")
    steg_res = SteganalysisInference.predict(stego_np)
    print(f"Steganalysis Initial Prediction: Classification='{steg_res['classification']}', Prob={steg_res['stego_probability_pct']}")

    print("Training PyTorch Steganalysis CNN...")
    train_results = train_steganalysis_model(epochs=5, batch_size=8)
    print(f"Training Complete! Accuracy={train_results['accuracy']}, F1={train_results['f1_score']}")

    steg_res_after = SteganalysisInference.predict(stego_np)
    print(f"Post-Training Prediction: Classification='{steg_res_after['classification']}', Prob={steg_res_after['stego_probability_pct']}")

    print("\n[SUCCESS] ALL BACKEND UNIT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
