// Runs the "garrick" server function locally (the same handler.ts as on Supabase), for browser tests against the local
// stand-in (tests/online/local-server.cjs forwards /functions/v1/garrick here). Without GEMINI_API_KEY Garrick answers
// from his stored lines only. Run: npx tsx tests/online/local-garrick.ts   (listens on 54322)
import http from 'node:http';
import { handleGarrick } from '../../supabase/functions/garrick/handler.ts';

const env = {
  url: process.env.LOCAL_SUPABASE_URL || 'http://localhost:54321',
  anonKey: 'local-anon',
  serviceKey: 'local-service',
  geminiKey: process.env.GEMINI_API_KEY,
};
http
  .createServer(async (req, res) => {
    let raw = '';
    for await (const c of req) raw += c;
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
    const out = await handleGarrick(new Request(`http://local${req.url}`, { method: req.method, headers, body: req.method === 'POST' ? raw : undefined }), env);
    res.writeHead(out.status, Object.fromEntries(out.headers.entries()));
    res.end(await out.text());
  })
  .listen(54322, () => console.log('local garrick function on 54322'));
