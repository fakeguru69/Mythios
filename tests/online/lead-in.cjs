// Piece C5 (docs/design/handoff-ledger.md): The "…" lead-in before every Challenge,
// fight and roll card (all 36 days, through the generator, not by hand).
const fs = require('fs');
const path = require('path');

let failed = 0;
const check = (cond, label, detail) => {
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ` — ${detail}` : ''}`);
  if (!cond) failed += 1;
};

const root = path.join(__dirname, '..', '..');
const genScript = fs.readFileSync(path.join(root, 'scripts/gen-chapter-scripts.cjs'), 'utf8');
const chapterScriptsText = fs.readFileSync(path.join(root, 'src/data/chapterScripts.ts'), 'utf8');
const dayParts = fs.readFileSync(path.join(root, 'src/components/ChapterScriptParts.tsx'), 'utf8');
const dayComponent = fs.readFileSync(path.join(root, 'src/online/OnlineDay.tsx'), 'utf8');

// 1. Generator has ensureLeadInBeforeCard and ensureLeadInForPress
check(
  /function ensureLeadInBeforeCard/.test(genScript) &&
    /function ensureLeadInForPress/.test(genScript) &&
    /ensureLeadInBeforeCard\(\);[\s\S]{0,100}steps\.push\(\{\s*t:\s*'notice'/.test(genScript) &&
    /ensureLeadInBeforeCard\(\);[\s\S]{0,100}steps\.push\(\{\s*t:\s*'challenge'/.test(genScript) &&
    /ensureLeadInForPress\(\);[\s\S]{0,100}steps\.push\(\{\s*t:\s*'press'/.test(genScript) &&
    /ensureLeadInBeforeCard\(\);[\s\S]{0,600}steps\.push\(\{\s*t:\s*'fight'/.test(genScript),
  'scripts/gen-chapter-scripts.cjs adds the "…" lead-in before Challenge, fight, press, and notice cards through the generator'
);

// 2. Check all 36 days in generated chapterScripts.ts
const marker = 'export const CHAPTER_SCRIPTS: ChapterScript[] = ';
const jsonStart = chapterScriptsText.indexOf(marker) + marker.length;
const jsonEnd = chapterScriptsText.lastIndexOf(']');
const CHAPTER_SCRIPTS = JSON.parse(chapterScriptsText.slice(jsonStart, jsonEnd + 1));
check(CHAPTER_SCRIPTS.length === 36, 'CHAPTER_SCRIPTS has all 36 days');

let challengeCount = 0;
let challengeWithLeadIn = 0;
let fightCount = 0;
let fightWithLeadIn = 0;
let pressCount = 0;
let pressWithLeadIn = 0;
let noticeCount = 0;
let noticeWithLeadIn = 0;

for (const c of CHAPTER_SCRIPTS) {
  c.steps.forEach((s, idx) => {
    const prev = c.steps[idx - 1];
    const prevEndsWithEllipsis = (step) => {
      if (!step) return false;
      if (step.t === 'say') {
        const text = step.text.trim();
        return text.endsWith('…') || text.endsWith('...');
      }
      if (step.t === 'choice') {
        return (
          step.branches &&
          step.branches.length > 0 &&
          step.branches.every((b) => b.text.trim().endsWith('…') || b.text.trim().endsWith('...'))
        );
      }
      return false;
    };

    if (s.t === 'challenge') {
      challengeCount += 1;
      if (prevEndsWithEllipsis(prev)) challengeWithLeadIn += 1;
    } else if (s.t === 'fight') {
      fightCount += 1;
      if (prevEndsWithEllipsis(prev)) fightWithLeadIn += 1;
    } else if (s.t === 'press') {
      pressCount += 1;
      const passStep =
        [...c.steps.slice(0, idx)]
          .reverse()
          .find((st) => st.t === 'say' && st.cond?.on === 'challenge' && st.cond?.pass === true) ||
        c.steps[idx - 1];
      if (prevEndsWithEllipsis(passStep)) pressWithLeadIn += 1;
    } else if (s.t === 'notice') {
      noticeCount += 1;
      if (prevEndsWithEllipsis(prev)) noticeWithLeadIn += 1;
    }
  });
}

check(
  challengeCount > 0 && challengeCount === challengeWithLeadIn,
  `All Challenge cards have a lead-in "…" line (${challengeWithLeadIn}/${challengeCount})`
);
check(
  fightCount > 0 && fightCount === fightWithLeadIn,
  `All Fight cards have a lead-in "…" line (${fightWithLeadIn}/${fightCount})`
);
check(
  pressCount > 0 && pressCount === pressWithLeadIn,
  `All Press On cards have a lead-in "…" line on their pass branch (${pressWithLeadIn}/${pressCount})`
);
check(
  noticeCount > 0 && noticeCount === noticeWithLeadIn,
  `All 36 days have a lead-in "…" line before What You Notice (${noticeWithLeadIn}/${noticeCount})`
);

// 3. UI rendering check: NarrationBlock and ScriptText output [data-lead-in] with 18px text
check(
  /data-lead-in/.test(dayParts) && /text-\[18px\]/.test(dayParts),
  'ChapterScriptParts.tsx renders [data-lead-in] with 18px text'
);

// 4. OnlineDay card container hooks: data-challenge-card, data-fight-card, data-press-card
check(
  /data-challenge-card/.test(dayComponent) &&
    /data-fight-card/.test(dayComponent) &&
    /data-press-card/.test(dayComponent),
  'OnlineDay.tsx has data-challenge-card, data-fight-card, and data-press-card container markers'
);

process.exit(failed ? 1 : 0);
