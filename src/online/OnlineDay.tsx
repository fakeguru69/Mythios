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
  HowItWorks,
  NarrationBlock,
  NoticeBlock,
  NoticeRollCard,
  type NoticeRollResult,
  ScriptButton,
  ScriptInline,
  ScriptText,
  TapEcho,
  WhatThisChangedBlock,
} from '../components/ChapterScriptParts';
import { challengeSucceedOn, getTierInfo, type AttributeName, EPISODE_NUMBERS, GEAR_TABLE } from '../data/mythiosRulesData';
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
  notice?: NoticeRollResult;
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
  daysPlayed?: number;
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
      <HowItWorks text="Set aside. It waits here until you take it up, and the Store is open." />
      <button className={`w-full ${quietButton} py-2 font-[Cinzel] font-bold`} onClick={onOpenStore}>
        THE STORE
      </button>
    </div>
  );

  const items: StoryItem[] = [];
  const pushItem = (key: string, node: React.ReactNode, opts?: { instant?: boolean; resolved?: boolean }) => {
    items.push({ key, node, instant: opts?.instant, resolved: opts?.resolved });
  };
  const pushSay = (keyBase: string, rawText: string, pull?: boolean) => {
    const filled = fill(rawText);
    const paras = filled.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    paras.forEach((para, pi) => {
      const k = `${keyBase}-m${pi}`;
      pushItem(
        k,
        <Markable key={k} source={`Week ${week}, Day ${day}`} text={para}>
          <NarrationBlock text={para} pull={pull && pi === paras.length - 1} />
        </Markable>
      );
    });
  };
  let actIndex = 0;
  let reachedSummary = false;

  for (let i = 0; i < steps.length; i++) {
    const step: ScriptStep = steps[i];
    const key = `s${i}`;
    if (step.t === 'say') {
      if (!condMet(step.cond)) continue;
      pushSay(key, step.text, step.pull);
      // The day's fragment is in the Chest from the day's opening (Core Rules §6).
      if (step.fragment) {
        pushItem(
          `${key}-chest`,
          <button key={`${key}-chest`} className={`w-full ${quietButton} py-2 font-[Cinzel] font-bold`} onClick={onOpenChest}>
            🕯️ OPEN THE SEEKER CHEST
          </button>,
          { instant: true }
        );
      }
      continue;
    }
    if (step.t === 'act') {
      actIndex += 1;
      if (actIndex <= mine.acts) {
        pushItem(key, <TapEcho key={key} label={fill(step.label)} />, { instant: true, resolved: true });
        continue;
      }
      const next = actIndex;
      pushItem(key, <ScriptButton key={key} label={fill(step.label)} disabled={busy} onClick={() => call('tap_act', { p_acts: next })} />, { instant: true });
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
        pushItem(`${key}-p${opt}`, <TapEcho key={`${key}-p${opt}`} label={fill(labels[opt])} />, { instant: true, resolved: true });
        const b = branchFor(opt);
        if (b && !shown.has(step.branches.indexOf(b))) {
          shown.add(step.branches.indexOf(b));
          pushSay(`${key}-b${opt}`, b.text);
          if (b.changed) {
            pushItem(`${key}-c${opt}`, <WhatThisChangedBlock key={`${key}-c${opt}`} text={fill(b.changed)} />, { instant: true, resolved: true });
          }
        }
      });
      if (picks.length > 0 && step.mode === 'auto') {
        step.branches.forEach((b, bi) => {
          if (!shown.has(bi)) {
            shown.add(bi);
            pushSay(`${key}-a${bi}`, b.text);
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
        pushItem(
          `${key}-o`,
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
          </div>,
          { instant: true }
        );
        break;
      }
      continue;
    }
    if (step.t === 'notice') {
      const line = pickNoticeLine(step.lines, progress.attrs, classAttr);
      if (line) {
        const storedNotice = today?.notice as NoticeRollResult | undefined;
        const rollResult: NoticeRollResult = storedNotice ?? {
          attr: line.attr,
          d20: 14,
          bonus: getTierInfo(progress.attrs[line.attr] ?? 10).bonus,
          total: 14 + getTierInfo(progress.attrs[line.attr] ?? 10).bonus,
          dc: 3,
          pass: true,
          text: fill(line.text),
          noviceNote: (progress.attrs[line.attr] ?? 10) < 26 ? 'A more practised eye would see more here.' : null,
        };
        const showFirstTime = typeof window !== 'undefined' && !localStorage.getItem('mythios_notice_explained');
        pushItem(key, <NoticeRollCard key={key} roll={rollResult} showFirstTime={showFirstTime} />);
        if (showFirstTime && typeof window !== 'undefined') {
          try { localStorage.setItem('mythios_notice_explained', '1'); } catch {}
        }
      }
      continue;
    }
    if (step.t === 'challenge') {
      const options = step.options;
      const attr = (challenge?.attr ?? chosenAttr ?? options[0].attr) as AttributeName;
      const score = progress.attrs[attr] ?? 10;
      const bonus = getTierInfo(score).bonus;
      pushItem(
        key,
        <div key={key} className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg" data-challenge-card>
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
              <HowItWorks text="A Challenge. Pick the skill you trust and roll. Pass, and you earn 500 gold and that skill grows. Fail, and it costs 150 gold." />
            )}
            <ScriptText text={fill(step.desc)} className="font-sans text-[16px] text-[#E6E0F0] leading-[1.42]" />
            {harder > 0 && step.harderIf && (
              <ScriptText text={fill(step.harderIf.line)} className="font-sans text-[16px] text-[#E0645C] leading-[1.42]" />
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
                          <span className="font-semibold text-[16px]">
                            {o.attr} {s} (+{getTierInfo(s).bonus})
                          </span>
                          <span className="text-[16px] text-[#B7A9CC]"> · {fill(o.verb)}</span>
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
                    <HowItWorks
                      text={`${challenge.attr} ${challenge.score} → ${challenge.score + challenge.growth}. At 26 a skill becomes Apprentice: +2 on every roll with it. The more days you play, the further you grow.`}
                    />
                  )}
              </div>
            )}
          </div>
        </div>,
        { instant: true, resolved: Boolean(challenge) }
      );
      if (!challenge) break;
      continue;
    }
    if (step.t === 'press') {
      if (!challenge?.pass) continue;
      const score = progress.attrs[challenge.attr] ?? 10;
      const bonus = getTierInfo(score).bonus;
      const pressDc = dc + step.harder;
      pushItem(
        key,
        <div key={key} className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg" data-press-card>
          <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555] flex items-center justify-between gap-2">
            <span className="font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8] truncate">[PRESS ON] · {fill(step.title)}</span>
            {!press && (
              <span className="font-['Cinzel'] font-bold text-[12px] text-[#E5C158] whitespace-nowrap">
                You succeed on {challengeSucceedOn(pressDc, bonus + (pressArmed ? 4 : 0))}+
              </span>
            )}
          </div>
          <div className="p-2.5 space-y-2">
            <ScriptText text={fill(`${step.detail.charAt(0).toUpperCase()}${step.detail.slice(1)}. ${step.reward}.`)} className="font-sans text-[16px] text-[#E6E0F0] leading-[1.42]" />
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
        </div>,
        { instant: true, resolved: Boolean(press) }
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
      pushSay(`${key}-d`, step.desc);
      if (step.firstLines) pushSay(`${key}-f`, playerFirst ? step.firstLines[0] : step.firstLines[1]);
      if (today.daysPlayed === 0 && rounds.length === 0) {
        pushItem(
          `${key}-first`,
          <HowItWorks key={`${key}-first`} text="Your first fight. You and he take turns. A roll decides each blow." />
        );
      }
      const bar = (label: string, hp: number, colour: string, labelColour: string) => (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1 text-[11.5px] font-['Cinzel'] font-bold">
            <span style={{ color: labelColour }} className="truncate">{label}</span>
            <span style={{ color: labelColour }} className="whitespace-nowrap shrink-0">{hp} HP</span>
          </div>
          <div className="w-full h-1.5 bg-[#2A1B40] rounded-full overflow-hidden mt-1">
            <div className="h-full transition-all duration-300" style={{ width: `${hp}%`, background: colour }} />
          </div>
        </div>
      );
      const epMeta = EPISODE_NUMBERS[(today?.week ?? 1) - 1] || EPISODE_NUMBERS[0];
      const wepGear = GEAR_TABLE[today?.progress?.weapon_level ?? 1] || GEAR_TABLE[1];
      const amrGear = GEAR_TABLE[today?.progress?.armor_level ?? 1] || GEAR_TABLE[1];
      const relicActive = fight?.relicFrom !== undefined && rounds.length + 1 >= fight.relicFrom;
      const curWep = last?.playerAtk ?? wepGear.weapon + (relicActive ? 1 : 0);
      const curAmr = last?.playerArmor ?? amrGear.armor + (relicActive ? 1 : 0);
      const curDef = last?.enemyDef ?? chapter.meta.wDef ?? epMeta.wDef;
      const curAtk = last?.enemyAtk ?? chapter.meta.wAtk ?? epMeta.wAtk;
      const youHitOn = challengeSucceedOn(curDef, curWep);
      const foeHitsOn = challengeSucceedOn(curAmr, curAtk);

      pushItem(
        key,
        <div key={key} className="w-full rounded-xl bg-[#180F29] border border-[#5E4585] overflow-hidden shadow-lg" data-fight-card>
          <div className="px-3 py-2 bg-[#241638] border-b border-[#3A2555] flex items-center justify-between gap-2">
            <span className="font-['Cinzel'] font-bold text-[12.5px] text-[#F4F1F8] truncate">⚔️ {fill(step.name)}</span>
            <span className="font-['Cinzel'] font-bold text-[11.5px] whitespace-nowrap" data-hit-on>
              <span className="text-[#E5C158]">You hit on {youHitOn}+</span>
              <span className="text-[#8B7A9E]"> / </span>
              <span className="text-[#FB923C]">He hits on {foeHitsOn}+</span>
            </span>
          </div>

          <div className="p-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-[#130B1F] border border-[#3A2555]" data-fight-you>
                {bar('YOU', php, '#6FD39A', '#6FD39A')}
                <div className="mt-1.5 space-y-0.5 text-[12px] font-sans">
                  <div className="flex items-center justify-between font-semibold text-[#E5C158]" data-stat-weapon>
                    <span>Weapon WEP</span>
                    <span className="font-bold">{curWep}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-[#7AA7FF]" data-stat-armour>
                    <span>Armour AMR</span>
                    <span className="font-bold">{curAmr}</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#130B1F] border border-[#3A2555]" data-fight-foe>
                {bar('FOE', ehp, '#E0645C', '#E0645C')}
                <div className="mt-1.5 space-y-0.5 text-[12px] font-sans">
                  <div className="flex items-center justify-between font-semibold text-[#FB923C]" data-stat-defence>
                    <span>Defence DEF</span>
                    <span className="font-bold">{curDef}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-[#C084FC]" data-stat-attack>
                    <span>Attack ATK</span>
                    <span className="font-bold">{curAtk}</span>
                  </div>
                </div>
              </div>
            </div>
            {rounds.length > 0 && (
              <div className="p-2.5 rounded-xl bg-[#130B1F] border border-[#3A2555] space-y-2" data-fight-rounds>
                {rounds.map((r, ri) => {
                  // Canon's round message (Core Rules §4): the roll, then on a hit the damage and the target's HP before and after.
                  const prev = rounds[ri - 1];
                  const n = (v: number) => (v < 0 ? `−${Math.abs(v)}` : `+${v}`);
                  const name = sentenceCase(fill(step.name));
                  const enemyHpBefore = prev?.enemyHpAfter ?? 100;
                  const playerHpBefore = prev?.playerHpAfter ?? 100;
                  const enemyHpAfter = r.hit ? Math.max(0, enemyHpBefore - r.margin * 5) : enemyHpBefore;
                  const playerHpAfter = r.enemyHit ? Math.max(0, playerHpBefore - r.enemyMargin * 5) : playerHpBefore;

                  const myStrikeNode = r.playerStruck ? (
                    <div key="you" className="space-y-0.5" data-round-you>
                      <div className="font-semibold leading-snug">
                        <span className="text-[#6FD39A] font-bold">You Roll </span>
                        <span className="text-[#F4F1F8]">🎲 {r.d20}</span>
                        <span className="text-[#8B7A9E]"> + </span>
                        <span className="text-[#E5C158]">Weapon {r.playerAtk}</span>
                        <span className="text-[#8B7A9E]"> − </span>
                        <span className="text-[#FB923C]">DEF {r.enemyDef}</span>
                        <span className="text-[#8B7A9E]"> = </span>
                        <span className={`font-bold ${r.hit ? 'text-[#6FD39A]' : 'text-[#9A90B8]'}`}>
                          {n(r.margin)}. {r.hit ? 'HIT' : 'MISS'}
                        </span>
                      </div>
                      {r.hit && (
                        <div className="font-bold text-[#6FD39A]">
                          Damage = {r.margin} × 5 = {r.margin * 5}.{' '}
                          <span className="text-[#E0645C]">
                            {name} HP {enemyHpBefore} → {enemyHpAfter}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : null;

                  const enemyStrikeNode = r.enemyStruck ? (
                    <div
                      key="foe"
                      className={`space-y-0.5 ${r.playerStruck ? 'pt-1 border-t border-white/[0.05]' : ''}`}
                      data-round-foe
                    >
                      <div className="font-semibold leading-snug">
                        <span className="text-[#E0645C] font-bold">Enemy Rolls </span>
                        <span className="text-[#F4F1F8]">🎲 {r.enemyD20}</span>
                        <span className="text-[#8B7A9E]"> + </span>
                        <span className="text-[#C084FC]">ATK {r.enemyAtk}</span>
                        <span className="text-[#8B7A9E]"> − </span>
                        <span className="text-[#7AA7FF]">Armor {r.playerArmor}</span>
                        <span className="text-[#8B7A9E]"> = </span>
                        <span className={`font-bold ${r.enemyHit ? 'text-[#E0645C]' : 'text-[#9A90B8]'}`}>
                          {n(r.enemyMargin)}. {r.enemyHit ? 'HIT' : 'MISS'}
                        </span>
                      </div>
                      {r.enemyHit && (
                        <div className="font-bold text-[#E0645C]">
                          Damage = {r.enemyMargin} × 5 = {r.enemyMargin * 5}.{' '}
                          <span className="text-[#6FD39A]">
                            Your HP {playerHpBefore} → {playerHpAfter}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : null;

                  const ordered = r.enemyFirst ? [enemyStrikeNode, myStrikeNode] : [myStrikeNode, enemyStrikeNode];
                  return (
                    <div
                      key={r.round}
                      className="p-2 rounded-lg bg-[#1A102A] border border-[#3A2555]/80 flex flex-col gap-1 text-[13px] font-sans"
                      data-fight-round={r.round}
                    >
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-1">
                        <span className="font-['Cinzel'] font-bold text-[11px] text-[#E5C158]">
                          ROUND {r.round}
                          {r.relic ? ' · Combat Relic: +1 Weapon, +1 Armor' : ''}
                        </span>
                        <span className="text-[11px] font-semibold text-[#B7A9CC]">Damage = Margin × 5</span>
                      </div>
                      {ordered}
                    </div>
                  );
                })}
              </div>
            )}
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
                <HowItWorks text="Gold buys better weapons and armor in the Store. Every fight starts fresh: your wounds never follow you." />
              )}
            </div>
          )}
          </div>
        </div>,
        { instant: true, resolved: rounds.length > 0 }
      );
      if (!fightDone) break;
      continue;
    }
    if (step.t === 'summary') {
      reachedSummary = true;
      const [titleLine, ...rest] = step.lines;
      const earned: string[] = [];
      let netGold = 0;
      let hasGoldChange = false;
      if (challenge) {
        hasGoldChange = true;
        if (challenge.pass) {
          netGold += 500;
          earned.push('+500g');
          if (challenge.growth) earned.push(`${challenge.attr} ${challenge.score} → ${challenge.score + challenge.growth}`);
        } else {
          netGold -= 150;
          earned.push('−150g');
        }
      }
      if (press && !('left' in press && press.left) && (press as Roll).pass) {
        hasGoldChange = true;
        netGold += 200;
        earned.push('+200g');
      }
      if (fight?.won && fight.gold) {
        hasGoldChange = true;
        netGold += fight.gold;
        earned.push(`+${fight.gold}g`);
      }

      // Three coloured results:
      // 1. Gold (gold #E5C158)
      const goldDisplay = hasGoldChange
        ? netGold > 0
          ? `+${netGold}g`
          : netGold < 0
          ? `−${Math.abs(netGold)}g`
          : '0g'
        : '+0g';

      // 2. Growth (purple #C084FC)
      let growthDisplay = '—';
      if (challenge?.pass) {
        growthDisplay = challenge.growth
          ? `${challenge.attr} ${challenge.score} → ${challenge.score + challenge.growth}`
          : `${challenge.attr} max`;
      } else if (challenge && !challenge.pass) {
        growthDisplay = 'No growth';
      }

      // 3. Fragment (blue #7AA7FF)
      const fragRaw = rest.find((l) => /^Fragments?:\s*/i.test(l));
      const fragDisplay = fragRaw
        ? fill(fragRaw.replace(/^Fragments?:\s*/i, ''))
        : '—';

      // What you learned
      const learnedRaw = rest.find((l) => /^You learned:\s*/i.test(l));
      const learnedDisplay = learnedRaw
        ? fill(learnedRaw.replace(/^You learned:\s*/i, ''))
        : null;

      // What you carry (formerly You hold:)
      const carryRaw = rest.find((l) => /^(?:You hold|You carry):\s*/i.test(l));
      const carryDisplay = carryRaw
        ? fill(carryRaw.replace(/^(?:You hold|You carry):\s*/i, ''))
        : null;

      // Tomorrow
      const tomorrowRaw = rest.find((l) => /^Tomorrow:\s*/i.test(l));
      const tomorrowDisplay = tomorrowRaw
        ? fill(tomorrowRaw.replace(/^Tomorrow:\s*/i, ''))
        : null;

      // Branch notes (e.g. *On a pass:*, *On a failure:*)
      let branchNote: string | null = null;
      for (const l of rest) {
        const pass = l.match(/^\*On a pass:\*\s*(.*)$/);
        if (pass && challenge?.pass) {
          branchNote = fill(pass[1]);
          break;
        }
        const fail = l.match(/^\*On a failure:\*\s*(.*)$/);
        if (fail && challenge && !challenge.pass) {
          branchNote = fill(fail[1]);
          break;
        }
      }

      pushItem(
        key,
        <div
          key={key}
          className="w-full rounded-2xl bg-[#160E24] border border-[#D4B876]/80 overflow-hidden shadow-2xl"
          data-end-of-day-card
        >
          {/* Header */}
          <div className="px-4 py-2.5 bg-[#241638] border-b border-[#3A2555] flex items-center justify-between gap-2">
            <ScriptText text={fill(titleLine)} className="font-['Cinzel'] font-bold text-[13px] tracking-[0.8px] text-[#E5C158] uppercase truncate" />
            <span className="shrink-0 font-['Cinzel'] text-[10.5px] tracking-[1px] text-[#D4B876]/80 uppercase px-2 py-0.5 rounded border border-[#D4B876]/30 bg-[#1A0F2E]">
              DAY SUMMARY
            </span>
          </div>

          <div className="p-4 space-y-3.5 bg-[#160E24]">
            {/* Screen-reader and automated test log compatibility */}
            <div className="sr-only">
              You earned: {earned.length ? earned.join(' · ') : 'nothing new today'}
            </div>

            {/* Three coloured results (gold, growth, fragment) */}
            <div className="grid grid-cols-3 gap-2" data-summary-results>
              {/* Gold */}
              <div
                className="rounded-xl bg-[#231A12] border border-[#8A6E34]/70 p-2 text-center flex flex-col justify-between items-center min-h-[60px]"
                data-result-gold
              >
                <span className="font-['Cinzel'] font-bold text-[10px] tracking-[0.8px] text-[#D4B876] uppercase">
                  GOLD
                </span>
                <span className="font-['Cinzel'] font-bold text-[16px] text-[#E5C158] leading-tight">
                  {goldDisplay}
                </span>
              </div>

              {/* Growth */}
              <div
                className="rounded-xl bg-[#1D142E] border border-[#5E4585]/70 p-2 text-center flex flex-col justify-between items-center min-h-[60px]"
                data-result-growth
              >
                <span className="font-['Cinzel'] font-bold text-[10px] tracking-[0.8px] text-[#C39BF5] uppercase">
                  GROWTH
                </span>
                <span className="font-sans font-semibold text-[13px] text-[#C084FC] truncate max-w-full leading-tight">
                  {growthDisplay}
                </span>
              </div>

              {/* Fragment */}
              <div
                className="rounded-xl bg-[#141B2E] border border-[#3A4B75]/70 p-2 text-center flex flex-col justify-between items-center min-h-[60px]"
                data-result-fragment
              >
                <span className="font-['Cinzel'] font-bold text-[10px] tracking-[0.8px] text-[#7AA7FF] uppercase">
                  FRAGMENT
                </span>
                <span className="font-sans font-semibold text-[13px] text-[#7AA7FF] truncate max-w-full leading-tight">
                  {fragDisplay}
                </span>
              </div>
            </div>

            {/* What you learned */}
            {learnedDisplay && (
              <div className="space-y-1" data-summary-learned>
                <div className="font-['Cinzel'] font-bold text-[11px] tracking-[0.8px] text-[#D4B876] uppercase">
                  WHAT YOU LEARNED
                </div>
                <p className="font-sans text-[16px] text-[#F4F1F8] leading-[1.45]">
                  <ScriptInline text={learnedDisplay} />
                </p>
              </div>
            )}

            {/* What you carry */}
            {carryDisplay && (
              <div className="space-y-1" data-summary-carry>
                <div className="font-['Cinzel'] font-bold text-[11px] tracking-[0.8px] text-[#D4B876] uppercase">
                  WHAT YOU CARRY
                </div>
                <p className="font-sans text-[16px] text-[#E6E0F0] leading-[1.45]">
                  <ScriptInline text={carryDisplay} />
                </p>
              </div>
            )}

            {/* Branch note */}
            {branchNote && (
              <div className="rounded-xl bg-[#201533] border border-[#4A3266] px-3 py-2 text-[14px] text-[#D9D1E6] leading-relaxed">
                <ScriptInline text={branchNote} />
              </div>
            )}

            {/* Tomorrow */}
            {tomorrowDisplay && (
              <div className="space-y-1 pt-2 border-t border-[#2D1F42]" data-summary-tomorrow>
                <p className="font-sans text-[16px] text-[#E6E0F0] leading-[1.42]">
                  <span className="font-['Cinzel'] font-bold text-[#E5C158] tracking-[0.6px] uppercase mr-1.5" data-tomorrow-label>
                    Tomorrow:
                  </span>
                  <ScriptInline text={tomorrowDisplay} />
                </p>
              </div>
            )}
          </div>
        </div>
      );
      break;
    }
  }
  if (nextDay) {
    pushItem(
      'next-day',
      <div key="next-day" className="space-y-2" data-next-day>
        <p className="font-sans text-[16px] text-[#B7A9CC] px-1">The others are already a day further down the road.</p>
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
      </div>,
      { instant: true }
    );
  }

  return (
    <DayBody
      dayKey={`${partyId}:${week}:${day}`}
      header={header}
      title={`Week ${week} · Day ${day}`}
      heading={chapter.script.heading}
      roadSoFar={<RoadSoFar recaps={today.recaps} missed={today.missed} fill={roadFill} />}
      items={items}
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

interface StoryItem {
  key: string;
  node: React.ReactNode;
  instant?: boolean;
  resolved?: boolean;
}

const includeTrailingInstants = (items: StoryItem[], count: number) => {
  let c = Math.max(0, Math.min(items.length, count));
  while (c < items.length && items[c]?.instant) c += 1;
  return c;
};

function readNumber(key: string): number {
  try {
    const raw = localStorage.getItem(key);
    return raw ? Math.max(0, Number(raw) || 0) : 0;
  } catch {
    return 0;
  }
}

function writeNumber(key: string, value: number) {
  try {
    localStorage.setItem(key, String(Math.round(value)));
  } catch {
    /* private window */
  }
}

function DayBody({
  dayKey,
  header,
  title,
  heading: chapterHeading,
  roadSoFar,
  items,
  error,
  reachedSummary,
  finished,
  onFinish,
  onClose,
  onOpenFire,
  embedded,
  endRef,
}: {
  dayKey: string;
  header: React.ReactNode;
  title: string;
  heading: string;
  roadSoFar: React.ReactNode;
  items: StoryItem[];
  error: string | null;
  reachedSummary: boolean;
  finished: boolean;
  onFinish: () => void;
  onClose: () => void;
  onOpenFire: () => void;
  embedded?: boolean;
  endRef: React.RefObject<HTMLDivElement | null>;
}) {
  const shownKey = `story-shown:${dayKey}`;
  const scrollKey = `story-scroll:${dayKey}`;

  let lastResolved = -1;
  for (let i = 0; i < items.length; i++) {
    if (items[i].resolved) lastResolved = i;
  }
  const savedShown = readNumber(shownKey);
  const floorShown = finished
    ? items.length
    : includeTrailingInstants(items, Math.max(1, lastResolved + 1, savedShown));

  const [shown, setShown] = useState<number>(() => floorShown);
  const visibleCount = Math.min(items.length, Math.max(shown, floorShown));
  const typing = visibleCount < items.length;

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevKeyRef = useRef<string>('');
  const prevShownRef = useRef<number>(visibleCount);
  const unreadAnchorRef = useRef<number>(Math.max(0, visibleCount - 1));

  // When the day opens (or changes), restore the friend's last-read scroll place, or start cleanly at the top (0)
  // so no text is cut off at the top.
  useEffect(() => {
    if (prevKeyRef.current === dayKey) return;
    prevKeyRef.current = dayKey;
    prevShownRef.current = visibleCount;
    unreadAnchorRef.current = Math.max(0, visibleCount - 1);
    const savedY = readNumber(scrollKey);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: savedY > 0 ? savedY : 0 });
    });
  }, [dayKey, scrollKey, visibleCount]);

  // Remember the friend's last-read scroll place when they scroll or leave and return.
  useEffect(() => {
    const onScroll = () => {
      writeNumber(scrollKey, window.scrollY);
      // If the friend scrolls past the unread anchor, advance the anchor to the first item still in view.
      const safeTop = 104;
      while (unreadAnchorRef.current < visibleCount - 1) {
        const el = itemRefs.current[unreadAnchorRef.current];
        if (el && el.getBoundingClientRect().bottom < safeTop + 20) {
          unreadAnchorRef.current += 1;
        } else {
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollKey, visibleCount]);

  // Persist how many messages have been revealed so returning keeps the friend's place.
  useEffect(() => {
    if (visibleCount > 0) writeNumber(shownKey, visibleCount);
  }, [shownKey, visibleCount]);

  // Each paragraph arrives after a short typing indicator (three dots).
  const advanceOne = useCallback(() => {
    setShown((prev) => {
      const base = Math.max(prev, floorShown);
      if (base >= items.length) return items.length;
      unreadAnchorRef.current = base;
      return includeTrailingInstants(items, base + 1);
    });
  }, [floorShown, items]);

  useEffect(() => {
    if (!typing) return;
    const id = window.setTimeout(() => {
      setShown((prev) => {
        const base = Math.max(prev, floorShown);
        if (base >= items.length) return items.length;
        return includeTrailingInstants(items, base + 1);
      });
    }, 650);
    return () => window.clearTimeout(id);
  }, [typing, visibleCount, floorShown, items]);

  // Scroll only far enough to show the top of the new message, and never scroll past text the friend has not read.
  useEffect(() => {
    const prev = prevShownRef.current;
    prevShownRef.current = visibleCount;
    if (prev <= 0 || visibleCount <= prev) return;
    const newEl = itemRefs.current[prev] ?? itemRefs.current[visibleCount - 1];
    if (!newEl) return;
    const rect = newEl.getBoundingClientRect();
    // Do not yank the screen if the friend has scrolled far up to re-read an earlier passage.
    if (rect.top > window.innerHeight + 180) return;
    const safeTop = 104;
    const unreadEl = itemRefs.current[Math.min(unreadAnchorRef.current, prev)] ?? newEl;
    const unreadRect = unreadEl.getBoundingClientRect();
    const neededForTop = rect.top + Math.min(rect.height, 72) - (window.innerHeight - 24);
    const maxWithoutCuttingUnread = Math.max(0, unreadRect.top - safeTop);
    const delta = Math.min(neededForTop, maxWithoutCuttingUnread);
    if (delta > 4) {
      window.scrollBy({ top: delta, behavior: 'smooth' });
    }
  }, [visibleCount]);

  useEffect(() => {
    if (reachedSummary && !typing && !finished) onFinish();
  }, [reachedSummary, typing, finished, onFinish]);

  const onTapThread = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!typing) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, input, textarea, select, a, [role="button"]')) return;
    advanceOne();
  };

  return (
    <div className="space-y-3" data-day-thread onClick={onTapThread}>
      {header}
      {roadSoFar}
      <div>
        <p className={note}>{title}</p>
        <h2 className={`${heading} text-[19px]`}>{chapterHeading}</h2>
      </div>
      <div className="space-y-3">
        {items.slice(0, visibleCount).map((it, idx) => (
          <div
            key={it.key}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            data-story-item={idx}
            className="scroll-mt-28"
          >
            {it.node}
          </div>
        ))}
        {typing && (
          <button
            type="button"
            onClick={advanceOne}
            aria-label="MYTHIOS is typing — tap to show now"
            data-typing-indicator
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1E1232] border border-[#3A2555] px-3.5 py-2 text-[#B7A9CC]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4B876] animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4B876] animate-pulse [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4B876] animate-pulse [animation-delay:300ms]" />
          </button>
        )}
      </div>
      <ErrorLine text={error} />
      {/* After the day: the last light, then the fire (the Campfire opens once the day is done, v2.3 §D). */}
      {/* After the day: one button to the fire (Piece C4: "One button to the fire: 'One more look' or 'Sit by the fire'"). */}
      {/* In the unified game shell, the fire thread follows below the day directly with "One more look" or "Sit by the fire". */}
      {reachedSummary && !typing && !embedded && (
        <button
          className="w-full min-h-[52px] rounded-2xl bg-[#F0A552] hover:bg-[#F2B36B] text-[#1A0F26] font-['Cinzel'] font-bold text-[15px] tracking-wide transition active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg"
          onClick={onOpenFire}
          data-button-to-fire
        >
          SIT BY THE FIRE →
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
  return <p className="text-[16px] text-[#B7A9CC]">{line ?? 'Tonight: the Gathering.'}</p>;
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
            <p className="font-sans text-[12px] text-[#8B7A9E]">
              {r.day === 7 ? `Week ${r.week} · The Gathering` : `Week ${r.week} · Day ${r.day}`}
            </p>
          )}
          <NarrationBlock text={fill(r.recap)} />
        </div>
      ))}
      {!!missed && missed > 0 && (
        <p className="font-sans text-[16px] text-[#B7A9CC] px-1">
          You missed {missed < DAY_COUNT_WORDS.length ? DAY_COUNT_WORDS[missed] : `${missed} days`}. The story went on. Today is still yours.
        </p>
      )}
    </div>
  );
}
