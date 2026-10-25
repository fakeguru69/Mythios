// Notifications and the Day 4 poll (migration 0069): the host turns notifications on, and taps a time in the poll.
// Needs the party on Day 4 or 5, the stand-in (local-server.cjs) and a built site on :3000 (the service worker is only
// in a build: VITE_ONLINE_ONLY=1 vite build, then vite preview --port 3000).
// Run: MYTHIOS_TEST_PASSWORD=local node tests/online/notifications.cjs <run> "<party name>"
const { chromium } = require('./playwright.cjs');
const { enterParty, openPanel } = require('./shell.cjs');
const fs = require('fs');
const S = require('path').join(process.env.TEST_OUT || 'test-output', 'notifications-' + (process.argv[2] || 'run'));
fs.mkdirSync(S, { recursive: true });
const PARTY = process.argv[3];
const log = (...a) => { console.log(...a); fs.appendFileSync(`${S}/log.txt`, a.join(' ') + '\n'); };
let failed = false;
const check = (name, ok) => {
  log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
};
const waitUntil = async (fn, ms = 8000, step = 250) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await fn()) return true;
    await new Promise((r) => setTimeout(r, step));
  }
  return Boolean(await fn());
};

(async () => {
  const b = await chromium.launch({ args: [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] });
  const ctx = await b.newContext({ viewport: { width: 400, height: 860 }, ignoreHTTPSErrors: true });
  await ctx.grantPermissions(['notifications'], { origin: 'http://localhost:3000' });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { log('PAGEERROR', e.message); failed = true; });
  const click = async (name) => { await p.getByRole('button', { name, exact: true }).first().click(); await p.waitForTimeout(800); };
  await p.goto('http://localhost:3000/'); await p.waitForTimeout(1200);
  await p.getByRole('button', { name: 'Already playing? Sign in' }).click(); await p.waitForTimeout(800);
  await p.getByPlaceholder('Email').fill('host@mythios.test'); await p.getByPlaceholder('Password').fill(process.env.MYTHIOS_TEST_PASSWORD);
  await click('SIGN IN'); await p.waitForTimeout(1500);
  log('shelf card:', await p.locator('[data-notifications]').getAttribute('data-notifications').catch(() => 'none'));
  // The party panel holds the notifications button and the Gathering box (the game shell, phase A).
  await enterParty(p, PARTY); await openPanel(p);
  const box = p.locator('[data-notifications]');
  const attr = await box.getAttribute('data-notifications').catch(() => 'none');
  check('notifications card present in party panel', attr !== 'none');
  if (await box.getByRole('button', { name: 'TURN ON NOTIFICATIONS' }).count()) {
    await box.getByRole('button', { name: 'TURN ON NOTIFICATIONS' }).click();
    await waitUntil(async () => (await box.count()) === 0 || (await box.getAttribute('data-notifications').catch(() => '')) !== attr, 6000);
  }
  const poll = p.locator('[data-gathering-poll]');
  check('Gathering time poll shown on Day 4/5', (await poll.count()) > 0);
  if (await poll.count()) {
    await poll.getByRole('button', { name: /7:00pm/ }).click();
    await waitUntil(async () => /TestHost|You/i.test(await poll.innerText()), 6000);
    check('poll records host vote for 7:00pm', /7:00pm/.test(await poll.innerText()));
  }
  await p.screenshot({ path: `${S}/party.png`, fullPage: true });
  await b.close();
  process.exit(failed ? 1 : 0);
})().catch((e) => { log('FAILED', e.message.split('\n')[0]); process.exit(1); });
