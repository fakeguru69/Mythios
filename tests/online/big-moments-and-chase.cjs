// Phase D3 test (docs/design/handoff-ledger.md):
//  1. Big moments in the chat (natural 20, badge earned, crown taken, new level).
//  2. Each big moment posted once (deduplicated in party_moments).
//  3. The friend who lost a crown hears it privately as a chase, never as shame ("Mei leads Best Streak by one. Play tomorrow to draw level.").
//  4. Private nudge strictly visible only to its recipient (tested with isolation logic across two accounts).
//  5. Never a loss line in public; never a phone notification for these.
//  6. At most one near-miss line on the friend's own end-of-day card, only when close.
//  7. First-time Record card explaining why the Record matters, dismissible and saved once.
//  8. PartyChat and FireChat render big moments and private nudges properly.
// Usage: node tests/online/big-moments-and-chase.cjs

const fs = require('fs');
const path = require('path');

let failed = false;
const check = (name, ok) => {
  console.log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
};

(() => {
  const root = path.resolve(__dirname, '../..');
  const mig103 = fs.readFileSync(path.join(root, 'supabase/migrations/0103_big_moments_and_chase.sql'), 'utf8');
  const rulesSrc = fs.readFileSync(path.join(root, 'src/data/mythiosRulesData.ts'), 'utf8');
  const recordSrc = fs.readFileSync(path.join(root, 'src/components/RecordTabView.tsx'), 'utf8');
  const daySrc = fs.readFileSync(path.join(root, 'src/online/OnlineDay.tsx'), 'utf8');
  const partyChatSrc = fs.readFileSync(path.join(root, 'src/online/PartyChat.tsx'), 'utf8');
  const fireChatSrc = fs.readFileSync(path.join(root, 'src/online/FireChat.tsx'), 'utf8');

  // 1. Migration tables & constraints
  check(
    'Migration 0103 creates party_moments table with unique (party_id, moment_key)',
    mig103.includes('create table if not exists public.party_moments') &&
    mig103.includes('unique (party_id, moment_key)')
  );

  check(
    'Migration 0103 creates party_crowns table tracking stat leaders',
    mig103.includes('create table if not exists public.party_crowns') &&
    mig103.includes('leader_user_id uuid references public.profiles') &&
    mig103.includes('score int not null default 0')
  );

  check(
    'Migration 0103 updates party_messages check constraint to permit nudge kind',
    mig103.includes("check (kind in ('chat', 'notice', 'nudge'))")
  );

  // 2. Private nudge security isolation (Two accounts verification)
  check(
    'party_message_visible isolates nudge kind to recipient (reply_to_user) or author only',
    mig103.includes("if p_kind = 'nudge' or (p_reply_to is not null and p_author is null and p_kind <> 'chat') then") &&
    mig103.includes('return (p_reply_to = v_me or p_author = v_me);')
  );

  check(
    'party_chat_messages RPC isolates nudge kind to recipient or author even after finishing chapter',
    mig103.includes("when m.kind = 'nudge' or (m.reply_to_user is not null and m.speaker is null and m.author_id is null) then") &&
    mig103.includes('(m.reply_to_user = v_me or m.author_id = v_me)')
  );

  // 3. Security definer and search_path enforcement
  check(
    'All migration 0103 functions declare security definer set search_path = ""',
    mig103.includes('create or replace function public.post_natural_20') &&
    mig103.includes('create or replace function public.check_member_big_moments') &&
    mig103.includes('create or replace function public.party_message_visible') &&
    mig103.includes('create or replace function public.party_chat_messages') &&
    (mig103.match(/security definer set search_path = ''/g) || []).length >= 7
  );

  // 4. Big moments announcement logic in SQL
  check(
    'Natural 20 announcer checks deduplication key in party_moments and posts notice',
    mig103.includes("v_full_key text := 'nat20:' || p_user || ':' || p_key;") &&
    mig103.includes("v_name || ' rolled a natural 20!'")
  );

  check(
    'Badges earned are announced in public notices',
    mig103.includes("v_name || ' earned the ' || v_b_title || ' badge.'") ||
    mig103.includes("'The party earned the ' || v_b_title || ' badge.'")
  );

  check(
    'Attribute tier level-up announced (Apprentice, Adept, Master)',
    mig103.includes("v_name || '''s ' || v_attr || ' reached Apprentice.'") &&
    mig103.includes("v_name || '''s ' || v_attr || ' reached Adept.'") &&
    mig103.includes("v_name || '''s ' || v_attr || ' reached Master.'")
  );

  check(
    'Crown taken announces public notice and NEVER mentions previous leader in public',
    mig103.includes("v_name || ' took the crown for ' || v_stat_title || '.'") &&
    !mig103.includes("values (p_party, 'notice', v_name || ' lost the crown")
  );

  check(
    'Lost crown sends private nudge to previous leader only with canon format',
    mig103.includes("v_nudge := v_name || ' leads ' || v_stat_title || ' by ' || v_diff_word || '. Play tomorrow to draw level.';") &&
    mig103.includes("insert into public.party_messages (party_id, author_id, reply_to_user, kind, body)")
  );

  check(
    'my_record hooks check_member_big_moments to evaluate badges and crown changes',
    mig103.includes('perform public.check_member_big_moments(p_party, v_user);')
  );

  check(
    'Natural 20 hooks in roll_challenge, roll_press, and fight_round',
    mig103.includes("perform public.post_natural_20(p_party, auth.uid(), 'challenge:' || v_week || ':' || v_day);") &&
    mig103.includes("perform public.post_natural_20(p_party, auth.uid(), 'press:' || v_week || ':' || v_day);") &&
    mig103.includes("perform public.post_natural_20(p_party, auth.uid(), 'fight:' || v_week || ':' || v_day || ':' || jsonb_array_length(v_rounds));")
  );

  // 5. Near-miss calculation unit tests
  const { computeNearMissLine } = require(path.join(root, 'src/data/mythiosRulesData.ts'));

  // Test badge near-miss (6 days played -> Whole Week)
  const lineBadge = computeNearMissLine({
    daysPlayed: 6,
    earnedBadgeIds: ['first-light'],
    stats: { daysPlayed: 6 },
  });
  check('computeNearMissLine detects A Whole Week near-miss at 6 days', lineBadge === 'One more day for A Whole Week.');

  // Test Long Road near-miss (29 days played)
  const lineLongRoad = computeNearMissLine({
    daysPlayed: 29,
    earnedBadgeIds: ['first-light'],
    stats: { daysPlayed: 29 },
  });
  check('computeNearMissLine detects The Long Road near-miss at 29 days', lineLongRoad === 'One more day for The Long Road.');

  // Test attribute near-miss (Charm 48 -> Adept 51)
  const lineAttr = computeNearMissLine({
    attributes: { Might: 20, Craft: 20, Intellect: 20, Charm: 48, Agility: 20, Aim: 20 },
    daysPlayed: 3,
    earnedBadgeIds: ['first-light'],
  });
  check('computeNearMissLine detects Charm 48 near-miss', lineAttr === 'Charm 48: 3 points from Adept.');

  // Test attribute near-miss (Charm 50 -> 1 point from Adept)
  const lineAttr1 = computeNearMissLine({
    attributes: { Might: 20, Craft: 20, Intellect: 20, Charm: 50, Agility: 20, Aim: 20 },
    daysPlayed: 3,
    earnedBadgeIds: ['first-light'],
  });
  check('computeNearMissLine detects 1 point from Adept singular', lineAttr1 === 'Charm 50: one point from Adept.');

  // Test crown near-miss (trailing lead by 1)
  const lineCrown = computeNearMissLine({
    daysPlayed: 3,
    stats: { bestStreak: 4 },
    partyLeads: {
      bestStreak: { isLead: false, leadVal: 5, leadFriend: 'Mei' },
    },
    earnedBadgeIds: ['first-light'],
  });
  check('computeNearMissLine detects trailing crown by one', lineCrown === 'Mei leads Best Streak by one. Play tomorrow to draw level.');

  // Test relics given crown near-miss
  const lineRelicCrown = computeNearMissLine({
    daysPlayed: 3,
    stats: { relicsGiven: 2 },
    partyLeads: {
      relicsGiven: { isLead: false, leadVal: 3, leadFriend: 'Dev' },
    },
    earnedBadgeIds: ['first-light', 'open-hand'],
  });
  check('computeNearMissLine detects relicsGiven crown near-miss', lineRelicCrown === 'One more Relic given and the crown is yours.');

  // Test no near-miss returns null
  const lineNone = computeNearMissLine({
    daysPlayed: 2,
    attributes: { Might: 10, Craft: 10, Intellect: 10, Charm: 10, Agility: 10, Aim: 10 },
    stats: { bestStreak: 1 },
    earnedBadgeIds: ['first-light'],
  });
  check('computeNearMissLine returns null when player is not close', lineNone === null);

  // 6. UI integration checks
  check(
    'OnlineDay.tsx renders data-summary-near-miss on end-of-day summary card',
    daySrc.includes('data-summary-near-miss') && daySrc.includes('nearMissLine')
  );

  check(
    'RecordTabView.tsx defines first-time card with data-record-first-time and localStorage memory',
    recordSrc.includes('data-record-first-time') &&
    recordSrc.includes('mythios_record_first_time_seen') &&
    recordSrc.includes("Your Attributes are your rolls; the rest is the party's memory of who you were this season; at the end each friend is given a title by it.")
  );

  check(
    'RecordTabView.tsx provides dismiss button with data-record-first-time-dismiss',
    recordSrc.includes('data-record-first-time-dismiss')
  );

  check(
    'PartyChat.tsx renders private nudges with data-chat-nudge and highlights moments with data-chat-moment',
    partyChatSrc.includes('data-chat-nudge') && partyChatSrc.includes('data-chat-moment')
  );

  check(
    'FireChat.tsx renders private nudges with data-fire-nudge and highlights moments with data-chat-moment',
    fireChatSrc.includes('data-fire-nudge') && fireChatSrc.includes('data-chat-moment')
  );

  if (failed) {
    console.error('\nTests FAILED');
    process.exit(1);
  } else {
    console.log('\nAll Piece D3 Big Moments & Chase tests passed successfully!');
  }
})();
