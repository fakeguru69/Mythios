// Each weekday's short facts, read from canon's own chapter scripts (chapterScripts.ts, generated from the
// episode files): the day's question, its "You learned" and "You hold" lines, and the Pull.
// Replaces the build's old hand-written day summaries (removed 15 Oct 2026, Fake Guru's tidy-up), which
// had drifted from canon. Used by Garrick's memory slice and the Audit Workbench.

import { CHAPTER_SCRIPTS } from './chapterScripts';

export interface CanonDayFacts {
  week: number;
  day: number;
  question: string;
  learned: string;
  hold: string;
  pull: string;
}

const plain = (s: string) => s.replace(/\*\*|\*|`/g, '').trim();

export function canonDayFacts(week: number, day: number): CanonDayFacts {
  const c = CHAPTER_SCRIPTS.find((x) => x.week === week && x.day === day) || CHAPTER_SCRIPTS[0];
  const summary = c.steps.find((s) => s.t === 'summary') as { lines: string[] } | undefined;
  const line = (prefix: string) =>
    plain((summary?.lines.find((l) => l.startsWith(prefix)) || '').slice(prefix.length));
  const pull = c.steps.find((s) => s.t === 'say' && s.pull) as { text: string } | undefined;
  return {
    week: c.week,
    day: c.day,
    question: plain(c.question),
    learned: line('You learned:'),
    hold: line('You hold:'),
    pull: plain(pull?.text || ''),
  };
}
