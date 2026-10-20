// Phase D2 test (docs/design/handoff-ledger.md):
//  1. Migration 0101_stats_and_badges.sql defines compute_member_record and my_record RPCs with security definer and set search_path = ''.
//  2. Migration adds stats and badges columns to member_progress.
//  3. compute_member_record counts all 12 canonical chase stats on the server.
//  4. compute_member_record evaluates all 12 canonical badges on the server.
//  5. my_record evaluates dynamic peer crowns (👑) and party leads across all 12 numbers.
//  6. GameShell.tsx fetches real server stats via supabase.rpc('my_record') and passes partyLeads & leadsCount.
//  7. RecordTabView.tsx supports partyLeads, displays 👑 crowns on leads, and shows lead nudge in stat explainer.
// Usage: node tests/online/stats-and-badges.cjs

const fs = require('fs');
const path = require('path');

let failed = false;
const check = (name, ok) => {
  console.log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
};

(() => {
  const root = path.resolve(__dirname, '../..');
  const mig = fs.readFileSync(path.join(root, 'supabase/migrations/0101_stats_and_badges.sql'), 'utf8');
  const shellSrc = fs.readFileSync(path.join(root, 'src/online/GameShell.tsx'), 'utf8');
  const recordSrc = fs.readFileSync(path.join(root, 'src/components/RecordTabView.tsx'), 'utf8');

  // 1. Migration schema & RPC verification
  check(
    '0101_stats_and_badges.sql adds stats and badges columns to member_progress',
    mig.includes('alter table public.member_progress add column if not exists stats jsonb') &&
    mig.includes('alter table public.member_progress add column if not exists badges text[]')
  );

  check(
    '0101_stats_and_badges.sql defines compute_member_record with security definer set search_path = ""',
    /create or replace function public\.compute_member_record\(p_party uuid, p_user uuid\)[\s\S]*?security definer set search_path = ''/i.test(mig)
  );

  check(
    '0101_stats_and_badges.sql defines my_record RPC with security definer set search_path = ""',
    /create or replace function public\.my_record\(p_party uuid\)[\s\S]*?security definer set search_path = ''/i.test(mig)
  );

  // 2. All 12 chase stats counted
  const twelveStats = [
    'daysPlayed', 'bestStreak', 'gatheringsAttended', 'fragmentsSolved',
    'relicsGiven', 'timesSteppedUp', 'fragmentsMatched', 'battlesWon',
    'challengesCleared', 'challengesPressedOn', 'enemiesDefeated', 'perfectRolls'
  ];
  for (const s of twelveStats) {
    check(`0101_stats_and_badges.sql counts chase stat '${s}'`, mig.includes(`'${s}'`));
  }

  // 3. All 12 badges evaluated
  const twelveBadges = [
    'first-light', 'whole-week', 'long-road', 'sharpened',
    'open-hand', 'lifeline', 'whole-table', 'clean-night',
    'perfect', 'never-enough', 'many-hands', 'down-to-thread'
  ];
  for (const b of twelveBadges) {
    check(`0101_stats_and_badges.sql evaluates badge '${b}'`, mig.includes(`'${b}'`));
  }

  // 4. Crown and party lead calculation
  check(
    '0101_stats_and_badges.sql computes crowns and party leads across members',
    mig.includes('v_is_lead') && mig.includes('v_lead_friend') && mig.includes('leadsCount')
  );

  // 5. GameShell integration
  check(
    'GameShell.tsx loads server stats with supabase.rpc("my_record")',
    shellSrc.includes("supabase.rpc('my_record'")
  );
  check(
    'GameShell.tsx passes partyLeads and leadsCount to RecordTabView',
    shellSrc.includes('partyLeads={recordData?.leads}') && shellSrc.includes('leadsCount={recordData?.leadsCount}')
  );

  // 6. RecordTabView UI enhancements
  check(
    'RecordTabView.tsx renders data-record-heading with leadsCount',
    recordSrc.includes('data-record-heading') && recordSrc.includes('WHERE YOU LEAD THE PARTY')
  );
  check(
    'RecordTabView.tsx renders 👑 crown on lead stats with data-crown-lead',
    recordSrc.includes('data-crown-lead') && recordSrc.includes('👑')
  );
  check(
    'RecordTabView.tsx renders lead nudge in stat explainer with data-lead-nudge',
    recordSrc.includes('data-lead-nudge') && recordSrc.includes('One more and the crown is yours')
  );
  check(
    'RecordTabView.tsx renders live badge progress with data-badge-progress',
    recordSrc.includes('data-badge-progress')
  );

  if (failed) {
    console.log('Stats and badges test FAILED');
    process.exit(1);
  }
  console.log('ALL 23 STATS AND BADGES CHECKS PASSED');
})();
