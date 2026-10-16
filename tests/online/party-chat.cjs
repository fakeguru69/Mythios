// Three pretend players: invite, sign in, let in / not this time, Session Zero, ready, start the story.
const { chromium } = require('./playwright.cjs');
const fs = require('fs');
const S = require('path').join(process.env.TEST_OUT || 'test-output', 'online2-' + (process.argv[2] || 'run'));
fs.mkdirSync(S, { recursive: true });
const log = (...a) => { console.log(...a); fs.appendFileSync(`${S}/log.txt`, a.join(' ') + '\n'); };
const BASE = 'http://localhost:3000';
const PARTY = 'Lantern ' + Date.now().toString().slice(-5);
(async () => {
  const proxy = process.env.HTTPS_PROXY;
  const b = await chromium.launch({ args: proxy ? [`--proxy-server=${proxy}`, '--proxy-bypass-list=localhost;127.0.0.1'] : [] });
  const mk = async (who) => {
    const ctx = await b.newContext({ viewport: { width: 400, height: 860 }, ignoreHTTPSErrors: true });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => log(`[${who}] PAGEERROR`, e.message));
    p.on('console', (m) => { if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) log(`[${who}] CONSOLE`, m.text().slice(0, 200)); });
    return p;
  };
  const body = (p) => p.locator('body').innerText();
  const shot = async (p, name) => { await p.screenshot({ path: `${S}/${name}.png`, fullPage: true }); fs.writeFileSync(`${S}/${name}.txt`, await body(p)); };
  const click = async (p, name, exact = true) => { await p.getByRole('button', { name, exact }).first().click(); await p.waitForTimeout(1200); };
  const waitFor = async (p, re, secs = 12) => { for (let i = 0; i < secs * 2; i++) { if (re.test(await body(p))) return true; await p.waitForTimeout(500); } return false; };
  const signIn = async (p, email) => {
    await click(p, 'USE EMAIL AND A PASSWORD');
    await p.getByRole('button', { name: 'Have an account? Sign in' }).click();
    await p.getByPlaceholder('Email').fill(email); await p.getByPlaceholder('Password').fill(process.env.MYTHIOS_TEST_PASSWORD);
    await click(p, 'SIGN IN'); await p.waitForTimeout(1500);
  };
  const sessionZero = async (p, a, b, c) => {
    // A kept character goes straight to its card; a new one names itself and chooses (cls = a or Trickster, second = b or Aim).
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
  await host.goto(`${BASE}/?online=1`); await host.waitForTimeout(1500); await shot(host, '01-home-signed-out');
  await click(host, 'START A PARTY'); await signIn(host, 'host@mythios.test'); await shot(host, '02-home');
  await click(host, 'START A PARTY');
  await host.locator('input').first().fill(PARTY); await shot(host, '03-start-party');
  log('clock shown:', /Your party's clock:[\s\S]*\(GMT/.test(await body(host)));
  await click(host, 'MAKE THE INVITE'); await waitFor(host, /Send this to your friends/); await shot(host, '04-host-party');
  const link = (await body(host)).match(/http:\/\/localhost:3000\/\?join=\w+/)[0]; log('link', link);
  await sessionZero(host, 'Trickster', 'Agility', 'host');
  await shot(host, '05-host-after-sz');
  log('host ready:', /You \(host\) — ready/.test(await body(host)));

  await mei.goto(link); await mei.waitForTimeout(2000); await shot(mei, '06-invite');
  const inv = await body(mei);
  log('invite words:', /has invited you to join/.test(inv), /children are going missing/.test(inv), /Already in the party: TestHost/.test(inv), new RegExp(`JOIN ${PARTY.toUpperCase()}`).test(inv), /A fake guru game/.test(inv));
  await click(mei, `JOIN ${PARTY.toUpperCase()}`); await shot(mei, '07-first-so-the-story');
  await signIn(mei, 'mei@mythios.test'); await shot(mei, '08-invite-signed-in');
  await click(mei, `JOIN ${PARTY.toUpperCase()}`);
  log("mei knocked:", await waitFor(mei, /You've knocked\.[\s\S]*TestHost will let you in/)); await shot(mei, '09-knocked');

  log('host sees Mei asking:', await waitFor(host, /Asking to join[\s\S]*TestMei/));
  await click(host, 'LET IN');
  log('mei let in:', await waitFor(mei, /TestHost has let you in/)); await shot(mei, '10-let-in');
  await sessionZero(mei, 'Trickster', 'Charm' === 'Charm' ? 'Aim' : 'Aim', 'mei');
  await shot(mei, '11-mei-waiting-room');
  log('mei waiting room:', /You're ready\.[\s\S]*You — ready[\s\S]*The road opens when TestHost says so/.test(await body(mei)));

  await dev.goto(link); await dev.waitForTimeout(1500);
  await click(dev, `JOIN ${PARTY.toUpperCase()}`); await signIn(dev, 'dev@mythios.test');
  await click(dev, `JOIN ${PARTY.toUpperCase()}`);
  await waitFor(host, /Asking to join[\s\S]*TestDev/); await click(host, 'NOT THIS TIME');
  log('dev turned away:', await waitFor(dev, /Not this time\.[\s\S]*TestHost hasn't let you into this party/)); await shot(dev, '12-not-this-time');

  await host.waitForTimeout(5500); await shot(host, '13-host-before-start');
  await click(host, 'START THE STORY'); await shot(host, '14-start-confirm');
  log('start confirm:', /Start the story for 2 of you\?[\s\S]*Day 1 opens at 5:00am (today|tomorrow)/.test(await body(host)));
  await click(host, 'START');
  log('host door line:', await waitFor(host, /Day 1 opens at 5:00am\. Sleep, if you can\./)); await shot(host, '15-host-started');
  log('mei door line:', await waitFor(mei, /Day 1 opens at 5:00am\. Sleep, if you can\./)); await shot(mei, '16-mei-started');
  const hb = await body(host);
  log('after start: no START THE STORY:', !/START THE STORY/.test(hb), '| clock has no CHANGE:', !/clock: [^\n]*\n\s*CHANGE/.test(hb));

  // ---- The party chat: wait until the test moves the clock past Day 2's opening (SQL from outside).
  fs.writeFileSync(`${S}/READY-FOR-CLOCK`, PARTY);
  for (const p of [host, mei]) { let ok = false; for (let i = 0; i < 40 && !ok; i++) { await p.reload(); await p.waitForTimeout(2500);
    const t = await body(p); if (/Your parties/.test(t)) { await p.getByRole('button', { name: new RegExp(PARTY) }).first().click(); await p.waitForTimeout(2500); }
    ok = /Party chat/.test(await body(p)); } log('chat open for', p === host ? 'host' : 'mei', ok); }
  await shot(mei, '17-chat-open');
  await host.locator('input').last().fill('The road starts at the mill.'); await click(host, 'SEND');
  log('mei sees message live:', await waitFor(mei, /TestHost[\s\S]*The road starts at the mill\./));
  await shot(mei, '18-chat-message');
  // Report: press and hold, [REPORT], the box, [SEND].
  const msg = mei.getByText('The road starts at the mill.');
  const bb = await msg.boundingBox(); await mei.mouse.move(bb.x + 5, bb.y + 5); await mei.mouse.down(); await mei.waitForTimeout(900); await mei.mouse.up();
  await click(mei, 'REPORT'); log('report box:', /Tell us what's wrong\./.test(await body(mei)));
  await mei.locator('input').nth(-2).fill('test report'); await click(mei, 'SEND'); log('reported:', /Thank you\./.test(await body(mei)));
  await shot(mei, '19-reported');
  // A name change, then the host leaves: canon's notices.
  await click(mei, 'CHANGE'); await mei.locator('input').last().fill('Meiko'); await click(mei, 'SAVE');
  log('name notice:', await waitFor(host, /TestMei is now Meiko\./));
  await click(host, 'Leave the party'); await click(host, 'LEAVE');
  log('leave notices:', await waitFor(mei, /TestHost has left the road\.[\s\S]*Meiko now leads the party\./));
  await shot(mei, '20-notices');
  await b.close();
})().catch((e) => { log('FAILED', e.message.split('\n')[0]); process.exit(1); });
