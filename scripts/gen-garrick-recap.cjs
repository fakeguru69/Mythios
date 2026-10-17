#!/usr/bin/env node
// Builds src/data/garrickRecap.ts from docs/canon/garrick-deception-table.md: every Garrick line in a
// "What he said | What it meant" table, week by week, with its meaning. Shown only after the finale
// (canon: "After this Gathering: the Garrick Recap unlocks").
// Notes for the writer (dates, audits, approvals) are taken out; the lines and meanings are canon's own words.
//   node scripts/gen-garrick-recap.cjs

const fs = require('fs');
const path = require('path');

// What he can really say: the text the game plays (chapters, Gatherings, the Campfire, his morning lines) and his
// stored chat lines (garrickRouter.ts). Not the episode files: their writer's notes quote lines the game never plays.
const norm = (t) => t.replace(/\{N\}|\{F\d\}/g, ' ').toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z' ]/g, ' ').replace(/\s+/g, ' ').trim();
const dataDir = path.join(__dirname, '..', 'src', 'data');
const SAYABLE = norm(
  ['chapterScripts.ts', 'gatheringScripts.ts', 'campfireDaysData.ts', 'garrickMorningLines.ts', 'garrickRouter.ts']
    .map((f) => fs.readFileSync(path.join(dataDir, f), 'utf8').replace(/\\n/g, ' ').replace(/\\(['"])/g, '$1'))
    .join(' ')
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
// "Where his warm lines sit": the running bits (the extra cup, the tip, the mended boot…), day by day. Listed after
// each week's own table. A row joins the Recap when he says something there, or when its reading says what the
// deed meant ("On reread…"); plain plants and kindnesses stay in the table.
const warm = {};
let inWarm = false;
function warmRow(l) {
  const cells = l.split('|').slice(1, -1).map((c) => c.trim());
  const m = cells[0] && cells[0].match(/^Ep(\d)\s*(?:D(\d)(?:[–-]\d)?(?:,\s*D\d)*|(Gathering))$/);
  if (!m || cells.length < 3) return;
  const meaning = stripNotes(cells[2]);
  const quotes = [...cells[1].matchAll(/\*"[^"]+"\*/g)].map((q) => q[0]);
  if (!meaning || meaning === '—' || (!quotes.length && !/On reread/.test(meaning))) return;
  // When: the day, and the note in brackets after the line if there is one ("when a player points out…"), or
  // "if asked" / "if thanked".
  let when = m[3] ? 'At the Gathering' : `Day ${m[2]}`;
  const note = cells[1].match(/"\*\s*\(([^()]+)\)/) || cells[1].match(/"\*\s+(if (?:asked|thanked)[^.;]*)/);
  if (note && !WRITER_NOTE.test(note[1])) when += `, ${note[1].trim()}`;
  // A deed with no words is told as one: "He walks last…".
  const deed = stripNotes(cells[1]).replace(/\.$/, '');
  const line = quotes.length ? quotes.join(' ') : `*He ${deed.charAt(0).toLowerCase()}${deed.slice(1)}.*`;
  (warm[+m[1]] = warm[+m[1]] || []).push({ when, line, meaning, quotes });
}
let week = 0;
let inTable = false;
src.forEach((l) => {
  if (/^\| Ep \/ day \| Line or beat/.test(l)) { inWarm = true; return; }
  if (inWarm) {
    if (!/^\|/.test(l)) inWarm = false;
    else if (!/^\|---/.test(l)) warmRow(l);
    return;
  }
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

// The warm lines, checked the same way, after each week's table; a line already listed is not listed twice.
Object.entries(warm).forEach(([w, rows]) => {
  rows.forEach((r) => {
    const list = (weeks[w] = weeks[w] || []);
    let line = r.line;
    if (r.quotes.length) {
      // Only the parts the game really plays ("For a long night to end." is never asked for, so it goes).
      const said = r.quotes.filter((q) =>
        q.replace(/^\*"|"\*$/g, '').split(/[.?!…]+/).filter((x) => norm(x).split(' ').length >= 2).every((x) => SAYABLE.includes(norm(x)))
      );
      if (!said.length) { skipped.push(`Week ${w}: ${r.line}`); return; }
      line = said.filter((q) => !list.some((e) => norm(e.line).includes(norm(q)))).join(' ');
      if (!line) return;
    }
    list.push({ when: r.when, line, meaning: r.meaning });
  });
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
