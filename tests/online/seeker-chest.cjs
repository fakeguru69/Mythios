const { chromium } = require('./playwright.cjs');
const { enterParty, openTab } = require('./shell.cjs');
const fs = require('fs');
const S = require('path').join(process.env.TEST_OUT || 'test-output', 'chest-' + (process.argv[2] || 'run'));
fs.mkdirSync(S, { recursive: true });
const PARTY = process.argv[3];
const log = (...a) => { console.log(...a); fs.appendFileSync(`${S}/log.txt`, a.join(' ') + '\n'); };
let failed = false;
const check = (name, ok) => {
  log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
};
const waitUntil = async (fn, ms = 8000, step = 250) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await fn()) return true;
    await new Promise((r) => setTimeout(r, step));
  }
  return Boolean(await fn());
};

(async () => {
  const b = await chromium.launch({ args: [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] });
  const open = async (who) => {
    const p = await (await b.newContext({ viewport: { width: 400, height: 900 }, ignoreHTTPSErrors: true })).newPage();
    p.on('pageerror', (e) => { log(who, 'PAGEERROR', e.message); failed = true; });
    const click = async (name) => { await p.getByRole('button', { name, exact: true }).first().click(); await p.waitForTimeout(800); };
    await p.goto('http://localhost:3000/?online=1'); await p.waitForTimeout(1200);
    await p.getByRole('button', { name: 'Already playing? Sign in' }).click(); await p.waitForTimeout(800);
    await p.getByPlaceholder('Email').fill(`${who}@mythios.test`); await p.getByPlaceholder('Password').fill(process.env.MYTHIOS_TEST_PASSWORD);
    await click('SIGN IN'); await p.waitForTimeout(1500);
    await enterParty(p, PARTY);
    await openTab(p, 'bag');
    await waitUntil(async () => /W1·D1/.test(await p.locator('body').innerText()), 8000);
    return p;
  };
  const body = (p) => p.locator('body').innerText();
  // Open a fragment's word and tap the letters that spell `word`.
  const spell = async (p, jumbled, word) => {
    await p.getByRole('button', { name: jumbled, exact: true }).first().click(); await p.waitForTimeout(400);
    const tiles = p.locator('button[data-letter]');
    const n = await tiles.count(); const letters = []; for (let i = 0; i < n; i++) letters.push(await tiles.nth(i).innerText());
    const used = new Set();
    for (const ch of word.toUpperCase()) { const i = letters.findIndex((l, k) => l === ch && !used.has(k)); used.add(i); await tiles.nth(i).click(); await p.waitForTimeout(120); }
    await p.waitForTimeout(1500);
  };
  const host = await open('host');
  await host.screenshot({ path: `${S}/01-chest.png`, fullPage: true });
  check('chest shows today first + first-time line', /W1·D2[\s\S]*W1·D1/.test(await body(host)) && /A Seeker Fragment\. Two of its words are missing/.test(await body(host)));
  await spell(host, 'PETW', 'wept');
  await waitUntil(async () => /“wept”: found by you/.test(await body(host)), 6000);
  check('today word 1 solved by host', /“wept”: found by you/.test(await body(host)));
  // Mei: five wrong tries on today's other word, then a wait.
  const mei = await open('mei');
  for (let k = 0; k < 5; k++) await spell(mei, 'ADEEFR', 'adeefr');
  await waitUntil(async () => /Five wrong tries\. Try this word again in \d+ seconds\./.test(await body(mei)), 6000);
  check('five wrong tries triggers cooldown', /Five wrong tries\. Try this word again in \d+ seconds\./.test(await body(mei)));
  await mei.screenshot({ path: `${S}/03-wait.png`, fullPage: true });
  check('mei sees host as solver', /“wept”: found by TestHost/.test(await body(mei)));
  // A friend may find both words of today's fragment (Fake Guru, 17 Oct).
  const host2 = await open('host');
  await spell(host2, 'ADEEFR', 'feared');
  await waitUntil(async () => /“wept”: found by you · “feared”: found by you/.test(await body(host2)), 6000);
  check('second word today allowed', /“wept”: found by you · “feared”: found by you/.test(await body(host2)));
  // Yesterday's fragment: both words too.
  await host2.getByRole('button', { name: /W1·D1/ }).click(); await host.waitForTimeout(500);
  await spell(host2, 'CRETSDTAE', 'scattered'); await spell(host2, 'LSECO', 'close');
  await waitUntil(async () => /“scattered”: found by you · “close”: found by you/.test(await body(host2)), 6000);
  check('yesterday both words solved', /“scattered”: found by you · “close”: found by you/.test(await body(host2)));
  await host2.screenshot({ path: `${S}/02-solved.png`, fullPage: true });
  await b.close();
  process.exit(failed ? 1 : 0);
})().catch((e) => { log('FAILED', e.message.split('\n')[0]); process.exit(1); });
