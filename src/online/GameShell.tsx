// The game shell (docs/design/one-thread-18oct.md, phase A; Fake Guru, 18 Oct: "do build new design"). Once the
// season is under way, a party opens straight into the game: a top bar (the series; the party's name, which opens the
// party panel; the day; the gold) and four tabs, STORY · RECORD · BAG · STORE. The story is one thread: the day's
// chapter, and once it is done the fire below it (Day 7: the Gathering in its place). There is no party page and no
// way "back to the party": what the party page held that is not a tab now sits in the panel.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { type MemberRow, type PartyRow } from './supabaseClient';
import { useBareShell } from './ui';
import OnlineDay, { type DayInfo } from './OnlineDay';
import OnlineCampfire from './OnlineCampfire';
import OnlineGathering, { GatheringCard } from './OnlineGathering';
import OnlineChest from './OnlineChest';
import OnlineCasebook from './OnlineCasebook';
import OnlineStore from './OnlineStore';
import { EarlierFire, partyDayStart } from './FireChat';
import LastNight from './LastNight';
import { NotebookProvider } from './Markable';
import { ATTRIBUTE_META, GEAR_TABLE, getTierInfo, type AttributeName } from '../data/mythiosRulesData';

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
    // Back on the story, reload the day so gold spent in the Store and words found in the Chest show at once.
    if (t === 'story' && tab !== 'story') setStoryKey((k) => k + 1);
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
              className="text-left text-[13px] text-[#B7A9CC] truncate max-w-full"
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
              className={`py-2.5 font-['Cinzel'] font-bold text-[13px] border-b-2 ${
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
          <div className="space-y-4" data-pane="record">
            <div className="rounded-2xl border border-[#5E4585] bg-[#1E1430] p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-[#D4B876] bg-[#2A1A40] text-[#E5C158] font-['Cinzel'] font-bold text-[22px] flex items-center justify-center">
                {(me.character_name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-['Cinzel'] font-bold text-[20px] text-[#E5C158] truncate">{me.character_name}</div>
                <div className="text-[15px] text-[#D9D1E6]">{me.class ?? ''}</div>
              </div>
            </div>
            {info && (
              <div className="grid grid-cols-2 gap-2">
                {ATTR_ORDER.map((a) => {
                  const score = info.attrs?.[a] ?? 10;
                  const tier = getTierInfo(score);
                  const color = ATTRIBUTE_META[a].color;
                  return (
                    <div key={a} className="rounded-xl border border-[#2C1D40] bg-[#1A1226] p-3 space-y-1.5" data-record-attr={a}>
                      <div className="flex justify-between font-['Cinzel'] font-bold text-[14px]">
                        <span style={{ color }}>{a.toUpperCase()}</span>
                        <span className="text-[#E5C158]">+{tier.bonus}</span>
                      </div>
                      <div className="h-1.5 rounded bg-[#2C1D40]">
                        <div className="h-1.5 rounded" style={{ width: `${tier.pctInTier}%`, background: color }} />
                      </div>
                      <div className="flex justify-between text-[14px]">
                        <span className="text-[#B7A9CC]">{tier.name}</span>
                        <b>{score}</b>
                      </div>
                    </div>
                  );
                })}
                <div className="rounded-xl border border-[#2C1D40] bg-[#1A1226] p-3">
                  <div className="text-[15px] font-bold text-[#E5C158]">Weapon {GEAR_TABLE[info.weaponLevel]?.weapon ?? ''}</div>
                  <div className="text-[13px] text-[#B7A9CC]">Level {info.weaponLevel} of 5</div>
                </div>
                <div className="rounded-xl border border-[#2C1D40] bg-[#1A1226] p-3">
                  <div className="text-[15px] font-bold text-[#8DB4F5]">Armour {GEAR_TABLE[info.armorLevel]?.armor ?? ''}</div>
                  <div className="text-[13px] text-[#B7A9CC]">Level {info.armorLevel} of 5</div>
                </div>
              </div>
            )}
            <div className="rounded-2xl border border-[#3A2555] bg-[#180F29] p-4">
              <p className="text-[16px] text-[#D9D1E6]">Your Record arrives soon: your season in twelve numbers, the crowns you hold, and your badges.</p>
            </div>
          </div>
        )}

        {tab === 'bag' && (
          <div className="space-y-4" data-pane="bag">
            {/* The Bag's four shelves (Fake Guru, 18 Oct). */}
            <div className="grid grid-cols-2 gap-2" role="tablist">
              {BAG_SHELVES.map(([k, label]) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={bagView === k}
                  onClick={() => setBagView(k)}
                  className={`rounded-full px-3 py-2 text-[14px] font-semibold border ${
                    bagView === k ? 'bg-[#D4B876] text-[#1A0F26] border-[#D4B876]' : 'text-[#B7A9CC] border-[#3A2555]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {bagView === 'chest' && <OnlineChest partyId={party.id} onClose={() => undefined} embedded />}
            {bagView === 'verses' && (
              <div className="rounded-2xl border border-[#3A2555] bg-[#180F29] p-4 space-y-2" data-shelf="verses">
                <h2 className="font-['Cinzel'] font-bold text-[17px] text-[#E5C158]">The Dark Moon Verses</h2>
                <p className="text-[16px] text-[#D9D1E6]">The first verse is read at the Gathering.</p>
              </div>
            )}
            {bagView === 'found' && (
              <div className="rounded-2xl border border-[#3A2555] bg-[#180F29] p-4 space-y-2" data-shelf="found">
                <h2 className="font-['Cinzel'] font-bold text-[17px] text-[#E5C158]">Found Along the Road</h2>
                <p className="text-[16px] text-[#D9D1E6]">The things you carry and the clues you find on the road are kept here.</p>
                <p className="text-[14px] text-[#8B7A9E]">Your Relics are kept in the Store for now.</p>
              </div>
            )}
            {bagView === 'journal' && <OnlineCasebook partyId={party.id} onClose={() => undefined} embedded />}
          </div>
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
