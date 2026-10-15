export type AttributeName = 'Might' | 'Craft' | 'Intellect' | 'Charm' | 'Agility' | 'Aim';
export type ClassName = 'Warrior' | 'Artificer' | 'Sage' | 'Trickster' | 'Assassin' | 'Archer';

export const ATTRIBUTE_META: Record<AttributeName, { color: string; bgTint: string; class: ClassName; desc: string }> = {
  Charm: { color: '#EE8BC3', bgTint: '#EE8BC326', class: 'Trickster', desc: 'Persuasion, influence' },
  Agility: { color: '#38BDF8', bgTint: '#38BDF826', class: 'Assassin', desc: 'Speed, stealth' },
  Intellect: { color: '#818CF8', bgTint: '#818CF826', class: 'Sage', desc: 'Fast, deep thinking' },
  Might: { color: '#F59E42', bgTint: '#F59E4226', class: 'Warrior', desc: 'Overpowering force' },
  Craft: { color: '#C084FC', bgTint: '#C084FC26', class: 'Artificer', desc: 'Tools and machines' },
  Aim: { color: '#2DD4BF', bgTint: '#2DD4BF26', class: 'Archer', desc: 'Precision' },
};

export const CLASS_META: Record<ClassName, { attribute: AttributeName; tagline: string; weapon: string; armor: string }> = {
  Warrior: { attribute: 'Might', tagline: 'When a door won\'t open, you are the reason it does.', weapon: 'Longsword', armor: 'Mail Coat' },
  Artificer: { attribute: 'Craft', tagline: 'You know how things are put together, and so how they come apart.', weapon: 'Spring-Hammer', armor: 'Riveted Apron' },
  Sage: { attribute: 'Intellect', tagline: 'You notice what the room is not saying.', weapon: 'Ash Staff', armor: 'Warded Cloak' },
  Trickster: { attribute: 'Charm', tagline: 'People tell you things. They are not always sure why.', weapon: 'Sword-Cane', armor: 'Leather Ward' },
  Assassin: { attribute: 'Agility', tagline: 'You are already where they weren\'t looking.', weapon: 'Paired Knives', armor: 'Shadow Leathers' },
  Archer: { attribute: 'Aim', tagline: 'You see the one thing that matters, from a long way off.', weapon: 'Yew Bow', armor: 'Hunter\'s Jack' },
};

// Core Rules §12 Tables
export const EPISODE_NUMBERS = [
  { week: 1, title: 'The List', weekdayDC: 6, gatheringDC: 8, trialDC: 10, ueDC: 6, ueAttr: 'Might' as AttributeName, gDef: 22, gAtk: 15, gReward: 380, wDef: 21, wAtk: 14, battleCondition: 'None (plain first Battle)' },
  { week: 2, title: 'The Wind Stone', weekdayDC: 7, gatheringDC: 9, trialDC: 11, ueDC: 7, ueAttr: 'Intellect' as AttributeName, gDef: 23, gAtk: 16, gReward: 520, wDef: 22, wAtk: 15, battleCondition: 'The chant: DEF +1 while >50% enemies stand' },
  { week: 3, title: 'The Fire Stone', weekdayDC: 7, gatheringDC: 9, trialDC: 11, ueDC: 7, ueAttr: 'Agility' as AttributeName, gDef: 24, gAtk: 17, gReward: 740, wDef: 23, wAtk: 16, battleCondition: 'Blade and torch: hit deals 2 more HP start of next round' },
  { week: 4, title: 'The Water Stone', weekdayDC: 8, gatheringDC: 10, trialDC: 12, ueDC: 8, ueAttr: 'Craft' as AttributeName, gDef: 24, gAtk: 17, gReward: 740, wDef: 23, wAtk: 16, battleCondition: 'Knee-deep: roll 1–3 on strike loses next strike (both sides)' },
  { week: 5, title: 'The King\'s Stone', weekdayDC: 9, gatheringDC: 11, trialDC: 13, ueDC: 9, ueAttr: 'Charm' as AttributeName, gDef: 25, gAtk: 18, gReward: 1030, wDef: 24, wAtk: 17, battleCondition: 'The hollowed: rises once at 2 HP and skips next strike' },
  { week: 6, title: 'The Finale', weekdayDC: 9, gatheringDC: 11, trialDC: 13, ueDC: 9, ueAttr: 'Aim' as AttributeName, gDef: 25, gAtk: 18, gReward: 1030, wDef: 24, wAtk: 17, battleCondition: 'Half faithful (chant), half hollowed (rises once at 2 HP)' },
];

export const GEAR_TABLE: Record<number, { weapon: number; armor: number; cost: number }> = {
  1: { weapon: 14, armor: 27, cost: 0 },
  2: { weapon: 15, armor: 28, cost: 950 },
  3: { weapon: 16, armor: 29, cost: 1100 },
  4: { weapon: 17, armor: 30, cost: 1750 },
  5: { weapon: 18, armor: 31, cost: 2400 },
};

export interface PartyFriend {
  id: string;
  name: string;
  cls: ClassName;
  attr: AttributeName;
  color: string;
}

export const DEFAULT_PARTY_MEMBERS: PartyFriend[] = [
  { id: 'YOU', name: 'Jennifer', cls: 'Trickster', attr: 'Charm', color: '#EE8BC3' },
  { id: 'MEI', name: 'Mei', cls: 'Sage', attr: 'Intellect', color: '#F49CBB' },
  { id: 'DEV', name: 'Dev', cls: 'Archer', attr: 'Aim', color: '#5BC0EB' },
  { id: 'ARJUN', name: 'Arjun', cls: 'Warrior', attr: 'Might', color: '#4FD1C5' },
];

export const ALL_SAMPLE_HEROES: PartyFriend[] = [
  { id: 'YOU', name: 'Jennifer', cls: 'Trickster', attr: 'Charm', color: '#EE8BC3' },
  { id: 'MEI', name: 'Mei', cls: 'Sage', attr: 'Intellect', color: '#F49CBB' },
  { id: 'DEV', name: 'Dev', cls: 'Archer', attr: 'Aim', color: '#5BC0EB' },
  { id: 'ARJUN', name: 'Arjun', cls: 'Warrior', attr: 'Might', color: '#4FD1C5' },
  { id: 'TAMSIN_HERO', name: 'Tamsin', cls: 'Artificer', attr: 'Craft', color: '#C084FC' },
  { id: 'ROWAN_HERO', name: 'Rowan', cls: 'Assassin', attr: 'Agility', color: '#38BDF8' },
];

export const WEEKDAY_DC_BY_WEEK: Record<number, number> = {
  1: 6,
  2: 7,
  3: 7,
  4: 8,
  5: 9,
  6: 9,
};

// Fix 2: Growth based on days played that week: 12, 9, 7, 5, 4, 3, 3 for 1st to 7th day
const WEEK_DAY_BASE_GROWTH = [12, 9, 7, 5, 4, 3, 3];

export function calculateAttributeGrowth(
  currentAttrValue: number,
  daysPlayedThisWeek: number, // 1 to 7
  dieRoll: number, // 1..20
  tierBonus: number,
  weekdayDC: number
): number {
  // An Attribute grows only if the roll was truly uncertain:
  // a die of 1 had to be able to fail (1 + tierBonus - weekdayDC < 1)
  // and a die of 20 had to be able to pass (20 + tierBonus - weekdayDC >= 1),
  // judged BEFORE any Relic is added.
  const canFailOn1 = 1 + tierBonus - weekdayDC < 1;
  const canPassOn20 = 20 + tierBonus - weekdayDC >= 1;
  const isTrulyUncertain = canFailOn1 && canPassOn20;

  if (!isTrulyUncertain) {
    return 0;
  }

  const dayIndex = Math.min(6, Math.max(0, daysPlayedThisWeek - 1));
  const baseGrowth = WEEK_DAY_BASE_GROWTH[dayIndex];
  const tier = getTierInfo(currentAttrValue);
  const calculated = Math.round(baseGrowth * tier.rate);
  return Math.max(1, calculated);
}

// Core Rules §3/§12: a Challenge is d20 + tier bonus (+4 Relic) against the DC.
// Success when the net is 1 or more; a tie fails; no automatic success on a 20.
export function resolveChallengeRoll(d20: number, bonus: number, dc: number): { net: number; success: boolean } {
  const net = d20 + bonus - dc;
  return { net, success: net >= 1 };
}

// The card's "You succeed on X+" number, clamped to 2..20.
export function challengeSucceedOn(dc: number, bonus: number): number {
  return Math.min(20, Math.max(2, dc + 1 - bonus));
}

export function getTierInfo(val: number): { name: string; bonus: number; rate: number; nextAt: number | null; pctInTier: number } {
  if (val <= 25) return { name: 'Novice', bonus: 0, rate: 1.0, nextAt: 26, pctInTier: Math.min(100, Math.round((val / 25) * 100)) };
  if (val <= 50) return { name: 'Apprentice', bonus: 2, rate: 1.0, nextAt: 51, pctInTier: Math.min(100, Math.round(((val - 25) / 25) * 100)) };
  if (val <= 75) return { name: 'Adept', bonus: 4, rate: 0.6, nextAt: 76, pctInTier: Math.min(100, Math.round(((val - 50) / 25) * 100)) };
  if (val <= 100) return { name: 'Expert', bonus: 6, rate: 0.3, nextAt: 101, pctInTier: Math.min(100, Math.round(((val - 75) / 25) * 100)) };
  return { name: 'Master', bonus: 8, rate: 0.1, nextAt: null, pctInTier: 100 };
}

export interface RecordStatMeta {
  key: string;
  labelLines: [string, string];
  fullTitle: string;
  explainer: string;
  leadFriend: string;
  leadNextVal: number;
}

export const RECORD_STATS_META: RecordStatMeta[] = [
  // Row 1: Show Up
  { key: 'daysPlayed', labelLines: ['Days', 'Played'], fullTitle: 'Days Played', explainer: 'Total days you read the chapter to its last line, over the season.', leadFriend: 'Mei', leadNextVal: 14 },
  { key: 'bestStreak', labelLines: ['Best', 'Streak'], fullTitle: 'Best Streak', explainer: 'Your longest run of days played in a row. It never goes down.', leadFriend: 'Mei', leadNextVal: 6 },
  { key: 'gatheringsAttended', labelLines: ['Gatherings', 'Joined'], fullTitle: 'Gatherings Attended', explainer: 'Gatherings you came to.', leadFriend: 'Mei', leadNextVal: 2 },
  { key: 'fragmentsSolved', labelLines: ['Fragments', 'Solved'], fullTitle: 'Fragments Solved', explainer: 'Fragments where you filled a missing word.', leadFriend: 'Mei', leadNextVal: 6 },
  // Row 2: Together
  { key: 'relicsGiven', labelLines: ['Relics', 'Given'], fullTitle: 'Relics Given', explainer: 'Every Relic you gave to a friend.', leadFriend: 'Mei', leadNextVal: 1 },
  { key: 'timesSteppedUp', labelLines: ['Stepped', 'Up'], fullTitle: 'Times Stepped Up', explainer: 'Times you tapped [STEP UP] and rolled the Approach for the party.', leadFriend: 'Arjun', leadNextVal: 1 },
  { key: 'fragmentsMatched', labelLines: ['Fragments', 'Matched'], fullTitle: 'Fragments Matched', explainer: 'Fragments you matched to the right scripture line at a Gathering.', leadFriend: 'Mei', leadNextVal: 2 },
  { key: 'battlesWon', labelLines: ['Battles', 'Won'], fullTitle: 'Battles Won', explainer: 'Gathering Battles the party won while you fought in them.', leadFriend: 'Mei', leadNextVal: 2 },
  // Row 3: Glory
  { key: 'challengesCleared', labelLines: ['Challenges', 'Cleared'], fullTitle: 'Challenges Cleared', explainer: 'Every Challenge you cleared.', leadFriend: 'Mei', leadNextVal: 8 },
  { key: 'challengesPressedOn', labelLines: ['Pressed', 'On'], fullTitle: 'Challenges Pressed On', explainer: 'Times you took the harder [PRESS ON] roll, cleared or not.', leadFriend: 'Dev', leadNextVal: 2 },
  { key: 'enemiesDefeated', labelLines: ['Enemies', 'Felled'], fullTitle: 'Enemies Defeated', explainer: 'Enemies your own hand brought down, in weekday fights and Battles.', leadFriend: 'Dev', leadNextVal: 4 },
  { key: 'perfectRolls', labelLines: ['Perfect', 'Rolls'], fullTitle: 'Perfect Rolls', explainer: 'Each 20 you rolled on a Challenge or an attack.', leadFriend: 'Mei', leadNextVal: 1 },
];

export interface BadgeMeta {
  id: string;
  labelLines: [string, string];
  title: string;
  earned: boolean;
  requirement: string;
  progressText: string;
  iconType: 'sunrise' | 'calendar' | 'road' | 'sword' | 'gift' | 'lifeline' | 'users' | 'moon' | 'd20' | 'flame' | 'chain' | 'heart';
}

export const BADGES_META: BadgeMeta[] = [
  { id: 'first-light', labelLines: ['First', 'Light'], title: 'First Light', earned: true, requirement: 'Finish your first chapter.', progressText: 'Earned on Week 1 · Day 1.', iconType: 'sunrise' },
  { id: 'whole-week', labelLines: ['Whole', 'Week'], title: 'A Whole Week', earned: false, requirement: 'Play all six days and come to the Gathering in one week.', progressText: 'Best week so far: 5 of 6 days.', iconType: 'calendar' },
  { id: 'long-road', labelLines: ['Long', 'Road'], title: 'The Long Road', earned: false, requirement: 'Come to all six Gatherings.', progressText: 'You have attended 2 of 6 Gatherings.', iconType: 'road' },
  { id: 'sharpened', labelLines: ['Sharpened', ''], title: 'Sharpened', earned: false, requirement: 'Reach Adept in any Attribute.', progressText: 'Charm is 38 (13 points from Adept).', iconType: 'sword' },
  { id: 'open-hand', labelLines: ['Open', 'Hand'], title: 'Open Hand', earned: true, requirement: 'Give a friend a Relic for the first time.', progressText: 'Earned when you gave Mei a Charm Relic.', iconType: 'gift' },
  { id: 'lifeline', labelLines: ['Lifeline', ''], title: 'Lifeline', earned: false, requirement: 'A Relic you gave is used in a roll or a fight that then goes the friend\'s way.', progressText: 'Waiting for your given Relic to turn a roll.', iconType: 'lifeline' },
  { id: 'whole-table', labelLines: ['Whole', 'Table'], title: 'The Whole Table', earned: true, requirement: 'Every friend plays on the same day. The whole party earns it.', progressText: 'Earned by the whole party on Week 1 · Day 2.', iconType: 'users' },
  { id: 'clean-night', labelLines: ['Clean', 'Night'], title: 'A Clean Night', earned: false, requirement: 'In one Gathering the party clears the opening roll, wins the Battle with nobody down, and wins the United Effort.', progressText: 'Not yet earned by the party.', iconType: 'moon' },
  { id: 'perfect', labelLines: ['Perfect', ''], title: 'Perfect', earned: true, requirement: 'Roll your first 20 on a Challenge or an attack.', progressText: 'Earned on Week 2 · Day 2.', iconType: 'd20' },
  { id: 'never-enough', labelLines: ['Never', 'Enough'], title: 'Never Enough', earned: false, requirement: 'Clear 3 Press On rolls in one week.', progressText: 'You have cleared 1 this week.', iconType: 'flame' },
  { id: 'many-hands', labelLines: ['Many', 'Hands'], title: 'Many Hands', earned: false, requirement: 'Clear Challenges with four different Attributes.', progressText: 'Cleared with 3 of 4 Attributes (Charm, Agility, Craft).', iconType: 'chain' },
  { id: 'down-to-thread', labelLines: ['Close', 'Thread'], title: 'Down to a Thread', earned: false, requirement: 'Win a fight with 10 HP or less left.', progressText: 'Closest fight won so far: 28 HP left.', iconType: 'heart' },
];

export interface GlossaryTerm {
  term: string;
  category: string;
  definition: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  { term: 'Mythios', category: 'Core', definition: 'The storyteller and keeper of the record for your party across all six weeks.' },
  { term: 'Garrick', category: 'Core', definition: 'The innkeeper of the Hollow Wake Inn and your grey-cloaked guide on the road. He follows the three-verb rule: he never promises, predicts, or denies knowing, and invents no facts about himself.' },
  { term: 'Chapter', category: 'Play', definition: 'One weekday session (Days 1–6) played on your own schedule in about five minutes: arrive at the landmark, resolve the encounter, and open its Seeker housing.' },
  { term: 'Campfire', category: 'Play', definition: 'The asynchronous evening camp where friends converge after their solo day to review the day\'s clues from Fan Out, choose a theory fork, solve today\'s Seeker Fragment word-lock, and share stored banter and riddles with Garrick.' },
  { term: 'Gathering', category: 'Play', definition: 'The Day 7 synchronous finale across 5 Beats: Arrival & Order\'s Claim, Opening Approach, Party Battle & United Effort (+300g per friend), Scripture Match (+50g/100g), and the Table Twist.' },
  { term: 'Challenge', category: 'Rolls', definition: 'A d20 + tier bonus roll against the weekday difficulty (6 to 9). Clearing it awards +500g and skill growth based on days played that week; failing costs 150g (gold never falls below 0); the story goes on, a little worse.' },
  { term: 'Press On', category: 'Rolls', definition: 'An optional harder Challenge (+4 difficulty above the day) that awards +200g on success, with no skill growth.' },
  { term: 'Solo Fan-Out', category: 'Rolls', definition: 'A 3-branch solo exploration beat after the landmark encounter (Challenge, Fight, or Head to Campfire). Winning gives a Seeker 1st-letter hint and the day\'s canonical clue for the evening Campfire board. Heading directly to camp finishes the day with no penalty.' },
  { term: 'Relic', category: 'Items', definition: 'A single-use stone charm (150g in Store: +4 to one Attribute roll, or +1 Weapon and +1 Armor for one fight) that you can use yourself or give to a friend. Spent upon use.' },
  { term: 'Seeker Housing', category: 'Seeker Chest', definition: 'A blood-locked stone socket or niche hidden at each of the 36 weekday landmarks that opens only at the touch of a marked Seeker descendant.' },
  { term: 'Fragment', category: 'Seeker Chest', definition: 'A torn piece of Dark Moon scripture recovered from each weekday\'s Seeker housing with two jumbled lock-words (+25g each). All 6 fragments in a week interlock on Day 6 to form the Day 7 Map (+2 to all Gathering rolls).' },
  { term: 'Solved', category: 'Seeker Chest', definition: 'A Fragment whose two jumbled lock-words have both been unjumbled by the party at the Campfire or in the Seeker Chest.' },
  { term: 'The Four Stones', category: 'Lore', definition: 'Wind, Fire, Water, and Earth Stones that seal the dry well beneath Highwall Keep.' },
  { term: 'The King\'s Stone', category: 'Lore', definition: 'The fifth stone—waking only when the Four Children of the Narrow Window are brought together at Highwall.' },
];


