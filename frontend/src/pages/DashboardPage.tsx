import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sliders, Layers, Cpu, Eye, Award, ArrowRight, ShieldCheck, Activity, Key } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const cards = [
    {
      title: 'Secure Message',
      desc: 'Encrypt secret message using AES-256-GCM and adaptively hide it inside a PNG cover image.',
      icon: Lock,
      path: '/secure-message',
      color: 'from-cyan-500/20 to-blue-600/20',
      border: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
      badge: 'Level 1 & 2'
    },
    {
      title: 'Image Analysis',
      desc: 'Analyze edge magnitude, local variance texture, and Shannon block entropy heatmap suitability.',
      icon: Sliders,
      path: '/analysis',
      color: 'from-purple-500/20 to-indigo-600/20',
      border: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      badge: 'Adaptive Map'
    },
    {
      title: '5-Image Recommendation',
      desc: 'Upload up to 5 images. Automatically identifies the best candidate with lowest measured stego detectability.',
      icon: Layers,
      path: '/recommendation',
      color: 'from-emerald-500/20 to-teal-600/20',
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      badge: 'Smart Engine'
    },
    {
      title: 'Intelligent Steganalysis',
      desc: 'Upload an image to classify as Cover or Stego and display estimated stego detection probability.',
      icon: Cpu,
      path: '/steganalysis',
      color: 'from-rose-500/20 to-pink-600/20',
      border: 'border-rose-500/30',
      iconColor: 'text-rose-400',
      badge: 'PyTorch CNN'
    },
    {
      title: 'Extract Message',
      desc: 'Upload a stego PNG image and enter secret key to reproduce embedding sequence and decrypt plaintext.',
      icon: Eye,
      path: '/extract',
      color: 'from-blue-500/20 to-indigo-600/20',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      badge: 'Receiver Mode'
    },
    {
      title: 'Security & Quality Evaluation',
      desc: 'View comprehensive benchmarks: PSNR, SSIM, MSE, payload capacity, and ML ROC-AUC confusion matrix.',
      icon: Award,
      path: '/evaluation',
      color: 'from-amber-500/20 to-yellow-600/20',
      border: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      badge: 'Metrics'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 relative overflow-hidden">
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono">
            <Activity className="w-3.5 h-3.5" />
            <span>Control Center & Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-100">
            System Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Select a project workflow module below to perform encryption, adaptive embedding, multi-image recommendation, steganalysis inference, or key-based extraction.
          </p>
        </div>
      </div>

      {/* Grid of 6 Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.path}
              to={card.path}
              className={`glass-card p-6 rounded-2xl border ${card.border} bg-gradient-to-br ${card.color} hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between group shadow-lg`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-slate-950/80 border border-slate-800 ${card.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-semibold bg-slate-900/90 text-slate-300 border border-slate-700/80 rounded-full">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-cyan-300 transition">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {card.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>Launch Tool</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
