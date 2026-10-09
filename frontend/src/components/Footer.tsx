import React from 'react';
import { Shield, Lock, Cpu, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-slate-100 text-sm">Final Year Engineering Project</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-Driven Adaptive Steganography with Secure Encryption & Intelligent Steganalysis. Designed for university project viva demonstration.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Security & Design Principles</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Level 1: AES-256-GCM Authenticated Encryption</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Level 2: Zero-LSB Adaptive Feature Map Embedding</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>Level 3: PyTorch SRM CNN Steganalysis Model</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Scientific Wording Notice</h4>
            <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <Info className="w-3.5 h-3.5 text-amber-400 inline mr-1" />
              This platform measures estimated stego detection probabilities. No steganographic algorithm guarantees universal undetectability.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-4 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AdaptiveStego Project. All rights reserved.</p>
          <p className="font-mono text-[11px] text-cyan-500/70 mt-2 sm:mt-0">FastAPI • PyTorch • React • OpenCV</p>
        </div>
      </div>
    </footer>
  );
};
