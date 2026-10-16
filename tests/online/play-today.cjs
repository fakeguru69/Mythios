// Continue: play today's chapter for the host in an existing party (name in argv[3]).
const { chromium } = require('./playwright.cjs');
const fs = require('fs');
const S = require('path').join(process.env.TEST_OUT || 'test-output', 'online5b-' + (process.argv[2] || 'run'));
fs.mkdirSync(S, { recursive: true });
const PARTY = process.argv[3]; const WHO = process.argv[4] || 'host';
const log = (...a) => { console.log(...a); fs.appendFileSync(`${S}/log.txt`, a.join(' ') + '\n'); };
(async () => {
  const b = await chromium.launch({ args: [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] });
  const p = await (await b.newContext({ viewport: { width: 400, height: 860 }, ignoreHTTPSErrors: true })).newPage();
  p.on('pageerror', (e) => log('PAGEERROR', e.message));
  const body = () => p.locator('body').innerText();
  const click = async (name) => { await p.getByRole('button', { name, exact: true }).first().click(); await p.waitForTimeout(1200); };
  await p.goto('http://localhost:3000/?online=1'); await p.waitForTimeout(1500);
  await click('START A PARTY'); await click('USE EMAIL AND A PASSWORD');
  await p.getByRole('button', { name: 'Have an account? Sign in' }).click();
  await p.getByPlaceholder('Email').fill(`${WHO}@mythios.test`); await p.getByPlaceholder('Password').fill(process.env.MYTHIOS_TEST_PASSWORD);
  await click('SIGN IN'); await p.waitForTimeout(2000);
  await p.getByRole('button', { name: new RegExp(PARTY) }).first().click(); await p.waitForTimeout(2500);
  await click("OPEN TODAY'S CHAPTER"); await p.waitForTimeout(2500);
  const taps = []; let stuck = 0;
  for (let n = 0; n < 150; n++) {
    const t = await body();
    if (/BACK TO THE PARTY/.test(t)) break;
    let done = false;
    for (const re of [/^🎲 ROUND \d+$/, /^🎲 ROLL \w+$/]) {
      const bt = p.getByRole('button', { name: re });
      if (await bt.count() && await bt.first().isEnabled()) { taps.push(await bt.first().innerText()); await bt.first().click(); done = true; break; }
    }
    if (!done) { const st = p.locator('[data-script-step]:not([disabled])'); if (await st.count()) { taps.push((await st.first().innerText()).slice(0, 30)); await st.first().click(); done = true; } }
    if (!done) { if (++stuck > 8) { log('STUCK'); break; } await p.waitForTimeout(1000); continue; }
    stuck = 0; await p.waitForTimeout(1300);
  }
  fs.writeFileSync(`${S}/day.txt`, await body()); await p.screenshot({ path: `${S}/day.png`, fullPage: true });
  const t = await body();
  log('taps', taps.length, '| summary:', /You earned:/.test(t), '| gold:', (t.match(/◎ ([\d,]+)g/) || [])[1]);
  log('rolls:', (t.match(/🎲 \d+ \+ \w+ \d+ \(\+\d\) − DC \d+ = [+−]\d+/g) || []).join(' | '));
  log('fight:', (t.match(/(VICTORY[^\n]*|DEFEATED\.)/) || [])[0] ?? 'none');
  log('earned:', (t.match(/You earned: [^\n]*/) || [])[0]);
  if (/BACK TO THE PARTY/.test(t)) { await click('BACK TO THE PARTY'); await p.waitForTimeout(2500); fs.writeFileSync(`${S}/party.txt`, await body()); }
  await b.close();
})().catch((e) => { log('FAILED', e.message.split('\n')[0]); process.exit(1); });
