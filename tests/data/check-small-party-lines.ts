// Every short-party line must still match canon's chapter text, and every sentence that names two different
// friends must have a short version, or a party of 2 or 3 reads one friend twice ("Mei and Mei").
// Run: npx tsx tests/data/check-small-party-lines.ts (after any change to the episode files).
import { CHAPTER_SCRIPTS } from '../../src/data/chapterScripts';
import { SMALL_PARTY_LINES } from '../../src/data/smallPartyLines';

const texts: string[] = [];
const walk = (o: unknown) => {
  if (typeof o === 'string') texts.push(o);
  else if (o && typeof o === 'object') for (const v of Object.values(o)) walk(v);
};
walk(CHAPTER_SCRIPTS);
const all = texts.join('\n');

let bad = 0;
for (const l of SMALL_PARTY_LINES)
  if (!all.includes(l.full)) { bad++; console.log('No longer in the chapters:', l.full); }
for (const t of texts)
  for (const p of t.split(/\n\n+/)) {
    if (new Set(p.match(/\{F[1-3]\}/g) ?? []).size < 2) continue;
    if (!SMALL_PARTY_LINES.some((l) => p.includes(l.full))) { bad++; console.log('Names two friends, no short version:', p); }
  }
console.log(bad ? `${bad} problem(s).` : 'Short-party lines: all match.');
process.exit(bad ? 1 : 0);
