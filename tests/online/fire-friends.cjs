// A pretend friend for the fire (docs/design/one-thread-18oct.md: "a test party with pretend friends, so one person
// can play a busy fire"). Signed in as another test account in the same party, it sits at tonight's fire, lays its
// pieces, talks a little, agrees with or doubts the others' pieces and makes a call, with small pauses between, so the
// fire feels busy while you play it on your own phone.
//
// If the friend has not finished today's chapter yet, it plays it first in a headless browser (APP_URL).
//
// Usage (local copy):   FRIEND_EMAIL=mei@mythios.test FRIEND_PASSWORD=x node tests/online/fire-friends.cjs "Gathering Test"
// Usage (live project): SUPABASE_URL=https://<project>.supabase.co SUPABASE_ANON_KEY=<publishable key> \
//                       APP_URL=https://mythios.vercel.app FRIEND_EMAIL=mei@mythios.test FRIEND_PASSWORD=… \
//                       node tests/online/fire-friends.cjs "<party name>"
// Env: SUPABASE_URL (default http://localhost:54321), SUPABASE_ANON_KEY (default x), APP_URL (default
// http://localhost:3000), FRIEND_EMAIL, FRIEND_PASSWORD, PAUSE_MS (default 2500), LINES (chat lines, "|" separated),
// WATCH_MIN (default 10: keeps sitting at the fire that long, reacting to every new piece laid by someone else).
const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const KEY = process.env.SUPABASE_ANON_KEY || 'x';
const APP = process.env.APP_URL || 'http://localhost:3000';
const EMAIL = process.env.FRIEND_EMAIL;
const PASSWORD = process.env.FRIEND_PASSWORD;
const PARTY = process.argv[2];
const PAUSE = Number(process.env.PAUSE_MS || 2500);
const LINES = (process.env.LINES || 'I went the other way. Look at what I found.|That fits with what the host laid down.|I am not sure. It could be read both ways.').split('|');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

async function playDayInBrowser() {
  const { chromium } = require('./playwright.cjs');
  const { enterParty, dayDone } = require('./shell.cjs');
  const b = await chromium.launch({ args: process.env.HTTPS_PROXY ? [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] : [] });
  const p = await (await b.newContext({ viewport: { width: 375, height: 812 }, ignoreHTTPSErrors: true })).newPage();
  const click = async (name) => { await p.getByRole('button', { name, exact: true }).first().click(); await p.waitForTimeout(1500); };
  await p.goto(`${APP}/?online=1`); await p.waitForTimeout(1500);
  await p.getByRole('button', { name: 'Already playing? Sign in' }).click(); await p.waitForTimeout(800);
  await p.getByPlaceholder('Email').fill(EMAIL); await p.getByPlaceholder('Password').fill(PASSWORD);
  await click('SIGN IN'); await p.waitForTimeout(2000);
  await enterParty(p, PARTY); await p.waitForTimeout(1500);
  for (let n = 0, stuck = 0; n < 150; n++) {
    if (await dayDone(p)) break;
    let done = false;
    for (const re of [/^🎲 ROUND \d+$/, /^🎲 ROLL \w+$/]) {
      const bt = p.getByRole('button', { name: re });
      if (await bt.count() && await bt.first().isEnabled()) { await bt.first().click(); done = true; break; }
    }
    if (!done) { const st = p.locator('[data-script-step]:not([disabled])'); if (await st.count()) { await st.first().click(); done = true; } }
    if (!done) { if (++stuck > 8) { log('stuck in the chapter'); break; } await p.waitForTimeout(1000); continue; }
    stuck = 0; await p.waitForTimeout(1300);
  }
  await b.close();
}

(async () => {
  if (!EMAIL || !PASSWORD || !PARTY) throw new Error('Set FRIEND_EMAIL, FRIEND_PASSWORD and give the party name.');
  const sb = createClient(URL, KEY, { auth: { persistSession: false } });
  const { data: auth, error: ae } = await sb.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
  if (ae) throw ae;
  const me = auth.user.id;
  const { data: rows, error: pe } = await sb.from('party_members').select('party_id, character_name, parties(name)').eq('user_id', me).eq('status', 'approved');
  if (pe) throw pe;
  const row = (rows || []).find((r) => r.parties && r.parties.name === PARTY);
  if (!row) throw new Error(`${EMAIL} is not in a party called "${PARTY}".`);
  const party = row.party_id;
  log(`${row.character_name} is coming to the fire of "${PARTY}".`);
  const rpc = async (fn, args = {}) => {
    const { data, error } = await sb.rpc(fn, { p_party: party, ...args });
    if (error) throw new Error(`${fn}: ${error.message}`);
    return data;
  };

  let fire;
  try {
    fire = await rpc('campfire');
  } catch (e) {
    if (!/finish your day first/.test(e.message)) throw e;
    log("Today's chapter is not finished: playing it first.");
    await playDayInBrowser();
    fire = await rpc('campfire');
  }
  if (!fire.chosen) {
    // One more look at the last light, at the first lead, with its first way; otherwise straight to the fire.
    const lead = (fire.leads || [])[1] || (fire.leads || [])[0];
    fire = lead ? await rpc('fan_out_roll', { p_lead: lead.id, p_attr: lead.actions[0].attr }) : await rpc('fan_out_fire');
    log(lead ? `Took one more look: ${lead.place}.` : 'Sat straight down by the fire.');
  }
  await wait(PAUSE);
  let table = await rpc('fire_table');
  for (const h of table.hands || []) {
    table = await rpc('fire_lay', { p_kind: h.kind });
    log(`Laid on the table: ${h.title}.`);
    await wait(PAUSE);
  }
  await rpc('post_message', { p_body: LINES[0] });
  log(`Said: ${LINES[0]}`);
  await wait(PAUSE);
  table = await rpc('fire_table');
  let n = 0;
  for (const p of table.pieces || []) {
    if (p.mine) continue;
    const kind = n++ % 2 === 0 ? 'agree' : 'doubt';
    table = await rpc('fire_react', { p_target: p.key, p_kind: kind });
    log(`${kind === 'agree' ? 'Agreed with' : 'Doubted'} ${p.title} (${p.by.map((b) => b.name).join(', ')}).`);
    await wait(PAUSE);
  }
  const reading = Math.random() < 0.5 ? 'A' : 'B';
  await rpc('pin_theory', { p_reading: reading, p_line: '' });
  log(`Made a call: ${reading === 'A' ? fire.forkA : fire.forkB}`);
  await wait(PAUSE);
  for (const line of LINES.slice(1)) {
    await rpc('post_message', { p_body: line });
    log(`Said: ${line}`);
    await wait(PAUSE);
  }
  // Keep sitting at the fire: react to each new piece someone else lays.
  const until = Date.now() + Number(process.env.WATCH_MIN ?? 10) * 60000;
  const seen = new Set((table.pieces || []).map((p) => p.key));
  while (Date.now() < until) {
    await wait(8000);
    table = await rpc('fire_table');
    for (const p of table.pieces || []) {
      if (seen.has(p.key)) continue;
      seen.add(p.key);
      if (p.mine) continue;
      const kind = n++ % 2 === 0 ? 'agree' : 'doubt';
      await wait(PAUSE);
      table = await rpc('fire_react', { p_target: p.key, p_kind: kind });
      log(`${kind === 'agree' ? 'Agreed with' : 'Doubted'} ${p.title} (${p.by.map((b) => b.name).join(', ')}).`);
    }
  }
  log('Done. The friend stays at the fire.');
  process.exit(0);
})().catch((e) => {
  console.error('FAILED', e.message);
  process.exit(1);
});
