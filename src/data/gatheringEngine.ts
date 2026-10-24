// The Gathering Battle and United Effort, as written in Core Rules §4, §5 and §12.
// Pure functions with no React, so the rules can be run and checked on their own.

export type Rng = () => number;
export const d20 = (rng: Rng = Math.random) => Math.floor(rng() * 20) + 1;

// ---------------------------------------------------------------------------
// The Battle (Core Rules §4 "The Gathering Battle", §12 "The Battle conditions")
// ---------------------------------------------------------------------------

export type FoeKind = 'plain' | 'faithful' | 'hollow';

export interface BattleFighter {
  id: string;
  name: string;
  weapon: number;
  armor: number;
  hp: number;
  fallen: boolean;
  /** Combat Relic: +1 Weapon and +1 Armor from the round after it is used or given. */
  relicFrom: string | null;
  relicPending: string | null;
  /** Week 4 knee-deep: a strike roll of 1–3 loses this fighter's next strike. */
  loseNextStrike: boolean;
  /** Week 3 blade and torch: 2 more HP lost at the start of the next round. */
  burnNextRound: boolean;
  /** Help-call goes out once per friend per Battle. */
  helpCalled: boolean;
}

export interface BattleFoe {
  ownerId: string;
  name: string;
  kind: FoeKind;
  def: number;
  atk: number;
  hp: number;
  risen: boolean;
  loseNextStrike: boolean;
}

export interface BattleStrikeLine {
  attacker: string;
  target: string;
  side: 'party' | 'enemy';
  /** Shown when the strike is lost to the flood or to rising (no roll made). */
  lost?: 'knee-deep' | 'risen';
  roll?: number;
  attack?: number;
  defence?: number;
  margin?: number;
  hit?: boolean;
  damage?: number;
  hpBefore?: number;
  hpAfter?: number;
  note?: string;
}

export interface BattleRoundLog {
  round: number;
  /** One block per friend's fight, in party order. */
  fights: { ownerId: string; lines: BattleStrikeLine[] }[];
  /** Friends whose HP first fell below 50 this round, lowest HP first. */
  helpCalls: { id: string; hp: number }[];
}

export interface BattleState {
  week: number;
  round: number;
  partyStrikesFirst: boolean;
  fighters: BattleFighter[];
  foes: BattleFoe[];
  log: BattleRoundLog[];
  outcome: 'ongoing' | 'won' | 'lost';
}

export interface BattleSetupFriend {
  id: string;
  name: string;
  weapon: number;
  armor: number;
}

export function foeKindFor(week: number, index: number): FoeKind {
  if (week === 6) return index % 2 === 0 ? 'faithful' : 'hollow';
  return 'plain';
}

export function startBattle(
  week: number,
  friends: BattleSetupFriend[],
  enemy: { name: string; def: number; atk: number },
  partyStrikesFirst: boolean
): BattleState {
  return {
    week,
    round: 0,
    partyStrikesFirst,
    fighters: friends.map((f) => ({
      ...f,
      hp: 100,
      fallen: false,
      relicFrom: null,
      relicPending: null,
      loseNextStrike: false,
      burnNextRound: false,
      helpCalled: false,
    })),
    foes: friends.map((f, i) => {
      const kind = foeKindFor(week, i);
      const label = kind === 'faithful' ? ' (faithful)' : kind === 'hollow' ? ' (hollowed)' : '';
      return {
        ownerId: f.id,
        name: `${enemy.name}${label}`,
        kind,
        def: enemy.def,
        atk: enemy.atk,
        hp: 100,
        risen: false,
        loseNextStrike: false,
      };
    }),
    log: [],
    outcome: 'ongoing',
  };
}

const hasChant = (week: number, foe: BattleFoe) =>
  week === 2 || (week === 6 && foe.kind === 'faithful');
const hasHollowed = (week: number, foe: BattleFoe) =>
  week === 5 || (week === 6 && foe.kind === 'hollow');

/** Use or give a Combat Relic: it takes effect from the next round. One per fighter per fight. */
export function armCombatRelic(state: BattleState, fighterId: string, giverName: string): BattleState {
  return {
    ...state,
    fighters: state.fighters.map((f) =>
      f.id === fighterId && !f.relicFrom && !f.relicPending && !f.fallen
        ? { ...f, relicPending: giverName }
        : f
    ),
  };
}

export function canTakeCombatRelic(state: BattleState, fighterId: string): boolean {
  const f = state.fighters.find((x) => x.id === fighterId);
  return Boolean(f && !f.fallen && !f.relicFrom && !f.relicPending && state.outcome === 'ongoing');
}

/** Which fight a friend who has won joins: the friend with the lowest HP, or a fallen friend's enemy; ties go to the party list. */
export function reinforcementTarget(state: BattleState): string | null {
  let best: { id: string; need: number } | null = null;
  state.fighters.forEach((f) => {
    const foe = state.foes.find((x) => x.ownerId === f.id)!;
    if (foe.hp <= 0) return;
    const need = f.fallen ? 0 : f.hp;
    if (!best || need < best.need) best = { id: f.id, need };
  });
  return best ? (best as { id: string }).id : null;
}

function strike(
  state: BattleState,
  attacker: BattleFighter,
  foe: BattleFoe,
  rng: Rng,
  chantStanding: boolean,
  note?: string
): BattleStrikeLine {
  if (attacker.loseNextStrike) {
    attacker.loseNextStrike = false;
    return { attacker: attacker.name, target: foe.name, side: 'party', lost: 'knee-deep', note };
  }
  const roll = d20(rng);
  const weapon = attacker.weapon + (attacker.relicFrom ? 1 : 0);
  const def = foe.def + (hasChant(state.week, foe) && chantStanding ? 1 : 0);
  const margin = roll + weapon - def;
  const hit = margin >= 1;
  const hpBefore = foe.hp;
  let damage = 0;
  if (hit) {
    damage = margin * 5;
    foe.hp = Math.max(0, foe.hp - damage);
    if (foe.hp === 0 && hasHollowed(state.week, foe) && !foe.risen) {
      foe.risen = true;
      foe.hp = 2;
      foe.loseNextStrike = true;
    }
  }
  if (state.week === 4 && roll <= 3) attacker.loseNextStrike = true;
  return {
    attacker: attacker.name,
    target: foe.name,
    side: 'party',
    roll,
    attack: weapon,
    defence: def,
    margin,
    hit,
    damage,
    hpBefore,
    hpAfter: foe.hp,
    note,
  };
}

function foeStrike(state: BattleState, foe: BattleFoe, target: BattleFighter, rng: Rng): BattleStrikeLine {
  if (foe.loseNextStrike) {
    const lost = foe.risen && foe.hp === 2 ? 'risen' : 'knee-deep';
    foe.loseNextStrike = false;
    return { attacker: foe.name, target: target.name, side: 'enemy', lost };
  }
  const roll = d20(rng);
  const armor = target.armor + (target.relicFrom ? 1 : 0);
  const margin = roll + foe.atk - armor;
  const hit = margin >= 1;
  const hpBefore = target.hp;
  let damage = 0;
  if (hit) {
    damage = margin * 5;
    target.hp = Math.max(0, target.hp - damage);
    if (target.hp === 0) target.fallen = true;
    if (state.week === 3) target.burnNextRound = true;
  }
  if (state.week === 4 && roll <= 3) foe.loseNextStrike = true;
  return {
    attacker: foe.name,
    target: target.name,
    side: 'enemy',
    roll,
    attack: foe.atk,
    defence: armor,
    margin,
    hit,
    damage,
    hpBefore,
    hpAfter: target.hp,
  };
}

/** Play one round of every fight at once (lockstep). */
export function playBattleRound(prev: BattleState, rng: Rng = Math.random): BattleState {
  if (prev.outcome !== 'ongoing') return prev;
  const state: BattleState = {
    ...prev,
    round: prev.round + 1,
    fighters: prev.fighters.map((f) => ({ ...f })),
    foes: prev.foes.map((f) => ({ ...f })),
  };
  const byId = (id: string) => state.fighters.find((f) => f.id === id)!;
  const fights = state.fighters.map((f) => ({ ownerId: f.id, lines: [] as BattleStrikeLine[] }));
  const linesFor = (ownerId: string) => fights.find((x) => x.ownerId === ownerId)!.lines;

  // Start of the round: Relics armed last round take effect; the torch burn lands.
  state.fighters.forEach((f) => {
    if (f.relicPending) {
      f.relicFrom = f.relicPending;
      f.relicPending = null;
    }
    if (f.burnNextRound) {
      f.burnNextRound = false;
      if (!f.fallen) {
        const before = f.hp;
        f.hp = Math.max(0, f.hp - 2);
        if (f.hp === 0) f.fallen = true;
        linesFor(f.id).push({
          attacker: 'The burn',
          target: f.name,
          side: 'enemy',
          damage: 2,
          hpBefore: before,
          hpAfter: f.hp,
          note: 'Blade and torch: 2 more HP.',
        });
      }
    }
  });

  // The chant: DEF +1 while more than half of the enemies are standing (judged at the round's start).
  const standing = state.foes.filter((f) => f.hp > 0).length;
  const chantStanding = standing > state.foes.length / 2;

  // Friends who had already won before this round fight beside another friend.
  const reinforcers = state.fighters.filter(
    (f) => !f.fallen && state.foes.find((x) => x.ownerId === f.id)!.hp <= 0
  );

  const partyPhase = () => {
    state.fighters.forEach((f) => {
      const foe = state.foes.find((x) => x.ownerId === f.id)!;
      if (f.fallen || foe.hp <= 0) return;
      linesFor(f.id).push(strike(state, f, foe, rng, chantStanding));
    });
    // Each joins the fight that most needs it at that moment, so no strike is wasted on a fallen enemy.
    reinforcers.forEach((helper) => {
      const ownerId = reinforcementTarget(state);
      if (!ownerId) return;
      const foe = state.foes.find((x) => x.ownerId === ownerId)!;
      linesFor(ownerId).push(
        strike(state, helper, foe, rng, chantStanding, `${helper.name} fights beside ${byId(ownerId).name}.`)
      );
    });
  };
  const enemyPhase = () => {
    state.foes.forEach((foe) => {
      const owner = byId(foe.ownerId);
      // A fallen friend's enemy stops attacking; reinforcers cannot be hurt.
      if (foe.hp <= 0 || owner.fallen) return;
      linesFor(owner.id).push(foeStrike(state, foe, owner, rng));
    });
  };

  if (state.partyStrikesFirst) {
    partyPhase();
    enemyPhase();
  } else {
    enemyPhase();
    partyPhase();
  }

  // Help-calls: once per friend, the round their HP first falls below 50.
  const helpCalls = state.fighters
    .filter((f) => !f.fallen && f.hp < 50 && !f.helpCalled)
    .sort((a, b) => a.hp - b.hp)
    .map((f) => {
      f.helpCalled = true;
      return { id: f.id, hp: f.hp };
    });

  if (state.foes.every((f) => f.hp <= 0)) state.outcome = 'won';
  else if (state.fighters.every((f) => f.fallen)) state.outcome = 'lost';

  state.log = [...prev.log, { round: state.round, fights, helpCalls }];
  return state;
}

// ---------------------------------------------------------------------------
// The United Effort (Core Rules §5, mythios-united-effort-stories.md)
// ---------------------------------------------------------------------------

export interface UnitedEffortRoll {
  rollerId: string;
  rollerName: string;
  roll: number;
  score: number;
  tierBonus: number;
  relicBonus: number;
  dc: number;
  margin: number;
  success: boolean;
  damageRoll: number;
  damage: number;
  bar: 'way' | 'risk';
  barBefore: number;
  barAfter: number;
}

export interface UnitedEffortState {
  start: number;
  way: number;
  risk: number;
  /** Friends who have rolled since everyone last had a turn. */
  goneThisCircuit: string[];
  rolls: UnitedEffortRoll[];
  outcome: 'ongoing' | 'won' | 'lost';
}

/** Both things start at 100, plus 20 for every friend past four (24 Oct, so in a party of five or six everyone gets a
 *  roll); 60 for a friend alone. */
export function startUnitedEffort(partySize: number): UnitedEffortState {
  const start = partySize <= 1 ? 60 : 100 + 20 * Math.max(0, partySize - 4);
  return { start, way: start, risk: start, goneThisCircuit: [], rolls: [], outcome: 'ongoing' };
}

/** Friends who may roll next: nobody twice until everyone has gone once. */
export function unitedEffortEligible(state: UnitedEffortState, partyIds: string[]): string[] {
  const left = partyIds.filter((id) => !state.goneThisCircuit.includes(id));
  return left.length > 0 ? left : partyIds;
}

export function rollUnitedEffortTurn(
  prev: UnitedEffortState,
  roller: { id: string; name: string; score: number; tierBonus: number },
  dc: number,
  relicBonus: number,
  partyIds: string[],
  rng: Rng = Math.random
): UnitedEffortState {
  if (prev.outcome !== 'ongoing') return prev;
  const roll = d20(rng);
  const margin = roll + roller.tierBonus + relicBonus - dc;
  const success = margin >= 1;
  const damageRoll = d20(rng);
  const damage = 10 + damageRoll;
  const bar = success ? 'way' : 'risk';
  const barBefore = success ? prev.way : prev.risk;
  const barAfter = Math.max(0, barBefore - damage);
  const way = success ? barAfter : prev.way;
  const risk = success ? prev.risk : barAfter;
  const circuit = prev.goneThisCircuit.length >= partyIds.length ? [] : prev.goneThisCircuit;
  const goneThisCircuit = [...circuit, roller.id];
  return {
    ...prev,
    way,
    risk,
    goneThisCircuit: goneThisCircuit.length >= partyIds.length ? [] : goneThisCircuit,
    rolls: [
      ...prev.rolls,
      {
        rollerId: roller.id,
        rollerName: roller.name,
        roll,
        score: roller.score,
        tierBonus: roller.tierBonus,
        relicBonus,
        dc,
        margin,
        success,
        damageRoll,
        damage,
        bar,
        barBefore,
        barAfter,
      },
    ],
    outcome: way <= 0 ? 'won' : risk <= 0 ? 'lost' : 'ongoing',
  };
}

/** Story band by where the damaged thing now stands: 0, the last third, the middle third, or above two-thirds. */
export function unitedEffortBand(value: number, start: number): 0 | 1 | 2 | 3 {
  if (value <= 0) return 0;
  if (value <= start / 3) return 1;
  if (value <= (start * 2) / 3) return 2;
  return 3;
}
