import React, { useState, useEffect } from 'react';
import {
  AttributeName,
  ATTRIBUTE_META,
  CLASS_META,
  ClassName,
  EPISODE_NUMBERS,
  GEAR_TABLE,
  PartyFriend,
} from '../data/mythiosRulesData';
import { SEEKER_FRAGMENTS, SeekerFragmentData } from '../data/mythiosFragments';
import { wordLockSecondsLeft, registerWrongWordTry, clearWordTries } from '../data/wordLocks';
import { GOLD_FRAGMENT_WORD_SOLVED, GOLD_RELIC_COST } from '../data/economy';
import { HintMask, hintHas } from '../data/fanOutLeads';
import { CHAPTER_SCRIPTS } from '../data/chapterScripts';
import { NarrationBlock, ScriptInline, fillScriptTokens } from './ChapterScriptParts';
import { BAG_VERSES } from '../data/bagVerses';

interface BagTabViewProps {
  /** The party in play (2 to 6), the player first. */
  party: PartyFriend[];
  gold: number;
  relics: Record<string, number>;
  solvedWords: Record<string, { w1?: string; w2?: string }>;
  /** Returns false when the word can't be taken (already filled, or this friend's one word for today is used). */
  onSolveWord: (fragId: string, wordIndex: 1 | 2, solverName: string) => boolean;
  onGiveRelic: (relicKey: string, friendName: string) => void;
  ledgerOpened: boolean;
  onAskGarrickForLedger: () => void;
  /** Days the player has finished, "week-day" (the Clues shelf lists what those days left you holding). */
  completedDays: string[];
  currentWeek: number;
  currentDay: number;
  /** Weeks whose Gathering has been read to its end (their verses join the Bag). */
  gatheringsDone?: number[];
  initialSubTab?: 'RELICS' | 'SEEKER' | 'ALL' | 'ITEMS' | 'SCROLLS';
  seekerFirstLetterHints?: Record<string, HintMask>;
}

export const BagTabView: React.FC<BagTabViewProps> = ({
  party,
  relics,
  solvedWords,
  onSolveWord,
  onGiveRelic,
  ledgerOpened,
  onAskGarrickForLedger,
  completedDays,
  currentWeek,
  currentDay,
  gatheringsDone = [],
  initialSubTab,
  seekerFirstLetterHints = {},
}) => {
  // #35, #38, #39: Streamlined 2 sub-tabs only: RELICS (2-column item boxes) and SEEKER (fragments & verses)
  const [subTab, setSubTab] = useState<'RELICS' | 'SEEKER'>(
    initialSubTab === 'SEEKER' ? 'SEEKER' : 'RELICS'
  );
  const [selectedSeekerWeek, setSelectedSeekerWeek] = useState<number>(currentWeek);
  // Open all 6 fragments by default so solved & unsolved fragments are immediately visible and collapsible (#16, #55, #56)
  const [expandedFragIds, setExpandedFragIds] = useState<Record<string, boolean>>({
    '1-6': true,
    '1-5': true,
    '1-4': true,
    '1-1': true,
    [`${currentWeek}-${Math.min(currentDay, 6)}`]: true,
    [`${currentWeek}-6`]: true,
  });
  const [activeJumbleSlot, setActiveJumbleSlot] = useState<{
    fragId: string;
    slot: 0 | 1;
  } | null>(null);
  const [typedIndices, setTypedIndices] = useState<number[]>([]);
  const [wordLockNotice, setWordLockNotice] = useState<string | null>(null);
  const [giftBanner, setGiftBanner] = useState<string | null>(null);
  const [activeGiftRelicKey, setActiveGiftRelicKey] = useState<string | null>(null);
  const [showScriptureDrawer, setShowScriptureDrawer] = useState(false);
  const [openVerses, setOpenVerses] = useState<Record<string, boolean>>({});
  // Newest first; a Gathering's passages appear once it has been read to its end.
  const heardVerses = BAG_VERSES.filter((v) => gatheringsDone.includes(v.week)).sort((a, b) => b.week - a.week);

  useEffect(() => {
    if (initialSubTab === 'SEEKER') {
      setSubTab('SEEKER');
    } else if (initialSubTab) {
      setSubTab('RELICS');
    }
  }, [initialSubTab]);

  useEffect(() => {
    setSelectedSeekerWeek(currentWeek);
    const newestDay = Math.min(currentDay, 6);
    setExpandedFragIds((prev) => ({
      ...prev,
      [`${currentWeek}-${newestDay}`]: true,
      [`${currentWeek}-6`]: true,
    }));
  }, [currentWeek, currentDay]);

  // All 6 fragments for the selected week, sorted newest first (Day 6 -> Day 1) (#16)
  // Each day drops one fragment: in the current week, only those up to today are in the Chest.
  const weekFragments = SEEKER_FRAGMENTS.filter(
    (f) => f.week === selectedSeekerWeek && (f.week < currentWeek || f.day <= currentDay)
  ).sort(
    (a, b) => b.day - a.day
  );

  const toggleFragmentAccordion = (fragId: string) => {
    setExpandedFragIds((prev) => ({
      ...prev,
      [fragId]: !prev[fragId],
    }));
  };

  const handleTapLetter = (frag: SeekerFragmentData, slot: 0 | 1, letterIdx: number) => {
    if (typedIndices.includes(letterIdx)) return;
    const wordIndex: 1 | 2 = slot === 0 ? 1 : 2;
    const waitSecs = wordLockSecondsLeft(frag.id, wordIndex);
    if (waitSecs > 0) {
      setWordLockNotice(`Too many wrong tries. Try this word again in ${waitSecs} seconds.`);
      setTypedIndices([]);
      return;
    }
    setWordLockNotice(null);
    const targetWord = slot === 0 ? frag.word1 : frag.word2;
    const jumbleArr = slot === 0 ? frag.jumble1 : frag.jumble2;
    const nextTyped = [...typedIndices, letterIdx];
    const formed = nextTyped.map((i) => jumbleArr[i]).join('');

    if (formed.length === targetWord.length) {
      if (formed.toLowerCase() === targetWord.toLowerCase()) {
        clearWordTries(frag.id, wordIndex);
        // Credited to the player by their own name (party[0] is always the player).
        if (!onSolveWord(frag.id, wordIndex, party[0]?.name || 'You')) {
          // Refused: keep the tray open so the reason shows.
          setWordLockNotice('A friend has just found this word.');
          setTypedIndices([]);
          return;
        }
        setActiveJumbleSlot(null);
        setTypedIndices([]);
      } else {
        const lockSecs = registerWrongWordTry(frag.id, wordIndex);
        if (lockSecs > 0) {
          setWordLockNotice(`Five wrong tries. Try this word again in ${lockSecs} seconds.`);
        }
        setTimeout(() => setTypedIndices([]), 350);
      }
    } else {
      setTypedIndices(nextTyped);
    }
  };

  // #12: 20px Upright Serif (not italic) for easy reading; NO [ ] brackets around jumbled words; solved words highlighted clearly
  const renderFragmentSentence = (frag: SeekerFragmentData) => {
    const entry = solvedWords[frag.id] || {};
    const isW1Solved = Boolean(entry.w1);
    const isW2Solved = Boolean(entry.w2);
    const parts = frag.displayTemplate.split(/(\{0\}|\{1\})/g);
    // A solved word that opens a sentence takes its capital (2-6 "Morning", 3-5 "Bloodlines", 5-3 "None").
    const asWritten = (word: string, idx: number) =>
      idx === 0 || /^\s*$/.test(parts[idx - 1]) && idx === 1 || /[.!?]\s*$/.test(parts[idx - 1]) ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    return (
      <p className="font-['Cormorant_Garamond'] font-medium text-[20px] text-[#F4F1F8] leading-[1.6]">
        “
        {parts.map((part, idx) => {
          // Two locks side by side (5-2) get a faint dot between them while both are locked, so they read as two.
          if (!part.trim() && parts[idx - 1] === '{0}' && parts[idx + 1] === '{1}' && !isW1Solved && !isW2Solved) {
            return (
              <span key={idx} className="mx-1 text-[#8B7A9E] not-italic" aria-hidden="true">
                ·
              </span>
            );
          }
          if (part === '{0}') {
            if (isW1Solved) {
              return (
                <span
                  key={idx}
                  className="font-['Cormorant_Garamond'] font-bold text-[20px] text-[#6FD39A] underline decoration-[#6FD39A]/60 underline-offset-4 px-1"
                >
                  {asWritten(frag.word1, idx)}
                </span>
              );
            }
            const isSelected =
              activeJumbleSlot?.fragId === frag.id && activeJumbleSlot?.slot === 0;
            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveJumbleSlot({ fragId: frag.id, slot: 0 });
                  setTypedIndices([]);
                }}
                className={`mx-1 px-2.5 py-0.5 rounded-md font-['Cinzel'] font-bold text-[12.5px] tracking-[1.5px] transition not-italic inline-block ${
                  isSelected
                    ? 'bg-[#D4B876]/30 border-2 border-[#D4B876] text-[#F4F1F8] shadow-sm'
                    : 'bg-[#2A1B40] border border-[#D4B876]/75 text-[#D4B876] hover:bg-[#382653]'
                }`}
              >
                {frag.jumble1.join('')}
              </button>
            );
          }
          if (part === '{1}') {
            if (isW2Solved) {
              return (
                <span
                  key={idx}
                  className="font-['Cormorant_Garamond'] font-bold text-[20px] text-[#6FD39A] underline decoration-[#6FD39A]/60 underline-offset-4 px-1"
                >
                  {asWritten(frag.word2, idx)}
                </span>
              );
            }
            const isSelected =
              activeJumbleSlot?.fragId === frag.id && activeJumbleSlot?.slot === 1;
            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveJumbleSlot({ fragId: frag.id, slot: 1 });
                  setTypedIndices([]);
                }}
                className={`mx-1 px-2.5 py-0.5 rounded-md font-['Cinzel'] font-bold text-[12.5px] tracking-[1.5px] transition not-italic inline-block ${
                  isSelected
                    ? 'bg-[#D4B876]/30 border-2 border-[#D4B876] text-[#F4F1F8] shadow-sm'
                    : 'bg-[#2A1B40] border border-[#D4B876]/75 text-[#D4B876] hover:bg-[#382653]'
                }`}
              >
                {frag.jumble2.join('')}
              </button>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
        ”
      </p>
    );
  };

  // Relics can be given to any friend in the party (Core Rules §5).
  const partyFriends = party.filter((f) => f.id !== 'YOU').map((f) => ({ id: f.id, name: f.name, className: f.cls }));

  const relicKeys = [
    'Might',
    'Craft',
    'Intellect',
    'Charm',
    'Agility',
    'Aim',
    'Battle',
  ] as const;

  return (
    <div className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3.5 bg-[#0D0714] text-[#F4F1F8]">
      {/* TWO SUB-TABS ONLY: RELICS · SEEKER (#35, #38, #39) */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#150D22] border border-[#3A2555]">
        {(['RELICS', 'SEEKER'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`py-2 rounded-xl font-['Cinzel'] font-bold text-[12.5px] tracking-[1.2px] transition whitespace-nowrap ${
              subTab === tab
                ? 'bg-[#2E1B42] text-[#D4B876] border border-[#D4B876]/65 shadow-sm'
                : 'text-[#B7A9CC] hover:text-[#F4F1F8]'
            }`}
          >
            {tab === 'RELICS' ? '♦ RELICS' : '🕯️ SEEKER CHEST'}
          </button>
        ))}
      </div>

      {/* =====================================================================
          1. RELICS SUB-VIEW (#36 — 2-Column RPG Item Box Grid, NOT Wide Banners!)
         ===================================================================== */}
      {subTab === 'RELICS' && (
        <div className="space-y-3.5">
          {giftBanner && (
            <div className="p-3 rounded-xl bg-[#130B1F] border border-[#6FD39A] text-[14px] font-sans text-[#6FD39A] font-medium flex items-center justify-between shadow-md">
              <span>✓ {giftBanner}</span>
              <button onClick={() => setGiftBanner(null)} className="text-xs ml-2">
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center justify-between px-0.5">
            <span className="font-['Cinzel'] font-bold text-[12px] tracking-[1.2px] text-[#D4B876] uppercase">
              RELICS · TAP BOX TO GIFT
            </span>
            <span className="text-[12px] font-sans text-[#B7A9CC]">
              +4 Roll / +1 Gear
            </span>
          </div>

          {/* #36: 2-Column RPG Item Box Grid (#2A1B40 raised tiles with colored emblems) */}
          <div className="grid grid-cols-2 gap-2.5">
            {relicKeys.map((rKey) => {
              const count = relics[rKey] || 0;
              const isAttr = rKey !== 'Battle';
              const attrColor = isAttr
                ? ATTRIBUTE_META[rKey as AttributeName].color
                : '#D6DCEB';
              const isGiftOpen = activeGiftRelicKey === rKey;

              return (
                <div
                  key={rKey}
                  className={`p-3.5 rounded-2xl bg-[#2A1B40] border transition flex flex-col justify-between min-h-[124px] shadow-md ${
                    count > 0 ? 'border-[#7E68B8]' : 'border-[#3A2555] opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <div
                        className="w-8 h-8 rounded-xl bg-[#130B1F] border flex items-center justify-center text-[15px] shrink-0"
                        style={{ borderColor: attrColor, color: attrColor }}
                      >
                        ♦
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md font-['Cinzel'] font-bold text-[12.5px] border ${
                          count > 0
                            ? 'bg-[#130B1F] border-[#D4B876] text-[#D4B876]'
                            : 'bg-[#130B1F] border-[#3A2555] text-[#8B7A9E]'
                        }`}
                      >
                        ×{count}
                      </span>
                    </div>

                    <div
                      className="font-['Cinzel'] font-bold text-[13.5px] mt-2 truncate"
                      style={{ color: attrColor }}
                    >
                      {rKey === 'Battle' ? 'COMBAT' : rKey.toUpperCase()} RELIC
                    </div>
                    <div className="text-[12px] font-sans text-[#B7A9CC] mt-0.5 leading-snug">
                      {isAttr
                        ? `+4 to one ${rKey} roll`
                        : '+1 ATK & +1 ARM in fight'}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#44305F]">
                    {count > 0 ? (
                      <button
                        onClick={() =>
                          setActiveGiftRelicKey(isGiftOpen ? null : rKey)
                        }
                        className="w-full py-1.5 rounded-lg bg-[#D4B876]/20 hover:bg-[#D4B876]/30 border border-[#D4B876] font-['Cinzel'] font-bold text-[11.5px] text-[#F4F1F8] uppercase tracking-[0.8px] transition"
                      >
                        {isGiftOpen ? 'CANCEL ✕' : 'GIVE TO FRIEND'}
                      </button>
                    ) : (
                      <div className="text-center font-['Cinzel'] font-bold text-[11px] text-[#8B7A9E] py-1">
                        NONE HELD
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gift Friend Drawer when a Relic box is tapped */}
          {activeGiftRelicKey && (relics[activeGiftRelicKey] || 0) > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#1E1232] border-2 border-[#D4B876] space-y-2.5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="font-['Cinzel'] font-bold text-[12.5px] text-[#D4B876] uppercase">
                  SEND 1 {activeGiftRelicKey === 'Battle' ? 'COMBAT' : activeGiftRelicKey.toUpperCase()} RELIC TO:
                </span>
                <button
                  onClick={() => setActiveGiftRelicKey(null)}
                  className="text-xs text-[#B7A9CC] hover:text-[#F4F1F8]"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {partyFriends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => {
                      onGiveRelic(activeGiftRelicKey, friend.name);
                      setGiftBanner(
                        `Sent 1 ${activeGiftRelicKey} Relic to ${friend.name}!`
                      );
                      setActiveGiftRelicKey(null);
                    }}
                    className="py-2.5 px-2 rounded-xl bg-[#2A1B40] hover:bg-[#D4B876]/25 border border-[#D4B876]/60 text-center transition"
                  >
                    <div className="font-['Cinzel'] font-bold text-[12.5px] text-[#F4F1F8] truncate">
                      {friend.name}
                    </div>
                    <div className="text-[11px] font-sans text-[#B7A9CC] mt-0.5">
                      {friend.className}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CLUES (Task 13, 15 Oct): what canon says you hold at the end of each day played ("You hold:" on the
              day summary card, docs/canon/episode-*.md), newest first. Keepsakes stay retired (Core Rules §14). */}
          <div className="pt-2 space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <span className="font-['Cinzel'] font-bold text-[12px] tracking-[1.2px] text-[#D4B876] uppercase">
                📜 Found Along the Road
              </span>
              <span className="text-[11.5px] font-sans text-[#B7A9CC]">Carried in your pack</span>
            </div>
            {(() => {
              const held = CHAPTER_SCRIPTS.filter(
                (c) => c.week < currentWeek || (c.week === currentWeek && c.day < currentDay) || completedDays.includes(`${c.week}-${c.day}`)
              )
                .map((c) => {
                  const sm = c.steps.find((st) => st.t === 'summary');
                  const line = sm && sm.t === 'summary' ? sm.lines.find((l) => /^You hold:/.test(l)) : undefined;
                  return line ? { key: `${c.week}-${c.day}`, week: c.week, day: c.day, text: line.replace(/^You hold:\s*/, '') } : null;
                })
                .filter((x): x is { key: string; week: number; day: number; text: string } => Boolean(x))
                .reverse();
              if (!held.length)
                return <p className="text-[13px] font-sans text-[#8B7A9E] px-0.5">Nothing yet.</p>;
              return held.map((h) => (
                <div key={h.key} className="p-3 rounded-xl bg-[#180F29] border border-[#3A2555] flex items-baseline gap-2.5">
                  <span className="font-['Cinzel'] font-bold text-[10.5px] text-[#D4B876] shrink-0 tabular-nums">W{h.week}·D{h.day}</span>
                  <span className="font-sans text-[13.5px] text-[#E6E0F0] leading-snug min-w-0">
                    <ScriptInline text={fillScriptTokens(h.text, { friends: party.filter((f) => f.id !== 'YOU').map((f) => f.name), partySize: party.length })} />
                  </span>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* =====================================================================
          2. SEEKER SUB-VIEW (#40 No Brackets, #41/#42/#50/#57 Technical Text
             Removed, #55/#56 Strong Fragment Borders & Solved State Visibility)
         ===================================================================== */}
      {subTab === 'SEEKER' && (
        <div className="space-y-3.5">
          {/* Core Rules §6, said the first time: until the player has filled a word of their own. */}
          {!Object.values(solvedWords).some((e) => e.w1 === party[0]?.name || e.w2 === party[0]?.name) && (
            <div className="pl-3 border-l-2 border-[#D4B876]/45">
              <p className="font-sans text-[14.5px] text-[#F4F1F8] leading-[1.45]">
                A Seeker Fragment. Two of its words are missing. Each one you find fills it in for the whole party, and is worth {GOLD_FRAGMENT_WORD_SOLVED} gold.
              </p>
            </div>
          )}
          {/* WEEK SELECTOR AT TOP OF SEEKER */}
          <div className="flex items-center justify-between bg-[#150D22] px-3 py-2 rounded-xl border border-[#3A2555]">
            <span className="font-['Cinzel'] font-bold text-[11.5px] tracking-[1px] text-[#B7A9CC] uppercase">
              WEEK
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6].map((w) => {
                const isLockedWeek = w > currentWeek;
                return (
                  <button
                    key={w}
                    disabled={isLockedWeek}
                    onClick={() => {
                      if (isLockedWeek) return;
                      setSelectedSeekerWeek(w);
                      setActiveJumbleSlot(null);
                      setTypedIndices([]);
                    }}
                    title={isLockedWeek ? `Reach Week ${w} to unlock these Seeker Fragments` : `View Week ${w} Seeker Fragments`}
                    className={`px-2.5 py-1 rounded-lg font-['Cinzel'] font-bold text-[12px] transition ${
                      selectedSeekerWeek === w
                        ? 'bg-[#2E1B42] border border-[#D4B876] text-[#D4B876]'
                        : isLockedWeek
                        ? 'bg-[#0D0714] text-[#8B7A9E]/45 cursor-not-allowed'
                        : 'bg-[#0D0714] text-[#8B7A9E] hover:text-[#F4F1F8]'
                    }`}
                  >
                    {isLockedWeek ? `🔒 W${w}` : `W${w}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* HEADER + FULL VERSES TOGGLE */}
          <div className="flex items-center justify-between px-0.5">
            <span className="font-['Cinzel'] font-bold text-[12px] tracking-[1px] text-[#D4B876] uppercase">
              WEEK {selectedSeekerWeek} FRAGMENTS · NEWEST FIRST
            </span>
            <button
              onClick={() => setShowScriptureDrawer(!showScriptureDrawer)}
              className="text-[11.5px] font-['Cinzel'] font-bold text-[#B7A9CC] hover:text-[#D4B876] uppercase"
            >
              {showScriptureDrawer ? 'HIDE VERSES ▲' : 'DARK MOON VERSES ▼'}
            </button>
          </div>

          {/* Collapsible Dark Moon Scripture Verses */}
          {showScriptureDrawer && (
            <div className="rounded-2xl bg-[#1E1232] border border-[#D4B876]/60 p-3.5 space-y-2.5 shadow-lg">
              <div className="font-['Cinzel'] font-bold text-[12px] tracking-[1px] text-[#D4B876] uppercase">
                DARK MOON VERSES
              </div>
              {/* Canon's passages word for word, each joining the Bag once its Gathering has read it (bagVerses.ts). */}
              {heardVerses.length === 0 && (
                <div className="text-[13px] font-sans text-[#B7A9CC]">None yet.</div>
              )}
              {heardVerses.map((v) => {
                const key = `${v.week}-${v.title}`;
                const open = !!openVerses[key];
                return (
                  <div key={key} className="rounded-xl bg-[#130B1F] border border-[#3A2555]">
                    <button
                      type="button"
                      onClick={() => setOpenVerses((p) => ({ ...p, [key]: !p[key] }))}
                      className="w-full flex items-center justify-between gap-2 p-3 text-left font-['Cinzel'] font-bold text-[12px] text-[#D4B876]"
                    >
                      <span>Week {v.week} · {v.title}</span>
                      <span className="text-[#B7A9CC]">{open ? '▲' : '▼'}</span>
                    </button>
                    {open && (
                      <div className="px-3 pb-3">
                        <NarrationBlock text={v.text} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* #55 & #56: ALL 6 FRAGMENTS COLLAPSIBLE (Stronger Borders, Solved vs Unsolved Distinct, Zero Technical Text #41/#42/#50) */}
          <div className="space-y-2.5">
            {weekFragments.map((frag) => {
              const isOpen = !!expandedFragIds[frag.id];
              const sEntry = solvedWords[frag.id] || {};
              const w1Done = Boolean(sEntry.w1);
              const w2Done = Boolean(sEntry.w2);
              const solvedCount = (w1Done ? 1 : 0) + (w2Done ? 1 : 0);
              const isFragFullySolved = w1Done && w2Done;
              const isJumbleHere = activeJumbleSlot?.fragId === frag.id;

              return (
                <div
                  key={frag.id}
                  className={`rounded-2xl bg-[#1E1232] overflow-hidden shadow-md transition ${
                    isFragFullySolved
                      ? 'border-2 border-[#6FD39A]/70'
                      : 'border border-[#7E68B8]'
                  }`}
                >
                  {/* Card Header Strip (#2E1B42) */}
                  <button
                    onClick={() => toggleFragmentAccordion(frag.id)}
                    className="w-full px-3.5 py-2.5 bg-[#2E1B42] flex items-center justify-between gap-2 text-left hover:bg-[#382653] transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`px-2 py-0.5 rounded-md font-['Cinzel'] font-bold text-[11px] shrink-0 border ${
                          isFragFullySolved
                            ? 'bg-[#6FD39A]/20 text-[#6FD39A] border-[#6FD39A]/50'
                            : 'bg-[#130B1F] text-[#D4B876] border-[#D4B876]/50'
                        }`}
                      >
                        W{frag.week}·D{frag.day}
                      </span>
                      <span className="font-['Cinzel'] font-bold text-[13.5px] text-[#F4F1F8] truncate">
                        {frag.placeLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`font-['Cinzel'] font-bold text-[11px] ${
                          isFragFullySolved ? 'text-[#6FD39A]' : 'text-[#D4B876]'
                        }`}
                      >
                        {isFragFullySolved ? '✓ SOLVED' : `${solvedCount}/2`}
                      </span>
                      <span className="text-[#B7A9CC] text-[12px]">
                        {isOpen ? '▴' : '▾'}
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-3.5 bg-[#1E1232] space-y-3">
                      {([1, 2] as const).some((w) => hintHas(seekerFirstLetterHints[frag.id], w)) && !isFragFullySolved && (
                        <div className="px-3 py-1.5 rounded-lg bg-[#6FD39A]/15 border border-[#6FD39A]/50 flex items-center justify-between gap-2 text-[12px] font-sans text-[#6FD39A]">
                          <span className="font-semibold">
                            {([1, 2] as const)
                              .filter((w) => hintHas(seekerFirstLetterHints[frag.id], w))
                              .map((w) => `Word ${w} starts with “${(w === 1 ? frag.word1 : frag.word2)[0].toUpperCase()}”`)
                              .join(' · ')}
                          </span>
                        </div>
                      )}
                      {renderFragmentSentence(frag)}

                      {/* Interactive Letter Unjumble Tray with Blank Letter Slots (#9) */}
                      {isJumbleHere && activeJumbleSlot && (
                        <div className="p-3 rounded-xl bg-[#130B1F] border border-[#D4B876]/60 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-['Cinzel'] font-bold text-[11.5px] text-[#D4B876] uppercase">
                              UNJUMBLE WORD {activeJumbleSlot.slot + 1} (+{GOLD_FRAGMENT_WORD_SOLVED}G)
                            </span>
                            {typedIndices.length > 0 && (
                              <button
                                onClick={() => setTypedIndices([])}
                                className="text-[12px] font-sans text-[#B7A9CC] hover:text-[#F4F1F8]"
                              >
                                Clear ✕
                              </button>
                            )}
                          </div>

                          {wordLockNotice && (
                            <p className="text-[12.5px] font-sans text-[#E0645C]">{wordLockNotice}</p>
                          )}

                          {/* #6: Full 4-Sided Yellow Border Boxes for Players to Fill In and Visualize */}
                          <div className="flex flex-wrap items-center gap-1.5 py-1">
                            {(activeJumbleSlot.slot === 0
                              ? frag.jumble1
                              : frag.jumble2
                            ).map((_, slotPos) => {
                              const jumbleArr =
                                activeJumbleSlot.slot === 0
                                  ? frag.jumble1
                                  : frag.jumble2;
                              const targetWord =
                                activeJumbleSlot.slot === 0 ? frag.word1 : frag.word2;
                              const filledIdx = typedIndices[slotPos];
                              const filledLetter =
                                filledIdx !== undefined ? jumbleArr[filledIdx] : null;
                              const showHintFirstLetter =
                                !filledLetter &&
                                slotPos === 0 &&
                                hintHas(seekerFirstLetterHints[frag.id], (activeJumbleSlot.slot + 1) as 1 | 2);
                              return (
                                <button
                                  key={slotPos}
                                  type="button"
                                  disabled={!filledLetter}
                                  onClick={() => {
                                    if (filledLetter) {
                                      setTypedIndices((prev) =>
                                        prev.filter((_, i) => i !== slotPos)
                                      );
                                    }
                                  }}
                                  className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center font-['Cinzel'] font-bold text-[15px] transition ${
                                    filledLetter
                                      ? 'bg-[#2A1B40] border-[#6FD39A] text-[#6FD39A] shadow-sm'
                                      : showHintFirstLetter
                                      ? 'bg-[#6FD39A]/15 border-[#6FD39A] text-[#6FD39A]'
                                      : 'bg-[#241638] border-[#E5C158] text-[#F3D88B] shadow-inner'
                                  }`}
                                  title={
                                    filledLetter
                                      ? 'Tap to remove letter'
                                      : showHintFirstLetter
                                      ? `Fan-Out Hint: First letter is ${targetWord[0].toUpperCase()}`
                                      : 'Tap a letter tile below to fill this box'
                                  }
                                >
                                  {filledLetter ||
                                    (showHintFirstLetter
                                      ? targetWord[0].toUpperCase()
                                      : '')}
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {(activeJumbleSlot.slot === 0
                              ? frag.jumble1
                              : frag.jumble2
                            ).map((letter, lIdx) => {
                              const used = typedIndices.includes(lIdx);
                              return (
                                <button
                                  key={lIdx}
                                  disabled={used}
                                  onClick={() =>
                                    handleTapLetter(frag, activeJumbleSlot.slot, lIdx)
                                  }
                                  className={`w-10 h-10 rounded-lg font-['Cinzel'] font-bold text-[15px] border transition ${
                                    used
                                      ? 'bg-[#0D0714] border-[#3A2555] text-[#5A4B70]'
                                      : 'bg-[#2A1B40] border-[#D4B876] text-[#F4F1F8] hover:bg-[#D4B876]/25'
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
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   STORE TAB VIEW (#59 — 2-Column RPG Item Box Grid for Class Gear & Stone Relics)
   ============================================================================ */
interface StoreTabViewProps {
  gold: number;
  characterClass: ClassName;
  weaponLevel: number;
  armorLevel: number;
  relics: Record<string, number>;
  currentWeek?: number;
  onBuyGear: (type: 'weapon' | 'armor', cost: number) => void;
  onBuyRelic: (relicType: string, cost: number) => void;
}

export const StoreTabView: React.FC<StoreTabViewProps> = ({
  gold,
  characterClass,
  weaponLevel,
  armorLevel,
  relics,
  currentWeek = 2,
  onBuyGear,
  onBuyRelic,
}) => {
  const classMeta = CLASS_META[characterClass];
  const nextWeaponLvl = weaponLevel < 5 ? weaponLevel + 1 : null;
  const nextArmorLvl = armorLevel < 5 ? armorLevel + 1 : null;
  const epMeta = EPISODE_NUMBERS[currentWeek - 1] || EPISODE_NUMBERS[0];

  return (
    <div className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-4 bg-[#0D0714] text-[#F4F1F8]">
      {/* WEEK COMBAT READINESS BENCHMARK CARD */}
      <div className="p-3 rounded-xl bg-[#180F29] border border-[#5E4585] space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-['Cinzel'] font-bold text-[11px] tracking-[1px] text-[#E5C158] uppercase">
            ⚔️ WEEK {currentWeek} COMBAT READINESS
          </span>
          <span className="font-['Cinzel'] font-bold text-[11px] text-[#6FD39A]">
            {weaponLevel >= Math.min(5, currentWeek) && armorLevel >= Math.min(5, currentWeek)
              ? '✓ ON CURVE FOR WEEK ' + currentWeek
              : 'UPGRADE RECOMMENDED'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-0.5 text-[12.5px] font-sans">
          <div className="p-2 rounded-lg bg-[#130B1F] border border-[#3A2555] flex items-center justify-between">
            <span className="text-[#B7A9CC]">Your WEP vs Foe DEF</span>
            <span className="font-bold text-[#E5C158]">
              {GEAR_TABLE[weaponLevel].weapon} vs {epMeta.wDef}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-[#130B1F] border border-[#3A2555] flex items-center justify-between">
            <span className="text-[#B7A9CC]">Your ARM vs Foe ATK</span>
            <span className="font-bold text-[#7AA7FF]">
              {GEAR_TABLE[armorLevel].armor} vs {epMeta.wAtk}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: 2-COLUMN CLASS GEAR BOXES (#59) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <span className="font-['Cinzel'] font-bold text-[12px] tracking-[1.2px] text-[#D4B876] uppercase">
            CLASS GEAR · {characterClass.toUpperCase()}
          </span>
          <span className="text-[12px] font-sans text-[#B7A9CC]">Levels 1–5</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Weapon Box */}
          <div className="p-3.5 rounded-2xl bg-[#2A1B40] border border-[#7E68B8] flex flex-col justify-between min-h-[146px] shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[18px]">⚔️</span>
                <span className="px-2 py-0.5 rounded bg-[#130B1F] border border-[#D4B876]/50 font-['Cinzel'] font-bold text-[11px] text-[#D4B876]">
                  Lv.{weaponLevel}/5
                </span>
              </div>
              <div className="font-['Cinzel'] font-bold text-[14px] text-[#F4F1F8] mt-2 truncate">
                {classMeta.weapon}
              </div>
              <div className="text-[12.5px] font-sans text-[#B7A9CC] mt-0.5">
                ATK {GEAR_TABLE[weaponLevel].weapon}
                {nextWeaponLvl ? ` → ${GEAR_TABLE[nextWeaponLvl].weapon}` : ' (MAX)'}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#44305F]">
              {nextWeaponLvl ? (
                <button
                  disabled={gold < GEAR_TABLE[nextWeaponLvl].cost}
                  onClick={() => onBuyGear('weapon', GEAR_TABLE[nextWeaponLvl].cost)}
                  className="w-full py-2 rounded-xl bg-[#D4B876]/22 hover:bg-[#D4B876]/32 border border-[#D4B876] font-['Cinzel'] font-bold text-[11.5px] text-[#F4F1F8] disabled:opacity-40 transition whitespace-nowrap"
                >
                  UPGRADE · {GEAR_TABLE[nextWeaponLvl].cost}G
                </button>
              ) : (
                <div className="text-center font-['Cinzel'] font-bold text-[11.5px] text-[#6FD39A] py-1">
                  ✓ MAX LEVEL
                </div>
              )}
            </div>
          </div>

          {/* Armor Box */}
          <div className="p-3.5 rounded-2xl bg-[#2A1B40] border border-[#7E68B8] flex flex-col justify-between min-h-[146px] shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[18px]">🛡️</span>
                <span className="px-2 py-0.5 rounded bg-[#130B1F] border border-[#D4B876]/50 font-['Cinzel'] font-bold text-[11px] text-[#D4B876]">
                  Lv.{armorLevel}/5
                </span>
              </div>
              <div className="font-['Cinzel'] font-bold text-[14px] text-[#F4F1F8] mt-2 truncate">
                {classMeta.armor}
              </div>
              <div className="text-[12.5px] font-sans text-[#B7A9CC] mt-0.5">
                ARM {GEAR_TABLE[armorLevel].armor}
                {nextArmorLvl ? ` → ${GEAR_TABLE[nextArmorLvl].armor}` : ' (MAX)'}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#44305F]">
              {nextArmorLvl ? (
                <button
                  disabled={gold < GEAR_TABLE[nextArmorLvl].cost}
                  onClick={() => onBuyGear('armor', GEAR_TABLE[nextArmorLvl].cost)}
                  className="w-full py-2 rounded-xl bg-[#D4B876]/22 hover:bg-[#D4B876]/32 border border-[#D4B876] font-['Cinzel'] font-bold text-[11.5px] text-[#F4F1F8] disabled:opacity-40 transition whitespace-nowrap"
                >
                  UPGRADE · {GEAR_TABLE[nextArmorLvl].cost}G
                </button>
              ) : (
                <div className="text-center font-['Cinzel'] font-bold text-[11.5px] text-[#6FD39A] py-1">
                  ✓ MAX LEVEL
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: 2-COLUMN RELIC BOXES (#59 — Item Boxes, Not Wide Banners!) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <span className="font-['Cinzel'] font-bold text-[12px] tracking-[1.2px] text-[#D4B876] uppercase">
            RELICS · {GOLD_RELIC_COST}G EACH
          </span>
          <span className="text-[12px] font-sans text-[#B7A9CC]">Use or Gift in BAG</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {(['Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim', 'Battle'] as const).map(
            (rKey) => {
              const count = relics[rKey] || 0;
              const isAttr = rKey !== 'Battle';
              const attrColor = isAttr
                ? ATTRIBUTE_META[rKey as AttributeName].color
                : '#D6DCEB';
              return (
                <div
                  key={rKey}
                  className="p-3.5 rounded-2xl bg-[#2A1B40] border border-[#3A2555] hover:border-[#7E68B8] flex flex-col justify-between min-h-[132px] shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className="w-8 h-8 rounded-xl bg-[#130B1F] border flex items-center justify-center text-[15px] shrink-0"
                        style={{ borderColor: attrColor, color: attrColor }}
                      >
                        ♦
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#130B1F] border border-[#3A2555] font-['Cinzel'] font-bold text-[11.5px] text-[#B7A9CC]">
                        Held: {count}
                      </span>
                    </div>

                    <div
                      className="font-['Cinzel'] font-bold text-[13.5px] mt-2 truncate"
                      style={{ color: attrColor }}
                    >
                      {rKey === 'Battle' ? 'COMBAT' : rKey.toUpperCase()} RELIC
                    </div>
                    <div className="text-[12px] font-sans text-[#B7A9CC] mt-0.5 leading-snug">
                      {isAttr
                        ? `+4 to one ${rKey} roll`
                        : '+1 ATK & +1 ARM in fight'}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#44305F]">
                    <button
                      disabled={gold < GOLD_RELIC_COST}
                      onClick={() => onBuyRelic(rKey, GOLD_RELIC_COST)}
                      className="w-full py-1.5 rounded-lg bg-[#D4B876]/22 hover:bg-[#D4B876]/32 border border-[#D4B876] font-['Cinzel'] font-bold text-[11.5px] text-[#F4F1F8] disabled:opacity-40 transition whitespace-nowrap"
                    >
                      BUY · {GOLD_RELIC_COST}G
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};
