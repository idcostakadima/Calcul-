import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Initialize Google GenAI client
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // System instruction for the mathematical/scientific neural engine
  const SYSTEM_INSTRUCTION = `Tu es le Coeur Neuronal de NovaCalc Quantum, une calculatrice scientifique et quantique de pointe.
Tu réponds en français de manière limpide, ultra-précise et structurée.
Quand l'utilisateur pose une question mathématique, physique, scientifique, financière ou géométrique:
1. Fournis une solution exacte et rigoureuse.
2. Décompose la résolution en étapes claires et concises (formule, substitution, calcul numérique).
3. Donne le résultat numérique principal épuré (ex: 42.5) et son formatage complet avec unités (ex: "42.5 m/s").
4. Si le problème implique une fonction mathématique traçable en 2D en fonction de x (ex: trajectoire balistique, parabole, onde sinusoïdale, décroissance exponentielle, courbe de coût), fournis l'expression javascript valide dans 'graphableFunction' (ex: "-0.5 * 9.81 * x^2 + 25 * x", ou "sin(2 * x)").
5. Ajoute un éclairage scientifique / quantique ou physique fascinant dans 'quantumInsight' (ex: ordre de grandeur dans l'univers, principe physique sous-jacent, relativité, etc.).
6. Propose 2 ou 3 questions de suivi pertinentes.`;

  // API endpoint: Neural Math Solver
  app.post('/api/ai/solve', async (req, res) => {
    try {
      const { prompt, currentContext } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Prompt requis' });
        return;
      }

      if (!ai) {
        // Fallback if no API key is configured
        res.json({
          query: prompt,
          solution: "Calculatrice en mode autonome. Moteur local quantique actif.",
          numericResult: null,
          formattedResult: "Mode hors-ligne",
          steps: [
            {
              title: "Analyse locale",
              detail: "Le moteur symbolique local prend en charge les calculs directes, graphiques et conversions quantiques."
            }
          ],
          graphableFunction: null,
          physicsContext: "Clé API non détectée; passage en mode calculatrice scientifique locale haute performance.",
          quantumInsight: "Tous les calculs scientifiques standards, matrices, trigonométrie et graphes fonctionnent à 100% en local.",
          suggestedFollowups: [
            "Essayer une fonction dans le traceur graphique",
            "Calculer une dilatation temporelle relativiste",
            "Évaluer une intégrale numérique"
          ]
        });
        return;
      }

      const contextualizedPrompt = currentContext
        ? `Requête utilisateur: "${prompt}".\nContexte actuel de la calculatrice: Expression = "${currentContext.expression || ''}", Dernier résultat = "${currentContext.result || ''}", Mode = "${currentContext.mode || 'standard'}".`
        : `Requête utilisateur: "${prompt}".`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contextualizedPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              query: { type: Type.STRING },
              solution: { type: Type.STRING, description: "Résumé clair et direct de la réponse" },
              numericResult: { type: Type.NUMBER, description: "Valeur numérique pure si applicable, sinon null" },
              formattedResult: { type: Type.STRING, description: "Résultat mis en forme avec unités, ex: '14.28 km/s' ou 'x = 3 ou x = -1'" },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    formula: { type: Type.STRING },
                    detail: { type: Type.STRING }
                  },
                  required: ["title", "detail"]
                }
              },
              graphableFunction: { type: Type.STRING, description: "Fonction mathématique en x traçable, ex: 'sin(x)', '-4.9*x^2 + 20*x', ou vide" },
              physicsContext: { type: Type.STRING, description: "Contexte physique ou mathématique appliqué" },
              quantumInsight: { type: Type.STRING, description: "Perspective scientifique remarquable ou curiosité quantique" },
              suggestedFollowups: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["query", "solution", "formattedResult", "steps"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error('Réponse vide du modèle');
      }

      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: unknown) {
      console.error('Erreur API /api/ai/solve:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur interne';
      res.status(500).json({
        error: errorMessage,
        fallbackMessage: 'Impossible de joindre le coeur neuronal. Veuillez réessayer ou utiliser le mode scientifique.'
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'operational',
      hasAiKey: !!apiKey,
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NovaCalc Quantum running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
