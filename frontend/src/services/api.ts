import axios from 'axios';
import {
  ImageAnalysisResponse,
  EncryptEmbedResponse,
  ExtractDecryptResponse,
  SteganalysisResponse,
  RecommendationResponse,
  EvaluationMetricsResponse,
  KeyGenerateResponse
} from '../types';

const API_BASE = '/api';

export const generateKey = async (): Promise<KeyGenerateResponse> => {
  const res = await axios.get(`${API_BASE}/generate-key`);
  return res.data;
};

export const analyzeImage = async (file: File): Promise<ImageAnalysisResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${API_BASE}/analyze-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const encryptAndEmbed = async (
  file: File,
  message: string,
  secretKey?: string
): Promise<EncryptEmbedResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('message', message);
  if (secretKey) {
    formData.append('secret_key', secretKey);
  }
  const res = await axios.post(`${API_BASE}/encrypt-embed`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const extractAndDecrypt = async (
  secretKey: string,
  file?: File,
  stegoImageB64?: string
): Promise<ExtractDecryptResponse> => {
  const formData = new FormData();
  formData.append('secret_key', secretKey);
  if (file) {
    formData.append('file', file);
  } else if (stegoImageB64) {
    formData.append('stego_image_b64', stegoImageB64);
  }
  const res = await axios.post(`${API_BASE}/extract-decrypt`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const runSteganalysis = async (file: File): Promise<SteganalysisResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${API_BASE}/steganalysis`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const recommendImage = async (
  files: File[],
  message: string
): Promise<RecommendationResponse> => {
  const formData = new FormData();
  formData.append('message', message);
  files.forEach((file) => {
    formData.append('files', file);
  });
  const res = await axios.post(`${API_BASE}/recommend-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getEvaluationMetrics = async (): Promise<EvaluationMetricsResponse> => {
  const res = await axios.get(`${API_BASE}/evaluate`);
  return res.data;
};

export const triggerModelTraining = async (): Promise<any> => {
  const res = await axios.post(`${API_BASE}/train-model`);
  return res.data;
};
