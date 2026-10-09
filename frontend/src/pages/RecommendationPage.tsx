import React, { useState } from 'react';
import { recommendImage } from '../services/api';
import { RecommendationResponse, ImageCandidateEvaluation } from '../types';
import { Layers, Upload, Award, CheckCircle2, AlertTriangle, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RecommendationPage: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Confidential operation schedule 2026-09-28.');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecommendationResponse | null>(null);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files).slice(0, 5);
      setSelectedFiles(filesArr);
      setError(null);

      const previewUrls: string[] = [];
      filesArr.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          previewUrls.push(evt.target?.result as string);
          if (previewUrls.length === filesArr.length) {
            setPreviews([...previewUrls]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please enter a secret message.');
      return;
    }
    if (selectedFiles.length === 0) {
      setError('Please upload at least 1 image (up to 5 permitted).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await recommendImage(selectedFiles, message.trim());
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during multi-image recommendation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-950/80">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Smart 5-Image Recommendation</h1>
            <p className="text-xs text-slate-400">Batch comparative analysis: Selects candidate with lowest measured detectability & highest fidelity</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200">1. Enter Secret Message</h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition"
            required
          />
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-200">2. Upload Candidate Cover Images (1 to 5)</h3>
            <span className="text-xs font-mono text-emerald-400">{selectedFiles.length} / 5 Selected</span>
          </div>

          <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-950/60 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[120px]">
            <Upload className="w-6 h-6 text-slate-500 mb-2" />
            <span className="text-xs font-semibold text-slate-300">Click to select 1 to 5 candidate images</span>
            <input type="file" accept="image/png, image/bmp, image/jpeg" multiple onChange={handleFilesChange} className="hidden" />
          </label>

          {/* Uploaded File Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {previews.map((src, idx) => (
                <div key={idx} className="relative bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                  <img src={src} alt={`Candidate ${idx+1}`} className="h-20 w-full object-cover rounded mb-1" />
                  <span className="text-[10px] text-slate-400 truncate block">{selectedFiles[idx]?.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || selectedFiles.length === 0}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-bold text-sm shadow-glow-emerald transition disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing & Evaluating Candidates...</span>
            </>
          ) : (
            <>
              <Award className="w-4 h-4" />
              <span>Run Multi-Image Smart Recommendation Engine</span>
            </>
          )}
        </button>
      </form>

      {/* Results & Recommendation Table */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Recommendation Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-slate-950 via-emerald-950/20 to-slate-950 shadow-glow-emerald">
            <div className="flex items-start space-x-3">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">SMART DECISION ENGINE RESULT</span>
                <h3 className="text-lg font-bold text-slate-100">
                  Recommended Candidate: <span className="text-emerald-300 font-mono">{result.recommended_filename}</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800 mt-2">
                  {result.recommendation_reason}
                </p>
              </div>
            </div>
          </div>

          {/* Comparative Table */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
            <div className="p-4 border-b border-slate-800 font-bold text-xs text-slate-200 uppercase tracking-wider">
              Candidate Evaluation Matrix
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Candidate Image</th>
                    <th className="py-3 px-4">Max Capacity</th>
                    <th className="py-3 px-4">PSNR</th>
                    <th className="py-3 px-4">SSIM</th>
                    <th className="py-3 px-4">MSE</th>
                    <th className="py-3 px-4">Stego Detectability</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {result.candidates.map((cand) => {
                    const isRec = cand.filename === result.recommended_filename;
                    return (
                      <tr key={cand.index} className={`hover:bg-slate-900/50 transition ${isRec ? 'bg-emerald-950/20 font-semibold' : ''}`}>
                        <td className="py-3 px-4 font-mono">
                          {isRec ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">#1 BEST</span>
                          ) : (
                            `#${cand.rank}`
                          )}
                        </td>
                        <td className="py-3 px-4 flex items-center space-x-2">
                          <img src={cand.heatmap_b64} alt="Heatmap" className="w-8 h-8 object-cover rounded border border-slate-800" />
                          <span className="truncate max-w-[120px]">{cand.filename}</span>
                        </td>
                        <td className="py-3 px-4 font-mono">{(cand.capacity_bytes / 1024).toFixed(1)} KB</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">{cand.psnr_db} dB</td>
                        <td className="py-3 px-4 font-mono text-emerald-400">{cand.ssim}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{cand.mse}</td>
                        <td className="py-3 px-4 font-mono">
                          <span className={cand.stego_probability < 0.4 ? 'text-emerald-400' : 'text-amber-400'}>
                            {cand.stego_probability_pct}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isRec ? (
                            <button
                              onClick={() => navigate('/secure-message')}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold shadow-sm transition"
                            >
                              Use This Image
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500">Evaluated</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
