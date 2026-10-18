// The Gathering, played live online (build step 5; Core Rules §1, §4, §5, §11, §12a). The server keeps one place in the
// script for the whole party, rolls every die and runs every timer; this screen asks it every two seconds what the night
// looks like now (gathering_tick) and sends taps through one door (gathering_do). It only ever receives the steps
// already reached. Canon's words come from the server; the labels here are the demo's (StoryAndPartyTabs).
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, plainError } from './supabaseClient';
import { Markable } from './Markable';
import { NarrationBlock, NoticeBlock, ScriptButton, ScriptInline, ScriptText, TapEcho } from '../components/ChapterScriptParts';
import { challengeSucceedOn, getTierInfo, type AttributeName } from '../data/mythiosRulesData';
import { card, ErrorLine, goldButton, heading, input, note, quietButton } from './ui';
import PartyChat from './PartyChat';
import type { MemberRow } from './supabaseClient';

type Entry = { i: number; t: string; at: string } & Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
interface View {
  none?: boolean;
  same?: boolean;
  key?: string;
  week: number;
  version: number;
  now: string;
  opensAt: string;
  startedAt: string | null;
  endedAt: string | null;
  cursor: number;
  waitUntil: string | null;
  timeZone: string;
  tonight: string | null;
  ueAttr: AttributeName;
  party: { id: string; name: string; here: boolean; in: boolean }[];
  me: string;
  isHost: boolean;
  n: number | null;
  log: Entry[];
  progress: { gold: number; attrs: Record<string, number>; relics: Record<string, number>; weapon: number; armor: number } | null;
  /** Opened only after it ended, never having been in it (0072): its recap instead of the night. */
  missed?: boolean;
  recap?: string;
  /** Came in after it started (0072): one "what you missed" line. */
  lateLine?: string | null;
}

const ATTRS: AttributeName[] = ['Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim'];
const signed = (n: number) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);
// "8:00pm" on the party's clock.
export const clockTime = (iso: string, tz: string) => {
  try {
    return new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true })
      .format(new Date(iso))
      .replace(' ', '')
      .toLowerCase();
  } catch {
    return '';
  }
};
// "Tonight: the Gathering, 8:00pm. …" (Core Rules §11: the time goes into the Tonight line).
export const tonightLine = (tonight: string | null, opensAt: string, tz: string) =>
  tonight ? tonight.replace(/^Tonight: the Gathering\./, `Tonight: the Gathering, ${clockTime(opensAt, tz)}.`) : null;

export default function OnlineGathering({
  partyId,
  onClose,
  userId,
  members,
  embedded = false,
}: {
  partyId: string;
  onClose: () => void;
  /** In the game shell's story thread (phase A): no header, no way back to a party page. */
  embedded?: boolean;
  /** For the table talk on the Gathering screen (gameplay verdict, 17 Oct). */
  userId?: string;
  members?: MemberRow[];
}) {
  const [view, setView] = useState<View | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [offset, setOffset] = useState(0); // server clock − phone clock, for the countdowns
  const [, setTick] = useState(0);
  const [answer, setAnswer] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const keyRef = useRef<string | null>(null);
  // [GO ON] now needs more than half of the friends here (migration 0080): the passages this phone has asked to leave.
  const [goneOn, setGoneOn] = useState<Record<number, boolean>>({});
  // The table's question: every friend's answer, once you have given yours (migration 0080).
  const [answers, setAnswers] = useState<Record<number, { mine: boolean; answers: { name: string; text: string }[]; count: number }>>({});
  // The vote's help: each way's Attribute and the best friend here at it (Core Rules §11 "toolkit").
  const [voteHelp, setVoteHelp] = useState<{ attr: AttributeName; best: { name: string; score: number; bonus: number } | null }[] | null>(null);
  // The case so far, read back at the opening (migration 0079, as in the demo).
  const [caseSoFar, setCaseSoFar] = useState<{
    question: string | null;
    lines: { name: string; firstDay: number; first: string; lastDay: number; last: string }[];
    more: boolean;
  } | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const take = (v: View) => {
    setOffset(new Date(v.now).getTime() - Date.now());
    if (v.same) return;
    keyRef.current = v.key ?? null;
    setView(v);
  };

  const poll = useCallback(async () => {
    const { data, error: e } = await supabase.rpc('gathering_tick', { p_party: partyId, p_seen: keyRef.current });
    if (e) setError(plainError(e.message));
    else take(data as View);
  }, [partyId]);

  useEffect(() => {
    poll();
    const id = window.setInterval(poll, 2000);
    const clock = window.setInterval(() => setTick((x) => x + 1), 1000);
    return () => {
      window.clearInterval(id);
      window.clearInterval(clock);
    };
  }, [poll]);

  const caseWeek = view?.startedAt ? view.week : null;
  useEffect(() => {
    if (!caseWeek) return;
    supabase.rpc('gathering_case', { p_party: partyId, p_week: caseWeek }).then(({ data }) => data && setCaseSoFar(data));
  }, [caseWeek, partyId]);

  const logLength = view?.log?.length ?? 0;
  useEffect(() => {
    // Follow the story down only if this friend is already near the bottom: someone scrolled up to read stays put.
    const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 400;
    if (nearBottom) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [logLength]);

  // The table's questions: fetch the answers while one is open, and once more after the night has answered it.
  const finalAnswers = useRef<Set<number>>(new Set());
  const viewVersion = view?.key;
  useEffect(() => {
    for (const x of view?.log ?? []) {
      if (x.t !== 'turn' || finalAnswers.current.has(x.i)) continue;
      const closed = Boolean(x.answer);
      if (!closed && x.i !== view?.cursor) continue;
      if (closed) finalAnswers.current.add(x.i);
      const at = x.i;
      supabase.rpc('gathering_answers', { p_party: partyId, p_i: at }).then(({ data }) => data && setAnswers((a) => ({ ...a, [at]: data })));
    }
  }, [view?.log, view?.cursor, viewVersion, partyId]);
  // The vote at the cursor: its help, once.
  const voteAt = view?.log?.some((x) => x.t === 'pick' && x.mode === 'vote' && x.i === view.cursor) ?? false;
  useEffect(() => {
    if (!voteAt || voteHelp) return;
    supabase.rpc('gathering_vote_help', { p_party: partyId }).then(({ data }) => data && setVoteHelp(data));
  }, [voteAt, voteHelp, partyId]);

  const go = async (action: string, args: Record<string, unknown> = {}) => {
    setBusy(true);
    setError(null);
    const { data, error: e } = await supabase.rpc('gathering_do', { p_party: partyId, p_action: action, p_args: args });
    if (e) setError(plainError(e.message));
    else {
      keyRef.current = null; // the next tick brings the full view again
      take(data as View);
    }
    setBusy(false);
  };

  const header = embedded ? null : (
    <div className="flex items-center justify-between gap-2">
      <button className={quietButton} onClick={onClose}>
        ← The party
      </button>
      {view?.progress && <span className="font-['Cinzel'] font-bold text-[13px] text-[#E5C158]">◎ {view.progress.gold.toLocaleString()}g</span>}
    </div>
  );

  if (!view) {
    return (
      <div className="space-y-4">
        {header}
        <ErrorLine text={error} />
        {!error && <p className="text-center text-[#B7A9CC]">…</p>}
      </div>
    );
  }
  if (view.none) {
    return (
      <div className="space-y-4">
        {header}
        <p className={note}>There is no Gathering tonight.</p>
      </div>
    );
  }
  // Opened only after it ended (Core Rules §11 "Missing the whole Gathering": the friend gets the recap).
  if (view.missed) {
    return (
      <div className="space-y-4" data-gathering-missed>
        {header}
        <p className={note}>Week {view.week} · The Gathering</p>
        <div className={card}>
          <h2 className={`${heading} text-[18px]`}>You missed tonight's Gathering.</h2>
          <p className="text-[14px] text-[#B7A9CC]">The night went on without you. This is what happened.</p>
          <NarrationBlock text={view.recap ?? ''} />
        </div>
      </div>
    );
  }

  const now = Date.now() + offset;
  const secondsTo = (iso: string | null) => (iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 1000)) : 0);
  const wait = secondsTo(view.waitUntil);
  const nameOf = (id: string) => view.party.find((p) => p.id === id)?.name ?? '…';
  const held = (k: string) => view.progress?.relics?.[k] ?? 0;
  const score = (a: string) => view.progress?.attrs?.[a] ?? 10;

  // ---------------------------------------------------------------------------------------------------------------
  // Before it starts: the lobby (Core Rules §11 "Starting the Gathering").
  // ---------------------------------------------------------------------------------------------------------------
  if (!view.startedAt) {
    const opened = now >= new Date(view.opensAt).getTime();
    const anyoneMayStart = now >= new Date(view.opensAt).getTime() + 10 * 60000;
    return (
      <div className="space-y-4">
        {header}
        <p className={note}>Week {view.week} · Day 7</p>
        {view.tonight && (
          <div className="rounded-xl bg-[#130B1F] border border-[#3A2555] px-3 py-2 text-[14px] text-[#B7A9CC] italic">
            {tonightLine(view.tonight, view.opensAt, view.timeZone)}
          </div>
        )}
        <div className={card}>
          <h2 className={`${heading} text-[18px]`}>{opened ? 'The Gathering is open.' : `The Gathering opens at ${clockTime(view.opensAt, view.timeZone)}.`}</h2>
          <ul className="space-y-1">
            {view.party.map((p) => (
              <li key={p.id} className="text-[15px]">
                {p.id === view.me ? 'You' : p.name}
                <span className="text-[#B7A9CC]"> — {p.here ? 'here' : 'not here yet'}</span>
              </li>
            ))}
          </ul>
          <p className={note}>
            {opened
              ? 'It starts the moment everyone is here, or by itself 30 minutes after it opened.'
              : 'It starts once everyone is here after it opens.'}
          </p>
          {(view.isHost || anyoneMayStart) && (
            <button className={goldButton} disabled={busy} onClick={() => go('start')}>
              START
            </button>
          )}
        </div>
        <ErrorLine text={error} />
      </div>
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // The night so far.
  // ---------------------------------------------------------------------------------------------------------------
  const nodes: React.ReactNode[] = [];
  const current = (e: Entry) => e.i === view.cursor && !view.endedAt;
  const countdown = (s: number, what: string) => (s > 0 ? <p className="text-[12.5px] text-[#8B7A9E]">{what} {s}s</p> : null);
  const rollLine = (r: { d20: number; attr: string; score: number; bonus: number; relic?: number; map?: number; dc: number; net?: number; margin?: number }) =>
    `🎲 ${r.d20} + ${r.attr} ${r.score} (+${r.bonus})${r.map ? ' + Map 2' : ''}${r.relic ? ` + Relic (+${r.relic})` : ''} − DC ${r.dc} = ${signed(
      r.net ?? r.margin ?? 0
    )}`;
  const shell = 'w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg';
  const cardHead = (left: React.ReactNode, right?: React.ReactNode) => (
    <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555] flex items-center justify-between gap-2">
      <span className="font-['Cinzel'] font-bold text-[12.5px] text-[#F4F1F8] truncate">{left}</span>
      {right && <span className="font-['Cinzel'] font-bold text-[12px] text-[#E5C158] whitespace-nowrap shrink-0">{right}</span>}
    </div>
  );

  if (view.tonight) {
    nodes.push(
      <div key="tonight" className="rounded-xl bg-[#130B1F] border border-[#3A2555] px-3 py-2 text-[13.5px] text-[#B7A9CC] italic">
        {tonightLine(view.tonight, view.opensAt, view.timeZone)}
      </div>
    );
  }
  // The case so far (Fan Out and Campfire proposal §3.4): the week's question and at most three friends' week lines,
  // the most recently updated first; a changed line shows its first day too. Days by number. Never graded.
  if (caseSoFar?.question && caseSoFar.lines.length) {
    const said = caseSoFar.lines.map((l) =>
      l.first !== l.last ? `On Day ${l.firstDay}, ${l.name} thought: “${l.first}” Tonight: “${l.last}”` : `${l.name}: “${l.last}”`
    );
    nodes.push(
      <div key="g-case" className="space-y-1.5" data-week-readback>
        <div className="font-['Cinzel'] font-bold text-[10.5px] tracking-[1px] uppercase text-[#B7A9CC]">The case so far</div>
        <NarrationBlock text={[`*${caseSoFar.question}*`, ...said, ...(caseSoFar.more ? ['The rest are on the board.'] : [])].join('\n\n')} />
      </div>
    );
  }
  // "What you missed" (Core Rules §11): one line for a friend who came in after the start.
  if (view.lateLine) {
    nodes.push(
      <p key="late" className="font-sans italic text-[13.5px] text-[#B7A9CC] px-1" data-late-line>
        {view.lateLine}
      </p>
    );
  }

  for (const e of view.log) {
    const k = `g${e.i}`;
    switch (e.t) {
      case 'section':
        nodes.push(
          <div key={k} className="pt-2 font-['Cinzel'] font-bold text-[11px] tracking-[1.5px] uppercase text-[#8B7A9E]">
            {e.title}
          </div>
        );
        break;
      case 'say':
        nodes.push(
          e.alone ? (
            <div key={k} className="py-3 text-center">
              <ScriptText text={e.text} className="font-['Cormorant_Garamond',serif] italic text-[20px] text-[#F4E8C1] leading-[1.35]" />
            </div>
          ) : (
            <Markable key={k} source={`Gathering ${view.week}`} text={e.text}>
              <NarrationBlock text={e.text} />
            </Markable>
          )
        );
        break;
      case 'act':
        if (e.tapped) nodes.push(<TapEcho key={k} label={`${e.by ?? ''} · ${e.label}`} />);
        else if (current(e)) nodes.push(<ScriptButton key={k} label={e.label} disabled={busy} onClick={() => go('tap', { i: e.i })} />);
        break;
      case 'notice':
        if (e.text) nodes.push(<NoticeBlock key={k} attr={(e.attr === 'floor' ? 'Might' : e.attr) as AttributeName} label={e.attr === 'floor' ? 'From the floor' : undefined} text={e.text} />);
        break;
      case 'lookCloser': {
        if (!e.offered) break;
        const mine = e.mine as { left?: boolean; pass?: boolean } & Parameters<typeof rollLine>[0] | null;
        if (!mine) {
          const bonus = getTierInfo(e.score).bonus;
          nodes.push(
            <div key={k} className="space-y-1">
              <p className="text-[12.5px] text-[#B7A9CC]">
                {e.attr} {e.score} (+{bonus}) · You succeed on {challengeSucceedOn(e.dc, bonus)}+ · +75g on a pass
              </p>
              <div className="flex gap-1.5">
                <ScriptButton label={`🎲 LOOK CLOSER · ${e.attr}`} disabled={busy} onClick={() => go('look', { i: e.i })} />
                <button className={quietButton} disabled={busy} onClick={() => go('look', { i: e.i, leave: true })}>
                  LEAVE IT
                </button>
              </div>
            </div>
          );
        } else if (!mine.left) {
          nodes.push(
            <p key={k} className="font-mono text-[13px]">
              {rollLine(mine)}{' '}
              <span className={mine.pass ? 'text-[#6FD39A]' : 'text-[#F08A8A]'}>{mine.pass ? 'PASSED · +75g' : 'FAILED'}</span>
            </p>
          );
          if (e.line) nodes.push(<NoticeBlock key={`${k}-l`} attr={e.attr as AttributeName} text={e.line} />);
        }
        break;
      }
      case 'pick': {
        const options = e.options as { label: string; desc: string }[];
        const votes = (e.votes ?? []) as { name: string; o: number }[];
        const resolved = e.result !== null && e.result !== undefined;
        if (e.question) nodes.push(<div key={`${k}-q`} className="font-['Cinzel'] font-bold text-[12.5px] tracking-[0.8px] text-[#E5C158]">{e.question}</div>);
        if (resolved && e.result >= 0) {
          nodes.push(<TapEcho key={k} label={options[e.result].label} />);
          if (e.mode !== 'chosen' && votes.length) {
            nodes.push(
              <p key={`${k}-v`} className="text-[12.5px] text-[#8B7A9E]">
                {options.map((o, oi) => {
                  const who = votes.filter((v) => v.o === oi).map((v) => v.name);
                  return who.length ? `${o.label}: ${who.join(', ')}` : null;
                }).filter(Boolean).join(' · ')}
              </p>
            );
          }
          break;
        }
        if (resolved) break; // "Say a name": the lines that follow name who said each
        if (e.mode === 'chosen') {
          // Gathering 6's act: the friend the light let go of chooses, after thirty seconds for the others to talk.
          const from = secondsTo(e.chooseFrom);
          if (!e.chosenIsMe) {
            nodes.push(<p key={k} className="text-[14px] text-[#B7A9CC] italic">It is {e.chosen}'s to choose.</p>);
          } else if (from > 0) {
            nodes.push(<p key={k} className="text-[14px] text-[#B7A9CC] italic">Listen to them. In {from}s it is yours to choose.</p>);
          } else {
            nodes.push(
              <div key={k} className="space-y-1.5">
                {options.map((o, oi) => (
                  <button key={oi} type="button" data-g="choice" disabled={busy} onClick={() => go('pick', { i: e.i, o: oi })}
                    className="w-full text-left p-2.5 rounded-xl bg-[#2A1B40] hover:bg-[#3A2555] border border-[#D4B876] text-[#F4F1F8]">
                    <span className="font-['Cinzel'] font-bold text-[12.5px] tracking-[0.6px] uppercase">{o.label}</span>
                    {o.desc && <span className="block text-[13.5px] mt-0.5">{o.desc}</span>}
                  </button>
                ))}
                {countdown(wait, 'Time left:')}
              </div>
            );
          }
          break;
        }
        const myPick = e.mine as number | null;
        nodes.push(
          <div key={k} className="space-y-1.5">
            {options.map((o, oi) => {
              const who = e.mode === 'vote' ? votes.filter((v) => v.o === oi).map((v) => v.name) : [];
              return (
                <button key={oi} type="button" data-g="choice" disabled={busy || myPick !== null}
                  onClick={() => go(e.mode === 'vote' ? 'vote' : 'pick', { i: e.i, o: oi })}
                  className={`w-full text-left p-2.5 rounded-xl border text-[#F4F1F8] ${myPick === oi ? 'bg-[#3A2555] border-[#E5C158]' : 'bg-[#2A1B40] border-[#D4B876]'} disabled:cursor-default`}>
                  <span className="font-['Cinzel'] font-bold text-[12.5px] tracking-[0.6px] uppercase">{o.label}</span>
                  {o.desc && <span className="block text-[13.5px] mt-0.5">{o.desc}</span>}
                  {e.mode === 'vote' && voteHelp?.[oi] && (
                    <span className="block text-[12px] text-[#B7A9CC] mt-0.5">
                      Rolls {voteHelp[oi].attr}
                      {voteHelp[oi].best ? ` · best here: ${voteHelp[oi].best!.name} (${voteHelp[oi].attr} ${voteHelp[oi].best!.score}, +${voteHelp[oi].best!.bonus})` : ''}
                    </span>
                  )}
                  {who.length > 0 && <span className="block text-[12px] text-[#E5C158] mt-0.5">{who.join(', ')}</span>}
                </button>
              );
            })}
            <p className="text-[12.5px] text-[#8B7A9E]">
              {e.mode === 'vote' ? 'The most taps wins.' : 'Your pick is private until they are shown together.'} {e.count} of {view.party.filter((p) => p.here).length} have chosen.
              {wait > 0 ? ` ${wait}s` : ''}
            </p>
          </div>
        );
        break;
      }
      case 'approach': {
        const way = e.ways[e.way] ?? e.ways[0];
        const myBonus = getTierInfo(score(way.attr)).bonus + (e.map ? 2 : 0);
        const extra = String(e.reward).replace(/^\+?500g\s*/, '');
        nodes.push(
          <div key={k} className={shell}>
            {cardHead(`🎯 ${e.title}`, `${way.attr} · DC ${e.dc}`)}
            <div className="p-2.5 space-y-2">
              <div className="text-[13.5px] text-[#E6E0F0]">
                <span className="font-semibold">{way.by} · {way.attr}</span> · <ScriptInline text={way.verb} />
                {e.map && <span className="text-[#D4B876]"> · the map +2</span>}
              </div>
              <div className="text-[12.5px] leading-snug space-y-0.5">
                <div className="text-[#E5C158] font-semibold">REWARD: +500g {extra && <ScriptInline text={extra} />}</div>
                <div className="text-[#E0645C] font-semibold">IF YOU FAIL: −150g · <ScriptInline text={e.fail} /></div>
              </div>
              {e.phase === 'volunteer' && (
                <>
                  <p className="text-[13px] text-[#B7A9CC]">
                    One of you rolls it, in front of everyone. You: {way.attr} {score(way.attr)}, you succeed on {challengeSucceedOn(e.dc, myBonus)}+.
                  </p>
                  {!e.iStepped && <ScriptButton label="🎲 STEP UP" disabled={busy} onClick={() => go('step_up', { i: e.i })} />}
                  {e.stepped.length > 0 && <p className="text-[12.5px] text-[#E5C158]">Stepped up: {e.stepped.join(', ')}</p>}
                  {countdown(wait, 'Choosing in')}
                </>
              )}
              {e.phase === 'roll' && (e.rollerIsMe ? (
                <>
                  <p className="text-[13px] text-[#E6E0F0]">It is yours to roll. You succeed on {challengeSucceedOn(e.dc, myBonus + (open[`r${e.i}`] ? 4 : 0))}+.</p>
                  {held(way.attr) > 0 && (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-[#3A2555] px-3 py-1.5">
                      <span className="text-[13px] text-[#D9D1E6]">{way.attr} Relic · you hold {held(way.attr)} · +4</span>
                      <button className={quietButton} onClick={() => setOpen((p) => ({ ...p, [`r${e.i}`]: !p[`r${e.i}`] }))}>
                        {open[`r${e.i}`] ? 'TAKE BACK' : 'USE'}
                      </button>
                    </div>
                  )}
                  <ScriptButton label={`🎲 ROLL ${way.attr.toUpperCase()}`} disabled={busy} onClick={() => go('roll', { i: e.i, relic: !!open[`r${e.i}`] })} />
                  {countdown(wait, 'It rolls by itself in')}
                </>
              ) : (
                <p className="text-[13px] text-[#B7A9CC]">{e.roller} rolls.</p>
              ))}
              {e.roll && (
                <div className="space-y-0.5">
                  <p className="font-mono text-[13px]">{e.roll.name}: {rollLine(e.roll)}</p>
                  <p className={`font-['Cinzel'] font-bold text-[13px] ${e.roll.pass ? 'text-[#6FD39A]' : 'text-[#F08A8A]'}`}>
                    {e.roll.pass ? `PASSED · +500g${e.roll.growth ? ` · ${e.roll.attr} +${e.roll.growth}` : ''}` : 'FAILED · −150g'}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
        break;
      }
      case 'battle':
        nodes.push(<BattleCard key={k} e={e} view={view} busy={busy} go={go} wait={wait} held={held('Combat')} shell={shell} cardHead={cardHead} />);
        break;
      case 'ue':
        nodes.push(<UnitedEffortCard key={k} e={e} busy={busy} go={go} wait={wait} held={held} shell={shell} cardHead={cardHead} rollLine={rollLine} />);
        break;
      case 'match': {
        const rows = e.rows as { id: string; day: number; place: string; text: string }[];
        nodes.push(
          <div key={k} className="w-full rounded-xl bg-[#180F29] border border-[#D4B876]/60 overflow-hidden shadow-lg">
            <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555] font-['Cinzel'] font-bold text-[12px] text-[#E5C158]">MATCH · {e.question}</div>
            <div className="p-2.5 space-y-2">
              <ScriptText text={e.quote} className="font-['Cormorant_Garamond',serif] italic text-[17px] text-[#F4F1F8]" />
              {!e.done ? (
                <>
                  {rows.map((r) => (
                    <div key={r.id} className={`rounded-lg border ${e.mine === r.id ? 'border-[#E5C158] bg-[#2A1B40]' : 'border-[#3A2555] bg-[#130B1F]'} p-2`}>
                      <button type="button" className="w-full text-left text-[13.5px] text-[#E6E0F0]" onClick={() => setOpen((p) => ({ ...p, [`${k}-${r.id}`]: !p[`${k}-${r.id}`] }))}>
                        <span className="font-['Cinzel'] font-bold text-[11px] text-[#D4B876] mr-1.5">DAY {r.day} · {r.place}</span>
                        {open[`${k}-${r.id}`] ? r.text : `${r.text.split(' ').slice(0, 6).join(' ')}…`}
                      </button>
                      {!e.mine && (
                        <button className={`${quietButton} mt-1`} disabled={busy} onClick={() => go('match', { i: e.i, f: r.id })}>
                          PICK
                        </button>
                      )}
                    </div>
                  ))}
                  <p className="text-[12.5px] text-[#8B7A9E]">
                    {e.picked.length ? `Picked: ${e.picked.join(', ')}.` : 'Nobody has picked yet.'} {wait > 0 ? `${wait}s` : ''}
                  </p>
                </>
              ) : (
                <div className="space-y-1">
                  <p className="text-[13.5px] font-semibold text-[#6FD39A]">
                    {e.all ? 'All of you matched it.' : e.right.length ? `${e.rightNames} matched it.` : ''}
                    {e.iMatched ? ` +${e.pay}g` : ''}
                  </p>
                  <p className="text-[14px] text-[#F4F1F8]">
                    {e.source}: <em className="italic">"{rows.find((r) => r.id === e.answer)?.text}"</em>
                  </p>
                </div>
              )}
            </div>
          </div>
        );
        break;
      }
      case 'turn':
        nodes.push(
          <div key={k} className="rounded-xl bg-[#180F29] border border-[#C4A1FF]/70 px-3 py-2.5 space-y-2">
            <div className="font-['Cinzel'] font-bold text-[11px] tracking-[1px] text-[#C4A1FF] uppercase">MYTHIOS asks the table</div>
            <ScriptText text={e.question} className="font-sans text-[15px] text-[#F4F1F8] leading-[1.42]" />
            {e.nudge && <ScriptText text={e.nudge} className="font-sans text-[14px] text-[#B7A9CC] leading-[1.42]" />}
            {(answers[e.i]?.answers ?? []).map((a) => (
              <p key={a.name} className="text-[14px]"><span className="font-semibold text-[#E5C158]">{a.name}:</span> {a.text}</p>
            ))}
            {!answers[e.i]?.answers?.length && e.by && <p className="text-[14px]"><span className="font-semibold text-[#E5C158]">{e.by}:</span> {e.said}</p>}
            {!e.answer && current(e) && !answers[e.i]?.mine && (
              <div className="flex gap-1.5">
                <input className={input} maxLength={140} value={answer} onChange={(ev) => setAnswer(ev.target.value)} placeholder="Your answer, for the table" />
                <button
                  className={quietButton}
                  disabled={busy || !answer.trim()}
                  onClick={async () => {
                    setBusy(true);
                    const { data, error: er } = await supabase.rpc('gathering_answer', { p_party: partyId, p_i: e.i, p_text: answer.trim() });
                    setBusy(false);
                    if (er) return setError(plainError(er.message));
                    keyRef.current = null;
                    take(data as View);
                    setAnswer('');
                    const { data: an } = await supabase.rpc('gathering_answers', { p_party: partyId, p_i: e.i });
                    if (an) setAnswers((x) => ({ ...x, [e.i]: an }));
                  }}
                >
                  SAY IT
                </button>
              </div>
            )}
            {!e.answer && current(e) && answers[e.i]?.mine && (
              <p className={note}>The answer comes once everyone here has said theirs.</p>
            )}
          </div>
        );
        if (e.answer)
          nodes.push(
            <Markable key={`${k}-a`} source={`Gathering ${view.week}`} text={e.answer}>
              <NarrationBlock text={e.answer} />
            </Markable>
          );
        break;
      case 'ask': {
        const rows = e.rows as { q: string; sealed: boolean; note: string; group: string; by: string | null; answer: string | null }[];
        nodes.push(
          <div key={k} className="space-y-1.5">
            {rows.map((r, ri) =>
              r.by ? (
                <React.Fragment key={ri}>
                  <TapEcho label={`${r.by} · ${r.q}`} />
                  {r.answer && (
                    <Markable source={`Garrick, at Gathering ${view.week}`} text={r.answer}>
                      <NarrationBlock text={r.answer} />
                    </Markable>
                  )}
                </React.Fragment>
              ) : null
            )}
            {!e.done && current(e) && (
              <>
                <p className="text-[12.5px] text-[#B7A9CC]">{e.left > 0 ? `You can ask ${e.left === 1 ? 'one question' : `${e.left} questions`}.` : 'You have asked yours.'}</p>
                {rows.map((r, ri) =>
                  r.by ? null : (
                    <button key={ri} type="button" data-g="choice" disabled={busy || e.left <= 0} onClick={() => go('ask', { i: e.i, r: ri })}
                      className="w-full text-left p-2 rounded-lg bg-[#130B1F] border border-[#3A2555] hover:border-[#D4B876] font-['Cinzel'] font-bold text-[11.5px] tracking-[0.5px] text-[#E6E0F0] uppercase disabled:opacity-60">
                      {r.sealed ? '◆ ' : ''}{r.q}
                      {r.note && <span className="normal-case font-sans font-normal text-[#8B7A9E]"> {r.note}</span>}
                    </button>
                  )
                )}
                <button className={`w-full ${quietButton} py-2 font-[Cinzel] font-bold`} disabled={busy} onClick={() => go('ask_done', { i: e.i })}>
                  GO ON
                </button>
              </>
            )}
            {e.done &&
              (e.unasked as number[]).map((ri) => (
                <React.Fragment key={`u${ri}`}>
                  {e.unaskedLine && <NarrationBlock text={e.unaskedLine} />}
                  {rows[ri]?.answer && (
                    <Markable source={`Garrick, at Gathering ${view.week}`} text={rows[ri].answer!}>
                      <NarrationBlock text={rows[ri].answer!} />
                    </Markable>
                  )}
                </React.Fragment>
              ))}
          </div>
        );
        break;
      }
      case 'summary': {
        const [title, ...rest] = e.lines as string[];
        nodes.push(
          <div key={k} className="w-full rounded-xl bg-[#180F29] border border-[#D4B876]/70 overflow-hidden shadow-lg">
            <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555]">
              <ScriptText text={title} className="font-['Cinzel'] font-bold text-[12.5px] tracking-[0.6px] text-[#E5C158]" />
            </div>
            <div className="p-3 space-y-1">
              {rest.map((l, li) => (
                <ScriptText key={li} text={l} className="font-sans text-[14px] text-[#E6E0F0] leading-[1.42]" />
              ))}
            </div>
          </div>
        );
        break;
      }
      default:
        break;
    }
  }

  // [GO ON]: the next passage at once (§11); anyone's tap counts.
  const last = view.log[view.log.length - 1];
  const reading = last && last.i === view.cursor && ['say', 'notice', 'lookCloser'].includes(last.t) && !view.endedAt;

  return (
    <div className="space-y-3">
      {header}
      <p className={note}>
        Week {view.week} · The Gathering · {view.party.filter((p) => p.here).map((p) => (p.id === view.me ? 'You' : p.name)).join(', ')}
      </p>
      {nodes}
      {reading &&
        (goneOn[view.cursor] ? (
          <p className={`${note} text-center`}>Waiting for the others, or for the page to turn.</p>
        ) : (
          <button
            className={`w-full ${quietButton} py-2 font-[Cinzel] font-bold`}
            disabled={busy}
            onClick={async () => {
              const at = view.cursor;
              setGoneOn((x) => ({ ...x, [at]: true }));
              setBusy(true);
              const { data, error: er } = await supabase.rpc('gathering_go_on', { p_party: partyId, p_i: at });
              setBusy(false);
              if (er) return setError(plainError(er.message));
              keyRef.current = null;
              take(data as View);
            }}
          >
            GO ON
          </button>
        ))}
      {view.endedAt && embedded && <div data-gathering-ended />}
      {view.endedAt && !embedded && (
        <button className={goldButton} onClick={onClose}>
          BACK TO THE PARTY
        </button>
      )}
      <ErrorLine text={error} />
      <div ref={endRef} />
      {/* Table talk (Core Rules §11: the night assumes the table talking): the party chat, on the same screen. */}
      {userId && members && !view.endedAt && (
        <div className="pt-2" data-gathering-chat>
          <PartyChat partyId={partyId} userId={userId} members={members} />
        </div>
      )}
    </div>
  );
}

// The Battle card (Core Rules §4): every friend's HP and their enemy's, your own rounds, the Combat Relic and help-calls.
function BattleCard({ e, view, busy, go, wait, held, shell, cardHead }: {
  e: Entry; view: View; busy: boolean; go: (a: string, args?: Record<string, unknown>) => void; wait: number; held: number;
  shell: string; cardHead: (l: React.ReactNode, r?: React.ReactNode) => React.ReactNode;
}) {
  type Line = { attacker: string; target: string; side: string; lost?: string; roll?: number; attack?: number; defence?: number; margin?: number; hit?: boolean; damage?: number; hpBefore?: number; hpAfter?: number; note?: string };
  const fighters = (e.fighters ?? []) as { id: string; name: string; hp: number; fallen: boolean; weapon: number; armor: number; relic: string | null; relicPending: string | null; late: boolean; foe: { name: string; hp: number; none?: boolean } }[];
  const me = fighters.find((f) => f.id === view.me);
  const weapon = me?.weapon ?? view.progress?.weapon ?? 14;
  const armor = me?.armor ?? view.progress?.armor ?? 27;
  const ongoing = e.outcome === 'ongoing';
  const line = (l: Line, li: number) => {
    if (l.lost) return <div key={li}>{l.attacker}: {l.lost === 'risen' ? 'rising, loses this strike' : 'loses this strike (knee-deep)'}</div>;
    if (l.attacker === 'The burn') return <div key={li}>{l.note} {l.target} HP {l.hpBefore} → {l.hpAfter}</div>;
    const isParty = l.side === 'party';
    return (
      <div key={li}>
        {l.note && <div className="text-[#8B7A9E]">{l.note}</div>}
        {isParty ? `${l.attacker === me?.name ? 'You Roll' : `${l.attacker} Rolls`} ${l.roll} + Weapon ${l.attack} − DEF ${l.defence}` : `Enemy Rolls ${l.roll} + ATK ${l.attack} − Armor ${l.defence}`} ={' '}
        {signed(l.margin ?? 0)}. <span className={l.hit ? 'text-[#E5C158]' : 'text-[#8B7A9E]'}>{l.hit ? 'HIT' : 'MISS'}</span>
        {l.hit && <div>Damage = {l.margin} × 5 = {l.damage}. {isParty ? l.target : l.target === me?.name ? 'Your' : l.target} HP {l.hpBefore} → {l.hpAfter}</div>}
      </div>
    );
  };
  return (
    <>
      {e.desc && <ScriptText text={e.desc} className="font-sans italic text-[14px] text-[#B7A9CC] leading-[1.4] px-1" />}
      {e.firstLine && <NarrationBlock text={e.firstLine} />}
      <div className={shell}>
        {cardHead(`⚔️ ${String(e.name).toUpperCase()}`, `DEF ${e.def} · ATK ${e.atk}`)}
        <div className="p-3 space-y-2.5">
          <div className="text-[13.5px] text-[#E6E0F0] space-y-0.5">
            <div>You hit on <b className="text-[#E5C158]">{Math.min(20, Math.max(2, e.def + 1 - weapon))}+</b> (Roll + Weapon {weapon} − DEF {e.def})</div>
            <div>Enemy hits on <b className="text-[#E5C158]">{Math.min(20, Math.max(2, armor + 1 - e.atk))}+</b> (Roll + ATK {e.atk} − Armor {armor})</div>
            <div>Damage = Margin × 5 · REWARD: <b className="text-[#E5C158]">{e.reward}g</b> to every friend if the party wins</div>
            {e.condition && <div className="text-[#B7A9CC]">{e.condition}</div>}
          </div>
          {ongoing && e.round === 0 && <p className="text-[13px] text-[#E5C158]">The fight begins in {wait}s</p>}
          {ongoing && e.round > 0 && wait > 0 && <p className="text-[12.5px] text-[#8B7A9E]">Round {e.round + 1} in {wait}s</p>}
          <div className="space-y-1.5">
            {fighters.map((f) => (
              <div key={f.id} className="p-2 rounded-lg bg-[#130B1F] border border-[#3A2555] text-[12.5px]">
                <div className="flex items-center justify-between gap-2 font-bold">
                  <span>
                    {f.id === view.me ? 'YOU' : f.name.toUpperCase()}
                    {f.relic ? (f.relic === f.name ? ' ♦ Combat Relic' : ` ♦ Combat Relic from ${f.relic}`) : ''}
                    {f.fallen ? ' · DOWN' : ''}
                  </span>
                  <span>{f.hp} HP</span>
                </div>
                {!f.foe.none && (
                  <div className="flex items-center justify-between gap-2 text-[#B7A9CC]">
                    <span>{f.foe.name}</span>
                    <span>{f.foe.hp} HP</span>
                  </div>
                )}
                {f.foe.none && <div className="text-[#B7A9CC]">Arrived during the Battle: fights beside the friend most in need.</div>}
              </div>
            ))}
          </div>
          <div className="space-y-1.5 font-mono text-[12px] text-[#D9D1E6]">
            {(e.myRounds as { round: number; lines: Line[] }[]).map((r) =>
              r.lines.length ? (
                <div key={r.round}>
                  <div className="text-[#8B7A9E]">Round {r.round}</div>
                  {r.lines.map(line)}
                </div>
              ) : null
            )}
          </div>
          {ongoing && me && !me.fallen && !me.relic && !me.relicPending && held > 0 && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-[#3A2555] px-3 py-1.5">
              <span className="text-[13px] text-[#D9D1E6]">Combat Relic · you hold {held}<br /><span className="text-[#B7A9CC]">+1 Weapon and +1 Armor for the rest of this fight, from the next round</span></span>
              <button className={quietButton} disabled={busy} onClick={() => go('use_combat_relic')}>USE</button>
            </div>
          )}
          {me?.relicPending && <p className="text-[13px] text-[#B7A9CC]">Combat Relic from {me.relicPending}: +1 Weapon and +1 Armor from the next round.</p>}
          {ongoing && (e.help as { id: string; name: string; hp: number; canTake: boolean }[]).filter((h) => h.id !== view.me).map((h) => (
            <div key={h.id} className="rounded-lg border border-[#E0645C]/70 bg-[#2A1420] px-3 py-1.5 flex items-center justify-between gap-2">
              <span className="font-['Cinzel'] font-bold text-[12px] text-[#E0645C]">{h.name.toUpperCase()} IS IN TROUBLE · HP {h.hp}</span>
              {h.canTake && held > 0 && (
                <button className={quietButton} disabled={busy} onClick={() => go('give_combat_relic', { to: h.id })}>GIVE A COMBAT RELIC</button>
              )}
            </div>
          ))}
          {me?.fallen && ongoing && <p className="font-['Cinzel'] font-bold text-[12px] text-[#E0645C]">DEFEATED. You are down for this Battle. Your friends fight on.</p>}
          {e.outcome === 'won' && (
            <p className="font-['Cinzel'] font-bold text-[13px] text-[#6FD39A]">VICTORY. {e.name} defeated in {e.round} rounds.<br />REWARD: +{e.reward}g</p>
          )}
          {e.outcome === 'lost' && <p className="font-['Cinzel'] font-bold text-[13px] text-[#E0645C]">DEFEATED.<br />REWARD: none</p>}
        </div>
      </div>
    </>
  );
}

// The United Effort card (Core Rules §5): two bars, one roll at a time, the story line after each, and the hand-on.
function UnitedEffortCard({ e, busy, go, wait, held, shell, cardHead, rollLine }: {
  e: Entry; busy: boolean; go: (a: string, args?: Record<string, unknown>) => void; wait: number; held: (k: string) => number;
  shell: string; cardHead: (l: React.ReactNode, r?: React.ReactNode) => React.ReactNode;
  rollLine: (r: { d20: number; attr: string; score: number; bonus: number; relic?: number; dc: number; margin?: number }) => string;
}) {
  const rolls = (e.rolls ?? []) as { name: string; d20: number; attr: string; score: number; bonus: number; relic: number; dc: number; margin: number; success: boolean; damageRoll: number; damage: number; bar: 'way' | 'risk'; before: number; after: number; line: string | null; between: string | null }[];
  const bar = (label: string, v: number, colour: string) => (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[12px]"><span className="font-semibold">{label}</span><span>{v}</span></div>
      <div className="h-2 rounded bg-[#130B1F] overflow-hidden"><div className="h-full" style={{ width: `${(v / (e.start || 100)) * 100}%`, background: colour }} /></div>
    </div>
  );
  const ongoing = e.outcome === 'ongoing';
  const attrRelicsIHold = ATTRS.filter((a) => held(a) > 0);
  const myBonus = getTierInfo(e.myScore).bonus;
  return (
    <div className={shell}>
      {cardHead(`⚡ ${e.title} · United Effort`, `${e.attr} · DC ${e.dc}`)}
      <div className="p-3 space-y-2.5">
        {bar(e.barWay, e.way, '#6FD39A')}
        {bar(e.barRisk, e.risk, '#F08A8A')}
        <p className="text-[12.5px] text-[#B7A9CC]">A pass does 10 + a d20 to {e.barWay}; a fail, to {e.barRisk}. +300g to every friend if {e.barWay} reaches 0.</p>
        {rolls.map((r, ri) => (
          <div key={ri} className="space-y-1">
            <p className="font-mono text-[12.5px]">
              {r.name}: {rollLine(r)}{' '}
              <span className={r.success ? 'text-[#6FD39A]' : 'text-[#F08A8A]'}>{r.success ? 'SUCCESS' : 'FAIL'}</span> · 10 + {r.damageRoll} = {r.damage} to{' '}
              {r.bar === 'way' ? e.barWay : e.barRisk} ({r.before} → {r.after})
            </p>
            {r.line && <NarrationBlock text={r.line} />}
            {r.between && <NarrationBlock text={r.between} />}
          </div>
        ))}
        {ongoing && e.phase === 'roll' && (
          <>
            {e.nextIsMe ? (
              <>
                <p className="text-[13.5px] text-[#E6E0F0]">
                  {e.named ? 'MYTHIOS names you. ' : ''}Your turn: {e.attr} {e.myScore} (+{myBonus}), you succeed on {challengeSucceedOn(e.dc, myBonus + (e.relic ? 4 : 0))}+.
                </p>
                {!e.relic && held(e.attr) > 0 && (
                  <button className={quietButton} disabled={busy} onClick={() => go('ue_relic', { kind: e.attr })}>USE YOUR {String(e.attr).toUpperCase()} RELIC (+4)</button>
                )}
                {e.relic && <p className="text-[13px] text-[#E5C158]">{e.relic.mine ? 'Your' : `${e.relic.from}'s`} {e.relic.kind} Relic: +4 on this roll{e.relic.mine ? ' (tap again to take it back)' : ''}.</p>}
                {e.relic?.mine && <button className={quietButton} disabled={busy} onClick={() => go('ue_relic', { kind: e.attr })}>TAKE BACK</button>}
                <ScriptButton label={`🎲 ROLL ${String(e.attr).toUpperCase()}`} disabled={busy} onClick={() => go('ue_roll', { i: e.i })} />
                {wait > 0 && <p className="text-[12.5px] text-[#8B7A9E]">It rolls by itself in {wait}s</p>}
              </>
            ) : (
              <>
                <p className="text-[13.5px] text-[#B7A9CC]">{e.named ? 'MYTHIOS names ' : ''}{e.next}{e.named ? '.' : "'s turn."} {e.next} succeeds on {challengeSucceedOn(e.dc, getTierInfo(e.nextScore).bonus + (e.relic ? 4 : 0))}+.</p>
                {e.relic && <p className="text-[13px] text-[#E5C158]">{e.relic.from} gives a {e.relic.kind} Relic: +4 on this roll.</p>}
                {!e.relic && attrRelicsIHold.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[12.5px] text-[#B7A9CC]">Give {e.next} a Relic (+4):</span>
                    {attrRelicsIHold.map((a) => (
                      <button key={a} className={quietButton} disabled={busy} onClick={() => go('ue_relic', { kind: a })}>{a}</button>
                    ))}
                  </div>
                )}
                {e.relic?.mine && <button className={quietButton} disabled={busy} onClick={() => go('ue_relic', { kind: e.relic.kind })}>TAKE BACK</button>}
              </>
            )}
          </>
        )}
        {ongoing && e.phase === 'handon' && (
          e.handerIsMe ? (
            <div className="space-y-1.5">
              <p className="text-[13px] text-[#E6E0F0]">Hand it on:</p>
              <div className="flex flex-wrap gap-1.5">
                {(e.eligible as { id: string; name: string }[]).map((p) => (
                  <button key={p.id} data-g="handon" className={quietButton} disabled={busy} onClick={() => go('hand_on', { i: e.i, to: p.id })}>{p.name}</button>
                ))}
              </div>
              {wait > 0 && <p className="text-[12.5px] text-[#8B7A9E]">Or MYTHIOS names the next in {wait}s</p>}
            </div>
          ) : (
            <p className="text-[13px] text-[#B7A9CC]">{rolls[rolls.length - 1]?.name} hands it on.</p>
          )
        )}
        {e.outcome === 'won' && <p className="font-['Cinzel'] font-bold text-[13px] text-[#6FD39A]">DONE · +300g to every friend</p>}
        {e.outcome === 'lost' && <p className="font-['Cinzel'] font-bold text-[13px] text-[#E0645C]">LOST</p>}
      </div>
    </div>
  );
}

// The party page's line for this week's Gathering: when it is, the Attribute it calls on (from Day 5), the host's time pin,
// and the way in on Day 7.
export function GatheringCard({ partyId, isHost, timeZone, onOpen }: { partyId: string; isHost: boolean; timeZone: string; onOpen: () => void }) {
  const [info, setInfo] = useState<{ week: number; day: number; opensAt: string; startedAt: string | null; endedAt: string | null; open: boolean; tonight: string | null; callsOn: string | null } | null>(null);
  const [editing, setEditing] = useState(false);
  const [time, setTime] = useState('20:00');
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    const { data } = await supabase.rpc('gathering_info', { p_party: partyId });
    setInfo(data ?? null);
  }, [partyId]);
  useEffect(() => {
    load();
  }, [load]);
  if (!info) return null;
  const lobbyOpen = Date.now() >= new Date(info.opensAt).getTime();
  return (
    <div className={card}>
      <h3 className={`${heading} text-[15px]`}>The Gathering</h3>
      {info.open && info.tonight ? (
        <p className="text-[14px] italic text-[#B7A9CC]">{tonightLine(info.tonight, info.opensAt, timeZone)}</p>
      ) : (
        <p className="text-[14px]">Day 7 at {clockTime(info.opensAt, timeZone)}.</p>
      )}
      {/* From Day 5 (gameplay verdict C3): the night's Attribute, so friends can give a matching Relic in time. */}
      {!info.open && info.callsOn && (
        <p className="text-[14px]" data-calls-on>
          The night will call on <span className="font-semibold text-[#E5C158]">{info.callsOn}</span>. A {info.callsOn} Relic adds +4 to one roll of it.
        </p>
      )}
      {info.open && (
        <button className={goldButton} onClick={onOpen}>
          {info.endedAt ? 'TONIGHT’S GATHERING' : info.startedAt ? 'JOIN THE GATHERING' : 'THE GATHERING'}
        </button>
      )}
      {isHost && !info.startedAt && !lobbyOpen && (
        editing ? (
          <div className="flex gap-2 items-center">
            <input type="time" className={input} min="08:00" max="23:00" value={time} onChange={(ev) => setTime(ev.target.value)} />
            <button className={quietButton} onClick={async () => {
              setError(null);
              const { error: e } = await supabase.rpc('gathering_set_time', { p_party: partyId, p_time: time });
              if (e) setError(plainError(e.message));
              else { setEditing(false); load(); }
            }}>SAVE</button>
          </div>
        ) : (
          <button className={quietButton} onClick={() => setEditing(true)}>CHANGE THE TIME</button>
        )
      )}
      {isHost && editing && <p className={note}>Between 8:00am and 11:00pm. Everyone is told in the party chat.</p>}
      {!info.startedAt && <GatheringPoll partyId={partyId} isHost={isHost} />}
      <ErrorLine text={error} />
    </div>
  );
}

// "19:00" as the chat writes it: "7:00pm".
const slotWord = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}${h < 12 ? 'am' : 'pm'}`;
};

// The Day 4 poll (Core Rules §11 "The Gathering's hour"; migration 0069): on Days 4 and 5 each friend taps every Day 7
// time they can make. The host pins one; at the end of Day 5, if not, the app takes the time most of you can make.
function GatheringPoll({ partyId, isHost }: { partyId: string; isHost: boolean }) {
  const [poll, setPoll] = useState<{ week: number; slots: { time: string; names: string[]; mine: boolean }[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    supabase.rpc('gathering_poll', { p_party: partyId }).then(({ data }) => setPoll(data ?? null));
  }, [partyId]);
  if (!poll) return null;
  return (
    <div className="space-y-2 pt-1" data-gathering-poll>
      <p className="font-['Cinzel'] font-bold text-[12px] tracking-[1.2px] text-[#D4B876]">WHEN CAN YOU ALL MEET ON DAY 7?</p>
      <p className={note}>
        Tap every time you can make. {isHost ? 'You pick the time' : 'The host picks the time'}; if nobody has by the end of Day 5, it goes to the time most of you can make.
      </p>
      <div className="space-y-1.5">
        {poll.slots.map((s) => (
          <button
            key={s.time}
            disabled={busy}
            className={`w-full text-left rounded-lg border px-3 py-2 ${s.mine ? 'border-[#D4B876] bg-[#2E1B42]' : 'border-[#3A2555] bg-[#130B1F]'}`}
            onClick={async () => {
              setBusy(true);
              setError(null);
              const { data, error: e } = await supabase.rpc('gathering_vote', { p_party: partyId, p_slot: s.time, p_on: !s.mine });
              setBusy(false);
              if (e) setError(plainError(e.message));
              else setPoll(data ?? null);
            }}
          >
            <span className="font-semibold text-[14px]">{s.mine ? '✓ ' : ''}{slotWord(s.time)}</span>
            {s.names.length > 0 && <span className="text-[13px] text-[#B7A9CC]"> · {s.names.join(', ')}</span>}
          </button>
        ))}
      </div>
      <ErrorLine text={error} />
    </div>
  );
}
