import React, { useState } from 'react';
import { Copy, Check, Delete } from 'lucide-react';
import { AngleMode } from '../utils/mathEngine';
import { sound } from '../utils/soundEngine';

interface DisplayHUDProps {
  expression: string;
  previewResult: string | null;
  mainResult: string;
  angleMode: AngleMode;
  onToggleAngleMode: () => void;
  hasMemory: boolean;
  onClear: () => void;
  onDeleteChar: () => void;
  error: string | null;
}

export const DisplayHUD: React.FC<DisplayHUDProps> = ({
  expression,
  previewResult,
  mainResult,
  angleMode,
  onToggleAngleMode,
  hasMemory,
  onClear,
  onDeleteChar,
  error,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    sound.playClick(1400);
    const textToCopy = mainResult || previewResult || expression;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative bg-[#0c101a] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-lg">
      {/* Background subtle grid & scanline ambiance */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* Top HUD Telemetry Ribbon */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-2 text-xs font-mono-hud text-slate-400">
        <div className="flex items-center gap-3">
          {/* Angle mode toggle */}
          <button
            onClick={() => {
              sound.playClick(800);
              onToggleAngleMode();
            }}
            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors uppercase font-semibold text-[11px]"
            title="Changer le mode angulaire (Degrés / Radians / Gradians)"
          >
            {angleMode}
          </button>

          {/* Memory Active Indicator */}
          {hasMemory ? (
            <span className="text-amber-400 flex items-center gap-1 font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              MEM
            </span>
          ) : (
            <span className="text-slate-600 text-[11px]">MEM: OFF</span>
          )}

          <span className="hidden sm:inline text-slate-500">·</span>
          <span className="hidden sm:inline text-slate-500 text-[11px]">64-BIT PRECISION</span>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            title="Copier le résultat"
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-slate-700 transition-colors text-[11px]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copié</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copier</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              sound.playClear();
              onDeleteChar();
            }}
            title="Effacer le dernier caractère (Retour arrière)"
            className="p-1 rounded bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-amber-300 transition-colors"
          >
            <Delete className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              sound.playClear();
              onClear();
            }}
            title="Tout effacer (AC)"
            className="px-2 py-0.5 rounded bg-rose-950/30 border border-rose-900/50 text-rose-300 hover:bg-rose-900/40 transition-colors font-semibold text-[11px]"
          >
            AC
          </button>
        </div>
      </div>

      {/* Formula & Live Expression */}
      <div className="relative z-10 min-h-[48px] flex items-center justify-end overflow-x-auto text-right mb-1 px-1">
        <div className="font-mono-hud text-lg sm:text-xl text-slate-300 tracking-wide whitespace-nowrap">
          {expression || <span className="text-slate-600">0</span>}
          <span className="inline-block w-1.5 h-5 ml-1 bg-cyan-400 animate-pulse align-middle" />
        </div>
      </div>

      {/* Error or Live Preview Display */}
      <div className="relative z-10 flex items-baseline justify-between pt-1">
        <div className="text-xs font-mono-hud">
          {error ? (
            <span className="text-rose-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {error}
            </span>
          ) : previewResult !== null && previewResult !== mainResult && expression ? (
            <span className="text-slate-500">
              ≈ <span className="text-slate-400">{previewResult}</span>
            </span>
          ) : null}
        </div>

        {/* Main Evaluated Result */}
        <div className="text-right">
          <div className="font-mono-hud text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-cyan-300 tabular-nums select-all">
            {mainResult || (previewResult ?? '0')}
          </div>
        </div>
      </div>
    </div>
  );
};
