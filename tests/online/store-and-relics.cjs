// The Store and Relics online: the first-time line, buying a Relic and gear, giving a Relic, the Store closed at the
// card, [NOT NOW] opening it, and rolling the card with an Attribute Relic.
// Usage: node tests/online/store-and-relics.cjs <run> "<party name>". Best on a day whose card comes first (Week 1 Day 6).
const { chromium } = require('./playwright.cjs');
const { enterParty, openTab } = require('./shell.cjs');
const fs = require('fs');
const S = require('path').join(process.env.TEST_OUT || 'test-output', 'store-' + (process.argv[2] || 'run'));
fs.mkdirSync(S, { recursive: true });
const PARTY = process.argv[3];
const log = (...a) => { console.log(...a); fs.appendFileSync(`${S}/log.txt`, a.join(' ') + '\n'); };
let failed = false;
const check = (name, ok) => {
  log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
};
const waitUntil = async (fn, ms = 10000, step = 250) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await fn()) return true;
    await new Promise((r) => setTimeout(r, step));
  }
  return Boolean(await fn());
};

(async () => {
  const b = await chromium.launch({ args: [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] });
  const p = await (await b.newContext({ viewport: { width: 400, height: 860 }, ignoreHTTPSErrors: true })).newPage();
  p.on('pageerror', (e) => { log('PAGEERROR', e.message); failed = true; });
  const body = () => p.locator('body').innerText();
  const click = async (name) => { await p.getByRole('button', { name, exact: true }).first().click(); await p.waitForTimeout(800); };
  const shot = async (n) => { fs.writeFileSync(`${S}/${n}.txt`, await body()); await p.screenshot({ path: `${S}/${n}.png`, fullPage: true }); };
  const gold = async () => ((await p.locator('[data-gold]').innerText()).match(/([\d,]+)g/) || [])[1];

  await p.goto('http://localhost:3000/?online=1'); await p.waitForTimeout(1200);
  await p.getByRole('button', { name: 'Already playing? Sign in' }).click(); await p.waitForTimeout(800);
  await p.getByPlaceholder('Email').fill('host@mythios.test'); await p.getByPlaceholder('Password').fill(process.env.MYTHIOS_TEST_PASSWORD);
  await click('SIGN IN'); await p.waitForTimeout(1500);
  await enterParty(p, PARTY);

  // In the game shell the day is open as soon as you enter, so a card that comes first closes the Store at once
  // (Core Rules §3). Reach the card, check the Store says so, set the card aside with NOT NOW, then shop.
  let t;
  for (let n = 0; n < 20; n++) {
    t = await body();
    if (/🎲 ROLL/.test(t)) break;
    const st = p.locator('[data-script-step]:not([disabled])');
    if (await st.count()) { await st.first().click(); await p.waitForTimeout(1000); } else await p.waitForTimeout(500);
  }
  check('reached the Challenge card', /🎲 ROLL/.test(await body()));

  await openTab(p, 'store');
  await waitUntil(async () => /The Store is closed/.test(await body()), 8000);
  check('store closed at the card', /The Store is closed/.test(await body()));

  await openTab(p, 'story');
  await click('NOT NOW');
  await waitUntil(async () => /Set aside\./.test(await body()), 8000);
  check('set aside line shown', /Set aside\./.test(await body()));

  await click('THE STORE'); // the set-aside note's own button takes you to the STORE tab
  await waitUntil(async () => !/The Store is closed/.test(await body()) && /Aim Relic/.test(await body()), 8000);
  t = await body();
  check('first-time Relic line shown', /A Relic is used once/.test(t));
  check('store open while card set aside', !/The Store is closed/.test(t));
  await shot('1-store');

  const relicTile = p.locator('div.rounded-2xl', { hasText: 'Aim Relic' }).last();
  await relicTile.getByRole('button', { name: 'BUY', exact: true }).click();
  await waitUntil(async () => /Buy an? [^\n?]*\?/.test(await body()), 5000);
  check('buy confirmation shown', /Buy an? [^\n?]*\?/.test(await body()));
  await click('BUY');
  for (let i = 0; i < 2; i++) {
    await relicTile.getByRole('button', { name: 'BUY', exact: true }).click();
    await waitUntil(async () => /Buy an? [^\n?]*\?/.test(await body()), 5000);
    await click('BUY');
  }
  await waitUntil(async () => /You hold [3-9]/.test(await relicTile.innerText()), 8000);
  check('after buying 3 Aim Relics, held count updated', /You hold [3-9]/.test(await relicTile.innerText()));
  log('after 3 Aim Relics, gold:', await gold());

  // Give one to a friend.
  await relicTile.getByRole('button', { name: 'GIVE', exact: true }).click();
  await waitUntil(async () => (await relicTile.getByRole('button', { name: /^To / }).count()) > 0, 5000);
  await relicTile.getByRole('button', { name: /^To / }).first().click();
  await waitUntil(async () => /Give [^\n?]*\?/.test(await body()), 5000);
  check('give confirmation shown', /Give [^\n?]*\?/.test(await body()));
  await click('GIVE');
  await waitUntil(async () => !/Give [^\n?]*\?/.test(await body()), 8000);
  check('after giving, held count updated', /You hold \d+/.test(await relicTile.innerText()));
  await shot('2-store-after');

  // Back to the card on the STORY tab: it shows the Relic now held.
  await openTab(p, 'story');
  await waitUntil(async () => /Aim Relic · you hold \d+/.test(await body()), 8000);
  t = await body();
  check('card shows Aim Relic line', /Aim Relic · you hold \d+/.test(t));
  check('card shows With +4 succeed line', /With \+4, you succeed on \d+\+/.test(t));
  await shot('3-card');

  // Pick Aim, arm the Relic, roll.
  const aimOpt = p.getByRole('button', { name: /^Aim \d+/ });
  if (await aimOpt.count()) { await aimOpt.first().click(); await p.waitForTimeout(300); }
  await p.getByRole('button', { name: 'USE', exact: true }).first().click();
  await waitUntil(async () => /ROLL AIM \+ RELIC/.test(await body()), 5000);
  t = await body();
  check('Relic armed on roll button', /ROLL AIM \+ RELIC/.test(t));
  check('card header shows succeed threshold', /You succeed on \d+\+/.test(t));
  await p.getByRole('button', { name: /ROLL AIM \+ RELIC/ }).click();
  await waitUntil(async () => /🎲 [^\n]*Relic[^\n]*/.test(await body()) && /(PASSED|FAILED)/.test(await body()), 8000);
  t = await body();
  check('roll line includes Relic bonus and result', /🎲 [^\n]*Relic[^\n]*/.test(t) && /(PASSED|FAILED)/.test(t));
  await shot('4-rolled');
  await b.close();
  process.exit(failed ? 1 : 0);
})().catch((e) => { log('FAILED', e.message.split('\n')[0]); process.exit(1); });
