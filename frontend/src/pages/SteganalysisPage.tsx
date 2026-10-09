import React, { useState } from 'react';
import { runSteganalysis, triggerModelTraining } from '../services/api';
import { SteganalysisResponse } from '../types';
import { StegoProbabilityGauge } from '../components/StegoProbabilityGauge';
import { Cpu, Upload, RefreshCw, AlertTriangle, Activity, Sliders, Play, CheckCircle2 } from 'lucide-react';

export const SteganalysisPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainMessage, setTrainMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SteganalysisResponse | null>(null);

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

  const handleRunSteganalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please upload an image for steganalysis.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await runSteganalysis(selectedFile);
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during steganalysis inference.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrainModel = async () => {
    setTraining(true);
    setTrainMessage(null);
    try {
      const res = await triggerModelTraining();
      setTrainMessage(res.message || 'Model trained successfully!');
      if (selectedFile) {
        const updated = await runSteganalysis(selectedFile);
        setResult(updated);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Model training failed.');
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Intelligent Steganalysis</h1>
            <p className="text-xs text-slate-400">PyTorch SRM Convolutional Neural Network Cover vs Stego Classifier</p>
          </div>
        </div>

        <button
          onClick={handleTrainModel}
          disabled={training}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-glow-purple transition disabled:opacity-50"
        >
          {training ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          <span>{training ? 'Training PyTorch CNN...' : 'Train / Retrain Model'}</span>
        </button>
      </div>

      {trainMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{trainMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleRunSteganalysis} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Upload Image to Classify</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <label className="border-2 border-dashed border-slate-700 hover:border-purple-500/60 bg-slate-950/60 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[140px]">
            <Upload className="w-6 h-6 text-slate-500 mb-2" />
            <span className="text-xs font-semibold text-slate-300">Click to select image</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>

          {filePreview ? (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 aspect-video flex items-center justify-center">
              <img src={filePreview} alt="Target Image" className="max-h-full max-w-full object-contain rounded" />
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
              <span>Extracting Spatial Residuals & Running Inference...</span>
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4" />
              <span>Run Steganalysis Classification</span>
            </>
          )}
        </button>
      </form>

      {/* Steganalysis Results */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Probability Gauge Component */}
          <StegoProbabilityGauge
            probability={result.stego_probability}
            probabilityPct={result.stego_probability_pct}
            classification={result.classification}
            modelName={result.model_name}
            isTrained={result.is_trained}
          />

          {/* Feature Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Spatial Domain Features */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-cyan-400">
                <Activity className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Spatial Residual Statistics</h4>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Laplacian Noise Variance:</span>
                  <span className="text-cyan-300 font-bold">{result.spatial_features.residual_variance}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Global Pixel Variance:</span>
                  <span className="text-cyan-300 font-bold">{result.spatial_features.global_variance}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Horizontal Correlation:</span>
                  <span className="text-cyan-300 font-bold">{result.spatial_features.horizontal_correlation}</span>
                </div>
              </div>
            </div>

            {/* Frequency Domain Features */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-purple-400">
                <Sliders className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">2D DCT Frequency Domain Analysis</h4>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">DC Energy Coefficient:</span>
                  <span className="text-purple-300 font-bold">{result.frequency_features.dc_coefficient}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">High-Frequency Energy Ratio:</span>
                  <span className="text-purple-300 font-bold">{result.frequency_features.high_frequency_ratio}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">SRM Filter Kernel:</span>
                  <span className="text-purple-300 font-bold">3x3 KV Residual Kernel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
