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
    description: 'Verifies that every chapter with hasFight: true carries the canonical +300g weekday fight reward and a clear first-strike condition.',
  },
];

export interface ContinuityLoopholeRecord {
  id: 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6';
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
  {
    id: 'L2',
    ruleId: 'RULE_1_PLANT_PAYOFF',
    severity: 'MEDIUM',
    week: 2,
    day: 2,
    relatedCoord: 'W2D2 → W2D5',
    title: 'Orphaned Physical Clue ("a horn button from the taker\'s sleeve") in Week 2 · Day 2',
    whyLoophole:
      'Passing THE MILLER\'S WIFE on Week 2 · Day 2 rewards a specific physical token ("she presses a horn button torn from the taker\'s sleeve into your hand"), but youHold is left empty on W2D2 and the button is never matched against any Order member later in Week 2.',
    beforeText:
      'W2D2 youHold: undefined. W2D5 passBranchText: "You wind him and tear a small black cloth circle from his coat before he flashes a shuttered lamp twice toward the shaft."',
    proposedFixText:
      'W2D2 youHold: "a horn button from the taker\'s sleeve". W2D5 passBranchText: "You wind him and tear a small black cloth circle from his coat—right beside a snapped thread at the cuff where a horn button was wrenched off at the mill."',
  },
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
  {
    id: 'L4',
    ruleId: 'RULE_5_DUAL_DAY_PARITY',
    severity: 'HIGH',
    week: 2,
    day: 3,
    relatedCoord: 'W2D3, W4D2, W4D5, W6D6',
    title: 'Four Dual Challenge+Fight Days Have fightReward: 0 Instead of Canonical +300g',
    whyLoophole:
      'Core Rules §4 & §12 specify that every weekday fight rewards +300g on win (+150g on loss). Four Dual Days that have both a Challenge and a Fight (W2D3 The Dog on the Chain, W4D2 The Men at the Ford, W4D5 The Man with the Boat, and W6D6 The One That Turned) had fightReward: 0 in the chapter table.',
    beforeText:
      'W2D3, W4D2, W4D5, W6D6: hasFight: true, fightReward: 0, and no explicit preFightChoice hint showing how the Challenge roll sets first strike.',
    proposedFixText:
      'Set fightReward: 300 on W2D3, W4D2, W4D5, and W6D6, and attach the Challenge-to-Fight first-strike rule note on each Dual Day Fight Card so passing the day\'s Challenge grants first strike in the fight.',
  },
  {
    id: 'L5',
    ruleId: 'RULE_3_TIMELINE_MATH',
    severity: 'HIGH',
    week: 5,
    day: 6,
    relatedCoord: 'W5D5 (8 strokes) → W5D6 → W6D1 (6 strokes)',
    title: 'Highwall Watch-Page Countdown Skips Stroke 7 Between Week 5 · Day 5 and Week 6 · Day 1',
    whyLoophole:
      'On Week 5 · Day 5, the watchmen cross out one chalk stroke at dusk "leaving eight." Then on Week 5 · Day 6 / Gathering 5, only one dusk passes—yet Week 6 · Day 1 opens with "Six nights left" (skipping seven).',
    beforeText:
      'W5D6 summaryLearned: "The fifth is in a hidden room inside the wall itself, with one slit window facing the hall. Tonight, nobody heard you." (Does not account for the 7th stroke before W6D1 opens at 6.)',
    proposedFixText:
      'W5D6 summaryLearned: "As dusk falls and the watchman in the square below draws chalk through the seventh stroke, you slip unseen along the wall walk: the fifth is inside the thickness of this wall." (And at W6D1 dusk, the sixth stroke is crossed out, keeping 9 → 8 → 7 → 6 → 5 → 4 → 3 → 2 → 1 exact.)',
  },
  {
    id: 'L6',
    ruleId: 'RULE_4_CHARACTER_WATCH',
    severity: 'MEDIUM',
    week: 4,
    day: 1,
    relatedCoord: 'W2G2 Prisoner → W4D1 (Under the Kiln)',
    title: 'Prisoner Rope-Cutting Watch Loophole in Week 4 · Day 1 (Under the Kiln)',
    whyLoophole:
      'At the start of Week 4 · Day 1, the robed prisoner\'s ropes are cut clean "within arm\'s reach, in the dark" while the whole party is standing in the room. Grounding the post by the passage mouth where the shuttered lantern was held while the party lifted Wren down the rope makes the geography watertight without tipping off the Episode 6 twist.',
    beforeText:
      'W4D1 passBranchText: "Heel, then toe, evenly spaced: his ropes were cut clean and he walked out at the pace of a man leaving a church."',
    proposedFixText:
      'W4D1 passBranchText: "Heel, then toe, evenly spaced: while all eyes were up on the scree lifting Wren down and Garrick held the shuttered lantern by the passage mouth, the prisoner\'s ropes at the outer post were parted clean—and he walked out at the pace of a man leaving a church."',
  },
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

  if (appliedLoopholeIds.includes('L2')) {
    if (patched.week === 2 && patched.day === 2) {
      patched.youHold = 'a horn button from the taker\'s sleeve';
    }
    if (patched.week === 2 && patched.day === 5) {
      patched.passBranchText =
        'You wind him and tear a small black cloth circle from his coat—right beside a snapped thread at the cuff where a horn button was wrenched off at the mill.';
      patched.youHold = 'the black circle · matched horn button cuff';
    }
  }

  if (appliedLoopholeIds.includes('L3')) {
    if (patched.week === 2 && patched.day === 3) {
      patched.summaryLearned =
        'Just as the first cold river squall begins to blur the four-night-old ruts, you trace the dragging left wheel onto a dry hidden path into the hillside. A stranger died trying to pick a Seeker lock that opened for you.';
    }
  }

  if (appliedLoopholeIds.includes('L4')) {
    if (
      (patched.week === 2 && patched.day === 3) ||
      (patched.week === 4 && patched.day === 2) ||
      (patched.week === 4 && patched.day === 5) ||
      (patched.week === 6 && patched.day === 6)
    ) {
      patched.fightReward = 300;
      patched.preFightChoice = {
        optA: `CLEAR [${patched.challengeTitle}] → YOU STRIKE FIRST`,
        optB: `FAIL [${patched.challengeTitle}] → ENEMY STRIKES FIRST`,
        noticeHint: `Dual-Day Rule: Clearing today's ${patched.challengeAttrs?.join(' / ')} Challenge lets you strike first in this +300g weekday fight.`,
      };
    }
  }

  if (appliedLoopholeIds.includes('L5')) {
    if (patched.week === 5 && patched.day === 6) {
      patched.summaryLearned =
        'As dusk falls and the watchman in the square below draws chalk through the seventh stroke (seven left), you cross the wall walk unseen: the fifth is in a hidden room inside the wall itself.';
      patched.youHold = 'the map · watch-board: seven left';
    }
  }

  if (appliedLoopholeIds.includes('L6')) {
    if (patched.week === 4 && patched.day === 1) {
      patched.passBranchText =
        'Heel, then toe, evenly spaced: while all eyes were up on the scree lifting Wren down and Garrick held the shuttered lantern by the passage mouth, the prisoner\'s ropes at the outer post were parted clean—and he walked out at the pace of a man leaving a church.';
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
  loopholeId?: 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6';
  status: 'WATER-TIGHT' | 'LOOPHOLE FLAGGED' | 'FIX PREVIEW ACTIVE';
}

export function buildContinuityChainMatrix(appliedLoopholeIds: string[]): ContinuityChainRow[] {
  return WEEKDAY_INVENTORY.map((item, idx) => {
    const patched = getChapterWithContinuityFixes(item, appliedLoopholeIds);
    const nextItem = WEEKDAY_INVENTORY[idx + 1];
    const nextDayTarget = nextItem
      ? `W${nextItem.week}D${nextItem.day} · ${nextItem.place}`
      : 'Week 6 · Day 7 Finale (His Hall)';

    let loopholeId: 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | undefined;
    if (item.week === 2 && item.day === 2) loopholeId = 'L1';
    else if (item.week === 2 && item.day === 5) loopholeId = 'L2';
    else if (item.week === 2 && item.day === 3) loopholeId = 'L3';
    else if (
      (item.week === 4 && item.day === 2) ||
      (item.week === 4 && item.day === 5) ||
      (item.week === 6 && item.day === 6)
    ) {
      loopholeId = 'L4';
    } else if (item.week === 5 && item.day === 6) loopholeId = 'L5';
    else if (item.week === 4 && item.day === 1) loopholeId = 'L6';

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
