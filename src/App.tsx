/**
 * NovaCalc Quantum - Calculatrice Interactive et Intelligente du Futur
 * @license Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { HeaderNav, AppMode } from './components/HeaderNav';
import { DisplayHUD } from './components/DisplayHUD';
import { ScientificKeypad } from './components/ScientificKeypad';
import { FunctionGrapher } from './components/FunctionGrapher';
import { NeuralSolver } from './components/NeuralSolver';
import { QuantumPhysicsTools } from './components/QuantumPhysicsTools';
import { ProgrammerTools } from './components/ProgrammerTools';
import { HistoryDrawer, HistoryItem } from './components/HistoryDrawer';
import { evaluateMath, formatResult, AngleMode } from './utils/mathEngine';
import { sound } from './utils/soundEngine';

export default function App() {
  // Navigation & View Mode
  const [currentMode, setCurrentMode] = useState<AppMode>('scientific');
  const [isMuted, setIsMuted] = useState(sound.isMuted());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Math State
  const [angleMode, setAngleMode] = useState<AngleMode>('RAD');
  const [expression, setExpression] = useState('');
  const [mainResult, setMainResult] = useState('');
  const [previewResult, setPreviewResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Memory & Ans
  const [memoryRegisters, setMemoryRegisters] = useState<{ [key: string]: number }>({
    M: 0,
    Ans: 0,
  });

  // History Log with localStorage persistence
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('novacalc_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Grapher target function for cross-tool transfers
  const [grapherFunction, setGrapherFunction] = useState('sin(x)');

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('novacalc_history', JSON.stringify(history.slice(0, 50)));
    } catch {
      // ignore
    }
  }, [history]);

  // Real-time evaluation preview while user types
  useEffect(() => {
    if (!expression.trim()) {
      setPreviewResult(null);
      setError(null);
      return;
    }

    try {
      // Replace Ans with its numeric value
      const exprWithAns = expression.replace(/\bAns\b/g, `(${memoryRegisters.Ans})`);
      const val = evaluateMath(exprWithAns, angleMode);
      setPreviewResult(formatResult(val));
      setError(null);
    } catch {
      // Incomplete expressions are normal while typing
      setPreviewResult(null);
    }
  }, [expression, angleMode, memoryRegisters.Ans]);

  // Calculate & finalize
  const handleCalculate = useCallback(() => {
    if (!expression.trim()) return;

    try {
      const exprWithAns = expression.replace(/\bAns\b/g, `(${memoryRegisters.Ans})`);
      const val = evaluateMath(exprWithAns, angleMode);
      const formatted = formatResult(val);

      setMainResult(formatted);
      setPreviewResult(null);
      setError(null);

      // Save to Ans register
      setMemoryRegisters((prev) => ({ ...prev, Ans: val }));

      // Add to session history
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        expression,
        result: formatted,
        timestamp: new Date(),
        mode: angleMode,
      };
      setHistory((prev) => [newItem, ...prev]);
    } catch (err: unknown) {
      sound.playError();
      const msg = err instanceof Error ? err.message : 'Erreur syntaxique';
      setError(msg);
    }
  }, [expression, angleMode, memoryRegisters.Ans]);

  // Keypad insert
  const handleInsert = (token: string) => {
    setError(null);

    // If previous calculation just finished and user types a number, start fresh
    if (mainResult && !previewResult && /^[0-9πeφ]$/.test(token)) {
      setExpression(token);
      setMainResult('');
      return;
    }

    // If an operator is typed right after a result, chain it with Ans
    if (mainResult && !previewResult && ['+', '−', '×', '÷', '^', ' mod '].includes(token)) {
      setExpression(`Ans${token}`);
      setMainResult('');
      return;
    }

    setExpression((prev) => prev + token);
  };

  const handleClear = () => {
    setExpression('');
    setMainResult('');
    setPreviewResult(null);
    setError(null);
  };

  const handleDeleteChar = () => {
    setExpression((prev) => {
      if (prev.endsWith(' mod ')) return prev.slice(0, -5);
      if (prev.endsWith('Ans')) return prev.slice(0, -3);
      if (prev.endsWith('sin(') || prev.endsWith('cos(') || prev.endsWith('tan(')) return prev.slice(0, -4);
      return prev.slice(0, -1);
    });
    setMainResult('');
    setError(null);
  };

  const handleToggleSign = () => {
    if (!expression) return;
    if (expression.startsWith('-(') && expression.endsWith(')')) {
      setExpression(expression.slice(2, -1));
    } else {
      setExpression(`-(${expression})`);
    }
  };

  // Memory operations
  const handleMemoryAdd = () => {
    try {
      const currentVal = mainResult ? parseFloat(mainResult) : evaluateMath(expression, angleMode);
      setMemoryRegisters((prev) => ({ ...prev, M: prev.M + currentVal }));
      sound.playClick(1000);
    } catch {
      sound.playError();
    }
  };

  const handleMemorySubtract = () => {
    try {
      const currentVal = mainResult ? parseFloat(mainResult) : evaluateMath(expression, angleMode);
      setMemoryRegisters((prev) => ({ ...prev, M: prev.M - currentVal }));
      sound.playClick(1000);
    } catch {
      sound.playError();
    }
  };

  const handleMemoryRecall = () => {
    handleInsert(memoryRegisters.M.toString());
  };

  const handleMemoryClear = () => {
    setMemoryRegisters((prev) => ({ ...prev, M: 0 }));
    sound.playClear();
  };

  // Injections from external panels
  const handleInjectResult = (val: string) => {
    setExpression(val);
    setMainResult(val);
    setPreviewResult(null);
    setCurrentMode('scientific');
  };

  const handlePlotFunction = (funcStr: string) => {
    setGrapherFunction(funcStr);
    setCurrentMode('grapher');
  };

  const handleToggleAngleMode = () => {
    setAngleMode((prev) => {
      if (prev === 'RAD') return 'DEG';
      if (prev === 'DEG') return 'GRAD';
      return 'RAD';
    });
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Navigation */}
      <HeaderNav
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onToggleHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Mode Selector for Mobile/Small Screens */}
        <div className="flex md:hidden items-center justify-between gap-1 overflow-x-auto p-1 bg-slate-900/90 border border-slate-800 rounded-lg">
          {(
            [
              { id: 'scientific', label: 'Scientifique' },
              { id: 'grapher', label: 'Graphes 2D' },
              { id: 'neural', label: 'Solveur IA' },
              { id: 'quantum', label: 'Quantique' },
              { id: 'programmer', label: 'Binaire' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => {
                sound.playClick(900);
                setCurrentMode(m.id);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                currentMode === m.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Dynamic Mode Content */}
        {currentMode === 'scientific' && (
          <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full">
            {/* Visual HUD Display */}
            <DisplayHUD
              expression={expression}
              previewResult={previewResult}
              mainResult={mainResult}
              angleMode={angleMode}
              onToggleAngleMode={handleToggleAngleMode}
              hasMemory={memoryRegisters.M !== 0}
              onClear={handleClear}
              onDeleteChar={handleDeleteChar}
              error={error}
            />

            {/* Scientific Tactile Keypad */}
            <div className="bg-[#0c101a] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl">
              <ScientificKeypad
                onInsert={handleInsert}
                onClear={handleClear}
                onDeleteChar={handleDeleteChar}
                onCalculate={handleCalculate}
                onMemoryAdd={handleMemoryAdd}
                onMemorySubtract={handleMemorySubtract}
                onMemoryRecall={handleMemoryRecall}
                onMemoryClear={handleMemoryClear}
                onToggleSign={handleToggleSign}
              />
            </div>
          </div>
        )}

        {currentMode === 'grapher' && (
          <div className="w-full">
            <FunctionGrapher
              initialFunction={grapherFunction}
              onSendToCalculator={(func) => handleInjectResult(func)}
            />
          </div>
        )}

        {currentMode === 'neural' && (
          <div className="w-full">
            <NeuralSolver
              onInjectResult={handleInjectResult}
              onPlotFunction={handlePlotFunction}
              currentCalculatorState={{
                expression,
                result: mainResult || previewResult || '',
              }}
            />
          </div>
        )}

        {currentMode === 'quantum' && (
          <div className="w-full">
            <QuantumPhysicsTools onInjectResult={handleInjectResult} />
          </div>
        )}

        {currentMode === 'programmer' && (
          <div className="w-full">
            <ProgrammerTools
              initialValue={mainResult ? parseFloat(mainResult) || 42 : 42}
              onInjectResult={handleInjectResult}
            />
          </div>
        )}
      </main>

      {/* History Slide-over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onSelect={(item) => {
          setExpression(item.expression);
          setMainResult(item.result);
          setPreviewResult(null);
          setCurrentMode('scientific');
        }}
        onClear={() => setHistory([])}
        memoryRegisters={memoryRegisters}
      />

      {/* Futuristic Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0a0d14] px-4 sm:px-6 py-3 text-xs font-mono-hud text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span>NovaCalc Quantum Core</span>
          <span>·</span>
          <span>Mode: {angleMode}</span>
          <span>·</span>
          <span className="text-cyan-400">Système opérationnel</span>
        </div>

        <div className="flex items-center gap-3 text-slate-600">
          <span>Précision IEEE 754</span>
          <span>·</span>
          <span>Audio procédural actif</span>
        </div>
      </footer>
    </div>
  );
}
