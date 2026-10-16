// Finds Playwright: the project's own copy if installed, otherwise the cloud container's (PLAYWRIGHT_PATH to override).
const tries = [process.env.PLAYWRIGHT_PATH, 'playwright', '/opt/node22/lib/node_modules/playwright'].filter(Boolean);
for (const t of tries) { try { module.exports = require(t); break; } catch { /* next */ } }
if (!module.exports || !module.exports.chromium) throw new Error('Playwright not found: set PLAYWRIGHT_PATH');
