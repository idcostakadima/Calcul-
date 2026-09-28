import React from 'react';
import { Volume2, VolumeX, History, Cpu } from 'lucide-react';
import { sound } from '../utils/soundEngine';

export type AppMode = 'scientific' | 'grapher' | 'neural' | 'quantum' | 'programmer';

interface HeaderNavProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  isMuted: boolean;
  onToggleSound: () => void;
  onToggleHistory: () => void;
  historyCount: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentMode,
  onSelectMode,
  isMuted,
  onToggleSound,
  onToggleHistory,
  historyCount,
}) => {
  const modes: { id: AppMode; label: string }[] = [
    { id: 'scientific', label: 'Scientifique' },
    { id: 'grapher', label: 'Graphes 2D' },
    { id: 'neural', label: 'Solveur IA' },
    { id: 'quantum', label: 'Physique & Quantique' },
    { id: 'programmer', label: 'Programmeur' },
  ];

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-[#0a0d14]/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark in display font */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Cpu className="w-5 h-5 text-cyan-400" />
        <span className="font-display text-lg font-bold tracking-wider text-slate-100 uppercase">
          NovaCalc <span className="text-cyan-400">Quantum</span>
        </span>
      </div>

      {/* Zone 2: 4-6 clean single-line navigation buttons */}
      <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800/80 rounded-lg">
        {modes.map((m) => {
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                sound.playClick(900);
                onSelectMode(m.id);
              }}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleSound}
          title={isMuted ? 'Activer le son' : 'Couper le son'}
          aria-label={isMuted ? 'Activer le son' : 'Désactiver le son'}
          className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 rounded-md border border-slate-800 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        <button
          onClick={onToggleHistory}
          title="Historique des calculs"
          aria-label="Historique des calculs"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 bg-slate-900 hover:bg-slate-800/80 rounded-md border border-slate-800 transition-colors whitespace-nowrap"
        >
          <History className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Historique</span>
          {historyCount > 0 && (
            <span className="font-mono-hud text-[11px] text-cyan-400 font-semibold ml-0.5">
              ({historyCount})
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
