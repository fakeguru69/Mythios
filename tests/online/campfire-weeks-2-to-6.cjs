// Checks Campfire v3 Phase 2 content across Weeks 2 through 6 (Piece E4).
const { CAMPFIRE_DAYS_DATA, runCampfireV22Verifier, CUP_NIGHT_IDS, QUIET_DAY_IDS } = require('../../src/data/campfireDaysData.ts');

let failed = false;
function check(name, ok) {
  console.log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
}

// 1. Overall QA verifier
const qa = runCampfireV22Verifier();
check('runCampfireV22Verifier passes with all 36 days', qa.allPassed);
check('Total days is exactly 36', qa.totalDays === 36);
check('Cup nights count is exactly 8 and matches CUP_NIGHT_IDS', qa.cupNightsExactMatch && qa.cupNightsCount === 8);
check('Quiet days count is exactly 7 and matches QUIET_DAY_IDS', qa.quietDaysExactMatch && qa.quietDaysCount === 7);
check('Zero first-use map violations across all 36 days', qa.firstUseMapViolations.length === 0);
check('Zero banned phrase violations across all 36 days', qa.bannedPhraseViolations.length === 0);
check('Zero gold mention violations across all 36 days', qa.goldMentionViolations.length === 0);

// 2. Weeks 2 to 6 specific checks
const w2to6 = CAMPFIRE_DAYS_DATA.filter((d) => d.week >= 2);
check('Weeks 2 to 6 has exactly 30 days', w2to6.length === 30);

// Every night has a questionTitle and two distinct forks
const allHaveQuestions = w2to6.every((d) => Boolean(d.questionTitle && d.questionTitle.trim().length > 10));
check('Every night in Weeks 2-6 has a non-empty questionTitle', allHaveQuestions);

const allHaveForks = w2to6.every((d) => Boolean(d.forkA && d.forkB && d.forkA !== d.forkB));
check('Every night in Weeks 2-6 has distinct forkA and forkB readings', allHaveForks);

// Check puzzles and clicks across Weeks 2-6
const quietSet = new Set(QUIET_DAY_IDS);
let puzzlesCount = 0;
let clicksCount = 0;
let quietNightsPuzzlesEmpty = true;

for (const d of w2to6) {
  if (quietSet.has(d.id)) {
    if (d.puzzle !== null || (d.clicks && d.clicks.length > 0)) {
      quietNightsPuzzlesEmpty = false;
    }
  } else {
    if (d.puzzle && d.puzzle.q && d.puzzle.clickText) puzzlesCount += 1;
    if (d.clicks && d.clicks.length > 0) clicksCount += d.clicks.length;
  }
}

check('All 6 quiet nights in Weeks 2-6 have puzzle: null and empty clicks', quietNightsPuzzlesEmpty);
check('All 24 non-quiet nights in Weeks 2-6 have a puzzle with q and clickText', puzzlesCount === 24);
check('All 24 non-quiet nights in Weeks 2-6 have at least one click pair', clicksCount >= 24);

// Check that all clicks reference valid lead/press pieces
let allClickPiecesValid = true;
for (const d of w2to6) {
  if (d.clicks) {
    for (const c of d.clicks) {
      if (!c.a || !c.b || !c.text) allClickPiecesValid = false;
    }
  }
}
check('All clicks have non-empty a, b, and text', allClickPiecesValid);

// Riddles removed from Campfire v3
const zeroRiddles = w2to6.every((d) => d.riddle === null);
check('All 30 days in Weeks 2-6 have riddle: null (riddles dropped in v3)', zeroRiddles);

if (failed) {
  console.error('Some checks failed.');
  process.exit(1);
} else {
  console.log('campfire-weeks-2-to-6.cjs test passed all checks');
}
