export interface KeyGenerateResponse {
  secret_key_hex: string;
}

export interface ImageAnalysisResponse {
  width: number;
  height: number;
  total_pixels: number;
  channels: number;
  max_capacity_bytes: number;
  avg_suitability: number;
  edge_score: number;
  texture_score: number;
  entropy_score: number;
  heatmap_b64: string;
  overlay_b64: string;
}

export interface EncryptEmbedResponse {
  secret_key_hex: string;
  stego_image_b64: string;
  difference_b64: string;
  heatmap_b64: string;
  payload_bytes: number;
  bits_changed: number;
  embedding_ratio: number;
  psnr_db: number;
  ssim: number;
  mse: number;
  stego_probability: number;
  stego_probability_pct: string;
  classification: string;
  format_warning?: string;
}

export interface ExtractDecryptResponse {
  success: boolean;
  message: string;
  payload_bytes?: number;
}

export interface SteganalysisResponse {
  classification: string;
  stego_probability: number;
  stego_probability_pct: string;
  model_name: string;
  is_trained: boolean;
  notice: string;
  spatial_features: {
    residual_variance: number;
    global_variance: number;
    horizontal_correlation: number;
  };
  frequency_features: {
    dc_coefficient: number;
    high_frequency_ratio: number;
  };
  model_metrics: {
    is_trained: boolean;
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1_score?: number;
    roc_auc?: number;
    confusion_matrix?: number[][];
  };
}

export interface ImageCandidateEvaluation {
  index: number;
  filename: string;
  capacity_bytes: number;
  is_capacity_sufficient: boolean;
  psnr_db: number;
  ssim: number;
  mse: number;
  stego_probability: number;
  stego_probability_pct: string;
  avg_suitability: number;
  rank: number;
  stego_image_b64: string;
  heatmap_b64: string;
}

export interface RecommendationResponse {
  recommended_index: number;
  recommended_filename: string;
  recommendation_reason: string;
  secret_key_hex: string;
  candidates: ImageCandidateEvaluation[];
}

export interface EvaluationMetricsResponse {
  encryption: {
    algorithm: string;
    key_size_bits: number;
    nonce_size_bytes: number;
    tag_size_bytes: number;
    authenticated_mode: boolean;
  };
  steganography: {
    method: string;
    suitability_features: string[];
    lossless_format: string;
    header_magic: string;
  };
  quality_benchmarks: {
    target_min_psnr: string;
    target_min_ssim: string;
    typical_mse: string;
  };
  steganalysis_model: any;
}
