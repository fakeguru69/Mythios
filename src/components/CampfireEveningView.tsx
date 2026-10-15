import React, { useState, useEffect } from 'react';
import { AttributeName, PartyFriend, friendScores } from '../data/mythiosRulesData';
import { SEEKER_FRAGMENTS } from '../data/mythiosFragments';
import { wordLockSecondsLeft, registerWrongWordTry, clearWordTries } from '../data/wordLocks';
import {
  CAMPFIRE_STORED_LINES,
  CampfireEveningTelemetry,
  DayQuestionPin,
  DayTheoryPin,
  FriendId,
  MessageInABottle,
  buildWhatWeDidTodayLines,
  evaluateEveningNoticings,
  getCampfireDayEntry,
  pickRotatedCampfireLine,
  resolveCampfireNudgeText,
} from '../data/campfireDaysData';
import { routeGarrickMessage } from '../data/garrickRouter';
import { CHAPTER_SCRIPTS } from '../data/chapterScripts';
import { FRAGMENT_MEANING_QUESTIONS } from '../data/fragmentMeaningQuestions';
import { WEEK_QUESTIONS } from '../data/weekQuestions';
import { HintMask, hintHas, fanOutLeadsFor } from '../data/fanOutLeads';
import { NarrationBlock, ScriptInline, fillScriptTokens } from './ChapterScriptParts';

export interface CampfireEveningViewProps {
  /** The party in play (2 to 6), the player first. */
  party: PartyFriend[];
  /** One-line answers to a fragment's meaning question, per fragment and friend (read back at the Gathering). */
  meaningPins: Record<string, Record<FriendId, { name: string; text: string }>>;
  onPinMeaning: (fragId: string, friendId: FriendId, name: string, text: string) => void;
  /** The case so far: per week, each friend's one-line theory, dated by day (Fan Out and Campfire proposal §3.3). */
  weekBoard: Record<number, Record<FriendId, { name: string; entries: { day: number; text: string }[] }>>;
  onSetWeekLine: (week: number, friendId: FriendId, name: string, day: number, text: string) => void;
  currentWeek: number;
  currentDay: number;
  characterName: string;
  attributes: Record<AttributeName, number>;
  solvedWords: Record<string, { w1?: string; w2?: string }>;
  /** Returns false when the word can't be taken (already filled, or this friend's one word for today is used). */
  onSolveWord: (fragId: string, wordIndex: 1 | 2, solverName: string) => boolean;
  seekerFirstLetterHints: Record<string, HintMask>;
  /** What each player found at the last light, by day (title and text of the lead's clue). */
  sharedFanOutClues?: Record<string, { title: string; text: string; firstLetter: string }>;
  fanOutBranchesByDay: Record<string, Record<FriendId, 'CHALLENGE' | 'FIGHT' | 'CAMPFIRE'>>;
  onChangeFriendFanOutBranch: (
    dayKey: string,
    friendId: FriendId,
    branch: 'CHALLENGE' | 'FIGHT' | 'CAMPFIRE'
  ) => void;
  theoryPinsByDay: Record<string, Record<string, DayTheoryPin>>;
  onPinTheory: (dayKey: string, pin: DayTheoryPin) => void;
  questionPinsByDay: Record<string, DayQuestionPin[]>;
  onPinQuestion: (dayKey: string, qPin: DayQuestionPin) => void;
  bottleMessagesByDay: Record<string, MessageInABottle | undefined>;
  onLeaveBottleMessage: (dayKey: string, msg: MessageInABottle) => void;
  telemetryByDay: Record<string, CampfireEveningTelemetry>;
  onUpdateTelemetry: (dayKey: string, telemetry: CampfireEveningTelemetry) => void;
  onJumpToGathering: () => void;
  relicGiftedTodayTo?: string | null;
  challengeClearedToday?: boolean;
  bruisedScrapeToday?: boolean;
}

export const CampfireEveningView: React.FC<CampfireEveningViewProps> = ({
  currentWeek,
  currentDay,
  characterName,
  attributes,
  solvedWords,
  onSolveWord,
  seekerFirstLetterHints,
  fanOutBranchesByDay,
  onChangeFriendFanOutBranch,
  theoryPinsByDay,
  onPinTheory,
  questionPinsByDay,
  onPinQuestion,
  bottleMessagesByDay,
  onLeaveBottleMessage,
  telemetryByDay,
  onUpdateTelemetry,
  onJumpToGathering,
  relicGiftedTodayTo = null,
  challengeClearedToday = true,
  bruisedScrapeToday = false,
  party,
  meaningPins,
  onPinMeaning,
  weekBoard,
  onSetWeekLine,
  sharedFanOutClues = {},
}) => {
  const dayKey = `${currentWeek}-${currentDay}`;
  const dayEntry = getCampfireDayEntry(currentWeek, currentDay);
  // The day's Pull (canon's last line of the chapter), read again as the fire is banked: the last thing every friend reads.
  const pullStep = CHAPTER_SCRIPTS.find((c) => c.week === currentWeek && c.day === currentDay)?.steps.find(
    (st) => st.t === 'say' && st.pull
  );
  const pullText =
    pullStep && pullStep.t === 'say'
      ? fillScriptTokens(pullStep.text, {
          friends: party.filter((f) => f.id !== 'YOU').map((f) => f.name),
          partySize: party.length,
        })
      : null;

  const youDisplay = characterName || 'You';
  const partyIds: FriendId[] = party.map((f) => f.id);
  const friendNames: Record<FriendId, string> = Object.fromEntries(
    party.map((f) => [f.id, f.id === 'YOU' ? youDisplay : f.name])
  );
  const friendColors: Record<FriendId, string> = Object.fromEntries(
    party.map((f) => [f.id, f.id === 'YOU' ? '#6FD39A' : f.color])
  );

  // Active real-player seat for testing multi-friend mechanics without AI-scripted friend lines
  const [activeSeat, setActiveSeat] = useState<FriendId>('YOU');
  const [showSeatControls, setShowSeatControls] = useState<boolean>(false);
  // W1D1 is played alone and the party has not met (proposal §3.1): only the player is at that fire.
  const seatedAtStart = (): FriendId[] => (dayEntry.narratedNoGarrick ? ['YOU'] : partyIds);
  const [arrivedFriends, setArrivedFriends] = useState<FriendId[]>(seatedAtStart);
  // A new day, or a smaller or larger party (workbench switch), resets who is at the fire.
  useEffect(() => {
    setArrivedFriends(seatedAtStart());
    if (!partyIds.includes(activeSeat) || dayEntry.narratedNoGarrick) setActiveSeat('YOU');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partyIds.join('|'), dayKey]);
  const [meaningDraft, setMeaningDraft] = useState<string>('');
  const [weekLineDraft, setWeekLineDraft] = useState<string>('');
  const [isPastDawnCutoff, setIsPastDawnCutoff] = useState<boolean>(false);
  const [simBruisedScrape, setSimBruisedScrape] = useState<boolean>(bruisedScrapeToday);
  const [simMissedYesterday, setSimMissedYesterday] = useState<boolean>(false);

  // 8-step Evening Flow state
  const [closerLine, setCloserLine] = useState<string>(() =>
    pickRotatedCampfireLine('closers', youDisplay)
  );
  const [leftFireEarly, setLeftFireEarly] = useState<boolean>(false);

  // Step 1: Message in a bottle input (when alone at the fire)
  const [bottleDraft, setBottleDraft] = useState<string>('');

  // Step 3: Theory Pin & Question Pin drafts
  const [selectedReading, setSelectedReading] = useState<'A' | 'B' | 'NEITHER'>('A');
  const [customTheoryNote, setCustomTheoryNote] = useState<string>('');
  const [questionDraft, setQuestionDraft] = useState<string>('');

  // Step 5: Seeker Fragment word-lock state
  const [seekerSlot, setSeekerSlot] = useState<0 | 1>(0);
  const [seekerTypedIndices, setSeekerTypedIndices] = useState<number[]>([]);
  const [wordLockNotice, setWordLockNotice] = useState<string | null>(null);

  // Step 6: Riddle state (Quiet-day opt-in, 3 tries, Give up, zero gold)
  const [quietRiddleRequested, setQuietRiddleRequested] = useState<boolean>(false);
  const [riddleInput, setRiddleInput] = useState<string>('');
  // §M: one riddle for the whole fire; wrong tries are counted per friend (three each).
  const [riddleTriesBySeat, setRiddleTriesBySeat] = useState<Record<FriendId, number>>({});
  const riddleTries = riddleTriesBySeat[activeSeat] || 0;
  const setRiddleTries = (n: number) => setRiddleTriesBySeat((prev) => ({ ...prev, [activeSeat]: n }));
  const [riddleSolved, setRiddleSolved] = useState<boolean>(false);
  const [riddleGivenUp, setRiddleGivenUp] = useState<boolean>(false);
  const [riddleFeedback, setRiddleFeedback] = useState<string | null>(null);

  // Real-player chat & Garrick stored-router bar (capped at <= 8 Garrick messages per evening)
  const [chatInput, setChatInput] = useState<string>('');
  const [askGarrickMode, setAskGarrickMode] = useState<boolean>(true);
  const [chatFeed, setChatFeed] = useState<
    Array<{ id: string; speaker: string; color: string; text: string; meta?: string }>
  >([]);
  // Garrick's replies to questions, per friend (§M: 8 per friend per evening, 12 in the shared room).
  const [garrickExtraBySeat, setGarrickExtraBySeat] = useState<Record<FriendId, number>>({});
  const garrickExtraMsgs = garrickExtraBySeat[activeSeat] || 0;
  const garrickExtraRoom = Object.values(garrickExtraBySeat).reduce((a, b) => a + b, 0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(145);

  // Reset per-day flow when dayKey changes
  useEffect(() => {
    setLeftFireEarly(false);
    setCloserLine(pickRotatedCampfireLine('closers', friendNames[activeSeat]));
    setQuietRiddleRequested(false);
    setRiddleInput('');
    setRiddleTriesBySeat({});
    setRiddleSolved(false);
    setRiddleGivenUp(false);
    setRiddleFeedback(null);
    setSeekerSlot(0);
    setSeekerTypedIndices([]);
    setChatFeed([]);
    setGarrickExtraBySeat({});
    setElapsedSeconds(145);
  }, [dayKey]);

  // Simple evening duration timer (tracks 2-to-4 minute target window)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => Math.min(240, prev + 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Test default: every sample friend fans out (the test controls can send one straight to the fire).
  const dayBranches: Record<FriendId, 'CHALLENGE' | 'FIGHT' | 'CAMPFIRE'> = {
    ...Object.fromEntries(
      partyIds.map((fid) => [fid, 'CHALLENGE'])
    ),
    ...(fanOutBranchesByDay[dayKey] || {}),
  };

  // The board (approved Fan Out and Campfire proposal): one card per lead, under the names of whoever found it,
  // and "Nobody went to …" for a lead nobody took. The player's card is what they really found at the last light.
  // Prototype stand-in: each sample friend who fanned out takes the day's leads in turn.
  const isW1D1 = currentWeek === 1 && currentDay === 1;
  const dayLeads = fanOutLeadsFor(currentWeek, currentDay, []);
  const myFind = sharedFanOutClues[dayKey];
  const myLeadIdx = myFind ? dayLeads.findIndex((l) => l.clueTitle === myFind.title) : -1;
  const leadFinders: FriendId[][] = dayLeads.map(() => []);
  if (myLeadIdx >= 0) leadFinders[myLeadIdx].push('YOU');
  const friendLeadIdx: Record<FriendId, number> = {};
  if (!isW1D1) {
    partyIds
      .filter((fid) => fid !== 'YOU')
      .forEach((fid, i) => {
        if (dayBranches[fid] === 'CAMPFIRE' || !dayLeads.length) return;
        const li = (i + currentDay) % dayLeads.length;
        friendLeadIdx[fid] = li;
        leadFinders[li].push(fid);
      });
  }
  const clueContributors = partyIds.filter((fid) => leadFinders.some((f) => f.includes(fid)));
  const dayOneFind = sharedFanOutClues['1-1'];

  const dayTheoryPins = theoryPinsByDay[dayKey] || {};
  const w1d1TheoryPins = theoryPinsByDay['1-1'] || {};
  const dayQuestionPins = questionPinsByDay[dayKey] || [];
  const bottleMessage = bottleMessagesByDay[dayKey];

  const activeSeatPin = dayTheoryPins[activeSeat];
  // Pin-before-peek rule: active friend must pin their own reading first (or 5:00am cutoff passed)
  const canPeekOtherPins = Boolean(activeSeatPin) || isPastDawnCutoff;

  // Dynamic {friend:Attribute} nudge resolution
  // Campfire v2.3 §M: the nudge picks from friends at the fire, and rotates (yesterday's friend sits out).
  const prevDayKey = currentDay > 1 ? `${currentWeek}-${currentDay - 1}` : null;
  const friendsAtFire = party
    .filter((f) => arrivedFriends.includes(f.id))
    .map((f) => ({ id: f.id, name: friendNames[f.id], scores: friendScores(f.id, attributes) }));
  const lastNudged = (() => {
    if (!prevDayKey) return null;
    const prev = getCampfireDayEntry(currentWeek, currentDay - 1);
    return prev ? resolveCampfireNudgeText(prev.nudge, friendsAtFire).targetFriend : null;
  })();
  const nudgeResolved = resolveCampfireNudgeText(dayEntry.nudge, friendsAtFire, lastNudged);

  // Active Seeker Fragment for Step 5
  const activeFragment =
    SEEKER_FRAGMENTS.find((f) => f.week === currentWeek && f.day === currentDay) ||
    SEEKER_FRAGMENTS[0];
  const activeFragSolved = solvedWords[activeFragment.id] || {};
  const fragSolvedState: [boolean, boolean] = [
    Boolean(activeFragSolved.w1),
    Boolean(activeFragSolved.w2),
  ];
  // A first-letter hint helps one word: the player's comes from their Fan Out lead; a sample friend who
  // fanned out stands in with word 1.
  const seatHasHint = (word: 1 | 2) =>
    activeSeat === 'YOU'
      ? hintHas(seekerFirstLetterHints[dayKey], word)
      : friendLeadIdx[activeSeat] !== undefined && dayLeads[friendLeadIdx[activeSeat]]?.hintFor === word;
  const activeSeatHasFirstLetterHint = seatHasHint(1) || seatHasHint(2);

  // Evaluate at most 2 true Noticing lines for Step 1
  const notYetArrivedNames = partyIds
    .filter((fid) => !arrivedFriends.includes(fid))
    .map((fid) => friendNames[fid]);

  const firstFragSolver =
    activeFragSolved.w1 || activeFragSolved.w2 || null;

  const noticingLines = dayEntry.narratedNoGarrick
    ? []
    : evaluateEveningNoticings({
        bruisedScrapeFriend: simBruisedScrape ? friendNames[activeSeat] : null,
        solvedFragmentFirstFriend: firstFragSolver,
        lentRelicFriend: relicGiftedTodayTo ? youDisplay : null,
        missedYesterdayFriend: simMissedYesterday ? friendNames[activeSeat] : null,
        notYetArrivedFriends: notYetArrivedNames,
      });

  // Catch-up line when arriving after another friend who already pinned a theory
  const otherPinnedList = Object.values(dayTheoryPins).filter(
    (p) => p.friendId !== activeSeat
  );
  // Campfire v2.3 §M: name at most two earlier friends (newest first); more than that, "The rest are on the board."
  const catchUpLine =
    !dayEntry.narratedNoGarrick && otherPinnedList.length > 0
      ? [...otherPinnedList]
          .reverse()
          .slice(0, 2)
          .map((p) =>
            CAMPFIRE_STORED_LINES.catchUpTemplate.replace('{friend}', p.friendName).replace('{reading}', p.readingText)
          )
          .join(' ') + (otherPinnedList.length > 2 ? ' The rest are on the board.' : '')
      : null;

  // Unread Question Pin from an earlier friend read aloud by Garrick without answering
  const questionFromOther = dayQuestionPins.find(
    (qp) => qp.authorId !== activeSeat
  );

  // Count Garrick messages this friend has seen this evening (at most 8 per friend); the room as a whole
  // gets at most 12 (the shared posts once, plus every friend's answered questions).
  const baseGarrickCount = dayEntry.narratedNoGarrick
    ? 0
    : Math.min(
        8,
        1 + // Opener
          (noticingLines.length > 0 ? 1 : 0) +
          (activeSeatPin ? 1 : 0) +
          1 + // Callback
          (dayEntry.riddle && (dayEntry.tone === 'wry' || quietRiddleRequested) ? 1 : 0) +
          (leftFireEarly ? 1 : 0) +
          (fragSolvedState[0] && fragSolvedState[1] ? 1 : 0) + // reading the finished fragment
          garrickExtraMsgs
      );
  const roomGarrickCount = dayEntry.narratedNoGarrick ? 0 : baseGarrickCount - garrickExtraMsgs + garrickExtraRoom;
  const garrickCapReached = baseGarrickCount >= 8 || roomGarrickCount >= 12;

  // Sync telemetry to parent Season Tracker
  const commitTelemetry = (overrides?: Partial<CampfireEveningTelemetry>) => {
    const prev = telemetryByDay[dayKey];
    const next: CampfireEveningTelemetry = {
      dayId: dayKey,
      friendsAttended: arrivedFriends,
      pinsCount: Object.keys(dayTheoryPins).length,
      questionsPinnedCount: dayQuestionPins.length,
      riddleTries,
      riddleSolved,
      riddleGivenUp,
      durationSeconds: elapsedSeconds,
      garrickMessagesSent: Math.min(8, baseGarrickCount),
      leaveFireTaps: prev?.leaveFireTaps ?? 0,
      ...overrides,
    };
    onUpdateTelemetry(dayKey, next);
  };

  const handleLeaveTheFire = () => {
    const rotated = pickRotatedCampfireLine('closers', friendNames[activeSeat]);
    setCloserLine(rotated);
    setLeftFireEarly(true);
    document.getElementById('campfire-leaving')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const prevTaps = telemetryByDay[dayKey]?.leaveFireTaps ?? 0;
    commitTelemetry({ leaveFireTaps: prevTaps + 1 });
  };

  const handleSubmitTheoryPin = () => {
    if (isPastDawnCutoff) return;
    const readingText =
      selectedReading === 'A'
        ? dayEntry.forkA
        : selectedReading === 'B'
        ? dayEntry.forkB
        : customTheoryNote.trim() || 'Neither reading fits all the marks yet.';
    const ack = dayEntry.narratedNoGarrick
      ? 'Noted on your list.'
      : pickRotatedCampfireLine('theoryPinAcks', friendNames[activeSeat]);

    const newPin: DayTheoryPin = {
      friendId: activeSeat,
      friendName: friendNames[activeSeat],
      reading: selectedReading,
      readingText,
      customLine: customTheoryNote.trim() || undefined,
      timestamp: 'Tonight',
      fromPrivatePrompt: false,
      storedAck: ack,
    };
    onPinTheory(dayKey, newPin);
    setCustomTheoryNote('');
    commitTelemetry({
      pinsCount: Object.keys(dayTheoryPins).length + (dayTheoryPins[activeSeat] ? 0 : 1),
    });
  };

  const handleSubmitQuestionPin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = questionDraft.trim();
    if (!trimmed || isPastDawnCutoff) return;
    const newQ: DayQuestionPin = {
      id: `q-${dayKey}-${Date.now()}`,
      authorId: activeSeat,
      authorName: friendNames[activeSeat],
      questionText: trimmed.endsWith('?') ? trimmed : `${trimmed}?`,
      timestamp: 'Pinned tonight',
      readToNextArrival: true,
    };
    onPinQuestion(dayKey, newQ);
    setQuestionDraft('');
    commitTelemetry({
      questionsPinnedCount: dayQuestionPins.length + 1,
    });
  };

  const handleSubmitBottleMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = bottleDraft.trim();
    if (!trimmed) return;
    onLeaveBottleMessage(dayKey, {
      authorId: activeSeat,
      authorName: friendNames[activeSeat],
      text: trimmed,
      timestamp: 'Left while alone at the fire',
    });
    setBottleDraft('');
  };

  const handleTapSeekerTile = (idx: number) => {
    if (seekerTypedIndices.includes(idx)) return;
    const wordIndex: 1 | 2 = seekerSlot === 0 ? 1 : 2;
    const waitSecs = wordLockSecondsLeft(activeFragment.id, wordIndex);
    if (waitSecs > 0) {
      setWordLockNotice(`Too many wrong tries. Try this word again in ${waitSecs} seconds.`);
      setSeekerTypedIndices([]);
      return;
    }
    setWordLockNotice(null);
    const targetWord = seekerSlot === 0 ? activeFragment.word1 : activeFragment.word2;
    const jumbleArr =
      seekerSlot === 0 ? activeFragment.jumble1 : activeFragment.jumble2;
    const next = [...seekerTypedIndices, idx];
    const formed = next.map((i) => jumbleArr[i]).join('');
    if (formed.length === targetWord.length) {
      if (formed.toLowerCase() === targetWord.toLowerCase()) {
        clearWordTries(activeFragment.id, wordIndex);
        if (!onSolveWord(activeFragment.id, wordIndex, friendNames[activeSeat])) {
          setWordLockNotice('Until today ends, each friend fills one of its two words. Leave the other for a friend.');
        }
        setSeekerTypedIndices([]);
      } else {
        const lockSecs = registerWrongWordTry(activeFragment.id, wordIndex);
        if (lockSecs > 0) {
          setWordLockNotice(`Five wrong tries. Try this word again in ${lockSecs} seconds.`);
        }
        setTimeout(() => setSeekerTypedIndices([]), 320);
      }
    } else {
      setSeekerTypedIndices(next);
    }
  };

  const handleSubmitRiddleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayEntry.riddle || riddleSolved || riddleGivenUp) return;
    if (riddleTries >= dayEntry.riddle.maxTries) {
      setRiddleFeedback(`${friendNames[activeSeat]} has spent three tries. The others can still answer.`);
      return;
    }
    const cleaned = riddleInput
      .trim()
      .toLowerCase()
      .replace(/[.!,?]/g, '');
    if (!cleaned) return;

    const nextTries = riddleTries + 1;
    setRiddleTries(nextTries);

    const isMatch = dayEntry.riddle.accept.some(
      (acc) => acc.toLowerCase().replace(/[.!,?]/g, '') === cleaned
    );

    if (isMatch) {
      setRiddleSolved(true);
      setRiddleFeedback(null);
      commitTelemetry({ riddleTries: nextTries, riddleSolved: true });
    } else if (nextTries >= dayEntry.riddle.maxTries) {
      // A friend who has spent three tries is out; the answer comes once everyone at the fire is out.
      const othersStillIn = arrivedFriends.some(
        (fid) => fid !== activeSeat && (riddleTriesBySeat[fid] || 0) < dayEntry.riddle!.maxTries
      );
      if (othersStillIn) {
        setRiddleFeedback(`${friendNames[activeSeat]} has spent three tries. The others can still answer.`);
        commitTelemetry({ riddleTries: nextTries });
      } else {
        setRiddleGivenUp(true);
        setRiddleFeedback('Three tries spent — Garrick gives the answer:');
        commitTelemetry({ riddleTries: nextTries, riddleGivenUp: true });
      }
    } else {
      setRiddleFeedback(
        `Not quite (${nextTries}/${dayEntry.riddle.maxTries} tries). Try another guess or tap Give up.`
      );
      commitTelemetry({ riddleTries: nextTries });
    }
    setRiddleInput('');
  };

  const handleGiveUpRiddle = () => {
    if (!dayEntry.riddle || riddleSolved || riddleGivenUp) return;
    setRiddleGivenUp(true);
    setRiddleFeedback('You tapped Give up — Garrick gives the answer:');
    commitTelemetry({ riddleGivenUp: true });
  };

  // Day 6 Weekly Pin Revisit: picks up to 2 pins from earlier days in the current week
  const earlierWeekPins: { dayId: string; pin: DayTheoryPin }[] = [];
  if (currentDay === 6) {
    for (let d = 1; d <= 5; d++) {
      const k = `${currentWeek}-${d}`;
      const pinsForD = theoryPinsByDay[k];
      if (pinsForD) {
        for (const p of Object.values(pinsForD)) {
          if (earlierWeekPins.length < 2) {
            earlierWeekPins.push({ dayId: k, pin: p });
          }
        }
      }
    }
  }

  const factualTodayLines = buildWhatWeDidTodayLines({
    dayEntry,
    party: party.map((f) => ({ id: f.id, name: friendNames[f.id] })),
    arrivedFriends,
    clueContributors,
    solvedWord1By: activeFragSolved.w1,
    solvedWord2By: activeFragSolved.w2,
    relicGiftedByYouTo: relicGiftedTodayTo,
    challengeClearedByYou: challengeClearedToday,
    bruisedScrapeByYou: simBruisedScrape,
  });

  const handleSendChatOrAskGarrick = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const senderName = friendNames[activeSeat];
    const senderColor = friendColors[activeSeat];

    const nextFeed = [
      ...chatFeed,
      {
        id: `msg-${Date.now()}`,
        speaker: senderName.toUpperCase(),
        color: senderColor,
        text: trimmed,
        meta: askGarrickMode && !dayEntry.narratedNoGarrick ? 'To Garrick' : 'To Party',
      },
    ];

    if (askGarrickMode && !dayEntry.narratedNoGarrick) {
      if (!garrickCapReached) {
        const routed = routeGarrickMessage(trimmed, {
          episode: currentWeek,
          day: currentDay,
          // The ledger is opened at Gathering 2.
          ledgerOpened: currentWeek > 2,
          prisonerHeld: currentWeek === 4 && currentDay === 1,
          prisonerAskedLeader: currentWeek >= 4,
          allFourChildrenHome: currentWeek >= 5,
          verseOfFourRead: currentWeek >= 4,
          atHighwall: currentWeek >= 5,
          ep6RevealLanded: false,
          atCampfire: true,
        });
        nextFeed.push({
          id: `garrick-${Date.now() + 1}`,
          speaker: 'GARRICK · INNKEEPER',
          color: '#F0A552',
          text: routed.reply,
          meta: undefined,
        });
        setGarrickExtraBySeat((prev) => ({ ...prev, [activeSeat]: (prev[activeSeat] || 0) + 1 }));
      } else {
        nextFeed.push({
          id: `garrick-cap-${Date.now() + 1}`,
          speaker: 'GARRICK · INNKEEPER',
          color: '#F0A552',
          text: pickRotatedCampfireLine('closers', senderName),
          meta: undefined,
        });
      }
    }

    setChatFeed(nextFeed);
    setChatInput('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0D0714] text-[#F4F1F8]">
      {/* =====================================================================
          PERSISTENT CAMPFIRE HEADER (With Always-Visible "Leave the fire" Button)
         ===================================================================== */}
      <div className="px-3.5 py-2.5 bg-[#150D22] border-b border-[#3A2555] flex items-center justify-between gap-2 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-['Cinzel'] font-bold tracking-[0.8px] text-[#D4B876]">
            <span>
              W{currentWeek}·D{currentDay}
            </span>
            <span>·</span>
            <span className="text-[#F4F1F8] truncate">{dayEntry.place}</span>
          </div>
          <div className="text-[11.5px] font-sans text-[#B7A9CC] flex items-center gap-2 mt-0.5">
            <span>
              Seat: <strong className="text-[#F4F1F8]">{friendNames[activeSeat]}</strong>
            </span>
            <span>·</span>
            <button
              type="button"
              onClick={() => setShowSeatControls((prev) => !prev)}
              className="text-[#D4B876] hover:underline font-medium"
            >
              {showSeatControls ? 'Hide Party Controls ▴' : 'Party Seat & Test Controls ▾'}
            </button>
          </div>
        </div>

        {/* ALWAYS-VISIBLE LEAVE THE FIRE BUTTON */}
        <button
          type="button"
          onClick={handleLeaveTheFire}
          className="px-3 py-1.5 rounded-lg bg-[#2A1B40] hover:bg-[#3A2555] border border-[#D4B876] font-['Cinzel'] font-bold text-[11px] tracking-[0.6px] text-[#F0A552] hover:text-[#F4F1F8] transition whitespace-nowrap shrink-0"
        >
          Leave the fire
        </button>
      </div>

      {/* =====================================================================
          COLLAPSIBLE PARTY SEAT & MULTI-FRIEND STATE SWITCHER (For Testing Real Friends)
         ===================================================================== */}
      {showSeatControls && (
        <div className="px-3.5 py-2.5 bg-[#120A1D] border-b border-[#3A2555] space-y-2 shrink-0 text-[12px]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-['Cinzel'] font-bold text-[10.5px] tracking-[0.8px] text-[#D4B876] uppercase">
              ACT AS REAL FRIEND SEAT (NO SCRIPTED AI REPLIES):
            </span>
            <button
              type="button"
              onClick={onJumpToGathering}
              className="text-[11px] font-['Cinzel'] font-bold text-[#E5C158] hover:underline"
            >
              View Day 7 Gathering Board Readout →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {partyIds.map((fid) => {
              const isSelected = activeSeat === fid;
              const hasPinned = Boolean(dayTheoryPins[fid]);
              return (
                <button
                  key={fid}
                  type="button"
                  onClick={() => {
                    setActiveSeat(fid);
                    if (!arrivedFriends.includes(fid)) {
                      setArrivedFriends((prev) => [...prev, fid]);
                    }
                  }}
                  className={`py-1.5 px-2 rounded-lg border font-['Cinzel'] font-bold text-[11px] transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#2A1B40] border-[#D4B876] text-[#F4F1F8]'
                      : 'bg-[#150D22] border-[#3A2555] text-[#B7A9CC]'
                  }`}
                >
                  <span className="truncate">{friendNames[fid]}</span>
                  <span className="text-[10px] text-[#6FD39A]">
                    {hasPinned ? '📌' : ''}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Arrival & Fan-Out Branch Toggles for Testing Alone-at-Fire and Clue Board */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#3A2555]/60">
            <div className="space-y-1">
              <div className="text-[10.5px] font-['Cinzel'] font-bold text-[#B7A9CC] uppercase">
                Arrived at Fire ({arrivedFriends.length}/{partyIds.length}):
              </div>
              <div className="flex flex-wrap gap-1">
                {partyIds.map((fid) => {
                  const here = arrivedFriends.includes(fid);
                  return (
                    <button
                      key={fid}
                      type="button"
                      onClick={() => {
                        if (here && arrivedFriends.length > 1) {
                          setArrivedFriends((prev) => prev.filter((x) => x !== fid));
                        } else if (!here) {
                          setArrivedFriends((prev) => [...prev, fid]);
                        }
                      }}
                      className={`px-2 py-0.5 rounded border text-[11px] font-sans ${
                        here
                          ? 'bg-[#1E1232] border-[#6FD39A]/60 text-[#6FD39A]'
                          : 'bg-[#0D0714] border-[#3A2555] text-[#8B7A9E]'
                      }`}
                    >
                      {here ? '✓ ' : '+ '}
                      {friendNames[fid]}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setArrivedFriends([activeSeat])}
                  className="px-2 py-0.5 rounded border border-[#F0A552]/60 bg-[#1E1232] text-[11px] text-[#F0A552]"
                  title="Test Acceptance Test 7: Alone at the fire"
                >
                  Solo Only
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10.5px] font-['Cinzel'] font-bold text-[#B7A9CC] uppercase">
                Evening Flags & Cutoff:
              </div>
              <div className="text-[11px] font-sans text-[#B7A9CC] tabular-nums">
                Garrick messages: {baseGarrickCount}/8 · room {roomGarrickCount}/12
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setIsPastDawnCutoff((p) => !p)}
                  className={`px-2 py-0.5 rounded border text-[11px] ${
                    isPastDawnCutoff
                      ? 'bg-[#2A1B40] border-[#E5C158] text-[#E5C158]'
                      : 'bg-[#0D0714] border-[#3A2555] text-[#B7A9CC]'
                  }`}
                >
                  {isPastDawnCutoff ? '✓ 5:00am Cutoff Locked' : '5:00am Cutoff Off'}
                </button>
                <button
                  type="button"
                  onClick={() => setSimBruisedScrape((p) => !p)}
                  className={`px-2 py-0.5 rounded border text-[11px] ${
                    simBruisedScrape
                      ? 'bg-[#2A1B40] border-[#E0645C] text-[#E0645C]'
                      : 'bg-[#0D0714] border-[#3A2555] text-[#B7A9CC]'
                  }`}
                >
                  {simBruisedScrape ? '✓ Bruised Scrape' : 'Bruised Scrape'}
                </button>
                <button
                  type="button"
                  onClick={() => setSimMissedYesterday((p) => !p)}
                  className={`px-2 py-0.5 rounded border text-[11px] ${
                    simMissedYesterday
                      ? 'bg-[#2A1B40] border-[#6FD39A] text-[#6FD39A]'
                      : 'bg-[#0D0714] border-[#3A2555] text-[#B7A9CC]'
                  }`}
                >
                  {simMissedYesterday ? '✓ Back After Missed Day' : 'Missed Day'}
                </button>
              </div>
            </div>
          </div>

          {/* Per-friend Fan Out branch selector to test Challenge === Fight clue vs Head to Campfire = none */}
          <div className="pt-1 border-t border-[#3A2555]/60 flex items-center justify-between gap-2">
            <span className="text-[11px] text-[#B7A9CC]">
              {friendNames[activeSeat]} at the last light:
            </span>
            <div className="flex items-center gap-1">
              {(['CHALLENGE', 'CAMPFIRE'] as const).map((b) => {
                const activeB = dayBranches[activeSeat] === b;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => onChangeFriendFanOutBranch(dayKey, activeSeat, b)}
                    className={`px-2 py-0.5 rounded border text-[10.5px] font-['Cinzel'] font-bold ${
                      activeB
                        ? 'bg-[#2A1B40] border-[#D4B876] text-[#F4F1F8]'
                        : 'bg-[#0D0714] border-[#3A2555] text-[#8B7A9E]'
                    }`}
                  >
                    {b === 'CAMPFIRE' ? 'Straight to the fire' : 'Followed a lead'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MAIN SCROLLABLE EVENING SCENE BODY
         ===================================================================== */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3.5 py-3.5 space-y-3.5">
        {/* -------------------------------------------------------------------
            STEP 1: OPENER (+ CUP NIGHT STAGE DIRECTION, NOTICING, ALONE BOTTLE)
           ------------------------------------------------------------------- */}
        <div
          className={`rounded-xl border p-3.5 space-y-2.5 transition bg-[#150D22] border-[#3A2555]/80`}
        >
          <div className="flex items-center justify-between text-[11px] font-['Cinzel'] font-bold tracking-[0.8px]">
            <span className="text-[#F0A552] uppercase">
              {dayEntry.narratedNoGarrick
                ? 'ARRIVING · THE FIRE'
                : 'ARRIVING · GARRICK'}
            </span>
            <span className="text-[#B7A9CC]">
              {arrivedFriends.length === 1
                ? 'First at the fire'
                : `${arrivedFriends.length}/${partyIds.length} friends by the fire`}
            </span>
          </div>

          {/* Cup Night Action-Only Stage Direction (8 nights: W1D2, W1D6, W2D1, W2D6, W3D4, W4D2, W5D4, W6D6) */}
          {dayEntry.cupNight && !dayEntry.narratedNoGarrick && (
            <div className="p-2.5 rounded-lg bg-[#130B1F] border border-[#D4B876]/45 text-[14px] font-['Cormorant_Garamond'] italic text-[#E5C158] leading-snug">
              {CAMPFIRE_STORED_LINES.cupNightStageDirection}
            </div>
          )}

          {/* First to arrive greeting */}
          {!dayEntry.narratedNoGarrick && arrivedFriends.length === 1 && (
            <p className="font-['Cormorant_Garamond'] text-[18px] text-[#F4E8C1] leading-snug">
              “{CAMPFIRE_STORED_LINES.firstArrivalGreeting}”
            </p>
          )}

          {/* Canonical Stored Opener */}
          <p className="font-['Cormorant_Garamond'] font-medium text-[19.5px] text-[#F4F1F8] leading-[1.5]">
            {dayEntry.narratedNoGarrick ? dayEntry.opener : `“${dayEntry.opener}”`}
          </p>

          {/* Max 2 True Noticing Templates */}
          {noticingLines.length > 0 && (
            <div className="pt-1.5 border-t border-white/[0.08] space-y-1">
              {noticingLines.map((nLine, idx) => (
                <p
                  key={idx}
                  className="font-['Cormorant_Garamond'] text-[17.5px] text-[#D8CEE8] leading-snug"
                >
                  “{nLine}”
                </p>
              ))}
            </div>
          )}

          {/* Catch-up line if another friend already pinned */}
          {catchUpLine && (
            <div className="p-2.5 rounded-lg bg-[#130B1F] border border-[#3A2555] text-[14px] font-sans text-[#E6E0F0]">
              <span className="font-['Cinzel'] font-bold text-[10.5px] text-[#F0A552] uppercase block mb-0.5">
                GARRICK · CATCH-UP
              </span>
              “{catchUpLine}”
            </div>
          )}

          {/* Unanswered Question Pin from an earlier friend */}
          {questionFromOther && !dayEntry.narratedNoGarrick && (
            <div className="p-2.5 rounded-lg bg-[#130B1F] border border-[#5BC0EB]/50 text-[14px] font-sans text-[#E6E0F0]">
              <span className="font-['Cinzel'] font-bold text-[10.5px] text-[#5BC0EB] uppercase block mb-0.5">
                GARRICK READS {questionFromOther.authorName.toUpperCase()}’S QUESTION PIN
              </span>
              “{questionFromOther.authorName} left a question on the board:{' '}
              <em>{questionFromOther.questionText}</em>”
            </div>
          )}

          {/* Message in a bottle delivered to the next arriving friend */}
          {bottleMessage && bottleMessage.authorId !== activeSeat && (
            <div className="p-2.5 rounded-lg bg-[#130B1F] border border-[#6FD39A]/50 text-[13.5px] font-sans text-[#E6E0F0]">
              <span className="font-['Cinzel'] font-bold text-[10.5px] text-[#6FD39A] uppercase block mb-0.5">
                MESSAGE ON THE BOARD FROM {bottleMessage.authorName.toUpperCase()}
              </span>
              “{bottleMessage.text}”
            </div>
          )}

          {/* Alone at the fire: Message in a bottle prompt */}
          {arrivedFriends.length === 1 && !dayEntry.narratedNoGarrick && (
            <form
              onSubmit={handleSubmitBottleMessage}
              className="pt-2 border-t border-white/[0.08] space-y-1.5"
            >
              <div className="text-[12.5px] font-sans text-[#F0A552]">
                Garrick: “{CAMPFIRE_STORED_LINES.messageInABottlePrompt}”
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={bottleDraft}
                  onChange={(e) => setBottleDraft(e.target.value)}
                  placeholder={`Leave a one-line note as ${friendNames[activeSeat]} for the next friend...`}
                  className="flex-1 bg-[#0D0714] border border-[#3A2555] rounded-lg px-3 py-1.5 text-[13.5px] font-sans text-[#F4F1F8] focus:outline-none focus:border-[#D4B876]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-[#2A1B40] border border-[#D4B876] font-['Cinzel'] font-bold text-[11px] text-[#F4F1F8]"
                >
                  Leave Note
                </button>
              </div>
              {bottleMessage && (
                <div className="text-[12px] text-[#6FD39A]">
                  ✓ Note on the board from {bottleMessage.authorName}: “{bottleMessage.text}”
                </div>
              )}
            </form>
          )}
        </div>

        {/* -------------------------------------------------------------------
            STEP 2: THE BOARD OF CLUES (Exact campfire-days.json Clues Only)
           ------------------------------------------------------------------- */}
        <div
          className={`rounded-xl border p-3.5 space-y-2.5 transition bg-[#150D22] border-[#3A2555]/80`}
        >
          <div className="flex items-center justify-between text-[11px] font-['Cinzel'] font-bold tracking-[0.8px]">
            <span className="text-[#D4B876] uppercase">THE BOARD · TODAY'S CLUES</span>
          </div>

          {/* Day 2: what the player found on Day 1, when the party had not yet met */}
          {currentWeek === 1 && currentDay === 2 && dayOneFind && (
            <div className="p-3 rounded-lg bg-[#130B1F] border border-[#D4B876]/50 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-['Cinzel'] font-bold text-[#D4B876]">
                <span>FROM DAY 1 · THE FOREST ROAD</span>
                <span className="font-sans font-normal text-[11.5px] text-[#6FD39A]">Found by {youDisplay}</span>
              </div>
              <div className="font-['Cinzel'] font-bold text-[12.5px] text-[#E5C158]">📌 {dayOneFind.title}</div>
              <p className="font-['Cormorant_Garamond'] text-[18px] text-[#F4F1F8] leading-[1.45]">{dayOneFind.text}</p>
            </div>
          )}

          {/* Found leads first, then the ones nobody took. */}
          {dayLeads
            .map((lead, li) => ({ lead, li }))
            .sort((a, b) => Number(leadFinders[b.li].length > 0) - Number(leadFinders[a.li].length > 0))
            .map(({ lead, li }) =>
            leadFinders[li].length > 0 ? (
              <div key={lead.id} className="p-3 rounded-lg bg-[#130B1F] border border-[#3A2555] space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-['Cinzel'] font-bold text-[12.5px] text-[#E5C158]">📌 {lead.clueTitle}</span>
                  <span className="text-[11.5px] font-sans text-[#6FD39A]">
                    Found by {leadFinders[li].map((fid) => friendNames[fid]).join(', ')}
                  </span>
                </div>
                <p className="font-['Cormorant_Garamond'] font-medium text-[19px] text-[#F4F1F8] leading-[1.5]">{lead.clueText}</p>
              </div>
            ) : !isW1D1 && lead.place ? (
              <div key={lead.id} className="px-3 py-2 rounded-lg border border-dashed border-[#3A2555] text-[13.5px] font-sans text-[#B7A9CC]">
                Nobody took this lead tonight: {lead.place}.
              </div>
            ) : null
          )}

          {clueContributors.length === 0 && (
            <div className="p-3 rounded-lg bg-[#130B1F] border border-[#3A2555] text-[13.5px] font-sans text-[#B7A9CC]">
              Nobody followed a lead tonight.
            </div>
          )}
        </div>

        {/* -------------------------------------------------------------------
            STEP 4: THE CALLBACK
           ------------------------------------------------------------------- */}
        {dayEntry.callback && (
        <div
          className={`rounded-xl border p-3.5 space-y-1.5 transition bg-[#150D22] border-[#3A2555]/80`}
        >
          <div className="flex items-center justify-between text-[11px] font-['Cinzel'] font-bold tracking-[0.8px]">
            <span className="text-[#D4B876] uppercase">GARRICK REMEMBERS</span>
          </div>
          <p className="font-['Cormorant_Garamond'] font-medium text-[19px] text-[#F4F1F8] leading-[1.5]">
            “{dayEntry.callback}”
          </p>
        </div>
        )}

        {/* -------------------------------------------------------------------
            STEP 5: THE SEEKER FRAGMENT WORD-LOCK (With 1st-Letter Hint & Zero Gold Text)
           ------------------------------------------------------------------- */}
        <div
          className={`rounded-xl border p-3.5 space-y-2.5 transition bg-[#150D22] border-[#3A2555]/80`}
        >
          <div className="flex items-center justify-between text-[11px] font-['Cinzel'] font-bold tracking-[0.8px]">
            <span className="text-[#D4B876] uppercase">
              THE FRAGMENT · {activeFragment.id}
            </span>
            <span className="text-[#6FD39A]">
              {(fragSolvedState[0] ? 1 : 0) + (fragSolvedState[1] ? 1 : 0)}/2 Unlocked
            </span>
          </div>

          {activeSeatHasFirstLetterHint && (
            <div className="px-2.5 py-1.5 rounded-lg bg-[#130B1F] border border-[#6FD39A]/50 text-[12.5px] font-sans text-[#6FD39A]">
              {([1, 2] as const)
                .filter((w) => seatHasHint(w))
                .map((w) => `Word ${w} starts with “${(w === 1 ? activeFragment.word1 : activeFragment.word2)[0].toUpperCase()}”`)
                .join(' · ')}
            </div>
          )}

          <p className="font-['Cormorant_Garamond'] font-medium text-[19px] text-[#F4F1F8] leading-[1.5]">
            “
            {activeFragment.displayTemplate
              .replace(
                '{0}',
                fragSolvedState[0]
                  ? activeFragment.word1.toUpperCase()
                  : `[${
                      seatHasHint(1)
                        ? `${activeFragment.word1[0].toUpperCase()}·`
                        : ''
                    }${activeFragment.jumble1.join('')}]`
              )
              .replace(
                '{1}',
                fragSolvedState[1]
                  ? activeFragment.word2.toUpperCase()
                  : `[${
                      seatHasHint(2)
                        ? `${activeFragment.word2[0].toUpperCase()}·`
                        : ''
                    }${activeFragment.jumble2.join('')}]`
              )}
            ”
          </p>

          {/* When the second word lands, the whole line is read aloud once (Garrick; the narrator on W1·D1). */}
          {fragSolvedState[0] && fragSolvedState[1] && (
            <div className="pl-3 border-l-2 border-[#F0A552]/70 space-y-1">
              <div className="font-['Cinzel'] font-bold text-[10.5px] tracking-[1px] uppercase text-[#F0A552]">
                {dayEntry.narratedNoGarrick ? 'Read aloud' : 'Garrick reads it aloud'}
              </div>
              <p className="font-['Cormorant_Garamond'] italic text-[18px] text-[#F4E8C1] leading-[1.45]">
                “{activeFragment.fullText}”
              </p>
            </div>
          )}

          {/* The meaning question and one-line pins (shown only once the question is approved). */}
          {fragSolvedState[0] && fragSolvedState[1] && FRAGMENT_MEANING_QUESTIONS[activeFragment.id] && (
            <div className="space-y-2 p-2.5 rounded-lg bg-[#130B1F] border border-[#3A2555]">
              <p className="font-sans text-[14.5px] text-[#F4F1F8] leading-[1.45]">
                <ScriptInline text={FRAGMENT_MEANING_QUESTIONS[activeFragment.id]} />
              </p>
              {Object.entries(meaningPins[activeFragment.id] || {}).map(([fid, pin]) => (
                <p key={fid} className="text-[13.5px] font-sans text-[#D8CEE8]">
                  <strong style={{ color: friendColors[fid] }}>{pin.name}:</strong> {pin.text}
                </p>
              ))}
              {!isPastDawnCutoff && (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const text = meaningDraft.trim();
                    if (!text) return;
                    onPinMeaning(activeFragment.id, activeSeat, friendNames[activeSeat], text);
                    setMeaningDraft('');
                  }}
                >
                  <input
                    id="meaning-pin"
                    value={meaningDraft}
                    onChange={(e) => setMeaningDraft(e.target.value.slice(0, 140))}
                    placeholder="One line: what do you think it means?"
                    className="flex-1 min-w-0 bg-[#0D0714] border border-[#3A2555] rounded-lg px-2.5 py-1.5 text-[14px] text-[#F4F1F8] placeholder-[#8B7A9E] focus:outline-none focus:border-[#D4B876]"
                  />
                  <button type="submit" className="px-3 rounded-lg border border-[#D4B876] bg-[#D4B876]/20 font-['Cinzel'] font-bold text-[11.5px] text-[#F4F1F8] uppercase">
                    Pin
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            {([0, 1] as const).map((sIdx) => {
              const word = sIdx === 0 ? activeFragment.word1 : activeFragment.word2;
              const jumble = sIdx === 0 ? activeFragment.jumble1 : activeFragment.jumble2;
              const isSolved = fragSolvedState[sIdx];
              return (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => {
                    setSeekerSlot(sIdx);
                    setSeekerTypedIndices([]);
                  }}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg font-['Cinzel'] font-bold text-[11.5px] border transition ${
                    isSolved
                      ? 'bg-[#6FD39A]/15 border-[#6FD39A]/50 text-[#6FD39A]'
                      : seekerSlot === sIdx
                      ? 'bg-[#2A1B40] border-[#D4B876] text-[#D4B876]'
                      : 'bg-[#130B1F] border-[#3A2555] text-[#B7A9CC]'
                  }`}
                >
                  {isSolved
                    ? `✓ ${word.toUpperCase()}`
                    : `Lock ${sIdx + 1}: ${jumble.join('')}`}
                </button>
              );
            })}
          </div>

          {!fragSolvedState[seekerSlot] && (
            <div className="space-y-2 pt-1">
              {wordLockNotice && (
                <p className="text-[12.5px] font-sans text-[#E0645C]">{wordLockNotice}</p>
              )}
              <div className="flex flex-wrap items-center gap-1.5">
                {(seekerSlot === 0
                  ? activeFragment.jumble1
                  : activeFragment.jumble2
                ).map((_, slotPos) => {
                  const arr =
                    seekerSlot === 0
                      ? activeFragment.jumble1
                      : activeFragment.jumble2;
                  const targetW =
                    seekerSlot === 0 ? activeFragment.word1 : activeFragment.word2;
                  const pickedIdx = seekerTypedIndices[slotPos];
                  const filled = pickedIdx !== undefined ? arr[pickedIdx] : '';
                  const showFirstHint =
                    !filled && slotPos === 0 && seatHasHint((seekerSlot + 1) as 1 | 2);
                  return (
                    <button
                      key={slotPos}
                      type="button"
                      disabled={pickedIdx === undefined}
                      onClick={() =>
                        setSeekerTypedIndices((prev) =>
                          prev.filter((_, i) => i !== slotPos)
                        )
                      }
                      className={`w-8 h-8 rounded-lg font-['Cinzel'] font-bold text-[13.5px] border flex items-center justify-center ${
                        filled
                          ? 'bg-[#3A2555] border-[#E5C158] text-[#E5C158]'
                          : showFirstHint
                          ? 'bg-[#6FD39A]/15 border-[#6FD39A] text-[#6FD39A]'
                          : 'bg-[#130B1F] border-[#D4B876]/60 text-[#B7A9CC]'
                      }`}
                    >
                      {filled || (showFirstHint ? targetW[0].toUpperCase() : '_')}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(seekerSlot === 0
                  ? activeFragment.jumble1
                  : activeFragment.jumble2
                ).map((letter, lIdx) => {
                  const used = seekerTypedIndices.includes(lIdx);
                  return (
                    <button
                      key={lIdx}
                      type="button"
                      disabled={used}
                      onClick={() => handleTapSeekerTile(lIdx)}
                      className={`w-8 h-8 rounded-lg font-['Cinzel'] font-bold text-[13.5px] border transition ${
                        used
                          ? 'bg-[#0D0714] border-[#3A2555] text-[#5A4B70]'
                          : 'bg-[#2A1B40] border-[#D4B876] text-[#F4F1F8]'
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* -------------------------------------------------------------------
            STEP 3: THE FORK & THEORY BOARD (Pin-Before-Peek + Question Pin + Day 6 Revisit)
           ------------------------------------------------------------------- */}
        <div
          className={`rounded-xl border p-3.5 space-y-3 transition bg-[#150D22] border-[#3A2555]/80`}
        >
          <div className="flex items-center justify-between text-[11px] font-['Cinzel'] font-bold tracking-[0.8px]">
            <span className="text-[#D4B876] uppercase">
              TONIGHT'S QUESTION
            </span>
            {isPastDawnCutoff && <span className="text-[#B7A9CC]">Closed at dawn</span>}
          </div>

          {/* Dynamic {friend:Attribute} Nudge */}
          <div className="p-2.5 rounded-lg bg-[#130B1F] border border-[#3A2555] text-[14.5px] font-['Cormorant_Garamond'] text-[#F4E8C1] leading-snug">
            <span className="font-['Cinzel'] font-bold text-[10.5px] text-[#F0A552] uppercase block mb-0.5 not-italic">
              {/* No rule text in the game (CLAUDE.md §1.10): just who is asked. */}
              {dayEntry.narratedNoGarrick
                ? 'A question for the road'
                : friendsAtFire.length > 1
                ? `Garrick asks ${friendNames[nudgeResolved.targetFriend]}`
                : 'Garrick asks'}
            </span>
            “{nudgeResolved.resolvedText}”
          </div>

          {/* Fork Options: Fork A, Fork B, Neither + Own Words */}
          <div className="space-y-1.5">
            {(
              [
                { key: 'A' as const, label: 'Reading A', text: dayEntry.forkA },
                { key: 'B' as const, label: 'Reading B', text: dayEntry.forkB },
                {
                  key: 'NEITHER' as const,
                  label: 'Neither',
                  text: 'Neither — write my own reading on the board.',
                },
              ] as const
            ).map((opt) => {
              const chosen = selectedReading === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  disabled={isPastDawnCutoff}
                  onClick={() => setSelectedReading(opt.key)}
                  className={`w-full p-2.5 rounded-lg border text-left transition ${
                    chosen
                      ? 'bg-[#2A1B40] border-[#D4B876] text-[#F4F1F8]'
                      : 'bg-[#130B1F] border-[#3A2555] text-[#D8CEE8] hover:border-[#7E68B8]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-['Cinzel'] font-bold text-[#D4B876]">
                    <span>
                      {chosen ? '✓ ' : ''}
                      {opt.label}
                    </span>
                  </div>
                  <p className="font-sans text-[14px] text-[#F4F1F8] mt-0.5 leading-snug">
                    {opt.text}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Optional one-line note in the friend's own words + Pin button */}
          {!isPastDawnCutoff && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={customTheoryNote}
                onChange={(e) => setCustomTheoryNote(e.target.value)}
                placeholder={`Optional one-line note in ${friendNames[activeSeat]}’s own words...`}
                className="flex-1 bg-[#0D0714] border border-[#3A2555] rounded-lg px-3 py-2 text-[13.5px] font-sans text-[#F4F1F8] focus:outline-none focus:border-[#D4B876]"
              />
              <button
                type="button"
                onClick={handleSubmitTheoryPin}
                className="px-3.5 py-2 rounded-lg bg-[#D4B876]/25 hover:bg-[#D4B876]/35 border border-[#D4B876] font-['Cinzel'] font-bold text-[11.5px] text-[#F4F1F8] whitespace-nowrap"
              >
                {activeSeatPin
                  ? `Update ${friendNames[activeSeat]}’s Pin`
                  : `Pin to Board as ${friendNames[activeSeat]}`}
              </button>
            </div>
          )}

          {/* Stored-Line Acknowledgement from Garrick (Never grades or confirms) */}
          {activeSeatPin && (
            <div className="p-2.5 rounded-lg bg-[#130B1F] border border-[#6FD39A]/50 text-[13.5px] font-sans text-[#E6E0F0] flex items-center justify-between gap-2">
              <div>
                <span className="font-['Cinzel'] font-bold text-[10.5px] text-[#6FD39A] uppercase block">
                  {activeSeatPin.fromPrivatePrompt
                    ? '✓ SYNCED FROM PRIVATE DAILY PROMPT (NO DOUBLE ANSWER)'
                    : '✓ GARRICK STORED ACKNOWLEDGEMENT'}
                </span>
                <span>“{activeSeatPin.storedAck || 'Pinned.'}”</span>
              </div>
            </div>
          )}

          {/* Pinned Theories Board (Enforces Pin-Before-Peek) */}
          <div className="pt-2 border-t border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-['Cinzel'] font-bold text-[#B7A9CC]">
              <span>THE PARTY'S READINGS</span>
            </div>

            {/* Carried W1·D1 Theory Pin on W1·D2 */}
            {currentWeek === 1 &&
              currentDay === 2 &&
              Object.values(w1d1TheoryPins).map((p1) => (
                <div
                  key={`w1d1-${p1.friendId}`}
                  className="p-2.5 rounded-lg bg-[#130B1F] border border-[#D4B876]/45 text-[13px] font-sans"
                >
                  <div className="flex items-center justify-between text-[11px] font-['Cinzel'] font-bold text-[#D4B876]">
                    <span>{p1.friendName} · Day 1 · The forest road</span>
                    <span>Reading {p1.reading}</span>
                  </div>
                  <p className="text-[#F4F1F8] mt-0.5">“{p1.readingText}”</p>
                </div>
              ))}

            {!canPeekOtherPins ? (
              <div className="p-3 rounded-lg bg-[#130B1F] border border-dashed border-[#5E4585] text-[13px] font-sans text-[#B7A9CC]">
                🔒 The others' readings show once {activeSeat === 'YOU' ? 'you have' : `${friendNames[activeSeat]} has`} pinned one above.
              </div>
            ) : Object.values(dayTheoryPins).length === 0 ? (
              <div className="p-2.5 rounded-lg bg-[#130B1F] border border-[#3A2555] text-[13px] font-sans text-[#B7A9CC]">
                No readings pinned yet tonight.
              </div>
            ) : (
              <div className="space-y-1.5">
                {Object.values(dayTheoryPins).map((pin) => (
                  <div
                    key={pin.friendId}
                    className="p-2.5 rounded-lg bg-[#130B1F] border border-[#3A2555] space-y-0.5 text-[13.5px] font-sans"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="font-['Cinzel'] font-bold text-[11.5px]"
                        style={{ color: friendColors[pin.friendId] }}
                      >
                        {pin.friendName.toUpperCase()} · READING {pin.reading}
                      </span>
                      <span className="text-[11px] text-[#8B7A9E]">
                        {pin.timestamp}
                      </span>
                    </div>
                    <p className="text-[#F4F1F8] leading-snug">“{pin.readingText}”</p>
                    {pin.customLine && pin.reading !== 'NEITHER' && (
                      <p className="text-[12.5px] text-[#D8CEE8] italic">
                        Note: “{pin.customLine}”
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Question Pin: Pin an open question to the board */}
          <form
            onSubmit={handleSubmitQuestionPin}
            className="pt-2 border-t border-white/[0.08] space-y-2"
          >
            <div className="text-[11px] font-['Cinzel'] font-bold text-[#B7A9CC] uppercase">
              A question for whoever comes next:
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                disabled={isPastDawnCutoff}
                value={questionDraft}
                onChange={(e) => setQuestionDraft(e.target.value)}
                placeholder={`Pin an open question as ${friendNames[activeSeat]}...`}
                className="flex-1 bg-[#0D0714] border border-[#3A2555] rounded-lg px-3 py-1.5 text-[13.5px] font-sans text-[#F4F1F8] focus:outline-none focus:border-[#D4B876]"
              />
              <button
                type="submit"
                disabled={isPastDawnCutoff}
                className="px-3 py-1.5 rounded-lg bg-[#2A1B40] border border-[#D4B876] font-['Cinzel'] font-bold text-[11px] text-[#F4F1F8] whitespace-nowrap"
              >
                Pin Question
              </button>
            </div>
            {dayQuestionPins.length > 0 && (
              <div className="space-y-1">
                {dayQuestionPins.map((qp) => (
                  <div
                    key={qp.id}
                    className="p-2 rounded-lg bg-[#130B1F] border border-[#3A2555] text-[13px] font-sans flex items-center justify-between gap-2"
                  >
                    <span>
                      <strong style={{ color: friendColors[qp.authorId] }}>
                        {qp.authorName}:
                      </strong>{' '}
                      “{qp.questionText}”
                    </span>
                    <span className="text-[11px] text-[#8B7A9E] shrink-0">Question Pin</span>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Day 6 Weekly Pin Revisit */}
          {currentDay === 6 && earlierWeekPins.length > 0 && (
            <div className="p-2.5 rounded-lg bg-[#130B1F] border border-[#D4B876]/55 space-y-1">
              <div className="font-['Cinzel'] font-bold text-[10.5px] text-[#D4B876] uppercase">
                Garrick remembers the week
              </div>
              {earlierWeekPins.map((item, idx) => (
                <p key={idx} className="text-[13px] font-sans text-[#E6E0F0]">
                  • {item.pin.friendName} ({item.dayId}): “{item.pin.readingText}”
                </p>
              ))}
              <p className="font-['Cormorant_Garamond'] text-[17.5px] text-[#F4E8C1] pt-0.5">
                “{CAMPFIRE_STORED_LINES.day6WeeklyPinLine}”
              </p>
            </div>
          )}
        </div>

        {/* -------------------------------------------------------------------
            THE CASE SO FAR: the week's one question, each friend's current line (dated by day)
           ------------------------------------------------------------------- */}
        {WEEK_QUESTIONS[currentWeek] && (() => {
          const board = weekBoard[currentWeek] || {};
          const mine = board[activeSeat]?.entries || [];
          const latestMine = mine[mine.length - 1]?.text || '';
          const tonightPin = activeSeatPin
            ? [activeSeatPin.readingText, activeSeatPin.customLine].filter(Boolean).join(' ')
            : '';
          const save = (text: string) => {
            const t = text.trim().slice(0, 140);
            if (!t) return;
            onSetWeekLine(currentWeek, activeSeat, friendNames[activeSeat], currentDay, t);
            setWeekLineDraft('');
          };
          return (
            <div className="rounded-xl border p-3.5 space-y-2.5 bg-[#150D22] border-[#3A2555]/80" data-week-board>
              <div className="text-[11px] font-['Cinzel'] font-bold tracking-[0.8px] text-[#D4B876] uppercase">
                The case so far · Week {currentWeek}
              </div>
              <p className="font-['Cormorant_Garamond'] font-medium text-[19px] text-[#F4F1F8] leading-[1.4]">
                {WEEK_QUESTIONS[currentWeek]}
              </p>
              <div className="space-y-1">
                {partyIds
                  .filter((fid) => board[fid]?.entries.length)
                  .map((fid) => {
                    const e = board[fid]!.entries;
                    const last = e[e.length - 1];
                    return (
                      <p key={fid} className="text-[13.5px] font-sans text-[#D8CEE8]">
                        <strong style={{ color: friendColors[fid] }}>{friendNames[fid]}</strong>
                        <span className="text-[#8B7A9E]"> · Day {last.day}</span>: {last.text}
                      </p>
                    );
                  })}
                {!partyIds.some((fid) => board[fid]?.entries.length) && (
                  <p className="text-[13px] font-sans text-[#8B7A9E]">No lines yet this week.</p>
                )}
              </div>
              {!isPastDawnCutoff && (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    save(weekLineDraft);
                  }}
                >
                  <input
                    id="week-line"
                    value={weekLineDraft}
                    onChange={(e) => setWeekLineDraft(e.target.value.slice(0, 140))}
                    placeholder={latestMine ? `Yours: ${latestMine}` : 'Your answer, in one line'}
                    className="flex-1 min-w-0 bg-[#0D0714] border border-[#3A2555] rounded-lg px-2.5 py-1.5 text-[14px] text-[#F4F1F8] placeholder-[#8B7A9E] focus:outline-none focus:border-[#D4B876]"
                  />
                  <button type="submit" className="px-3 rounded-lg border border-[#D4B876] bg-[#D4B876]/20 font-['Cinzel'] font-bold text-[11.5px] text-[#F4F1F8] uppercase">
                    Save
                  </button>
                </form>
              )}
              {!isPastDawnCutoff && tonightPin && tonightPin !== latestMine && (
                <button
                  type="button"
                  onClick={() => save(tonightPin)}
                  className="text-[12.5px] font-sans text-[#D4B876] hover:underline"
                >
                  Use tonight's pin: “{tonightPin}”
                </button>
              )}
            </div>
          );
        })()}

        {dayEntry.riddle && (
        <>
        {/* -------------------------------------------------------------------
            STEP 6: THE RIDDLE (Tone-Aware, 3 Tries or Give Up, Zero Gold)
           ------------------------------------------------------------------- */}
        <div
          className={`rounded-xl border p-3.5 space-y-2.5 transition bg-[#150D22] border-[#3A2555]/80`}
        >
          <div className="flex items-center justify-between text-[11px] font-['Cinzel'] font-bold tracking-[0.8px]">
            <span className="text-[#D4B876] uppercase">THE RIDDLE</span>
            <span className="text-[#B7A9CC]">
              {!dayEntry.riddle
                ? ''
                : dayEntry.tone === 'quiet' && !quietRiddleRequested
                ? ''
                : `${riddleTries}/${dayEntry.riddle.maxTries} tries`}
            </span>
          </div>

          {!dayEntry.riddle ? (
            <p className="font-sans text-[13.5px] text-[#B7A9CC]">
              No riddle tonight.
            </p>
          ) : dayEntry.tone === 'quiet' && !quietRiddleRequested ? (
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#130B1F] border border-[#3A2555]">
              <span className="text-[13.5px] font-sans text-[#D8CEE8]">
                Garrick has a riddle tonight, if anyone asks.
              </span>
              <button
                type="button"
                onClick={() => setQuietRiddleRequested(true)}
                className="px-3 py-1.5 rounded-lg bg-[#2A1B40] hover:bg-[#3A2555] border border-[#D4B876] font-['Cinzel'] font-bold text-[11px] text-[#F0A552] whitespace-nowrap shrink-0"
              >
                Ask for it
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="font-['Cormorant_Garamond'] font-medium text-[19px] text-[#F4F1F8] leading-[1.5]">
                “{dayEntry.riddle.q}”
              </p>

              {!riddleSolved && !riddleGivenUp ? (
                <form onSubmit={handleSubmitRiddleGuess} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={riddleInput}
                      onChange={(e) => setRiddleInput(e.target.value)}
                      placeholder="Type your answer..."
                      className="flex-1 bg-[#0D0714] border border-[#3A2555] rounded-lg px-3 py-1.5 text-[14px] font-sans text-[#F4F1F8] focus:outline-none focus:border-[#D4B876]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-[#D4B876]/25 border border-[#D4B876] font-['Cinzel'] font-bold text-[11px] text-[#F4F1F8]"
                    >
                      Answer
                    </button>
                    <button
                      type="button"
                      onClick={handleGiveUpRiddle}
                      className="px-3 py-1.5 rounded-lg bg-[#130B1F] hover:bg-[#2A1B40] border border-[#3A2555] font-['Cinzel'] font-bold text-[11px] text-[#B7A9CC]"
                    >
                      Give up
                    </button>
                  </div>
                  {riddleFeedback && (
                    <div className="text-[12.5px] font-sans text-[#E5C158]">
                      {riddleFeedback}
                    </div>
                  )}
                </form>
              ) : (
                <div className="p-2.5 rounded-lg bg-[#130B1F] border border-[#6FD39A]/50 space-y-1">
                  {riddleFeedback && (
                    <div className="text-[12px] font-sans text-[#B7A9CC]">
                      {riddleFeedback}
                    </div>
                  )}
                  <div className="font-['Cinzel'] font-bold text-[12.5px] text-[#6FD39A]">
                    Answer: {dayEntry.riddle.a}
                  </div>
                  <p className="font-['Cormorant_Garamond'] text-[18px] text-[#F4E8C1]">
                    Garrick: “{dayEntry.riddle.quip}”
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        </>
        )}

        <div id="campfire-leaving" className="space-y-3.5 scroll-mt-3">

        {/* -------------------------------------------------------------------
            STEP 7: WHAT WE DID TODAY (Factual Only, Obeys Match-Label Rule)
           ------------------------------------------------------------------- */}
        <div
          className={`rounded-xl border p-3.5 space-y-2 transition bg-[#150D22] border-[#3A2555]/80`}
        >
          <div className="flex items-center justify-between text-[11px] font-['Cinzel'] font-bold tracking-[0.8px]">
            <span className="text-[#D4B876] uppercase">LEAVING · WHAT WE DID TODAY</span>
            <span className="text-[#B7A9CC]">Factual actions only</span>
          </div>
          {factualTodayLines.length > 0 ? (
            <div className="space-y-1">
              {factualTodayLines.map((item) => (
                <div
                  key={item.friendId}
                  className="p-2 rounded-lg bg-[#130B1F] border border-[#3A2555] text-[13.5px] font-sans text-[#F4F1F8]"
                >
                  {item.line}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13.5px] font-sans text-[#B7A9CC]">
              Nothing yet today.
            </p>
          )}
        </div>

        {/* -------------------------------------------------------------------
            STEP 8: CLOSER & SEASON TRACKER TELEMETRY
           ------------------------------------------------------------------- */}
        <div
          className={`rounded-xl border p-3.5 space-y-2 transition bg-[#150D22] border-[#3A2555]/80`}
        >
          <div className="flex items-center justify-between text-[11px] font-['Cinzel'] font-bold tracking-[0.8px]">
            <span className="text-[#F0A552] uppercase">{dayEntry.narratedNoGarrick ? 'LEAVING' : 'LEAVING · GARRICK'}</span>
          </div>
          {!dayEntry.narratedNoGarrick && (
            <p className="font-['Cormorant_Garamond'] font-medium text-[19.5px] text-[#F4F1F8] leading-[1.5]">
              {`“${closerLine}”`}
            </p>
          )}
          {pullText && (
            <div className="pt-1 space-y-1">
              <div className="font-['Cinzel'] font-bold text-[10.5px] tracking-[1px] uppercase text-[#B7A9CC]">Tomorrow</div>
              <NarrationBlock text={pullText} pull />
            </div>
          )}
        </div>

        </div>
        {/* -------------------------------------------------------------------
            REAL-PLAYER PARTY MESSAGES & STORED GARRICK ROUTER REPLIES
           ------------------------------------------------------------------- */}
        {chatFeed.length > 0 && (
          <div className="space-y-2 pt-1">
            {chatFeed.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[#150D22] border border-[#3A2555] space-y-1"
              >
                <div className="flex items-center justify-between text-[11px] font-['Cinzel'] font-bold">
                  <span style={{ color: item.color }}>{item.speaker}</span>
                  {item.meta && <span className="text-[#8B7A9E]">{item.meta}</span>}
                </div>
                <p className="font-sans text-[14.5px] text-[#F4F1F8] leading-snug">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================================
          CAMPFIRE SPEAKER BAR (Garrick Present Across All 6 Weeks; Real Friends Have Zero Canned Replies)
         ===================================================================== */}
      <div className="px-3.5 py-2.5 bg-[#150D22] border-t border-[#3A2555] space-y-2 shrink-0">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {!dayEntry.narratedNoGarrick && (
              <button
                type="button"
                onClick={() => setAskGarrickMode(true)}
                className={`px-2.5 py-1 rounded-lg font-['Cinzel'] font-bold border transition ${
                  askGarrickMode
                    ? 'bg-[#2A1B40] border-[#F0A552] text-[#F0A552]'
                    : 'bg-[#130B1F] border-[#3A2555] text-[#B7A9CC]'
                }`}
              >
                🔥 Ask Garrick
              </button>
            )}
            <button
              type="button"
              onClick={() => setAskGarrickMode(false)}
              className={`px-2.5 py-1 rounded-lg font-['Cinzel'] font-bold border transition ${
                !askGarrickMode || dayEntry.narratedNoGarrick
                  ? 'bg-[#2A1B40] border-[#6FD39A] text-[#6FD39A]'
                  : 'bg-[#130B1F] border-[#3A2555] text-[#B7A9CC]'
              }`}
            >
              💬 Speak to Party as {friendNames[activeSeat]}
            </button>
          </div>
        </div>

        <form onSubmit={handleSendChatOrAskGarrick} className="flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={
              askGarrickMode && !dayEntry.narratedNoGarrick
                ? `Ask Garrick a question as ${friendNames[activeSeat]}...`
                : `Write to the party fire as ${friendNames[activeSeat]} (real friends only)...`
            }
            className="flex-1 bg-[#0D0714] border border-[#3A2555] rounded-xl px-3 py-2 text-[14.5px] font-sans text-[#F4F1F8] placeholder-[#8B7A9E] focus:outline-none focus:border-[#D4B876]"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-[#D4B876]/25 hover:bg-[#D4B876]/35 border border-[#D4B876] font-['Cinzel'] font-bold text-[11.5px] text-[#F4F1F8] uppercase shrink-0"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
