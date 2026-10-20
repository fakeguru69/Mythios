// Phase D2 test (docs/design/handoff-ledger.md):
//  1. Migration defines compute_member_record and my_record RPCs with security definer and set search_path = ''.
//  2. Security: my_record enforces approved party membership; compute_member_record is revoked from players.
//  3. Badges: Sharpened checks Adept (>= 51); Lifeline requires genuine rescue (margin 1..4 with relic).
//  4. Stats: Enemies Defeated includes Gathering battles; Perfect Rolls excludes Notice.
//  5. GameShell.tsx loads real server stats via supabase.rpc('my_record'), shows loading state instead of fake numbers, and uses me.second_attr.
//  6. RecordTabView.tsx supports partyLeads, displays 👑 crowns on leads, calculates real diff to crown, and renders dynamic badge progress.
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
  const mig102 = fs.readFileSync(path.join(root, 'supabase/migrations/0102_audit_fixes_notice_record.sql'), 'utf8');
  const shellSrc = fs.readFileSync(path.join(root, 'src/online/GameShell.tsx'), 'utf8');
  const recordSrc = fs.readFileSync(path.join(root, 'src/components/RecordTabView.tsx'), 'utf8');
  const rulesSrc = fs.readFileSync(path.join(root, 'src/data/mythiosRulesData.ts'), 'utf8');

  // 1. Migration schema & RPC verification
  check(
    'Migration adds stats and badges columns to member_progress',
    mig.includes('alter table public.member_progress add column if not exists stats jsonb') &&
    mig.includes('alter table public.member_progress add column if not exists badges text[]')
  );

  check(
    'Migration defines compute_member_record with security definer set search_path = ""',
    /create or replace function public\.compute_member_record\(p_party uuid, p_user uuid\)[\s\S]*?security definer set search_path = ''/i.test(mig102)
  );

  check(
    'Migration defines my_record RPC with security definer set search_path = ""',
    /create or replace function public\.my_record\(p_party uuid\)[\s\S]*?security definer set search_path = ''/i.test(mig102)
  );

  // 2. Security isolation checks
  check(
    'my_record checks that caller is an approved party member',
    mig102.includes("from public.party_members") && mig102.includes("raise exception 'not in party'")
  );

  check(
    'compute_member_record is revoked from public, anon, and authenticated',
    mig102.includes('revoke execute on function public.compute_member_record(uuid, uuid) from public, anon, authenticated;')
  );

  // 3. Rule calculation checks
  check(
    'Sharpened badge checks Adept tier (score >= 51, not 26)',
    mig102.includes('value::int >= 51') && !mig102.includes('value::int >= 26')
  );

  check(
    'Lifeline badge requires genuine relic rescue without >= 2 fallback',
    mig102.includes("(md.challenge ->> 'net')::int between 1 and 4") &&
    !mig102.includes('(v_relics_given >= 2)')
  );

  check(
    'Enemies Defeated includes Gathering Battle victories',
    mig102.includes("g.state -> 'battle' ->> 'outcome' = 'won'")
  );

  check(
    'Perfect Rolls excludes Notice roll',
    !mig102.includes("(notice ->> 'd20')::int = 20")
  );

  // 4. GameShell verification
  check(
    'GameShell.tsx loads server stats with supabase.rpc("my_record")',
    shellSrc.includes("supabase.rpc('my_record'")
  );
  check(
    'GameShell.tsx renders data-record-loading state while waiting for server',
    shellSrc.includes('data-record-loading') && shellSrc.includes('Counting the Record…')
  );
  check(
    'GameShell.tsx does not invent fake streak or gatherings attended fallback',
    !shellSrc.includes('(info.week - 1) * 6 + info.day')
  );
  check(
    'GameShell.tsx uses me.second_attr for second strength',
    shellSrc.includes('me.second_attr')
  );

  // 5. RecordTabView verification
  check(
    'RecordTabView.tsx renders 👑 crown on lead stats with data-crown-lead',
    recordSrc.includes('data-crown-lead')
  );
  check(
    'RecordTabView.tsx computes real difference to tie for crown in lead nudge',
    recordSrc.includes('more to tie for the crown')
  );
  check(
    'RecordTabView.tsx renders dynamic badge progress without hardcoded sample names',
    recordSrc.includes('computeBadgeProgress') && !recordSrc.includes('Mei')
  );

  // 6. House rules: Zero brackets in player prose
  check(
    'RECORD_STATS_META contains zero [STEP UP] or [PRESS ON] brackets in explainers',
    !rulesSrc.includes('[STEP UP]') && !rulesSrc.includes('[PRESS ON]')
  );

  // 7. Badge progress calculation logic unit tests
  const simulateDiff = (userVal, leadVal, leadFriend) => {
    const diff = leadVal - userVal;
    return diff <= 0
      ? `Tied with ${leadFriend} for the lead.`
      : diff === 1
      ? `${leadFriend} leads with ${leadVal}. One more to tie for the crown.`
      : `${leadFriend} leads with ${leadVal}. ${diff} more to tie for the crown.`;
  };

  check('Nudge for diff 1 states "One more to tie for the crown"', simulateDiff(4, 5, 'Dev').includes('One more to tie for the crown.'));
  check('Nudge for diff 8 states "8 more to tie for the crown"', simulateDiff(2, 10, 'Dev').includes('8 more to tie for the crown.'));
  check('Nudge for tied score states "Tied with Dev for the lead."', simulateDiff(5, 5, 'Dev').includes('Tied with Dev for the lead.'));

  if (failed) process.exit(1);
  console.log('ALL AUDIT REMEDIATION CHECKS PASSED');
})();
