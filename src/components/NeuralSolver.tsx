import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownRight, Lightbulb, LineChart, Loader2, Send } from 'lucide-react';
import { sound } from '../utils/soundEngine';

interface Step {
  title: string;
  formula?: string;
  detail: string;
}

interface AiSolutionResponse {
  query: string;
  solution: string;
  numericResult?: number | null;
  formattedResult: string;
  steps: Step[];
  graphableFunction?: string | null;
  physicsContext?: string | null;
  quantumInsight?: string | null;
  suggestedFollowups?: string[];
}

interface NeuralSolverProps {
  onInjectResult: (val: string) => void;
  onPlotFunction: (funcStr: string) => void;
  currentCalculatorState?: {
    expression: string;
    result: string;
  };
}

const SAMPLE_QUERIES = [
  "Résous 3x² + 5x - 2 = 0 avec toutes les étapes",
  "Dilatation temporelle pour 5 ans à 0.95c",
  "Temps de voyage de la lumière Terre-Soleil",
  "Portée d'un tir balistique à 25 m/s à 45°",
  "Énergie d'un photon de longueur d'onde 450 nm",
  "Rayon de Schwarzschild d'un trou noir de 10 masses solaires",
];

export const NeuralSolver: React.FC<NeuralSolverProps> = ({
  onInjectResult,
  onPlotFunction,
  currentCalculatorState,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<AiSolutionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSolve = async (queryText = prompt) => {
    const q = queryText.trim();
    if (!q) return;

    sound.playQuantumSweep();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: q,
          currentContext: currentCalculatorState,
        }),
      });

      if (!res.ok) {
        throw new Error(`Erreur serveur (${res.status})`);
      }

      const data: AiSolutionResponse = await res.json();
      setSolution(data);
      sound.playEquals();
    } catch (err: unknown) {
      console.error('Erreur Solveur Neuronal:', err);
      sound.playError();
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de joindre le coeur neuronal. Vérifiez votre connexion.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 sm:p-6 flex flex-col gap-5 shadow-xl">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="font-display text-base font-bold tracking-wide text-slate-100 uppercase">
            Solveur Neuronal & Raisonnement Quantique
          </h2>
        </div>
        <span className="text-xs font-mono-hud text-cyan-400/80 bg-cyan-950/40 px-2.5 py-0.5 rounded border border-cyan-800/50">
          GEMINI 3.8 REASONING
        </span>
      </div>

      {/* Input Prompt Box */}
      <div className="flex flex-col gap-2">
        <div className="relative flex items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSolve();
            }}
            placeholder="Posez n'importe quelle question mathématique, physique ou problème en langage naturel..."
            className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 font-medium text-sm sm:text-base focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          <button
            onClick={() => handleSolve()}
            disabled={loading || !prompt.trim()}
            className="absolute right-2 p-2 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 transition-colors"
            title="Résoudre le problème"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-500 font-mono-hud text-[11px] mr-1">Exemples :</span>
          {SAMPLE_QUERIES.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setPrompt(sq);
                handleSolve(sq);
              }}
              className="px-2.5 py-1 rounded bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors text-left"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Loading state indicator */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400 animate-pulse">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="font-mono-hud text-xs tracking-wider uppercase text-cyan-300">
            Analyse tensorielle & résolution en cours...
          </span>
        </div>
      )}

      {/* Structured Solution Display */}
      {solution && !loading && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Main Answer Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-[#0c1220] to-[#0a0e18] border border-cyan-500/30 shadow-lg">
            <div className="flex items-center justify-between text-xs font-mono-hud text-slate-400 mb-2">
              <span className="uppercase tracking-wider">Résultat synthétisé</span>
              <span className="text-cyan-400">Exactitude vérifiée</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold font-mono-hud text-cyan-300 mb-2">
              {solution.formattedResult}
            </div>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              {solution.solution}
            </p>

            {/* Quick Actions for this result */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-800/80">
              {solution.numericResult !== undefined && solution.numericResult !== null && (
                <button
                  onClick={() => {
                    sound.playClick(1100);
                    onInjectResult(solution.numericResult!.toString());
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono-hud text-xs transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Injecter dans la calculatrice ({solution.numericResult})
                </button>
              )}

              {solution.graphableFunction && (
                <button
                  onClick={() => {
                    sound.playClick(1200);
                    onPlotFunction(solution.graphableFunction!);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono-hud text-xs transition-colors"
                >
                  <LineChart className="w-3.5 h-3.5" />
                  Tracer la courbe : f(x) = {solution.graphableFunction}
                </button>
              )}
            </div>
          </div>

          {/* Step-by-Step Breakdown */}
          {solution.steps && solution.steps.length > 0 && (
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-3">
              <h3 className="font-mono-hud text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CornerDownRight className="w-3.5 h-3.5 text-cyan-400" />
                Décomposition du raisonnement ({solution.steps.length} étapes)
              </h3>

              <div className="space-y-3">
                {solution.steps.map((st, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <div className="text-xs font-semibold font-mono-hud text-cyan-300 mb-1">
                      {st.title}
                    </div>
                    {st.formula && (
                      <div className="p-2 mb-1.5 rounded bg-slate-950 font-mono-hud text-xs text-amber-300 border border-slate-800">
                        {st.formula}
                      </div>
                    )}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {st.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Physics & Quantum Insight Callout */}
          {solution.quantumInsight && (
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-900/40 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-mono-hud text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
                  Éclairage Scientifique & Quantique
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {solution.quantumInsight}
                </p>
              </div>
            </div>
          )}

          {/* Follow-up suggestions */}
          {solution.suggestedFollowups && solution.suggestedFollowups.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-500 font-mono-hud text-[11px]">Approfondir :</span>
              {solution.suggestedFollowups.map((sf, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(sf);
                    handleSolve(sf);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                >
                  {sf}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
