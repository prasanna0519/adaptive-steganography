import React, { useState } from 'react';
import { Layers, Eye, Sliders, Image as ImageIcon } from 'lucide-react';

interface HeatmapOverlayProps {
  originalImageB64?: string;
  stegoImageB64?: string;
  heatmapB64?: string;
  overlayB64?: string;
  differenceB64?: string;
}

export const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({
  originalImageB64,
  stegoImageB64,
  heatmapB64,
  overlayB64,
  differenceB64
}) => {
  const [activeTab, setActiveTab] = useState<'original' | 'stego' | 'heatmap' | 'overlay' | 'diff'>('stego');

  const tabs = [
    { id: 'stego', label: 'Stego Image', b64: stegoImageB64 || originalImageB64 },
    { id: 'original', label: 'Cover Image', b64: originalImageB64 },
    { id: 'overlay', label: 'Suitability Overlay', b64: overlayB64 },
    { id: 'heatmap', label: 'Heatmap Only', b64: heatmapB64 },
    { id: 'diff', label: '10x Difference Map', b64: differenceB64 },
  ].filter(t => Boolean(t.b64));

  const currentB64 = tabs.find(t => t.id === activeTab)?.b64 || originalImageB64;

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-950/80">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Image Inspection Viewer</h3>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Image Display Box */}
      <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-800 aspect-video flex items-center justify-center p-2 group">
        {currentB64 ? (
          <img
            src={currentB64}
            alt={activeTab}
            className="max-h-full max-w-full object-contain rounded transition-all duration-300"
          />
        ) : (
          <div className="text-center p-8 text-slate-500 text-xs">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <span>Upload an image to inspect suitability map & LSB differences</span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono text-cyan-400 border border-cyan-500/30">
          Mode: {activeTab.toUpperCase()}
        </div>
      </div>
    </div>
  );
};
