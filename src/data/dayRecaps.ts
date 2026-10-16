// The road so far: one storybook recap per day (Days 1 to 6, and 7 for the Gathering), shown at the start of the next
// day to every friend (Fake Guru, 16 Oct: "everyone"), and to a friend who missed days, one for each missed day
// (Core Rules "Recap": at most five sentences for a day, fifteen for a Gathering; every [PLANT] kept; the plot both
// branches share; a day's recap ends on its Pull; a Gathering's states its Twist plainly). Written week by week with the
// storybook pass (docs/style/storybook-voice.md). The demo reads this file; the online game gets the recaps from the
// server (table day_recaps, loaded by scripts/gen-recaps-sql.ts) so a phone never holds a later day's story.
// [N] is the party size as a word.

export interface DayRecap {
  week: number;
  day: number; // 7 = the Gathering
  recap: string;
}

export const DAY_RECAPS: DayRecap[] = [];

/** The recap a friend reads before this day: the day before it (Day 1 of a week follows the last Gathering). */
export function recapBefore(week: number, day: number): DayRecap | undefined {
  const i = (week - 1) * 7 + (day - 1) - 1;
  if (i < 0) return undefined;
  return DAY_RECAPS.find((r) => (r.week - 1) * 7 + (r.day - 1) === i);
}
