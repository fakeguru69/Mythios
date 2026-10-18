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
(async () => {
  const b = await chromium.launch({ args: [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] });
  const ctx = await b.newContext({ viewport: { width: 400, height: 860 }, ignoreHTTPSErrors: true });
  await ctx.grantPermissions(['notifications'], { origin: 'http://localhost:3000' });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => log('PAGEERROR', e.message));
  const click = async (name) => { await p.getByRole('button', { name, exact: true }).first().click(); await p.waitForTimeout(1200); };
  await p.goto('http://localhost:3000/'); await p.waitForTimeout(1500);
  await click('START A PARTY'); await click('USE EMAIL AND A PASSWORD');
  await p.getByRole('button', { name: 'Have an account? Sign in' }).click();
  await p.getByPlaceholder('Email').fill('host@mythios.test'); await p.getByPlaceholder('Password').fill(process.env.MYTHIOS_TEST_PASSWORD);
  await click('SIGN IN'); await p.waitForTimeout(2000);
  log('shelf card:', await p.locator('[data-notifications]').getAttribute('data-notifications').catch(() => 'none'));
  // The party panel holds the notifications button and the Gathering box (the game shell, phase A).
  await enterParty(p, PARTY); await openPanel(p);
  const box = p.locator('[data-notifications]');
  log('party card:', await box.getAttribute('data-notifications').catch(() => 'none'));
  if (await box.getByRole('button', { name: 'TURN ON NOTIFICATIONS' }).count()) {
    await box.getByRole('button', { name: 'TURN ON NOTIFICATIONS' }).click(); await p.waitForTimeout(6000);
    log('after turning on: the button is gone:', (await box.count()) === 0);
  }
  const poll = p.locator('[data-gathering-poll]');
  log('poll shown:', await poll.count());
  if (await poll.count()) {
    await poll.getByRole('button', { name: /7:00pm/ }).click(); await p.waitForTimeout(1500);
    log('poll after tap:', (await poll.innerText()).replace(/\n/g, ' / '));
  }
  await p.screenshot({ path: `${S}/party.png`, fullPage: true });
  await b.close();
})().catch((e) => { log('FAILED', e.message.split('\n')[0]); process.exit(1); });
