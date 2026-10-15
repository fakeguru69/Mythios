# Play-through check, 15 Oct 2026

Fake Guru asked for a full season played through. A browser script played the whole season in one game, in order:
- all 36 weekdays: the story, the Challenge, [PRESS ON], the fight, one Fan Out lead, and the fire;
- all 6 Gatherings, played to their summary card;
- gear bought in the Store whenever it could be afforded.

The script saved every screen's text and a screenshot, and logged page errors and gold. Then it scanned every screen and checked every number line. The script is at `scratchpad/tools/season.cjs`; it is a test tool, not in the repo.

Party of four (the sample party). One player's view, on one phone.

## What was right

- **Flow:** all 36 days and all 6 Gatherings completed, with no page errors and nothing stuck.
- **Numbers:** 273 roll and fight lines checked. Tier bonuses, DCs (weekday, [PRESS ON] +4, Gathering +2), enemy DEF and ATK (the 15 Oct table), damage (margin × 5) and every sum are correct.
- **Gold:** the "You earned" lines match the rules, and gold never went below 0. The gear curve worked: Level 5 Weapon by Week 3, and 9,165g left at the end.
- **Text:** no leftover placeholders, no writer's notes, none of the old terms (Check, Episode, Obstacle, Connect), no weekday names, no Garrick banned word. The only "perhaps" is Meira's, and it is canon. The one "Malakor" is Garrick's canon line at Gathering 4, after its gate.

## What was wrong, now fixed

1. **The fire's board showed the wrong clue.** The day said "It goes on the board at the fire", but the board showed the Campfire file's fixed clue for the day, not what the player found. Now the board follows the approved Fan Out design:
   - one card per lead, with the names of whoever found it;
   - the player's card is their real find;
   - in the prototype, each sample friend takes one of the day's leads in turn;
   - a lead nobody took reads **"Nobody took this lead tonight: {place}."** The approved wording was "Nobody went to {place} tonight", which reads badly with places like "Corin, on the walk down";
   - Day 2 shows what you really found on Day 1.
2. **Builder labels at the fire, seen by players:** "Pinned via CHALLENGE branch", "Head to Campfire branch", "Wry Night", "Extra Cup", "Garrick 5/8 msgs · room 5/12", "Pin-before-peek active", "No right/wrong marks · No gold", "Before 5:00am", "(NO GARRICK ON W1·D1)". All are gone. "Extra Cup" went because canon says the cup is "an action only, with no line and no explanation". The message counter moved into the test panel.
3. **The ticker bar** used builder words ("lock-word", "theory pins", "Complete FIT THE PAGE to form your team & unlock Party Chat"). It now reads plainly, for example "The party's chat opens when today is done."
4. **The party chat** posted "[Landmark Sealed · …]: Completed …" and "Solved Lock 1 on Fragment 1-2". Both are now plain sentences.
5. **The Record started with made-up numbers.** A new game showed 13 days played, a 6-day streak, 5 fragments, 2 Gatherings and 4 earned badges: the mid-season demo's sample values. A new game, and Start Fresh, now begin at zero.
6. **Six Record counts never changed:** Gatherings Joined, Stepped Up, Battles Won, Challenges Cleared, Pressed On and Enemies Felled. All six now count. Days Played and Best Streak are worked out from the days finished. Fragments Solved counts once per fragment, not once per word.
7. **Badges did not follow their own descriptions.** For example, "Down to a Thread" (win a fight with 10 HP or less left) unlocked after 5 enemies, and "A Clean Night" after 3 Battles. Each badge now follows its description. The made-up detail lines ("Earned when you gave Mei a Charm Relic", "Closest fight won so far: 28 HP left") are removed. "Lifeline" needs a friend's roll to follow, so it waits for multiplayer.
8. **The "party lead" crowns** compared you with invented friend numbers ("Party Lead: Mei (2)"). They are switched off until real friends' numbers exist (multiplayer).
9. **Garrick's AI memory** was given three questions nobody had asked and a fragment count of 5. Both are removed.
10. The fight panel's "Diff × 5 Damage" now reads canon's **"Damage = Margin × 5"**.

## Not a bug

- **The day picker in the header** (with Start Fresh and the mid-season demo) clears Days 1 and 2 when you jump to Week 1, so the opening can be replayed. It is a demo tool. The test hit it; real play does not.

## Left for later

- **Lifeline** and the party-lead crowns need real friends, so they come with multiplayer.
- The sample friends' finds on the board are a stand-in until friends really play.

## Second run, 15 Oct (evening)

The whole season was played again in one game.
- **No page errors.** All six Gatherings were played to the end.
- **300 roll and fight lines were checked**, with no problems.
- **The text scan was clean.** The only hits were canon story text and the demo's test panel.

**Found and fixed:** after the first Gathering, picking a weekday and opening the Party tab showed that week's Gathering instead of the day's fire. So the first run never really reached the fires of Weeks 2 to 6. Picking a weekday now opens its fire. The workbench's "jump to Gathering" had the opposite fault, and is fixed too.

**Re-run after the fix:** all 35 weekday fires open on the Campfire. Their text passes the first-use word gates; the only hits are canon story text: Day 1's list of four names, fragment 1-1, and Week 2 Day 5's "You have five".
