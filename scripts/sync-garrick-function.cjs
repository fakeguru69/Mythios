// Copies Garrick's router and AI prefix from src/data/ into the "garrick" server function (supabase/functions/garrick),
// which runs on Supabase and cannot read src/. Run after any change to either file, then deploy the function again.
// With --check it only reports whether the copies are current (exit 1 if not).
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const pairs = [
  ['src/data/garrickRouter.ts', 'supabase/functions/garrick/garrickRouter.ts'],
  ['src/data/garrickPrompt.ts', 'supabase/functions/garrick/garrickPrompt.ts'],
];
const header = '// COPY of the file of the same name in src/data/, made by scripts/sync-garrick-function.cjs. Do not edit here.\n';
let stale = false;
for (const [from, to] of pairs) {
  const want = header + fs.readFileSync(path.join(root, from), 'utf8');
  const target = path.join(root, to);
  const have = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  if (have === want) continue;
  stale = true;
  if (process.argv.includes('--check')) console.log(`out of date: ${to}`);
  else fs.writeFileSync(target, want);
}
if (process.argv.includes('--check')) process.exit(stale ? 1 : 0);
console.log(stale ? 'copied' : 'already current');
