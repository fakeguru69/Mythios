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
  const click = async (p, name, exact = true) => { await p.getByRole('button', { name, exact }).first().click(); await p.waitForTimeout(800); };
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
    await click(p, 'BEGIN'); await click(p, 'BEGIN');
    if (/What is your name in this story\?/.test(await body(p))) {
      await shot(p, `${tag}-sz-name`);
      await p.locator('input').first().fill(newName); await click(p, 'GO ON');
      await p.getByRole('button', { name: new RegExp(`^${cls}`) }).click(); await click(p, 'GO ON');
      await p.getByRole('button', { name: second, exact: true }).click(); await click(p, 'GO ON');
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
  check('landing: MYTHIOS header, intro, series card', /MYTHIOS/.test(land) && /Mythios is that teller\./.test(land) && /A Mythios series[\s\S]*Tales of the Dark Moon[\s\S]*Season 1/i.test(land));
  await signIn(host, 'host@mythios.test'); await shot(host, '02-home');
  check('home: your stories + shelf + character', /Your stories/.test(await body(host)) && /You play TestHost, Trickster/.test(await body(host)));
  await click(host, 'START A PARTY');
  check('start party names series', /Tales of the Dark Moon · Season 1/.test(await body(host)));
  await host.locator('input').first().fill(PARTY); await click(host, 'MAKE THE INVITE');
  check('invite created', await waitFor(host, /Send this to your friends/));
  await shot(host, '03-party');
  check('party header names series and season', new RegExp(`${PARTY} · Tales of the Dark Moon · Season 1`).test(await body(host)));
  const link = (await body(host)).match(/http:\/\/localhost:3000\/\?join=\w+/)[0];
  await sessionZero(host, 'host', '', '', '');

  await dev.goto(link); await dev.waitForTimeout(1500); await shot(dev, '04-invite');
  check('invite names series and season', /Join the adventure in Tales of the Dark Moon[\s\S]*Season 1/.test(await body(dev)));
  await click(dev, `JOIN ${PARTY.toUpperCase()}`); await signIn(dev, 'dev@mythios.test');
  await click(dev, `JOIN ${PARTY.toUpperCase()}`);
  await waitFor(host, /Asking to join/); await click(host, 'LET IN');
  await waitFor(dev, /has let you in/);
  await sessionZero(dev, 'dev', 'Devan', 'Archer', 'Agility');
  check('dev party list shows Devan', await waitFor(host, /Devan — ready/));
  await click(dev, '← Your stories'); await dev.waitForTimeout(1500); await shot(dev, '05-dev-home');
  check('dev home: You play Devan, Archer', /You play Devan, Archer/.test(await body(dev)));
  await b.close();
  process.exit(failed ? 1 : 0);
})().catch((e) => { log('FAILED', e.message.split('\n')[0]); process.exit(1); });
