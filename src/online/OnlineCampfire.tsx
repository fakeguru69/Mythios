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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, plainError, type MemberRow } from './supabaseClient';
import { NoticeBlock, ScriptText, fillScriptTokens } from '../components/ChapterScriptParts';
import { ATTRIBUTE_META, challengeSucceedOn, getTierInfo, type AttributeName } from '../data/mythiosRulesData';
import { CAMPFIRE_STORED_LINES } from '../data/campfireDaysData';
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
  type ChatMessage,
} from './FireChat';

type Reading = 'A' | 'B' | 'NEITHER';
interface Lead {
  id: string;
  place: string;
  actions: { attr: AttributeName; verb: string }[];
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
}

// The fire's table (migration 0092): pieces with who laid them, agree and doubt, the thread, readings after your own pin.
interface Piece {
  key: string;
  kind: 'lead' | 'notice' | 'pass' | 'press';
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
  hands: { kind: 'notice' | 'pass' | 'press'; title: string; attr?: AttributeName; text: string }[];
  thread: { kind: 'say' | 'pinned' | 'changed' | 'click' | 'laid'; name: string | null; mine: boolean | null; body: string; at: string }[];
  pinned: string[];
  readings: { id: string; name: string; reading: Reading; line: string | null; mine: boolean }[] | null;
}

const signed = (n: number) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);
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
  const [meaningDraft, setMeaningDraft] = useState<string | null>(null);
  const [questionOpen, setQuestionOpen] = useState(false); // after your pick, the pinned strip folds to one line

  const load = useCallback(async () => {
    const { data, error: e } = await supabase.rpc('campfire', { p_party: partyId });
    if (e) return setError(e.message.includes('finish your day first') ? 'The fire opens once your own day is done.' : plainError(e.message));
    setFire(data as Fire);
    if ((data as Fire)?.chosen) {
      const { data: tb } = await supabase.rpc('fire_table', { p_party: partyId });
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

  const call = async (fn: string, args: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    const { data, error: e } = await supabase.rpc(fn, { p_party: partyId, ...args });
    setBusy(false);
    if (e) {
      setError(plainError(e.message));
      return null;
    }
    setFire(data as Fire);
    return data as Fire;
  };
  const callTable = async (fn: string, args: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    const { data, error: e } = await supabase.rpc(fn, { p_party: partyId, ...args });
    setBusy(false);
    if (e) return setError(plainError(e.message));
    setTable(data as FireTable);
  };
  useEffect(() => {
    if (atFire) supabase.rpc('fire_table', { p_party: partyId }).then(({ data }) => data && setTable(data as FireTable));
  }, [atFire, partyId, fire?.week, fire?.day]);

  const seed = useMemo(() => (fire ? fire.week * 7 + fire.day : 0), [fire?.week, fire?.day]);

  if (!fire) return error ? <ErrorLine text={error} /> : <p className="text-center text-[#B7A9CC]">…</p>;

  // ---- 1. The light is going: one more look, or the fire (a fork: choosing one closes the other). ----
  if (!fire.chosen) {
    const attrs = fire.progress?.attrs ?? ({} as Record<AttributeName, number>);
    const dc = fire.dc ?? 6;
    return (
      <div className="space-y-3" data-light-going>
        <div className="text-[13px] font-bold tracking-[1px] text-[#8F82A6]">THE LIGHT IS GOING</div>
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
                        <div className="font-['Cinzel'] font-bold text-[13px] uppercase" style={{ color: ATTRIBUTE_META[a.attr]?.color }}>
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

  // Arriving: the cup, his greeting and opener, what he notices (stored lines, v2.3 §B, §C, §I).
  if (fire.cupNight) add(arrival, 'cup', <NarrationMessage text={CAMPFIRE_STORED_LINES.cupNightStageDirection} />);
  if (fire.narrated && fire.opener) add(later(arrival, 1), 'opener', <NarrationMessage text={fire.opener} />);
  if (garrick && fire.firstHere) add(later(arrival, 1), 'greet', <GarrickBubble text={CAMPFIRE_STORED_LINES.firstArrivalGreeting} />);
  if (garrick && fire.opener) add(later(arrival, 2), 'opener', <GarrickBubble text={fire.opener} />);
  if (garrick)
    (fire.noticings ?? []).forEach((n, i) =>
      add(later(arrival, 3 + i), `notice-${i}`, <GarrickBubble text={CAMPFIRE_STORED_LINES.noticingTemplates[n.kind].replace('{friend}', n.name)} />)
    );
  // Your own find at the last light: the roll, the late line, the first-letter hint, the glimpse.
  const my = fire.myFanOut;
  const myLead = fire.board?.find((b) => b.id === my?.lead);
  const myGlimpse = fire.board?.find((b) => b.id === my?.glimpse);
  if (my?.lead && my.roll && myLead)
    add(
      later(arrival, -1),
      'myfind',
      <div className="rounded-2xl border border-[#3A2555] bg-[#180F29] p-3 space-y-1.5" data-my-find>
        <div className="font-['Cinzel'] font-bold text-[13px] text-[#F4F1F8]">The last light · {myLead.place}</div>
        <p className="font-mono text-[14px] text-[#D8CEE8]">
          🎲 {my.roll.d20} + {my.roll.attr} {my.roll.score} (+{my.roll.bonus}) − DC {my.roll.dc} = {signed(my.roll.net)}{' '}
          <span className={my.roll.pass ? 'text-[#6FD39A]' : 'text-[#F08A8A]'}>{my.roll.pass ? 'PASSED' : 'FAILED'}</span>
        </p>
        {!my.roll.pass && my.lateLine && <ScriptText text={my.lateLine} className="text-[16px] text-[#D9D1E6]" />}
        {my.letter && frag?.hintOpen && (
          <p className="text-[15px] text-[#6FD39A]">
            Word {my.hint} of today's fragment starts with “{my.letter}”.
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
          <div className="font-['Cinzel'] font-bold text-[12px] tracking-[1px] text-[#8DB4F5] uppercase">
            On the table · {p.kind === 'notice' && p.attr ? `${p.title} · ${p.attr}` : p.title}
          </div>
          <div className="text-[13px] text-[#A9B9D3] whitespace-nowrap">{p.by.map((b) => (b.id === userId ? 'You' : b.name)).join(', ')}</div>
        </div>
        <Markable source={`${p.title}, at the fire`} text={fillShared(p.text ?? '')}>
          <ScriptText text={fillShared(p.text ?? '')} className="font-['Cormorant_Garamond',serif] font-semibold text-[18px] leading-[1.45] text-[#F4F1F8]" />
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
    if (m.kind === 'click')
      add(
        m.at,
        `click-${i}`,
        <div className="rounded-2xl border border-[#8A6E34] bg-[#2A2010] p-3 space-y-1" data-click>
          <div className="font-['Cinzel'] font-bold text-[12px] tracking-[1.2px] text-[#E5C158]">MYTHIOS · SOMETHING CLICKS</div>
          <ScriptText text={m.body} className="font-['Cormorant_Garamond',serif] font-semibold text-[18px] leading-[1.45] text-[#F4E8C8]" />
        </div>
      );
    else if (m.kind === 'say')
      add(
        m.at,
        `say-${i}`,
        <div className={`flex flex-col ${m.mine ? 'items-end' : 'items-start'}`}>
          {!m.mine && <div className="text-[12px] font-bold text-[#C39BF5]">{m.name}</div>}
          <div className={`max-w-[86%] px-3 py-2 text-[16px] border ${m.mine ? 'rounded-[16px_16px_4px_16px] bg-[#3A2A12] border-[#8A6E34]' : 'rounded-[4px_16px_16px_16px] bg-[#221636] border-[#3A2555]'}`}>
            {m.body}
          </div>
        </div>
      );
    else add(m.at, `ev-${i}`, <SmallLine>{m.mine ? m.body.replace(m.name ?? '', 'You') : m.body}</SmallLine>);
  });

  // The party's talk since this morning: the fire is the party chat. "X pinned a theory." is already on the fire's own line.
  if (together) {
    const since = new Date(partyDayStart(timeZone)).getTime();
    messages
      .filter((m) => new Date(m.created_at).getTime() >= since && !(m.kind === 'notice' && / pinned a theory\.$/.test(m.body)))
      .forEach((m) => add(m.created_at, `msg-${m.id}`, <ChatBubble m={m} userId={userId} members={memberRows} onReport={setReporting} />));
  }

  // His nudge, once something is on the table (or on arriving); MYTHIOS asks it on a narrated night.
  const firstPieceAt = pieces.map((p) => p.at).filter(Boolean).sort()[0];
  const nudgeAt = later(firstPieceAt && firstPieceAt > arrival ? firstPieceAt : arrival, 5);
  if (fire.nudge) add(nudgeAt, 'nudge', garrick ? <GarrickBubble text={fire.nudge} /> : <NarrationMessage text={fire.nudge} />);
  if (garrick && fire.callback) add(later(nudgeAt, 1), 'callback', <GarrickBubble text={fire.callback} />);

  // Words found, and the whole fragment with its meaning question.
  if (frag) {
    frag.solvers.forEach((s, i) => add(later(arrival, 10 + i), `word-${i}`, <SmallLine>{s} found a missing word.</SmallLine>));
    if (fragDone) {
      const myMeaning = notes.find((n) => n.kind === 'meaning' && n.mine)?.body ?? '';
      const draft = meaningDraft ?? myMeaning;
      add(
        later(arrival, 20),
        'fragment',
        <div className="rounded-2xl border border-[#5E4585] bg-[#1A1226] p-3 space-y-2" data-fragment-card>
          <div className="font-['Cinzel'] font-bold text-[12px] tracking-[1.2px] text-[#C39BF5]">TODAY'S FRAGMENT IS WHOLE</div>
          <p className="font-['Cormorant_Garamond',serif] font-semibold italic text-[19px] leading-[1.45] text-[#F4F1F8]">“{frag.text}”</p>
          {fire.meaningQuestion && (
            <>
              <ScriptText text={fire.meaningQuestion} className="text-[16px] text-[#E6E0F0]" />
              {notes
                .filter((n) => n.kind === 'meaning' && !n.mine)
                .map((n) => (
                  <p key={n.name} className="text-[15px]">
                    <span className="font-semibold text-[#C39BF5]">{n.name}:</span> {n.body}
                  </p>
                ))}
              <div className="flex gap-2">
                <input
                  className="flex-1 min-w-0 h-11 rounded-xl bg-[#0F0A18] border border-[#3A2555] px-3 text-[16px] text-[#F4F1F8] placeholder:text-[#6F6385]"
                  maxLength={200}
                  placeholder="What do you think it means?"
                  value={draft}
                  onChange={(e) => setMeaningDraft(e.target.value)}
                  aria-label="What do you think it means?"
                />
                <button
                  disabled={busy || !draft.trim() || draft === myMeaning}
                  onClick={async () => {
                    const ok = await call('leave_note', { p_kind: 'meaning', p_body: draft });
                    if (ok) setMeaningDraft(null);
                  }}
                  className="shrink-0 h-11 px-4 rounded-xl border border-[#5E4585] text-[#D9D1E6] font-semibold disabled:opacity-40"
                >
                  {myMeaning ? 'Change' : 'Say it'}
                </button>
              </div>
            </>
          )}
        </div>
      );
    }
  }

  // His closer, from 8:00pm (stored, v2.3 step 7).
  if (garrick && t?.evening) add(new Date().toISOString(), 'closer', <GarrickBubble text={pick(CAMPFIRE_STORED_LINES.closers, seed)} />);

  items.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));

  // ---- Tonight's question, pinned: before your pick, nothing of the others' (pin before peek); after, who said what. ----
  const myPick = fire.myPin?.reading ?? null;
  const readings = t?.readings ?? [];
  const pickedBy = (r: Reading) => readings.filter((x) => x.reading === r).map((x) => (x.mine ? 'you' : x.name));
  const folded = Boolean(myPick) && !questionOpen;
  const question = (
    <section
      className={`sticky top-[116px] z-10 rounded-2xl border px-3 py-2.5 space-y-2 bg-[#1F140C] ${
        myPick ? 'border-[#8A5A24]' : 'border-[#F0A552] shadow-[0_0_14px_rgba(240,165,82,0.35)]'
      }`}
      data-question
    >
      {folded ? (
        <button className="w-full text-left flex items-center gap-2" onClick={() => setQuestionOpen(true)} aria-expanded={false} data-question-folded>
          <span className="font-['Cinzel'] font-bold text-[11px] tracking-[1.2px] text-[#F0A552] shrink-0">TONIGHT</span>
          <span className="flex-1 min-w-0 truncate text-[15px] text-[#F4E8C8]">{readingText(myPick!)}</span>
          <span className="shrink-0 text-[13px] text-[#CDB594]">change ▾</span>
        </button>
      ) : (
        <>
          <div className="flex justify-between items-center gap-2">
            <div className="font-['Cinzel'] font-bold text-[12px] tracking-[1.5px] text-[#F0A552]">TONIGHT'S QUESTION</div>
            {myPick ? (
              <button className="text-[13px] text-[#CDB594]" onClick={() => setQuestionOpen(false)}>
                fold ▴
              </button>
            ) : (
              <div className="text-[12px] text-[#CDB594]">pick to see the others'</div>
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
                  {names.length > 0 && <span className="block text-[13px] text-[#CDB594]">{nameList(names)}</span>}
                </button>
              );
            })}
          </div>
          {myPick && <p className="text-[13px] text-[#CDB594]">You can change it until dawn. The fire's call is made then.</p>}
          {!myPick && together && (t?.pinned ?? []).length > 0 && (
            <p className="text-[13px] text-[#CDB594]">
              {nameList(t!.pinned)} {t!.pinned.length === 1 ? 'has' : 'have'} made a call.
            </p>
          )}
        </>
      )}
    </section>
  );

  return (
    <div className="space-y-4" data-fire>
      <div className="flex items-center gap-2 text-[12px] font-bold tracking-[1px] text-[#F0A552]" data-fire-divider>
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
          <div className="font-['Cinzel'] font-bold text-[12px] tracking-[1.2px] text-[#D4B876]">AROUND THE FIRE TONIGHT</div>
          {aroundLines.map((l) => (
            <p key={l} className="text-[16px] leading-[1.4]">
              {l}
            </p>
          ))}
        </div>
      )}

      {question}

      <div className="space-y-3" data-stream>
        {items.map((it) => (
          <React.Fragment key={it.key}>{it.node}</React.Fragment>
        ))}
      </div>
      {reporting && <ReportBox m={reporting} onDone={() => setReporting(null)} />}
      <ErrorLine text={error} />

      {together ? (
        <Composer
          placeholder="Say something at the fire"
          glow={hands.length > 0}
          onSend={async (text) => {
            const e = await sendChat(partyId, text, true);
            if (!e) reloadChat();
            return e;
          }}
          tray={(close) => (
            <>
              <div className="font-['Cinzel'] font-bold text-[12px] tracking-[1px] text-[#B7A9CC]">LAY A CLUE</div>
              {hands.length === 0 && <p className="text-[14px] text-[#8B7A9E]">Nothing in your hands tonight that is not already on the table.</p>}
              {hands.map((h) => (
                <div key={h.kind} className="rounded-xl border border-dashed border-[#6B5A85] p-2.5 space-y-2" data-hand={h.kind}>
                  {h.kind === 'notice' && h.attr ? (
                    <NoticeBlock attr={h.attr} text={fillShared(h.text)} label="What you noticed" />
                  ) : (
                    <>
                      <div className="font-['Cinzel'] font-bold text-[13px] text-[#F4F1F8] uppercase">{h.title}</div>
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
      ) : (
        <SmallLine>{fire.narrated ? 'You sit alone tonight. The others are on roads of their own.' : ''}</SmallLine>
      )}
    </div>
  );
}
