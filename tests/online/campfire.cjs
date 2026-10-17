// The Campfire online with two friends: each plays today's chapter, follows a different lead at the last light,
// then sits at the fire. Checks the board (one card per lead, "Nobody went to…"), pin before peek, the catch-up line,
// the bottle, the week line, the riddle (tries counted per friend), and leaving (what we did today, the Pull).
// Usage: node tests/online/campfire.cjs <run> "<party name>"   (host@ then mei@; the day must be unplayed or unfinished)
const { chromium } = require('./playwright.cjs');
const fs = require('fs');
const S = require('path').join(process.env.TEST_OUT || 'test-output', 'campfire-' + (process.argv[2] || 'run'));
fs.mkdirSync(S, { recursive: true });
const PARTY = process.argv[3];
const log = (...a) => { console.log(...a); fs.appendFileSync(`${S}/log.txt`, a.join(' ') + '\n'); };

async function asPlayer(b, who, leadIndex, act) {
  const p = await (await b.newContext({ viewport: { width: 400, height: 860 }, ignoreHTTPSErrors: true })).newPage();
  p.on('pageerror', (e) => log(who, 'PAGEERROR', e.message));
  const body = () => p.locator('body').innerText();
  const click = async (name) => { await p.getByRole('button', { name, exact: true }).first().click(); await p.waitForTimeout(1500); };
  const shot = async (n) => { fs.writeFileSync(`${S}/${who}-${n}.txt`, await body()); await p.screenshot({ path: `${S}/${who}-${n}.png`, fullPage: true }); };
  await p.goto('http://localhost:3000/?online=1'); await p.waitForTimeout(1500);
  await click('START A PARTY'); await click('USE EMAIL AND A PASSWORD');
  await p.getByRole('button', { name: 'Have an account? Sign in' }).click();
  await p.getByPlaceholder('Email').fill(`${who}@mythios.test`); await p.getByPlaceholder('Password').fill(process.env.MYTHIOS_TEST_PASSWORD);
  await click('SIGN IN'); await p.waitForTimeout(2000);
  await p.getByRole('button', { name: new RegExp(PARTY) }).first().click(); await p.waitForTimeout(2500);
  // Today's chapter to its end.
  await click("OPEN TODAY'S CHAPTER"); await p.waitForTimeout(2500);
  let stuck = 0;
  for (let n = 0; n < 150; n++) {
    const t = await body();
    if (/THE LAST LIGHT/.test(t)) break;
    let done = false;
    for (const re of [/^🎲 ROUND \d+$/, /^🎲 ROLL \w+$/]) {
      const bt = p.getByRole('button', { name: re });
      if (await bt.count() && await bt.first().isEnabled()) { await bt.first().click(); done = true; break; }
    }
    if (!done) { const st = p.locator('[data-script-step]:not([disabled])'); if (await st.count()) { await st.first().click(); done = true; } }
    if (!done) { if (++stuck > 8) { log(who, 'STUCK in the chapter'); break; } await p.waitForTimeout(1000); continue; }
    stuck = 0; await p.waitForTimeout(1300);
  }
  await click('🔥 THE LAST LIGHT'); await p.waitForTimeout(1500);
  await shot('1-last-light');
  // The lead's first action button: each lead card holds two; pick lead N's first.
  const leadButtons = p.locator('div.rounded-xl', { hasText: '' }).locator('button.text-left');
  await leadButtons.nth(leadIndex * 2).click();
  await p.getByText('THE BOARD', { exact: true }).waitFor({ timeout: 15000 }); await p.waitForTimeout(800);
  await act(p, body, click, shot);
  return p;
}

(async () => {
  const b = await chromium.launch({ args: [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] });

  await asPlayer(b, 'host', 0, async (p, body, click, shot) => {
    let t = await body();
    log('host fire: opener shown:', /GARRICK/.test(t), '| first here:', /You're first/.test(t), '| your find:', /YOUR FIND/.test(t));
    log('host glimpse:', /On the way back, the last of the light/.test(t), '| seen on the way back:', (t.match(/Seen on the way back by [^\n]*/g) || []).join(' / '));
    log('host board:', (t.match(/Found by [^\n]*/g) || []).join(' / '), '|', (t.match(/Nobody went to [^\n]*/g) || []).length, 'not visited');
    await shot('2-fire');
    // Pin reading A with a line.
    await p.locator('button.text-left').filter({ hasNot: p.locator('div') }).first().click();
    await p.getByPlaceholder('In your own words (optional)').fill('The horse knew the way.');
    await p.getByPlaceholder('In your own words (optional)').locator('xpath=..').getByRole('button', { name: 'PIN', exact: true }).click(); await p.waitForTimeout(2000);
    t = await body();
    log('host after pin: ack shown:', /Pinned|on the board|Written up/.test(t), '| own name under reading:', /\(you\)/.test(t));
    await p.getByPlaceholder('Your theory, in one line').fill(`Someone picked these children long ago (${process.argv[2]}).`);
    await click('SAVE');
    await p.getByPlaceholder('Something you want the others to think about').fill('Who paid for the cart?');
    await p.getByPlaceholder('Something you want the others to think about').locator('xpath=..').getByRole('button', { name: 'PIN', exact: true }).click(); await p.waitForTimeout(1500);
    // Riddle: one wrong try, then give up (the answer shows for the host only; Mei still has her three tries).
    const ans = p.getByPlaceholder('Your answer', { exact: true });
    if (await ans.count()) {
      await ans.fill('a teapot'); await click('TRY');
      log('host riddle after wrong:', ((await body()).match(/\d+ tr(y|ies) left\.[^\n]*/) || [])[0]);
      await click('Give up');
      log('host riddle:', ((await body()).match(/The answer: [^\n]*/) || [])[0]);
    }
    await shot('3-fire-after');
    await click('LEAVE THE FIRE');
    t = await body();
    log('host leaving: closer:', /GARRICK/.test(t), '| what we did:', (t.match(/TestHost [^\n]*\./) || [])[0], '| pull:', ((t.split('A MESSAGE IN A BOTTLE')[0].trim().split('\n').pop()) || '').slice(0, 60));
    await p.getByPlaceholder('One line for the others').fill('Look at the mill lane.'); await click('LEAVE IT');
    await shot('4-leaving');
  });

  await asPlayer(b, 'mei', 1, async (p, body, click, shot) => {
    let t = await body();
    log('mei fire: catch-up:', (t.match(/TestHost thinks [^\n]*/) || [])[0], '| bottle:', /Look at the mill lane/.test(t), '| question:', /Who paid for the cart/.test(t));
    log('mei board:', (t.match(/Found by [^\n]*/g) || []).join(' / '), '|', (t.match(/Nobody went to [^\n]*/g) || []).length, 'not visited');
    log('mei before pin: others hidden:', /Pin your own to see the others/.test(t), '| riddle still open for her:', /3 tries left/.test(t));
    log('mei noticings:', (t.match(/(gave a hand today|favouring that arm|had the Fragment|Good to see you|isn't here yet)[^\n]*/g) || []).join(' / '));
    await shot('2-fire');
    await p.locator('button.text-left').filter({ hasNot: p.locator('div') }).nth(1).click();
    await p.getByPlaceholder('In your own words (optional)').locator('xpath=..').getByRole('button', { name: 'PIN', exact: true }).click(); await p.waitForTimeout(2000);
    t = await body();
    log('mei after pin: sees host:', /TestHost/.test(t) && /The horse knew the way/.test(t), '| two readings line:', /Two readings at the fire/.test(t));
    log('mei case so far: host line shown:', t.includes(`long ago (${process.argv[2]})`));
    await shot('3-fire-after');
  });
  await b.close();
})().catch((e) => { log('FAILED', e.message.split('\n')[0]); process.exit(1); });
