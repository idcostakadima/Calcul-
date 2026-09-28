/**
 * NovaCalc Quantum - Mathematical Engine
 * High-precision evaluation, calculus approximation, constants and conversions.
 */

export type AngleMode = 'RAD' | 'DEG' | 'GRAD';

export interface QuantumConstant {
  symbol: string;
  name: string;
  value: number;
  unit: string;
  description: string;
}

export const QUANTUM_CONSTANTS: QuantumConstant[] = [
  { symbol: 'π', name: 'Pi', value: Math.PI, unit: '', description: 'Rapport circonférence / diamètre' },
  { symbol: 'e', name: 'Euler', value: Math.E, unit: '', description: 'Base du logarithme népérien' },
  { symbol: 'φ', name: 'Nombre d\'or', value: (1 + Math.sqrt(5)) / 2, unit: '', description: 'Proportion divine (1.618...)' },
  { symbol: 'c', name: 'Vitesse lumière', value: 299792458, unit: 'm/s', description: 'Célérité dans le vide' },
  { symbol: 'h', name: 'Planck', value: 6.62607015e-34, unit: 'J·s', description: 'Constante quantique d\'action' },
  { symbol: 'ħ', name: 'Planck réduit', value: 1.054571817e-34, unit: 'J·s', description: 'Constante de Dirac (h / 2π)' },
  { symbol: 'G', name: 'Gravitation', value: 6.67430e-11, unit: 'm³/(kg·s²)', description: 'Constante universelle de Newton' },
  { symbol: 'k_B', name: 'Boltzmann', value: 1.380649e-23, unit: 'J/K', description: 'Énergie cinétique thermique' },
  { symbol: 'N_A', name: 'Avogadro', value: 6.02214076e23, unit: 'mol⁻¹', description: 'Nombre d\'entités par mole' },
  { symbol: 'm_e', name: 'Masse électron', value: 9.1093837e-31, unit: 'kg', description: 'Masse au repos d\'un électron' },
  { symbol: 'm_p', name: 'Masse proton', value: 1.67262192e-27, unit: 'kg', description: 'Masse au repos d\'un proton' },
  { symbol: 'q_e', name: 'Charge élém.', value: 1.60217663e-19, unit: 'C', description: 'Charge électrique élémentaire' },
];

/**
 * Converts angle to radians based on the active mode
 */
export function toRadians(val: number, mode: AngleMode): number {
  if (mode === 'DEG') return (val * Math.PI) / 180;
  if (mode === 'GRAD') return (val * Math.PI) / 200;
  return val;
}

/**
 * Converts angle from radians to the active mode
 */
export function fromRadians(rad: number, mode: AngleMode): number {
  if (mode === 'DEG') return (rad * 180) / Math.PI;
  if (mode === 'GRAD') return (rad * 200) / Math.PI;
  return rad;
}

/**
 * Computes factorial of n
 */
export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) {
    // Lanczos gamma approximation for non-integers
    return gamma(n + 1);
  }
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

/**
 * Lanczos Gamma function approximation
 */
function gamma(z: number): number {
  const g = 7;
  const C = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  let x = C[0];
  for (let i = 1; i < g + 2; i++) {
    x += C[i] / (z + i);
  }
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

/**
 * Prepares and normalizes math expression into safe evaluable JavaScript math
 */
export function prepareExpression(expr: string, angleMode: AngleMode = 'RAD', variableX?: number): string {
  let s = expr.trim();
  if (!s) return '0';

  // Replace custom display symbols
  s = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/–/g, '-');
  s = s.replace(/mod/gi, '%');

  // Replace constants
  s = s.replace(/\bpi\b/gi, `${Math.PI}`);
  s = s.replace(/π/g, `${Math.PI}`);
  s = s.replace(/ħ/g, `(${1.054571817e-34})`);
  s = s.replace(/\bc\b/g, `(299792458)`);
  s = s.replace(/φ/g, `(${((1 + Math.sqrt(5)) / 2)})`);

  // Handle variable x if provided (for graphing / calculus)
  if (variableX !== undefined) {
    s = s.replace(/\bx\b/gi, `(${variableX})`);
  }

  // Handle scientific e notation vs mathematical e
  // e followed by number or preceded by number without space
  s = s.replace(/(?<=[0-9])e(?=[+\-]?[0-9])/g, 'E'); // scientific 1e5
  s = s.replace(/(?<![0-9A-Za-z_])e(?![0-9A-Za-z_])/g, `${Math.E}`); // Euler's e

  // Factorials: e.g. 5! => fact(5)
  s = s.replace(/([0-9.]+|\([^\(\)]+\))!/g, 'fact($1)');

  // Exponentiation: a^b => Math.pow(a, b)
  while (s.includes('^')) {
    const powRegex = /([0-9.a-zA-Z_]+|\([^\(\)]+\))\^([0-9.a-zA-Z_]+|\([^\(\)]+\))/;
    const match = s.match(powRegex);
    if (!match) break;
    s = s.replace(powRegex, `Math.pow(${match[1]},${match[2]})`);
  }

  // Trigonometric replacements with angle mode consideration
  const toRadPrefix = angleMode === 'DEG' ? `*(${Math.PI}/180)` : angleMode === 'GRAD' ? `*(${Math.PI}/200)` : '';
  const fromRadPrefix = angleMode === 'DEG' ? `*(180/${Math.PI})` : angleMode === 'GRAD' ? `*(200/${Math.PI})` : '';

  // Direct functions
  s = s.replace(/\bsin\(([^)]+)\)/g, `Math.sin(($1)${toRadPrefix})`);
  s = s.replace(/\bcos\(([^)]+)\)/g, `Math.cos(($1)${toRadPrefix})`);
  s = s.replace(/\btan\(([^)]+)\)/g, `Math.tan(($1)${toRadPrefix})`);

  // Inverse trig
  s = s.replace(/\basin\(([^)]+)\)/g, `(Math.asin($1)${fromRadPrefix})`);
  s = s.replace(/\bacos\(([^)]+)\)/g, `(Math.acos($1)${fromRadPrefix})`);
  s = s.replace(/\batan\(([^)]+)\)/g, `(Math.atan($1)${fromRadPrefix})`);

  // Hyperbolic
  s = s.replace(/\bsinh\(/g, 'Math.sinh(');
  s = s.replace(/\bcosh\(/g, 'Math.cosh(');
  s = s.replace(/\btanh\(/g, 'Math.tanh(');

  // Logarithms
  s = s.replace(/\bln\(/g, 'Math.log(');
  s = s.replace(/\blog10\(/g, 'Math.log10(');
  s = s.replace(/\blog\(/g, 'Math.log10(');

  // Roots & powers
  s = s.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)');
  s = s.replace(/√([0-9.]+)/g, 'Math.sqrt($1)');
  s = s.replace(/\bsqrt\(/g, 'Math.sqrt(');
  s = s.replace(/\bcbrt\(/g, 'Math.cbrt(');
  s = s.replace(/\babs\(/g, 'Math.abs(');
  s = s.replace(/\bexp\(/g, 'Math.exp(');

  // Percentages: e.g. 50% => (50/100)
  s = s.replace(/([0-9.]+)%/g, '($1/100)');

  // Implicit multiplication: e.g. 2(3) or (2)(3) or 2Math.sqrt(4)
  s = s.replace(/([0-9.]+)\s*\(/g, '$1*(');
  s = s.replace(/\)\s*\(/g, ')*(');
  s = s.replace(/\)\s*([0-9.]+)/g, ')*$1');
  s = s.replace(/([0-9.]+)\s*Math\./g, '$1*Math.');

  return s;
}

/**
 * Safely evaluates a mathematical expression string
 */
export function evaluateMath(expr: string, angleMode: AngleMode = 'RAD', variableX?: number): number {
  const prepared = prepareExpression(expr, angleMode, variableX);

  // Sanitize: allow only numbers, Math, basic operators, fact, parentheses
  const sanitized = prepared.replace(/Math\.[a-zA-Z0-9]+/g, '').replace(/fact/g, '');
  if (!/^[0-9+\-*/().,%E\s]*$/.test(sanitized)) {
    throw new Error('Expression invalide ou non sécurisée');
  }

  // Create an evaluation context with factorial
  const evalFunc = new Function('fact', `return (${prepared});`);
  const result = evalFunc(factorial);

  if (typeof result !== 'number' || isNaN(result)) {
    throw new Error('Résultat indéfini');
  }

  return result;
}

/**
 * Calculates numerical derivative of f(x) at x0 using central difference
 */
export function numericalDerivative(expr: string, x0: number, angleMode: AngleMode = 'RAD'): number {
  const h = 1e-6;
  const fPlus = evaluateMath(expr, angleMode, x0 + h);
  const fMinus = evaluateMath(expr, angleMode, x0 - h);
  return (fPlus - fMinus) / (2 * h);
}

/**
 * Numerical integration using Simpson's rule over [a, b]
 */
export function numericalIntegral(
  expr: string,
  a: number,
  b: number,
  n: number = 100,
  angleMode: AngleMode = 'RAD'
): number {
  if (n % 2 !== 0) n += 1;
  const h = (b - a) / n;
  let sum = evaluateMath(expr, angleMode, a) + evaluateMath(expr, angleMode, b);

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const y = evaluateMath(expr, angleMode, x);
    sum += i % 2 === 0 ? 2 * y : 4 * y;
  }

  return (h / 3) * sum;
}

/**
 * Format numbers cleanly with scientific notation when needed
 */
export function formatResult(val: number, precision: number = 10): string {
  if (!isFinite(val)) {
    if (val === Infinity) return '∞ (Infini)';
    if (val === -Infinity) return '-∞ (-Infini)';
    return 'Indéfini';
  }

  // Very close to integer
  if (Math.abs(val - Math.round(val)) < 1e-12) {
    return Math.round(val).toString();
  }

  // Very large or very small -> scientific notation
  const absVal = Math.abs(val);
  if ((absVal >= 1e12 || (absVal < 1e-6 && absVal > 0))) {
    return val.toExponential(6).replace('e+', 'e+').replace('e-', 'e-');
  }

  // Standard fixed precision with trailing zeros trimmed
  const fixed = val.toFixed(precision);
  const trimmed = parseFloat(fixed).toString();
  return trimmed;
}

/**
 * Convert to different bases (Hex, Oct, Bin)
 */
export function convertBase(val: number, targetBase: 'DEC' | 'HEX' | 'OCT' | 'BIN', bitSize: 8 | 16 | 32 | 64 = 32): string {
  const intVal = BigInt(Math.trunc(val));
  const mask = bitSize === 64 ? 0xFFFFFFFFFFFFFFFFn : (1n << BigInt(bitSize)) - 1n;
  const maskedVal = intVal & mask;

  if (targetBase === 'HEX') {
    return '0x' + maskedVal.toString(16).toUpperCase();
  }
  if (targetBase === 'OCT') {
    return '0o' + maskedVal.toString(8);
  }
  if (targetBase === 'BIN') {
    const binStr = maskedVal.toString(2).padStart(bitSize, '0');
    // Group by 4
    return binStr.replace(/(.{4})/g, '$1 ').trim();
  }
  return intVal.toString(10);
}
