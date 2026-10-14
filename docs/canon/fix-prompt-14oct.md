# Fix prompt for the build (14 Oct 2026)

Paste everything below the line into the other AI. Attach `campfire-build-bundle.md` (Campfire v2.3) with it.

---

You are fixing the "Tales of the Dark Moon" (Mythios) app in this project. I have checked the code as of the 14 Oct commit ("Update Mythios to 14 Oct snapshot with Campfire v2.2") against the game's rulebook. Below are the fixes, in order of importance. Each one says what is wrong, where it is, and what it must do instead. Do them all in one pass. Do not invent new numbers, new lore or new features. Where a fix says "the rulebook", the numbers given here are the rulebook's numbers; use them exactly.

When you change something, also change every connected piece: the glossary in mythiosRulesData.ts, tooltips, button labels, result lines, comments, and the Audit Workbench text that describes it. When you finish, give me a plain list: each fix number, done or not done, the files you changed, and anything you could not do and why.

FIX 1. The Challenge roll must use the tier bonus and the right difficulty.

Where: components/StoryAndPartyTabs.tsx, handleRollChallenge (around line 467) and obstacleTarget (around line 408).

What is wrong: the roll adds the raw Attribute number (for example 14) to the d20 and compares it with 36 + 6 × week (42 in Week 1). A new player passes only on a natural 20. The roll also happens on the phone.

What it must do: roll d20, add only the tier bonus of the chosen Attribute (Novice 1 to 25 = +0, Apprentice 26 to 50 = +2, Adept 51 to 75 = +4, Expert 76 to 100 = +6, Master 101 and up = +8; getTierInfo already returns this), add +4 if an Attribute Relic is used, and compare with the weekday difficulty for the week: Week 1 = 6, Week 2 = 7, Week 3 = 7, Week 4 = 8, Week 5 = 9, Week 6 = 9. The roll succeeds when d20 + bonus − difficulty is 1 or more. A tie fails. There is no automatic success on a natural 20 (remove `|| d20 === 20`). The server already has this exact roll at POST /api/roll-challenge in server.ts (it uses net >= 1, which is right). Use it: the app sends the difficulty, the tier bonus and the relic bonus, and the server returns the die and the result. Do not roll Challenges on the phone. On the card, replace "Obstacle 42" and its progress bar with one line, "You succeed on X+", where X is the lowest die roll that passes (difficulty + 1 − bonus, never lower than 2 and never higher than 20). Apply the same roll and the same difficulties to the Fan Out Challenge and to [PRESS ON], which is 4 harder than the day's difficulty.

FIX 2. Challenge pay and growth must match the rulebook.

Where: the same function, and every place that pays for a Challenge.

What it must do: a passed Daily Challenge pays +500g. (The Detour fight after a failure stays, as decided on 8 Oct.) A failed one costs 150g (gold never goes below 0). A passed [PRESS ON] pays +200g and grows nothing. The Attribute grows only on a passed Daily Challenge, by the amount for the number of days the player has played that week: 12, 9, 7, 5, 4, 3, 3 for the first to the seventh day played. Multiply that by the tier's growth rate (Novice and Apprentice 100%, Adept 60%, Expert 30%, Master 10%), round to the nearest whole point, and never give less than 1. An Attribute grows only if the roll was truly uncertain: a die of 1 had to be able to fail and a die of 20 had to be able to pass, judged before any Relic is added. Remove the flat +3 and the extra growth on a natural 20. Update the card text, the result lines and the glossary to say 500 and 150. The first Challenge card's line is: "A Challenge. Pick the skill you trust and roll. Pass, and you earn 500 gold and that skill grows. Fail, and it costs 150 gold."

FIX 3. Put every gold amount in one place.

Some gold amounts in the build have not yet been through a numbers check: the Fan Out roadside cache (+150g), the Detour fight (150g win, 75g loss), riddles (+10g and +15g), the hidden cache (+25g) and the W6D3 +1 bonuses. Keep these features as they are, but move every gold amount in the game into one file, src/data/economy.ts, with one named constant each, and use those constants everywhere, including the text the player sees. Mark the untested ones with a comment "PENDING numbers pass". These are the tested amounts that must not change: Challenge +500g / −150g; [PRESS ON] +200g; a weekday fight on a day with no Challenge 300g win / 0 loss; a weekday fight on a day that also has a Challenge pays nothing; [LOOK CLOSER] +75g; Match 50g per right pick (100g if every friend present is right); United Effort +300g to every friend if the job is done; each fragment lock word +25g; Gathering Battle reward 380g, 520g, 740g, 740g, 1,030g, 1,030g for Weeks 1 to 6.

Also remove the "FORFEITS +150G" warnings and the "you pass up the +150g roadside cache" lines on the Fan Out choice (StoryAndPartyTabs.tsx around lines 1993 to 2043). Head to the Campfire is a finished day, not a loss, and must not be shown as one.

FIX 4. The Gathering Combat Relic must be used up.

Where: StoryAndPartyTabs.tsx, battleRelicUsed (around lines 2745, 3137 and 3938).

What is wrong: the relic gives +1 in the Battle, but it is never taken out of the player's Bag, so it is free every Gathering.

What it must do: when the player uses a Combat Relic in the Battle, remove one Combat Relic from the Bag at that moment (the same way the Attribute Relic is removed with onUseRelic). It counts as one extra gear level, +1 Weapon and +1 Armor, for the rest of that fight. The button is disabled if the player has none.

FIX 5. The United Effort must work the way the rulebook says.

Where: StoryAndPartyTabs.tsx, handleRollUnitedEffort (around line 3228).

What is wrong: it rolls once for four fixed heroes (YOU, MEI, DEV, ARJUN), doubles each result and adds them together.

What it must do: two bars each start at 100. One is the thing in the way, the other is the thing the party stands to lose (each Gathering names them; take the names from the United Effort stories if they are in the data, otherwise use "In the way" and "At risk"). Friends take turns. Each turn is an ordinary Challenge in the night's Attribute against the week's weekday difficulty (6, 7, 7, 8, 9, 9), with the same roll as Fix 1. A success does 10 + d20 damage to the thing in the way. A failure does 10 + d20 damage to the thing at risk. After each roll, show the result, the damage and one line of story. It ends when either bar reaches 0. If the thing in the way reaches 0, the job is done and every friend present gets +300g; if not, nobody gets anything and no gold is lost. Nobody goes twice until everyone has gone once. A friend alone takes every turn, and both bars start at 60. One Attribute Relic may be used on a roll, for +4, and it is spent either way. No Attribute grows from these rolls. Use the real party list (see Fix 6), not four fixed names.

FIX 6. The game must work for any party of 2 to 6 friends.

What is wrong: the party is fixed at four. campfireDaysData.ts line 3 has `FriendId = 'YOU' | 'MEI' | 'DEV' | 'ARJUN'`, and the text says "four" in many places. Known places (search for more): StoryAndPartyTabs.tsx "With all four torn stubs" (around line 1862), "granting all four heroes +1 WEP" (around line 3686), "all four of you must now combine" (around line 4016); App.tsx "all four marked children" (around line 30); garrickCampfirePrompts.ts "all four of us" (around lines 108 and 471); soloLandmarkProse.ts "you find three other travellers—Mei, Dev, and Arjun".

What it must do: keep one party list in the game state (2 to 6 friends, each with a name and a class). Every place that loops over friends uses that list. Every line that names how many friends there are uses the list's size or is reworded so it does not count them ("all of you", "the party"). Lines about the four children or the four Stones are story facts and stay as they are; only lines that count the players change. Keep the sample party (You, Mei, Dev, Arjun) as the default for testing, and add a simple test switch in the Audit Workbench to set the party to 2, 3, 4, 5 or 6 friends, so I can check every screen with each size. Campfire rules for party size are in section M of the attached bundle: follow them.

FIX 7. Replace the Campfire data with version 2.3.

What is wrong: campfireDaysData.ts still holds the v2.2 clues. For example, Day 1-1's Fan Out clue "The folded list" smells of tavern wine, which points at the inn and so at Garrick. That breaks a rule: a clue must never point at Garrick.

What it must do: replace every day's Campfire content (opener, forks, callback, riddle, nudge, quips, Fan Out clue) with the JSON in Part 3 of the attached campfire-build-bundle.md (version 2.3). Do not rewrite any line. The fields bearsOnFork and qaNote are for testing only and must never be shown to a player. Keep your first-use checks and run them on the new data; if any check fails, tell me which day and which line rather than changing the text.

FIX 8. Garrick stays all of Week 6, and the Store is never locked.

The empty seat is already gone and nothing sets the Store lock any more, which is right. Now remove the leftover switch completely: the storeLocked state and save field in App.tsx (around lines 48, 115, 251, 320, 367 and 1339) and the storeLocked prop and disabled checks in BagAndStoreTabs.tsx (around lines 814, 826, 897, 932 and 998). Old saves that contain storeLocked must still load.

FIX 9. Hide the spoilers from players.

What is wrong: the Audit Workbench opens with one button from the phone view, and it shows Garrick's hidden meanings (for example "the last living descendant of Malakor's royal line" and "the cup is for the sleeping king Malakor").

What it must do: hide the workbench button and the layout switcher unless a developer flag is on (for example a URL with ?dev=1, or an environment variable). With the flag off, the app must open in phone view with no way to reach the workbench or any "true meaning" text.

FIX 10. Small corrections.

a. The Garrick prompt text in AuditWorkbench.tsx (around line 838) calls him a "retired innkeeper". He keeps an inn. Change it to "innkeeper", and check the system prefix in gmMemoryEngine.ts says the same.

b. The token figures (442 tokens, 45,000 tokens, "98.4% Saved", "0 tokens on ~85% of turns") in gmMemoryEngine.ts and AuditWorkbench.tsx are estimates, not measurements. Label each one "estimate" where it is shown.

c. Players cannot ask Garrick anything in the game view yet; the router is only reachable from the workbench. Do not build that now. Just leave a short note in the workbench that says "Garrick Ask: not yet in the player view."

When you finish, list every change as asked at the top. Do not change anything that is not in this list. If something in the list conflicts with another part of the code, stop and tell me instead of guessing.
