// Mythios redesign: intro screen, series shelf, one character per series (kept vs new), invite naming the series.
const { chromium } = require('./playwright.cjs');
const fs = require('fs');
const S = require('path').join(process.env.TEST_OUT || 'test-output', 'online4-' + (process.argv[2] || 'run'));
fs.mkdirSync(S, { recursive: true });
const log = (...a) => { console.log(...a); fs.appendFileSync(`${S}/log.txt`, a.join(' ') + '\n'); };
let failed = false;
const check = (name, ok) => {
  log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
};
const BASE = 'http://localhost:3000';
const PARTY = 'Lantern ' + Date.now().toString().slice(-5);

(async () => {
  const proxy = process.env.HTTPS_PROXY;
  const b = await chromium.launch({ args: proxy ? [`--proxy-server=${proxy}`, '--proxy-bypass-list=localhost;127.0.0.1'] : [] });
  const mk = async (who) => {
    const ctx = await b.newContext({ viewport: { width: 400, height: 860 }, ignoreHTTPSErrors: true });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => { log(`[${who}] PAGEERROR`, e.message); failed = true; });
    return p;
  };
  const body = (p) => p.locator('body').innerText();
  const shot = async (p, name) => { await p.screenshot({ path: `${S}/${name}.png`, fullPage: true }); fs.writeFileSync(`${S}/${name}.txt`, await body(p)); };
  const click = async (p, name, exact = true) => {
    try { await p.getByRole('button', { name, exact }).first().click(); } catch (e) { throw new Error(`no button "${name}": ${e.message.split('\n')[0]}`); }
    await p.waitForTimeout(800);
  };
  const waitFor = async (p, re, secs = 12) => { for (let i = 0; i < secs * 2; i++) { if (re.test(await body(p))) return true; await p.waitForTimeout(500); } return false; };
  const signIn = async (p, email) => {
    // The cover (since 23 Oct): "Already playing? Sign in"; older screens asked for the way in first.
    if (await p.locator('[data-button-signin]').count()) { await p.locator('[data-button-signin]').click(); await p.waitForTimeout(800); }
    for (const name of ['USE EMAIL AND A PASSWORD', 'Have an account? Sign in']) {
      const b = p.getByRole('button', { name, exact: true }); if (await b.count()) { await b.first().click(); await p.waitForTimeout(500); }
    }
    await p.getByPlaceholder('Email').fill(email); await p.getByPlaceholder('Password').fill(process.env.MYTHIOS_TEST_PASSWORD);
    await click(p, 'SIGN IN'); await p.waitForTimeout(1500);
  };
  // Session Zero: a kept character goes straight to its card; a new one names itself and chooses.
  const sessionZero = async (p, tag, newName, cls, second) => {
    // 26 Oct: Getting ready's step 1 opens Session Zero; its first card's BEGIN starts it.
    await click(p, 'MAKE YOUR CHARACTER'); await click(p, 'BEGIN');
    if (/What is your name in this story\?/.test(await body(p))) {
      await shot(p, `${tag}-sz-name`);
      await p.locator('input').first().fill(newName); await click(p, 'GO ON');
      await p.getByRole('button', { name: new RegExp(`^${cls}`) }).click(); await click(p, 'GO ON');
      await p.getByRole('button', { name: new RegExp(`^${second}`) }).first().click(); await click(p, 'GO ON');
      await click(p, 'GO ON');
      log(`${tag}: new character path`);
    } else {
      check(`${tag}: kept character path`, /YOUR CHARACTER/.test(await body(p)));
    }
    await shot(p, `${tag}-sz-card`); await click(p, 'READY'); await p.waitForTimeout(1500);
  };

  const host = await mk('host'), dev = await mk('dev');
  await host.goto(`${BASE}/?online=1`); await host.waitForTimeout(1500); await shot(host, '01-landing');
  const land = await body(host);
  // The cover (since 23 Oct).
  check('landing: the cover', /MYTHIOS/.test(land) && /Tales of the Dark Moon/i.test(land) && /Start a party/.test(land));
  await signIn(host, 'host@mythios.test');
  // With one party, signing in opens it; another party starts from the party sheet's "All your stories" (26 Oct).
  if (await host.locator('[data-game-shell]').count()) { await host.locator('[data-party-name]').click(); await host.waitForTimeout(600); await click(host, 'All your stories'); }
  if (await host.locator('[data-getting-ready]').count()) { await click(host, 'Party settings', false); await click(host, 'All your stories'); }
  await shot(host, '02-home');
  check('home: your stories + shelf + character', /Your stories/.test(await body(host)) && /You play TestHost/.test(await body(host)));
  await click(host, 'START A PARTY');
  check('start party names series', /Tales of the Dark Moon · Season 1/.test(await body(host)));
  await host.locator('input').first().fill(PARTY); await click(host, 'MAKE THE INVITE');
  check('invite created', await waitFor(host, /Send this link to your friends/));
  await shot(host, '03-party');
  check('party header names series and season', new RegExp(`${PARTY}\\s*Tales of the Dark Moon · Season 1`).test(await body(host)));
  const link = (await body(host)).match(/http:\/\/localhost:3000\/\?join=\w+/)[0];
  await sessionZero(host, 'host', '', '', '');

  await dev.goto(link); await dev.waitForTimeout(1500); await shot(dev, '04-invite');
  check('invite names series and season', /Join the adventure in Tales of the Dark Moon[\s\S]*Season 1/.test(await body(dev)));
  await click(dev, `JOIN ${PARTY.toUpperCase()}`); await signIn(dev, 'dev@mythios.test');
  // The knock goes in by itself once signed in (Phase 1, 25 Oct); tap JOIN only if it is still there.
  { const j = dev.getByRole('button', { name: `JOIN ${PARTY.toUpperCase()}`, exact: true }); if (await j.count()) await click(dev, `JOIN ${PARTY.toUpperCase()}`); }
  await waitFor(host, /Asking to join/); await click(host, 'LET IN');
  await waitFor(dev, /has let you in\. Now choose/);
  await sessionZero(dev, 'dev', 'Devan', 'Archer', 'Agility');
  check('dev party list shows Devan', await waitFor(host, /Devan\s*Ready, Archer/));
  // "All your stories" now sits in Party settings (26 Oct).
  await click(dev, 'Party settings', false); await click(dev, 'All your stories'); await dev.waitForTimeout(1500); await shot(dev, '05-dev-home');
  check('dev home: You play Devan, Archer', /You play Devan, Archer/.test(await body(dev)));
  await b.close();
  process.exit(failed ? 1 : 0);
})().catch((e) => { log('FAILED', e.message.split('\n')[0], (e.stack.match(/party-and-session-zero.cjs:\d+/g) || []).join(' ')); process.exit(1); });
