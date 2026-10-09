import React from 'react';
import { Info, BookOpen, Shield, Cpu, Lock, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-950/80">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Project Overview & Viva Guide</h1>
            <p className="text-xs text-slate-400">Final-Year Engineering Project Documentation</p>
          </div>
        </div>
      </div>

      {/* Abstract */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Project Abstract</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Modern digital communication requires both data confidentiality and cover communication concealment. Traditional steganography often embeds data uniformly across an image, creating statistical anomalies vulnerable to deep-learning steganalysis. This project presents an <strong>AI-driven adaptive steganography framework</strong> featuring authenticated <strong>AES-256-GCM encryption</strong>, multi-factor image suitability mapping (Sobel edge + local variance texture + Shannon entropy), key-derived PRNG deterministic embedding, and an integrated <strong>PyTorch SRM CNN steganalysis model</strong> for detectability estimation.
        </p>
      </div>

      {/* Limitations & Future Enhancements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-3">
          <h3 className="text-sm font-bold text-amber-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Documented Project Limitations</span>
          </h3>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 leading-relaxed">
            <li>Steganalysis probabilities are model-dependent; no system guarantees universal undetectability.</li>
            <li>Lossy JPEG compression alters LSB values, corrupting payload unless lossless formats (PNG) are used.</li>
            <li>Adaptive LSB trade-off: higher payload ratio increases statistical detectability.</li>
            <li>Key exchange between sender and receiver must be conducted securely out-of-band.</li>
          </ul>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-cyan-500/30 bg-cyan-950/10 space-y-3">
          <h3 className="text-sm font-bold text-cyan-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Future Scope & Enhancements</span>
          </h3>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 leading-relaxed">
            <li>Integration of Elliptic Curve Diffie-Hellman (ECDH) public-key exchange.</li>
            <li>Audio and video container steganography support.</li>
            <li>Adversarial training against state-of-the-art steganalysis networks (SRNet / Xu-Net).</li>
            <li>Post-quantum cryptographic key encapsulation algorithms (Kyber / Dilithium).</li>
          </ul>
        </div>
      </div>

      {/* Viva Q&A Defense Guide */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <Info className="w-4 h-4 text-purple-400" />
          <span>Viva Defense Cheat Sheet (Key Questions & Answers)</span>
        </h2>

        <div className="space-y-3 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <p className="font-bold text-cyan-300">Q1: Why separate Confidentiality (AES-256-GCM) and Concealment (Steganography)?</p>
            <p className="text-slate-400 leading-relaxed">
              If an adversary discovers the hidden payload inside the image, AES-256-GCM guarantees the plaintext remains completely unreadable and authenticated. Steganography hides the existence of message; cryptography protects its content.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <p className="font-bold text-cyan-300">Q2: How does the receiver locate target LSB bits without storing positions in the image?</p>
            <p className="text-slate-400 leading-relaxed">
              The embedding positions are generated deterministically using a PRNG seeded with SHA-256(Secret_Key) over an invariant zero-LSB suitability map. The receiver enters the exact same key to regenerate the identical sequence.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <p className="font-bold text-cyan-300">Q3: Why calculate suitability on the zero-LSB plane (image & 0xFE)?</p>
            <p className="text-slate-400 leading-relaxed">
              Because LSBs are modified during embedding. Clearing LSBs to zero before computing Sobel, texture variance, or entropy ensures the calculated suitability map is 100% mathematically identical between cover and stego images.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
