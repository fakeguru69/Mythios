import { AttributeName } from './mythiosRulesData';
import { WEEKDAY_INVENTORY, WeekdayInventoryItem } from './mythiosChaptersData';
import { SEEKER_FRAGMENTS } from './mythiosFragments';
import { getPublicFanOutClue } from './campfireDaysData';

export interface TeammateBoardFinding {
  id: string;
  member: 'MEI' | 'DEV' | 'ARJUN';
  author: string;
  role: string;
  roleTag: string;
  color: string;
  title: string;
  clueTitle: string;
  summary: string;
  clueText: string;
  garrickCrossCheckPrompt: string;
  memberFollowUpReply: string;
}

export interface DayFanOutData {
  leadInParagraph1: string;
  leadInParagraph2: string;
  branchA: FanOutBranchChallenge;
  branchB: FanOutBranchFight;
  branchC: FanOutBranchChallenge;
  teammateFindings: TeammateBoardFinding[];
  garrickSynthesisWhenPlayerShares: (playerClueText: string, fragWord1: string) => string;
}

/**
 * 1. DAILY RECAP AT THE START OF EVERY DAY (For Async Continuity)
 * Gives players who missed yesterday (or are logging in fresh) a crystal-clear
 * bridge from yesterday's landmark to today's arrival.
 */
export interface FanOutBranchChallenge extends FanOutBranchOption {
  kind: 'CHALLENGE';
  id: 'BRANCH_A' | 'BRANCH_C';
  summaryLabel: string;
  playerDeclareText: string;
  attrs: [AttributeName, AttributeName];
  attr1ActionTitle: string;
  attr1ActionDesc: string;
  attr2ActionTitle: string;
  attr2ActionDesc: string;
}

export interface FanOutBranchFight extends FanOutBranchOption {
  kind: 'FIGHT';
  id: 'BRANCH_B';
  summaryLabel: string;
  playerDeclareText: string;
  winParagraph1: string;
  winParagraph2: string;
}

export function getFanOutEncounterData(dayData: WeekdayInventoryItem): DayFanOutData {
  const place = dayData.place;
  const placeShort = place.replace(/^The\s+/i, '');
  const dayFrag = SEEKER_FRAGMENTS.find(
    (f) => f.week === dayData.week && f.day === dayData.day
  );
  const word1 = dayFrag?.word1 || 'LOCK';
  const firstLetter1 = (word1[0] || 'L').toUpperCase();

  const isW1 = dayData.week === 1;
  const isW2 = dayData.week === 2;
  const isW1D1 = dayData.week === 1 && dayData.day === 1;
  const factionName = isW1
    ? 'the quiet riders'
    : isW2
    ? 'the hooded watchers'
    : 'the Order';
  const scoutName = isW1
    ? 'Rear-Guard Lookout'
    : isW2
    ? 'Hooded Rear-Guard Scout'
    : 'Order Rear-Guard Scout';
  const campHostRef = 'Garrick expects you back at the campfire';

  // Canonical Fan Out clue from campfire-days.json (title + text verbatim)
  const canonicalClue = getPublicFanOutClue(dayData.week, dayData.day);

  const leadInParagraph1 = isW1D1
    ? `With today’s carved Seeker Fragment safely tucked into your satchel beside the torn stub naming The Hollow Wake Inn, you stand alone at ${place} as long purple shadows stretch across the wet timber.`
    : `With today’s carved Seeker Fragment safely tucked into your satchel, the four of you pause at ${place} as long purple shadows stretch across the ground. There is still half an hour of grey light left before ${campHostRef}.`;
  const leadInParagraph2 = isW1D1
    ? `Before you follow the drove road north toward The Hollow Wake Inn, you can fan out on a Challenge or Fight branch to uncover today’s clue ("${canonicalClue.title}") and the Seeker Fragment first-letter hint, or head straight on.`
    : `Before nightfall, each friend can take a Fan Out branch (Challenge or Fight — both bring back today’s clue "${canonicalClue.title}" and the Seeker Fragment first-letter hint) or choose Head to Campfire (bringing no clue and learning it from the board).`;

  const branchA: FanOutBranchChallenge = {
    kind: 'CHALLENGE',
    branchType: 'CHALLENGE',
    id: 'BRANCH_A',
    title: `CHALLENGE: ${canonicalClue.title.toUpperCase()}`,
    badge: '🎯 CHALLENGE · +150G & CLUE',
    color: '#4FD1C5',
    summaryLabel: `Investigate ${placeShort} to uncover "${canonicalClue.title}" and the first-letter Fragment hint.`,
    label: `Investigate ${placeShort} to uncover "${canonicalClue.title}" and the first-letter Fragment hint.`,
    playerDeclareText: `Before the light goes at ${place}, I’m fanning out to examine "${canonicalClue.title}".`,
    playerDeclaration: `Before the light goes at ${place}, I’m fanning out to examine "${canonicalClue.title}".`,
    arrivalParagraph1: isW1D1
      ? `Before leaving ${place} behind, you move in close to search the ground in the fading grey light.`
      : `You move in close at ${place} in the fading grey light before joining the others at the fire.`,
    arrivalParagraph2: `Trace the physical signs with Craft or piece the scene together with Intellect to uncover "${canonicalClue.title}" and reveal the starting letter "${firstLetter1}" for today’s Seeker Fragment.`,
    challengeTitle: canonicalClue.title.toUpperCase(),
    attrs: ['Craft', 'Intellect'],
    challengeAttrs: ['Craft', 'Intellect'],
    challengeObstacle: 34 + dayData.week * 5,
    attr1ActionTitle: `EXAMINE WITH CRAFT`,
    attr1ActionDesc: `Use Craft to read the physical details at ${placeShort}.`,
    attr2ActionTitle: `EXAMINE WITH INTELLECT`,
    attr2ActionDesc: `Use Intellect to read what happened at ${placeShort}.`,
    passParagraph1: `${canonicalClue.text}`,
    passParagraph2: `Alongside "${canonicalClue.title}", you trace the Seeker mason’s guide-letter confirming that today’s first Fragment lock-word begins with "${firstLetter1}".`,
    failParagraph1: `The fading light and shifting footing at ${place} work against you before you can lock the trace down.`,
    failParagraph2: `With night closing in over ${place}, you head toward the fire to check the board.`,
    soloClueTitle: canonicalClue.title,
    soloClueText: canonicalClue.text,
  };

  const branchBWin1 = `${canonicalClue.text}`;
  const branchBWin2 = `Driving the ${scoutName.toLowerCase()} back from ${place} also uncovers the Seeker mason’s guide-letter confirming that today’s first Fragment lock-word begins with "${firstLetter1}".`;

  const branchB: FanOutBranchFight = {
    kind: 'FIGHT',
    branchType: 'FIGHT',
    id: 'BRANCH_B',
    title: `FIGHT: ${canonicalClue.title.toUpperCase()}`,
    badge: '⚔️ FIGHT · +150G & CLUE',
    color: '#E5C158',
    summaryLabel: `Drive off the ${scoutName.toLowerCase()} at ${placeShort} to uncover "${canonicalClue.title}" and the first-letter Fragment hint.`,
    label: `Drive off the ${scoutName.toLowerCase()} at ${placeShort} to uncover "${canonicalClue.title}" and the first-letter Fragment hint.`,
    playerDeclareText: `I’ve spotted a ${scoutName.toLowerCase()} at ${place}—I’m moving in before they slip away.`,
    playerDeclaration: `I’ve spotted a ${scoutName.toLowerCase()} at ${place}—I’m moving in before they slip away.`,
    arrivalParagraph1: `Moving along the shadowed edge of ${place}, you catch the scrape of a boot where a lone ${scoutName} has lingered behind.`,
    arrivalParagraph2: `Drive them off in a fast skirmish to uncover "${canonicalClue.title}" and the starting letter "${firstLetter1}" for today’s Seeker Fragment.`,
    enemyName: `${scoutName} at ${placeShort}`,
    enemyHp: 70,
    enemyDef: Math.max(16, 17 + dayData.week),
    enemyAtk: 12 + dayData.week,
    winParagraph1: branchBWin1,
    winParagraph2: branchBWin2,
    passParagraph1: branchBWin1,
    passParagraph2: branchBWin2,
    failParagraph1: `Bruised from the exchange of steel in the fading light, you lose sight of the ${scoutName.toLowerCase()} as they slip away from ${place}.`,
    failParagraph2: `With night closing in fast over ${place}, you bind your scrape and head toward the fire.`,
    soloClueTitle: canonicalClue.title,
    soloClueText: canonicalClue.text,
  };

  const branchC: FanOutBranchChallenge = {
    kind: 'CHALLENGE',
    branchType: 'CAMPFIRE',
    id: 'BRANCH_C',
    title: `HEAD TO CAMPFIRE`,
    badge: '🔥 HEAD TO CAMPFIRE · NO CLUE',
    color: '#F0A552',
    summaryLabel: `Head straight to the fire without fanning out. You bring no clue and learn "${canonicalClue.title}" from the board.`,
    label: `Head straight to the fire without fanning out. You bring no clue and learn "${canonicalClue.title}" from the board.`,
    playerDeclareText: `I’m heading straight to the Campfire to see what’s on the board.`,
    playerDeclaration: `I’m heading straight to the Campfire to see what’s on the board.`,
    arrivalParagraph1: `You leave ${place} as dusk settles and walk straight toward the firelight.`,
    arrivalParagraph2: `You bring no Fan Out clue of your own tonight and will read "${canonicalClue.title}" from the Campfire board.`,
    challengeTitle: `HEAD TO CAMPFIRE`,
    attrs: ['Agility', 'Aim'],
    challengeAttrs: ['Agility', 'Aim'],
    challengeObstacle: 0,
    attr1ActionTitle: 'HEAD TO CAMPFIRE',
    attr1ActionDesc: `Walk straight to the Campfire and learn today’s clue from the board.`,
    attr2ActionTitle: 'HEAD TO CAMPFIRE',
    attr2ActionDesc: `Walk straight to the Campfire and learn today’s clue from the board.`,
    passParagraph1: `You arrive at the fire as the kettle goes on. You brought no Fan Out clue of your own and will read "${canonicalClue.title}" from the board.`,
    passParagraph2: ``,
    failParagraph1: `You arrive at the fire and will read "${canonicalClue.title}" from the board.`,
    failParagraph2: ``,
    soloClueTitle: '',
    soloClueText: '',
  };

  const teammateFindings: TeammateBoardFinding[] = [
    {
      id: `tf-mei-${dayData.week}-${dayData.day}`,
      member: 'MEI',
      author: 'Mei',
      role: 'SAGE · INTELLECT',
      roleTag: 'Fan Out Clue',
      color: '#F49CBB',
      title: canonicalClue.title,
      clueTitle: canonicalClue.title,
      summary: canonicalClue.text,
      clueText: canonicalClue.text,
      garrickCrossCheckPrompt: '',
      memberFollowUpReply: '',
    },
    {
      id: `tf-dev-${dayData.week}-${dayData.day}`,
      member: 'DEV',
      author: 'Dev',
      role: 'ARCHER · AIM',
      roleTag: 'Fan Out Clue',
      color: '#5BC0EB',
      title: canonicalClue.title,
      clueTitle: canonicalClue.title,
      summary: canonicalClue.text,
      clueText: canonicalClue.text,
      garrickCrossCheckPrompt: '',
      memberFollowUpReply: '',
    },
    {
      id: `tf-arjun-${dayData.week}-${dayData.day}`,
      member: 'ARJUN',
      author: 'Arjun',
      role: 'ARTIFICER · CRAFT',
      roleTag: 'Fan Out Clue',
      color: '#4FD1C5',
      title: canonicalClue.title,
      clueTitle: canonicalClue.title,
      summary: canonicalClue.text,
      clueText: canonicalClue.text,
      garrickCrossCheckPrompt: '',
      memberFollowUpReply: '',
    },
  ];

  const garrickSynthesisWhenPlayerShares = () => '';

  return {
    leadInParagraph1,
    leadInParagraph2,
    branchA,
    branchB,
    branchC,
    teammateFindings,
    garrickSynthesisWhenPlayerShares,
  };
}

export function getPartyBoardCluesForDay(week: number, day: number): TeammateBoardFinding[] {
  const ch =
    WEEKDAY_INVENTORY.find((d) => d.week === week && d.day === day) || WEEKDAY_INVENTORY[0];
  return getFanOutEncounterData(ch).teammateFindings;
}

export function getSoloFanOutEncounter(
  week: number,
  day: number
): {
  soloClueTitle: string;
  soloClueText: string;
  seekerFirstLetter: string;
} {
  const canonicalClue = getPublicFanOutClue(week, day);
  const frag =
    SEEKER_FRAGMENTS.find((f) => f.week === week && f.day === day) || SEEKER_FRAGMENTS[0];
  return {
    soloClueTitle: canonicalClue.title,
    soloClueText: canonicalClue.text,
    seekerFirstLetter: (frag.word1[0] || 'L').toUpperCase(),
  };
}

export interface FanOutBranchOption {
  id: string;
  branchType: 'CHALLENGE' | 'FIGHT' | 'CAMPFIRE';
  title: string;
  badge: string;
  color: string;
  label: string;
  playerDeclaration: string;
  arrivalParagraph1: string;
  arrivalParagraph2: string;
  challengeTitle?: string;
  challengeAttrs?: [AttributeName, AttributeName];
  challengeObstacle?: number;
  enemyName?: string;
  enemyHp?: number;
  enemyDef?: number;
  enemyAtk?: number;
  passParagraph1?: string;
  passParagraph2?: string;
  failParagraph1?: string;
  failParagraph2?: string;
  soloClueTitle?: string;
  soloClueText?: string;
}
