// The Campfire online (canon docs/canon/mythios-campfire-table-v2.md v2.3; approved design
// docs/design/fan-out-and-campfire-proposal.md). First the last light (one Fan Out lead, or straight to the fire), then
// one screen around the fire. Everything Garrick says is stored text; he never grades a theory. The server
// (campfire, fan_out_roll, pin_theory, leave_note, riddle_guess) keeps who found what, the pins and the riddle,
// and sends others' pins only after your own (pin before peek).
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, plainError } from './supabaseClient';
import { NarrationBlock, NoticeBlock, ScriptText, fillScriptTokens } from '../components/ChapterScriptParts';
import { ATTRIBUTE_META, challengeSucceedOn, getTierInfo, type AttributeName } from '../data/mythiosRulesData';
import { CAMPFIRE_STORED_LINES } from '../data/campfireDaysData';
import { ErrorLine, heading, input, note, quietButton } from './ui';
import AskGarrick from './AskGarrick';

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

// Sharing at the fire (migration 0079): your Notice line, the lines friends shared, what passers saw.
interface Shares {
  mine: { attr: AttributeName; text: string } | null;
  shared: boolean;
  noticed: { name: string; attr: AttributeName; body: string }[];
  saw: { name: string; kind: 'pass' | 'press'; text: string | null; title?: string; detail?: string }[];
}

const signed = (n: number) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);
// "Mei thinks the list is a warning." A sentence's first word drops its capital unless it is a name.
const LOWER_STARTS = new Set(['The', 'He', "It's", 'They', "They're", 'Now', 'Home', 'We', 'It', 'Someone', 'One', 'Their', 'There', 'Upriver']);
const asClause = (s: string) => {
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
  const [shares, setShares] = useState<Shares | null>(null);

  const load = useCallback(async () => {
    const { data, error: e } = await supabase.rpc('campfire', { p_party: partyId });
    if (e) return setError(e.message.includes('finish your day first') ? 'The fire opens once your own day is done.' : plainError(e.message));
    setFire(data as Fire);
    if ((data as Fire)?.chosen) {
      const { data: sh } = await supabase.rpc('fire_shares', { p_party: partyId });
      if (sh) setShares(sh as Shares);
    }
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

  // Once at the fire (after the last light), fetch what the others shared.
  useEffect(() => {
    if (!fire?.chosen) return;
    supabase.rpc('fire_shares', { p_party: partyId }).then(({ data }) => data && setShares(data as Shares));
  }, [fire?.chosen, fire?.week, fire?.day, partyId]);

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

  // ---- The fire (design Part 2, §3.3). ----
  const members = fire.members ?? [];
  const me = members.find((m) => m.me);
  const myName = me?.name ?? 'You';
  const readingText = (r: Reading, forks?: { A: string; B: string }) =>
    r === 'A' ? forks?.A ?? fire.forkA ?? '' : r === 'B' ? forks?.B ?? fire.forkB ?? '' : 'Neither.';
  const notes = fire.notes ?? [];
  const othersHere = members.filter((m) => !m.me && m.here);
  const alone = (fire.atFire ?? 1) <= 1;
  const garrick = !fire.narrated;
  const frag = fire.fragment;
  const fragDone = Boolean(frag?.text);
  // Friends' names in shared lines, as in your own chapter ({F1} is the first friend after you).
  const fillShared = (t: string) =>
    fillScriptTokens(t, { friends: members.filter((m) => !m.me).map((m) => m.name), partySize: members.length });

  // Garrick's stored lines tonight, in priority order; at most eight to one friend (v2.3 §H), the closer kept for leaving.
  const lines: { key: string; text: string }[] = [];
  const add = (key: string, text: string | null | undefined) => text && lines.push({ key, text });
  if (garrick) {
    add('opener', fire.opener);
    if ((fire.catchUp ?? []).length) {
      add(
        'catchUp',
        (fire.catchUp ?? [])
          .map((c) => CAMPFIRE_STORED_LINES.catchUpTemplate.replace('{friend}', c.name).replace('{reading}', c.reading === 'NEITHER' ? 'neither' : asClause(readingText(c.reading))))
          .join(' ') + ((fire.pinCount ?? 0) > 2 ? ' The rest are on the board.' : '')
      );
    }
    if (fire.firstHere) add('first', CAMPFIRE_STORED_LINES.firstArrivalGreeting);
    (fire.noticings ?? []).forEach((n, i) => add(`notice${i}`, CAMPFIRE_STORED_LINES.noticingTemplates[n.kind].replace('{friend}', n.name)));
    add('nudge', fire.nudge);
    if (fire.myPin) {
      add(
        'ack',
        pick(CAMPFIRE_STORED_LINES.theoryPinAcks, seed + (fire.myPin.reading === 'A' ? 0 : fire.myPin.reading === 'B' ? 1 : 2)).replace('{friend}', myName)
      );
    }
    if (fragDone) add('fragment', `“${frag!.text}”`);
    if (fire.riddle?.quip) add('riddle', fire.riddle.quip);
    add('callback', fire.callback);
    if (alone) add('bottle', CAMPFIRE_STORED_LINES.messageInABottlePrompt);
    if (fire.day === 6 && (fire.weekPins ?? []).length) add('weekPins', CAMPFIRE_STORED_LINES.day6WeeklyPinLine);
  }
  const budget = leaving ? 7 : 8;
  const shown = new Set(lines.slice(0, budget).map((l) => l.key));
  const say = (key: string) => {
    const l = lines.find((x) => x.key === key);
    return l && shown.has(key) ? <GarrickLine key={key} text={l.text} /> : null;
  };

  const note1 = (kind: string) => notes.find((n) => n.kind === kind && n.mine)?.body ?? '';
  const draft = (kind: string) => drafts[kind] ?? note1(kind);
  const setDraft = (kind: string, v: string) => setDrafts((d) => ({ ...d, [kind]: v }));
  const saveNote = async (kind: string) => {
    const ok = await call('leave_note', { p_kind: kind, p_body: draft(kind) });
    if (ok) setDrafts((d) => ({ ...d, [kind]: undefined as unknown as string }));
  };
  const noteBox = (kind: 'bottle' | 'question' | 'meaning' | 'week', placeholder: string, button: string) => (
    <div className="flex gap-2">
      <input className={input} maxLength={200} placeholder={placeholder} value={draft(kind)} onChange={(e) => setDraft(kind, e.target.value)} />
      <button className={quietButton} disabled={busy || !draft(kind).trim() || draft(kind) === note1(kind)} onClick={() => saveNote(kind)}>
        {button}
      </button>
    </div>
  );

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

  const leaveButton = (
    <button className={`w-full ${quietButton} py-2 font-[Cinzel] font-bold`} onClick={() => setLeaving(true)}>
      LEAVE THE FIRE
    </button>
  );

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
        {fire.pull && <NarrationBlock text={fire.pull} pull />}
        {!fire.narrated && (
          <Section label="A MESSAGE IN A BOTTLE">
            <p className={note}>For whoever comes to the fire next.</p>
            {noteBox('bottle', 'One line for the others', 'LEAVE IT')}
          </Section>
        )}
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
  const pinsBy = (r: Reading) => [
    ...(fire.myPin?.reading === r ? [`${myName} (you)`] : []),
    ...(fire.pins ?? []).filter((p) => p.reading === r).map((p) => p.name),
  ];
  const pinLines = [
    ...(fire.myPin?.line ? [{ name: `${myName} (you)`, line: fire.myPin.line }] : []),
    ...(fire.pins ?? []).filter((p) => p.line).map((p) => ({ name: p.name, line: p.line! })),
  ];
  const twoSplit =
    members.length === 2 && fire.myPin && (fire.pins ?? []).length === 1 && fire.pins![0].reading !== fire.myPin.reading;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        {back}
        <button className={quietButton} onClick={() => setLeaving(true)}>
          Leave the fire
        </button>
      </div>
      {title}
      {othersHere.length > 0 && <p className="text-[13px] text-[#6FD39A]">At the fire now: {othersHere.map((m) => m.name).join(', ')}</p>}

      {/* Arriving: the cup (an action only), the opener, who has been here, what he notices (v2.3 §B, §C, §I, §M). */}
      {fire.cupNight && (
        <p className="font-sans italic text-[14px] text-[#B7A9CC] px-1">{CAMPFIRE_STORED_LINES.cupNightStageDirection}</p>
      )}
      {fire.narrated ? <NarrationBlock text={fire.opener ?? ''} /> : null}
      {say('first')}
      {say('opener')}
      {say('catchUp')}
      {say('notice0')}
      {say('notice1')}
      {notes
        .filter((n) => n.kind === 'bottle' && !n.mine)
        .map((n) => (
          <NoteCard key={`b-${n.name}`} label={`A message in a bottle · ${n.name}`} body={n.body} />
        ))}
      {notes
        .filter((n) => n.kind === 'question' && !n.mine)
        .map((n) => (
          <NoteCard key={`q-${n.name}`} label={`An open question · ${n.name}`} body={n.body} />
        ))}

      {/* Your find from the last light. */}
      {my?.lead && my.roll && myLead && (
        <Section label="YOUR FIND">
          <div className="font-['Cinzel'] font-bold text-[12.5px]">{myLead.place}</div>
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
            <div className="pt-1 space-y-0.5" data-glimpse>
              <p className={note}>On the way back, the last of the light shows you one more place.</p>
              <div className="font-['Cinzel'] font-bold text-[12.5px]">{myGlimpse.place}</div>
            </div>
          )}
        </Section>
      )}

      {/* The board: one card per lead with every finder; a lead nobody took shows only its place (design Part 1),
          unless a pass at the last light showed it to someone on the way back (C4). */}
      <Section label="THE BOARD">
        {(fire.board ?? []).map((b) =>
          b.finders.length || b.glimpsedBy?.length ? (
            <div key={b.id} className="rounded-lg bg-[#130B1F] border border-[#D4B876]/50 p-2.5 space-y-1">
              <div className="font-['Cinzel'] font-bold text-[11.5px] text-[#E5C158] uppercase">{b.clueTitle}</div>
              <ScriptText text={b.clueText} className="text-[14px] text-[#F4F1F8] leading-[1.45]" />
              <p className={note}>
                {[
                  b.finders.length ? `Found by ${b.finders.join(', ')}` : '',
                  b.glimpsedBy?.length ? `Seen on the way back by ${b.glimpsedBy.join(', ')}` : '',
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          ) : fire.narrated ? null : (
            <p key={b.id} className="text-[13.5px] text-[#B7A9CC] italic">
              Nobody went to {b.place} tonight.
            </p>
          )
        )}
      </Section>

      {/* What each of you saw today (gameplay verdict, 17 Oct): Notice lines shared by choice; what a passer read,
          for a friend who did not pass ("Someone at the fire may have seen it"); [PRESS ON] finds. */}
      {shares && (shares.mine || shares.noticed.length > 0 || shares.saw.length > 0) && (
        <Section label="WHAT EACH OF YOU SAW">
          {shares.mine && (
            <div className="space-y-1.5">
              <NoticeBlock attr={shares.mine.attr} text={fillShared(shares.mine.text)} label="What you noticed" />
              {fire.narrated ? null : shares.shared ? (
                <p className={note}>On the board for the others.</p>
              ) : (
                <button
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    const { data, error: e } = await supabase.rpc('share_notice', { p_party: partyId });
                    setBusy(false);
                    if (e) return setError(plainError(e.message));
                    setShares(data as Shares);
                  }}
                  className={`w-full ${quietButton} py-2 font-[Cinzel] font-bold`}
                >
                  SHARE WHAT YOU NOTICED
                </button>
              )}
            </div>
          )}
          {shares.noticed.map((n) => (
            <NoticeBlock key={`n-${n.name}`} attr={n.attr} text={fillShared(n.body)} label={`${n.name} noticed`} />
          ))}
          {shares.saw.map((s) => (
            <div key={`${s.kind}-${s.name}`} className="rounded-lg bg-[#130B1F] border border-[#3A2555] p-2.5 space-y-1">
              <div className="font-['Cinzel'] font-bold text-[11px] tracking-[1px] uppercase text-[#B7A9CC]">
                {s.kind === 'pass' ? `What ${s.name} saw, that you missed` : `${s.name} pressed on: ${s.title ?? ''}`}
              </div>
              {s.kind === 'press' && s.detail && <p className="text-[13.5px] text-[#D9D1E6] italic">{fillShared(s.detail)}.</p>}
              {s.text && <ScriptText text={fillShared(s.text)} className="text-[14px] text-[#F4F1F8] leading-[1.45]" />}
            </div>
          ))}
        </Section>
      )}

      {/* The fragment, together (design §3.3 part 2). */}
      {frag && (
        <Section label="TODAY'S FRAGMENT">
          {fragDone ? (
            say('fragment') ?? <p className="italic text-[14px]">“{frag.text}”</p>
          ) : (
            <p className="text-[14px]">
              {frag.words === 0 ? 'You have not found either of its missing words yet.' : 'You have found one of its two missing words.'}
            </p>
          )}
          {frag.solvers.length > 0 && <p className={note}>Words found by {frag.solvers.join(', ')}</p>}
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

      {/* Tonight's question (v2.3 fork): A, B, Neither, your own line; names, never a count or a winner. */}
      <Section label="TONIGHT'S QUESTION">
        {say('nudge')}
        {say('callback')}
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
            placeholder={fire.myPin?.line ?? 'In your own words (optional)'}
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
              }
            }}
          >
            PIN
          </button>
        </div>
        {say('ack')}
        {fire.myPin && !fire.narrated && (
          <div className="space-y-1 pt-1">
            {readingsShown.map((r) =>
              pinsBy(r).length ? (
                <p key={r} className="text-[13.5px]">
                  <span className="text-[#B7A9CC]">{readingText(r)}</span> — <span className="font-semibold">{pinsBy(r).join(', ')}</span>
                </p>
              ) : null
            )}
            {pinLines.map((p) => (
              <p key={p.name} className="text-[13.5px] italic">
                {p.name}: “{p.line}”
              </p>
            ))}
            {twoSplit && <p className={note}>Two readings at the fire.</p>}
          </div>
        )}
        {!fire.myPin && (fire.pinCount ?? 0) > 0 && !fire.narrated && <p className={note}>Pin your own to see the others'.</p>}
        {fire.day === 6 && (fire.weekPins ?? []).length > 0 && shown.has('weekPins') && (
          <div className="space-y-1 pt-1">
            {(fire.weekPins ?? []).map((p, i) => (
              <p key={i} className="text-[13.5px]">
                {p.name}, Day {p.day}: {readingText(p.reading, fire.weekForks?.[String(p.day)])}
              </p>
            ))}
            {say('weekPins')}
          </div>
        )}
      </Section>

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
              {say('riddle')}
            </>
          )}
        </Section>
      )}

      {/* An open question for the board (v2.3 §E); Garrick never answers it. */}
      {!fire.narrated && (
        <Section label="AN OPEN QUESTION">
          {noteBox('question', 'Something you want the others to think about', 'PIN')}
        </Section>
      )}
      {say('bottle') && (
        <Section label="A MESSAGE IN A BOTTLE">
          {say('bottle')}
          {noteBox('bottle', 'One line for the others', 'LEAVE IT')}
        </Section>
      )}
      <AskGarrick partyId={partyId} place="fire" />

      <ErrorLine text={error} />
      {leaveButton}
    </div>
  );
}

function GarrickLine({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-[#241638] border border-[#5E4585] px-3 py-2">
      <div className="font-['Cinzel'] font-bold text-[11px] text-[#E5C158] tracking-[0.6px]">GARRICK</div>
      <ScriptText text={text} className="text-[14.5px] text-[#F4F1F8] leading-[1.45]" />
    </div>
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

function NoteCard({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-xl border border-[#3A2555] bg-[#130B1F] px-3 py-2">
      <div className="text-[12px] text-[#B7A9CC]">{label}</div>
      <p className="text-[14px]">{body}</p>
    </div>
  );
}
