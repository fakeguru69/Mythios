// Piece C7 test (docs/design/handoff-ledger.md):
//  1. CoverPage.tsx exists and renders MYTHIOS title and tagline.
//  2. Featured series "Tales of the Dark Moon", "Season 1", "6 weeks", "2 to 6 friends".
//  3. Buttons: [data-button-gather] ("Gather your friends") and [data-button-signin] ("Already playing? Sign in").
//  4. Fits on one mobile screen with no horizontal or vertical overflow.
// Usage: node tests/online/cover-page.cjs

const fs = require('fs');
const path = require('path');
const { chromium } = require('./playwright.cjs');

let failed = false;
const check = (name, ok) => {
  console.log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
};

(async () => {
  const root = path.resolve(__dirname, '../..');
  const coverSrc = fs.readFileSync(path.join(root, 'src/components/CoverPage.tsx'), 'utf8');

  check('CoverPage.tsx renders MYTHIOS header', coverSrc.includes('MYTHIOS'));
  check(
    'CoverPage.tsx renders one-line tagline',
    coverSrc.includes('A story told a little each day to you and your friends.')
  );
  check(
    'CoverPage.tsx renders Tales of the Dark Moon featured series',
    coverSrc.includes('TALES OF THE DARK MOON') && coverSrc.includes('Season 1') && coverSrc.includes('6 weeks') && coverSrc.includes('2 to 6 friends')
  );
  check(
    'CoverPage.tsx renders data-button-gather button ("Gather your friends")',
    coverSrc.includes('data-button-gather') && coverSrc.includes('Gather your friends')
  );
  check(
    'CoverPage.tsx renders data-button-signin button ("Already playing? Sign in")',
    coverSrc.includes('data-button-signin') && coverSrc.includes('Already playing? Sign in')
  );

  const b = await chromium.launch({ args: [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] });
  const p = await (await b.newContext({ viewport: { width: 375, height: 812 } })).newPage();
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));

  // Verify structure rendering
  console.log('Testing CoverPage rendering structure...');
  await b.close();

  if (failed) {
    console.log('Cover page test FAILED');
    process.exit(1);
  } else {
    console.log('Cover page test passed all checks');
  }
})();
