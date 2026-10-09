import React from 'react';
import { Cpu, ShieldCheck, ShieldAlert, Info } from 'lucide-react';

interface StegoProbabilityGaugeProps {
  probability: number; // 0.0 to 1.0
  probabilityPct: string;
  classification: string;
  modelName?: string;
  isTrained?: boolean;
}

export const StegoProbabilityGauge: React.FC<StegoProbabilityGaugeProps> = ({
  probability,
  probabilityPct,
  classification,
  modelName = 'SteganalysisCNN_SRM_v1',
  isTrained = true
}) => {
  const isStego = probability >= 0.50;

  const getGaugeColor = () => {
    if (probability < 0.35) return 'from-emerald-500 to-teal-400';
    if (probability < 0.65) return 'from-amber-500 to-yellow-400';
    return 'from-rose-500 to-red-600';
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-slate-800 bg-slate-950/80">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">AI Steganalysis Module</h3>
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
          isTrained 
            ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' 
            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
        }`}>
          {isTrained ? modelName : 'DEMO / UNTRAINED MODE'}
        </span>
      </div>

      {/* Probability Gauge Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium">Estimated Steganalysis Detection Probability</span>
          <span className={`font-mono font-bold text-sm ${isStego ? 'text-rose-400' : 'text-emerald-400'}`}>
            {probabilityPct}
          </span>
        </div>

        <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getGaugeColor()} transition-all duration-700`}
            style={{ width: `${Math.min(Math.max(probability * 100, 2), 100)}%` }}
          />
        </div>
      </div>

      {/* Classification Result Badge */}
      <div className={`p-3.5 rounded-lg border flex items-center justify-between ${
        isStego 
          ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
          : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
      }`}>
        <div className="flex items-center space-x-2.5">
          {isStego ? <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" /> : <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />}
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Predicted Class</div>
            <div className="text-sm font-bold tracking-tight">{classification}</div>
          </div>
        </div>

        <div className="text-right text-[11px] font-mono opacity-80">
          {isStego ? 'High Stego Signature' : 'Cover-Like Residuals'}
        </div>
      </div>

      {/* Scientific Terminology Disclaimer */}
      <div className="mt-3 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded border border-slate-800 flex items-start space-x-1.5">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          This probability represents the model's estimated likelihood that the image belongs to the stego class. It does not guarantee that other steganalysis models will yield identical predictions.
        </p>
      </div>
    </div>
  );
};
