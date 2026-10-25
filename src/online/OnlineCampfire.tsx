// The fire, as one chat (docs/design/one-thread-18oct.md, phase B; Fake Guru, 18 Oct: "fold the complicated campfire
// into one chat interface"). It sits in the story thread under the finished day:
//   1. "The light is going": one more look (the last light's leads, a roll, the find) or sit by the fire.
//   2. A divider with who is here, then "Around the fire tonight" (what each friend did today, good news only).
//   3. Tonight's question, the one pinned thing (A, B or neither; pin before peek; changeable until dawn).
//   4. One stream, in time order: Garrick's stored lines at their moments (MYTHIOS narration on a narrated night), the
//      party's talk (party_messages: the fire is the party chat), pieces laid as cards with Agree and Doubt, "changed
//      sides", clicks, words found, and the fragment card with its meaning question once the fragment is whole.
//   5. The composer at the foot, with a "+" tray: lay a clue, your fragment.
// Everything Garrick says here is stored text; named in the chat at the fire, his stored lines only (canon §E).
// The server keeps all of it (campfire, fire_table, fire_lay, fire_react, pin_theory, fan_out_roll, leave_note).
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase, plainError, type MemberRow } from './supabaseClient';
import { NoticeBlock, ScriptText, fillScriptTokens } from '../components/ChapterScriptParts';
import { ATTRIBUTE_META, challengeSucceedOn, getTierInfo, type AttributeName } from '../data/mythiosRulesData';
import { CAMPFIRE_STORED_LINES, CUP_NIGHT_LINES } from '../data/campfireDaysData';
import { ErrorLine } from './ui';
import { Markable } from './Markable';
import {
  ChatBubble,
  Composer,
  GarrickBubble,
  NarrationMessage,
  ReportBox,
  SmallLine,
  partyDayStart,
  sendChat,
  useChatMessages,
  useKeepNewInView,
  type ChatMessage,
} from './FireChat';

type Reading = 'A' | 'B' | 'NEITHER';
interface Lead {
  id: string;
  place: string;
  actions: { attr: AttributeName; verb: string }[];
  /** Friends who have already walked this lead tonight (0120), so the party can spread out. */
  walkedBy?: string[];
}
interface Member {
  id: string;
  name: string;
  me: boolean;
  visitedAt: string | null;
  here: boolean | null;
  passed: boolean;
  scraped: boolean;
  lead: string | null;
  gaveTo: string | null;
  words: number;
}
interface Roll {
  attr: AttributeName;
  score: number;
  bonus: number;
  d20: number;
  dc: number;
  net: number;
  pass: boolean;
}
interface Fire {
  week: number;
  day: number;
  chosen: boolean;
  place: string;
  narrated: boolean;
  leads?: Lead[];
  progress?: { attrs: Record<AttributeName, number> };
  dc?: number;
  tone?: 'wry' | 'quiet';
  cupNight?: boolean;
  opener?: string;
  forkA?: string;
  forkB?: string;
  callback?: string | null;
  nudge?: string | null;
  members?: Member[];
  firstHere?: boolean;
  myFanOut?: { lead: string | null; roll: Roll | null; hint: 1 | 2 | null; letter: string | null; lateLine: string | null; glimpse?: string | null };
  board?: { id: string; place: string; finders: string[]; glimpsedBy?: string[]; clueTitle: string; clueText: string }[];
  myPin?: { reading: Reading; line: string | null } | null;
  notes?: { kind: 'bottle' | 'question' | 'meaning' | 'week'; name: string; body: string; mine: boolean; day: number }[];
  fragment?: { words: number; text: string | null; solvers: string[]; hintOpen: boolean };
  meaningQuestion?: string | null;
  noticings?: { kind: keyof typeof CAMPFIRE_STORED_LINES.noticingTemplates; name: string }[];
  questionTitle?: string | null;
  nudgeIfLaid?: { piece: string; line: string } | null;
  narratedSilence?: string | null;
  puzzle?: { q: string; clickText?: string } | null;
  clicks?: Array<{ a: string; b: string; text: string; solves?: boolean }>;
}

// The fire's table (migration 0092): pieces with who laid them, agree and doubt, the thread, readings after your own pin.
interface Piece {
  key: string;
  kind: 'lead' | 'notice' | 'pass' | 'press' | 'fork';
  title: string;
  text: string | null;
  attr?: AttributeName;
  by: { id: string; name: string }[];
  at?: string;
  mine: boolean;
  agree: string[];
  doubt: string[];
  myReaction: 'agree' | 'doubt' | null;
}
interface FireTable {
  narrated: boolean;
  evening: boolean;
  pieces: Piece[];
  hands: { kind: string; title: string; attr?: AttributeName; text: string }[];
  thread: { kind: 'say' | 'pinned' | 'changed' | 'click' | 'laid'; name: string | null; mine: boolean | null; body: string; at: string }[];
  pinned: string[];
  readings: { id: string; name: string; reading: Reading; line: string | null; mine: boolean }[] | null;
  leaning?: 'split' | 'same' | null;
  puzzle?: { q: string; clickText?: string } | null;
  clicks?: { text: string; names: string[]; solves: boolean }[];
}

// "Mei thinks the list is a warning." A sentence's first word drops its capital unless it is a name.
const LOWER_STARTS = new Set(['The', 'He', "It's", 'They', "They're", 'Now', 'Home', 'We', 'It', 'Someone', 'One', 'Their', 'There', 'Upriver']);
export const asClause = (s: string) => {
  const t = s.replace(/[.!?]$/, '');
  const first = t.split(' ')[0];
  return LOWER_STARTS.has(first) ? t.charAt(0).toLowerCase() + t.slice(1) : t;
};
const pick = <T,>(list: readonly T[], seed: number) => list[Math.abs(seed) % list.length];
const nameList = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const later = (iso: string, ms: number) => new Date(new Date(iso).getTime() + ms).toISOString();

// The party's notices the fire already says in its own way, so the stream shows each once (handoff ledger piece 4):
// "X pinned a theory." (the fire's pinned line), the day-result notices ("X has read today's chapter.", "X passed /
// failed today's Challenge.": the Around the fire card tells the good news, and a failure is never named here), and
// "X found a missing word…" for any day but this one's (this day's is shown, at its real time, in the stream).
const WORD_NOTICE = /^(.+) found a missing word in the Week (\d+), Day (\d+) fragment\.$/;
const isWordNoticeFor = (body: string, week: number, day: number) => {
  const m = WORD_NOTICE.exec(body);
  return Boolean(m) && Number(m![2]) === week && Number(m![3]) === day;
};
const fireOwnNotice = (body: string, week: number, day: number) =>
  / pinned a theory\.$/.test(body) ||
  / has read today's chapter\.$/.test(body) ||
  / (passed|failed) today's Challenge\.$/.test(body) ||
  (WORD_NOTICE.test(body) && !isWordNoticeFor(body, week, day));

export default function OnlineCampfire({
  partyId,
  userId,
  members: memberRows,
  chatOpen,
  timeZone,
  onOpenChest,
}: {
  partyId: string;
  userId: string;
  members: MemberRow[];
  /** The party has met (Week 1 Day 2): the fire is the party's chat. Before that, each friend sits alone. */
  chatOpen: boolean;
  timeZone: string;
  onOpenChest: () => void;
}) {
  const [fire, setFire] = useState<Fire | null>(null);
  const [table, setTable] = useState<FireTable | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [looking, setLooking] = useState(false); // "One more look" chosen
  const [reporting, setReporting] = useState<ChatMessage | null>(null);
  const [questionOpen, setQuestionOpen] = useState(false); // after your pick, the pinned strip folds to one line
  // A click waits for the friends (Phase 2, 24 Oct): its answer shows once someone at the fire has said what the two
  // pieces mean, or when this friend chooses to read it.
  const [readClicks, setReadClicks] = useState<Record<string, boolean>>({});

  // The newest answer wins (handoff ledger piece 5): every request takes a number, and an answer that arrives after a
  // newer request began, or after one of your own taps was answered, is dropped, so a slow poll never puts old news back.
  const seq = useRef(0);
  const load = useCallback(async () => {
    const my = ++seq.current;
    const { data, error: e } = await supabase.rpc('campfire', { p_party: partyId });
    if (my !== seq.current) return;
    if (e) return setError(e.message.includes('finish your day first') ? 'The fire opens once your own day is done.' : plainError(e.message));
    setError(null); // a later success clears an earlier failure
    setFire(data as Fire);
    if ((data as Fire)?.chosen) {
      const { data: tb } = await supabase.rpc('fire_table', { p_party: partyId });
      if (my !== seq.current) return;
      if (tb) setTable(tb as FireTable);
    }
  }, [partyId]);
  useEffect(() => {
    load();
    // Friends arrive, lay pieces and pin while you sit here.
    const t = window.setInterval(load, 12000);
    return () => window.clearInterval(t);
  }, [load]);

  const atFire = Boolean(fire?.chosen);
  const together = chatOpen && Boolean(fire) && !fire!.narrated;
  const { messages, reload: reloadChat } = useChatMessages(partyId, atFire && together);
  // The page follows new lines to the foot only when the friend is already there (a hook, so it sits above the early returns).
  const follow = useKeepNewInView(messages.length + (table?.thread?.length ?? 0) + (table?.pieces?.length ?? 0));
  // What Garrick (or MYTHIOS) has said at this fire, kept so a line never changes after it was read (handoff ledger
  // pieces 4 and 4b): the server keeps the record (fire_said, migration 0095), so it survives a reload and another phone;
  // `said` is this session's own memory, used the moment a line is first shown and until the server answers.
  const said = useRef<{ key: string; slots: Record<string, { text: string; at: string }[]> }>({ key: '', slots: {} });
  const [serverSaid, setServerSaid] = useState<Record<string, { text: string; at: string }[]>>({});
  const want = useRef<Record<string, { text: string; at: string }>>({});
  const sent = useRef<{ key: string; at: number }>({ key: '', at: 0 });
  useEffect(() => {
    const lines = Object.entries(want.current).map(([slot, v]) => ({ slot, text: v.text, at: v.at }));
    if (!lines.length) return;
    const key = JSON.stringify(lines.map((l) => [l.slot, l.text]));
    if (key === sent.current.key || Date.now() - sent.current.at < 20000) return;
    sent.current = { key, at: Date.now() };
    supabase.rpc('fire_remember', { p_party: partyId, p_lines: lines.slice(0, 20) }).then(({ data, error: e }) => {
      if (e || !Array.isArray(data)) {
        sent.current.key = ''; // try again on a later render (not within 20 seconds)
        return;
      }
      const grouped: Record<string, { text: string; at: string }[]> = {};
      for (const x of data as { slot: string; text: string; at: string }[]) (grouped[x.slot] ||= []).push({ text: x.text, at: x.at });
      setServerSaid(grouped);
    });
  });

  const call = async (fn: string, args: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    const { data, error: e } = await supabase.rpc(fn, { p_party: partyId, ...args });
    setBusy(false);
    if (e) {
      setError(plainError(e.message));
      return null;
    }
    seq.current++; // polls still on their way are older than this answer
    setFire(data as Fire);
    return data as Fire;
  };
  const callTable = async (fn: string, args: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    const { data, error: e } = await supabase.rpc(fn, { p_party: partyId, ...args });
    setBusy(false);
    if (e) return setError(plainError(e.message));
    seq.current++;
    setTable(data as FireTable);
  };
  useEffect(() => {
    if (!atFire) return;
    const my = ++seq.current;
    supabase.rpc('fire_table', { p_party: partyId }).then(({ data }) => data && my === seq.current && setTable(data as FireTable));
  }, [atFire, partyId, fire?.week, fire?.day]);

  const seed = useMemo(() => (fire ? fire.week * 7 + fire.day : 0), [fire?.week, fire?.day]);

  if (!fire) return error ? <ErrorLine text={error} /> : <p className="text-center text-[#B7A9CC]">…</p>;

  // ---- 1. The light is going: one more look, or the fire (a fork: choosing one closes the other). ----
  if (!fire.chosen) {
    const attrs = fire.progress?.attrs ?? ({} as Record<AttributeName, number>);
    const dc = fire.dc ?? 6;
    return (
      <div className="space-y-3" data-light-going>
        <div className="text-[14px] font-bold tracking-[1px] text-[#8F82A6]">THE LIGHT IS GOING</div>
        {!looking ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={busy}
              onClick={() => setLooking(true)}
              className="min-h-[52px] rounded-2xl border border-[#8A6E34] text-[#E5C158] font-bold text-[16px] disabled:opacity-50"
            >
              One more look
            </button>
            <button
              disabled={busy}
              onClick={() => call('fan_out_fire', {})}
              className="min-h-[52px] rounded-2xl bg-[#F0A552] text-[#1A0F26] font-bold text-[16px] disabled:opacity-50"
            >
              Sit by the fire
            </button>
          </div>
        ) : (
          <div className="space-y-2.5" data-leads>
            <p className="text-[15px] text-[#D9D1E6]">One more look before dark. Where?</p>
            {(fire.leads ?? []).map((lead) => (
              <div key={lead.id} className="p-3 rounded-2xl bg-[#180F29] border border-[#3A2555] space-y-2">
                <div className="font-['Cinzel'] font-bold text-[15px] text-[#F4F1F8]">{lead.place}</div>
                {(lead.walkedBy?.length ?? 0) > 0 && (
                  <div className="text-[14px] text-[#B7A9CC] italic" data-lead-walked>
                    {nameList(lead.walkedBy!)} went this way already tonight.
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {lead.actions.map((a) => {
                    const score = attrs[a.attr] ?? 10;
                    return (
                      <button
                        key={a.attr}
                        disabled={busy}
                        onClick={() => call('fan_out_roll', { p_lead: lead.id, p_attr: a.attr })}
                        className="py-2 px-2.5 rounded-xl bg-[#D4B876]/12 border border-[#D4B876]/70 text-left disabled:opacity-50"
                      >
                        <div className="font-['Cinzel'] font-bold text-[14px] uppercase" style={{ color: ATTRIBUTE_META[a.attr]?.color }}>
                          {a.attr} {score}
                        </div>
                        <div className="text-[15px] text-[#E6E0F0] leading-snug">
                          {a.verb} · you succeed on {challengeSucceedOn(dc, getTierInfo(score).bonus)}+
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        <ErrorLine text={error} />
      </div>
    );
  }

  // ---- 2 to 5. The fire. ----
  const members = fire.members ?? [];
  const me = members.find((m) => m.me);
  const t = table;
  const garrick = !fire.narrated;
  const frag = fire.fragment;
  const fragDone = Boolean(frag?.text);
  const pieces = t?.pieces ?? [];
  const hands = t?.hands ?? [];
  const notes = fire.notes ?? [];
  const fillShared = (x: string) =>
    fillScriptTokens(x, { friends: members.filter((m) => !m.me).map((m) => m.name), partySize: members.length });
  const readingText = (r: Reading) => (r === 'A' ? fire.forkA ?? '' : r === 'B' ? fire.forkB ?? '' : 'Neither.');
  const arrival = me?.visitedAt ?? new Date().toISOString();
  const here = members.filter((m) => m.visitedAt);

  // "Around the fire tonight": good news only, one sentence per friend.
  const aroundLines = members
    .map((m) => {
      const parts: string[] = [];
      if (m.passed) parts.push(`passed today's Challenge at ${fire.place}`);
      if (m.gaveTo) parts.push(`gave a Relic to ${nameList([...new Set(m.gaveTo.split(', '))])}`);
      if (m.lead) parts.push('brought back a clue from the last light');
      if (m.words >= 2) parts.push("found both missing words in today's fragment");
      else if (m.words === 1) parts.push("found a missing word in today's fragment");
      return parts.length ? `${m.me ? 'You' : m.name} ${nameList(parts)}.` : null;
    })
    .filter((l): l is string => Boolean(l));

  // ---- The stream: everything said and done at the fire, in time order. ----
  type Item = { at: string; key: string; node: React.ReactNode };
  const items: Item[] = [];
  const add = (at: string, key: string, node: React.ReactNode) => items.push({ at, key, node });
  // A stored line is placed where it was first shown and never rewritten: if the server later offers a different line for
  // the same slot (a new nudge once a piece is on the table), it is a new line at that moment, below the first.
  const sayOnce = (slot: string, text: string, at: string): { text: string; at: string }[] => {
    const key = `fire-said:${partyId}:${fire.week}:${fire.day}`;
    if (said.current.key !== key) {
      let slots: Record<string, { text: string; at: string }[]> = {};
      try {
        slots = JSON.parse(sessionStorage.getItem(key) || '{}');
      } catch {
        /* no memory of earlier lines */
      }
      said.current = { key, slots };
    }
    const srv = serverSaid[slot] ?? [];
    const loc = said.current.slots[slot] ?? [];
    let list = srv.length ? srv : loc;
    // This session may already have added the new line below the server's (the server has not answered yet).
    if (list[list.length - 1]?.text !== text && loc.length > list.length && loc[loc.length - 1].text === text) list = loc;
    // The same line said to a friend by name once they arrive ("Mei, the page…") is not a new line: keep the first.
    const bare = (x: string) => x.replace(/^[^,.?!]{1,30}, /, '').replace(/^./, (c) => c.toLowerCase());
    if (list.length && bare(list[list.length - 1].text) === bare(text)) {
      want.current[slot] = { text: list[list.length - 1].text, at: list[list.length - 1].at };
      return list;
    }
    if (!list.length || list[list.length - 1].text !== text) {
      list = [...list, { text, at: list.length ? new Date().toISOString() : at }];
      said.current.slots[slot] = list;
      try {
        sessionStorage.setItem(key, JSON.stringify(said.current.slots));
      } catch {
        /* private window */
      }
    }
    want.current[slot] = { text, at: list[list.length - 1].at };
    return list;
  };

  // Arriving: the cup, his greeting and opener, what he notices (stored lines, v2.3 §B, §C, §I).
  if (fire.cupNight && !fire.narratedSilence) {
    const cupLine = CUP_NIGHT_LINES[`${fire.week}-${fire.day}`] ?? CAMPFIRE_STORED_LINES.cupNightStageDirection;
    add(arrival, 'cup', <NarrationMessage text={cupLine} />);
  }
  if (fire.narrated && fire.opener) add(later(arrival, 1), 'opener', <NarrationMessage text={fire.opener} />);
  if (garrick && fire.narratedSilence) add(later(arrival, 1), 'silence', <NarrationMessage text={fire.narratedSilence} />);
  if (garrick && fire.firstHere) add(later(arrival, 1), 'greet', <GarrickBubble text={CAMPFIRE_STORED_LINES.firstArrivalGreeting} />);
  if (garrick && fire.opener && !fire.narratedSilence) add(later(arrival, 2), 'opener', <GarrickBubble text={fire.opener} />);
  if (garrick)
    (fire.noticings ?? []).forEach((n, i) =>
      sayOnce(`notice-${i}`, CAMPFIRE_STORED_LINES.noticingTemplates[n.kind].replace('{friend}', n.name), later(arrival, 3 + i)).forEach((e, j) =>
        add(e.at, `notice-${i}-${j}`, <GarrickBubble text={e.text} />)
      )
    );
  if (t?.puzzle) {
    const hasClicked = (t.clicks?.length ?? 0) > 0 || (t.thread ?? []).some((m) => m.kind === 'click');
    const pair = fire.clicks?.[0];
    const matchesPiece = (target?: string) =>
      Boolean(target && pieces.some((p) => p.key === target || p.key === `lead:${target}`));
    const halfLaid = !hasClicked && Boolean(pair && (matchesPiece(pair.a) !== matchesPiece(pair.b)));
    const bothLaidByOne = !hasClicked && Boolean(pair && matchesPiece(pair.a) && matchesPiece(pair.b));
    add(
      later(arrival, 2.5),
      'puzzle',
      <div className="rounded-2xl border border-[#5C3A1C] bg-[#1F140C] p-3 space-y-1.5" data-puzzle>
        <div className="flex items-center justify-between gap-2">
          <div className="font-['Cinzel'] font-bold text-[14px] tracking-[1.2px] text-[#F0A552] uppercase">
            {garrick ? 'GARRICK · ON THE TABLE' : 'ON THE TABLE'}
          </div>
          {hasClicked && <span className="text-[14px] font-semibold text-[#6FD39A]">Pieced together</span>}
        </div>
        {/* One question a night (Phase 2, 24 Oct): this card no longer asks a second question of its own; it points the
            pieces at tonight's question. */}
        <p className="font-sans text-[15.5px] text-[#F4E8C8] leading-[1.4]">
          Two of tonight&apos;s finds belong together. Laid side by side, they bear on tonight&apos;s question.
        </p>
        {halfLaid && (
          <p className="text-[14px] text-[#CDB594] italic">
            One half of this is on the table. The other is still in someone&apos;s hands, or out in the dark.
          </p>
        )}
        {bothLaidByOne && (
          <p className="text-[14px] text-[#CDB594] italic">
            You are holding both halves on the table, and this table needs another pair of eyes.
          </p>
        )}
      </div>
    );
  }
  // Your own find at the last light: what it took, the first-letter hint, the glimpse (no daytime dice arithmetic at the fire).
  const my = fire.myFanOut;
  const myLead = fire.board?.find((b) => b.id === my?.lead);
  const myGlimpse = fire.board?.find((b) => b.id === my?.glimpse);
  if (my?.lead && my.roll && myLead)
    add(
      later(arrival, -1),
      'myfind',
      <div className="rounded-2xl border border-[#3A2555] bg-[#180F29] p-3 space-y-1.5" data-my-find>
        <div className="font-['Cinzel'] font-bold text-[14px] text-[#F4F1F8]">The last light · {myLead.place}</div>
        {my.roll.pass ? (
          <p className="text-[15.5px] text-[#D9D1E6]">You found what you went looking for before the light went.</p>
        ) : (
          my.lateLine && <ScriptText text={my.lateLine} className="text-[16px] text-[#D9D1E6]" />
        )}
        {my.letter && frag?.hintOpen && (
          <p className="text-[15px] text-[#6FD39A]">
            Word {my.hint} of today&apos;s fragment starts with “{my.letter}”.
          </p>
        )}
        {myGlimpse && <p className="text-[15px] text-[#B7A9CC]">On the way back, the last of the light shows you one more place: {myGlimpse.place}.</p>}
      </div>
    );
  // Friends arriving.
  if (together)
    members
      .filter((m) => !m.me && m.visitedAt)
      .forEach((m) => add(m.visitedAt!, `came-${m.id}`, <SmallLine>{m.name} came to the fire.</SmallLine>));

  // Pieces on the table, each a card where it was laid.
  pieces.forEach((p) =>
    add(
      p.at ?? arrival,
      `piece-${p.key}`,
      <div className="rounded-2xl border border-[#3F5E86] bg-[#111A28] p-3 space-y-2" data-piece={p.key}>
        <div className="flex justify-between gap-2 items-baseline">
          <div className="font-['Cinzel'] font-bold text-[14px] tracking-[1px] text-[#8DB4F5] uppercase">
            On the table · {p.kind === 'notice' && p.attr ? `${p.title} · ${p.attr}` : p.title}
          </div>
          <div className="text-[14px] text-[#A9B9D3] whitespace-nowrap">{p.by.map((b) => (b.id === userId ? 'You' : b.name)).join(', ')}</div>
        </div>
        <Markable source={`${p.title}, at the fire`} text={fillShared(p.text ?? '')}>
          <ScriptText text={fillShared(p.text ?? '')} className="font-sans text-[16px] leading-[1.45] text-[#F4F1F8]" />
        </Markable>
        {!p.mine && together && (
          <div className="flex gap-2">
            {(['agree', 'doubt'] as const).map((k) => (
              <button
                key={k}
                disabled={busy}
                onClick={() => callTable('fire_react', { p_target: p.key, p_kind: k })}
                className={`h-9 px-4 rounded-full border text-[14px] font-semibold ${
                  p.myReaction === k ? (k === 'agree' ? 'border-[#6FD39A] text-[#6FD39A]' : 'border-[#F0A552] text-[#F0A552]') : 'border-[#3F5E86] text-[#A9C4F5]'
                }`}
              >
                {k === 'agree' ? 'Agree' : 'Doubt'}
              </button>
            ))}
          </div>
        )}
        {(p.agree.length > 0 || p.doubt.length > 0) && (
          <p className="text-[14px] text-[#A9B9D3]">
            {[p.agree.length ? `Agreed: ${p.agree.join(', ')}` : '', p.doubt.length ? `Doubted: ${p.doubt.join(', ')}` : ''].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    )
  );

  // The fire's own events: pins, changed sides, clicks, and lines said at the old fire.
  (t?.thread ?? []).forEach((m, i) => {
    if (m.kind === 'laid') return; // shown as the piece's card
    if (m.kind === 'click') {
      const matchedClick = (t?.clicks ?? []).find((c) => c.text === m.body) ?? t?.clicks?.[0];
      // 0118: in a party of one or two, Garrick brings the half nobody laid; the click then carries his name.
      const broughtByGarrick = (matchedClick?.names ?? []).includes('Garrick');
      const clickNames = matchedClick?.names?.length
        ? nameList(broughtByGarrick ? matchedClick.names.filter((n) => n !== 'Garrick') : matchedClick.names)
        : null;
      const spokeAfterClick = messages.some(
        (msg) => msg.created_at > m.at && msg.speaker !== 'garrick' && msg.kind !== 'notice'
      );
      add(
        m.at,
        `click-${i}`,
        <div className="rounded-2xl border border-[#8A6E34] bg-[#2A2010] p-3 space-y-1.5" data-click>
          <div className="flex justify-between items-baseline gap-2">
            <div className="font-['Cinzel'] font-bold text-[14px] tracking-[1.2px] text-[#E5C158]">
              {broughtByGarrick ? 'GARRICK · THE PIECE NOBODY BROUGHT' : garrick ? 'GARRICK · SETTING THE TWO TOGETHER' : 'SOMETHING CLICKS'}
            </div>
            {clickNames && <div className="text-[14px] text-[#CDB594]">{clickNames}</div>}
          </div>
          {broughtByGarrick && (
            <p className="text-[14.5px] text-[#CDB594] italic" data-click-garrick>
              “Nobody went where this was lying tonight, so I went myself. Set it beside yours, and see what the two of them say.”
            </p>
          )}
          {!broughtByGarrick && garrick && clickNames && (
            <p className="text-[14.5px] text-[#CDB594] italic">
              {spokeAfterClick
                ? `“${clickNames} — you put those two side by side and called it before I needed to:”`
                : `“${clickNames}, put those two together. What do they tell you?”`}
            </p>
          )}
          {spokeAfterClick || readClicks[m.body] ? (
            <Markable source="Something clicks, at the fire" text={m.body}>
              <ScriptText text={m.body} className="font-sans text-[17.5px] leading-[1.5] text-[#F4E8C8]" />
            </Markable>
          ) : (
            <button
              type="button"
              data-click-read
              onClick={() => setReadClicks((r) => ({ ...r, [m.body]: true }))}
              className="text-[14px] text-[#E5C158] underline underline-offset-4"
            >
              Read what the two of them show
            </button>
          )}
        </div>
      );
    }
    else if (m.kind === 'say')
      add(
        m.at,
        `say-${i}`,
        <div className={`flex flex-col ${m.mine ? 'items-end' : 'items-start'}`}>
          {!m.mine && <div className="text-[14px] font-bold text-[#C39BF5]">{m.name}</div>}
          <div className={`max-w-[86%] px-3 py-2 text-[16px] border ${m.mine ? 'rounded-[16px_16px_4px_16px] bg-[#3A2A12] border-[#8A6E34]' : 'rounded-[4px_16px_16px_16px] bg-[#221636] border-[#3A2555]'}`}>
            {m.body}
          </div>
        </div>
      );
    else add(m.at, `ev-${i}`, <SmallLine>{m.mine ? m.body.replace(m.name ?? '', 'You') : m.body}</SmallLine>);
  });

  // The party's talk since this morning: the fire is the party chat. "X pinned a theory." is already on the fire's own line.
  // Daytime Garrick replies (at_fire === false) never appear at the fire (handoff ledger piece 6): stored lines only here.
  if (together) {
    const since = new Date(partyDayStart(timeZone)).getTime();
    messages
      .filter((m) => {
        if (new Date(m.created_at).getTime() < since) return false;
        if (m.kind === 'notice' && fireOwnNotice(m.body, fire.week, fire.day)) return false;
        if (m.speaker === 'garrick' && m.at_fire === false) return false;
        // His morning line sits at the top of the day (GameShell's GarrickMorning), not again at the fire.
        if (m.morning === true) return false;
        return true;
      })
      .forEach((m) => add(m.created_at, `msg-${m.id}`, <ChatBubble m={m} userId={userId} members={memberRows} onReport={setReporting} />));
  }

  // His nudge, once something is on the table (or on arriving); MYTHIOS asks it on a narrated night.
  // If the special third piece (nudgeIfLaid) is also on the table, Garrick asks that follow-up in addition to his main nudge rather than erasing it.
  const firstPieceAt = pieces.map((p) => p.at).filter(Boolean).sort()[0];
  const nudgeAt = later(firstPieceAt && firstPieceAt > arrival ? firstPieceAt : arrival, 5);
  const baseNudge = fire.nudge ? fillShared(fire.nudge) : null;
  if (baseNudge)
    sayOnce('nudge', baseNudge, nudgeAt).forEach((e, j) =>
      add(e.at, `nudge-${j}`, garrick ? <GarrickBubble text={e.text} /> : <NarrationMessage text={e.text} />)
    );
  const matchedLaidPiece = fire.nudgeIfLaid
    ? pieces.find(
        (p) =>
          p.key === fire.nudgeIfLaid!.piece ||
          p.key.endsWith(fire.nudgeIfLaid!.piece) ||
          p.key.includes(fire.nudgeIfLaid!.piece)
      )
    : undefined;
  if (matchedLaidPiece && fire.nudgeIfLaid?.line) {
    // Phase 2 part 7 (24 Oct): the follow-up is said to the friend who laid that piece, not to whoever is best at an Attribute.
    const layer = (matchedLaidPiece as { by?: { name?: string }[] }).by?.[0]?.name;
    const laidNudgeText = fillShared(layer ? fire.nudgeIfLaid.line.replace(/\{friend:[A-Za-z]+\}/g, layer) : fire.nudgeIfLaid.line);
    const laidNudgeAt = later(matchedLaidPiece.at && matchedLaidPiece.at > nudgeAt ? matchedLaidPiece.at : nudgeAt, 2);
    sayOnce('nudge-laid', laidNudgeText, laidNudgeAt).forEach((e, j) =>
      add(e.at, `nudge-laid-${j}`, garrick ? <GarrickBubble text={e.text} /> : <NarrationMessage text={e.text} />)
    );
  }
  if (garrick && fire.callback) sayOnce('callback', fire.callback, later(nudgeAt, 1)).forEach((e, j) => add(e.at, `callback-${j}`, <GarrickBubble text={e.text} />));

  // Garrick reacts when the fire leans or splits (stored lines, v3 §7 and campfire-week1-content-18oct.md §Garrick's new lines):
  if (garrick && t?.leaning) {
    const leanLine = t.leaning === 'split'
      ? "Good. Argue it out. I listen better than I talk."
      : "Everyone leans the same way. What would it take to be wrong?";
    sayOnce('leaning', leanLine, later(arrival, 15)).forEach((e, j) =>
      add(e.at, `leaning-${j}`, <GarrickBubble text={e.text} />)
    );
  }

  // Words found, and the whole fragment read aloud with its open question in the stream.
  if (frag) {
    const wordTimes = together
      ? messages.filter((m) => m.kind === 'notice' && isWordNoticeFor(m.body, fire.week, fire.day)).map((m) => new Date(m.created_at).getTime())
      : [];
    const fragAt = wordTimes.length ? new Date(Math.max(...wordTimes) + 5).toISOString() : later(arrival, 20);
    if (fragDone) {
      add(
        fragAt,
        'fragment',
        <div className="rounded-2xl border border-[#5E4585] bg-[#1A1226] p-3 space-y-2" data-fragment-card>
          <div className="font-['Cinzel'] font-bold text-[14px] tracking-[1.2px] text-[#C39BF5]">
            {garrick ? 'GARRICK READS THE FRAGMENT' : 'TODAY’S FRAGMENT IS WHOLE'}
          </div>
          <p className="font-['Cormorant_Garamond',serif] font-semibold italic text-[19px] leading-[1.45] text-[#F4F1F8]">“{frag.text}”</p>
          {fire.meaningQuestion && (
            <>
              {/* The question often opens by quoting the fragment shown just above: then it starts at the question. */}
              <ScriptText
                text={fire.meaningQuestion.replace(/^\*?["“]([^"”]+)["”]\*?\s*/, (q, inner: string) =>
                  (frag.text ?? "").replace(/\s+/g, ' ').includes(inner.replace(/\s+/g, ' ').trim()) && inner.trim().length >= (frag.text ?? "").trim().length * 0.8 ? '' : q
                )}
                className="text-[16px] text-[#E6E0F0]"
              />
              {notes
                .filter((n) => n.kind === 'meaning' && !fire.narrated)
                .map((n) => (
                  <p key={`${n.name}-${n.body}`} className="text-[15px]">
                    <span className="font-semibold text-[#C39BF5]">{n.mine ? 'You' : n.name}:</span> {n.body}
                  </p>
                ))}
            </>
          )}
        </div>
      );
    }
  }

  // His closer, from 8:00pm (stored, v2.3 step 7).
  if (garrick && t?.evening)
    sayOnce('closer', pick(CAMPFIRE_STORED_LINES.closersByWeek[fire.week] ?? CAMPFIRE_STORED_LINES.closers, seed), new Date().toISOString()).forEach((e, j) => add(e.at, `closer-${j}`, <GarrickBubble text={e.text} />));

  items.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  // ---- Tonight's question, at the foot of the stream: before your pick, nothing of the others' (pin before peek); after, who said what. ----
  const myPick = fire.myPin?.reading ?? null;
  const readings = t?.readings ?? [];
  const pickedBy = (r: Reading) => readings.filter((x) => x.reading === r).map((x) => (x.mine ? 'you' : x.name));
  const folded = Boolean(myPick) && !questionOpen;
  const question = (
    <section
      className={`rounded-2xl border px-3 py-2.5 space-y-2 bg-[#1F140C] ${
        myPick ? 'border-[#8A5A24]' : 'border-[#F0A552] shadow-[0_0_14px_rgba(240,165,82,0.35)]'
      }`}
      data-question
    >
      {folded ? (
        <button className="w-full text-left flex items-center gap-2" onClick={() => setQuestionOpen(true)} aria-expanded={false} data-question-folded>
          <span className="font-['Cinzel'] font-bold text-[12px] tracking-[1.2px] text-[#F0A552] shrink-0">YOUR CALL</span>
          <span className="flex-1 min-w-0 truncate text-[15px] text-[#F4E8C8]">{readingText(myPick!)}</span>
          <span className="shrink-0 text-[14px] text-[#CDB594]">change ▾</span>
        </button>
      ) : (
        <>
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-0.5">
              <div className="font-['Cinzel'] font-bold text-[12px] tracking-[1.5px] text-[#F0A552] uppercase">
                {garrick ? 'GARRICK ASKS THE TABLE' : 'TONIGHT’S QUESTION'}
              </div>
              {fire.questionTitle && (
                <div className="font-sans font-semibold text-[15.5px] text-[#F4E8C8] leading-snug">
                  {fire.questionTitle}
                </div>
              )}
            </div>
            {myPick ? (
              <button className="shrink-0 text-[14px] text-[#CDB594]" onClick={() => setQuestionOpen(false)}>
                fold ▴
              </button>
            ) : (
              <div className="shrink-0 text-[14px] text-[#CDB594]">{together ? "pick to see the others'" : 'choose one'}</div>
            )}
          </div>
          <div className="space-y-1.5">
            {(['A', 'B', 'NEITHER'] as Reading[]).map((r) => {
              const chosen = myPick === r;
              const names = myPick && !fire.narrated ? pickedBy(r) : [];
              return (
                <button
                  key={r}
                  disabled={busy}
                  onClick={async () => {
                    if (chosen) return setQuestionOpen(false);
                    const ok = await call('pin_theory', { p_reading: r, p_line: '' });
                    if (ok) {
                      setQuestionOpen(false);
                      supabase.rpc('fire_table', { p_party: partyId }).then(({ data }) => data && setTable(data as FireTable));
                    }
                  }}
                  className={`w-full text-left rounded-xl border px-3 py-2 text-[15px] leading-snug ${
                    chosen ? 'border-[#F0A552] bg-[#3A2410] text-[#F4E8C8]' : 'border-[#5C3A1C] text-[#E6D8C0]'
                  }`}
                  data-reading-option={r}
                >
                  {readingText(r)}
                  {names.length > 0 && <span className="block text-[14px] text-[#CDB594]">{nameList(names)}</span>}
                </button>
              );
            })}
          </div>
          {myPick && <p className="text-[14px] text-[#CDB594]">{together ? "You can change it until dawn. The fire's call is made then." : 'You can change it until dawn.'}</p>}
          {!myPick && together && (t?.pinned ?? []).length > 0 && (
            <p className="text-[14px] text-[#CDB594]">
              {nameList(t!.pinned)} {t!.pinned.length === 1 ? 'has' : 'have'} made a call.
            </p>
          )}
        </>
      )}
    </section>
  );

  return (
    <div className="space-y-4" data-fire>
      <div className="flex items-center gap-2 text-[14px] font-bold tracking-[1px] text-[#F0A552]" data-fire-divider>
        <div className="flex-1 h-px bg-[#5C3A1C]" />
        <span className="text-center">
          EVENING · THE FIRE
          {together && here.length
            ? ` · ${nameList(here.map((m) => (m.me ? 'you' : m.name)))} ${here.length === 1 && !here[0].me ? 'is' : 'are'} here`
            : ''}
        </span>
        <div className="flex-1 h-px bg-[#5C3A1C]" />
      </div>

      {together && aroundLines.length > 0 && (
        <div className="rounded-2xl border border-[#3A2555] bg-[#180F29] p-3 space-y-1" data-around>
          <div className="font-['Cinzel'] font-bold text-[14px] tracking-[1.2px] text-[#D4B876]">AROUND THE FIRE TONIGHT</div>
          {aroundLines.map((l) => (
            <p key={l} className="text-[16px] leading-[1.4]">
              {l}
            </p>
          ))}
        </div>
      )}

      <div className="space-y-3" data-stream>
        {items.map((it) => (
          <React.Fragment key={it.key}>{it.node}</React.Fragment>
        ))}
      </div>

      {question}
      {reporting && <ReportBox m={reporting} onDone={() => setReporting(null)} />}
      <ErrorLine text={error} />

      {together ? (
        <>
          {hands.length > 0 && (
            <div
              className="rounded-2xl border border-[#8A6E34] bg-[#24190B] px-3 py-2.5 flex items-center justify-between gap-2.5"
              data-hand-bar
            >
              <div className="min-w-0 flex-1">
                <div className="font-['Cinzel'] font-bold text-[12px] tracking-[1px] text-[#E5C158] uppercase">
                  In your hands{hands.length > 1 ? ` (${hands.length})` : ''}
                </div>
                <div className="truncate text-[14.5px] text-[#F4E8C8]">{hands[0].title}</div>
              </div>
              <button
                disabled={busy}
                onClick={() => callTable('fire_lay', { p_kind: hands[0].kind })}
                className="shrink-0 h-9 px-3.5 rounded-xl bg-[#D4B876] font-bold text-[14px] text-[#130B1F] disabled:opacity-50"
              >
                Lay on the table
              </button>
            </div>
          )}
          <Composer
            placeholder="Say something at the fire"
            glow={hands.length > 0}
            onSent={follow}
          onSend={async (text) => {
            const e = await sendChat(partyId, text, true);
            if (!e) reloadChat();
            return e;
          }}
          tray={(close) => (
            <>
              <div className="font-['Cinzel'] font-bold text-[14px] tracking-[1px] text-[#B7A9CC]">LAY A CLUE</div>
              {hands.length === 0 && <p className="text-[14px] text-[#8B7A9E]">Nothing in your hands tonight that is not already on the table.</p>}
              {hands.map((h) => (
                <div key={h.kind} className="rounded-xl border border-dashed border-[#6B5A85] p-2.5 space-y-2" data-hand={h.kind}>
                  {h.kind === 'notice' && h.attr ? (
                    <NoticeBlock attr={h.attr} text={fillShared(h.text)} label="What you noticed" />
                  ) : (
                    <>
                      <div className="font-['Cinzel'] font-bold text-[14px] text-[#F4F1F8] uppercase">{h.title}</div>
                      <ScriptText text={fillShared(h.text)} className="text-[15px] text-[#D9D1E6] leading-[1.45]" />
                    </>
                  )}
                  <button
                    disabled={busy}
                    onClick={async () => {
                      await callTable('fire_lay', { p_kind: h.kind });
                      close();
                    }}
                    className="h-10 px-4 rounded-xl bg-[#D4B876] font-bold text-[15px] text-[#130B1F] disabled:opacity-50"
                  >
                    Lay it on the table
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  close();
                  onOpenChest();
                }}
                className="w-full h-11 rounded-xl border border-[#4A3266] text-[#D9D1E6] font-semibold text-[15px]"
              >
                Your fragment
              </button>
            </>
          )}
          />
        </>
      ) : null /* Day 1's fire is solitary and says nothing of the others (Fake Guru, 18 Oct: "keep it solitary, don't mention others"). */}
    </div>
  );
}
