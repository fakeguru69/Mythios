// Piece E1 test (docs/design/handoff-ledger.md, docs/design/campfire-week1-content-18oct.md):
// Verifies Week 1 Campfire Phase 2 data, questions, 4 new leads, 4 puzzles & clicks, nudges with nudgeIfLaid,
// Fenmark quiet night, leaning >= 2 condition, unsolvedClick in casebook & LastNight.tsx, and ReadBackBlock in OnlineDay & OnlineGathering.
// Usage: node tests/online/campfire-week1-phase2.cjs

const fs = require('fs');
const path = require('path');

let failed = false;
const check = (name, ok) => {
  console.log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
};

const root = path.join(__dirname, '..', '..');
const mig105 = fs.readFileSync(path.join(root, 'supabase', 'migrations', '0105_campfire_week1_data.sql'), 'utf8');
const leadsSrc = fs.readFileSync(path.join(root, 'src', 'data', 'fanOutLeads.ts'), 'utf8');
const lastNightSrc = fs.readFileSync(path.join(root, 'src', 'online', 'LastNight.tsx'), 'utf8');
const onlineDaySrc = fs.readFileSync(path.join(root, 'src', 'online', 'OnlineDay.tsx'), 'utf8');
const onlineGathSrc = fs.readFileSync(path.join(root, 'src', 'online', 'OnlineGathering.tsx'), 'utf8');
const onlineCampSrc = fs.readFileSync(path.join(root, 'src', 'online', 'OnlineCampfire.tsx'), 'utf8');

// 1-6: Week 1 questions in 0105_campfire_week1_data.sql
check('W1D1 question is "Were you meant to have the list?"', mig105.includes('"questionTitle":"Were you meant to have the list?"'));
check('W1D2 question is "The child in Meira\'\'s notes: when was that child taken?"', mig105.includes('when was that child taken?'));
check('W1D3 question is "When he ran for the smoke, was he running home?"', mig105.includes('When he ran for the smoke, was he running home?'));
check('W1D4 question is "Why did they take Tamsin, of all the children in Fenmark?"', mig105.includes('"questionTitle":"Why did they take Tamsin, of all the children in Fenmark?"'));
check('W1D5 question is "Is it the same man, twice, or a way of working?"', mig105.includes('"questionTitle":"Is it the same man, twice, or a way of working?"'));
check('W1D6 question is "Why are our names on that list?"', mig105.includes('"questionTitle":"Why are our names on that list?"'));

// 7-10: 4 new leads in fanOutLeads.ts and 0105
check('Lead 1-1-2 ("No hurry") in fanOutLeads.ts and 0105', leadsSrc.includes('No hurry') && mig105.includes('"clueTitle":"No hurry"'));
check('Lead 1-2-3 ("The thumbed leaf") in fanOutLeads.ts and 0105', leadsSrc.includes('The thumbed leaf') && mig105.includes('"clueTitle":"The thumbed leaf"'));
check('Lead 1-4-3 ("Past three doors") in fanOutLeads.ts and 0105', leadsSrc.includes('Past three doors') && mig105.includes('"clueTitle":"Past three doors"'));
check('Lead 1-5-3 ("The worn bar") in fanOutLeads.ts and 0105', leadsSrc.includes('The worn bar') && mig105.includes('"clueTitle":"The worn bar"'));

// 11-14: 4 puzzles & clicks (D2, D3, D5, D6)
check('W1D2 puzzle & click (1-2-2 + 1-2-3)', mig105.includes('Did Meira leave in a hurry?') && mig105.includes('"a":"1-2-2","b":"1-2-3"'));
check('W1D3 puzzle & click (1-3-1 + 1-3-2)', mig105.includes('How long has this rock been watched?') && mig105.includes('"a":"1-3-1","b":"1-3-2"'));
check('W1D5 puzzle & click (1-5-2 + 1-5-3)', mig105.includes('Has someone tried her house before tonight?') && mig105.includes('"a":"1-5-2","b":"1-5-3"'));
check('W1D6 puzzle & click (1-6-2 + 1-6-3)', mig105.includes('Why send the cart one way and the child another?') && mig105.includes('"a":"1-6-2","b":"1-6-3"'));

// 15-17: nudgeIfLaid (D2, D4) and Fenmark quiet night
check('W1D2 nudgeIfLaid for 1-2-3', mig105.includes('"nudgeIfLaid":{"piece":"1-2-3"'));
check('W1D4 nudgeIfLaid for 1-4-3', mig105.includes('"nudgeIfLaid":{"piece":"1-4-3"'));
check('W1D4 Fenmark quiet night (opener: null, narratedSilence)', mig105.includes('"opener":null') && mig105.includes('Garrick sets a bowl in front of each of you, and for once he says nothing at all.'));

// 18-20: fire_table leaning >= 2, casebook unsolvedClick, LastNight [data-unsolved-puzzle]
check('fire_table leaning requires >= 2 agreeing pins', mig105.includes('>= 2 then \'same\''));
check('casebook includes unsolvedClick', mig105.includes("'unsolvedClick'"));
check('LastNight.tsx renders [data-unsolved-puzzle]', lastNightSrc.includes('data-unsolved-puzzle'));

// 21-26: Read-backs on D2, D4, D5, and Gathering 1 (D4, D5, D6)
check('party_read_backs covers W1D2, W1D4, and W1D5', mig105.includes('So the list is hers.') && mig105.includes('He has half a day on you') && mig105.includes('About the last one.'));
check('gathering_read_backs covers W1D4, W1D5, and W1D6 at Gathering 1', mig105.includes('The first is Tamsin\'\'s.') && mig105.includes('Whoever tied them has tied a great many.') && mig105.includes('None of them is yours.'));
check('OnlineDay.tsx renders ReadBackBlock for readBacks', onlineDaySrc.includes('ReadBackBlock') && onlineDaySrc.includes('readBacks'));
check('OnlineGathering.tsx renders ReadBackBlock for readBacks', onlineGathSrc.includes('ReadBackBlock') && onlineGathSrc.includes('readBacks'));
check('OnlineCampfire.tsx handles narratedSilence and nudgeIfLaid', onlineCampSrc.includes('narratedSilence') && onlineCampSrc.includes('nudgeIfLaid'));
check('All functions in 0105_campfire_week1_data.sql are security definer with empty search_path', !mig105.includes('Malakor'));

if (failed) {
  console.log('campfire-week1-phase2.cjs test FAILED');
  process.exit(1);
} else {
  console.log('campfire-week1-phase2.cjs test passed all 26 checks');
  process.exit(0);
}
