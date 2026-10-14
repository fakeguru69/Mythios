# Fix prompt, part 2 (14 Oct 2026, after commit d7ce1c6)

Paste everything below the line into the other AI.

---

I checked your commit d7ce1c6 ("Implement 14 Oct fix prompt") against the code. Fix 7 (Campfire v2.3) is done exactly right: every line matches. Fix 3 (economy.ts) and the Fan Out wording are good. But six of the ten fixes were not done at all, two were done only in part, and two new mistakes came in. Files that were not touched: server.ts, BagAndStoreTabs.tsx, AuditWorkbench.tsx, gmMemoryEngine.ts, garrickCampfirePrompts.ts.

Please do the items below in one pass. The full detail of each fix is in my first prompt (14 Oct); it still applies. When you finish, list each item with done or not done and the files changed. Do not write "implemented" in the commit message unless every item is done.

ITEM 1 (Fix 1, not done). The Challenge roll is unchanged. StoryAndPartyTabs.tsx line 422 still has `obstacleTarget = 36 + currentWeek * 6`, line 485 still adds the raw Attribute (`d20 + attrPoints`), and line 487 still passes on any natural 20. The Fan Out roll (lines 868 to 870) has the same three faults. Make both rolls d20 + tier bonus (+4 for an Attribute Relic) against WEEKDAY_DC_BY_WEEK (which you already added), passing when d20 + bonus − difficulty is 1 or more, no automatic pass on 20, and use the server's POST /api/roll-challenge for the die. [PRESS ON] is the day's difficulty + 4. Replace "Obstacle 42" and its bar with "You succeed on X+". Right now the growth uses the weekday difficulty but the roll uses the old target, so the two disagree.

ITEM 2 (Fix 2, part done). The pay and growth are now right in the code, but the result card still shows the old numbers: line 1320 shows "+150g" and around line 1319 shows "+3 {Attribute}", and line 2216 says "PASSED · +150g". Show the real gold (GOLD_CHALLENGE_WIN) and the real growth amount that was given. Show "−150g" on a failed Challenge. Add the first Challenge card line from my first prompt if it is not there.

ITEM 3 (Fix 3, part done). Some gold is still hard-coded instead of using economy.ts: StoryAndPartyTabs.tsx lines 885 and 960 (onEarnGold(150), the Fan Out cache), 3092 (onEarnGold(15), riddle), 3270 and 3289 (onEarnGold(300), United Effort), 3303 and 4329 (onEarnGold(75), Look Closer). Replace each with its constant. Search the whole project for any other number passed to onEarnGold or written as gold in player text, and replace those too.

ITEM 4 (Fix 4, not done). The Gathering Combat Relic is still never taken out of the Bag. Remove one when it is used.

ITEM 5 (Fix 5, not done). The United Effort is unchanged: four fixed heroes, (d20 + bonus) × 2, added together. Rebuild it as in my first prompt: two bars of 100 (60 for a friend alone), turns in order, each turn a normal Challenge against the weekday difficulty, success hits the thing in the way for 10 + d20, failure hits the thing at risk for 10 + d20, +300g to every friend only if the thing in the way reaches 0.

ITEM 6 (Fix 6, part done). You added PartyFriend and DEFAULT_PARTY_MEMBERS but nothing uses them yet: FriendId is still 'YOU' | 'MEI' | 'DEV' | 'ARJUN', the United Effort still lists four names, and these lines still count four players: StoryAndPartyTabs.tsx "With all four torn stubs", "granting all four heroes +1 WEP", "all four of you must now combine"; App.tsx "all four marked children" (the oath line); garrickCampfirePrompts.ts "all four of us" (around lines 108 and 471). Make every loop over friends use the party list, reword these lines, and add the 2 to 6 test switch in the workbench.

Two corrections to what you added:
a. ALL_SAMPLE_HEROES uses the names "Tamsin" and "Rowan". Tamsin is one of the kidnapped children in the story, and Rowan is invented lore that was cut. Rename the 5th and 6th sample friends to "Lin" and "Sam".
b. NEW MISTAKE: soloLandmarkProse.ts now replaces [N] with the words "the company". [N] means the number of friends in the party, written as a word. The text reads "a list of [N] names, yours among them", which now comes out as "a list of the company names". Replace [N] with the party size as a word: two, three, four, five or six. Check every place [N] is replaced, in every file.

ITEM 7 (Fix 8, not done). Remove the storeLocked switch completely from App.tsx and BagAndStoreTabs.tsx. Old saves that contain it must still load.

ITEM 8 (Fix 9, not done). The Audit Workbench and the layout switcher are still one tap away in the phone view. Hide both unless a developer flag is on (?dev=1 in the URL). With the flag off, no player can reach the workbench or any "true meaning" text.

ITEM 9 (Fix 10, not done). a. AuditWorkbench.tsx line 838: "retired innkeeper" → "innkeeper"; check gmMemoryEngine.ts too. b. Label the token figures (442, 45,000, "98.4% Saved", "0 tokens on ~85% of turns") as "estimate". c. Add the note "Garrick Ask: not yet in the player view." in the workbench.

If anything here conflicts with the code, stop and tell me rather than guessing.
