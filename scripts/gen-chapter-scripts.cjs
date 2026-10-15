#!/usr/bin/env node
// Builds src/data/chapterScripts.ts from the six canon episode files (Days 1–6 of each week).
// Canon text is copied word for word. Run again whenever an episode file changes:
//   node scripts/gen-chapter-scripts.cjs
// Friend stand-ins become tokens filled from the party at play time:
//   Mei → {F1}, Dev → {F2}, Jo → {F3}; [N] → {N}; [N−1] → {N-1}.

const fs = require('fs');
const path = require('path');
const { parseAll } = require('./parse-episodes.cjs');

const ATTRS = ['Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim'];

// Who strikes first in a weekday fight, where canon makes it depend on something.
// Days not listed: the player strikes first.
const STRIKE_FIRST = {
  '1-3': { on: 'choice', label: 'FOLLOW THE CART-RUTS' },
  '1-5': { on: 'choice', label: 'LOOK AT THE PATH' },
  '2-3': { on: 'challenge' },
  '2-5': { on: 'choice', label: 'WALK THE HILL' },
  '3-5': { on: 'choice', label: "WREN'S LINE" },
  '4-5': { on: 'challenge' },
  '5-2': { on: 'choice', label: 'CAMP ON THE OPEN ROAD' },
  '6-6': { on: 'challenge' },
};

// How a choice's branches are shown, from canon's stage note on each.
//   pick: only the branch the player picked
//   each: the player picks one at a time until every branch is seen
//   auto: the picked branch, then the friends' branches straight after
const CHOICE_MODE = [
  [/^Both are seen/, 'each'],
  [/^Three questions/, 'each'],
  [/^The player looks at one first\. All three are seen/, 'each'],
  [/^The player looks at one\. Friends take the other two, and what they found is shown/, 'auto'],
  [/^The player does one\. Friends do the other, and what they found is shown/, 'auto'],
  [/^The player chooses\. Friends take the other/, 'pick'],
  [/^The player takes one\. Friends cover the other/, 'pick'],
  [/^The player chooses who keeps watch/, 'pick'],
  [/^Each (reply )?opens/, 'pick'],
];

// Branch labels that do not echo a button's words.
const BRANCH_ALIAS = {
  'The marking (Mei and Dev take the ruts)': ['GO TO THE MARKING'],
  'The ruts (Mei and Dev take the marking)': ['FOLLOW THE CART-RUTS'],
  'Empty hands, or the telling': ['SHOW HER YOUR EMPTY HANDS', 'TELL HER WHO YOU JUST DROVE OFF'],
  'The horse': ['HOLD OUT THE CARVED HORSE'],
  'Who took her': ['WHO TOOK HER?'],
  'Why her': ['WHY HER?'],
  'What they said': ['WHAT DID THEY SAY?'],
  'Walking the hill': ['WALK THE HILL'],
  "Meira's pages": ["READ MEIRA'S PAGES"],
  'The ash': ['READ THE ASH'],
  'Wren first': ['TAKE WREN UP FIRST'],
  'The rows': ['CAMP AT THE HEAD OF THE ROWS'],
  'The road': ['CAMP ON THE OPEN ROAD'],
  'What are they': ['WHAT ARE THEY?'],
  'The cup': ['WHO IS THE CUP FOR?'],
  'Nothing': ['SAY NOTHING'],
  'Where he stood': ['LOOK WHERE HE STOOD'],
  'What he was at': ['LOOK AT WHAT HE WAS AT'],
  'The step': ['LOOK AT THE STEP'],
  'The fire': ['LOOK AT THE FIRE', 'THE FIRE'],
  'The path': ['LOOK AT THE PATH'],
};

// Labels that make the next passage conditional.
function labelCond(text) {
  const t = text.replace(/^\*|\*$/g, '').replace(/:\*?.*$/, '').trim();
  if (/^On a pass( only)?\b/.test(t)) return { on: 'challenge', pass: true };
  if (/^On a failure/.test(t)) return { on: 'challenge', pass: false };
  if (/^On a passed press/.test(t)) return { on: 'press' };
  if (/^If the player (wins|won)/.test(t)) return { on: 'fight', won: true };
  if (/^If the player loses/.test(t)) return { on: 'fight', won: false };
  if (/^Win or lose/.test(t)) return null;
  if (/^If the boy came out to you/.test(t)) return { on: 'challenge', pass: true };
  if (/^If he was caught/.test(t)) return { on: 'challenge', pass: false };
  if (/^If the player saw the country by daylight/.test(t)) return { on: 'challenge', pass: true };
  if (/^If the player came up in the dark/.test(t)) return { on: 'challenge', pass: false };
  if (/^If Wren was carried down whole/.test(t)) return { on: 'claim', key: 'G3:united-effort-lost', has: false };
  if (/^If Wren was cut in the slide/.test(t)) return { on: 'claim', key: 'G3:united-effort-lost', has: true };
  return undefined; // not a condition
}

function tokens(s) {
  return s
    .replace(/\[N−1\]|\[N-1\]/g, '{N-1}')
    .replace(/\[N\]/g, '{N}')
    .replace(/\b(Mei|MEI)\b/g, '{F1}')
    .replace(/\b(Dev|DEV)\b/g, '{F2}')
    .replace(/\b(Jo|JO)\b/g, '{F3}');
}

function quoteText(lines) {
  return tokens(
    lines
      .filter((l) => !/^\*MYTHIOS explains/.test(l.trim()))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

const norm = (s) => s.toUpperCase().replace(/[^A-Z' ]/g, '').trim();

function branchOptions(label, buttons) {
  const key = label.replace(/^\*|\*$/g, '').replace(/:\*?$/, '').replace(/:$/, '').trim();
  const alias = BRANCH_ALIAS[key];
  const idx = [];
  if (alias) {
    alias.forEach((a) => {
      const i = buttons.findIndex((b) => norm(b) === norm(a));
      if (i >= 0) idx.push(i);
    });
  } else {
    const k = norm(key.replace(/^The\s+/i, ''));
    buttons.forEach((b, i) => {
      if (norm(b).includes(k) || k.includes(norm(b))) idx.push(i);
    });
  }
  return idx;
}

function parseNotice(lines) {
  const out = {};
  lines.forEach((l) => {
    const m = l.match(/^\*\*(\w+)\*\*\s*·\s*(.*)$/);
    if (!m || !ATTRS.includes(m[1])) return;
    const body = m[2].trim();
    const sec = body.match(/^(.*?)\s*\*([^*]+)\*$/);
    out[m[1]] = sec ? { first: tokens(sec[1].trim()), second: tokens(sec[2].trim()) } : { first: tokens(body) };
  });
  return out;
}

function parseChallenge(lines) {
  const c = { title: '', desc: '', options: [], reward: '', fail: '' };
  lines.forEach((l, i) => {
    const t = l.trim();
    if (!t) return;
    const opt = t.match(/^\*\*(\w+)\*\*\s*·\s*(.*?)\s*·\s*`\[ROLL\]`/);
    if (opt && ATTRS.includes(opt[1])) return c.options.push({ attr: opt[1], verb: tokens(opt[2]) });
    if (/^REWARD:/.test(t)) return (c.reward = t.replace(/^REWARD:\s*/, ''));
    if (/^IF YOU FAIL:/.test(t)) return (c.fail = tokens(t.replace(/^IF YOU FAIL:\s*/, '')));
    // Carried from Gathering 5 (Core Rules §11): a lost roll-call makes this card two harder.
    const carried = t.match(/^\*If the roll-call was lost at the Gathering:\*\s*(.*)$/);
    if (carried) return (c.harderIf = { key: 'G5:united-effort-lost', has: true, by: 2, line: tokens(carried[1]) });
    const title = t.match(/^\*\*([^*]+)\*\*$/);
    if (title && !c.title) return (c.title = title[1]);
    c.desc = c.desc ? `${c.desc}\n${tokens(t)}` : tokens(t);
  });
  return c;
}

function parsePress(lines) {
  const p = { title: '', detail: '', harder: 4, reward: '' };
  lines.forEach((l) => {
    const t = l.trim();
    const head = t.match(/^\*\*([^*]+)\*\*\s*·\s*(.*)$/);
    if (head) { p.title = head[1]; p.detail = tokens(head[2]); return; }
    const h = t.match(/^(\d+) harder/);
    if (h) { p.harder = +h[1]; return; }
    if (/^REWARD:/.test(t)) p.reward = t.replace(/^REWARD:\s*/, '');
  });
  return p;
}

function parseFight(lines) {
  const f = { name: '', desc: '', firstLines: null };
  lines.forEach((l) => {
    const t = l.trim();
    if (!t || /`\[FIGHT\]`/.test(t) || /^You:/.test(t) || /^REWARD:/.test(t)) return;
    const name = t.match(/^\*\*([^*]+)\*\*$/);
    if (name && !f.name) { f.name = name[1]; return; }
    const two = t.match(/^\*(.+?)\*\s*\/\s*\*(.+?)\*$/);
    if (two) { f.firstLines = [tokens(two[1]), tokens(two[2])]; return; }
    f.desc = f.desc ? `${f.desc} ${tokens(t)}` : tokens(t);
  });
  return f;
}

const warnings = [];

function buildDay(d) {
  const key = `${d.week}-${d.day}`;
  const steps = [];
  let heading = '';
  let question = '';
  let pendingCond; // condition for the next quote
  const b = d.blocks;
  let i = 0;
  let choiceId = 0;
  const lastChoiceByLabel = {};
  while (i < b.length) {
    const blk = b[i];
    if (blk.t === 'label') {
      const h = blk.text.match(/^\*Heading:\s*\*\*(.+?)\*\*\*?$/);
      if (h) { heading = h[1].replace(/\.$/, ''); i++; continue; }
      const q = blk.text.match(/^\*Question:\s*(.+?)\*$/);
      if (q) { question = tokens(q[1]); i++; continue; }
      const inline = blk.text.match(/^\*([^*]+):\*\s+(.+)$/);
      const cond = labelCond(blk.text);
      if (inline && cond !== undefined) {
        const s = inline[2].trim();
        steps.push({ t: 'say', text: tokens(s[0].toUpperCase() + s.slice(1)), ...(cond ? { cond } : {}) });
        i++; continue;
      }
      if (cond !== undefined) { pendingCond = cond; i++; continue; }
      warnings.push(`W${d.week}D${d.day} stage note ignored: ${blk.text.slice(0, 90)}`);
      i++; continue;
    }
    if (blk.t === 'head') {
      const name = blk.text;
      const next = b[i + 1];
      if (name === 'What you notice' && next?.t === 'quote') { steps.push({ t: 'notice', lines: parseNotice(next.lines) }); i += 2; continue; }
      if (name === 'Challenge card' && next?.t === 'quote') { steps.push({ t: 'challenge', ...parseChallenge(next.lines) }); i += 2; continue; }
      if (name === 'PRESS ON' && next?.t === 'quote') { steps.push({ t: 'press', ...parsePress(next.lines) }); i += 2; continue; }
      if (name === 'Fight card' && next?.t === 'quote') {
        const f = parseFight(next.lines);
        const rule = STRIKE_FIRST[key];
        let strikeFirst = { on: 'player' };
        if (rule?.on === 'challenge') strikeFirst = { on: 'challenge' };
        if (rule?.on === 'choice') {
          const c = lastChoiceByLabel[rule.label];
          if (!c) warnings.push(`W${d.week}D${d.day} strike-first choice not found: ${rule.label}`);
          else strikeFirst = { on: 'choice', choice: c.id, options: [c.option] };
        }
        steps.push({ t: 'fight', name: f.name, desc: f.desc, firstLines: f.firstLines, strikeFirst });
        i += 2; continue;
      }
      if (name === 'Day summary card' && next?.t === 'quote') {
        const lines = next.lines.map((l) => l.trim()).filter(Boolean);
        steps.push({ t: 'summary', lines: lines.map(tokens) });
        i += 2; continue;
      }
      warnings.push(`W${d.week}D${d.day} heading ignored: ${name}`);
      i++; continue;
    }
    if (blk.t === 'buttons') {
      const labels = blk.labels.filter((l) => l !== 'PLANT');
      if (labels.length === 0) { i++; continue; }
      if (labels.length === 1) { steps.push({ t: 'act', label: tokens(labels[0]) }); i++; continue; }
      // A choice: read its stage note and any branches that follow.
      const id = choiceId++;
      let mode = 'pick';
      const branches = [];
      let j = i + 1;
      while (j < b.length) {
        const nb = b[j];
        // Canon's [PLANT] marks are notes for the writer, not buttons.
        if (nb.t === 'buttons' && nb.labels.every((l) => l === 'PLANT')) { j++; continue; }
        if (nb.t === 'label') {
          const note = nb.text.replace(/^\*|\*$/g, '');
          const m = CHOICE_MODE.find(([re]) => re.test(note));
          if (m) { mode = m[1]; j++; continue; }
          const opts = branchOptions(nb.text, labels);
          if (opts.length && b[j + 1]?.t === 'quote') {
            // A branch runs over several passages only when another branch follows it.
            let k = j + 1;
            const parts = [];
            while (b[k]?.t === 'quote') { parts.push(quoteText(b[k].lines)); k++; }
            while (b[k]?.t === 'buttons' && b[k].labels.every((l) => l === 'PLANT')) k++;
            const nextIsBranch = b[k]?.t === 'label' && branchOptions(b[k].text, labels).length > 0;
            const take = nextIsBranch ? parts.length : 1;
            branches.push({ options: opts, text: parts.slice(0, take).join('\n\n') });
            j = j + 1 + take; continue;
          }
        }
        break;
      }
      labels.forEach((l, oi) => (lastChoiceByLabel[l] = { id, option: oi }));
      if (branches.length) {
        const covered = new Set(branches.flatMap((x) => x.options));
        labels.forEach((l, oi) => { if (!covered.has(oi)) warnings.push(`W${d.week}D${d.day} option without a branch: ${l}`); });
      }
      steps.push({ t: 'choice', id, labels: labels.map(tokens), mode: branches.length ? mode : 'flavor', branches });
      i = j; continue;
    }
    if (blk.t === 'quote') {
      const text = quoteText(blk.lines);
      const step = { t: 'say', text };
      if (pendingCond) step.cond = pendingCond;
      if (/Seeker Fragment has been added to your Chest/.test(text)) step.fragment = true;
      steps.push(step);
      pendingCond = undefined;
      i++; continue;
    }
    i++;
  }
  // The Pull is the last bold line before the summary card.
  const sumIdx = steps.findIndex((s) => s.t === 'summary');
  const pull = [...steps.slice(0, sumIdx)].reverse().find((s) => s.t === 'say' && !s.cond && /\*\*[^*]+\*\*$/.test(s.text));
  if (pull) pull.pull = true;
  else warnings.push(`W${d.week}D${d.day} no Pull found`);
  return { week: d.week, day: d.day, title: d.title, heading: tokens(heading), question, steps };
}

const days = parseAll().map(buildDay);

const header = `// Generated by scripts/gen-chapter-scripts.cjs from docs/canon/episode-*.md. Do not edit by hand:
// change the episode file, then run \`node scripts/gen-chapter-scripts.cjs\`.
// Tokens filled at play time: {F1} {F2} {F3} = the first three friends after the player
// (canon's Mei, Dev, Jo); {N} = the party size as a word; {N-1} = one fewer.

import { AttributeName } from './mythiosRulesData';

export type ScriptCond =
  | { on: 'challenge'; pass: boolean }
  | { on: 'press' }
  | { on: 'fight'; won: boolean }
  | { on: 'claim'; key: string; has: boolean };

export type StrikeFirstRule =
  | { on: 'player' }
  | { on: 'challenge' }
  | { on: 'choice'; choice: number; options: number[] };

export type ScriptStep =
  | { t: 'say'; text: string; cond?: ScriptCond; fragment?: boolean; pull?: boolean }
  | { t: 'act'; label: string }
  | {
      t: 'choice';
      id: number;
      labels: string[];
      /** pick: only the picked branch · each: pick until every branch is seen · auto: picked, then the rest · flavor: no branches */
      mode: 'pick' | 'each' | 'auto' | 'flavor';
      branches: { options: number[]; text: string }[];
    }
  | { t: 'notice'; lines: Partial<Record<AttributeName, { first: string; second?: string }>> }
  | {
      t: 'challenge';
      title: string;
      desc: string;
      options: { attr: AttributeName; verb: string }[];
      reward: string;
      fail: string;
      /** A card made harder by an earlier result, with the line that says why. */
      harderIf?: { key: string; has: boolean; by: number; line: string };
    }
  | { t: 'press'; title: string; detail: string; harder: number; reward: string }
  | {
      t: 'fight';
      name: string;
      desc: string;
      /** Canon's two lines: [when the player strikes first, when the enemy does]. */
      firstLines: [string, string] | null;
      strikeFirst: StrikeFirstRule;
    }
  | { t: 'summary'; lines: string[] };

export interface ChapterScript {
  week: number;
  day: number;
  title: string;
  heading: string;
  question: string;
  steps: ScriptStep[];
}

export const CHAPTER_SCRIPTS: ChapterScript[] = `;

fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'data', 'chapterScripts.ts'),
  header + JSON.stringify(days, null, 2) + ';\n'
);
console.log(`${days.length} days written to src/data/chapterScripts.ts`);
warnings.forEach((w) => console.log('  ' + w));
