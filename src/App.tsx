import React, { useState, useEffect, useMemo, useRef, Suspense, lazy } from 'react';
import { GOLD_FRAGMENT_WORD_SOLVED } from './data/economy';
import type { AuditBackupRestorePayload } from './components/AuditWorkbench';
// The workbench holds Garrick's hidden meanings: it loads only with ?dev=1, so a player's download never fetches it.
const AuditWorkbench = lazy(() => import('./components/AuditWorkbench').then((m) => ({ default: m.AuditWorkbench })));
import { BagTabView, StoreTabView } from './components/BagAndStoreTabs';
import { RecordTabView } from './components/RecordTabView';
import { PartyTabView, PinnedPartyClue, StoryTabView } from './components/StoryAndPartyTabs';
import { AttributeName, CLASS_META, ClassName, DEFAULT_PARTY_SIZE, MAX_PARTY_SIZE, MIN_PARTY_SIZE, buildParty } from './data/mythiosRulesData';
import { WEEKDAY_INVENTORY } from './data/mythiosChaptersData';
import { HintMask, hintAdd } from './data/fanOutLeads';
import { runMythiosVerifier } from './data/mythiosGatheringsAndAudit';
import { NEW_CONTINUITY_LOOPHOLES } from './data/narrativeContinuityAudit';
import { PartyMemoryDigest } from './data/gmMemoryEngine';

type BottomTab = 'CHAT' | 'RECORD' | 'BAG' | 'STORE';
type ChatChannel = 'MINE' | 'PARTY';
type WorkspaceLayout = 'SPLIT' | 'AUDIT_ONLY' | 'PHONE_ONLY';

// Session Zero step 4 (Core Rules §7): two optional questions that feed the personal stake beside the
// player's name on Meira's list. The three pre-written stakes were removed 15 Oct (Task 13: they invented lore).

const SAVE_STORAGE_KEY = 'mythios_dark_moon_save_v2';

// The mid-season demo (Week 2 · Day 2): the Week 1 fragments already solved, credited round the party.
function demoSolvedWords(names: string[]): Record<string, { w1?: string; w2?: string }> {
  const at = (i: number) => names[i % names.length];
  return {
    '1-1': { w1: at(1), w2: at(0) },
    '1-2': { w1: at(2), w2: at(3) },
    '1-3': { w1: at(1), w2: at(0) },
    '1-4': { w1: at(2), w2: at(1) },
    '1-5': { w1: at(3), w2: at(0) },
    '1-6': { w1: at(1), w2: at(2) },
    '2-1': { w1: at(1) },
    '2-2': { w1: at(2) },
  };
}

interface SavedCampaignState {
  currentWeek: number;
  currentDay: number;
  completedDays: string[];
  characterName?: string;
  partyName?: string;
  meaningPins?: Record<string, Record<string, { name: string; text: string }>>; // fragment meaning pins (Phase 5)
  weekBoard?: Record<number, Record<string, { name: string; entries: { day: number; text: string }[] }>>; // the case so far (Phase 5)
  partySize?: number; // 2 to 6 (Campfire v2.3 §M); saves from before 15 Oct have none and get 4
  characterClass: ClassName;
  secondAttr?: AttributeName;
  stakeIndex?: number; // retired 15 Oct (pre-written stakes removed); old saves may still carry it
  birthplace?: string; // Session Zero: "Where were you born?" (optional)
  grandparentName?: string; // Session Zero: "What was a grandparent's name?" (optional)
  gold: number;
  weaponLevel: number;
  armorLevel: number;
  storeLocked?: boolean; // retired 14 Oct (the Store is never locked); old saves may still carry it
  attributes: Record<AttributeName, number>;
  relics: Record<string, number>;
  solvedWords: Record<string, { w1?: string; w2?: string }>;
  watchPageStrokesLeft: number;
  ledgerOpened: boolean;
  solvedRiddleIds: Record<string, number>;
  seekerFirstLetterHints: Record<string, HintMask>; // which fragment words have a first-letter hint (fanOutLeads.ts)
  sharedFanOutClues: Record<string, { title: string; text: string; firstLetter: string }>;
  stats: Record<string, number>;
  earnedBadgeIds: string[];
  pinnedClues: PinnedPartyClue[];
  partyMessages: string[];
  claimedRewards?: string[];
}

function loadSavedCampaign(): Partial<SavedCampaignState> | null {
  try {
    const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<SavedCampaignState>;
  } catch {
    return null;
  }
}

export default function App() {
  const initialSave = useMemo(() => loadSavedCampaign(), []);

  // The Audit Workbench shows Garrick's hidden meanings, so it is only reachable with ?dev=1 (Task 9).
  const isDevMode =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dev') === '1';
  const [layoutState, setLayout] = useState<WorkspaceLayout>('PHONE_ONLY');
  const layout: WorkspaceLayout = isDevMode ? layoutState : 'PHONE_ONLY';
  // Canonical 4-tab bar: CHAT · RECORD · BAG · STORE + MINE / PARTY pill switch inside CHAT
  const [activeTab, setActiveTab] = useState<BottomTab>('CHAT');
  const [chatChannel, setChatChannel] = useState<ChatChannel>('MINE');
  const [partyMode, setPartyMode] = useState<'CAMPFIRE' | 'GATHERING'>('CAMPFIRE');
  const [showChapterPicker, setShowChapterPicker] = useState<boolean>(false);
  const [topBannerExpanded, setTopBannerExpanded] = useState<boolean>(false);
  const [bagInitialSubTab, setBagInitialSubTab] = useState<'RELICS' | 'SEEKER'>('RELICS');

  // Continuity patches: all retired on 15 Oct (the weekday now plays canon's own text)
  const [appliedLoopholeIds, setAppliedLoopholeIds] = useState<string[]>(() =>
    NEW_CONTINUITY_LOOPHOLES.map((l) => l.id)
  );

  // Start at Week 1 · Day 1 (The Forest Road) at the beginning of Day 1
  const [currentWeek, setCurrentWeek] = useState<number>(initialSave?.currentWeek ?? 1);
  const [currentDay, setCurrentDay] = useState<number>(initialSave?.currentDay ?? 1);
  const [completedDays, setCompletedDays] = useState<string[]>(
    initialSave?.completedDays ?? []
  );

  const [characterName, setCharacterName] = useState<string>(
    initialSave?.characterName ?? 'Jennifer'
  );
  const [characterClass, setCharacterClass] = useState<ClassName>(
    initialSave?.characterClass ?? 'Trickster'
  );
  const [secondAttr, setSecondAttr] = useState<AttributeName>(
    initialSave?.secondAttr ?? 'Agility'
  );
  const [partyName, setPartyName] = useState<string>(
    initialSave?.partyName ?? 'The Iron Lantern'
  );
  const [birthplace, setBirthplace] = useState<string>(initialSave?.birthplace ?? '');
  const [grandparentName, setGrandparentName] = useState<string>(initialSave?.grandparentName ?? '');
  const [weekBoard, setWeekBoard] = useState<
    Record<number, Record<string, { name: string; entries: { day: number; text: string }[] }>>
  >(initialSave?.weekBoard ?? {});
  const [meaningPins, setMeaningPins] = useState<Record<string, Record<string, { name: string; text: string }>>>(
    initialSave?.meaningPins ?? {}
  );
  // The party in play: the player first, then the sample friends (2 to 6; workbench switch).
  const [partySize, setPartySize] = useState<number>(initialSave?.partySize ?? DEFAULT_PARTY_SIZE);
  const party = useMemo(
    () => buildParty(partySize, { name: characterName, cls: characterClass }),
    [partySize, characterName, characterClass]
  );
  const [showHeroSetupModal, setShowHeroSetupModal] = useState<boolean>(false);

  const [gold, setGold] = useState<number>(initialSave?.gold ?? 0); // Core Rules §12: starting gold is 0

  // Each reward is paid once per day and per Gathering, so replaying a day pays nothing.
  const [claimedRewards, setClaimedRewards] = useState<string[]>(initialSave?.claimedRewards ?? []);
  const claimedRewardsRef = useRef<Set<string>>(new Set(initialSave?.claimedRewards ?? []));
  const handleClaimReward = (key: string): boolean => {
    if (claimedRewardsRef.current.has(key)) return false;
    claimedRewardsRef.current.add(key);
    setClaimedRewards(Array.from(claimedRewardsRef.current));
    return true;
  };
  const [weaponLevel, setWeaponLevel] = useState<number>(initialSave?.weaponLevel ?? 1);
  const [armorLevel, setArmorLevel] = useState<number>(initialSave?.armorLevel ?? 1);

  const [attributes, setAttributes] = useState<Record<AttributeName, number>>(
    initialSave?.attributes ?? {
      Charm: 38,
      Agility: 28,
      Intellect: 18,
      Might: 14,
      Craft: 22,
      Aim: 16,
    }
  );

  const [relics, setRelics] = useState<Record<string, number>>(
    initialSave?.relics ?? {
      Charm: 2,
      Might: 1,
      Battle: 1,
      Craft: 0,
      Intellect: 0,
      Agility: 0,
      Aim: 0,
    }
  );

  const [solvedWords, setSolvedWords] = useState<Record<string, { w1?: string; w2?: string }>>(
    initialSave?.solvedWords ?? demoSolvedWords(buildParty(DEFAULT_PARTY_SIZE, { name: 'Jennifer', cls: 'Trickster' }).map((f) => f.name))
  );

  const [watchPageStrokesLeft, setWatchPageStrokesLeft] = useState<number>(
    initialSave?.watchPageStrokesLeft ?? 3
  );
  const [ledgerOpened, setLedgerOpened] = useState<boolean>(initialSave?.ledgerOpened ?? false);
  const [solvedRiddleIds, setSolvedRiddleIds] = useState<Record<string, number>>(
    initialSave?.solvedRiddleIds ?? {}
  );
  // Seeker Fragment 1st-letter placement hints unlocked by passing the Solo Fan-Out beat in MINE
  const [seekerFirstLetterHints, setSeekerFirstLetterHints] = useState<Record<string, HintMask>>(
    initialSave?.seekerFirstLetterHints ?? {
      '1-6': true,
    }
  );
  // Player's solo Fan-Out discoveries shared to the Campfire Party Findings Board (keyed by "week-day")
  const [sharedFanOutClues, setSharedFanOutClues] = useState<
    Record<string, { title: string; text: string; firstLetter: string }>
  >(
    initialSave?.sharedFanOutClues ?? {
      '1-6': {
        title: 'The Upstream Boat',
        text: 'A quarter-mile upstream, a flat-bottomed boat was pulled into the reeds and pushed off again. Two sets of bootprints and one small bare foot got in.',
        firstLetter: 'N',
      },
    }
  );

  const [stats, setStats] = useState<Record<string, number>>(
    initialSave?.stats ?? {
      daysPlayed: 13,
      bestStreak: 6,
      gatheringsAttended: 2,
      fragmentsSolved: 5,
      relicsGiven: 3,
      timesSteppedUp: 1,
      fragmentsMatched: 2,
      battlesWon: 2,
      challengesCleared: 7,
      challengesPressedOn: 2,
      enemiesDefeated: 4,
      perfectRolls: 1,
    }
  );

  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>(
    initialSave?.earnedBadgeIds ?? ['first-light', 'open-hand', 'whole-table', 'perfect']
  );

  const [pinnedClues, setPinnedClues] = useState<PinnedPartyClue[]>(
    initialSave?.pinnedClues ?? []
  );

  const [partyMessages, setPartyMessages] = useState<string[]>(
    initialSave?.partyMessages ?? []
  );

  // Automatic localStorage persistence whenever campaign state changes
  useEffect(() => {
    try {
      const payload: SavedCampaignState = {
        currentWeek,
        currentDay,
        completedDays,
        characterName,
        partyName,
        partySize,
        meaningPins,
        weekBoard,
        characterClass,
        secondAttr,
        birthplace,
        grandparentName,
        gold,
        weaponLevel,
        armorLevel,
        attributes,
        relics,
        solvedWords,
        watchPageStrokesLeft,
        ledgerOpened,
        solvedRiddleIds,
        seekerFirstLetterHints,
        sharedFanOutClues,
        stats,
        earnedBadgeIds,
        pinnedClues,
        partyMessages,
        claimedRewards,
      };
      window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors in restricted frames
    }
  }, [
    currentWeek,
    currentDay,
    completedDays,
    characterName,
    partyName,
    partySize,
    meaningPins,
    weekBoard,
    characterClass,
    secondAttr,
    birthplace,
    grandparentName,
    gold,
    weaponLevel,
    armorLevel,
    attributes,
    relics,
    solvedWords,
    watchPageStrokesLeft,
    ledgerOpened,
    solvedRiddleIds,
    seekerFirstLetterHints,
    sharedFanOutClues,
    stats,
    earnedBadgeIds,
    pinnedClues,
    partyMessages,
    claimedRewards,
  ]);

  // Preset 1: Start Fresh Campaign at Week 1 · Day 1 (The Old Inn) using chosen Class & Second Attribute (30 / 28 / 25 curve)
  const handleStartFreshCampaign = () => {
    const primaryAttr = CLASS_META[characterClass].attribute;
    const baseAttrs: Record<AttributeName, number> = {
      Might: 25,
      Craft: 25,
      Intellect: 25,
      Charm: 25,
      Agility: 25,
      Aim: 25,
    };
    baseAttrs[primaryAttr] = 30;
    if (secondAttr !== primaryAttr) {
      baseAttrs[secondAttr] = 28;
    } else {
      baseAttrs.Agility = primaryAttr === 'Agility' ? 30 : 28;
    }

    setCurrentWeek(1);
    setCurrentDay(1);
    setCompletedDays([]);
    setGold(0); // Core Rules §12: starting gold is 0
    claimedRewardsRef.current = new Set();
    setClaimedRewards([]);
    setWeaponLevel(1);
    setArmorLevel(1);
    setAttributes(baseAttrs);
    setRelics({
      Charm: primaryAttr === 'Charm' ? 1 : 0,
      Might: primaryAttr === 'Might' ? 1 : 0,
      Battle: 0,
      Craft: primaryAttr === 'Craft' ? 1 : 0,
      Intellect: primaryAttr === 'Intellect' ? 1 : 0,
      Agility: primaryAttr === 'Agility' ? 1 : 0,
      Aim: primaryAttr === 'Aim' ? 1 : 0,
    });
    setSolvedWords({});
    setWatchPageStrokesLeft(3);
    setLedgerOpened(false);
    setSolvedRiddleIds({});
    setSeekerFirstLetterHints({});
    setSharedFanOutClues({});
    setStats({
      daysPlayed: 1,
      bestStreak: 1,
      gatheringsAttended: 0,
      fragmentsSolved: 0,
      relicsGiven: 0,
      timesSteppedUp: 0,
      fragmentsMatched: 0,
      battlesWon: 0,
      challengesCleared: 0,
      challengesPressedOn: 0,
      enemiesDefeated: 0,
      perfectRolls: 0,
    });
    setEarnedBadgeIds([]);
    setPinnedClues([]);
    setPartyMessages([]);
    setPartyMode('CAMPFIRE');
    setActiveTab('CHAT');
    setChatChannel('MINE');
  };

  // Preset 2: Restore Canonical Mid-Season Demo State (Week 2 · Day 2 · The Mill)
  const handleRestoreMidSeasonDemo = () => {
    setCurrentWeek(2);
    setCurrentDay(2);
    setCompletedDays(['1-1', '1-2', '1-3', '1-4', '1-5', '1-6']);
    setGold(1240);
    claimedRewardsRef.current = new Set();
    setClaimedRewards([]);
    setWeaponLevel(2);
    setArmorLevel(2);
    setAttributes({
      Charm: 38,
      Agility: 28,
      Intellect: 18,
      Might: 14,
      Craft: 22,
      Aim: 16,
    });
    setRelics({
      Charm: 2,
      Might: 1,
      Battle: 1,
      Craft: 0,
      Intellect: 0,
      Agility: 0,
      Aim: 0,
    });
    setSolvedWords(demoSolvedWords(party.map((f) => f.name)));
    setWatchPageStrokesLeft(3);
    setLedgerOpened(false);
    setSolvedRiddleIds({});
    setSeekerFirstLetterHints({ '1-6': true });
    setSharedFanOutClues({
      '1-6': {
        title: 'The Upstream Boat',
        text: 'A quarter-mile upstream, a flat-bottomed boat was pulled into the reeds and pushed off again. Two sets of bootprints and one small bare foot got in.',
        firstLetter: 'N',
      },
    });
    setStats({
      daysPlayed: 13,
      bestStreak: 6,
      gatheringsAttended: 2,
      fragmentsSolved: 5,
      relicsGiven: 3,
      timesSteppedUp: 1,
      fragmentsMatched: 2,
      battlesWon: 2,
      challengesCleared: 7,
      challengesPressedOn: 2,
      enemiesDefeated: 4,
      perfectRolls: 1,
    });
    setEarnedBadgeIds(['first-light', 'open-hand', 'whole-table', 'perfect']);
    setPinnedClues([]);
    setPartyMessages([]);
    setPartyMode('CAMPFIRE');
    setActiveTab('CHAT');
    setChatChannel('MINE');
  };

  // Live dynamic badge evaluation so RECORD reflects every unlocked achievement in real time
  const computedEarnedBadges = useMemo(() => {
    const set = new Set<string>(earnedBadgeIds);
    const hasWholeWeek = [1, 2, 3, 4, 5, 6].some((w) =>
      [1, 2, 3, 4, 5, 6].every((d) => completedDays.includes(`${w}-${d}`))
    );
    const hasAdeptAttr = Object.values(attributes).some((val) => val >= 51);

    if (completedDays.length >= 1) set.add('first-light');
    if (hasWholeWeek || (stats.daysPlayed || 0) >= 7) set.add('whole-week');
    if ((stats.gatheringsAttended || 0) >= 6 || completedDays.length >= 30) set.add('long-road');
    if (hasAdeptAttr) set.add('sharpened');
    if ((stats.relicsGiven || 0) >= 1) set.add('open-hand');
    if ((stats.relicsGiven || 0) >= 2 && (stats.battlesWon || 0) >= 1) set.add('lifeline');
    if ((stats.gatheringsAttended || 0) >= 1) set.add('whole-table');
    if ((stats.battlesWon || 0) >= 3) set.add('clean-night');
    if ((stats.perfectRolls || 0) >= 1) set.add('perfect');
    if ((stats.challengesPressedOn || 0) >= 3) set.add('never-enough');
    if ((stats.challengesCleared || 0) >= 4) set.add('many-hands');
    if ((stats.enemiesDefeated || 0) >= 5) set.add('down-to-thread');
    return Array.from(set);
  }, [earnedBadgeIds, completedDays, stats, attributes]);

  const [tickerIndex, setTickerIndex] = useState<number>(0);

  // Live rolling Party Memory Digest (~120 tokens) for Layer 4 of the GM Memory Engine
  const [recentRolls, setRecentRolls] = useState<string[]>([]);
  const [relicsGivenLog, setRelicsGivenLog] = useState<string[]>([]);

  const verifier = runMythiosVerifier();

  // The party officially forms on Week 1 · Day 2 (The Hollow Wake Inn) once FIT THE PAGE ('1-2') is resolved,
  // and remains formed on all subsequent days (W1·D3+ and W2+). On W1·D1, the player is strictly solo.
  const isPartyFormed =
    currentWeek > 1 ||
    currentDay >= 3 ||
    (currentWeek === 1 && currentDay === 2 && completedDays.includes('1-2'));

  const handleSelectWeekDay = (w: number, d: number) => {
    setCurrentWeek(w);
    setCurrentDay(d);
    if (w === 1 && d === 1) {
      setCompletedDays((prev) => prev.filter((k) => k !== '1-1' && k !== '1-2'));
      setChatChannel('MINE');
    } else if (w === 1 && d === 2) {
      setCompletedDays((prev) => prev.filter((k) => k !== '1-2'));
      setChatChannel('MINE');
    }
  };

  // Count how many Seeker Chest fragments are half-solved by a teammate and waiting for Jennifer to complete the Matched Pair
  const halfSolvedCount = Object.values(solvedWords).filter(
    (entry) => (entry.w1 && !entry.w2) || (!entry.w1 && entry.w2)
  ).length;

  const liveTickerItems: {
    text: string;
    actionLabel: string;
    onAction: () => void;
  }[] = [
    {
      text: `🔓 ${halfSolvedCount} Seeker ${
        halfSolvedCount === 1 ? 'Fragment awaits' : 'Fragments await'
      } your second lock-word in the Seeker Chest (+${GOLD_FRAGMENT_WORD_SOLVED}g)`,
      actionLabel: 'SOLVE IN BAG →',
      onAction: () => {
        setBagInitialSubTab('SEEKER');
        setActiveTab('BAG');
      },
    },
    isPartyFormed
      ? {
          text: `🔥 Garrick has the kettle on at the W${currentWeek}D${currentDay} Campfire — check tonight's board of clues & theory pins`,
          actionLabel: 'CAMPFIRE →',
          onAction: () => {
            setActiveTab('CHAT');
            setChatChannel('PARTY');
          },
        }
      : {
          text:
            currentWeek === 1 && currentDay === 1
              ? '🌲 Solo on the Forest Road (W1·D1) — Find the list in your cargo box & follow it to The Hollow Wake Inn'
              : '🏠 At The Hollow Wake Inn (W1·D2) — Complete FIT THE PAGE to form your team & unlock Party Chat',
          actionLabel: 'STORY →',
          onAction: () => {
            setActiveTab('CHAT');
            setChatChannel('MINE');
          },
        },
    ...(recentRolls[0]
      ? [
          {
            text: `★ Recent Roll: ${recentRolls[0]}`,
            actionLabel: 'RECORD →',
            onAction: () => setActiveTab('RECORD'),
          },
        ]
      : []),
  ];
  const currentTicker = liveTickerItems[tickerIndex % liveTickerItems.length];

  const memoryDigest: PartyMemoryDigest = {
    partyName,
    activePlayer: characterName,
    playerClass: characterClass,
    personalStakeShort: [birthplace && `born in ${birthplace}`, grandparentName && `grandparent ${grandparentName}`].filter(Boolean).join('; '),
    recentRolls,
    relicsGiven: relicsGivenLog,
    solvedFragmentsCount: stats.fragmentsSolved || 5,
    garrickTopicsAsked: ['Meira notebook', 'The extra cup at the inn', 'Why none of us died'],
    last4ChatTurns: partyMessages.slice(0, 4).map((m) => ({
      speaker: m.split(':')[0] || 'Party',
      line: m.split(':').slice(1).join(':').trim() || m,
    })),
  };

  const handleToggleLoopholeFix = (loopholeId: string) => {
    setAppliedLoopholeIds((prev) =>
      prev.includes(loopholeId) ? prev.filter((id) => id !== loopholeId) : [...prev, loopholeId]
    );
  };

  const handleToggleAllLoopholeFixes = () => {
    setAppliedLoopholeIds((prev) =>
      prev.length === NEW_CONTINUITY_LOOPHOLES.length
        ? []
        : NEW_CONTINUITY_LOOPHOLES.map((l) => l.id)
    );
  };

  const handleRestoreAuditBackup = (backup: AuditBackupRestorePayload) => {
    if (Array.isArray(backup.appliedLoopholeIds)) {
      setAppliedLoopholeIds(backup.appliedLoopholeIds);
    }
    if (backup.partyMemoryDigest) {
      const d = backup.partyMemoryDigest;
      if (Array.isArray(d.recentRolls)) {
        setRecentRolls(d.recentRolls);
      }
      if (Array.isArray(d.relicsGiven)) {
        setRelicsGivenLog(d.relicsGiven);
      }
      if (typeof d.solvedFragmentsCount === 'number') {
        setStats((s) => ({ ...s, fragmentsSolved: d.solvedFragmentsCount as number }));
      }
      if (Array.isArray(d.last4ChatTurns) && d.last4ChatTurns.length > 0) {
        setPartyMessages(d.last4ChatTurns.map((t) => `${t.speaker}: ${t.line}`));
      }
    }
  };

  const handlePinClue = (clue: Omit<PinnedPartyClue, 'id'>) => {
    const newId = `pin-${clue.week}-${clue.day}-${Date.now()}`;
    setPinnedClues((prev) => [{ ...clue, id: newId }, ...prev]);
    setPartyMessages((msgs) => [
      `📌 [Pinned for Campfire & Day 7 by ${clue.author}]: W${clue.week}D${clue.day} ${clue.place} — "${clue.text}"`,
      ...msgs,
    ]);
  };

  const handleSealDay = (week: number, day: number, summaryNote: string) => {
    const key = `${week}-${day}`;
    if (!completedDays.includes(key)) {
      setCompletedDays((prev) => [...prev, key]);
      setStats((s) => ({
        ...s,
        daysPlayed: (s.daysPlayed ?? 0) + 1,
        bestStreak: (s.bestStreak ?? 0) + 1,
      }));
      setPartyMessages((msgs) => [
        `✦ [Landmark Sealed · ${characterName}]: Completed ${summaryNote}`,
        ...msgs,
      ]);
    }
  };

  const handleBuyGear = (track: 'weapon' | 'armor', cost: number) => {
    if (gold < cost) return;
    // Gear tops out at Level 5 (Core Rules §4): never take gold for a step that can't happen.
    if ((track === 'weapon' ? weaponLevel : armorLevel) >= 5) return;
    setGold((g) => g - cost);
    if (track === 'weapon') {
      setWeaponLevel((lv) => Math.min(5, lv + 1));
    } else {
      setArmorLevel((lv) => Math.min(5, lv + 1));
    }
  };

  const handleBuyRelic = (relicType: string, cost: number) => {
    if (gold < cost) return;
    setGold((g) => g - cost);
    setRelics((prev) => ({ ...prev, [relicType]: (prev[relicType] || 0) + 1 }));
  };

  const handleSolveWord = (fragId: string, wordIndex: 1 | 2, solverName: string): boolean => {
    // Each word pays once (Core Rules §6): ignore a word that is already filled.
    const entry = solvedWords[fragId] || {};
    if (entry[wordIndex === 1 ? 'w1' : 'w2']) return false;
    // Core Rules §6: until the fragment's own day ends, a player may fill only one of its two words.
    const otherBy = entry[wordIndex === 1 ? 'w2' : 'w1'];
    if (fragId === `${currentWeek}-${currentDay}` && otherBy && otherBy === solverName) return false;
    setSolvedWords((prev) => {
      const curr = prev[fragId] || {};
      const updated = {
        ...curr,
        [wordIndex === 1 ? 'w1' : 'w2']: solverName,
      };
      const isNowMatched = Boolean(updated.w1 && updated.w2 && updated.w1 !== updated.w2);
      if (isNowMatched) {
        setStats((s) => ({ ...s, fragmentsMatched: (s.fragmentsMatched || 0) + 1 }));
      }
      return {
        ...prev,
        [fragId]: updated,
      };
    });
    setGold((g) => g + GOLD_FRAGMENT_WORD_SOLVED);
    setStats((s) => ({ ...s, fragmentsSolved: (s.fragmentsSolved || 0) + 1 }));
    setPartyMessages((msgs) => [
      `🔓 [Seeker Chest · ${solverName}]: Solved Lock ${wordIndex} on Fragment ${fragId} (+${GOLD_FRAGMENT_WORD_SOLVED}g)!`,
      ...msgs,
    ]);
    return true;
  };

  const handleGiveRelic = (relicType: string, friendName: string) => {
    if ((relics[relicType] || 0) <= 0) return;
    setRelics((prev) => ({ ...prev, [relicType]: Math.max(0, (prev[relicType] || 0) - 1) }));
    setStats((s) => ({ ...s, relicsGiven: (s.relicsGiven || 0) + 1 }));
    setRelicsGivenLog((prev) => [`${characterName} -> ${friendName} (${relicType} Relic)`, ...prev.slice(0, 4)]);
    setPartyMessages((msgs) => [
      `🤝 [Relic Patron]: ${characterName} gifted 1 ${relicType} Relic to ${friendName}!`,
      ...msgs,
    ]);
  };

  const [bundleCopyStatus, setBundleCopyStatus] = useState<string | null>(null);

  const handleDownloadAuditBundle = async () => {
    try {
      setBundleCopyStatus('Downloading 14oct.md...');
      const res = await fetch('/api/download-audit-bundle-14oct?download=1&dev=1');
      if (!res.ok) throw new Error('Failed to fetch bundle');
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'mythios-full-audit-bundle-14oct.md';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 10000);
      setBundleCopyStatus('✓ Downloaded 14oct.md!');
      setTimeout(() => setBundleCopyStatus(null), 3500);
    } catch {
      // Fallback: navigate to direct attachment endpoint
      window.location.assign('/api/download-audit-bundle-14oct?download=1&dev=1');
      setBundleCopyStatus('✓ Triggered download!');
      setTimeout(() => setBundleCopyStatus(null), 3500);
    }
  };

  const handleCopyAuditBundle = async () => {
    try {
      const res = await fetch('/api/download-audit-bundle-14oct?dev=1');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setBundleCopyStatus('✓ Copied 14oct.md to clipboard!');
      setTimeout(() => setBundleCopyStatus(null), 3000);
    } catch {
      setBundleCopyStatus('Copy failed');
    }
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#07050B] text-[#F4F1F8] flex flex-col">
      {/* INTERNAL AUDIT BAR (dev only): Floating corner pill on desktop; tucked inside collapsible top drawer on mobile to save vertical space (#7) */}
      {!isDevMode ? null : layout === 'PHONE_ONLY' ? (
        <div className="hidden sm:flex sm:fixed sm:top-2.5 sm:left-2.5 z-30 items-center gap-1.5">
          <button
            onClick={() => setLayout('SPLIT')}
            className="px-2.5 py-1 rounded-full bg-[#120D1A]/90 border border-white/10 font-['Cinzel'] font-bold text-[10.5px] tracking-[1px] text-[#9E92B2] hover:text-[#E6D3A3] hover:border-[#C2A464]/50 transition whitespace-nowrap"
            title="Open Internal Handoff Audit Workbench"
          >
            ⚙ INTERNAL AUDIT
          </button>
          <a
            href="/api/download-audit-bundle-14oct?download=1&dev=1"
            download="mythios-full-audit-bundle-14oct.md"
            onClick={(e) => {
              e.preventDefault();
              handleDownloadAuditBundle();
            }}
            className="px-2.5 py-1 rounded-full bg-[#1E1232]/95 border border-[#6FD39A]/60 font-['Cinzel'] font-bold text-[10.5px] tracking-[1px] text-[#6FD39A] hover:bg-[#2A1B40] transition whitespace-nowrap cursor-pointer"
            title="Download all codebase files merged into mythios-full-audit-bundle-14oct.md"
          >
            {bundleCopyStatus || '⬇ DOWNLOAD MERGED .MD (14OCT)'}
          </a>
          <button
            type="button"
            onClick={handleCopyAuditBundle}
            className="px-2.5 py-1 rounded-full bg-[#1E1232]/95 border border-[#E5C158]/60 font-['Cinzel'] font-bold text-[10.5px] tracking-[1px] text-[#E5C158] hover:bg-[#2A1B40] transition whitespace-nowrap"
            title="Copy all merged files to your clipboard"
          >
            📋 COPY .MD
          </button>
        </div>
      ) : (
        <header className="px-4 py-2 bg-[#100B18] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="font-['Cinzel'] font-bold text-[12.5px] tracking-[1.5px] text-[#E6D3A3] whitespace-nowrap">
              INTERNAL AUDIT WORKBENCH
            </span>
            <span className="px-2 py-0.5 rounded bg-[#68B88E]/15 border border-[#68B88E]/40 font-['Cinzel'] font-bold text-[10.5px] text-[#68B88E] whitespace-nowrap">
              {verifier.totalWeekdays}/36 LANDMARKS · L1, L3 ACTIVE
            </span>
            <a
              href="/api/download-audit-bundle-14oct?download=1&dev=1"
              download="mythios-full-audit-bundle-14oct.md"
              onClick={(e) => {
                e.preventDefault();
                handleDownloadAuditBundle();
              }}
              className="px-2.5 py-0.5 rounded bg-[#6FD39A]/20 border border-[#6FD39A]/60 font-['Cinzel'] font-bold text-[10.5px] text-[#6FD39A] hover:bg-[#6FD39A]/30 transition whitespace-nowrap cursor-pointer"
            >
              {bundleCopyStatus || '⬇ DOWNLOAD MERGED .MD (14OCT)'}
            </a>
            <button
              type="button"
              onClick={handleCopyAuditBundle}
              className="px-2.5 py-0.5 rounded bg-[#E5C158]/20 border border-[#E5C158]/60 font-['Cinzel'] font-bold text-[10.5px] text-[#E5C158] hover:bg-[#E5C158]/30 transition whitespace-nowrap"
            >
              📋 COPY .MD
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={characterClass}
              onChange={(e) => setCharacterClass(e.target.value as ClassName)}
              className="bg-[#181224] border border-white/10 rounded-[8px] px-2.5 py-1 font-['Cinzel'] font-bold text-[11.5px] text-[#E6D3A3]"
            >
              <option value="Trickster">Class: Trickster (Charm)</option>
              <option value="Warrior">Class: Warrior (Might)</option>
              <option value="Artificer">Class: Artificer (Craft)</option>
              <option value="Sage">Class: Sage (Intellect)</option>
              <option value="Assassin">Class: Assassin (Agility)</option>
              <option value="Archer">Class: Archer (Aim)</option>
            </select>


            <div className="flex rounded-[8px] overflow-hidden border border-white/10">
              <button
                onClick={() => setLayout('PHONE_ONLY')}
                className="px-2.5 py-1 font-['Cinzel'] font-bold text-[10.5px] tracking-[1px] bg-[#181224] text-[#B7A9CC] hover:text-[#F4F1F8] whitespace-nowrap"
              >
                HIDE AUDIT (PLAYER VIEW)
              </button>
              <button
                onClick={() => setLayout('SPLIT')}
                className={`px-2.5 py-1 font-['Cinzel'] font-bold text-[10.5px] tracking-[1px] whitespace-nowrap ${
                  layout === 'SPLIT'
                    ? 'bg-[#C2A464]/25 text-[#E6D3A3]'
                    : 'bg-[#181224] text-[#B7A9CC]'
                }`}
              >
                SPLIT
              </button>
              <button
                onClick={() => setLayout('AUDIT_ONLY')}
                className={`px-2.5 py-1 font-['Cinzel'] font-bold text-[10.5px] tracking-[1px] whitespace-nowrap ${
                  layout === 'AUDIT_ONLY'
                    ? 'bg-[#C2A464]/25 text-[#E6D3A3]'
                    : 'bg-[#181224] text-[#B7A9CC]'
                }`}
              >
                FULL AUDIT
              </button>
            </div>
          </div>
        </header>
      )}

      {/* MAIN WORKSPACE BODY */}
      <main className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT PANE: INTERNAL HANDOFF AUDIT & CONTINUITY LOOPHOLE WORKBENCH */}
        {layout !== 'PHONE_ONLY' && (
          <div className={`${layout === 'SPLIT' ? 'lg:w-[58%] border-r border-white/10' : 'w-full'} h-full min-h-0 flex flex-col overflow-hidden`}>
            <Suspense fallback={null}>
            <AuditWorkbench
              partySize={party.length}
              partyNames={party.map((f) => f.name)}
              onSetPartySize={(n) => setPartySize(Math.min(MAX_PARTY_SIZE, Math.max(MIN_PARTY_SIZE, n)))}
              onJumpToDay={(week, day) => {
                handleSelectWeekDay(week, day);
                setActiveTab('CHAT');
                setChatChannel('MINE');
                if (layout === 'AUDIT_ONLY') setLayout('SPLIT');
              }}
              onJumpToGathering={(week) => {
                setCurrentWeek(week);
                setCompletedDays((prev) =>
                  prev.includes('1-2') ? prev : [...prev, '1-2']
                );
                setActiveTab('CHAT');
                setChatChannel('PARTY');
                if (layout === 'AUDIT_ONLY') setLayout('SPLIT');
              }}
              appliedLoopholeIds={appliedLoopholeIds}
              onToggleLoopholeFix={handleToggleLoopholeFix}
              onToggleAllLoopholeFixes={handleToggleAllLoopholeFixes}
              onRestoreLoopholeIds={(ids) => setAppliedLoopholeIds(ids)}
              onRestoreAuditBackup={handleRestoreAuditBackup}
              memoryDigest={memoryDigest}
            />
            </Suspense>
          </div>
        )}

        {/* RIGHT PANE: 100% PLAYER-FACING 390PX X 844PX MOBILE GAME FRAME */}
        {layout !== 'AUDIT_ONLY' && (
          <div
            className={`${
              layout === 'SPLIT' ? 'lg:w-[42%]' : 'w-full'
            } h-full min-h-0 bg-[#07050B] flex flex-col items-center justify-center p-0 sm:p-2.5 overflow-hidden`}
          >
            {/* 390px ROYAL-PLUM & GOLD PHONE SHELL (Auto-fits browser height on desktop, edge-to-edge full screen on mobile browsers) */}
            <div className="w-full sm:w-[390px] max-w-full h-full sm:max-h-[844px] rounded-none sm:rounded-[28px] bg-[#0D0714] border-0 sm:border border-[#523878] shadow-[0_24px_64px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden relative">
              {/* 1. COMPACT TOP NAVIGATION BAR (4 Main Tabs + Collapsible Title/Ticker/Audit Toggle #7) */}
              <div className="bg-[#150D22] border-b border-[#3D285C] flex items-center justify-between pr-2 shrink-0">
                <nav className="grid grid-cols-4 flex-1">
                  {(
                    [
                      {
                        id: 'CHAT',
                        label: 'CHAT',
                        badge: isPartyFormed ? pinnedClues.length : 0,
                      },
                      { id: 'RECORD', label: 'RECORD', badge: 0 },
                      { id: 'BAG', label: 'BAG', badge: halfSolvedCount },
                      { id: 'STORE', label: 'STORE', badge: 0 },
                    ] as { id: BottomTab; label: string; badge: number }[]
                  ).map((t) => {
                    const isActive = activeTab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          if (t.id === 'BAG') setBagInitialSubTab('RELICS');
                          setActiveTab(t.id);
                        }}
                        className={`relative py-2 flex items-center justify-center gap-1 border-b-2 font-['Cinzel'] font-bold text-[11.5px] tracking-[0.8px] whitespace-nowrap transition ${
                          isActive
                            ? 'border-[#E5C158] text-[#E5C158] bg-[#221536]/75'
                            : 'border-transparent text-[#9E92B2] hover:text-[#DDD5EA]'
                        }`}
                      >
                        <span>{t.label}</span>
                        {t.badge > 0 && (
                          <span className="px-1 py-0.2 rounded-full bg-[#E5C158]/20 border border-[#E5C158]/60 text-[#E5C158] font-['Cinzel'] font-bold text-[9.5px] leading-tight">
                            {t.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                <button
                  type="button"
                  onClick={() => setTopBannerExpanded((prev) => !prev)}
                  title="Tap to expand Title, Ticker & Audit tools"
                  className="ml-1.5 px-2 py-1 rounded-[8px] bg-[#221536] border border-[#E5C158]/55 font-['Cinzel'] font-bold text-[11.5px] text-[#E5C158] whitespace-nowrap tabular-nums shrink-0 hover:border-[#E5C158] flex items-center gap-1"
                >
                  <span>◎ {gold.toLocaleString()}g</span>
                  <span className="text-[9.5px] text-[#D4B876]">
                    {topBannerExpanded ? '▴' : '▾'}
                  </span>
                </button>
              </div>

              {/* 2. COLLAPSIBLE TITLE, AUDIT & TICKER DRAWER (Collapsed by default to maximize vertical space #7) */}
              {topBannerExpanded && (
                <div className="bg-[#120A1D] border-b border-[#3D285C] px-3 py-2 space-y-1.5 shrink-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-['Cinzel'] font-bold text-[12px] tracking-[1.2px] text-[#F4F1F8] truncate">
                        TALES OF THE DARK MOON
                      </span>
                      <span className="font-['Cinzel'] font-bold text-[10.5px] text-[#E5C158] whitespace-nowrap">
                        S1
                      </span>
                    </div>
                    {isDevMode && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setLayout('SPLIT')}
                        className="px-2 py-0.5 rounded bg-[#1E1232] border border-white/15 font-['Cinzel'] font-bold text-[9.5px] text-[#B7A9CC] hover:text-[#E6D3A3] whitespace-nowrap"
                      >
                        ⚙ AUDIT
                      </button>
                      <a
                        href="/api/download-audit-bundle-14oct?download=1&dev=1"
                        download="mythios-full-audit-bundle-14oct.md"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDownloadAuditBundle();
                        }}
                        className="px-2 py-0.5 rounded bg-[#1E1232] border border-[#6FD39A]/60 font-['Cinzel'] font-bold text-[9.5px] text-[#6FD39A] whitespace-nowrap cursor-pointer"
                      >
                        {bundleCopyStatus || '⬇ 14OCT.MD'}
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyAuditBundle}
                        className="px-2 py-0.5 rounded bg-[#1E1232] border border-[#E5C158]/60 font-['Cinzel'] font-bold text-[9.5px] text-[#E5C158] whitespace-nowrap"
                      >
                        📋 COPY
                      </button>
                    </div>
                    )}
                  </div>

                  {/* 1-Line Activity Ticker inside collapsible drawer */}
                  <div className="pt-1 border-t border-[#3D285C]/50 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setTickerIndex((i) => i + 1)}
                      className="text-left text-[12.5px] font-medium text-[#E5C158] truncate flex-1 hover:text-[#F4F1F8]"
                      title="Tap to cycle party updates"
                    >
                      {currentTicker.text}
                    </button>
                    <button
                      onClick={currentTicker.onAction}
                      className="font-['Cinzel'] font-bold text-[10.5px] text-[#6FD39A] whitespace-nowrap shrink-0 hover:underline"
                    >
                      {currentTicker.actionLabel}
                    </button>
                  </div>
                </div>
              )}

              {/* 3. CHAT CHANNEL PILL BAR (MINE / PARTY switch on left + Landmark ▾ on right) */}
              {activeTab === 'CHAT' && (
                <div className="px-3 py-1.5 bg-[#150D22] border-b border-[#3D285C]/70 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center rounded-[14px] bg-[#1E1232] border border-[#4A326C] p-0.5 shrink-0">
                    <button
                      onClick={() => setChatChannel('MINE')}
                      className={`px-3 py-0.5 rounded-[12px] font-['Cinzel'] font-bold text-[11px] tracking-[0.8px] whitespace-nowrap transition ${
                        chatChannel === 'MINE' || !isPartyFormed
                          ? 'bg-[#2E1B42] border border-[#E5C158]/70 text-[#E5C158]'
                          : 'border border-transparent text-[#9E92B2]'
                      }`}
                    >
                      MINE
                    </button>
                    <button
                      type="button"
                      disabled={!isPartyFormed}
                      onClick={() => {
                        if (!isPartyFormed) return;
                        setChatChannel('PARTY');
                      }}
                      title={
                        isPartyFormed
                          ? 'Switch to Party Campfire & Gathering Chat'
                          : 'Locked until your party forms at The Hollow Wake Inn (W1·D2)'
                      }
                      className={`px-3 py-0.5 rounded-[12px] font-['Cinzel'] font-bold text-[11px] tracking-[0.8px] whitespace-nowrap transition flex items-center gap-1 ${
                        !isPartyFormed
                          ? 'border border-transparent text-[#6E6282] opacity-55 cursor-not-allowed'
                          : chatChannel === 'PARTY'
                          ? 'bg-[#2E1B42] border border-[#E5C158]/70 text-[#E5C158]'
                          : 'border border-transparent text-[#9E92B2] hover:text-[#F4F1F8]'
                      }`}
                    >
                      <span>{isPartyFormed ? 'PARTY' : '🔒 PARTY'}</span>
                      {isPartyFormed && (
                        <span className="text-[10px] opacity-85">({pinnedClues.length})</span>
                      )}
                    </button>
                  </div>

                  {/* Single unified "what is happening now" activity button for both MINE & PARTY */}
                  <button
                    onClick={() => setShowChapterPicker((prev) => !prev)}
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-[10px] bg-[#2A1B40] border border-[#7E68B8]/60 hover:border-[#D4B876] transition min-w-0"
                  >
                    <span className="font-['Cinzel'] font-bold text-[11px] text-[#D4B876] whitespace-nowrap">
                      W{currentWeek}·D
                      {chatChannel === 'PARTY' && isPartyFormed && partyMode === 'GATHERING'
                        ? 7
                        : currentDay}
                    </span>
                    <span className="text-[#8B7A9E]">·</span>
                    <span className="font-['Cinzel'] font-bold text-[11.5px] text-[#F4F1F8] truncate max-w-[125px]">
                      {chatChannel === 'PARTY' && isPartyFormed
                        ? partyMode === 'GATHERING'
                          ? 'GATHERING'
                          : 'CAMPFIRE'
                        : (
                            WEEKDAY_INVENTORY.find(
                              (d) => d.week === currentWeek && d.day === currentDay
                            )?.place || 'THE MILL'
                          ).toUpperCase()}
                    </span>
                    <span className="text-[10px] text-[#D4B876] ml-0.5">
                      {showChapterPicker ? '▴' : '▾'}
                    </span>
                  </button>
                </div>
              )}

              {/* CAMPAIGN PRESETS & AUTO-SAVE BAR (Visible when Chapter Picker Drawer is open) */}
              {activeTab === 'CHAT' && showChapterPicker && (
                <div className="px-3 py-2 bg-[#1A102A] border-b border-[#3A2555] space-y-1.5 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="font-['Cinzel'] font-bold text-[10.5px] tracking-[0.8px] text-[#E5C158] uppercase">
                      💾 CAMPAIGN SAVE & QUICK PRESETS
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowHeroSetupModal(true)}
                      className="px-2 py-0.5 rounded bg-[#2A1B40] hover:bg-[#3A2555] border border-[#D4B876]/70 font-['Cinzel'] font-bold text-[10px] text-[#E5C158] transition"
                    >
                      ✎ CUSTOMIZE HERO & PARTY
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={handleStartFreshCampaign}
                      className={`p-2 rounded-lg border text-left transition ${
                        currentWeek === 1 && currentDay === 1 && completedDays.length === 0
                          ? 'bg-[#2A1B40] border-[#6FD39A] text-[#6FD39A]'
                          : 'bg-[#130B1F] hover:bg-[#241638] border-[#3A2555] text-[#F4F1F8]'
                      }`}
                    >
                      <div className="font-['Cinzel'] font-bold text-[10.5px] text-[#6FD39A]">
                        🌱 START FRESH (W1·D1)
                      </div>
                      <div className="font-sans text-[10.5px] text-[#B7A9CC] truncate">
                        The Forest Road · 0g · Solo Start
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={handleRestoreMidSeasonDemo}
                      className={`p-2 rounded-lg border text-left transition ${
                        currentWeek === 2 && currentDay === 2 && completedDays.length === 6
                          ? 'bg-[#2A1B40] border-[#E5C158] text-[#E5C158]'
                          : 'bg-[#130B1F] hover:bg-[#241638] border-[#3A2555] text-[#F4F1F8]'
                      }`}
                    >
                      <div className="font-['Cinzel'] font-bold text-[10.5px] text-[#E5C158]">
                        🔥 MID-SEASON DEMO (W2·D2)
                      </div>
                      <div className="font-sans text-[10.5px] text-[#B7A9CC] truncate">
                        The Mill · 1,240g · W1 Sealed
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* HERO & PARTY CUSTOMIZATION MODAL */}
              {showHeroSetupModal && (
                <div className="absolute inset-0 z-50 bg-[#0D0714]/95 backdrop-blur-sm p-4 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between border-b border-[#3A2555] pb-2.5">
                      <div>
                        <div className="font-['Cinzel'] font-bold text-[14px] text-[#E5C158] tracking-[1px]">
                          ⚔️ HERO & PARTY CREATION
                        </div>
                        <div className="text-[12px] font-sans text-[#B7A9CC]">
                          Customize your name, class, favored attributes, and personal stake
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowHeroSetupModal(false)}
                        className="px-2.5 py-1 rounded-lg bg-[#1E1232] border border-[#3A2555] text-[12px] text-[#B7A9CC] hover:text-[#F4F1F8]"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-['Cinzel'] font-bold text-[10.5px] text-[#D4B876] uppercase mb-1">
                          HERO NAME
                        </label>
                        <input
                          type="text"
                          value={characterName}
                          onChange={(e) => setCharacterName(e.target.value)}
                          maxLength={12}
                          className="w-full px-3 py-2 rounded-xl bg-[#150D22] border border-[#3A2555] text-[14px] font-sans text-[#F4F1F8] focus:outline-none focus:border-[#D4B876]"
                        />
                      </div>
                      <div>
                        <label className="block font-['Cinzel'] font-bold text-[10.5px] text-[#D4B876] uppercase mb-1">
                          PARTY NAME
                        </label>
                        <input
                          type="text"
                          value={partyName}
                          onChange={(e) => setPartyName(e.target.value)}
                          maxLength={20}
                          className="w-full px-3 py-2 rounded-xl bg-[#150D22] border border-[#3A2555] text-[14px] font-sans text-[#F4F1F8] focus:outline-none focus:border-[#D4B876]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-['Cinzel'] font-bold text-[10.5px] text-[#D4B876] uppercase mb-1.5">
                        CHOOSE CLASS (+10 PRIMARY ATTRIBUTE & GEAR)
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(
                          [
                            'Trickster',
                            'Warrior',
                            'Artificer',
                            'Sage',
                            'Assassin',
                            'Archer',
                          ] as ClassName[]
                        ).map((cls) => {
                          const meta = CLASS_META[cls];
                          const selected = characterClass === cls;
                          return (
                            <button
                              key={cls}
                              type="button"
                              onClick={() => setCharacterClass(cls)}
                              className={`p-2.5 rounded-xl border text-left transition ${
                                selected
                                  ? 'bg-[#2A1B40] border-[#E5C158]'
                                  : 'bg-[#150D22] border-[#3A2555] opacity-85 hover:opacity-100'
                              }`}
                            >
                              <div className="font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8] flex items-center justify-between">
                                <span>{cls.toUpperCase()}</span>
                                <span className="text-[10.5px] text-[#E5C158]">
                                  {meta.attribute}
                                </span>
                              </div>
                              <div className="text-[11px] font-sans text-[#B7A9CC] truncate mt-0.5">
                                {meta.weapon} · {meta.armor}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block font-['Cinzel'] font-bold text-[10.5px] text-[#D4B876] uppercase mb-1.5">
                        SECOND FAVORED ATTRIBUTE (+4 HEAD START)
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(
                          ['Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim'] as AttributeName[]
                        ).map((attr) => {
                          const selected = secondAttr === attr;
                          return (
                            <button
                              key={attr}
                              type="button"
                              onClick={() => setSecondAttr(attr)}
                              className={`py-1.5 px-2 rounded-lg border font-['Cinzel'] font-bold text-[11px] transition ${
                                selected
                                  ? 'bg-[#2A1B40] border-[#6FD39A] text-[#6FD39A]'
                                  : 'bg-[#150D22] border-[#3A2555] text-[#B7A9CC]'
                              }`}
                            >
                              {selected ? '✓ ' : ''}
                              {attr}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Session Zero step 4 (Core Rules §7), canon wording; both optional. */}
                    <div className="space-y-2">
                      <label htmlFor="sz-birthplace" className="block font-['Cinzel'] font-bold text-[10.5px] text-[#D4B876] uppercase">
                        Where were you born?
                      </label>
                      <input
                        id="sz-birthplace"
                        value={birthplace}
                        maxLength={30}
                        onChange={(e) => setBirthplace(e.target.value)}
                        className="w-full bg-[#0D0714] border border-[#3A2555] rounded-lg px-2.5 py-1.5 text-[14px] text-[#F4F1F8] focus:outline-none focus:border-[#D4B876]"
                      />
                      <label htmlFor="sz-grandparent" className="block font-['Cinzel'] font-bold text-[10.5px] text-[#D4B876] uppercase">
                        What was a grandparent's name?
                      </label>
                      <input
                        id="sz-grandparent"
                        value={grandparentName}
                        maxLength={20}
                        onChange={(e) => setGrandparentName(e.target.value)}
                        className="w-full bg-[#0D0714] border border-[#3A2555] rounded-lg px-2.5 py-1.5 text-[14px] text-[#F4F1F8] focus:outline-none focus:border-[#D4B876]"
                      />
                      <p className="font-sans italic text-[12px] text-[#B7A9CC]">
                        You can skip these. They only make the story a little more yours.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#3A2555] grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleStartFreshCampaign();
                        setShowHeroSetupModal(false);
                        setShowChapterPicker(false);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-[#6FD39A]/20 hover:bg-[#6FD39A]/30 border border-[#6FD39A] font-['Cinzel'] font-bold text-[11px] text-[#6FD39A] uppercase tracking-[0.6px] transition"
                    >
                      🌱 START W1·D1 WITH HERO
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowHeroSetupModal(false)}
                      className="py-2.5 px-3 rounded-xl bg-[#D4B876]/22 hover:bg-[#D4B876]/32 border border-[#D4B876] font-['Cinzel'] font-bold text-[11px] text-[#F4F1F8] uppercase tracking-[0.6px] transition"
                    >
                      ✓ KEEP CURRENT PROGRESS
                    </button>
                  </div>
                </div>
              )}

              {/* ACTIVE TAB CONTENT */}
              {activeTab === 'CHAT' && (chatChannel === 'MINE' || !isPartyFormed) && (
                <StoryTabView
                  party={party}
                  birthplace={birthplace}
                  grandparentName={grandparentName}
                  onClaimReward={handleClaimReward}
                  hasClaimedReward={(key) => claimedRewardsRef.current.has(key)}
                  currentWeek={currentWeek}
                  currentDay={currentDay}
                  onSelectWeekDay={handleSelectWeekDay}
                  showChapterPicker={showChapterPicker}
                  onSetShowChapterPicker={setShowChapterPicker}
                  characterName={characterName}
                  characterClass={characterClass}
                  attributes={attributes}
                  weaponLevel={weaponLevel}
                  armorLevel={armorLevel}
                  gold={gold}
                  relics={relics}
                  onEarnGold={(amt) => {
                    setGold((g) => Math.max(0, g + amt));
                  }}
                  onGainAttribute={(attr, delta, isNat20) => {
                    setAttributes((prev) => ({ ...prev, [attr]: prev[attr] + delta }));
                    if (isNat20) {
                      setStats((s) => ({ ...s, perfectRolls: (s.perfectRolls ?? 0) + 1 }));
                    }
                    setRecentRolls((prev) => [
                      `W${currentWeek}D${currentDay}: Passed${delta > 0 ? ` (${attr} +${delta})` : ''}`,
                      ...prev.slice(0, 4),
                    ]);
                  }}
                  onGainRelic={(relicType, count) => {
                    setRelics((prev) => ({ ...prev, [relicType]: (prev[relicType] || 0) + count }));
                  }}
                  onUseRelic={(relicType) => {
                    setRelics((prev) => ({
                      ...prev,
                      [relicType]: Math.max(0, (prev[relicType] || 0) - 1),
                    }));
                  }}
                  onTellParty={(clueText) => {
                    setPartyMessages((prev) => [clueText, ...prev]);
                  }}
                  ledgerOpened={ledgerOpened}
                  onOpenLedger={() => setLedgerOpened(true)}
                  appliedLoopholeIds={appliedLoopholeIds}
                  completedDays={completedDays}
                  onSealDay={handleSealDay}
                  pinnedClues={pinnedClues}
                  onPinClue={handlePinClue}
                  onJumpToGathering={(w) => {
                    setCurrentWeek(w);
                    setCompletedDays((prev) =>
                      prev.includes('1-2') ? prev : [...prev, '1-2']
                    );
                    setPartyMode('GATHERING');
                    setActiveTab('CHAT');
                    setChatChannel('PARTY');
                  }}
                  onJumpToCampfire={(w, d) => {
                    setCurrentWeek(w);
                    setCurrentDay(d);
                    setPartyMode('CAMPFIRE');
                    setActiveTab('CHAT');
                    setChatChannel('PARTY');
                  }}
                  onOpenSeekerInBag={(w, d) => {
                    setCurrentWeek(w);
                    setCurrentDay(d);
                    setBagInitialSubTab('SEEKER');
                    setActiveTab('BAG');
                  }}
                  solvedWords={solvedWords}
                  seekerFirstLetterHints={seekerFirstLetterHints}
                  onUnlockSeekerHint={(fragId, word) =>
                    setSeekerFirstLetterHints((prev) => ({ ...prev, [fragId]: hintAdd(prev[fragId], word) }))
                  }
                  sharedFanOutClues={sharedFanOutClues}
                  onShareFanOutClue={(dayKey, payload) => {
                    setSharedFanOutClues((prev) => ({ ...prev, [dayKey]: payload }));
                    setSeekerFirstLetterHints((prev) => ({ ...prev, [dayKey]: true }));
                  }}
                />
              )}

              {activeTab === 'CHAT' && chatChannel === 'PARTY' && isPartyFormed && (
                <PartyTabView
                  party={party}
                  meaningPins={meaningPins}
                  weekBoard={weekBoard}
                  onSetWeekLine={(week, friendId, name, day, text) =>
                    // One line per friend per day: a second save on the same day replaces it; a dated copy is kept per day.
                    setWeekBoard((prev) => {
                      const wk = prev[week] || {};
                      const prevEntries = wk[friendId]?.entries || [];
                      const entries = [...prevEntries.filter((e) => e.day !== day), { day, text }].sort((a, b) => a.day - b.day);
                      return { ...prev, [week]: { ...wk, [friendId]: { name, entries } } };
                    })
                  }
                  onPinMeaning={(fragId, friendId, name, text) =>
                    setMeaningPins((prev) => ({ ...prev, [fragId]: { ...(prev[fragId] || {}), [friendId]: { name, text } } }))
                  }
                  onGainAttribute={(attr, delta) => setAttributes((prev) => ({ ...prev, [attr]: prev[attr] + delta }))}
                  onClaimReward={handleClaimReward}
                  hasClaimedReward={(key) => claimedRewardsRef.current.has(key)}
                  currentWeek={currentWeek}
                  currentDay={currentDay}
                  onSelectWeek={(w) => setCurrentWeek(w)}
                  onSelectWeekDay={handleSelectWeekDay}
                  partyMode={partyMode}
                  onSetPartyMode={setPartyMode}
                  showChapterPicker={showChapterPicker}
                  onSetShowChapterPicker={setShowChapterPicker}
                  partyMessages={partyMessages}
                  onSendPartyMessage={(msg) => setPartyMessages((prev) => [msg, ...prev])}
                  onEarnGold={(amt) => setGold((g) => Math.max(0, g + amt))}
                  onUnlockGatheringBadge={() => {
                    if (!earnedBadgeIds.includes('clean-night')) {
                      setEarnedBadgeIds((prev) => [...prev, 'clean-night']);
                    }
                  }}
                  pinnedClues={pinnedClues}
                  completedDays={completedDays}
                  stats={stats}
                  characterName={characterName}
                  characterClass={characterClass}
                  weaponLevel={weaponLevel}
                  armorLevel={armorLevel}
                  attributes={attributes}
                  solvedWords={solvedWords}
                  onSolveWord={handleSolveWord}
                  onMatchScripture={() =>
                    setStats((s) => ({ ...s, fragmentsMatched: (s.fragmentsMatched ?? 0) + 1 }))
                  }
                  gold={gold}
                  solvedRiddleIds={solvedRiddleIds}
                  onAnswerDailyRiddle={(riddleId, chosenIdx) =>
                    setSolvedRiddleIds((prev) => ({ ...prev, [riddleId]: chosenIdx }))
                  }
                  seekerFirstLetterHints={seekerFirstLetterHints}
                  sharedFanOutClues={sharedFanOutClues}
                  onShareFanOutClue={(dayKey, payload) => {
                    setSharedFanOutClues((prev) => ({ ...prev, [dayKey]: payload }));
                    setSeekerFirstLetterHints((prev) => ({ ...prev, [dayKey]: true }));
                  }}
                  appliedLoopholeIds={appliedLoopholeIds}
                  relics={relics}
                  onGiveRelic={handleGiveRelic}
                  onUseRelic={(relicType) => {
                    setRelics((prev) => ({
                      ...prev,
                      [relicType]: Math.max(0, (prev[relicType] || 0) - 1),
                    }));
                  }}
                  onLeaveFire={() => {
                    setChatChannel('MINE');
                  }}
                />
              )}

              {activeTab === 'BAG' && (
                <BagTabView
                  party={party}
                  gold={gold}
                  relics={relics}
                  solvedWords={solvedWords}
                  onSolveWord={handleSolveWord}
                  onGiveRelic={handleGiveRelic}
                  watchPageStrokesLeft={watchPageStrokesLeft}
                  onStrikeWatchPage={() =>
                    setWatchPageStrokesLeft((s) => (s > 0 ? s - 1 : 3))
                  }
                  ledgerOpened={ledgerOpened}
                  onAskGarrickForLedger={() => setLedgerOpened(true)}
                  completedDays={completedDays}
                  currentWeek={currentWeek}
                  currentDay={currentDay}
                  initialSubTab={bagInitialSubTab}
                  seekerFirstLetterHints={seekerFirstLetterHints}
                />
              )}

              {activeTab === 'STORE' && (
                <StoreTabView
                  gold={gold}
                  characterClass={characterClass}
                  weaponLevel={weaponLevel}
                  armorLevel={armorLevel}
                  relics={relics}
                  currentWeek={currentWeek}
                  onBuyGear={handleBuyGear}
                  onBuyRelic={handleBuyRelic}
                />
              )}

              {activeTab === 'RECORD' && (
                <RecordTabView
                  characterName={characterName}
                  characterClass={characterClass}
                  secondAttr={secondAttr}
                  partyName={partyName}
                  currentWeek={currentWeek}
                  attributes={attributes}
                  weaponLevel={weaponLevel}
                  armorLevel={armorLevel}
                  stats={stats}
                  earnedBadgeIds={computedEarnedBadges}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
