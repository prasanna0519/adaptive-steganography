import React, { useState } from 'react';
import { encryptAndEmbed } from '../services/api';
import { EncryptEmbedResponse } from '../types';
import { KeyCard } from '../components/KeyCard';
import { HeatmapOverlay } from '../components/HeatmapOverlay';
import { MetricCard } from '../components/MetricCard';
import { StegoProbabilityGauge } from '../components/StegoProbabilityGauge';
import {
  Lock, Upload, Sliders, Cpu, Download, RefreshCw, AlertTriangle, CheckCircle2, FileText, Image as ImageIcon, ArrowRight
} from 'lucide-react';

export const SecureMessagePage: React.FC = () => {
  const [message, setMessage] = useState('Meet me at 5 PM.');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; sizeKB: number; format: string } | null>(null);
  const [customKey, setCustomKey] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EncryptEmbedResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError(null);

      // Preview
      const reader = new FileReader();
      reader.onload = (evt) => {
        setFilePreview(evt.target?.result as string);
        
        // Load image metadata
        const img = new Image();
        img.onload = () => {
          setImageMeta({
            width: img.width,
            height: img.height,
            sizeKB: Math.round(file.size / 1024),
            format: file.name.split('.').pop()?.toUpperCase() || 'PNG'
          });
        };
        img.src = evt.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmbedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please enter a secret message.');
      return;
    }
    if (!selectedFile) {
      setError('Please upload a cover image (PNG recommended).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await encryptAndEmbed(selectedFile, message.trim(), customKey.trim() || undefined);
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during embedding.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartNew = () => {
    setResult(null);
    setSelectedFile(null);
    setFilePreview(null);
    setImageMeta(null);
    setMessage('Meet me at 5 PM.');
    setCustomKey('');
    setError(null);
  };

  const downloadStegoImage = () => {
    if (!result?.stego_image_b64) return;
    const a = document.createElement('a');
    a.href = result.stego_image_b64;
    a.download = 'stego_image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const charCount = message.length;
  const byteCount = new TextEncoder().encode(message).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-950/80">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Secure Message Workflow</h1>
            <p className="text-xs text-slate-400">Step-by-step AES-256-GCM encryption & adaptive steganography embedding</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {!result ? (
        <form onSubmit={handleEmbedSubmit} className="space-y-8">
          {/* Step 1 — Enter Secret Message */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center border border-cyan-500/40">1</span>
                <h3 className="text-sm font-bold text-slate-200">Enter Secret Message</h3>
              </div>
              <div className="text-[11px] text-slate-400 font-mono space-x-3">
                <span>Chars: <strong className="text-cyan-400">{charCount}</strong></span>
                <span>Bytes: <strong className="text-cyan-400">{byteCount} B</strong></span>
              </div>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your confidential plaintext message here..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 transition"
              required
            />
          </div>

          {/* Step 2 — Upload Cover Image */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center border border-cyan-500/40">2</span>
                <h3 className="text-sm font-bold text-slate-200">Upload Cover Image</h3>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">PNG Preferred</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-950/60 rounded-2xl p-6 text-center cursor-pointer transition group flex flex-col items-center justify-center min-h-[160px]">
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 mb-2 transition-colors" />
                <span className="text-xs font-semibold text-slate-300">Click to upload cover image</span>
                <span className="text-[10px] text-slate-500 mt-1">Accepts PNG, BMP (Lossless recommended)</span>
                <input
                  type="file"
                  accept="image/png, image/bmp, image/jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* Image Preview & Meta */}
              {filePreview && imageMeta ? (
                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={filePreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                    <div>Dimensions: <span className="text-slate-200">{imageMeta.width}x{imageMeta.height}</span></div>
                    <div>Format: <span className="text-slate-200">{imageMeta.format}</span></div>
                    <div>File Size: <span className="text-slate-200">{imageMeta.sizeKB} KB</span></div>
                    <div>Channels: <span className="text-slate-200">3 (RGB)</span></div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-xs text-slate-500 p-6 bg-slate-950/40 rounded-xl border border-slate-900">
                  No image selected yet
                </div>
              )}
            </div>
          </div>

          {/* Step 3 — Optional Custom Key */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center border border-cyan-500/40">3</span>
              <h3 className="text-sm font-bold text-slate-200">AES Secret Key Generation</h3>
            </div>
            <p className="text-xs text-slate-400 pl-8">
              Leave blank to automatically generate a cryptographically secure 256-bit random key.
            </p>
            <div className="pl-8 pt-1">
              <input
                type="text"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="Optional 64-character hex key (or auto-generate)"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Encrypting & Adaptively Embedding...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Execute Encrypt & Embed Workflow</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Step 6 — Output Results */
        <div className="space-y-8 animate-fadeIn">
          {/* Format Warning Notice if applicable */}
          {result.format_warning && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{result.format_warning}</span>
            </div>
          )}

          {/* Key Presentation Card */}
          <KeyCard secretKeyHex={result.secret_key_hex} />

          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <MetricCard label="PSNR Fidelity" value={`${result.psnr_db} dB`} subtext="Higher is better (>40 dB)" icon="psnr" status="success" />
            <MetricCard label="SSIM Index" value={result.ssim} subtext="Structure similarity (1.0 = identical)" icon="ssim" status="success" />
            <MetricCard label="MSE Error" value={result.mse} subtext="Mean squared pixel error" icon="mse" status="info" />
            <MetricCard label="Payload Size" value={`${result.payload_bytes} B`} subtext="Ciphertext + Header overhead" icon="payload" status="info" />
            <MetricCard label="Embedding Ratio" value={`${(result.embedding_ratio * 100).toFixed(4)}%`} subtext="Channel LSB utilization" icon="ratio" status="info" />
          </div>

          {/* Steganalysis AI Model Gauge */}
          <StegoProbabilityGauge
            probability={result.stego_probability}
            probabilityPct={result.stego_probability_pct}
            classification={result.classification}
          />

          {/* Image Heatmap & Difference Inspector */}
          <HeatmapOverlay
            originalImageB64={filePreview || undefined}
            stegoImageB64={result.stego_image_b64}
            heatmapB64={result.heatmap_b64}
            differenceB64={result.difference_b64}
          />

          {/* Actions Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl glass-panel border border-slate-800">
            <button
              onClick={handleStartNew}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Start New Embedding</span>
            </button>

            <button
              onClick={downloadStegoImage}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white shadow-glow-cyan transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Stego PNG Image</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
