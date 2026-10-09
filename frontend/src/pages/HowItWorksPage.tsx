import React from 'react';
import { SecurityLevelBanner } from '../components/SecurityLevelBanner';
import { Lock, Sliders, Cpu, Eye, ArrowRight, ShieldCheck, CheckCircle2, HelpCircle } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Secret Message Input',
      desc: 'The sender enters raw plaintext data. Character and byte lengths are computed for capacity validation.',
      icon: Lock,
      color: 'text-cyan-400'
    },
    {
      num: '02',
      title: 'AES-256-GCM Authenticated Encryption',
      desc: 'A 256-bit random key, 12-byte IV nonce, and 16-byte tag are generated using PyCryptodome. Plaintext is converted to authenticated ciphertext.',
      icon: Lock,
      color: 'text-emerald-400'
    },
    {
      num: '03',
      title: 'Zero-LSB Adaptive Image Analysis',
      desc: 'The cover image zero-LSB plane is processed to calculate Sobel edge magnitude, local variance texture, and Shannon entropy maps.',
      icon: Sliders,
      color: 'text-purple-400'
    },
    {
      num: '04',
      title: 'Key-Derived PRNG Location Selection',
      desc: 'Pixels are ranked by suitability level. A PRNG seeded with SHA-256(Secret_Key) shuffles target pixel locations within suitability bands.',
      icon: Sliders,
      color: 'text-indigo-400'
    },
    {
      num: '05',
      title: 'Adaptive LSB Payload Embedding',
      desc: 'Binary payload (Header + Nonce + Tag + Ciphertext) is embedded sequentially into the LSBs of selected high-complexity pixel channels.',
      icon: ShieldCheck,
      color: 'text-cyan-400'
    },
    {
      num: '06',
      title: 'PyTorch Steganalysis & Quality Evaluation',
      desc: 'Quality metrics (PSNR, SSIM, MSE) and model-based stego detection probability are computed to evaluate detectability.',
      icon: Cpu,
      color: 'text-rose-400'
    },
    {
      num: '07',
      title: 'Stego PNG Image Distribution',
      desc: 'The final Stego PNG image is saved/downloaded. The AES secret key is transferred securely to the receiver out-of-band.',
      icon: Eye,
      color: 'text-blue-400'
    },
    {
      num: '08',
      title: 'Receiver Extraction & Decryption',
      desc: 'Receiver enters the key. The exact PRNG seed is derived, target pixel LSBs are extracted, and AES-GCM verifies tag & decrypts message.',
      icon: CheckCircle2,
      color: 'text-emerald-400'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-950/80">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">How The System Works</h1>
            <p className="text-xs text-slate-400">Step-by-step mathematical & architectural walkthrough</p>
          </div>
        </div>
      </div>

      <SecurityLevelBanner />

      {/* 8-Step Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100">8-Step Technical Execution Flow</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="glass-card p-5 rounded-2xl border border-slate-800 flex items-start space-x-4">
                <div className="px-2.5 py-1 rounded-lg bg-slate-950 font-mono text-sm font-bold text-cyan-400 border border-slate-800 shrink-0">
                  {step.num}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                    <Icon className={`w-4 h-4 ${step.color}`} />
                    <span>{step.title}</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
