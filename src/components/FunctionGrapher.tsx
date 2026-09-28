import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RefreshCw, Sliders, Info, Crosshair } from 'lucide-react';
import { evaluateMath, numericalDerivative, numericalIntegral } from '../utils/mathEngine';
import { sound } from '../utils/soundEngine';

interface FunctionGrapherProps {
  initialFunction?: string;
  onSendToCalculator?: (expr: string) => void;
}

interface Preset {
  name: string;
  formula: string;
  description: string;
  rangeX: [number, number];
}

const PRESETS: Preset[] = [
  {
    name: 'Paquet d\'onde Quantique',
    formula: 'exp(-0.15 * x^2) * cos(3 * x)',
    description: 'Fonction d\'onde gaussienne modulée (particule quantique)',
    rangeX: [-6, 6],
  },
  {
    name: 'Résonance de Lorentz',
    formula: 'a / (1 + (x - b)^2)',
    description: 'Courbe de résonance électromagnétique ou particulaire',
    rangeX: [-5, 8],
  },
  {
    name: 'Onde Gravitationnelle',
    formula: 'sin(x^1.6) * exp(-0.05 * x)',
    description: 'Signal oscillant à fréquence croissante (chirp)',
    rangeX: [0, 12],
  },
  {
    name: 'Parabole Balistique',
    formula: '-0.15 * x^2 + 2.5 * x',
    description: 'Trajectoire projectile sous gravitation',
    rangeX: [-2, 18],
  },
  {
    name: 'Sigmoïde Neuronale',
    formula: '1 / (1 + exp(-x))',
    description: 'Fonction d\'activation biologique et artificielle',
    rangeX: [-6, 6],
  },
  {
    name: 'Oscillation Harmonique',
    formula: 'a * sin(b * x + k)',
    description: 'Système oscillant avec paramètres ajustables',
    rangeX: [-10, 10],
  },
];

export const FunctionGrapher: React.FC<FunctionGrapherProps> = ({
  initialFunction = 'sin(x)',
  onSendToCalculator,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Expressions
  const [func1, setFunc1] = useState(initialFunction);
  const [showDerivative, setShowDerivative] = useState(false);
  const [func2, setFunc2] = useState('');
  const [showFunc2, setShowFunc2] = useState(false);

  // Dynamic sliders
  const [paramA, setParamA] = useState(1);
  const [paramB, setParamB] = useState(1);
  const [paramK, setParamK] = useState(0);
  const [showSliders, setShowSliders] = useState(false);

  // Viewport coordinates
  const [view, setView] = useState({
    minX: -10,
    maxX: 10,
    minY: -5,
    maxY: 5,
  });

  // Cursor state
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calculus analysis
  const [integralRange, setIntegralRange] = useState<[number, number]>([-2, 2]);
  const [showIntegral, setShowIntegral] = useState(false);
  const [integralVal, setIntegralVal] = useState<number | null>(null);

  // Replace sliders into expression
  const substituteParameters = useCallback((expr: string): string => {
    let s = expr;
    s = s.replace(/\ba\b/g, `(${paramA})`);
    s = s.replace(/\bb\b/g, `(${paramB})`);
    s = s.replace(/\bk\b/g, `(${paramK})`);
    return s;
  }, [paramA, paramB, paramK]);

  // Canvas drawing routine
  const renderGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Background
    ctx.fillStyle = '#070a12';
    ctx.fillRect(0, 0, width, height);

    // Helpers to convert math coords to screen coords
    const toScreenX = (x: number) => ((x - view.minX) / (view.maxX - view.minX)) * width;
    const toScreenY = (y: number) => height - ((y - view.minY) / (view.maxY - view.minY)) * height;
    const toMathX = (px: number) => view.minX + (px / width) * (view.maxX - view.minX);

    // Calculate grid step based on range
    const rangeX = view.maxX - view.minX;
    let step = Math.pow(10, Math.floor(Math.log10(rangeX))) / 2;
    if (rangeX / step > 20) step *= 2;
    if (rangeX / step < 5) step /= 2;

    // Draw Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';

    // Vertical grid lines
    const firstX = Math.floor(view.minX / step) * step;
    for (let x = firstX; x <= view.maxX; x += step) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();

      if (Math.abs(x) > 1e-6) {
        ctx.fillText(x.toFixed(step < 1 ? 2 : 0), sx + 3, toScreenY(0) + 12);
      }
    }

    // Horizontal grid lines
    const firstY = Math.floor(view.minY / step) * step;
    for (let y = firstY; y <= view.maxY; y += step) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();

      if (Math.abs(y) > 1e-6) {
        ctx.fillText(y.toFixed(step < 1 ? 2 : 0), toScreenX(0) + 4, sy - 3);
      }
    }

    // Main Axes
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.8)';
    const originX = toScreenX(0);
    const originY = toScreenY(0);

    // X axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Y axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Integral Shading Area
    if (showIntegral && func1.trim()) {
      const subFunc = substituteParameters(func1);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.beginPath();
      const [startIx, endIx] = integralRange;
      const startPx = toScreenX(startIx);
      const endPx = toScreenX(endIx);

      ctx.moveTo(startPx, toScreenY(0));
      for (let px = startPx; px <= endPx; px += 2) {
        const mx = toMathX(px);
        try {
          const my = evaluateMath(subFunc, 'RAD', mx);
          if (isFinite(my)) {
            ctx.lineTo(px, toScreenY(my));
          }
        } catch {
          // ignore
        }
      }
      ctx.lineTo(endPx, toScreenY(0));
      ctx.closePath();
      ctx.fill();
    }

    // Plot Curve helper
    const plot = (expr: string, color: string, strokeWidth = 2.5, isDash = false) => {
      if (!expr.trim()) return;
      const subExpr = substituteParameters(expr);

      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.setLineDash(isDash ? [4, 4] : []);
      ctx.beginPath();

      let started = false;
      const numPoints = width;

      for (let px = 0; px <= numPoints; px += 1.5) {
        const mx = toMathX(px);
        try {
          const my = evaluateMath(subExpr, 'RAD', mx);
          if (isFinite(my)) {
            const py = toScreenY(my);
            if (!started) {
              ctx.moveTo(px, py);
              started = true;
            } else {
              // Avoid connecting huge discontinuities (e.g. tan(x))
              if (Math.abs(py - height / 2) < height * 3) {
                ctx.lineTo(px, py);
              } else {
                started = false;
              }
            }
          } else {
            started = false;
          }
        } catch {
          started = false;
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // 1. Plot Primary Function f(x)
    plot(func1, '#06b6d4', 2.5);

    // 2. Plot Derivative f'(x) if enabled
    if (showDerivative && func1.trim()) {
      const subFunc = substituteParameters(func1);
      ctx.strokeStyle = '#10b981'; // Emerald
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      let started = false;

      for (let px = 0; px <= width; px += 3) {
        const mx = toMathX(px);
        try {
          const dy = numericalDerivative(subFunc, mx, 'RAD');
          if (isFinite(dy)) {
            const py = toScreenY(dy);
            if (!started) {
              ctx.moveTo(px, py);
              started = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            started = false;
          }
        } catch {
          started = false;
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Plot Secondary Function g(x)
    if (showFunc2 && func2.trim()) {
      plot(func2, '#f59e0b', 2);
    }

    // Draw Crosshair & cursor info
    if (cursor) {
      const cx = toScreenX(cursor.x);
      const cy = toScreenY(cursor.y);

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.setLineDash([2, 2]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point circle
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [view, func1, func2, showFunc2, showDerivative, showIntegral, integralRange, cursor, substituteParameters]);

  // Re-render when dependencies change
  useEffect(() => {
    renderGraph();
  }, [renderGraph]);

  // Calculate integral when toggled
  useEffect(() => {
    if (showIntegral && func1.trim()) {
      try {
        const sub = substituteParameters(func1);
        const val = numericalIntegral(sub, integralRange[0], integralRange[1]);
        setIntegralVal(val);
      } catch {
        setIntegralVal(null);
      }
    }
  }, [showIntegral, func1, integralRange, substituteParameters]);

  // Mouse drag handling for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const mathX = view.minX + (px / rect.width) * (view.maxX - view.minX);
    let mathY = 0;
    try {
      const sub = substituteParameters(func1);
      mathY = evaluateMath(sub, 'RAD', mathX);
    } catch {
      mathY = view.maxY - (py / rect.height) * (view.maxY - view.minY);
    }
    setCursor({ x: mathX, y: mathY });

    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      const xSpan = view.maxX - view.minX;
      const ySpan = view.maxY - view.minY;

      const deltaMathX = -(dx / rect.width) * xSpan;
      const deltaMathY = (dy / rect.height) * ySpan;

      setView({
        minX: view.minX + deltaMathX,
        maxX: view.maxX + deltaMathX,
        minY: view.minY + deltaMathY,
        maxY: view.maxY + deltaMathY,
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom with mouse wheel
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 0.85 : 1.15;
    zoom(factor);
  };

  const zoom = (factor: number) => {
    sound.playClick(1000);
    const centerX = (view.minX + view.maxX) / 2;
    const centerY = (view.minY + view.maxY) / 2;
    const newHalfX = ((view.maxX - view.minX) * factor) / 2;
    const newHalfY = ((view.maxY - view.minY) * factor) / 2;

    setView({
      minX: centerX - newHalfX,
      maxX: centerX + newHalfX,
      minY: centerY - newHalfY,
      maxY: centerY + newHalfY,
    });
  };

  const resetView = () => {
    sound.playClick(600);
    setView({ minX: -10, maxX: 10, minY: -5, maxY: 5 });
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
      {/* Top Header: Function Expression Input & Presets */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-2">
          <span className="font-mono-hud text-cyan-400 font-bold text-sm shrink-0">
            f(x) =
          </span>
          <input
            type="text"
            value={func1}
            onChange={(e) => setFunc1(e.target.value)}
            placeholder="ex: sin(x), exp(-x^2), x^3 - 3*x"
            className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 font-mono-hud text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50"
          />
        </div>

        {/* Presets selector */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            onChange={(e) => {
              const preset = PRESETS.find((p) => p.name === e.target.value);
              if (preset) {
                sound.playClick(1200);
                setFunc1(preset.formula);
                setView({
                  minX: preset.rangeX[0],
                  maxX: preset.rangeX[1],
                  minY: -4,
                  maxY: 4,
                });
              }
            }}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium focus:outline-none focus:border-cyan-500"
          >
            <option value="">Sélectionner un modèle...</option>
            {PRESETS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowSliders(!showSliders)}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1 ${
              showSliders
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Paramètres dynamiques a, b, k"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Sliders Row (a, b, k) */}
      {showSliders && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-lg animate-in fade-in">
          <div>
            <div className="flex justify-between text-xs font-mono-hud text-slate-400 mb-1">
              <span>Paramètre a (Amplitude) :</span>
              <span className="text-cyan-300 font-semibold">{paramA.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.05"
              value={paramA}
              onChange={(e) => setParamA(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs font-mono-hud text-slate-400 mb-1">
              <span>Paramètre b (Fréquence) :</span>
              <span className="text-cyan-300 font-semibold">{paramB.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.05"
              value={paramB}
              onChange={(e) => setParamB(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs font-mono-hud text-slate-400 mb-1">
              <span>Paramètre k (Phase / Décalage) :</span>
              <span className="text-cyan-300 font-semibold">{paramK.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-3.14"
              max="3.14"
              step="0.05"
              value={paramK}
              onChange={(e) => setParamK(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Canvas Viewport HUD */}
      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-[#070a12]">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDragging(false);
            setCursor(null);
          }}
          onWheel={handleWheel}
          className="w-full h-80 sm:h-96 block cursor-crosshair"
        />

        {/* On-Canvas Floating Telemetry HUD */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 pointer-events-none">
          {cursor && (
            <div className="px-2.5 py-1 rounded bg-[#0b0f19]/90 border border-slate-700/80 font-mono-hud text-xs text-slate-300 shadow">
              <span className="text-slate-400">x:</span>{' '}
              <span className="text-cyan-300 font-semibold">{cursor.x.toFixed(3)}</span>
              <span className="text-slate-600 mx-1.5">|</span>
              <span className="text-slate-400">y:</span>{' '}
              <span className="text-cyan-300 font-semibold">{cursor.y.toFixed(3)}</span>
            </div>
          )}
        </div>

        {/* Viewport Zoom & Pan Floating Controls */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-lg backdrop-blur-md shadow">
          <button
            onClick={() => zoom(0.8)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Zoom avant"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => zoom(1.25)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Zoom arrière"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Réinitialiser l'échelle"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Function Legend */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 text-[11px] font-mono-hud pointer-events-none">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-cyan-300">
            <span className="w-2.5 h-0.5 bg-cyan-400 rounded" />
            <span>f(x)</span>
          </div>
          {showDerivative && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-emerald-300">
              <span className="w-2.5 h-0.5 bg-emerald-400 rounded border-dashed" />
              <span>f'(x) Dérivée</span>
            </div>
          )}
        </div>
      </div>

      {/* Calculus & Curve Tools Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          {/* Derivative Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setShowDerivative(!showDerivative);
            }}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              showDerivative
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            f'(x) Dérivée numérique
          </button>

          {/* Integral Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setShowIntegral(!showIntegral);
            }}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              showIntegral
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            ∫ Aire sous la courbe
          </button>
        </div>

        {/* Integral computation summary */}
        {showIntegral && integralVal !== null && (
          <div className="flex items-center gap-2 font-mono-hud text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-cyan-500/30">
            <span className="text-slate-400">∫[{integralRange[0]}, {integralRange[1]}] =</span>
            <span className="text-cyan-300 font-bold tabular-nums">{integralVal.toFixed(5)}</span>
          </div>
        )}

        {/* Injection action */}
        {onSendToCalculator && (
          <button
            onClick={() => {
              sound.playClick(1200);
              onSendToCalculator(func1);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            Transférer à la calculatrice →
          </button>
        )}
      </div>
    </div>
  );
};
