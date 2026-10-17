// The Bag's "Dark Moon Verses": each Order passage word for word as its Gathering reads it
// (approved 15 Oct, docs/drafts/bag-verses-draft.md). Built from GATHERING_SCRIPTS, never typed,
// so the Bag and the Gathering can't differ (Cult Bible: "the passage text … must stay identical").
// Canon has no Order passage in Week 1.

import { GATHERING_SCRIPTS } from './gatheringScripts';

export interface BagVerse {
  week: number;
  title: string;
  /** The passage, as canon marks it (*italic*, **bold**), paragraphs split by blank lines. */
  text: string;
}

// A verse paragraph is all italic, and is not a spoken quote ("*"…"*" is someone talking).
// The older-hand insets (**[…]** / **"…"**) belong to the passage too.
const isVerseParagraph = (p: string) => /^\*[^"].*\*$/s.test(p.trim());

const isVerseStep = (text: string) => {
  const paras = text.split(/\n\n+/).filter((p) => p.trim());
  return paras.length > 0 && paras.every(isVerseParagraph);
};

// Documents the party holds after their Gathering: each is one step, known by its opening.
// `within`: the document sits inside a step after narration, and the Bag keeps it from its opening on
// (Gathering 6's untorn page follows "He turns the page…" and its frame line in the same message).
const DOCUMENTS: { title: string; section: string; opens: string; within?: boolean }[] = [
  { title: 'The torn page', section: 'The torn page', opens: '*From the Second Book of the Order of the Dark Moon. Even in the old telling' },
  { title: 'The Watch', section: 'The Watch', opens: '*From the Third Book of the Order of the Dark Moon — The Watch.*' },
  { title: 'The untorn page', section: 'The second twist', opens: '**"Four were given to the wind', within: true },
];

function buildBagVerses(): BagVerse[] {
  const out: BagVerse[] = [];
  for (const g of GATHERING_SCRIPTS) {
    const verseSections = Array.from(
      new Set(g.steps.map((s) => s.section).filter((sec) => sec.startsWith('The Verse of')))
    );
    for (const sec of verseSections) {
      const parts = g.steps
        .filter((s): s is Extract<typeof s, { t: 'say' }> => s.section === sec && s.t === 'say')
        .map((s) => s.text)
        .filter(isVerseStep);
      if (parts.length) out.push({ week: g.week, title: sec, text: parts.join('\n\n') });
    }
    for (const d of DOCUMENTS) {
      const step = g.steps.find(
        (s): s is Extract<typeof s, { t: 'say' }> =>
          s.section === d.section && s.t === 'say' && (d.within ? s.text.includes(d.opens) : s.text.startsWith(d.opens))
      );
      if (step) out.push({ week: g.week, title: d.title, text: d.within ? step.text.slice(step.text.indexOf(d.opens)) : step.text });
    }
  }
  return out;
}

export const BAG_VERSES: BagVerse[] = buildBagVerses();
