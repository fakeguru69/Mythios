// Piece C1 (docs/design/handoff-ledger.md): Text sizes (story 18px, other 16px) and the voice key
// (colour for MYTHIOS, how-to lines, Garrick, friends, your choices, the Notice, Tomorrow).
const fs = require('fs');
const path = require('path');

let failed = 0;
function check(cond, label, detail) {
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ` — ${detail}` : ''}`);
  if (!cond) failed += 1;
}

const root = path.join(__dirname, '..', '..');
const parts = fs.readFileSync(path.join(root, 'src/components/ChapterScriptParts.tsx'), 'utf8');
const day = fs.readFileSync(path.join(root, 'src/online/OnlineDay.tsx'), 'utf8');
const fire = fs.readFileSync(path.join(root, 'src/online/FireChat.tsx'), 'utf8');
const partyChat = fs.readFileSync(path.join(root, 'src/online/PartyChat.tsx'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'src/online/ui.tsx'), 'utf8');
const css = fs.readFileSync(path.join(root, 'src/index.css'), 'utf8');

// 1. MYTHIOS telling the story: one serif, 18px, white (#F4F1F8), no italics, no side bar.
const narrationBlock = parts.slice(parts.indexOf('export const NarrationBlock'), parts.indexOf('export const HowItWorks'));
check(
  /font-\['Cormorant_Garamond',serif\]/.test(narrationBlock) &&
    /text-\[18px\]/.test(narrationBlock) &&
    /text-\[#F4F1F8\]/.test(narrationBlock) &&
    !/border-l-2/.test(narrationBlock) &&
    !/\bitalic\b/.test(narrationBlock),
  'MYTHIOS NarrationBlock is 18px white Cormorant Garamond serif with no side bar and no italics'
);
check(
  /data-narration[\s\S]{0,260}font-\['Cormorant_Garamond',serif\][\s\S]{0,120}text-\[18px\][\s\S]{0,120}text-\[#F4F1F8\]/.test(fire),
  'FireChat NarrationMessage is 18px white Cormorant Garamond serif'
);

// 2. How-to lines: a small gold "HOW IT WORKS" strip.
const howItWorks = parts.slice(parts.indexOf('export const HowItWorks'), parts.indexOf('export const TapEcho'));
check(
  /data-how-it-works/.test(howItWorks) &&
    /HOW IT WORKS/.test(howItWorks) &&
    /text-\[#E5C158\]/.test(howItWorks) &&
    /text-\[16px\]/.test(howItWorks),
  'HowItWorks renders a gold HOW IT WORKS strip with 16px text'
);
const howCount = (day.match(/<HowItWorks\b/g) || []).length;
check(howCount >= 5, 'OnlineDay uses HowItWorks for all 5 how-to lines (aside, first Challenge, first growth, first fight, post-fight)', `count=${howCount}`);

// 3. Garrick: warm amber bubble with his name.
check(
  /data-garrick-line[\s\S]{0,200}>GARRICK<[\s\S]{0,250}bg-\[#2B1E10\][\s\S]{0,80}border-\[#6B5524\]/.test(fire) &&
    /data-garrick-line[\s\S]{0,200}>GARRICK<[\s\S]{0,250}bg-\[#2B1E10\][\s\S]{0,80}border-\[#6B5524\]/.test(partyChat),
  'Garrick renders in a warm amber bubble (#2B1E10 / #6B5524) with GARRICK header in FireChat and PartyChat'
);

// 4. Friends: bubbles with names (#C39BF5 name, #221636 bubble, 16px).
check(
  /text-\[#C39BF5\][\s\S]{0,250}text-\[16px\][\s\S]{0,250}bg-\[#221636\]/.test(fire) &&
    /text-\[#C39BF5\][\s\S]{0,250}text-\[16px\][\s\S]{0,250}bg-\[#221636\]/.test(partyChat),
  'Friends render in named bubbles (#C39BF5 name, #221636 bubble, 16px) in FireChat and PartyChat'
);

// 5. Your own choice: your bubble on the right.
const tapEcho = parts.slice(parts.indexOf('export const TapEcho'), parts.indexOf('export const ScriptButton'));
check(
  /justify-end/.test(tapEcho) &&
    /data-choice-echo/.test(tapEcho) &&
    /rounded-\[16px_16px_4px_16px\]/.test(tapEcho) &&
    /bg-\[#3A2A12\]/.test(tapEcho) &&
    /border-\[#8A6E34\]/.test(tapEcho) &&
    /text-\[16px\]/.test(tapEcho),
  'TapEcho renders your choice as a right-aligned bubble (#3A2A12 / #8A6E34) at 16px'
);

// 6. The Notice: a blue card.
const noticeBlock = parts.slice(parts.indexOf('export const NoticeBlock'));
check(
  /data-notice-card/.test(noticeBlock) &&
    /bg-\[#101C30\]/.test(noticeBlock) &&
    /border-\[#3B669E\]/.test(noticeBlock) &&
    /text-\[#7AA7FF\]/.test(noticeBlock) &&
    /text-\[16px\]/.test(noticeBlock),
  'NoticeBlock renders as a blue card (#101C30 / #3B669E / #7AA7FF) with 16px text'
);

// 7. Tomorrow: a gold label.
check(
  /data-tomorrow-label/.test(day) && /text-\[#E5C158\]/.test(day),
  'OnlineDay renders Tomorrow: with a gold label (data-tomorrow-label)'
);

// 8. Text sizes: 18px story, 16px other text, 16px inputs.
check(/text-\[16px\]/.test(ui), 'ui.tsx input class uses 16px text');
check(
  /input,\s*textarea,\s*select\s*\{\s*font-size:\s*16px\s*!important;/m.test(css) &&
    /\[data-game-shell\]\s*\[data-mythios-story\]\s*p/.test(css) &&
    /\[data-game-shell\]\s*\.text-\\\[15px\\\]\s*\{\s*font-size:\s*16px;\s*\}/.test(css),
  'index.css enforces 18px story, 16px reading text, and 16px form inputs'
);

if (failed > 0) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
console.log('Voice key & text sizes test (C1) passed all 11 checks');
