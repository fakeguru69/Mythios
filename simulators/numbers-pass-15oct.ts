// Numbers pass, 15 Oct 2026. Run: npx tsx simulators/numbers-pass-15oct.ts [seasons]
// Uses the game's own data and rules: the 36 canon days (chapterScripts.ts), the Gathering engine
// (gatheringEngine.ts), tiers, growth and DCs (mythiosRulesData.ts), gold (economy.ts).
// Re-checks Core Rules §12's "What these numbers produce" under the 14 Oct damage rule (margin × 5).

import { CHAPTER_SCRIPTS } from '../src/data/chapterScripts';
import { GATHERING_SCRIPTS } from '../src/data/gatheringScripts';
import { WEEKDAY_INVENTORY } from '../src/data/mythiosChaptersData';
import {
  AttributeName,
  CLASS_META,
  ClassName,
  EPISODE_NUMBERS,
  GEAR_TABLE,
  WEEKDAY_DC_BY_WEEK,
  calculateAttributeGrowth,
  getTierInfo,
  resolveChallengeRoll,
} from '../src/data/mythiosRulesData';
import {
  playBattleRound,
  rollUnitedEffortTurn,
  startBattle,
  startUnitedEffort,
  unitedEffortEligible,
} from '../src/data/gatheringEngine';
import * as E from '../src/data/economy';

const ATTRS: AttributeName[] = ['Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim'];
const CLASSES: ClassName[] = ['Warrior', 'Artificer', 'Sage', 'Trickster', 'Assassin', 'Archer'];

// A seeded generator, so a run can be repeated.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const d20 = (rng: () => number) => Math.floor(rng() * 20) + 1;

// ---------------------------------------------------------------------------
// 1. A weekday fight, worked out exactly (Core Rules §4 as the app plays it: the first
//    striker strikes first every round; damage = margin × 5; a fighter at 0 does not strike back).
// ---------------------------------------------------------------------------
function exactFight(weapon: number, def: number, atk: number, armor: number, playerFirst: boolean, damage: 'margin5' | 'd20x2' = 'margin5') {
  const dist = (bonus: number) => {
    const out: [number, number][] = []; // [damage, prob]
    let miss = 0;
    for (let r = 1; r <= 20; r++) {
      const m = r + bonus;
      if (m < 1) miss += 1 / 20;
      else if (damage === 'margin5') out.push([m * 5, 1 / 20]);
      else for (let k = 1; k <= 20; k++) out.push([k * 2, 1 / 400]);
    }
    if (miss) out.push([0, miss]);
    // Merge equal damage values.
    const merged = new Map<number, number>();
    out.forEach(([d, pr]) => merged.set(d, (merged.get(d) || 0) + pr));
    return Array.from(merged.entries());
  };
  const pDmg = dist(weapon - def);
  const eDmg = dist(atk - armor);
  // win[p][e]: chance the player wins from HP p, e (in 5s), at the start of a round. Expected rounds too.
  const memo = new Map<string, [number, number]>();
  const solve = (p: number, e: number): [number, number] => {
    if (e <= 0) return [1, 0];
    if (p <= 0) return [0, 0];
    const key = `${p},${e}`;
    const hit = memo.get(key);
    if (hit) return hit;
    // A round where nobody lands anything repeats the same state: solve the self-loop.
    let stay = 0;
    let win = 0;
    let rounds = 0;
    for (const [a, pa] of playerFirst ? pDmg : eDmg) {
      for (const [b, pb] of playerFirst ? eDmg : pDmg) {
        const prob = pa * pb;
        let np = p;
        let ne = e;
        if (playerFirst) {
          ne = Math.max(0, e - a);
          if (ne > 0) np = Math.max(0, p - b);
        } else {
          np = Math.max(0, p - a);
          if (np > 0) ne = Math.max(0, e - b);
        }
        if (np === p && ne === e) {
          stay += prob;
          continue;
        }
        const [w, r] = solve(np, ne);
        win += prob * w;
        rounds += prob * r;
      }
    }
    const res: [number, number] = [win / (1 - stay), (1 + rounds) / (1 - stay)];
    memo.set(key, res);
    return res;
  };
  return solve(100, 100);
}

// ---------------------------------------------------------------------------
// 2. The season, for one party of friends who all play the same way.
// ---------------------------------------------------------------------------
type PlayerKind = { name: string; daysPerWeek: number };
const KINDS: PlayerKind[] = [
  { name: 'Daily', daysPerWeek: 6 },
  { name: 'Regular', daysPerWeek: 4 },
  { name: 'Occasional', daysPerWeek: 2 },
  { name: 'Rare', daysPerWeek: 1 },
];

interface Opts {
  failCost: number; // §12: 150. §15 item 1 asks about 0.
  mapBonus: number; // §15 item 7: +2 on the Approach when all six words are solved.
  wordGold: number; // 25g a lock word, one word a day played.
  damage: 'margin5' | 'd20x2';
  weekdayBoost?: number; // added to the weekday enemy's DEF and ATK (a proposal to test)
  gatheringBoost?: number; // added to the Gathering enemy's DEF and ATK
}

interface Player {
  cls: ClassName;
  attrs: Record<AttributeName, number>;
  weapon: number;
  armor: number;
  gold: number;
  earned: number;
  approaches: number;
  stats: {
    firstRolls: number[][]; // by week: [tries, passes]
    weekdayFights: number[]; // [fought, won]
    ownBattle: number[]; // [fought, own foe down with own fighter standing]
  };
}

function newPlayer(cls: ClassName, rng: () => number): Player {
  const attrs = Object.fromEntries(ATTRS.map((a) => [a, 10])) as Record<AttributeName, number>;
  const main = CLASS_META[cls].attribute;
  attrs[main] = 14;
  const others = ATTRS.filter((a) => a !== main);
  attrs[others[Math.floor(rng() * others.length)]] = 12;
  return {
    cls,
    attrs,
    weapon: 1,
    armor: 1,
    gold: 0,
    earned: 0,
    approaches: 0,
    stats: { firstRolls: [0, 1, 2, 3, 4, 5, 6].map(() => [0, 0]), weekdayFights: [0, 0], ownBattle: [0, 0] },
  };
}

const earn = (p: Player, g: number) => {
  if (g > 0) p.earned += g;
  p.gold = Math.max(0, p.gold + g);
};

// Gear: buy the cheaper next step whenever it is affordable (weapon first on a tie).
function shop(p: Player) {
  for (;;) {
    const wc = p.weapon < 5 ? GEAR_TABLE[p.weapon + 1].cost : Infinity;
    const ac = p.armor < 5 ? GEAR_TABLE[p.armor + 1].cost : Infinity;
    const c = Math.min(wc, ac);
    if (c === Infinity || p.gold < c) return;
    p.gold -= c;
    if (wc <= ac) p.weapon++;
    else p.armor++;
  }
}

const best = (p: Player, options: AttributeName[]) =>
  options.reduce((a, b) => (getTierInfo(p.attrs[b]).bonus > getTierInfo(p.attrs[a]).bonus || (getTierInfo(p.attrs[b]).bonus === getTierInfo(p.attrs[a]).bonus && p.attrs[b] > p.attrs[a]) ? b : a));

function weekdayFight(p: Player, week: number, playerFirst: boolean, rng: () => number, o: Opts) {
  const ep = EPISODE_NUMBERS[week - 1];
  const W = GEAR_TABLE[p.weapon].weapon;
  const A = GEAR_TABLE[p.armor].armor;
  let ph = 100;
  let eh = 100;
  const dmg = (m: number) => (o.damage === 'margin5' ? m * 5 : d20(rng) * 2);
  while (ph > 0 && eh > 0) {
    const ps = () => {
      const m = d20(rng) + W - ep.wDef - (o.weekdayBoost || 0);
      if (m >= 1) eh = Math.max(0, eh - dmg(m));
    };
    const es = () => {
      const m = d20(rng) + ep.wAtk + (o.weekdayBoost || 0) - A;
      if (m >= 1) ph = Math.max(0, ph - dmg(m));
    };
    if (playerFirst) {
      ps();
      if (eh > 0) es();
    } else {
      es();
      if (ph > 0) ps();
    }
  }
  return eh <= 0;
}

function playDay(p: Player, week: number, day: number, nth: number, g5ueLost: boolean, rng: () => number, o: Opts) {
  const script = CHAPTER_SCRIPTS.find((c) => c.week === week && c.day === day)!;
  const ch = script.steps.find((s) => s.t === 'challenge') as Extract<(typeof script.steps)[number], { t: 'challenge' }> | undefined;
  const press = script.steps.find((s) => s.t === 'press') as Extract<(typeof script.steps)[number], { t: 'press' }> | undefined;
  const fight = script.steps.find((s) => s.t === 'fight') as Extract<(typeof script.steps)[number], { t: 'fight' }> | undefined;
  let passed: boolean | null = null;
  if (ch) {
    const attr = best(p, ch.options.map((x) => x.attr));
    const score = p.attrs[attr];
    const tier = getTierInfo(score).bonus;
    const dc = WEEKDAY_DC_BY_WEEK[week] + (ch.harderIf && g5ueLost ? ch.harderIf.by : 0);
    const roll = d20(rng);
    passed = resolveChallengeRoll(roll, tier, dc).success;
    p.stats.firstRolls[week][0]++;
    if (passed) {
      p.stats.firstRolls[week][1]++;
      earn(p, E.GOLD_CHALLENGE_WIN);
      p.attrs[attr] += calculateAttributeGrowth(score, nth, roll, tier, dc);
      if (press) {
        const pr = d20(rng);
        if (resolveChallengeRoll(pr, getTierInfo(p.attrs[attr]).bonus, dc + press.harder).success) earn(p, E.GOLD_PRESS_ON_WIN);
      }
    } else {
      earn(p, -o.failCost);
    }
  }
  if (fight) {
    const rule = fight.strikeFirst;
    const playerFirst =
      rule.on === 'player' ? true : rule.on === 'challenge' ? !!passed : rng() < rule.options.length / ((script.steps.find((s) => s.t === 'choice' && s.id === rule.choice) as { labels: string[] } | undefined)?.labels.length || 2);
    const won = weekdayFight(p, week, playerFirst, rng, o);
    p.stats.weekdayFights[0]++;
    if (won) {
      p.stats.weekdayFights[1]++;
      earn(p, WEEKDAY_INVENTORY.find((d) => d.week === week && d.day === day)!.fightReward);
    }
  }
  earn(p, o.wordGold); // one lock word a day played
  shop(p);
}

function gathering(party: Player[], week: number, rng: () => number, o: Opts) {
  const ep = EPISODE_NUMBERS[week - 1];
  const script = GATHERING_SCRIPTS.find((g) => g.week === week)!;
  // The Approach: whoever has rolled fewest; best Attribute of the two ways.
  const ap = script.steps.find((s) => s.t === 'approach') as { ways: { attr: AttributeName }[] } | undefined;
  let partyFirst = true;
  if (ap) {
    const roller = [...party].sort((a, b) => a.approaches - b.approaches)[0];
    roller.approaches++;
    const attr = best(roller, ap.ways.map((w) => w.attr));
    const score = roller.attrs[attr];
    const tier = getTierInfo(score).bonus;
    const roll = d20(rng);
    const ok = resolveChallengeRoll(roll, tier + o.mapBonus, ep.gatheringDC).success;
    partyFirst = ok;
    if (ok) {
      earn(roller, E.GOLD_CHALLENGE_WIN);
      roller.attrs[attr] += calculateAttributeGrowth(score, 7, roll, tier, ep.gatheringDC);
    } else earn(roller, -o.failCost);
  }
  // The Battle, through the game's own engine.
  let b = startBattle(
    week,
    party.map((p, i) => ({ id: `p${i}`, name: `p${i}`, weapon: GEAR_TABLE[p.weapon].weapon, armor: GEAR_TABLE[p.armor].armor })),
    { name: 'foe', def: ep.gDef + (o.gatheringBoost || 0), atk: ep.gAtk + (o.gatheringBoost || 0) },
    partyFirst
  );
  let guard = 0;
  while (b.outcome === 'ongoing' && guard++ < 200) b = playBattleRound(b, rng);
  party.forEach((p, i) => {
    p.stats.ownBattle[0]++;
    if (!b.fighters[i].fallen) p.stats.ownBattle[1]++;
  });
  if (b.outcome === 'won') party.forEach((p) => earn(p, E.GOLD_GATHERING_BATTLE_REWARDS[week]));
  // The United Effort: turns in party order, the night's Attribute, the weekday DC.
  let ue = startUnitedEffort(party.length);
  const ids = party.map((_, i) => `p${i}`);
  while (ue.outcome === 'ongoing') {
    const id = unitedEffortEligible(ue, ids)[0];
    const p = party[+id.slice(1)];
    const score = p.attrs[ep.ueAttr as AttributeName];
    ue = rollUnitedEffortTurn(ue, { id, name: id, score, tierBonus: getTierInfo(score).bonus }, ep.ueDC, 0, ids, rng);
  }
  if (ue.outcome === 'won') party.forEach((p) => earn(p, E.GOLD_UNITED_EFFORT_WIN));
  // Match: every right pick (assumed right); [LOOK CLOSER]: each friend rolls their best Attribute.
  const matches = script.steps.filter((s) => s.t === 'match').length;
  party.forEach((p) => earn(p, matches * E.GOLD_MATCH_BASE_PER_PICK));
  if (script.steps.some((s) => s.t === 'lookCloser')) {
    party.forEach((p) => {
      const a = best(p, ATTRS);
      if (resolveChallengeRoll(d20(rng), getTierInfo(p.attrs[a]).bonus, ep.gatheringDC).success) earn(p, E.GOLD_LOOK_CLOSER_WIN);
    });
  }
  party.forEach(shop);
  return { ueLost: ue.outcome === 'lost', battleWon: b.outcome === 'won' };
}

function season(kind: PlayerKind, size: number, rng: () => number, o: Opts) {
  const party = Array.from({ length: size }, (_, i) => newPlayer(CLASSES[Math.floor(rng() * 6)], rng));
  let g5ueLost = false;
  const battles: boolean[] = [];
  for (let week = 1; week <= 6; week++) {
    party.forEach((p) => {
      // Which days this friend plays: a random set of the right size (Day 1 of Week 1 always, the tutorial).
      const days = [1, 2, 3, 4, 5, 6].sort(() => rng() - 0.5).slice(0, kind.daysPerWeek).sort((a, b) => a - b);
      if (week === 1 && !days.includes(1)) days[0] = 1, days.sort((a, b) => a - b);
      days.forEach((day, i) => playDay(p, week, day, i + 1, g5ueLost, rng, o));
    });
    const g = gathering(party, week, rng, o);
    battles.push(g.battleWon);
    if (week === 5) g5ueLost = g.ueLost;
  }
  return { party, battles };
}

// ---------------------------------------------------------------------------
// Run and print.
// ---------------------------------------------------------------------------
const N = Number(process.argv[2] || 4000);
const pct = (x: number) => `${Math.round(x * 100)}%`;
const r100 = (x: number) => Math.round(x / 100) * 100;

console.log('## A single weekday fight (exact), both tracks at the same level; player first / enemy first; average rounds\n');
console.log('| Week | L1 | L2 | L3 | L4 | L5 |');
console.log('|---|---|---|---|---|---|');
for (let w = 1; w <= 6; w++) {
  const ep = EPISODE_NUMBERS[w - 1];
  const cells = [1, 2, 3, 4, 5].map((L) => {
    const [pw, pr] = exactFight(GEAR_TABLE[L].weapon, ep.wDef, ep.wAtk, GEAR_TABLE[L].armor, true);
    const [ew] = exactFight(GEAR_TABLE[L].weapon, ep.wDef, ep.wAtk, GEAR_TABLE[L].armor, false);
    return `${pct(pw)} / ${pct(ew)} · ${pr.toFixed(1)}r`;
  });
  console.log(`| ${w} | ${cells.join(' | ')} |`);
}

console.log('\n## The same fight under the 5 Oct rule (d20 × 2 damage), player first, to compare with Core Rules §12\n');
console.log('| Week | L1 | L2 | L3 | L4 | L5 |');
console.log('|---|---|---|---|---|---|');
for (let w = 1; w <= 6; w++) {
  const ep = EPISODE_NUMBERS[w - 1];
  const cells = [1, 2, 3, 4, 5].map((L) => {
    const [pw, pr] = exactFight(GEAR_TABLE[L].weapon, ep.wDef, ep.wAtk, GEAR_TABLE[L].armor, true, 'd20x2');
    return `${pct(pw)} · ${pr.toFixed(1)}r`;
  });
  console.log(`| ${w} | ${cells.join(' | ')} |`);
}

console.log('\n## A single Gathering fight (exact, no Battle condition), player first; average rounds\n');
console.log('| Week | L1 | L2 | L3 | L4 | L5 |');
console.log('|---|---|---|---|---|---|');
for (let w = 1; w <= 6; w++) {
  const ep = EPISODE_NUMBERS[w - 1];
  const cells = [1, 2, 3, 4, 5].map((L) => {
    const [pw, pr] = exactFight(GEAR_TABLE[L].weapon, ep.gDef, ep.gAtk, GEAR_TABLE[L].armor, true);
    return `${pct(pw)} · ${pr.toFixed(1)}r`;
  });
  console.log(`| ${w} | ${cells.join(' | ')} |`);
}

function table(label: string, o: Opts, size = 4) {
  console.log(`\n## Season, ${label} (party of ${size} alike, ${N} seasons each)\n`);
  console.log('| Player | Days a week | First-roll pass, by week | Weekday fights won | Own Gathering fight survived | Party wins the Battle | Gear at the end | Both tracks L5 | Gold earned | Gold left |');
  console.log('|---|---|---|---|---|---|---|---|---|---|');
  for (const kind of KINDS) {
    const rng = mulberry32(12345 + kind.daysPerWeek);
    const fr = [0, 1, 2, 3, 4, 5, 6].map(() => [0, 0]);
    let wf = [0, 0];
    let ob = [0, 0];
    let bw = 0;
    let gear = 0;
    let both5 = 0;
    let earned = 0;
    let left = 0;
    let n = 0;
    for (let s = 0; s < N; s++) {
      const { party, battles } = season(kind, size, rng, o);
      bw += battles.filter(Boolean).length / 6;
      party.forEach((p) => {
        n++;
        p.stats.firstRolls.forEach((x, i) => {
          fr[i][0] += x[0];
          fr[i][1] += x[1];
        });
        wf = [wf[0] + p.stats.weekdayFights[0], wf[1] + p.stats.weekdayFights[1]];
        ob = [ob[0] + p.stats.ownBattle[0], ob[1] + p.stats.ownBattle[1]];
        gear += (p.weapon + p.armor) / 2;
        if (p.weapon === 5 && p.armor === 5) both5++;
        earned += p.earned;
        left += p.gold;
      });
    }
    const byWeek = [1, 2, 3, 4, 5, 6].map((w) => (fr[w][0] ? Math.round((100 * fr[w][1]) / fr[w][0]) : '–')).join('/');
    console.log(
      `| ${kind.name} | ${kind.daysPerWeek} | ${byWeek} | ${pct(wf[1] / wf[0])} | ${pct(ob[1] / ob[0])} | ${pct(bw / N)} | ${(gear / n).toFixed(1)} | ${pct(both5 / n)} | ${r100(earned / n)} | ${r100(left / n)} |`
    );
  }
}

const BASE: Opts = { failCost: E.GOLD_CHALLENGE_LOSS, mapBonus: 2, wordGold: E.GOLD_FRAGMENT_WORD_SOLVED, damage: 'margin5' };
table('as built today (margin × 5, −150g fail, map +2, 25g a word a day)', BASE);
table('the 5 Oct rules for comparison (d20 × 2 damage, no word gold)', { ...BASE, damage: 'd20x2', wordGold: 0 });
table('§15 item 1: a failed Challenge costs nothing', { ...BASE, failCost: 0 });
table('no map bonus', { ...BASE, mapBonus: 0 });
table('weekday enemy +1 DEF and ATK', { ...BASE, weekdayBoost: 1 });
table('weekday enemy +2 DEF and ATK', { ...BASE, weekdayBoost: 2 });
table('weekday +1 and Gathering +1', { ...BASE, weekdayBoost: 1, gatheringBoost: 1 });
table('as built, party of 2', BASE, 2);
table('as built, party of 6', BASE, 6);
