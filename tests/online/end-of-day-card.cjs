// Piece C4 (docs/design/handoff-ledger.md): The end-of-day card (three coloured results,
// learned, carry, tomorrow) with one button to the fire; no repeated Pull.
const fs = require('fs');
const path = require('path');

let failed = 0;
function check(cond, label, detail) {
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ` — ${detail}` : ''}`);
  if (!cond) failed += 1;
}

const root = path.join(__dirname, '..', '..');
const day = fs.readFileSync(path.join(root, 'src/online/OnlineDay.tsx'), 'utf8');
const demo = fs.readFileSync(path.join(root, 'src/components/StoryAndPartyTabs.tsx'), 'utf8');

const summarySlice = day.slice(day.indexOf("if (step.t === 'summary')"), day.indexOf("if (nextDay)"));

// 1. End-of-day card present with dedicated container.
check(
  /data-end-of-day-card/.test(summarySlice) && /DAY SUMMARY/.test(summarySlice),
  'OnlineDay renders the end-of-day summary card with DAY SUMMARY header'
);

// 2. Three coloured results: Gold, Growth, Fragment.
check(
  /data-summary-results/.test(summarySlice) &&
    /data-result-gold/.test(summarySlice) &&
    /data-result-growth/.test(summarySlice) &&
    /data-result-fragment/.test(summarySlice),
  'OnlineDay has three result blocks: gold, growth, fragment'
);

check(
  /text-\[#E5C158\][\s\S]{0,80}\{goldDisplay\}/.test(summarySlice) &&
    /text-\[#C084FC\][\s\S]{0,80}\{growthDisplay\}/.test(summarySlice) &&
    /text-\[#7AA7FF\][\s\S]{0,80}\{fragDisplay\}/.test(summarySlice),
  'Three results are in colour: Gold #E5C158, Growth #C084FC, Fragment #7AA7FF'
);

// 3. What you learned.
check(
  /data-summary-learned/.test(summarySlice) &&
    /WHAT YOU LEARNED/.test(summarySlice) &&
    /text-\[16px\]/.test(summarySlice),
  'OnlineDay renders WHAT YOU LEARNED section with 16px text'
);

// 4. What you carry.
check(
  /data-summary-carry/.test(summarySlice) &&
    /WHAT YOU CARRY/.test(summarySlice) &&
    /text-\[16px\]/.test(summarySlice),
  'OnlineDay renders WHAT YOU CARRY section with 16px text'
);

// 5. Tomorrow with gold label.
check(
  /data-summary-tomorrow/.test(summarySlice) &&
    /data-tomorrow-label/.test(summarySlice) &&
    /text-\[#E5C158\]/.test(summarySlice),
  'OnlineDay renders TOMORROW with gold label (data-tomorrow-label)'
);

// 6. One button to the fire ("Sit by the fire" / "One more look" in thread; SIT BY THE FIRE button if non-embedded).
check(
  /data-button-to-fire/.test(day) &&
    /SIT BY THE FIRE/.test(day) &&
    !/🔥 THE LAST LIGHT/.test(day) &&
    !/BACK TO THE PARTY/.test(day),
  'Replaced multiple buttons (THE LAST LIGHT, BACK TO THE PARTY) with one button to the fire'
);

// 7. No repeated Pull after the summary card.
const afterSummary = day.slice(day.indexOf("if (step.t === 'summary')"));
check(
  !/\.pull\b/.test(afterSummary) && !/cliffhangerPull/.test(afterSummary),
  'The last paragraph (the Pull) is not repeated after the summary card'
);

// 8. StoryAndPartyTabs also has the updated end-of-day card with three coloured results.
check(
  /data-end-of-day-card/.test(demo) &&
    /data-summary-results/.test(demo) &&
    /data-result-gold/.test(demo) &&
    /data-result-growth/.test(demo) &&
    /data-result-fragment/.test(demo) &&
    /WHAT YOU LEARNED/.test(demo) &&
    /WHAT YOU CARRY/.test(demo),
  'StoryAndPartyTabs renders matching end-of-day card with 3 coloured results, learned, and carry'
);

if (failed > 0) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
console.log('Piece C4 (end-of-day card) passed all 8 checks');
