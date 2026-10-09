import React, { useState } from 'react';
import { analyzeImage } from '../services/api';
import { ImageAnalysisResponse } from '../types';
import { Sliders, Upload, RefreshCw, AlertTriangle, Layers, Activity, Eye, Shield } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';

export const ImageAnalysisPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ImageAnalysisResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError(null);

      const reader = new FileReader();
      reader.onload = (evt) => {
        setFilePreview(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image file to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await analyzeImage(selectedFile);
      setAnalysis(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during image analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-950/80">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Adaptive Image Analysis</h1>
            <p className="text-xs text-slate-400">Multi-factor regional suitability computation (Sobel Edge + Texture Variance + Shannon Entropy)</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleRunAnalysis} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Select Image to Compute Suitability Map</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <label className="border-2 border-dashed border-slate-700 hover:border-purple-500/60 bg-slate-950/60 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[140px]">
            <Upload className="w-6 h-6 text-slate-500 mb-2" />
            <span className="text-xs font-semibold text-slate-300">Click to upload cover image</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>

          {filePreview ? (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 aspect-video flex items-center justify-center">
              <img src={filePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded" />
            </div>
          ) : (
            <div className="text-center text-xs text-slate-500 p-6 bg-slate-950/40 rounded-xl border border-slate-900">
              No image uploaded
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !selectedFile}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-sm shadow-glow-purple transition disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Calculating Edge, Texture & Entropy Maps...</span>
            </>
          ) : (
            <>
              <Sliders className="w-4 h-4" />
              <span>Compute Embedding Suitability Map</span>
            </>
          )}
        </button>
      </form>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6 animate-fadeIn">
          {/* Metrics Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard label="Average Suitability" value={analysis.avg_suitability.toFixed(4)} subtext="Overall complexity score" icon="ssim" status="success" />
            <MetricCard label="Sobel Edge Score" value={analysis.edge_score.toFixed(4)} subtext="High gradient regions" icon="psnr" status="info" />
            <MetricCard label="Texture Variance" value={analysis.texture_score.toFixed(4)} subtext="Local pixel variance" icon="mse" status="info" />
            <MetricCard label="Local Shannon Entropy" value={analysis.entropy_score.toFixed(4)} subtext="8x8 block entropy" icon="ratio" status="info" />
          </div>

          {/* Visual Heatmaps Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Colorized Suitability Heatmap (JET Colormap)</span>
              </div>
              <div className="bg-slate-950 rounded-xl overflow-hidden aspect-video flex items-center justify-center p-2 border border-slate-800">
                <img src={analysis.heatmap_b64} alt="Heatmap" className="max-h-full max-w-full object-contain rounded" />
              </div>
              <p className="text-[10px] text-slate-400">
                Red/Warm regions indicate high edge/texture complexity suitable for LSB embedding.
              </p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Original Image + Heatmap Overlay (50% Blend)</span>
              </div>
              <div className="bg-slate-950 rounded-xl overflow-hidden aspect-video flex items-center justify-center p-2 border border-slate-800">
                <img src={analysis.overlay_b64} alt="Overlay" className="max-h-full max-w-full object-contain rounded" />
              </div>
              <p className="text-[10px] text-slate-400">
                Blended preview showing exact visual mapping over original cover image features.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
