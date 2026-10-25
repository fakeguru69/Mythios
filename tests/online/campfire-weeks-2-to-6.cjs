// Checks Campfire v3 Phase 2 content across Weeks 2 through 6 (Piece E4) and Supabase SQL migration sync.
const fs = require('fs');
const path = require('path');
const { CAMPFIRE_DAYS_DATA, runCampfireV22Verifier, CUP_NIGHT_IDS, QUIET_DAY_IDS } = require('../../src/data/campfireDaysData.ts');

let failed = false;
const check = (name, ok) => {
  console.log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
};

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

// Check that all clicks reference valid lead/press pieces (and never require [PRESS ON])
let allClickPiecesValid = true;
for (const d of w2to6) {
  if (d.clicks) {
    for (const c of d.clicks) {
      if (!c.a || !c.b || !c.text || c.a === 'press' || c.b === 'press') allClickPiecesValid = false;
    }
  }
}
check('All clicks have non-empty a, b, and text, and zero [PRESS ON] dependencies', allClickPiecesValid);

// Riddles removed from Campfire v3
const zeroRiddles = w2to6.every((d) => d.riddle === null);
check('All 30 days in Weeks 2-6 have riddle: null (riddles dropped in v3)', zeroRiddles);

// 3. Verify supabase/migrations/0108_campfire_weeks_2_to_6.sql sync
const migPath = path.join(__dirname, '..', '..', 'supabase', 'migrations', '0108_campfire_weeks_2_to_6.sql');
const migSql = fs.readFileSync(migPath, 'utf8');
// Later title edits (W3D5, W6D3) were loaded by scripts/gen-campfire-sql.ts and md5-compared with live, not written into
// 0108, so the loader's own output is the copy to check (25 Oct).
const { execFileSync } = require('child_process');
const genSql = [2, 3, 4, 5, 6].map((w) => execFileSync('npx', ['tsx', path.join(__dirname, '..', '..', 'scripts', 'gen-campfire-sql.ts'), String(w)], { encoding: 'utf8' })).join('\n');
const allQuestionsInSql = w2to6.every((d) => genSql.includes(d.questionTitle.replace(/'/g, "''")) || genSql.includes(JSON.stringify(d.questionTitle).slice(1, -1).replace(/'/g, "''")));
check('All 30 Weeks 2-6 questionTitles are in the Campfire loader (scripts/gen-campfire-sql.ts)', allQuestionsInSql);
check('0108_campfire_weeks_2_to_6.sql updates fire_check_clicks with lead: prefix support', migSql.includes("'lead:' || (c ->> 'a')"));
check('0108_campfire_weeks_2_to_6.sql updates party_read_backs and gathering_read_backs for Weeks 1-6', migSql.includes('create or replace function public.party_read_backs') && migSql.includes('create or replace function public.gathering_read_backs'));
check('Zero QA/secret leaks (Malakor, bearsOnFork, qaNote) in 0108_campfire_weeks_2_to_6.sql', !/Malakor|bearsOnFork|qaNote/.test(migSql));

if (failed) {
  console.error('Some checks failed.');
  process.exit(1);
} else {
  console.log('campfire-weeks-2-to-6.cjs test passed all 19 checks');
  process.exit(0);
}
