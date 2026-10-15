import { WEEKDAY_INVENTORY, WeekdayInventoryItem } from './mythiosChaptersData';

export type ContinuityRuleId = 'RULE_1_PLANT_PAYOFF' | 'RULE_2_CLIFFHANGER_HOOK' | 'RULE_3_TIMELINE_MATH' | 'RULE_4_CHARACTER_WATCH' | 'RULE_5_DUAL_DAY_PARITY';

export interface ContinuityRuleMeta {
  id: ContinuityRuleId;
  shortCode: string;
  title: string;
  description: string;
}

export const CONTINUITY_RULES: ContinuityRuleMeta[] = [
  {
    id: 'RULE_1_PLANT_PAYOFF',
    shortCode: 'RULE 1',
    title: 'Plant → Payoff Ledger (plantTag & youHold)',
    description: 'Every physical token (youHold) or callback clue must be planted before it is referenced, and must pay off in a later chapter or Gathering.',
  },
  {
    id: 'RULE_2_CLIFFHANGER_HOOK',
    shortCode: 'RULE 2',
    title: 'Cliffhanger → Next-Day Opening Hook',
    description: 'Every Day N pullLine promise (destination, time window, weather threat, or immediate pursuit) must connect cleanly to Day N+1\'s opening scene.',
  },
  {
    id: 'RULE_3_TIMELINE_MATH',
    shortCode: 'RULE 3',
    title: 'Countdown & Timeline Math Verifier',
    description: 'Verifies night-counts and tally strokes across episodes (Fenmark 3 nights → Mill 4 nights; Reedham 8 notches; Highwall Watch-Page 9 → 8 → 7 → 6 → 5 → 4 → 3 → 2 → 1).',
  },
  {
    id: 'RULE_4_CHARACTER_WATCH',
    shortCode: 'RULE 4',
    title: 'Character Motivation & Watch Logic',
    description: 'Checks that enemy actions, prisoner custody (Weeks 2–4), and Garrick\'s subtle tells remain logically consistent across pass and fail branches.',
  },
  {
    id: 'RULE_5_DUAL_DAY_PARITY',
    shortCode: 'RULE 5',
    title: 'Dual-Day & Reward Parity (Challenge + Fight)',
    description: 'Verifies fight pay against Core Rules §12: a weekday fight pays 300g on a fight-only day (and on the W1D1 tutorial) and nothing on a day that also has a Challenge.',
  },
];

export interface ContinuityLoopholeRecord {
  id: 'L1' | 'L3';
  ruleId: ContinuityRuleId;
  severity: 'HIGH' | 'MEDIUM';
  week: number;
  day: number;
  relatedCoord: string;
  title: string;
  whyLoophole: string;
  beforeText: string;
  proposedFixText: string;
}

// Every patch is now retired. The weekday plays canon's own text (src/data/chapterScripts.ts), so:
// - L1 (15 Oct) was wrong: canon W1D6 already plants the cart at the ford ("The near bank is churned
//   to mud. A cart went over"); only the build's short chapter summary had lost it.
// - L3 (15 Oct) patched a summary line the day no longer shows. W2D3 not mentioning Day 2's
//   "weather coming" is a point in canon itself, reported to Fake Guru rather than patched.
// - L2 became canon on 14 Oct; L4, L5 and L6 were removed on 14 Oct (Phase 1 of the fix plan).
export const NEW_CONTINUITY_LOOPHOLES: ContinuityLoopholeRecord[] = [];

export function getChapterWithContinuityFixes(
  chapter: WeekdayInventoryItem,
  _appliedLoopholeIds: string[]
): WeekdayInventoryItem {
  const computedKind: 'CHALLENGE' | 'FIGHT' | 'CHALLENGE_AND_FIGHT' =
    chapter.challengeTitle && chapter.hasFight
      ? 'CHALLENGE_AND_FIGHT'
      : chapter.hasFight
      ? 'FIGHT'
      : 'CHALLENGE';
  const patched: WeekdayInventoryItem = { ...chapter, kind: computedKind };

  return patched;
}

export interface ContinuityChainRow {
  week: number;
  day: number;
  place: string;
  question: string;
  plantOrToken: string;
  cliffhangerPull: string;
  nextDayTarget: string;
  loopholeId?: 'L1' | 'L3';
  status: 'WATER-TIGHT' | 'LOOPHOLE FLAGGED' | 'FIX PREVIEW ACTIVE';
}

export function buildContinuityChainMatrix(appliedLoopholeIds: string[]): ContinuityChainRow[] {
  return WEEKDAY_INVENTORY.map((item, idx) => {
    const patched = getChapterWithContinuityFixes(item, appliedLoopholeIds);
    const nextItem = WEEKDAY_INVENTORY[idx + 1];
    const nextDayTarget = nextItem
      ? `W${nextItem.week}D${nextItem.day} · ${nextItem.place}`
      : 'Week 6 · Day 7 Finale (His Hall)';

    let loopholeId: 'L1' | 'L3' | undefined;
    if (item.week === 2 && item.day === 2) loopholeId = 'L1';
    else if (item.week === 2 && item.day === 3) loopholeId = 'L3';

    const status: ContinuityChainRow['status'] = !loopholeId
      ? 'WATER-TIGHT'
      : appliedLoopholeIds.includes(loopholeId)
      ? 'FIX PREVIEW ACTIVE'
      : 'LOOPHOLE FLAGGED';

    return {
      week: patched.week,
      day: patched.day,
      place: patched.place,
      question: patched.question,
      plantOrToken: patched.youHold || patched.plantTag || '— (Investigation step)',
      cliffhangerPull: patched.pullLine,
      nextDayTarget,
      loopholeId,
      status,
    };
  });
}
