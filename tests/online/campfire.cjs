// The Campfire online (version 3) with two friends: each plays today's chapter, follows a different lead at the last
// light, then sits at the fire. Checks the table (pieces with names, "Nobody went to…", laying a piece from your
// hands), agree and doubt, the fire's thread (saying something, "pinned a reading", "changed sides", a click when the
// night's data has one), pin before peek, the riddle (tries counted per friend), and resting for the night (what we
// did today, the Pull).
// Usage: node tests/online/campfire.cjs <run> "<party name>"   (host@ then mei@; the day must be unplayed or unfinished)
const { chromium } = require('./playwright.cjs');
const { enterParty, openTab, openPanel, dayDone } = require('./shell.cjs');
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
  await enterParty(p, PARTY);
  // Today's chapter to its end (the STORY tab opens on it).
  await p.waitForTimeout(1500);
  let stuck = 0;
  for (let n = 0; n < 150; n++) {
    const t = await body();
    if (await dayDone(p)) break;
    let done = false;
    for (const re of [/^🎲 ROUND \d+$/, /^🎲 ROLL \w+$/]) {
      const bt = p.getByRole('button', { name: re });
      if (await bt.count() && await bt.first().isEnabled()) { await bt.first().click(); done = true; break; }
    }
    if (!done) { const st = p.locator('[data-script-step]:not([disabled])'); if (await st.count()) { await st.first().click(); done = true; } }
    if (!done) { if (++stuck > 8) { log(who, 'STUCK in the chapter'); break; } await p.waitForTimeout(1000); continue; }
    stuck = 0; await p.waitForTimeout(1300);
  }
  await p.waitForTimeout(2000); // the fire (the last light first) follows the day in the same thread
  await shot('1-last-light');
  // The lead's first action button: each lead card holds two; pick lead N's first.
  const leadButtons = p.locator('[data-thread-fire] div.rounded-xl', { hasText: '' }).locator('button.text-left');
  await leadButtons.nth(leadIndex * 2).click();
  await p.getByText('AROUND THE FIRE', { exact: true }).waitFor({ timeout: 15000 }); await p.waitForTimeout(800);
  await act(p, body, click, shot);
  return p;
}

(async () => {
  const b = await chromium.launch({ args: [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] });

  const pinA = async (p, line) => {
    await p.getByRole('tab', { name: 'The question' }).click(); await p.waitForTimeout(500);
    await p.locator('[data-tab=question] button.text-left').nth(line === null ? 1 : 0).click();
    if (line) await p.getByPlaceholder('In your own words, if you like').fill(line);
    await p.locator('[data-tab=question]').getByRole('button', { name: 'PIN', exact: true }).click(); await p.waitForTimeout(2000);
  };

  await asPlayer(b, 'host', 0, async (p, body, click, shot) => {
    let t = await body();
    log('host fire: opener shown:', /GARRICK/.test(t), '| first here:', /You're first/.test(t), '| your find:', /Your find ·/.test(t));
    log('host table: pieces', await p.locator('[data-piece]').count(), '|', (t.match(/Nobody went to [^\n]*/g) || []).length, 'not visited',
        '| in your hands:', await p.locator('[data-hands] button').count(), '| card:', ((t.match(/GARRICK, TO YOU\n([^\n]*)/) || [])[1] || ''));
    await shot('2-fire');
    // Lay everything in your hands.
    for (let i = 0; i < 3 && await p.locator('[data-hands] button').count(); i++) { await p.locator('[data-hands] button').first().click(); await p.waitForTimeout(1500); }
    t = await body();
    log('host after laying: pieces', await p.locator('[data-piece]').count(), '| laid lines:', (t.match(/You laid a piece down: [^\n]*/g) || []).length);
    await p.getByPlaceholder('Say something at the fire').fill('A paper in his fist. That is a list.'); await click('SAY');
    await pinA(p, 'The horse knew the way.');
    t = await body();
    log('host after pin: own reading shown:', /TestHost \(you\):/.test(t), '| thread:', /pinned a reading/.test(t));
    await p.getByRole('tab', { name: 'More' }).click(); await p.waitForTimeout(500);
    await p.getByPlaceholder('Your theory, in one line').fill(`Someone picked these children long ago (${process.argv[2]}).`);
    await click('SAVE');
    const ans = p.getByPlaceholder('Your answer', { exact: true });
    if (await ans.count()) {
      await ans.fill('a teapot'); await click('TRY');
      log('host riddle after wrong:', ((await body()).match(/\d+ tr(y|ies) left\.[^\n]*/) || [])[0]);
      await click('Give up');
      log('host riddle:', ((await body()).match(/The answer: [^\n]*/) || [])[0]);
    }
    await shot('3-fire-after');
  });

  await asPlayer(b, 'mei', 1, async (p, body, click, shot) => {
    let t = await body();
    log('mei table: pieces', await p.locator('[data-piece]').count(), '| host pieces:', (t.match(/TestHost/g) || []).length > 0, '| click:', await p.locator('[data-click]').count());
    log('mei thread: host said:', /That is a list/.test(t), '| host pinned:', /TestHost pinned a reading/.test(t));
    // Agree with the host's find, doubt it, take it back.
    const hostPiece = p.locator('[data-piece^="lead:"]').filter({ hasText: 'TestHost' }).first();
    await hostPiece.getByRole('button', { name: 'Agree' }).click(); await p.waitForTimeout(1500);
    log('mei agreed:', /Agreed: Mei/.test(await hostPiece.innerText()));
    await hostPiece.getByRole('button', { name: 'Doubt' }).click(); await p.waitForTimeout(1500);
    log('mei doubted instead:', /Doubted: Mei/.test(await hostPiece.innerText()) && !/Agreed: Mei/.test(await hostPiece.innerText()));
    await p.getByRole('tab', { name: 'The question' }).click(); await p.waitForTimeout(500);
    t = await body();
    log('mei before pin: hidden:', /TestHost has pinned\. Pin yours to see it\./.test(t), '| host line hidden:', !/The horse knew the way/.test(t));
    await shot('2-fire');
    await pinA(p, null);
    t = await body();
    log('mei after pin: sees host:', /TestHost:/.test(t) && /The horse knew the way/.test(t));
    await p.locator('[data-reading="TestHost"]').getByRole('button', { name: 'Doubt' }).click(); await p.waitForTimeout(1500);
    log('mei doubted the reading:', /Doubted: Mei/.test(await p.locator('[data-reading="TestHost"]').innerText()), '| card:', ((await body()).match(/GARRICK, TO YOU\n([^\n]*)/) || [])[1]);
    // Change sides: the thread says so, never to which side.
    await pinA(p, '');
    t = await body();
    log('mei changed sides:', /Mei changed sides|You changed sides/.test(t));
    await shot('3-fire-after');
    // The notebook: tap Garrick's opener, mark it with a note.
    await p.locator('[data-thread-fire] [data-markable]').filter({ hasText: 'GARRICK' }).first().click(); await p.waitForTimeout(500);
    await p.locator('[data-mark-bar]').getByPlaceholder('A few words, if you like').fill('Why ask for the birth night?');
    await p.locator('[data-mark-bar]').getByRole('button', { name: 'MARK', exact: true }).click(); await p.waitForTimeout(1500);
    log('mei marked a line:', /In your margin notes: Why ask for the birth night\?/.test(await body()));
    await click('REST FOR THE NIGHT');
    t = await body();
    log('mei resting: closer:', /GARRICK/.test(t), '| what we did:', (t.match(/Mei [^\n]*\./) || [])[0], '| back later:', /come back to the fire until dawn/.test(t));
    await shot('4-resting');
    await openTab(p, 'bag');
    await p.getByRole('tab', { name: 'The Journal' }).click(); await p.waitForTimeout(1500);
    t = await body();
    log('casebook: tonight shown:', /Day \d+ · /.test(t), '| pieces:', /ON THE TABLE/.test(t));
    await p.getByRole('tab', { name: 'Your margin notes' }).click(); await p.waitForTimeout(1500);
    t = await body();
    log('notebook: the marked line and note:', /Why ask for the birth night\?/.test(t), '| source:', /Garrick, at the fire/.test(t));
    await shot('5-notebook');
  });
  await b.close();
})().catch((e) => { log('FAILED', e.message.split('\n').slice(0, 3).join(' | ')); process.exit(1); });
