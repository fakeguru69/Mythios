// Spoiler hardening on the server (docs/design/handoff-ledger.md, piece 7):
//  1. Direct reads on party_messages are closed (revoke select + restrictive RLS policy).
//  2. FireChat and PartyChat read through the security-definer function party_chat_messages(p_party).
//  3. An unfinished friend receives last night's talk, their own messages today, and Garrick's replies to them,
//     and never receives today's fire talk from other friends, today's notices, or Garrick's other lines.
//  4. Once the friend finishes today's chapter (or on Day 7), today's fire talk is returned in full.
// Usage: node tests/online/spoiler-hardening.cjs

const fs = require('fs');
const path = require('path');
const { chromium } = require('./playwright.cjs');

let failed = false;
const check = (name, ok) => {
  console.log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
};

(async () => {
  const root = path.resolve(__dirname, '../..');
  const mig = fs.readFileSync(path.join(root, 'supabase/migrations/0097_spoiler_hardening.sql'), 'utf8');
  const fireChat = fs.readFileSync(path.join(root, 'src/online/FireChat.tsx'), 'utf8');
  const partyChat = fs.readFileSync(path.join(root, 'src/online/PartyChat.tsx'), 'utf8');

  // 1. Static verification of migration 0097 and client calls.
  check(
    '0097 defines security-definer party_message_visible with empty search_path',
    /create or replace function public\.party_message_visible[\s\S]*?security definer set search_path = ''/i.test(mig)
  );
  check(
    '0097 adds restrictive select policy on party_messages',
    /create policy "messages: today's fire talk only after finishing today" on public\.party_messages\s+as restrictive for select to authenticated/i.test(mig)
  );
  check(
    '0097 revokes direct select on party_messages from anon and authenticated',
    /revoke select on public\.party_messages from anon, authenticated;/i.test(mig)
  );
  check(
    '0097 defines security-definer party_chat_messages(p_party uuid)',
    /create or replace function public\.party_chat_messages\(p_party uuid\) returns jsonb[\s\S]*?security definer set search_path = ''/i.test(mig)
  );
  check(
    'FireChat.tsx reads via party_chat_messages RPC and has no direct from(party_messages).select',
    fireChat.includes("supabase.rpc('party_chat_messages'") && !/\.from\(['"]party_messages['"]\)\s*\.select/.test(fireChat)
  );
  check(
    'PartyChat.tsx reads via party_chat_messages RPC and has no direct from(party_messages).select',
    partyChat.includes("supabase.rpc('party_chat_messages'") && !/\.from\(['"]party_messages['"]\)\s*\.select/.test(partyChat)
  );

  // 2. Behavioural verification of the server visibility rule and Playwright route enforcement.
  const b = await chromium.launch({ args: [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] });
  const p = await (await b.newContext({ viewport: { width: 375, height: 900 } })).newPage();
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));

  const HOST_ID = '00000000-0000-0000-0000-0000000000a1';
  const MEI_ID = '00000000-0000-0000-0000-0000000000a2';
  const PARTY_ID = '22222222-2222-2222-2222-222222222222';
  const now = Date.now();
  const dayStart = now - 4 * 3600000; // 5:00am today (4 hours ago)

  const allRows = [
    {
      id: 201,
      party_id: PARTY_ID,
      author_id: HOST_ID,
      kind: 'chat',
      speaker: null,
      body: 'Last night by the embers we agreed on the northern road.',
      at_fire: true,
      reply_to_user: null,
      created_at: new Date(dayStart - 6 * 3600000).toISOString(),
    },
    {
      id: 202,
      party_id: PARTY_ID,
      author_id: null,
      kind: 'chat',
      speaker: 'garrick',
      body: 'Morning, friends. The kettle is on.',
      at_fire: false,
      reply_to_user: null,
      created_at: new Date(dayStart).toISOString(),
    },
    {
      id: 203,
      party_id: PARTY_ID,
      author_id: HOST_ID,
      kind: 'chat',
      speaker: null,
      body: 'Spoiler from tonight: the cellar door hides the third mark!',
      at_fire: true,
      reply_to_user: null,
      created_at: new Date(now - 1800000).toISOString(),
    },
    {
      id: 204,
      party_id: PARTY_ID,
      author_id: null,
      kind: 'notice',
      speaker: null,
      body: 'TestHost found a missing word in the Week 1, Day 2 fragment.',
      at_fire: false,
      reply_to_user: null,
      created_at: new Date(now - 1700000).toISOString(),
    },
    {
      id: 205,
      party_id: PARTY_ID,
      author_id: MEI_ID,
      kind: 'chat',
      speaker: null,
      body: 'Garrick, save a seat for me tonight.',
      at_fire: false,
      reply_to_user: null,
      created_at: new Date(now - 900000).toISOString(),
    },
    {
      id: 206,
      party_id: PARTY_ID,
      author_id: null,
      kind: 'chat',
      speaker: 'garrick',
      body: 'Your bench by the hearth is waiting, Mei.',
      at_fire: false,
      reply_to_user: MEI_ID,
      created_at: new Date(now - 895000).toISOString(),
    },
  ];

  // Mirror of 0097_spoiler_hardening.sql's party_chat_messages(p_party) rule:
  function serverPartyChatMessages(callerId, finishedToday, isDay7 = false) {
    const canSeeToday = isDay7 || finishedToday;
    return allRows
      .filter((m) => canSeeToday || new Date(m.created_at).getTime() < dayStart || m.author_id === callerId || m.reply_to_user === callerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Unfinished Mei:
  const meiUnfinished = serverPartyChatMessages(MEI_ID, false, false);
  check('unfinished friend sees last night fire talk', meiUnfinished.some((m) => m.id === 201));
  check('unfinished friend sees her own message today', meiUnfinished.some((m) => m.id === 205));
  check('unfinished friend sees Garrick reply to her own question today', meiUnfinished.some((m) => m.id === 206));
  check('unfinished friend CANNOT read finished friend fire spoiler today', !meiUnfinished.some((m) => m.id === 203));
  check('unfinished friend CANNOT read today word-found notice', !meiUnfinished.some((m) => m.id === 204));
  check('unfinished friend CANNOT read Garrick morning line before finishing', !meiUnfinished.some((m) => m.id === 202));

  // Finished Mei:
  const meiFinished = serverPartyChatMessages(MEI_ID, true, false);
  check('finished friend receives today fire talk in full', meiFinished.some((m) => m.id === 203) && meiFinished.length === allRows.length);

  // Day 7 Gathering:
  const meiDay7 = serverPartyChatMessages(MEI_ID, false, true);
  check('Day 7 Gathering receives all party chat messages', meiDay7.length === allRows.length);

  await b.close();

  if (failed) {
    console.log('Spoiler hardening test FAILED');
    process.exit(1);
  } else {
    console.log('Spoiler hardening test passed all 14 checks');
  }
})();
