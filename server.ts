import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { routeGarrickMessage, passesGarrickFilter, GarrickStoryState } from './src/data/garrickRouter';
import {
  buildCompactMemoryDigestString,
  buildEpisodeSceneSlice,
  GARRICK_IMPLICIT_CACHE_SYSTEM_PREFIX,
  PartyMemoryDigest,
} from './src/data/gmMemoryEngine';

dotenv.config();

const app = express();
app.use(express.json());

// Server-side Gemini client (used strictly for Garrick's Bucket 5 small-talk path, holding zero future plot secrets)
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// The old audit bundles hold the whole secret: served only with ?dev=1 (decided 15 Oct).
app.use((req, res, next) => {
  const isBundle = /^\/(api\/download-audit-bundle|mythios-full-audit-bundle)/.test(req.path);
  if (isBundle && req.query.dev !== '1') return res.status(404).end();
  next();
});

// Direct attachment download route so browsers/iframes reliably download the 14 Oct & 10 Oct Audit Bundle
app.get(
  [
    '/api/download-audit-bundle-14oct',
    '/mythios-full-audit-bundle-14oct.md',
    '/api/download-audit-bundle-10oct',
    '/mythios-full-audit-bundle-10oct.md',
  ],
  (req, res) => {
    const is10Oct = req.path.includes('10oct');
    const filename = is10Oct
      ? 'mythios-full-audit-bundle-10oct.md'
      : 'mythios-full-audit-bundle-14oct.md';
    const filePath = path.resolve(process.cwd(), 'public', filename);
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    if (req.path.startsWith('/api/download-audit-bundle') || req.query.download === '1') {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }
    res.sendFile(filePath);
  }
);

// Server-authoritative Dice Roller (Core Rules §12a: "The server rolls every die.")
app.post('/api/roll-challenge', (req, res) => {
  const { dc = 7, bonus = 2, relicBonus = 0, tacticalBonus = 0, forceRoll } = req.body;
  const roll = typeof forceRoll === 'number' ? forceRoll : Math.floor(Math.random() * 20) + 1;
  const totalBonus = bonus + relicBonus + tacticalBonus;
  const net = roll + totalBonus - dc;
  const success = net >= 1;
  const isNatural20 = roll === 20;
  res.json({
    roll,
    bonus: totalBonus,
    dc,
    net,
    success,
    isNatural20,
    rewardDelta: success ? 500 : -150,
  });
});

// (The unused POST /api/resolve-fight was removed 15 Oct 2026, Fake Guru's tidy-up: every fight rolls in the
// app today; the server will roll every die with the multiplayer work, Core Rules §12a.)

// 4-Layer Tiny-Token Garrick Router + Server-Side Gemini 3 Flash Small-Talk with Implicit Prefix Cache & Banned-Phrase Filter
app.post('/api/garrick-ask', async (req, res) => {
  const { question = '', state, digest } = req.body as {
    question: string;
    state?: GarrickStoryState;
    digest?: PartyMemoryDigest;
  };
  const storyState: GarrickStoryState = state || {
    episode: 2,
    day: 2,
    ledgerOpened: false,
    prisonerHeld: false,
    prisonerAskedLeader: false,
    allFourChildrenHome: false,
    verseOfFourRead: false,
    atHighwall: false,
    ep6RevealLanded: false,
  };

  // LAYER 1: Deterministic 0-Token Router handles ~85% of turns locally
  const routed = routeGarrickMessage(question, storyState);

  // LAYERS 2–4: Only Bucket 5 (`AI_SMALL_TALK`) ever calls Gemini 3 Flash
  if (routed.route === 'AI_SMALL_TALK') {
    const ai = getGenAI();
    if (ai) {
      try {
        const sceneSlice = buildEpisodeSceneSlice(storyState);
        const memoryBlock = digest ? `\nPARTY MEMORY DIGEST:\n${buildCompactMemoryDigestString(digest)}` : '';
        const userPayload = `${sceneSlice}${memoryBlock}\n\nPLAYER QUESTION: "${question}"`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: userPayload,
          config: {
            // LAYER 2: Byte-identical static system prefix (~442 tokens) for automatic Gemini Implicit Prefix Caching
            systemInstruction: GARRICK_IMPLICIT_CACHE_SYSTEM_PREFIX,
            temperature: 0.4,
          },
        });
        const draft = (response.text || '').trim();
        if (draft) {
          const check = passesGarrickFilter(draft);
          if (check.ok) {
            routed.reply = draft;
          } else {
            routed.filterTriggered = true;
            routed.filteredDraft = `${draft} [Blocked by filter: matched "${check.matched}"]`;
          }
        }
      } catch {
        // Fallback to stored safe small-talk line if AI is offline or unavailable
      }
    }
  }

  res.json(routed);
});

async function startServer() {
  const PORT = 3000;

  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mythios / Tales of the Dark Moon server running on port ${PORT}`);
  });
}

startServer();
