// Piece C7 test (docs/design/handoff-ledger.md):
//  1. CoverPage.tsx exists and renders MYTHIOS title and canon tagline.
//  2. Featured series "Tales of the Dark Moon", "Season 1", "6 weeks", "2–6 players".
//  3. Uses approved canon premise ("In the hill villages, children are going missing...").
//  4. Buttons: [data-button-gather] ("Gather your friends") and [data-button-signin] ("Already playing? Sign in").
//  5. OnlineApp.tsx imports and mounts CoverPage for unauthenticated landing visitors.
// Usage: node tests/online/cover-page.cjs

const fs = require('fs');
const path = require('path');

let failed = false;
const check = (name, ok) => {
  console.log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
};

(async () => {
  const root = path.resolve(__dirname, '../..');
  const coverSrc = fs.readFileSync(path.join(root, 'src/components/CoverPage.tsx'), 'utf8');
  const appSrc = fs.readFileSync(path.join(root, 'src/online/OnlineApp.tsx'), 'utf8');

  check('CoverPage.tsx renders MYTHIOS header', coverSrc.includes('MYTHIOS'));
  check(
    // 26 Oct: the welcome lines are back (Fake Guru); only the "ritual" line stays out, as it gives the story away.
    'CoverPage.tsx: the welcome is there, and no "ritual"',
    coverSrc.includes('The adventure is in the story.') && coverSrc.includes('Embark on a mysterious journey') && !coverSrc.includes('Ten minutes a day') && !/ritual/i.test(coverSrc)
  );
  check(
    'CoverPage.tsx uses canon series premise',
    coverSrc.includes('In the hill villages, children are going missing, and nobody is looking for them.')
  );
  check(
    'CoverPage.tsx excludes unapproved fantasy hook wording',
    !coverSrc.includes('A dark fantasy adventure of ancient secrets')
  );
  check(
    'CoverPage.tsx renders Tales of the Dark Moon featured series with metadata',
    coverSrc.includes('TALES OF THE DARK MOON') &&
    coverSrc.includes('Season 1') &&
    coverSrc.includes('6 weeks') &&
    coverSrc.includes('2–6 players')
  );
  check(
    'CoverPage.tsx renders data-button-gather button ("GATHER YOUR FRIENDS", restored 26 Oct)',
    coverSrc.includes('data-button-gather') && coverSrc.includes('GATHER YOUR FRIENDS')
  );
  check(
    'CoverPage.tsx renders data-button-signin button ("Already playing? Sign in")',
    coverSrc.includes('data-button-signin') && coverSrc.includes('Already playing? Sign in')
  );
  check(
    'OnlineApp.tsx imports CoverPage',
    appSrc.includes("import CoverPage from '../components/CoverPage'")
  );
  check(
    'OnlineApp.tsx renders <CoverPage for landing visits',
    appSrc.includes('<CoverPage')
  );

  if (failed) {
    console.log('Cover page test FAILED');
    process.exit(1);
  } else {
    console.log('Cover page test passed all checks');
  }
})();
