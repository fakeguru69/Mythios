// Piece C6 test (docs/design/handoff-ledger.md):
//  1. Migration 0100_notice_roll.sql defines security definer roll_notice(p_party) with empty search_path.
//  2. roll_notice tests d20 + tier bonus vs DC 3 (succeeds on 4 or more).
//  3. ChapterScriptParts.tsx exports FirstTimeNoticeInfo and NoticeRollCard with data-notice-card and data-first-time-notice.
//  4. OnlineDay.tsx imports and renders NoticeRollCard for step.t === 'notice'.
//  5. OnlineCampfire.tsx renders data-hand="notice" for laying notice pieces onto the fire table.
// Usage: node tests/online/notice-roll.cjs

const fs = require('fs');
const path = require('path');

let failed = false;
const check = (name, ok) => {
  console.log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
};

(async () => {
  const root = path.resolve(__dirname, '../..');
  const mig = fs.readFileSync(path.join(root, 'supabase/migrations/0100_notice_roll.sql'), 'utf8');
  const scriptParts = fs.readFileSync(path.join(root, 'src/components/ChapterScriptParts.tsx'), 'utf8');
  const onlineDay = fs.readFileSync(path.join(root, 'src/online/OnlineDay.tsx'), 'utf8');
  const onlineCampfire = fs.readFileSync(path.join(root, 'src/online/OnlineCampfire.tsx'), 'utf8');

  // 1. Migration 0100 verification
  check(
    '0100_notice_roll.sql defines security definer roll_notice with set search_path = ""',
    /create or replace function public\.roll_notice\(p_party uuid\)[\s\S]*?security definer set search_path = ''/i.test(mig)
  );
  check(
    '0100_notice_roll.sql rolls d20 + bonus vs DC 3',
    /v_total := v_d20 \+ v_bonus/i.test(mig) && /v_total >= 4/i.test(mig)
  );
  check(
    '0100_notice_roll.sql adds notice column to member_days table',
    /alter table public\.member_days add column if not exists notice jsonb/i.test(mig)
  );

  // 2. Component verification
  check(
    'ChapterScriptParts.tsx exports FirstTimeNoticeInfo and NoticeRollCard',
    scriptParts.includes('export const FirstTimeNoticeInfo') && scriptParts.includes('export const NoticeRollCard')
  );
  check(
    'ChapterScriptParts.tsx NoticeRollCard renders data-notice-card and data-first-time-notice',
    scriptParts.includes('data-notice-card') && scriptParts.includes('data-first-time-notice')
  );

  // 3. OnlineDay verification
  check(
    'OnlineDay.tsx imports NoticeRollCard and renders it for notice step',
    onlineDay.includes('NoticeRollCard') && onlineDay.includes("step.t === 'notice'")
  );

  // 4. OnlineCampfire verification
  check(
    'OnlineCampfire.tsx handles notice piece in hands with data-hand={h.kind}',
    onlineCampfire.includes("data-hand={h.kind}") && onlineCampfire.includes("h.kind === 'notice'")
  );

  if (failed) {
    console.log('Notice roll test FAILED');
    process.exit(1);
  } else {
    console.log('Notice roll test passed all 7 checks');
  }
})();
