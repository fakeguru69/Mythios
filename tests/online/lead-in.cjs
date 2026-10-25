// Lead-ins before every card (Phase 5, 24 Oct; was Piece C5's bare "…"): every notice, Challenge, fight and press
// card follows a line of story (a passage, or a choice's branches); none follows a bare "…" or comes cold after the
// notice lines; where nothing else leads in, the generator's LEAD_INS supplies one real sentence.
const fs = require('fs');
const path = require('path');

let failed = 0;
const check = (cond, label, detail) => {
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ` — ${detail}` : ''}`);
  if (!cond) failed += 1;
};

const root = path.join(__dirname, '..', '..');
const genScript = fs.readFileSync(path.join(root, 'scripts/gen-chapter-scripts.cjs'), 'utf8');
const text = fs.readFileSync(path.join(root, 'src/data/chapterScripts.ts'), 'utf8');
const marker = 'export const CHAPTER_SCRIPTS: ChapterScript[] = ';
const CHAPTER_SCRIPTS = JSON.parse(text.slice(text.indexOf(marker) + marker.length, text.lastIndexOf(']') + 1));
check(CHAPTER_SCRIPTS.length === 36, 'CHAPTER_SCRIPTS has all 36 days');
check(/const LEAD_INS = \{/.test(genScript) && /LEAD_INS\[key\]/.test(genScript), 'the generator supplies real lead-in sentences (LEAD_INS)');

const isStory = (st) => st && (st.t === 'say' || (st.t === 'choice' && st.branches && st.branches.length > 0));
let cards = 0;
const cold = [];
const bare = [];
for (const c of CHAPTER_SCRIPTS) {
  c.steps.forEach((s, i) => {
    if (s.t === 'say' && /(^|\n\n)(…|\.\.\.)$/.test(s.text.trim())) bare.push(`W${c.week}D${c.day} step ${i}`);
    if (s.t === 'choice') s.branches.forEach((b) => /\n\n(…|\.\.\.)$/.test(b.text.trim()) && bare.push(`W${c.week}D${c.day} step ${i}`));
    if (!['notice', 'challenge', 'fight', 'press'].includes(s.t)) return;
    cards += 1;
    // A press follows its Challenge's pass lines; the others follow the step before them.
    const before = s.t === 'press' ? [...c.steps.slice(0, i)].reverse().find((st) => st.t === 'say') : c.steps[i - 1];
    if (!isStory(before)) cold.push(`W${c.week}D${c.day} ${s.t}`);
  });
}
check(bare.length === 0, 'no bare "…" is left in any passage or branch', bare.join(', ') || undefined);
check(cold.length === 0, `every one of the ${cards} cards follows a line of story`, cold.join(', ') || undefined);
check(Object.keys(eval('(' + genScript.match(/const LEAD_INS = (\{[\s\S]*?\n\});/)[1] + ')')).length === 12, 'twelve LEAD_INS lines, one for each card that would otherwise come cold');

if (failed) {
  console.log(`${failed} check(s) failed`);
  process.exit(1);
}
console.log('Lead-in test passed all checks');
