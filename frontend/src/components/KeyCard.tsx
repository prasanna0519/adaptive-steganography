import React, { useState } from 'react';
import { Key, Copy, Download, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface KeyCardProps {
  secretKeyHex: string;
}

export const KeyCard: React.FC<KeyCardProps> = ({ secretKeyHex }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(secretKeyHex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([secretKeyHex], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "stego_secret_key.key";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950 to-cyan-950/20 shadow-glow-cyan">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
            <Key className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <span>AES-256 Secret Key</span>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-mono">
                256-BIT SECURE
              </span>
            </h3>
            <p className="text-xs text-slate-400">Cryptographically generated random key required for message extraction</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'Copied!' : 'Copy Key'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Key</span>
          </button>
        </div>
      </div>

      {/* Secret Key Hex Display Box */}
      <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all tracking-wider mb-3">
        {secretKeyHex}
      </div>

      {/* Security Directives */}
      <div className="flex items-start space-x-2 text-xs text-amber-400/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
        <div className="space-y-0.5">
          <p className="font-semibold text-amber-300">Critical Security Directive:</p>
          <ul className="list-disc list-inside text-[11px] text-amber-400/80 space-y-0.5">
            <li>Keep this key secure. The receiver MUST enter this exact key to extract & decrypt.</li>
            <li>The AES secret key is <strong>NEVER stored inside the image</strong> or exposed on the server.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
