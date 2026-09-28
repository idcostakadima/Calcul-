import React, { useState } from 'react';
import { Binary, ArrowRight, RotateCcw } from 'lucide-react';
import { convertBase } from '../utils/mathEngine';
import { sound } from '../utils/soundEngine';

interface ProgrammerToolsProps {
  initialValue?: number;
  onInjectResult: (val: string) => void;
}

export const ProgrammerTools: React.FC<ProgrammerToolsProps> = ({
  initialValue = 42,
  onInjectResult,
}) => {
  const [val, setVal] = useState<bigint>(BigInt(Math.trunc(initialValue)));
  const [bitSize, setBitSize] = useState<8 | 16 | 32 | 64>(32);
  const [opInput, setOpInput] = useState<string>('');

  const mask = bitSize === 64 ? 0xFFFFFFFFFFFFFFFFn : (1n << BigInt(bitSize)) - 1n;
  const currentMasked = val & mask;

  // Toggle a single bit in the binary grid
  const toggleBit = (index: number) => {
    sound.playClick(1300);
    const bitMask = 1n << BigInt(index);
    const newVal = currentMasked ^ bitMask;
    setVal(newVal);
  };

  const applyBitwise = (op: 'AND' | 'OR' | 'XOR' | 'SHL' | 'SHR' | 'NOT') => {
    sound.playOperator();
    const operand = BigInt(parseInt(opInput || '1', 10) || 1);
    let result = currentMasked;

    switch (op) {
      case 'AND':
        result = currentMasked & operand;
        break;
      case 'OR':
        result = currentMasked | operand;
        break;
      case 'XOR':
        result = currentMasked ^ operand;
        break;
      case 'NOT':
        result = ~currentMasked & mask;
        break;
      case 'SHL':
        result = (currentMasked << operand) & mask;
        break;
      case 'SHR':
        result = (currentMasked >> operand) & mask;
        break;
    }
    setVal(result);
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 sm:p-6 flex flex-col gap-5 shadow-xl">
      {/* Header and Word Size */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Binary className="w-5 h-5 text-cyan-400" />
          <h2 className="font-display text-base font-bold tracking-wide text-slate-100 uppercase">
            Console Binaire & Arithmétique Informatique
          </h2>
        </div>

        {/* Word Size Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono-hud">
          {([8, 16, 32, 64] as const).map((bits) => (
            <button
              key={bits}
              onClick={() => {
                sound.playClick();
                setBitSize(bits);
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                bitSize === bits
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {bits}-bit
            </button>
          ))}
        </div>
      </div>

      {/* Synchronous Base Radix Display Rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* HEX */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
          <span className="font-mono-hud text-xs text-amber-400 font-bold uppercase w-12">HEX</span>
          <span className="font-mono-hud text-sm sm:text-base text-slate-100 select-all tracking-wider font-semibold">
            {convertBase(Number(currentMasked), 'HEX', bitSize)}
          </span>
        </div>

        {/* DEC */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
          <span className="font-mono-hud text-xs text-cyan-400 font-bold uppercase w-12">DEC</span>
          <span className="font-mono-hud text-sm sm:text-base text-slate-100 select-all font-semibold">
            {currentMasked.toString(10)}
          </span>
        </div>

        {/* OCT */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
          <span className="font-mono-hud text-xs text-emerald-400 font-bold uppercase w-12">OCT</span>
          <span className="font-mono-hud text-sm sm:text-base text-slate-100 select-all font-semibold">
            {convertBase(Number(currentMasked), 'OCT', bitSize)}
          </span>
        </div>

        {/* BIN */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between overflow-x-auto">
          <span className="font-mono-hud text-xs text-blue-400 font-bold uppercase w-12 shrink-0">BIN</span>
          <span className="font-mono-hud text-xs sm:text-sm text-slate-100 select-all tracking-widest font-semibold whitespace-nowrap">
            {convertBase(Number(currentMasked), 'BIN', bitSize)}
          </span>
        </div>
      </div>

      {/* Interactive Bit Toggle Matrix (click bits to flip 0/1) */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
        <div className="flex items-center justify-between text-xs font-mono-hud text-slate-400 mb-2">
          <span>Matrice interactive des bits (Cliquez pour commuter 0 ↔ 1) :</span>
          <button
            onClick={() => {
              sound.playClear();
              setVal(0n);
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Réinitialiser (0)
          </button>
        </div>

        {/* Render interactive bit blocks grouped by 4 */}
        <div className="flex flex-wrap gap-2 justify-end">
          {Array.from({ length: bitSize }, (_, i) => bitSize - 1 - i).map((bitIndex) => {
            const isSet = (currentMasked & (1n << BigInt(bitIndex))) !== 0n;
            return (
              <button
                key={bitIndex}
                onClick={() => toggleBit(bitIndex)}
                className={`w-7 h-9 rounded flex flex-col items-center justify-center font-mono-hud transition-all ${
                  isSet
                    ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                }`}
                title={`Bit ${bitIndex}: ${isSet ? '1 (Actif)' : '0 (Inactif)'}`}
              >
                <span className="text-xs font-bold">{isSet ? '1' : '0'}</span>
                <span className="text-[9px] text-slate-500 -mt-0.5">{bitIndex}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bitwise Operations Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
        <input
          type="number"
          value={opInput}
          onChange={(e) => setOpInput(e.target.value)}
          placeholder="Opérande..."
          className="w-28 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono-hud text-xs text-slate-100"
        />

        <button
          onClick={() => applyBitwise('AND')}
          className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 font-mono-hud text-xs text-slate-300"
        >
          AND
        </button>
        <button
          onClick={() => applyBitwise('OR')}
          className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 font-mono-hud text-xs text-slate-300"
        >
          OR
        </button>
        <button
          onClick={() => applyBitwise('XOR')}
          className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 font-mono-hud text-xs text-slate-300"
        >
          XOR
        </button>
        <button
          onClick={() => applyBitwise('NOT')}
          className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 font-mono-hud text-xs text-slate-300"
        >
          NOT
        </button>
        <button
          onClick={() => applyBitwise('SHL')}
          className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 font-mono-hud text-xs text-slate-300"
        >
          &lt;&lt; SHL
        </button>
        <button
          onClick={() => applyBitwise('SHR')}
          className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 font-mono-hud text-xs text-slate-300"
        >
          &gt;&gt; SHR
        </button>

        <button
          onClick={() => {
            sound.playClick(1200);
            onInjectResult(currentMasked.toString());
          }}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono-hud text-xs transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          Injecter {currentMasked.toString()} dans l&apos;écran
        </button>
      </div>
    </div>
  );
};
