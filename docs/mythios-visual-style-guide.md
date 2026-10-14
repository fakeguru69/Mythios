# Mythios / Tales of the Dark Moon — Visual Style & Component Specification (Consolidated 5 Oct 2026)

**Status: LOCKED (Canvas Version 28 + Full Handoff Audit B15).** This clean specification replaces the earlier layered history and matches the locked `design-canvas/` screens (`Library`, `Seasons`, `Main`, `Fight`, `PartyDay`, `Party`, `Record`, `Bag`, `Seeker`, `Store`, `Match`, `Story`).

---

## 1. Color Tokens (Exact Hex)

| Token | Hex | Purpose |
|---|---|---|
| `--bg-page` | `#0D0714` | Deepest page background canvas (`390px` phone frame) |
| `--bg-header` | `#150D22` | Top bar, navigation tab bar, bottom input chrome, ticker band |
| `--bg-card-head` | `#2E1B42` | Card header strip, Record banner, active tab/pill switch background |
| `--bg-well` | `#1E1232` | MYTHIOS story bubbles, Challenge/Fight/Match card bodies, Store cards |
| `--bg-tile` | `#2A1B40` | Raised item tiles (Gear, Relics, Bag slots) and the joined 12-stat Record slab |
| `--bg-tile-active` | `#382653` | Tapped/selected cell inside the Record scoreboard slab |
| `--bg-record-bubble`| `#130B1F` | Roll results, fight round logs, VICTORY/DEFEATED bubbles, tap-to-explain panels |
| `--bg-party-bubble` | `#2A1840` | Friends' and Garrick's chat bubbles (border `#4A3068`) |
| `--bg-self-bubble` | `#3A2E1C` | Player's own chat bubbles on the right (border `#8A6B3A`) |
| `--gold` | `#D4B876` | Game numbers, active tab, crowns, earned badges, primary button outline/text |
| `--text-cream` | `#F4F1F8` | Primary story/chat prose, card titles, earned badge names |
| `--text-lavender` | `#B7A9CC` | Secondary labels, arithmetic formulas, explain-panel hints |
| `--text-muted` | `#8B7A9E` | Inactive tab labels, dividers, disabled states |
| `--border-mythios` | `#7E68B8` | MYTHIOS narration and card outer border (`1px solid`) |
| `--border-subtle` | `#3A2555` | Section hairlines, header/footer borders, folded round borders |
| `--border-slab` | `#44305F` | Short inset dividers inside the 12-stat Record slab |
| `--green-pass` | `#6FD39A` | Player HP, `SUCCESS`, `HIT`, `+500g` reward, stat upgrades |
| `--red-danger` | `#E0645C` | Enemy name/HP, `FAIL`, `−150g` cost, `HELP-CALL`, unread dot |

### Attribute & Speaker Colors (Used Strictly on Attributes, Relics & Speaker Names — Never on Badges)
- **Might**: `#FF8F5A` (Orange)
- **Agility**: `#B7E05A` (Lime)
- **Intellect**: `#7AA7FF` (Blue)
- **Charm**: `#EE8BC3` (Rose)
- **Craft**: `#C9A3FF` (Violet)
- **Aim**: `#4FD1D9` (Cyan)
- **Combat Relic**: `#D6DCEB` (Steel)
- **Garrick Speaker Label**: `#F0A552` (Warm Amber)
- **MYTHIOS Speaker Label**: `#B0A0D8` (Soft Lavender)

---

## 2. Typography Scale (Phone Standard, 390px Frame)

| Element | Font Family | Size / Weight | Notes |
|---|---|---|---|
| **Story & Chat Speech** | System Sans (`system-ui`, `-apple-system`, `sans-serif`) | `16px` / Regular `400` (`line-height: 1.4`) | Bright `#F4F1F8`, never muted |
| **Found Documents & Fragments** | `Cormorant Garamond`, italic | `17px` / Medium `500` (`line-height: 1.35`) | Used for Scroll Box pages, scripture verses, and Seeker Fragments |
| **Card Titles & Explainer Headings**| `Cinzel`, serif | `15px` / Bold `700` (`line-height: 1.2`) | `#F4F1F8` |
| **Key Game Numbers (`6+`, `DC 7`, Stat Values)** | `Cinzel`, serif | `17px` / Bold `700` | `#D4B876` (`tabular-nums`) |
| **Card Body Facts** | System Sans | `14px` / Regular `400` | `#F4F1F8` |
| **Roll Arithmetic, Hints & Pills** | System Sans | `13px` / Regular `400` | `#B7A9CC` or `#8B7A9E` |
| **Section Labels & Tab Names** | `Cinzel`, serif | `11px` / Bold `700` (`letter-spacing: 1.3px–2px`) | Uppercase |
| **Buttons** | `Cinzel`, serif | `12.5px` / Bold `700` (`min-height: 44px`) | Touch-safe `44px` hitbox |

---

## 3. Shape & Component Rules ("Shape Says Type")

1. **Navigation Hierarchy**:
   - **Top Header**: Back to Seasons (`< TALES OF THE DARK MOON S1`) on left; Gold coin icon + balance (`1,240`) on right.
   - **4 Main Tabs (`CHAT · RECORD · BAG · STORE`)**: Icons + `Cinzel 11px` labels on `#150D22`. Active tab has `#D4B876` icon, text, and `2px` bottom border.
   - **View Switches (`MINE / PARTY` and `ALL / RELICS / SCROLLS / SEEKER`)**: Rounded pill switches (`border-radius: 17px`, active fill `#2E1B42`).
   - **The Ticker**: Full-width band under `MINE / PARTY` (`#150D22`, `1px` top/bottom `#3A2555` borders), showing friend's avatar initial + 1-line `Cormorant Garamond` italic `16px` gold text + right arrow.
2. **Record Page (Canvas v28 — Locked, No Vitals Row)**:
   - **Banner**: `88px` gold-ringed class emblem on left; Character Name (`Cinzel 28px` gold), Class (`Cinzel 15px` tracked), starred class Attributes, and `PARTY NAME · WEEK n OF 6` on right.
   - **Attributes (Bars)**: 2-column grid of the 6 Attributes with colored progress bars, tier name, and roll bonus (`+0` to `+8`).
   - **Gear (Raised Tiles)**: 2 wide tiles (`#2A1B40`) reading `Sword-Cane · Lv. 2 · Weapon 15` with 5 level pips.
   - **RECORD (1 Joined Ruled Slab)**: One `#2A1B40` slab (`border-radius: 12px`), 4 across × 3 rows (Days Played, Best Streak, Gatherings Attended, Fragments Solved / Relics Given, Times Stepped Up, Fragments Matched, Battles Won / Challenges Cleared, Challenges Pressed On, Enemies Defeated, Perfect Rolls). Divided by short `#44305F` hairlines. Numbers where you lead the party are gold `#D4B876` with an `11px` crown.
   - **BADGES (12 Round Medals)**: 4 across × 3 rows. Earned = `#2A1B40` tile with a `36px` round medal (`1.5px` `#D4B876` ring, `#D4B87633` fill, `#E6CC8C` icon, white label). Unearned = `1px dashed #4A3068` slot with dark `#1E1232` disc, `#8F80B2` icon, `#9C8DB5` label.
   - **Tap-to-Explain**: Tapping any Attribute, Gear tile, Relic, Record stat, or Badge opens an inline `#130B1F` panel (`1px solid #B7A9CC`) with a top pointer arrow directly beneath that row.
