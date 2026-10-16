# Plan: real multiplayer (15 Oct 2026)

Fake Guru: "start planning real multiplayer: yes". **Decided 15 Oct: 1 yes, 2 yes, 3 yes, 4 later, 5 yes, 6 yes** (web app; Supabase; Google and email sign-in (Apple dropped 16 Oct); the group-chat test later; Week 1 for 2–4 friends first; terms "13 and over").

It builds on canon: Core Rules §1 (where the game is played) and §12a (rules for the builder), `mythios-build-notes.md` §6–§8 (the states, the smallest thing worth building, the build order), and `review-accounts-and-invites.md`.

## Where we are

Today the game is a **one-phone demo**:
- The save lives on the phone (the browser's own storage).
- Most dice roll on the phone.
- The other friends are sample friends who act on their own.
- Garrick's free AI chat runs only in the workbench.

Real multiplayer means four things change:
1. Each friend has **their own account and phone**, and the party's state lives on a **server** that every phone reads from.
2. **The server rolls every die and keeps the clock** (canon §12a): a day opens at 5:00am on the party's clock.
3. The **party chat, the fire and the Gathering** carry real friends' messages, picks and rolls, live.
4. Friends get **a nudge when a day opens** and before the Gathering (push notifications).

## The choices, with a recommendation

| Choice | Options | Recommendation and why |
|---|---|---|
| **How friends install it** | (a) A web app they add to their home screen. (b) App Store and Play Store apps. | **(a) Web app first.** One build for every phone, no store review, and updates reach everyone at once. Push notifications work on Android, and on iPhone once added to the home screen (iOS 16.4 and later). Store apps can come later from the same code. |
| **The server** | (a) Supabase: database, sign-in, live updates, server functions. (b) Firebase (Google). (c) Our own Express server, as now. | **(a) Supabase.** It has every sign-in canon asks for (Google, Apple, email and password), live updates for the party chat and the Gathering, and server functions for dice and the clock. It is a standard database, so records are easy to check. A Supabase connection is already available in this workspace. (c) would mean building all of that by hand. |
| **Garrick's AI** | Keep Gemini (as now), or switch. | **Keep Gemini for now**, called only from the server, with the stored-lines router first (canon §12a). It is only small talk; the story never waits on it. |
| **Notifications** | Web push, email, both. | **Web push, with email as a fallback** for friends who turn push off. |

## What gets built, in order

This follows the build order in `mythios-build-notes.md` §7. The first goal is canon's **"smallest thing worth building"**: Week 1 only, two to four friends, on their own phones.

1. **Accounts and the party.**
   - Sign-in by Google, or email and password (Apple removed 16 Oct: it needs a paid Apple Developer account).
   - The host makes and names the party; the invite link asks to join; the host approves each friend.
   - Session Zero runs once per friend.
   - The party clock: time zone locked, a day opens at 5:00am.
   - The invite page, leaving, removing, a new host and deleting an account follow `review-accounts-and-invites.md`, which is already worded.
2. **The save moves to the server.** Gold, gear, Relics, Attributes, the Record, fragment words and finished days are saved the moment they change, each change applied once only (canon §12a). The sample friends go.
3. **The server rolls every die.** Challenges, [PRESS ON], fights, Fan Out leads, the Approach, [LOOK CLOSER] and the United Effort. (Today only three of these use the server.)
4. **The party chat and the fire with real friends.**
   - Result lines ("Mei passed today's Challenge.").
   - Fragment words: one per friend until the day ends, each posting a line.
   - The board with each friend's real find, pins and readings (pin before you see the others').
   - The riddle with 3 tries each, and the week board.
5. **The Gathering live.**
   - Lobby, then a single start; "first tap counts" for shared buttons.
   - The Battle in step; the United Effort with real turns; Match with each friend's own pick, including the 100g "everyone right" rate; Ask.
   - Recaps for absent friends.

   This is canon's riskiest stage.
6. **Notifications.** "Your chapter is ready" when the day opens, the Gathering poll on Day 4 and the time pinned on Day 5, and a reminder before it starts.
7. **A real playtest: Week 1 with real friends** (for example Fake Guru, Mei, Dev and Arjun). This answers canon's three questions: do friends open it six days running, does the live Gathering work on real phones, do the rolls and gold feel fair.
8. **Then Weeks 2 to 6,** which are already written and play in the demo.

Also turned on with multiplayer (agreed earlier):
- the Record's party-lead crowns and the "Lifeline" badge;
- the Campfire test controls and the day picker move behind `?dev=1`.

## Three cheap tests before the big build (canon §7)

1. **Garrick:** run 200 typed questions through his router and check every answer against his rules.
2. **The live Gathering on real phones:** four people on ordinary connections play one Gathering with stored text.
3. **Do people come back daily?** Run Week 1 in an ordinary group chat, with one person posting MYTHIOS's stored text by hand.

Test 3 needs no code. It could start this week and tell us the most.

## Rough running costs (estimates, to check before signing up)

| Item | Cost |
|---|---|
| Supabase | Free for testing; about US$25 a month for a public launch. |
| Hosting the web app | Free to low at this size (Vercel, Netlify or Supabase). |
| Gemini (Garrick's small talk) | Low: stored lines answer most questions; capped turns. |
| A web address | About US$15 a year. |
| **Sign in with Apple** | Needs an **Apple Developer account, US$99 a year**, even for a web app. If that is not wanted yet, start with Google and email, and add Apple later. |

## Terms and privacy (needed before anyone outside the team plays)

- **What we store about players:** account email, names, character names, chat messages, and the two Session Zero answers (birthplace and a grandparent's name). Those last two are personal details, so the privacy policy must say why they are kept and who sees them (only the player's own party).
- **AI processing:** Garrick's small-talk messages go to Google's Gemini. The policy must say so.
- **Age:** canon has no age check (decided 3 Oct). Laws and app stores still expect the terms to state a minimum age (commonly 13). **Recommendation:** keep no age check in the app, and state "13 and over" in the terms.
- **Deleting an account** deletes the player's data, and their character stays in the story as a name only (canon §12a). The policy must describe this.
- **Reporting:** canon's press-and-hold [REPORT] reaches the makers. Someone has to read the reports.
- Both documents should be **checked by a lawyer** in the country of launch (Singapore: the PDPA). We can draft them in plain English first.

## Decisions for Fake Guru

1. Web app first, store apps later?
2. Supabase as the server?
3. Start with Google and email sign-in, and add Apple (US$99 a year) at launch?
4. Run cheap test 3 (Week 1 by hand in a group chat) now, while the build starts?
5. Build to the "smallest thing worth building" first: Week 1, 2–4 friends?
6. Terms: "13 and over", with no age check in the app?

## Built so far

- **15 Oct: the server and step 1's database.** A Supabase project "mythios" (Singapore region, free plan; the old "maxword" project was paused to make room, Fake Guru's call). The database for accounts and parties is in place (`supabase/migrations/`):
  - every account gets one name (1 to 12 characters);
  - a party has a name (1 to 20), a host, a locked time zone and an invite code;
  - a friend with the code asks to join, and the host approves or removes them; at most 6; approving the sixth closes the invite;
  - a new invite code makes the old one stop working;
  - if the host leaves, the friend who joined first becomes host;
  - each player sees only their own parties and the people in them.
  Tested with pretend players: a friend cannot approve themselves, an outsider sees nothing, a wrong or old code is refused. One gap found in testing was closed (`0002_status_switch_off.sql`).
  - 15 Oct, a correction: canon says a friend who leaves, or is removed, cannot come back to that story; 0001 let a friend who left ask again. `0003_no_return_after_leaving.sql` puts canon's rule back and adds the invite page's look-up (who sent it, the party's name).
- **15 Oct: the sign-in and party screens** (`src/online/`), opened with `?online=1` or an invite link (`?join=CODE`); the one-phone demo is unchanged.
  - Sign in, or make an account, with an email and a password (Google comes next; Apple at launch).
  - The invite page uses canon's heading, offer and credit line (§12a).
  - Make a party (its name, and your name in it, which starts as your account name); ask to join; the host lets each friend in or turns them away, and can remove a friend; copy the link or make a new one; leave (with canon's warning that you cannot come back).
  - The party list is the host, then friends in Session Zero order; until Session Zero is built, in the order they joined.
  - Tested in a browser with three test accounts against the real server: every step above worked.
- **16 Oct: the screens in canon's words, Session Zero, the clock and the start.** Wording from `docs/canon/review-accounts-and-invites.md` (Fake Guru sent it 16 Oct) and Core Rules §7; every line is in `src/online/onlineText.ts`.
  - The invite page: who invited you, the premise line, the offer, who is already in, the credit line; and "This party has set off.", "This party is full." and "This invite no longer works."
  - "First, so the story knows you." and "What should your friends call you?"; "You've knocked.", "TV has let you in." [BEGIN], "Not this time.", "You're no longer in this party."
  - Start a party: "Who walks with you?", the party's name and its clock (5:00am, locked once the story starts).
  - Session Zero (`SessionZero.tsx`): the premise, the six class cards (with "Mei is already a Sage."), a second strength, the two optional questions, the starting card (14 / 12 / 10, Weapon 14, Armor 27, HP 100, Gold 0), [READY].
  - Waiting rooms with "ready" or "choosing"; [LET IN] / [NOT THIS TIME]; [REMOVE] / [KEEP]; [LEAVE] / [STAY]; [COPY] / [SHARE] / new link; [START THE STORY] (two ready), its confirm, and "Day 1 opens at 5:00am. Sleep, if you can."
  - The server keeps the rules (`0004`–`0006`): turned away is not the same as removed; the invite closes at the end of Day 2; Day 1 opens at the next 5:00am on the party's clock; players can change only their names directly.
  - Tested in a browser with three test accounts against the server: every step worked.
- **The public website** (Vercel, `vercel.json`) builds only the online screens (`VITE_ONLINE_ONLY=1`). The one-phone demo carries the whole season's text, the secret included, so it is never put on the public site.
- **16 Oct: the party chat** (`src/online/PartyChat.tsx`, migrations `0007`–`0008`).
  - It opens only when the party assembles and Garrick joins, on Day 2 (Fake Guru, 16 Oct). For now, that is when Day 2 opens on the party's clock; once the days are played online, it opens when the friend has finished Day 2's chapter. The server enforces it.
  - Friends' messages arrive live.
  - The server writes canon's notices: "Dev has left the road.", "Mei now leads the party.", "Dev is now Devan.".
  - Press and hold a friend's message, then [REPORT], "Tell us what's wrong." and [SEND]. Reports go to the makers only.
  - Tested with two test accounts against the server.
  - Not yet: Garrick in the chat, the first-time line "Everyone is here now, and so is Garrick. Ask him anything." (it waits for Garrick), the day result lines and fragment news (they come with the days).
- **16 Oct (Fake Guru's requests):**
  - **The host picks the start day**, for example next Monday (`0009`). Day 1 opens at 5:00am that day on the party's clock, and the day can be changed until then. The waiting room shows the day; on the last night it shows canon's "Day 1 opens at 5:00am. Sleep, if you can."
  - **Install to the home screen:** an icon, a manifest and a service worker (`pwa/`), and a guide with steps for iPhone and Android (`InstallGuide.tsx`). Notifications are added to the guide when push is built (step 6).
  - **A Google sign-in button** shows by itself once it is switched on in the Supabase dashboard (Apple was removed the same day: it costs US$99 a year). Those players are asked canon's "What should your friends call you?" once (`0010`). Email and password sign-in stays.
- **16 Oct: Mythios, series, seasons and characters (Fake Guru).**
  - The app is Mythios; Tales of the Dark Moon is one series; a party plays one season of a series (migration `0011`: `series`, `seasons`, `characters`).
  - The first screen opens with a Mythios intro (draft wording), then the series shelf.
  - Home shows your stories, each series with your character in it, and START A PARTY per series.
  - Session Zero asks your character's name the first time in a series; a character you already have there is shown and kept.
  - Tested: a kept character (host), a new one (Dev named "Devan", Archer), the invite naming the series and season.
- **16 Oct: the days online (build steps 2 and 3).** Fake Guru: "7 yes".
  - The server holds the 36 weekday chapters (`0013`–`0018`, generated by `scripts/gen-chapters-sql.ts`). It hands out a chapter only on its day, so no phone holds later text. The public site was checked: no story text in it.
  - Each player's numbers live on the server (`0012`): gold, Attributes (14 / 12 / 10 from the character), gear and Relics. So does each day: picks, taps, rolls, the fight, finished.
  - **The server rolls every die:** the Challenge (Core Rules §3, with growth 12 / 9 / 7 / 5 / 4 / 3 / 3 × tier rate, only on an uncertain roll), [PRESS ON] (+4, +200g) and fights (margin × 5, who strikes first per the day, the day's fight gold).
  - Finishing the day posts canon's result line in the party chat ("TestHost passed today's Challenge.").
  - The screen (`src/online/OnlineDay.tsx`) plays canon's steps with the demo's display pieces: narration, choices, the notice line, the Challenge card, [PRESS ON], fight rounds, the summary card, and the first-Challenge and first-fight lines.
  - Tested in a browser. Day 1: won the fight +300g, Challenge passed +500g, Might 10 → 22. Day 2: Intellect 10 → 19, [PRESS ON] tie failed at DC 10, gold 1,300; the chat opened with both result lines.
  - Fixed while testing: [BEGIN] could show before a returning character had loaded, and Session Zero then ended on an empty screen.
- **16 Oct: the Seeker Chest online** (Fake Guru: "seeker chest"; migrations `0019`–`0020`; `src/online/OnlineChest.tsx`).
  - The same word-lock as the demo's Chest, but the phone never holds an unsolved word: the server checks each try.
  - A word pays 25g and shows its solver's name. A friend fills one word per fragment until that fragment's day ends; after that, either.
  - Five wrong tries bring a two-minute wait. Each word found posts "Mei found a missing word in the Week 1, Day 2 fragment." in the party chat.
  - After Day 6, unsolved words complete themselves, with no gold and no name.
  - The Chest opens from the party page and from the day's fragment.
  - Tested with two players. Not yet: the week's map line (Day 6) and the Fan Out first-letter hint (Fan Out is not online yet).
  - **Not yet online:** the Record and Bag, the Gathering (Day 7 shows "Tonight: the Gathering."), a late joiner's Day 1, Garrick, and notifications.
- **16 Oct: the Store and Relics online** (Fake Guru: "Proceed" on the suggested next build; migrations `0021`–`0023`; `src/online/OnlineStore.tsx`).
  - Gear (950 / 1,100 / 1,750 / 2,400 per step, per track) and Relics (150g, seven types), bought on the server with one confirmation and no undo. Gear reads canon's way: "Sword-Cane — Lv. 2 · Weapon 15".
  - Canon's first-time line, shown once on first opening the Store.
  - Relics can be given to a friend (never gold). The friend sees "TestHost gave you an Aim Relic." in their Store (the push comes with notifications).
  - On the card: "Aim Relic · you hold 2 / With +4, you succeed on 3+", [USE] arms it, a second tap takes it back; it is spent only when the roll is made, and growth is judged before it. The same on [PRESS ON]. In a fight, a Combat Relic: +1 Weapon and +1 Armor from the next round, once per fight.
  - The Store is closed while your card or fight is open (counted from when you open that day's chapter). [NOT NOW] sets the card aside and opens the Store; a fight not yet begun can be set aside too, except the first fight (§12a).
  - Tested in a browser and on the server: buying, the closed Store, [NOT NOW], a roll with a Relic (6 + 0 + 4 − DC 7 = +3, Aim 17 → 29), giving, the Combat Relic from Round 2, refusals (no Relic, a second Combat Relic, the old rolls).
  - Not yet: the Relic Box in the Bag (the Bag is not online), the help-call (it comes with the Gathering), the Record's "Relics Given" and "Times Stepped Up" (they come with the Record; the gifts are already kept), and the day finishing itself at 5:00am.
- **16 Oct: the Campfire online** (Fake Guru: "3 Campfire"; migrations `0024`–`0031`; `src/online/OnlineCampfire.tsx`). Canon Campfire v2.3 and the approved Fan Out and Campfire design.
  - The data (opener, fork, callback, riddle, nudge, tone, cup nights, the approved leads, meaning and week questions, the Pull) is generated from the game's own files by `scripts/gen-campfire-sql.ts` and kept on the server; a phone gets only today's. Riddle answers stay on the server until solved or given up; the QA-only "leans" never leave it.
  - After the day: the last light. One lead, rolled on the server (the week's DC, no gold, no growth); the clue always comes back; a pass gives the first letter of one fragment word. Or straight to the fire.
  - The fire, one screen: Garrick's stored lines, at most eight (the opener, the catch-up naming at most two friends, "You're first. Pull up a log.", up to two "he notices" lines, the nudge to the friend at the fire with the highest Attribute, the pin acknowledgement, the finished fragment read aloud, the riddle's reply, the callback, the bottle prompt, Day 6's two week pins); the cup on cup nights (an action, no line); the board; today's fragment with the Chest button, the hint, and the meaning pin once both words are found; tonight's question (A, B, Neither, your own line; pin before peek; names, never a count); the case so far (dated week lines); the riddle (shared, three tries each, asked for on quiet nights); an open question; a message in a bottle; "At the fire now".
  - Leaving: a closer, what we did today (only real actions), the Pull, and a bottle for whoever comes next.
  - Week 1 Day 1 is narrated: no Garrick, no friends; the pin becomes the friend's first week line.
  - "TestHost pinned a theory." goes to the party chat on the first pin of the day.
  - Tested with two players in a browser.
  - Not yet: the fragment's word-lock inside the fire (it opens the Chest), the Chest showing the Fan Out hint, the nudge's rotation between evenings, reading the board after dawn, the Gathering's read-backs of pins, and the demo's "Ask Garrick" at the fire (Garrick in the chat comes later).
- **16 Oct: the Gathering online** (Fake Guru: "4 Gathering"; migrations `0032`–`0041`; `src/online/OnlineGathering.tsx`). Core Rules §1, §4, §5, §11, §12a; the six Gatherings as the demo plays them (`scripts/gen-gathering-sql.ts`).
  - **One night for the whole party, kept by the server.** Each phone asks `gathering_tick` every two seconds what the night looks like now, and sends taps through `gathering_do`. Every die and every timer is the server's; shared buttons count the first tap. A phone receives only the steps already reached: nothing later in the night or the season reaches it early.
  - **The lobby:** Day 7 at 8:00pm on the party's clock until the host pins another time (8:00am to 11:00pm; told in the chat). It starts once everyone is here after it opens, any friend can start it after 10 minutes, it starts by itself after 30, and the host can start it at any time.
  - **The Approach:** the group vote (majority after 30 seconds or once all have tapped; a tie goes to the first vote), then [STEP UP] (whoever has rolled fewest Approaches this season; nobody → the server picks); the roll is that friend's Day 7 Challenge (+500 / −150, growth), with the map +2 when the party solved all six of the week's words and their own Attribute Relic. Day 7 counts as played for every friend in the Gathering.
  - **The Battle:** every friend's own enemy, one round every 10 seconds for all at once, each Gathering's condition, a Combat Relic from the next round, help-calls ("MEI IS IN TROUBLE · HP 42" in the chat and on every phone; the first to give one), reinforcement of the fight most in need, a friend arriving late joining as a reinforcer, the reward to every friend in it.
  - **Notice and [LOOK CLOSER]** in each friend's own view (from the floor for a friend who fell; none at Gathering 5 after a lost roll-call).
  - **The United Effort:** MYTHIOS names the first friend, the roller hands on (or MYTHIOS names the next after 10 seconds), a roll left 30 seconds rolls itself, one Relic a roll (your own matching one, or any one a friend gives), the story line by band, +300g to every friend if it is done. Gathering 1's friend in the drop is the one who fell, or who finished with the least HP.
  - **Match** (private picks; after 60 seconds or once all have picked, the right row and who matched it; 50g, or 100g if everyone here is right), **the question to the table** (a friend's answer, named; the nudge at 60 seconds, the answer at 90), **Ask** (one each, two each for two, four alone; sealed questions answered anyway), **Gathering 6's** private majority for the fifth, the friend the light lets go of (30 seconds to talk, 20 to choose), and "Say a name" (each line with who said it).
  - **The summary card** filled from the night ("You earned" is each friend's own).
  - **What carries:** a lost United Effort at Gathering 3 changes Week 4 Day 1's lines; at Gathering 5 it makes Week 6 Day 1's Challenge two harder (`party_claims`, `today()`, `roll_card`).
  - **Tested:** all six Gatherings played to the end with 1 to 3 pretend players on a local copy of the server (every gold sum, Relic, growth, Match pay, Ask limit and Week 6 pick checked); the lobby's start rules and a friend arriving mid-Battle; two players in a browser through Gathering 2 (`tests/online/gathering.cjs`, against the local copy: `tests/online/local-server.cjs`). Every function and all six scripts on the server checked identical to the tested copy.
  - **Fixed on the way:** Gathering 5's second Match now appears only if the roll-call was answered (canon: "only if the roll-call was answered and the watchman said the Verse himself"); the demo had the same fault, fixed with it.
  - **Not yet:** the Day 4 poll and the reminder (with notifications), the recap for a friend who missed it, the "what you missed" line, switching which fight a reinforcer joins, Ask boards that gain questions during the night (Gathering 4 shows them all at once, as the demo does), Garrick's Recap after Gathering 6, read-backs of the week's pins, the Store closed during your own Gathering roll or fight, and Gathering 1's "This is a United Effort" line is still said to a friend alone (canon: not said alone; the demo the same).
- **16 Oct: Garrick in the chat** (Fake Guru: "3 Garrick"; migration `0042`; the server function `supabase/functions/garrick`; `PartyChat.tsx`). Core Rules §1 and §12a, `garrick-stored-lines.md`.
  - He replies when spoken to: a message that names him goes to the server function, which posts it as the friend's own (the chat's usual rules), runs the same router as the demo, and posts his reply under his name.
  - The router runs only on the server, so his hidden meanings never reach a phone. Stored lines and the Deception Table's rows come first; the AI writes only small talk about the road, the food and the weather, behind the banned-phrase filter, at most 12 a day for a party (then stored lines only). Without the Gemini key, stored lines only.
  - His story state comes from the party's day and its Gatherings: the ledger, the prisoner (and whether the party asked him who leads them), the children home, the Verse of the Four, Highwall, the Week 6 reveal. "Malakor. My grandmother taught me that name." is said once per party, from Gathering 2. His lines don't repeat in a row (a log per party).
  - Canon's first-time line, "Everyone is here now, and so is Garrick. Ask him anything.", shows the first time a friend opens the chat on a phone.
  - Tested on the local copy of the server: no reply to a message that doesn't name him; the name once, then a deflection; Week 1 and Week 2 Day 2 guards; "Kings have had less" from Week 2 Day 5; rotation; the AI, take-control and identity questions; the chat closed on Day 1. In a browser: his lines in the chat. On the real server: the function runs and refuses anyone not signed in; the story state reads right for the test party.
  - Not yet: the Gemini key, private questions in your own thread, Garrick at the fire.
- **16 Oct: Garrick's morning line** (Fake Guru: "Garrick's daily line", "5am"; migration `0043`, applied; `src/data/garrickMorningLines.ts`). Core Rules §1: "may add a line or two a day".
  - One line a day, posted once for the whole party by the first friend to open the app or the chat that day, stamped 5:00am so it sits first in that day's chat. Logged in `garrick_log` (route `MORNING_LINE`).
  - Canon has no list, so 29 lines were written for approval (`docs/design/garrick-morning-lines-proposal.md`): none on Week 1 Days 1–2 or on a Day 1 from Week 2 on. Approved by Fake Guru on 16 Oct and loaded (`scripts/gen-garrick-morning-sql.ts`, migration `0049`, md5-checked against the local copy).
  - Also: his three spare chat lines that the story also says ("My knees…", "You've not eaten. Sit.", "It's terrible…") wait until the day after the story has said them; the chat shows the newest 200 messages (it showed the oldest 200).
  - Tested on the local copy: posted once whoever opens first, stamped 5:00am, none on a day with no line, none before the chat opens, refused to someone outside the party.
- **Earlier note on chat lines:** the party chat lines for leaving and a new host ("Dev has left the road.", "Mei now leads the party.") come with the party chat (step 4). Session Zero, the party clock and [READY] come next in step 1. Friends can use it only once the app is on the web (a hosting choice for Fake Guru).
- **16 Oct: the chat opens after Day 2's chapter** (Fake Guru: "Day 2"; migration `0044`, applied). The chat and the Campfire named Garrick on Day 2 while the story named him only on Day 3. Now the story gives his name on Day 2 in his taproom (in the Week 1 storybook rewrite, approved and loaded), and the chat opens for each friend once they have read Day 2's chapter; from Day 3 it is open to every friend. Tested on the local copy (closed on Day 1; on Day 2 open only for a friend who has read it; open to all on Day 3).
- **16 Oct: Week 1 in the storybook voice, and the road so far** (Fake Guru: "1 ok, 2 everyone, 3 yes"). The approved Week 1 rewrite is in `episode-1-the-list.md`; the generators were rerun (Week 1's steps unchanged except one new beat after "This was never about you."; Weeks 2 to 6 byte-identical) and the server copies loaded (`0047` chapters, `0048` Gathering 1; md5 checked against the local copy). Garrick gives his name on Day 2 (a new Deception Table row; in Garrick's Recap). Every day now opens with THE ROAD SO FAR (`0045`, `0046`; Week 1's seven recaps). Tested on the local copy: Day 2 with its recap, the party size filled in; Gathering 1 played through with two players, the new beat shown.
- **16 Oct: Week 2 in the storybook voice** (Fake Guru: "Okay, go with your suggestion"). The approved Week 2 rewrite is in `episode-2-the-wind-stone.md`; generators rerun (other weeks byte-identical); server copies loaded and md5-checked: `0050` (Week 2 recaps), `0051` (chapters, day by day), `0052` (Gathering 2). Tested on the local copy: Week 2 Day 3 with its recap; Gathering 2 played through with two players, Meira's page and the turned-over hand shown. Garrick's morning lines approved and loaded (`0049`).
- **16 Oct: Week 3 in the storybook voice** (Fake Guru: "Go with your suggestion"). The approved Week 3 rewrite is in `episode-3-the-fire-stone.md`; generators rerun (other weeks byte-identical); server copies loaded and md5-checked: `0053` (Week 3 recaps), `0054` (chapters, day by day), `0055` (Gathering 3). Tested on the local copy: Week 3 Days 2 and 6 with their recaps and new lines; Gathering 3 played through by two players (the doctrine beat, *Rise.* and the Approach lines shown, no page errors).
