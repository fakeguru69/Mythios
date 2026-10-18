// The game shell (docs/design/one-thread-18oct.md, phase A): once the season is under way a party opens straight into
// STORY · RECORD · BAG · STORE. With one party, signing in opens it by itself; with several, the shelf lists them.
async function enterParty(p, party) {
  await p.waitForTimeout(1500);
  if (await p.locator('[data-game-shell]').count()) return;
  const bt = p.getByRole('button', { name: new RegExp(party) }).first();
  if (await bt.count()) { await bt.click(); await p.waitForTimeout(2500); }
}
async function openTab(p, key) {
  await p.locator(`[data-shell-tab=${key}]`).click();
  await p.waitForTimeout(1500);
}
async function openPanel(p) {
  await p.locator('[data-party-name]').click();
  await p.waitForTimeout(800);
}
async function closePanel(p) {
  await p.locator('[data-party-panel] button[aria-label=Close]').last().click();
  await p.waitForTimeout(500);
}
// The day is done when the fire shows below it in the thread (or Day 7's Gathering is there instead).
const dayDone = async (p) => (await p.locator('[data-thread-fire]').count()) > 0;
module.exports = { enterParty, openTab, openPanel, closePanel, dayDone };
