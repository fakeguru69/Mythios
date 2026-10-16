# Prose audit: the online game's own screens

**What I checked.** Every player-facing string in `src/online/` (OnlineApp, SessionZero, InstallGuide, PartyChat, OnlineDay, OnlineChest, OnlineStore, OnlineCampfire, OnlineGathering, onlineText, the `plainError` table in supabaseClient), plus the player-visible text the server writes in `supabase/migrations/*.sql`: party-chat notices, the Battle's round notes, and every `raise exception` that can reach a phone. I left out story text that comes from the episode files, Garrick's lines and the Campfire's stored lines. Other helpers cover those.

That is about 230 strings. About 70 are canon, word for word (`review-accounts-and-invites.md`, Core Rules §4, §7, §11, §12a, Campfire v2.3) or approved by Fake Guru on 16 Oct (the Mythios intro, the name question). I mark those **canon** and leave them alone unless noted.

**Verdict.** The canon screens are in good shape: the invite, sign-in, waiting room, Session Zero, the leaving and removing lines, and the first-time lines. They are warm and plain, and they read well. The weak spots are the build's own glue text in four places:
1. **The Campfire's "last light"** opens on a five-word line that does not tell a new player what this is.
2. **The weekday fight** uses a terse, coded round line (`WEP`, `ARM`, `Enemy:`). That differs from canon's own round format, which the Gathering Battle already follows.
3. **Small labels that say the wrong thing.** `USED` on a Relic that is only armed. `LEAVE IT` as the button that *sends* a message in a bottle. `UNJUMBLE WORD 1 (+25G)`. A summary line glued together with " · ".
4. **Server refusals that fall through to "Something went wrong."** A host picking a start day that has passed is one real case. One ordering bug also gives a friend the wrong message in the Gathering lobby.

Below, CURRENT is quoted exactly. Each proposal changes wording only. No numbers, rewards, rules or story facts change.

---

## 1. The Mythios intro and the series shelf (the first screen)

`src/online/onlineText.ts` lines 8–31, shown by `OnlineApp.tsx` ~1161–1190 and on the signed-in shelf ~1003–1062.

The intro is **approved (Fake Guru, 16 Oct)**. It is good: the fire at the edge of the map is a real image, and it tells a stranger what the app is in four short paragraphs. I would make only two small changes. Everything else should stay.

**1a. Intro, second paragraph** (`MYTHIOS_INTRO.lines[0]`)
- CURRENT: "Its stories are too long for one night, so it tells them a little each day: a chapter every morning, read wherever you are, and one evening a week when your whole company sits down together."
- PROPOSED: "Its stories are too long for one night, so it tells them a little at a time: a chapter each morning, to read wherever you happen to be, and one evening a week when your whole company gathers at the fire."
- WHY: "read wherever you are" can parse as past tense. "Gathers at the fire" closes the opener's image and quietly plants the word Gathering. I kept "Its" on purpose: Mythios is not a person, and the out-of-game rule says it never claims to be one.

**1b. Intro, last paragraph** (`MYTHIOS_INTRO.lines[2]`)
- CURRENT: "The teller remembers everything. What you do today is still there next week."
- PROPOSED: "The teller forgets nothing. What you do today will still be there next week."
- WHY: "Forgets nothing" lands harder and has a faint edge that suits a dark series. "Will still be there" reads more naturally than "is still there". It promises memory, not consequences, so it stays true.

**1c. Keep as is:** the opener, "Mythios is that teller.", the second paragraph ("Each series is a world of its own…") and the call ("Choose a story. Gather your friends. Begin."). They are the best lines in the online build.

**1d. The series card: add one line of hook under the premise** (`SERIES[0]`, a new field such as `hook`, shown under `premise` on the shelf only; the invite stays canon)
- CURRENT (card body): "In the hill villages, children are going missing, and nobody is looking for them." then "Season 1 · Six weeks · two to six friends"
- PROPOSED (card body):
  "In the hill villages, children are going missing, and nobody is looking for them."
  "It begins on an old forest road, where a man steps out of the trees with a blade drawn and says nothing at all."
  "Season 1 · six weeks · for two to six friends"
- WHY: The premise alone is one line, and Fake Guru's standard says "don't rush it with just a one or two liner." The hook is the first minute of Day 1 as every player sees it (`chapterScripts.ts` W1D1, the shared opening), so it obeys review §"Nothing here gives the story away". I used the man, not the axle, because the class openings differ before the fight. Lower-case "six weeks" fits the middle of a line.

**1e. Session Zero's name note** (`SZ_NAME_NOTE`, approved 16 Oct). Optional.
- CURRENT: "Your friends will know you by it in every season of this series."
- PROPOSED: "This is your character's name. Your friends will know you by it in every season of this series."
- WHY: A new player has just answered "What should your friends call you?" at sign-in. A second name question with no hint looks like a repeat. Ask Fake Guru, since the line is approved.

---

## 2. Sign-in, party and invite screens (`OnlineApp.tsx`)

**Canon, keep as written:** "Join the adventure in…", "{host} has invited you to join…", the three bullets, "Free.", "First, so the story knows you.", "What should your friends call you?" with its note, "You've knocked." and its line, "Not this time." and its line, "{host} has let you in.", "You're ready.", "The road opens when {host} says so.", "Who walks with you?", "You need at least one friend, and no more than five.", the clock note, "Send this to your friends." with its note, "This party has set off." and its line, "This party is full." with "Six is as many as the road will hold.", "Leave the party?" and "Remove {name}…?" with their bodies and buttons, "You're no longer in this party.", "Start the story for N of you?", "Needs two of you ready…", and the credit line. All of these are good.

**2a. Email sent after sign-up** (~174)
- CURRENT: "We sent a link to {email}. Open it to finish."
- PROPOSED: "We've sent a link to {email}. Open it to finish signing up. If it hasn't arrived in a minute or two, look in your spam folder."
- WHY: This is the one place a new player can get stuck for good, and mail from a new Gmail sender often lands in spam.

**2b. Password-reset sent** (~184)
- CURRENT: "We sent a link to {email}. Open it to choose a new password."
- PROPOSED: "We've sent a link to {email}. Open it to choose a new password. If it isn't there, look in your spam folder."
- WHY: Same reason as 2a. Keeps the two lines matched.

**2c. New password screen** (~1111–1133)
- CURRENT: heading "Choose a new password", the button greyed out below 6 characters, no hint.
- PROPOSED: add a note under the field: "At least 6 characters."
- WHY: The button stays grey with no reason given.

**2d. A dead invite** (~72 and ~95, and `plainError` "this invite no longer works")
- CURRENT: "This invite no longer works. Ask for a new link."
- PROPOSED: "This invite no longer works. Ask your friend to send a new link."
- WHY: "Ask for" leaves out *who* to ask. The host may have made a new link (§3: the old one stops working).

**2e. Host, before their own Session Zero** (~720)
- CURRENT: "Your own character comes first."
- PROPOSED: "First, your own character. Friends can ask to join while you choose."
- WHY: The current line is thin, and it does not say the invite is already live, which it is (the invite card shows below).

**2f. Paste-an-invite screen** (~324): "Paste the invite link your friend sent you." Good, keep.

**2g. "Your Mythios name:"** (~1073). Optional addition under it, in small type: "Your friends see this name when you ask to join a party."
- WHY: The account name and the character name are easy to confuse (see 1e). This says what each one is for.

**2h. Button case.** These action buttons are in lower case while every other action is in capitals: "Remove" (~605), "Leave the party" (~861), "Sign out" (~1096). Canon writes buttons as [CAPS]. Either make these REMOVE / LEAVE THE PARTY / SIGN OUT, or keep lower case only for "Back" and "← …" links. Consistency only, no wording change.

---

## 3. Session Zero (`SessionZero.tsx`, `onlineText.ts`)

Everything here is **canon** (§7): the premise, "Choose the one who will walk this road.", the six class lines, "Your best Attribute is…", "{friend} is already a {class}…", "Nobody is only one thing…", the two questions and their note, the starting card and "Day 1 opens at 5:00am. Sleep, if you can." The class lines are among the best writing in the game. Nothing to change apart from 1e.

---

## 4. The install guide (`InstallGuide.tsx`)

**4a.** (~42)
- CURRENT: "It opens like an app, one tap a day."
- PROPOSED: "It opens like an app, so each day's chapter is one tap away."
- WHY: "one tap a day" is cramped and a little odd. The new line says the actual benefit.

The steps themselves are clear and correct. Keep them.

---

## 5. The party chat (`PartyChat.tsx`, SQL notices)

**Canon, keep:** "Everyone is here now, and so is Garrick. Ask him anything.", "Tell us what's wrong.", "{name} has left the road.", "{name} now leads the party.", "{name} is now {new}.", and the result lines "{name} passed / failed today's Challenge." / "{name} has read today's chapter." (`0012_days_online.sql` ~308).

**5a. Chat input** (~201): it has no placeholder.
- PROPOSED placeholder: "Say something to the party, or to Garrick"
- WHY: Garrick answers only when his name is in the message. Nothing on the screen teaches that, and this placeholder does it without breaking the world.

**5b. After a report** (~169)
- CURRENT: "Thank you."
- PROPOSED: "Thank you. We'll look at it. They won't be told who reported it."
- WHY: The current reply is abrupt. The added line is true (review §5: "The person reported is not told"), and it is the reassurance a reporter wants. It is not a game risk, so the "never reassure" rule does not apply.

**5c. A fragment word found** (`0019_seeker_chest.sql` ~121)
- CURRENT: "{name} found a missing word in the Week 1, Day 3 fragment."
- PROPOSED: "{name} found a missing word in the fragment from Week 1, Day 3."
- WHY: "the Week 1, Day 3 fragment" is a stack of nouns. The new order reads as a sentence. Same facts.

**5d. A pinned theory** (`0024_campfire.sql` ~370)
- CURRENT: "{name} pinned a theory."
- PROPOSED: "{name} pinned a theory at the fire."
- WHY: In the chat there is no context, so a friend cannot tell *where* to go and look.

**5e. The Gathering time** (`0032_gatherings.sql` ~1238)
- CURRENT: "The Gathering is at 8:00pm on Day 7."
- PROPOSED: "This week's Gathering is at 8:00pm on Day 7."
- WHY: When the host changes the time, a bare repeat looks like a duplicate. "This week's" makes it read as news. Optionally use "The Gathering has moved to 8:00pm on Day 7." when it is a change (needs a flag).

---

## 6. The day screen (`OnlineDay.tsx`)

**Canon, keep:** the first-Challenge line, "Your first fight. You and he take turns. A roll decides each blow.", the roll line "🎲 13 + Charm 38 (+2) − DC 7 = +8", "You succeed on X+", [NOT NOW], [LEAVE IT], "PASSED · +500g", "FAILED · −150g".

**6a. Relic toggle label, card and [PRESS ON]** (~380 and ~437)
- CURRENT: `{armed ? 'USED' : 'USE'}`
- PROPOSED: `{armed ? 'TAKE BACK' : 'USE'}`
- WHY: The Relic is only armed and is spent when the roll is made (§12a: "A second tap takes it back"). "USED" says it is already gone, which may stop a player from taking it back. The Gathering screen already says TAKE BACK (~357), so this also makes the two screens match.

**6b. The [PRESS ON] card** (~415 and ~445)
- CURRENT: heading "[PRESS ON] · {title}", button "🎲 ROLL {ATTR}"
- PROPOSED: heading "PRESS ON · {title}", button "🎲 PRESS ON · {ATTR}"
- WHY: The square brackets are the script's mark-up for a button and look like leftover code in a heading. Canon names the button [PRESS ON] (§3), and the player should tap the word the card is named for.

**6c. Card set aside** (~229)
- CURRENT: "Set aside. It waits here until you take it up, and the Store is open."
- PROPOSED: "Set aside. It waits here for you until the day ends at 5:00am, and the Store is open meanwhile."
- WHY: "Take it up" is slightly stiff, and the line leaves out the one thing a player must know: a set-aside card expires at the day's end (§12a). It states the limit plainly and reassures nothing.

**6d. The weekday fight's round lines** (~495–502). This one breaks canon's format (see (a)).
- CURRENT: "You: 🎲 12 + WEP 14 − DEF 22 = −3 · miss" / "Enemy: 🎲 9 + ATK 15 − ARM 27 = −3 · hit, 15 damage"
- PROPOSED (Core Rules §4, as the Gathering Battle already prints it):
  "You Roll 12 + Weapon 14 − DEF 22 = −3. MISS"
  "{Enemy name} Rolls 17 + ATK 15 − Armor 27 = 5. HIT"
  "Damage = 5 × 5 = 25. Your HP 100 → 75"
- WHY: "WEP" and "ARM" are jargon nobody is taught. "Enemy:" throws away the enemy's name, which is right there in `step.name`. The two screens should print a fight the same way.

**6e. The fight result** (~525)
- CURRENT: "WON · +300g" / "BRUISED SCRAPE"
- PROPOSED: "VICTORY. {Enemy} defeated in {n} rounds. REWARD: +300g" (or "REWARD: none" on a Challenge day) / keep "BRUISED SCRAPE" (CLAUDE.md §5: 0 HP = "Bruised Scrape").
- WHY: Canon §4's result card is warmer and clearer than "WON". The Gathering already uses it.

**6f. Summary when nothing was earned** (~555)
- CURRENT: "You earned: nothing new today"
- PROPOSED: "You earned: nothing today"
- WHY: "new" suggests there was something old. Small fix.

**6g. Fallback on Day 7** (~690): "Tonight: the Gathering." Fine as a fallback. Keep.

---

## 7. The Seeker Chest (`OnlineChest.tsx`)

**Canon, keep:** the first-fragment line (§7).

**7a. How to play** (new small line under the first-fragment line, shown at the same time)
- PROPOSED: "Tap a jumbled word, then tap its letters in order."
- WHY: The word-lock is the best part of the build (CLAUDE.md §4), but nothing on screen says how to start it.

**7b. The puzzle's label** (~246)
- CURRENT: "UNJUMBLE WORD {n} (+25G)"
- PROPOSED: "WORD {n} · PUT THE LETTERS IN ORDER · +25g"
- WHY: "Unjumble" is a made-up verb. Upper-casing turns "g" into "G", which is used nowhere else for gold.

**7c. One word per friend today** (~71)
- CURRENT: "Until today ends, each friend fills one of its two words. Leave the other for a friend."
- PROPOSED: "One word each while today lasts. Leave the other for a friend; if it's still open tomorrow, anyone may try it."
- WHY: The current line tells the player off without saying when the limit lifts. The rule is in the code comment ("keeps one word per friend until the fragment's day ends"), and §12a lets a late friend claim an unfilled word.

**7d. Too many tries** (~80 and ~91: two wordings for one rule)
- CURRENT: "Five wrong tries. Try this word again in {secs} seconds." / "Too many wrong tries. Try this word again in {secs} seconds."
- PROPOSED (both): "Five wrong tries. This word opens again in {m:ss}." (for example, "1:52")
- WHY: One rule should have one sentence. "118 seconds" reads like a machine counting.

**7e. Keep:** "A friend has just found this word.", "found by you" / "found by {name}", "✓ SOLVED", "Clear ✕", "WEEK {n} FRAGMENTS · NEWEST FIRST".

---

## 8. The Store and Relics (`OnlineStore.tsx`)

**Canon, keep:** the first-Store line (§7), "Sword-Cane — Lv. 2 · Weapon 15", "{name} gave you a Charm Relic."

**8a. Closed for a fight** (~159)
- CURRENT: "The Store is closed while your fight is open."
- PROPOSED: "The Store is closed while your fight is open. Finish it first, or set it aside with NOT NOW before the first round."
- WHY: The card version (~156) already tells the player what to do. The fight version leaves them stuck. (On W1D1 there is no NOT NOW; there, use the plain first sentence only.)

**8b. Closed during [PRESS ON]** (~158)
- CURRENT: "The Store is closed while your card is open. Roll it or leave it first."
- PROPOSED: "The Store is closed while your card is open. Press on or leave it first."
- WHY: It uses the card's own two buttons as the player sees them.

**8c. The "No" button on a purchase or gift** (~181)
- CURRENT: "NO"
- PROPOSED: "KEEP MY GOLD" (on a purchase) / "KEEP IT" (on a gift)
- WHY: A bare "NO" is the one robotic button in the Store. Canon's own confirms pair [REMOVE]/[KEEP] and [LEAVE]/[STAY].

**8d. Where Relics are used** (~253)
- CURRENT: "A Relic is used from the button on a card or in a fight."
- PROPOSED: "To use a Relic, tap USE on a Challenge card or in a fight."
- WHY: The current sentence is passive and vague ("the button").

**8e. Keep:** "WEAPON AND ARMOR", "RELICS · 150G EACH" (lower-case "g" would match the rest; see 7b), "You hold {n}", "To {name}", "GIVEN TO YOU", "LEVEL 5".

---

## 9. The Campfire screen's own lines (`OnlineCampfire.tsx`)

**Canon or design, keep:** "What we did today", "Leave the fire", "Give up", "Two readings at the fire.", "Nobody went to {place} tonight.", "At the fire now: …", "Head straight to the fire", "The rest are on the board.", the fire's error lines ("The fire opens once your own day is done.", "Tonight is the Gathering.").

**9a. The last light's opening line** (~173). This is the most important fix in this file.
- CURRENT: "One more look, or the fire."
- PROPOSED: "The light is going. There is time for one more look before dark, or you can head straight to the fire."
- WHY: This is the first screen of a new kind of play, and it opens on five words that assume the player already knows the idea. The new line gives the evening some atmosphere, explains the choice, and ties in the "last light" name and the button below it.

**9b. The lead buttons' odds** (~197)
- CURRENT: "{verb} · {X}+"
- PROPOSED: "{verb} · succeed on {X}+"
- WHY: A bare "7+" means nothing unless you have seen a Challenge card. It costs two words and matches "You succeed on X+".

**9c. What we did today: the sentence join** (~284–290)
- CURRENT: "Mei passed today's Challenge at Fenmark · gave a Relic to Dev · found a missing word in today's fragment."
- PROPOSED: "Mei passed today's Challenge at Fenmark, gave a Relic to Dev and found a missing word in today's fragment."
- WHY: A sentence glued with " · " reads like a log. Join with commas and a final "and" (the same `nameList` helper as in OnlineApp).

**9d. The bottle's button** (~319 and ~593)
- CURRENT: "LEAVE IT"
- PROPOSED: "SET IT ADRIFT" (or, plainer, "LEAVE THE MESSAGE")
- WHY: Everywhere else in the game, [LEAVE IT] means "skip this" (canon, [PRESS ON] and [LOOK CLOSER]). Here it *sends*. A player who has learned the button may think they are throwing the message away.

**9e. Pin before peek** (~503)
- CURRENT: "Pin your own to see the others'."
- PROPOSED: "Pin your own reading to see where the others stand."
- WHY: "the others'" ends on a dangling possessive. The new line says what is hidden.

**9f. Your find's hint** (~388). "Word {n} of today's fragment starts with “{letter}”." Good. Keep.

**9g. Fragment still open** (~419). "Both of its missing words are still open." / "One of its missing words is still open." Good. Keep.

**9h. Keep:** "A riddle?" (a nice light touch), "Not that.", "The answer: …", "{name} solved it: …", "Use tonight's pin", "For whoever comes to the fire next.", and the placeholders ("One line for the others", "Your answer, in one line", "Your theory, in one line", "Something you want the others to think about", "In your own words (optional)").

---

## 10. The Gathering screen's own lines (`OnlineGathering.tsx`, `0032_gatherings.sql`)

**Canon, keep:** the Battle card's "You hit on…", "Enemy hits on…", "Damage = Margin × 5", round lines ("You Roll… HIT", "Damage = … HP a → b"), "VICTORY. … defeated in N rounds. REWARD: +Ng", "DEFEATED. REWARD: none", "DEFEATED. You are down for this Battle. Your friends fight on.", "{NAME} IS IN TROUBLE · HP n" with [GIVE A COMBAT RELIC], "The fight begins in…", "All of you matched it." / "{names} matched it.", [PICK], [GO ON], "MYTHIOS asks the table", the United Effort's SUCCESS / FAIL.

**10a. The lobby's note** (~180–183)
- CURRENT (before it opens): "It starts once everyone is here after it opens."
- CURRENT (open): "It starts the moment everyone is here, or by itself 30 minutes after it opened."
- PROPOSED (before): "Once it opens, it begins as soon as everyone is here."
- PROPOSED (open): "It begins as soon as everyone is here. After ten minutes anyone here can start it, and after thirty it starts by itself."
- WHY: The first line is tangled. The second leaves out the ten-minute rule even though the START button appears at that point (§11). Without it, a friend wonders why a button has turned up.

**10b. The group vote's footnote** (~314)
- CURRENT: "The most taps wins."
- PROPOSED: "The choice with the most taps wins; a tie goes to the first vote."
- WHY: The grammar is off, and players will ask about ties (§11 gives the rule).

**10c. The Approach countdown** (~348)
- CURRENT: "Choosing in {n}s"
- PROPOSED: "The roller is chosen in {n}s"
- WHY: "Choosing" does not say *what* is being chosen.

**10d. The Approach growth** (~371)
- CURRENT: "PASSED · +500g · Might +3"
- PROPOSED: "PASSED · +500g · Might 14 → 17"
- WHY: The weekday card shows growth as "score → new score" (§7's first-pass line does too). One format for both.

**10e. The United Effort's rule line** (~600)
- CURRENT: "A pass does 10 + a d20 to {way}; a fail, to {risk}. +300g to every friend if {way} reaches 0."
- PROPOSED: "Each pass strikes {way} for 10 + a d20; each fail strikes {risk}. If {way} falls to 0, every friend earns 300g."
- WHY: Same rule, read as a sentence rather than shorthand. "Strikes" suits both bars.

**10f. The United Effort's Relic note** (~620)
- CURRENT: "Your {kind} Relic: +4 on this roll (tap again to take it back)."
- PROPOSED: "Your {kind} Relic: +4 on this roll."
- WHY: A TAKE BACK button sits right under it, so the parenthesis repeats it.

**10g. The burn and the lost strike** (Battle notes written by the server)
- `0032_gatherings.sql` ~219. CURRENT note: "Blade and torch: 2 more HP." (shown as "Blade and torch: 2 more HP. Mei HP 60 → 58")
  PROPOSED: "The burn: 2 damage." (shown as "The burn: 2 damage. Mei HP 60 → 58")
  WHY: "2 more HP" reads as if HP goes *up*. Canon calls it "the burn" (`episode-3`, l. 681).
- `OnlineGathering.tsx` ~462. CURRENT: "{name}: loses this strike (knee-deep)" / "{name}: rising, loses this strike"
  PROPOSED: "{name} stumbles knee-deep and loses this strike." / "{name} rises again, and loses this strike."
  WHY: These are the only round lines that read like a debug note. Canon's own condition words ("knee-deep", the hollowed rising) are kept.

**10h. The Gathering card on the party page** (~700–720)
- CURRENT: "Day 7 at {time}." and the buttons "THE GATHERING" / "JOIN THE GATHERING" / "TONIGHT’S GATHERING"
- PROPOSED: "This week's Gathering: Day 7, {time}." / buttons "GO TO THE GATHERING" / "JOIN THE GATHERING" / "READ TONIGHT'S GATHERING AGAIN"
- WHY: "Day 7 at 8:00pm." alone has no subject. "TONIGHT'S GATHERING" on a finished night does not say the button re-opens it. The curly apostrophe also differs from every other button.

**10i. Keep:** "It is {name}'s to choose.", "Listen to them. In {n}s it is yours to choose." (good: quiet and clear), "One of you rolls it, in front of everyone.", "It is yours to roll.", "It rolls by itself in…", "Stepped up: …", "Your pick is private until they are shown together.", "You can ask one question." / "You have asked yours.", "Your answer, for the table" with [SAY IT], "Arrived during the Battle: fights beside the friend most in need.", "Or MYTHIOS names the next in {n}s", "{name} hands it on.", "There is no Gathering tonight."

---

## 11. Server refusals a player can see (`supabaseClient.ts` `plainError`, SQL `raise exception`)

The table translates most refusals well ("Your choices are set now that Day 1 has opened." is a good example). Gaps:

**11a. Ordering bug** (`plainError` ~124 vs ~141). The server raises "only the host can start it yet" in the Gathering lobby (`0032` ~1062). The check `m.includes('only the host')` comes first, so a friend sees **"Only the host can do that."**, not the written line "Only the host can start it until it has been open 10 minutes." Move the specific check above the general one. That is a wording fix with no rule change.

**11b. Refusals that fall through to "Something went wrong. Try again."** A player can really hit these:
- "choose a later day" (`0009` ~14): the host picks a start day whose 5:00am has passed. PROPOSED: "That day has already begun. Pick a later one."
- "the story has already started" (`0005` ~143, `0009` ~10): the host changes the clock or the start day after Day 1 opens. PROPOSED: "The story has started. That can't be changed now."
- "already rolled" (`0012`, `0021`): a double tap or a second phone. PROPOSED: "That roll is already made." (better still, show nothing, since the result arrives on reload)
- "the fight is over" (`0012` ~250): same case. PROPOSED: "That fight is already over."
- "not now" (`0021` ~115, a stale [NOT NOW]): PROPOSED: "That can't be set aside now."
- "the story has not started" (`0012` ~89): PROPOSED: "The story hasn't started yet."
- "a name is 1 to 12 characters" (`0011` ~74): it does not match the existing "character_name" check. Add it: "A name is 1 to 12 characters."
- WHY: "Something went wrong" sounds like a fault when nothing is broken, and the player retries an action that can never succeed.

**11c. The catch-all** (~151)
- CURRENT: "Something went wrong. Try again."
- PROPOSED: keep, but change the network line (~150) from "No connection to the server. Try again." to "We can't reach the game just now. Check your connection and try again."
- WHY: "The server" is builder-speak. "The game" is what the player thinks they are talking to.

---

## (a) Lines that break a rule as written

1. **Two canon first-time lines are never shown, online or in the demo.** "After the first fight": *"Gold buys better weapons and armor in the Store. Every fight starts fresh: your wounds never follow you."* "After the first passed Challenge": *"Might 14 → 26. At 26 a skill becomes Apprentice: +2 on every roll with it. The more days you play, the further you grow."* (Core Rules §7, first-time lines table.) A search of `src/` and the migrations finds neither. Both belong in `OnlineDay.tsx` (after the W1D1 fight result, and after the first passed card). The fight one is also the only place a new player learns that wounds do not carry over.
2. **The weekday fight's round line is not canon's format** (6d). Core Rules §4 fixes the round message ("You Roll 14 + Weapon 14 − DEF 23 = 5. HIT / Damage = 5 × 5 = 25. Guard HP 100 → 75 / Enemy Rolls …") and the result card ("VICTORY. … REWARD: +Ng"). The Gathering follows it; `OnlineDay.tsx` ~495–527 does not. Episode 1 Day 1 also says the first fight explains each line the first time it appears (the roll, the hit, the damage). Online it shows only the single first-fight line.
3. **`USED` on an armed Relic** (6a) contradicts §12a ("A second tap takes it back"). The label says the Relic is spent before it is.
4. **The Gathering lobby gives a friend the wrong refusal** (11a) because of the `plainError` ordering.

I found no first-use gate breaks, no reassurance before a risk, and no out-of-game talk inside the story. The invite and shelf leak nothing beyond the first minute of Day 1, including proposal 1d.

## (b) The changes I'd prioritise

1. **The last light's opening line** (9a): the first screen of a whole mode, currently five words that teach nothing.
2. **The two missing first-time lines, and the weekday fight in canon's own format** (a1, a2, 6d, 6e): a new player's first day is where the game teaches itself, and two of its lessons are missing.
3. **The labels that say the wrong thing** (6a `USED` → TAKE BACK; 9d bottle `LEAVE IT`; 7b `UNJUMBLE`; 9c the " · "-joined sentence): small edits, real confusion removed.
4. **The series card's hook line and the two intro touches** (1d, 1a, 1b): the first thing anyone reads. They need Fake Guru's yes, since the intro is approved.
5. **The server refusals** (11a, 11b): stop "Something went wrong" from showing when nothing went wrong.
