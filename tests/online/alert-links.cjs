// Phase 0.2 (24 Oct): a tapped notification opens the party and the screen it is about (src/online/alertLink.ts,
// pwa/sw.js, supabase/functions/notify/handler.ts), and Garrick's morning line shows before your day is done
// (migration 0113). Local copy of the server (host@, any password), the party on a weekday the host has not finished,
// with chat open (Day 3 or later) and the morning line up. A notification tapped while the game is open is stood in for
// by the message pwa/sw.js posts. Usage: node tests/online/alert-links.cjs [party id]
const { chromium } = require('./playwright.cjs');
const PARTY = process.argv[2] || '22222222-2222-2222-2222-222222222222';
let failed = false;
const check = (n, ok) => { console.log((ok ? 'ok   ' : 'FAIL ') + n); if (!ok) failed = true; };
(async () => {
  const b = await chromium.launch({ args: [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] });
  const p = await (await b.newContext({ viewport: { width: 375, height: 812 } })).newPage();
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto(`http://localhost:3000/?online=1&party=${PARTY}&go=poll`); await p.waitForTimeout(1500);
  check('the address bar is tidied', !/party=/.test(p.url()));
  await p.locator('[data-button-signin]').click(); await p.waitForTimeout(800);
  await p.getByPlaceholder('Email').fill('host@mythios.test'); await p.getByPlaceholder('Password').fill('x');
  await p.getByRole('button', { name: 'SIGN IN', exact: true }).click(); await p.waitForTimeout(4000);
  check('the poll alert opens the party panel', (await p.locator('[data-party-panel]').count()) === 1);
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  check('the panel closes', (await p.locator('[data-party-panel]').count()) === 0);
  const earlier = p.locator('[data-earlier-fire]');
  await p.waitForTimeout(3000);
  const txt = (await earlier.count()) ? await earlier.first().innerText() : '';
  check('before the day is done, Garrick\'s morning line shows', /Morning\./.test(txt));
  const send = (url) => p.evaluate((u) => navigator.serviceWorker.dispatchEvent(new MessageEvent('message', { data: { type: 'open', url: u } })), url);
  await p.locator('[data-shell-tab=record]').click(); await p.waitForTimeout(800);
  await send(`/?online=1&party=${PARTY}&go=fire-click`); await p.waitForTimeout(1200);
  check('a fire alert, game open: back on the story', await p.locator('[data-pane="story"]').isVisible());
  check('a fire alert does not open the panel', (await p.locator('[data-party-panel]').count()) === 0);
  await send(`/?online=1&party=${PARTY}&go=gathering-time`); await p.waitForTimeout(1000);
  check('the Gathering time alert, game open: panel opens', (await p.locator('[data-party-panel]').count()) === 1);
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  await send(`/?online=1&party=99999999-9999-9999-9999-999999999999&go=poll`); await p.waitForTimeout(1000);
  check('an alert for a party you are not in does nothing', (await p.locator('[data-party-panel]').count()) === 0 && (await p.locator('[data-game-shell]').count()) === 1);
  await b.close();
  process.exit(failed ? 1 : 0);
})();
