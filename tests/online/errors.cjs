// Errors and refresh (docs/design/handoff-ledger.md, piece 5), on the local copy, host@ at the Week 1 Day 2 fire
// (run campfire.cjs first):
//  1. an error from a failed fire poll goes away by itself after a later success;
//  2. a slow poll that answers after your own tap never puts the old news back (the pinned pick stays);
//  3. a failed chat load keeps the messages already on screen;
//  4. the top bar's gold and the Record's gear follow a change when you move between tabs.
// Usage: node tests/online/errors.cjs "<party name>"
const { chromium } = require('./playwright.cjs');
const { enterParty, openTab } = require('./shell.cjs');
const { execFileSync } = require('child_process');
const PARTY = process.argv[2] || 'Gathering Test';
const P = '22222222-2222-2222-2222-222222222222', HOST = '00000000-0000-0000-0000-0000000000a1';
let failed = false;
const check = (name, ok) => { console.log((ok ? 'ok   ' : 'FAIL ') + name); if (!ok) failed = true; };
const sql = (s) => execFileSync('psql', ['-U', process.env.PGUSER || 'postgres', '-qAtX', '-c', s], { encoding: 'utf8' });
(async () => {
  sql(`set session_replication_role = replica; delete from public.fire_pins where party_id = '${P}' and user_id = '${HOST}' and week = 1 and day = 2;
       delete from public.party_messages where party_id = '${P}' and body = 'This line must stay on screen';
       insert into public.party_messages (party_id, author_id, kind, body) values ('${P}', '${HOST}', 'chat', 'This line must stay on screen');`);
  const b = await chromium.launch({ args: [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] });
  const p = await (await b.newContext({ viewport: { width: 375, height: 900 } })).newPage();
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  const ctl = { failCampfire: 0, holdCampfire: false, snapshot: null, release: null, failChat: false };
  await p.route(/\/rpc\/campfire/, async (route) => {
    if (ctl.failCampfire > 0) { ctl.failCampfire--; return route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'forced failure' }) }); }
    if (ctl.holdCampfire) {
      ctl.holdCampfire = false;
      const resp = await route.fetch();           // what the server says now (before your tap)
      ctl.snapshot = true;
      await new Promise((r) => { ctl.release = r; });   // ...but it reaches the screen late
      return route.fulfill({ response: resp });
    }
    return route.continue();
  });
  await p.route(/\/rest\/v1\/party_messages|\/rpc\/party_chat_messages/, (route) => {
    if (ctl.failChat) return route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'forced failure' }) });
    return route.continue();
  });
  await p.goto('http://localhost:3000/?online=1'); await p.waitForTimeout(1500);
  // The cover (since 23 Oct): "Already playing? Sign in"; older screens asked for the way in first.
  await p.locator('[data-button-signin]').click(); await p.waitForTimeout(800);
  for (const name of ['USE EMAIL AND A PASSWORD', 'Have an account? Sign in']) {
    const b = p.getByRole('button', { name, exact: true }); if (await b.count()) { await b.first().click(); await p.waitForTimeout(500); }
  }
  await p.getByPlaceholder('Email').fill('host@mythios.test'); await p.getByPlaceholder('Password').fill('x');
  await p.getByRole('button', { name: 'SIGN IN', exact: true }).click(); await p.waitForTimeout(2000);
  await enterParty(p, PARTY); await p.waitForTimeout(4500);
  const body = () => p.locator('body').innerText();
  check('the fire is open', (await p.locator('[data-fire]').count()) > 0);
  check('the chat line is on screen', (await body()).includes('This line must stay on screen'));

  // 1. A failed poll shows an error; the next good one clears it.
  ctl.failCampfire = 1;
  await p.waitForTimeout(13500);
  const ERR = /forced failure|something went wrong|try again/i;
  const errShown = ERR.test(await body());
  check('a failed fire poll shows an error line', errShown);
  await p.waitForTimeout(13500);
  check('the next good poll clears the error', !ERR.test(await body()));

  // 2. A slow poll answers after your own tap: the pick stays.
  ctl.holdCampfire = true;
  for (let i = 0; i < 40 && !ctl.snapshot; i++) await p.waitForTimeout(500);
  check('a poll was caught on its way (the old news)', Boolean(ctl.snapshot));
  const optionB = p.locator('[data-fire] button', { hasText: 'Neither' }).first();
  await optionB.click(); await p.waitForTimeout(2000);
  const picked = async () => (await p.locator('[data-question-folded]').count()) > 0;
  check('your pick shows (the strip folds)', await picked());
  ctl.release(); await p.waitForTimeout(2500);
  check('the late, old answer did not put the old news back (the pick stays)', await picked());

  // 3. A failed chat load keeps the chat.
  ctl.failChat = true;
  await p.waitForTimeout(16500);
  check('a failed chat load keeps the messages on screen', (await body()).includes('This line must stay on screen'));
  ctl.failChat = false;

  // 4. Gold and gear follow a change when you move between tabs.
  const goldNow = Number((await p.locator('[data-gold]').innerText()).replace(/[^\d]/g, ''));
  sql(`update public.member_progress set gold = gold + 1000, weapon_level = 3 where party_id = '${P}' and user_id = '${HOST}';`);
  await openTab(p, 'bag'); await p.waitForTimeout(1500);
  const goldAfter = Number((await p.locator('[data-gold]').innerText()).replace(/[^\d]/g, ''));
  check(`the top bar's gold follows (${goldNow} -> ${goldAfter})`, goldAfter === goldNow + 1000);
  await openTab(p, 'record'); await p.waitForTimeout(1500);
  check('the Record shows the new weapon level', /Level 3 of 5/.test(await body()));
  sql(`update public.member_progress set gold = gold - 1000, weapon_level = 1 where party_id = '${P}' and user_id = '${HOST}';`);
  await b.close();
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.log('FAILED', e.message.split('\n')[0]); process.exit(1); });
