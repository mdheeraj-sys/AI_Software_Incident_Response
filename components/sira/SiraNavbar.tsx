import React from 'react';
import { 
  Shield, 
  Terminal, 
  Activity, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Layers, 
  Radio, 
  Globe,
  Bot,
  Play,
  Bug,
  Image as ImageIcon
} from 'lucide-react';

export type SiraViewType = 'chat' | 'pentest' | 'issues' | 'assets' | 'soc';

interface SiraNavbarProps {
  currentView: SiraViewType;
  onViewChange: (view: SiraViewType) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  activeIncidentsCount?: number;
  activeLogo?: string;
  onSelectLogo?: (logo: string) => void;
}

export const SiraNavbar: React.FC<SiraNavbarProps> = ({
  currentView,
  onViewChange,
  isMuted = false,
  onToggleMute,
  activeIncidentsCount = 1,
  activeLogo = '/sira-logo-1.jpg',
  onSelectLogo
}) => {
  const logos = [
    { id: '/sira-logo-1.jpg', name: 'Sentinel' },
    { id: '/sira-logo-2.jpg', name: 'Crest' },
    { id: '/sira-logo-3.jpg', name: 'Neural' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl px-3 lg:px-6 py-2.5 flex items-center justify-between text-zinc-100 select-none">
      {/* Brand & SIRA Logo */}
      <div className="flex items-center gap-3">
        <div 
          onClick={() => onViewChange('chat')}
          className="relative group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl overflow-hidden border border-cyan-400/40 shadow-lg shadow-cyan-500/20 bg-zinc-900 shrink-0">
            <img 
              src={activeLogo} 
              alt="SIRA Sentinel Logo" 
              className="w-full h-full object-cover" 
            />
          </div>
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-wider uppercase text-white font-syncopate">
              SIRA
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              PROTECTOR
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 hidden sm:block">
            Autonomous Incident Response & Pentesting
          </p>
        </div>
      </div>

      {/* Mode Switcher Across Core Functional Architecture */}
      <div className="flex items-center p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 overflow-x-auto max-w-[55vw] sm:max-w-none">
        <button
          onClick={() => onViewChange('chat')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
            currentView === 'chat'
              ? 'bg-zinc-800 text-cyan-300 shadow-sm border border-zinc-700/80 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>SIRA Assistant</span>
        </button>


        <button
          onClick={() => onViewChange('assets')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
            currentView === 'assets'
              ? 'bg-zinc-800 text-emerald-300 shadow-sm border border-zinc-700/80 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>Assets & Domains</span>
        </button>

        <button
          onClick={() => onViewChange('soc')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
            currentView === 'soc'
              ? 'bg-zinc-800 text-cyan-300 shadow-sm border border-zinc-700/80 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>SOC Visualizer</span>
        </button>
      </div>

      {/* Target indicator & sound toggle */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => onViewChange('assets')}
          className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 text-xs font-mono hover:border-emerald-400 transition-colors"
          title="Inspect vishnukanchipati.me Target"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Target: vishnukanchipati.me</span>
        </button>

        {onToggleMute && (
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
      </div>
    </header>
  );
};
