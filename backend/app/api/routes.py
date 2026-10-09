from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from typing import List, Optional
import numpy as np

from app.crypto.aes_gcm import AES256GCMCipher
from app.steganography.image_analysis import ImageAnalyzer
from app.steganography.adaptive_embedding import AdaptiveEmbedder
from app.steganography.extraction import PayloadExtractor
from app.steganography.metrics import ImageQualityMetrics
from app.ml.inference import SteganalysisInference
from app.ml.train_model import train_steganalysis_model
from app.utils.helpers import read_image_from_upload, decode_base64_image, np_to_base64_png
from app.api.schemas import (
    KeyGenerateResponse, ImageAnalysisResponse, EncryptEmbedResponse,
    ExtractDecryptRequest, ExtractDecryptResponse, SteganalysisResponse,
    RecommendationResponse, ImageCandidateEvaluation, EvaluationMetricsResponse
)

router = APIRouter()

@router.get("/generate-key", response_model=KeyGenerateResponse)
def generate_key():
    """Generates a cryptographically secure 256-bit AES key as a hex string."""
    return {"secret_key_hex": AES256GCMCipher.generate_key_hex()}

@router.post("/analyze-image", response_model=ImageAnalysisResponse)
async def analyze_image(file: UploadFile = File(...)):
    """Analyzes an image and computes its adaptive embedding suitability heatmap."""
    img_np, fmt = await read_image_from_upload(file)
    analysis = ImageAnalyzer.analyze_suitability(img_np)
    
    analysis.pop("suitability_map", None)
    return analysis

@router.post("/encrypt-embed", response_model=EncryptEmbedResponse)
async def encrypt_and_embed(
    message: str = Form(...),
    secret_key: Optional[str] = Form(None),
    file: UploadFile = File(...)
):
    """
    Encrypts secret message using AES-256-GCM and adaptively embeds it into cover image LSBs.
    Returns stego image, AES key, difference map, and evaluation metrics.
    """
    if not message.strip():
        raise HTTPException(status_code=400, detail="Secret message cannot be empty.")

    img_np, fmt = await read_image_from_upload(file)
    
    format_warning = None
    if fmt not in ["PNG", "BMP"]:
        format_warning = f"Uploaded format is {fmt}. JPEG/lossy compression alters pixel values and corrupts LSB payload. PNG is recommended for lossless embedding."

    if not secret_key or len(secret_key.strip()) == 0:
        secret_key = AES256GCMCipher.generate_key_hex()

    try:
        embed_res = AdaptiveEmbedder.embed_payload(img_np, message, secret_key)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    stego_np = embed_res["stego_image_np"]
    stego_b64 = np_to_base64_png(stego_np)

    q_metrics = ImageQualityMetrics.evaluate_quality(img_np, stego_np)
    steg_res = SteganalysisInference.predict(stego_np)

    return {
        "secret_key_hex": secret_key,
        "stego_image_b64": stego_b64,
        "difference_b64": q_metrics["difference_b64"],
        "heatmap_b64": embed_res["suitability_analysis"]["heatmap_b64"],
        "payload_bytes": embed_res["payload_bytes_len"],
        "bits_changed": embed_res["bits_changed"],
        "embedding_ratio": embed_res["embedding_ratio"],
        "psnr_db": q_metrics["psnr_db"],
        "ssim": q_metrics["ssim"],
        "mse": q_metrics["mse"],
        "stego_probability": steg_res["stego_probability"],
        "stego_probability_pct": steg_res["stego_probability_pct"],
        "classification": steg_res["classification"],
        "format_warning": format_warning
    }

@router.post("/extract-decrypt", response_model=ExtractDecryptResponse)
async def extract_and_decrypt(
    secret_key: str = Form(...),
    file: Optional[UploadFile] = File(None),
    stego_image_b64: Optional[str] = Form(None)
):
    """
    Extracts embedded payload from stego image using secret key, verifies AES-GCM tag, and decrypts message.
    Accepts either file upload or base64 stego image string.
    """
    if not secret_key or not secret_key.strip():
        raise HTTPException(status_code=400, detail="Secret key is required.")

    if file:
        stego_np, _ = await read_image_from_upload(file)
    elif stego_image_b64:
        stego_np = decode_base64_image(stego_image_b64)
    else:
        raise HTTPException(status_code=400, detail="Please provide either a stego image file or base64 string.")

    try:
        recovered_text = PayloadExtractor.extract_payload(stego_np, secret_key.strip())
        return {
            "success": True,
            "message": recovered_text,
            "payload_bytes": len(recovered_text.encode('utf-8'))
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/steganalysis", response_model=SteganalysisResponse)
async def analyze_steganalysis(file: UploadFile = File(...)):
    """Runs AI-based Steganalysis model on uploaded image to estimate Cover vs Stego classification."""
    img_np, _ = await read_image_from_upload(file)
    result = SteganalysisInference.predict(img_np)
    return result

@router.post("/recommend-image", response_model=RecommendationResponse)
async def recommend_best_image(
    message: str = Form(...),
    files: List[UploadFile] = File(...)
):
    """
    Analyzes up to 5 uploaded cover images for the given secret message.
    Performs encryption and adaptive embedding simulation on each candidate image.
    Evaluates capacity, PSNR, SSIM, MSE, and measured AI stego detection probability.
    Recommends candidate with lowest measured detectability meeting capacity/quality constraints.
    """
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="Please upload at least 1 image.")
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 candidate images permitted.")

    secret_key = AES256GCMCipher.generate_key_hex()
    message_bytes_len = len(message.encode('utf-8'))
    
    candidates = []
    
    for idx, upload_file in enumerate(files):
        img_np, fmt = await read_image_from_upload(upload_file)
        analysis = ImageAnalyzer.analyze_suitability(img_np)
        
        max_cap = analysis["max_capacity_bytes"]
        is_sufficient = max_cap >= (message_bytes_len + 50)
        
        if is_sufficient:
            try:
                embed_res = AdaptiveEmbedder.embed_payload(img_np, message, secret_key)
                stego_np = embed_res["stego_image_np"]
                stego_b64 = np_to_base64_png(stego_np)
                heatmap_b64 = embed_res["suitability_analysis"]["heatmap_b64"]
                
                q_metrics = ImageQualityMetrics.evaluate_quality(img_np, stego_np)
                steg_res = SteganalysisInference.predict(stego_np)
                
                psnr = q_metrics["psnr_db"]
                ssim = q_metrics["ssim"]
                mse = q_metrics["mse"]
                stego_prob = steg_res["stego_probability"]
                stego_prob_pct = steg_res["stego_probability_pct"]
            except Exception:
                is_sufficient = False
                stego_b64 = ""
                heatmap_b64 = analysis["heatmap_b64"]
                psnr, ssim, mse, stego_prob, stego_prob_pct = 0.0, 0.0, 999.0, 1.0, "100%"
        else:
            stego_b64 = ""
            heatmap_b64 = analysis["heatmap_b64"]
            psnr, ssim, mse, stego_prob, stego_prob_pct = 0.0, 0.0, 999.0, 1.0, "100%"

        candidates.append({
            "index": idx,
            "filename": upload_file.filename or f"image_{idx+1}.png",
            "capacity_bytes": max_cap,
            "is_capacity_sufficient": is_sufficient,
            "psnr_db": psnr,
            "ssim": ssim,
            "mse": mse,
            "stego_probability": stego_prob,
            "stego_probability_pct": stego_prob_pct,
            "avg_suitability": analysis["avg_suitability"],
            "stego_image_b64": stego_b64,
            "heatmap_b64": heatmap_b64
        })

    valid_candidates = [c for c in candidates if c["is_capacity_sufficient"] and c["psnr_db"] >= 35.0]
    
    if valid_candidates:
        valid_candidates.sort(key=lambda x: (x["stego_probability"], -x["psnr_db"]))
        best = valid_candidates[0]
        reason = f"Recommended candidate '{best['filename']}' achieved the lowest measured steganalysis probability ({best['stego_probability_pct']}) with high image fidelity (PSNR {best['psnr_db']} dB, SSIM {best['ssim']}) and sufficient payload capacity."
    else:
        candidates.sort(key=lambda x: -x["capacity_bytes"])
        best = candidates[0]
        reason = f"Candidate '{best['filename']}' selected based on highest payload capacity, but payload size is large relative to cover image constraints."

    sorted_all = sorted(candidates, key=lambda x: (x["stego_probability"], -x["psnr_db"]))
    for rank_idx, item in enumerate(sorted_all, 1):
        item["rank"] = rank_idx

    return {
        "recommended_index": best["index"],
        "recommended_filename": best["filename"],
        "recommendation_reason": reason,
        "secret_key_hex": secret_key,
        "candidates": candidates
    }

@router.get("/evaluate", response_model=EvaluationMetricsResponse)
def get_evaluation_metrics():
    """Returns comprehensive system evaluation specs and steganalysis model metrics."""
    metrics = SteganalysisInference.get_metrics()
    
    return {
        "encryption": {
            "algorithm": "AES-256-GCM",
            "key_size_bits": 256,
            "nonce_size_bytes": 12,
            "tag_size_bytes": 16,
            "authenticated_mode": True
        },
        "steganography": {
            "method": "Key-Derived Deterministic PRNG Adaptive LSB Embedding",
            "suitability_features": ["Sobel Edge Magnitude", "Local Texture Variance", "Shannon Block Entropy"],
            "lossless_format": "PNG",
            "header_magic": "ASTG"
        },
        "quality_benchmarks": {
            "target_min_psnr": ">= 40.0 dB",
            "target_min_ssim": ">= 0.9800",
            "typical_mse": "< 1.50"
        },
        "steganalysis_model": metrics
    }

@router.post("/train-model")
def trigger_train_model():
    """Triggers PyTorch Steganalysis CNN dataset generation & training pipeline."""
    try:
        results = train_steganalysis_model(epochs=10, batch_size=8)
        return {
            "status": "success",
            "message": "Model trained successfully!",
            "metrics": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")
