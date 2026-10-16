// Full season play-through in one browser session: every weekday (story, Challenge, [PRESS ON], fight,
// Fan Out lead, the fire), every Gathering, and gear bought in the Store when affordable.
// Saves each screen's text and a screenshot, and logs page errors and gold.
const { chromium } = require('../online/playwright.cjs');
const fs = require('fs');
const S = require('path').join(process.env.TEST_OUT || 'test-output', 'season');
fs.mkdirSync(S, { recursive: true });
const ONLY = process.argv[2] ? process.argv[2].split(',') : null; // e.g. "1-1,1-7"
const log = (...a) => { console.log(...a); fs.appendFileSync(`${S}/log.txt`, a.join(' ') + '\n'); };

(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 430, height: 900 } })).newPage();
  const errors = [];
  p.on('pageerror', (e) => { errors.push(e.message); log('PAGEERROR', e.message); });
  p.on('console', (m) => { if (m.type() === 'error') log('CONSOLE', m.text().slice(0, 200)); });
  await p.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await p.waitForTimeout(700);
  const body = () => p.locator('body').innerText();
  const gold = async () => ((await body()).match(/◎\s*([\d,]+)g/) || [])[1];
  const tab = async (re) => { const t = p.getByRole('button', { name: re }).first(); if (await t.count()) { await t.click(); await p.waitForTimeout(400); } };
  const save = async (name) => {
    fs.writeFileSync(`${S}/${name}.txt`, await body());
    await p.screenshot({ path: `${S}/${name}.png`, fullPage: true });
  };
  const jump = async (week, day) => {
    await tab(/^CHAT/);
    await tab(/^MINE/);
    await p.getByRole('button', { name: /W\d·D\d/ }).first().click(); await p.waitForTimeout(250);
    await p.getByRole('button', { name: `WK ${week}`, exact: true }).click(); await p.waitForTimeout(250);
    if (!(await p.getByRole('button', { name: new RegExp(`D${day}$`) }).count())) { await p.getByRole('button', { name: /W\d·D\d/ }).first().click(); await p.waitForTimeout(250); }
    await p.getByRole('button', { name: new RegExp(`D${day}$`) }).first().click(); await p.waitForTimeout(600);
  };
  const shop = async () => {
    await tab(/^STORE/);
    for (let i = 0; i < 4; i++) {
      const buy = p.getByRole("button", { name: /^UPGRADE · / });
      let bought = false;
      for (let k = 0; k < await buy.count(); k++) {
        const bt = buy.nth(k);
        const txt = await bt.innerText();
        if (/relic/i.test(txt)) continue;
        if (await bt.isEnabled()) { await bt.click(); await p.waitForTimeout(300); bought = true; log('  bought:', txt.replace(/\s+/g, ' ')); break; }
      }
      if (!bought) break;
    }
  };

  const playDay = async (week, day) => {
    await jump(week, day);
    const taps = [];
    let fanOut = false;
    for (let n = 0; n < 120; n++) {
      const t = await body();
      if (/THE LAST LIGHT/.test(t) && !fanOut) {
        const lead = p.locator('[data-fan-out] [data-script-step]');
        if (await lead.count()) { taps.push('LEAD:' + (await lead.first().innerText()).replace(/\s+/g, ' ').slice(0, 40)); await lead.first().click(); await p.waitForTimeout(900); fanOut = true; continue; }
      }
      const step = p.locator('[data-script-step]');
      let clicked = false;
      if (await step.count()) { const s = step.first(); taps.push((await s.innerText()).replace(/\s+/g, ' ').slice(0, 30)); await s.click(); clicked = true; }
      else {
        for (const re of [/^🎲 ROLL /, /^🎲 PRESS ON$/, /^⚔️ FIGHT$/, /^🎲 ROUND \d+$/]) {
          const bt = p.getByRole('button', { name: re });
          if (await bt.count() && await bt.first().isEnabled()) { taps.push((await bt.first().innerText()).replace(/\s+/g, ' ')); await bt.first().click(); clicked = true; break; }
        }
      }
      if (!clicked) break;
      await p.waitForTimeout(450);
    }
    await save(`w${week}d${day}-day`);
    log('  completedDays after day:', await p.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('mythios_dark_moon_save_v2') || '{}').completedDays)));
    log(`W${week}D${day} day: ${taps.length} taps · gold ${await gold()} · fanOut ${fanOut} · ${(await body()).includes('COMPLETE') ? 'complete' : 'NOT COMPLETE'}`);
    // The fire
    const toFire = p.getByRole('button', { name: /fire|campfire/i }).last();
    await tab(/^PARTY/);
    await p.waitForTimeout(600);
    await save(`w${week}d${day}-fire`);
    log('  completedDays after fire:', await p.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('mythios_dark_moon_save_v2') || '{}').completedDays)));
    log(`W${week}D${day} fire saved`);
    await shop();
  };

  const playGathering = async (week) => {
    await jump(week, 7);
    await tab(/^PARTY/);
    const taps = [];
    for (let n = 0; n < 160; n++) {
      const t = await body();
      if (/You earned:/.test(t) && /(summary|You learned:)/i.test(t)) break;
      const inp = p.getByPlaceholder('Your answer, for the table');
      if (await inp.count()) await inp.fill('they are using us');
      let clicked = false;
      for (const re of [/^SAY IT$/, /^🎲 ROUND \d+$/, /^🎲 (ROLL \w+|\w+ ROLLS)$/, /^GO ON$/i]) {
        const bt = p.getByRole('button', { name: re });
        if (await bt.count() && await bt.first().isEnabled()) { taps.push((await bt.first().innerText()).replace(/\s+/g, ' ')); await bt.first().click(); clicked = true; break; }
      }
      if (!clicked) { const st = p.locator('[data-script-step]'); if (await st.count()) { taps.push((await st.first().innerText()).replace(/\s+/g, ' ').slice(0, 30)); await st.first().click(); clicked = true; } }
      if (!clicked) { log(`G${week} STUCK after ${taps.length}`); break; }
      await p.waitForTimeout(380);
    }
    await save(`w${week}d7-gathering`);
    log(`G${week}: ${taps.length} taps · gold ${await gold()}`);
    await shop();
  };

  for (let week = 1; week <= 6; week++) {
    for (let day = 1; day <= 6; day++) {
      if (ONLY && !ONLY.includes(`${week}-${day}`)) continue;
      try { await playDay(week, day); } catch (e) { log(`W${week}D${day} FAILED: ${e.message.split('\n')[0]}`); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(600); }
    }
    if (!ONLY || ONLY.includes(`${week}-7`)) {
      try { await playGathering(week); } catch (e) { log(`G${week} FAILED: ${e.message.split('\n')[0]}`); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(600); }
    }
  }
  await tab(/^RECORD/); await save('record-end');
  await tab(/^BAG/); await save('bag-end');
  log('completedDays:', await p.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('mythios_dark_moon_save_v2') || '{}').completedDays)));
  log('PAGE ERRORS:', errors.length);
  await b.close();
})();
