/**
 * MYTHIOS ECONOMY CONSTANTS (Core Rules §12 & 8 Oct / 14 Oct Rules Pass)
 *
 * Single source of truth for all gold rewards and costs in the game.
 */

// --- TESTED CORE RULES §12 AMOUNTS (DO NOT CHANGE) ---

/** Daily Challenge pass reward (+500g) */
export const GOLD_CHALLENGE_WIN = 500;

/** Daily Challenge fail penalty (-150g, gold never below 0) */
export const GOLD_CHALLENGE_LOSS = 150;

/** Passed [PRESS ON] reward (+200g, no growth) */
export const GOLD_PRESS_ON_WIN = 200;

/** Weekday fight reward on a day with NO Challenge (+300g win, 0 loss) */
export const GOLD_WEEKDAY_FIGHT_ONLY_WIN = 300;

/** Weekday fight reward on a day that also has a Challenge (pays 0g) */
export const GOLD_WEEKDAY_FIGHT_WITH_CHALLENGE_WIN = 0;

/** Look Closer inspection reward (+75g) */
export const GOLD_LOOK_CLOSER_WIN = 75;

/** Scripture Match base reward: 50g per correct pick */
export const GOLD_MATCH_BASE_PER_PICK = 50;

/** Scripture Match full table reward: 100g per pick if every friend present is right */
export const GOLD_MATCH_PERFECT_PER_PICK = 100;

/** United Effort completion reward (+300g to every friend if job is done, 0 on failure) */
export const GOLD_UNITED_EFFORT_WIN = 300;

/** Seeker Fragment lock word solved (+25g per word) */
export const GOLD_FRAGMENT_WORD_SOLVED = 25;

/** Gathering Battle reward curve for Weeks 1 to 6 (380g, 520g, 740g, 740g, 1030g, 1030g) */
export const GOLD_GATHERING_BATTLE_REWARDS: Record<number, number> = {
  1: 380,
  2: 520,
  3: 740,
  4: 740,
  5: 1030,
  6: 1030,
};

/** Relic purchase cost in Store (150g) */
export const GOLD_RELIC_COST = 150;

// --- PENDING NUMBERS PASS (Core Rules §15 / 8 Oct) ---

/** Fan Out solo roadside cache (+150g) - PENDING numbers pass */
export const GOLD_FAN_OUT_CACHE_WIN = 150;

/** Detour fight on failed Challenge (+150g win) - PENDING numbers pass */
export const GOLD_DETOUR_FIGHT_WIN = 150;

/** Detour fight on failed Challenge (-75g loss / cost) - PENDING numbers pass */
export const GOLD_DETOUR_FIGHT_LOSS = 75;

/** Daily Campfire riddle solve (+10g) - PENDING numbers pass */
export const GOLD_RIDDLE_SOLVE = 10;

/** Bonus riddle reward (+15g) - PENDING numbers pass */
export const GOLD_RIDDLE_BONUS = 15;

/** Hidden roadside cache (+25g) - PENDING numbers pass */
export const GOLD_HIDDEN_CACHE_REWARD = 25;

/** W6D3 stat bonus +1 (+1 Agility / +1 Charm) - PENDING numbers pass */
export const STAT_BONUS_W6D3 = 1;
