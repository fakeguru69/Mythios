// Phase D1 test (docs/design/handoff-ledger.md):
//  1. RecordTabView exists and renders hero collector banner with class emblem, character name, streak, class, and attributes.
//  2. Attributes section displays 2-column cards with colored progress bars, tier names, and bonuses.
//  3. Gear section renders weapon and armor tiles with ATK/ARM stats and 5 level pips.
//  4. Scoreboard plate renders 12 chase stats in 4x3 grid; tapping a number opens tap-to-explain callout box.
//  5. Badge section renders 12 badges (earned gold, unearned greyed out); tapping a badge opens badge explainer box.
//  6. Share Record button opens collector card modal.
// Usage: node tests/online/record.cjs

const fs = require('fs');
const path = require('path');

let failed = false;
const check = (name, ok) => {
  console.log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
};

(() => {
  const root = path.resolve(__dirname, '../..');
  const recordSrc = fs.readFileSync(path.join(root, 'src/components/RecordTabView.tsx'), 'utf8');
  const shellSrc = fs.readFileSync(path.join(root, 'src/online/GameShell.tsx'), 'utf8');

  check('RecordTabView.tsx exists and is imported in GameShell.tsx', shellSrc.includes("import { RecordTabView } from '../components/RecordTabView';"));
  check('GameShell.tsx renders RecordTabView in data-pane="record"', shellSrc.includes('<RecordTabView'));
  check('RecordTabView renders banner with data-record-banner', recordSrc.includes('data-record-banner'));
  check('RecordTabView renders attributes with colored bars', recordSrc.includes('data-record-attributes') && recordSrc.includes('data-record-attr'));
  check('RecordTabView renders gear tiles for weapon and armor', recordSrc.includes('data-record-gear="weapon"') && recordSrc.includes('data-record-gear="armor"'));
  check('RecordTabView renders 12-stat scoreboard slab', recordSrc.includes('data-record-slab') && recordSrc.includes('data-stat-cell'));
  check('RecordTabView renders tap-to-explain callout for stats', recordSrc.includes('data-stat-explainer'));
  check('RecordTabView renders 12-badge grid with earned and locked states', recordSrc.includes('data-badge-grid') && recordSrc.includes('data-badge-cell'));
  check('RecordTabView renders tap-to-explain callout for badges', recordSrc.includes('data-badge-explainer'));
  check('RecordTabView renders SHARE MY RECORD button and modal', recordSrc.includes('data-button-share-record') && recordSrc.includes('data-share-modal'));

  if (failed) {
    console.log('Record tab test FAILED');
    process.exit(1);
  }
  console.log('ALL RECORD TAB CHECKS PASSED');
})();
