// The Campfire online (canon docs/canon/mythios-campfire-table-v2.md v2.3; redesigned as version 3,
// docs/design/campfire-v3-17oct.md). First the last light (one Fan Out lead, or straight to the fire), then the fire:
// the table (every friend's pieces, agree and doubt), tonight's question (pin before peek, changes until dawn), the
// fragment and the rest, over one thread of what happens around the fire, with Garrick's card for your next step.
// Everything Garrick says is stored text; he never grades a theory. The server (campfire, fire_table, fire_lay,
// fire_react, fire_say, pin_theory, fan_out_roll, leave_note, riddle_guess) keeps all of it.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, plainError } from './supabaseClient';
import { NarrationBlock, NoticeBlock, ScriptText, fillScriptTokens } from '../components/ChapterScriptParts';
import { ATTRIBUTE_META, challengeSucceedOn, getTierInfo, type AttributeName } from '../data/mythiosRulesData';
import { CAMPFIRE_STORED_LINES } from '../data/campfireDaysData';
import { ErrorLine, heading, input, note, quietButton } from './ui';
import AskGarrick from './AskGarrick';
import { Markable } from './Markable';

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
  // Before choosing
  leads?: Lead[];
  progress?: { attrs: Record<AttributeName, number> };
  dc?: number;
  // At the fire
  tone?: 'wry' | 'quiet';
  cupNight?: boolean;
  opener?: string;
  forkA?: string;
  forkB?: string;
  callback?: string | null;
  nudge?: string | null;
  pull?: string | null;
  riddle?: {
    q: string;
    maxTries: number;
    wrong: number;
    gaveUp: boolean;
    solved: boolean;
    solvedBy: string | null;
    answer: string | null;
    quip: string | null;
  } | null;
  members?: Member[];
  firstHere?: boolean;
  myFanOut?: { lead: string | null; roll: Roll | null; hint: 1 | 2 | null; letter: string | null; lateLine: string | null; glimpse?: string | null };
  board?: { id: string; place: string; finders: string[]; glimpsedBy?: string[]; clueTitle: string; clueText: string }[];
  myPin?: { reading: Reading; line: string | null } | null;
  pins?: { name: string; reading: Reading; line: string | null }[];
  catchUp?: { name: string; reading: Reading }[];
  pinCount?: number;
  weekPins?: { name: string; day: number; reading: Reading }[] | null;
  weekForks?: Record<string, { A: string; B: string }> | null;
  notes?: { kind: 'bottle' | 'question' | 'meaning' | 'week'; name: string; body: string; mine: boolean; day: number }[];
  fragment?: { words: number; text: string | null; solvers: string[]; hintOpen: boolean };
  meaningQuestion?: string | null;
  weekQuestion?: string | null;
  noticings?: { kind: keyof typeof CAMPFIRE_STORED_LINES.noticingTemplates; name: string }[];
  atFire?: number;
  riddleRight?: boolean;
}

// The fire's table (migration 0092): pieces with who laid them, agree and doubt, the thread, readings after your own pin.
interface Piece {
  key: string;
  kind: 'lead' | 'notice' | 'pass' | 'press';
  title: string;
  text: string | null;
  attr?: AttributeName;
  by: { id: string; name: string }[];
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
  clicks: { text: string; names: string[]; solves: boolean }[];
  puzzle: string | null;
  thread: { kind: 'say' | 'pinned' | 'changed' | 'click' | 'laid'; name: string | null; mine: boolean | null; body: string }[];
  pinned: string[];
  readings: { id: string; name: string; reading: Reading; line: string | null; mine: boolean; agree: string[]; doubt: string[]; myReaction: 'agree' | 'doubt' | null }[] | null;
  leaning: 'split' | 'same' | null;
  lastCall: {
    forkA: string | null;
    forkB: string | null;
    reading: Reading | null;
    split: boolean;
    backers: Partial<Record<Reading, string[]>>;
  } | null;
}
type FireTab = 'table' | 'question' | 'fragment' | 'more';

const signed = (n: number) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);
// "Mei thinks the list is a warning." A sentence's first word drops its capital unless it is a name.
const LOWER_STARTS = new Set(['The', 'He', "It's", 'They', "They're", 'Now', 'Home', 'We', 'It', 'Someone', 'One', 'Their', 'There', 'Upriver']);
export const asClause = (s: string) => {
  const t = s.replace(/[.!?]$/, '');
  const first = t.split(' ')[0];
  return LOWER_STARTS.has(first) ? t.charAt(0).toLowerCase() + t.slice(1) : t;
};
const pick = <T,>(list: readonly T[], seed: number) => list[Math.abs(seed) % list.length];

export default function OnlineCampfire({
  partyId,
  onClose,
  onOpenChest,
}: {
  partyId: string;
  onClose: () => void;
  onOpenChest: () => void;
}) {
  const [fire, setFire] = useState<Fire | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState<Reading | null>(null);
  const [pinLine, setPinLine] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [riddleGuess, setRiddleGuess] = useState('');
  const [riddleAsked, setRiddleAsked] = useState(false);
  const [riddleNote, setRiddleNote] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [table, setTable] = useState<FireTable | null>(null);
  const [tab, setTab] = useState<FireTab>('table');
  const [sayText, setSayText] = useState('');

  const load = useCallback(async () => {
    const { data, error: e } = await supabase.rpc('campfire', { p_party: partyId });
    if (e) return setError(e.message.includes('finish your day first') ? 'The fire opens once your own day is done.' : plainError(e.message));
    setFire(data as Fire);
    if ((data as Fire)?.chosen) {
      const { data: tb } = await supabase.rpc('fire_table', { p_party: partyId });
      if (tb) setTable(tb as FireTable);
    }
  }, [partyId]);
  const loadTable = useCallback(async () => {
    const { data } = await supabase.rpc('fire_table', { p_party: partyId });
    if (data) setTable(data as FireTable);
  }, [partyId]);
  useEffect(() => {
    load();
    // Friends arrive, pin and solve while you sit here (live play, design §3.5).
    const t = window.setInterval(load, 20000);
    return () => window.clearInterval(t);
  }, [load]);

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

  // Once at the fire (after the last light), fetch the table.
  useEffect(() => {
    if (fire?.chosen) loadTable();
  }, [fire?.chosen, fire?.week, fire?.day, loadTable]);

  const seed = useMemo(() => (fire ? fire.week * 7 + fire.day : 0), [fire?.week, fire?.day]);

  const back = (
    <button className={quietButton} onClick={onClose}>
      ← The party
    </button>
  );
  if (!fire) {
    return (
      <div className="space-y-3">
        {back}
        {error ? <ErrorLine text={error} /> : <p className="text-center text-[#B7A9CC]">…</p>}
      </div>
    );
  }

  const title = (
    <div>
      <p className={note}>
        Week {fire.week} · Day {fire.day}
      </p>
      <h2 className={`${heading} text-[19px]`}>{fire.chosen ? 'The Campfire' : 'The last light'}</h2>
    </div>
  );

  // ---- The last light: one lead, or straight to the fire (design Part 1). ----
  if (!fire.chosen) {
    const attrs = fire.progress?.attrs ?? ({} as Record<AttributeName, number>);
    const dc = fire.dc ?? 6;
    return (
      <div className="space-y-4">
        {back}
        {title}
        <p className={note}>One more look, or the fire.</p>
        <div className="space-y-2.5">
          {(fire.leads ?? []).map((lead) => (
            <div key={lead.id} className="p-2.5 rounded-xl bg-[#180F29] border border-[#3A2555] space-y-1.5">
              <div className="font-['Cinzel'] font-bold text-[13px] text-[#F4F1F8]">{lead.place}</div>
              <div className="grid grid-cols-2 gap-1.5">
                {lead.actions.map((a) => {
                  const score = attrs[a.attr] ?? 10;
                  return (
                    <button
                      key={a.attr}
                      disabled={busy}
                      onClick={() => call('fan_out_roll', { p_lead: lead.id, p_attr: a.attr })}
                      className="py-2 px-2 rounded-lg bg-[#D4B876]/15 border border-[#D4B876]/70 text-left disabled:opacity-50"
                    >
                      <div className="font-['Cinzel'] font-bold text-[11.5px] uppercase" style={{ color: ATTRIBUTE_META[a.attr]?.color }}>
                        {a.attr} {score}
                      </div>
                      <div className="text-[12.5px] text-[#E6E0F0] leading-snug">
                        {a.verb} · {challengeSucceedOn(dc, getTierInfo(score).bonus)}+
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <button
          disabled={busy}
          onClick={() => call('fan_out_fire', {})}
          className="w-full py-2 px-3 rounded-lg bg-[#2A2018] border border-[#F0A552]/70 font-['Cinzel'] font-bold text-[12px] text-[#F0A552] uppercase"
        >
          {fire.narrated ? 'Rest for the night' : 'Head straight to the fire'}
        </button>
        <ErrorLine text={error} />
      </div>
    );
  }

  // ---- The fire, version 3 (docs/design/campfire-v3-17oct.md): the table, tonight's question, the fragment and
  // the rest, over one thread of what happens around the fire; Garrick's card says what is yours to do next. ----
  const members = fire.members ?? [];
  const me = members.find((m) => m.me);
  const myName = me?.name ?? 'You';
  const readingText = (r: Reading, forks?: { A: string; B: string }) =>
    r === 'A' ? forks?.A ?? fire.forkA ?? '' : r === 'B' ? forks?.B ?? fire.forkB ?? '' : 'Neither.';
  const notes = fire.notes ?? [];
  const othersHere = members.filter((m) => !m.me && m.here);
  const garrick = !fire.narrated;
  const frag = fire.fragment;
  const fragDone = Boolean(frag?.text);
  const t = table;
  // Friends' names in shared lines, as in your own chapter ({F1} is the first friend after you).
  const fillShared = (x: string) =>
    fillScriptTokens(x, { friends: members.filter((m) => !m.me).map((m) => m.name), partySize: members.length });
  const nameList = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

  const note1 = (kind: string) => notes.find((n) => n.kind === kind && n.mine)?.body ?? '';
  const draft = (kind: string) => drafts[kind] ?? note1(kind);
  const setDraft = (kind: string, v: string) => setDrafts((d) => ({ ...d, [kind]: v }));
  const saveNote = async (kind: string) => {
    const ok = await call('leave_note', { p_kind: kind, p_body: draft(kind) });
    if (ok) setDrafts((d) => ({ ...d, [kind]: undefined as unknown as string }));
  };
  const noteBox = (kind: 'meaning' | 'week', placeholder: string, button: string) => (
    <div className="flex gap-2">
      <input className={input} maxLength={200} placeholder={placeholder} value={draft(kind)} onChange={(e) => setDraft(kind, e.target.value)} />
      <button className={quietButton} disabled={busy || !draft(kind).trim() || draft(kind) === note1(kind)} onClick={() => saveNote(kind)}>
        {button}
      </button>
    </div>
  );

  const callTable = async (fn: string, args: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    const { data, error: e } = await supabase.rpc(fn, { p_party: partyId, ...args });
    setBusy(false);
    if (e) return setError(plainError(e.message));
    setTable(data as FireTable);
  };

  // What we did today (v2.3 step 7): one line per friend, only for what they really did.
  const whatWeDid = members
    .map((m) => {
      const parts: string[] = [];
      if (m.passed) parts.push(`passed today's Challenge at ${fire.place}`);
      else if (m.scraped) parts.push(`was defeated at ${fire.place}`);
      if (m.gaveTo) parts.push(`gave a Relic to ${[...new Set(m.gaveTo.split(', '))].join(', ')}`);
      if (m.lead) parts.push('brought back a clue from the last light');
      if (m.words >= 2) parts.push("found both missing words in today's fragment");
      else if (m.words === 1) parts.push("found a missing word in today's fragment");
      return parts.length ? `${m.name} ${parts.join(' · ')}.` : null;
    })
    .filter((l): l is string => Boolean(l));

  // Resting for the night: Garrick's closer and what we did today (v2.3 step 7). The Pull is not shown again here:
  // the chapter already ends on it, word for word (Fake Guru, 18 Oct: "how come got repeat of the last paragraph").
  if (leaving) {
    return (
      <div className="space-y-4">
        {back}
        {title}
        {garrick ? <GarrickLine text={pick(CAMPFIRE_STORED_LINES.closers, seed)} /> : null}
        {whatWeDid.length > 0 && !fire.narrated && (
          <Section label="WHAT WE DID TODAY">
            {whatWeDid.map((l) => (
              <p key={l} className="text-[14px]">
                {l}
              </p>
            ))}
          </Section>
        )}
        <p className={note}>You can come back to the fire until dawn.</p>
        <button className={`w-full ${quietButton} py-2.5 font-[Cinzel] font-bold`} onClick={onClose}>
          BACK TO THE PARTY
        </button>
        <ErrorLine text={error} />
      </div>
    );
  }

  const my = fire.myFanOut;
  const myLead = fire.board?.find((b) => b.id === my?.lead);
  // A pass at the last light also shows one more lead (gameplay verdict C4).
  const myGlimpse = fire.board?.find((b) => b.id === my?.glimpse);
  const riddleOpen = fire.riddle && (fire.tone !== 'quiet' || riddleAsked || fire.riddle.wrong > 0 || fire.riddle.solved);
  const triesLeft = fire.riddle ? fire.riddle.maxTries - fire.riddle.wrong : 0;
  const readingsShown: Reading[] = ['A', 'B', 'NEITHER'];
  const pieces = t?.pieces ?? [];
  const hands = t?.hands ?? [];
  const takenLeads = new Set(pieces.filter((p) => p.kind === 'lead').map((p) => p.key.slice(5)));
  const untaken = (fire.board ?? []).filter((b) => !takenLeads.has(b.id));
  const solved = (t?.clicks ?? []).find((c) => c.solves);

  // Last night's call, by name, never counts (v3 §5).
  const last = t?.lastCall;
  const lastForks = last ? { A: last.forkA ?? '', B: last.forkB ?? '' } : undefined;
  const backers = (r: Reading) => (last?.backers?.[r] ?? []) as string[];
  const lastLine = !last
    ? null
    : last.reading
      ? `Last night the fire called it: ${asClause(readingText(last.reading, lastForks)).replace(/\.$/, '')}. ${nameList(backers(last.reading))} said so${
          readingsShown.filter((r) => r !== last.reading).flatMap(backers).length
            ? `; ${nameList(readingsShown.filter((r) => r !== last.reading).flatMap(backers))} held out`
            : ''
        }.`
      : last.split
        ? `Last night the fire was split. ${readingsShown
            .filter((r) => backers(r).length)
            .map((r) => `${nameList(backers(r))}: ${asClause(readingText(r, lastForks)).replace(/\.$/, '')}`)
            .join('; ')}.`
        : null;

  // Garrick's card, yours alone: the one thing to do next (v3 §5).
  let cardText: string | null = null;
  let cardAction: { label: string; run: () => void } | null = null;
  if (!fire.narrated) {
    if (hands.length) {
      cardText = 'You noticed something today. Lay it down?';
      cardAction = { label: 'THE TABLE', run: () => setTab('table') };
    } else if (!fire.myPin) {
      cardText = t?.evening ? "The fire's call closes at dawn." : "Tonight's question is still open for you. Pin your reading before you look at the others'.";
      cardAction = { label: "TONIGHT'S QUESTION", run: () => setTab('question') };
    } else if (t?.leaning === 'split') {
      cardText = 'Good. Argue it out. I listen better than I talk.';
    } else if (t?.leaning === 'same') {
      cardText = 'Everyone leans the same way. What would it take to be wrong?';
    } else {
      cardText = 'Sit as long as you like. You can change your reading until dawn.';
    }
  }

  const reactButtons = (target: string, mine: string | null | undefined) => (
    <div className="flex gap-2">
      {(['agree', 'doubt'] as const).map((k) => (
        <button
          key={k}
          disabled={busy}
          onClick={() => callTable('fire_react', { p_target: target, p_kind: k })}
          className={`rounded-full border px-3 py-1 text-[12.5px] ${
            mine === k ? (k === 'agree' ? 'border-[#6FD39A] text-[#6FD39A]' : 'border-[#F0A552] text-[#F0A552]') : 'border-[#3A2555] text-[#D8CEE8]'
          }`}
        >
          {k === 'agree' ? 'Agree' : 'Doubt'}
        </button>
      ))}
    </div>
  );
  const reactLine = (agree: string[], doubt: string[]) =>
    agree.length || doubt.length ? (
      <p className={note}>
        {[agree.length ? `Agreed: ${agree.join(', ')}` : '', doubt.length ? `Doubted: ${doubt.join(', ')}` : ''].filter(Boolean).join(' · ')}
      </p>
    ) : null;

  const tabs: { key: FireTab; label: string }[] = [
    { key: 'table', label: 'The table' },
    { key: 'question', label: 'The question' },
    { key: 'fragment', label: 'The fragment' },
    { key: 'more', label: 'More' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        {back}
        <button className={quietButton} onClick={() => setLeaving(true)}>
          Rest for the night
        </button>
      </div>
      {title}
      {othersHere.length > 0 && <p className="text-[13px] text-[#6FD39A]">At the fire now: {othersHere.map((m) => m.name).join(', ')}</p>}

      {/* Arriving: the cup (an action only), the opener, what he notices (v2.3 §B, §C, §I). */}
      {fire.cupNight && (
        <p className="font-sans italic text-[14px] text-[#B7A9CC] px-1">{CAMPFIRE_STORED_LINES.cupNightStageDirection}</p>
      )}
      {fire.narrated ? <NarrationBlock text={fire.opener ?? ''} /> : null}
      {garrick && fire.firstHere ? <GarrickLine text={CAMPFIRE_STORED_LINES.firstArrivalGreeting} /> : null}
      {garrick && fire.opener ? <GarrickLine text={fire.opener} /> : null}
      {garrick &&
        (fire.noticings ?? []).map((n, i) => (
          <GarrickLine key={`n${i}`} text={CAMPFIRE_STORED_LINES.noticingTemplates[n.kind].replace('{friend}', n.name)} />
        ))}
      {lastLine && (
        <div className="rounded-xl bg-[#16233A] border border-[#3E5C8A] px-3 py-2" data-last-call>
          <div className="font-['Cinzel'] font-bold text-[11px] text-[#9CC2F0] tracking-[0.6px]">LAST NIGHT</div>
          <p className="text-[14px] text-[#F4F1F8] italic">{lastLine}</p>
        </div>
      )}
      {t?.puzzle && (
        <div className={`rounded-xl px-3 py-2 border ${solved ? 'border-[#5C9A6C]' : 'border-[#3A2555]'} bg-[#1E1232]`} data-puzzle>
          <div className="font-['Cinzel'] font-bold text-[11px] text-[#B7A9CC] tracking-[0.6px]">TONIGHT'S PUZZLE</div>
          <p className="text-[15px] font-semibold">{t.puzzle}</p>
          <p className={`text-[13px] ${solved ? 'text-[#6FD39A]' : 'text-[#B7A9CC]'}`}>
            {solved ? `Solved by ${nameList(solved.names)}: ${solved.text}` : 'The right two pieces on the table will show it.'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-1.5" role="tablist">
        {tabs.map((x) => (
          <button
            key={x.key}
            role="tab"
            aria-selected={tab === x.key}
            onClick={() => setTab(x.key)}
            className={`rounded-lg border py-2 text-[12.5px] font-semibold ${tab === x.key ? 'border-[#D4B876] bg-[#2E1B42]' : 'border-[#3A2555]'}`}
          >
            {x.label}
          </button>
        ))}
      </div>

      {tab === 'table' && (
        <div className="space-y-2.5" data-tab="table">
          {/* Your own find: the roll, the first-letter hint, the glimpse (C4). */}
          {my?.lead && my.roll && myLead && (
            <div className="rounded-lg border border-[#3A2555] p-2.5 space-y-1">
              <div className="font-['Cinzel'] font-bold text-[12px]">Your find · {myLead.place}</div>
              <p className="font-mono text-[12.5px] text-[#D8CEE8]">
                🎲 {my.roll.d20} + {my.roll.attr} {my.roll.score} (+{my.roll.bonus}) − DC {my.roll.dc} = {signed(my.roll.net)}{' '}
                <span className={my.roll.pass ? 'text-[#6FD39A]' : 'text-[#F08A8A]'}>{my.roll.pass ? 'PASSED' : 'FAILED'}</span>
              </p>
              {!my.roll.pass && my.lateLine && <p className="italic text-[14px] text-[#D9D1E6]">{my.lateLine}</p>}
              {my.letter && frag?.hintOpen && (
                <p className="text-[13px] text-[#6FD39A]">
                  Word {my.hint} of today's fragment starts with “{my.letter}”.
                </p>
              )}
              {myGlimpse && (
                <p className={note} data-glimpse>
                  On the way back, the last of the light shows you one more place: {myGlimpse.place}.
                </p>
              )}
            </div>
          )}
          {pieces.map((p) => (
            <div key={p.key} className="rounded-lg bg-[#130B1F] border border-[#D4B876]/50 p-2.5 space-y-1.5" data-piece={p.key}>
              <div className="flex justify-between gap-2 items-baseline">
                <div className="font-['Cinzel'] font-bold text-[11.5px] text-[#E5C158] uppercase">
                  {p.kind === 'notice' && p.attr ? `${p.title} · ${p.attr}` : p.title}
                </div>
                <div className="text-[12px] text-[#B7A9CC] whitespace-nowrap">{p.by.map((b) => b.name).join(', ')}</div>
              </div>
              <Markable source={`${p.title}, at the fire`} text={fillShared(p.text ?? '')}>
                <ScriptText text={fillShared(p.text ?? '')} className="text-[14px] text-[#F4F1F8] leading-[1.45]" />
              </Markable>
              {!p.mine && !fire.narrated && reactButtons(p.key, p.myReaction)}
              {reactLine(p.agree, p.doubt)}
            </div>
          ))}
          {!fire.narrated &&
            untaken.map((b) =>
              b.glimpsedBy?.length ? (
                <p key={b.id} className="text-[13.5px] text-[#B7A9CC] italic">
                  Nobody went to {b.place} tonight. {b.glimpsedBy.join(', ')} saw it on the way back.
                </p>
              ) : (
                <p key={b.id} className="text-[13.5px] text-[#B7A9CC] italic">
                  Nobody went to {b.place} tonight.
                </p>
              )
            )}
          {hands.length > 0 && (
            <div className="rounded-lg border border-dashed border-[#6B5A85] p-2.5 space-y-2" data-hands>
              <div className="font-['Cinzel'] font-bold text-[11px] tracking-[1px] text-[#B7A9CC]">STILL IN YOUR HANDS</div>
              {hands.map((h) => (
                <div key={h.kind} className="space-y-1.5">
                  {h.kind === 'notice' && h.attr ? (
                    <NoticeBlock attr={h.attr} text={fillShared(h.text)} label="What you noticed" />
                  ) : (
                    <>
                      <div className="font-['Cinzel'] font-bold text-[11.5px] text-[#F4F1F8] uppercase">{h.title}</div>
                      <ScriptText text={fillShared(h.text)} className="text-[14px] text-[#D9D1E6] leading-[1.45]" />
                    </>
                  )}
                  <button
                    disabled={busy}
                    onClick={() => callTable('fire_lay', { p_kind: h.kind })}
                    className="rounded-lg bg-[#D4B876] px-3 py-1.5 font-[Cinzel] font-bold text-[12px] text-[#130B1F] disabled:opacity-50"
                  >
                    LAY IT DOWN
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'question' && (
        <div className="space-y-2.5" data-tab="question">
          {garrick && fire.nudge ? <GarrickLine text={fire.nudge} /> : null}
          {garrick && fire.callback ? <GarrickLine text={fire.callback} /> : null}
          {fire.narrated && fire.nudge && <NarrationBlock text={fire.nudge} />}
          <div className="space-y-1.5">
            {readingsShown.map((r) => {
              const chosen = (reading ?? fire.myPin?.reading) === r;
              return (
                <button
                  key={r}
                  onClick={() => setReading(r)}
                  className={`w-full text-left rounded-lg border px-3 py-2 text-[14px] ${
                    chosen ? 'border-[#D4B876] bg-[#2E1B42]' : 'border-[#3A2555] bg-[#130B1F]'
                  }`}
                >
                  {readingText(r)}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input
              className={input}
              maxLength={140}
              placeholder={fire.myPin?.line ?? 'In your own words, if you like'}
              value={pinLine}
              onChange={(e) => setPinLine(e.target.value)}
            />
            <button
              className={quietButton}
              disabled={busy || !(reading ?? fire.myPin?.reading)}
              onClick={async () => {
                const ok = await call('pin_theory', { p_reading: reading ?? fire.myPin?.reading, p_line: pinLine || fire.myPin?.line || '' });
                if (ok) {
                  setPinLine('');
                  setReading(null);
                  loadTable();
                }
              }}
            >
              PIN
            </button>
          </div>
          <p className={note}>
            {fire.myPin
              ? 'Pinned. You can change it until dawn; the fire is told you changed sides, never to which.'
              : 'Your pin stays secret until you have made it.'}
          </p>
          {!fire.narrated && (
            <div className="rounded-lg border border-[#3A2555] p-2.5 space-y-2">
              <div className="font-['Cinzel'] font-bold text-[11px] tracking-[1px] text-[#B7A9CC]">THE FIRE'S READINGS</div>
              {!fire.myPin ? (
                <p className={note}>
                  {(t?.pinned ?? []).length
                    ? `${nameList(t!.pinned)} ${t!.pinned.length === 1 ? 'has' : 'have'} pinned. Pin yours to see ${t!.pinned.length === 1 ? 'it' : 'them'}.`
                    : 'Nobody has pinned yet.'}
                </p>
              ) : (
                (t?.readings ?? []).map((r) => (
                  <div key={r.id} className="space-y-1" data-reading={r.name}>
                    <p className="text-[13.5px]">
                      <span className="font-semibold">{r.mine ? `${r.name} (you)` : r.name}:</span> {readingText(r.reading)}
                    </p>
                    {r.line && <p className="text-[13.5px] italic">“{r.line}”</p>}
                    {!r.mine && reactButtons(`pin:${r.id}`, r.myReaction)}
                    {reactLine(r.agree, r.doubt)}
                  </div>
                ))
              )}
              <p className={note}>The fire's call is made at dawn, from whoever has pinned.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'fragment' && frag && (
        <Section label="TODAY'S FRAGMENT">
          {fragDone ? (
            <p className="italic text-[14px]">“{frag.text}”</p>
          ) : (
            <p className="text-[14px]">
              {frag.words === 0 ? 'Both of its missing words are still open.' : 'One of its missing words is still open.'}
            </p>
          )}
          {frag.solvers.length > 0 && <p className={note}>Found by {frag.solvers.join(', ')}</p>}
          {!fragDone && (
            <button className={`w-full ${quietButton} py-2 font-[Cinzel] font-bold`} onClick={onOpenChest}>
              🕯️ OPEN THE SEEKER CHEST
            </button>
          )}
          {fragDone && fire.meaningQuestion && (
            <div className="space-y-1.5 pt-1">
              <ScriptText text={fire.meaningQuestion} className="text-[14px] text-[#E6E0F0]" />
              {notes
                .filter((n) => n.kind === 'meaning' && !n.mine)
                .map((n) => (
                  <p key={n.name} className="text-[13.5px]">
                    <span className="font-semibold">{n.name}:</span> {n.body}
                  </p>
                ))}
              {noteBox('meaning', 'Your answer, in one line', 'PIN')}
            </div>
          )}
        </Section>
      )}

      {tab === 'more' && (
        <div className="space-y-3" data-tab="more">
          {/* The case so far (design §3.3 part 4): the week's question and each friend's current line. */}
          {fire.weekQuestion && (
            <Section label="THE CASE SO FAR">
              <p className="text-[14.5px] font-semibold">{fire.weekQuestion}</p>
              {notes
                .filter((n) => n.kind === 'week' && !n.mine)
                .map((n) => (
                  <p key={n.name} className="text-[13.5px]">
                    <span className="font-semibold">{n.name}:</span> {n.body}
                  </p>
                ))}
              {noteBox('week', 'Your theory, in one line', 'SAVE')}
              {fire.myPin && !draft('week') && (
                <button className={quietButton} onClick={() => setDraft('week', fire.myPin!.line || readingText(fire.myPin!.reading))}>
                  Use tonight's pin
                </button>
              )}
              {fire.day === 6 &&
                (fire.weekPins ?? []).map((p, i) => (
                  <p key={i} className="text-[13.5px]">
                    {p.name}, Day {p.day}: {readingText(p.reading, fire.weekForks?.[String(p.day)])}
                  </p>
                ))}
            </Section>
          )}
          {/* The riddle (v2.3 §G, §M): shared, three tries each; on a quiet night only if asked for. */}
          {fire.riddle && (
            <Section label="A RIDDLE">
              {!riddleOpen ? (
                <button className={quietButton} onClick={() => setRiddleAsked(true)}>
                  A riddle?
                </button>
              ) : (
                <>
                  <p className="text-[14.5px] italic">{fire.riddle.q}</p>
                  {fire.riddle.solved ? (
                    <p className="text-[14px]">
                      {fire.riddle.solvedBy} solved it: {fire.riddle.answer}.
                    </p>
                  ) : fire.riddle.answer ? (
                    <p className="text-[14px]">The answer: {fire.riddle.answer}.</p>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input className={input} value={riddleGuess} onChange={(e) => setRiddleGuess(e.target.value)} placeholder="Your answer" />
                        <button
                          className={quietButton}
                          disabled={busy || !riddleGuess.trim()}
                          onClick={async () => {
                            const r = await call('riddle_guess', { p_guess: riddleGuess });
                            setRiddleGuess('');
                            setRiddleNote(r && !r.riddleRight && !r.riddle?.answer ? 'Not that.' : null);
                          }}
                        >
                          TRY
                        </button>
                      </div>
                      <p className={note}>
                        {triesLeft} {triesLeft === 1 ? 'try' : 'tries'} left.{riddleNote ? ` ${riddleNote}` : ''}
                      </p>
                      <button className={quietButton} disabled={busy} onClick={() => call('riddle_give_up', {})}>
                        Give up
                      </button>
                    </>
                  )}
                  {garrick && fire.riddle.quip ? <GarrickLine text={fire.riddle.quip} /> : null}
                </>
              )}
            </Section>
          )}
          <AskGarrick partyId={partyId} place="fire" />
        </div>
      )}

      {/* Around the fire: one thread, in time order, for live and async alike (v3 §8). */}
      {!fire.narrated && (
        <Section label="AROUND THE FIRE">
          {(t?.thread ?? []).length === 0 && <p className={note}>Nothing yet tonight.</p>}
          {(t?.thread ?? []).map((m, i) =>
            m.kind === 'say' ? (
              <div key={i}>
                <div className="text-[12px] font-semibold text-[#D9C9F0]">{m.mine ? `${m.name} (you)` : m.name}</div>
                <Markable source={`${m.name}, at the fire`} text={m.body}>
                  <p className="text-[14px]">{m.body}</p>
                </Markable>
              </div>
            ) : m.kind === 'click' ? (
              <div key={i} className="rounded-lg bg-[#16233A] border border-[#3E5C8A] px-2.5 py-2" data-click>
                <div className="font-['Cinzel'] font-bold text-[10.5px] text-[#9CC2F0] tracking-[0.6px]">MYTHIOS · THE TABLE CLICKS</div>
                <p className="text-[14px] italic">{m.body}</p>
              </div>
            ) : (
              <p key={i} className="text-[12.5px] text-[#8B7A9E] text-center">
                {m.kind === 'laid' ? `${m.mine ? 'You' : m.name} laid a piece down: ${m.body}.` : m.mine ? m.body.replace(myName, 'You') : m.body}
              </p>
            )
          )}
          <div className="flex gap-2">
            <input
              className={input}
              maxLength={300}
              placeholder="Say something at the fire"
              value={sayText}
              onChange={(e) => setSayText(e.target.value)}
            />
            <button
              className={quietButton}
              disabled={busy || !sayText.trim()}
              onClick={async () => {
                await callTable('fire_say', { p_body: sayText });
                setSayText('');
              }}
            >
              SAY
            </button>
          </div>
        </Section>
      )}

      {cardText && (
        <div className="rounded-xl bg-[#2A1A10] border border-[#5A4020] px-3 py-2 space-y-1.5" data-card>
          <div className="font-['Cinzel'] font-bold text-[11px] text-[#E5C158] tracking-[0.6px]">GARRICK, TO YOU</div>
          <ScriptText text={cardText} className="text-[14.5px] text-[#F4F1F8] leading-[1.45]" />
          {cardAction && (
            <button className={quietButton} onClick={cardAction.run}>
              {cardAction.label}
            </button>
          )}
        </div>
      )}

      <ErrorLine text={error} />
      <button className={`w-full ${quietButton} py-2 font-[Cinzel] font-bold`} onClick={() => setLeaving(true)}>
        REST FOR THE NIGHT
      </button>
    </div>
  );
}

function GarrickLine({ text }: { text: string }) {
  return (
    <Markable source="Garrick, at the fire" text={text}>
      <div className="rounded-xl bg-[#241638] border border-[#5E4585] px-3 py-2">
        <div className="font-['Cinzel'] font-bold text-[11px] text-[#E5C158] tracking-[0.6px]">GARRICK</div>
        <ScriptText text={text} className="text-[14.5px] text-[#F4F1F8] leading-[1.45]" />
      </div>
    </Markable>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[#180F29] border border-[#3A2555] p-3 space-y-2">
      <h3 className="font-['Cinzel'] font-bold text-[12px] tracking-[1.2px] text-[#D4B876]">{label}</h3>
      {children}
    </div>
  );
}
