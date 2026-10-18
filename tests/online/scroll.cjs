// Scrolling in the thread (docs/design/handoff-ledger.md, piece 3): a tab keeps its own place; your own message and a
// friend's new line follow to the foot only when you are already there; the "+" tray cannot outgrow a small phone.
// Local copy of the server. The host's day must be finished (run play-today.cjs first), so the fire is open.
// Usage: node tests/online/scroll.cjs "<party name>"
const { chromium } = require('./playwright.cjs');
const { enterParty, openTab } = require('./shell.cjs');
const { execFileSync } = require('child_process');
const PARTY = process.argv[2] || 'Gathering Test';
const P = '22222222-2222-2222-2222-222222222222', MEI = '00000000-0000-0000-0000-0000000000a2';
let failed = false;
const check = (name, ok) => { console.log((ok ? 'ok   ' : 'FAIL ') + name); if (!ok) failed = true; };
const sql = (s) => execFileSync('psql', ['-U', process.env.PGUSER || 'postgres', '-qAtX', '-c', s], { encoding: 'utf8' });
const say = (body) => sql(`set session_replication_role = replica; insert into public.party_messages (party_id, author_id, kind, body) values ('${P}', '${MEI}', 'chat', '${body}');`);
(async () => {
  const b = await chromium.launch({ args: [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] });
  const p = await (await b.newContext({ viewport: { width: 375, height: 700 } })).newPage();
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto('http://localhost:3000/?online=1'); await p.waitForTimeout(1500);
  await p.getByRole('button', { name: 'START A PARTY', exact: true }).click(); await p.waitForTimeout(800);
  await p.getByRole('button', { name: 'USE EMAIL AND A PASSWORD', exact: true }).click(); await p.waitForTimeout(800);
  await p.getByRole('button', { name: 'Have an account? Sign in' }).click();
  await p.getByPlaceholder('Email').fill('host@mythios.test'); await p.getByPlaceholder('Password').fill('x');
  await p.getByRole('button', { name: 'SIGN IN', exact: true }).click(); await p.waitForTimeout(2000);
  await enterParty(p, PARTY); await p.waitForTimeout(2500);
  const hasFire = (await p.locator('[data-thread-fire]').count()) > 0;
  check('the fire is open under the day (play-today.cjs first)', hasFire);
  const metrics = () => p.evaluate(() => ({ y: Math.round(window.scrollY), h: document.documentElement.scrollHeight, vh: window.innerHeight }));
  const atFoot = async () => { const m = await metrics(); return m.y + m.vh >= m.h - 12; };
  let m = await metrics();
  check(`the thread is taller than the screen (${m.h}px)`, m.h > m.vh * 2);
  // 1. A tab keeps its own place.
  await p.evaluate(() => window.scrollTo({ top: 600 })); await p.waitForTimeout(400);
  const y1 = (await metrics()).y;
  await openTab(p, 'bag'); m = await metrics();
  check(`the Bag opens at the top (scroll ${m.y})`, m.y < 40);
  await openTab(p, 'story'); await p.waitForTimeout(1500); m = await metrics();
  check(`coming back to the story finds the same place (${y1} -> ${m.y})`, Math.abs(m.y - y1) < 40);
  // 2. The "+" tray cannot outgrow a small phone.
  await p.locator('[data-plus]').click(); await p.waitForTimeout(500);
  const tray = await p.locator('[data-tray]').evaluate((e) => ({ maxH: getComputedStyle(e).maxHeight, overflow: getComputedStyle(e).overflowY, h: e.getBoundingClientRect().height, vh: window.innerHeight }));
  check(`the tray has a maximum height (${tray.maxH}, ${Math.round(tray.h)}px of ${tray.vh}px)`, tray.maxH !== 'none' && tray.overflow !== 'visible' && tray.h <= tray.vh * 0.45);
  await p.locator('[data-plus]').click(); await p.waitForTimeout(300);
  // 3. Your own message follows you to the foot.
  await p.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight })); await p.waitForTimeout(500);
  await p.getByLabel('Say something at the fire').fill('Scroll test: my own line');
  await p.getByRole('button', { name: 'Send' }).click(); await p.waitForTimeout(2500);
  check('after sending, the new line is in view at the foot', await atFoot());
  check('and the line is there', (await p.locator('body').innerText()).includes('Scroll test: my own line'));
  // 4. A friend's line while you have scrolled up: no jump.
  await p.evaluate(() => window.scrollTo({ top: 200 })); await p.waitForTimeout(500);
  const up = (await metrics()).y;
  say('Mei says hello while you read'); await p.waitForTimeout(17000);
  m = await metrics();
  check(`a friend's line does not move you while you read (${up} -> ${m.y})`, Math.abs(m.y - up) < 40);
  check('and the line arrived', (await p.locator('body').innerText()).includes('Mei says hello while you read'));
  // 5. A friend's line while you are at the foot: the page follows.
  await p.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight })); await p.waitForTimeout(600);
  say('Mei says something at the foot'); await p.waitForTimeout(17000);
  check('a friend\'s line at the foot follows you down', await atFoot() && (await p.locator('body').innerText()).includes('Mei says something at the foot'));
  await b.close();
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.log('FAILED', e.message.split('\n')[0]); process.exit(1); });
