import React from 'react';
import { X, Trash2, ArrowUpRight, Copy, Check, Download } from 'lucide-react';
import { sound } from '../utils/soundEngine';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
  mode?: string;
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  memoryRegisters: { [key: string]: number };
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelect,
  onClear,
  memoryRegisters,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    sound.playClick(1400);
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExport = () => {
    sound.playClick(1200);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `novacalc_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0a0e17] border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-bold tracking-wider text-slate-100 uppercase">
              Historique des Calculs
            </span>
            <span className="text-xs font-mono-hud text-slate-400">({items.length})</span>
          </div>

          <button
            onClick={() => {
              sound.playClick(600);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Memory Registers Glance */}
        <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800/80">
          <div className="text-[11px] font-mono-hud text-slate-400 uppercase tracking-wider mb-1.5">
            Registres Mémoire Quantiques :
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono-hud">
            {Object.entries(memoryRegisters).map(([reg, val]) => (
              <div key={reg} className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-cyan-400 font-semibold">{reg}:</span>
                <span className="text-slate-200 font-medium tabular-nums">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calculations History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono-hud gap-2">
              <span>Aucun calcul dans cette session.</span>
              <span className="text-slate-600">Vos calculs apparaîtront automatiquement ici.</span>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 transition-colors group flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-[11px] font-mono-hud text-slate-500">
                  <span>{new Date(item.timestamp).toLocaleTimeString('fr-FR')}</span>
                  {item.mode && <span className="uppercase text-slate-600">{item.mode}</span>}
                </div>

                {/* Expression */}
                <div className="font-mono-hud text-sm text-slate-300 break-all">
                  {item.expression}
                </div>

                {/* Result */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                  <div className="font-mono-hud text-base font-bold text-cyan-300 tabular-nums">
                    = {item.result}
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(item.id, item.result)}
                      className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-colors"
                      title="Copier le résultat"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick(1100);
                        onSelect(item);
                        onClose();
                      }}
                      className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-colors"
                      title="Rappeler dans la calculatrice"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3 bg-[#0a0e17]">
            <button
              onClick={() => {
                sound.playClear();
                onClear();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/40 text-rose-300 text-xs font-mono-hud transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Effacer tout
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-mono-hud transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Exporter (.json)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
