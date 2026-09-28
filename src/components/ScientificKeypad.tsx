import React, { useState, useEffect } from 'react';
import { QUANTUM_CONSTANTS, QuantumConstant } from '../utils/mathEngine';
import { sound } from '../utils/soundEngine';

interface ScientificKeypadProps {
  onInsert: (val: string) => void;
  onClear: () => void;
  onDeleteChar: () => void;
  onCalculate: () => void;
  onMemoryAdd: () => void;
  onMemorySubtract: () => void;
  onMemoryRecall: () => void;
  onMemoryClear: () => void;
  onToggleSign: () => void;
}

export const ScientificKeypad: React.FC<ScientificKeypadProps> = ({
  onInsert,
  onClear,
  onDeleteChar,
  onCalculate,
  onMemoryAdd,
  onMemorySubtract,
  onMemoryRecall,
  onMemoryClear,
  onToggleSign,
}) => {
  const [isSecond, setIsSecond] = useState(false);
  const [showConstants, setShowConstants] = useState(false);

  // Global physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input or textarea has focus
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        sound.playClick();
        onInsert(e.key);
      } else if (e.key === '.') {
        sound.playClick();
        onInsert('.');
      } else if (e.key === '+') {
        sound.playOperator();
        onInsert('+');
      } else if (e.key === '-') {
        sound.playOperator();
        onInsert('−');
      } else if (e.key === '*') {
        sound.playOperator();
        onInsert('×');
      } else if (e.key === '/') {
        e.preventDefault();
        sound.playOperator();
        onInsert('÷');
      } else if (e.key === '^') {
        sound.playOperator();
        onInsert('^');
      } else if (e.key === '(' || e.key === ')') {
        sound.playClick();
        onInsert(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        sound.playEquals();
        onCalculate();
      } else if (e.key === 'Backspace') {
        sound.playClear();
        onDeleteChar();
      } else if (e.key === 'Escape') {
        sound.playClear();
        onClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onInsert, onCalculate, onDeleteChar, onClear]);

  const handleKeyClick = (token: string, type: 'num' | 'op' | 'fn' = 'num') => {
    if (type === 'op') sound.playOperator();
    else sound.playClick();
    onInsert(token);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Memory & Quick Settings Drawer */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1.5 font-mono-hud">
          <button
            onClick={() => {
              sound.playClick(600);
              onMemoryClear();
            }}
            className="px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
          >
            MC
          </button>
          <button
            onClick={() => {
              sound.playClick(600);
              onMemoryRecall();
            }}
            className="px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
          >
            MR
          </button>
          <button
            onClick={() => {
              sound.playClick(600);
              onMemoryAdd();
            }}
            className="px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-emerald-300 border border-slate-800 transition-colors"
          >
            M+
          </button>
          <button
            onClick={() => {
              sound.playClick(600);
              onMemorySubtract();
            }}
            className="px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 transition-colors"
          >
            M-
          </button>
        </div>

        {/* 2nd Function & Constants Drawer */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick(900);
              setIsSecond(!isSecond);
            }}
            className={`px-3 py-1 rounded font-mono-hud text-xs font-semibold transition-colors border ${
              isSecond
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            2nd {isSecond ? '●' : ''}
          </button>

          <button
            onClick={() => {
              sound.playClick(750);
              setShowConstants(!showConstants);
            }}
            className={`px-3 py-1 rounded font-mono-hud text-xs font-medium transition-colors border ${
              showConstants
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Constantes ({QUANTUM_CONSTANTS.length})
          </button>
        </div>
      </div>

      {/* Expandable Quantum Constants Bar */}
      {showConstants && (
        <div className="p-3 bg-slate-900/90 border border-amber-500/30 rounded-lg animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="text-[11px] font-mono-hud text-amber-300/80 mb-2 uppercase tracking-wider">
            Constantes Fondamentales & Astrophysiques :
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto">
            {QUANTUM_CONSTANTS.map((c: QuantumConstant) => (
              <button
                key={c.symbol}
                onClick={() => {
                  sound.playClick();
                  onInsert(c.symbol);
                }}
                className="flex items-center justify-between p-1.5 rounded bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition-colors group"
                title={`${c.name}: ${c.value} ${c.unit} (${c.description})`}
              >
                <span className="font-mono-hud text-amber-300 font-bold group-hover:text-amber-200">
                  {c.symbol}
                </span>
                <span className="text-[11px] text-slate-400 truncate max-w-[100px] ml-1">
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Scientific Keypad Grid */}
      <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
        {/* ROW 1: Advanced Functions */}
        <button
          onClick={() => handleKeyClick(isSecond ? 'asin(' : 'sin(', 'fn')}
          className="keypad-fn"
        >
          {isSecond ? 'sin⁻¹' : 'sin'}
        </button>
        <button
          onClick={() => handleKeyClick(isSecond ? 'acos(' : 'cos(', 'fn')}
          className="keypad-fn"
        >
          {isSecond ? 'cos⁻¹' : 'cos'}
        </button>
        <button
          onClick={() => handleKeyClick(isSecond ? 'atan(' : 'tan(', 'fn')}
          className="keypad-fn"
        >
          {isSecond ? 'tan⁻¹' : 'tan'}
        </button>
        <button
          onClick={() => handleKeyClick(isSecond ? 'exp(' : 'ln(', 'fn')}
          className="keypad-fn"
        >
          {isSecond ? 'eˣ' : 'ln'}
        </button>
        <button
          onClick={() => handleKeyClick(isSecond ? '10^(' : 'log(', 'fn')}
          className="keypad-fn"
        >
          {isSecond ? '10ˣ' : 'log'}
        </button>

        {/* ROW 2: Powers, Roots & Brackets */}
        <button
          onClick={() => handleKeyClick(isSecond ? '^2' : '^(', 'fn')}
          className="keypad-fn"
        >
          {isSecond ? 'x²' : 'xʸ'}
        </button>
        <button
          onClick={() => handleKeyClick(isSecond ? 'cbrt(' : 'sqrt(', 'fn')}
          className="keypad-fn"
        >
          {isSecond ? '∛x' : '√x'}
        </button>
        <button
          onClick={() => handleKeyClick('(', 'fn')}
          className="keypad-fn"
        >
          (
        </button>
        <button
          onClick={() => handleKeyClick(')', 'fn')}
          className="keypad-fn"
        >
          )
        </button>
        <button
          onClick={() => handleKeyClick('÷', 'op')}
          className="keypad-op"
        >
          ÷
        </button>

        {/* ROW 3: Numbers 7,8,9 + Factorial + Multiplication */}
        <button
          onClick={() => handleKeyClick('7')}
          className="keypad-num"
        >
          7
        </button>
        <button
          onClick={() => handleKeyClick('8')}
          className="keypad-num"
        >
          8
        </button>
        <button
          onClick={() => handleKeyClick('9')}
          className="keypad-num"
        >
          9
        </button>
        <button
          onClick={() => handleKeyClick('!', 'fn')}
          className="keypad-fn"
          title="Factorielle (x!)"
        >
          n!
        </button>
        <button
          onClick={() => handleKeyClick('×', 'op')}
          className="keypad-op"
        >
          ×
        </button>

        {/* ROW 4: Numbers 4,5,6 + Modulus + Subtraction */}
        <button
          onClick={() => handleKeyClick('4')}
          className="keypad-num"
        >
          4
        </button>
        <button
          onClick={() => handleKeyClick('5')}
          className="keypad-num"
        >
          5
        </button>
        <button
          onClick={() => handleKeyClick('6')}
          className="keypad-num"
        >
          6
        </button>
        <button
          onClick={() => handleKeyClick(' mod ', 'op')}
          className="keypad-fn"
          title="Modulo (reste de division)"
        >
          mod
        </button>
        <button
          onClick={() => handleKeyClick('−', 'op')}
          className="keypad-op"
        >
          −
        </button>

        {/* ROW 5: Numbers 1,2,3 + Pi + Addition */}
        <button
          onClick={() => handleKeyClick('1')}
          className="keypad-num"
        >
          1
        </button>
        <button
          onClick={() => handleKeyClick('2')}
          className="keypad-num"
        >
          2
        </button>
        <button
          onClick={() => handleKeyClick('3')}
          className="keypad-num"
        >
          3
        </button>
        <button
          onClick={() => handleKeyClick('π', 'fn')}
          className="keypad-fn font-semibold text-cyan-300"
          title="Pi (3.14159...)"
        >
          π
        </button>
        <button
          onClick={() => handleKeyClick('+', 'op')}
          className="keypad-op"
        >
          +
        </button>

        {/* ROW 6: Toggle Sign, 0, Point, Ans, Equals */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleSign();
          }}
          className="keypad-fn"
          title="Changer de signe (±)"
        >
          ±
        </button>
        <button
          onClick={() => handleKeyClick('0')}
          className="keypad-num"
        >
          0
        </button>
        <button
          onClick={() => handleKeyClick('.')}
          className="keypad-num"
        >
          .
        </button>
        <button
          onClick={() => handleKeyClick('Ans', 'fn')}
          className="keypad-fn font-mono-hud text-cyan-300"
          title="Dernier résultat enregistré"
        >
          Ans
        </button>
        <button
          onClick={() => {
            sound.playEquals();
            onCalculate();
          }}
          className="keypad-equals col-span-1"
          title="Calculer le résultat (=)"
        >
          =
        </button>
      </div>
    </div>
  );
};
