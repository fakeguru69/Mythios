import React, { useState } from 'react';
import {
  AttributeName,
  ATTRIBUTE_META,
  CLASS_META,
  ClassName,
  EPISODE_NUMBERS,
  GEAR_TABLE,
  getTierInfo,
  WEEKDAY_DC_BY_WEEK,
  PartyFriend,
  calculateAttributeGrowth,
  resolveChallengeRoll,
  challengeSucceedOn,
} from '../data/mythiosRulesData';
import {
  GOLD_CHALLENGE_WIN,
  GOLD_CHALLENGE_LOSS,
  GOLD_PRESS_ON_WIN,
  GOLD_UNITED_EFFORT_WIN,
  GOLD_LOOK_CLOSER_WIN,
  GOLD_MATCH_BASE_PER_PICK,
  GOLD_MATCH_PERFECT_PER_PICK,
  GOLD_FAN_OUT_CACHE_WIN,
  GOLD_DETOUR_FIGHT_WIN,
  GOLD_RIDDLE_BONUS,
  GOLD_GATHERING_BATTLE_REWARDS,
} from '../data/economy';
import { WEEKDAY_INVENTORY } from '../data/mythiosChaptersData';
import { SEEKER_FRAGMENTS } from '../data/mythiosFragments';
import { GATHERINGS_DATA } from '../data/mythiosGatheringsAndAudit';
import { getChapterWithContinuityFixes } from '../data/narrativeContinuityAudit';
import { routeGarrickMessage, GarrickRouteResult } from '../data/garrickRouter';
import { getDailyCampfireRiddles } from '../data/garrickDailyRiddles';
import {
  getDailyRecap,
  getOpeningProseParagraphs,
  getChallengePassProseParagraphs,
  getChallengeFailProseParagraphs,
  getRecoveryProseParagraphs,
  getFightWinProseParagraphs,
  getFanOutEncounterData,
  FanOutBranchOption,
} from '../data/soloLandmarkProse';
import {
  getGarrickCampfireDailyPrompt,
  getBoardCrossCheckSynthesis,
  buildBoardClueDiscussionExchange,
} from '../data/garrickCampfirePrompts';
import { getCampfireDayEntry } from '../data/campfireDaysData';
import { CampfireEveningView } from './CampfireEveningView';

/* ============================================================================
   CHAT -> MINE (STORY TAB VIEW)
   ============================================================================ */

export interface PinnedPartyClue {
  id: string;
  week: number;
  day: number;
  place: string;
  author: string;
  authorClass: ClassName;
  tag: string;
  text: string;
}

interface StoryTabViewProps {
  currentWeek: number;
  currentDay: number;
  onSelectWeekDay: (w: number, d: number) => void;
  showChapterPicker?: boolean;
  onSetShowChapterPicker?: (open: boolean) => void;
  characterName: string;
  characterClass: ClassName;
  attributes: Record<AttributeName, number>;
  weaponLevel: number;
  armorLevel: number;
  gold: number;
  relics: Record<string, number>;
  onEarnGold: (amt: number) => void;
  onGainAttribute: (attr: AttributeName, delta: number, isNat20?: boolean) => void;
  onGainRelic: (relicType: string, count: number) => void;
  onUseRelic: (relicType: string) => void;
  onTellParty: (clueText: string) => void;
  onSetStoreLocked: (locked: boolean) => void;
  ledgerOpened: boolean;
  onOpenLedger: () => void;
  appliedLoopholeIds: string[];
  completedDays: string[];
  onSealDay: (week: number, day: number, summaryNote: string) => void;
  pinnedClues: PinnedPartyClue[];
  onPinClue: (clue: Omit<PinnedPartyClue, 'id'>) => void;
  onJumpToGathering: (week: number) => void;
  onJumpToCampfire: (week: number, day: number) => void;
  onOpenSeekerInBag: (week: number, day: number) => void;
  solvedWords: Record<string, { w1?: string; w2?: string }>;
  seekerFirstLetterHints?: Record<string, boolean>;
  onUnlockSeekerHint?: (fragId: string) => void;
  soloFanOutClues?: Record<string, { title: string; text: string; firstLetter: string }>;
  onRecordSoloFanOutClue?: (
    dayKey: string,
    clue: { title: string; text: string; firstLetter: string }
  ) => void;
  sharedFanOutClues?: Record<string, { title: string; text: string; firstLetter: string }>;
  onShareFanOutClue?: (
    dayKey: string,
    clue: { title: string; text: string; firstLetter: string }
  ) => void;
  privateTheoryPromptsByDay?: Record<
    string,
    { reading: 'A' | 'B' | 'NEITHER'; customLine?: string }
  >;
  onSavePrivateTheoryPrompt?: (
    dayKey: string,
    payload: { reading: 'A' | 'B' | 'NEITHER'; customLine?: string }
  ) => void;
}

interface RollState {
  d20: number;
  attr: AttributeName;
  attrPoints: number;
  tierBonus: number;
  relicBonus: number;
  total: number;
  dc: number;
  succeedOn: number;
  margin: number;
  cleared: boolean;
  growth?: number;
}

// Core Rules §12a: the server rolls every die. Fall back to a local d20 only if
// the server can't be reached; the pass/fail rule is the same either way.
async function rollChallengeD20(dc: number, bonus: number, relicBonus: number): Promise<number> {
  try {
    const res = await fetch('/api/roll-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dc, bonus, relicBonus }),
    });
    if (res.ok) {
      const data = await res.json();
      if (Number.isInteger(data.roll) && data.roll >= 1 && data.roll <= 20) {
        return data.roll;
      }
    }
  } catch {
    // Server unreachable: use the local fallback below.
  }
  return Math.floor(Math.random() * 20) + 1;
}

interface FightRoundEntry {
  round: number;
  d20: number;
  playerAtk: number;
  enemyDef: number;
  margin: number;
  hit: boolean;
  dmgToEnemy: number;
  enemyHpBefore: number;
  enemyHpAfter: number;
  enemyD20: number;
  enemyAtk: number;
  playerArmor: number;
  enemyMargin: number;
  enemyHit: boolean;
  dmgToPlayer: number;
  playerHpBefore: number;
  playerHpAfter: number;
}

// Helper: Short D&D Action Title for left side of each Challenge Choice (#13)
function getChallengeActionTitle(
  attr: AttributeName,
  place: string
): string {
  if (place.toLowerCase().includes('mill') && attr === 'Charm') {
    return 'SPEAK GENTLY';
  }
  if (place.toLowerCase().includes('mill') && attr === 'Intellect') {
    return 'PIECE TOGETHER CLUES';
  }
  switch (attr) {
    case 'Charm':
      return 'WIN THEIR TRUST';
    case 'Intellect':
      return 'STUDY THE EVIDENCE';
    case 'Might':
      return 'FORCE THE OBSTACLE';
    case 'Craft':
      return 'INSPECT THE MECHANISM';
    case 'Agility':
      return 'SLIP PAST UNSEEN';
    case 'Aim':
      return 'READ THE TRACKS';
  }
}

// Helper: 1-line D&D narrative description for each Attribute choice on a Challenge Card
function getChallengeActionNarrative(
  attr: AttributeName,
  place: string,
  challengeTitle?: string
): string {
  if (place.toLowerCase().includes('mill') && attr === 'Charm') {
    return "Speak gently so she trusts you with Corin's name.";
  }
  if (place.toLowerCase().includes('mill') && attr === 'Intellect') {
    return 'Piece together the timeline from the broken latch and ruts.';
  }
  const target = (challengeTitle || place || 'the scene').toLowerCase();
  switch (attr) {
    case 'Charm':
      return `Speak gently and win trust at ${target} so the truth comes out willingly.`;
    case 'Intellect':
      return `Piece together the timeline and physical clues left around ${target}.`;
    case 'Might':
      return `Force your way through the obstacle at ${target} with raw strength.`;
    case 'Craft':
      return `Examine the mechanism and stonework at ${target} with a maker's eye.`;
    case 'Agility':
      return `Move silently along the blind side of ${target} without being spotted.`;
    case 'Aim':
      return `Read the tracks and sightlines from a distance before approaching ${target}.`;
  }
}

interface DecisionChoiceOption {
  title: string;
  badge: string;
  color: string;
  label: string;
  outcomeText: string;
}

// Helper: 2-line guided recovery choices when a player fails a Challenge (#1, #2, #3, #20, #21)
function getRecoveryOptions(place: string): DecisionChoiceOption[] {
  if (place.toLowerCase().includes('mill')) {
    return [
      {
        title: 'MEND THE BROKEN LATCH',
        badge: 'CRAFT · PARTY',
        color: '#F6BD60', // Craft Amber
        label: 'Wait until dusk and have Arjun mend her broken door-latch so she opens up.',
        outcomeText:
          'At dusk, Arjun quietly mends the broken door-latch. Seeing the repair, the Miller’s Wife softens and opens the door a crack to tell you what happened.',
      },
      {
        title: 'SEARCH THE WHEEL FOOTING',
        badge: 'INSPECT · TRAIL',
        color: '#4FD1C5', // Aim Teal
        label: 'Circle behind the mill-wheel to inspect the cart ruts and stone base.',
        outcomeText:
          'You circle behind the mill-house to inspect the four-night-old cart ruts and the ancient stone footing beneath the water-wheel.',
      },
    ];
  }
  return [
    {
      title: 'SEARCH THE PERIMETER',
      badge: 'PARTY · RECON',
      color: '#4FD1C5', // Aim Teal
      label: `Sweep the perimeter of ${place} with your companions for missed signs.`,
      outcomeText: `Working together around ${place}, you and your companions piece together the trail the direct approach missed.`,
    },
    {
      title: 'TRACE THE STONE MARKS',
      badge: 'INSPECT · CLUE',
      color: '#5BC0EB', // Sky Blue
      label: `Crouch beside the weathered stonework at ${place} to read the chisel marks.`,
      outcomeText: `Crouching beside the worn stone at ${place}, you trace the faint chisel marks left behind in the dust.`,
    },
  ];
}

interface NextMoveChoiceOption {
  title: string;
  badge: string;
  color: string;
  label: string;
  playerText: string;
  mythiosReply: string;
  outcomeTag: string;
  rewardType?: 'AIM' | 'GOLD' | 'CAMPFIRE';
}

// Helper: 3 genuinely distinct end-of-scene choices with matched title & badge colors (#1, #2)
function getNextMoveOptions(
  place: string,
  pullLine: string,
  week: number = 1
): NextMoveChoiceOption[] {
  const sentryLabel = week <= 2 ? 'hooded lookouts' : 'Order sentries';
  const sealLabel =
    week === 1
      ? 'a black wax seal'
      : week <= 4
      ? 'a scraped silver mark'
      : 'a Highwall wax seal';
  return [
    {
      title: 'SCOUT THE FORWARD TRAIL',
      badge: '+1 AIM · RECON',
      color: '#4FD1C5', // Aim Teal
      label: `Follow the fresh wheel-ruts a quarter-mile ahead to spot ${sentryLabel}.`,
      playerText: `I'll scout a quarter-mile ahead from ${place} while the wheel-ruts are still clear.`,
      mythiosReply: `Crouching beside the milestone north of ${place}, you spot a fresh tally-notch marking their night route (+1 Aim earned). ${pullLine}`,
      outcomeTag: '✓ Patrol Route Marked (+1 Aim)',
      rewardType: 'AIM',
    },
    {
      title: 'SEARCH FOR HIDDEN CACHE',
      badge: '+25G · LOOT',
      color: '#E5C158', // Warm Gold
      label: `Pry beneath the loose flagstones at ${place} for anything left behind.`,
      playerText: `Before we leave ${place}, I'll check under the loose flagstones by the wall.`,
      mythiosReply: `Prying up the mossy flagstone at ${place}, you uncover a dropped coin-pouch (+25g earned) stamped with ${sealLabel}!`,
      outcomeTag: '✓ Hidden Cache Found (+25g)',
      rewardType: 'GOLD',
    },
    {
      title: 'RETURN TO THE CAMPFIRE',
      badge: 'CAMPFIRE HOST',
      color: '#F0A552', // Hearth Amber
      label: 'Head straight back to the woodsmoke where Garrick and your party wait.',
      playerText: `Let's head straight back to the campfire and lay this fragment beside the others.`,
      mythiosReply: `You cover your tracks at ${place} and follow the woodsmoke back to camp, where Garrick has the kettle on the fire and your companions are waiting to compare notes.`,
      outcomeTag: '✓ Back at Campfire',
      rewardType: 'CAMPFIRE',
    },
  ];
}

export const StoryTabView: React.FC<StoryTabViewProps> = ({
  currentWeek,
  currentDay,
  onSelectWeekDay,
  showChapterPicker = false,
  onSetShowChapterPicker,
  characterName,
  characterClass,
  attributes,
  weaponLevel,
  armorLevel,
  relics,
  onEarnGold,
  onGainAttribute,
  onUseRelic,
  onSealDay,
  appliedLoopholeIds = [],
  onJumpToGathering,
  onJumpToCampfire,
  onOpenSeekerInBag,
  solvedWords,
  seekerFirstLetterHints = {},
  onUnlockSeekerHint,
  onRecordSoloFanOutClue,
  onShareFanOutClue,
  privateTheoryPromptsByDay = {},
  onSavePrivateTheoryPrompt,
  completedDays = [],
}) => {
  const [selectedAttr, setSelectedAttr] = useState<AttributeName | null>(null);
  const [privatePromptCustomText, setPrivatePromptCustomText] = useState('');
  const [useAttrRelic, setUseAttrRelic] = useState(false);
  const [rollOutcome, setRollOutcome] = useState<RollState | null>(null);
  const [recoveryChoice, setRecoveryChoice] = useState<DecisionChoiceOption | null>(null);
  const [nextMoveChoice, setNextMoveChoice] = useState<NextMoveChoiceOption | null>(null);

  // Mandatory Detour Skirmish state when failing a Challenge on a Challenge-only day (#2)
  const [detourFightRounds, setDetourFightRounds] = useState<FightRoundEntry[]>([]);
  const [detourFightDone, setDetourFightDone] = useState(false);
  const [isRollingDetourRound, setIsRollingDetourRound] = useState(false);

  // Full Interactive Fanning Out Solo Encounter state (#7)
  const [fanOutBranch, setFanOutBranch] = useState<FanOutBranchOption | null>(null);
  const [fanOutSelectedAttr, setFanOutSelectedAttr] = useState<AttributeName | null>(null);
  const [fanOutRollOutcome, setFanOutRollOutcome] = useState<RollState | null>(null);
  const [fanOutFightRounds, setFanOutFightRounds] = useState<FightRoundEntry[]>([]);
  const [fanOutFightDone, setFanOutFightDone] = useState(false);
  const [isRollingFanOutRound, setIsRollingFanOutRound] = useState(false);
  const [fanOutCompleted, setFanOutCompleted] = useState(false);

  const [useCombatRelic, setUseCombatRelic] = useState(false);
  const [fightRounds, setFightRounds] = useState<FightRoundEntry[]>([]);
  const [fightDone, setFightDone] = useState(false);
  const [isRollingRound, setIsRollingRound] = useState(false);

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<
    Array<{
      sender: 'YOU' | 'MYTHIOS';
      text: string;
    }>
  >([]);
  const [usedPromptChips, setUsedPromptChips] = useState<Record<string, boolean>>({});

  const rawDayData =
    WEEKDAY_INVENTORY.find((d) => d.week === currentWeek && d.day === currentDay) ||
    WEEKDAY_INVENTORY[0];
  const dayData = getChapterWithContinuityFixes(rawDayData, appliedLoopholeIds);
  const epMeta =
    EPISODE_NUMBERS.find((e) => e.week === currentWeek) || EPISODE_NUMBERS[0];
  const dayFragment = SEEKER_FRAGMENTS.find(
    (f) => f.week === currentWeek && f.day === currentDay
  );
  const dayKey = `${currentWeek}-${currentDay}`;
  const isSoloW1D1 = currentWeek === 1 && currentDay === 1;

  // Reset per-day interactive states whenever dayKey changes from parent or presets
  const [lastDayKey, setLastDayKey] = useState<string>(dayKey);
  if (lastDayKey !== dayKey) {
    setLastDayKey(dayKey);
    setSelectedAttr(null);
    setUseAttrRelic(false);
    setRollOutcome(null);
    setRecoveryChoice(null);
    setNextMoveChoice(null);
    setDetourFightRounds([]);
    setDetourFightDone(false);
    setIsRollingDetourRound(false);
    setFanOutBranch(null);
    setFanOutSelectedAttr(null);
    setFanOutRollOutcome(null);
    setFanOutFightRounds([]);
    setFanOutFightDone(false);
    setIsRollingFanOutRound(false);
    setFanOutCompleted(false);
    setUseCombatRelic(false);
    setFightRounds([]);
    setFightDone(false);
    setIsRollingRound(false);
    setChatHistory([]);
  }

  const activeAttr: AttributeName =
    selectedAttr ||
    (dayData.challengeAttrs ? dayData.challengeAttrs[0] : CLASS_META[characterClass].attribute);

  const getDisplayScore = (attr: AttributeName) => {
    if (rollOutcome && rollOutcome.attr === attr) {
      return rollOutcome.attrPoints;
    }
    return attributes[attr] || 20;
  };
  const activeAttrScore = getDisplayScore(activeAttr);

  const weekdayDC = WEEKDAY_DC_BY_WEEK[currentWeek] || 7;
  const activeTierBonus = getTierInfo(activeAttrScore).bonus;
  const availableAttrRelics = relics[activeAttr] || 0;
  const availableBattleRelics = relics['Battle'] ?? relics['Combat'] ?? 0;

  // Two-Way Fight Stats (#1, #2, #3):
  // If the day has a Challenge + Fight, passing the Challenge grants +2 WEP First-Strike Advantage;
  // failing the Challenge inflicts -15 HP Opening Ambush Penalty before Round 1!
  const challengeCombatBonus =
    dayData.challengeTitle && dayData.hasFight && rollOutcome?.cleared ? 2 : 0;
  const challengeFailHpPenalty =
    dayData.challengeTitle && dayData.hasFight && rollOutcome && !rollOutcome.cleared
      ? 15
      : 0;
  const baseWeaponAtk = GEAR_TABLE[weaponLevel]?.weapon || 14;
  const baseArmorDef = GEAR_TABLE[armorLevel]?.armor || 27;
  const playerAtk = baseWeaponAtk + (useCombatRelic ? 1 : 0) + challengeCombatBonus;
  const playerArmor = baseArmorDef + (useCombatRelic ? 1 : 0);
  const enemyDef = Math.max(16, (epMeta.wDef || 21) - 2);
  const enemyAtk = epMeta.wAtk || 14;

  // Detour Skirmish Foe Stats (60 HP Perimeter Watchman, 0g reward)
  const detourEnemyFullHp = 60;
  const detourEnemyDef = Math.max(15, enemyDef - 2);
  const detourEnemyAtk = Math.max(12, enemyAtk - 1);
  const detourEnemyRemainingHp =
    detourFightRounds.length === 0
      ? detourEnemyFullHp
      : detourFightRounds[detourFightRounds.length - 1].enemyHpAfter;
  const detourPlayerRemainingHp =
    detourFightRounds.length === 0
      ? 100
      : detourFightRounds[detourFightRounds.length - 1].playerHpAfter;

  const resetDayInteractions = (w: number, d: number) => {
    setSelectedAttr(null);
    setUseAttrRelic(false);
    setRollOutcome(null);
    setRecoveryChoice(null);
    setNextMoveChoice(null);
    setDetourFightRounds([]);
    setDetourFightDone(false);
    setIsRollingDetourRound(false);
    setFanOutBranch(null);
    setFanOutSelectedAttr(null);
    setFanOutRollOutcome(null);
    setFanOutFightRounds([]);
    setFanOutFightDone(false);
    setIsRollingFanOutRound(false);
    setFanOutCompleted(false);
    setUseCombatRelic(false);
    setFightRounds([]);
    setFightDone(false);
    setIsRollingRound(false);
    setChatHistory([]);
    onSelectWeekDay(w, d);
    if (onSetShowChapterPicker) onSetShowChapterPicker(false);
  };

  const [isRollingChallenge, setIsRollingChallenge] = useState(false);

  // Weekday Challenge (Core Rules §3): d20 + tier bonus (+4 Relic) against the week's DC.
  const handleRollChallenge = async () => {
    if (rollOutcome || isRollingChallenge) return;
    setIsRollingChallenge(true);
    const attrPoints = attributes[activeAttr] || 20;
    const tierBonus = getTierInfo(attrPoints).bonus;
    const relicBonus = useAttrRelic && availableAttrRelics > 0 ? 4 : 0;
    const d20 = await rollChallengeD20(weekdayDC, tierBonus, relicBonus);
    const { net: margin, success: cleared } = resolveChallengeRoll(d20, tierBonus + relicBonus, weekdayDC);
    const total = d20 + tierBonus + relicBonus;

    if (relicBonus > 0) {
      onUseRelic(activeAttr);
      setUseAttrRelic(false);
    }

    setRollOutcome({
      d20,
      attr: activeAttr,
      attrPoints,
      tierBonus,
      relicBonus,
      total,
      dc: weekdayDC,
      succeedOn: challengeSucceedOn(weekdayDC, tierBonus + relicBonus),
      margin,
      cleared,
    });
    setIsRollingChallenge(false);
    setRecoveryChoice(null);
    setDetourFightRounds([]);
    setDetourFightDone(false);

    if (cleared) {
      const daysPlayedThisWeek = completedDays.filter((id) => id.startsWith(`${currentWeek}-`)).length + 1;
      const growth = calculateAttributeGrowth(attrPoints, daysPlayedThisWeek, d20, tierBonus, weekdayDC);
      setRollOutcome((prev) => (prev ? { ...prev, growth } : prev));
      onGainAttribute(activeAttr, growth, d20 === 20);
      onEarnGold(GOLD_CHALLENGE_WIN);
      if (!dayData.hasFight) {
        onSealDay(currentWeek, currentDay, dayData.place);
      }
    } else {
      onEarnGold(-GOLD_CHALLENGE_LOSS);
    }
  };

  // Mandatory Detour Skirmish round calculation on failed Challenge-only days (#2 — Honest d20 rolls)
  const computeNextDetourRound = (prevRounds: FightRoundEntry[]): FightRoundEntry => {
    const r = prevRounds.length + 1;
    const enemyHpBefore =
      prevRounds.length === 0
        ? detourEnemyFullHp
        : prevRounds[prevRounds.length - 1].enemyHpAfter;
    const playerHpBefore =
      prevRounds.length === 0 ? 100 : prevRounds[prevRounds.length - 1].playerHpAfter;

    const d20 = Math.floor(Math.random() * 20) + 1;

    const margin = d20 + baseWeaponAtk - detourEnemyDef;
    const hit = margin > 0;
    const dmgToEnemy = hit ? margin * 5 : 0;
    const enemyHpAfter = Math.max(0, enemyHpBefore - dmgToEnemy);

    const enemyD20 = Math.floor(Math.random() * 20) + 1;
    const enemyMargin = enemyD20 + detourEnemyAtk - baseArmorDef;
    const enemyHit = enemyHpAfter > 0 && enemyMargin > 0;
    const rawDmgToPlayer = enemyHit ? enemyMargin * 5 : 0;
    const playerHpAfter = Math.max(0, playerHpBefore - rawDmgToPlayer);
    const dmgToPlayer = playerHpBefore - playerHpAfter;

    return {
      round: r,
      d20,
      playerAtk: baseWeaponAtk,
      enemyDef: detourEnemyDef,
      margin,
      hit,
      dmgToEnemy,
      enemyHpBefore,
      enemyHpAfter,
      enemyD20,
      enemyAtk: detourEnemyAtk,
      playerArmor: baseArmorDef,
      enemyMargin,
      enemyHit,
      dmgToPlayer,
      playerHpBefore,
      playerHpAfter,
    };
  };

  const handleRollDetourFightRound = () => {
    if (isRollingDetourRound || detourFightDone) return;
    setIsRollingDetourRound(true);
    setTimeout(() => {
      const nextRound = computeNextDetourRound(detourFightRounds);
      const updated = [...detourFightRounds, nextRound];
      setDetourFightRounds(updated);
      if (nextRound.enemyHpAfter <= 0 || nextRound.playerHpAfter <= 0) {
        setDetourFightDone(true);
        if (nextRound.enemyHpAfter <= 0) {
          onEarnGold(GOLD_DETOUR_FIGHT_WIN);
        }
        onGainAttribute(dayData.challengeAttrs?.[0] || 'Might', 2);
        onSealDay(currentWeek, currentDay, dayData.place);
      }
      setIsRollingDetourRound(false);
    }, 380);
  };

  const computeNextFightRound = (prevRounds: FightRoundEntry[]): FightRoundEntry => {
    const r = prevRounds.length + 1;
    const enemyHpBefore =
      prevRounds.length === 0 ? 100 : prevRounds[prevRounds.length - 1].enemyHpAfter;
    const startPlayerHp = Math.max(20, 100 - challengeFailHpPenalty);
    const playerHpBefore =
      prevRounds.length === 0
        ? startPlayerHp
        : prevRounds[prevRounds.length - 1].playerHpAfter;

    const d20 = Math.floor(Math.random() * 20) + 1;

    const margin = d20 + playerAtk - enemyDef;
    const hit = margin > 0;
    const dmgToEnemy = hit ? margin * 5 : 0;
    const enemyHpAfter = Math.max(0, enemyHpBefore - dmgToEnemy);

    const enemyD20 = Math.floor(Math.random() * 20) + 1;
    const enemyMargin = enemyD20 + enemyAtk - playerArmor;
    const enemyHit = enemyHpAfter > 0 && enemyMargin > 0;
    const rawDmgToPlayer = enemyHit ? enemyMargin * 5 : 0;
    const playerHpAfter = Math.max(0, playerHpBefore - rawDmgToPlayer);
    const dmgToPlayer = playerHpBefore - playerHpAfter;

    return {
      round: r,
      d20,
      playerAtk,
      enemyDef,
      margin,
      hit,
      dmgToEnemy,
      enemyHpBefore,
      enemyHpAfter,
      enemyD20,
      enemyAtk,
      playerArmor,
      enemyMargin,
      enemyHit,
      dmgToPlayer,
      playerHpBefore,
      playerHpAfter,
    };
  };

  const handleRollSingleFightRound = () => {
    if (isRollingRound || fightDone) return;
    if (fightRounds.length === 0 && useCombatRelic && availableBattleRelics > 0) {
      onUseRelic('Battle');
    }
    setIsRollingRound(true);
    setTimeout(() => {
      const nextRound = computeNextFightRound(fightRounds);
      const updated = [...fightRounds, nextRound];
      setFightRounds(updated);
      if (nextRound.enemyHpAfter <= 0 || nextRound.playerHpAfter <= 0) {
        setFightDone(true);
        const fullFightGold =
          dayData.fightReward !== undefined ? dayData.fightReward : 300;
        const earnedGold = nextRound.enemyHpAfter <= 0 ? fullFightGold : 0;
        if (earnedGold > 0) {
          onEarnGold(earnedGold);
        }
        onSealDay(currentWeek, currentDay, dayData.place);
      }
      setIsRollingRound(false);
    }, 420);
  };

  const handleSendToMythios = (textToSend: string, chipKey?: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;
    if (chipKey) {
      setUsedPromptChips((prev) => ({ ...prev, [chipKey]: true }));
    }

    const lower = trimmed.toLowerCase();
    let mythiosReply = `You take a careful look around ${dayData.place.toLowerCase()}. ${dayData.summaryLearned} ${dayData.pullLine}`;
    if (lower.includes('track') || lower.includes('rut') || lower.includes('road') || lower.includes('north')) {
      mythiosReply = `Crouching by the ground at ${dayData.place.toLowerCase()}, you trace the fresh marks leading away from the landmark. ${dayData.pullLine}`;
    } else if (lower.includes('stone') || lower.includes('fragment') || lower.includes('carv')) {
      mythiosReply = isSoloW1D1
        ? `You run your thumb along the weathered Seeker stonework at ${dayData.place.toLowerCase()}—its recessed lock-socket matches the fragment now resting in your bag alongside the torn stub pointing north to The Hollow Wake Inn.`
        : `You run your thumb along the weathered Seeker stonework at ${dayData.place.toLowerCase()}—its recessed lock-socket matches the fragment now resting in your bag. Back at the campfire, Garrick and your party are waiting to hear what you found.`;
    } else if (lower.includes('camp') || lower.includes('return') || lower.includes('party') || lower.includes('inn')) {
      mythiosReply = isSoloW1D1
        ? `You strap your gear tight at ${dayData.place.toLowerCase()} and look north up the drove road toward The Hollow Wake Inn, where the address on the torn list leads. ${dayData.pullLine}`
        : `You gather your gear at ${dayData.place.toLowerCase()} and head back toward the woodsmoke of the party's campfire, where Garrick has the kettle on. ${dayData.pullLine}`;
    }

    setChatHistory((prev) => [
      ...prev,
      { sender: 'YOU', text: trimmed },
      { sender: 'MYTHIOS', text: mythiosReply },
    ]);
    setChatInput('');
  };

  const contextChips = [
    {
      key: `${dayKey}-inspect`,
      label: `Search around ${dayData.place.replace(/^The\s+/i, '')}`,
      prompt: `I check the ground around ${dayData.place} for any other signs before leaving.`,
    },
    {
      key: `${dayKey}-stone`,
      label: 'Examine the Seeker stone socket',
      prompt: 'I inspect the carved stone socket where the Seeker fragment was hidden.',
    },
    isSoloW1D1
      ? {
          key: `${dayKey}-road-north`,
          label: 'Check the drove road to the inn',
          prompt: `I check the drove road leading north from ${dayData.place} toward The Hollow Wake Inn.`,
        }
      : {
          key: `${dayKey}-camp`,
          label: 'Head back to the campfire',
          prompt: `I pack up my findings at ${dayData.place} and head back to the campfire.`,
        },
  ].filter((c) => !usedPromptChips[c.key]);

  const hasFirstLetterHint = dayFragment ? Boolean(seekerFirstLetterHints[dayFragment.id]) : false;

  const renderArtifactFragmentQuote = () => {
    if (!dayFragment) return null;
    const sEntry = solvedWords[dayFragment.id] || {};
    const w1Done = Boolean(sEntry.w1);
    const w2Done = Boolean(sEntry.w2);
    const parts = dayFragment.displayTemplate.split(/(\{0\}|\{1\})/g);
    return (
      <p className="font-['Cormorant_Garamond'] font-medium text-[20px] text-[#F4F1F8] leading-[1.55]">
        “
        {parts.map((part, idx) => {
          if (part === '{0}') {
            return w1Done ? (
              <span
                key={idx}
                className="font-['Cormorant_Garamond'] font-bold text-[20px] text-[#6FD39A] underline decoration-[#6FD39A]/50 underline-offset-4 px-1"
              >
                {dayFragment.word1}
              </span>
            ) : (
              <span
                key={idx}
                className="mx-1 px-2.5 py-0.5 rounded-md bg-[#2A1B40] border border-[#D4B876]/65 font-['Cinzel'] font-bold text-[12px] tracking-[1.5px] text-[#D4B876] not-italic inline-block"
              >
                {hasFirstLetterHint ? (
                  <>
                    <span className="text-[#6FD39A] underline mr-1">
                      [{dayFragment.word1[0].toUpperCase()}]
                    </span>
                    {dayFragment.jumble1.join('')}
                  </>
                ) : (
                  dayFragment.jumble1.join('')
                )}
              </span>
            );
          }
          if (part === '{1}') {
            return w2Done ? (
              <span
                key={idx}
                className="font-['Cormorant_Garamond'] font-bold text-[20px] text-[#6FD39A] underline decoration-[#6FD39A]/50 underline-offset-4 px-1"
              >
                {dayFragment.word2}
              </span>
            ) : (
              <span
                key={idx}
                className="mx-1 px-2.5 py-0.5 rounded-md bg-[#2A1B40] border border-[#D4B876]/65 font-['Cinzel'] font-bold text-[12px] tracking-[1.5px] text-[#D4B876] not-italic inline-block"
              >
                {hasFirstLetterHint ? (
                  <>
                    <span className="text-[#6FD39A] underline mr-1">
                      [{dayFragment.word2[0].toUpperCase()}]
                    </span>
                    {dayFragment.jumble2.join('')}
                  </>
                ) : (
                  dayFragment.jumble2.join('')
                )}
              </span>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
        ”
      </p>
    );
  };

  const enemyFullHp = 100;
  const enemyRemainingHp =
    fightRounds.length === 0
      ? 100
      : fightRounds[fightRounds.length - 1].enemyHpAfter;
  const playerMaxHp = 100;
  const startPlayerHp = Math.max(20, 100 - challengeFailHpPenalty);
  const playerRemainingHp =
    fightRounds.length === 0
      ? startPlayerHp
      : fightRounds[fightRounds.length - 1].playerHpAfter;

  // Multi-Paragraph Non-Repeating Prose & Daily Recap (#4)
  const dailyRecap = getDailyRecap(currentWeek, currentDay);
  const openingParagraphs = getOpeningProseParagraphs(dayData);
  const challengePassParagraphs = getChallengePassProseParagraphs(
    dayData,
    rollOutcome?.attr || activeAttr
  );
  const challengeFailParagraphs = getChallengeFailProseParagraphs(
    dayData,
    rollOutcome?.attr || activeAttr
  );
  const recoveryParagraphs = getRecoveryProseParagraphs(
    dayData,
    'Perimeter Watchman Skirmish'
  );
  const fightWinParagraphs = getFightWinProseParagraphs(
    dayData,
    rollOutcome ? rollOutcome.cleared : true
  );
  const fanOutEncounter = getFanOutEncounterData(dayData);

  const solvedFragCount = dayFragment
    ? (solvedWords[dayFragment.id]?.w1 ? 1 : 0) +
      (solvedWords[dayFragment.id]?.w2 ? 1 : 0)
    : 0;

  // Seeker Fragment unlocks after passing the Challenge, winning the Detour Skirmish, or winning the main Fight
  const isArtifactUnlocked = dayData.hasFight
    ? fightDone
    : Boolean(rollOutcome && (rollOutcome.cleared || detourFightDone || recoveryChoice));

  // Fanning Out Solo Encounter handlers (#7)
  // Fan Out Challenge: same rule as the weekday Challenge, against the week's DC.
  // (No separate Fan Out DC exists in canon; pending the numbers pass, Core Rules §15.)
  const activeFanOutAttr: AttributeName =
    fanOutSelectedAttr ||
    (fanOutBranch?.challengeAttrs?.[0] as AttributeName) ||
    'Craft';
  const activeFanOutAttrScore = attributes[activeFanOutAttr] || 20;
  const activeFanOutTierBonus = getTierInfo(activeFanOutAttrScore).bonus;
  const [isRollingFanOut, setIsRollingFanOut] = useState(false);

  const handleSelectFanOutBranch = (opt: FanOutBranchOption) => {
    setFanOutBranch(opt);
    setFanOutSelectedAttr(opt.challengeAttrs ? opt.challengeAttrs[0] : null);
    setFanOutRollOutcome(null);
    setFanOutFightRounds([]);
    setFanOutFightDone(false);
    if (opt.branchType === 'CAMPFIRE') {
      setFanOutCompleted(true);
    } else {
      setFanOutCompleted(false);
    }
  };

  const unlockFanOutPayoff = (opt: FanOutBranchOption) => {
    if (dayFragment && onUnlockSeekerHint) {
      onUnlockSeekerHint(dayFragment.id);
    }
    if (dayFragment && opt.soloClueTitle && opt.soloClueText) {
      const payload = {
        title: opt.soloClueTitle,
        text: opt.soloClueText,
        firstLetter: dayFragment.word1[0].toUpperCase(),
      };
      if (onRecordSoloFanOutClue) {
        onRecordSoloFanOutClue(dayKey, payload);
      }
      if (onShareFanOutClue) {
        onShareFanOutClue(dayKey, payload);
      }
    }
    setFanOutCompleted(true);
  };

  const handleRollFanOutChallenge = async () => {
    if (!fanOutBranch || fanOutRollOutcome || isRollingFanOut) return;
    setIsRollingFanOut(true);
    const attrPoints = attributes[activeFanOutAttr] || 20;
    const tierBonus = getTierInfo(attrPoints).bonus;
    const d20 = await rollChallengeD20(weekdayDC, tierBonus, 0);
    const { net: margin, success: cleared } = resolveChallengeRoll(d20, tierBonus, weekdayDC);
    const total = d20 + tierBonus;

    setFanOutRollOutcome({
      d20,
      attr: activeFanOutAttr,
      attrPoints,
      tierBonus,
      relicBonus: 0,
      total,
      dc: weekdayDC,
      succeedOn: challengeSucceedOn(weekdayDC, tierBonus),
      margin,
      cleared,
    });
    setIsRollingFanOut(false);

    if (cleared) {
      onGainAttribute(activeFanOutAttr, 1, d20 === 20);
      onEarnGold(GOLD_FAN_OUT_CACHE_WIN);
      unlockFanOutPayoff(fanOutBranch);
    } else {
      setFanOutCompleted(true);
    }
  };

  const fanOutEnemyFullHp = fanOutBranch?.enemyHp || 70;
  const fanOutEnemyDef = fanOutBranch?.enemyDef || 18;
  const fanOutEnemyAtk = fanOutBranch?.enemyAtk || 13;
  const fanOutEnemyRemainingHp =
    fanOutFightRounds.length === 0
      ? fanOutEnemyFullHp
      : fanOutFightRounds[fanOutFightRounds.length - 1].enemyHpAfter;
  const fanOutPlayerRemainingHp =
    fanOutFightRounds.length === 0
      ? Math.max(25, playerRemainingHp)
      : fanOutFightRounds[fanOutFightRounds.length - 1].playerHpAfter;

  const computeNextFanOutFightRound = (prevRounds: FightRoundEntry[]): FightRoundEntry => {
    const r = prevRounds.length + 1;
    const enemyHpBefore =
      prevRounds.length === 0
        ? fanOutEnemyFullHp
        : prevRounds[prevRounds.length - 1].enemyHpAfter;
    const playerHpBefore =
      prevRounds.length === 0
        ? Math.max(25, playerRemainingHp)
        : prevRounds[prevRounds.length - 1].playerHpAfter;

    const d20 = Math.floor(Math.random() * 20) + 1;

    const margin = d20 + baseWeaponAtk - fanOutEnemyDef;
    const hit = margin > 0;
    const dmgToEnemy = hit ? margin * 5 : 0;
    const enemyHpAfter = Math.max(0, enemyHpBefore - dmgToEnemy);

    const enemyD20 = Math.floor(Math.random() * 20) + 1;
    const enemyMargin = enemyD20 + fanOutEnemyAtk - baseArmorDef;
    const enemyHit = enemyHpAfter > 0 && enemyMargin > 0;
    const rawDmgToPlayer = enemyHit ? enemyMargin * 5 : 0;
    const playerHpAfter = Math.max(0, playerHpBefore - rawDmgToPlayer);
    const dmgToPlayer = playerHpBefore - playerHpAfter;

    return {
      round: r,
      d20,
      playerAtk: baseWeaponAtk,
      enemyDef: fanOutEnemyDef,
      margin,
      hit,
      dmgToEnemy,
      enemyHpBefore,
      enemyHpAfter,
      enemyD20,
      enemyAtk: fanOutEnemyAtk,
      playerArmor: baseArmorDef,
      enemyMargin,
      enemyHit,
      dmgToPlayer,
      playerHpBefore,
      playerHpAfter,
    };
  };

  const handleRollFanOutFightRound = () => {
    if (!fanOutBranch || isRollingFanOutRound || fanOutFightDone) return;
    setIsRollingFanOutRound(true);
    setTimeout(() => {
      const nextRound = computeNextFanOutFightRound(fanOutFightRounds);
      const updated = [...fanOutFightRounds, nextRound];
      setFanOutFightRounds(updated);
      if (nextRound.enemyHpAfter <= 0 || nextRound.playerHpAfter <= 0) {
        setFanOutFightDone(true);
        if (nextRound.enemyHpAfter <= 0) {
          onEarnGold(GOLD_FAN_OUT_CACHE_WIN);
          unlockFanOutPayoff(fanOutBranch);
        } else {
          setFanOutCompleted(true);
        }
      }
      setIsRollingFanOutRound(false);
    }, 380);
  };

  // Grey out bottom ACT button, input bar, and suggestion chips whenever an Action Card requires action
  const isActionCardPending =
    Boolean(dayData.challengeTitle && !rollOutcome) ||
    Boolean(rollOutcome && !rollOutcome.cleared && !dayData.hasFight && !detourFightDone) ||
    Boolean(dayData.hasFight && !fightDone) ||
    Boolean(isArtifactUnlocked && !fanOutCompleted);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0D0714]">
      {/* Unified Chapter & Activity Drawer (Toggled from #7 in the top header) */}
      {showChapterPicker && (
        <div className="p-3 bg-[#150D22] border-b border-[#3A2555] space-y-2.5 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-['Cinzel'] font-bold text-[#B7A9CC] uppercase tracking-[1px]">
            <span>TODAY’S ACTIVITY & CHAPTERS</span>
            <button
              onClick={() => onSetShowChapterPicker && onSetShowChapterPicker(false)}
              className="text-[#D4B876] hover:underline"
            >
              Close ✕
            </button>
          </div>

          {/* 3 Scene Permutation Presets */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: '1. Challenge + Scroll', sub: 'W2·D2 · The Mill', w: 2, d: 2 },
              { label: '2. Fight + Scroll', sub: "W1·D3 · Widow's Tooth", w: 1, d: 3 },
              { label: '3. Challenge + Fight', sub: 'W1·D6 · The Low Ford', w: 1, d: 6 },
            ].map((preset) => {
              const active = currentWeek === preset.w && currentDay === preset.d;
              return (
                <button
                  key={preset.label}
                  onClick={() => resetDayInteractions(preset.w, preset.d)}
                  className={`p-2 rounded-lg text-left transition border ${
                    active
                      ? 'bg-[#2E1B42] border-[#D4B876] text-[#E5C158]'
                      : 'bg-[#1E1232] border-[#3A2555] text-[#B7A9CC] hover:text-[#F4F1F8]'
                  }`}
                >
                  <div className="font-['Cinzel'] font-bold text-[10.5px] truncate">
                    {preset.label}
                  </div>
                  <div className="font-sans text-[10.5px] text-[#9E92B2] truncate mt-0.5">
                    {preset.sub}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-6 gap-1">
            {[1, 2, 3, 4, 5, 6].map((w) => (
              <button
                key={w}
                onClick={() => resetDayInteractions(w, currentDay)}
                className={`py-1.5 rounded font-['Cinzel'] font-bold text-[11.5px] border transition ${
                  currentWeek === w
                    ? 'bg-[#2E1B42] border-[#D4B876] text-[#D4B876]'
                    : 'bg-[#1E1232] border-[#3A2555] text-[#B7A9CC]'
                }`}
              >
                WK {w}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[1, 2, 3, 4, 5, 6].map((d) => (
              <button
                key={d}
                onClick={() => resetDayInteractions(currentWeek, d)}
                className={`py-1.5 rounded font-['Cinzel'] font-bold text-[11px] border transition ${
                  currentDay === d
                    ? 'bg-[#2E1B42] border-[#D4B876] text-[#D4B876]'
                    : 'bg-[#1E1232] border-[#3A2555] text-[#B7A9CC]'
                }`}
              >
                D{d}
              </button>
            ))}
            <button
              onClick={() => {
                if (onSetShowChapterPicker) onSetShowChapterPicker(false);
                onJumpToGathering(currentWeek);
              }}
              className="py-1.5 rounded font-['Cinzel'] font-bold text-[10.5px] border bg-[#2A1B40] border-[#D4B876]/70 text-[#E5C158] hover:bg-[#2E1B42] transition"
              title="Jump to Day 7 Gathering"
            >
              ⚔️ D7
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          TWO-FAMILY STREAM HIERARCHY (#6):
          - FAMILY A: NARRATION & CHAT BUBBLES (MYTHIOS / YOU — 17.5px Sans-Serif)
          - FAMILY B: UNIFIED "SPIN-OFF" CARDS (🎯 CHALLENGE, ⚔️ FIGHT, 🧭 DECISION, 📜 SEEKER FRAGMENT)
            All Spin-Off Cards share the exact same #1E1232 frame, #7E68B8 border, and #2E1B42 header bar!
         ===================================================================== */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2.5 space-y-2.5">
        {/* ===================================================================
            TIER 1A: STANDALONE FULL-WIDTH DAILY RECAP CARD (Hidden on W1·D1 since Episode 1 just begins!)
           =================================================================== */}
        {!isSoloW1D1 && (
          <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
            <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555] flex items-center justify-between gap-2">
              <span className="font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8] truncate">
                📜 PREVIOUSLY ON THE TRAIL
              </span>
              <span className="font-['Cinzel'] font-bold text-[11px] text-[#E5C158] whitespace-nowrap truncate max-w-[145px]">
                {dailyRecap.yesterdayPlace}
              </span>
            </div>
            <div className="p-2.5">
              <p className="font-sans text-[13.5px] text-[#D8CEE8] leading-[1.4]">
                {dailyRecap.recapText}
              </p>
            </div>
          </div>
        )}

        {/* ===================================================================
            TIER 1B: MYTHIOS OPENING SCENE NARRATION BUBBLE (#1: 15px SMS size, #2: compact gap)
           =================================================================== */}
        <div className="mr-5 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3 space-y-1.5 shadow-md">
          <div className="flex items-center justify-between gap-2 leading-none">
            <span className="font-['Cinzel'] font-bold text-[11px] tracking-[1.2px] text-[#C4A1FF] uppercase shrink-0">
              MYTHIOS
            </span>
            <span className="text-[11.5px] font-sans font-medium text-[#D4B876] whitespace-nowrap truncate">
              {dayData.place}
            </span>
          </div>

          <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
            {openingParagraphs[0]}
          </p>
          <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
            {openingParagraphs[1]}
          </p>
        </div>

        {/* ===================================================================
            ACTION CARD 1 — 🎯 CHALLENGE CARD (#2: Compact vertical gaps)
           =================================================================== */}
        {dayData.challengeTitle && dayData.challengeAttrs && (
          <>
            <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
              <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555] flex items-center justify-between gap-2">
                <span className="font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8] truncate">
                  🎯 CHALLENGE · {dayData.challengeTitle.toUpperCase()}
                </span>
                <span className="font-['Cinzel'] font-bold text-[11.5px] text-[#E5C158] whitespace-nowrap shrink-0">
                  You succeed on {challengeSucceedOn(weekdayDC, activeTierBonus + (useAttrRelic ? 4 : 0))}+
                </span>
              </div>

              <div className="p-2.5 space-y-2">
                {currentWeek === 1 && currentDay === 1 && !rollOutcome && (
                  <p className="text-[13.5px] font-sans text-[#B7A9CC] leading-snug px-0.5">
                    A Challenge. Pick the skill you trust and roll. Pass, and you earn{' '}
                    {GOLD_CHALLENGE_WIN} gold and that skill grows. Fail, and it costs{' '}
                    {GOLD_CHALLENGE_LOSS} gold.
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-[#130B1F] border border-[#3A2555]">
                    <div className="flex items-center justify-between gap-1 text-[11.5px] font-['Cinzel'] font-bold">
                      <span className="text-[#6FD39A] truncate">YOU</span>
                      <span
                        className="whitespace-nowrap shrink-0"
                        style={{ color: ATTRIBUTE_META[activeAttr].color }}
                      >
                        {activeAttr} {activeAttrScore}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#2A1B40] rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${Math.min(100, activeAttrScore)}%`,
                          backgroundColor: ATTRIBUTE_META[activeAttr].color,
                        }}
                      />
                    </div>
                    <div className="mt-1.5 space-y-0.5 text-[11.5px] font-sans">
                      {dayData.challengeAttrs.slice(0, 2).map((a) => (
                        <div
                          key={a}
                          className="flex items-center justify-between font-semibold"
                          style={{ color: ATTRIBUTE_META[a].color }}
                        >
                          <span>{a}</span>
                          <span className="font-bold">{getDisplayScore(a)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#130B1F] border border-[#3A2555]">
                    <div className="flex items-center justify-between gap-1 text-[11.5px] font-['Cinzel'] font-bold">
                      <span className="text-[#E5C158] truncate">
                        {dayData.challengeTitle.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-1.5 space-y-0.5 text-[11.5px] font-sans">
                      <div className="flex items-center justify-between font-semibold text-[#E5C158]">
                        <span>Difficulty</span>
                        <span className="font-bold">{weekdayDC}</span>
                      </div>
                      <div className="flex items-center justify-between font-semibold text-[#B7A9CC]">
                        <span>{getTierInfo(activeAttrScore).name} bonus</span>
                        <span className="font-bold">+{activeTierBonus}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {dayData.challengeAttrs.map((attr) => {
                    const meta = ATTRIBUTE_META[attr];
                    const score = getDisplayScore(attr);
                    const isSelected = activeAttr === attr;
                    const actionTitle = getChallengeActionTitle(attr, dayData.place);
                    const actionDesc = getChallengeActionNarrative(
                      attr,
                      dayData.place,
                      dayData.challengeTitle
                    );

                    return (
                      <button
                        key={attr}
                        disabled={!!rollOutcome}
                        onClick={() => setSelectedAttr(attr)}
                        className={`w-full p-2.5 rounded-xl text-left transition border ${
                          isSelected
                            ? 'bg-[#2A1B40] border-[#D4B876] shadow-sm'
                            : 'bg-[#130B1F] border-[#3A2555] opacity-85 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="font-['Cinzel'] font-bold text-[12.5px] truncate"
                            style={{ color: meta.color }}
                          >
                            {isSelected ? '✓ ' : ''}
                            {actionTitle}
                          </span>
                          <span
                            className="font-['Cinzel'] font-bold text-[12px] whitespace-nowrap shrink-0"
                            style={{ color: meta.color }}
                          >
                            {attr.toUpperCase()} {score}
                          </span>
                        </div>
                        <p className="text-[13.5px] font-sans text-[#E6E0F0] mt-0.5 leading-snug">
                          {actionDesc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {!rollOutcome && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={availableAttrRelics <= 0}
                      onClick={() => setUseAttrRelic(!useAttrRelic)}
                      className={`px-2.5 py-2 rounded-xl font-['Cinzel'] font-bold text-[11px] border transition whitespace-nowrap shrink-0 ${
                        useAttrRelic
                          ? 'bg-[#D4B876]/25 border-[#D4B876] text-[#F4F1F8]'
                          : 'bg-[#130B1F] border-[#3A2555] text-[#B7A9CC] disabled:opacity-40'
                      }`}
                    >
                      ♦ RELIC +4
                    </button>

                    <button
                      type="button"
                      onClick={handleRollChallenge}
                      disabled={isRollingChallenge}
                      className="flex-1 min-w-0 py-2 px-2.5 rounded-xl bg-[#D4B876]/22 hover:bg-[#D4B876]/32 border border-[#D4B876] text-[#F4F1F8] font-['Cinzel'] font-bold text-[12px] tracking-[0.6px] uppercase transition whitespace-nowrap truncate"
                    >
                      {isRollingChallenge
                        ? '🎲 ROLLING…'
                        : `🎲 ROLL D20 + ${activeTierBonus + (useAttrRelic ? 4 : 0)}`}
                    </button>
                  </div>
                )}

                {rollOutcome && (
                  <div className="p-2.5 rounded-xl bg-[#130B1F] border border-[#3A2555] space-y-1.5">
                    <div className="p-2 rounded-lg bg-[#1A102A] border border-[#3A2555]/80 space-y-0.5 text-[12px] font-sans">
                      <div className="flex items-center gap-1 font-semibold whitespace-nowrap overflow-x-auto no-scrollbar">
                        <span className="text-[#6FD39A] font-bold">YOU:</span>
                        <span className="text-[#F4F1F8]">🎲 {rollOutcome.d20}</span>
                        <span className="text-[#8B7A9E]">+</span>
                        <span
                          style={{
                            color: ATTRIBUTE_META[rollOutcome.attr].color,
                          }}
                        >
                          {rollOutcome.attr} {rollOutcome.attrPoints} (+{rollOutcome.tierBonus})
                        </span>
                        {rollOutcome.relicBonus > 0 && (
                          <>
                            <span className="text-[#8B7A9E]">+</span>
                            <span className="text-[#D4B876]">
                              Relic {rollOutcome.relicBonus}
                            </span>
                          </>
                        )}
                        <span className="text-[#8B7A9E]">−</span>
                        <span className="text-[#E5C158]">
                          DC {rollOutcome.dc}
                        </span>
                        <span className="text-[#8B7A9E]">=</span>
                        <span
                          className={`font-bold ${
                            rollOutcome.cleared ? 'text-[#6FD39A]' : 'text-[#E0645C]'
                          }`}
                        >
                          {rollOutcome.margin >= 0
                            ? `+${rollOutcome.margin}`
                            : rollOutcome.margin}
                        </span>
                      </div>

                      <div
                        className={`font-bold text-[12.5px] ${
                          rollOutcome.cleared ? 'text-[#6FD39A]' : 'text-[#E0645C]'
                        }`}
                      >
                        {rollOutcome.cleared
                          ? 'PASSED'
                          : dayData.hasFight
                          ? 'FAILED · Sentry Alerted (−15 HP Opening Ambush)'
                          : 'FAILED · Direct Path Blocked — Detour Skirmish Triggered'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                      {rollOutcome.cleared ? (
                        <span className="px-2.5 py-1 rounded-lg bg-[#2A1B40] border border-[#D4B876] text-[13px] font-sans font-bold text-[#F4F1F8]">
                          🎁 Reward:{' '}
                          <span
                            style={{
                              color: ATTRIBUTE_META[rollOutcome.attr].color,
                            }}
                          >
                            +{rollOutcome.growth ?? 0} {rollOutcome.attr}
                          </span>{' '}
                          <span className="text-[#8B7A9E]">·</span>{' '}
                          <span className="text-[#E5C158]">+{GOLD_CHALLENGE_WIN}g</span>
                          {dayData.hasFight && (
                            <span className="text-[#6FD39A] ml-1">
                              · +2 WEP R1
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-[#2A1420] border border-[#E0645C]/70 text-[12.5px] font-sans font-bold text-[#E0645C]">
                          ⚠️ −{GOLD_CHALLENGE_LOSS}g ·{' '}
                          {dayData.hasFight
                            ? 'Caught Off-Guard (−15 HP R1)'
                            : 'Forced onto Perimeter Detour'}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* POST-CHALLENGE PASS: 2-Paragraph Non-Repeating Prose (#1: 15px SMS font) */}
            {rollOutcome && rollOutcome.cleared && (
              <div className="mr-5 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3 space-y-1.5 shadow-md">
                <div className="flex items-center justify-between gap-2 leading-none">
                  <span className="font-['Cinzel'] font-bold text-[11px] tracking-[1.2px] text-[#C4A1FF] uppercase shrink-0">
                    MYTHIOS
                  </span>
                  <span className="text-[11px] font-sans font-bold text-[#6FD39A] whitespace-nowrap truncate">
                    ✓ Challenge Passed
                  </span>
                </div>
                <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                  {challengePassParagraphs[0]}
                </p>
                <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                  {challengePassParagraphs[1]}
                </p>
              </div>
            )}

            {/* POST-CHALLENGE FAIL: 2-Paragraph Story Fail Prose + Mandatory Alerted Lookout Skirmish (#3: single-line header) */}
            {rollOutcome && !rollOutcome.cleared && (
              <>
                <div className="mr-5 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3 space-y-1.5 shadow-md">
                  <div className="flex items-center justify-between gap-2 leading-none">
                    <span className="font-['Cinzel'] font-bold text-[11px] tracking-[1.2px] text-[#C4A1FF] uppercase shrink-0">
                      MYTHIOS
                    </span>
                    <span className="text-[11px] font-sans font-bold text-[#E0645C] whitespace-nowrap truncate">
                      ✕ Failed · Lookout Alerted
                    </span>
                  </div>
                  <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                    {challengeFailParagraphs[0]}
                  </p>
                  <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                    {challengeFailParagraphs[1]}
                  </p>
                </div>

                {/* MANDATORY STORY-TRIGGERED ALERTED LOOKOUT SKIRMISH CARD (Detour fight, pay pending the numbers pass) */}
                {!dayData.hasFight && (
                  <div className="w-full rounded-xl bg-[#180F29] border border-[#E0645C]/70 overflow-hidden shadow-lg">
                    <div className="px-3 py-2 bg-[#2A1628] border-b border-[#3A2555] flex items-center justify-between gap-2">
                      <span className="font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8] truncate">
                        ⚔️ ALERTED LOOKOUT · {(dayData.challengeTitle || dayData.place).toUpperCase()}
                      </span>
                      <span className="font-['Cinzel'] font-bold text-[11.5px] whitespace-nowrap shrink-0">
                        <span className="text-[#E5C158]">WEP {baseWeaponAtk}</span>{' '}
                        <span className="text-[#B7A9CC]">vs</span>{' '}
                        <span className="text-[#FB923C]">DEF {detourEnemyDef}</span>
                        <span className="text-[#6FD39A] ml-1">+50G</span>
                      </span>
                    </div>

                    <div className="p-2.5 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-xl bg-[#130B1F] border border-[#3A2555]">
                          <div className="flex items-center justify-between gap-1 text-[11.5px] font-['Cinzel'] font-bold">
                            <span className="text-[#6FD39A] truncate">YOU</span>
                            <span className="text-[#6FD39A] whitespace-nowrap shrink-0">
                              {detourPlayerRemainingHp}/100 HP
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#2A1B40] rounded-full overflow-hidden mt-1.5">
                            <div
                              className="h-full bg-[#6FD39A] transition-all duration-300"
                              style={{
                                width: `${detourPlayerRemainingHp}%`,
                              }}
                            />
                          </div>
                          <div className="mt-1.5 space-y-0.5 text-[11.5px] font-sans">
                            <div className="flex items-center justify-between font-semibold text-[#E5C158]">
                              <span>Weapon WEP</span>
                              <span className="font-bold">{baseWeaponAtk}</span>
                            </div>
                            <div className="flex items-center justify-between font-semibold text-[#7AA7FF]">
                              <span>Armour AMR</span>
                              <span className="font-bold">{baseArmorDef}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#130B1F] border border-[#3A2555]">
                          <div className="flex items-center justify-between gap-1 text-[11.5px] font-['Cinzel'] font-bold">
                            <span className="text-[#E0645C] truncate">LOOKOUT</span>
                            <span className="text-[#E0645C] whitespace-nowrap shrink-0">
                              {detourEnemyRemainingHp}/{detourEnemyFullHp} HP
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#2A1B40] rounded-full overflow-hidden mt-1.5">
                            <div
                              className="h-full bg-[#E0645C] transition-all duration-300"
                              style={{
                                width: `${Math.round(
                                  (detourEnemyRemainingHp / detourEnemyFullHp) * 100
                                )}%`,
                              }}
                            />
                          </div>
                          <div className="mt-1.5 space-y-0.5 text-[11.5px] font-sans">
                            <div className="flex items-center justify-between font-semibold text-[#FB923C]">
                              <span>Defence DEF</span>
                              <span className="font-bold">{detourEnemyDef}</span>
                            </div>
                            <div className="flex items-center justify-between font-semibold text-[#C084FC]">
                              <span>Attack ATK</span>
                              <span className="font-bold">{detourEnemyAtk}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {(detourFightRounds.length > 0 || isRollingDetourRound) && (
                        <div className="p-2.5 rounded-xl bg-[#130B1F] border border-[#3A2555] space-y-2">
                          {detourFightRounds.map((r) => (
                            <div
                              key={r.round}
                              className="p-2 rounded-lg bg-[#1A102A] border border-[#3A2555]/80 space-y-1.5 text-[12px] font-sans"
                            >
                              <div className="flex items-center justify-between border-b border-white/[0.06] pb-1">
                                <span className="px-1.5 py-0.5 rounded bg-[#D4B876]/20 border border-[#D4B876]/50 font-['Cinzel'] font-bold text-[10.5px] text-[#E5C158]">
                                  SKIRMISH R{r.round}
                                </span>
                                <span className="text-[11px] font-sans font-semibold text-[#B7A9CC]">
                                  Diff × 5 Damage
                                </span>
                              </div>

                              {/* #5: Narrower gap so equation fits on 1 line */}
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1 font-semibold whitespace-nowrap overflow-x-auto no-scrollbar">
                                  <span className="text-[#6FD39A] font-bold">YOU:</span>
                                  <span className="text-[#F4F1F8]">🎲 {r.d20}</span>
                                  <span className="text-[#8B7A9E]">+</span>
                                  <span className="text-[#E5C158]">WEP {r.playerAtk}</span>
                                  <span className="text-[#8B7A9E]">−</span>
                                  <span className="text-[#FB923C]">DEF {r.enemyDef}</span>
                                  <span className="text-[#8B7A9E]">=</span>
                                  <span
                                    className={`font-bold ${
                                      r.hit ? 'text-[#6FD39A]' : 'text-[#9A90B8]'
                                    }`}
                                  >
                                    {r.margin >= 0 ? `+${r.margin}` : r.margin}
                                  </span>
                                </div>
                                <div className="text-[12px] font-bold">
                                  {r.hit ? (
                                    <span className="text-[#6FD39A]">
                                      HIT +{r.margin} × 5 = {r.dmgToEnemy}.{' '}
                                      <span className="text-[#E0645C]">
                                        FOE HP {r.enemyHpBefore} → {r.enemyHpAfter}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="text-[#9A90B8]">
                                      MISSED.{' '}
                                      <span className="text-[#E0645C]">
                                        FOE HP {r.enemyHpBefore} → {r.enemyHpAfter}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-0.5 pt-1 border-t border-white/[0.04]">
                                <div className="flex items-center gap-1 font-semibold whitespace-nowrap overflow-x-auto no-scrollbar">
                                  <span className="text-[#E0645C] font-bold">FOE:</span>
                                  <span className="text-[#F4F1F8]">🎲 {r.enemyD20}</span>
                                  <span className="text-[#8B7A9E]">+</span>
                                  <span className="text-[#C084FC]">ATK {r.enemyAtk}</span>
                                  <span className="text-[#8B7A9E]">−</span>
                                  <span className="text-[#7AA7FF]">AMR {r.playerArmor}</span>
                                  <span className="text-[#8B7A9E]">=</span>
                                  <span
                                    className={`font-bold ${
                                      r.enemyHit ? 'text-[#E0645C]' : 'text-[#9A90B8]'
                                    }`}
                                  >
                                    {r.enemyMargin >= 0 ? `+${r.enemyMargin}` : r.enemyMargin}
                                  </span>
                                </div>
                                <div className="text-[12px] font-bold">
                                  {r.enemyHit ? (
                                    <span className="text-[#E0645C]">
                                      HIT +{r.enemyMargin} × 5 = {r.dmgToPlayer}.{' '}
                                      <span className="text-[#6FD39A]">
                                        YOU HP {r.playerHpBefore} → {r.playerHpAfter}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="text-[#9A90B8]">
                                      MISSED.{' '}
                                      <span className="text-[#6FD39A]">
                                        YOU HP {r.playerHpBefore} → {r.playerHpAfter}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}

                          {isRollingDetourRound && (
                            <div className="p-2.5 rounded-lg bg-[#2A1B40]/70 border border-[#D4B876] flex items-center justify-center gap-2 animate-pulse">
                              <span className="text-[15px]">🎲</span>
                              <span className="font-['Cinzel'] font-bold text-[11.5px] tracking-[0.8px] text-[#F4E8C1] uppercase">
                                Rolling Skirmish R{detourFightRounds.length + 1}...
                              </span>
                            </div>
                          )}

                          {detourFightDone && (
                            <div className="pt-1 border-t border-white/[0.06] flex items-center justify-between">
                              {detourEnemyRemainingHp <= 0 ? (
                                <span className="px-2.5 py-1 rounded-lg bg-[#2A1B40] border border-[#6FD39A]/60 text-[12.5px] font-sans font-bold text-[#6FD39A]">
                                  ✓ Lookout Defeated · +50G Recovered
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-lg bg-[#2A1420] border border-[#E0645C]/70 text-[12.5px] font-sans font-bold text-[#E0645C]">
                                  ✕ Bruised Scrape · 0G Earned
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {!detourFightDone && (
                        <button
                          type="button"
                          disabled={isRollingDetourRound}
                          onClick={handleRollDetourFightRound}
                          className="w-full py-2 px-2.5 rounded-xl bg-[#E0645C]/20 hover:bg-[#E0645C]/30 border border-[#E0645C] text-[#F4F1F8] font-['Cinzel'] font-bold text-[11.5px] tracking-[0.5px] uppercase transition whitespace-nowrap truncate disabled:opacity-50"
                        >
                          {isRollingDetourRound
                            ? '🎲 ROLLING SKIRMISH...'
                            : `⚔️ ROLL SKIRMISH R${
                                detourFightRounds.length + 1
                              } (D20 + ${baseWeaponAtk})`}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Post-Skirmish 2-Paragraph Mythios Narration (#1: 15px SMS font) */}
                {!dayData.hasFight && detourFightDone && (
                  <div className="mr-5 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3 space-y-1.5 shadow-md">
                    <div className="flex items-center justify-between gap-2 leading-none">
                      <span className="font-['Cinzel'] font-bold text-[11px] tracking-[1.2px] text-[#C4A1FF] uppercase shrink-0">
                        MYTHIOS
                      </span>
                      <span
                        className={`text-[11px] font-sans font-bold whitespace-nowrap truncate ${
                          detourEnemyRemainingHp <= 0 ? 'text-[#6FD39A]' : 'text-[#E0645C]'
                        }`}
                      >
                        {detourEnemyRemainingHp <= 0
                          ? '✓ Lookout Driven Off (+50G)'
                          : '✕ Bruised Scrape (0G)'}
                      </span>
                    </div>
                    <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                      {recoveryParagraphs[0]}
                    </p>
                    <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                      {recoveryParagraphs[1]}
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ===================================================================
            ACTION CARD 2 — ⚔️ FIGHT CARD (#2: Compact gaps, #4: Roll button fit, #5: 1-line math)
            On dual Challenge + Fight days (like W1·D1), unlocks after the Challenge roll!
           =================================================================== */}
        {dayData.hasFight && (!dayData.challengeTitle || rollOutcome !== null) && (
          <>
            <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
              <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555] flex items-center justify-between gap-2">
                <span className="font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8] truncate">
                  ⚔️ FIGHT · {(dayData.fightEnemyName || 'Order Sentry').toUpperCase()}
                </span>
                <span className="font-['Cinzel'] font-bold text-[11.5px] whitespace-nowrap shrink-0">
                  <span className="text-[#E5C158]">WEP {playerAtk}</span>{' '}
                  <span className="text-[#B7A9CC]">vs</span>{' '}
                  <span className="text-[#FB923C]">DEF {enemyDef}</span>
                </span>
              </div>

              <div className="p-2.5 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-[#130B1F] border border-[#3A2555]">
                    <div className="flex items-center justify-between gap-1 text-[11.5px] font-['Cinzel'] font-bold">
                      <span className="text-[#6FD39A] truncate">YOU</span>
                      <span className="text-[#6FD39A] whitespace-nowrap shrink-0">
                        {playerRemainingHp}/{playerMaxHp} HP
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#2A1B40] rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-[#6FD39A] transition-all duration-300"
                        style={{
                          width: `${Math.round((playerRemainingHp / playerMaxHp) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="mt-1.5 space-y-0.5 text-[11.5px] font-sans">
                      <div className="flex items-center justify-between font-semibold text-[#E5C158]">
                        <span>Weapon WEP</span>
                        <span className="font-bold">{playerAtk}</span>
                      </div>
                      <div className="flex items-center justify-between font-semibold text-[#7AA7FF]">
                        <span>Armour AMR</span>
                        <span className="font-bold">{playerArmor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#130B1F] border border-[#3A2555]">
                    <div className="flex items-center justify-between gap-1 text-[11.5px] font-['Cinzel'] font-bold">
                      <span className="text-[#E0645C] truncate">FOE</span>
                      <span className="text-[#E0645C] whitespace-nowrap shrink-0">
                        {enemyRemainingHp}/{enemyFullHp} HP
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#2A1B40] rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-[#E0645C] transition-all duration-300"
                        style={{
                          width: `${Math.round((enemyRemainingHp / enemyFullHp) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="mt-1.5 space-y-0.5 text-[11.5px] font-sans">
                      <div className="flex items-center justify-between font-semibold text-[#FB923C]">
                        <span>Defence DEF</span>
                        <span className="font-bold">{enemyDef}</span>
                      </div>
                      <div className="flex items-center justify-between font-semibold text-[#C084FC]">
                        <span>Attack ATK</span>
                        <span className="font-bold">{enemyAtk}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {(fightRounds.length > 0 || isRollingRound) && (
                  <div className="p-2.5 rounded-xl bg-[#130B1F] border border-[#3A2555] space-y-2">
                    {fightRounds.map((r) => (
                      <div
                        key={r.round}
                        className="p-2 rounded-lg bg-[#1A102A] border border-[#3A2555]/80 space-y-1.5 text-[12px] font-sans"
                      >
                        <div className="flex items-center justify-between border-b border-white/[0.06] pb-1">
                          <span className="px-1.5 py-0.5 rounded bg-[#D4B876]/20 border border-[#D4B876]/50 font-['Cinzel'] font-bold text-[10.5px] text-[#E5C158]">
                            ROUND {r.round}
                          </span>
                          <span className="text-[11px] font-sans font-semibold text-[#B7A9CC]">
                            Diff × 5 Damage
                          </span>
                        </div>

                        {/* #5: One-line combat math row */}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 font-semibold whitespace-nowrap overflow-x-auto no-scrollbar">
                            <span className="text-[#6FD39A] font-bold">YOU:</span>
                            <span className="text-[#F4F1F8]">🎲 {r.d20}</span>
                            <span className="text-[#8B7A9E]">+</span>
                            <span className="text-[#E5C158]">WEP {r.playerAtk}</span>
                            <span className="text-[#8B7A9E]">−</span>
                            <span className="text-[#FB923C]">DEF {r.enemyDef}</span>
                            <span className="text-[#8B7A9E]">=</span>
                            <span
                              className={`font-bold ${
                                r.hit ? 'text-[#6FD39A]' : 'text-[#9A90B8]'
                              }`}
                            >
                              {r.margin >= 0 ? `+${r.margin}` : r.margin}
                            </span>
                          </div>
                          <div className="text-[12px] font-bold">
                            {r.hit ? (
                              <span className="text-[#6FD39A]">
                                HIT +{r.margin} × 5 = {r.dmgToEnemy}.{' '}
                                <span className="text-[#E0645C]">
                                  FOE HP {r.enemyHpBefore} → {r.enemyHpAfter}
                                </span>
                              </span>
                            ) : (
                              <span className="text-[#9A90B8]">
                                MISSED.{' '}
                                <span className="text-[#E0645C]">
                                  FOE HP {r.enemyHpBefore} → {r.enemyHpAfter}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-0.5 pt-1 border-t border-white/[0.04]">
                          <div className="flex items-center gap-1 font-semibold whitespace-nowrap overflow-x-auto no-scrollbar">
                            <span className="text-[#E0645C] font-bold">FOE:</span>
                            <span className="text-[#F4F1F8]">🎲 {r.enemyD20}</span>
                            <span className="text-[#8B7A9E]">+</span>
                            <span className="text-[#C084FC]">ATK {r.enemyAtk}</span>
                            <span className="text-[#8B7A9E]">−</span>
                            <span className="text-[#7AA7FF]">AMR {r.playerArmor}</span>
                            <span className="text-[#8B7A9E]">=</span>
                            <span
                              className={`font-bold ${
                                r.enemyHit ? 'text-[#E0645C]' : 'text-[#9A90B8]'
                              }`}
                            >
                              {r.enemyMargin >= 0 ? `+${r.enemyMargin}` : r.enemyMargin}
                            </span>
                          </div>
                          <div className="text-[12px] font-bold">
                            {r.enemyHit ? (
                              <span className="text-[#E0645C]">
                                HIT +{r.enemyMargin} × 5 = {r.dmgToPlayer}.{' '}
                                <span className="text-[#6FD39A]">
                                  YOU HP {r.playerHpBefore} → {r.playerHpAfter}
                                </span>
                              </span>
                            ) : (
                              <span className="text-[#9A90B8]">
                                MISSED.{' '}
                                <span className="text-[#6FD39A]">
                                  YOU HP {r.playerHpBefore} → {r.playerHpAfter}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isRollingRound && (
                      <div className="p-2.5 rounded-lg bg-[#2A1B40]/70 border border-[#D4B876] flex items-center justify-center gap-2 animate-pulse">
                        <span className="text-[15px]">🎲</span>
                        <span className="font-['Cinzel'] font-bold text-[11.5px] tracking-[0.8px] text-[#F4E8C1] uppercase">
                          Rolling Round {fightRounds.length + 1} d20...
                        </span>
                      </div>
                    )}

                    {fightDone && (
                      <div className="pt-1 border-t border-white/[0.06] flex items-center justify-between">
                        {enemyRemainingHp <= 0 ? (
                          <span className="px-2.5 py-1 rounded-lg bg-[#2A1B40] border border-[#D4B876] text-[13px] font-sans font-bold text-[#E5C158]">
                            {(dayData.fightReward !== undefined ? dayData.fightReward : 300) > 0
                              ? `🎁 Reward: +${dayData.fightReward !== undefined ? dayData.fightReward : 300}g Earned`
                              : '✓ Driven Off · No fight gold today (the Challenge was the paid beat)'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-[#2A1420] border border-[#E0645C]/70 text-[12.5px] font-sans font-bold text-[#E0645C]">
                            ✕ Bruised Scrape · 0g Earned · Trail Unbarred
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* #4: Sized so RELIC +1 and ROLL ROUND 1 fit on one line without text overrun */}
                {!fightDone && (
                  <div className="flex items-center gap-1.5">
                    {fightRounds.length === 0 && (
                      <button
                        type="button"
                        disabled={availableBattleRelics <= 0 || isRollingRound}
                        onClick={() => setUseCombatRelic(!useCombatRelic)}
                        className={`px-2.5 py-2 rounded-xl font-['Cinzel'] font-bold text-[11px] border transition whitespace-nowrap shrink-0 ${
                          useCombatRelic
                            ? 'bg-[#D4B876]/25 border-[#D4B876] text-[#F4F1F8]'
                            : 'bg-[#130B1F] border-[#3A2555] text-[#B7A9CC] disabled:opacity-40'
                        }`}
                      >
                        ♦ RELIC +1
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isRollingRound}
                      onClick={handleRollSingleFightRound}
                      className="flex-1 min-w-0 py-2 px-2.5 rounded-xl bg-[#D4B876]/22 hover:bg-[#D4B876]/32 border border-[#D4B876] text-[#F4F1F8] font-['Cinzel'] font-bold text-[11.5px] tracking-[0.5px] uppercase transition whitespace-nowrap truncate disabled:opacity-50"
                    >
                      {isRollingRound
                        ? '🎲 ROLLING...'
                        : `🎲 ROLL ROUND ${fightRounds.length + 1} (D20 + ${playerAtk})`}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* POST-FIGHT 2-PARAGRAPH NON-REPEATING PROSE (#1: 15px SMS font) */}
            {fightDone && (
              <div className="mr-5 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3 space-y-1.5 shadow-md">
                <div className="flex items-center justify-between gap-2 leading-none">
                  <span className="font-['Cinzel'] font-bold text-[11px] tracking-[1.2px] text-[#C4A1FF] uppercase shrink-0">
                    MYTHIOS
                  </span>
                  <span className="text-[11px] font-sans font-bold text-[#6FD39A] whitespace-nowrap truncate">
                    ✓ Foe Defeated
                  </span>
                </div>
                <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                  {fightWinParagraphs[0]}
                </p>
                <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                  {fightWinParagraphs[1]}
                </p>
              </div>
            )}
          </>
        )}

        {/* ===================================================================
            W1·D2 TEAM FORMATION UNLOCK BANNER (When FIT THE PAGE is completed at The Hollow Wake Inn)
           =================================================================== */}
        {currentWeek === 1 && currentDay === 2 && isArtifactUnlocked && (
          <div className="w-full rounded-xl bg-[#180F29] border border-[#6FD39A] overflow-hidden shadow-lg">
            <div className="px-3 py-2 bg-[#1A2A24] border-b border-[#6FD39A]/45 flex items-center justify-between gap-2">
              <span className="font-['Cinzel'] font-bold text-[12px] text-[#6FD39A] truncate">
                🤝 TEAM FORMED · THE HOLLOW WAKE INN
              </span>
              <span className="font-['Cinzel'] font-bold text-[10.5px] text-[#E5C158] whitespace-nowrap shrink-0">
                🔓 PARTY & CAMPFIRE ACTIVE
              </span>
            </div>
            <div className="p-2.5 space-y-1">
              <p className="font-sans text-[13.5px] text-[#F4F1F8] leading-[1.4]">
                With all four torn stubs fitted into Scholar Meira’s notebook, you,{' '}
                <span className="text-[#F49CBB] font-semibold">Mei</span>,{' '}
                <span className="text-[#5BC0EB] font-semibold">Dev</span>, and{' '}
                <span className="text-[#4FD1C5] font-semibold">Arjun</span>—guided by{' '}
                <span className="text-[#F0A552] font-semibold">Garrick</span>—have formed a party to rescue the first child before the dark moon rises. The{' '}
                <span className="text-[#E5C158] font-semibold">PARTY</span> button above and your Episode 1 Campfires are now unlocked!
              </p>
            </div>
          </div>
        )}

        {/* ===================================================================
            ACTION CARD 3 — 📜 SEEKER FRAGMENT ARTIFACT CARD
           =================================================================== */}
        {dayFragment && isArtifactUnlocked && (
          <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
            <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555] flex items-center justify-between gap-2">
              <span className="font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8] whitespace-nowrap truncate">
                📜 SEEKER FRAGMENT {dayFragment.id}
              </span>
              <span className="font-['Cinzel'] font-bold text-[11.5px] text-[#D4B876] whitespace-nowrap shrink-0">
                {solvedFragCount}/2 Solved
              </span>
            </div>

            <div className="p-2.5 space-y-2 bg-[#160E26]">
              {renderArtifactFragmentQuote()}

              <button
                onClick={() => onOpenSeekerInBag(currentWeek, currentDay)}
                className="w-full py-2 px-3 rounded-xl bg-[#2A1B40] hover:bg-[#D4B876]/25 border border-[#D4B876] font-['Cinzel'] font-bold text-[11.5px] tracking-[0.8px] text-[#D4B876] hover:text-[#F4F1F8] transition uppercase"
              >
                UNJUMBLE IN BAG (+25G) →
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            BEATS 5, 6 & 7 — FULL INTERACTIVE "FANNING OUT" / SOLO CLOSER INSPECTION
            - #8: Single-line MYTHIOS header
            - #10: 2 Options to Fan Out (1 Challenge + 1 Skirmish) + 1 Skip Option
           =================================================================== */}
        {isArtifactUnlocked && (
          <>
            {/* BEAT 5: MYTHIOS 2-PARAGRAPH LEAD-IN (#8: single-line header) */}
            <div className="mr-5 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3 space-y-1.5 shadow-md">
              <div className="flex items-center justify-between gap-2 leading-none">
                <span className="font-['Cinzel'] font-bold text-[11px] tracking-[1.2px] text-[#C4A1FF] uppercase shrink-0">
                  MYTHIOS
                </span>
                <span className="text-[11px] font-sans font-semibold text-[#D4B876] whitespace-nowrap truncate">
                  {isSoloW1D1
                    ? 'Fragment Secured · Closer Inspection'
                    : 'Fragment Secured · Fanning Out'}
                </span>
              </div>
              <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                {fanOutEncounter.leadInParagraph1}
              </p>
              <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                {fanOutEncounter.leadInParagraph2}
              </p>
            </div>

            {/* ACTION CARD 4 — 🧭 SOLO BRANCH BEFORE DUSK */}
            <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
              <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555] flex items-center justify-between gap-2">
                <span className="font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8] truncate">
                  {isSoloW1D1
                    ? '🧭 CLOSER INSPECTION · SOLO BRANCH'
                    : '🧭 FANNING OUT · SOLO BRANCH'}
                </span>
                <span className="font-['Cinzel'] font-bold text-[11px] text-[#D4B876] whitespace-nowrap shrink-0">
                  {fanOutBranch
                    ? '✓ Route Chosen'
                    : isSoloW1D1
                    ? '2 Routes + Road North'
                    : '2 Routes + Camp'}
                </span>
              </div>
              <div className="p-2.5 space-y-1.5">
                {[fanOutEncounter.branchA, fanOutEncounter.branchB].map((opt) => {
                  const chosen = fanOutBranch?.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectFanOutBranch(opt)}
                      className={`w-full p-2.5 rounded-xl text-left transition border ${
                        chosen
                          ? 'bg-[#2A1B40] border-[#D4B876] shadow-sm'
                          : 'bg-[#130B1F] border-[#3A2555] hover:border-[#7E68B8]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="font-['Cinzel'] font-bold text-[12.5px] truncate"
                          style={{ color: opt.color }}
                        >
                          {chosen ? '✓ ' : ''}
                          {opt.title}
                        </span>
                        <span
                          className="font-['Cinzel'] font-bold text-[11px] whitespace-nowrap shrink-0"
                          style={{ color: opt.color }}
                        >
                          {chosen ? `✓ ${opt.badge}` : opt.badge}
                        </span>
                      </div>
                      <p className="text-[13.5px] font-sans text-[#E6E0F0] mt-0.5 leading-snug">
                        {opt.label}
                      </p>
                    </button>
                  );
                })}

                {/* 3RD OPTION: PRESS ON TO INN (ON W1·D1) OR BACK TO CAMPFIRE (ON W1·D2+) */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSoloW1D1) {
                      handleSelectFanOutBranch({
                        id: 'BRANCH_SKIP_CAMP',
                        branchType: 'CAMPFIRE',
                        title: 'HEAD NORTH TOWARD THE INN',
                        badge: 'FINISHED DAY',
                        color: '#6FD39A',
                        label:
                          'Finish today\'s chapter and follow the drove road north toward The Hollow Wake Inn.',
                        playerDeclaration: `The light is fading fast over ${dayData.place}—I have the torn list and today's Seeker Fragment, so I’ll head north toward The Hollow Wake Inn.`,
                        arrivalParagraph1: `You strap your pack tight at ${dayData.place} and turn north up the wet drove road toward the inn.`,
                        arrivalParagraph2: `With today's chapter complete, you look ahead toward the warm lamplight of The Hollow Wake Inn.`,
                      });
                    } else {
                      handleSelectFanOutBranch({
                        id: 'BRANCH_SKIP_CAMP',
                        branchType: 'CAMPFIRE',
                        title: 'HEAD TO THE CAMPFIRE',
                        badge: 'FINISHED DAY',
                        color: '#F0A552',
                        label:
                          'Finish today\'s chapter and walk straight to the campfire.',
                        playerDeclaration: `The light is fading over ${dayData.place}—I’ll head straight to the campfire with today's Fragment.`,
                        arrivalParagraph1: `You finish your day at ${dayData.place} and walk straight toward the woodsmoke of the campfire.`,
                        arrivalParagraph2: `Your day is complete. You arrive at the fire as the kettle begins to boil and will catch up with tonight's clues from the board.`,
                      });
                    }
                  }}
                  className={`w-full p-2.5 rounded-xl text-left transition border ${
                    fanOutBranch?.id === 'BRANCH_SKIP_CAMP'
                      ? 'bg-[#1E1232] border-[#D4B876] shadow-sm'
                      : 'bg-[#140B1C] border-[#3A2555] hover:border-[#D4B876]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-['Cinzel'] font-bold text-[12px] text-[#F0A552] truncate">
                      {fanOutBranch?.id === 'BRANCH_SKIP_CAMP'
                        ? '✓ '
                        : isSoloW1D1
                        ? '🏠 '
                        : '🔥 '}
                      {isSoloW1D1
                        ? 'HEAD NORTH TO THE INN (FINISH DAY)'
                        : 'HEAD TO THE CAMPFIRE (FINISH DAY)'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#1A102A] border border-[#6FD39A]/60 font-['Cinzel'] font-bold text-[10px] text-[#6FD39A] whitespace-nowrap shrink-0">
                      FINISHED DAY
                    </span>
                  </div>
                  <p className="text-[13px] font-sans text-[#D8CEE8] mt-0.5 leading-snug">
                    {isSoloW1D1 ? (
                      <>
                        Head up the drove road toward the inn. Your day is complete without the extra search.
                      </>
                    ) : (
                      <>
                        Head straight to the fire. A finished day with no extra roll—you can read tonight’s clue from the board.
                      </>
                    )}
                  </p>
                </button>
              </div>
            </div>

            {/* BEAT 6: PLAYER DECLARATION + 2-PARAGRAPH ARRIVAL + CHALLENGE OR FIGHT ENCOUNTER */}
            {fanOutBranch && (
              <>
                <div className="ml-5 flex flex-col items-end">
                  <div className="w-full rounded-2xl rounded-tr-sm bg-[#4A3B24] border border-[#E5C77B] p-3 space-y-1.5 shadow-md">
                    <div className="flex items-center justify-between leading-none">
                      <span className="font-['Cinzel'] font-bold text-[11px] tracking-[1.2px] text-[#F3D88B] uppercase">
                        {characterName || 'YOU'}
                      </span>
                    </div>
                    <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                      {fanOutBranch.playerDeclaration}
                    </p>
                  </div>
                </div>

                {/* 2-Paragraph Solo Encounter Arrival */}
                <div className="mr-5 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3 space-y-1.5 shadow-md">
                  <div className="flex items-center justify-between gap-2 leading-none">
                    <span className="font-['Cinzel'] font-bold text-[11px] tracking-[1.2px] text-[#C4A1FF] uppercase shrink-0">
                      MYTHIOS
                    </span>
                    <span className="text-[11px] font-sans font-semibold text-[#D4B876] whitespace-nowrap truncate">
                      {fanOutBranch.branchType === 'CAMPFIRE'
                        ? isSoloW1D1
                          ? '✓ Bound for The Hollow Wake Inn'
                          : '✓ Regrouping at Camp'
                        : isSoloW1D1
                        ? 'Solo Roadside Inspection'
                        : 'Solo Fan-Out Encounter'}
                    </span>
                  </div>
                  <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                    {fanOutBranch.arrivalParagraph1}
                  </p>
                  <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                    {fanOutBranch.arrivalParagraph2}
                  </p>
                </div>

                {/* BRANCH A: INTERACTIVE FAN-OUT CHALLENGE ROLL CARD */}
                {fanOutBranch.branchType === 'CHALLENGE' &&
                  fanOutBranch.challengeAttrs && (
                    <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
                      <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555] flex items-center justify-between gap-2">
                        <span className="font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8] truncate">
                          🎯 {isSoloW1D1 ? 'ROADSIDE CHALLENGE' : 'FAN-OUT CHALLENGE'} ·{' '}
                          {(fanOutBranch.challengeTitle || 'LOCKED COURIER CACHE').toUpperCase()}
                        </span>
                        <span className="font-['Cinzel'] font-bold text-[11.5px] text-[#E5C158] whitespace-nowrap shrink-0">
                          You succeed on {challengeSucceedOn(weekdayDC, activeFanOutTierBonus)}+
                        </span>
                      </div>

                      <div className="p-2.5 space-y-2">
                        <div className="space-y-1.5">
                          {fanOutBranch.challengeAttrs.map((attr) => {
                            const meta = ATTRIBUTE_META[attr];
                            const score = attributes[attr] || 20;
                            const isSelected = activeFanOutAttr === attr;
                            return (
                              <button
                                key={attr}
                                disabled={!!fanOutRollOutcome}
                                onClick={() => setFanOutSelectedAttr(attr)}
                                className={`w-full p-2.5 rounded-xl text-left transition border ${
                                  isSelected
                                    ? 'bg-[#2A1B40] border-[#D4B876] shadow-sm'
                                    : 'bg-[#130B1F] border-[#3A2555] opacity-85 hover:opacity-100'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className="font-['Cinzel'] font-bold text-[12.5px] truncate"
                                    style={{ color: meta.color }}
                                  >
                                    {isSelected ? '✓ ' : ''}
                                    {attr === 'Craft'
                                      ? 'EXAMINE TOOL-MARKS & TIMBER'
                                      : attr === 'Intellect'
                                      ? 'RECONSTRUCT THE SCENE'
                                      : attr === 'Agility'
                                      ? 'SCALE THE SIGNAL OVERHANG'
                                      : attr === 'Aim'
                                      ? 'SIGHT THE NOTCHED BEARINGS'
                                      : `APPROACH WITH ${attr.toUpperCase()}`}
                                  </span>
                                  <span
                                    className="font-['Cinzel'] font-bold text-[12px] whitespace-nowrap shrink-0"
                                    style={{ color: meta.color }}
                                  >
                                    {attr.toUpperCase()} {score}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {!fanOutRollOutcome && (
                          <button
                            type="button"
                            onClick={handleRollFanOutChallenge}
                            disabled={isRollingFanOut}
                            className="w-full py-2 px-3 rounded-xl bg-[#D4B876]/22 hover:bg-[#D4B876]/32 border border-[#D4B876] text-[#F4F1F8] font-['Cinzel'] font-bold text-[12px] tracking-[0.8px] uppercase transition"
                          >
                            {isRollingFanOut
                              ? '🎲 ROLLING…'
                              : `🎲 ROLL D20 + ${activeFanOutTierBonus}`}
                          </button>
                        )}

                        {fanOutRollOutcome && (
                          <div className="p-2.5 rounded-xl bg-[#130B1F] border border-[#3A2555] space-y-1.5">
                            <div className="p-2 rounded-lg bg-[#1A102A] border border-[#3A2555]/80 space-y-0.5 text-[12px] font-sans">
                              <div className="flex items-center gap-1 font-semibold whitespace-nowrap overflow-x-auto no-scrollbar">
                                <span className="text-[#6FD39A] font-bold">YOU:</span>
                                <span className="text-[#F4F1F8]">
                                  🎲 {fanOutRollOutcome.d20}
                                </span>
                                <span className="text-[#8B7A9E]">+</span>
                                <span
                                  style={{
                                    color: ATTRIBUTE_META[fanOutRollOutcome.attr].color,
                                  }}
                                >
                                  {fanOutRollOutcome.attr} {fanOutRollOutcome.attrPoints} (+{fanOutRollOutcome.tierBonus})
                                </span>
                                <span className="text-[#8B7A9E]">−</span>
                                <span className="text-[#E5C158]">
                                  DC {fanOutRollOutcome.dc}
                                </span>
                                <span className="text-[#8B7A9E]">=</span>
                                <span
                                  className={`font-bold ${
                                    fanOutRollOutcome.cleared
                                      ? 'text-[#6FD39A]'
                                      : 'text-[#E0645C]'
                                  }`}
                                >
                                  {fanOutRollOutcome.margin >= 0
                                    ? `+${fanOutRollOutcome.margin}`
                                    : fanOutRollOutcome.margin}
                                </span>
                              </div>
                              <div
                                className={`font-bold text-[12.5px] ${
                                  fanOutRollOutcome.cleared
                                    ? 'text-[#6FD39A]'
                                    : 'text-[#E0645C]'
                                }`}
                              >
                                {fanOutRollOutcome.cleared
                                  ? `PASSED · +${GOLD_FAN_OUT_CACHE_WIN}g + 1st-Letter Hint Unlocked!`
                                  : isSoloW1D1
                                  ? 'FAILED · 0g Earned — Pressing On Toward the Inn'
                                  : 'FAILED · 0g Earned — Returning to Campfire'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* BRANCH B: INTERACTIVE FAN-OUT SKIRMISH FIGHT CARD */}
                {fanOutBranch.branchType === 'FIGHT' && (
                  <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
                    <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555] flex items-center justify-between gap-2">
                      <span className="font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8] truncate">
                        ⚔️ {isSoloW1D1 ? 'ROADSIDE SKIRMISH' : 'FAN-OUT SKIRMISH'} ·{' '}
                        {(fanOutBranch.enemyName || 'REAR-GUARD SCOUT').toUpperCase()}
                      </span>
                      <span className="font-['Cinzel'] font-bold text-[11.5px] whitespace-nowrap shrink-0">
                        <span className="text-[#E5C158]">WEP {baseWeaponAtk}</span>{' '}
                        <span className="text-[#B7A9CC]">vs</span>{' '}
                        <span className="text-[#FB923C]">DEF {fanOutEnemyDef}</span>
                      </span>
                    </div>

                    <div className="p-2.5 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-xl bg-[#130B1F] border border-[#3A2555]">
                          <div className="flex items-center justify-between gap-1 text-[11.5px] font-['Cinzel'] font-bold">
                            <span className="text-[#6FD39A] truncate">YOU</span>
                            <span className="text-[#6FD39A] whitespace-nowrap shrink-0">
                              {fanOutPlayerRemainingHp}/100 HP
                            </span>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#130B1F] border border-[#3A2555]">
                          <div className="flex items-center justify-between gap-1 text-[11.5px] font-['Cinzel'] font-bold">
                            <span className="text-[#E0645C] truncate">SCOUT</span>
                            <span className="text-[#E0645C] whitespace-nowrap shrink-0">
                              {fanOutEnemyRemainingHp}/{fanOutEnemyFullHp} HP
                            </span>
                          </div>
                        </div>
                      </div>

                      {(fanOutFightRounds.length > 0 || isRollingFanOutRound) && (
                        <div className="p-2.5 rounded-xl bg-[#130B1F] border border-[#3A2555] space-y-1.5">
                          {fanOutFightRounds.map((r) => (
                            <div
                              key={r.round}
                              className="p-2 rounded-lg bg-[#1A102A] border border-[#3A2555]/80 space-y-0.5 text-[12px] font-sans"
                            >
                              <div className="flex items-center gap-1 font-semibold whitespace-nowrap overflow-x-auto no-scrollbar">
                                <span className="text-[#6FD39A] font-bold">
                                  R{r.round} YOU:
                                </span>
                                <span className="text-[#F4F1F8]">🎲 {r.d20}</span>
                                <span className="text-[#8B7A9E]">+</span>
                                <span className="text-[#E5C158]">WEP {r.playerAtk}</span>
                                <span className="text-[#8B7A9E]">−</span>
                                <span className="text-[#FB923C]">DEF {r.enemyDef}</span>
                                <span className="text-[#8B7A9E]">=</span>
                                <span className="text-[#6FD39A] font-bold">
                                  {r.hit
                                    ? `HIT (${r.dmgToEnemy} DMG · HP ${r.enemyHpAfter})`
                                    : 'MISSED'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {!fanOutFightDone && (
                        <button
                          type="button"
                          disabled={isRollingFanOutRound}
                          onClick={handleRollFanOutFightRound}
                          className="w-full py-2 px-2.5 rounded-xl bg-[#D4B876]/22 hover:bg-[#D4B876]/32 border border-[#D4B876] text-[#F4F1F8] font-['Cinzel'] font-bold text-[11.5px] tracking-[0.5px] uppercase transition whitespace-nowrap truncate"
                        >
                          {isRollingFanOutRound
                            ? '🎲 ROLLING SKIRMISH...'
                            : `🎲 ROLL SKIRMISH R${
                                fanOutFightRounds.length + 1
                              } (D20 + ${baseWeaponAtk})`}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* BEAT 7: 2-PARAGRAPH SOLO AFTERMATH + SEEKER 1ST-LETTER HINT PAYOFF */}
                {fanOutCompleted && fanOutBranch.branchType !== 'CAMPFIRE' && (
                  <div className="mr-5 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3 space-y-1.5 shadow-md">
                    <div className="flex items-center justify-between gap-2 leading-none">
                      <span className="font-['Cinzel'] font-bold text-[11px] tracking-[1.2px] text-[#C4A1FF] uppercase shrink-0">
                        MYTHIOS
                      </span>
                      <span
                        className={`text-[11px] font-sans font-bold whitespace-nowrap truncate ${
                          fanOutRollOutcome?.cleared ||
                          (fanOutFightDone && fanOutEnemyRemainingHp <= 0)
                            ? 'text-[#6FD39A]'
                            : 'text-[#E0645C]'
                        }`}
                      >
                        {fanOutRollOutcome?.cleared ||
                        (fanOutFightDone && fanOutEnemyRemainingHp <= 0)
                          ? '✓ +150G · Hint & Note Unlocked'
                          : '✕ 0G · Lead Slipped Away'}
                      </span>
                    </div>

                    {fanOutRollOutcome?.cleared ||
                    (fanOutFightDone && fanOutEnemyRemainingHp <= 0) ? (
                      <>
                        <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                          {fanOutBranch.passParagraph1}
                        </p>
                        <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                          {fanOutBranch.passParagraph2}
                        </p>
                        {dayFragment && (
                          <div className="p-2 rounded-xl bg-[#150D22] border border-[#6FD39A]/60 space-y-0.5">
                            <div className="font-['Cinzel'] font-bold text-[10.5px] text-[#6FD39A] uppercase">
                              {isSoloW1D1
                                ? '🔍 +150G · SEEKER 1ST-LETTER HINT & ROADSIDE NOTE'
                                : '🔍 +150G · SEEKER 1ST-LETTER HINT + CAMPFIRE CLUE'}
                            </div>
                            <p className="font-sans text-[13px] text-[#E6E0F0] leading-snug">
                              1st Letter of Word 1 is{' '}
                              <span className="font-bold text-[#6FD39A]">
                                “{dayFragment.word1[0].toUpperCase()}”
                              </span>
                              .{' '}
                              {isSoloW1D1 ? (
                                <>
                                  Your roadside note (
                                  <span className="text-[#E5C158] font-semibold">
                                    {fanOutBranch.soloClueTitle}
                                  </span>
                                  ) is tucked into your pack for The Hollow Wake Inn!
                                </>
                              ) : (
                                <>
                                  Your solo finding (
                                  <span className="text-[#E5C158] font-semibold">
                                    {fanOutBranch.soloClueTitle}
                                  </span>
                                  ) is ready for the Campfire!
                                </>
                              )}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                          {fanOutBranch.failParagraph1}
                        </p>
                        <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                          {fanOutBranch.failParagraph2}
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* PRIVATE DAILY THEORY PROMPT (Counts as your pin on the Campfire board when you arrive) */}
                {fanOutCompleted && (() => {
                  const campfireEntry = getCampfireDayEntry(currentWeek, currentDay);
                  const savedPrivatePin = privateTheoryPromptsByDay[dayKey];
                  return (
                    <div className="w-full rounded-xl bg-[#180F29] border border-[#D4B876]/60 overflow-hidden shadow-lg">
                      <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555] flex items-center justify-between gap-2">
                        <span className="font-['Cinzel'] font-bold text-[12px] text-[#E5C158] truncate">
                          📌 PRIVATE DAILY THEORY PROMPT · {dayKey}
                        </span>
                        <span className="font-['Cinzel'] font-bold text-[10.5px] text-[#6FD39A] whitespace-nowrap shrink-0">
                          {savedPrivatePin
                            ? '✓ Pinned for Campfire Board'
                            : 'Counts as Your Campfire Pin'}
                        </span>
                      </div>
                      <div className="p-2.5 space-y-2">
                        <p className="font-sans text-[13px] text-[#D8CEE8] leading-snug">
                          Your answer here automatically pins your theory to the Campfire board when you arrive tonight (no gold awarded; theories are for the party table):
                        </p>
                        <div className="space-y-1.5">
                          {(
                            [
                              { key: 'A' as const, label: `Reading A: ${campfireEntry.forkA}` },
                              { key: 'B' as const, label: `Reading B: ${campfireEntry.forkB}` },
                              { key: 'NEITHER' as const, label: 'Neither — my own reading' },
                            ] as const
                          ).map((opt) => {
                            const active = savedPrivatePin?.reading === opt.key;
                            return (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => {
                                  if (onSavePrivateTheoryPrompt) {
                                    onSavePrivateTheoryPrompt(dayKey, {
                                      reading: opt.key,
                                      customLine:
                                        privatePromptCustomText.trim() ||
                                        savedPrivatePin?.customLine,
                                    });
                                  }
                                }}
                                className={`w-full p-2.5 rounded-xl border text-left transition ${
                                  active
                                    ? 'bg-[#2A1B40] border-[#6FD39A] text-[#F4F1F8]'
                                    : 'bg-[#130B1F] border-[#3A2555] text-[#E6E0F0] hover:border-[#D4B876]'
                                }`}
                              >
                                <div className="font-sans text-[13.5px] font-semibold leading-snug">
                                  {active ? '✓ ' : ''}
                                  {opt.label}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                          <input
                            type="text"
                            maxLength={140}
                            value={privatePromptCustomText}
                            onChange={(e) => setPrivatePromptCustomText(e.target.value)}
                            placeholder="Optional one-line note for your pin..."
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#0D0714] border border-[#3A2555] font-sans text-[13px] text-[#F4F1F8] placeholder-[#8B7A9E] focus:outline-none focus:border-[#D4B876]"
                          />
                          {savedPrivatePin && privatePromptCustomText.trim() && (
                            <button
                              type="button"
                              onClick={() => {
                                if (onSavePrivateTheoryPrompt) {
                                  onSavePrivateTheoryPrompt(dayKey, {
                                    reading: savedPrivatePin.reading,
                                    customLine: privatePromptCustomText.trim(),
                                  });
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#2A1B40] border border-[#D4B876] font-['Cinzel'] font-bold text-[10.5px] text-[#E5C158] uppercase"
                            >
                              Save Note
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </>
        )}

        {/* OPEN-ENDED PLAYER & MYTHIOS ACTION MESSAGES (#1: 15px SMS font) */}
        {chatHistory.map((msg, i) =>
          msg.sender === 'YOU' ? (
            <div key={i} className="ml-5 flex flex-col items-end">
              <div className="w-full rounded-2xl rounded-tr-sm bg-[#4A3B24] border border-[#E5C77B] p-3 space-y-1.5 shadow-md">
                <div className="flex items-center justify-between leading-none">
                  <span className="font-['Cinzel'] font-bold text-[11px] tracking-[1.2px] text-[#F3D88B] uppercase">
                    {characterName || 'YOU'}
                  </span>
                </div>
                <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                  {msg.text}
                </p>
              </div>
            </div>
          ) : (
            <div
              key={i}
              className="mr-5 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3 space-y-1.5 shadow-md"
            >
              <div className="flex items-center justify-between leading-none">
                <span className="font-['Cinzel'] font-bold text-[11px] tracking-[1.2px] text-[#C4A1FF] uppercase">
                  MYTHIOS
                </span>
              </div>
              <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                {msg.text}
              </p>
            </div>
          )
        )}
      </div>

      {/* 6. SINGLE BOTTOM TRANSITION BAR ONCE SOLO BEAT COMPLETES (#6) */}
      {fanOutCompleted ? (
        isSoloW1D1 ? (
          <div className="px-3 pt-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] bg-[#150D22] border-t border-[#D4B876]/45 shrink-0">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-['Cinzel'] font-bold text-[10.5px] tracking-[1px] text-[#6FD39A] uppercase truncate">
                ✓ DAY 1 COMPLETE · THE FOREST ROAD
              </span>
              <span className="text-[11px] font-sans text-[#D4B876] whitespace-nowrap shrink-0">
                Next: W1·D2 · Hollow Wake Inn
              </span>
            </div>
            <button
              type="button"
              onClick={() => resetDayInteractions(1, 2)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#2A1B40] hover:bg-[#3A2555] border border-[#D4B876] font-['Cinzel'] font-bold text-[12px] tracking-[0.8px] text-[#E5C158] hover:text-[#F4F1F8] transition uppercase shadow-md truncate"
            >
              🏠 HEAD NORTH TO THE HOLLOW WAKE INN (DAY 2) →
            </button>
          </div>
        ) : (
          <div className="px-3 pt-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] bg-[#150D22] border-t border-[#F0A552]/45 shrink-0">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-['Cinzel'] font-bold text-[10.5px] tracking-[1px] text-[#6FD39A] uppercase truncate">
                ✓ SOLO LANDMARK COMPLETE · {dayData.place.toUpperCase()}
              </span>
              <span className="text-[11px] font-sans text-[#D4B876] whitespace-nowrap shrink-0">
                Party Waiting
              </span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToCampfire(currentWeek, currentDay)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#2A2018] hover:bg-[#3A2E1C] border border-[#F0A552] font-['Cinzel'] font-bold text-[12px] tracking-[0.8px] text-[#F0A552] hover:text-[#F4F1F8] transition uppercase shadow-md truncate"
            >
              🔥 JOIN GARRICK & PARTY AT CAMPFIRE →
            </button>
          </div>
        )
      ) : (
        <div
          className={`px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] bg-[#150D22] border-t border-[#3A2555]/45 space-y-1.5 shrink-0 transition ${
            isActionCardPending ? 'opacity-40 pointer-events-none select-none' : ''
          }`}
        >
          {contextChips.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {contextChips.map((chip) => (
                <button
                  key={chip.key}
                  disabled={isActionCardPending}
                  onClick={() => handleSendToMythios(chip.prompt, chip.key)}
                  className="px-2.5 py-1 rounded-full bg-[#2A1B40] hover:bg-[#2E1B42] border border-[#4A3068] text-[12.5px] font-sans text-[#E6E0F0] whitespace-nowrap transition shrink-0"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isActionCardPending) return;
              handleSendToMythios(chatInput);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              disabled={isActionCardPending}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={
                isActionCardPending
                  ? 'Complete the action card above first...'
                  : `Tell Mythios what you do at ${dayData.place}...`
              }
              className="flex-1 bg-[#0D0714] border border-[#3A2555] rounded-xl px-3 py-2 text-[15px] font-sans text-[#F4F1F8] placeholder-[#8B7A9E] focus:outline-none focus:border-[#D4B876]"
            />
            <button
              type="submit"
              disabled={isActionCardPending}
              className="px-3.5 py-2 rounded-xl bg-[#D4B876]/22 hover:bg-[#D4B876]/32 border border-[#D4B876] font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8] uppercase tracking-[0.8px] shrink-0"
            >
              ACT
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   CHAT -> PARTY (CAMPFIRE & DAY 7 GATHERING)
   - Clear visual separation between A+B (Top Mode Bar), C (Warm Campfire Tray),
     and D (True Left-Aligned Party Chat Bubbles with Avatars)
   - Lighthearted Garrick Campfire Riddles solved via Letter Tiles (#15, #16)
   - Day 7 Gathering: Unified Opening Approach Card (#18, #19), Individual Hero
     Strikes + Assist/Relic in Battle (#21), and separated Mythios Narration (#22),
     Scripture Match Card (#23), and Table Twist Question Card (#24)
   ============================================================================ */

interface PartyTabViewProps {
  currentWeek: number;
  currentDay: number;
  onSelectWeek: (w: number) => void;
  onSelectWeekDay?: (w: number, d: number) => void;
  partyMode?: 'CAMPFIRE' | 'GATHERING';
  onSetPartyMode?: (m: 'CAMPFIRE' | 'GATHERING') => void;
  showChapterPicker?: boolean;
  onSetShowChapterPicker?: (v: boolean) => void;
  partyMessages: string[];
  onSendPartyMessage: (msg: string) => void;
  onEarnGold: (amt: number) => void;
  onUnlockGatheringBadge: () => void;
  pinnedClues: PinnedPartyClue[];
  completedDays: string[];
  stats: Record<string, number>;
  characterName: string;
  characterClass?: ClassName;
  weaponLevel?: number;
  armorLevel?: number;
  attributes: Record<AttributeName, number>;
  solvedWords: Record<string, { w1?: string; w2?: string }>;
  onSolveWord: (fragId: string, wordIndex: 1 | 2, solverName: string) => void;
  onMatchScripture: () => void;
  gold: number;
  solvedRiddleIds: Record<string, number>;
  onAnswerDailyRiddle: (riddleId: string, chosenIdx: number) => void;
  seekerFirstLetterHints?: Record<string, boolean>;
  soloFanOutClues?: Record<string, { title: string; text: string; firstLetter: string }>;
  sharedBoardClues?: Record<string, boolean>;
  onShareSoloClueToBoard?: (dayKey: string) => void;
  sharedFanOutClues?: Record<string, { title: string; text: string; firstLetter: string }>;
  onShareFanOutClue?: (
    dayKey: string,
    payload: { title: string; text: string; firstLetter: string }
  ) => void;
  appliedLoopholeIds?: string[];
  relics?: Record<string, number>;
  onGiveRelic?: (relicType: string, friendName: string) => void;
  privateTheoryPromptsByDay?: Record<
    string,
    { reading: 'A' | 'B' | 'NEITHER'; customLine?: string }
  >;
  onLeaveFire?: () => void;
}

interface PartyRoundHeroStrike {
  hero: string;
  cls: string;
  d20: number;
  atk: number;
  def: number;
  margin: number;
  hit: boolean;
  dmg: number;
  enemyHpBefore: number;
  enemyHpAfter: number;
}

interface PartyBattleRound {
  round: number;
  strikes: PartyRoundHeroStrike[];
  totalDmg: number;
  partyHpLeft: number;
  enemyHpLeft: number;
}

export const PartyTabView: React.FC<PartyTabViewProps> = ({
  currentWeek,
  currentDay,
  onSelectWeek,
  onSelectWeekDay,
  partyMode: externalPartyMode,
  onSetPartyMode,
  showChapterPicker = false,
  onSetShowChapterPicker,
  onSendPartyMessage,
  onEarnGold,
  onUnlockGatheringBadge,
  characterName,
  characterClass = 'Trickster',
  weaponLevel = 2,
  attributes,
  solvedWords,
  onSolveWord,
  onMatchScripture,
  solvedRiddleIds,
  onAnswerDailyRiddle,
  seekerFirstLetterHints = {},
  soloFanOutClues = {},
  sharedBoardClues = {},
  onShareSoloClueToBoard,
  sharedFanOutClues = {},
  onShareFanOutClue,
  appliedLoopholeIds = ['L1', 'L2', 'L3'],
  relics = {},
  onGiveRelic,
  privateTheoryPromptsByDay = {},
  onLeaveFire,
}) => {
  const [internalPartyMode, setInternalPartyMode] = useState<'CAMPFIRE' | 'GATHERING'>(
    'CAMPFIRE'
  );
  const partyMode = externalPartyMode ?? internalPartyMode;
  const setPartyMode = (m: 'CAMPFIRE' | 'GATHERING') => {
    setInternalPartyMode(m);
    if (onSetPartyMode) onSetPartyMode(m);
  };
  const [riddleOpen, setRiddleOpen] = useState(false);
  const [seekerOpen, setSeekerOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(true);
  const [activeRiddleSlot, setActiveRiddleSlot] = useState<
    'MORNING' | 'MIDDAY' | 'NIGHTFALL'
  >('MORNING');
  const [riddleTypedIndices, setRiddleTypedIndices] = useState<number[]>([]);

  const [seekerSlot, setSeekerSlot] = useState<0 | 1>(0);
  const [seekerTypedIndices, setSeekerTypedIndices] = useState<number[]>([]);

  // 3-Beat Mystery Wave selections & 36-Evening Campfire Table chips per dayKey
  const [wave1Picks, setWave1Picks] = useState<Record<string, number>>({});
  const [wave2Picks, setWave2Picks] = useState<Record<string, number>>({});
  const [wave3Picks, setWave3Picks] = useState<Record<string, number>>({});
  const [eveningChipPicks, setEveningChipPicks] = useState<Record<string, number>>({});
  const [friendHookUsed, setFriendHookUsed] = useState<Record<string, boolean>>({});

  // Day 7 Gathering 5-Phase State Machine
  const [lastGatheringWeek, setLastGatheringWeek] = useState<number>(currentWeek);
  const [approachPick, setApproachPick] = useState<'A' | 'B'>('A');
  const [approachRolled, setApproachRolled] = useState<{
    d20: number;
    attr: AttributeName;
    attrScore: number;
    tierBonus: number;
    mapBonus: number;
    bonus: number;
    dc: number;
    margin: number;
    cleared: boolean;
  } | null>(null);

  const [battleAssisted, setBattleAssisted] = useState(false);
  const [assistedCompanion, setAssistedCompanion] = useState<'MEI' | 'DEV' | 'ARJUN' | null>(
    null
  );
  const [battleRelicUsed, setBattleRelicUsed] = useState(false);
  const [battleRounds, setBattleRounds] = useState<PartyBattleRound[]>([]);
  const [isRollingBattleRound, setIsRollingBattleRound] = useState(false);
  const [battleDone, setBattleDone] = useState(false);

  const [ueRolled, setUeRolled] = useState<{
    totalProgress: number;
    cleared: boolean;
    heroRolls: Array<{
      hero: string;
      color: string;
      d20: number;
      bonus: number;
      contribution: number;
    }>;
  } | null>(null);
  const [ueRallied, setUeRallied] = useState(false);
  const [lookCloserDone, setLookCloserDone] = useState(false);

  const [matchedQuotes, setMatchedQuotes] = useState<Record<number, boolean>>({});
  const [wrongMatchPick, setWrongMatchPick] = useState<Record<number, string | null>>({});
  const [tableHypothesisPick, setTableHypothesisPick] = useState<'A' | 'B' | 'C' | null>(null);
  const [twistRevealed, setTwistRevealed] = useState(false);

  if (lastGatheringWeek !== currentWeek) {
    setLastGatheringWeek(currentWeek);
    setApproachPick('A');
    setApproachRolled(null);
    setBattleAssisted(false);
    setAssistedCompanion(null);
    setBattleRelicUsed(false);
    setBattleRounds([]);
    setIsRollingBattleRound(false);
    setBattleDone(false);
    setUeRolled(null);
    setUeRallied(false);
    setLookCloserDone(false);
    setMatchedQuotes({});
    setWrongMatchPick({});
    setTableHypothesisPick(null);
    setTwistRevealed(false);
  }
  const [partyInput, setPartyInput] = useState('');
  const [activeSpeakerTarget, setActiveSpeakerTarget] = useState<
    'GARRICK' | 'DEV' | 'MEI' | 'ARJUN'
  >('GARRICK');
  const [campfireTurns, setCampfireTurns] = useState<
    Array<{
      sender: 'YOU' | 'GARRICK' | 'DEV' | 'MEI' | 'ARJUN';
      target?: 'GARRICK' | 'DEV' | 'MEI' | 'ARJUN';
      text: string;
    }>
  >([]);
  const [gatheringTurns, setGatheringTurns] = useState<
    Array<{
      sender: 'YOU' | 'GARRICK' | 'DEV' | 'MEI' | 'ARJUN';
      target?: 'GARRICK' | 'DEV' | 'MEI' | 'ARJUN';
      text: string;
    }>
  >([]);
  const [usedCampfireChips, setUsedCampfireChips] = useState<Record<string, boolean>>({});
  const [viewAsRecipient, setViewAsRecipient] = useState<'YOU' | 'MEI'>('YOU');

  const rawDayData =
    WEEKDAY_INVENTORY.find((d) => d.week === currentWeek && d.day === currentDay) ||
    WEEKDAY_INVENTORY[0];
  const dayData = getChapterWithContinuityFixes(rawDayData, appliedLoopholeIds);
  const dayKey = `${currentWeek}-${currentDay}`;
  const fanOutDayData = getFanOutEncounterData(dayData);
  const recordedFanOut = sharedFanOutClues[dayKey] || soloFanOutClues[dayKey];
  const soloClueForToday = recordedFanOut || {
    title: fanOutDayData.branchA.soloClueTitle || `${dayData.place} Perimeter Note`,
    text:
      fanOutDayData.branchA.soloClueText ||
      `Uncovered a hidden courier mark at ${dayData.place}.`,
    firstLetter: (
      SEEKER_FRAGMENTS.find((f) => f.week === currentWeek && f.day === currentDay)?.word1[0] ||
      'S'
    ).toUpperCase(),
  };
  const isSoloClueShared = Boolean(sharedFanOutClues[dayKey] || sharedBoardClues[dayKey]);
  const hasTodayFirstLetterHint = Boolean(seekerFirstLetterHints[dayKey]);
  const dailyMysteryBeat = getGarrickCampfireDailyPrompt(
    currentWeek,
    currentDay,
    characterName,
    soloClueForToday.text,
    hasTodayFirstLetterHint
  );
  const isW1D1Campfire = currentWeek === 1 && currentDay === 1;
  const isGarrickAbsentAtCamp = isW1D1Campfire;

  // 36-Evening Campfire Table prompt derived directly from dailyMysteryBeat.eveningEntry
  const storytellerPrompt = {
    clueTag: dailyMysteryBeat.eveningEntry.clueTag,
    shape: dailyMysteryBeat.eveningEntry.shape,
    shapeLabel: dailyMysteryBeat.eveningEntry.shapeLabel,
    storytellerLead: `${dailyMysteryBeat.eveningEntry.garrickObservation} ${dailyMysteryBeat.eveningEntry.garrickQuestion}`,
    chips: dailyMysteryBeat.eveningEntry.chips,
    friendHook: dailyMysteryBeat.eveningEntry.friendHook,
  };

  // Signature speaker metadata (distinct header colors inside the unified #1E1232 / #B794F4 bubble, avoiding Green/Red reserved for YOU/FOE)
  const PARTY_SPEAKER_META: Record<
    'GARRICK' | 'DEV' | 'MEI' | 'ARJUN',
    {
      shortName: string;
      campfireTitle: string;
      gatheringTitle: string;
      roleTag: string;
      color: string;
      chipIcon: string;
    }
  > = {
    GARRICK: {
      shortName: 'Garrick',
      campfireTitle: 'GARRICK · CAMPFIRE HOST',
      gatheringTitle: 'GARRICK · FIRST OATH',
      roleTag: 'First Oath',
      color: '#F0A552', // Warm Hearth Amber
      chipIcon: '🔥',
    },
    DEV: {
      shortName: 'Dev',
      campfireTitle: 'DEV · ARCHER',
      gatheringTitle: 'DEV · ARCHER',
      roleTag: 'Vanguard Scout',
      color: '#5BC0EB', // Sky Blue
      chipIcon: '🏹',
    },
    MEI: {
      shortName: 'Mei',
      campfireTitle: 'MEI · SAGE',
      gatheringTitle: 'MEI · SAGE',
      roleTag: 'Lorekeeper',
      color: '#F49CBB', // Soft Rose
      chipIcon: '📖',
    },
    ARJUN: {
      shortName: 'Arjun',
      campfireTitle: 'ARJUN · ARTIFICER',
      gatheringTitle: 'ARJUN · ARTIFICER',
      roleTag: 'Relic Smith',
      color: '#4FD1C5', // Arcane Teal
      chipIcon: '⚙️',
    },
  };

  // Detect if player typed a specific companion's name in the message; otherwise use activeSpeakerTarget
  const detectAddressedSpeaker = (
    text: string,
    fallback: 'GARRICK' | 'DEV' | 'MEI' | 'ARJUN'
  ): 'GARRICK' | 'DEV' | 'MEI' | 'ARJUN' => {
    if (/\bdev\b/i.test(text)) return 'DEV';
    if (/\bmei\b/i.test(text)) return 'MEI';
    if (/\barjun\b/i.test(text)) return 'ARJUN';
    if (/\bgarrick\b/i.test(text)) return 'GARRICK';
    return fallback;
  };

  // Build reply for Garrick in Day 7 Gathering (Mei, Dev, and Arjun are real human friends — never generate AI replies for them)
  const buildCompanionReply = (
    speaker: 'GARRICK' | 'DEV' | 'MEI' | 'ARJUN',
    playerMessage: string,
    mode: 'CAMPFIRE' | 'GATHERING'
  ): string | null => {
    if (speaker === 'GARRICK') {
      const routed: GarrickRouteResult = routeGarrickMessage(playerMessage, {
        episode: currentWeek,
        day: mode === 'GATHERING' ? 7 : currentDay,
        ledgerOpened:
          currentWeek > 2 ||
          (currentWeek === 2 && (mode === 'GATHERING' || currentDay >= 6)),
        prisonerHeld:
          (currentWeek === 3 && mode === 'GATHERING') ||
          (currentWeek === 4 && currentDay === 1),
        prisonerAskedLeader: currentWeek >= 4,
        allFourChildrenHome:
          currentWeek >= 5 || (currentWeek === 4 && mode === 'GATHERING'),
        verseOfFourRead: currentWeek >= 4,
        atHighwall: currentWeek >= 5,
        ep6RevealLanded:
          currentWeek === 6 && mode === 'GATHERING' && twistRevealed,
      });
      return routed.reply.replace(/^[“"]|[”"]$/g, '');
    }
    // Mei, Dev, and Arjun are real human players — never write scripted lines for them
    return null;
  };

  const handleSendPartyBanter = (
    textToSend: string,
    chipKey?: string,
    forcedTarget?: 'GARRICK' | 'DEV' | 'MEI' | 'ARJUN'
  ) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;
    if (chipKey) {
      setUsedCampfireChips((prev) => ({ ...prev, [chipKey]: true }));
    }
    const targetSpeaker =
      forcedTarget || detectAddressedSpeaker(trimmed, activeSpeakerTarget);
    setActiveSpeakerTarget(targetSpeaker);
    const replyText = buildCompanionReply(targetSpeaker, trimmed, partyMode);

    if (partyMode === 'GATHERING') {
      setGatheringTurns((prev) => [
        ...prev,
        { sender: 'YOU', target: targetSpeaker, text: trimmed },
        ...(replyText ? [{ sender: targetSpeaker, text: replyText }] : []),
      ]);
    } else {
      setCampfireTurns((prev) => [
        ...prev,
        { sender: 'YOU', target: targetSpeaker, text: trimmed },
        ...(replyText ? [{ sender: targetSpeaker, text: replyText }] : []),
      ]);
    }
    onSendPartyMessage(trimmed);
    setPartyInput('');
  };

  const activeModeKey = `${dayKey}-${partyMode}`;
  const partyPromptChips: Array<{
    key: string;
    speaker: 'GARRICK' | 'DEV' | 'MEI' | 'ARJUN';
    label: string;
    prompt: string;
  }> = (
    partyMode === 'CAMPFIRE'
      ? [
          {
            key: `${activeModeKey}-garrick-place`,
            speaker: 'GARRICK' as const,
            label: `Ask Garrick about ${dayData.place.replace(/^The\s+/i, '')}`,
            prompt: `Garrick, what do you make of what we found at ${dayData.place}?`,
          },
          {
            key: `${activeModeKey}-dev-scout`,
            speaker: 'DEV' as const,
            label: 'Ask Dev about Fragment & tracks',
            prompt: `Dev, what did you spot on the ridge above ${dayData.place}?`,
          },
          {
            key: `${activeModeKey}-mei-lore`,
            speaker: 'MEI' as const,
            label: 'Ask Mei about the Seeker verse',
            prompt: `Mei, how does today's clue at ${dayData.place} connect to Sunday's Gathering?`,
          },
          {
            key: `${activeModeKey}-arjun-gear`,
            speaker: 'ARJUN' as const,
            label: 'Ask Arjun about our Relic gear',
            prompt: `Arjun, how is our gear holding up for the Day 7 Gathering?`,
          },
          {
            key: `${activeModeKey}-garrick-cup`,
            speaker: 'GARRICK' as const,
            label:
              currentWeek <= 2
                ? 'Ask Garrick about the extra tin cup'
                : currentWeek <= 4
                ? 'Ask Garrick how he knew the path'
                : 'Ask Garrick about his bound palm',
            prompt:
              currentWeek <= 2
                ? 'Why do you set out an extra tin cup by the campfire every night, Garrick?'
                : currentWeek <= 4
                ? 'How did you know the exact turn to the stone before anyone pointed it out, Garrick?'
                : 'Why are your fingers dusty with grey stone from the socket, Garrick?',
          },
        ]
      : [
          {
            key: `${activeModeKey}-garrick-oath`,
            speaker: 'GARRICK' as const,
            label: 'Ask Garrick for tactical advice',
            prompt: `Garrick, what should we watch for in this Week ${currentWeek} Gathering?`,
          },
          {
            key: `${activeModeKey}-dev-vantage`,
            speaker: 'DEV' as const,
            label: 'Coordinate bow fire with Dev',
            prompt: `Dev, are you in position to cover our approach roll?`,
          },
          {
            key: `${activeModeKey}-mei-scripture`,
            speaker: 'MEI' as const,
            label: 'Ask Mei about the Cult Scripture',
            prompt: `Mei, what do you make of the Dark Moon Scripture verse we uncovered here?`,
          },
          {
            key: `${activeModeKey}-arjun-strike`,
            speaker: 'ARJUN' as const,
            label: 'Check frontline readiness with Arjun',
            prompt: `Arjun, are our shields and relics ready to break their DEF?`,
          },
        ]
  ).filter(
    (c) =>
      !usedCampfireChips[c.key] &&
      !(partyMode === 'CAMPFIRE' && isGarrickAbsentAtCamp && c.speaker === 'GARRICK') &&
      !(partyMode === 'GATHERING' && currentWeek === 6 && !twistRevealed && c.speaker === 'GARRICK')
  );
  const riddles = getDailyCampfireRiddles(currentWeek, currentDay, dayData.place);
  const currentRiddle =
    riddles.find((r) => r.slot === activeRiddleSlot) || riddles[0];
  const isRiddleSolved = solvedRiddleIds[currentRiddle.id] !== undefined;
  const solvedRiddlesTodayCount = riddles.filter(
    (r) => solvedRiddleIds[r.id] !== undefined
  ).length;

  const activeFragment =
    SEEKER_FRAGMENTS.find((f) => f.week === currentWeek && f.day === currentDay) ||
    SEEKER_FRAGMENTS[0];
  const activeFragEntry = solvedWords[activeFragment.id] || {};
  const fragSolvedState: [boolean, boolean] = [
    Boolean(activeFragEntry.w1),
    Boolean(activeFragEntry.w2),
  ];

  const gathering =
    GATHERINGS_DATA.find((g) => g.week === currentWeek) || GATHERINGS_DATA[0];
  const epMeta =
    EPISODE_NUMBERS.find((e) => e.week === currentWeek) || EPISODE_NUMBERS[0];

  // Handle tapping letter tiles for Garrick's lighthearted campfire pun (#15, #16)
  const handleTapRiddleLetter = (idx: number) => {
    if (riddleTypedIndices.includes(idx) || isRiddleSolved) return;
    const next = [...riddleTypedIndices, idx];
    const formed = next.map((i) => currentRiddle.jumbleLetters[i]).join('');
    if (formed.length === currentRiddle.answerWord.length) {
      if (formed.toUpperCase() === currentRiddle.answerWord.toUpperCase()) {
        onAnswerDailyRiddle(currentRiddle.id, 0);
        onEarnGold(GOLD_RIDDLE_BONUS);
        setRiddleTypedIndices([]);
      } else {
        setTimeout(() => setRiddleTypedIndices([]), 350);
      }
    } else {
      setRiddleTypedIndices(next);
    }
  };

  // Handle tapping letter tiles for Campfire Seeker Fragment
  const handleTapSeekerLetter = (idx: number) => {
    if (seekerTypedIndices.includes(idx)) return;
    const targetWord = seekerSlot === 0 ? activeFragment.word1 : activeFragment.word2;
    const jumbleArr =
      seekerSlot === 0 ? activeFragment.jumble1 : activeFragment.jumble2;
    const next = [...seekerTypedIndices, idx];
    const formed = next.map((i) => jumbleArr[i]).join('');
    if (formed.length === targetWord.length) {
      if (formed.toLowerCase() === targetWord.toLowerCase()) {
        onSolveWord(
          activeFragment.id,
          seekerSlot === 0 ? 1 : 2,
          characterName || 'Jennifer'
        );
        setSeekerTypedIndices([]);
      } else {
        setTimeout(() => setSeekerTypedIndices([]), 350);
      }
    } else {
      setSeekerTypedIndices(next);
    }
  };

  // Step-by-step Round-by-Round Day 7 Gathering 4-Hero Boss Battle (#21 + G10 Battle Conditions)
  const handleRollNextGatheringRound = () => {
    if (isRollingBattleRound || battleDone) return;
    setIsRollingBattleRound(true);

    setTimeout(() => {
      const prev = battleRounds;
      const nextRoundNum = prev.length + 1;
      const prevEnemyHp = prev.length === 0 ? 100 : prev[prev.length - 1].enemyHpLeft;
      const prevPartyHp = prev.length === 0 ? 100 : prev[prev.length - 1].partyHpLeft;

      // Approach Momentum in Round 1: +1 WEP if Approach passed, or +1 Enemy DEF if Hard Entry
      const approachWepBonus =
        nextRoundNum === 1 && approachRolled?.cleared ? 1 : 0;
      const approachDefPenalty =
        nextRoundNum === 1 && approachRolled && !approachRolled.cleared ? 1 : 0;

      // Battle Condition 1 (Weeks 2 & 6 — The Chant): DEF +1 while > 50% HP
      const chantDefBonus =
        (currentWeek === 2 || currentWeek === 6) && prevEnemyHp > 50 ? 1 : 0;

      const baseDef =
        Math.max(18, (epMeta.gDef || 22) - 2) + approachDefPenalty + chantDefBonus;
      const assistBonus = battleAssisted || assistedCompanion ? 2 : 0;
      const relicBonus = battleRelicUsed ? 1 : 0;

      const playerBaseWep = (GEAR_TABLE[weaponLevel]?.weapon || 14) + 2;
      const heroes = [
        {
          name: 'YOU',
          cls: characterClass || 'Trickster',
          baseAtk: playerBaseWep + assistBonus + relicBonus + approachWepBonus,
        },
        {
          name: 'MEI',
          cls: 'Sage',
          baseAtk: 15 + (assistedCompanion === 'MEI' ? 2 : 0) + approachWepBonus,
        },
        {
          name: 'ARJUN',
          cls: 'Artificer',
          baseAtk: 16 + (assistedCompanion === 'ARJUN' ? 2 : 0) + approachWepBonus,
        },
        {
          name: 'DEV',
          cls: 'Archer',
          baseAtk: 16 + (assistedCompanion === 'DEV' ? 2 : 0) + relicBonus + approachWepBonus,
        },
      ];

      let enemyHp = prevEnemyHp;
      const strikes: PartyRoundHeroStrike[] = [];
      let roundDmg = 0;

      for (const h of heroes) {
        const hpBefore = enemyHp;
        const d20 = Math.floor(Math.random() * 20) + 1;
        const margin = d20 + h.baseAtk - baseDef;
        // Battle Condition 2 (Week 4 — Knee-Deep): rolling 1, 2, or 3 slips in the flood
        const kneeDeepSlip = currentWeek === 4 && d20 <= 3;
        const hit = !kneeDeepSlip && margin > 0;
        const dmg = hit ? margin * 5 : 0;
        roundDmg += dmg;
        enemyHp = Math.max(0, enemyHp - dmg);
        strikes.push({
          hero: h.name,
          cls: h.cls,
          d20,
          atk: h.baseAtk,
          def: baseDef,
          margin,
          hit,
          dmg,
          enemyHpBefore: hpBefore,
          enemyHpAfter: enemyHp,
        });
      }

      // Battle Condition 3 (Weeks 5 & 6 — The Hollowed): first time put down in Round 1-2, rises once at 2 HP
      if (
        (currentWeek === 5 || currentWeek === 6) &&
        enemyHp <= 0 &&
        nextRoundNum < 3 &&
        !prev.some((r) => r.enemyHpLeft === 2)
      ) {
        enemyHp = 2;
      }

      // Battle Condition 4 (Week 3 — Blade & Torch): extra burn damage after round 1
      const torchBurn = currentWeek === 3 && nextRoundNum > 1 ? 4 : 0;
      const partyHp = Math.max(
        0,
        prevPartyHp - (enemyHp > 0 ? 15 + torchBurn : 0)
      );
      const nextRound: PartyBattleRound = {
        round: nextRoundNum,
        strikes,
        totalDmg: roundDmg,
        partyHpLeft: partyHp,
        enemyHpLeft: enemyHp,
      };

      const updated = [...prev, nextRound];
      setBattleRounds(updated);
      if (enemyHp <= 0 || partyHp <= 0) {
        setBattleDone(true);
        if (enemyHp <= 0) {
          onEarnGold(GOLD_GATHERING_BATTLE_REWARDS[currentWeek] ?? epMeta.gReward);
        }
      }
      setIsRollingBattleRound(false);
    }, 360);
  };

  // Phase 3: Interactive 100/100 United Effort 4-Hero Roll (+300g on clear per Core Rules §12)
  const handleRollUnitedEffort = () => {
    if (ueRolled) return;
    const playerAttrScore = attributes[gathering.ueAttr] || 18;
    const playerTierBonus = getTierInfo(playerAttrScore).bonus;
    const ueHeroes = [
      { hero: 'YOU', color: '#6FD39A', bonus: Math.max(1, playerTierBonus) },
      { hero: 'MEI', color: '#F49CBB', bonus: 3 },
      { hero: 'DEV', color: '#5BC0EB', bonus: 2 },
      { hero: 'ARJUN', color: '#4FD1C5', bonus: 3 },
    ];
    let sum = 0;
    const heroRolls = ueHeroes.map((h) => {
      const d20 = Math.floor(Math.random() * 20) + 1; // true 1..20 d20
      const contribution = (d20 + h.bonus) * 2;
      sum += contribution;
      return {
        hero: h.hero,
        color: h.color,
        d20,
        bonus: h.bonus,
        contribution,
      };
    });
    const totalProgress = Math.min(100, sum);
    const cleared = totalProgress >= 100;
    const bossWon =
      battleRounds.length > 0 &&
      battleRounds[battleRounds.length - 1].enemyHpLeft <= 0;
    if (cleared) {
      onEarnGold(GOLD_UNITED_EFFORT_WIN);
      if (bossWon) {
        onUnlockGatheringBadge();
      }
    }
    setUeRolled({
      totalProgress,
      cleared,
      heroRolls,
    });
  };

  const handleRallyUnitedEffort = () => {
    if (!ueRolled || ueRolled.cleared || ueRallied) return;
    setUeRallied(true);
    const boosted = Math.min(100, Math.max(100, ueRolled.totalProgress + 15));
    const bossWon =
      battleRounds.length > 0 &&
      battleRounds[battleRounds.length - 1].enemyHpLeft <= 0;
    onEarnGold(GOLD_UNITED_EFFORT_WIN);
    if (bossWon) {
      onUnlockGatheringBadge();
    }
    setUeRolled({
      ...ueRolled,
      totalProgress: boosted,
      cleared: true,
    });
  };

  const handleGatheringLookCloser = () => {
    if (lookCloserDone) return;
    setLookCloserDone(true);
    onEarnGold(GOLD_LOOK_CLOSER_WIN);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0D0714]">
      {/* =====================================================================
          UNIFIED COLLAPSIBLE ACTIVITY & CHAPTER DRAWER (#6, #7, #8)
          Toggled from the top header's W2·D2 · CAMPFIRE ▾ / W2·D7 · GATHERING ▾ button!
         ===================================================================== */}
      {showChapterPicker && (
        <div className="p-3 bg-[#150D22] border-b border-[#3A2555] space-y-2.5 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-['Cinzel'] font-bold text-[#B7A9CC] uppercase tracking-[1px]">
            <span>PARTY ACTIVITY & CHAPTERS</span>
            <button
              onClick={() => onSetShowChapterPicker && onSetShowChapterPicker(false)}
              className="text-[#D4B876] hover:underline"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                setPartyMode('CAMPFIRE');
                if (onSetShowChapterPicker) onSetShowChapterPicker(false);
              }}
              className={`py-2 px-3 rounded-lg font-['Cinzel'] font-bold text-[11.5px] border transition ${
                partyMode === 'CAMPFIRE'
                  ? 'bg-[#2E1B42] border-[#D4B876] text-[#E5C158]'
                  : 'bg-[#1E1232] border-[#3A2555] text-[#B7A9CC]'
              }`}
            >
              🔥 CAMPFIRE (DAYS 1–6)
            </button>
            <button
              onClick={() => {
                setPartyMode('GATHERING');
                if (onSetShowChapterPicker) onSetShowChapterPicker(false);
              }}
              className={`py-2 px-3 rounded-lg font-['Cinzel'] font-bold text-[11.5px] border transition ${
                partyMode === 'GATHERING'
                  ? 'bg-[#2E1B42] border-[#D4B876] text-[#E5C158]'
                  : 'bg-[#1E1232] border-[#3A2555] text-[#B7A9CC]'
              }`}
            >
              ⚔️ DAY 7 GATHERING
            </button>
          </div>

          <div className="grid grid-cols-6 gap-1">
            {[1, 2, 3, 4, 5, 6].map((w) => (
              <button
                key={w}
                onClick={() => {
                  onSelectWeek(w);
                  setApproachRolled(null);
                  setBattleDone(false);
                  setBattleRounds([]);
                  setTwistRevealed(false);
                }}
                className={`py-1.5 rounded font-['Cinzel'] font-bold text-[11.5px] border transition ${
                  currentWeek === w
                    ? 'bg-[#2E1B42] border-[#D4B876] text-[#D4B876]'
                    : 'bg-[#1E1232] border-[#3A2555] text-[#B7A9CC]'
                }`}
              >
                WK {w}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {[1, 2, 3, 4, 5, 6].map((d) => (
              <button
                key={d}
                onClick={() => {
                  setPartyMode('CAMPFIRE');
                  if (onSelectWeekDay) onSelectWeekDay(currentWeek, d);
                }}
                className={`py-1.5 rounded font-['Cinzel'] font-bold text-[11px] border transition ${
                  partyMode === 'CAMPFIRE' && currentDay === d
                    ? 'bg-[#2E1B42] border-[#D4B876] text-[#D4B876]'
                    : 'bg-[#1E1232] border-[#3A2555] text-[#B7A9CC]'
                }`}
              >
                D{d}
              </button>
            ))}
            <button
              onClick={() => setPartyMode('GATHERING')}
              className={`py-1.5 rounded font-['Cinzel'] font-bold text-[10.5px] border transition ${
                partyMode === 'GATHERING'
                  ? 'bg-[#2E1B42] border-[#D4B876] text-[#E5C158]'
                  : 'bg-[#2A1B40] border-[#D4B876]/60 text-[#E5C158]'
              }`}
            >
              ⚔️ D7
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODE 1: CAMPFIRE v2.2 (8-Step Evening Flow, Stored-Line Engine, Real Friends)
         ===================================================================== */}
      {partyMode === 'CAMPFIRE' && (
        <CampfireEveningView
          currentWeek={currentWeek}
          currentDay={currentDay}
          onSelectWeekDay={(w, d) => {
            if (onSelectWeekDay) onSelectWeekDay(w, d);
          }}
          onJumpToGathering={() => setPartyMode('GATHERING')}
          onLeaveFire={() => {
            if (onLeaveFire) {
              onLeaveFire();
            }
          }}
          characterName={characterName}
          attributes={attributes}
          solvedWords={solvedWords}
          onSolveWord={onSolveWord}
          seekerFirstLetterHints={seekerFirstLetterHints}
          soloFanOutClues={soloFanOutClues}
          sharedFanOutClues={sharedFanOutClues}
          privateTheoryPromptsByDay={privateTheoryPromptsByDay}
        />
      )}

      {/* =====================================================================
          MODE 2: DAY 7 GATHERING STREAM (Narrow Mythios mr-6 #C4A1FF + Full-Width Action Cards w-full #5E4585)
         ===================================================================== */}
      {partyMode === 'GATHERING' && (
        <div className="flex-1 min-h-0 overflow-y-auto px-3.5 py-3.5 space-y-4">
          {/* Quick Bar + 5-Phase Gathering State Machine Stepper */}
          <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-['Cinzel'] font-bold text-[11px] tracking-[1px] text-[#E5C158] uppercase">
                ⚔️ WEEK {currentWeek} · DAY 7 GATHERING
              </span>
              <button
                type="button"
                onClick={() => setPartyMode('CAMPFIRE')}
                className="px-2.5 py-1 rounded-lg bg-[#2E1B42] hover:bg-[#3A2555] border border-[#D4B876]/70 font-['Cinzel'] font-bold text-[10.5px] text-[#E5C158] transition"
              >
                🔥 BACK TO CAMPFIRE
              </button>
            </div>

            {/* 5-Phase Progress Stepper */}
            {(() => {
              const p1Done = Boolean(approachRolled);
              const p2Done = Boolean(battleDone);
              const p3Done = Boolean(ueRolled && (!ueRolled.cleared || lookCloserDone));
              const p4Done =
                p3Done &&
                (gathering.matches.length === 0 ||
                  gathering.matches.every((_, idx) => Boolean(matchedQuotes[idx])));
              const p5Done = Boolean(twistRevealed);

              const activePhase = !p1Done
                ? 1
                : !p2Done
                ? 2
                : !p3Done
                ? 3
                : !p4Done
                ? 4
                : 5;

              const steps = [
                { num: 1, label: 'Approach', done: p1Done },
                { num: 2, label: 'Battle', done: p2Done },
                { num: 3, label: 'Trial', done: p3Done },
                { num: 4, label: 'Scripture', done: p4Done },
                { num: 5, label: 'Reveal', done: p5Done },
              ];

              return (
                <div className="grid grid-cols-5 gap-1">
                  {steps.map((st) => {
                    const isCurrent = activePhase === st.num && !st.done;
                    return (
                      <div
                        key={st.num}
                        className={`px-1.5 py-1.5 rounded-lg border text-center transition ${
                          st.done
                            ? 'bg-[#1E1232] border-[#6FD39A]/65 text-[#6FD39A]'
                            : isCurrent
                            ? 'bg-[#2A1B40] border-[#E5C158] text-[#E5C158]'
                            : 'bg-[#130B1F] border-[#3A2555]/60 text-[#8B7A9E] opacity-65'
                        }`}
                      >
                        <div className="font-['Cinzel'] font-bold text-[10px] tracking-[0.4px] truncate">
                          {st.done ? '✓ ' : `${st.num}. `}
                          {st.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* PHASE 1: MYTHIOS ARRIVAL BUBBLE + GARRICK & DEV OPENING SETUP */}
          <div className="mr-6 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3.5 space-y-2 shadow-md">
            <div className="flex items-center justify-between gap-2 leading-none">
              <span className="font-['Cinzel'] font-bold text-[11.5px] tracking-[1.3px] text-[#C4A1FF] uppercase truncate">
                MYTHIOS · {gathering.title.toUpperCase()}
              </span>
              <span className="text-[11px] font-['Cinzel'] font-bold text-[#6FD39A] whitespace-nowrap shrink-0">
                Phase 1 of 5 · Map +2 Active
              </span>
            </div>
            <div className="font-['Cinzel'] font-bold text-[14px] text-[#D4B876]">
              📍 {gathering.location}
            </div>
            <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
              {gathering.tonightMessage}
            </p>
          </div>

          {/* Opening Tactical Voice from Garrick across all 6 Gatherings (including Week 6 before the Phase 7 reveal) */}
          <div className="mr-6 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3.5 space-y-2 shadow-md">
            <div className="flex items-center justify-between leading-none">
              <span className="font-['Cinzel'] font-bold text-[11.5px] tracking-[1.3px] uppercase text-[#F0A552]">
                GARRICK · FIRST OATH
              </span>
              <span className="text-[11.5px] font-sans text-[#B7A9CC]">
                Phase 1 · Arrival
              </span>
            </div>
            <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
              {`Stay close, ${
                characterName || 'friend'
              }. Mythios sets the trial before us at ${
                gathering.location
              }, and I’m right beside you four—choose our approach carefully before steel is drawn.`}
            </p>
          </div>

          {/* PHASE 1 CARD: OPENING APPROACH CHALLENGE CARD */}
          <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
            <div className="px-3.5 py-2.5 bg-[#241638] border-b border-[#3A2555]/80 flex items-center justify-between gap-2">
              <span className="font-['Cinzel'] font-bold text-[13px] text-[#F4F1F8]">
                🎯 PHASE 1 · {gathering.approachQuestion}
              </span>
              <span className="font-['Cinzel'] font-bold text-[12.5px] text-[#E5C158] whitespace-nowrap">
                Difficulty {epMeta.gatheringDC}
              </span>
            </div>

            <div className="p-3.5 space-y-2.5">
              {[
                { key: 'A' as const, opt: gathering.approachOptA },
                { key: 'B' as const, opt: gathering.approachOptB },
              ].map(({ key, opt }) => {
                const isSelected = approachPick === key;
                const attrColor =
                  ATTRIBUTE_META[opt.attr as AttributeName]?.color || '#D4B876';
                return (
                  <button
                    key={key}
                    disabled={!!approachRolled}
                    onClick={() => setApproachPick(key)}
                    className={`w-full p-3 rounded-xl text-left border transition ${
                      isSelected
                        ? 'bg-[#2A1B40] border-[#D4B876]'
                        : 'bg-[#130B1F] border-[#3A2555] opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="font-['Cinzel'] font-bold text-[13.5px]"
                        style={{ color: attrColor }}
                      >
                        {isSelected ? '✓ ' : ''}
                        {opt.label}
                      </span>
                      <span
                        className="font-['Cinzel'] font-bold text-[12.5px] whitespace-nowrap"
                        style={{ color: attrColor }}
                      >
                        {opt.attr} · You +{getTierInfo(attributes[opt.attr as AttributeName] || 20).bonus} · {opt.bestFriend} +{opt.bestBonus}
                      </span>
                    </div>
                    <p className="font-sans text-[14.5px] text-[#E6E0F0] mt-1 leading-snug">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}

              {!approachRolled ? (
                <button
                  onClick={() => {
                    const chosen =
                      approachPick === 'A'
                        ? gathering.approachOptA
                        : gathering.approachOptB;
                    const weekSolvedAll6 = SEEKER_FRAGMENTS.filter(
                      (f) => f.week === currentWeek
                    ).every((f) => solvedWords[f.id]?.w1 && solvedWords[f.id]?.w2);
                    const mapBonus = weekSolvedAll6 ? 2 : 0;
                    const heroTierBonus = getTierInfo(
                      attributes[chosen.attr as AttributeName] || 20
                    ).bonus;
                    // Core Rules §11: one friend steps up and rolls with their own tier bonus
                    // against the Gathering DC (weekday + 2). Same pass rule as every Challenge.
                    const d20 = Math.floor(Math.random() * 20) + 1;
                    const bonus = heroTierBonus + mapBonus;
                    const dc = epMeta.gatheringDC || 8;
                    const { net: margin, success: cleared } = resolveChallengeRoll(d20, bonus, dc);
                    setApproachRolled({
                      d20,
                      attr: chosen.attr as AttributeName,
                      attrScore: attributes[chosen.attr as AttributeName] || 20,
                      tierBonus: heroTierBonus,
                      mapBonus,
                      bonus,
                      dc,
                      margin,
                      cleared,
                    });
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#D4B876]/22 hover:bg-[#D4B876]/32 border border-[#D4B876] text-[#F4F1F8] font-['Cinzel'] font-bold text-[13px] tracking-[1px] uppercase transition"
                >
                  🎲 STEP UP & ROLL APPROACH
                </button>
              ) : (
                <div className="p-2.5 rounded-xl bg-[#1A102A] border border-[#3A2555] space-y-1 text-[13.5px] font-sans">
                  <div className="flex flex-wrap items-center gap-1.5 font-semibold">
                    <span className="text-[#6FD39A] font-bold">YOU:</span>
                    <span className="text-[#F4F1F8]">🎲 {approachRolled.d20}</span>
                    <span className="text-[#8B7A9E]">+</span>
                    <span
                      style={{
                        color:
                          ATTRIBUTE_META[approachRolled.attr]?.color || '#D4B876',
                      }}
                    >
                      {approachRolled.attr} {approachRolled.attrScore} (+{approachRolled.tierBonus})
                    </span>
                    {approachRolled.mapBonus > 0 && (
                      <>
                        <span className="text-[#8B7A9E]">+</span>
                        <span className="text-[#D4B876]">Map {approachRolled.mapBonus}</span>
                      </>
                    )}
                    <span className="text-[#8B7A9E]">−</span>
                    <span className="text-[#E5C158]">DC {approachRolled.dc}</span>
                    <span className="text-[#8B7A9E]">=</span>
                    <span
                      className={`font-bold ${
                        approachRolled.cleared ? 'text-[#6FD39A]' : 'text-[#E0645C]'
                      }`}
                    >
                      {approachRolled.margin >= 0
                        ? `+${approachRolled.margin}`
                        : approachRolled.margin}
                    </span>
                  </div>
                  <div
                    className={`font-bold text-[13px] ${
                      approachRolled.cleared ? 'text-[#6FD39A]' : 'text-[#E0645C]'
                    }`}
                  >
                    {approachRolled.cleared
                      ? 'PASSED · Opening Momentum (+1 WEP in Round 1)'
                      : 'HARD ENTRY · Enemy Braced (+1 DEF in Round 1)'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* =================================================================
              PHASE 2 (BEAT 3): ROUND-BY-ROUND 4-HERO PARTY BATTLE CARD
              Gated until Phase 1 Approach Challenge is rolled!
             ================================================================= */}
          {approachRolled && (
            <>
              {/* Phase 1 -> Phase 2 Narrative Transition Bubble */}
              <div className="mr-6 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3.5 space-y-2 shadow-md">
                <div className="flex items-center justify-between leading-none">
                  <span className="font-['Cinzel'] font-bold text-[11.5px] tracking-[1.3px] text-[#C4A1FF] uppercase">
                    MYTHIOS · PHASE 2 UNLOCKED
                  </span>
                  <span
                    className={`text-[12px] font-bold ${
                      approachRolled.cleared ? 'text-[#6FD39A]' : 'text-[#E0645C]'
                    }`}
                  >
                    {approachRolled.cleared
                      ? 'Opening Momentum (+1 WEP R1)'
                      : 'Hard Entry (+1 DEF R1)'}
                  </span>
                </div>
                <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                  {approachRolled.cleared
                    ? `Your party executes "${
                        (approachPick === 'A'
                          ? gathering.approachOptA
                          : gathering.approachOptB
                        ).label
                      }" cleanly across ${gathering.location}, catching ${gathering.enemyName} off-balance and granting all four heroes +1 WEP in Round 1!`
                    : `As your party attempts "${
                        (approachPick === 'A'
                          ? gathering.approachOptA
                          : gathering.approachOptB
                        ).label
                      }" at ${gathering.location}, a loose stone gives you away—allowing ${gathering.enemyName} to brace their guard (+1 DEF in Round 1) as the battle begins!`}
                </p>
              </div>

              <div className="mr-6 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3.5 space-y-2 shadow-md">
                <div className="flex items-center justify-between leading-none">
                  <span className="font-['Cinzel'] font-bold text-[11.5px] tracking-[1.3px] text-[#5BC0EB] uppercase">
                    DEV · ARCHER
                  </span>
                  <span className="text-[11.5px] font-sans text-[#B7A9CC]">
                    Phase 2 · Boss Battle
                  </span>
                </div>
                <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                  Sightlines are locked on {gathering.enemyName}. Toggle Assist Party or hand me the combat relic before each round if you want extra punch on our strikes!
                </p>
              </div>

              <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
                <div className="px-3.5 py-2.5 bg-[#241638] border-b border-[#3A2555]/80 flex items-center justify-between gap-2">
                  <span className="font-['Cinzel'] font-bold text-[13px] text-[#F4F1F8] truncate">
                    ⚔️ PHASE 2 · {gathering.enemyName.toUpperCase()}
                  </span>
                  <span className="font-['Cinzel'] font-bold text-[12px] text-[#FB923C] whitespace-nowrap shrink-0">
                    DEF {Math.max(18, (epMeta.gDef || 22) - 2)} ·{' '}
                    <span className="text-[#E5C158]">+{epMeta.gReward}G</span>
                  </span>
                </div>

              <div className="p-3.5 space-y-3">
                <p className="font-sans text-[15.5px] text-[#B7A9CC] leading-snug">
                  {gathering.conditionText}
                </p>

                {/* Live Party HP vs Foe HP Bars (Updated after every round) */}
                {(() => {
                  const curPartyHp =
                    battleRounds.length > 0
                      ? battleRounds[battleRounds.length - 1].partyHpLeft
                      : 100;
                  const curEnemyHp =
                    battleRounds.length > 0
                      ? battleRounds[battleRounds.length - 1].enemyHpLeft
                      : 100;
                  return (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-[#130B1F] border border-[#3A2555]">
                        <div className="flex items-center justify-between font-['Cinzel'] font-bold text-[12.5px]">
                          <span className="text-[#6FD39A]">YOU & PARTY</span>
                          <span className="text-[#6FD39A] whitespace-nowrap">
                            {curPartyHp}/100 HP
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#2A1B40] rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full bg-[#6FD39A] transition-all duration-300"
                            style={{ width: `${curPartyHp}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#130B1F] border border-[#3A2555]">
                        <div className="flex items-center justify-between font-['Cinzel'] font-bold text-[12.5px]">
                          <span className="text-[#E0645C] truncate mr-1">
                            FOE · {gathering.enemyName.replace(/^The\s+/i, '').slice(0, 8)}
                          </span>
                          <span className="text-[#E0645C] whitespace-nowrap">
                            {curEnemyHp}/100 HP
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#2A1B40] rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full bg-[#E0645C] transition-all duration-300"
                            style={{ width: `${curEnemyHp}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Rolled Battle Rounds History (Displayed Round-by-Round) */}
                {battleRounds.length > 0 && (
                  <div className="space-y-2.5">
                    {battleRounds.map((r) => (
                      <div
                        key={r.round}
                        className="p-3 rounded-xl bg-[#130B1F] border border-[#3A2555] space-y-2"
                      >
                        <div className="flex items-center justify-between border-b border-white/[0.06] pb-1">
                          <span className="px-2 py-0.5 rounded bg-[#D4B876]/20 border border-[#D4B876]/50 font-['Cinzel'] font-bold text-[11px] text-[#D4B876]">
                            ROUND {r.round}
                          </span>
                          <span className="text-[12px] font-sans font-bold text-[#6FD39A]">
                            Group Total: −{r.totalDmg} HP (
                            <span className="text-[#E0645C]">FOE {r.enemyHpLeft}/100</span>)
                          </span>
                        </div>

                        {r.strikes.map((st, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2 rounded-lg bg-[#1A102A] border border-[#3A2555]/70 space-y-0.5 text-[13px] font-sans"
                          >
                            <div className="flex flex-wrap items-center gap-1.5 font-semibold">
                              <span
                                className="font-bold"
                                style={{
                                  color:
                                    st.hero === 'YOU'
                                      ? '#6FD39A'
                                      : st.hero === 'DEV'
                                      ? '#5BC0EB'
                                      : st.hero === 'MEI'
                                      ? '#F49CBB'
                                      : '#4FD1C5',
                                }}
                              >
                                {st.hero}:
                              </span>
                              <span className="text-[#F4F1F8]">🎲 {st.d20}</span>
                              <span className="text-[#8B7A9E]">+</span>
                              <span className="text-[#E5C158]">WEP {st.atk}</span>
                              <span className="text-[#8B7A9E]">−</span>
                              <span className="text-[#FB923C]">DEF {st.def}</span>
                              <span className="text-[#8B7A9E]">=</span>
                              <span
                                className={`font-bold ${
                                  st.hit ? 'text-[#6FD39A]' : 'text-[#9A90B8]'
                                }`}
                              >
                                {st.margin >= 0 ? `+${st.margin}` : st.margin}
                              </span>
                            </div>
                            <div className="text-[12.5px] font-bold">
                              {st.hit ? (
                                <span className="text-[#6FD39A]">
                                  HIT +{st.margin} × 5 = {st.dmg}.{'  '}
                                  <span className="text-[#E0645C]">
                                    FOE HP {st.enemyHpBefore} → {st.enemyHpAfter}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-[#9A90B8]">
                                  MISSED.{'  '}
                                  <span className="text-[#E0645C]">
                                    FOE HP {st.enemyHpBefore} → {st.enemyHpAfter}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Per-Round Named Companion Assist & Combat Relic Controls + Next Round Roll Button */}
                {!battleDone ? (
                  <div className="space-y-2.5">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-['Cinzel'] font-bold text-[#D4B876]">
                        <span>🤝 CALL COMPANION ASSIST (+2 WEP):</span>
                        {assistedCompanion && (
                          <span className="text-[#6FD39A]">
                            ✓ {assistedCompanion} ASSISTING
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(
                          [
                            {
                              id: 'MEI',
                              label: 'CALL MEI (+2)',
                              color: '#F49CBB',
                              callout:
                                'Mei reads the rhythm of the boss’s guard and calls out the opening before you strike!',
                            },
                            {
                              id: 'DEV',
                              label: 'CALL DEV (+2)',
                              color: '#5BC0EB',
                              callout:
                                'Dev looses a pinning arrow across the boss’s flank, forcing their shield arm wide!',
                            },
                            {
                              id: 'ARJUN',
                              label: 'CALL ARJUN (+2)',
                              color: '#4FD1C5',
                              callout:
                                'Arjun hooks the boss’s weapon-haft with his wrench-staff, opening a clean lane for your blow!',
                            },
                          ] as const
                        ).map((comp) => {
                          const active = assistedCompanion === comp.id;
                          return (
                            <button
                              key={comp.id}
                              type="button"
                              onClick={() => {
                                const next = active ? null : comp.id;
                                setAssistedCompanion(next);
                                setBattleAssisted(Boolean(next));
                              }}
                              className={`py-2 px-2 rounded-xl font-['Cinzel'] font-bold text-[10.5px] border transition ${
                                active
                                  ? 'bg-[#2A1B40] border-[#6FD39A] text-[#6FD39A]'
                                  : 'bg-[#130B1F] border-[#3A2555] text-[#B7A9CC] hover:text-[#F4F1F8]'
                              }`}
                            >
                              {active ? `✓ ${comp.id} (+2)` : comp.label}
                            </button>
                          );
                        })}
                      </div>
                      {assistedCompanion && (
                        <div className="p-2 rounded-lg bg-[#130B1F] border border-[#6FD39A]/50 text-[12px] font-sans text-[#E6E0F0]">
                          <span className="font-bold text-[#6FD39A]">
                            {assistedCompanion} ASSIST:
                          </span>{' '}
                          {assistedCompanion === 'MEI'
                            ? 'Mei reads the rhythm of the boss’s guard and calls out the opening before you strike (+2 WEP).'
                            : assistedCompanion === 'DEV'
                            ? 'Dev looses a pinning arrow across the boss’s flank, forcing their shield arm wide (+2 WEP).'
                            : 'Arjun hooks the boss’s weapon-haft with his wrench-staff, opening a clean lane for your blow (+2 WEP).'}
                        </div>
                      )}
                    </div>

                    {(() => {
                      const usableRelicKey =
                        currentWeek >= 4 && (relics.Battle || 0) > 0
                          ? 'Battle'
                          : Object.keys(relics).find(
                              (k) => k !== 'Battle' && (relics[k] || 0) > 0
                            ) || null;
                      const usableRelicCount = Object.entries(relics).reduce(
                        (acc, [k, count]) =>
                          k === 'Battle' && currentWeek < 4 ? acc : acc + (count || 0),
                        0
                      );
                      return (
                        <button
                          type="button"
                          disabled={battleRelicUsed || !usableRelicKey}
                          onClick={() => {
                            if (battleRelicUsed || !usableRelicKey) return;
                            if (onGiveRelic) {
                              onGiveRelic(usableRelicKey, 'Dev');
                            }
                            setBattleRelicUsed(true);
                          }}
                          className={`w-full py-2 px-2.5 rounded-xl font-['Cinzel'] font-bold text-[11.5px] border transition ${
                            battleRelicUsed
                              ? 'bg-[#D4B876]/25 border-[#D4B876] text-[#F4F1F8]'
                              : usableRelicKey
                              ? 'bg-[#130B1F] hover:bg-[#2A1B40] border-[#3A2555] hover:border-[#D4B876] text-[#B7A9CC] hover:text-[#F4F1F8]'
                              : 'bg-[#0D0714] border-[#2A1B40] text-[#6E6485] opacity-65 cursor-not-allowed'
                          }`}
                        >
                          {battleRelicUsed
                            ? '✓ RELIC GIVEN TO DEV (+1 WEP)'
                            : usableRelicKey
                            ? `♦ GIVE ${usableRelicKey.toUpperCase()} RELIC TO DEV (+1 WEP · ${usableRelicCount} IN BAG)`
                            : '🔒 NO USABLE RELICS IN BAG FOR DEV (0 AVAILABLE)'}
                        </button>
                      );
                    })()}

                    <button
                      type="button"
                      disabled={isRollingBattleRound}
                      onClick={handleRollNextGatheringRound}
                      className="w-full py-2.5 rounded-xl bg-[#D4B876]/22 hover:bg-[#D4B876]/32 border border-[#D4B876] text-[#F4F1F8] font-['Cinzel'] font-bold text-[13px] tracking-[1px] uppercase transition disabled:opacity-50"
                    >
                      {isRollingBattleRound
                        ? `🎲 ROLLING ROUND ${battleRounds.length + 1} STRIKES...`
                        : `🎲 ROLL ROUND ${battleRounds.length + 1} STRIKES (4 HEROES)`}
                    </button>
                  </div>
                ) : battleRounds.length > 0 &&
                  battleRounds[battleRounds.length - 1].enemyHpLeft <= 0 ? (
                  <div className="p-2.5 rounded-xl bg-[#1A102A] border border-[#6FD39A]/60 flex items-center justify-between">
                    <span className="font-['Cinzel'] font-bold text-[12px] text-[#6FD39A]">
                      ✓ BOSS DEFEATED IN {battleRounds.length} ROUNDS
                    </span>
                    <span className="font-['Cinzel'] font-bold text-[12px] text-[#E5C158]">
                      +{epMeta.gReward}G EARNED
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#2A1420] border border-[#E0645C]/60 flex items-center justify-between">
                    <span className="font-['Cinzel'] font-bold text-[12px] text-[#E0645C]">
                      ✕ PARTY DRIVEN BACK AT 0 HP ({battleRounds.length} ROUNDS)
                    </span>
                    <span className="font-['Cinzel'] font-bold text-[12px] text-[#E0645C]">
                      0G · BOUNTY FORFEITED
                    </span>
                  </div>
                )}
              </div>
            </div>
            </>
          )}

          {/* =================================================================
              PHASE 3 (BEAT 4): INTERACTIVE 100/100 UNITED EFFORT TRIAL & [LOOK CLOSER]
              Gated until Phase 2 Boss Battle is completed!
             ================================================================= */}
          {battleDone && (
            <>
              {/* Phase 2 -> Phase 3 Narrative Transition Bubble */}
              <div className="mr-6 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3.5 space-y-2 shadow-md">
                <div className="flex items-center justify-between leading-none">
                  <span className="font-['Cinzel'] font-bold text-[11.5px] tracking-[1.3px] text-[#C4A1FF] uppercase">
                    MYTHIOS · PHASE 3 UNLOCKED
                  </span>
                  <span className="text-[12px] font-bold text-[#E5C158]">
                    United Effort Trial
                  </span>
                </div>
                <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                  With {gathering.enemyName} driven back in {battleRounds.length} rounds, the crisis in the chamber reaches its breaking point—all four of you must now combine your {gathering.ueAttr} for the United Effort: {gathering.ueTitle}!
                </p>
              </div>

              <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
                <div className="px-3.5 py-2.5 bg-[#241638] border-b border-[#3A2555]/80 flex items-center justify-between gap-2">
                  <span className="font-['Cinzel'] font-bold text-[13px] text-[#F4F1F8]">
                    ⚡ PHASE 3 · {gathering.ueTitle.toUpperCase()}
                  </span>
                  <span
                    className="font-['Cinzel'] font-bold text-[12px] whitespace-nowrap"
                    style={{
                      color: ATTRIBUTE_META[gathering.ueAttr]?.color || '#D4B876',
                    }}
                  >
                    {gathering.ueAttr} · 100/100 Target
                  </span>
                </div>

                <div className="p-3.5 space-y-3">
                  {/* Dual Opposing Progress Bars (100/100 Scale) */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-[#130B1F] border border-[#3A2555]">
                      <div className="flex items-center justify-between font-['Cinzel'] font-bold text-[12px]">
                        <span className="text-[#6FD39A] truncate mr-1">
                          {gathering.ueBarAName.toUpperCase()}
                        </span>
                        <span className="text-[#6FD39A] whitespace-nowrap">
                          {ueRolled ? `${ueRolled.totalProgress}/100` : '0/100'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#2A1B40] rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-[#6FD39A] transition-all duration-500"
                          style={{
                            width: `${ueRolled ? ueRolled.totalProgress : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#130B1F] border border-[#3A2555]">
                      <div className="flex items-center justify-between font-['Cinzel'] font-bold text-[12px]">
                        <span className="text-[#E5C158] truncate mr-1">
                          {gathering.ueBarBName.toUpperCase()}
                        </span>
                        <span className="text-[#E5C158] whitespace-nowrap">
                          {ueRolled ? (ueRolled.cleared ? 'HELD' : 'STRAINED') : '100/100'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#2A1B40] rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-[#E5C158] transition-all duration-500"
                          style={{
                            width: ueRolled ? (ueRolled.cleared ? '100%' : '35%') : '100%',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {!ueRolled ? (
                    <button
                      type="button"
                      onClick={handleRollUnitedEffort}
                      className="w-full py-2.5 rounded-xl bg-[#D4B876]/22 hover:bg-[#D4B876]/32 border border-[#D4B876] text-[#F4F1F8] font-['Cinzel'] font-bold text-[13px] tracking-[1px] uppercase transition"
                    >
                      🎲 ROLL UNITED EFFORT ({gathering.ueAttr.toUpperCase()} · 4 HEROES)
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-1.5">
                        {ueRolled.heroRolls.map((hr, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-[#130B1F] border border-[#3A2555]/80 flex items-center justify-between text-[12.5px] font-sans"
                          >
                            <span className="font-bold" style={{ color: hr.color }}>
                              {hr.hero}: 🎲{hr.d20}+{hr.bonus}
                            </span>
                            <span className="font-bold text-[#6FD39A]">
                              +{hr.contribution}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div
                        className={`p-2 rounded-lg border text-[13px] font-['Cinzel'] font-bold flex items-center justify-between ${
                          ueRolled.cleared
                            ? 'bg-[#1E1232] border-[#6FD39A]/60 text-[#6FD39A]'
                            : 'bg-[#2A1628] border-[#E0645C]/60 text-[#E0645C]'
                        }`}
                      >
                        <span>
                          {ueRolled.cleared
                            ? `✓ UNITED EFFORT CLEARED (${ueRolled.totalProgress}/100)${
                                ueRallied ? ' · RALLIED!' : ''
                              }`
                            : `✕ UNITED EFFORT FELL SHORT (${ueRolled.totalProgress}/100)`}
                        </span>
                        <span>{gathering.ueTitle}</span>
                      </div>

                      {!ueRolled.cleared && !ueRallied && (
                        <button
                          type="button"
                          onClick={handleRallyUnitedEffort}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#6FD39A]/20 hover:bg-[#6FD39A]/30 border border-[#6FD39A] font-['Cinzel'] font-bold text-[12px] text-[#6FD39A] uppercase tracking-[0.8px] transition"
                        >
                          ⚡ RALLY THE TABLE (+15 SECOND PUSH TO CLEAR 100/100)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Mythios Outcome Bubble + Interactive [LOOK CLOSER (+75G)] Card when United Effort is rolled */}
              {ueRolled && (
                <>
                  <div className="mr-6 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3.5 space-y-2 shadow-md">
                    <div className="flex items-center justify-between leading-none">
                      <span className="font-['Cinzel'] font-bold text-[11.5px] tracking-[1.3px] text-[#C4A1FF] uppercase">
                        MYTHIOS · {gathering.ueTitle}
                      </span>
                      <span
                        className={`text-[12px] font-bold ${
                          ueRolled.cleared ? 'text-[#6FD39A]' : 'text-[#E0645C]'
                        }`}
                      >
                        {ueRolled.cleared ? 'United Effort Won' : 'Hard Hold'}
                      </span>
                    </div>
                    <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                      {ueRolled.cleared ? gathering.ueWinText : gathering.ueLoseText}
                    </p>
                  </div>

                  {/* Interactive [LOOK CLOSER (+75G)] Room Inspection when United Effort is cleared */}
                  {ueRolled.cleared && (
                    <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
                      <div className="px-3.5 py-2.5 bg-[#241638] border-b border-[#3A2555]/80 flex items-center justify-between">
                        <span className="font-['Cinzel'] font-bold text-[13px] text-[#F4F1F8]">
                          🔍 LOOK CLOSER · CHAMBER INSPECTION
                        </span>
                        <span className="font-['Cinzel'] font-bold text-[12px] text-[#6FD39A]">
                          +75G BONUS
                        </span>
                      </div>
                      <div className="p-3.5 space-y-2.5">
                        {!lookCloserDone ? (
                          <button
                            type="button"
                            onClick={handleGatheringLookCloser}
                            className="w-full py-2.5 rounded-xl bg-[#2A1B40] hover:bg-[#D4B876]/25 border border-[#D4B876] font-['Cinzel'] font-bold text-[12.5px] text-[#E5C158] uppercase tracking-[0.8px] transition"
                          >
                            🔍 LOOK CLOSER IN THE CHAMBER (+75G)
                          </button>
                        ) : (
                          <div className="p-3 rounded-xl bg-[#130B1F] border border-[#6FD39A]/50 space-y-1.5">
                            <div className="font-['Cinzel'] font-bold text-[12px] text-[#6FD39A]">
                              ✓ CHAMBER INSPECTED (+75G RECOVERED)
                            </div>
                            <p className="font-sans text-[16px] text-[#F4F1F8] leading-[1.5]">
                              Because your party held {gathering.ueTitle.toLowerCase()}, you have time to search the inner chamber undisturbed—securing +{GOLD_LOOK_CLOSER_WIN}g in salvaged relics and setting every physical clue in order before the table question.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* =================================================================
              PHASE 4: CULT SCRIPTURE PRESENTATION & FRAGMENT MATCH CARD
              Gated until Phase 3 (United Effort + Look Closer if won) is complete!
             ================================================================= */}
          {ueRolled &&
            (!ueRolled.cleared || lookCloserDone) &&
            gathering.matches.length > 0 && (
              <>
                {/* Phase 3 -> Phase 4 Narrative Transition Bubble */}
                <div className="mr-6 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3.5 space-y-2 shadow-md">
                  <div className="flex items-center justify-between leading-none">
                    <span className="font-['Cinzel'] font-bold text-[11.5px] tracking-[1.3px] text-[#C4A1FF] uppercase">
                      MYTHIOS · PHASE 4 UNLOCKED
                    </span>
                    <span className="text-[12px] font-bold text-[#E5C158]">
                      Cult Scripture Recovery
                    </span>
                  </div>
                  <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                    From the fallen commander’s satchel at {gathering.location}, you recover a sealed strip of Dark Moon Scripture—waiting to be paired against the Seeker Fragments your party decoded across Week {currentWeek}.
                  </p>
                </div>

                <div className="mr-6 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3.5 space-y-2 shadow-md">
                  <div className="flex items-center justify-between leading-none">
                    <span className="font-['Cinzel'] font-bold text-[11.5px] tracking-[1.3px] text-[#F49CBB] uppercase">
                      MEI · SAGE
                    </span>
                    <span className="text-[11.5px] font-sans text-[#B7A9CC]">
                      Phase 4 · Scripture Match
                    </span>
                  </div>
                  <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                    I’ve laid our decoded Week {currentWeek} Seeker Fragments beside the Dark Moon verse. Compare the imagery in each line—only the true matching stone-record will unlock the verse’s meaning!
                  </p>
                </div>

                <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
                  <div className="px-3.5 py-2.5 bg-[#241638] border-b border-[#3A2555]/80 flex items-center justify-between">
                    <span className="font-['Cinzel'] font-bold text-[13px] text-[#F4F1F8]">
                      📜 PHASE 4 · WEEK {currentWeek} DARK MOON VERSE (3 MATCHES)
                    </span>
                    <span className="font-['Cinzel'] font-bold text-[12px] text-[#E5C158]">
                      +75G PER MATCH
                    </span>
                  </div>

                  <div className="p-3.5 space-y-3">
                    <p className="font-sans text-[14.5px] text-[#B7A9CC] leading-snug">
                      Recovered from the Cult Commander at {gathering.location}. Match each Dark Moon Scripture verse line with the Seeker Fragment your party decoded during the week:
                    </p>

                    {gathering.matches.map((m, mIdx) => {
                      const isMatched = !!matchedQuotes[mIdx];
                      const weekFragments = SEEKER_FRAGMENTS.filter(
                        (f) => f.week === currentWeek
                      );
                      const correctFrag =
                        weekFragments.find((f) => f.id === m.correctFragmentId) ||
                        weekFragments[0];
                      const otherFrags = weekFragments.filter(
                        (f) => f.id !== m.correctFragmentId
                      );
                      const d1 = otherFrags[(mIdx * 2) % otherFrags.length];
                      const d2 = otherFrags[(mIdx * 2 + 1) % otherFrags.length];
                      const distractors = [d1, d2].filter(Boolean);
                      const candidateFrags = [correctFrag, ...distractors]
                        .filter(Boolean)
                        .sort((a, b) => a.id.localeCompare(b.id));
                      const wrongFragId = wrongMatchPick[mIdx];

                      return (
                        <div
                          key={mIdx}
                          className="p-3.5 rounded-xl bg-[#130B1F] border border-[#3A2555] space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11.5px] font-['Cinzel'] font-bold text-[#D4B876] uppercase tracking-[0.8px]">
                              CULT SCRIPTURE · VERSE {currentWeek}.{mIdx + 1}
                            </span>
                            <span className="text-[11px] font-['Cinzel'] font-bold text-[#B794F4]">
                              {isMatched
                                ? `✓ PAIRED WITH FRAGMENT ${m.correctFragmentId}`
                                : 'SELECT MATCHING SEEKER FRAGMENT'}
                            </span>
                          </div>

                          <p className="font-['Cormorant_Garamond'] font-medium text-[20px] text-[#F4F1F8] leading-[1.55]">
                            {m.scriptureQuote}
                          </p>

                          {!isMatched ? (
                            <div className="space-y-2 pt-1">
                              <div className="text-[12px] font-['Cinzel'] font-bold text-[#B7A9CC] uppercase tracking-[0.6px]">
                                Which Week {currentWeek} Seeker Fragment answers this verse?
                              </div>
                              <div className="space-y-1.5">
                                {candidateFrags.map((cand) => {
                                  const cSolved = solvedWords[cand.id] || {};
                                  const w1Text = cSolved.w1
                                    ? cand.word1.toUpperCase()
                                    : `[${cand.jumble1.join('')}]`;
                                  const w2Text = cSolved.w2
                                    ? cand.word2.toUpperCase()
                                    : `[${cand.jumble2.join('')}]`;
                                  const solvedText = cand.displayTemplate
                                    .replace('{0}', w1Text)
                                    .replace('{1}', w2Text);
                                  const isWrongPick = wrongFragId === cand.id;
                                  return (
                                    <button
                                      key={cand.id}
                                      type="button"
                                      onClick={() => {
                                        if (cand.id === m.correctFragmentId) {
                                          setWrongMatchPick((prev) => ({
                                            ...prev,
                                            [mIdx]: null,
                                          }));
                                          setMatchedQuotes((prev) => ({
                                            ...prev,
                                            [mIdx]: true,
                                          }));
                                          onMatchScripture();
                                          onEarnGold(GOLD_MATCH_BASE_PER_PICK);
                                        } else {
                                          setWrongMatchPick((prev) => ({
                                            ...prev,
                                            [mIdx]: cand.id,
                                          }));
                                        }
                                      }}
                                      className={`w-full p-2.5 rounded-lg text-left border transition ${
                                        isWrongPick
                                          ? 'bg-[#2A1420] border-[#E0645C] text-[#E0645C]'
                                          : 'bg-[#1E1232] hover:bg-[#2A1B40] border-[#5E4585] hover:border-[#D4B876] text-[#F4F1F8]'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-['Cinzel'] font-bold text-[11.5px] text-[#E5C158]">
                                          📜 FRAGMENT {cand.id} · {cand.landmark}
                                        </span>
                                        <span className="font-['Cinzel'] font-bold text-[11px] text-[#6FD39A]">
                                          {isWrongPick ? '✕ MISMATCH' : 'PAIR (+75G) →'}
                                        </span>
                                      </div>
                                      <p className="font-['Cormorant_Garamond'] text-[16.5px] text-[#E6E0F0] mt-1 leading-snug">
                                        “{solvedText}”
                                      </p>
                                    </button>
                                  );
                                })}
                              </div>
                              {wrongFragId && (
                                <div className="text-[12.5px] font-sans font-semibold text-[#E0645C]">
                                  ✕ Fragment {wrongFragId} speaks to a different part of the record—read the verse imagery closely and try another fragment.
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-lg bg-[#1E1232] border border-[#6FD39A]/45 space-y-1">
                              <div className="text-[12px] font-['Cinzel'] font-bold text-[#6FD39A]">
                                ✓ MATCHED TO SEEKER FRAGMENT {m.correctFragmentId} (+75G)
                              </div>
                              <p className="font-sans text-[15.5px] text-[#F4F1F8] leading-snug">
                                {m.revealLine}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

          {/* =================================================================
              PHASE 5: THE TABLE QUESTION & GARRICK'S WEEK-END REVEAL
              Gated until all Scripture matches for the week are completed!
             ================================================================= */}
          {ueRolled &&
            (!ueRolled.cleared || lookCloserDone) &&
            gathering.matches.every((_, idx) => Boolean(matchedQuotes[idx])) && (
              <>
                {/* Phase 4 -> Phase 5 Narrative Transition Bubble */}
                <div className="mr-6 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3.5 space-y-2 shadow-md">
                  <div className="flex items-center justify-between leading-none">
                    <span className="font-['Cinzel'] font-bold text-[11.5px] tracking-[1.3px] text-[#4FD1C5] uppercase">
                      ARJUN · ARTIFICER
                    </span>
                    <span className="text-[11.5px] font-sans text-[#B7A9CC]">
                      Phase 5 · The Table Question
                    </span>
                  </div>
                  <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                    Every piece from {gathering.location} is on the table now, {characterName || 'friend'}. Make the call for our group—what does all of this prove?
                  </p>
                </div>

                <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
                  <div className="px-3.5 py-2.5 bg-[#241638] border-b border-[#3A2555]/80 flex items-center justify-between">
                    <span className="font-['Cinzel'] font-bold text-[13px] text-[#F4F1F8]">
                      🧭 PHASE 5 · THE TABLE QUESTION & REVEAL
                    </span>
                    <span className="text-[11.5px] font-sans text-[#D4B876]">
                      Phase 5 of 5
                    </span>
                  </div>

                  <div className="p-3.5 space-y-3">
                    <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                      {gathering.tableQuestion}
                    </p>

                    {/* Step 1 of Phase 5: Player chooses between three distinct table hypotheses */}
                    <div className="space-y-2">
                      {[
                        {
                          key: 'A' as const,
                          title: gathering.hypothesisA.title,
                          line: gathering.hypothesisA.line,
                        },
                        {
                          key: 'B' as const,
                          title: gathering.hypothesisB.title,
                          line: gathering.hypothesisB.line,
                        },
                        {
                          key: 'C' as const,
                          title: gathering.hypothesisC.title,
                          line: gathering.hypothesisC.line,
                        },
                      ].map((hyp) => {
                        const selected = tableHypothesisPick === hyp.key;
                        const isWrong =
                          selected && hyp.key !== gathering.correctHypothesis;
                        const isRight =
                          selected && hyp.key === gathering.correctHypothesis;
                        return (
                          <button
                            key={hyp.key}
                            type="button"
                            onClick={() => {
                              setTableHypothesisPick(hyp.key);
                              if (hyp.key === gathering.correctHypothesis) {
                                setTwistRevealed(true);
                              } else {
                                setTwistRevealed(false);
                              }
                            }}
                            className={`w-full p-3 rounded-xl text-left border transition ${
                              isRight
                                ? 'bg-[#2A1B40] border-[#6FD39A]'
                                : isWrong
                                ? 'bg-[#2A1420] border-[#E0645C]'
                                : 'bg-[#130B1F] hover:bg-[#1E1232] border-[#3A2555] hover:border-[#D4B876]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`font-['Cinzel'] font-bold text-[12.5px] ${
                                  isRight
                                    ? 'text-[#6FD39A]'
                                    : isWrong
                                    ? 'text-[#E0645C]'
                                    : 'text-[#E5C158]'
                                }`}
                              >
                                {isRight ? '✓ ' : isWrong ? '✕ ' : '🗣️ '}
                                {hyp.title}
                              </span>
                              <span
                                className={`font-['Cinzel'] font-bold text-[11px] shrink-0 ${
                                  isRight
                                    ? 'text-[#6FD39A]'
                                    : isWrong
                                    ? 'text-[#E0645C]'
                                    : 'text-[#6FD39A]'
                                }`}
                              >
                                {isRight
                                  ? 'TRUE DEDUCTION'
                                  : isWrong
                                  ? 'RE-CHECK CLUES'
                                  : 'SPEAK AT TABLE →'}
                              </span>
                            </div>
                            <p className="font-sans text-[14.5px] text-[#E6E0F0] mt-1 leading-snug">
                              “{hyp.line}”
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    {tableHypothesisPick &&
                      tableHypothesisPick !== gathering.correctHypothesis && (
                        <div className="p-3 rounded-xl bg-[#2A1420] border border-[#E0645C] space-y-1">
                          <div className="font-['Cinzel'] font-bold text-[11.5px] text-[#E0645C] uppercase">
                            🔍 RE-EXAMINE THE WEEK {currentWeek} CLUES
                          </div>
                          <p className="font-sans text-[14.5px] text-[#F4F1F8] leading-snug">
                            {gathering.wrongHypothesisHint}
                          </p>
                        </div>
                      )}

                    {twistRevealed && (
                      <div className="space-y-3 pt-1">
                        {/* Player's Table Declaration Bubble (ml-6) */}
                        <div className="ml-6 flex flex-col items-end">
                          <div className="w-full rounded-2xl rounded-tr-sm bg-[#4A3B24] border border-[#E5C77B] p-3.5 space-y-1.5 shadow-md">
                            <div className="flex items-center justify-between leading-none">
                              <span className="font-['Cinzel'] font-bold text-[11.5px] tracking-[1.2px] text-[#F3D88B] uppercase">
                                {characterName || 'YOU'}
                              </span>
                              <span className="text-[11.5px] font-sans text-[#F3D88B]">
                                Table Deduction
                              </span>
                            </div>
                            <p className="font-sans text-[17px] text-[#F4F1F8] leading-[1.5]">
                              {tableHypothesisPick === 'C'
                                ? gathering.hypothesisC.line
                                : tableHypothesisPick === 'B'
                                ? gathering.hypothesisB.line
                                : gathering.hypothesisA.line}
                            </p>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#130B1F] border border-[#6FD39A] space-y-1">
                          <div className="font-['Cinzel'] font-bold text-[13.5px] text-[#6FD39A]">
                            → {gathering.twistHeadline}
                          </div>
                          <p className="font-sans text-[17px] text-[#F4F1F8] leading-[1.5]">
                            {gathering.tableAnswer}
                          </p>
                        </div>

                        <div className="mr-6 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3.5 space-y-2 shadow-md">
                          <div className="flex items-center justify-between leading-none">
                            <span className="font-['Cinzel'] font-bold text-[11.5px] tracking-[1.3px] text-[#F0A552] uppercase">
                              GARRICK · END OF WEEK {currentWeek}
                            </span>
                            <span className="text-[11.5px] font-sans text-[#B7A9CC]">
                              First Oath Cliffhanger
                            </span>
                          </div>
                          <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                            {gathering.cliffhangerText.replace(/^[“"]|[”"]$/g, '')}
                          </p>
                        </div>

                        {/* Next-Week Transition CTA */}
                        {currentWeek < 6 ? (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectWeek(currentWeek + 1);
                              if (onSelectWeekDay) onSelectWeekDay(currentWeek + 1, 1);
                              setPartyMode('CAMPFIRE');
                            }}
                            className="w-full py-3 px-4 rounded-xl bg-[#2A2018] hover:bg-[#3A2E1C] border border-[#F0A552] font-['Cinzel'] font-bold text-[13px] tracking-[1px] text-[#F0A552] hover:text-[#F4F1F8] transition uppercase shadow-md"
                          >
                            ⚔️ WEEK {currentWeek} COMPLETE · PROCEED TO WEEK {currentWeek + 1} · DAY 1 →
                          </button>
                        ) : (
                          <div className="p-3 rounded-xl bg-[#2A1B40] border border-[#E5C158] text-center space-y-1">
                            <div className="font-['Cinzel'] font-bold text-[13px] text-[#E5C158] uppercase">
                              👑 SEASON 1 FINALE COMPLETE · TALES OF THE DARK MOON
                            </div>
                            <p className="font-sans text-[14.5px] text-[#F4F1F8]">
                              All five Stones have answered and the truth of the First Oath stands revealed in His Hall.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

          {/* LIVE GATHERING PARTY & GARRICK CHAT STREAM */}
          <div className="space-y-3 pb-2">
            {/* Interactive Player (ml-6, lighter yellow border & shade #4) & Companion/Garrick (mr-6) Gathering Turns */}
            {gatheringTurns.map((turn, gIdx) => {
              if (turn.sender === 'YOU') {
                const targetMeta = turn.target
                  ? PARTY_SPEAKER_META[turn.target]
                  : undefined;
                return (
                  <div key={`gt-${gIdx}`} className="ml-6 flex flex-col items-end">
                    <div className="w-full rounded-2xl rounded-tr-sm bg-[#4A3B24] border border-[#E5C77B] p-3.5 space-y-2 shadow-md">
                      <div className="flex items-center justify-between leading-none">
                        <span className="font-['Cinzel'] font-bold text-[11.5px] tracking-[1.2px] text-[#F3D88B] uppercase">
                          {characterName || 'YOU'}
                        </span>
                        <span className="text-[11.5px] font-sans text-[#F3D88B]">
                          {targetMeta
                            ? `To ${targetMeta.shortName} · Gathering`
                            : 'Gathering'}
                        </span>
                      </div>
                      <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                        {turn.text}
                      </p>
                    </div>
                  </div>
                );
              }
              const meta = PARTY_SPEAKER_META[turn.sender];
              return (
                <div
                  key={`gt-${gIdx}`}
                  className="mr-6 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3.5 space-y-2 shadow-md"
                >
                  <div className="flex items-center justify-between leading-none">
                    <span
                      className="font-['Cinzel'] font-bold text-[11.5px] tracking-[1.3px] uppercase"
                      style={{ color: meta.color }}
                    >
                      {meta.gatheringTitle}
                    </span>
                    <span className="text-[11.5px] font-sans text-[#B7A9CC]">
                      {meta.roleTag}
                    </span>
                  </div>
                  <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                    {turn.text.replace(/^[“"]|[”"]$/g, '')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Bar is only rendered in GATHERING mode because CampfireEveningView provides its own Campfire-specific footer */}
      {partyMode === 'GATHERING' && (
        <div className="px-3.5 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[#150D22] border-t border-[#3A2555]/55 space-y-2 shrink-0">
          {/* Quick-Select Speaker Target Bar (Garrick is present in all weeks) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-['Cinzel'] font-bold text-[#B7A9CC] uppercase tracking-[0.8px] shrink-0 mr-0.5">
              Talk to:
            </span>
            {(['GARRICK', 'DEV', 'MEI', 'ARJUN'] as const).map((spk) => {
              const meta = PARTY_SPEAKER_META[spk];
              const isSelected = activeSpeakerTarget === spk;
              return (
                <button
                  key={spk}
                  type="button"
                  onClick={() => setActiveSpeakerTarget(spk)}
                  className={`px-2.5 py-1 rounded-lg font-['Cinzel'] font-bold text-[11.5px] border transition whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-[#2A1B40] shadow-sm'
                      : 'bg-[#130B1F] border-[#3A2555] opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    borderColor: isSelected ? meta.color : undefined,
                    color: meta.color,
                  }}
                >
                  {meta.chipIcon} {meta.shortName.toUpperCase()}
                </button>
              );
            })}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!partyInput.trim()) return;
              handleSendPartyBanter(partyInput);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={partyInput}
              onChange={(e) => setPartyInput(e.target.value)}
              placeholder={`Message ${PARTY_SPEAKER_META[activeSpeakerTarget].shortName} at the Gathering...`}
              className="flex-1 bg-[#0D0714] border border-[#3A2555] rounded-xl px-3.5 py-2.5 text-[16px] font-sans text-[#F4F1F8] placeholder-[#8B7A9E] focus:outline-none focus:border-[#D4B876]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#D4B876]/22 hover:bg-[#D4B876]/32 border border-[#D4B876] font-['Cinzel'] font-bold text-[12.5px] text-[#F4F1F8] uppercase tracking-[1px] shrink-0"
            >
              SEND
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
