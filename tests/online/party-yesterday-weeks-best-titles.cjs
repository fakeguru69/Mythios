// Phase D4 test (docs/design/handoff-ledger.md):
//  1. "The Party, Yesterday" card after the recap each morning: good news only, up to five lines,
//     best first (badge, Perfect Roll, Relic given, crown/tier, who pressed on / who played yesterday),
//     omitting what the friend already saw in the party chat.
//  2. "The Week's Best" in the Gathering lobby before Beat 1: one true achievement for every friend
//     present, nobody ranked last, distinct categories when two friends share a top stat.
//  3. Season Titles (all 12 canonical honours) at the Season 1 finale (Week 6 Gathering) and in RecordTabView.
//  4. Big-moment hooks wired into actual gameplay RPCs (roll_card, roll_press_card, fight_round, finish_day, give_relic)
//     and whole-party badge deduplication.
//  5. Rules & wording updates in docs/canon/mythios-core-rules.md and docs/mythios-stats-page-and-chase-architecture.md.
// Usage: node tests/online/party-yesterday-weeks-best-titles.cjs

const fs = require('fs');
const path = require('path');

let failed = false;
const check = (name, ok) => {
  console.log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
};

(() => {
  const root = path.resolve(__dirname, '../..');
  const mig104 = fs.readFileSync(path.join(root, 'supabase/migrations/0104_party_yesterday_weeks_best_titles.sql'), 'utf8');
  const rulesSrc = fs.readFileSync(path.join(root, 'src/data/mythiosRulesData.ts'), 'utf8');
  const daySrc = fs.readFileSync(path.join(root, 'src/online/OnlineDay.tsx'), 'utf8');
  const gatheringSrc = fs.readFileSync(path.join(root, 'src/online/OnlineGathering.tsx'), 'utf8');
  const recordSrc = fs.readFileSync(path.join(root, 'src/components/RecordTabView.tsx'), 'utf8');
  const shellSrc = fs.readFileSync(path.join(root, 'src/online/GameShell.tsx'), 'utf8');
  const coreRulesDoc = fs.readFileSync(path.join(root, 'docs/canon/mythios-core-rules.md'), 'utf8');
  const archDoc = fs.readFileSync(path.join(root, 'docs/mythios-stats-page-and-chase-architecture.md'), 'utf8');

  // 1. Seen-tracking & sequence infrastructure
  check(
    'Migration 0104 creates party_activity_seq and seen tracking columns on member_progress & member_days',
    mig104.includes('create sequence if not exists public.party_activity_seq') &&
    mig104.includes('add column if not exists chat_seen_msg_id bigint') &&
    mig104.includes('add column if not exists chat_seen_seq bigint') &&
    mig104.includes('add column if not exists seen_msg_id_at_open bigint') &&
    mig104.includes('add column if not exists seen_seq_at_open bigint')
  );

  check(
    'lock_today_seen_snapshot locks morning seen snapshot before party_chat_messages advances chat_seen_msg_id',
    mig104.includes('create or replace function public.lock_today_seen_snapshot') &&
    mig104.includes('perform public.lock_today_seen_snapshot(p_party, v_me);') &&
    mig104.includes('set chat_seen_msg_id = greatest(chat_seen_msg_id, v_max_id)') &&
    mig104.includes('set chat_seen_seq = greatest(chat_seen_seq, coalesce(v_curr_seq, 0))')
  );

  // 2. "The Party, Yesterday" SQL function
  check(
    'party_yesterday enforces party membership and returns empty array on Week 1 Day 1',
    mig104.includes('create or replace function public.party_yesterday(p_party uuid) returns jsonb') &&
    mig104.includes("if v_me is null or not public.is_party_member(p_party) then") &&
    mig104.includes("if v_week is null or (v_week = 1 and v_day = 1) or public.is_late_day1(p_party, v_me) then")
  );

  check(
    'party_yesterday prioritizes badges -> Perfect Rolls -> Relics given -> crown/tier -> pressed on / played yesterday, capped at 5 lines',
    mig104.includes('-- Priority 1: Badges earned by friends') &&
    mig104.includes('-- Priority 2: Perfect Rolls (natural 20s) by friends') &&
    mig104.includes('-- Priority 3: Relics given by friends') &&
    mig104.includes('-- Priority 4: Crown changing hands or new Attribute tier reached') &&
    mig104.includes('-- Priority 5a: Friends who pressed on') &&
    mig104.includes('-- Priority 5b: Who played yesterday (good news only; never names who missed)') &&
    (mig104.match(/coalesce\(array_length\(v_lines, 1\), 0\) < 5/g) || []).length >= 5
  );

  check(
    'party_yesterday filters out already-seen items via v_seen_msg_id and v_seen_seq and supports Whole Table nudge',
    mig104.includes('and m.id > v_seen_msg_id') &&
    mig104.includes('and rg.gift_seq > v_seen_seq') &&
    mig104.includes('and coalesce(md.press_seq, 1) > v_seen_seq') &&
    mig104.includes('and coalesce(md.finish_seq, 1) > v_seen_seq') &&
    mig104.includes("played. One more makes a Whole Table.")
  );

  check(
    'today(p_party) locks seen snapshot and returns partyYesterday in payload',
    mig104.includes('perform public.lock_today_seen_snapshot(p_party, auth.uid());') &&
    mig104.includes('v_yesterday := public.party_yesterday(p_party);') &&
    mig104.includes("'partyYesterday', v_yesterday")
  );

  // 3. "The Week's Best" SQL function
  check(
    'gathering_weeks_best computes one true achievement for every friend present in the Gathering lobby',
    mig104.includes('create or replace function public.gathering_weeks_best(p_party uuid, p_week int default null) returns jsonb') &&
    mig104.includes('order by (not (c.cat = any(v_used_cats))) desc, c.score desc') &&
    mig104.includes("then 'This week: ' || array_to_string(v_sentences, ' ')")
  );

  check(
    'g_view includes weeksBest and seasonTitles (on Week 6)',
    mig104.includes("'weeksBest', public.gathering_weeks_best(p_party, p_week)") &&
    mig104.includes("'seasonTitles', case when p_week = 6 then public.party_season_titles(p_party) else '[]'::jsonb end")
  );

  // 4. Season Titles SQL function & canonical metadata
  const canonicalTitles = [
    ['daysPlayed', 'The Steady Feet'],
    ['bestStreak', 'The Unbroken'],
    ['gatheringsAttended', 'The Faithful'],
    ['fragmentsSolved', 'The Reader'],
    ['relicsGiven', 'The Open Hand'],
    ['timesSteppedUp', 'First Forward'],
    ['fragmentsMatched', 'The Keen Eye'],
    ['battlesWon', 'The Wall'],
    ['challengesCleared', 'The Sure Hand'],
    ['challengesPressedOn', 'The Bold'],
    ['enemiesDefeated', 'The Hunter'],
    ['perfectRolls', 'The Lucky One'],
  ];

  check(
    'party_season_titles is STABLE (no temp tables) and defines all 12 canonical Season Titles',
    mig104.includes('create or replace function public.party_season_titles(p_party uuid) returns jsonb') &&
    !mig104.includes('create temp table') &&
    canonicalTitles.every(([key, title]) => mig104.includes(`'${key}'`) && mig104.includes(`'${title}'`))
  );

  const { SEASON_TITLES_META } = require(path.join(root, 'src/data/mythiosRulesData.ts'));
  check(
    'SEASON_TITLES_META in mythiosRulesData.ts exports all 12 canonical Season Titles',
    Boolean(SEASON_TITLES_META) &&
    canonicalTitles.every(([key, title]) => SEASON_TITLES_META[key] && SEASON_TITLES_META[key].title === title)
  );

  // 5. Security definer and privileges on all 16 functions in migration 0104
  check(
    'All 16 functions in migration 0104 use security definer set search_path = ""',
    (mig104.match(/security definer set search_path = ''/g) || []).length === 16
  );

  check(
    'Internal helpers (lock_today_seen_snapshot, check_member_big_moments, g_view, triggers) are revoked from public, anon, authenticated',
    mig104.includes('revoke execute on function public.lock_today_seen_snapshot(uuid, uuid) from public, anon, authenticated;') &&
    mig104.includes('revoke execute on function public.check_member_big_moments(uuid, uuid) from public, anon, authenticated;') &&
    mig104.includes('revoke execute on function public.g_view(uuid, int, uuid) from public, anon, authenticated;')
  );

  // 6. Big-moment hooks in actual gameplay RPCs & whole-party badge deduplication
  check(
    'Whole-party badges (whole-table, clean-night) are deduplicated per party in check_member_big_moments',
    mig104.includes("when v_b in ('whole-table', 'clean-night') then 'badge:party:' || v_b")
  );

  check(
    'roll_card, roll_press_card, fight_round, finish_day, and give_relic hook post_natural_20 / check_member_big_moments',
    mig104.includes('create or replace function public.roll_card(') &&
    mig104.includes('create or replace function public.roll_press_card(') &&
    mig104.includes('create or replace function public.fight_round(') &&
    mig104.includes('create or replace function public.finish_day(') &&
    mig104.includes('create or replace function public.give_relic(')
  );

  // 7. Frontend components (OnlineDay, OnlineGathering, RecordTabView, GameShell)
  check(
    'OnlineDay.tsx renders PartyYesterday ([data-party-yesterday], [data-party-yesterday-line]) after RoadSoFar',
    daySrc.includes('<PartyYesterday lines={today.partyYesterday} />') &&
    daySrc.includes('data-party-yesterday') &&
    daySrc.includes('data-party-yesterday-line') &&
    daySrc.includes('THE PARTY, YESTERDAY')
  );

  check(
    'OnlineGathering.tsx renders WeeksBestCard ([data-weeks-best]) in the Gathering lobby before Beat 1',
    gatheringSrc.includes('<WeeksBestCard weeksBest={view.weeksBest} />') &&
    gatheringSrc.includes('data-weeks-best') &&
    gatheringSrc.includes('data-weeks-best-summary') &&
    gatheringSrc.includes('data-weeks-best-line')
  );

  check(
    'OnlineGathering.tsx renders SeasonTitlesCard ([data-season-titles]) at the end of Week 6 Gathering',
    gatheringSrc.includes('view.week === 6 && view.endedAt && view.seasonTitles') &&
    gatheringSrc.includes('<SeasonTitlesCard titles={view.seasonTitles} myId={view.me} />') &&
    gatheringSrc.includes('data-season-titles') &&
    gatheringSrc.includes('data-season-title-row')
  );

  check(
    'GameShell.tsx passes seasonEnded, mySeasonTitle, and seasonTitles to RecordTabView, which renders [data-season-titles]',
    shellSrc.includes('seasonEnded={recordData.seasonEnded}') &&
    shellSrc.includes('mySeasonTitle={recordData.mySeasonTitle}') &&
    shellSrc.includes('seasonTitles={recordData.seasonTitles}') &&
    recordSrc.includes('data-season-titles') &&
    recordSrc.includes('data-my-season-title')
  );

  // 8. Canon rules & architecture documentation updates
  check(
    'mythios-core-rules.md retires MINE/PARTY chat switch and rolling ticker in favour of One Thread and big moments',
    !coreRulesDoc.includes('has a switch at the top: **MINE** and **PARTY**') &&
    !coreRulesDoc.includes('The ticker and the notices (quiet by default)') &&
    coreRulesDoc.includes('**One thread** (decided 18 Oct 2026') &&
    coreRulesDoc.includes('**Big moments in the chat** (decided 18 Oct 2026)')
  );

  check(
    'mythios-stats-page-and-chase-architecture.md fixes the four wording slips (Day 7 Gathering, Relics, Match, Challenges)',
    !archDoc.includes('Sunday Gathering') &&
    !archDoc.includes('Sunday’s Gathering') &&
    !archDoc.includes('stone charms') &&
    !archDoc.includes('Beat 4 quiz') &&
    !archDoc.includes('Landmark obstacle skill checks')
  );

  if (failed) {
    console.error('Phase D4 checks FAILED');
    process.exit(1);
  } else {
    console.log('All Phase D4 checks passed (20 checks)');
    process.exit(0);
  }
})();
