import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Sliders, Cpu, Eye, ArrowRight, Layers, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { SecurityLevelBanner } from '../components/SecurityLevelBanner';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 cyber-grid p-6 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Final-Year Engineering Project Prototype</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-tight leading-tight">
            AI-Driven Adaptive Steganography with <span className="gradient-text-cyan">Secure Encryption</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Secure Encryption • Adaptive Concealment • Intelligent Steganalysis
          </p>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mx-auto leading-relaxed">
            A comprehensive, end-to-end image communication and steganalysis platform combining <strong>AES-256-GCM authenticated encryption</strong>, <strong>multi-factor LSB adaptive embedding</strong>, and a <strong>PyTorch CNN steganalysis model</strong> for detectability estimation.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/secure-message"
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-glow-cyan transition-all transform hover:-translate-y-0.5"
            >
              <Lock className="w-4 h-4" />
              <span>Start Secure Messaging</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/analysis"
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Analyze Image</span>
            </Link>

            <Link
              to="/recommendation"
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Compare Images</span>
            </Link>

            <Link
              to="/steganalysis"
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Steganalysis</span>
            </Link>
          </div>
        </div>

        {/* Visual Workflow Architecture Flowchart */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 max-w-5xl mx-auto">
          <div className="text-center text-xs font-mono text-cyan-400 uppercase tracking-wider mb-6">
            End-to-End Conceptual Workflow
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
            <div className="glass-card p-3.5 rounded-xl border border-slate-800">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">1</div>
              <div className="font-bold text-slate-200">AES-256-GCM</div>
              <div className="text-[10px] text-slate-400 mt-1">Encrypt Secret Message</div>
            </div>

            <div className="glass-card p-3.5 rounded-xl border border-slate-800">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">2</div>
              <div className="font-bold text-slate-200">Image Analysis</div>
              <div className="text-[10px] text-slate-400 mt-1">Edge, Texture & Entropy</div>
            </div>

            <div className="glass-card p-3.5 rounded-xl border border-slate-800">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">3</div>
              <div className="font-bold text-slate-200">Adaptive Embed</div>
              <div className="text-[10px] text-slate-400 mt-1">PRNG Key-Derived LSB</div>
            </div>

            <div className="glass-card p-3.5 rounded-xl border border-slate-800">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">4</div>
              <div className="font-bold text-slate-200">AI Steganalysis</div>
              <div className="text-[10px] text-slate-400 mt-1">CNN Stego Detectability</div>
            </div>

            <div className="glass-card p-3.5 rounded-xl border border-slate-800">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">5</div>
              <div className="font-bold text-slate-200">Authenticated Extract</div>
              <div className="text-[10px] text-slate-400 mt-1">Key-Based Decryption</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Level Defense Visual Banner */}
      <SecurityLevelBanner />

      {/* Key Feature Highlights */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-100">Platform Core Capabilities</h2>
          <p className="text-xs text-slate-400 mt-1">
            Built strictly without hardcoded metrics or fake predictions. All metrics come from real computation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit border border-cyan-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Authenticated AES-256 Encryption</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Protects message payload confidentiality using AES-256 in GCM mode with cryptographically secure 12-byte IV generation and 16-byte authentication tag verification.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl w-fit border border-purple-500/20">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Multi-Factor Adaptive Embedding</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Computes normalized Sobel edge strength, local variance texture, and Shannon entropy maps on zero-LSB plane to select optimal high-complexity embedding regions.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit border border-emerald-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">PyTorch CNN Steganalysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provides model-based stego detection probability using a PyTorch Convolutional Neural Network initialized with Spatial Rich Model (SRM) noise residual high-pass filters.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
