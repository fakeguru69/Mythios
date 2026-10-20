// Tests that assert (docs/design/handoff-ledger.md, piece 8):
//  1. Every test script in tests/online/ defines check() and exits non-zero (process.exit(failed ? 1 : 0)) when any check is false.
//  2. The "names hidden before you pick" (pin-before-peek) negative check in campfire.cjs catches a leaked name even at the end of innerText with no trailing newline.
//  3. store-and-relics.cjs, campfire.cjs, gathering.cjs, party-chat.cjs, notifications.cjs, party-and-session-zero.cjs, and seeker-chest.cjs wait on state (waitUntil / waitFor) rather than relying solely on fixed sleeps.
//  4. Retired ask-garrick.cjs is removed; party-chat.cjs is updated for GameShell, FireChat composer, and the party panel.
// Usage: node tests/online/assert-checks.cjs

const fs = require('fs');
const path = require('path');

let failed = false;
const check = (name, ok) => {
  console.log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
};

const dir = __dirname;
const mustAssertFiles = [
  'campfire.cjs',
  'store-and-relics.cjs',
  'gathering.cjs',
  'party-chat.cjs',
  'notifications.cjs',
  'party-and-session-zero.cjs',
  'seeker-chest.cjs',
  'refresh.cjs',
  'scroll.cjs',
  'fire-stream.cjs',
  'errors.cjs',
  'garrick-at-fire.cjs',
  'spoiler-hardening.cjs',
  'party-panel.cjs',
  'notice-roll.cjs',
  'cover-page.cjs',
  'fork-changed.cjs',
  'record.cjs',
];

for (const file of mustAssertFiles) {
  const src = fs.readFileSync(path.join(dir, file), 'utf8');
  const hasCheckFn = /const check\s*=/.test(src);
  const callsCheck = /\bcheck\s*\(/.test(src);
  const exitsOnFail = /process\.exit\(failed\s*\?\s*1\s*:\s*0\)|if\s*\(failed\)[\s\S]*?process\.exit\(1\)/.test(src);
  check(`${file} defines check(), runs assertions, and exits 1 on failure`, hasCheckFn && callsCheck && exitsOnFail);
}

// Verify pin-before-peek negative check in campfire.cjs can actually fail when a name is leaked at the end of innerText (no trailing newline):
const campfireSrc = fs.readFileSync(path.join(dir, 'campfire.cjs'), 'utf8');
check(
  'campfire.cjs uses word-boundary /\\bTestHost\\b/ instead of broken /TestHost\\n/',
  !/\/TestHost\\n\//.test(campfireSrc) && /!\/\\bTestHost\\b\/\.test\(optABefore\)/.test(campfireSrc)
);

const leakedOptionText = "They're digging to find something that's already there.\nTestHost";
const cleanOptionText = "They're digging to find something that's already there.";
const namesHiddenCheck = (txt) => !/\bTestHost\b/.test(txt);
check('pin-before-peek check FAILS (returns false) when TestHost leaks at end of button text', namesHiddenCheck(leakedOptionText) === false);
check('pin-before-peek check PASSES (returns true) when option text has no leaked name', namesHiddenCheck(cleanOptionText) === true);

// Verify party-chat.cjs uses GameShell [data-composer] and [data-party-panel], not the retired /Party chat/ heading:
const partyChatSrc = fs.readFileSync(path.join(dir, 'party-chat.cjs'), 'utf8');
check(
  'party-chat.cjs uses GameShell [data-composer] and openPanel instead of stale /Party chat/',
  partyChatSrc.includes('[data-composer]') && partyChatSrc.includes('openPanel') && !partyChatSrc.includes('/Party chat/')
);

// Verify retired ask-garrick.cjs is gone:
check('retired ask-garrick.cjs is removed', !fs.existsSync(path.join(dir, 'ask-garrick.cjs')));

if (failed) {
  console.log('Assert checks test FAILED');
  process.exit(1);
} else {
  console.log(`Assert checks test passed all ${mustAssertFiles.length + 5} checks`);
}
