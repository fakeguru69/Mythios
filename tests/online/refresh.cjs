// The story refreshes by itself (docs/design/handoff-ledger.md, piece 2): when the app comes back to the front on a new
// day, at the 5:00am rollover while it stays open, and a first load that failed tries again without a tap.
// Local copy of the server (host@, any password). The page's clock is shifted with __off (milliseconds) so the test
// need not wait for the real 5:00am. Usage: node tests/online/refresh.cjs "<party name>"
const { chromium } = require('./playwright.cjs');
const { enterParty } = require('./shell.cjs');
const PARTY = process.argv[2] || 'Gathering Test';
let failed = false;
const check = (name, ok) => { console.log((ok ? 'ok   ' : 'FAIL ') + name); if (!ok) failed = true; };
async function open(b, startOff = 0) {
  const p = await (await b.newContext({ viewport: { width: 375, height: 812 } })).newPage();
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  const st = { todays: 0, failNext: 0 };
  await p.route(/\/rpc\/today/, (r) => {
    st.todays++;
    if (st.failNext > 0) { st.failNext--; return r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'forced failure' }) }); }
    return r.continue();
  });
  await p.addInitScript((OFF) => {
    const D = Date; window.__off = OFF;
    window.Date = class extends D {
      constructor(...a) { if (a.length) super(...a); else super(D.now() + window.__off); }
      static now() { return D.now() + window.__off; }
    };
  }, startOff);
  await p.goto('http://localhost:3000/?online=1'); await p.waitForTimeout(1500);
  await p.getByRole('button', { name: 'START A PARTY', exact: true }).click(); await p.waitForTimeout(800);
  await p.getByRole('button', { name: 'USE EMAIL AND A PASSWORD', exact: true }).click(); await p.waitForTimeout(800);
  await p.getByRole('button', { name: 'Have an account? Sign in' }).click();
  await p.getByPlaceholder('Email').fill('host@mythios.test'); await p.getByPlaceholder('Password').fill('x');
  await p.getByRole('button', { name: 'SIGN IN', exact: true }).click(); await p.waitForTimeout(2000);
  await enterParty(p, PARTY); await p.waitForTimeout(2500);
  return { p, st };
}
// Milliseconds from now to the next 5:00am in Singapore (UTC+8), the test party's clock.
const msToBoundary = () => {
  const now = Date.now(), sg = now + 8 * 3600000;
  const start = Math.floor((sg - 5 * 3600000) / 86400000) * 86400000 + 5 * 3600000;
  return start + 86400000 - 8 * 3600000 - now;
};
(async () => {
  const b = await chromium.launch({ args: [`--proxy-server=${process.env.HTTPS_PROXY}`, '--proxy-bypass-list=localhost;127.0.0.1'] });
  // 1. Back to the front on a new day.
  {
    const { p, st } = await open(b);
    check('the story is open', (await p.locator('[data-pane="story"]').count()) > 0);
    const before = st.todays;
    await p.evaluate((ms) => { window.__off = ms; window.dispatchEvent(new Event('focus')); }, msToBoundary() + 60000);
    await p.waitForTimeout(2500);
    check(`coming back on a new day reloads the story (today calls ${before} -> ${st.todays})`, st.todays > before);
    const same = st.todays;
    await p.evaluate(() => window.dispatchEvent(new Event('focus'))); await p.waitForTimeout(1500);
    check('coming back on the same day does not reload', st.todays === same);
  }
  // 2. The 5:00am rollover while the app stays open: the page's clock starts 12 seconds before 5:00am on the party's clock.
  {
    const { p, st } = await open(b, msToBoundary() - 12000);
    const before = st.todays;
    await p.waitForTimeout(16000);
    check(`the open app reloads the story at the rollover (today calls ${before} -> ${st.todays})`, st.todays > before);
  }
  // 3. A first load that fails: "Try again", and a retry by itself.
  {
    const p = await (await b.newContext({ viewport: { width: 375, height: 812 } })).newPage();
    const st = { todays: 0, failNext: 1 };
    await p.route(/\/rpc\/today/, (r) => {
      st.todays++;
      if (st.failNext > 0) { st.failNext--; return r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'forced failure' }) }); }
      return r.continue();
    });
    await p.goto('http://localhost:3000/?online=1'); await p.waitForTimeout(1500);
    await p.getByRole('button', { name: 'START A PARTY', exact: true }).click(); await p.waitForTimeout(800);
    await p.getByRole('button', { name: 'USE EMAIL AND A PASSWORD', exact: true }).click(); await p.waitForTimeout(800);
    await p.getByRole('button', { name: 'Have an account? Sign in' }).click();
    await p.getByPlaceholder('Email').fill('host@mythios.test'); await p.getByPlaceholder('Password').fill('x');
    await p.getByRole('button', { name: 'SIGN IN', exact: true }).click(); await p.waitForTimeout(2000);
    await enterParty(p, PARTY); await p.waitForTimeout(2500);
    check('a failed first load shows Try again', (await p.getByRole('button', { name: 'Try again' }).count()) > 0);
    await p.waitForTimeout(9000);
    check(`the failed load retried by itself (today calls ${st.todays})`, st.todays >= 2 && (await p.getByRole('button', { name: 'Try again' }).count()) === 0);
  }
  await b.close();
  process.exit(failed ? 1 : 0);
})();
