// Garrick in the party chat (Core Rules §1, §12a; garrick-stored-lines.md). A friend's message that names him comes here:
// it is posted as theirs (the chat's normal rules apply), then the router answers it from the stored lines and the
// Deception Table rows for where the party is; only small talk about the road, the food and the weather may go to the
// AI, behind the banned-phrase filter, at most 12 a day for a party. The router's hidden meanings never leave here.
// Plain fetch only, so the same code runs on Supabase (index.ts) and in the local test (tests/online/local-garrick.ts).
import { routeGarrickMessage, passesGarrickFilter, primeGarrickRotation, type GarrickStoryState } from './garrickRouter.ts';
import { GARRICK_IMPLICIT_CACHE_SYSTEM_PREFIX } from './garrickPrompt.ts';

export interface GarrickEnv {
  url: string; // the project's address
  anonKey: string;
  serviceKey: string;
  geminiKey?: string;
  geminiModel?: string;
}

const AI_PER_DAY = 12;
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

async function rpc(env: GarrickEnv, fn: string, args: Record<string, unknown>, auth: string, key: string) {
  const res = await fetch(`${env.url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw Object.assign(new Error((data && data.message) || `rpc ${fn} failed`), { status: res.status });
  return data;
}

// Who is asking: the signed-in friend behind the request.
async function whoAsks(env: GarrickEnv, auth: string): Promise<string | null> {
  const res = await fetch(`${env.url}/auth/v1/user`, { headers: { apikey: env.anonKey, Authorization: auth } });
  if (!res.ok) return null;
  const u = await res.json();
  return u?.id ?? null;
}

async function smallTalk(env: GarrickEnv, question: string, ctx: Record<string, any>): Promise<string | null> { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!env.geminiKey) return null;
  const s = ctx.state as GarrickStoryState;
  const scene = [
    `CURRENT SCENE SLICE (Week ${s.episode}, Day ${s.day}):`,
    `- Dramatic Question: ${ctx.scene?.question ?? ''}`,
    `- Scene Summary: ${ctx.scene?.learned ?? ''}`,
    `- Story Flags: ledgerOpened=${s.ledgerOpened}, prisonerHeld=${s.prisonerHeld}, allFourChildrenHome=${s.allFourChildrenHome}, atHighwall=${s.atHighwall}, ep6RevealLanded=${s.ep6RevealLanded}`,
  ].join('\n');
  const memory = JSON.stringify({ party: ctx.party, lastTurns: ctx.recent }, null, 2);
  const payload = `${scene}\nPARTY MEMORY DIGEST:\n${memory}\n\nPLAYER QUESTION: "${question}"`;
  const model = env.geminiModel || 'gemini-3-flash-preview';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: GARRICK_IMPLICIT_CACHE_SYSTEM_PREFIX }] },
      contents: [{ role: 'user', parts: [{ text: payload }] }],
      // Room for the model's own thinking, which counts against the limit (a cap of 120 cut replies to a few words,
      // 18 Oct); the prompt keeps the reply itself under 35 words.
      generationConfig: { temperature: 0.4, maxOutputTokens: 1024, thinkingConfig: { thinkingLevel: 'low' } },
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  // A reply cut short is never sent: the stored line goes instead.
  if (data?.candidates?.[0]?.finishReason !== 'STOP') return null;
  const text = (data?.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? '').join('').trim();
  return text || null;
}

// A private question (migration 0067): in your own thread (Core Rules §1), or at the fire (Campfire table §E: stored
// lines only, and never "Malakor"). Nothing goes to the party chat; only the asker sees the answer.
async function privateQuestion(env: GarrickEnv, auth: string, asker: string, party: string, text: string, place: 'thread' | 'fire') {
  let when: { o_week: number; o_day: number }[];
  try {
    when = await rpc(env, 'garrick_private_open', { p_party: party, p_place: place }, auth, env.anonKey);
  } catch (e) {
    return json((e as { status?: number }).status || 400, { message: (e as Error).message });
  }
  const service = `Bearer ${env.serviceKey}`;
  const ctx = await rpc(env, 'garrick_state', { p_party: party }, service, env.serviceKey);
  primeGarrickRotation(ctx.history || {});
  const state = { ...(ctx.state as GarrickStoryState), atCampfire: place === 'fire' };
  const routed = routeGarrickMessage(text, state);
  let reply = routed.reply.replace(/^[“"]|[”"]$/g, '');
  let ai = false;
  let filtered: string | null = null;
  if (place === 'thread' && routed.route === 'AI_SMALL_TALK' && (ctx.aiToday ?? 0) < AI_PER_DAY) {
    try {
      const draft = await smallTalk(env, text, ctx);
      if (draft) {
        const check = passesGarrickFilter(draft);
        if (check.ok) {
          reply = draft;
          ai = true;
        } else filtered = `${draft} [blocked: ${check.matched}]`;
      }
    } catch {
      // The stored line goes instead.
    }
  }
  await rpc(
    env,
    'garrick_private_post',
    {
      p_party: party, p_user: asker, p_place: place, p_week: when[0]?.o_week, p_day: when[0]?.o_day, p_question: text,
      p_reply: reply, p_route: routed.route, p_category: routed.category, p_flags: routed.flagsUsed, p_ai: ai, p_filtered: filtered,
    },
    service,
    env.serviceKey
  );
  // Only the words he says come back: never the route's hidden meaning.
  return json(200, { reply });
}

export async function handleGarrick(req: Request, env: GarrickEnv): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json(405, { message: 'not allowed' });
  const auth = req.headers.get('Authorization') || '';
  let body: { party?: string; text?: string; place?: string; atFire?: boolean };
  try {
    body = await req.json();
  } catch {
    return json(400, { message: 'bad request' });
  }
  const party = String(body.party || '');
  const text = String(body.text || '').trim();
  if (!party || !text) return json(400, { message: 'bad request' });
  const asker = await whoAsks(env, auth);
  if (!asker) return json(401, { message: 'not signed in' });
  if (body.place === 'thread' || body.place === 'fire') return privateQuestion(env, auth, asker, party, text.slice(0, 300), body.place);

  // The friend's own message first, as them: post_message checks the party, that the chat is open, and the length.
  let questionId: number;
  try {
    questionId = await rpc(env, 'post_message', { p_party: party, p_body: text }, auth, env.anonKey);
  } catch (e) {
    return json((e as { status?: number }).status || 400, { message: (e as Error).message });
  }
  // He replies only when spoken to (Core Rules §1).
  if (!/\bgarrick\b/i.test(text)) return json(200, { posted: questionId });

  const service = `Bearer ${env.serviceKey}`;
  const ctx = await rpc(env, 'garrick_state', { p_party: party }, service, env.serviceKey);
  primeGarrickRotation(ctx.history || {});
  // The fire is the party chat (phase B, 18 Oct): named there, he answers from his stored lines only and never says
  // "Malakor" (Campfire table §E: no AI free text at the fire).
  const atFire = body.atFire === true;
  const routed = routeGarrickMessage(text, { ...(ctx.state as GarrickStoryState), atCampfire: atFire || (ctx.state as GarrickStoryState).atCampfire });
  let reply = routed.reply.replace(/^[“"]|[”"]$/g, '');
  let ai = false;
  let filtered: string | null = null;
  if (!atFire && routed.route === 'AI_SMALL_TALK' && (ctx.aiToday ?? 0) < AI_PER_DAY) {
    try {
      const draft = await smallTalk(env, text, ctx);
      if (draft) {
        const check = passesGarrickFilter(draft);
        if (check.ok) {
          reply = draft;
          ai = true;
        } else filtered = `${draft} [blocked: ${check.matched}]`;
      }
    } catch {
      // The story never waits on the AI (§12a): the stored line goes instead.
    }
  }
  const replyId = await rpc(
    env,
    'garrick_post',
    {
      p_party: party, p_asked_by: asker, p_question_id: questionId, p_body: reply, p_route: routed.route,
      p_category: routed.category, p_flags: routed.flagsUsed, p_ai: ai, p_filtered: filtered,
    },
    service,
    env.serviceKey
  );
  // Only what everyone in the chat sees comes back: never the route's hidden meaning.
  return json(200, { posted: questionId, reply: replyId });
}
