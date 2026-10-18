// A weekday, played online (build steps 2 and 3). The chapter comes from the server on its day only, and every roll is
// the server's (Core Rules §12a). It plays the same canon steps as the demo's Story screen, with the demo's display pieces.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, plainError } from './supabaseClient';
import type { ChapterScript, ScriptCond, ScriptStep, StrikeFirstRule } from '../data/chapterScripts';
import {
  fillScriptTokens,
  friendChoiceLabels,
  friendsWithPicked,
  isFriendChoice,
  personalStakeLine,
  pickNoticeLine,
  NarrationBlock,
  NoticeBlock,
  ScriptButton,
  ScriptText,
  TapEcho,
} from '../components/ChapterScriptParts';
import { challengeSucceedOn, getTierInfo, type AttributeName } from '../data/mythiosRulesData';
import { CLASSES } from './onlineText';
import { tonightLine } from './OnlineGathering';
import { ErrorLine, goldButton, heading, note, quietButton } from './ui';
import { Markable } from './Markable';

interface Roll {
  attr: AttributeName;
  score: number;
  bonus: number;
  d20: number;
  dc: number;
  net: number;
  pass: boolean;
  growth?: number;
  relic?: number;
}
interface Round {
  round: number;
  enemyFirst: boolean;
  d20: number;
  playerAtk: number;
  enemyDef: number;
  margin: number;
  hit: boolean;
  playerStruck: boolean;
  enemyD20: number;
  enemyAtk: number;
  playerArmor: number;
  enemyMargin: number;
  enemyHit: boolean;
  enemyStruck: boolean;
  playerHpAfter: number;
  enemyHpAfter: number;
  relic?: boolean;
}
interface Fight {
  rounds: Round[];
  done: boolean;
  won?: boolean;
  gold?: number;
  relicFrom?: number;
}
interface Today {
  week: number;
  day: number;
  chapter: { script: ChapterScript; meta: { dc: number; wDef: number; wAtk: number; fightReward: number } } | null;
  progress: {
    gold: number;
    attrs: Record<AttributeName, number>;
    weapon_level: number;
    armor_level: number;
    relics: Record<string, number>;
  };
  mine: {
    picks: Record<string, number[]>;
    acts: number;
    challenge: Roll | null;
    press: (Roll & { left?: undefined }) | { left: true } | null;
    fight: Fight | null;
    aside: boolean;
    finished_at: string | null;
  };
  daysPlayed: number;
  // The road so far (16 Oct): yesterday's recap for everyone, and each missed day's (Core Rules "Recap").
  recaps?: { week: number; day: number; recap: string }[];
  missed?: number;
  claims?: string[]; // what earlier Gatherings carry into the weekdays ("G5:united-effort-lost")
}

export interface DayInfo {
  week: number;
  day: number;
  gold: number;
  attrs: Record<AttributeName, number>;
  weaponLevel: number;
  armorLevel: number;
  finished: boolean;
  gathering: boolean;
}

// An enemy's card title ("A MAN ON THE ROAD") inside a sentence: "A man on the road".
const sentenceCase = (t: string) => (t === t.toUpperCase() ? t.charAt(0) + t.slice(1).toLowerCase() : t);
const signed = (n: number) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);

export default function OnlineDay({
  partyId,
  friends,
  partySize,
  myClass,
  birthplace,
  grandparent,
  onClose,
  onOpenChest,
  onOpenStore,
  onOpenFire,
  onOpenGathering,
  timeZone,
  embedded = false,
  onInfo,
  reloadKey = 0,
}: {
  partyId: string;
  friends: string[];
  partySize: number;
  myClass: string | null;
  birthplace: string | null;
  grandparent: string | null;
  onClose: () => void;
  onOpenChest: () => void;
  onOpenStore: () => void;
  onOpenFire: () => void;
  onOpenGathering: () => void;
  timeZone: string;
  /** In the game shell's story thread (docs/design/one-thread-18oct.md, phase A): no header, no way back to a party
   *  page, and the shell shows the fire (or the Gathering) below the day itself. */
  embedded?: boolean;
  /** The shell's top bar: the day, the gold, and whether the day is done (so the fire can follow it). */
  onInfo?: (info: DayInfo) => void;
  /** Bumped by the shell when the story tab is shown again, so gold spent in the Store shows at once. */
  reloadKey?: number;
}) {
  const [today, setToday] = useState<Today | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [chosenAttr, setChosenAttr] = useState<AttributeName | null>(null);
  // [USE] arms an Attribute Relic on the card; a second tap takes it back. It is spent only when the roll is made (§12a).
  const [armed, setArmed] = useState<AttributeName | null>(null);
  const [pressArmed, setPressArmed] = useState(false);
  const finishing = useRef(false);
  // A late joiner's Day 1 (Core Rules §12a, migration 0072): once it is read to its end, the current day waits for a tap.
  const [nextDay, setNextDay] = useState<{ week: number; day: number } | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    const { data, error: e } = await supabase.rpc('today', { p_party: partyId });
    if (e) setError(plainError(e.message));
    else setToday(data as Today);
  }, [partyId]);
  useEffect(() => {
    load();
  }, [load, reloadKey]);
  // A first load that failed tries again by itself (handoff ledger piece 2), instead of waiting for a tap on the tab.
  useEffect(() => {
    if (today || !error) return;
    const id = window.setTimeout(load, 8000);
    return () => window.clearTimeout(id);
  }, [today, error, load]);

  useEffect(() => {
    if (!today || !onInfo) return;
    onInfo({
      week: today.week,
      day: today.day,
      gold: today.progress.gold,
      attrs: today.progress.attrs,
      weaponLevel: today.progress.weapon_level,
      armorLevel: today.progress.armor_level,
      // A late joiner's Day 1 leads on to the party's day first (the ON TO button); the fire waits until then.
      finished: Boolean(today.mine.finished_at) && !nextDay,
      gathering: !today.chapter,
    });
  }, [today, onInfo, nextDay]);

  const call = async (fn: string, args: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.rpc(fn, { p_party: partyId, ...args });
    if (e) setError(plainError(e.message));
    await load();
    setBusy(false);
  };

  // Keep the newest part of the chapter in view as it grows.
  const stepCount = today ? JSON.stringify(today.mine).length : 0;
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [stepCount]);

  if (error && !today) {
    return (
      <div className="space-y-3">
        <ErrorLine text={error} />
        <button className={quietButton} onClick={embedded ? load : onClose}>
          {embedded ? 'Try again' : 'Back'}
        </button>
      </div>
    );
  }
  if (!today) return <p className="text-center text-[#B7A9CC]">…</p>;

  const { week, day, chapter, progress, mine } = today;
  const classAttr = (CLASSES.find((c) => c.name === myClass)?.attribute ?? 'Might') as AttributeName;
  // A friend picked by a choice ("POST {F1}"…) takes the {F1} place from then on (isFriendChoice).
  const stake = personalStakeLine(birthplace ?? undefined, grandparent ?? undefined);
  const fillWith = (names: string[]) => (text: string) => fillScriptTokens(text, { friends: names, partySize, stake });
  const roadFill = fillWith(friends);
  let fill = roadFill;

  const header = embedded ? null : (
    <div className="flex items-center justify-between gap-2">
      <button className={quietButton} onClick={onClose}>
        ← The party
      </button>
      <span className="font-['Cinzel'] font-bold text-[13px] text-[#E5C158]">◎ {progress.gold.toLocaleString()}g</span>
    </div>
  );

  // Day 7 has no chapter: it is the Gathering, played together (Core Rules §11).
  if (!chapter) {
    return (
      <div className="space-y-4">
        {header}
        <p className={note}>
          Week {week} · Day {day}
        </p>
        <RoadSoFar recaps={today.recaps} missed={today.missed} fill={roadFill} />
        <DaySevenLine partyId={partyId} timeZone={timeZone} />
        {!embedded && <ScriptButton label="THE GATHERING" onClick={onOpenGathering} />}
      </div>
    );
  }

  const steps = chapter.script.steps;
  // A Gathering's result can make a weekday's Challenge harder (Week 6 Day 1: two harder after a lost roll-call).
  const harderIf = steps.find((st): st is Extract<ScriptStep, { t: 'challenge' }> => st.t === 'challenge')?.harderIf;
  const harder = harderIf && (today.claims ?? []).includes(harderIf.key) === harderIf.has ? harderIf.by : 0;
  const dc = chapter.meta.dc + harder;
  const challenge = mine.challenge;
  const press = mine.press;
  const fight = mine.fight;
  const fightDone = Boolean(fight?.done);
  const fightWon = Boolean(fight?.won);

  const condMet = (c?: ScriptCond): boolean => {
    if (!c) return true;
    if (c.on === 'challenge') return Boolean(challenge) && challenge!.pass === c.pass;
    if (c.on === 'press') return Boolean(press && !('left' in press && press.left) && (press as Roll).pass);
    if (c.on === 'fight') return fightDone && fightWon === c.won;
    if (c.on === 'claim') return (today.claims ?? []).includes(c.key) === c.has;
    return false;
  };
  const strikeFirst = (rule: StrikeFirstRule): boolean => {
    if (rule.on === 'challenge') return Boolean(challenge?.pass);
    if (rule.on === 'choice') {
      const first = (mine.picks[String(rule.choice)] || [])[0];
      return first !== undefined && rule.options.includes(first);
    }
    return true;
  };

  const rollLine = (r: Roll) =>
    `🎲 ${r.d20} + ${r.attr} ${r.score} (+${r.bonus})${r.relic ? ` + Relic (+${r.relic})` : ''} − DC ${r.dc} = ${signed(r.net)}`;
  const held = (k: string) => progress.relics?.[k] ?? 0;
  // While a card or a fight not yet begun is set aside with [NOT NOW], the Store is open (Core Rules §3).
  const asideNote = (
    <div className="space-y-1.5">
      <p className="font-sans italic text-[13.5px] text-[#B7A9CC]">Set aside. It waits here until you take it up, and the Store is open.</p>
      <button className={`w-full ${quietButton} py-2 font-[Cinzel] font-bold`} onClick={onOpenStore}>
        THE STORE
      </button>
    </div>
  );

  const nodes: React.ReactNode[] = [];
  let actIndex = 0;
  let reachedSummary = false;

  for (let i = 0; i < steps.length; i++) {
    const step: ScriptStep = steps[i];
    const key = `s${i}`;
    if (step.t === 'say') {
      if (!condMet(step.cond)) continue;
      nodes.push(
        <Markable key={key} source={`Week ${week}, Day ${day}`} text={fill(step.text)}>
          <NarrationBlock text={fill(step.text)} pull={step.pull} />
        </Markable>
      );
      // The day's fragment is in the Chest from the day's opening (Core Rules §6).
      if (step.fragment) {
        nodes.push(
          <button key={`${key}-chest`} className={`w-full ${quietButton} py-2 font-[Cinzel] font-bold`} onClick={onOpenChest}>
            🕯️ OPEN THE SEEKER CHEST
          </button>
        );
      }
      continue;
    }
    if (step.t === 'act') {
      actIndex += 1;
      if (actIndex <= mine.acts) {
        nodes.push(<TapEcho key={key} label={fill(step.label)} />);
        continue;
      }
      const next = actIndex;
      nodes.push(<ScriptButton key={key} label={fill(step.label)} disabled={busy} onClick={() => call('tap_act', { p_acts: next })} />);
      break;
    }
    if (step.t === 'choice') {
      const picks = mine.picks[String(step.id)] || [];
      const friendPick = isFriendChoice(step.labels);
      const labels = friendPick ? friendChoiceLabels(step.labels, friends) : step.labels;
      const branchFor = (opt: number) => step.branches.find((b) => b.options.includes(opt));
      const shown = new Set<number>();
      if (friendPick && picks.length) fill = fillWith(friendsWithPicked(friends, picks[0]));
      picks.forEach((opt) => {
        nodes.push(<TapEcho key={`${key}-p${opt}`} label={fill(labels[opt])} />);
        const b = branchFor(opt);
        if (b && !shown.has(step.branches.indexOf(b))) {
          shown.add(step.branches.indexOf(b));
          nodes.push(
            <Markable key={`${key}-b${opt}`} source={`Week ${week}, Day ${day}`} text={fill(b.text)}>
              <NarrationBlock text={fill(b.text)} />
            </Markable>
          );
        }
      });
      if (picks.length > 0 && step.mode === 'auto') {
        step.branches.forEach((b, bi) => {
          if (!shown.has(bi)) {
            shown.add(bi);
            nodes.push(
              <Markable key={`${key}-a${bi}`} source={`Week ${week}, Day ${day}`} text={fill(b.text)}>
                <NarrationBlock text={fill(b.text)} />
              </Markable>
            );
          }
        });
      }
      const open = labels
        .map((_, oi) => oi)
        .filter((oi) => {
          if (picks.length === 0) return true;
          if (step.mode !== 'each') return false;
          const b = branchFor(oi);
          return Boolean(b) && !shown.has(step.branches.indexOf(b!));
        });
      // A rule (Fake Guru, 18 Oct): two options on screen together are a choice, and picking one closes the other. So a
      // "look at both" (each) or a look that shows everything (auto) offers one action at a time, never side by side.
      const shownOpen = step.mode === 'each' || step.mode === 'auto' ? open.slice(0, 1) : open;
      if (shownOpen.length > 0) {
        nodes.push(
          <div key={`${key}-o`} className="space-y-1.5">
            {shownOpen.map((oi) => (
              <ScriptButton
                key={oi}
                label={fill(labels[oi])}
                disabled={busy}
                onClick={() => {
                  // A look that names one of the Challenge's two ways picks that way on the card (as in the demo).
                  const nx = steps[i + 1];
                  if (step.mode === 'flavor' && nx?.t === 'challenge' && nx.options.length === labels.length) {
                    setChosenAttr(nx.options[oi].attr);
                  }
                  call('pick_choice', { p_choice: step.id, p_option: oi });
                }}
              />
            ))}
          </div>
        );
        break;
      }
      continue;
    }
    if (step.t === 'notice') {
      const line = pickNoticeLine(step.lines, progress.attrs, classAttr);
      if (line) nodes.push(<NoticeBlock key={key} attr={line.attr} text={fill(line.text)} />);
      continue;
    }
    if (step.t === 'challenge') {
      const options = step.options;
      const attr = (challenge?.attr ?? chosenAttr ?? options[0].attr) as AttributeName;
      const score = progress.attrs[attr] ?? 10;
      const bonus = getTierInfo(score).bonus;
      nodes.push(
        <div key={key} className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
          <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555] flex items-center justify-between gap-2">
            <span className="font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8] truncate">🎯 {fill(step.title)}</span>
            {!challenge && (
              <span className="font-['Cinzel'] font-bold text-[12px] text-[#E5C158] whitespace-nowrap">
                You succeed on {challengeSucceedOn(dc, bonus + (armed === attr ? 4 : 0))}+
              </span>
            )}
          </div>
          <div className="p-2.5 space-y-2">
            {today.daysPlayed === 0 && !challenge && (
              <p className="font-sans italic text-[13.5px] text-[#B7A9CC]">
                A Challenge. Pick the skill you trust and roll. Pass, and you earn 500 gold and that skill grows. Fail, and it costs 150 gold.
              </p>
            )}
            <ScriptText text={fill(step.desc)} className="font-sans text-[14px] text-[#E6E0F0] leading-[1.4]" />
            {harder > 0 && step.harderIf && (
              <ScriptText text={fill(step.harderIf.line)} className="font-sans text-[13.5px] text-[#E0645C] leading-[1.4]" />
            )}
            {!challenge ? (
              <>
                <div className="space-y-1.5">
                  {options.map((o) => {
                    const s = progress.attrs[o.attr] ?? 10;
                    return (
                      <div key={o.attr} className="space-y-1">
                        <button
                          onClick={() => setChosenAttr(o.attr)}
                          className={`w-full text-left rounded-lg border px-3 py-2 ${
                            attr === o.attr ? 'border-[#D4B876] bg-[#2E1B42]' : 'border-[#3A2555] bg-[#130B1F]'
                          }`}
                        >
                          <span className="font-semibold text-[14px]">
                            {o.attr} {s} (+{getTierInfo(s).bonus})
                          </span>
                          <span className="text-[13.5px] text-[#B7A9CC]"> · {fill(o.verb)}</span>
                        </button>
                        {/* The Relic choice shows only when the player holds a matching Relic (Core Rules §3). */}
                        {held(o.attr) > 0 && (
                          <div className="flex items-center justify-between gap-2 rounded-lg border border-[#3A2555] px-3 py-1.5">
                            <span className="text-[13px] text-[#D9D1E6]">
                              {o.attr} Relic · you hold {held(o.attr)}
                              <br />
                              <span className="text-[#B7A9CC]">
                                With +4, you succeed on {challengeSucceedOn(dc, getTierInfo(s).bonus + 4)}+ (used once, on {/^[AEIOU]/.test(o.attr) ? 'an' : 'a'} {o.attr} roll)
                              </span>
                            </span>
                            <button
                              className={`${quietButton} ${armed === o.attr ? 'border-[#D4B876] text-[#E5C158]' : ''}`}
                              onClick={() => {
                                setChosenAttr(o.attr);
                                setArmed(armed === o.attr ? null : o.attr);
                              }}
                            >
                              {armed === o.attr ? 'TAKE BACK' : 'USE'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <ScriptButton
                  label={`🎲 ROLL ${attr.toUpperCase()}${armed === attr ? ' + RELIC' : ''}`}
                  disabled={busy}
                  onClick={() => call('roll_card', { p_attr: attr, p_relic: armed === attr })}
                />
                {mine.aside ? (
                  asideNote
                ) : (
                  <button className={`w-full ${quietButton} py-2`} disabled={busy} onClick={() => call('set_aside', {})}>
                    NOT NOW
                  </button>
                )}
              </>
            ) : (
              <div className="space-y-1">
                <p className="font-mono text-[13.5px] text-[#F4F1F8]">{rollLine(challenge)}</p>
                <p className={`font-['Cinzel'] font-bold text-[13px] ${challenge.pass ? 'text-[#6FD39A]' : 'text-[#F08A8A]'}`}>
                  {challenge.pass
                    ? `PASSED · +500g${challenge.growth ? ` · ${challenge.attr} ${challenge.score} → ${challenge.score + challenge.growth}` : ''}`
                    : `FAILED · −150g · ${fill(step.fail)}`}
                </p>
                {/* The first passed Challenge (Core Rules §7 first-time lines): only daily Challenges grow a skill, so it is the
                    first when every skill but this one's growth is still at its start (14, 12 and four 10s: 66 in all). */}
                {challenge.pass &&
                  !!challenge.growth &&
                  Object.values(progress.attrs).reduce((a, b) => a + b, 0) - challenge.growth === 66 && (
                    <p className="font-sans italic text-[13.5px] text-[#B7A9CC]">
                      {challenge.attr} {challenge.score} → {challenge.score + challenge.growth}. At 26 a skill becomes Apprentice: +2 on
                      every roll with it. The more days you play, the further you grow.
                    </p>
                  )}
              </div>
            )}
          </div>
        </div>
      );
      if (!challenge) break;
      continue;
    }
    if (step.t === 'press') {
      if (!challenge?.pass) continue;
      const score = progress.attrs[challenge.attr] ?? 10;
      const bonus = getTierInfo(score).bonus;
      const pressDc = dc + step.harder;
      nodes.push(
        <div key={key} className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg">
          <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555] flex items-center justify-between gap-2">
            <span className="font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8] truncate">[PRESS ON] · {fill(step.title)}</span>
            {!press && (
              <span className="font-['Cinzel'] font-bold text-[12px] text-[#E5C158] whitespace-nowrap">
                You succeed on {challengeSucceedOn(pressDc, bonus + (pressArmed ? 4 : 0))}+
              </span>
            )}
          </div>
          <div className="p-2.5 space-y-2">
            <ScriptText text={fill(`${step.detail.charAt(0).toUpperCase()}${step.detail.slice(1)}. ${step.reward}.`)} className="font-sans text-[14px] text-[#E6E0F0] leading-[1.4]" />
            {!press ? (
              <>
                {held(challenge.attr) > 0 && (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-[#3A2555] px-3 py-1.5">
                    <span className="text-[13px] text-[#D9D1E6]">
                      {challenge.attr} Relic · you hold {held(challenge.attr)}
                      <br />
                      <span className="text-[#B7A9CC]">With +4, you succeed on {challengeSucceedOn(pressDc, bonus + 4)}+ (used once)</span>
                    </span>
                    <button
                      className={`${quietButton} ${pressArmed ? 'border-[#D4B876] text-[#E5C158]' : ''}`}
                      onClick={() => setPressArmed(!pressArmed)}
                    >
                      {pressArmed ? 'TAKE BACK' : 'USE'}
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <ScriptButton
                    label={`🎲 ROLL ${challenge.attr.toUpperCase()}${pressArmed ? ' + RELIC' : ''}`}
                    disabled={busy}
                    onClick={() => call('roll_press_card', { p_leave: false, p_relic: pressArmed })}
                  />
                  <button className={quietButton} disabled={busy} onClick={() => call('roll_press_card', { p_leave: true, p_relic: false })}>
                    LEAVE IT
                  </button>
                </div>
              </>
            ) : 'left' in press && press.left ? (
              <TapEcho label="LEAVE IT" />
            ) : (
              <div className="space-y-1">
                <p className="font-mono text-[13.5px]">{rollLine(press as Roll)}</p>
                <p className={`font-['Cinzel'] font-bold text-[13px] ${(press as Roll).pass ? 'text-[#6FD39A]' : 'text-[#F08A8A]'}`}>
                  {(press as Roll).pass ? 'PASSED · +200g' : 'FAILED'}
                </p>
              </div>
            )}
          </div>
        </div>
      );
      if (!press) break;
      continue;
    }
    if (step.t === 'fight') {
      const playerFirst = strikeFirst(step.strikeFirst);
      const rounds = fight?.rounds ?? [];
      const last = rounds[rounds.length - 1];
      const php = last?.playerHpAfter ?? 100;
      const ehp = last?.enemyHpAfter ?? 100;
      nodes.push(
        <div key={`${key}-d`} className="font-sans italic text-[14px] text-[#B7A9CC] px-1">
          {fill(step.desc)}
        </div>
      );
      if (step.firstLines) nodes.push(<NarrationBlock key={`${key}-f`} text={fill(playerFirst ? step.firstLines[0] : step.firstLines[1])} />);
      if (today.daysPlayed === 0 && rounds.length === 0) {
        nodes.push(
          <p key={`${key}-first`} className="font-sans italic text-[13.5px] text-[#B7A9CC] px-1">
            Your first fight. You and he take turns. A roll decides each blow.
          </p>
        );
      }
      const bar = (label: string, hp: number, colour: string) => (
        <div className="space-y-0.5">
          <div className="flex justify-between text-[12px]">
            <span className="font-semibold">{label}</span>
            <span>{hp} HP</span>
          </div>
          <div className="h-2 rounded bg-[#130B1F] overflow-hidden">
            <div className="h-full" style={{ width: `${hp}%`, background: colour }} />
          </div>
        </div>
      );
      nodes.push(
        <div key={key} className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] p-3 space-y-2">
          <div className="font-['Cinzel'] font-bold text-[12.5px] text-[#F4F1F8]">⚔️ {fill(step.name)}</div>
          {bar('You', php, '#6FD39A')}
          {bar(fill(step.name), ehp, '#F08A8A')}
          <div className="space-y-1">
            {rounds.map((r, ri) => {
              // Canon's round message (Core Rules §4): the roll, then on a hit the damage and the target's HP before and after.
              const prev = rounds[ri - 1];
              const n = (v: number) => (v < 0 ? `−${Math.abs(v)}` : `${v}`);
              const name = sentenceCase(fill(step.name));
              let enemyHp = prev?.enemyHpAfter ?? 100;
              let playerHp = prev?.playerHpAfter ?? 100;
              const myStrike = () => {
                if (!r.playerStruck) return [];
                const out = [`You Roll ${r.d20} + Weapon ${r.playerAtk} − DEF ${r.enemyDef} = ${n(r.margin)}. ${r.hit ? 'HIT' : 'MISS'}`];
                if (r.hit) {
                  const after = Math.max(0, enemyHp - r.margin * 5);
                  out.push(`Damage = ${r.margin} × 5 = ${r.margin * 5}. ${name} HP ${enemyHp} → ${after}`);
                  enemyHp = after;
                }
                return out;
              };
              const theirs = () => {
                if (!r.enemyStruck) return [];
                const out = [`Enemy Rolls ${r.enemyD20} + ATK ${r.enemyAtk} − Armor ${r.playerArmor} = ${n(r.enemyMargin)}. ${r.enemyHit ? 'HIT' : 'MISS'}`];
                if (r.enemyHit) {
                  const after = Math.max(0, playerHp - r.enemyMargin * 5);
                  out.push(`Damage = ${r.enemyMargin} × 5 = ${r.enemyMargin * 5}. Your HP ${playerHp} → ${after}`);
                  playerHp = after;
                }
                return out;
              };
              const lines = r.enemyFirst ? [...theirs(), ...myStrike()] : [...myStrike(), ...theirs()];
              return (
                <div key={r.round} className="font-mono text-[12px] text-[#D9D1E6]">
                  <div className="text-[#8B7A9E]">Round {r.round}{r.relic ? ' · Combat Relic: +1 Weapon, +1 Armor' : ''}</div>
                  {lines.map((l, li) => (
                    <div key={li}>{l}</div>
                  ))}
                </div>
              );
            })}
          </div>
          {!fightDone ? (
            <>
              {/* A Combat Relic: +1 Weapon and +1 Armor for the rest of the fight, from the next round; once per fight (§5, §12a). */}
              {fight?.relicFrom === undefined && held('Combat') > 0 && (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-[#3A2555] px-3 py-1.5">
                  <span className="text-[13px] text-[#D9D1E6]">
                    Combat Relic · you hold {held('Combat')}
                    <br />
                    <span className="text-[#B7A9CC]">+1 Weapon and +1 Armor for the rest of this fight, from the next round</span>
                  </span>
                  <button className={quietButton} disabled={busy} onClick={() => call('use_combat_relic', {})}>
                    USE
                  </button>
                </div>
              )}
              {fight?.relicFrom !== undefined && rounds.length < fight.relicFrom && (
                <p className="text-[13px] text-[#B7A9CC]">Combat Relic used: +1 Weapon and +1 Armor from Round {fight.relicFrom}.</p>
              )}
              <ScriptButton label={`🎲 ROUND ${rounds.length + 1}`} disabled={busy} onClick={() => call('fight_round', {})} />
              {/* [NOT NOW] before the first round, except the first fight (Core Rules §12a). */}
              {rounds.length === 0 &&
                !(week === 1 && day === 1) &&
                (mine.aside ? (
                  asideNote
                ) : (
                  <button className={`w-full ${quietButton} py-2`} disabled={busy} onClick={() => call('set_aside', {})}>
                    NOT NOW
                  </button>
                ))}
            </>
          ) : (
            <div className="space-y-1">
              <p className={`font-['Cinzel'] font-bold text-[13px] ${fightWon ? 'text-[#6FD39A]' : 'text-[#F08A8A]'}`}>
                {fightWon ? `VICTORY. ${sentenceCase(fill(step.name))} defeated in ${rounds.length} round${rounds.length === 1 ? '' : 's'}.` : 'DEFEATED.'}
                <br />
                {`REWARD: ${fightWon && fight?.gold ? `+${fight.gold}g` : 'none'}`}
              </p>
              {/* After the first fight (Core Rules §7 first-time lines): everyone's first fight is Week 1 Day 1's. */}
              {week === 1 && day === 1 && (
                <p className="font-sans italic text-[13.5px] text-[#B7A9CC]">
                  Gold buys better weapons and armor in the Store. Every fight starts fresh: your wounds never follow you.
                </p>
              )}
            </div>
          )}
        </div>
      );
      if (!fightDone) break;
      continue;
    }
    if (step.t === 'summary') {
      reachedSummary = true;
      const [titleLine, ...rest] = step.lines;
      const earned: string[] = [];
      if (challenge) {
        if (challenge.pass) {
          earned.push('+500g');
          if (challenge.growth) earned.push(`${challenge.attr} ${challenge.score} → ${challenge.score + challenge.growth}`);
        } else earned.push('−150g');
      }
      if (press && !('left' in press && press.left) && (press as Roll).pass) earned.push('+200g');
      if (fight?.won && fight.gold) earned.push(`+${fight.gold}g`);
      const shown = rest
        .map((l) => {
          if (/^You earned:/.test(l)) return `You earned: ${earned.length ? earned.join(' · ') : 'nothing new today'}`;
          const pass = l.match(/^\*On a pass:\*\s*(.*)$/);
          if (pass) return challenge?.pass ? pass[1] : null;
          const fail = l.match(/^\*On a failure:\*\s*(.*)$/);
          if (fail) return challenge && !challenge.pass ? fail[1] : null;
          if (/^You can now afford:/.test(l)) return null;
          return l;
        })
        .filter((l): l is string => Boolean(l));
      nodes.push(
        <div key={key} className="w-full rounded-xl bg-[#180F29] border border-[#D4B876]/70 overflow-hidden shadow-lg">
          <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555]">
            <ScriptText text={fill(titleLine)} className="font-['Cinzel'] font-bold text-[12.5px] tracking-[0.6px] text-[#E5C158]" />
          </div>
          <div className="p-3 space-y-1">
            {shown.map((l, li) => (
              <ScriptText key={li} text={fill(l)} className="font-sans text-[14px] text-[#E6E0F0] leading-[1.42]" />
            ))}
          </div>
        </div>
      );
      break;
    }
  }
  if (nextDay) {
    nodes.push(
      <div key="next-day" className="space-y-2" data-next-day>
        <p className="font-sans italic text-[14px] text-[#B7A9CC] px-1">The others are already a day further down the road.</p>
        <button
          className={goldButton}
          onClick={() => {
            setNextDay(null);
            finishing.current = false;
            load();
          }}
        >
          {`ON TO WEEK ${nextDay.week}, DAY ${nextDay.day}`}
        </button>
      </div>
    );
  }

  return (
    <DayBody
      header={header}
      title={`Week ${week} · Day ${day}`}
      heading={chapter.script.heading}
      roadSoFar={<RoadSoFar recaps={today.recaps} missed={today.missed} fill={roadFill} />}
      nodes={nodes}
      error={error}
      reachedSummary={reachedSummary}
      finished={Boolean(mine.finished_at)}
      onFinish={async () => {
        // The day counts as played once read to its last line (Core Rules §12a).
        if (finishing.current) return;
        finishing.current = true;
        const { error: e } = await supabase.rpc('finish_day', { p_party: partyId });
        if (e) {
          setError(plainError(e.message));
          finishing.current = false;
          return;
        }
        // A late joiner's Day 1 leads on to the party's day; anyone else stays on this one.
        const { data: d } = await supabase.rpc('my_today_day', { p_party: partyId });
        if (d && (d.week !== week || d.day !== day)) setNextDay(d as { week: number; day: number });
        else await load();
      }}
      onClose={onClose}
      onOpenFire={onOpenFire}
      embedded={embedded}
      endRef={endRef}
    />
  );
}

function DayBody({
  header,
  title,
  heading: chapterHeading,
  roadSoFar,
  nodes,
  error,
  reachedSummary,
  finished,
  onFinish,
  onClose,
  onOpenFire,
  embedded,
  endRef,
}: {
  header: React.ReactNode;
  title: string;
  heading: string;
  roadSoFar: React.ReactNode;
  nodes: React.ReactNode[];
  error: string | null;
  reachedSummary: boolean;
  finished: boolean;
  onFinish: () => void;
  onClose: () => void;
  onOpenFire: () => void;
  embedded?: boolean;
  endRef: React.RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    if (reachedSummary && !finished) onFinish();
  }, [reachedSummary, finished, onFinish]);
  return (
    <div className="space-y-3">
      {header}
      {roadSoFar}
      <div>
        <p className={note}>{title}</p>
        <h2 className={`${heading} text-[19px]`}>{chapterHeading}</h2>
      </div>
      <div className="space-y-3">{nodes}</div>
      <ErrorLine text={error} />
      {/* After the day: the last light, then the fire (the Campfire opens once the day is done, v2.3 §D). */}
      {/* In the game shell the fire follows below the day in the same thread, so neither button is needed. */}
      {reachedSummary && finished && !embedded && (
        <button
          className="w-full py-2.5 rounded-lg bg-[#2A2018] border border-[#F0A552]/70 font-['Cinzel'] font-bold text-[13px] text-[#F0A552]"
          onClick={onOpenFire}
        >
          🔥 THE LAST LIGHT
        </button>
      )}
      {reachedSummary && !embedded && (
        <button className={`w-full ${quietButton} py-2.5 font-[Cinzel] font-bold`} onClick={onClose}>
          BACK TO THE PARTY
        </button>
      )}
      <div ref={endRef} />
    </div>
  );
}

// Day 7's "Tonight" line with the Gathering's time (Core Rules §11 "Day 7 before the Gathering").
function DaySevenLine({ partyId, timeZone }: { partyId: string; timeZone: string }) {
  const [line, setLine] = useState<string | null>(null);
  useEffect(() => {
    supabase.rpc('gathering_info', { p_party: partyId }).then(({ data }) => {
      if (data?.tonight) setLine(tonightLine(data.tonight, data.opensAt, timeZone));
    });
  }, [partyId, timeZone]);
  return <p className="text-[15px] italic text-[#B7A9CC]">{line ?? 'Tonight: the Gathering.'}</p>;
}

// The road so far: the story up to yesterday, in the storybook voice, before today's chapter. A friend who missed days
// gets each missed day's recap, then canon's line (Core Rules §12a "After missed days"). The text comes from the server.
const DAY_COUNT_WORDS = ['no days', 'a day', 'two days', 'three days', 'four days', 'five days', 'six days'];
function RoadSoFar({
  recaps,
  missed,
  fill,
}: {
  recaps?: { week: number; day: number; recap: string }[];
  missed?: number;
  fill: (text: string) => string;
}) {
  if (!recaps || recaps.length === 0) return null;
  const several = recaps.length > 1;
  return (
    <div className="rounded-xl border border-[#3A2555] bg-[#130B1F] px-3.5 py-3 space-y-2.5">
      <p className="font-['Cinzel'] font-bold text-[12px] tracking-wide text-[#D4B876]">THE ROAD SO FAR</p>
      {recaps.map((r) => (
        <div key={`${r.week}-${r.day}`} className="space-y-1">
          {several && (
            <p className="font-sans text-[11.5px] text-[#8B7A9E]">
              {r.day === 7 ? `Week ${r.week} · The Gathering` : `Week ${r.week} · Day ${r.day}`}
            </p>
          )}
          <NarrationBlock text={fill(r.recap)} />
        </div>
      ))}
      {!!missed && missed > 0 && (
        <p className="font-sans italic text-[13.5px] text-[#B7A9CC] px-1">
          You missed {missed < DAY_COUNT_WORDS.length ? DAY_COUNT_WORDS[missed] : `${missed} days`}. The story went on. Today is still yours.
        </p>
      )}
    </div>
  );
}
