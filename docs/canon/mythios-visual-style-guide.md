# Mythios — Visual Style Guide
*Extracted and consolidated from `mythios-design-bible.md` (Mythios 2 session). Source material for the visual system originated in an earlier conversation ("Mythios 1"), was carried forward and iterated across sessions, and is consolidated here into one scannable reference for the first time — replacing the need to search through prose decision-logs to find the current, final value of any given color or rule.*

**Status (TVMen, 2026-09-28): a loose base reference, not a locked spec.** It's an old base — use it as the starting point to build the visual system on, and change it freely as the game's screens are designed. Where it conflicts with the current Core Rules, the Core Rules win.

**⚠️ Known stale as of 2026-09-28:** this file predates the Core Rules rebuild. It still references Signature Power (cut entirely — see `mythios-core-rules.md` §5) and has no display treatment for the 7 Relic types (this file assumes 1 universal relic). Needs a pass before being treated as current for Bag/Store/Card visual work.

## Color Palette (exact hex, final values only — superseded iterations omitted)

| Token | Hex | Use |
|---|---|---|
| Page background (base) | `#0D0714` | Deepest background layer |
| Card background | `#2E1B42` | Radial gradient endpoint for card interiors |
| Header / Gear background | `#150D22` | Masthead header, Gear card backgrounds |
| Near-black | `#1A0F28` | Rank ring inner circle |
| Gold standard (exact) | `#D4B876` | THE one gold — active tab, ticker, item names, all numbers, ranks |
| Cream / body text | `#F4F1F8` | Chat body text — stays bright, never muted |
| Muted lavender (inactive) | `#B7A9CC` | Inactive tab labels/icons |
| GM speaker (final) | `#B0A0D8` | GM label only — distinct from gold, distinct from Chidi |
| Muted purple (Signature Power) | `#A392C0` | Locked Signature Power card text |
| Muted gold (borders) | `#8A6B3A` | Gear card border, Signature Power border, level-card borders |
| Locked/dim purple | `#6B5D8E` | Signature Power border accent, atk/def stat text |
| Outer card border | `#6B5D4A` | The card's own outer boundary |
| Muted gray-purple | `#8B7A9E` | Secondary/tertiary label text |

**Superseded values, kept here only so they are never reused by mistake**: ticker gold was `#B8935A`/`#C9AD7A` before being corrected to the exact standard `#D4B876`. GM speaker was bumped through `#8B7A9E` → `#A392C0` → `#E4DCF2` before being reverted to the final `#B0A0D8` — the "match Chidi's brightness" experiment was explicitly rejected.

## Typography

| Element | Font | Weight | Notes |
|---|---|---|---|
| Names, labels, tab text, ALL numbers | Cinzel | 700 (bold) | Applied card-wide for full consistency — HP, Gold, Attributes, Gear stats, Levels, Stats grid, MVP |
| Ticker text | Cormorant Garamond, italic | 600 | Hex alone wasn't enough presence — needed the weight bump too |
| Speaker labels (GM, Chidi) | Cinzel | 700 | Bumped 11px→12px in addition to bold |
| Chat body text | System default | Regular | Deliberately NOT Cinzel, NOT muted — the actual story content, stays the most prominent element on screen |

## Tab Bar Rules

- All four tabs (Chat/Record/Bag/Store) share the **same bold weight (700)** — weight is never a state indicator.
- **Color is the sole active/inactive differentiator**: active = gold `#D4B876` + underline, inactive = `#B7A9CC`.
- Tab bar sits **outside/above** the card as independent navigation chrome — never wrapped inside the card's own border.
- Collapsible: collapses to a thin handle by default, expands on tap.

## Card Structure

- **Header masthead**: spans the card's full inner width edge-to-edge (not an inset box), background matches Gear's `#150D22`, no divider line separating it from content below.
- **Outer border**: `1.5px solid #6B5D4A`, with genuine inset margin (~12px) so the card reads as a distinct object sitting on the page, not a full-bleed panel.
- **Gear / Signature Power cards**: background `#150D22`, border `1px solid #8A6B3A`.
- **MVP Moments banner**: matches regular stat chips' background exactly (no special tint) — its size and end-of-list position carry its "special" feeling, not a unique color treatment.

## Ticker

- Persistent banner between tab row and Chat Mode.
- Priority: Open-window (urgent) → Achievement/praise → FYI reminders.
- Slow auto-advance (~15s) + instant tap-to-advance — deliberately not fast-cycling.
- Fixed height via **one single height constraint only** (outer container, `overflow:hidden`) — the earlier bug was two competing height constraints (outer + inner) disagreeing on a specific device.
- Truncation: native CSS `-webkit-line-clamp:2`, no JS character-counting. A ~60–70 character guideline is a *content-authoring* discipline for whoever writes ticker copy, not an enforced code limit.

## Open / Not Yet Locked

- Real Cinzel font as a production asset (mockups used a live Google Fonts link).
- A fully locked stylesheet file (this document is the first attempt at that; values above are correct but the actual CSS/token file for implementation doesn't exist yet).
- Bag and Store screens have not received this same visual treatment at all.
- "Personal Records" stats card section (Kills, Assists Given, Relics Found, Gathering Streak, Signature Power Uses, Gold Earned) is named/decided but not yet built into the visual mockup *(Superseded 4 Oct 2026: the Card's counts are the twelve in Core Rules §9, Deeds and Glory.)* — note this list is also stale against the current 11-stat/MVP system and 7-Relic economy.

## Combat chat text (added 2026-10-03, confirmed by TVMen)

- In fight messages, **words and numbers are different colours**: numbers use the gold standard `#D4B876` (the existing "all numbers" rule); words use the normal chat body colour.
- Fight lines are capitalised as in Core Rules §4 ("Fight chat format"): `You Roll 14 + Weapon 14 − DEF 23 = 5. HIT`.
- HP stays out of 100 (briefly 50 on 2026-10-03, reverted). The pre-fight enemy card shows no HP lines.

---

## Screen design, second pass (3 Oct 2026)

Seven screens are drawn in the "Mythios screens" design canvas: Chat (a Challenge), Chat (a fight), Party (the Gathering Battle), Card, Bag, Seeker Chest, Store. They replace the first flat drafts.

**What "looks good" means here**
1. **Every kind of message has its own shape,** so a player can tell what they are looking at before reading a word.
   - MYTHIOS narration: no bubble. A gold rule down the left, a small moon mark, a drop capital on the first line of a beat.
   - The player's own words: a gold-tinted bubble on the right.
   - A friend's words: a purple bubble on the left with their coloured initial.
   - A Challenge, a fight or the Battle board: a framed card with a header band, an icon and a round medallion (DC or round).
   - A fight's rounds: a numbered timeline, one line per blow, a small HIT or MISS tag, the arithmetic kept in full.
   - A result: a gold-framed banner (VICTORY). A help-call: a red-framed card.
2. **One hero on each screen.** The number you need (6+, 8+) is the largest thing on a Challenge card. The gold button is the one thing to tap.
3. **Things look like things.** Gear, Relics and scrolls are tiles with an icon in a lit well, a count badge, and a dashed empty slot for what is not yet held or found.
4. **Colour carries meaning.** Gold is for numbers, rewards and the main action. Green is your HP and a pass. Red is an enemy, damage and a fail. Each Attribute has its own colour, used on its bar, its icon and its Relic: Might red, Agility green, Intellect blue, Charm rose, Craft amber, Aim teal.
5. **Depth, not flat fills.** Gradients on panels and buttons, a soft glow on what matters, a raised gold button.

**Decisions taken in this pass**
- Tabs stay at the top, each with an icon and a label, on the purple gradient bar. A title strip above them carries the game's name and your gold.
- The ticker is one centred line.
- MINE and PARTY are one gold switch with a red dot for news.
- The Record is a collectible card: gold frame, name and class, HP and Gold badges, a picture window with the class emblem and the party's name, six Attribute bars in their colours with a star on the class pair, two gear tiles, (no vitals row, revamp 5 Oct 2026) and a Badges section of twelve (earned lit, unearned greyed), then the twelve numbers (four across, three rows: Show Up, Together, Glory). Unearned badges are greyed out with their name. The tab is called Record.
- The Bag opens on ALL: today's fragment across the top, then Relics and the Scroll Box as tiles. (Keepsakes were dropped: Core Rules §1, 5 Oct 2026.) The Seeker Chest shows the fragment on parchment with letter tiles.
- The Store shows each gear upgrade as a card with the old number, the new number in green, and the price on the gold button. Relics are tiles in their Attribute colour.

**Still open:** the Record page is decided (5 Oct 2026: twelve numbers, twelve badges, see the stats file) but not yet drawn; the class emblems (only the Trickster's mask is drawn).

### Chat bubbles: under discussion (4 Oct 2026)
- **Decided:** Garrick has his own speech bubble (amber, his own initial and name), separate from MYTHIOS narration. His words do not change.
- **Being tried, not yet decided:** MYTHIOS narration in a wide lavender bubble; cards and result lines keep their own shapes; a button tap echoes as a small gold chip on the player's side; one bubble per fight round. A sample strip of all nine message kinds is on the design canvas ("Chat sample").
- **To bring back from Mythios 1:** tap-to-explain. Tapping an Attribute or an item opens a small inline panel (Lore and Effect, plus what the next tier or level gives) and closes on a second tap.

### Chat bubbles: second sample (4 Oct 2026, TV's three corrections)
- **No drop capital** on MYTHIOS narration. It did not work in a bubble.
- **VICTORY sits in a MYTHIOS bubble** like the fight rounds, with a gold border, instead of a separate banner. One less shape.
- **Garrick is drawn exactly like a friend:** the same bubble, an initial, his name, his own colour (amber). He should read as one of the party.
- **A found document** (a lore reveal) is a MYTHIOS bubble with the document's name across the top, the text in the italic serif, any line in the older hand set apart in gold, and [READ ON] at the bottom right. A small centred pill records who tapped it.
- A sample strip is on the design canvas ("Chat sample 2"). Awaiting TV's approval before the seven screens are redrawn to match.


### Decided 4 Oct 2026
- **Tap-to-explain is in.** Tapping a stat, an Attribute, a weapon or armour, a Relic or a badge opens a small panel directly under it, and a second tap closes it. No popup.
- **Notable moments** are announced on the ticker and as a party-chat pill, never by phone notification (Core Rules §8).
- **Still open:** flat or raised styling; the font rule (which text is serif); whether cards become MYTHIOS bubbles with a header strip; the stats and badge list.

### Flat chat system, test sheet (4 Oct 2026)
- **Decided by TV:** no raised gold. The look is flat: no bevels, no drop shadows, no glow on buttons. No "Mei tapped READ ON" pill (noise).
- **Buttons, flat:** a live main button is a solid gold fill with dark text. A lesser button is an outline. A tapped button turns to a gold outline with a tick; the options not chosen grey out.
- **Being tested (sheet "Flat chat system" on the design canvas, three columns: my thread, party chat on weekdays, the Gathering):** two shapes only. A bubble for everything anyone says; when MYTHIOS needs an answer (Challenge, enemy, Choice, poll, lobby, help-call, United Effort) the same bubble gains a title strip and buttons. A pill for one-line news; a notable moment is a gold pill. Rolls, rounds, VICTORY and DEFEATED are a darker, plainer MYTHIOS bubble with a coloured border. The Battle status is one bubble that updates in place.
- **Font rule being tested:** Cinzel for names, labels and numbers; sans for anything said; italic serif only for words written on a page in the world (found documents, fragments quoted).

### Flat chat system v2: the rules (4 Oct 2026)
TV: "Looks good in general." Asked for subtler buttons, the same text size for documents as for speech, and a consistency sweep. Sheet "Flat chat system v2" on the design canvas, with a fourth column, the key.

**Who has which bubble**
| Speaker | Bubble |
|---|---|
| MYTHIOS | Lavender border (#7E68B8), fill #1E1232, full width. Story, cards and found documents. |
| MYTHIOS, the record | Fill #130B1F, quiet border (#3A2555). Challenge rolls, fight rounds, results. Border gold for VICTORY, red for DEFEATED. |
| Friends and Garrick | Fill #2A1840, border #4A3068, left, as wide as the words. The name carries the person's colour. |
| You | Fill #3A2E1C, border #8A6B3A, right. |
| News | A centred pill. Gold for a notable moment. |
Every avatar sits at the top of its bubble, and every bubble has the same corner shape (small corner beside the avatar).

**Cards** (a MYTHIOS bubble with a title strip). One layout for all: strip = icon, kind, title, and the key number on the right (DC; DEF and ATK; HP). Body = your numbers, what you need, reward and cost, buttons. A Challenge and an enemy are laid out identically. Strip colour: gold for something to decide or roll (Challenge, Choice, poll, lobby, United Effort, found document); red for danger (an enemy, the Battle, a help-call). An Attribute's colour is used only on the Attribute's name.

**Type: five sizes, three faces**
| Use | Face and size |
|---|---|
| Anything said (story, speech) | Sans 15 |
| Anything written on a page in the world (found documents, fragments quoted) | Italic serif 16.5, which matches sans 15 by eye |
| Facts inside a card or record | Sans 13 |
| Formulas, roll arithmetic, hints, pills | Sans 12 |
| A card's title | Cinzel 14 |
| Names and labels | Cinzel 10, capitals |
| Game numbers | Cinzel, gold. The number that matters (6+, DC) is 16. |

**Buttons: one style, four states.** Live and main: gold outline, soft gold fill (20%), gold text. Live and lesser: quiet outline, lavender text. Tapped: gold outline with a tick, no fill. Not chosen or closed: greyed. No solid gold, no bevel, no shadow.

**Colour, one meaning each.** Gold: game numbers and the main action. Green: you, a pass, a gain. Red: the enemy, a fail, a loss.

### Pages and objects (decided 4 Oct 2026)
- **Corrected:** [STEP UP] is a live gold button like every other action. It greys out for everyone once a friend has stepped up.
- **The rule: paper looks like paper, objects look like objects.**
  - **A page** is anything written in the world: the Order's scripture, Meira's notes, the ledger, the list, a Seeker fragment. Every page uses one style, in the chat and in the Bag alike: the title strip names it, and its words are in the italic serif. The three kinds are told apart by the strip's label and icon (FOUND DOCUMENT with a moon for the Order, a satchel for Meira; SEEKER FRAGMENT with a map), not by a different design.
  - A locked fragment in the Seeker Chest is the same page with gold blanks and letter buttons under it. This replaces the light parchment card drawn in the first Seeker Chest screen.
  - **An object** is a Relic or a piece of gear. Objects are tiles with an icon.


### Approved 4 Oct 2026
TV approved the flat chat system v2, the page rule and the stats ("1, 2, 3 go"). The seven screens are redrawn in this system.
- **The seven screens as redrawn:** chat (a Challenge), chat (a fight), party (the Gathering Battle), Card, Bag, Seeker Chest, Store. All use the bubbles, type scale, buttons and colours above.
- **The Card:** gold outline; name, class, HP and gold; a picture window with the class emblem and the party's name; six Attribute bars in their own colours, a star on the class pair; two gear tiles with level pips; DEEDS and GLORY, six counts each, with a small crown and a gold border on any count where you lead the party; a row of badges, lit or in outline.
- **The Bag:** today's fragment as a page across the top; Relics as tiles; the Scroll Box as a list of pages. Tapping a Relic opens its explanation under the row, with [GIVE TO A FRIEND].
- **The Store:** gear as two cards showing the level pips, the old number and the new number in green, and the price on the button; Relics as tiles in their Attribute colour with the price on the button.
- **Small decision taken while drawing (TV to confirm):** once a button on a card has been tapped, the card folds down to its title strip, its key lines and the ticked button, so a finished card takes less room in the chat.


### Decided 4 Oct 2026 (later the same day)
- **"Check" is now "Challenge"** in every live document and on every screen (Daily Challenge, Bonus Challenge, Approach Challenge, the CHALLENGE card, "TV passed today's Challenge.", Challenges Passed). "Difficulty Class" and "DC" are unchanged. Old review and audit records keep the old word.
- **The ticker sits under the MINE and PARTY switch,** as one rounded line with the friend's initial at the left and a small arrow at the right. Its rule is in Core Rules §8.
- **Type scale raised to phone-standard sizes.** The first scale was about one step smaller than iOS (body 17) and Android (body 16). The scale is now:
| Use | Face and size |
|---|---|
| Anything said | Sans 16 |
| Anything written on a page in the world | Italic serif 17, weight 500 (lighter than before, so it no longer looks larger than speech) |
| Facts inside a card or record | Sans 14 |
| Formulas, roll arithmetic, hints, pills | Sans 13 |
| A card's title | Cinzel 15 |
| Names and labels | Cinzel 11 |
| The number that matters | Cinzel 17 |
| Button text | Cinzel 12.5; buttons are 44 high |
This table replaces the sizes in "Flat chat system v2".
- **A roll's result** (HIT, MISS, SUCCESS, FAIL) is now a coloured word at the end of its line, as the rules write it, with no box round it.
- **Chat screens are anchored to the bottom,** like any chat: the newest message sits just above the input bar and older ones scroll off the top.

### Third pass (4 Oct 2026, TV's review of the redrawn screens)
**Changed**
- **Entry pages.** Two new screens: the Library (game titles) and the Seasons page (seasons, and your parties in each). Inside a game the title at the top left, with a back arrow, returns to the Seasons page (Core Rules §12a, "Getting in and out").
- **Ticker:** full width, no border, a slightly lighter band under the switch.
- **Challenge card:** shows only the bonus a roll gets ("Charm +2 (Apprentice)", "Roll + 2 − DC 7"). The Attribute's own number (38) is shown only on the Card. The result line reads "You Roll 15 + 2 (Charm) − DC 7 = 10. SUCCESS".
- **Buttons:** a tapped button keeps its soft gold fill and gains a tick; the options not chosen grey out. (Before, a tapped button lost its fill, which made FIGHT look different from ROLL CHARM for no clear reason.)
- **Damage line:** no indent and no ">" in front.
- **Combat Relic:** always states its effect in numbers ("+1 Weapon and +1 Armor for one fight"). It has its own colour, violet #B79CFF, on its icon and its name, as each Attribute Relic has.
- **Store:** the two gear cards are the same height with the price button on the same line; every Relic tile has the same rows, with a gold "×2" badge for how many you hold (the same badge as in the Bag).
- **The Card scrolls.** Its top is one block: the class emblem in a ring, the name, the class, the party and season, then HP and gold. No separate picture window.
- **Tap-to-explain** is drawn open on the Card (an Attribute; a count with a crown) and in the Bag (a Relic). It is used on Attributes, gear, Relics, the twelve counts, crowns and badges. It is not used inside chat cards, which already state their own arithmetic.

**Rules for vertical space** (to keep in mind; not all solved)
- **A card folds once it is answered:** it keeps its title strip, its key lines and the ticked button.
- **Fight rounds fold as the fight goes on.** Only the latest two rounds stay open; earlier rounds become one line each in a single bubble ("Round 3 · You HIT 18 · Enemy HIT 8"), which opens on a tap. An eight-round fight is then about one screen, not three.
- **News pills.** Proposed, not yet decided: the day's results become one roll-call pill that updates in place ("Today · ✓ TV · ✓ Mei · ✗ Arjun · Dev has read"), instead of one pill for each friend. Fragment news likewise updates one pill.
- **A found document** is one message for each paragraph, so a long one runs to several screens while it is being read. That is accepted: it is read at the party's own pace. Once the reveal is over, the paragraphs fold into one strip that opens the page in the Scroll Box.
- **The Battle status** is one bubble that updates in place.

**Crowns and announcements**
- A crown shows who in the party leads a count. Taking a crown is not announced when it happens, because crowns on counts such as Words Solved would change hands too often. Proposed: after each Gathering, one gold pill lists that week's crown holders.
- A notable moment is always a gold pill in the party chat; the ticker shows it to friends who are in their own thread. The ticker never has anything the party chat does not.


### Fourth pass: design audit (4 Oct 2026)
TV asked for a designer's audit of every element and its visual hierarchy. What the audit found and changed. **This section overrides earlier ones where they differ.**

**1. Two levels of navigation looked the same.** The four tabs and the MINE/PARTY switch were both gold-outlined boxes. Now the tabs are plain icons with a gold underline on the active one; MINE/PARTY is a rounded switch; the Bag's sub-tabs are the same rounded switch. Tabs choose a place; switches choose a view inside it.

**2. Everything had a border, so nothing stood out.** Three surface levels now:
- the page;
- bubbles and cards (filled, with a border only where it carries meaning: lavender for MYTHIOS, gold for VICTORY, red for DEFEATED);
- things inside a card (tiles, counts, chips): a lighter fill (#2A1B40) and no border. A border on an inner thing now means something: gold = a crown; lavender = tapped open; dashed = empty or locked.

**3. Gold was doing too many jobs.** Gold is now only: game numbers, the hero name, crowns, and the one main action of a card. Titles are cream. Labels are lavender. Buttons:
| Style | Use |
|---|---|
| Soft gold fill, gold outline | The one main action in a card (ROLL, FIGHT, GIVE, CONTINUE, SOLVE). Once tapped it gains a tick. |
| Gold outline, no fill | One of many equal actions on a page (each price in the Store, each letter in a fragment). |
| Lavender outline | A lesser action (USE, NOT NOW as a text link, GIVE TO A FRIEND, START A PARTY). |
| Greyed | Not chosen, or closed. |

**4. Attribute colours clashed with pass and fail.** Might was the same red as an enemy; Agility the same green as success. Green and red are now kept for pass/gain and fail/enemy only. Attributes: Might orange #FF8F5A, Agility lime #B7E05A, Intellect blue #7AA7FF, Charm rose #EE8BC3, Craft violet #C9A3FF, Aim cyan #4FD1D9. The Combat Relic is steel #D6DCEB.

**5. The Challenge card made you match a line to a button.** Each choice is now one row: its name and bonus, what you need, the arithmetic underneath, and its own [ROLL] button at the right. The Relic is a third row with [USE]. Reward and cost sit at the foot with NOT NOW as a text link. The enemy card uses the same rows (you; the enemy) with [FIGHT].

**6. The MYTHIOS avatar repeated on every message.** As in any chat, the avatar and name now show only on the first of a run of messages from the same speaker.

**7. The chat ran straight into the ticker.** Messages now fade out under the ticker, so a cut-off bubble reads as "scrolls up".

**[SUPERSEDED 5 Oct 2026: the Record has no vitals row; see the last sections of this file.]** **8. The Card's top.** A banner (emblem, name, class, party and season), then one row of four vitals under it: HP, Gold, Crowns, Badges. There is no XP and no rank in this game; growth is the Attributes and gear below. Crowns and Badges are the at-a-glance brag.

**9. Tap-to-explain is one neutral panel everywhere** (dark fill, lavender outline, a small pointer to the thing tapped, a chevron to close). Only the item's name inside keeps its colour. The thing tapped gets a lavender outline while open; a second tap closes it and removes the outline.

**10. Counts of what you hold.** In the Bag (your things) the count is a small "×2" in the tile's corner. In the Store (things for sale) it is a line of text, "You hold 2", so it never sits on a price button.

**11. The ticker** is a full-width band with hairlines above and below; no box.

### After the audit: TV's review (4 Oct 2026)
- **Avatars:** the initial is centred in its circle at every size.
- **Page text is white** (found documents and fragments), for clarity. It stays in the italic serif.
- **The Library card** is no longer bare: the title in gold over the moon, the season, a six-step episode bar, the party with its friends' initials, and "Your chapter is ready."
**[SUPERSEDED 5 Oct 2026: the Record has no vitals row; see the last sections of this file.]** - **The Card's top** is a centred emblem card: season and party along the top edge, the class emblem in a gold ring over two faint rings, the name large in gold, the class between two fine rules, and the two class Attributes in their colours. Under it, four vitals as tiles: HP, Gold, Crowns, Badges. Tested with an eight-letter name ("Jennifer"); the limit is 12.
- **A tenth screen:** the party chat on a weekday, showing Garrick, friends, your own bubbles, news pills and a gold pill together.
- **Wording being tested, not yet swept through the rules:** the help-call button reads GIVE A COMBAT RELIC, because a Relic that is handed over is spent, not returned. The rules now say "give" throughout (swept 4 Oct 2026).
- **To discuss with TV:** a character name for each party, separate from the account name; the sign-up flow and what a new player chooses (class, name, and whether to adjust starting Attributes); another pass on the Card's counts and the badge list.
- **The Card's top, final form:** a short banner with the class emblem in a gold ring on the left and the words on the right: the name large in gold; the class in spaced capitals with a fine gold rule running off to the right; the two class Attributes in their colours; then the party and season in small capitals. Two faint rings sit behind the emblem. This replaces the tall centred version and gives back about 80 pixels of height.
- **The gold pill** (a notable moment) is faint: a muted gold outline (#8A6B3A), muted gold text (#BDA66E), no fill. It should be noticed, not shout.
- **Two names** (Core Rules §12a): the account name, and a character name for each party.

### The Record screen, drawn (5 Oct 2026)
**[SUPERSEDED 5 Oct 2026: the Record has no vitals row; see the last sections of this file.]** The Card screen on the "Mythios screens" canvas is replaced by **Record (scrolls)**, 390 x 1712. The top (banner, four vitals, Attributes, gear) is unchanged from the approved Card. Below it: three headed rows of four numbers (SHOW UP, TOGETHER, GLORY), each a borderless tile with the number in Cinzel 19 and a two-line label in sans 12; a gold border and small crown where you lead. Then BADGES, "4 of 12", three rows of four: an earned badge is a filled tile with a gold icon in a gold-tinted well and its name in cream; an unearned badge is a dashed outline with a dim icon and its name in grey. Tap-to-explain is drawn open on a crowned number and on an unearned badge ("Not yet earned", what earns it, progress so far). Badge icons are first drafts. A first printout made outside the canvas ignored this guide and is withdrawn.

### 5 Oct 2026, later
- The Record's twelve numbers sit under one heading, RECORD (with a small crown and "where you lead the party" at the right), three rows of four, no row headings. Board height 1650.
- New board "Storyboard: a Match": the MATCH card is a MYTHIOS card (map icon, MATCH, "Which of your fragments is this?", seconds left at the right), the scripture line as a quote with a gold rule, six fragment rows as inner tiles (DAY n · PLACE in Cinzel 11, first words in the page serif), a row opens in place with the whole fragment and one main button PICK THIS ONE, the picked row gets a gold border and YOUR PICK, the rest grey; at the reveal friends' initials sit on the rows they picked; the result is a record bubble with a gold border.
- Every screen's second tab reads RECORD; day dividers and labels read WEEK n · DAY n.

- (5 Oct, 12:38) Match reveal: only the right row lights up, with the initials of those who matched it; wrong picks are never shown. KEEPSAKES sub-tab and section removed from the Bag and Seeker Chest screens.

## Badges and colour on the Record page (5 Oct 2026, designer decision, TV: "wear your game designer hat")

**Shape says what a thing is.** The twelve numbers are rounded squares; a badge is a round medal. A medal can never be mistaken for a number.

**Colour says what it means, and gold means one thing: you have it.** The six Attribute colours (Might, Agility, Intellect, Charm, Craft, Aim) belong to the Attributes and are not used on badges. A rainbow of badges would read as more Attributes. Gold is the Crown colour, the Gold colour and the earned colour, so on this page it always means "yours".

- **Earned:** a round medal, 36 px, gold ring (1.5 px, #D4B876), a soft gold fill (#D4B87633) and the icon in a lighter gold (#E6CC8C), on the normal tile, the name in white. The tile gets no ring: the gold ring on a stat tile already means "you lead the party" and the two must not be confused.
- **Not yet earned:** the tile keeps its dashed border (an empty slot); the medal is a plain dark disc with no ring, icon #8F80B2 and name #9C8DB5. Both pass the contrast checks (the name 5.8:1, the icon 4.4:1 on the darkest tile). It is dimmer than the earned state, never hidden: a player must be able to read what they could win.
- **Selected (tapped for the explain panel):** the tile's border goes solid light lavender (#B7A9CC), as the stat tiles do.
- **Icons:** one line style (1.8 px stroke, round caps). "Many Hands" was four circles and read as an app grid; it is now two linked chain links (joined effort). The other eleven are unchanged.

**The Record page with the explain panels closed** is about 1,290 px tall at phone width, so it needs no shortening. The drawing on the canvas shows the panels open to document tap-to-explain.


**Record revamp (5 Oct 2026, TV asked for an experienced-designer audit).** The four-vitals row is gone (HP is always 100; Gold is in the header; the badge count is in the Badges heading). The banner reads "The Lantern Company · Week 3 of 6". The RECORD heading carries the crown count. Gear tiles read "Lv. 2 · Weapon 15" (Core Rules line 209). Badges are three across, four rows, so they look different from the four-across numbers; order: First Light, A Whole Week, The Long Road / Sharpened, Open Hand, Lifeline / The Whole Table, Many Hands, A Clean Night / Perfect, Never Enough, Down to a Thread. Closed height about 1,311, open about 1,677 (board 1,680). The tab and the section are both named Record; left as is.

**Record revamp, second pass (5 Oct 2026, TV):** the aim is four sections that look different at a glance. Attributes = coloured bars; Gear = two wide tiles; RECORD = a ledger (one panel, twelve rows, name left in lavender, number right in Cinzel, gold crown beside the number where you lead, hairline dividers, the tapped row lit with its explainer opening underneath, arrow at the right); Badges = round medals, four across, three rows (back from 3x4; the first Badges order is restored). Closed about 1,436 tall, open about 1,794 (board 1,800). This replaces the "badges three across" line above.

**Record revamp, third pass (5 Oct 2026, TV: the ledger list was distinct but not pretty and too tall).** RECORD is now one inset plate (#130B1F, 1px #3A2555 border, radius 12) holding all twelve numbers four across in three rows, divided by hairlines (#2E1F45) instead of separate tiles. Number Cinzel 22, name sans 11 lavender; where you lead, the number is gold with a small crown. The tapped cell lights (#2A1B40, lavender underline) and its explainer opens inside the plate under that row. Rule of thumb for the page: Attributes are bars, Gear is raised tiles, Record is one engraved plate, Badges are medals. Three by four was considered and rejected: wider cells look more like the gear tiles and add a row. Closed about 1,193 tall, open about 1,570 (board 1,580). This replaces the ledger described above.

**Record revamp, fourth pass (5 Oct 2026, TV: numbers too big, plate too dark and looked indented).** The RECORD slab now uses the tile colour #2A1B40 (same material as the gear tiles), radius 12, no outer border. Dividers are short lines (#44305F) that stop before the edges: vertical ones inset 13px top and bottom, horizontal ones inset 12px each side. Number Cinzel 17 (same as Attribute values), name sans 12 lavender. Lead: gold number with an 11px crown. Tapped cell: #382653 with a lavender underline; its explainer (#130B1F, as everywhere) opens inside the slab under that row. Closed about 1,185 tall, open about 1,562 (board 1,580). This replaces the dark plate above.
