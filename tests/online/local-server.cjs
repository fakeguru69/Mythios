// A stand-in for the Supabase server, for browser tests against a local Postgres that holds every migration in
// supabase/migrations/ (no test password needed, and nothing touches the real server). It answers only what the online
// screens use: password sign-in (any password), the server functions (rpc), and simple table reads and name updates.
// The live chat updates (websocket) are not served; the chat still loads on each visit.
// Run: PGHOST=/var/tmp/pgm PGPORT=5544 PGDATABASE=m node tests/online/local-server.cjs   (listens on 54321)
// Then: VITE_SUPABASE_URL=http://localhost:54321 npm run dev
const http = require('http');
const { spawnSync } = require('child_process');

const PORT = Number(process.env.LOCAL_SUPABASE_PORT || 54321);
const PSQL = ['-U', process.env.PGUSER || 'postgres', '-qAtX', '-v', 'ON_ERROR_STOP=1'];

function sql(query, uid) {
  const r = spawnSync('psql', [...PSQL, '-c', (uid ? `set request.uid = '${uid}';\n` : '') + query], { encoding: 'utf8' });
  if (r.status !== 0) {
    const m = /ERROR:\s+(.*)/.exec(r.stderr || '');
    const err = new Error(m ? m[1] : r.stderr);
    err.pg = true;
    throw err;
  }
  return r.stdout.trim();
}
const lit = (v) => {
  const tag = '$q' + Math.random().toString(36).slice(2, 8) + '$';
  return `${tag}${v}${tag}`;
};

// Tokens are unsigned: "local.<user id>". Nothing outside this machine accepts them.
const tokenFor = (id) => `local.${id}`;
const userOf = (req) => {
  const m = /Bearer local\.([0-9a-f-]{36})/.exec(req.headers.authorization || '');
  return m ? m[1] : null;
};
const userJson = (id) => {
  const row = sql(`select json_build_object('id', id, 'email', email) from auth.users where id = '${id}'`);
  const u = row ? JSON.parse(row) : { id };
  return { ...u, aud: 'authenticated', role: 'authenticated', app_metadata: { provider: 'email' }, user_metadata: {}, created_at: new Date().toISOString() };
};
const session = (id) => ({
  access_token: tokenFor(id), token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: `r.${id}`, user: userJson(id),
});

const fnCache = {};
function fnInfo(name) {
  if (!fnCache[name]) {
    const row = sql(`select json_build_object('args', coalesce(to_json(p.proargnames), '[]'), 'types', (select json_agg(format_type(t, null) order by o)
      from unnest(p.proargtypes) with ordinality a(t, o)), 'set', p.proretset or p.prorettype = 'record'::regtype,
      'void', p.prorettype = 'void'::regtype) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = '${name.replace(/[^a-z0-9_]/g, '')}' limit 1`);
    if (!row) throw Object.assign(new Error(`function ${name} not found`), { pg: true });
    fnCache[name] = JSON.parse(row);
  }
  return fnCache[name];
}
function rpc(name, body, uid) {
  const f = fnInfo(name);
  const args = [];
  (f.args || []).forEach((a, i) => {
    if (!(a in body)) return;
    const v = body[a];
    const type = (f.types || [])[i] || 'text';
    args.push(`${a} => ${v === null ? 'null' : lit(typeof v === 'object' ? JSON.stringify(v) : String(v))}::${type}`);
  });
  const call = `public.${name}(${args.join(', ')})`;
  if (f.set) return sql(`select coalesce(json_agg(t), '[]') from ${call} t`, uid);
  if (f.void) { sql(`select ${call}`, uid); return 'null'; }
  return sql(`select coalesce(to_json(${call}), 'null')`, uid) || 'null';
}

// Table reads: ?select=a,b,rel(c,d)&col=eq.v&col=in.(a,b)&order=col.asc&limit=n
const EMBED = { parties: 'party_id' };
function tableGet(table, params, single) {
  const cols = [];
  const sel = params.get('select') || '*';
  for (const part of sel.match(/[a-z0-9_]+\([^)]*\)|[a-z0-9_*]+/g) || []) {
    const m = /^([a-z0-9_]+)\(([^)]*)\)$/.exec(part);
    if (m) {
      const fk = EMBED[m[1]];
      cols.push(`(select json_build_object(${m[2].split(',').map((c) => `'${c}', r.${c}`).join(', ')}) from public.${m[1]} r where r.id = t.${fk}) as ${m[1]}`);
    } else cols.push(part === '*' ? 't.*' : `t.${part}`);
  }
  const where = [];
  let order = '';
  let limit = '';
  for (const [k, v] of params.entries()) {
    if (k === 'select') continue;
    if (k === 'order') { order = ' order by ' + v.split(',').map((o) => { const [c, d] = o.split('.'); return `t.${c} ${d === 'desc' ? 'desc' : 'asc'}`; }).join(', '); continue; }
    if (k === 'limit') { limit = ` limit ${Number(v)}`; continue; }
    const eq = /^eq\.(.*)$/.exec(v);
    const inn = /^in\.\((.*)\)$/.exec(v);
    if (eq) where.push(`t.${k}::text = ${lit(eq[1])}`);
    else if (inn) where.push(`t.${k}::text in (${inn[1].split(',').map((x) => lit(x.replace(/^"|"$/g, ''))).join(', ')})`);
  }
  const q = `select coalesce(json_agg(x), '[]') from (select ${cols.join(', ')} from public.${table} t${where.length ? ' where ' + where.join(' and ') : ''}${order}${limit}) x`;
  const rows = JSON.parse(sql(q));
  return JSON.stringify(single ? rows[0] ?? null : rows);
}
function tablePatch(table, params, body) {
  const sets = Object.entries(body).map(([k, v]) => `${k.replace(/[^a-z_]/g, '')} = ${v === null ? 'null' : lit(String(v))}`);
  const where = [...params.entries()].filter(([k]) => k !== 'select').map(([k, v]) => `${k} = ${lit(v.replace(/^eq\./, ''))}`);
  sql(`update public.${table} set ${sets.join(', ')} where ${where.join(' and ')}`);
  return '[]';
}

http
  .createServer((req, res) => {
    const headers = {
      'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      'Content-Type': 'application/json',
    };
    if (req.method === 'OPTIONS') { res.writeHead(204, headers); return res.end(); }
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      const url = new URL(req.url, 'http://x');
      const body = raw ? JSON.parse(raw) : {};
      const send = (code, text) => { res.writeHead(code, headers); res.end(text); };
      // Server functions (Edge Functions) run separately: tests/online/local-garrick.ts.
      if (url.pathname.startsWith('/functions/v1/')) {
        const fwd = http.request({ host: 'localhost', port: Number(process.env.LOCAL_FUNCTIONS_PORT || 54322), path: url.pathname.replace('/functions/v1', ''),
          method: req.method, headers: req.headers }, (r) => { res.writeHead(r.statusCode, { ...headers, ...r.headers }); r.pipe(res); });
        fwd.on('error', (e) => send(502, JSON.stringify({ message: e.message })));
        fwd.end(raw);
        return;
      }
      try {
        if (url.pathname === '/auth/v1/settings') return send(200, JSON.stringify({ external: { email: true, google: false } }));
        if (url.pathname === '/auth/v1/token') {
          const id = url.searchParams.get('grant_type') === 'refresh_token'
            ? String(body.refresh_token || '').replace(/^r\./, '')
            : sql(`select id from auth.users where email = ${lit(body.email || '')}`);
          if (!id) return send(400, JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid login credentials', msg: 'Invalid login credentials' }));
          return send(200, JSON.stringify(session(id)));
        }
        if (url.pathname === '/auth/v1/user') {
          const id = userOf(req);
          return id ? send(200, JSON.stringify(userJson(id))) : send(401, JSON.stringify({ msg: 'no user' }));
        }
        if (url.pathname === '/auth/v1/logout') return send(204, '');
        const rpcM = /^\/rest\/v1\/rpc\/([a-z0-9_]+)$/.exec(url.pathname);
        if (rpcM) return send(200, rpc(rpcM[1], body, userOf(req)));
        const tM = /^\/rest\/v1\/([a-z_]+)$/.exec(url.pathname);
        if (tM && req.method === 'GET') return send(200, tableGet(tM[1], url.searchParams, /vnd\.pgrst\.object/.test(req.headers.accept || '')));
        if (tM && req.method === 'PATCH') return send(200, tablePatch(tM[1], url.searchParams, body));
        return send(404, JSON.stringify({ message: 'not served by the local stand-in' }));
      } catch (e) {
        return send(e.pg ? 400 : 500, JSON.stringify({ message: e.message, code: 'P0001', details: null, hint: null }));
      }
    });
  })
  .listen(PORT, () => console.log(`local Supabase stand-in on ${PORT}`));
