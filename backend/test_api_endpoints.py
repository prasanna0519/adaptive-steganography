import os
import sys
import io
import cv2
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

client = TestClient(app)

def test_fastapi_routes():
    print("=== Testing FastAPI Endpoints via TestClient ===")
    
    # 1. Health check
    r = client.get("/api/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print(f"Health Check Passed: {r.json()}")

    # 2. Key Generation
    r = client.get("/api/generate-key")
    assert r.status_code == 200
    key_hex = r.json()["secret_key_hex"]
    print(f"Generate Key Passed: Key={key_hex[:16]}...")

    # 3. Create synthetic test PNG image
    img_np = np.random.randint(40, 220, (128, 128, 3), dtype=np.uint8)
    pil_img = Image.fromarray(img_np)
    buf = io.BytesIO()
    pil_img.save(buf, format="PNG")
    img_bytes = buf.getvalue()

    # 4. Analyze Image Endpoint
    files = {"file": ("test.png", img_bytes, "image/png")}
    r = client.post("/api/analyze-image", files=files)
    assert r.status_code == 200, f"Analyze image failed: {r.text}"
    analysis_res = r.json()
    print(f"Analyze Image Passed: Max Cap={analysis_res['max_capacity_bytes']} B, Avg Suitability={analysis_res['avg_suitability']}")

    # 5. Encrypt & Embed Endpoint
    data = {"message": "Meet me at 5 PM.", "secret_key": key_hex}
    files = {"file": ("test.png", img_bytes, "image/png")}
    r = client.post("/api/encrypt-embed", data=data, files=files)
    assert r.status_code == 200, f"Encrypt-embed failed: {r.text}"
    embed_res = r.json()
    stego_b64 = embed_res["stego_image_b64"]
    print(f"Encrypt-Embed Passed: PSNR={embed_res['psnr_db']} dB, SSIM={embed_res['ssim']}, Stego Prob={embed_res['stego_probability_pct']}")

    # 6. Extract & Decrypt Endpoint
    data = {"secret_key": key_hex, "stego_image_b64": stego_b64}
    r = client.post("/api/extract-decrypt", data=data)
    assert r.status_code == 200, f"Extract failed: {r.text}"
    extract_res = r.json()
    assert extract_res["message"] == "Meet me at 5 PM."
    print(f"Extract-Decrypt Passed: Recovered Message='{extract_res['message']}'")

    # 7. Steganalysis Endpoint
    files = {"file": ("test.png", img_bytes, "image/png")}
    r = client.post("/api/steganalysis", files=files)
    assert r.status_code == 200
    steg_res = r.json()
    print(f"Steganalysis Endpoint Passed: Class='{steg_res['classification']}', Prob={steg_res['stego_probability_pct']}")

    # 8. Evaluation Metrics Endpoint
    r = client.get("/api/evaluate")
    assert r.status_code == 200
    eval_res = r.json()
    print(f"Evaluation Endpoint Passed: Alg='{eval_res['encryption']['algorithm']}'")

    print("\n[SUCCESS] ALL FASTAPI API ENDPOINTS TESTED AND PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_fastapi_routes()
