// Piece C9 test (docs/design/handoff-ledger.md):
//  1. WhatThisChangedBlock component exists in ChapterScriptParts.tsx.
//  2. Renders "WHAT THIS CHANGED" header with gold accent and ⚡ symbol.
//  3. Displays outcome text with data-what-this-changed attribute.
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

  check('WhatThisChangedBlock exists in ChapterScriptParts.tsx', partsSrc.includes('WhatThisChangedBlock'));
  check(
    'WhatThisChangedBlock renders WHAT THIS CHANGED label',
    partsSrc.includes('WHAT THIS CHANGED')
  );
  check(
    'WhatThisChangedBlock includes data-what-this-changed attribute',
    partsSrc.includes('data-what-this-changed')
  );

  console.log('fork-changed.cjs test passed all static checks');
  process.exit(failed ? 1 : 0);
})();
