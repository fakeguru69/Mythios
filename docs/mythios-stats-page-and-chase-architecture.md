# Mythios: The Record (Stats Page) & Chase Architecture
**Design Philosophy, Chase Stats, Badges, and Social Bragging-Rights Specification**  
*Compiled from Canon Audits, Core Rules §8 & §12a, Design Canvas Specs, and the 5 Oct 2026 Decisions by Fake Guru (TV)*

---

## 1. Executive Summary: What We Are Trying to Achieve

Traditional tabletop and RPG character sheets are **passive accounting ledgers**—static lists of numbers, inventory weights, and mechanical bonuses that players consult only when a rule demands it. 

In **Mythios: Tales of the Dark Moon**, the stats screen (**The Record**) was intentionally reimagined from the ground up to solve a fundamental challenge of asynchronous multiplayer storytelling:

> **The Primary Mission:**  
> Transform a static character sheet into an **active social engine** that provides **bragging rights**, drives **daily return habits**, fuels **friendly asynchronous peer rivalry**, and celebrates **cooperative team loyalty** across all six weeks.

The Record is not a log of what happened to you; it is a **living showcase of your character’s choices, courage, and standing within your company**.

---

## 2. The Core Objectives: Chase Stats & Bragging Rights

### Objective A: The "Chase" (Forward-Looking Motivation)
A stat that is merely a total is boring. A **Chase Stat** creates hunger:
1. **Clear Targets to Pursue:** Whether it is hitting Adept tier (26 points) in your primary attribute, maintaining a 6-day unbroken streak, or pushing for the *Lifeline* badge, players always have an immediate personal objective on their next turn.
2. **Dynamic Peer Crowns:** Any stat where a player leads their party displays a **gilded crown (`👑`)** and turns the number gold. If a teammate leads by one Relic or one Press On, the UI subtly highlights the gap:  
   *`"One more Relic given and the crown is yours."`*
3. **No Unreachable Ceilings:** Progression is paced so that even a player falling behind in attribute rolls can claim party dominance in teamwork (Relics Given, Fragments Solved) or daring grit (Challenges Pressed On).

### Objective B: "Bragging Rights" (Social Recognition)
Bragging in Mythios is **earned in the story, announced to the party, and never requires self-promotion**:
1. **The Game Brags for You:** Every notable deed produces an instant, server-validated pill in the **Party Chat** (e.g., `"Mei rolled a PERFECT ROLL."`, `"Dev gave Jo a Charm Relic."`).
2. **The Gathering Lobby ("The Week's Best"):** Before each Day 7 Gathering begins, the game reads aloud one premier achievement for **every single friend present**. Nobody is placed last; everyone gets a genuine spotlight in front of the group.
3. **End-of-Season Titles:** At the campaign’s finale, each friend is awarded an immutable, storied **Season Title** derived from their strongest pursuit (*The Unbroken*, *The Open Hand*, *The Sure Hand*, *The Bold*, *The Hunter*, *The Lucky One*).

---

## 3. The Three Unbreakable Design Tenets

Every number, badge, and rule on the Record page obeys three strict design laws:

### 1. Zero Negative Stats (No Shame, Numbers Only Go Up)
- **No stat ever records a miss, a wound, a failure, or an absence.**
- If you fail a Challenge or miss a Gathering, your numbers do not decrease, and no "Days Missed" counter exists.
- In-game recap cards show **good news only**. The game never weaponizes absence or bad dice against a player.

### 2. Every Stat Must Be an Intentional Choice
- Automatic occurrences (e.g., merely logging in, automatic turn passes) do not qualify as prestige stats.
- A stat must reflect an **active agency decision**: choosing to attempt the harder `[PRESS ON]` road, choosing to give away an expensive Relic, choosing to take the `[STEP UP]` gamble on behalf of the team.

### 3. Every Stat Must Have a Real In-Game Voice
- If a stat increases, the game must state it aloud in chat at the exact moment of occurrence.
- The player does not have to screenshot a private menu to prove what they did—the party chat already bears witness.

---

## 4. The 12 Canonical Chase Stats (The Ruled Scoreboard Plate)

### Layout & Visual Form Factor
Unlike standard dashboard grids with floating cards or separate boxes, the 12 stats sit on **one single, joined, ruled scoreboard plate** (four columns across, three themed rows) rendered in deep royal purple (`#180F29`) with hairline borders (`#3A2555`) and antique gold text (`#E5C158`).

The heading explicitly celebrates leadership:
> **RECORD · 3 where you lead the party**

```
┌────────────────────────────────────────────────────────────────────────┐
│ RECORD · 3 WHERE YOU LEAD THE PARTY                                    │
├────────────────┬────────────────┬─────────────────┬────────────────────┤
│  DAYS PLAYED   │  BEST STREAK   │ GATHERINGS JOIN │  FRAGMENTS SOLVED  │
│      14        │     6 👑       │        2        │        6 👑        │
├────────────────┼────────────────┼─────────────────┼────────────────────┤
│  RELICS GIVEN  │   STEPPED UP   │ FRAGMENTS MATCH │    BATTLES WON     │
│       1        │      1 👑      │        2        │         2          │
├────────────────┼────────────────┼─────────────────┼────────────────────┤
│ CHAL. CLEARED  │   PRESSED ON   │ ENEMIES FELLED  │   PERFECT ROLLS    │
│       8        │       2        │        4        │        1 👑        │
└────────────────┴────────────────┴─────────────────┴────────────────────┘
```

---

### Row 1: SHOW UP (Commitment & Puzzle Craft)
Focuses on consistency, daily ritual, and intellectual contribution to the mystery.

| Stat | Technical Definition | Live Chat Announcement | Why It’s a Chase Stat |
|---|---|---|---|
| **Days Played** | Total days the player opened the chapter and read to its closing Pull over the entire season. | `"Mei has played today."` | The bedrock foundation of async engagement; proves reliability without penalizing missed days. |
| **Best Streak** | The longest consecutive run of days played. **Never decreases**, even if a day is skipped. | On Chapter Summary: `"Streak: 4 days. Best: 6."` | Classic habit loop; players chase beating their own personal historical best. |
| **Gatherings Attended** | Gatherings you joined (the Gathering is Day 7, and the host picks the start day). | Displayed in Gathering Lobby: `"Dev has entered."` | Prestige attendance metric for the shared weekly climax. |
| **Fragments Solved** | Number of Seeker Fragment lock-words unjumbled in the Seeker Chest or Campfire (+25g each). | `"Mei solved a word of today's fragment."` | Bragging rights for the party’s puzzle-solvers and codebreakers. |

---

### Row 2: TOGETHER (Cooperation & Selfless Support)
Focuses on camaraderie, resource generosity, and shared high-stakes risks.

| Stat | Technical Definition | Live Chat Announcement | Why It’s a Chase Stat |
|---|---|---|---|
| **Relics Given** | Relics given to friends from your Bag or during a fight. | `"Dev gave Jo a Charm Relic."` | High social currency; proves you invest your personal gold into your friends' survival. |
| **Times Stepped Up** | Times the player tapped `[STEP UP]` to volunteer and take the dangerous opening Gathering roll. | `"Mei stepped up."` | Courage metric; bragging rights for the party's frontline vanguard who shoulders collective risk. |
| **Fragments Matched** | Scripture lines matched at the Gathering's **Match** (60 seconds). | `"MATCH. Mei and Jo matched it."` | Lore mastery and deductive accuracy under a live 60-second timer. |
| **Battles Won** | Live Gathering Boss Battles won while fighting side-by-side with the company. | `"VICTORY. The Order is driven back."` | Collective military milestone celebrating flawless group coordination. |

---

### Row 3: GLORY (Heroic Deeds & Natural Luck)
Focuses on martial prowess, boldness under fire, and peak dice excitement.

| Stat | Technical Definition | Live Chat Announcement | Why It’s a Chase Stat |
|---|---|---|---|
| **Challenges Cleared** | Challenges passed on the primary roll. | `"Mei cleared today's Challenge."` | Direct measure of attribute competency and tactical relic timing. |
| **Challenges Pressed On** | Times the player boldly chose the optional, harder road (+4 DC, +200g), **cleared or not**. | `"Mei pressed on."` | The ultimate thrill-seeker stat; rewards bravery and risk appetite regardless of outcome. |
| **Enemies Defeated** | Foes personally fainted or brought down by the player's own strikes in combat. | `"VICTORY. The sentry falls."` | Combat pride for damage dealers and martial classes. |
| **Perfect Rolls** | Every natural 20 rolled on a Challenge, skirmish attack, or Gathering strike. | `"★ PERFECT ROLL."` | Unfiltered dopamine; universally cheered and recorded permanently on your record. |

---

### Why Other Stats Were Explicitly Dropped
During the design passes (3–5 Oct 2026), several traditional RPG metrics were evaluated and deliberately eliminated:
- **`Finds / Caches Discovered`**: Dropped when optional roadside clutter was retired to keep chapters focused.
- **`Gold Earned`**: Rejected because it was simply *"Days Played in disguise"*—a passive inflation number that discouraged spending gold on team gear and relics.
- **`Fastest Fight / Closest Call`**: Rejected because smaller numbers were confusingly "better" without intuitive units, creating UI friction.
- **`Rescues`**: Dropped because it was redundant with *Relics Given* (retained exclusively as the specific *Lifeline* badge condition).
- **`Joined In`**: Dropped as meaningless participation padding (trivial).

---

## 5. The 12 Badges: Visual Medals & Asynchronous Surprises

Badges are **milestone medals** awarded when something extraordinary occurs. They award **zero gold**, ensuring their value remains purely prestige-based.

### The "Aspirational Grey" Rule
- **The Badge grid is always a complete 4 × 3 layout (12 slots).**
- **Unearned badges are never hidden or locked behind black question marks.** They are displayed **greyed out with their full title visible**.
- Tapping any badge—earned or greyed out—opens an explainer modal displaying:
  1. What the badge represents.
  2. The exact trigger requirement.
  3. The player’s current real-time progress toward unlocking it (e.g., *"Charm is 38 (13 points from Adept)"* or *"Best week so far: 5 of 6 days"*).

```
┌────────────────────────────────────────────────────────────────────────┐
│ BADGES · 4 EARNED OF 12                                                │
├────────────────┬────────────────┬─────────────────┬────────────────────┤
│  FIRST LIGHT   │   WHOLE WEEK   │    LONG ROAD    │     SHARPENED      │
│     [🏅]       │      (🔒)      │       (🔒)      │        (🔒)        │
│   Earned W1D1  │  5/6 this week │  2/6 Gatherings │  13 pts to Adept   │
├────────────────┼────────────────┼─────────────────┼────────────────────┤
│   OPEN HAND    │    LIFELINE    │   WHOLE TABLE   │    CLEAN NIGHT     │
│     [🏅]       │      (🔒)      │       [🏅]      │        (🔒)        │
│   Gave to Mei  │ Awaiting roll  │   Earned W1D2   │    Party Target    │
├────────────────┼────────────────┼─────────────────┼────────────────────┤
│    PERFECT     │  NEVER ENOUGH  │   MANY HANDS    │   DOWN TO THREAD   │
│     [🏅]       │      (🔒)      │       (🔒)      │        (🔒)        │
│   Earned W2D2  │   1/3 cleared  │    3/4 Attrs    │   Closest: 28 HP   │
└────────────────┴────────────────┴─────────────────┴────────────────────┘
```

---

### The Badge Roster

#### Row 1: SHOW UP (Dedication & Mastery)
1. **First Light** *(Individual)*: Finish your very first chapter.  
   *Chat:* `"BADGE: First Light. Mei has begun."`
2. **A Whole Week** *(Individual)*: Play all six weekday chapters and attend Sunday's Gathering in a single week.  
   *Chat:* `"BADGE: A Whole Week. Mei missed nothing."`
3. **The Long Road** *(Individual)*: Attend all six Gatherings across the campaign.  
   *Chat:* `"BADGE: The Long Road. Mei has stood through every Gathering."`
4. **Sharpened** *(Individual)*: Advance any single Attribute to the **Adept** tier (26+ points).  
   *Chat:* `"BADGE: Sharpened. Mei's Craft is Adept."`

#### Row 2: TOGETHER (Party Brotherhood & Flawless Coordination)
5. **Open Hand** *(Individual)*: Gift a Relic to a friend for the first time.  
   *Chat:* `"BADGE: Open Hand. Dev gave Mei a stone."`
6. **Lifeline** *(Individual)*: A Relic you gifted to a teammate is used in a fight or check that directly saves them from failure.  
   *Chat:* `"BADGE: Lifeline. Dev's Relic carried Mei."`
7. **The Whole Table** *(🌟 Whole-Party Badge)*: Every single member of the party plays on the exact same day.  
   *Chat:* `"BADGE: The Whole Table. All of you, today."`
8. **A Clean Night** *(🌟 Whole-Party Badge)*: In one Gathering, the party clears the opening Approach, wins the Battle with zero companions downed, and completes the United Effort.  
   *Chat:* `"BADGE: A Clean Night. Flawless victory."`

#### Row 3: GLORY (Audacity & Clutch Moments)
9. **Perfect** *(Individual)*: Roll your first natural 20 on a Challenge or combat strike.  
   *Chat:* `"BADGE: Perfect. A natural twenty."`
10. **Never Enough** *(Individual)*: Clear `[PRESS ON]` twice within a single week (24 Oct: was three; no week has more than two).  
    *Chat:* `"BADGE: Never Enough. Dev cleared Press On twice this week."`
11. **Many Hands** *(Individual)*: Clear weekday Challenges using at least four different Attributes.  
    *Chat:* `"BADGE: Many Hands. Versatility proven across four disciplines."`
12. **Down to a Thread** *(Individual)*: Win an enemy fight with 10 HP or less remaining.  
    *Chat:* `"BADGE: Down to a Thread. Mei won with 4 HP."`

*(Note: Whole-Party badges belong equally to everyone. When unlocked, they ignite intense group celebration in party chat!)*

---

## 6. The Four Bragging Engines: How the Game Highlights You

Having stats is only half the battle; the interface must surface them dynamically at the exact psychological moments where peers see each other.

### 1. In-Play Nudges (The Subtle Chase)
Contextual single-line reminders embedded directly inside chapter decisions:
- On `[PRESS ON]` card: *"Mei and Dev pressed on today."*
- On `[STEP UP]` card: *"You have stepped up least. This one is yours if you want it."*
- When a teammate is hurting in combat: *"MEI IS IN TROUBLE · HP 35"* with `[GIVE COMBAT RELIC]`.
- On Chapter Summary: *"One more Relic given and the crown is yours."*

### 2. "The Party, Yesterday" Morning Card
Because Mythios is asynchronous, friends play at different hours. When a player logs in each morning, before their new chapter begins, they receive a single group brief:
> **THE PARTY, YESTERDAY**  
> • Mei rolled a PERFECT ROLL.  
> • Dev gave Jo a Charm Relic.  
> • TV pressed on at the Widow’s Tooth.  
> • BADGE EARNED: Open Hand (Dev).  
> • 3 of 4 played yesterday. One more makes a Whole Table.  
> *Your current streak: 4 days. Best: 5.*

**The Core Rule:** *Good news only.* It never lists who missed a day or failed a roll; it spotlights teammate heroism.

### 3. "The Week's Best" (Gathering Lobby Ceremony)
In the lobby before Beat 1 of the Day 7 Gathering, MYTHIOS delivers a live spoken/text tribute:
> *"This week: Mei pressed on four times. Dev gave two Relics. Jo solved five fragments. TV cleared every Challenge."*

- Every friend present is celebrated in front of the group.
- Nobody is ranked last; the algorithm selects each friend’s personal highest-performing metric for the week.

### 4. Season Titles (The Campaign Hall of Fame)
At the conclusion of Week 6, each adventurer is permanently crowned with their distinctive **Season Title**:

| Chase Specialization | End-of-Season Title |
|---|---|
| Most Days Played | **The Steady Feet** |
| Longest Unbroken Streak | **The Unbroken** |
| Most Gatherings Attended | **The Steadfast** |
| Most Fragments Solved | **The Reader** |
| Most Relics Gifted | **The Open Hand** |
| Most Times Stepped Up | **First Forward** |
| Most Fragments Matched | **The Keen Eye** |
| Most Battles Won | **The Wall** |
| Most Challenges Cleared | **The Sure Hand** |
| Most Press On Attempts | **The Bold** |
| Most Enemies Felled | **The Hunter** |
| Most Natural 20s Rolled | **The Lucky One** |

---

## 7. Visual Hierarchy & Screen Architecture (The Record Tab)

The Record tab follows an intentional top-to-bottom visual cadence that groups identity, power, history, and honours:

```
┌────────────────────────────────────────────────────────┐
│ [🎭] JENNIFER · Lv. 2 Trickster                        │
│ The Lantern Company · Week 3 of 6                      │
├────────────────────────────────────────────────────────┤
│ ATTRIBUTES & TIERS (Coloured Bars)                     │
│ Charm 38  (Apprentice +2) [█████████████░░░░░░]       │
│ Agility 24 (Novice +0)     [████████░░░░░░░░░░]       │
│ Craft 20, Might 18, Intellect 16, Aim 14               │
├────────────────────────────────────────────────────────┤
│ COMBAT GEAR (Two Wide Dark Slabs)                      │
│ 🗡️ SWORD-CANE (Lv. 2 · Atk 15)                          │
│ 🧥 DUELIST CLOAK (Lv. 2 · Def 28)                      │
├────────────────────────────────────────────────────────┤
│ THE 12 CHASE STATS (One Ruled Scoreboard Plate)        │
│ 4 x 3 Ruled Grid · Gold Crown Indicators on Leads      │
├────────────────────────────────────────────────────────┤
│ THE 12 BADGES (Medal Gallery)                          │
│ 4 x 3 Round Medals · Earned in Gold / Unearned in Grey │
└────────────────────────────────────────────────────────┘
```

### Visual Token Discipline
- **Typography:** All numbers use **Cinzel 700 Bold** in antique gold (`#D4B876` / `#E5C158`). Body descriptions use crisp, readable sans-serif.
- **Section Distinction:**
  1. *Attributes:* Vivid colored progress bars with tier markers.
  2. *Gear:* Wide horizontal equipment slabs (`#150D22`).
  3. *Stats:* A single cohesive scoreboard plate with thin internal dividers (`#3A2555`), never isolated floating tiles.
  4. *Badges:* Circular gold/bronze medallions with SVG glyphs.
- **No Redundant Vitals:** HP (fixed at 100) and Gold (persistent in top app bar) are omitted from the page body to preserve vertical focus on identity and achievements.

---

## 8. Summary Table: Chase Stats & Bragging Rights at a Glance

| Feature | Primary Player Motivator | Social Visibility | How It Drives Retention |
|---|---|---|---|
| **12 Scoreboard Stats** | Chase crowns (`👑`) and lead the party in preferred playstyle | Record Tab + Tap to Explain | Daily incremental growth; friendly async competition |
| **12 Badges** | Complete the 4x3 medal gallery; unlock whole-party triumphs | Instant Party Chat pill + Badge Case | Clear aspirational milestones to target during weekly play |
| **"Party, Yesterday"** | Wake up to teammate achievements | Morning sign-in group brief | Immediate social proof and peer accountability each day |
| **"The Week's Best"** | Live recognition in front of friends | Day 7 Gathering lobby announcement | Guarantees high Gathering attendance and collective celebration |
| **Season Titles** | Permanent identity and campaign legacy | Finale ceremony + Season Archive | Long-term investment across the full 6-week arc |

---
*Reference implementations in the codebase: `src/components/RecordTabView.tsx`, `src/data/mythiosRulesData.ts` (`RECORD_STATS_META`, `BADGES_META`), and `docs/canon/mythios-stats-and-badges-proposal.md`.*
