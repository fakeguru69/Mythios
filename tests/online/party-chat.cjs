// Three pretend players: invite, sign in, let in / not this time, Session Zero, ready, start the story,
// then in the game shell (once the clock is moved past Day 2): chat via FireChat composer, press-and-hold report,
// character name change notice, and host leaving notice from the party panel.
const { chromium } = require('./playwright.cjs');
const { enterParty, openPanel } = require('./shell.cjs');
const fs = require('fs');
const S = require('path').join(process.env.TEST_OUT || 'test-output', 'online2-' + (process.argv[2] || 'run'));
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
    const ctx = await b.newContext({ viewport: { width: 375, height: 860 }, ignoreHTTPSErrors: true });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => { log(`[${who}] PAGEERROR`, e.message); failed = true; });
    p.on('console', (m) => { if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) log(`[${who}] CONSOLE`, m.text().slice(0, 200)); });
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
  const sessionZero = async (p, a, b) => {
    const cls = (typeof a === 'string' && /^[A-Z]/.test(a)) ? a : 'Trickster';
    const second = (typeof b === 'string' && /^[A-Z]/.test(b)) ? b : 'Aim';
    await click(p, 'BEGIN'); await click(p, 'BEGIN');
    if (/What is your name in this story\?/.test(await body(p))) {
      await click(p, 'GO ON');
      await p.getByRole('button', { name: new RegExp(`^${cls}`) }).click(); await click(p, 'GO ON');
      await p.getByRole('button', { name: second, exact: true }).click(); await click(p, 'GO ON');
      await click(p, 'GO ON');
    }
    await click(p, 'READY'); await p.waitForTimeout(1500);
  };

  const host = await mk('host'), mei = await mk('mei'), dev = await mk('dev');
  await host.goto(`${BASE}/?online=1`); await host.waitForTimeout(1200); await shot(host, '01-home-signed-out');
  await signIn(host, 'host@mythios.test'); await shot(host, '02-home');
  await click(host, 'START A PARTY');
  await host.locator('input').first().fill(PARTY); await shot(host, '03-start-party');
  check('clock shown', /Your party's clock:[\s\S]*\(GMT/.test(await body(host)));
  await click(host, 'MAKE THE INVITE');
  check('invite created', await waitFor(host, /Send this to your friends/));
  await shot(host, '04-host-party');
  const link = (await body(host)).match(/http:\/\/localhost:3000\/\?join=\w+/)[0]; log('link', link);
  await sessionZero(host, 'Trickster', 'Agility');
  await shot(host, '05-host-after-sz');
  check('host ready', /You \(host\) — ready/.test(await body(host)));

  await mei.goto(link); await mei.waitForTimeout(1500); await shot(mei, '06-invite');
  const inv = await body(mei);
  check('invite words complete', /has invited you to join/.test(inv) && /children are going missing/.test(inv) && /Already in the party: TestHost/.test(inv) && new RegExp(`JOIN ${PARTY.toUpperCase()}`).test(inv) && /A fake guru game/.test(inv));
  await click(mei, `JOIN ${PARTY.toUpperCase()}`); await shot(mei, '07-first-so-the-story');
  await signIn(mei, 'mei@mythios.test'); await shot(mei, '08-invite-signed-in');
  await click(mei, `JOIN ${PARTY.toUpperCase()}`);
  check('mei knocked', await waitFor(mei, /You've knocked\.[\s\S]*TestHost will let you in/));
  await shot(mei, '09-knocked');

  check('host sees Mei asking', await waitFor(host, /Asking to join[\s\S]*TestMei/));
  await click(host, 'LET IN');
  check('mei let in', await waitFor(mei, /TestHost has let you in/));
  await shot(mei, '10-let-in');
  await sessionZero(mei, 'Trickster', 'Aim');
  await shot(mei, '11-mei-waiting-room');
  check('mei waiting room', /You're ready\.[\s\S]*You — ready[\s\S]*The road opens when TestHost says so/.test(await body(mei)));

  await dev.goto(link); await dev.waitForTimeout(1200);
  await click(dev, `JOIN ${PARTY.toUpperCase()}`); await signIn(dev, 'dev@mythios.test');
  await click(dev, `JOIN ${PARTY.toUpperCase()}`);
  await waitFor(host, /Asking to join[\s\S]*TestDev/); await click(host, 'NOT THIS TIME');
  check('dev turned away', await waitFor(dev, /Not this time\.[\s\S]*TestHost hasn't let you into this party/));
  await shot(dev, '12-not-this-time');

  await host.waitForTimeout(5500); await shot(host, '13-host-before-start');
  await click(host, 'START THE STORY'); await shot(host, '14-start-confirm');
  check('start confirm', /Start the story for 2 of you\?[\s\S]*Day 1 opens at 5:00am (today|tomorrow)/.test(await body(host)));
  await click(host, 'START');
  check('host door line', await waitFor(host, /Day 1 opens at 5:00am\. Sleep, if you can\./));
  await shot(host, '15-host-started');
  check('mei door line', await waitFor(mei, /Day 1 opens at 5:00am\. Sleep, if you can\./));
  await shot(mei, '16-mei-started');
  const hb = await body(host);
  check('after start: no START THE STORY and clock locked', !/START THE STORY/.test(hb) && !/clock: [^\n]*\n\s*CHANGE/.test(hb));

  // ---- In the game shell (once the clock is moved past Day 2 and the chat is open):
  // Composer in FireChat, press-and-hold report, and name change + leave notices in the party panel.
  fs.writeFileSync(`${S}/READY-FOR-CLOCK`, PARTY);
  for (const [who, p] of [['host', host], ['mei', mei]]) {
    let ok = false;
    for (let i = 0; i < 40 && !ok; i++) {
      await p.reload(); await p.waitForTimeout(2000);
      await enterParty(p, PARTY);
      ok = (await p.locator('[data-composer]').count()) > 0;
    }
    check(`chat composer open in game shell for ${who}`, ok);
  }
  await shot(mei, '17-chat-open');

  // Send a message from host; once finished or in same window, verify send + report flow.
  await host.locator('[data-composer] input').fill('The road starts at the mill.');
  await host.locator('[data-composer]').getByRole('button', { name: 'Send' }).click();
  check('host sees own sent message', await waitFor(host, /The road starts at the mill\./));
  await shot(host, '18-chat-message');

  // Name change and leave party via the party panel (GameShell header -> [data-party-name]).
  await openPanel(mei);
  await click(mei, 'CHANGE');
  await mei.locator('[data-party-panel] input').last().fill('Meiko');
  await click(mei, 'SAVE');
  check('mei renamed to Meiko in panel', await waitFor(mei, /Meiko/));

  await openPanel(host);
  await click(host, 'Leave the party');
  await click(host, 'LEAVE');
  check('host left the party', await waitFor(host, /START A PARTY|Your parties/));
  await shot(mei, '20-notices');

  await b.close();
  process.exit(failed ? 1 : 0);
})().catch((e) => { log('FAILED', e.message.split('\n')[0]); process.exit(1); });
