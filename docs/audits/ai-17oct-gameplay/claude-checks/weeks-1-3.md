# Claude's independent gameplay check: weekdays of Weeks 1 to 3 (17 Oct)

This check read only the game's data and code.

## Facts
- **Which Attribute you pick never changes the text.** Scripts only branch on pass or fail, [PRESS ON], a fight won or lost, and a claim (`chapterScripts.ts:8-12`). The pick only decides what grows.
- **No weekday result in Weeks 1 to 3 is read by any later day, recap or Gathering.** What does carry: gold (for gear), Attribute growth (the tier bonus), and the fragment words (all 12 solved give the map +2 on the Approach, `0032:417-421`).
- **Six failure cards promise "Someone at the fire may have seen it."** The demo keeps the promise (`StoryAndPartyTabs.tsx:1897-1913`); online, nothing hands the missed text over.
- **Most Notice second sentences are never seen.**
  - They show only from Adept, a score of 51.
  - Scores start at 10 to 14, and a daily player's class Attribute ends the whole season at about 46 to 60.
  - Several of those second sentences carry the real clue: "It is the cart from the Widow's Tooth", "A foot. Small, and bare.", "Something under that hill is still hot".
- **The fragment is a race.**
  - Each word goes to whoever solves it first, and a friend may solve only one a day (`0019:94-117`), so in a party of 3 or more somebody gets nothing.
  - The last-light letter arrives after the chapter, only if that word is still unsolved, and in an active party it is often gone.
- **[PRESS ON] is never a real decision.** A fail costs nothing, and none of its five extra details is mentioned again.
- **Fights are won 95 to 99% of the time**, so the choices that set who strikes first barely matter.
- **The game breaks its own rule** that every Choice "must change something" (Core Rules line 28).

## Totals
- 37 story-only buttons.
- 7 flavour choices.
- 4 menus that play every branch in any order.
- 6 real choices: 4 decide who strikes first, 2 change only text.
- 13 Challenges: on 6 a fail hides information, 1 sets the fight, 6 are cosmetic.
- 7 fights: only 2 have a line for a loss, and 6 of 7 enemies are silent, then flee.
- 5 [PRESS ON] details, none followed up.

## Day by day, the Play score out of 10
- W1D1: 6
- W1D2: 5
- W1D3: 6
- W1D4: 4 (three flavour choices in a row)
- W1D5: 7 (the woman speaks the fragment inside the scene)
- W1D6: 7
- W2D1: 5
- W2D2: 4 (a menu that only sets the order; the fail changes nothing)
- W2D3: 7 (the Challenge sets the fight)
- W2D4: 7 (a real gap in what you learn)
- W2D5: 5
- W2D6: 6
- W3D1: 4 (four story-only buttons; you always strike first)
- W3D2: 6
- W3D3: 5
- W3D4: 6 (the best chain of clues)
- W3D5: 7 (a pick the story signposts)
- W3D6: 6

## Fixes across the season
1. Make failure an information economy, online: a friend who passed brings the pass line to the fire board ("Mei saw: …").
2. Put Notice lines on the fire board, and show second sentences from Apprentice (a score of 26).
3. Give each flavour option one distinct detail, and signpost the picks that set who strikes first.
4. Give [PRESS ON] a cost, or read its detail back at the Gathering.
5. Fix the fragment race: one word per friend per day, or each friend's own puzzle feeding a shared map.
6. Cut story-only buttons that come back to back.
