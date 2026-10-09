import React from 'react';
import { Lock, EyeOff, Cpu, ArrowRight } from 'lucide-react';

export const SecurityLevelBanner: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-950/60 my-6 shadow-xl">
      <div className="text-center max-w-2xl mx-auto mb-6">
        <h2 className="text-lg font-bold text-slate-100 flex items-center justify-center space-x-2">
          <span>Three-Level Defense Architecture</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          A layered defense separating message confidentiality, physical concealment, and statistical detectability assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {/* Level 1 Card */}
        <div className="glass-card p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50 transition">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">LEVEL 1</span>
              <h3 className="text-sm font-bold text-slate-100">Confidentiality</h3>
            </div>
          </div>
          <p className="text-xs text-slate-300 font-mono mb-2">AES-256-GCM Encryption</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Encrypts the raw secret message with an authenticated 256-bit secret key, producing authenticated ciphertext, nonce, and integrity tag.
          </p>
        </div>

        {/* Level 2 Card */}
        <div className="glass-card p-5 rounded-xl border border-cyan-500/30 bg-cyan-950/10 hover:border-cyan-500/50 transition">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">LEVEL 2</span>
              <h3 className="text-sm font-bold text-slate-100">Concealment</h3>
            </div>
          </div>
          <p className="text-xs text-slate-300 font-mono mb-2">Adaptive LSB Steganography</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Analyzes edge, texture, and entropy to embed payload bits deterministically into high-complexity image regions, minimizing visual artifacts.
          </p>
        </div>

        {/* Level 3 Card */}
        <div className="glass-card p-5 rounded-xl border border-purple-500/30 bg-purple-950/10 hover:border-purple-500/50 transition">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">LEVEL 3</span>
              <h3 className="text-sm font-bold text-slate-100">Detectability Assessment</h3>
            </div>
          </div>
          <p className="text-xs text-slate-300 font-mono mb-2">AI Steganalysis Model</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Evaluates the stego image using a PyTorch CNN to estimate model-based stego probability. Does not claim universal undetectability.
          </p>
        </div>
      </div>
    </div>
  );
};
