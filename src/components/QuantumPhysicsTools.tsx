import React, { useState } from 'react';
import { Orbit, Zap, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import { sound } from '../utils/soundEngine';

interface QuantumPhysicsToolsProps {
  onInjectResult: (val: string) => void;
}

const C = 299792458; // m/s
const G = 6.67430e-11; // N m^2 / kg^2
const H = 6.62607015e-34; // J s

export const QuantumPhysicsTools: React.FC<QuantumPhysicsToolsProps> = ({ onInjectResult }) => {
  const [activeTab, setActiveTab] = useState<'relativity' | 'massEnergy' | 'blackHole' | 'quantumWave'>('relativity');

  // 1. Relativity State
  const [velocityFraction, setVelocityFraction] = useState(0.90); // 90% of c
  const [properTimeYears, setProperTimeYears] = useState(5); // 5 years

  const lorentzFactor = 1 / Math.sqrt(Math.max(1e-9, 1 - Math.pow(velocityFraction, 2)));
  const earthTimeYears = properTimeYears * lorentzFactor;

  // 2. Mass-Energy State
  const [massKg, setMassKg] = useState(0.001); // 1 gram = 0.001 kg
  const energyJoules = massKg * Math.pow(C, 2);
  const energyTntMegatons = energyJoules / 4.184e15; // 1 megaton TNT ≈ 4.184e15 J

  // 3. Black Hole / Gravity State
  const [bodyPreset, setBodyPreset] = useState<'earth' | 'moon' | 'mars' | 'sun' | 'sgrA'>('earth');
  const bodies = {
    earth: { name: 'Terre', mass: 5.972e24, radius: 6.371e6 },
    moon: { name: 'Lune', mass: 7.342e22, radius: 1.737e6 },
    mars: { name: 'Mars', mass: 6.417e23, radius: 3.389e6 },
    sun: { name: 'Soleil', mass: 1.989e30, radius: 6.963e8 },
    sgrA: { name: 'Trou Noir Sagittaire A*', mass: 8.2e36, radius: 1.2e10 },
  };

  const selectedBody = bodies[bodyPreset];
  const schwarzschildRadiusM = (2 * G * selectedBody.mass) / Math.pow(C, 2);
  const escapeVelocityMps = Math.sqrt((2 * G * selectedBody.mass) / selectedBody.radius);

  // 4. Quantum Wave State
  const [photonWavelengthNm, setPhotonWavelengthNm] = useState(500); // 500 nm (visible green)
  const photonEnergyJ = (H * C) / (photonWavelengthNm * 1e-9);
  const photonEnergyEv = photonEnergyJ / 1.60217663e-19;

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 sm:p-6 flex flex-col gap-5 shadow-xl">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('relativity');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'relativity'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Dilatation Relativiste
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('massEnergy');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'massEnergy'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Masse-Énergie (E = mc²)
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('blackHole');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'blackHole'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Orbit className="w-3.5 h-3.5" />
          Astrophysique & Trous Noirs
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('quantumWave');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'quantumWave'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Énergie des Photons
        </button>
      </div>

      {/* TAB 1: RELATIVITÉ RESTREINTE */}
      {activeTab === 'relativity' && (
        <div className="flex flex-col gap-4 animate-in fade-in">
          <div className="text-xs text-slate-400">
            Formule de Lorentz : <span className="font-mono-hud text-cyan-300">γ = 1 / √(1 - v²/c²)</span>.
            À vitesse relativiste, le temps ralentit pour le voyageur par rapport à l&apos;observateur resté sur Terre.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
              <div>
                <div className="flex justify-between text-xs font-mono-hud text-slate-300 mb-1.5">
                  <span>Vitesse du vaisseau :</span>
                  <span className="text-cyan-400 font-bold">{(velocityFraction * 100).toFixed(1)}% de c</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.999"
                  step="0.005"
                  value={velocityFraction}
                  onChange={(e) => setVelocityFraction(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="text-[11px] font-mono-hud text-slate-500 mt-1">
                  v ≈ {(velocityFraction * C / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} km/s
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-hud text-slate-300 mb-1">
                  Durée vécue par l&apos;astronaute (années) :
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={properTimeYears}
                  onChange={(e) => setProperTimeYears(Math.max(0.1, parseFloat(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 font-mono-hud text-sm"
                />
              </div>
            </div>

            {/* Telemetry Result Panel */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#0c1424] to-[#090d18] border border-cyan-500/30 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono-hud uppercase text-slate-400 tracking-wider">
                  Temps écoulé sur Terre (Observateur) :
                </span>
                <div className="text-3xl font-bold font-mono-hud text-cyan-300 mt-1 tabular-nums">
                  {earthTimeYears.toFixed(2)} ans
                </div>
                <div className="text-xs text-slate-400 mt-2 font-mono-hud">
                  Facteur de Lorentz γ : <span className="text-amber-400 font-semibold">{lorentzFactor.toFixed(3)}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono-hud">
                  Écart temporel : <span className="text-emerald-400 font-semibold">+{(earthTimeYears - properTimeYears).toFixed(2)} ans</span>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick(1200);
                  onInjectResult(earthTimeYears.toFixed(2));
                }}
                className="mt-4 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono-hud text-xs transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Injecter {earthTimeYears.toFixed(2)} dans la calculatrice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MASSE-ENERGIE */}
      {activeTab === 'massEnergy' && (
        <div className="flex flex-col gap-4 animate-in fade-in">
          <div className="text-xs text-slate-400">
            Formule d&apos;Einstein : <span className="font-mono-hud text-cyan-300">E = m · c²</span>.
            Chaque gramme de matière contient une quantité colossale d&apos;énergie pure.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
              <label className="block text-xs font-mono-hud text-slate-300">
                Masse de matière (kg) :
              </label>
              <input
                type="number"
                min="0.000001"
                step="0.001"
                value={massKg}
                onChange={(e) => setMassKg(Math.max(0.0000001, parseFloat(e.target.value) || 0.001))}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 font-mono-hud text-sm"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] font-mono-hud text-slate-500">Préréglages :</span>
                <button
                  onClick={() => setMassKg(0.000001)}
                  className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 hover:text-cyan-300 border border-slate-800 text-xs font-mono-hud"
                >
                  1 mg (Sable)
                </button>
                <button
                  onClick={() => setMassKg(0.001)}
                  className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 hover:text-cyan-300 border border-slate-800 text-xs font-mono-hud"
                >
                  1 g (Goutte)
                </button>
                <button
                  onClick={() => setMassKg(1)}
                  className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 hover:text-cyan-300 border border-slate-800 text-xs font-mono-hud"
                >
                  1 kg
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-[#0c1424] to-[#090d18] border border-cyan-500/30 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono-hud uppercase text-slate-400 tracking-wider">
                  Énergie Libérée :
                </span>
                <div className="text-2xl sm:text-3xl font-bold font-mono-hud text-cyan-300 mt-1 tabular-nums">
                  {energyJoules.toExponential(4)} J
                </div>
                <div className="text-xs text-slate-300 mt-2 font-mono-hud">
                  Équivalent TNT : <span className="text-amber-400 font-semibold">{energyTntMegatons.toFixed(3)} Mégatonnes</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  (1 mégatonne TNT = bombe H thermonucléaire majeure)
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick(1200);
                  onInjectResult(energyJoules.toString());
                }}
                className="mt-4 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono-hud text-xs transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Injecter l&apos;énergie dans la calculatrice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TROUS NOIRS & ASTROPHYSIQUE */}
      {activeTab === 'blackHole' && (
        <div className="flex flex-col gap-4 animate-in fade-in">
          <div className="text-xs text-slate-400">
            Rayon de Schwarzschild : <span className="font-mono-hud text-cyan-300">R_s = 2GM / c²</span>.
            Rayon sous lequel la lumière ne peut plus s&apos;échapper de l&apos;horizon gravitationnel.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
              <label className="block text-xs font-mono-hud text-slate-300">
                Astre de référence :
              </label>
              <select
                value={bodyPreset}
                onChange={(e) => setBodyPreset(e.target.value as keyof typeof bodies)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 font-mono-hud text-sm"
              >
                {Object.entries(bodies).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.name}
                  </option>
                ))}
              </select>

              <div className="text-xs font-mono-hud text-slate-400 space-y-1">
                <div>Masse : {selectedBody.mass.toExponential(3)} kg</div>
                <div>Rayon réel : {(selectedBody.radius / 1000).toLocaleString('fr-FR')} km</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-[#0c1424] to-[#090d18] border border-cyan-500/30 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono-hud uppercase text-slate-400 tracking-wider">
                  Rayon de l&apos;Horizon des événements (R_s) :
                </span>
                <div className="text-2xl sm:text-3xl font-bold font-mono-hud text-cyan-300 mt-1 tabular-nums">
                  {schwarzschildRadiusM < 0.01
                    ? `${(schwarzschildRadiusM * 1000).toFixed(2)} mm`
                    : schwarzschildRadiusM < 1000
                    ? `${schwarzschildRadiusM.toFixed(2)} m`
                    : `${(schwarzschildRadiusM / 1000).toFixed(2)} km`}
                </div>
                <div className="text-xs text-slate-300 mt-2 font-mono-hud">
                  Vitesse de libération : <span className="text-amber-400 font-semibold">{(escapeVelocityMps / 1000).toFixed(2)} km/s</span>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick(1200);
                  onInjectResult(schwarzschildRadiusM.toFixed(4));
                }}
                className="mt-4 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono-hud text-xs transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Injecter R_s dans la calculatrice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: QUANTIQUE & PHOTONS */}
      {activeTab === 'quantumWave' && (
        <div className="flex flex-col gap-4 animate-in fade-in">
          <div className="text-xs text-slate-400">
            Relation de Planck-Einstein : <span className="font-mono-hud text-cyan-300">E = h · ν = h · c / λ</span>.
            Détermine l&apos;énergie d&apos;un quantum électromagnétique selon sa longueur d&apos;onde.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
              <div>
                <div className="flex justify-between text-xs font-mono-hud text-slate-300 mb-1.5">
                  <span>Longueur d&apos;onde (λ) :</span>
                  <span className="text-cyan-400 font-bold">{photonWavelengthNm} nm</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="5"
                  value={photonWavelengthNm}
                  onChange={(e) => setPhotonWavelengthNm(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] font-mono-hud text-slate-500">Spectre :</span>
                <button
                  onClick={() => setPhotonWavelengthNm(100)}
                  className="px-2 py-0.5 rounded bg-slate-900 text-purple-300 border border-slate-800 text-xs font-mono-hud"
                >
                  Ultraviolet (100nm)
                </button>
                <button
                  onClick={() => setPhotonWavelengthNm(450)}
                  className="px-2 py-0.5 rounded bg-slate-900 text-blue-300 border border-slate-800 text-xs font-mono-hud"
                >
                  Bleu (450nm)
                </button>
                <button
                  onClick={() => setPhotonWavelengthNm(700)}
                  className="px-2 py-0.5 rounded bg-slate-900 text-rose-300 border border-slate-800 text-xs font-mono-hud"
                >
                  Rouge (700nm)
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-[#0c1424] to-[#090d18] border border-cyan-500/30 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono-hud uppercase text-slate-400 tracking-wider">
                  Énergie par photon :
                </span>
                <div className="text-2xl sm:text-3xl font-bold font-mono-hud text-cyan-300 mt-1 tabular-nums">
                  {photonEnergyEv.toFixed(3)} eV
                </div>
                <div className="text-xs text-slate-300 mt-2 font-mono-hud">
                  En Joules : <span className="text-amber-400 font-semibold">{photonEnergyJ.toExponential(3)} J</span>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick(1200);
                  onInjectResult(photonEnergyEv.toFixed(3));
                }}
                className="mt-4 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono-hud text-xs transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Injecter {photonEnergyEv.toFixed(3)} eV dans la calculatrice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
