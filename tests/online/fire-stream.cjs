// The fire's stream tells each thing once, in the order it happened (docs/design/handoff-ledger.md, piece 4):
// the party's "found a missing word" notices are the only word lines (shown once each, at their real time, and the
// whole-fragment card after the last one); the day-result notices ("has read today's chapter", "passed / failed today's
// Challenge") are not repeated in the stream; a line Garrick has said never changes under the reader (a different line
// for the same slot arrives as a new line below it). Local copy of the server. Run campfire.cjs first (two friends at
// the Week 1 Day 2 fire). Usage: node tests/online/fire-stream.cjs "<party name>"
const { chromium } = require('./playwright.cjs');
const { enterParty } = require('./shell.cjs');
const { execFileSync } = require('child_process');
const PARTY = process.argv[2] || 'Gathering Test';
const P = '22222222-2222-2222-2222-222222222222', MEI = '00000000-0000-0000-0000-0000000000a2';
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
  await p.getByRole('button', { name: 'START A PARTY', exact: true }).click(); await p.waitForTimeout(800);
  await p.getByRole('button', { name: 'USE EMAIL AND A PASSWORD', exact: true }).click(); await p.waitForTimeout(800);
  await p.getByRole('button', { name: 'Have an account? Sign in' }).click();
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
  // Garrick's lines do not change under the reader: put an older nudge in memory, reload, and both lines show in order.
  const nudgeLine = await p.evaluate(() => { const k = Object.keys(sessionStorage).find((x) => x.startsWith('fire-said:')); return k ? JSON.parse(sessionStorage.getItem(k)).nudge : null; });
  check('the nudge was remembered when first shown', Array.isArray(nudgeLine) && nudgeLine.length >= 1);
  if (Array.isArray(nudgeLine)) {
    const old = 'An older nudge that was shown before.';
    await p.evaluate((o) => {
      const k = Object.keys(sessionStorage).find((x) => x.startsWith('fire-said:'));
      const v = JSON.parse(sessionStorage.getItem(k));
      const cur = v.nudge[v.nudge.length - 1];
      v.nudge = [{ text: o, at: new Date(new Date(cur.at).getTime() - 60000).toISOString() }, cur];
      sessionStorage.setItem(k, JSON.stringify(v));
    }, old);
    await p.reload(); await p.waitForTimeout(4500);
    t = await stream();
    const iOld = t.indexOf(old), iNew = t.indexOf(nudgeLine[nudgeLine.length - 1].text);
    check('a line already read is not rewritten: the old nudge stays and the new one follows it', iOld >= 0 && iNew > iOld);
  }
  await b.close();
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.log('FAILED', e.message.split('\n')[0]); process.exit(1); });
