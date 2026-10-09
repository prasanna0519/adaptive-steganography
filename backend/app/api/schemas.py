from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class KeyGenerateResponse(BaseModel):
    secret_key_hex: str = Field(..., description="Cryptographically secure 256-bit AES key in hex format")

class ImageAnalysisResponse(BaseModel):
    width: int
    height: int
    total_pixels: int
    channels: int
    max_capacity_bytes: int
    avg_suitability: float
    edge_score: float
    texture_score: float
    entropy_score: float
    heatmap_b64: str
    overlay_b64: str

class EncryptEmbedResponse(BaseModel):
    secret_key_hex: str
    stego_image_b64: str
    difference_b64: str
    heatmap_b64: str
    payload_bytes: int
    bits_changed: int
    embedding_ratio: float
    psnr_db: float
    ssim: float
    mse: float
    stego_probability: float
    stego_probability_pct: str
    classification: str
    format_warning: Optional[str] = None

class ExtractDecryptRequest(BaseModel):
    stego_image_b64: str
    secret_key_hex: str

class ExtractDecryptResponse(BaseModel):
    success: bool
    message: str
    payload_bytes: Optional[int] = None

class SteganalysisResponse(BaseModel):
    classification: str
    stego_probability: float
    stego_probability_pct: str
    model_name: str
    is_trained: bool
    notice: str
    spatial_features: Dict[str, Any]
    frequency_features: Dict[str, Any]
    model_metrics: Dict[str, Any]

class ImageCandidateEvaluation(BaseModel):
    filename: str
    capacity_bytes: int
    is_capacity_sufficient: bool
    psnr_db: float
    ssim: float
    mse: float
    stego_probability: float
    stego_probability_pct: str
    avg_suitability: float
    rank: int
    stego_image_b64: str
    heatmap_b64: str

class RecommendationResponse(BaseModel):
    recommended_index: int
    recommended_filename: str
    recommendation_reason: str
    secret_key_hex: str
    candidates: List[ImageCandidateEvaluation]

class EvaluationMetricsResponse(BaseModel):
    encryption: Dict[str, Any]
    steganography: Dict[str, Any]
    quality_benchmarks: Dict[str, Any]
    steganalysis_model: Dict[str, Any]
