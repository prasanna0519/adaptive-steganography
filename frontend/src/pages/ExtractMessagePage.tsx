import React, { useState } from 'react';
import { extractAndDecrypt } from '../services/api';
import { ExtractDecryptResponse } from '../types';
import { Eye, Key, Upload, ShieldCheck, ShieldAlert, Check, Copy, RefreshCw, AlertTriangle } from 'lucide-react';

export const ExtractMessagePage: React.FC = () => {
  const [secretKey, setSecretKey] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractDecryptResponse | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleExtractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) {
      setError('Please enter the AES-256 secret key.');
      return;
    }
    if (!selectedFile) {
      setError('Please upload a stego PNG image.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await extractAndDecrypt(secretKey.trim(), selectedFile);
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to authenticate/decrypt payload. The key may be incorrect or the image may have been modified.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = () => {
    if (result?.message) {
      navigator.clipboard.writeText(result.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-950/80">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Extract Secret Message</h1>
            <p className="text-xs text-slate-400">Receiver module: PRNG sequence reconstruction & AES-256-GCM authentication</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleExtractSubmit} className="space-y-6">
        {/* Input 1 — Upload Stego Image */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Step 1 — Upload Stego Image (PNG)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-950/60 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[140px]">
              <Upload className="w-6 h-6 text-slate-500 mb-2" />
              <span className="text-xs font-semibold text-slate-300">Click to select Stego PNG</span>
              <input type="file" accept="image/png" onChange={handleFileChange} className="hidden" />
            </label>

            {filePreview ? (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 aspect-video flex items-center justify-center">
                <img src={filePreview} alt="Stego Preview" className="max-h-full max-w-full object-contain rounded" />
              </div>
            ) : (
              <div className="text-center text-xs text-slate-500 p-6 bg-slate-950/40 rounded-xl border border-slate-900">
                No stego image uploaded
              </div>
            )}
          </div>
        </div>

        {/* Input 2 — Enter Secret Key */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Step 2 — Enter Secret Key</span>
          </h3>

          <input
            type="text"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Paste 64-character hex secret key here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 transition"
            required
          />
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-200">Authentication Failed</div>
              <div className="mt-0.5 text-rose-300/90">{error}</div>
            </div>
          </div>
        )}

        {/* Extract Button */}
        <button
          type="submit"
          disabled={loading || !selectedFile || !secretKey.trim()}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-glow-purple transition disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verifying AES-GCM Tag & Decrypting...</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Extract & Decrypt Payload</span>
            </>
          )}
        </button>
      </form>

      {/* Recovered Secret Message Result */}
      {result && result.success && (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/10 space-y-4 animate-fadeIn shadow-glow-emerald">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
            <div className="flex items-center space-x-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold">AES-GCM Authentication Verified!</h3>
            </div>
            <button
              onClick={handleCopyMessage}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Message'}</span>
            </button>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Decrypted Secret Message</span>
            <div className="mt-1 bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm font-sans text-slate-100 whitespace-pre-wrap leading-relaxed">
              {result.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
