// A weekday, played online (build steps 2 and 3). The chapter comes from the server on its day only, and every roll is
// the server's (Core Rules §12a). It plays the same canon steps as the demo's Story screen, with the demo's display pieces.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, plainError } from './supabaseClient';
import type { ChapterScript, ScriptCond, ScriptStep, StrikeFirstRule } from '../data/chapterScripts';
import {
  fillScriptTokens,
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
import { ErrorLine, heading, note, quietButton } from './ui';

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
}

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
}) {
  const [today, setToday] = useState<Today | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [chosenAttr, setChosenAttr] = useState<AttributeName | null>(null);
  // [USE] arms an Attribute Relic on the card; a second tap takes it back. It is spent only when the roll is made (§12a).
  const [armed, setArmed] = useState<AttributeName | null>(null);
  const [pressArmed, setPressArmed] = useState(false);
  const finishing = useRef(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    const { data, error: e } = await supabase.rpc('today', { p_party: partyId });
    if (e) setError(plainError(e.message));
    else setToday(data as Today);
  }, [partyId]);
  useEffect(() => {
    load();
  }, [load]);

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
        <button className={quietButton} onClick={onClose}>
          Back
        </button>
      </div>
    );
  }
  if (!today) return <p className="text-center text-[#B7A9CC]">…</p>;

  const { week, day, chapter, progress, mine } = today;
  const classAttr = (CLASSES.find((c) => c.name === myClass)?.attribute ?? 'Might') as AttributeName;
  const fill = (text: string) =>
    fillScriptTokens(text, { friends, partySize, stake: personalStakeLine(birthplace ?? undefined, grandparent ?? undefined) });

  const header = (
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
        <p className={`${heading} text-[17px]`}>Tonight: the Gathering.</p>
      </div>
    );
  }

  const steps = chapter.script.steps;
  const dc = chapter.meta.dc;
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
    if (c.on === 'claim') return c.has === false; // Gathering results come online later; none yet.
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
      nodes.push(<NarrationBlock key={key} text={fill(step.text)} pull={step.pull} />);
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
      const branchFor = (opt: number) => step.branches.find((b) => b.options.includes(opt));
      const shown = new Set<number>();
      picks.forEach((opt) => {
        nodes.push(<TapEcho key={`${key}-p${opt}`} label={fill(step.labels[opt])} />);
        const b = branchFor(opt);
        if (b && !shown.has(step.branches.indexOf(b))) {
          shown.add(step.branches.indexOf(b));
          nodes.push(<NarrationBlock key={`${key}-b${opt}`} text={fill(b.text)} />);
        }
      });
      if (picks.length > 0 && step.mode === 'auto') {
        step.branches.forEach((b, bi) => {
          if (!shown.has(bi)) {
            shown.add(bi);
            nodes.push(<NarrationBlock key={`${key}-a${bi}`} text={fill(b.text)} />);
          }
        });
      }
      const open = step.labels
        .map((_, oi) => oi)
        .filter((oi) => {
          if (picks.length === 0) return true;
          if (step.mode !== 'each') return false;
          const b = branchFor(oi);
          return Boolean(b) && !shown.has(step.branches.indexOf(b!));
        });
      if (open.length > 0) {
        nodes.push(
          <div key={`${key}-o`} className="space-y-1.5">
            {open.map((oi) => (
              <ScriptButton
                key={oi}
                label={fill(step.labels[oi])}
                disabled={busy}
                onClick={() => {
                  // A look that names one of the Challenge's two ways picks that way on the card (as in the demo).
                  const nx = steps[i + 1];
                  if (step.mode === 'flavor' && nx?.t === 'challenge' && nx.options.length === step.labels.length) {
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
                              {armed === o.attr ? 'USED' : 'USE'}
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
                      {pressArmed ? 'USED' : 'USE'}
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
            {rounds.map((r) => {
              const mineLine = r.playerStruck
                ? `You: 🎲 ${r.d20} + WEP ${r.playerAtk} − DEF ${r.enemyDef} = ${signed(r.margin)} · ${r.hit ? `hit, ${r.margin * 5} damage` : 'miss'}`
                : null;
              const theirLine = r.enemyStruck
                ? `Enemy: 🎲 ${r.enemyD20} + ATK ${r.enemyAtk} − ARM ${r.playerArmor} = ${signed(r.enemyMargin)} · ${
                    r.enemyHit ? `hit, ${r.enemyMargin * 5} damage` : 'miss'
                  }`
                : null;
              return (
                <div key={r.round} className="font-mono text-[12px] text-[#D9D1E6]">
                  <div className="text-[#8B7A9E]">Round {r.round}{r.relic ? ' · Combat Relic: +1 Weapon, +1 Armor' : ''}</div>
                  {(r.enemyFirst ? [theirLine, mineLine] : [mineLine, theirLine]).filter(Boolean).map((l, li) => (
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
            <p className={`font-['Cinzel'] font-bold text-[13px] ${fightWon ? 'text-[#6FD39A]' : 'text-[#F08A8A]'}`}>
              {fightWon ? `WON${fight?.gold ? ` · +${fight.gold}g` : ''}` : 'BRUISED SCRAPE'}
            </p>
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

  return (
    <DayBody
      header={header}
      title={`Week ${week} · Day ${day}`}
      heading={chapter.script.heading}
      nodes={nodes}
      error={error}
      reachedSummary={reachedSummary}
      finished={Boolean(mine.finished_at)}
      onFinish={async () => {
        // The day counts as played once read to its last line (Core Rules §12a).
        if (finishing.current) return;
        finishing.current = true;
        await call('finish_day', {});
      }}
      onClose={onClose}
      endRef={endRef}
    />
  );
}

function DayBody({
  header,
  title,
  heading: chapterHeading,
  nodes,
  error,
  reachedSummary,
  finished,
  onFinish,
  onClose,
  endRef,
}: {
  header: React.ReactNode;
  title: string;
  heading: string;
  nodes: React.ReactNode[];
  error: string | null;
  reachedSummary: boolean;
  finished: boolean;
  onFinish: () => void;
  onClose: () => void;
  endRef: React.RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    if (reachedSummary && !finished) onFinish();
  }, [reachedSummary, finished, onFinish]);
  return (
    <div className="space-y-3">
      {header}
      <div>
        <p className={note}>{title}</p>
        <h2 className={`${heading} text-[19px]`}>{chapterHeading}</h2>
      </div>
      <div className="space-y-3">{nodes}</div>
      <ErrorLine text={error} />
      {reachedSummary && (
        <button className={`w-full ${quietButton} py-2.5 font-[Cinzel] font-bold`} onClick={onClose}>
          BACK TO THE PARTY
        </button>
      )}
      <div ref={endRef} />
    </div>
  );
}
