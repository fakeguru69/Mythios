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

const CUMULATIVE_SCRIPTURE = [
  {
    week: 1,
    verseTitle: 'Verse of the First Oath',
    lines: [
      'Five fell when the dark ate the moon; four were scattered, and one stayed close.',
      'Not every hand that tries will open it—some locks already know their key.',
    ],
  },
  {
    week: 2,
    verseTitle: 'Verse of the Answering',
    lines: [
      'One wall, and one king upon it; he opened his palm with his own knife.',
      'The power that gives is also the power that takes.',
    ],
  },
  {
    week: 3,
    verseTitle: 'Verse of the Price',
    lines: [
      'They no longer felt the cold, nor the blade, nor the long fear of dying.',
      'He never spoke a false word to his people—he only kept silent about the price.',
    ],
  },
  {
    week: 4,
    verseTitle: 'Verse of the Four',
    lines: [
      'Their blood remembers what the shards remember.',
      'Earth, wind, water, fire—the fifth heeds no element at all.',
    ],
  },
  {
    week: 5,
    verseTitle: 'Verse of the Binding',
    lines: [
      'Those who had stood nearest him, when he fell, stood on.',
      'Where he fell, under the dark moon, the five were joined.',
    ],
  },
  {
    week: 6,
    verseTitle: 'Verse of the Name',
    lines: [
      'They had known him all his life as one of the marked.',
      'What the four begin, the fifth shall end, and the throne rise whole.',
    ],
  },
];

interface BagTabViewProps {
  /** The party in play (2 to 6), the player first. */
  party: PartyFriend[];
  gold: number;
  relics: Record<string, number>;
  solvedWords: Record<string, { w1?: string; w2?: string }>;
  onSolveWord: (fragId: string, wordIndex: 1 | 2, solverName: string) => void;
  onGiveRelic: (relicKey: string, friendName: string) => void;
  watchPageStrokesLeft: number;
  onStrikeWatchPage: () => void;
  ledgerOpened: boolean;
  onAskGarrickForLedger: () => void;
  personalStakeText: string;
  currentWeek: number;
  currentDay: number;
  initialSubTab?: 'RELICS' | 'SEEKER' | 'ALL' | 'ITEMS' | 'SCROLLS';
  seekerFirstLetterHints?: Record<string, boolean>;
}

export const BagTabView: React.FC<BagTabViewProps> = ({
  party,
  relics,
  solvedWords,
  onSolveWord,
  onGiveRelic,
  watchPageStrokesLeft,
  onStrikeWatchPage,
  ledgerOpened,
  onAskGarrickForLedger,
  personalStakeText,
  currentWeek,
  currentDay,
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
  const weekFragments = SEEKER_FRAGMENTS.filter((f) => f.week === selectedSeekerWeek).sort(
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
        onSolveWord(frag.id, wordIndex, 'Jennifer');
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
    return (
      <p className="font-['Cormorant_Garamond'] font-medium text-[20px] text-[#F4F1F8] leading-[1.6]">
        “
        {parts.map((part, idx) => {
          if (part === '{0}') {
            if (isW1Solved) {
              return (
                <span
                  key={idx}
                  className="font-['Cormorant_Garamond'] font-bold text-[20px] text-[#6FD39A] underline decoration-[#6FD39A]/60 underline-offset-4 px-1"
                >
                  {frag.word1}
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
                  {frag.word2}
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
                      {rKey.toUpperCase()} RELIC
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
                  SEND 1 {activeGiftRelicKey.toUpperCase()} RELIC TO:
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

          {/* PHYSICAL EVIDENCE & PERSONAL KEEPSAKES LOCKER */}
          <div className="pt-2 space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <span className="font-['Cinzel'] font-bold text-[12px] tracking-[1.2px] text-[#D4B876] uppercase">
                📜 PHYSICAL EVIDENCE & KEEPSAKES
              </span>
              <span className="text-[11.5px] font-sans text-[#B7A9CC]">
                Week 1–{currentWeek} Clues
              </span>
            </div>

            {/* Personal Stake Keepsake */}
            <div className="p-3 rounded-xl bg-[#180F29] border border-[#5E4585] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-['Cinzel'] font-bold text-[11.5px] text-[#E5C158] uppercase">
                  🕯️ YOUR PERSONAL OATH & STAKE
                </span>
                <span className="text-[11px] font-['Cinzel'] font-bold text-[#6FD39A]">
                  CARRIED SINCE DAY 1
                </span>
              </div>
              <p className="font-sans text-[13.5px] text-[#E6E0F0] leading-snug">
                {personalStakeText}
              </p>
            </div>

            {/* 1. The Hollow Wake Inn Guest Ledger (Unlocked from W1·D2 onward) */}
            {(currentWeek > 1 || currentDay >= 2) && (
              <div className="p-3 rounded-xl bg-[#180F29] border border-[#3A2555] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-['Cinzel'] font-bold text-[12.5px] text-[#F4F1F8]">
                      📖 THE HOLLOW WAKE INN GUEST LEDGER
                    </div>
                    <div className="text-[11.5px] font-sans text-[#B7A9CC]">
                      W1·D2 · Four guest lines in the margin, one line torn free
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onAskGarrickForLedger}
                    className="px-2.5 py-1 rounded-lg bg-[#2A1B40] hover:bg-[#3A2555] border border-[#D4B876]/70 font-['Cinzel'] font-bold text-[10.5px] text-[#E5C158] whitespace-nowrap transition shrink-0"
                  >
                    {ledgerOpened ? '✓ INSPECTED' : 'INSPECT PAGE'}
                  </button>
                </div>
                {ledgerOpened && (
                  <div className="p-2.5 rounded-lg bg-[#130B1F] border border-[#D4B876]/40 text-[13px] font-sans text-[#E6E0F0] leading-snug">
                    {currentWeek === 1
                      ? 'Four travellers checked into the Hollow Wake Inn the night before the road ambush—each riding in from a different ridge village. A fifth tin cup was set at their corner table, though no fifth name was signed.'
                      : currentWeek === 2
                      ? 'Cross-checking the inn ledger against the Mill shows the first two guests rode in from Tamsin’s woods and Corin’s mill-valley. A fifth cup was set at their table, though no fifth name was signed.'
                      : 'Four travellers checked into the Hollow Wake Inn—each matching one of the ridge villages where Tamsin, Corin, Wren, and Joss were taken. A fifth cup was set at their table, though no fifth name was signed.'}
                  </div>
                )}
              </div>
            )}

            {/* 2. Charcoal Rubbing & Watch-Log (Progressive by Week) */}
            <div className="p-3 rounded-xl bg-[#180F29] border border-[#3A2555] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-['Cinzel'] font-bold text-[12.5px] text-[#F4F1F8]">
                    🪨 {currentWeek >= 5 ? 'HIGHWALL WATCH-LOG RUBBING' : 'MEIRA’S CHARCOAL RUBBING'}
                  </div>
                  <div className="text-[11.5px] font-sans text-[#B7A9CC]">
                    {currentWeek >= 5
                      ? 'W5 · Indented parchment from the watch-post'
                      : 'W1·D1 · Half-burned rubbing from your cargo box'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onStrikeWatchPage}
                  className="px-2.5 py-1 rounded-lg bg-[#2A1B40] hover:bg-[#3A2555] border border-[#D4B876]/70 font-['Cinzel'] font-bold text-[10.5px] text-[#E5C158] whitespace-nowrap transition shrink-0"
                >
                  {watchPageStrokesLeft > 0
                    ? `SHADE RUBBING (${watchPageStrokesLeft} LEFT)`
                    : '✓ FULLY REVEALED'}
                </button>
              </div>
              {watchPageStrokesLeft === 0 && (
                <div className="p-2.5 rounded-lg bg-[#130B1F] border border-[#6FD39A]/50 text-[13px] font-sans text-[#E6E0F0] leading-snug">
                  {currentWeek >= 5 ? (
                    <>
                      Beneath the charcoal shading, the indented watch-note emerges:{' '}
                      <strong className="text-[#6FD39A]">
                        “FOUR SOCKETS ANSWERED — FIFTH INSIDE THE WALL.”
                      </strong>
                    </>
                  ) : (
                    <>
                      Beneath the charcoal shading, the indented margin note emerges:{' '}
                      <strong className="text-[#6FD39A]">
                        “FOUR MARKS ON THE RIDGE — FOLLOW THE OLD STONES.”
                      </strong>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 3. Progressive Fair-Play Mystery Plants (Weeks 2–5) */}
            {currentWeek >= 2 && (
              <div className="p-3 rounded-xl bg-[#180F29] border border-[#3A2555] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8]">
                    ⚫ BLACK CIRCLE CHARCOAL RUBBING
                  </span>
                  <span className="text-[10.5px] font-['Cinzel'] font-bold text-[#D4B876]">
                    W2 · THE STANDING STONE
                  </span>
                </div>
                <p className="font-sans text-[12.5px] text-[#B7A9CC] leading-snug">
                  A hollowed ring cut into the standing stone: “Until the throne rise whole.”
                </p>
              </div>
            )}

            {currentWeek >= 3 && (
              <div className="p-3 rounded-xl bg-[#180F29] border border-[#3A2555] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8]">
                    🪙 SCRAPED SILVER COIN & MEIRA’S GLOSS
                  </span>
                  <span className="text-[10.5px] font-['Cinzel'] font-bold text-[#D4B876]">
                    W3 · SUNKEN KEEP
                  </span>
                </div>
                <p className="font-sans text-[12.5px] text-[#B7A9CC] leading-snug">
                  Old-mint coin with the king’s crest scraped off—matching the coin Garrick turns over his knuckles—and Meira’s note translating “the marked” as “moon-blood.”
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          2. SEEKER SUB-VIEW (#40 No Brackets, #41/#42/#50/#57 Technical Text
             Removed, #55/#56 Strong Fragment Borders & Solved State Visibility)
         ===================================================================== */}
      {subTab === 'SEEKER' && (
        <div className="space-y-3.5">
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
                CUMULATIVE DARK MOON VERSES
              </div>
              {CUMULATIVE_SCRIPTURE.filter((v) => v.week <= currentWeek).map((v) => (
                <div
                  key={v.week}
                  className="p-3 rounded-xl bg-[#130B1F] border border-[#3A2555] space-y-1"
                >
                  <div className="font-['Cinzel'] font-bold text-[12px] text-[#D4B876]">
                    Week {v.week} · {v.verseTitle}
                  </div>
                  {v.lines.map((line, lIdx) => (
                    <p
                      key={lIdx}
                      className="font-['Cormorant_Garamond'] font-medium text-[19px] text-[#F4F1F8] leading-[1.5]"
                    >
                      “{line}”
                    </p>
                  ))}
                </div>
              ))}
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
                      {seekerFirstLetterHints[frag.id] && !isFragFullySolved && (
                        <div className="px-3 py-1.5 rounded-lg bg-[#6FD39A]/15 border border-[#6FD39A]/50 flex items-center justify-between gap-2 text-[12px] font-sans text-[#6FD39A]">
                          <span className="font-semibold">
                            🔓 Fan-Out 1st-Letter Hint: Word 1 starts with “{frag.word1[0].toUpperCase()}” · Word 2 starts with “{frag.word2[0].toUpperCase()}”
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
                                Boolean(seekerFirstLetterHints[frag.id]);
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
                      {rKey.toUpperCase()} RELIC
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
