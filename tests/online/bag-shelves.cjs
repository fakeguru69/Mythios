// Piece E5 verification: The Bag's "The Dark Moon Verses" and "Found Along the Road" shelves (plus Relics in the Bag).
// Usage: node tests/online/bag-shelves.cjs
//
// Asserts:
//  1. src/data/bagVerses.ts extracts all 8 canon verses & documents from GATHERING_SCRIPTS word for word.
//  2. Every "You hold:" item across all 36 chapters + Gathering 5 matches docs/canon/episode-*.md word for word.
//  3. supabase/migrations/0109_bag_shelves.sql defines security-definer RPC public.bag_shelves(p_party uuid) with empty search_path.
//  4. 0109_bag_shelves.sql gates verses strictly to completed Gatherings (ended_at is not null), strips "You hold:" prefixes, and keeps W1D1 clues solitary.
//  5. OnlineBagShelves.tsx mounts [data-shelf="verses"] and [data-shelf="found"] (with [data-bag-relics], [data-bag-carried], [data-bag-clues]) and uses Markable + give_relic.
//  6. GameShell.tsx mounts OnlineVersesShelf and OnlineFoundShelf in the Bag tab wrapped in NotebookProvider, and removes the "Your Relics are kept in the Store for now." placeholder.
//  7. Bag shelves never use the day card's words ("You learned", "You hold", "Tomorrow") per docs/design/one-thread-18oct.md.
//  8. OnlineStore.tsx still exports RELIC_KINDS / relicName / aRelic and keeps Store buying & gifting intact.
//  9. Online client bundle (VITE_ONLINE_ONLY=1) compiles cleanly with zero secret or GATHERING_SCRIPTS / Malakor leakage.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let failed = false;
const check = (name, ok, detail = '') => {
  console.log((ok ? 'ok   ' : 'FAIL ') + name + (detail ? ` — ${detail}` : ''));
  if (!ok) failed = true;
};

const root = path.resolve(__dirname, '../..');

// 1. Verify bagVerses.ts extracts all 8 canon verses & documents
const bagVersesOut = execSync(
  `npx tsx -e "import { BAG_VERSES } from './src/data/bagVerses'; console.log(JSON.stringify(BAG_VERSES));"`,
  { cwd: root, encoding: 'utf8' }
).trim();
const verses = JSON.parse(bagVersesOut);
const expectedTitles = [
  '2:The Verse of the Answering',
  '3:The Verse of the Fall',
  '4:The Verse of the Four',
  '4:The torn page',
  '5:The Verse of the Binding',
  '5:The Watch',
  '6:The Verse of the Name',
  '6:The untorn page',
];
const actualTitles = verses.map((v) => `${v.week}:${v.title}`);
check(
  'BAG_VERSES extracts all 8 canon scripture passages and documents in order',
  JSON.stringify(actualTitles) === JSON.stringify(expectedTitles) && verses.every((v) => v.text && v.text.length > 80),
  `${actualTitles.length} passages`
);

// 2. Verify all "You hold:" items in CHAPTER_SCRIPTS and GATHERING_SCRIPTS match docs/canon/episode-*.md word for word
const canonCheckOut = execSync(
  `npx tsx -e "
    import fs from 'fs';
    import { CHAPTER_SCRIPTS } from './src/data/chapterScripts';
    import { GATHERING_SCRIPTS } from './src/data/gatheringScripts';
    const canonFiles = [1,2,3,4,5,6].map(w => {
      const files = fs.readdirSync('docs/canon').filter(f => f.startsWith('episode-' + w + '-'));
      return fs.readFileSync('docs/canon/' + files[0], 'utf8');
    }).join('\\n');
    let count = 0;
    let allMatch = true;
    for (const c of CHAPTER_SCRIPTS) {
      for (const s of c.steps) {
        if (s.t === 'summary') {
          for (const l of s.lines) {
            if (l.startsWith('You hold:')) {
              count++;
              if (!canonFiles.includes(l)) allMatch = false;
            }
          }
        }
      }
    }
    for (const g of GATHERING_SCRIPTS) {
      for (const s of g.steps) {
        if (s.t === 'summary') {
          for (const l of s.lines) {
            if (l.startsWith('You hold:')) {
              count++;
              if (!canonFiles.includes(l)) allMatch = false;
            }
          }
        }
      }
    }
    console.log(JSON.stringify({ count, allMatch }));
  "`,
  { cwd: root, encoding: 'utf8' }
).trim();
const canonCheck = JSON.parse(canonCheckOut);
check(
  'Every carried item across all 36 chapters and Gatherings matches docs/canon/episode-*.md word for word',
  canonCheck.count === 23 && canonCheck.allMatch === true,
  `${canonCheck.count}/23 verified`
);

// 3 & 4. Verify 0109_bag_shelves.sql
const sqlSrc = fs.readFileSync(path.join(root, 'supabase/migrations/0109_bag_shelves.sql'), 'utf8');
check(
  '0109_bag_shelves.sql defines security-definer public.bag_shelves(p_party uuid) with empty search_path',
  sqlSrc.includes('create or replace function public.bag_shelves(p_party uuid)') &&
    sqlSrc.includes("security definer set search_path = ''") &&
    sqlSrc.includes('grant execute on function public.bag_shelves(uuid) to authenticated')
);

check(
  '0109_bag_shelves.sql gates verses to ended Gatherings, strips day-card prefix, and keeps W1D1 solitary',
  sqlSrc.includes('g.ended_at is not null') &&
    sqlSrc.includes("regexp_replace(l, '^You hold:\\s*', '')") &&
    sqlSrc.includes("case when r_day.week = 1 and r_day.day = 1 then '[]'::jsonb") &&
    sqlSrc.includes('where (not (r_day.week = 1 and r_day.day = 1) or f.user_id = v_me)')
);

// 5. Verify OnlineBagShelves.tsx structure
const shelvesSrc = fs.readFileSync(path.join(root, 'src/online/OnlineBagShelves.tsx'), 'utf8');
check(
  'OnlineBagShelves.tsx renders [data-shelf="verses"] and [data-shelf="found"] with relics, carried items, clues, Markable, and give_relic',
  shelvesSrc.includes('data-shelf="verses"') &&
    shelvesSrc.includes('data-shelf="found"') &&
    shelvesSrc.includes('data-bag-relics') &&
    shelvesSrc.includes('data-bag-carried') &&
    shelvesSrc.includes('data-bag-clues') &&
    shelvesSrc.includes("supabase.rpc('bag_shelves'") &&
    shelvesSrc.includes("supabase.rpc('give_relic'") &&
    shelvesSrc.includes('<Markable')
);

// 6. Verify GameShell.tsx mounts OnlineVersesShelf and OnlineFoundShelf and removes placeholder
const shellSrc = fs.readFileSync(path.join(root, 'src/online/GameShell.tsx'), 'utf8');
check(
  'GameShell.tsx mounts OnlineVersesShelf and OnlineFoundShelf inside NotebookProvider and removes Store placeholder',
  shellSrc.includes('<OnlineVersesShelf') &&
    shellSrc.includes('<OnlineFoundShelf') &&
    !shellSrc.includes('Your Relics are kept in the Store for now.') &&
    !shellSrc.includes('Verses you hear at the Gathering and clues you find along the road will rest here.')
);

// 7. Verify Bag shelves never render the day card's words ("You learned", "You hold", "Tomorrow")
const bagTabsSrc = fs.readFileSync(path.join(root, 'src/components/BagAndStoreTabs.tsx'), 'utf8');
const forbiddenDayCardWords = /\bYou learned\b|\bYou hold\b|\bTomorrow:/i;
check(
  'OnlineBagShelves.tsx and BagAndStoreTabs.tsx never render the day card words ("You learned", "You hold", "Tomorrow:")',
  !forbiddenDayCardWords.test(shelvesSrc) &&
    !bagTabsSrc.includes('What you hold') &&
    bagTabsSrc.includes('Carried in your pack')
);

// 8. Verify OnlineStore.tsx still exports RELIC_KINDS / relicName / aRelic and keeps Store buying & gifting intact
const storeSrc = fs.readFileSync(path.join(root, 'src/online/OnlineStore.tsx'), 'utf8');
check(
  'OnlineStore.tsx exports RELIC_KINDS, relicName, and aRelic while keeping Store relic buying and gifting intact',
  storeSrc.includes('export const RELIC_KINDS') &&
    storeSrc.includes('export const relicName') &&
    storeSrc.includes('export const aRelic') &&
    storeSrc.includes("supabase.rpc('buy_relic'") &&
    storeSrc.includes("supabase.rpc('give_relic'")
);

// 9. Verify online bundle compiles cleanly and contains zero secrets or unreached Gathering prose
execSync('VITE_ONLINE_ONLY=1 npm run build', { cwd: root, stdio: 'pipe' });
const distDir = path.join(root, 'dist/assets');
const jsFiles = fs.readdirSync(distDir).filter((f) => f.endsWith('.js'));
const bundleText = jsFiles.map((f) => fs.readFileSync(path.join(distDir, f), 'utf8')).join('\n');
const forbiddenBundleTokens = ['Malakor', 'bearsOnFork', 'qaNote', 'trueMeaning', 'The untorn page'];
const leaked = forbiddenBundleTokens.filter((tok) => bundleText.includes(tok));
check(
  'Online client bundle (VITE_ONLINE_ONLY=1) has zero secret or unreached Gathering verse leakage',
  leaked.length === 0,
  leaked.length ? `leaked: ${leaked.join(', ')}` : 'clean'
);

if (failed) {
  console.log('Bag shelves test FAILED');
  process.exit(1);
} else {
  console.log('Bag shelves test passed all 9 checks');
}
