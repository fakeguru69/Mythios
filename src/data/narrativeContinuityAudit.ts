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

export const NEW_CONTINUITY_LOOPHOLES: ContinuityLoopholeRecord[] = [
  {
    id: 'L1',
    ruleId: 'RULE_1_PLANT_PAYOFF',
    severity: 'HIGH',
    week: 2,
    day: 2,
    relatedCoord: 'W2D2 ↔ W1D3 / W1D6 / W2D1',
    title: 'Unplanted Ford Cart-Ruts Callback in Week 2 · Day 2 [PRESS ON: THE RUTS]',
    whyLoophole:
      'In Week 2 · Day 2 (The Mill), [PRESS ON: THE RUTS] says: "The left wheel pulls. You have seen that track before, coming down a muddy bank to a ford. It is the same cart." However, on Week 1 · Day 6 (The Ford), Tamsin walked on foot to the water\'s edge and was lifted into a boat—no cart tracks were planted at the ford! Cart-ruts were only seen at The Widow\'s Tooth (W1D3) and mentioned on the mill road (W2D1).',
    beforeText:
      'W2D2 [PRESS ON: THE RUTS]: "The left wheel pulls. You have seen that track before, coming down a muddy bank to a ford. It is the same cart." (While W1D6 had only foot-prints to a boat.)',
    proposedFixText:
      'W2D2 [PRESS ON: THE RUTS]: "The left wheel pulls—cutting a deeper groove on the near side. You saw that same lopsided rut in the bracken below the Widow\'s Tooth, and where the cart backed down the high bank above the ford. One cart, working both roads." (And plant the matching high-bank wheel mark on W1D6.)',
  },
  // L2 (the horn button's cuff) became canon on 14 Oct (Fake Guru) and now lives in the chapter data.
  {
    id: 'L3',
    ruleId: 'RULE_2_CLIFFHANGER_HOOK',
    severity: 'MEDIUM',
    week: 2,
    day: 3,
    relatedCoord: 'W2D2 pullLine → W2D3 opening',
    title: 'Unresolved Weather Cliffhanger Between Week 2 · Day 2 and Week 2 · Day 3',
    whyLoophole:
      'Week 2 · Day 2 ends with the urgency hook: "Upriver. The ruts are four nights old, and there is weather coming." Yet Week 2 · Day 3 (Upriver — Where the Tracks Stop) never mentions rain or weather threatening to wash out the four-night-old ruts.',
    beforeText:
      'W2D3 summaryLearned: "The cart took a hidden path into the hillside. A stranger died trying to pick a Seeker lock that opened for you." (No mention of the coming squall from Day 2\'s cliffhanger.)',
    proposedFixText:
      'W2D3 summaryLearned: "Just as the first cold river squall begins to blur the four-night-old ruts, you trace the dragging left wheel off the road onto a dry hidden path under the trees—where a stranger died a week ago with his pick jammed in a Seeker lock that opens at your touch."',
  },
  // L4, L5 and L6 were removed on 14 Oct 2026 (Fake Guru's fix plan, Phase 1):
  // L4 paid 300g for fights on Challenge-and-fight days (canon pays 0) and promised a
  // "strike first" rule the fight engine doesn't have; L5 said "seven left" a day early
  // (canon: 8 at W5D5, 7 after Gathering 5, 6 at W6D1); L6 rewrote the W4D1 escape
  // against canon (episode-4-the-water-stone.md).
];

export function getChapterWithContinuityFixes(
  chapter: WeekdayInventoryItem,
  appliedLoopholeIds: string[]
): WeekdayInventoryItem {
  const computedKind: 'CHALLENGE' | 'FIGHT' | 'CHALLENGE_AND_FIGHT' =
    chapter.challengeTitle && chapter.hasFight
      ? 'CHALLENGE_AND_FIGHT'
      : chapter.hasFight
      ? 'FIGHT'
      : 'CHALLENGE';
  const patched: WeekdayInventoryItem = { ...chapter, kind: computedKind };

  if (appliedLoopholeIds.includes('L1')) {
    if (patched.week === 1 && patched.day === 6) {
      patched.passBranchText =
        'High on the muddy bank above the ford, a heavy cart with a pulling left wheel backed down and turned north; below it, her small prints walk unhurt to the water\'s edge where a man lifted her into a boat.';
    }
    if (patched.week === 2 && patched.day === 2) {
      patched.pressOnDetail =
        'The left wheel pulls—cutting a deeper groove on the near side. You saw that same lopsided rut in the bracken below the Widow\'s Tooth, and where the cart backed down the high bank above the ford. It is the same cart.';
    }
  }

  if (appliedLoopholeIds.includes('L3')) {
    if (patched.week === 2 && patched.day === 3) {
      patched.summaryLearned =
        'Just as the first cold river squall begins to blur the four-night-old ruts, you trace the dragging left wheel onto a dry hidden path into the hillside. A stranger died trying to pick a Seeker lock that opened for you.';
    }
  }

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
