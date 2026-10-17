const { chromium } = require('./playwright.cjs');
const fs = require('fs');
const S = require('path').join(process.env.TEST_OUT || 'test-output', 'chest-' + (process.argv[2] || 'run'));
fs.mkdirSync(S, { recursive: true });
const PARTY = process.argv[3];
const log = (...a) => { console.log(...a); fs.appendFileSync(`${S}/log.txt`, a.join(' ') + '\n'); };
(async () => {
  const b = await chromium.launch({ args: [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] });
  const open = async (who) => {
    const p = await (await b.newContext({ viewport: { width: 400, height: 900 }, ignoreHTTPSErrors: true })).newPage();
    p.on('pageerror', (e) => log(who, 'PAGEERROR', e.message));
    const click = async (name) => { await p.getByRole('button', { name, exact: true }).first().click(); await p.waitForTimeout(1200); };
    await p.goto('http://localhost:3000/?online=1'); await p.waitForTimeout(1500);
    await click('START A PARTY'); await click('USE EMAIL AND A PASSWORD');
    await p.getByRole('button', { name: 'Have an account? Sign in' }).click();
    await p.getByPlaceholder('Email').fill(`${who}@mythios.test`); await p.getByPlaceholder('Password').fill(process.env.MYTHIOS_TEST_PASSWORD);
    await click('SIGN IN'); await p.waitForTimeout(2000);
    await p.getByRole('button', { name: new RegExp(PARTY) }).first().click(); await p.waitForTimeout(2500);
    await click('🕯️ SEEKER CHEST'); await p.waitForTimeout(2000);
    return p;
  };
  const body = (p) => p.locator('body').innerText();
  // Open a fragment's word and tap the letters that spell `word`.
  const spell = async (p, jumbled, word) => {
    await p.getByRole('button', { name: jumbled, exact: true }).first().click(); await p.waitForTimeout(500);
    const tiles = p.locator('button[data-letter]');
    const n = await tiles.count(); const letters = []; for (let i = 0; i < n; i++) letters.push(await tiles.nth(i).innerText());
    const used = new Set();
    for (const ch of word.toUpperCase()) { const i = letters.findIndex((l, k) => l === ch && !used.has(k)); used.add(i); await tiles.nth(i).click(); await p.waitForTimeout(150); }
    await p.waitForTimeout(2000);
  };
  const host = await open('host');
  await host.screenshot({ path: `${S}/01-chest.png`, fullPage: true });
  log('chest shows today first + first line:', /W1·D2[\s\S]*W1·D1/.test(await body(host)), /A Seeker Fragment\. Two of its words are missing/.test(await body(host)));
  await spell(host, 'PETW', 'wept');
  log('today word 1 solved by host:', /“wept”: found by you/.test(await body(host)));
  await spell(host, 'ADEEFR', 'feared');
  log('second word today allowed (C5):', /“feared”: found by you/.test(await body(host)));
  // Yesterday's fragment: open its card, then both words are allowed.
  await host.getByRole('button', { name: /W1·D1/ }).click(); await host.waitForTimeout(600);
  await spell(host, 'CRETSDTAE', 'scattered'); await spell(host, 'LSECO', 'close');
  log('yesterday both solved:', /“scattered”: found by you · “close”: found by you/.test(await body(host)));
  await host.screenshot({ path: `${S}/02-solved.png`, fullPage: true });
  // Mei: her own Chest. The host's words show only as names; five wrong tries on one, then a wait; then she finds the other.
  const mei = await open('mei');
  // (Mei has not played Day 1 in the test party, so her Chest holds Day 1's fragment only.)
  log('mei sees who, not the word:', /Word 1: found by TestHost/.test(await body(mei)), !/“scattered”/.test(await body(mei)));
  for (let k = 0; k < 5; k++) await spell(mei, 'CRETSDTAE', 'cretsdtae');
  log('five wrong then wait:', /Five wrong tries\. Try this word again in \d+ seconds\./.test(await body(mei)));
  await mei.screenshot({ path: `${S}/03-wait.png`, fullPage: true });
  await spell(mei, 'LSECO', 'close');
  log('mei finds it too:', /“close”: found by you, TestHost/.test(await body(mei)));
  await b.close();
})().catch(async (e) => { log('FAILED', e.message.split('\n')[0]); process.exit(1); });
