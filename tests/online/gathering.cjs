// The Gathering online with two friends, host@ and mei@, each in their own browser: the lobby, the vote, the Approach,
// the Battle, Notice and [LOOK CLOSER], the United Effort, Match, the table question, Ask, and the summary card.
// Each player taps whatever the night offers them (the host answers the table's question); the server does the rest.
// Usage: node tests/online/gathering.cjs <run> "<party name>"
//   The party must be on Day 7. Against the real server: MYTHIOS_TEST_PASSWORD set. Against the local stand-in
//   (tests/online/local-server.cjs, with `node tests/online/gathering.cjs setup-local` to make the party): any password.
const { chromium } = require('./playwright.cjs');
const { enterParty } = require('./shell.cjs');
const fs = require('fs');
const S = require('path').join(process.env.TEST_OUT || 'test-output', 'gathering-' + (process.argv[2] || 'run'));
fs.mkdirSync(S, { recursive: true });
const PARTY = process.argv[3] || 'Gathering Test';
const PASSWORD = process.env.MYTHIOS_TEST_PASSWORD || 'local';
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

// A party on Week 2 Day 7 in the local test database (host, then Mei), each with a little gold and one of each Relic.
if (process.argv[2] === 'setup-local') {
  const { execFileSync } = require('child_process');
  const q = (s) => execFileSync('psql', ['-U', process.env.PGUSER || 'postgres', '-qAtX', '-v', 'ON_ERROR_STOP=1', '-c', s], { encoding: 'utf8' });
  const H = '00000000-0000-0000-0000-0000000000a1', M = '00000000-0000-0000-0000-0000000000a2', P = '22222222-2222-2222-2222-222222222222';
  q(`delete from public.parties where id = '${P}'; delete from auth.users where id in ('${H}', '${M}');
     insert into auth.users (id, email) values ('${H}', 'host@mythios.test'), ('${M}', 'mei@mythios.test');
     insert into public.profiles (id, display_name) values ('${H}', 'TestHost'), ('${M}', 'Mei') on conflict (id) do nothing;
     update public.profiles set display_name = case id when '${H}' then 'TestHost' else 'Mei' end, name_chosen = true where id in ('${H}', '${M}');
     insert into public.parties (id, name, host_id, time_zone, season_started_at, day1_opens_at) values ('${P}', '${PARTY}', '${H}', 'Asia/Singapore', now(),
       (((now() at time zone 'Asia/Singapore') - interval '5 hours')::date - 13 + time '05:00') at time zone 'Asia/Singapore');
     insert into public.party_members (party_id, user_id, character_name, class, second_attr, status, ready, session_zero_done_at) values
       ('${P}', '${H}', 'TestHost', 'Warrior', 'Agility', 'approved', true, now()), ('${P}', '${M}', 'Mei', 'Sage', 'Charm', 'approved', true, now() + interval '1 second');
     insert into public.characters (user_id, series_id, name, class, second_attr) values ('${H}', 'dark-moon', 'TestHost', 'Warrior', 'Agility'), ('${M}', 'dark-moon', 'Mei', 'Sage', 'Charm') on conflict do nothing;`);
  for (const u of [H, M]) q(`select public.ensure_progress('${P}', '${u}'); update public.member_progress set gold = 600, relics = '{"Combat": 1, "Intellect": 1, "Agility": 1, "Aim": 1}' where user_id = '${u}';`);
  // The lobby opens a minute ago, so it starts the moment both are here.
  q(`select public.g_row('${P}', 2); update public.gatherings set opens_at = now() - interval '1 minute' where party_id = '${P}';`);
  console.log('local party ready:', PARTY);
  process.exit(0);
}

async function player(b, who) {
  const p = await (await b.newContext({ viewport: { width: 400, height: 860 }, ignoreHTTPSErrors: true })).newPage();
  p.on('pageerror', (e) => { log(who, 'PAGEERROR', e.message); failed = true; });
  const stats = { ticks: 0 };
  p.on('request', (r) => { if (/gathering_tick/.test(r.url())) stats.ticks++; });
  const body = () => p.locator('body').innerText();
  const click = async (name) => { await p.getByRole('button', { name, exact: true }).first().click(); await p.waitForTimeout(800); };
  await p.goto('http://localhost:3000/?online=1'); await p.waitForTimeout(1200);
  await click('START A PARTY'); await click('USE EMAIL AND A PASSWORD');
  await p.getByRole('button', { name: 'Have an account? Sign in' }).click();
  await p.getByPlaceholder('Email').fill(`${who}@mythios.test`); await p.getByPlaceholder('Password').fill(PASSWORD);
  await click('SIGN IN'); await p.waitForTimeout(1500);
  // Day 7: the STORY tab holds the Gathering itself (the game shell, phase A).
  await enterParty(p, PARTY);
  const join = p.getByRole('button', { name: /^(THE GATHERING|JOIN THE GATHERING|TONIGHT’S GATHERING)$/ }).first();
  await waitUntil(async () => (await join.count()) > 0, 8000);
  // Opening the app on Day 7 must not count the friend as at the Gathering (handoff ledger piece 1): the live Gathering
  // is mounted only after they tap to join, so no gathering_tick has gone out yet.
  const ticksBefore = stats.ticks;
  const cardShown = (await join.count()) > 0;
  check(`${who}: before joining card shown and 0 ticks sent`, cardShown && ticksBefore === 0);
  if (cardShown) {
    await join.click();
    await waitUntil(() => stats.ticks > 0, 8000);
  }
  check(`${who}: after joining gathering ticks sent`, stats.ticks > 0);
  await waitUntil(async () => (await p.locator('[data-gathering-chat]').count()) > 0, 8000);
  check(`${who}: Gathering table-talk chat is mounted`, (await p.locator('[data-gathering-chat]').count()) > 0);
  fs.writeFileSync(`${S}/${who}-0-party.txt`, await body());
  fs.writeFileSync(`${S}/${who}-1-lobby.txt`, await body());
  await p.screenshot({ path: `${S}/${who}-1-lobby.png`, fullPage: true });
  return { p, who, body, stats };
}

// One move: the first thing on screen this player can do.
async function move({ p, who }) {
  // A page behind another can have its timers slowed by the browser, so its two-second poll stops: act from the front.
  await p.bringToFront();
  const answer = p.getByPlaceholder('Your answer, for the table');
  // Every friend answers the table's question (17 Oct); the night's answer follows once all here have.
  if (await answer.count()) {
    await answer.fill(who === 'host' ? 'Every one of them was born on a dark moon.' : 'They were all marked the same way.');
    await p.getByRole('button', { name: 'SAY IT', exact: true }).click();
    return 'answered the table';
  }
  const tries = [
    p.locator('[data-g="choice"]:enabled'),
    p.locator('[data-script-step]:enabled'),
    p.getByRole('button', { name: 'PICK', exact: true }),
    p.locator('[data-g="handon"]:enabled'),
    p.getByRole('button', { name: 'GIVE A COMBAT RELIC', exact: true }),
    p.getByRole('button', { name: 'USE', exact: true }),
    p.getByRole('button', { name: 'START', exact: true }),
  ];
  for (const t of tries) {
    if (await t.count()) {
      const el = t.first();
      if (await el.isEnabled()) {
        const label = (await el.innerText()).split('\n')[0].slice(0, 50);
        await el.click();
        return label;
      }
    }
  }
  // Nothing to do but read: tap [GO ON] now and then, as a player would.
  const goOn = p.getByRole('button', { name: 'GO ON', exact: true });
  if (await goOn.count() && Math.random() < 0.5) { await goOn.first().click(); return 'GO ON'; }
  return null;
}

(async () => {
  const b = await chromium.launch({ args: [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] });
  const players = [await player(b, 'host'), await player(b, 'mei')];
  const started = Date.now();
  let ended = false;
  for (let n = 0; n < 900 && !ended; n++) {
    for (const pl of players) {
      const did = await move(pl).catch((e) => `error: ${e.message.split('\n')[0]}`);
      if (did) log(pl.who, '→', did);
    }
    await players[0].p.waitForTimeout(900);
    if (n % 30 === 29) log('ticks so far:', players.map((pl) => `${pl.who} ${pl.stats.ticks}`).join(', '));
    ended = (await players[0].p.locator('[data-gathering-ended]').count()) > 0 && (await players[1].p.locator('[data-gathering-ended]').count()) > 0;
    if (Date.now() - started > 20 * 60000) { log('TIMED OUT'); break; }
  }
  check('Gathering finished for both players before timeout', ended);
  for (const { p, who, body } of players) {
    const t = await body();
    fs.writeFileSync(`${S}/${who}-2-end.txt`, t);
    await p.screenshot({ path: `${S}/${who}-2-end.png`, fullPage: true });
    const card = t.slice(t.lastIndexOf('· Gathering'));
    log(who, 'summary:', card.replace(/\n/g, ' | ').slice(0, 400));
    const unfilled = t.match(/\{[A-Z]+\}|\{ue:|\{pick:/g) || [];
    check(`${who}: summary card shown`, /· Gathering/.test(t));
    check(`${who}: no unfilled stand-ins`, unfilled.length === 0);
  }
  log('minutes:', ((Date.now() - started) / 60000).toFixed(1));
  await b.close();
  process.exit(failed ? 1 : 0);
})().catch((e) => { log('FAILED', e.message.split('\n')[0]); process.exit(1); });
