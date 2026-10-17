#!/usr/bin/env node
// Builds src/data/garrickRecap.ts from docs/canon/garrick-deception-table.md: every Garrick line in a
// "What he said | What it meant" table, week by week, with its meaning. Shown only after the finale
// (canon: "After this Gathering: the Garrick Recap unlocks").
// Notes for the writer (dates, audits, approvals) are taken out; the lines and meanings are canon's own words.
//   node scripts/gen-garrick-recap.cjs

const fs = require('fs');
const path = require('path');

// What he can really say: the six episode files (chapters and Gatherings) and his stored chat lines (garrickRouter.ts).
const norm = (t) => t.replace(/\{N\}|\{F\d\}/g, ' ').toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z' ]/g, ' ').replace(/\s+/g, ' ').trim();
const canonDir = path.join(__dirname, '..', 'docs', 'canon');
const SAYABLE = norm(
  fs.readdirSync(canonDir).filter((f) => /^episode-\d/.test(f)).map((f) => fs.readFileSync(path.join(canonDir, f), 'utf8')).join(' ') +
    ' ' + fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'garrickRouter.ts'), 'utf8').replace(/\\'/g, "'")
);
const skipped = [];

const src = fs.readFileSync(path.join(__dirname, '..', 'docs', 'canon', 'garrick-deception-table.md'), 'utf8').split('\n');

// Sentences about the writing, not the story.
const WRITER_SENTENCE = /review|unconditional|placement|placed|retired|Layer [A-Z]|ambiguous|defended|heir clue|see the table|Royal Fragment|state-dependent|closure of|invisible seed|was cut|is retired|Said only when asked|if he gave it/;

const WRITER_NOTE = /\d{4}-\d{2}-\d{2}|audit|Audit|approved|Approved|replaced|Replaced|Trimmed|trimmed|Corrected|corrected|aligned|Aligned|GM Principles|Deflection Bank|Layer [A-E]|H\d\b|script|Script|the page gives|see below|See below|canon,|Added|added/;

function stripNotes(s) {
  let t = s.replace(/`\[PLANT\]`/g, '').replace(/\[N\]/g, '{N}');
  // A bold writer note ("**Moved 2026-09-28 …**", "**\"Old ties\" plant**") starts the writer's part: cut the rest.
  const note = [...t.matchAll(/\*\*([^*]+)\*\*/g)].find((m) => WRITER_NOTE.test(m[1]) || /plant|Moved|source/i.test(m[1]));
  if (note) t = t.slice(0, note.index);
  // Italic notes in brackets: keep a short "when" at the very start, drop writer notes anywhere.
  t = t.replace(/\*\((?:[^()]|\([^()]*\))*\)\*/g, (m) => (WRITER_NOTE.test(m) ? '' : m));
  // Plain bracketed audit references ("(season audit H7)").
  t = t.replace(/\s*\([^()]*(?:audit|Audit)[^()]*\)/g, '');
  // Bold writer notes ("**Approved and applied …**", "**\"Old ties\" plant** — …").
  t = t.replace(/\*\*[^*]*\*\*[^.]*\./g, (m) => (WRITER_NOTE.test(m) || /plant/i.test(m) ? '' : m));
  // Sentences that are only about the writing.
  t = t
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !WRITER_SENTENCE.test(sentence))
    .filter((sentence) => !WRITER_NOTE.test(sentence) || /^\*?"/.test(sentence.trim()))
    .join(' ');
  return t
    .replace(/\s*\(canon\)/g, '')
    .replace(/ — no dodge, so no tell/g, '')
    .replace(/\bEp(?:isode)?\s?(\d)/g, 'Week $1')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .trim();
}

function splitWhen(said) {
  const m = said.match(/^\*\(([^)]*)\)\*\s*(.*)$/);
  if (m) return { when: m[1].trim(), line: m[2].trim() };
  return { when: '', line: said.trim() };
}

const weeks = {};
let week = 0;
let inTable = false;
src.forEach((l) => {
  const ep = l.match(/^## Episode (\d)/);
  if (ep) { week = +ep[1]; inTable = false; return; }
  if (/^## /.test(l) && !ep) { week = /Episode 6|finale/i.test(l) ? 6 : week; }
  if (/^\| What he said/.test(l)) { inTable = true; return; }
  if (!inTable) return;
  if (!/^\|/.test(l)) { inTable = false; return; }
  if (/^\|---/.test(l)) return;
  const cells = l.split('|').slice(1, -1).map((c) => c.trim());
  if (cells.length < 2 || !week) return;
  let { when, line } = splitWhen(cells[0]);
  // A plain note after the line ("(only if someone asks him for the ledger)") says when.
  const tail = line.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
  if (tail && /["”]\*?$/.test(tail[1].trim())) { line = tail[1].trim(); when = when || tail[2].trim(); }
  // "Question" → *"answer"*: the question belongs with when.
  const qa = line.match(/^"([^"]+)"\s*→\s*(.*)$/);
  if (qa) { when = `${when}: "${qa[1]}"`; line = qa[2].trim(); }
  // Rows where he says nothing are the writer's plan, not a line.
  if (!/["“]/.test(line)) return;
  const cleanLine = stripNotes(line);
  const meaning = stripNotes(cells[1]);
  if (!cleanLine || !meaning) return;
  // Only lines he can really say (Fake Guru, 17 Oct, from the outside audits): each quoted part must appear in the
  // story text or among his stored chat lines. A row that answers a question nothing in the game lets anyone ask stays
  // in the deception table as the plan, and is left out of the Recap.
  // Sentence by sentence: the story often breaks his speech with narration ("He puts it on the table.").
  const rawSentences = [...cleanLine.matchAll(/["“]([^"”]+)["”]/g)]
    .flatMap((m) => m[1].split(/[.?!…]+/))
    .filter((q) => norm(q).split(' ').length >= 3);
  // A sentence broken by "he says" counts if each part of it is there.
  const heardSentence = (raw) => {
    const q = norm(raw);
    if (SAYABLE.includes(q)) return true;
    const parts = raw.split(/[,;:—–-]+/).map(norm).filter((x) => x.split(' ').length >= 3);
    return parts.length > 1 && parts.every((x) => SAYABLE.includes(x));
  };
  const heard = rawSentences.filter(heardSentence).length;
  if (rawSentences.length && heard < Math.ceil(rawSentences.length / 2)) {
    skipped.push(`Week ${week}: ${cleanLine}`);
    return;
  }
  const list = (weeks[week] = weeks[week] || []);
  if (list.some((e) => e.line === cleanLine)) return; // said once, listed once
  list.push({ when: stripNotes(when).replace(/^./, (c) => c.toUpperCase()), line: cleanLine, meaning });
});

const out = Object.keys(weeks)
  .map(Number)
  .sort((a, b) => a - b)
  .map((w) => ({ week: w, entries: weeks[w] }));

const header = `// Generated by scripts/gen-garrick-recap.cjs from docs/canon/garrick-deception-table.md. Do not edit by hand.
// Garrick's Recap: shown only after the finale. Each line he said, and what it meant.

export interface GarrickRecapEntry {
  when: string;
  line: string;
  meaning: string;
}

export const GARRICK_RECAP: { week: number; entries: GarrickRecapEntry[] }[] = `;
fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'garrickRecap.ts'), header + JSON.stringify(out, null, 2) + ';\n');
console.log(out.map((w) => `Week ${w.week}: ${w.entries.length} lines`).join(' · '));
if (skipped.length) console.log(`Left out, never said in the game (${skipped.length}):\n  ` + skipped.join('\n  '));
