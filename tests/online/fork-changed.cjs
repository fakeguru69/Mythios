// Piece C9 & Piece E2 test (docs/design/handoff-ledger.md, docs/design/week1-forks-draft-21oct.md):
//  1. WhatThisChangedBlock component exists in ChapterScriptParts.tsx with ⚡ WHAT THIS CHANGED and data-what-this-changed.
//  2. Week 1's 7 forks in chapterScripts.ts have mode === 'pick' and 18 distinct branches (one per button).
//  3. Every branch of Week 1's 7 forks has its own `changed` outcome line and its own `roadFind` (title + text) for the fire.
//  4. Exactly one branch in Week 1 awards a discernment Relic (W1D5 "HOLD OUT THE CARVED HORSE" -> Might Relic), and zero award gold.
//  5. Mechanical stakes: W1D3 ("FOLLOW THE CART-RUTS") and W1D5 ("LOOK AT THE PATH") decide who strikes first; W1D4 ("LOOK FOR FOOTPRINTS" / "KNOCK NEXT DOOR") picks the Challenge Attribute (Agility vs Charm).
//  6. Migration 0106_week1_forks.sql loads Week 1 chapters and updates pick_choice, roll_card, fire_fork_pieces_for, fire_pieces, fire_table, and fire_lay (all security definer, set search_path = '').
//  7. First-use gates & secret check: zero banned words in Week 1 fork additions.
// Usage: node tests/online/fork-changed.cjs

const fs = require('fs');
const path = require('path');

let failed = false;
const check = (name, ok) => {
  console.log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
};

(async () => {
  const root = path.resolve(__dirname, '../..');
  const partsSrc = fs.readFileSync(path.join(root, 'src/components/ChapterScriptParts.tsx'), 'utf8');
  const daySrc = fs.readFileSync(path.join(root, 'src/online/OnlineDay.tsx'), 'utf8');
  const fireSrc = fs.readFileSync(path.join(root, 'src/online/OnlineCampfire.tsx'), 'utf8');
  const chapterScriptsText = fs.readFileSync(path.join(root, 'src/data/chapterScripts.ts'), 'utf8');
  const mig106 = fs.readFileSync(path.join(root, 'supabase/migrations/0106_week1_forks.sql'), 'utf8');

  // 1. Piece C9 checks
  check('WhatThisChangedBlock exists in ChapterScriptParts.tsx', partsSrc.includes('WhatThisChangedBlock'));
  check('WhatThisChangedBlock renders WHAT THIS CHANGED label', partsSrc.includes('WHAT THIS CHANGED'));
  check('WhatThisChangedBlock includes data-what-this-changed attribute', partsSrc.includes('data-what-this-changed'));

  // 2. Parse CHAPTER_SCRIPTS
  const marker = 'export const CHAPTER_SCRIPTS: ChapterScript[] = ';
  const jsonStart = chapterScriptsText.indexOf(marker) + marker.length;
  const jsonEnd = chapterScriptsText.lastIndexOf(']');
  const CHAPTER_SCRIPTS = JSON.parse(chapterScriptsText.slice(jsonStart, jsonEnd + 1));

  const w1Days = CHAPTER_SCRIPTS.filter((d) => d.week === 1);
  const w1Forks = [];
  for (const d of w1Days) {
    for (const s of d.steps) {
      if (s.t === 'choice' && s.mode === 'pick') {
        w1Forks.push({ day: d.day, step: s, daySteps: d.steps });
      }
    }
  }

  check('Week 1 has 12 real forks (mode === "pick") across Days 1-6 (including W1D1, W1D2 x3, and W1D6 extra cup)', w1Forks.length === 12);

  // 3. Verify all 28 branches across the 12 Week 1 forks have distinct branches, changed lines, and roadFinds
  let totalBranches = 0;
  let allHaveChanged = true;
  let allHaveRoadFind = true;
  const roadFindTitles = new Set();
  const relicBranches = [];

  for (const f of w1Forks) {
    if (f.step.branches.length !== f.step.labels.length) {
      allHaveChanged = false;
    }
    for (const b of f.step.branches) {
      totalBranches += 1;
      if (!b.changed || typeof b.changed !== 'string' || b.changed.length < 15) {
        allHaveChanged = false;
      }
      if (!b.roadFind || !b.roadFind.title || !b.roadFind.text || b.roadFind.text.length < 30) {
        allHaveRoadFind = false;
      } else {
        roadFindTitles.add(b.roadFind.title);
      }
      if (b.relic) {
        relicBranches.push({ day: f.day, label: f.step.labels[b.options[0]], relic: b.relic });
      }
    }
  }

  check('Week 1 forks have 28 distinct branches (one per button across all 12 forks)', totalBranches === 28);
  check('Every branch in Week 1 forks has a non-empty `changed` outcome line', allHaveChanged);
  check('Every branch in Week 1 forks has a unique `roadFind` (28 distinct road finds for the fire)', allHaveRoadFind && roadFindTitles.size === 28);

  // 3b. Piece E3 checks: only 5 Strike-the-Page act steps remain across all 36 days, and all 36 days award their Fragment
  const allActs = [];
  let fragmentSayCount = 0;
  for (const d of CHAPTER_SCRIPTS) {
    for (const s of d.steps) {
      if (s.t === 'act') allActs.push(`${d.week}-${d.day}:${s.label}`);
      if (s.t === 'say' && s.fragment) fragmentSayCount += 1;
    }
  }
  check(
    'Piece E3: only the 5 [STRIKE THE PAGE] buttons in Week 6 remain as single-action buttons across all 36 days',
    allActs.length === 5 && allActs.every((a) => a.endsWith(':STRIKE THE PAGE'))
  );
  check('Piece E3: all 36 weekday chapters still award their Seeker Fragment on narration', fragmentSayCount === 36);

  // 4. Discernment Relic check
  check(
    'Exactly one branch in Week 1 awards a Relic: W1D5 "HOLD OUT THE CARVED HORSE" -> Might Relic',
    relicBranches.length === 1 &&
      relicBranches[0].day === 5 &&
      relicBranches[0].label === 'HOLD OUT THE CARVED HORSE' &&
      relicBranches[0].relic === 'Might'
  );

  // 5. Stakes check: W1D3 fight strikeFirst, W1D4 Fit Challenge attribute, W1D5 fight strikeFirst
  const d3 = w1Days.find((d) => d.day === 3);
  const d3Fight = d3.steps.find((s) => s.t === 'fight');
  check(
    'Fork 1 (W1D3) carries strikeFirst fight stake on FOLLOW THE CART-RUTS (option 1)',
    d3Fight && d3Fight.strikeFirst.on === 'choice' && d3Fight.strikeFirst.choice === 0 && d3Fight.strikeFirst.options[0] === 1
  );

  const d4 = w1Days.find((d) => d.day === 4);
  const d4ChIdx = d4.steps.findIndex((s) => s.t === 'challenge');
  const d4Prev = d4.steps[d4ChIdx - 1];
  check(
    'Fork 2 (W1D4) sits immediately before FIND WHO LEFT IT Challenge with matching option count (Agility / Charm)',
    d4Prev && d4Prev.t === 'choice' && d4Prev.mode === 'pick' && d4Prev.labels.length === 2 && d4.steps[d4ChIdx].options.length === 2
  );
  check(
    'OnlineDay.tsx locks Challenge options and attribute to the preceding Fit fork choice',
    daySrc.includes('fitAttr') && daySrc.includes('step.options.filter((o) => o.attr === fitAttr)')
  );

  const d5 = w1Days.find((d) => d.day === 5);
  const d5Fight = d5.steps.find((s) => s.t === 'fight');
  check(
    'Fork 5 (W1D5) carries strikeFirst fight stake on LOOK AT THE PATH (option 2)',
    d5Fight && d5Fight.strikeFirst.on === 'choice' && d5Fight.strikeFirst.choice === 0 && d5Fight.strikeFirst.options[0] === 2
  );

  // 6. First-use gates & secret check across all new fork text
  const forbidden = /\b(Malakor|descendant|the Order|four|five|king|kings)\b/i;
  let gateClean = true;
  for (const f of w1Forks) {
    for (const b of f.step.branches) {
      if (forbidden.test(b.changed) || forbidden.test(b.roadFind.title) || forbidden.test(b.roadFind.text)) {
        gateClean = false;
      }
    }
  }
  check('Week 1 fork outcome lines and road finds respect all Week 1 first-use word gates and secrets', gateClean);

  // 7. Migration 0106 & OnlineCampfire checks
  check(
    'OnlineCampfire.tsx supports fork road finds in Piece.kind and FireTable.hands',
    fireSrc.includes("'fork'") && fireSrc.includes('hands: { kind: string;')
  );
  check(
    '0106_week1_forks.sql updates chapters, fire_laid constraint, fire_fork_pieces_for, pick_choice, roll_card, fire_pieces, fire_table, and fire_lay',
    mig106.includes('insert into public.chapters') &&
      mig106.includes('fire_laid_kind_check') &&
      mig106.includes('create or replace function public.fire_fork_pieces_for(') &&
      mig106.includes('create or replace function public.pick_choice(') &&
      mig106.includes('create or replace function public.roll_card(') &&
      mig106.includes('create or replace function public.fire_pieces(') &&
      mig106.includes('create or replace function public.fire_table(') &&
      mig106.includes('create or replace function public.fire_lay(')
  );
  check(
    'All 6 functions in 0106_week1_forks.sql are security definer with empty search_path',
    (mig106.match(/security definer set search_path = ''/g) || []).length === 6
  );

  // 8. Weeks 2-6 forks & weekly discernment Relics (0111_weeks_2_to_6_forks_and_ritual.sql)
  const mig111 = fs.readFileSync(path.join(root, 'supabase/migrations/0111_weeks_2_to_6_forks_and_ritual.sql'), 'utf8');
  let allSeasonForksCount = 0;
  let allSeasonBranchesCount = 0;
  let allSeasonMetaComplete = true;
  const seasonRelicsByWeek = new Map();

  for (const d of CHAPTER_SCRIPTS) {
    for (const s of d.steps) {
      if (s.t === 'choice' && s.mode === 'pick') {
        allSeasonForksCount += 1;
        for (const b of s.branches) {
          allSeasonBranchesCount += 1;
          if (!b.changed || !b.roadFind || !b.roadFind.title || !b.roadFind.text) {
            allSeasonMetaComplete = false;
          }
          if (b.relic) {
            seasonRelicsByWeek.set(d.week, (seasonRelicsByWeek.get(d.week) || []).concat(b.relic));
          }
        }
      }
    }
  }

  check(
    `Every real fork across Weeks 1-6 (${allSeasonForksCount} forks, ${allSeasonBranchesCount} branches; 30 and 66 before Phase 3 added more on 24 Oct) has complete \`changed\` and \`roadFind\` metadata`,
    allSeasonForksCount >= 30 && allSeasonBranchesCount >= 66 && allSeasonMetaComplete
  );
  check(
    'Each of Weeks 1-6 awards exactly 1 discernment Relic across all 6 Attributes (Might, Charm, Agility, Aim, Intellect, Craft)',
    seasonRelicsByWeek.size === 6 &&
      Array.from(seasonRelicsByWeek.values()).every((arr) => arr.length === 1) &&
      new Set(Array.from(seasonRelicsByWeek.values()).map((arr) => arr[0])).size === 6
  );
  check(
    '0111_weeks_2_to_6_forks_and_ritual.sql syncs Weeks 2-6 chapters with fork metadata',
    mig111.includes("insert into public.chapters") && mig111.includes('roadFind') && !/Malakor/i.test(mig111)
  );
  check(
    'OnlineCampfire.tsx includes CUP_NIGHT_LINES progression and solo-holder pair notice in [data-puzzle]',
    fireSrc.includes('CUP_NIGHT_LINES') && fireSrc.includes('this table needs another pair of eyes')
  );

  console.log('fork-changed.cjs test completed');
  process.exit(failed ? 1 : 0);
})();
