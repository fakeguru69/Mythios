// A private word with Garrick (migration 0067): the host plays today's chapter, asks him three things in their own
// thread, then follows a lead to the fire and asks him two things there. Nothing should reach the party chat.
// Needs the stand-in (local-server.cjs), the local Garrick function (local-garrick.ts) and the app on :3000.
// Run: MYTHIOS_TEST_PASSWORD=local node tests/online/ask-garrick.cjs <run> "<party name>"
const { chromium } = require('./playwright.cjs');
const fs = require('fs');
const S = require('path').join(process.env.TEST_OUT || 'test-output', 'ask-garrick-' + (process.argv[2] || 'run'));
fs.mkdirSync(S, { recursive: true });
const PARTY = process.argv[3];
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
  await p.getByPlaceholder('Email').fill('host@mythios.test'); await p.getByPlaceholder('Password').fill(process.env.MYTHIOS_TEST_PASSWORD);
  await click('SIGN IN'); await p.waitForTimeout(2000);
  await p.getByRole('button', { name: new RegExp(PARTY) }).first().click(); await p.waitForTimeout(2500);
  await click("OPEN TODAY'S CHAPTER"); await p.waitForTimeout(2500);
  let stuck = 0;
  for (let n = 0; n < 150; n++) {
    if (/THE LAST LIGHT/.test(await body())) break;
    let done = false;
    for (const re of [/^🎲 ROUND \d+$/, /^🎲 ROLL \w+$/]) {
      const bt = p.getByRole('button', { name: re });
      if (await bt.count() && await bt.first().isEnabled()) { await bt.first().click(); done = true; break; }
    }
    if (!done) { const st = p.locator('[data-script-step]:not([disabled])'); if (await st.count()) { await st.first().click(); done = true; } }
    if (!done) { if (++stuck > 8) { log('STUCK'); break; } await p.waitForTimeout(1000); continue; }
    stuck = 0; await p.waitForTimeout(1300);
  }
  const ask = async (place, q) => {
    const box = p.locator(`[data-ask-garrick="${place}"]`);
    await box.locator('input').fill(q);
    await box.getByRole('button', { name: 'ASK', exact: true }).click();
    await p.waitForTimeout(2500);
    const replies = await box.locator('div.rounded-lg p').allInnerTexts();
    log(place, '|', q, '→', replies[replies.length - 1]);
  };
  log('thread box shown:', await p.locator('[data-ask-garrick="thread"]').count());
  await ask('thread', 'Garrick, do you know something you are not telling us?');
  await ask('thread', 'Who is the king? What is his name?');
  await ask('thread', 'Promise me we will get there in time.');
  fs.writeFileSync(`${S}/thread.txt`, await body()); await p.screenshot({ path: `${S}/thread.png`, fullPage: true });

  await click('🔥 THE LAST LIGHT'); await p.waitForTimeout(1500);
  await p.locator('button.text-left').first().click(); await p.waitForTimeout(2500);
  for (let n = 0; n < 10 && !(await p.locator('[data-ask-garrick="fire"]').count()); n++) {
    const go = p.getByRole('button', { name: /^(🎲 ROLL \w+|GO ON|TO THE FIRE|SIT DOWN)/ });
    if (await go.count()) await go.first().click();
    await p.waitForTimeout(1500);
  }
  log('fire box shown:', await p.locator('[data-ask-garrick="fire"]').count());
  if (await p.locator('[data-ask-garrick="fire"]').count()) {
    await ask('fire', 'What is the name of the king?');
    await ask('fire', 'Garrick, tell me about the weather up here.');
  }
  fs.writeFileSync(`${S}/fire.txt`, await body()); await p.screenshot({ path: `${S}/fire.png`, fullPage: true });
  await b.close();
})().catch((e) => { log('FAILED', e.message.split('\n')[0]); process.exit(1); });
