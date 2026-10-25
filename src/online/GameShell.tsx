// The game shell (docs/design/one-thread-18oct.md, phase A; Fake Guru, 18 Oct: "do build new design"). Once the
// season is under way, a party opens straight into the game: a top bar (the series; the party's name, which opens the
// party panel; the day; the gold) and four tabs, STORY · RECORD · BAG · STORE. The story is one thread: the day's
// chapter, and once it is done the fire below it (Day 7: the Gathering in its place). There is no party page and no
// way "back to the party": what the party page held that is not a tab now sits in the panel.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { supabase, type MemberRow, type PartyRow } from './supabaseClient';
import { useBareShell } from './ui';
import OnlineDay, { type DayInfo } from './OnlineDay';
import OnlineCampfire from './OnlineCampfire';
import OnlineGathering, { GatheringCard } from './OnlineGathering';
import OnlineChest from './OnlineChest';
import OnlineCasebook from './OnlineCasebook';
import OnlineStore from './OnlineStore';
import { OnlineFoundShelf, OnlineVersesShelf } from './OnlineBagShelves';
import { EarlierFire, GarrickMorning, partyDayStart } from './FireChat';
import LastNight from './LastNight';
import { NotebookProvider } from './Markable';
import { RecordTabView } from '../components/RecordTabView';
import { ATTRIBUTE_META, CLASS_META, GEAR_TABLE, getTierInfo, type AttributeName, type ClassName } from '../data/mythiosRulesData';
import { alertOpensPanel, onAlertLink, takeAlertScreen } from './alertLink';

type Tab = 'story' | 'record' | 'bag' | 'store';
const TABS: { key: Tab; label: string }[] = [
  { key: 'story', label: 'STORY' },
  { key: 'record', label: 'RECORD' },
  { key: 'bag', label: 'BAG' },
  { key: 'store', label: 'STORE' },
];
type BagShelf = 'chest' | 'verses' | 'found' | 'journal';
const BAG_SHELVES: [BagShelf, string][] = [
  ['chest', 'The Seeker Chest'],
  ['verses', 'The Dark Moon Verses'],
  ['found', 'Found Along the Road'],
  ['journal', 'The Journal'],
];
const ATTR_ORDER: AttributeName[] = ['Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim'];

export default function GameShell({
  party,
  userId,
  me,
  approved,
  members,
  chatOpen,
  panel,
}: {
  party: PartyRow;
  userId: string;
  me: MemberRow;
  approved: MemberRow[];
  members: MemberRow[];
  chatOpen: boolean;
  /** Everything from the old party page that is not a tab: friends, invite, notifications, the Gathering's time… */
  panel: (shell: { joinGathering: () => void }) => ReactNode;
}) {
  useBareShell();
  const [tab, setTab] = useState<Tab>('story');
  const [panelOpen, setPanelOpen] = useState(false);
  const [info, setInfo] = useState<DayInfo | null>(null);
  const [gold, setGold] = useState<number | null>(null);
  const [storyKey, setStoryKey] = useState(0);
  const [bagView, setBagView] = useState<BagShelf>('chest');
  // The live Gathering counts a friend as present the moment it is open, so it is mounted only once the friend taps to
  // join (handoff ledger piece 1). A new week starts again from the card.
  const [joined, setJoined] = useState<string | null>(null);
  const [recordData, setRecordData] = useState<{
    stats: Record<string, number>;
    earnedBadgeIds: string[];
    leads?: Record<string, { isLead: boolean; leadVal?: number; leadFriend?: string }>;
    leadsCount?: number;
    seasonEnded?: boolean;
    mySeasonTitle?: any;
    seasonTitles?: any[];
  } | null>(null);

  const loadRecord = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('my_record', { p_party: party.id });
      if (!error && data) {
        setRecordData(data as any);
      }
    } catch {
      // fallback gracefully
    }
  }, [party.id]);

  useEffect(() => {
    if (tab === 'record') {
      loadRecord();
    }
  }, [tab, loadRecord, storyKey]);

  const gatheringKey = info ? `${party.id}:${info.week}` : '';
  const inGathering = Boolean(info?.gathering) && joined === gatheringKey;
  const joinGathering = () => {
    setJoined(gatheringKey);
    setPanelOpen(false);
    setTab('story');
    window.scrollTo({ top: 0 });
  };

  const onInfo = useCallback((i: DayInfo) => {
    setInfo(i);
    setGold(i.gold);
  }, []);
  // Each tab keeps its own place (handoff ledger piece 3): leaving the story at the fire and coming back finds the fire,
  // not the top of the day.
  const scrolls = useRef<Partial<Record<Tab, number>>>({});
  const show = (t: Tab) => {
    // Whichever tab you move to, the day's data is read again (gold, gear, words found), so the top bar and the Record
    // never show old numbers (handoff ledger piece 5).
    if (t !== tab) setStoryKey((k) => k + 1);
    scrolls.current[tab] = window.scrollY;
    setTab(t);
    const y = scrolls.current[t] ?? 0;
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.scrollTo({ top: y })));
  };
  // The day turns over at 5:00am on the party's clock (handoff ledger piece 2). An app left open overnight reloads the
  // story at that moment, and when it comes back to the front on a new day; a failed load retries (OnlineDay).
  const dayStartRef = useRef(partyDayStart(party.time_zone));
  useEffect(() => {
    const turn = () => {
      const now = partyDayStart(party.time_zone);
      if (now !== dayStartRef.current) {
        dayStartRef.current = now;
        setStoryKey((k) => k + 1);
      }
    };
    const toNext = () => new Date(partyDayStart(party.time_zone)).getTime() + 86400000 - Date.now() + 1500;
    let timer = window.setTimeout(function tick() {
      turn();
      timer = window.setTimeout(tick, Math.max(toNext(), 60000));
    }, Math.max(toNext(), 1000));
    const back = () => document.visibilityState === 'visible' && turn();
    document.addEventListener('visibilitychange', back);
    window.addEventListener('focus', back);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', back);
      window.removeEventListener('focus', back);
    };
  }, [party.time_zone]);
  // A tapped notification about this party opens the screen it is about (alertLink.ts): the poll and the Gathering's
  // time are in the panel; anything else is the story, with the fire alerts taken to the foot of the thread.
  const showRef = useRef(show);
  showRef.current = show;
  useEffect(() => {
    const open = (go: string | null) => {
      if (!go) return;
      if (alertOpensPanel(go)) {
        setPanelOpen(true);
        return;
      }
      setPanelOpen(false);
      showRef.current('story');
      if (go.startsWith('fire')) {
        window.setTimeout(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }), 400);
      }
    };
    open(takeAlertScreen(party.id));
    return onAlertLink((link) => {
      if (link.party === party.id) open(takeAlertScreen(party.id));
    });
  }, [party.id]);
  useEffect(() => {
    if (!panelOpen) return;
    const close = (e: KeyboardEvent) => e.key === 'Escape' && setPanelOpen(false);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [panelOpen]);

  const friends = approved.filter((r) => r.user_id !== userId);
  const dayLine = info ? (info.gathering ? `Week ${info.week}, the Gathering` : `Week ${info.week}, Day ${info.day}`) : '';

  return (
    <div className="min-h-screen flex flex-col" data-game-shell>
      <header className="sticky top-0 z-20 bg-[#150D22] border-b border-[#2C1D40] px-4 pt-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-['Cinzel'] font-bold text-[15px] tracking-[1px] text-[#D4B876]">Tales of the Dark Moon</div>
            <button
              className="text-left text-[14px] text-[#B7A9CC] truncate max-w-full"
              onClick={() => setPanelOpen(true)}
              aria-haspopup="dialog"
              data-party-name
            >
              {party.name} ▾{dayLine ? ` · ${dayLine}` : ''}
            </button>
          </div>
          {gold !== null && (
            <div className="shrink-0 font-bold text-[15px] text-[#E5C158] border border-[#D4B876] rounded-full px-3 py-1" data-gold>
              {gold.toLocaleString()}g
            </div>
          )}
        </div>
        <nav aria-label="Game" className="grid grid-cols-4 mt-2" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => show(t.key)}
              data-shell-tab={t.key}
              className={`py-2.5 font-['Cinzel'] font-bold text-[14px] border-b-2 ${
                tab === t.key ? 'text-[#E5C158] border-[#E5C158]' : 'text-[#8F82A6] border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 px-4 py-5 text-[16px]">
        {/* The story stays mounted behind the other tabs, so coming back finds your place in the thread. */}
        <div className={tab === 'story' ? 'space-y-5' : 'hidden'} data-pane="story">
          <NotebookProvider partyId={party.id}>
            {info && !info.gathering && <GarrickMorning partyId={party.id} timeZone={party.time_zone} enabled={chatOpen} />}
            {info && !info.gathering && <LastNight partyId={party.id} week={info.week} day={info.day} />}
            <OnlineDay
              partyId={party.id}
              friends={friends.map((r) => r.character_name)}
              partySize={approved.length}
              myClass={me.class}
              birthplace={me.birthplace ?? null}
              grandparent={me.grandparent_name ?? null}
              onClose={() => undefined}
              onOpenChest={() => {
                setBagView('chest');
                show('bag');
              }}
              onOpenStore={() => show('store')}
              onOpenFire={() => undefined}
              onOpenGathering={() => undefined}
              timeZone={party.time_zone}
              embedded
              onInfo={onInfo}
              reloadKey={storyKey}
            />
            {info?.gathering && !inGathering && (
              <GatheringCard partyId={party.id} isHost={party.host_id === userId} timeZone={party.time_zone} onOpen={joinGathering} />
            )}
            {inGathering && <OnlineGathering partyId={party.id} userId={userId} members={members} onClose={() => undefined} embedded />}
            {info && !info.gathering && info.finished && <FirePill />}
            {info && !info.gathering && info.finished && (
              <div data-thread-fire>
                <OnlineCampfire
                  key={`${info.week}-${info.day}`}
                  partyId={party.id}
                  userId={userId}
                  members={members}
                  chatOpen={chatOpen}
                  timeZone={party.time_zone}
                  onOpenChest={() => {
                    setBagView('chest');
                    show('bag');
                  }}
                />
              </div>
            )}
            {/* Before your own day is done: last night's talk, and you can still talk; tonight's fire waits (phase B). */}
            {info && !info.gathering && !info.finished && chatOpen && (
              <EarlierFire partyId={party.id} userId={userId} members={members} timeZone={party.time_zone} />
            )}
          </NotebookProvider>
        </div>

        {tab === 'record' && (
          <div data-pane="record">
            {!recordData ? (
              <div className="py-16 text-center space-y-2" data-record-loading>
                <div className="font-['Cinzel'] font-bold text-[14px] text-[#D4B876] tracking-[1.2px] uppercase">
                  Counting the Record…
                </div>
                <div className="text-[14px] font-sans text-[#B7A9CC]">
                  Reading your company's milestones from the road.
                </div>
              </div>
            ) : (
              <RecordTabView
                characterName={me.character_name ?? 'You'}
                characterClass={(me.class as ClassName) || 'Warrior'}
                secondAttr={
                  (me.second_attr as AttributeName) ||
                  (me.class === 'Warrior' ? 'Craft' :
                   me.class === 'Artificer' ? 'Might' :
                   me.class === 'Sage' ? 'Charm' :
                   me.class === 'Trickster' ? 'Agility' :
                   me.class === 'Assassin' ? 'Aim' :
                   'Intellect')
                }
                partyName={party.name}
                currentWeek={info?.week ?? 1}
                attributes={info?.attrs ?? { Might: 10, Craft: 10, Intellect: 10, Charm: 10, Agility: 10, Aim: 10 }}
                weaponLevel={info?.weaponLevel ?? 1}
                armorLevel={info?.armorLevel ?? 1}
                stats={recordData.stats}
                earnedBadgeIds={recordData.earnedBadgeIds}
                partyLeads={recordData.leads}
                leadsCount={recordData.leadsCount}
                seasonEnded={recordData.seasonEnded}
                mySeasonTitle={recordData.mySeasonTitle}
                seasonTitles={recordData.seasonTitles}
              />
            )}
          </div>
        )}

        {tab === 'bag' && (
          <NotebookProvider partyId={party.id}>
            <div className="space-y-4" data-pane="bag">
              {/* The Bag's four shelves (Fake Guru, 18 Oct). */}
              <div className="grid grid-cols-2 gap-2" role="tablist">
                {BAG_SHELVES.map(([k, label]) => (
                  <button
                    key={k}
                    role="tab"
                    aria-selected={bagView === k}
                    onClick={() => setBagView(k)}
                    data-bag-shelf-tab={k}
                    className={`rounded-full px-3 py-2 text-[14px] font-semibold border ${
                      bagView === k ? 'bg-[#D4B876] text-[#1A0F26] border-[#D4B876]' : 'text-[#B7A9CC] border-[#3A2555]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {bagView === 'chest' && <OnlineChest partyId={party.id} onClose={() => undefined} embedded onChanged={() => setStoryKey((k) => k + 1)} />}
              {bagView === 'verses' && (
                <OnlineVersesShelf
                  partyId={party.id}
                  friends={friends.map((r) => r.character_name)}
                  partySize={approved.length}
                  reloadKey={storyKey}
                />
              )}
              {bagView === 'found' && (
                <OnlineFoundShelf
                  partyId={party.id}
                  friends={friends.filter((r) => r.session_zero_done_at).map((r) => ({ id: r.user_id, name: r.character_name }))}
                  partySize={approved.length}
                  reloadKey={storyKey}
                  onChanged={() => setStoryKey((k) => k + 1)}
                />
              )}
              {bagView === 'journal' && <OnlineCasebook partyId={party.id} onClose={() => undefined} embedded />}
            </div>
          </NotebookProvider>
        )}

        {tab === 'store' && (
          <div data-pane="store">
            <OnlineStore
              partyId={party.id}
              myClass={me.class}
              friends={friends.filter((r) => r.session_zero_done_at).map((r) => ({ id: r.user_id, name: r.character_name }))}
              onClose={() => show('story')}
              embedded
              onGold={setGold}
            />
          </div>
        )}
      </main>

      {panelOpen && (
        <div className="fixed inset-0 z-40 flex flex-col" role="dialog" aria-modal="true" aria-label="Your party" data-party-panel>
          <button className="flex-1 min-h-[48px] bg-[#08040D]/80" aria-label="Close" onClick={() => setPanelOpen(false)} />
          <div className="max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-[#5E4585] bg-[#1A1226] px-4 pt-3 pb-8 space-y-4 max-w-[440px] w-full mx-auto">
            <div className="flex items-center justify-between">
              <div className="w-10" />
              <div className="w-10 h-1.5 rounded-full bg-[#4A3266]" />
              <button className="w-10 text-right text-[22px] text-[#B7A9CC]" aria-label="Close" onClick={() => setPanelOpen(false)}>
                ×
              </button>
            </div>
            {panel({ joinGathering })}
          </div>
        </div>
      )}
    </div>
  );
}

/** "↓ The fire" (Phase 5, 24 Oct): once the day is done, a small button while tonight's fire is still below the screen. */
function FirePill() {
  const [below, setBelow] = useState(false);
  useEffect(() => {
    const check = () => {
      const el = document.querySelector('[data-thread-fire]');
      setBelow(Boolean(el) && el!.getBoundingClientRect().top > window.innerHeight - 40);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    const id = window.setInterval(check, 1000);
    return () => {
      window.removeEventListener('scroll', check);
      window.clearInterval(id);
    };
  }, []);
  if (!below) return null;
  // A slim bar on the bottom edge rather than a pill floating over the words (play test, 25 Oct: the pill covered a line
  // of the day summary). The page scrolls behind a solid strip, the way it does behind the tab bar.
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 bg-[#0E0818]/95 border-t border-[#2C1D40] px-4 py-2 flex justify-center">
        <button
          type="button"
          data-fire-pill
          onClick={() => document.querySelector('[data-thread-fire]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="rounded-full bg-[#D4B876] text-[#130B1F] font-semibold text-[15px] px-4 py-1.5 shadow-lg"
        >
          ↓ The fire
        </button>
      </div>
    </>
  );
}
