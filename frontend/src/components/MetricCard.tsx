import React from 'react';
import { Activity, ShieldAlert, Award, FileText, Percent } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  status?: 'success' | 'warning' | 'info';
  icon?: 'psnr' | 'ssim' | 'mse' | 'payload' | 'ratio';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  status = 'info',
  icon = 'psnr'
}) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'success':
        return 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400';
      case 'warning':
        return 'border-amber-500/30 bg-amber-950/20 text-amber-400';
      default:
        return 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400';
    }
  };

  const renderIcon = () => {
    switch (icon) {
      case 'psnr':
        return <Award className="w-4 h-4 text-cyan-400" />;
      case 'ssim':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'mse':
        return <ShieldAlert className="w-4 h-4 text-purple-400" />;
      case 'payload':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'ratio':
        return <Percent className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className={`glass-card p-4 rounded-xl border ${getStatusStyle()} transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
          {renderIcon()}
        </div>
      </div>
      <div className="text-xl font-bold font-mono text-slate-100 tracking-tight">{value}</div>
      {subtext && <div className="text-[11px] text-slate-400 mt-1">{subtext}</div>}
    </div>
  );
};
