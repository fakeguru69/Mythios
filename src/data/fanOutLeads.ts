import { AttributeName } from './mythiosRulesData';
import { getPublicFanOutClue } from './campfireDaysData';

// Fan Out, "the last light" (docs/design/fan-out-and-campfire-proposal.md, approved 14 Oct, Part 1 and §3.2).
// After the day's main beat the player follows ONE lead, or goes straight to the fire.
// - The button names a place or thing at the landmark, never the clue.
// - One quick Challenge (the day's rule, the week's DC); no fight, no gold for now, no growth.
// - The clue always comes back. The roll only decides the first-letter hint for one of the fragment's words.
// - Friends who pick the same lead find the same clue: one board card with every finder's name.

export interface FanOutLeadAction {
  attr: AttributeName;
  /** Canon-style verb for this lead ("follow the ruts until they turn"); empty shows the Attribute only. */
  verb: string;
}

export interface FanOutLead {
  id: string;
  /** What the button shows: a place or thing at the landmark. Empty = the day's place (the fallback lead). */
  place: string;
  actions: FanOutLeadAction[];
  clueTitle: string;
  clueText: string;
  /** Which of the day's two fragment words this lead's letter hint helps. */
  hintFor: 1 | 2;
  /** One line shown on a failed roll ("You find it late, by lamplight."); none until approved. */
  lateLine?: string;
  /** QA only, never shown: which reading of tonight's Fork the clue leans toward. */
  leans?: 'A' | 'B' | 'both';
}

/** Leads Fake Guru has approved, by "week-day". Each day should end up with three. */
export const APPROVED_FAN_OUT_LEADS: Record<string, FanOutLead[]> = {};

/**
 * The day's leads. Until a day's three leads are approved it has one: canon's own Fan Out clue (Campfire v2.3),
 * labelled with the day's place and rolled on the day's two Fan Out Attributes.
 */
export function fanOutLeadsFor(week: number, day: number, fallbackAttrs: AttributeName[]): FanOutLead[] {
  const approved = APPROVED_FAN_OUT_LEADS[`${week}-${day}`];
  if (approved?.length) return approved;
  const clue = getPublicFanOutClue(week, day);
  return [
    {
      id: `${week}-${day}-canon`,
      place: '',
      actions: fallbackAttrs.map((attr) => ({ attr, verb: '' })),
      clueTitle: clue.title,
      clueText: clue.text,
      hintFor: 1,
    },
  ];
}

// First-letter hints, per fragment: which words have one. Saves before 15 Oct stored `true`, which now means word 1.
export type HintMask = boolean | number;

export function hintHas(mask: HintMask | undefined, word: 1 | 2): boolean {
  if (mask === true) return word === 1;
  if (typeof mask === 'number') return (mask & word) !== 0;
  return false;
}

export function hintAdd(mask: HintMask | undefined, word: 1 | 2): number {
  const base = mask === true ? 1 : typeof mask === 'number' ? mask : 0;
  return base | word;
}
