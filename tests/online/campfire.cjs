// The fire as one chat (docs/design/one-thread-18oct.md, phase B) with two friends: each plays today's chapter, takes
// one more look at the last light (a different lead each), then sits at the fire, in the same story thread. Checks:
// "The light is going" fork; the divider with who is here; tonight's question pinned (pin before peek, then names;
// changing sides); the stream (Garrick's stored lines, friends' talk, pieces laid as cards with Agree and Doubt, a click
// when the night's data has one, words found); the composer and its "+" tray (lay a clue, your fragment); Garrick named
// at the fire answering from stored lines; the margin notes; the Journal.
// Usage: node tests/online/campfire.cjs <run> "<party name>"   (host@ then mei@; the day must be unplayed)
const { chromium } = require('./playwright.cjs');
const { enterParty, openTab, dayDone } = require('./shell.cjs');
const fs = require('fs');
const S = require('path').join(process.env.TEST_OUT || 'test-output', 'campfire-' + (process.argv[2] || 'run'));
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

async function asPlayer(b, who, leadIndex, act) {
  const p = await (await b.newContext({ viewport: { width: 375, height: 812 }, ignoreHTTPSErrors: true })).newPage();
  p.on('pageerror', (e) => { log(who, 'PAGEERROR', e.message); failed = true; });
  const body = () => p.locator('body').innerText();
  const click = async (name) => { await p.getByRole('button', { name, exact: true }).first().click(); await p.waitForTimeout(800); };
  const shot = async (n, full = true) => { fs.writeFileSync(`${S}/${who}-${n}.txt`, await body()); await p.screenshot({ path: `${S}/${who}-${n}.png`, fullPage: full }); };
  await p.goto('http://localhost:3000/?online=1'); await p.waitForTimeout(1200);
  await p.getByRole('button', { name: 'Already playing? Sign in' }).click(); await p.waitForTimeout(800);
  await p.getByPlaceholder('Email').fill(`${who}@mythios.test`); await p.getByPlaceholder('Password').fill(process.env.MYTHIOS_TEST_PASSWORD);
  await click('SIGN IN'); await p.waitForTimeout(1500);
  await enterParty(p, PARTY);
  await p.waitForTimeout(1200);
  let stuck = 0;
  for (let n = 0; n < 150; n++) {
    if (await dayDone(p)) break;
    let done = false;
    for (const re of [/^🎲 ROUND \d+$/, /^🎲 ROLL \w+$/]) {
      const bt = p.getByRole('button', { name: re });
      if (await bt.count() && await bt.first().isEnabled()) { await bt.first().click(); done = true; break; }
    }
    if (!done) { const st = p.locator('[data-script-step]:not([disabled])'); if (await st.count()) { await st.first().click(); done = true; } }
    if (!done) { if (++stuck > 8) { check(`${who}: chapter did not get stuck`, false); break; } await p.waitForTimeout(1000); continue; }
    stuck = 0; await p.waitForTimeout(1200);
  }
  await p.locator('[data-light-going]').waitFor({ timeout: 15000 });
  await p.locator('[data-light-going]').scrollIntoViewIfNeeded();
  await shot('1-light-going', false);
  check(`${who}: light going has two choices`, (await p.locator('[data-light-going] button').count()) === 2);
  await click('One more look');
  await p.locator('[data-leads] button').nth(leadIndex * 2).click();
  await p.locator('[data-fire]').waitFor({ timeout: 15000 });
  await waitUntil(async () => (await p.locator('[data-question]').count()) > 0, 8000);
  await act(p, body, click, shot);
  return p;
}

(async () => {
  const b = await chromium.launch({ args: [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] });
  // After a pick the pinned strip folds to one line; open it to pick again or to read who said what.
  const openQ = async (p) => { if (await p.locator('[data-question-folded]').count()) { await p.locator('[data-question-folded]').click(); await p.waitForTimeout(300); } };
  const pickReading = async (p, r) => {
    await openQ(p);
    await p.locator(`[data-reading-option=${r}]`).click();
    await waitUntil(async () => (await p.locator('[data-question-folded]').count()) > 0, 8000);
  };

  await asPlayer(b, 'host', 0, async (p, body, click, shot) => {
    let t = await body();
    check('host fire: divider shown', /EVENING · THE FIRE/.test(t));
    check('host fire: my find card shown', (await p.locator('[data-my-find]').count()) > 0);
    check('host fire: Garrick lines shown', (await p.locator('[data-stream] [data-garrick-line]').count()) > 0);
    check('host fire: old tabs gone', !/The table\nThe question/.test(t));
    check('host fire: riddle gone', !/A RIDDLE/.test(t));
    check('host fire: rest button gone', !/REST FOR THE NIGHT/i.test(t));
    check('host question glows before a pick', /shadow/.test((await p.locator('[data-question]').getAttribute('class')) || ''));
    check('host no names before a pick', !/\b(you|TestHost|Mei)\b/i.test(await p.locator('[data-question]').innerText()));
    await p.locator('[data-question]').scrollIntoViewIfNeeded(); await shot('2-fire-top', false);
    // The + tray: lay everything in your hands.
    check('host + glows when holding unlaid pieces', /shadow/.test((await p.locator('[data-plus]').getAttribute('class')) || ''));
    await p.locator('[data-plus]').click();
    await waitUntil(async () => (await p.locator('[data-tray]').count()) > 0, 5000);
    await shot('3-tray', false);
    for (let i = 0; i < 3; i++) {
      if (!(await p.locator('[data-tray]').count())) { await p.locator('[data-plus]').click(); await p.waitForTimeout(400); }
      const lay = p.locator('[data-tray] button', { hasText: 'Lay it on the table' });
      if (!(await lay.count())) break;
      const beforePieces = await p.locator('[data-piece]').count();
      await lay.first().click();
      await waitUntil(async () => (await p.locator('[data-piece]').count()) > beforePieces, 8000);
    }
    if (await p.locator('[data-tray]').count()) { await p.locator('[data-plus]').click(); await p.waitForTimeout(300); }
    check('host after laying: pieces on the table', (await p.locator('[data-piece]').count()) > 0);
    await p.getByPlaceholder('Say something at the fire').fill('A paper in his fist. That is a list.');
    await p.getByRole('button', { name: 'Send' }).click();
    await waitUntil(async () => (await p.locator('[data-chat=mine]', { hasText: 'That is a list' }).count()) === 1, 8000);
    check('host said it (mine, right)', (await p.locator('[data-chat=mine]', { hasText: 'That is a list' }).count()) === 1);
    await pickReading(p, 'A');
    check('host after pick: strip folded', (await p.locator('[data-question-folded]').count()) === 1);
    await openQ(p);
    t = await p.locator('[data-question]').innerText();
    check('host after pick: own name under A', /\byou\b/i.test(t));
    check('host after pick: stream shows pinned', /You pinned a reading/.test(await body()));
    await shot('4-fire-after');
  });

  await asPlayer(b, 'mei', 1, async (p, body, click, shot) => {
    let t = await body();
    check('mei divider shown', /EVENING · THE FIRE/.test(t));
    check('mei around card shown', (await p.locator('[data-around]').count()) > 0);
    check('mei stream: host said line shown', /That is a list/.test(t));
    check('mei stream: host pinned line shown', /TestHost pinned a reading/.test(t));
    const qBefore = await p.locator('[data-question]').innerText();
    const optABefore = await p.locator('[data-reading-option=A]').innerText();
    const optBBefore = await p.locator('[data-reading-option=B]').innerText();
    check('mei before pick: TestHost has made a call', /TestHost has made a call\./.test(qBefore));
    // Pin-before-peek negative check: matches TestHost anywhere in the option text (including at the end with no trailing newline).
    check('mei before pick: names hidden under options', !/\bTestHost\b/.test(optABefore) && !/\bTestHost\b/.test(optBBefore));
    // Agree with the host's card, then doubt it instead.
    const hostPiece = p.locator('[data-piece]').filter({ hasText: 'TestHost' }).first();
    check('mei sees host piece on the table', (await hostPiece.count()) > 0);
    if (await hostPiece.count()) {
      await hostPiece.getByRole('button', { name: 'Agree' }).click();
      await waitUntil(async () => /Agreed: Mei/.test(await hostPiece.innerText()), 8000);
      check('mei agreed with host piece', /Agreed: Mei/.test(await hostPiece.innerText()));
      await hostPiece.getByRole('button', { name: 'Doubt' }).click();
      await waitUntil(async () => /Doubted: Mei/.test(await hostPiece.innerText()), 8000);
      const pieceTxt = await hostPiece.innerText();
      check('mei doubted instead', /Doubted: Mei/.test(pieceTxt) && !/Agreed: Mei/.test(pieceTxt));
      await hostPiece.scrollIntoViewIfNeeded(); await shot('2-card', false);
    }
    await pickReading(p, 'B');
    await openQ(p);
    check('mei after pick: sees TestHost under A', /\bTestHost\b/.test(await p.locator('[data-reading-option=A]').innerText()));
    await pickReading(p, 'A');
    t = await body();
    check('mei changed sides', /You changed sides\./.test(t));
    // Garrick named at the fire: his stored lines answer.
    const before = await p.locator('[data-stream] [data-garrick-line]').count();
    await p.getByPlaceholder('Say something at the fire').fill('Garrick, what do you make of this list?');
    await p.getByRole('button', { name: 'Send' }).click();
    await waitUntil(async () => (await p.locator('[data-stream] [data-garrick-line]').count()) === before + 1, 10000);
    const gl = await p.locator('[data-stream] [data-garrick-line]').count();
    check(`mei asked Garrick: he answered (${before} -> ${gl})`, gl === before + 1);
    check('mei line shown once', (await p.locator('[data-chat=mine]', { hasText: 'what do you make of this list' }).count()) === 1);
    const clickCard = p.locator('[data-click]').first();
    if (await clickCard.count()) { await clickCard.scrollIntoViewIfNeeded(); await shot('3-click', false); }
    const frag = p.locator('[data-fragment-card]');
    if (await frag.count()) { await frag.scrollIntoViewIfNeeded(); await shot('4-fragment', false); }
    // Margin notes: press and hold a Garrick line (a right-click does the same), mark it.
    await p.locator('[data-stream] [data-garrick-line] [data-markable] > div').first().click({ button: 'right' });
    await waitUntil(async () => (await p.locator('[data-mark-bar]').count()) > 0, 5000);
    await p.locator('[data-mark-bar]').getByPlaceholder('A few words, if you like').fill('Why ask for the birth night?');
    await p.locator('[data-mark-bar]').getByRole('button', { name: 'MARK', exact: true }).click();
    await waitUntil(async () => /In your margin notes: Why ask for the birth night\?/.test(await body()), 8000);
    check('mei marked a line', /In your margin notes: Why ask for the birth night\?/.test(await body()));
    await shot('5-fire-after');
    await openTab(p, 'bag');
    await p.getByRole('tab', { name: 'The Journal' }).click();
    await waitUntil(async () => /Day \d+ · /.test(await body()), 8000);
    check('journal: tonight shown', /Day \d+ · /.test(await body()));
    await p.getByRole('tab', { name: 'Your margin notes' }).click();
    await waitUntil(async () => /Why ask for the birth night\?/.test(await body()), 8000);
    check('margin notes: the marked line shown', /Why ask for the birth night\?/.test(await body()));
  });
  await b.close();
  process.exit(failed ? 1 : 0);
})().catch((e) => { log('FAILED', e.message.split('\n').slice(0, 3).join(' | ')); process.exit(1); });
