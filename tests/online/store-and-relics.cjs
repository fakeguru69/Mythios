// The Store and Relics online: the first-time line, buying a Relic and gear, giving a Relic, the Store closed at the
// card, [NOT NOW] opening it, and rolling the card with an Attribute Relic.
// Usage: node tests/online/store-and-relics.cjs <run> "<party name>". Best on a day whose card comes first (Week 1 Day 6).
const { chromium } = require('./playwright.cjs');
const fs = require('fs');
const S = require('path').join(process.env.TEST_OUT || 'test-output', 'store-' + (process.argv[2] || 'run'));
fs.mkdirSync(S, { recursive: true });
const PARTY = process.argv[3];
const log = (...a) => { console.log(...a); fs.appendFileSync(`${S}/log.txt`, a.join(' ') + '\n'); };
(async () => {
  const b = await chromium.launch({ args: [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] });
  const p = await (await b.newContext({ viewport: { width: 400, height: 860 }, ignoreHTTPSErrors: true })).newPage();
  p.on('pageerror', (e) => log('PAGEERROR', e.message));
  const body = () => p.locator('body').innerText();
  const click = async (name) => { await p.getByRole('button', { name, exact: true }).first().click(); await p.waitForTimeout(1500); };
  const shot = async (n) => { fs.writeFileSync(`${S}/${n}.txt`, await body()); await p.screenshot({ path: `${S}/${n}.png`, fullPage: true }); };
  const gold = async () => ((await body()).match(/◎ ([\d,]+)g/) || [])[1];

  await p.goto('http://localhost:3000/?online=1'); await p.waitForTimeout(1500);
  await click('START A PARTY'); await click('USE EMAIL AND A PASSWORD');
  await p.getByRole('button', { name: 'Have an account? Sign in' }).click();
  await p.getByPlaceholder('Email').fill('host@mythios.test'); await p.getByPlaceholder('Password').fill(process.env.MYTHIOS_TEST_PASSWORD);
  await click('SIGN IN'); await p.waitForTimeout(2000);
  await p.getByRole('button', { name: new RegExp(PARTY) }).first().click(); await p.waitForTimeout(2500);

  // The Store from the party page.
  await click('THE STORE'); await p.waitForTimeout(1000);
  let t = await body();
  log('first line shown:', /A Relic is used once/.test(t), '| gold:', await gold(), '| closed:', /The Store is closed/.test(t));
  await shot('1-store');
  const relicTile = p.locator('div.rounded-2xl', { hasText: 'Aim Relic' }).last();
  await relicTile.getByRole('button', { name: 'BUY', exact: true }).click(); await p.waitForTimeout(800);
  log('confirm:', ((await body()).match(/Buy an? [^\n?]*\?/) || [])[0]);
  await click('BUY');
  for (let i = 0; i < 2; i++) {
    await relicTile.getByRole('button', { name: 'BUY', exact: true }).click(); await p.waitForTimeout(600); await click('BUY');
  }
  log('after 3 Aim Relics, gold:', await gold(), '| held:', ((await relicTile.innerText()).match(/You hold \d+/) || [])[0]);
  // Give one to a friend.
  await relicTile.getByRole('button', { name: 'GIVE', exact: true }).click(); await p.waitForTimeout(600);
  await relicTile.getByRole('button', { name: /^To / }).first().click(); await p.waitForTimeout(600);
  log('give confirm:', ((await body()).match(/Give [^\n?]*\?/) || [])[0]);
  await click('GIVE');
  log('after giving, held:', ((await relicTile.innerText()).match(/You hold \d+/) || [])[0]);
  await shot('2-store-after');
  await click('← Back');

  // Today's card: the Store is closed until NOT NOW.
  await click("OPEN TODAY'S CHAPTER"); await p.waitForTimeout(2000);
  for (let n = 0; n < 20; n++) {
    t = await body();
    if (/🎲 ROLL/.test(t)) break;
    const st = p.locator('[data-script-step]:not([disabled])');
    if (await st.count()) { await st.first().click(); await p.waitForTimeout(1300); } else await p.waitForTimeout(800);
  }
  t = await body();
  log('card shows Aim Relic line:', /Aim Relic · you hold \d+/.test(t), '|', (t.match(/With \+4, you succeed on \d+\+/) || [])[0]);
  await shot('3-card');
  await click('NOT NOW'); await p.waitForTimeout(1500);
  log('set aside line:', /Set aside\./.test(await body()));
  await click('THE STORE');
  t = await body();
  log('store open while set aside:', !/The Store is closed/.test(t));
  await click('← Back'); await p.waitForTimeout(1500);

  // Pick Aim, arm the Relic, roll.
  const aimOpt = p.getByRole('button', { name: /^Aim \d+/ });
  if (await aimOpt.count()) { await aimOpt.first().click(); await p.waitForTimeout(400); }
  await p.getByRole('button', { name: 'USE', exact: true }).first().click(); await p.waitForTimeout(400);
  t = await body();
  log('armed:', /ROLL AIM \+ RELIC/.test(t), '| header:', (t.match(/You succeed on \d+\+/) || [])[0]);
  await p.getByRole('button', { name: /ROLL AIM \+ RELIC/ }).click(); await p.waitForTimeout(2500);
  t = await body();
  log('roll line:', (t.match(/🎲 [^\n]*Relic[^\n]*/) || [])[0], '|', (t.match(/(PASSED|FAILED)[^\n]*/) || [])[0]);
  await shot('4-rolled');
  await b.close();
})().catch((e) => { log('FAILED', e.message.split('\n')[0]); process.exit(1); });
