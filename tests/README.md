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
- `node tests/online/campfire.cjs <run> "<party name>"`: host and Mei each play today's chapter, follow different leads, and sit at the fire. Covers the board, pin before peek, the catch-up line, the bottle, the open question, the week line, the riddle (tries counted per friend), and leaving. Needs a weekday neither has finished.

- `node tests/online/gathering.cjs <run> "<party name>"`: host and Mei each open the Gathering and tap whatever the night offers them (the host answers the table's question) until both reach the summary card. Covers the lobby, the vote, the Approach, the Battle, Notice and [LOOK CLOSER], the United Effort, Match, the table question, Ask and the summary. The party must be on Day 7. Takes about ten minutes (the Battle plays one round every 10 seconds).

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

## A local copy of the server (no password needed)
Every migration in `supabase/migrations/` can run on a local Postgres, and `tests/online/local-server.cjs` stands in for Supabase's web side (sign-in with any password, the server functions, simple table reads). The online screens then run in a browser against it, and nothing touches the real server.

```sh
# Postgres 16, run as the postgres user, in a folder it owns:
mkdir -p /var/tmp/pgm && chown postgres /var/tmp/pgm
su postgres -s /bin/bash -c "/usr/lib/postgresql/16/bin/initdb -D /var/tmp/pgm/data -U postgres && /usr/lib/postgresql/16/bin/pg_ctl -D /var/tmp/pgm/data -o '-p 5544 -k /var/tmp/pgm' -l /var/tmp/pgm/log start"
export PGHOST=/var/tmp/pgm PGPORT=5544
psql -U postgres -c "create database m"
export PGDATABASE=m
# Supabase's own pieces the migrations expect:
psql -U postgres <<'SQL'
create role anon; create role authenticated; create role service_role;
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.uid', true), '')::uuid $$;
create publication supabase_realtime;
grant usage on schema public, auth to anon, authenticated;
SQL
for f in supabase/migrations/00*.sql; do psql -U postgres -v ON_ERROR_STOP=1 -q -f $f || break; done
# A test party on Week 2 Day 7, the stand-in, and the app pointed at it:
node tests/online/gathering.cjs setup-local "Gathering Test"
node tests/online/local-server.cjs &
VITE_SUPABASE_URL=http://localhost:54321 npm run dev &
node tests/online/gathering.cjs local "Gathering Test"
```

The live chat (websocket) is not served locally; the chat still loads each time it opens.

Garrick's server function runs locally too: `npx tsx tests/online/local-garrick.ts &` (port 54322; the stand-in forwards `/functions/v1/garrick` to it). Set `GEMINI_API_KEY` to try the AI small talk; without it he answers from stored lines. `tests/online/ask-garrick.cjs <run> "<party>"` asks him three things in your own thread and two at the fire, and logs each reply.

**Notifications and the Day 4 poll** (`tests/online/notifications.cjs <run> "<party>"`): needs the party on Day 4 or 5 and a built site, because the service worker exists only in a build: `VITE_ONLINE_ONLY=1 VITE_SUPABASE_URL=http://localhost:54321 VITE_SUPABASE_ANON_KEY=x npx vite build --outDir <dir>`, then `npx vite preview --outDir <dir> --port 3000` with the stand-in running. Headless Chromium refuses push, so the card shows as blocked; the poll is fully tested. The rules in `notify_due()` are tested in SQL on the local copy by moving the party's clock (`update public.parties set day1_opens_at = day1_opens_at - interval '1 day'`). The local copy has no pg_cron: call `select public.notify_due()` yourself.

## Data checks (no browser)
- `npx tsx tests/data/check-small-party-lines.ts`: every short-party line still matches the chapters, and no sentence names two friends without a short version. Run it after regenerating `chapterScripts.ts`.
