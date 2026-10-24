import { AttributeName } from './mythiosRulesData';
import { GOLD_WEEKDAY_FIGHT_ONLY_WIN, GOLD_WEEKDAY_FIGHT_WITH_CHALLENGE_WIN } from './economy';

// The build's short list of the 36 weekdays: place, Challenge Attributes, fight and [PRESS ON] flags, fight pay.
// The story itself (question, summaries, the Pull) is read from canon's chapter scripts (canonDayFacts.ts);
// the old hand-written story fields were removed on 15 Oct 2026 (Fake Guru's tidy-up).
export interface WeekdayInventoryItem {
  week: number;
  day: number;
  place: string;
  kind?: 'CHALLENGE' | 'FIGHT' | 'CHALLENGE_AND_FIGHT';
  challengeTitle?: string;
  challengeAttrs?: [AttributeName, AttributeName];
  hasPressOn?: boolean;
  hasFight?: boolean;
  fightReward: number;
}

export const WEEKDAY_INVENTORY: WeekdayInventoryItem[] = [
  // WEEK 1
  {
    week: 1, day: 1, place: 'The forest road',
    challengeTitle: 'OPEN THE BOX',
    challengeAttrs: ['Might', 'Craft'],
    hasFight: true, fightReward: GOLD_WEEKDAY_FIGHT_ONLY_WIN,
  },
  {
    week: 1, day: 2, place: 'The Hollow Wake Inn',
    challengeTitle: 'FIT THE PAGE',
    challengeAttrs: ['Intellect', 'Craft'],
    hasPressOn: true,
    fightReward: 0,
  },
  {
    week: 1, day: 3, place: 'The Widow\'s Tooth',
    hasFight: true, fightReward: GOLD_WEEKDAY_FIGHT_ONLY_WIN,
  },
  {
    week: 1, day: 4, place: 'Fenmark',
    challengeTitle: 'FIND WHO LEFT IT',
    challengeAttrs: ['Agility', 'Charm'],
    fightReward: 0,
  },
  {
    week: 1, day: 5, place: 'The old charcoal camp',
    hasFight: true, fightReward: GOLD_WEEKDAY_FIGHT_ONLY_WIN,
  },
  {
    week: 1, day: 6, place: 'The Low Ford',
    challengeTitle: 'READ THE WATERLINE',
    challengeAttrs: ['Aim', 'Agility'],
    // No fight on W1D6 (canon: a Challenge and [PRESS ON]). "The Ferry Sentry" fight was removed
    // 14 Oct by Fake Guru; canon's inn supper (the extra cup, the courier) returns in Phase 2.
    hasPressOn: true,
    fightReward: 0,
  },

  // WEEK 2
  {
    week: 2, day: 1, place: 'The mine, then the mill road',
    challengeTitle: 'THE MAN WITH THE AXE',
    challengeAttrs: ['Charm', 'Aim'],
    fightReward: 0,
  },
  {
    week: 2, day: 2, place: 'The mill',
    challengeTitle: 'THE MILLER\'S WIFE',
    challengeAttrs: ['Charm', 'Intellect'],
    hasPressOn: true,
    fightReward: 0,
  },
  {
    week: 2, day: 3, place: 'Upriver',
    challengeTitle: 'WHERE THE TRACKS STOP',
    challengeAttrs: ['Craft', 'Agility'],
    hasFight: true, fightReward: GOLD_WEEKDAY_FIGHT_WITH_CHALLENGE_WIN,
  },
  {
    week: 2, day: 4, place: 'The shaft in the hillside',
    challengeTitle: 'DOWN THE SHAFT',
    challengeAttrs: ['Agility', 'Charm'],
    fightReward: 0,
  },
  {
    week: 2, day: 5, place: 'The hillside by night',
    hasFight: true, fightReward: GOLD_WEEKDAY_FIGHT_ONLY_WIN,
  },
  {
    week: 2, day: 6, place: 'The lip of the shaft',
    challengeTitle: 'READ THE HILL',
    challengeAttrs: ['Aim', 'Might'],
    hasPressOn: true,
    fightReward: 0,
  },

  // WEEK 3
  {
    week: 3, day: 1, place: 'Somewhere warm',
    hasFight: true, fightReward: GOLD_WEEKDAY_FIGHT_ONLY_WIN,
  },
  {
    week: 3, day: 2, place: 'Ashcombe',
    challengeTitle: 'THE LAST DOOR',
    challengeAttrs: ['Charm', 'Intellect'],
    fightReward: 0,
  },
  {
    week: 3, day: 3, place: 'The Blackglass',
    challengeTitle: 'CROSS THE GLASS',
    challengeAttrs: ['Agility', 'Aim'],
    hasPressOn: true,
    fightReward: 0,
  },
  {
    week: 3, day: 4, place: 'The black ridges',
    challengeTitle: 'THE BURIED DOORWAY',
    challengeAttrs: ['Craft', 'Might'],
    // No [PRESS ON] since 15 Oct (Fake Guru, Phase 6): its bone die is on the day's main path.
    fightReward: 0,
  },
  {
    week: 3, day: 5, place: 'The shepherd\'s hut',
    hasFight: true, fightReward: GOLD_WEEKDAY_FIGHT_ONLY_WIN,
  },
  {
    week: 3, day: 6, place: 'The cairn',
    challengeTitle: 'THE CLIMB',
    challengeAttrs: ['Might', 'Agility'],
    fightReward: 0,
  },

  // WEEK 4
  {
    week: 4, day: 1, place: 'Under the Kiln, then Ashcombe',
    challengeTitle: 'THE ASH',
    challengeAttrs: ['Aim', 'Intellect'],
    hasPressOn: true,
    fightReward: 0,
  },
  {
    week: 4, day: 2, place: 'The north road',
    challengeTitle: 'THE CARTER',
    challengeAttrs: ['Charm', 'Intellect'],
    hasFight: true, fightReward: GOLD_WEEKDAY_FIGHT_WITH_CHALLENGE_WIN,
  },
  {
    week: 4, day: 3, place: 'Reedham',
    challengeTitle: 'HER SKIFF',
    challengeAttrs: ['Craft', 'Might'],
    fightReward: 0,
  },
  {
    week: 4, day: 4, place: 'Old Reedham',
    challengeTitle: 'THE LOWEST LANE',
    challengeAttrs: ['Agility', 'Aim'],
    hasPressOn: true,
    fightReward: 0,
  },
  {
    week: 4, day: 5, place: 'The reed island',
    challengeTitle: 'THE FOG',
    challengeAttrs: ['Aim', 'Craft'],
    hasFight: true, fightReward: GOLD_WEEKDAY_FIGHT_WITH_CHALLENGE_WIN,
  },
  {
    week: 4, day: 6, place: 'The tower at night',
    challengeTitle: 'THE FLAME',
    challengeAttrs: ['Craft', 'Aim'],
    fightReward: 0,
  },

  // WEEK 5
  {
    week: 5, day: 1, place: 'Reedham, and the waystone',
    challengeTitle: 'THE WAYSTONE',
    challengeAttrs: ['Craft', 'Intellect'],
    fightReward: 0,
  },
  {
    week: 5, day: 2, place: 'The old kingdom\'s road',
    hasFight: true, fightReward: GOLD_WEEKDAY_FIGHT_ONLY_WIN,
  },
  {
    week: 5, day: 3, place: 'The herald\'s gate',
    challengeTitle: 'THE WALL',
    challengeAttrs: ['Aim', 'Might'],
    hasPressOn: true,
    fightReward: 0,
  },
  {
    week: 5, day: 4, place: 'The dead streets',
    challengeTitle: 'THE STREET OF SOLDIERS',
    challengeAttrs: ['Agility', 'Intellect'],
    hasPressOn: true,
    fightReward: 0,
  },
  {
    week: 5, day: 5, place: 'Below the hall',
    challengeTitle: 'THE FIRE IN THE SQUARE',
    challengeAttrs: ['Agility', 'Aim'],
    fightReward: 0,
  },
  {
    week: 5, day: 6, place: 'The wall again',
    challengeTitle: 'THE OPEN WALK',
    challengeAttrs: ['Agility', 'Charm'],
    fightReward: 0,
  },

  // WEEK 6
  {
    week: 6, day: 1, place: 'The wall room, six nights left',
    challengeTitle: 'THE ROOM THEY KEPT',
    challengeAttrs: ['Intellect', 'Aim'],
    fightReward: 0,
  },
  {
    week: 6, day: 2, place: 'The barracks under the wall, five nights left',
    challengeTitle: 'THE COLLAPSE',
    challengeAttrs: ['Might', 'Craft'],
    fightReward: 0,
  },
  {
    week: 6, day: 3, place: 'The great square, four nights left',
    challengeTitle: 'THE SQUARE',
    challengeAttrs: ['Agility', 'Charm'],
    hasPressOn: true,
    fightReward: 0,
  },
  {
    week: 6, day: 4, place: 'The hill behind the hall, three nights left',
    hasFight: true, fightReward: GOLD_WEEKDAY_FIGHT_ONLY_WIN,
  },
  {
    week: 6, day: 5, place: 'The moon-tower, two nights left',
    challengeTitle: 'THE SKY-WATCHERS\' WALL',
    challengeAttrs: ['Craft', 'Might'],
    hasPressOn: true,
    fightReward: 0,
  },
  {
    week: 6, day: 6, place: 'The crack in the hill, one night left',
    challengeTitle: 'THE STREET',
    challengeAttrs: ['Agility', 'Might'],
    hasFight: true, fightReward: GOLD_WEEKDAY_FIGHT_WITH_CHALLENGE_WIN,
  },
];
