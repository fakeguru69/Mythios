// Piece E1 test: Load Week 1's fire data (questions, read-backs, new leads, clicks, Garrick nudges, the narrated Fenmark night; Days 5 and 6 first answers at Gathering 1).
// Usage: node tests/online/campfire-week1-phase2.cjs

const fs = require('fs');
const path = require('path');

let failed = false;
const check = (name, ok) => {
  console.log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
};

(async () => {
  const root = path.resolve(__dirname, '../..');

  // 1. Data file checks: campfireDaysData.ts
  const cfSrc = fs.readFileSync(path.join(root, 'src/data/campfireDaysData.ts'), 'utf8');
  const cfMatch = cfSrc.match(/export const CAMPFIRE_DAYS_DATA:\s*CampfireDayEntry\[\]\s*=\s*(\[[\s\S]*?\]);\n/);
  const CAMPFIRE_DAYS_DATA = JSON.parse(cfMatch[1]);
  const w1 = CAMPFIRE_DAYS_DATA.filter((d) => d.week === 1);
  check('CAMPFIRE_DAYS_DATA has 6 days for Week 1', w1.length === 6);

  const d1 = w1.find((d) => d.day === 1);
  check(
    'Day 1 question: Who wrote the list? (narrated night, no riddle)',
    d1.questionTitle === 'Who wrote the list?' &&
    d1.forkA === 'The man on the road wrote it himself.' &&
    d1.forkB === 'Someone else wrote it. He only carried it.' &&
    d1.riddle === null &&
    d1.narratedNoGarrick === true &&
    d1.nudge.includes('A man who takes nothing')
  );

  const d2 = w1.find((d) => d.day === 2);
  check(
    'Day 2 question: When was the child taken? (puzzle: Did Meira leave in a hurry?, click: 1-2-2 + press, nudgeIfLaid)',
    d2.questionTitle === "The child in Meira's notes: when was that child taken?" &&
    d2.forkA === 'Lately. Whatever was happening there is happening now.' &&
    d2.forkB === 'Long ago. She was writing about an older taking.' &&
    d2.puzzle?.q === 'Did Meira leave in a hurry?' &&
    d2.clicks?.[0]?.a === '1-2-2' &&
    d2.clicks?.[0]?.b === 'press' &&
    d2.clicks?.[0]?.solves === true &&
    d2.nudgeIfLaid?.piece === '1-2-3' &&
    d2.nudgeIfLaid?.line.includes('that leaf')
  );

  const d3 = w1.find((d) => d.day === 3);
  check(
    'Day 3 question: Who was the man in the bracken working for? (puzzle: How long has this rock been watched?, click: 1-3-1 + 1-3-2)',
    d3.questionTitle === 'Who was the man in the bracken working for?' &&
    d3.forkA === 'The men who took the child.' &&
    d3.forkB === 'Fenmark. He was keeping watch for his own village.' &&
    d3.puzzle?.q === 'How long has this rock been watched?' &&
    d3.clicks?.[0]?.a === '1-3-1' &&
    d3.clicks?.[0]?.b === '1-3-2' &&
    d3.clicks?.[0]?.solves === true
  );

  const d4 = w1.find((d) => d.day === 4);
  check(
    'Day 4 question: Why Tamsin? (quiet night Fenmark: opener null, narratedSilence, no puzzle, nudgeIfLaid 1-4-3)',
    d4.questionTitle === 'Why did they take Tamsin, of all the children in Fenmark?' &&
    d4.forkA === 'She was someone in particular. They came for her.' &&
    d4.forkB === 'She was the easiest to take.' &&
    d4.opener === null &&
    d4.narratedSilence.includes('Garrick sets a bowl') &&
    d4.puzzle === null &&
    d4.nudgeIfLaid?.piece === '1-4-3' &&
    d4.nudgeIfLaid?.line.includes('three doors')
  );

  const d5 = w1.find((d) => d.day === 5);
  check(
    'Day 5 question: Same man or way of working? (puzzle: Has someone tried her house?, click: 1-5-2 + 1-5-3)',
    d5.questionTitle === 'Is it the same man, twice, or a way of working?' &&
    d5.forkA === "It's the same man, twice." &&
    d5.forkB === "It's a way of working, not one man." &&
    d5.puzzle?.q === 'Has someone tried her house before tonight?' &&
    d5.clicks?.[0]?.a === '1-5-2' &&
    d5.clicks?.[0]?.b === '1-5-3' &&
    d5.clicks?.[0]?.solves === true
  );

  const d6 = w1.find((d) => d.day === 6);
  check(
    'Day 6 question: Why are our names on that list? (the week\'s case, puzzle: decoy cart, click: 1-6-2 + 1-6-3)',
    d6.questionTitle === 'Why are our names on that list?' &&
    d6.forkA === 'We are like the children. They want us too.' &&
    d6.forkB === 'Meira chose us, to help her find them.' &&
    d6.puzzle?.q === 'Why send the cart one way and the child another?' &&
    d6.clicks?.[0]?.a === '1-6-2' &&
    d6.clicks?.[0]?.b === '1-6-3' &&
    d6.clicks?.[0]?.solves === true
  );

  // 2. Leads replacement in fanOutLeads.ts
  const leadsSrc = fs.readFileSync(path.join(root, 'src/data/fanOutLeads.ts'), 'utf8');
  const leadsMatch = leadsSrc.match(/export const APPROVED_FAN_OUT_LEADS[^{]*(\{[\s\S]*?\n\});/);
  const APPROVED_FAN_OUT_LEADS = JSON.parse(leadsMatch[1]);
  const l112 = APPROVED_FAN_OUT_LEADS['1-1'].find((l) => l.id === '1-1-2');
  const l123 = APPROVED_FAN_OUT_LEADS['1-2'].find((l) => l.id === '1-2-3');
  const l143 = APPROVED_FAN_OUT_LEADS['1-4'].find((l) => l.id === '1-4-3');
  const l153 = APPROVED_FAN_OUT_LEADS['1-5'].find((l) => l.id === '1-5-3');

  check('Lead 1-1-2 replaced with "No hurry" (place: his trail, into the trees)', l112?.clueTitle === 'No hurry');
  check('Lead 1-2-3 replaced with "The thumbed leaf" (place: the page about the child)', l123?.clueTitle === 'The thumbed leaf');
  check('Lead 1-4-3 replaced with "Past three doors" (place: the boy, at the gate)', l143?.clueTitle === 'Past three doors');
  check('Lead 1-5-3 replaced with "The worn bar" (place: her door)', l153?.clueTitle === 'The worn bar');

  // 3. Migration 0105
  const migPath = path.join(root, 'supabase/migrations/0105_campfire_week1_data.sql');
  check('Migration 0105 exists on disk', fs.existsSync(migPath));
  const mig = fs.readFileSync(migPath, 'utf8');
  check('Migration 0105 inserts campfire_days for week 1', mig.includes("insert into public.campfire_days") && mig.includes("'dark-moon', 1, 1, 1"));
  check('Migration 0105 fixes fire_table leaning trigger to count >= 2', mig.includes("count(*) from public.fire_pins where party_id = p_party and week = v_week and day = v_day) >= 2"));
  check('Migration 0105 adds unsolvedClick to casebook', mig.includes("'unsolvedClick'"));
  check('Migration 0105 defines party_read_backs', mig.includes("create or replace function public.party_read_backs"));
  check('Migration 0105 defines gathering_read_backs', mig.includes("create or replace function public.gathering_read_backs"));
  check('Migration 0105 hooks readBacks into today()', mig.includes("'readBacks', public.party_read_backs(p_party, v_week, v_day)"));
  check('Migration 0105 hooks readBacks into g_view()', mig.includes("'readBacks', public.gathering_read_backs(p_party, p_week)"));
  check('All functions in migration 0105 use security definer set search_path = ""', (mig.match(/security definer set search_path = ''/g) || []).length >= 5);

  // 4. Client components
  const partsSrc = fs.readFileSync(path.join(root, 'src/components/ChapterScriptParts.tsx'), 'utf8');
  check('ChapterScriptParts.tsx exports ReadBackBlock with data-read-back', partsSrc.includes('export const ReadBackBlock') && partsSrc.includes('data-read-back'));

  const daySrc = fs.readFileSync(path.join(root, 'src/online/OnlineDay.tsx'), 'utf8');
  check('OnlineDay.tsx imports ReadBackBlock and renders matching readBacks below story paragraphs', daySrc.includes('ReadBackBlock') && daySrc.includes('readBacks.find'));

  const gSrc = fs.readFileSync(path.join(root, 'src/online/OnlineGathering.tsx'), 'utf8');
  check('OnlineGathering.tsx imports ReadBackBlock and renders matching readBacks on Gathering 1', gSrc.includes('ReadBackBlock') && gSrc.includes('view.readBacks'));

  const fireSrc = fs.readFileSync(path.join(root, 'src/online/OnlineCampfire.tsx'), 'utf8');
  check('OnlineCampfire.tsx renders narratedSilence on Fenmark (quiet night)', fireSrc.includes('fire.narratedSilence'));
  check(
    'OnlineCampfire.tsx renders puzzle card with data-puzzle',
    fireSrc.includes('data-puzzle') && (fireSrc.includes("TONIGHT'S PUZZLE") || fireSrc.includes("TONIGHT&apos;S PUZZLE"))
  );
  check('OnlineCampfire.tsx evaluates nudgeIfLaid when piece is on the table', fireSrc.includes('fire.nudgeIfLaid'));
  check('OnlineCampfire.tsx renders Garrick leaning reaction (split/same)', fireSrc.includes("Good. Argue it out. I listen better than I talk.") && fireSrc.includes("Everyone leans the same way. What would it take to be wrong?"));
  check("OnlineCampfire.tsx renders questionTitle in TONIGHT'S QUESTION header", fireSrc.includes('fire.questionTitle'));

  const lastNightSrc = fs.readFileSync(path.join(root, 'src/online/LastNight.tsx'), 'utf8');
  check('LastNight.tsx renders unsolved puzzle morning line with data-unsolved-puzzle', lastNightSrc.includes('data-unsolved-puzzle') && lastNightSrc.includes('What the table would have shown:'));

  if (failed) {
    console.error('\nSome Piece E1 checks failed!');
    process.exit(1);
  }
  console.log('\nAll Piece E1 checks passed successfully! (26 checks)');
})();
