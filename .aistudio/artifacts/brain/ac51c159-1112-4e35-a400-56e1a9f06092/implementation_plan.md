# Mythios — Front Page, Character Building & Party Panel Enhancements

## Summary of Changes

### 1. Front Cover Page (`CoverPage.tsx`)
- **Single-Viewport Trailer Aesthetic (`100dvh`):** Scaled typography and spacing so the entire cover page sits within one mobile screen height without vertical scrolling.
- **Cinematic Trailer Hook:** Added *"EMBARK ON AN ADVENTURE"*, the canon premise *"In the hill villages, children are going missing, and nobody is looking for them."*, and trailer hook for *Tales of the Dark Moon*.
- **Clear Metadata & CTA Buttons:** Gold-trimmed action buttons (`[data-button-gather]` "Gather your friends" and `[data-button-signin]` "Already playing? Sign in") with series parameters (`6 weeks · 2 to 6 friends · Daily chapters`).
- **Test Compatibility:** Strictly passes all regex and DOM assertions in `tests/online/cover-page.cjs`.

### 2. Sign-up & Character Creation Worldbuilding (`SessionZero.tsx`)
- **Prologue & Atmosphere:** Mythic premise prologue card introducing the ancient hills and forgotten folk.
- **Hill Folk Naming:** Quick-select village suggestions (*Kael, Ren, Vael, Bran, Sira, Rowan*).
- **Class & Asset Identity:** Detailed flavor prose, weapon affinities, and canonical attribute tone badges for all 6 classes (Warrior, Trickster, Sage, Ranger, Skald, Shadow).
- **Second Strength Affinity:** Descriptive strength profiles with +15 Novice score previews.
- **Heritage & Keepsakes:** Hill village origins (*Ashcombe, Fenmark, Highwall, The Reeds, Oldford*) and family keepsakes (*Grandmother Meira, Grandfather Corin, A carved horse, An iron signet*).
- **Hero Revelation Card:** Parchment reveal of starting attribute score bars, combat equipment, and personal stake quote before embarking.

### 3. Party Page & Panel Visual Hierarchy (`OnlineApp.tsx`)
- **Eliminated Flat Stack:** Replaced the unorganized card sequence with three distinct visual sections:
  1. **THE FELLOWSHIP / THE COMPANY:**
     - Upper kicker & header with party name and member count (`X OF 6`).
     - Enhanced member roster cards with glowing borders, character initials, class badges, and gold status indicators (`At the fire` / `Reading Day N`).
     - Host management dropdown `⋯` (`data-friend-menu-button`) with `Remove from the party`.
     - Grouped pending join requests and expedition invite cards.
  2. **CHRONICLES OF THE ROAD (Story & Gatherings):**
     - Dedicated story chronicle section containing `<GatheringCard>` and `<GarrickRecap>`.
  3. **CAMPFIRE & SETTINGS (Provisions & App Preferences):**
     - Compact notifications alert toggle (gold button when off, hides when enabled).
     - Expedition party clock with time zone indicator.
     - Character rename in this series & leave party confirmation.
     - Return to story shelf (`← Your stories`).
- **Waiting Room Elevation:** Grouped the pre-start lobby similarly, prioritizing the host's character creation callout at the top.

## Verification
- `npx tsx tests/online/party-panel.cjs`: **All 8 checks PASS**
- `npx tsx tests/online/cover-page.cjs`: **All 8 checks PASS**
- `npx tsx tests/online/fork-changed.cjs`: **All checks PASS**
- `npx tsx tests/online/assert-checks.cjs`: **All 29 checks PASS**
- `compile_applet`: **Build succeeded**
- `lint_applet`: **Zero TypeScript errors (`tsc --noEmit`)**
