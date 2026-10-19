// Piece C2 (docs/design/handoff-ledger.md): Story arrives message by message with a typing indicator;
// tap to read faster; keep the last-read place; no cut-off text at the top; never auto-scroll past unread text.
const fs = require('fs');
const path = require('path');

let failed = 0;
function check(cond, label, detail) {
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ` — ${detail}` : ''}`);
  if (!cond) failed += 1;
}

const root = path.join(__dirname, '..', '..');
const day = fs.readFileSync(path.join(root, 'src/online/OnlineDay.tsx'), 'utf8');

// 1. Paragraphs split into individual StoryItem messages.
check(
  /const pushSay =[\s\S]{0,260}filled\.split\(\/\\n\\s\*\\n\/\)/.test(day) &&
    /data-story-item=\{idx\}/.test(day),
  'OnlineDay splits paragraphs on blank lines into individual [data-story-item] messages'
);

// 2. Typing indicator (three dots) shown while messages remain.
check(
  /data-typing-indicator/.test(day) &&
    (day.match(/animate-pulse/g) || []).length >= 3,
  'OnlineDay renders a three-dot [data-typing-indicator] while more story messages remain'
);

// 3. Timed message-by-message reveal + tap anywhere on the story thread to read faster.
check(
  /window\.setTimeout\([\s\S]{0,260}650\)/.test(day) &&
    /data-day-thread\s+onClick=\{onTapThread\}/.test(day) &&
    /const onTapThread =[\s\S]{0,260}advanceOne\(\)/.test(day),
  'Messages arrive on a 650ms timer and tapping [data-day-thread] immediately reveals the next message'
);

// 4. Old forced bottom scrollIntoView is removed so opening a day never cuts off text at the top.
check(
  !/endRef\.current\?\.scrollIntoView/.test(day) &&
    /window\.scrollTo\(\{\s*top:\s*savedY\s*>\s*0\s*\?\s*savedY\s*:\s*0\s*\}\)/.test(day),
  'Removed forced bottom scrollIntoView; opening a day starts at top (0) or saved place with no cut-off text'
);

// 5. Scrolls only far enough to show the top of the new message, clamped so unread text is never cut off at the top.
check(
  /const neededForTop = rect\.top \+ Math\.min\(rect\.height, 72\) - \(window\.innerHeight - 24\)/.test(day) &&
    /const maxWithoutCuttingUnread = Math\.max\(0, unreadRect\.top - safeTop\)/.test(day) &&
    /const delta = Math\.min\(neededForTop, maxWithoutCuttingUnread\)/.test(day),
  'Auto-scroll moves only far enough to show the top of the new message and never cuts off unread text above safeTop'
);

// 6. Keeps the friend's last-read place (shown count + scroll Y) when they leave and return.
check(
  /story-shown:\$\{dayKey\}/.test(day) &&
    /story-scroll:\$\{dayKey\}/.test(day) &&
    /window\.addEventListener\('scroll',\s*onScroll/.test(day),
  'Persists and restores both story-shown and story-scroll per party/week/day'
);

// 7. Day finishes only once the final summary message is revealed (!typing).
check(
  /if \(reachedSummary && !typing && !finished\) onFinish\(\);/.test(day),
  'finish_day is called only after the summary card is revealed (!typing)'
);

if (failed > 0) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
console.log('Story pacing & scroll test (C2) passed all 7 checks');
