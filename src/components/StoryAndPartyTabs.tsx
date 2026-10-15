import React, { useEffect, useRef, useState } from 'react';
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
  DEFAULT_PARTY_MEMBERS,
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
  GOLD_FRAGMENT_WORD_SOLVED,
} from '../data/economy';
import { WEEKDAY_INVENTORY } from '../data/mythiosChaptersData';
import { SEEKER_FRAGMENTS } from '../data/mythiosFragments';
import { GATHERINGS_DATA } from '../data/mythiosGatheringsAndAudit';
import { getChapterWithContinuityFixes } from '../data/narrativeContinuityAudit';
import { routeGarrickMessage, GarrickRouteResult } from '../data/garrickRouter';
import { getDailyCampfireRiddles } from '../data/garrickDailyRiddles';
import { getFanOutEncounterData, FanOutBranchOption } from '../data/soloLandmarkProse';
import {
  getBoardCrossCheckSynthesis,
  buildBoardClueDiscussionExchange,
} from '../data/garrickCampfirePrompts';
import { getCampfireDayEntry } from '../data/campfireDaysData';
import { CampfireEveningView } from './CampfireEveningView';
import {
  CHAPTER_SCRIPTS,
  ScriptCond,
  ScriptStep,
  StrikeFirstRule,
} from '../data/chapterScripts';
import {
  NarrationBlock,
  NoticeBlock,
  ScriptButton,
  ScriptInline,
  ScriptText,
  ScriptTokens,
  TapEcho,
  fillScriptTokens,
  pickNoticeLine,
} from './ChapterScriptParts';
import {
  BattleState,
  BattleStrikeLine,
  UnitedEffortState,
  armCombatRelic,
  canTakeCombatRelic,
  playBattleRound,
  rollUnitedEffortTurn,
  startBattle,
  startUnitedEffort,
  unitedEffortBand,
  unitedEffortEligible,
} from '../data/gatheringEngine';
import { UNITED_EFFORT_STORIES } from '../data/unitedEffortStories';

/** A roll's net: +3, 0 or −2 (a true minus sign). */
const formatMargin = (m: number) => (m > 0 ? `+${m}` : m === 0 ? '0' : `−${Math.abs(m)}`);

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
  ledgerOpened: boolean;
  onOpenLedger: () => void;
  appliedLoopholeIds: string[];
  completedDays: string[];
  onClaimReward?: (key: string) => boolean;
  /** Whether a reward key has been claimed (also marks results such as 'G3:united-effort-lost'). */
  hasClaimedReward?: (key: string) => boolean;
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
  /** The enemy struck first this round (canon: set by a choice or the day's Challenge). */
  enemyFirst?: boolean;
  /** False when that side was already down and did not strike this round. */
  playerStruck?: boolean;
  enemyStruck?: boolean;
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
  onClaimReward = () => true,
  hasClaimedReward = () => false,
}) => {
  const [selectedAttr, setSelectedAttr] = useState<AttributeName | null>(null);
  const [privatePromptCustomText, setPrivatePromptCustomText] = useState('');
  const [useAttrRelic, setUseAttrRelic] = useState(false);
  const [rollOutcome, setRollOutcome] = useState<RollState | null>(null);
  const [isReplayRoll, setIsReplayRoll] = useState(false);

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

  // The chapter script: taps made, choices picked (in order), and [PRESS ON].
  const [scriptTaps, setScriptTaps] = useState<Record<number, boolean>>({});
  const [choicePicks, setChoicePicks] = useState<Record<number, number[]>>({});
  const [pressOutcome, setPressOutcome] = useState<RollState | null>(null);
  const [pressLeft, setPressLeft] = useState(false);
  const [pressRelic, setPressRelic] = useState(false);
  const [isRollingPress, setIsRollingPress] = useState(false);
  // Whether each of today's rewards was paid (false = the day was already played).
  const [claimResults, setClaimResults] = useState<Record<string, boolean>>({});

  const [useCombatRelic, setUseCombatRelic] = useState(false);
  const [fightRounds, setFightRounds] = useState<FightRoundEntry[]>([]);
  const [fightDone, setFightDone] = useState(false);
  const [isRollingRound, setIsRollingRound] = useState(false);


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
  const chapterScript = CHAPTER_SCRIPTS.find((c) => c.week === currentWeek && c.day === currentDay);

  // Reset per-day interactive states whenever dayKey changes from parent or presets
  const [lastDayKey, setLastDayKey] = useState<string>(dayKey);
  if (lastDayKey !== dayKey) {
    setLastDayKey(dayKey);
    setSelectedAttr(null);
    setUseAttrRelic(false);
    setRollOutcome(null);
    setIsReplayRoll(false);
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
    setScriptTaps({});
    setChoicePicks({});
    setPressOutcome(null);
    setPressLeft(false);
    setPressRelic(false);
    setIsRollingPress(false);
    setClaimResults({});
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
  // Core Rules §11: a lost roll-call at Gathering 5 makes Week 6 Day 1's Challenge two harder.
  const scriptChallenge = chapterScript?.steps.find(
    (st): st is Extract<ScriptStep, { t: 'challenge' }> => st.t === 'challenge'
  );
  const challengeHarder =
    scriptChallenge?.harderIf && hasClaimedReward(scriptChallenge.harderIf.key) === scriptChallenge.harderIf.has
      ? scriptChallenge.harderIf.by
      : 0;
  const challengeDC = weekdayDC + challengeHarder;
  const activeTierBonus = getTierInfo(activeAttrScore).bonus;
  const availableAttrRelics = relics[activeAttr] || 0;
  const availableBattleRelics = relics['Battle'] ?? relics['Combat'] ?? 0;

  // Two-Way Fight Stats (#1, #2, #3):
  // If the day has a Challenge + Fight, passing the Challenge grants +2 WEP First-Strike Advantage;
  // failing the Challenge inflicts -15 HP Opening Ambush Penalty before Round 1!
  // Only where the day's Challenge comes before its fight (not W1D1 or W4D2, where the fight is first).
  const challengeBeforeFight = (() => {
    const steps = chapterScript?.steps || [];
    const c = steps.findIndex((st) => st.t === 'challenge');
    const f = steps.findIndex((st) => st.t === 'fight');
    return c >= 0 && f >= 0 && c < f;
  })();
  const challengeCombatBonus = challengeBeforeFight && rollOutcome?.cleared ? 2 : 0;
  const challengeFailHpPenalty = challengeBeforeFight && rollOutcome && !rollOutcome.cleared ? 15 : 0;
  const baseWeaponAtk = GEAR_TABLE[weaponLevel]?.weapon || 14;
  const baseArmorDef = GEAR_TABLE[armorLevel]?.armor || 27;
  const playerAtk = baseWeaponAtk + (useCombatRelic ? 1 : 0) + challengeCombatBonus;
  const playerArmor = baseArmorDef + (useCombatRelic ? 1 : 0);
  const enemyDef = Math.max(16, (epMeta.wDef || 21) - 2);
  // Canon: who strikes first in the day's fight is set by a choice or by the day's Challenge.
  const scriptFight = chapterScript?.steps.find(
    (st): st is Extract<ScriptStep, { t: 'fight' }> => st.t === 'fight'
  );
  const fightEnemyFirst = (() => {
    const rule = scriptFight?.strikeFirst;
    if (!rule || rule.on === 'player') return false;
    if (rule.on === 'challenge') return !rollOutcome?.cleared;
    const first = (choicePicks[rule.choice] || [])[0];
    return !(first !== undefined && rule.options.includes(first));
  })();
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
    setIsReplayRoll(false);
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
    setScriptTaps({});
    setChoicePicks({});
    setPressOutcome(null);
    setPressLeft(false);
    setPressRelic(false);
    setIsRollingPress(false);
    setClaimResults({});
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
    const d20 = await rollChallengeD20(challengeDC, tierBonus, relicBonus);
    const { net: margin, success: cleared } = resolveChallengeRoll(d20, tierBonus + relicBonus, challengeDC);
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
      dc: challengeDC,
      succeedOn: challengeSucceedOn(challengeDC, tierBonus + relicBonus),
      margin,
      cleared,
    });
    setIsRollingChallenge(false);
    setDetourFightRounds([]);
    setDetourFightDone(false);

    // A replayed day pays nothing and costs nothing (one claim per day).
    const firstRoll = onClaimReward(`${dayKey}:challenge`);
    setIsReplayRoll(!firstRoll);
    if (!firstRoll) {
      // no gold, no growth
    } else if (cleared) {
      const daysPlayedThisWeek = completedDays.filter((id) => id.startsWith(`${currentWeek}-`)).length + 1;
      const growth = calculateAttributeGrowth(attrPoints, daysPlayedThisWeek, d20, tierBonus, challengeDC);
      setRollOutcome((prev) => (prev ? { ...prev, growth } : prev));
      onGainAttribute(activeAttr, growth, d20 === 20);
      onEarnGold(GOLD_CHALLENGE_WIN);
    } else {
      onEarnGold(-GOLD_CHALLENGE_LOSS);
    }
  };

  // [PRESS ON] (Core Rules §3): 4 harder, on the same Attribute; +200g on a pass, no growth, a miss costs nothing.
  const claimReward = (key: string) => {
    const ok = onClaimReward(key);
    setClaimResults((p) => ({ ...p, [key]: ok }));
    return ok;
  };
  const handleRollPressOn = async (dc: number) => {
    if (pressOutcome || isRollingPress || !rollOutcome) return;
    setIsRollingPress(true);
    const attr = rollOutcome.attr;
    const attrPoints = attributes[attr] || 1;
    const tierBonus = getTierInfo(attrPoints).bonus;
    const relicBonus = pressRelic && (relics[attr] || 0) > 0 ? 4 : 0;
    const d20 = await rollChallengeD20(dc, tierBonus, relicBonus);
    const { net: margin, success: cleared } = resolveChallengeRoll(d20, tierBonus + relicBonus, dc);
    if (relicBonus > 0) {
      onUseRelic(attr);
      setPressRelic(false);
    }
    setPressOutcome({
      d20,
      attr,
      attrPoints,
      tierBonus,
      relicBonus,
      total: d20 + tierBonus + relicBonus,
      dc,
      succeedOn: challengeSucceedOn(dc, tierBonus + relicBonus),
      margin,
      cleared,
    });
    if (cleared && claimReward(`${dayKey}:press`)) onEarnGold(GOLD_PRESS_ON_WIN);
    setIsRollingPress(false);
  };
  const pressReplay = claimResults[`${dayKey}:press`] === false;
  const fightReplay = claimResults[`${dayKey}:fight`] === false;
  const detourReplay = claimResults[`${dayKey}:detour`] === false;

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
    const dmgToPlayer = enemyHit ? enemyMargin * 5 : 0;
    const playerHpAfter = Math.max(0, playerHpBefore - dmgToPlayer);

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
        // Core Rules §3: growth only on a passed Daily Challenge, so the Detour gives none.
        if (nextRound.enemyHpAfter <= 0 && claimReward(`${dayKey}:detour`)) {
          onEarnGold(GOLD_DETOUR_FIGHT_WIN);
        }
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
    const enemyD20 = Math.floor(Math.random() * 20) + 1;
    const enemyMargin = enemyD20 + enemyAtk - playerArmor;
    const margin = d20 + playerAtk - enemyDef;
    let playerHpAfter = playerHpBefore;
    let enemyHpAfter = enemyHpBefore;
    let hit = false;
    let enemyHit = false;
    let playerStruck = false;
    let enemyStruck = false;
    const playerStrikes = () => {
      if (playerHpAfter <= 0) return;
      playerStruck = true;
      hit = margin > 0;
      if (hit) enemyHpAfter = Math.max(0, enemyHpAfter - margin * 5);
    };
    const enemyStrikes = () => {
      if (enemyHpAfter <= 0) return;
      enemyStruck = true;
      enemyHit = enemyMargin > 0;
      if (enemyHit) playerHpAfter = Math.max(0, playerHpAfter - enemyMargin * 5);
    };
    // Whoever strikes first strikes first every round; a fighter at 0 HP does not strike back.
    if (fightEnemyFirst) {
      enemyStrikes();
      playerStrikes();
    } else {
      playerStrikes();
      enemyStrikes();
    }
    // Damage is the margin × 5 (Core Rules §4); HP stops at 0.
    const dmgToEnemy = hit ? margin * 5 : 0;
    const dmgToPlayer = enemyHit ? enemyMargin * 5 : 0;

    return {
      round: r,
      enemyFirst: fightEnemyFirst,
      playerStruck,
      enemyStruck,
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
        const earnedGold = nextRound.enemyHpAfter <= 0 ? dayData.fightReward ?? 0 : 0;
        if (earnedGold > 0 && claimReward(`${dayKey}:fight`)) {
          onEarnGold(earnedGold);
        }
      }
      setIsRollingRound(false);
    }, 420);
  };


  // The day's fight card and the Detour card, placed by the chapter script.
  const renderFightCard = (fightName: string) => (
            <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
              <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555] flex items-center justify-between gap-2">
                <span className="font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8] truncate">
                  ⚔️ {fightName.toUpperCase()}
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
                        className="p-2 rounded-lg bg-[#1A102A] border border-[#3A2555]/80 flex flex-col gap-1.5 text-[12px] font-sans"
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
                        <div className={`space-y-0.5 ${r.enemyFirst ? 'order-2' : 'order-1'} ${r.playerStruck === false ? 'hidden' : ''}`}>
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
                              {formatMargin(r.margin)}
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

                        <div className={`space-y-0.5 pt-1 border-t border-white/[0.04] ${r.enemyFirst ? 'order-1' : 'order-2'} ${r.enemyStruck === false ? 'hidden' : ''}`}>
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
                              {formatMargin(r.enemyMargin)}
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
                            {(dayData.fightReward ?? 0) > 0
                              ? `VICTORY · REWARD: +${dayData.fightReward}g`
                              : 'VICTORY · No fight gold today: the Challenge was the paid beat'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-[#2A1420] border border-[#E0645C]/70 text-[12.5px] font-sans font-bold text-[#E0645C]">
                            DEFEATED · REWARD: none
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
                        : fightRounds.length === 0
                        ? '⚔️ FIGHT'
                        : `🎲 ROUND ${fightRounds.length + 1}`}
                    </button>
                  </div>
                )}
              </div>
            </div>
  );

  const renderDetourCard = () => (
                  <div className="w-full rounded-xl bg-[#180F29] border border-[#E0645C]/70 overflow-hidden shadow-lg">
                    <div className="px-3 py-2 bg-[#2A1628] border-b border-[#3A2555] flex items-center justify-between gap-2">
                      <span className="font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8] truncate">
                        ⚔️ ALERTED LOOKOUT · {(dayData.challengeTitle || dayData.place).toUpperCase()}
                      </span>
                      <span className="font-['Cinzel'] font-bold text-[11.5px] whitespace-nowrap shrink-0">
                        <span className="text-[#E5C158]">WEP {baseWeaponAtk}</span>{' '}
                        <span className="text-[#B7A9CC]">vs</span>{' '}
                        <span className="text-[#FB923C]">DEF {detourEnemyDef}</span>
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
                                    {formatMargin(r.margin)}
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

                              <div className={`space-y-0.5 pt-1 border-t border-white/[0.04] ${r.enemyStruck ?? r.enemyHpAfter > 0 ? '' : 'hidden'}`}>
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
                                    {formatMargin(r.enemyMargin)}
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
                                  ✓ Lookout driven off · +{GOLD_DETOUR_FIGHT_WIN}g
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-lg bg-[#2A1420] border border-[#E0645C]/70 text-[12.5px] font-sans font-bold text-[#E0645C]">
                                  ✕ Bruised Scrape · no gold
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
  );


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

  const fanOutEncounter = getFanOutEncounterData(dayData);

  const solvedFragCount = dayFragment
    ? (solvedWords[dayFragment.id]?.w1 ? 1 : 0) +
      (solvedWords[dayFragment.id]?.w2 ? 1 : 0)
    : 0;

  // Seeker Fragment unlocks after passing the Challenge, winning the Detour Skirmish, or winning the main Fight


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
      // No growth from Fan Out (Core Rules §3: growth only on the Daily Challenge).
      if (onClaimReward(`${dayKey}:fanout`)) {
        onEarnGold(GOLD_FAN_OUT_CACHE_WIN);
      }
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
    const dmgToPlayer = enemyHit ? enemyMargin * 5 : 0;
    const playerHpAfter = Math.max(0, playerHpBefore - dmgToPlayer);

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
          if (onClaimReward(`${dayKey}:fanout`)) {
            onEarnGold(GOLD_FAN_OUT_CACHE_WIN);
          }
          unlockFanOutPayoff(fanOutBranch);
        } else {
          setFanOutCompleted(true);
        }
      }
      setIsRollingFanOutRound(false);
    }, 380);
  };



  // ---------------------------------------------------------------------------
  // The weekday chapter, played from canon (docs/canon/episode-*.md via chapterScripts.ts).
  // Steps show in order; the first one waiting on the player (a tap, a choice, a roll, a fight) stops the page.
  // ---------------------------------------------------------------------------
  const scriptTokens: ScriptTokens = {
    friends: DEFAULT_PARTY_MEMBERS.filter((f) => f.id !== 'YOU').map((f) => f.name),
    partySize: DEFAULT_PARTY_MEMBERS.length,
  };
  const fill = (text: string) => fillScriptTokens(text, scriptTokens);

  const scriptCondMet = (c?: ScriptCond): boolean => {
    if (!c) return true;
    if (c.on === 'challenge') return Boolean(rollOutcome) && rollOutcome!.cleared === c.pass;
    if (c.on === 'press') return Boolean(pressOutcome?.cleared);
    if (c.on === 'fight') return fightDone && (enemyRemainingHp <= 0) === c.won;
    if (c.on === 'claim') return hasClaimedReward(c.key) === c.has;
    return false;
  };

  const strikeFirstFor = (rule: StrikeFirstRule): boolean => {
    if (rule.on === 'challenge') return Boolean(rollOutcome?.cleared);
    if (rule.on === 'choice') {
      const first = (choicePicks[rule.choice] || [])[0];
      return first !== undefined && rule.options.includes(first);
    }
    return true;
  };

  const renderChallengeCard = (step: Extract<ScriptStep, { t: 'challenge' }>) => {
    const extraReward = step.reward.replace(/^\+?500g\s*/, '');
    const shownBonus = activeTierBonus + (useAttrRelic ? 4 : 0);
    return (
      <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
        <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555] flex items-center justify-between gap-2">
          <span className="font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8] truncate">
            🎯 {step.title}
          </span>
          <span className="font-['Cinzel'] font-bold text-[12px] text-[#E5C158] whitespace-nowrap shrink-0">
            You succeed on {challengeSucceedOn(challengeDC, shownBonus)}+
          </span>
        </div>
        <div className="p-2.5 space-y-2">
          <ScriptText
            text={fill(step.desc)}
            className="font-sans text-[14px] text-[#E6E0F0] leading-[1.4]"
          />
          {challengeHarder > 0 && step.harderIf && (
            <ScriptText
              text={fill(step.harderIf.line)}
              className="font-sans text-[13.5px] text-[#E0645C] leading-[1.4]"
            />
          )}
          {currentWeek === 1 && currentDay === 1 && !rollOutcome && (
            <p className="text-[13.5px] font-sans text-[#B7A9CC] leading-snug">
              A Challenge. Pick the skill you trust and roll. Pass, and you earn{' '}
              {GOLD_CHALLENGE_WIN} gold and that skill grows. Fail, and it costs{' '}
              {GOLD_CHALLENGE_LOSS} gold.
            </p>
          )}
          <div className="space-y-1.5">
            {step.options.map((opt) => {
              const meta = ATTRIBUTE_META[opt.attr];
              const score = getDisplayScore(opt.attr);
              const isSelected = activeAttr === opt.attr;
              return (
                <button
                  key={opt.attr}
                  type="button"
                  disabled={!!rollOutcome}
                  onClick={() => setSelectedAttr(opt.attr)}
                  className={`w-full p-2.5 rounded-xl text-left transition border ${
                    isSelected
                      ? 'bg-[#2A1B40] border-[#D4B876] shadow-sm'
                      : 'bg-[#130B1F] border-[#3A2555] opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="font-['Cinzel'] font-bold text-[12.5px]"
                      style={{ color: meta.color }}
                    >
                      {isSelected ? '✓ ' : ''}
                      {opt.attr} {score} (+{getTierInfo(score).bonus})
                    </span>
                    <span className="font-['Cinzel'] font-bold text-[11.5px] text-[#E5C158] whitespace-nowrap">
                      {challengeSucceedOn(challengeDC, getTierInfo(score).bonus)}+
                    </span>
                  </div>
                  <p className="text-[13.5px] font-sans text-[#E6E0F0] mt-0.5 leading-snug">
                    {fill(opt.verb)}
                  </p>
                </button>
              );
            })}
          </div>
          <div className="text-[12.5px] font-sans leading-snug space-y-0.5">
            <div className="text-[#E5C158] font-semibold">
              REWARD: +{GOLD_CHALLENGE_WIN}g
              {extraReward && <ScriptInline text={` ${extraReward}`} />}
            </div>
            <div className="text-[#E0645C] font-semibold">
              IF YOU FAIL: −{GOLD_CHALLENGE_LOSS}g · <ScriptInline text={fill(step.fail)} />
            </div>
          </div>

          {!rollOutcome ? (
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
                {isRollingChallenge ? '🎲 ROLLING…' : `🎲 ROLL ${activeAttr.toUpperCase()}`}
              </button>
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-[#1A102A] border border-[#3A2555]/80 space-y-1 text-[12.5px] font-sans">
              <div className="flex flex-wrap items-center gap-1 font-semibold">
                <span className="text-[#6FD39A] font-bold">YOU:</span>
                <span className="text-[#F4F1F8]">🎲 {rollOutcome.d20}</span>
                <span className="text-[#8B7A9E]">+</span>
                <span style={{ color: ATTRIBUTE_META[rollOutcome.attr].color }}>
                  {rollOutcome.attr} {rollOutcome.attrPoints} (+{rollOutcome.tierBonus})
                </span>
                {rollOutcome.relicBonus > 0 && (
                  <>
                    <span className="text-[#8B7A9E]">+</span>
                    <span className="text-[#D4B876]">Relic {rollOutcome.relicBonus}</span>
                  </>
                )}
                <span className="text-[#8B7A9E]">−</span>
                <span className="text-[#E5C158]">DC {rollOutcome.dc}</span>
                <span className="text-[#8B7A9E]">=</span>
                <span className={`font-bold ${rollOutcome.cleared ? 'text-[#6FD39A]' : 'text-[#E0645C]'}`}>
                  {formatMargin(rollOutcome.margin)} {rollOutcome.cleared ? 'PASSED' : 'FAILED'}
                </span>
              </div>
              <div className="font-bold">
                {isReplayRoll ? (
                  <span className="text-[#B7A9CC]">Already played: no gold or growth this time.</span>
                ) : rollOutcome.cleared ? (
                  <span className="text-[#F4F1F8]">
                    <span className="text-[#E5C158]">+{GOLD_CHALLENGE_WIN}g</span>
                    {' · '}
                    <span style={{ color: ATTRIBUTE_META[rollOutcome.attr].color }}>
                      {rollOutcome.attr} {rollOutcome.attrPoints} → {rollOutcome.attrPoints + (rollOutcome.growth ?? 0)}
                    </span>
                  </span>
                ) : (
                  <span className="text-[#E0645C]">−{GOLD_CHALLENGE_LOSS}g</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPressCard = (step: Extract<ScriptStep, { t: 'press' }>) => {
    const dc = challengeDC + step.harder;
    const attr = rollOutcome?.attr || activeAttr;
    const bonus = getTierInfo(attributes[attr] || 1).bonus + (pressRelic ? 4 : 0);
    const relicsForAttr = relics[attr] || 0;
    return (
      <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
        <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555] flex items-center justify-between gap-2">
          <span className="font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8] truncate">
            PRESS ON · {step.title}
          </span>
          <span className="font-['Cinzel'] font-bold text-[12px] text-[#E5C158] whitespace-nowrap shrink-0">
            You succeed on {challengeSucceedOn(dc, bonus)}+
          </span>
        </div>
        <div className="p-2.5 space-y-2">
          <p className="font-sans text-[14px] text-[#E6E0F0] leading-[1.4]">
            {fill(step.detail)}. {step.harder} harder, on {attr}.
          </p>
          <div className="text-[12.5px] font-sans font-semibold text-[#E5C158]">
            REWARD: +{GOLD_PRESS_ON_WIN}g, and one more detail · a miss costs nothing
          </div>
          {pressOutcome ? (
            <div className="p-2 rounded-lg bg-[#1A102A] border border-[#3A2555]/80 text-[12.5px] font-sans font-semibold flex flex-wrap items-center gap-1">
              <span className="text-[#6FD39A] font-bold">YOU:</span>
              <span className="text-[#F4F1F8]">🎲 {pressOutcome.d20}</span>
              <span className="text-[#8B7A9E]">+</span>
              <span style={{ color: ATTRIBUTE_META[pressOutcome.attr].color }}>
                {pressOutcome.attr} {pressOutcome.attrPoints} (+{pressOutcome.tierBonus})
              </span>
              {pressOutcome.relicBonus > 0 && (
                <>
                  <span className="text-[#8B7A9E]">+</span>
                  <span className="text-[#D4B876]">Relic {pressOutcome.relicBonus}</span>
                </>
              )}
              <span className="text-[#8B7A9E]">−</span>
              <span className="text-[#E5C158]">DC {pressOutcome.dc}</span>
              <span className="text-[#8B7A9E]">=</span>
              <span className={`font-bold ${pressOutcome.cleared ? 'text-[#6FD39A]' : 'text-[#E0645C]'}`}>
                {formatMargin(pressOutcome.margin)} {pressOutcome.cleared ? 'PASSED' : 'FAILED'}
              </span>
              {pressOutcome.cleared && !pressReplay && (
                <span className="text-[#E5C158] font-bold ml-1">+{GOLD_PRESS_ON_WIN}g</span>
              )}
            </div>
          ) : pressLeft ? null : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={relicsForAttr <= 0}
                onClick={() => setPressRelic(!pressRelic)}
                className={`px-2.5 py-2 rounded-xl font-['Cinzel'] font-bold text-[11px] border transition whitespace-nowrap shrink-0 ${
                  pressRelic
                    ? 'bg-[#D4B876]/25 border-[#D4B876] text-[#F4F1F8]'
                    : 'bg-[#130B1F] border-[#3A2555] text-[#B7A9CC] disabled:opacity-40'
                }`}
              >
                ♦ RELIC +4
              </button>
              <button
                type="button"
                disabled={isRollingPress}
                onClick={() => handleRollPressOn(dc)}
                className="flex-1 py-2 px-2.5 rounded-xl bg-[#D4B876]/22 hover:bg-[#D4B876]/32 border border-[#D4B876] text-[#F4F1F8] font-['Cinzel'] font-bold text-[12px] uppercase transition disabled:opacity-50"
              >
                {isRollingPress ? '🎲 ROLLING…' : '🎲 PRESS ON'}
              </button>
              <button
                type="button"
                onClick={() => setPressLeft(true)}
                className="px-3 py-2 rounded-xl bg-[#130B1F] border border-[#3A2555] text-[#B7A9CC] font-['Cinzel'] font-bold text-[12px] uppercase"
              >
                LEAVE IT
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSummaryCard = (step: Extract<ScriptStep, { t: 'summary' }>) => {
    const [titleLine, ...rest] = step.lines;
    const earned: string[] = [];
    if (rollOutcome && !isReplayRoll) {
      if (rollOutcome.cleared) {
        earned.push(`+${GOLD_CHALLENGE_WIN}g`);
        earned.push(`${rollOutcome.attr} ${rollOutcome.attrPoints} → ${rollOutcome.attrPoints + (rollOutcome.growth ?? 0)}`);
      } else earned.push(`−${GOLD_CHALLENGE_LOSS}g`);
    }
    if (pressOutcome?.cleared && !pressReplay) earned.push(`+${GOLD_PRESS_ON_WIN}g`);
    if (fightDone && enemyRemainingHp <= 0 && (dayData.fightReward ?? 0) > 0 && !fightReplay) earned.push(`+${dayData.fightReward}g`);
    if (detourFightDone && detourEnemyRemainingHp <= 0 && !detourReplay) earned.push(`+${GOLD_DETOUR_FIGHT_WIN}g`);
    const shown = rest
      .map((l) => {
        if (/^You earned:/.test(l)) return `You earned: ${earned.length ? earned.join(' · ') : 'nothing new today'}`;
        // A line kept only for one branch of the roll.
        const pass = l.match(/^\*On a pass:\*\s*(.*)$/);
        if (pass) return rollOutcome?.cleared ? pass[1] : null;
        const fail = l.match(/^\*On a failure:\*\s*(.*)$/);
        if (fail) return rollOutcome && !rollOutcome.cleared ? fail[1] : null;
        // Canon's sample line ("You can now afford…") is an example, not a fixed line.
        if (/^You can now afford:/.test(l)) return null;
        return l;
      })
      .filter((l): l is string => Boolean(l));
    return (
      <div className="w-full rounded-xl bg-[#180F29] border border-[#D4B876]/70 overflow-hidden shadow-lg">
        <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555]">
          <ScriptText
            text={fill(titleLine)}
            className="font-['Cinzel'] font-bold text-[12.5px] tracking-[0.6px] text-[#E5C158]"
          />
        </div>
        <div className="p-3 space-y-1">
          {shown.map((l, i) => (
            <ScriptText
              key={i}
              text={fill(l)}
              className="font-sans text-[14px] text-[#E6E0F0] leading-[1.42]"
            />
          ))}
        </div>
      </div>
    );
  };

  const renderFragmentCard = () =>
    dayFragment ? (
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
            OPEN THE SEEKER CHEST (+{GOLD_FRAGMENT_WORD_SOLVED}g a word) →
          </button>
        </div>
      </div>
    ) : null;

  const scriptWalk = (() => {
    const nodes: React.ReactNode[] = [];
    let done = false;
    if (!chapterScript) return { nodes, done: true };
    const steps = chapterScript.steps;
    // A failed Challenge on a day with no fight brings the Detour fight (Core Rules §15 item 2).
    // It comes at the end of the chapter, before the summary card, so it never breaks a canon scene
    // (straight after the Challenge it put a "lookout" fight inside the inn's taproom on W1D2).
    const needsDetour = Boolean(rollOutcome && !rollOutcome.cleared && !dayData.hasFight);
    let detourShown = false;
    const maybeDetour = (): boolean => {
      if (!needsDetour || detourShown) return false;
      detourShown = true;
      nodes.push(<React.Fragment key="detour">{renderDetourCard()}</React.Fragment>);
      return !detourFightDone;
    };
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const key = `s${i}`;
      if (step.t === 'say') {
        if (!scriptCondMet(step.cond)) continue;
        nodes.push(<NarrationBlock key={key} text={fill(step.text)} pull={step.pull} />);
        if (step.fragment) nodes.push(<React.Fragment key={`${key}-frag`}>{renderFragmentCard()}</React.Fragment>);
        continue;
      }
      if (step.t === 'act') {
        if (scriptTaps[i]) {
          nodes.push(<TapEcho key={key} label={fill(step.label)} />);
          continue;
        }
        nodes.push(
          <ScriptButton key={key} label={fill(step.label)} onClick={() => setScriptTaps((p) => ({ ...p, [i]: true }))} />
        );
        return { nodes, done: false };
      }
      if (step.t === 'choice') {
        const picks = choicePicks[step.id] || [];
        const branchFor = (opt: number) => step.branches.find((b) => b.options.includes(opt));
        const shownBranches = new Set<number>();
        const showPick = (opt: number, mine: boolean) => {
          const b = branchFor(opt);
          if (mine) nodes.push(<TapEcho key={`${key}-p${opt}`} label={fill(step.labels[opt])} />);
          if (b && !shownBranches.has(step.branches.indexOf(b))) {
            shownBranches.add(step.branches.indexOf(b));
            nodes.push(<NarrationBlock key={`${key}-b${opt}`} text={fill(b.text)} />);
          }
        };
        picks.forEach((opt) => showPick(opt, true));
        // Options still open: every option before the first pick; in "each" mode, any whose branch is unseen.
        const open = step.labels
          .map((_, oi) => oi)
          .filter((oi) => {
            if (picks.length === 0) return true;
            if (step.mode !== 'each') return false;
            const b = branchFor(oi);
            return Boolean(b) && !shownBranches.has(step.branches.indexOf(b!));
          });
        if (picks.length > 0 && step.mode === 'auto') {
          step.branches.forEach((b, bi) => {
            if (!shownBranches.has(bi)) {
              shownBranches.add(bi);
              nodes.push(<NarrationBlock key={`${key}-auto${bi}`} text={fill(b.text)} />);
            }
          });
        }
        if (open.length > 0) {
          nodes.push(
            <div key={`${key}-opts`} className="space-y-1.5">
              {open.map((oi) => (
                <ScriptButton
                  key={oi}
                  label={fill(step.labels[oi])}
                  onClick={() => {
                    setChoicePicks((p) => ({ ...p, [step.id]: [...(p[step.id] || []), oi] }));
                    // A look that names one of the Challenge's two ways picks that way on the card.
                    const next = steps[i + 1];
                    if (step.mode === 'flavor' && next?.t === 'challenge' && next.options.length === step.labels.length) {
                      setSelectedAttr(next.options[oi].attr);
                    }
                  }}
                />
              ))}
            </div>
          );
          return { nodes, done: false };
        }
        continue;
      }
      if (step.t === 'notice') {
        const line = pickNoticeLine(step.lines, attributes, CLASS_META[characterClass].attribute);
        if (line) nodes.push(<NoticeBlock key={key} attr={line.attr} text={fill(line.text)} />);
        continue;
      }
      if (step.t === 'challenge') {
        nodes.push(<React.Fragment key={key}>{renderChallengeCard(step)}</React.Fragment>);
        if (!rollOutcome) return { nodes, done: false };
        continue;
      }
      if (step.t === 'press') {
        if (!rollOutcome?.cleared) continue;
        nodes.push(<React.Fragment key={key}>{renderPressCard(step)}</React.Fragment>);
        if (!pressOutcome && !pressLeft) return { nodes, done: false };
        if (pressLeft && !pressOutcome) nodes.push(<TapEcho key={`${key}-leave`} label="LEAVE IT" />);
        continue;
      }
      if (step.t === 'fight') {
        const playerFirst = strikeFirstFor(step.strikeFirst);
        // Canon's fight card: the enemy's line, then who strikes first.
        nodes.push(
          <div key={`${key}-desc`} className="font-sans italic text-[14px] text-[#B7A9CC] px-1">
            {fill(step.desc)}
          </div>
        );
        if (step.firstLines) {
          nodes.push(
            <NarrationBlock key={`${key}-first`} text={fill(playerFirst ? step.firstLines[0] : step.firstLines[1])} />
          );
        }
        nodes.push(<React.Fragment key={key}>{renderFightCard(step.name)}</React.Fragment>);
        if (!fightDone) return { nodes, done: false };
        continue;
      }
      if (step.t === 'summary') {
        if (maybeDetour()) return { nodes, done: false };
        nodes.push(<React.Fragment key={key}>{renderSummaryCard(step)}</React.Fragment>);
        done = true;
      }
    }
    return { nodes, done };
  })();

  const renderChapterScript = () => (
    <>
      {chapterScript && (
        <div className="font-['Cinzel'] font-bold text-[13px] tracking-[1px] text-[#D4B876] uppercase pt-1">
          {fill(chapterScript.heading)}
        </div>
      )}
      {scriptWalk.nodes}
    </>
  );

  const isArtifactUnlocked = scriptWalk.done;

  // Follow the story down as each new beat appears; a new day starts at the top.
  const storyScrollRef = useRef<HTMLDivElement>(null);
  const storyProgress = `${scriptWalk.nodes.length}|${fightRounds.length}|${detourFightRounds.length}|${Boolean(rollOutcome)}|${Boolean(pressOutcome)}`;
  const lastScrolledDay = useRef(dayKey);
  useEffect(() => {
    const el = storyScrollRef.current;
    if (!el) return;
    if (lastScrolledDay.current !== dayKey) {
      lastScrolledDay.current = dayKey;
      el.scrollTo({ top: 0 });
      return;
    }
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [storyProgress, dayKey]);

  // The day counts as played once its chapter reaches the summary card (Core Rules §11).
  useEffect(() => {
    if (scriptWalk.done) onSealDay(currentWeek, currentDay, dayData.place);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptWalk.done, dayKey]);

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
              { label: '3. Challenge + Fight', sub: 'W2·D3 · Upriver', w: 2, d: 3 },
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
      <div ref={storyScrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-2.5 space-y-2.5">
        {renderChapterScript()}


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
                                  {formatMargin(fanOutRollOutcome.margin)}
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
      ) : null}
    </div>
  );
};

/* ============================================================================
   CHAT -> PARTY (CAMPFIRE & DAY 7 GATHERING)
   - Clear visual separation between A+B (Top Mode Bar), C (Warm Campfire Tray),
     and D (True Left-Aligned Party Chat Bubbles with Avatars)
   - Lighthearted Garrick Campfire Riddles solved via Letter Tiles (#15, #16)
   - Day 7 Gathering: Approach Card (#18, #19), the Battle (each friend against their
     own enemy, Core Rules §4) and the United Effort (§5), Mythios Narration (#22),
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
  onClaimReward?: (key: string) => boolean;
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
  onUseRelic?: (relicType: string) => void;
  privateTheoryPromptsByDay?: Record<
    string,
    { reading: 'A' | 'B' | 'NEITHER'; customLine?: string }
  >;
  onLeaveFire?: () => void;
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
  armorLevel = 2,
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
  appliedLoopholeIds = [],
  relics = {},
  onGiveRelic,
  onUseRelic,
  privateTheoryPromptsByDay = {},
  onLeaveFire,
  onClaimReward = () => true,
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

  // Core Rules §4: each friend fights their own enemy, all in lockstep rounds.
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [isRollingBattleRound, setIsRollingBattleRound] = useState(false);
  const battleDone = Boolean(battle && battle.outcome !== 'ongoing');

  // Core Rules §5: the United Effort, one friend at a time until either thing reaches 0.
  const [ue, setUe] = useState<UnitedEffortState | null>(null);
  const [ueNextId, setUeNextId] = useState<string>('YOU');
  const [ueRelicArmed, setUeRelicArmed] = useState(false);
  const [ueStory, setUeStory] = useState<Array<{ line?: string; between?: string }>>([]);
  const [isRollingUe, setIsRollingUe] = useState(false);
  const ueDone = Boolean(ue && ue.outcome !== 'ongoing');
  const ueCleared = ue?.outcome === 'won';
  const [lookCloserDone, setLookCloserDone] = useState(false);

  const [matchedQuotes, setMatchedQuotes] = useState<Record<number, boolean>>({});
  const [wrongMatchPick, setWrongMatchPick] = useState<Record<number, string | null>>({});
  const [tableHypothesisPick, setTableHypothesisPick] = useState<'A' | 'B' | 'C' | null>(null);
  const [twistRevealed, setTwistRevealed] = useState(false);

  if (lastGatheringWeek !== currentWeek) {
    setLastGatheringWeek(currentWeek);
    setApproachPick('A');
    setApproachRolled(null);
    setBattle(null);
    setIsRollingBattleRound(false);
    setUe(null);
    setUeNextId('YOU');
    setUeRelicArmed(false);
    setUeStory([]);
    setIsRollingUe(false);
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
  const isW1D1Campfire = currentWeek === 1 && currentDay === 1;
  const isGarrickAbsentAtCamp = isW1D1Campfire;

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

  // The party for the Gathering, in party-list order (the host first).
  // Prototype: the sample friends use the player's gear and Attribute scores as stand-ins
  // until each friend has their own saved character.
  const gatheringParty = DEFAULT_PARTY_MEMBERS.map((f) => ({
    id: f.id,
    name: f.id === 'YOU' ? characterName || 'You' : f.name,
    color: f.color,
  }));
  const gatheringPartyIds = gatheringParty.map((f) => f.id);
  const partyName = (id: string) => gatheringParty.find((f) => f.id === id)?.name || id;
  const playerWeapon = GEAR_TABLE[weaponLevel]?.weapon || 14;
  const playerArmor = GEAR_TABLE[armorLevel]?.armor || 27;
  const combatRelicsHeld = relics.Battle || 0;

  const beginBattle = () =>
    startBattle(
      currentWeek,
      gatheringParty.map((f) => ({ id: f.id, name: f.name, weapon: playerWeapon, armor: playerArmor })),
      { name: gathering.enemyName, def: epMeta.gDef, atk: epMeta.gAtk },
      // Core Rules §11: the Approach decides who strikes first.
      Boolean(approachRolled?.cleared)
    );

  // One tap per round, with a short pause for the roll (Fake Guru, 14 Oct).
  const handleRollNextGatheringRound = () => {
    if (isRollingBattleRound || battleDone) return;
    setIsRollingBattleRound(true);
    setTimeout(() => {
      const next = playBattleRound(battle ?? beginBattle());
      setBattle(next);
      if (next.outcome === 'won' && onClaimReward(`G${currentWeek}:battle`)) {
        onEarnGold(GOLD_GATHERING_BATTLE_REWARDS[currentWeek] ?? epMeta.gReward);
      }
      setIsRollingBattleRound(false);
    }, 360);
  };

  // Core Rules §5: a Combat Relic is +1 Weapon and +1 Armor from the next round, spent at once.
  const handleUseCombatRelic = () => {
    const current = battle ?? beginBattle();
    if (combatRelicsHeld <= 0 || !canTakeCombatRelic(current, 'YOU')) return;
    onUseRelic?.('Battle');
    setBattle(armCombatRelic(current, 'YOU', partyName('YOU')));
  };

  const handleGiveCombatRelic = (friendId: string) => {
    if (!battle || combatRelicsHeld <= 0 || !canTakeCombatRelic(battle, friendId)) return;
    onGiveRelic?.('Battle', partyName(friendId));
    setBattle(armCombatRelic(battle, friendId, partyName('YOU')));
  };

  // United Effort: who rolls next. The player hands on by choice; a friend's turn passes to the next in the party list.
  const ueEligible = ue ? unitedEffortEligible(ue, gatheringPartyIds) : gatheringPartyIds;
  const ueRollerId = ueEligible.includes(ueNextId) ? ueNextId : ueEligible[0];
  const ueAttrScore = attributes[gathering.ueAttr] || 1;
  const ueTierBonus = getTierInfo(ueAttrScore).bonus;
  const ueRelicsHeld = relics[gathering.ueAttr] || 0;
  const ueAnyAttrRelic =
    ueRelicsHeld > 0
      ? gathering.ueAttr
      : Object.keys(relics).find((k) => k !== 'Battle' && (relics[k] || 0) > 0) || null;
  const ueDc = epMeta.ueDC;

  const handleRollUnitedEffort = () => {
    if (ueDone || isRollingUe) return;
    const current = ue ?? startUnitedEffort(gatheringParty.length);
    const rollerId = ueRollerId;
    // The player's own Relic must match the night's Attribute; a Relic given to a friend may be any.
    const relicType = ueRelicArmed ? (rollerId === 'YOU' ? gathering.ueAttr : ueAnyAttrRelic) : null;
    setIsRollingUe(true);
    setTimeout(() => {
      if (relicType) {
        if (rollerId === 'YOU') onUseRelic?.(relicType);
        else onGiveRelic?.(relicType, partyName(rollerId));
      }
      const next = rollUnitedEffortTurn(
        current,
        { id: rollerId, name: partyName(rollerId), score: ueAttrScore, tierBonus: ueTierBonus },
        ueDc,
        relicType ? 4 : 0,
        gatheringPartyIds
      );
      const last = next.rolls[next.rolls.length - 1];

      // One line of story, chosen by where the damaged thing now stands; each line is said once.
      const story = UNITED_EFFORT_STORIES[currentWeek];
      let line: string | undefined;
      let between: string | undefined;
      if (story) {
        const band = unitedEffortBand(last.barAfter, next.start);
        const side = last.success ? 'success' : 'fail';
        const usedBefore = next.rolls
          .slice(0, -1)
          .filter((r) => r.success === last.success && unitedEffortBand(r.barAfter, next.start) === band).length;
        line = story[side][band][usedBefore];
        const turn = next.rolls.length;
        if (next.outcome === 'ongoing' && (turn === 2 || turn === 4 || turn === 6)) {
          between = story.between[turn / 2 - 1];
        }
      }
      setUeStory((prev) => [...prev, { line, between }]);
      setUe(next);
      setUeRelicArmed(false);

      if (next.outcome === 'ongoing') {
        const eligible = unitedEffortEligible(next, gatheringPartyIds);
        // MYTHIOS names the next friend after a sample friend's turn; the player chooses after their own.
        if (rollerId !== 'YOU') setUeNextId(eligible[0]);
        else setUeNextId(eligible.find((id) => id !== 'YOU') ?? eligible[0]);
      } else if (next.outcome === 'lost') {
        // Read by later chapters (W4D1 Wren's cuts, W6D1 two harder).
        onClaimReward(`G${currentWeek}:united-effort-lost`);
      } else if (next.outcome === 'won') {
        if (onClaimReward(`G${currentWeek}:united-effort`)) {
          onEarnGold(GOLD_UNITED_EFFORT_WIN);
        }
        // A Clean Night: the opening roll cleared, the Battle won with nobody down, and the United Effort won.
        if (
          approachRolled?.cleared &&
          battle?.outcome === 'won' &&
          battle.fighters.every((f) => !f.fallen)
        ) {
          onUnlockGatheringBadge();
        }
      }
      setIsRollingUe(false);
    }, 360);
  };

  const handleGatheringLookCloser = () => {
    if (lookCloserDone) return;
    setLookCloserDone(true);
    if (onClaimReward(`G${currentWeek}:look-closer`)) {
      onEarnGold(GOLD_LOOK_CLOSER_WIN);
    }
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
                  setBattle(null);
                  setUe(null);
                  setUeStory([]);
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
              const p3Done = ueDone && (!ueCleared || lookCloserDone);
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
                      {formatMargin(approachRolled.margin)}
                    </span>
                  </div>
                  <div
                    className={`font-bold text-[13px] ${
                      approachRolled.cleared ? 'text-[#6FD39A]' : 'text-[#E0645C]'
                    }`}
                  >
                    {approachRolled.cleared
                      ? 'PASSED · The party strikes first in the Battle'
                      : 'FAILED · The enemy strikes first in the Battle'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* =================================================================
              PHASE 2: THE BATTLE (Core Rules §4). Each friend fights their own enemy,
              all in lockstep rounds; one tap plays a round.
             ================================================================= */}
          {approachRolled && (
            <>
              <div className="mr-6 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3.5 space-y-2 shadow-md">
                <div className="flex items-center justify-between leading-none">
                  <span className="font-['Cinzel'] font-bold text-[11.5px] tracking-[1.3px] text-[#C4A1FF] uppercase">
                    MYTHIOS · THE BATTLE
                  </span>
                  <span
                    className={`text-[12px] font-bold ${
                      approachRolled.cleared ? 'text-[#6FD39A]' : 'text-[#E0645C]'
                    }`}
                  >
                    {approachRolled.cleared ? 'You strike first' : 'They strike first'}
                  </span>
                </div>
                <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                  {approachRolled.cleared
                    ? `"${
                        (approachPick === 'A' ? gathering.approachOptA : gathering.approachOptB).label
                      }" works. You are on them before they are ready.`
                    : `"${
                        (approachPick === 'A' ? gathering.approachOptA : gathering.approachOptB).label
                      }" gives you away. They are ready for you.`}
                </p>
              </div>

              <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
                <div className="px-3.5 py-2.5 bg-[#241638] border-b border-[#3A2555]/80 flex items-center justify-between gap-2">
                  <span className="font-['Cinzel'] font-bold text-[13px] text-[#F4F1F8] truncate">
                    ⚔️ {gathering.enemyName.toUpperCase()}
                  </span>
                  <span className="font-['Cinzel'] font-bold text-[12px] text-[#FB923C] whitespace-nowrap shrink-0">
                    DEF {epMeta.gDef} · ATK {epMeta.gAtk}
                  </span>
                </div>

                <div className="p-3.5 space-y-3">
                  <div className="text-[13.5px] font-sans text-[#E6E0F0] space-y-0.5">
                    <div>
                      You hit on{' '}
                      <span className="text-[#E5C158] font-bold">
                        {Math.min(20, Math.max(2, epMeta.gDef + 1 - playerWeapon))}+
                      </span>{' '}
                      (Roll + Weapon {playerWeapon} − DEF {epMeta.gDef})
                    </div>
                    <div>
                      Enemy hits on{' '}
                      <span className="text-[#E5C158] font-bold">
                        {Math.min(20, Math.max(2, playerArmor + 1 - epMeta.gAtk))}+
                      </span>{' '}
                      (Roll + ATK {epMeta.gAtk} − Armor {playerArmor})
                    </div>
                    <div>
                      Damage = Margin × 5 · REWARD:{' '}
                      <span className="text-[#E5C158] font-bold">
                        {GOLD_GATHERING_BATTLE_REWARDS[currentWeek] ?? epMeta.gReward}g
                      </span>{' '}
                      to every friend if the party wins
                    </div>
                  </div>
                  {currentWeek !== 1 && (
                    <p className="font-sans text-[14px] text-[#B7A9CC] leading-snug">
                      {gathering.conditionText}
                    </p>
                  )}

                  {/* Each friend's fight: their HP against their own enemy's HP */}
                  <div className="space-y-1.5">
                    {gatheringParty.map((f) => {
                      const fighter = battle?.fighters.find((x) => x.id === f.id);
                      const foe = battle?.foes.find((x) => x.ownerId === f.id);
                      const hp = fighter?.hp ?? 100;
                      const foeHp = foe?.hp ?? 100;
                      return (
                        <div
                          key={f.id}
                          className="p-2 rounded-lg bg-[#130B1F] border border-[#3A2555] text-[12.5px] font-sans"
                        >
                          <div className="flex items-center justify-between gap-2 font-bold">
                            <span style={{ color: f.color }}>
                              {f.name.toUpperCase()}
                              {fighter?.relicFrom ? ' ♦' : ''}
                              {fighter?.fallen ? ' · DOWN' : ''}
                            </span>
                            <span className="text-[#6FD39A]">HP {hp}</span>
                            <span className="text-[#E0645C]">
                              {foeHp > 0 ? `Foe HP ${foeHp}` : 'Foe down'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div className="h-1.5 bg-[#2A1B40] rounded-full overflow-hidden">
                              <div className="h-full bg-[#6FD39A]" style={{ width: `${hp}%` }} />
                            </div>
                            <div className="h-1.5 bg-[#2A1B40] rounded-full overflow-hidden">
                              <div className="h-full bg-[#E0645C]" style={{ width: `${foeHp}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* The rounds, newest last. Each friend's fight shows its own lines. */}
                  {battle && battle.log.length > 0 && (
                    <div className="space-y-2.5">
                      {battle.log.map((r) => (
                        <div
                          key={r.round}
                          className="p-3 rounded-xl bg-[#130B1F] border border-[#3A2555] space-y-2"
                        >
                          <span className="px-2 py-0.5 rounded bg-[#D4B876]/20 border border-[#D4B876]/50 font-['Cinzel'] font-bold text-[11px] text-[#D4B876]">
                            ROUND {r.round}
                          </span>
                          {r.fights
                            .filter((fight) => fight.lines.length > 0)
                            .map((fight) => (
                              <div
                                key={fight.ownerId}
                                className="p-2 rounded-lg bg-[#1A102A] border border-[#3A2555]/70 space-y-1 text-[13px] font-sans"
                              >
                                {fight.lines.map((ln: BattleStrikeLine, i) => {
                                  const isParty = ln.side === 'party';
                                  const who = ln.attacker.toUpperCase();
                                  if (ln.lost) {
                                    return (
                                      <div key={i} className="text-[#9A90B8] font-semibold">
                                        {who}:{' '}
                                        {ln.lost === 'risen'
                                          ? 'still rising. No strike this round.'
                                          : 'slips in the flood. No strike this round.'}
                                      </div>
                                    );
                                  }
                                  if (ln.roll === undefined) {
                                    return (
                                      <div key={i} className="text-[#E0645C] font-semibold">
                                        {ln.note} {ln.target.toUpperCase()} HP {ln.hpBefore} → {ln.hpAfter}
                                      </div>
                                    );
                                  }
                                  return (
                                    <div key={i}>
                                      {ln.note && isParty && (
                                        <div className="text-[11.5px] text-[#B7A9CC]">{ln.note}</div>
                                      )}
                                      <div className="flex flex-wrap items-center gap-1.5 font-semibold">
                                        <span
                                          className="font-bold"
                                          style={{ color: isParty ? '#6FD39A' : '#E0645C' }}
                                        >
                                          {isParty ? who : 'FOE'}:
                                        </span>
                                        <span className="text-[#F4F1F8]">🎲 {ln.roll}</span>
                                        <span className="text-[#8B7A9E]">+</span>
                                        <span className="text-[#E5C158]">
                                          {isParty ? 'WEP' : 'ATK'} {ln.attack}
                                        </span>
                                        <span className="text-[#8B7A9E]">−</span>
                                        <span className="text-[#FB923C]">
                                          {isParty ? 'DEF' : 'AMR'} {ln.defence}
                                        </span>
                                        <span className="text-[#8B7A9E]">=</span>
                                        <span
                                          className={`font-bold ${
                                            ln.hit ? 'text-[#6FD39A]' : 'text-[#9A90B8]'
                                          }`}
                                        >
                                          {formatMargin(ln.margin ?? 0)}
                                        </span>
                                      </div>
                                      <div className="text-[12.5px] font-bold">
                                        {ln.hit ? (
                                          <span className="text-[#6FD39A]">
                                            HIT +{ln.margin} × 5 = {ln.damage}.{'  '}
                                            <span className="text-[#E0645C]">
                                              {isParty ? 'FOE' : ln.target.toUpperCase()} HP {ln.hpBefore} → {ln.hpAfter}
                                            </span>
                                            {!isParty && ln.hpAfter === 0 && (
                                              <span className="text-[#E0645C]"> · DOWN</span>
                                            )}
                                            {isParty && ln.hpAfter === 2 && (
                                              <span className="text-[#B7A9CC]"> · It rises with 2 HP.</span>
                                            )}
                                          </span>
                                        ) : (
                                          <span className="text-[#9A90B8]">MISS</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          {r.helpCalls.map((call) => (
                            <div
                              key={call.id}
                              className="p-2 rounded-lg bg-[#2A1420] border border-[#E0645C]/60 text-[12.5px] font-['Cinzel'] font-bold text-[#E0645C]"
                            >
                              {partyName(call.id).toUpperCase()} IS IN TROUBLE · HP {call.hp}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {!battleDone ? (
                    <div className="space-y-2">
                      {/* Help-calls from the last round stay open until the next round starts. */}
                      {battle &&
                        battle.log.length > 0 &&
                        battle.log[battle.log.length - 1].helpCalls
                          .map((call) => call.id)
                          .filter((id) => id !== 'YOU' && canTakeCombatRelic(battle, id))
                          .map((id) => (
                            <button
                              key={id}
                              type="button"
                              disabled={combatRelicsHeld <= 0}
                              onClick={() => handleGiveCombatRelic(id)}
                              className="w-full py-2 px-2.5 rounded-xl font-['Cinzel'] font-bold text-[11.5px] border bg-[#130B1F] border-[#E0645C]/70 text-[#F4F1F8] hover:bg-[#2A1B40] disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              {combatRelicsHeld > 0
                                ? `♦ GIVE A COMBAT RELIC TO ${partyName(id).toUpperCase()} (+1 WEP, +1 AMR · ${combatRelicsHeld} IN BAG)`
                                : `NO COMBAT RELIC TO GIVE ${partyName(id).toUpperCase()}`}
                            </button>
                          ))}

                      {canTakeCombatRelic(battle ?? beginBattle(), 'YOU') && (
                        <button
                          type="button"
                          disabled={combatRelicsHeld <= 0}
                          onClick={handleUseCombatRelic}
                          className="w-full py-2 px-2.5 rounded-xl font-['Cinzel'] font-bold text-[11.5px] border bg-[#130B1F] hover:bg-[#2A1B40] border-[#3A2555] hover:border-[#D4B876] text-[#B7A9CC] hover:text-[#F4F1F8] disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {combatRelicsHeld > 0
                            ? `♦ USE RELIC: COMBAT (+1 WEP, +1 AMR from next round · ${combatRelicsHeld} IN BAG)`
                            : '♦ NO COMBAT RELIC IN BAG'}
                        </button>
                      )}
                      {battle?.fighters.find((x) => x.id === 'YOU')?.relicPending && (
                        <div className="text-[12px] font-sans text-[#D4B876]">
                          ♦ Your Combat Relic works from the next round.
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={isRollingBattleRound}
                        onClick={handleRollNextGatheringRound}
                        className="w-full py-2.5 rounded-xl bg-[#D4B876]/22 hover:bg-[#D4B876]/32 border border-[#D4B876] text-[#F4F1F8] font-['Cinzel'] font-bold text-[13px] tracking-[1px] uppercase transition disabled:opacity-50"
                      >
                        {isRollingBattleRound
                          ? `🎲 ROLLING ROUND ${(battle?.round ?? 0) + 1}...`
                          : `🎲 ROUND ${(battle?.round ?? 0) + 1}`}
                      </button>
                    </div>
                  ) : battle?.outcome === 'won' ? (
                    <div className="p-2.5 rounded-xl bg-[#1A102A] border border-[#6FD39A]/60 space-y-1">
                      <div className="font-['Cinzel'] font-bold text-[12px] text-[#6FD39A]">
                        VICTORY. Every enemy is down in {battle.round} rounds.
                      </div>
                      <div className="font-['Cinzel'] font-bold text-[12px] text-[#E5C158]">
                        REWARD: +{GOLD_GATHERING_BATTLE_REWARDS[currentWeek] ?? epMeta.gReward}g
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-[#2A1420] border border-[#E0645C]/60 space-y-1">
                      <div className="font-['Cinzel'] font-bold text-[12px] text-[#E0645C]">
                        DEFEATED. They step over you and leave you alive.
                      </div>
                      <div className="font-['Cinzel'] font-bold text-[12px] text-[#E0645C]">
                        REWARD: none
                      </div>
                    </div>
                  )}
                  {battle?.fighters.find((x) => x.id === 'YOU')?.fallen && battle.outcome === 'ongoing' && (
                    <div className="text-[12.5px] font-sans text-[#E0645C]">
                      DEFEATED. You are down for this Battle. Your friends fight on.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* =================================================================
              PHASE 3: THE UNITED EFFORT (Core Rules §5). One friend at a time rolls a
              Challenge in the night's Attribute against the weekday DC.
             ================================================================= */}
          {battleDone && (
            <>
              <div className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
                <div className="px-3.5 py-2.5 bg-[#241638] border-b border-[#3A2555]/80 flex items-center justify-between gap-2">
                  <span className="font-['Cinzel'] font-bold text-[13px] text-[#F4F1F8]">
                    ⚡ {gathering.ueTitle.toUpperCase()} · United Effort
                  </span>
                  <span
                    className="font-['Cinzel'] font-bold text-[12px] whitespace-nowrap"
                    style={{
                      color: ATTRIBUTE_META[gathering.ueAttr]?.color || '#D4B876',
                    }}
                  >
                    {gathering.ueAttr} · DC {ueDc}
                  </span>
                </div>

                <div className="p-3.5 space-y-3">
                  {(() => {
                    const start = ue?.start ?? (gatheringParty.length <= 1 ? 60 : 100);
                    const way = ue?.way ?? start;
                    const risk = ue?.risk ?? start;
                    return (
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: gathering.ueBarAName, value: way, color: '#6FD39A' },
                          { name: gathering.ueBarBName, value: risk, color: '#E5C158' },
                        ].map((bar) => (
                          <div key={bar.name} className="p-3 rounded-xl bg-[#130B1F] border border-[#3A2555]">
                            <div className="flex items-center justify-between font-['Cinzel'] font-bold text-[12px]">
                              <span className="truncate mr-1" style={{ color: bar.color }}>
                                {bar.name.toUpperCase()}
                              </span>
                              <span className="whitespace-nowrap" style={{ color: bar.color }}>
                                {bar.value}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-[#2A1B40] rounded-full overflow-hidden mt-2">
                              <div
                                className="h-full transition-all duration-500"
                                style={{ width: `${(bar.value / start) * 100}%`, background: bar.color }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  <div className="text-[13px] font-sans text-[#E6E0F0] leading-snug">
                    A SUCCESS damages {gathering.ueBarAName}. A FAIL damages {gathering.ueBarBName}.
                    Damage = 10 + Roll. REWARD: +{GOLD_UNITED_EFFORT_WIN}g to every friend, if{' '}
                    {gathering.ueBarAName} reaches 0.
                  </div>

                  {/* Each turn: the Challenge line, the damage line, then one line of story. */}
                  {ue && ue.rolls.length > 0 && (
                    <div className="space-y-2">
                      {ue.rolls.map((r, idx) => {
                        const barName = r.bar === 'way' ? gathering.ueBarAName : gathering.ueBarBName;
                        const st = ueStory[idx];
                        return (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-[#130B1F] border border-[#3A2555]/80 space-y-1 text-[13px] font-sans"
                          >
                            <div className="flex flex-wrap items-center gap-1.5 font-semibold">
                              <span className="font-bold text-[#6FD39A]">
                                {r.rollerName.toUpperCase()}:
                              </span>
                              <span className="text-[#F4F1F8]">🎲 {r.roll}</span>
                              <span className="text-[#8B7A9E]">+</span>
                              <span style={{ color: ATTRIBUTE_META[gathering.ueAttr]?.color || '#D4B876' }}>
                                {gathering.ueAttr} {r.score} (+{r.tierBonus})
                              </span>
                              {r.relicBonus > 0 && (
                                <>
                                  <span className="text-[#8B7A9E]">+</span>
                                  <span className="text-[#D4B876]">Relic {r.relicBonus}</span>
                                </>
                              )}
                              <span className="text-[#8B7A9E]">−</span>
                              <span className="text-[#E5C158]">DC {r.dc}</span>
                              <span className="text-[#8B7A9E]">=</span>
                              <span className={`font-bold ${r.success ? 'text-[#6FD39A]' : 'text-[#E0645C]'}`}>
                                {formatMargin(r.margin)} {r.success ? 'SUCCESS' : 'FAIL'}
                              </span>
                            </div>
                            <div className="text-[12.5px] font-bold text-[#E6E0F0]">
                              Damage = 10 + Roll {r.damageRoll} = {r.damage}. {barName} {r.barBefore} → {r.barAfter}
                            </div>
                            {st?.line && (
                              <p className="font-sans text-[14.5px] text-[#F4F1F8] leading-[1.42]">{st.line}</p>
                            )}
                            {st?.between && (
                              <p className="font-sans italic text-[14px] text-[#B7A9CC] leading-[1.42]">
                                {st.between}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!ueDone ? (
                    <div className="space-y-2">
                      {/* After the player's own turn, they hand it on to a friend who has not yet gone. */}
                      {ue &&
                        ue.rolls.length > 0 &&
                        ue.rolls[ue.rolls.length - 1].rollerId === 'YOU' &&
                        ueEligible.filter((id) => id !== 'YOU').length > 1 && (
                          <div className="flex flex-wrap gap-1.5">
                            {ueEligible
                              .filter((id) => id !== 'YOU')
                              .map((id) => (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() => setUeNextId(id)}
                                  className={`px-2.5 py-1.5 rounded-lg font-['Cinzel'] font-bold text-[11px] border transition ${
                                    ueRollerId === id
                                      ? 'bg-[#2A1B40] border-[#D4B876] text-[#E5C158]'
                                      : 'bg-[#130B1F] border-[#3A2555] text-[#B7A9CC]'
                                  }`}
                                >
                                  TO {partyName(id).toUpperCase()}
                                </button>
                              ))}
                          </div>
                        )}

                      <div className="text-[13px] font-sans text-[#E6E0F0]">
                        {ueRollerId === 'YOU' ? 'Your turn.' : `${partyName(ueRollerId)}'s turn.`}{' '}
                        {gathering.ueAttr} +{ueTierBonus + (ueRelicArmed ? 4 : 0)} · Succeeds on{' '}
                        <span className="text-[#E5C158] font-bold">
                          {challengeSucceedOn(ueDc, ueTierBonus + (ueRelicArmed ? 4 : 0))}+
                        </span>
                      </div>

                      {(ueRollerId === 'YOU' ? ueRelicsHeld > 0 : Boolean(ueAnyAttrRelic)) && (
                        <button
                          type="button"
                          onClick={() => setUeRelicArmed((v) => !v)}
                          className={`w-full py-2 px-2.5 rounded-xl font-['Cinzel'] font-bold text-[11.5px] border transition ${
                            ueRelicArmed
                              ? 'bg-[#D4B876]/25 border-[#D4B876] text-[#F4F1F8]'
                              : 'bg-[#130B1F] border-[#3A2555] text-[#B7A9CC] hover:text-[#F4F1F8]'
                          }`}
                        >
                          {ueRollerId === 'YOU'
                            ? ueRelicArmed
                              ? `✓ ${gathering.ueAttr.toUpperCase()} RELIC ON THIS ROLL (+4)`
                              : `♦ USE ${gathering.ueAttr.toUpperCase()} RELIC (+4 · ${ueRelicsHeld} IN BAG)`
                            : ueRelicArmed
                            ? `✓ GIVING ${String(ueAnyAttrRelic).toUpperCase()} RELIC TO ${partyName(ueRollerId).toUpperCase()} (+4)`
                            : `♦ GIVE ${String(ueAnyAttrRelic).toUpperCase()} RELIC TO ${partyName(ueRollerId).toUpperCase()} (+4)`}
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isRollingUe}
                        onClick={handleRollUnitedEffort}
                        className="w-full py-2.5 rounded-xl bg-[#D4B876]/22 hover:bg-[#D4B876]/32 border border-[#D4B876] text-[#F4F1F8] font-['Cinzel'] font-bold text-[13px] tracking-[1px] uppercase transition disabled:opacity-50"
                      >
                        {isRollingUe
                          ? '🎲 ROLLING...'
                          : ueRollerId === 'YOU'
                          ? `🎲 ROLL ${gathering.ueAttr.toUpperCase()}`
                          : `🎲 ${partyName(ueRollerId).toUpperCase()} ROLLS`}
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`p-2 rounded-lg border text-[13px] font-['Cinzel'] font-bold flex items-center justify-between ${
                        ueCleared
                          ? 'bg-[#1E1232] border-[#6FD39A]/60 text-[#6FD39A]'
                          : 'bg-[#2A1628] border-[#E0645C]/60 text-[#E0645C]'
                      }`}
                    >
                      <span>
                        {ueCleared
                          ? `${gathering.ueBarAName} reaches 0. The job is done.`
                          : `${gathering.ueBarBName} reaches 0. The job is lost.`}
                      </span>
                      <span>{ueCleared ? `+${GOLD_UNITED_EFFORT_WIN}g` : 'No reward'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mythios Outcome Bubble + Interactive [LOOK CLOSER (+75G)] Card when United Effort is rolled */}
              {ueDone && (
                <>
                  <div className="mr-6 rounded-2xl rounded-tl-sm bg-[#1E1232] border border-[#C4A1FF] p-3.5 space-y-2 shadow-md">
                    <div className="flex items-center justify-between leading-none">
                      <span className="font-['Cinzel'] font-bold text-[11.5px] tracking-[1.3px] text-[#C4A1FF] uppercase">
                        MYTHIOS · {gathering.ueTitle}
                      </span>
                      <span
                        className={`text-[12px] font-bold ${
                          ueCleared ? 'text-[#6FD39A]' : 'text-[#E0645C]'
                        }`}
                      >
                        {ueCleared ? 'United Effort Won' : 'United Effort Lost'}
                      </span>
                    </div>
                    <p className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]">
                      {ueCleared ? gathering.ueWinText : gathering.ueLoseText}
                    </p>
                  </div>

                  {/* Interactive [LOOK CLOSER (+75G)] Room Inspection when United Effort is cleared */}
                  {ueCleared && (
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
          {ueDone &&
            (!ueCleared || lookCloserDone) &&
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
                                          if (onClaimReward(`G${currentWeek}:match:${mIdx}`)) {
                                            onEarnGold(GOLD_MATCH_BASE_PER_PICK);
                                          }
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
          {ueDone &&
            (!ueCleared || lookCloserDone) &&
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
