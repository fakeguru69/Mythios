# Browser tests

Playwright scripts that drive the real app in a browser. The online tests also talk to the real Supabase server.

## Before running
- Start the app: `npm run dev` (port 3000).
- `MYTHIOS_TEST_PASSWORD` = the test accounts' password (Fake Guru has it). The accounts are `host@`, `mei@` and `dev@mythios.test`, made directly on the server (they cannot receive email). Delete them before a public launch.
- Output (screens' text and screenshots) goes to `test-output/` (ignored by git), or to `TEST_OUT`.
- Playwright: the project's own, or the cloud container's (`tests/online/playwright.cjs`; `PLAYWRIGHT_PATH` to override).

## Online (multiplayer)
- `node tests/online/party-and-session-zero.cjs <run>`: covers
  - the Mythios intro and the series shelf;
  - making a party;
  - the invite naming the series and season;
  - letting a friend in;
  - Session Zero (a kept character, or a new one).
- `node tests/online/party-chat.cjs <run>`: covers
  - the full invite flow, including turning a friend away;
  - starting the story;
  - then the party chat.

  It waits for the file `READY-FOR-CLOCK` in its output folder. Then move that party's clock past Day 2 (SQL below) and it carries on: messages, a report, a name change, the host leaving.
- `node tests/online/play-today.cjs <run> "<party name>" [host|mei|dev]`: plays today's chapter to its end in an existing party, and prints the rolls, the fight and the gold.
- `node tests/online/seeker-chest.cjs <run> "<party name>"`: covers
  - solving words;
  - the one-word-a-day rule;
  - five wrong tries and the wait;
  - solver names.

  It expects the party to be on Week 1 Day 2.
- `node tests/online/store-and-relics.cjs <run> "<party name>"`: covers
  - the Store's first-time line, buying Relics, giving one to a friend;
  - the Store closed at the card, and open after [NOT NOW];
  - rolling the card with an Attribute Relic.

  It needs a day whose card has not been rolled, and about 500g.

To move a test party's clock, run this on the server (Supabase SQL):

```sql
-- Day 1 opens now:
update public.parties set day1_opens_at = now() - interval '1 minute' where name = '<party name>';
-- One day later each time:
update public.parties set day1_opens_at = day1_opens_at - interval '1 day' where name = '<party name>';
```

## The one-phone demo
- `node tests/demo/season.cjs`: plays the whole season in the demo. It covers all 36 weekdays (story, Challenge, [PRESS ON], fight, a Fan Out lead, the fire), all six Gatherings, and gear bought when affordable.
- `python3 -I tests/demo/scan.py` checks every saved screen for:
  - placeholders and writer notes;
  - builder words and old terms;
  - weekday names;
  - Garrick's banned phrases;
  - the secret.
- `python3 -I tests/demo/numcheck.py` checks every roll and fight line against the rules.
