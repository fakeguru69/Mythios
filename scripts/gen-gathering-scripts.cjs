#!/usr/bin/env node
// Builds src/data/gatheringScripts.ts from the Day 7 section of the six canon episode files.
// Canon text is copied word for word. Run again whenever an episode file changes:
//   node scripts/gen-gathering-scripts.cjs
// Friend stand-ins become tokens filled at play time: Mei → {F1}, Dev → {F2}, Jo → {F3};
// [N] → {N}. In Gathering 1, the friend in the drop (canon's "Dev") is {RISK}.

const fs = require('fs');
const path = require('path');

const CANON = path.join(__dirname, '..', 'docs', 'canon');
const FILES = [
  'episode-1-the-list.md',
  'episode-2-the-wind-stone.md',
  'episode-3-the-fire-stone.md',
  'episode-4-the-water-stone.md',
  'episode-5-the-kings-stone.md',
  'episode-6-the-finale.md',
];
const ATTRS = ['Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim'];
const warnings = [];

function tokens(s, week, section) {
  let t = s
    .replace(/\[N−1\]|\[N-1\]/g, '{N-1}')
    .replace(/\[N\]/g, '{N}');
  // Gathering 1: "Dev" in the drop is whichever friend fell (canon note); elsewhere Dev is {F2}.
  if (week === 1 && /United Effort|discovery|summary/i.test(section)) t = t.replace(/\b(Dev|DEV)\b/g, '{RISK}');
  return t
    .replace(/\b(Mei|MEI)\b/g, '{F1}')
    .replace(/\b(Dev|DEV)\b/g, '{F2}')
    .replace(/\b(Jo|JO)\b/g, '{F3}');
}

// Notes for the builder inside a passage, such as "*(first time only)*", are not shown.
const stripNotes = (s) => s.replace(/\s*\*\((?:[^()]|\([^()]*\))*\)\*/g, '');

const quoteText = (lines, week, section) =>
  tokens(
    stripNotes(
      lines
        .filter((l) => !/^\*MYTHIOS explains/.test(l.trim()))
        .map((l) => l.replace(/^> ?/, ''))
        .join('\n')
    )
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
    week,
    section
  );

// Conditions written as stage notes in canon.
function labelCond(text, week) {
  const t = text.replace(/^\*+|\*+$/g, '').trim();
  if (/^On a pass/.test(t)) return { on: 'approach', pass: true };
  if (/^On a failure/.test(t)) return { on: 'approach', pass: false };
  if (/^Alone:?$/.test(t)) return { on: 'alone' };
  if (/^If Dev was hauled out/.test(t) || /^If he said it himself/.test(t)) return { on: 'ue', won: true };
  if (/^If Dev fell/.test(t)) return { on: 'ue', won: false };
  // Gathering 5: the older hand's frame line is shown only when the Verse is read from the page (roll-call lost).
  if (/^If it is read from the page/.test(t)) return { on: 'ue', won: false };
  if (/^If most give/.test(t) || /^Tear the page/.test(t)) return { on: 'pick', option: 0 };
  if (/^If most hold back/.test(t) || /^Break the ring/.test(t)) return { on: 'pick', option: 1 };
  // Gathering 6: the hold-back line in the second twist (the fifth's pick), and the act's third branch
  // and the cliffhanger's three branch lines (the act's pick, the last one before them).
  if (/^If most held back/.test(t)) return { on: 'pick', option: 1 };
  if (/^If the page was torn/.test(t)) return { on: 'pick', option: 0 };
  if (/^If a Stone was struck from the ring/.test(t)) return { on: 'pick', option: 1 };
  if (/^Do nothing:?$/.test(t) || /^If nothing was done/.test(t)) return { on: 'pick', option: 2 };
  if (/^Then, alone on the screen/.test(t)) return { alone: true };
  // Lines for when nobody taps in time: the one-phone demo always has a tap, so they are kept apart.
  if (/^If nobody taps the last question/.test(t) || /^If two quiet minutes pass/.test(t) || /^If a minute passes with either untapped/.test(t)) return { on: 'unasked' };
  // Gathering 2's lost-room puzzle (three clumps in order) is read in order in the demo.
  if (/^If the room was lost, the three clumps/.test(t)) return { on: 'skip' };
  return undefined;
}

function parseApproachCard(lines, week, section) {
  const c = { title: '', ways: [], reward: '', fail: '' };
  lines.forEach((l) => {
    const t = l.trim();
    if (!t || /`\[STEP UP\]`/.test(t)) return;
    const way = t.match(/^(.*?)\s*·\s*\*\*(\w+)\*\*\s*·\s*(.*)$/);
    if (way && ATTRS.includes(way[2])) return c.ways.push({ by: way[1], attr: way[2], verb: tokens(way[3], week, section) });
    if (/^REWARD:/.test(t)) return (c.reward = t.replace(/^REWARD:\s*/, ''));
    if (/^IF YOU FAIL:/.test(t)) return (c.fail = tokens(t.replace(/^IF YOU FAIL:\s*/, ''), week, section));
    const title = t.match(/^\*\*([^*]+)\*\*$/);
    if (title && !c.title) return (c.title = title[1]);
  });
  return c;
}

function parseFightCard(lines, week, section) {
  const f = { name: '', firstLines: null, desc: '' };
  lines.forEach((l) => {
    const t = l.trim();
    if (!t || /fight begins in/.test(t)) return;
    const name = t.match(/^\*\*([^*]+)\*\*$/);
    if (name && !f.name) return (f.name = name[1]);
    const two = t.match(/^\*(.+?)\*\s*\/\s*\*(.+?)\*$/);
    if (two) return (f.firstLines = [tokens(two[1], week, section), tokens(two[2], week, section)]);
    const clean = stripNotes(t).trim();
    if (clean) f.desc = f.desc ? `${f.desc} ${tokens(clean, week, section)}` : tokens(clean, week, section);
  });
  return f;
}

function parseAttrLines(lines, week, section) {
  const out = {};
  lines.forEach((l) => {
    const m = l.trim().match(/^\*\*([^*]+)\*\*\s*·\s*(.*)$/);
    if (!m) return;
    const key = m[1] === 'From the floor' ? 'floor' : m[1];
    if (key === 'floor' || ATTRS.includes(key)) out[key] = tokens(m[2].trim(), week, section);
  });
  return out;
}

// A quote that is a set of options: "**QUESTION**" then "`[OPTION]` description" lines.
function parsePick(lines, week, section) {
  const opts = [];
  let question = '';
  lines.forEach((l) => {
    const t = l.trim();
    const q = t.match(/^\*\*([^*]+)\*\*$/);
    if (q && !question) return (question = q[1]);
    const all = [...t.matchAll(/`\[([^\]]+)\]`/g)];
    if (all.length > 1) all.forEach((m) => opts.push({ label: tokens(m[1], week, section), desc: '' }));
    else if (all.length === 1) opts.push({ label: tokens(all[0][1], week, section), desc: tokens(t.replace(all[0][0], '').trim(), week, section) });
  });
  return opts.length ? { question: tokens(question, week, section), options: opts } : null;
}

function parseAskTable(lines, week, section) {
  const rows = [];
  let group = '';
  lines.forEach((l) => {
    const cells = l.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 2 || /^-+$/.test(cells[0]) || cells[0] === 'Question') return;
    const g = cells[0].match(/^\*\*([^*]+)\*\*$/);
    if (g && !cells[1]) return (group = g[1]);
    const qs = [...cells[0].matchAll(/`\[([^\]]+)\]`/g)].map((m) => m[1]);
    if (!qs.length) return;
    rows.push({
      questions: qs.map((q) => tokens(q, week, section)),
      sealed: cells[0].includes('◆'),
      note: tokens((cells[0].match(/\*\(([^)]*)\)\*/) || [])[1] || '', week, section),
      answer: tokens(cells[1], week, section),
      group,
    });
  });
  return rows;
}

function buildGathering(week, lines) {
  const steps = [];
  let section = '';
  let pendingCond;
  let pendingAlone = false;
  let sectionCond;
  let i = 0;
  const push = (step) =>
    steps.push({ ...(sectionCond && !step.cond && step.t !== 'section' ? { cond: sectionCond } : {}), ...step, section });
  while (i < lines.length) {
    const l = lines[i];
    if (/^\*\*Designer's notes\*\*/.test(l)) break;
    if (l.trim() === '' || l.trim() === '---') { i++; continue; }
    const h3 = l.match(/^### (.+)$/);
    if (h3) {
      // Gathering 4's Ask happens only if the pin came out (the captive lived).
      sectionCond = /only if the pin came out/.test(h3[1]) ? { on: 'ue', won: true } : undefined;
      section = h3[1].replace(/\s*\*\(.*\)\*\s*$/, '').trim();
      push({ t: 'section', title: section });
      i++;
      continue;
    }
    if (/^\|/.test(l)) {
      const tbl = [];
      while (i < lines.length && /^\|/.test(lines[i])) tbl.push(lines[i++]);
      const rows = parseAskTable(tbl, week, section);
      if (rows.length) push({ t: 'ask', rows });
      continue;
    }
    if (l.startsWith('>')) {
      const q = [];
      while (i < lines.length && lines[i].startsWith('>')) q.push(lines[i++].replace(/^> ?/, ''));
      const text = q.join('\n');
      const pick = /`\[/.test(text) ? parsePick(q, week, section) : null;
      if (pick) {
        // The Approach's first pick is the vote that sets the way in.
        const isVote = /Approach/.test(section) && !steps.some((s) => s.t === 'pick' && /Approach/.test(s.section));
        push({ t: 'pick', vote: isVote, ...pick });
        continue;
      }
      if (/^\*\*MYTHIOS asks the table:\*\*/.test(text.trim())) {
        push({ t: 'turn', question: tokens(text.replace(/^\*\*MYTHIOS asks the table:\*\*\s*/, '').trim(), week, section) });
        continue;
      }
      const attrLines = parseAttrLines(q, week, section);
      if (Object.keys(attrLines).length >= 4) {
        const isLook = steps.length && steps[steps.length - 1].t === 'act' && /LOOK CLOSER/.test(steps[steps.length - 1].label);
        push({ t: isLook ? 'lookCloser' : 'notice', lines: attrLines });
        continue;
      }
      const step = { t: 'say', text: quoteText(q, week, section) };
      if (pendingCond) step.cond = pendingCond;
      if (pendingAlone) step.alone = true;
      pendingCond = undefined;
      pendingAlone = false;
      push(step);
      continue;
    }
    const bold = l.match(/^\*\*([^*]+)\*\*\s*(.*)$/);
    if (bold) {
      const name = bold[1].trim();
      const next = () => {
        const q = [];
        while (i < lines.length && lines[i].trim() === '') i++;
        while (i < lines.length && lines[i].startsWith('>')) q.push(lines[i++].replace(/^> ?/, ''));
        return q;
      };
      i++;
      if (name === 'Challenge card') { push({ t: 'approach', ...parseApproachCard(next(), week, section) }); continue; }
      if (name === 'Fight card') { push({ t: 'battle', ...parseFightCard(next(), week, section) }); continue; }
      if (name === 'Match') {
        const a = next();
        const b = next();
        const question = (a.find((x) => /^\*\*/.test(x)) || '').replace(/\*\*/g, '').trim();
        const quote = tokens(a.filter((x) => !/^\*\*/.test(x)).join(' ').trim(), week, section);
        const bLines = b.filter((x) => !/matched it\.?$/.test(x.trim()));
        const fromIdx = bLines.findIndex((x) => /\*".+?"\*/.test(x));
        const from = fromIdx >= 0 ? bLines[fromIdx] : '';
        const frag = (from.match(/\*"(.+?)"\*/) || [])[1] || '';
        const source = from.replace(/\*".*?"\*/, '').replace(/:\s*$/, '').trim();
        // Gathering 5's second Match: "only if the roll-call was answered and the watchman said the Verse himself".
        const matchCond = /only if the roll-call was answered/.test(bold[2]) ? { cond: { on: 'ue', won: true } } : {};
        push({ t: 'match', question, quote, source: tokens(source, week, section), fragment: frag, ...matchCond });
        // Anything after the fragment in that passage is the story's comment on it.
        const after = bLines.slice(fromIdx + 1).join('\n').trim();
        if (after) push({ t: 'say', text: quoteText(after.split('\n'), week, section), ...matchCond });
        continue;
      }
      if (/^(Night|Season) summary card$/.test(name)) {
        push({ t: 'summary', lines: next().map((x) => x.trim()).filter(Boolean).map((x) => tokens(x, week, 'summary')) });
        continue;
      }
      if (name === 'The two things:') { push({ t: 'ue' }); continue; }
      const reaches = name.match(/^(.+) reaches 0$/);
      if (reaches) {
        const won = !steps.some((s) => s.t === 'ueEnd');
        push({ t: 'ueEnd', won });
        pendingCond = { on: 'ue', won };
        // The ending is the passage straight under its heading; what follows is shared by both.
        while (i < lines.length && lines[i].trim() === '') i++;
        if (i < lines.length && lines[i].startsWith('>')) {
          const block = [];
          while (i < lines.length && lines[i].startsWith('>')) block.push(lines[i++].replace(/^> ?/, ''));
          push({ t: 'say', text: quoteText(block, week, section), cond: { on: 'ue', won } });
        }
        pendingCond = undefined;
        continue;
      }
      // Other bold lines (How it ends, The board, act notes) are headings for the writer.
      continue;
    }
    if (/^`\[/.test(l.trim())) {
      const labels = [...l.matchAll(/`\[([^\]]+)\]`/g)].map((m) => m[1]).filter((x) => x !== 'PLANT');
      labels.forEach((label) => push({ t: 'act', label: tokens(label, week, section) }));
      i++;
      continue;
    }
    if (/^\*[^*]/.test(l)) {
      const cond = labelCond(l, week);
      // "Then, alone on the screen" starts a new passage: a note just before it about untapped buttons
      // ("If a minute passes with either untapped…") has no line of its own and must not swallow it.
      if (cond && cond.alone) { pendingAlone = true; pendingCond = undefined; }
      else if (cond) pendingCond = cond;
      else if (/^\*Tonight's message/.test(l)) {
        const m = l.match(/"(.+)"/);
        if (m) push({ t: 'tonight', text: tokens(m[1], week, section) });
      }
      i++;
      continue;
    }
    i++;
  }
  return steps;
}

// Ask rows canon adds later in the night ("Added when the pen is found", "Added when the torn page is read",
// Gathering 4) become their own Ask board at the end of the section where that thing is found, under the same
// condition as the first board. Before 17 Oct they sat on the first board, asked before the pen was found.
const LATE_ASK_SECTIONS = { 'Added when the pen is found': 'The pen', 'Added when the torn page is read': 'The torn page' };
function splitLateAsks(steps) {
  const askIdx = steps.findIndex((s) => s.t === 'ask' && s.rows.some((r) => LATE_ASK_SECTIONS[r.group]));
  if (askIdx < 0) return steps;
  const ask = steps[askIdx];
  const out = steps.slice();
  out[askIdx] = { ...ask, rows: ask.rows.filter((r) => !LATE_ASK_SECTIONS[r.group]) };
  for (const [group, section] of Object.entries(LATE_ASK_SECTIONS)) {
    const rows = ask.rows.filter((r) => r.group === group);
    if (!rows.length) continue;
    let end = -1;
    out.forEach((s, k) => { if (s.section === section) end = k; });
    if (end < 0) throw new Error(`no section "${section}" for the late Ask rows`);
    const board = { t: 'ask', rows, section };
    if (ask.cond) board.cond = ask.cond;
    out.splice(end + 1, 0, board);
  }
  return out;
}

function tidy(steps) {
  const out = [];
  for (let k = 0; k < steps.length; k++) {
    const s = steps[k];
    // "**Mei. … Go.**" names who rolls first; the United Effort engine names the roller.
    if (s.t === 'say' && out.length && out[out.length - 1].t === 'ue') {
      const text = s.text.replace(/\*\*\{F\d\}\.[^*]*\*\*/g, '').trim();
      if (!text) continue;
      if (text !== s.text) { out.push({ ...s, text }); continue; }
    }
    // The board is shown whole in the demo, so "the board has new questions" is not needed.
    if (s.t === 'say' && /^\*The board has new questions\.\*$/.test(s.text.trim())) continue;
    if (s.t === 'say' && s.cond && s.cond.on === 'skip') continue;
    if (s.t === 'say' && s.cond && s.cond.on === 'unasked') {
      const prevAsk = [...out].reverse().find((x) => x.t === 'ask' || x.t === 'section');
      if (prevAsk && prevAsk.t === 'ask' && !prevAsk.unaskedLine) prevAsk.unaskedLine = s.text;
      continue;
    }
    if (s.t === 'turn' && steps[k + 1]?.t === 'say' && steps[k + 2]?.t === 'say') {
      out.push({ ...s, nudge: steps[k + 1].text, answer: steps[k + 2].text });
      k += 2;
      continue;
    }
    out.push(s);
  }
  return out;
}

const gatherings = FILES.map((f, wi) => {
  const lines = fs.readFileSync(path.join(CANON, f), 'utf8').split('\n');
  const start = lines.findIndex((l) => /^## Day 7/.test(l));
  let end = lines.findIndex((l, n) => n > start && /^## /.test(l));
  if (end < 0) end = lines.length;
  return { week: wi + 1, steps: splitLateAsks(tidy(buildGathering(wi + 1, lines.slice(start + 1, end)))) };
});

const header = `// Generated by scripts/gen-gathering-scripts.cjs from the Day 7 section of docs/canon/episode-*.md.
// Do not edit by hand: change the episode file, then run \`node scripts/gen-gathering-scripts.cjs\`.
// Tokens filled at play time: {F1} {F2} {F3} = friends after the player (canon's Mei, Dev, Jo);
// {RISK} = Gathering 1's friend in the drop; {N} = the party size as a word.

import { AttributeName } from './mythiosRulesData';

export type GatheringCond =
  | { on: 'approach'; pass: boolean }
  | { on: 'ue'; won: boolean }
  | { on: 'pick'; option: number }
  | { on: 'alone' }
  | { on: 'unasked' };

export type GatheringStep = { section: string; cond?: GatheringCond } & (
  | { t: 'section'; title: string }
  | { t: 'tonight'; text: string }
  | { t: 'say'; text: string; cond?: GatheringCond; alone?: boolean }
  | { t: 'act'; label: string }
  | { t: 'pick'; vote: boolean; question: string; options: { label: string; desc: string }[] }
  | {
      t: 'approach';
      title: string;
      ways: { by: string; attr: AttributeName; verb: string }[];
      reward: string;
      fail: string;
    }
  | { t: 'battle'; name: string; firstLines: [string, string] | null; desc: string }
  | { t: 'notice'; lines: Partial<Record<AttributeName | 'floor', string>> }
  | { t: 'lookCloser'; lines: Partial<Record<AttributeName | 'floor', string>> }
  | { t: 'ue' }
  | { t: 'ueEnd'; won: boolean }
  | { t: 'match'; question: string; quote: string; source: string; fragment: string }
  | { t: 'turn'; question: string; nudge?: string; answer?: string }
  | {
      t: 'ask';
      rows: { questions: string[]; sealed: boolean; note: string; answer: string; group: string }[];
      /** Said when the party moves on with a sealed question unasked; its answer follows. */
      unaskedLine?: string;
    }
  | { t: 'summary'; lines: string[] }
);

export interface GatheringScript {
  week: number;
  steps: GatheringStep[];
}

export const GATHERING_SCRIPTS: GatheringScript[] = `;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'gatheringScripts.ts'), header + JSON.stringify(gatherings, null, 2) + ';\n');
console.log(`${gatherings.length} Gatherings written to src/data/gatheringScripts.ts`);
warnings.forEach((w) => console.log('  ' + w));
