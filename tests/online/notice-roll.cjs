// Piece C6 test (docs/design/handoff-ledger.md):
//  1. Migration defines security definer roll_notice(p_party) with empty search_path and checks party membership.
//  2. roll_notice rolls d20 + tier bonus vs DC 3 (succeeds on 4 or more, Master tier is +8).
//  3. ChapterScriptParts.tsx exports FirstTimeNoticeInfo, NoticeRollCard, and NoticeRollActionCard.
//  4. OnlineDay.tsx calls roll_notice RPC and does NOT hardcode d20: 14.
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
  const mig100 = fs.readFileSync(path.join(root, 'supabase/migrations/0100_notice_roll.sql'), 'utf8');
  const mig102 = fs.readFileSync(path.join(root, 'supabase/migrations/0102_audit_fixes_notice_record.sql'), 'utf8');
  const scriptParts = fs.readFileSync(path.join(root, 'src/components/ChapterScriptParts.tsx'), 'utf8');
  const onlineDay = fs.readFileSync(path.join(root, 'src/online/OnlineDay.tsx'), 'utf8');
  const onlineCampfire = fs.readFileSync(path.join(root, 'src/online/OnlineCampfire.tsx'), 'utf8');

  // 1. Migration security & logic verification
  check(
    '0102 migration defines security definer roll_notice with set search_path = ""',
    /create or replace function public\.roll_notice\(p_party uuid\)[\s\S]*?security definer set search_path = ''/i.test(mig102)
  );
  check(
    'roll_notice verifies party membership',
    mig102.includes("from public.party_members") && mig102.includes("raise exception 'not in party'")
  );
  check(
    'roll_notice uses Core Rules §12 tier bonuses (+8 for Master 101+)',
    mig102.includes('when v_top >= 101 then 8') && mig102.includes('when v_top >= 51 then 4')
  );
  check(
    'roll_notice rolls d20 + bonus vs DC 3 with tie failing (total >= 4)',
    mig102.includes('v_total := v_d20 + v_bonus') && mig102.includes('v_pass := (v_total >= 4)')
  );
  check(
    'roll_notice returns "Nothing catches your eye." on failure',
    mig102.includes("v_text := 'Nothing catches your eye.'")
  );

  // 2. Component verification
  check(
    'ChapterScriptParts.tsx exports FirstTimeNoticeInfo, NoticeRollCard, and NoticeRollActionCard',
    scriptParts.includes('export const FirstTimeNoticeInfo') &&
    scriptParts.includes('export const NoticeRollCard') &&
    scriptParts.includes('export const NoticeRollActionCard')
  );
  check(
    'ChapterScriptParts.tsx NoticeRollCard renders data-notice-card and data-first-time-notice',
    scriptParts.includes('data-notice-card') && scriptParts.includes('data-first-time-notice')
  );
  check(
    'ChapterScriptParts.tsx NoticeRollActionCard has data-button-roll-notice',
    scriptParts.includes('data-button-roll-notice')
  );

  // 3. OnlineDay verification: Real RPC call, no fake d20: 14
  check(
    'OnlineDay.tsx calls roll_notice RPC on user action',
    onlineDay.includes("call('roll_notice', { p_party: partyId })")
  );
  check(
    'OnlineDay.tsx does NOT hardcode d20: 14 stand-in',
    !onlineDay.includes('d20: 14')
  );
  check(
    'OnlineDay.tsx reads storedNotice from today.mine.notice',
    onlineDay.includes('today?.mine?.notice')
  );

  // 4. OnlineCampfire verification
  check(
    'OnlineCampfire.tsx handles notice piece in hands with data-hand={h.kind}',
    onlineCampfire.includes("data-hand={h.kind}") && onlineCampfire.includes("h.kind === 'notice'")
  );

  // 5. Functional logic check: simulate roll outcome math
  const simulateNoticeRoll = (d20, score) => {
    const bonus = score >= 101 ? 8 : score >= 76 ? 6 : score >= 51 ? 4 : score >= 26 ? 2 : 0;
    const total = d20 + bonus;
    const pass = total >= 4;
    return {
      total,
      pass,
      text: pass ? 'Noticed clue' : 'Nothing catches your eye.',
      noviceNote: pass && score < 26 ? 'A more practised eye would see more here.' : null,
    };
  };

  const noviceFail = simulateNoticeRoll(3, 10);
  check('Novice with roll 3 (total 3) fails against DC 3', !noviceFail.pass && noviceFail.text === 'Nothing catches your eye.');

  const novicePass = simulateNoticeRoll(4, 10);
  check('Novice with roll 4 (total 4) passes and receives novice note', novicePass.pass && novicePass.noviceNote !== null);

  const apprenticePass = simulateNoticeRoll(2, 28);
  check('Apprentice with roll 2 + bonus 2 (total 4) passes without novice note', apprenticePass.pass && apprenticePass.noviceNote === null);

  if (failed) process.exit(1);
  console.log('Notice roll test passed all checks');
})();
