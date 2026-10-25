// The fire's stream tells each thing once, in the order it happened (docs/design/handoff-ledger.md, piece 4):
// the party's "found a missing word" notices are the only word lines (shown once each, at their real time, and the
// whole-fragment card after the last one); the day-result notices ("has read today's chapter", "passed / failed today's
// Challenge") are not repeated in the stream; a line Garrick has said never changes under the reader and is kept on the server
// (fire_said): a different line for the same slot arrives as a new line below it, on any phone. Local copy of the server. Run campfire.cjs first (two friends at
// the Week 1 Day 2 fire). Usage: node tests/online/fire-stream.cjs "<party name>"
const { chromium } = require('./playwright.cjs');
const { enterParty } = require('./shell.cjs');
const { execFileSync } = require('child_process');
const PARTY = process.argv[2] || 'Gathering Test';
const P = '22222222-2222-2222-2222-222222222222', MEI = '00000000-0000-0000-0000-0000000000a2', HOST = '00000000-0000-0000-0000-0000000000a1';
let failed = false;
const check = (name, ok) => { console.log((ok ? 'ok   ' : 'FAIL ') + name); if (!ok) failed = true; };
const sql = (s) => execFileSync('psql', ['-U', process.env.PGUSER || 'postgres', '-qAtX', '-c', s], { encoding: 'utf8' });
(async () => {
  // Two words found by Mei a few minutes ago, with the party's notices for them, and the three day-result notices.
  sql(`set session_replication_role = replica;
    delete from public.fragment_words where party_id = '${P}' and fragment_id = '1-2';
    delete from public.party_messages where party_id = '${P}' and kind = 'notice' and (body like '%found a missing word%' or body like '%today''s Challenge.' or body like '%has read today''s chapter.');
    insert into public.fragment_words (party_id, fragment_id, slot, solved_by, solved_at) values ('${P}', '1-2', 1, '${MEI}', now() - interval '4 minutes'), ('${P}', '1-2', 2, '${MEI}', now() - interval '2 minutes');
    insert into public.party_messages (party_id, kind, body, created_at) values
      ('${P}', 'notice', 'Mei found a missing word in the Week 1, Day 2 fragment.', now() - interval '4 minutes'),
      ('${P}', 'notice', 'Mei found a missing word in the Week 1, Day 2 fragment.', now() - interval '2 minutes'),
      ('${P}', 'notice', 'Mei has read today''s chapter.', now() - interval '3 minutes'),
      ('${P}', 'notice', 'Mei passed today''s Challenge.', now() - interval '3 minutes'),
      ('${P}', 'notice', 'Mei failed today''s Challenge.', now() - interval '3 minutes');`);
  const b = await chromium.launch({ args: [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] });
  const ctx = await b.newContext({ viewport: { width: 375, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto('http://localhost:3000/?online=1'); await p.waitForTimeout(1500);
  // The cover (since 23 Oct): "Already playing? Sign in"; older screens asked for the way in first.
  await p.locator('[data-button-signin]').click(); await p.waitForTimeout(800);
  for (const name of ['USE EMAIL AND A PASSWORD', 'Have an account? Sign in']) {
    const b = p.getByRole('button', { name, exact: true }); if (await b.count()) { await b.first().click(); await p.waitForTimeout(500); }
  }
  await p.getByPlaceholder('Email').fill('host@mythios.test'); await p.getByPlaceholder('Password').fill('x');
  await p.getByRole('button', { name: 'SIGN IN', exact: true }).click(); await p.waitForTimeout(2000);
  await enterParty(p, PARTY); await p.waitForTimeout(4000);
  const stream = async () => p.locator('[data-stream]').innerText();
  let t = await stream();
  const count = (re) => (t.match(re) || []).length;
  check('the two words are each told once', count(/found a missing word/g) === 2);
  check("the day-result notices are not repeated ('read today's chapter')", count(/has read today's chapter/g) === 0);
  check("a pass is not repeated ('passed today's Challenge')", count(/passed today's Challenge/g) === 0);
  check("a failure is never named in the stream ('failed today's Challenge')", count(/failed today's Challenge/g) === 0);
  const frag = t.indexOf('TODAY\'S FRAGMENT IS WHOLE'), lastWord = t.lastIndexOf('found a missing word');
  check('the whole-fragment card comes after the last word was found', frag > lastWord && lastWord > 0);
  // Garrick's lines do not change under the reader, and the server remembers them (piece 4b, fire_said): an older nudge
  // that was shown to the host before is already on the server; the new one arrives below it, and a different phone (a
  // fresh browser with no memory of its own) sees the same two lines in the same order.
  const old = 'An older nudge that was shown before.';
  const rows = () => Number(sql(`select count(*) from public.fire_said where party_id = '${P}' and user_id = '${HOST}' and slot = 'nudge'`).trim());
  sql(`delete from public.fire_said where party_id = '${P}' and user_id = '${HOST}';
       insert into public.fire_said (party_id, user_id, week, day, slot, body, at) values ('${P}', '${HOST}', 1, 2, 'nudge', '${old}', now() - interval '30 minutes');`);
  await p.reload(); await p.waitForTimeout(5000);
  t = await stream();
  const lines = sql(`select body from public.fire_said where party_id = '${P}' and user_id = '${HOST}' and slot = 'nudge' order by id`).trim().split('\n');
  check(`the server holds the old nudge and the new one below it (${lines.length} rows)`, lines.length === 2 && lines[0] === old);
  const iOld = t.indexOf(old), iNew = lines[1] ? t.indexOf(lines[1]) : -1;
  check('the old nudge stays and the new one follows it on screen', iOld >= 0 && iNew > iOld);
  await p.reload(); await p.waitForTimeout(4500);
  check('reloading does not add rows (the record is kept once)', rows() === 2);
  const other = await (await b.newContext({ viewport: { width: 375, height: 900 } })).newPage();
  await other.goto('http://localhost:3000/?online=1'); await other.waitForTimeout(1500);
  await other.getByRole('button', { name: 'START A PARTY', exact: true }).click(); await other.waitForTimeout(800);
  await other.getByRole('button', { name: 'USE EMAIL AND A PASSWORD', exact: true }).click(); await other.waitForTimeout(800);
  await other.getByRole('button', { name: 'Have an account? Sign in' }).click();
  await other.getByPlaceholder('Email').fill('host@mythios.test'); await other.getByPlaceholder('Password').fill('x');
  await other.getByRole('button', { name: 'SIGN IN', exact: true }).click(); await other.waitForTimeout(2000);
  await enterParty(other, PARTY); await other.waitForTimeout(4500);
  const t2 = await other.locator('[data-stream]').innerText();
  check('another phone (no memory of its own) shows the same two lines in the same order', t2.indexOf(old) >= 0 && t2.indexOf(lines[1]) > t2.indexOf(old));
  check('the other phone added no rows either', rows() === 2);
  await b.close();
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.log('FAILED', e.message.split('\n')[0]); process.exit(1); });
