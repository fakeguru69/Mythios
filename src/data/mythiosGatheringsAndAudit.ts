import { AttributeName } from './mythiosRulesData';
import { SEEKER_FRAGMENTS } from './mythiosFragments';
import { WEEKDAY_INVENTORY } from './mythiosChaptersData';
import { APPROVED_FAN_OUT_LEADS, FAN_OUT_LATE_LINES } from './fanOutLeads';
import { FRAGMENT_MEANING_QUESTIONS } from './fragmentMeaningQuestions';
import { WEEK_QUESTIONS } from './weekQuestions';
import { CAMPFIRE_DAYS_DATA } from './campfireDaysData';
import { GATHERING_SCRIPTS } from './gatheringScripts';

export interface GatheringData {
  week: number;
  title: string;
  location: string;
  enemyName: string;
  conditionText: string;
  ueTitle: string;
  ueAttr: AttributeName;
  ueBarAName: string;
  ueBarBName: string;
}

export const GATHERINGS_DATA: GatheringData[] = [
  {
    week: 1, title: 'Gathering 1 · The Mine', location: 'Old river mine across the ford',
    enemyName: 'Mine Guard',
    conditionText: 'This is a Battle. All of you fight at once, and it ends when the last enemy falls.',
    ueTitle: 'THE DROP', ueAttr: 'Might', ueBarAName: 'The Drop', ueBarBName: 'Dev HP',
  },
  {
    week: 2, title: 'Gathering 2 · Under the Mill Hill', location: 'The older room down the soft stair',
    enemyName: 'The Robed',
    conditionText: 'The chant: while more than half of them are standing, each has DEF +1.',
    ueTitle: 'THE BREACH', ueAttr: 'Intellect', ueBarAName: 'The Tunnel', ueBarBName: 'The Room',
  },
  {
    week: 3, title: 'Gathering 3 · Under the Kiln', location: 'The warm chamber beneath the black hill',
    enemyName: 'The Faithful',
    conditionText: 'Blade and torch: when an enemy hits a friend, that friend loses 2 more HP at the start of the next round.',
    ueTitle: 'THE SCREE', ueAttr: 'Agility', ueBarAName: 'The Climb', ueBarBName: 'Wren\'s Hold',
  },
  {
    week: 4, title: 'Gathering 4 · The Drowned Undercroft', location: 'Under Old Reedham in the Stillwater',
    enemyName: 'The Faithful',
    conditionText: 'Knee-deep: roll a 1, 2 or 3 on a strike and you lose your next strike. So does he.',
    ueTitle: 'THE WATER-GATE', ueAttr: 'Craft', ueBarAName: 'The Pin', ueBarBName: 'His Breath',
  },
  {
    week: 5, title: 'Gathering 5 · The Wall at Highwall', location: 'The Seekers\' hidden room in the wall',
    enemyName: 'The Hollowed',
    conditionText: 'The hollowed: the first time an enemy is put down, it rises with 2 HP and loses its next strike.',
    ueTitle: 'THE ROLL-CALL', ueAttr: 'Charm', ueBarAName: 'The Roll-Call', ueBarBName: 'Their Trust',
  },
  {
    week: 6, title: 'Gathering 6 · His Hall (The Finale)', location: 'The sealed hall at Highwall',
    enemyName: 'The Faithful & The Hollowed',
    conditionText: 'Half faithful (the chant: DEF +1 while >50% stand), half hollowed (rises once at 2 HP).',
    ueTitle: 'THE HAWSER', ueAttr: 'Aim', ueBarAName: 'The Hawser', ueBarBName: 'Your Line',
  },
];

export interface AuditFindingRecord {
  id: string;
  part: 'Creative, Narrative & Gameplay (Part A)' | 'Technical, Rules, Simulator & Screens (Part B)';
  title: string;
  category: string;
  wasRealMistake: boolean;
  beforeText: string;
  afterText: string;
  filesUpdated: string[];
}

export const AUDIT_FINDINGS_LOG: AuditFindingRecord[] = [
  {
    id: 'C1', part: 'Creative, Narrative & Gameplay (Part A)',
    title: 'Fixed the "Shouting the Map Across an Enemy Camp" Loophole (Weeks 2 & 3 Day 6)',
    category: 'Story Loophole', wasRealMistake: true,
    beforeText: 'Week 2 Day 6 & Week 3 Day 6 had the party read the secret map aloud twice across the dark hillside right above the Order\'s camp.',
    afterText: 'Week 1 (inn courier) and Week 4 (calling over storm wind in tower) keep loud reading; Week 2 traces in silence and dislodges stone opening the second shaft; Week 3 passes the map hand-to-hand while watchers spot them descending toward the Kiln.',
    filesUpdated: ['episode-2-the-wind-stone.md', 'episode-3-the-fire-stone.md', 'src/data/mythiosChaptersData.ts'],
  },
  {
    id: 'C2', part: 'Creative, Narrative & Gameplay (Part A)',
    title: 'Fixed Ep1 Day 2 vs. Day 5 Child Timeline Contradiction',
    category: 'Story Loophole', wasRealMistake: true,
    beforeText: 'Ep1 Day 2 read as if a child were currently held at the rock three weeks ago, while Day 5 said Meira wrote about the nephew from two winters ago.',
    afterText: 'Ep1 Day 2 states Meira\'s page records a boy held at the rock two winters back AND warns of a second marked child born on the same dark-moon night in Fenmark (Tamsin).',
    filesUpdated: ['episode-1-the-list.md', 'src/data/mythiosChaptersData.ts'],
  },
  {
    id: 'C3', part: 'Creative, Narrative & Gameplay (Part A)',
    title: 'Reworked Week 4 Day 4 (Old Reedham) from Redundant Footprint Hunt to Night Ferrymen Shadowing',
    category: 'Story Pacing', wasRealMistake: true,
    beforeText: 'Spent Day 4 following 4-day-old footprints to learn "Joss was walked here alive", which Gathering 3 and Day 3\'s 8 notches already proved.',
    afterText: 'Players spot and shadow the Order\'s grey-coated ferrymen unloading at the deep water\'s edge at dusk, marking their course to the reed island for Day 5.',
    filesUpdated: ['episode-4-the-water-stone.md', 'src/data/mythiosChaptersData.ts'],
  },
  {
    id: 'C4', part: 'Creative, Narrative & Gameplay (Part A)',
    title: 'Reinforced Week 6 Day 1 Hidden Wall Room with Seeker Blood-Lock',
    category: 'Story Logic', wasRealMistake: false,
    beforeText: 'Relied only on "from the square every slit in it looks the same" when watchmen walked past twice.',
    afterText: 'Added: "Once, a hand brushes the stone itself. To any hand without Seeker blood in it, the door is only the wall."',
    filesUpdated: ['episode-6-the-finale.md', 'src/data/mythiosChaptersData.ts'],
  },
  {
    id: 'C5', part: 'Creative, Narrative & Gameplay (Part A)',
    title: 'Replaced "All Three Are Seen" Menus with Asymmetric Team Inspection & Ep6 D3 Tactical Bonus',
    category: 'Weekday Gameplay', wasRealMistake: true,
    beforeText: 'Ep1 D1, Ep3 D5, and Ep4 D3 printed all three inspection blocks regardless of button choice; Ep6 D3 [THE WATCH] vs [THE BOARD] did nothing to the roll.',
    afterText: 'Player inspects their chosen object in detail while Mei/Dev/Arjun summarize the others in one line; Ep6 D3 [THE WATCH] grants +1 Agility and [THE BOARD] grants +1 Charm.',
    filesUpdated: ['episode-1-the-list.md', 'episode-3-the-fire-stone.md', 'episode-4-the-water-stone.md', 'episode-6-the-finale.md', 'src/data/mythiosChaptersData.ts'],
  },
  {
    id: 'C6', part: 'Creative, Narrative & Gameplay (Part A)',
    title: 'Made Pre-Fight Choices Readable from Notice Clues on All 7 Fight-Only Days',
    category: 'Weekday Gameplay', wasRealMistake: true,
    beforeText: 'Notice lines appeared AFTER the pre-fight choice on 5 fight-only days (making first strike a blind 50/50 coin flip), and Ep3 D1 & Ep6 D4 had no pre-fight choice at all.',
    afterText: 'Moved Notice lines before the pre-fight choice on all 5 days and added a 2-option tactical pre-fight choice to Ep3 D1 and Ep6 D4.',
    filesUpdated: ['episode-1-the-list.md', 'episode-2-the-wind-stone.md', 'episode-3-the-fire-stone.md', 'episode-5-the-kings-stone.md', 'episode-6-the-finale.md', 'src/data/mythiosChaptersData.ts'],
  },
  {
    id: 'C7', part: 'Creative, Narrative & Gameplay (Part A)',
    title: 'Sharpened the 6 Flattest Challenge Failure Branches',
    category: 'Weekday Gameplay', wasRealMistake: true,
    beforeText: 'Failing Ep1 D2, Ep2 D2, Ep3 D3, Ep3 D4, Ep4 D3, and Ep6 D2 only added dust or lost time while playing the exact same beat.',
    afterText: 'Failing now alters your social standing or physical position in the next beat (e.g., Garrick looks to Mei; the miller\'s wife withholds the horn button; the soldier steps over your boots in the barracks).',
    filesUpdated: ['episode-1-the-list.md', 'episode-2-the-wind-stone.md', 'episode-3-the-fire-stone.md', 'episode-4-the-water-stone.md', 'episode-6-the-finale.md'],
  },
  {
    id: 'C8', part: 'Creative, Narrative & Gameplay (Part A)',
    title: 'Added Real Stakes to Gathering 2 (THE BREACH) & Gathering 6 (THE HAWSER) United Efforts',
    category: 'Gathering Play', wasRealMistake: true,
    beforeText: 'Losing THE BREACH in Gathering 2 had almost no cost; losing THE HAWSER in Gathering 6 changed nothing.',
    afterText: 'Losing THE BREACH in Gathering 2 forfeits [LOOK CLOSER] (+75g and room clues); losing THE HAWSER in Gathering 6 leaves your palm bleeding for the handover beat.',
    filesUpdated: ['episode-2-the-wind-stone.md', 'episode-6-the-finale.md', 'mythios-gathering-scripts.md', 'src/data/mythiosGatheringsAndAudit.ts'],
  },
  {
    id: 'C9', part: 'Creative, Narrative & Gameplay (Part A)',
    title: 'Restored Active [USE COMBAT RELIC] Button in Fights & Gathering Battles',
    category: 'Combat UI', wasRealMistake: true,
    beforeText: 'Core Rules §5 specified a [USE RELIC] button under each round message, but Fight.dc.html omitted it.',
    afterText: 'Added [USE COMBAT RELIC] under active fight rounds and enabled giving a Combat Relic from the PARTY Battle board.',
    filesUpdated: ['src/App.tsx'],
  },
  {
    id: 'C10', part: 'Creative, Narrative & Gameplay (Part A)',
    title: 'Added One-Tap [SHARE WITH PARTY] Button on Private [PRESS ON], [LOOK CLOSER] & Adept Clues',
    category: 'Social Retention', wasRealMistake: false,
    beforeText: 'Exclusive [PRESS ON] and Adept Notice clues stayed trapped in private MINE threads unless manually retyped.',
    afterText: 'Added a one-tap [SHARE WITH PARTY] button that posts the unlocked clue into PARTY chat.',
    filesUpdated: ['src/App.tsx'],
  },
  {
    id: 'C11', part: 'Creative, Narrative & Gameplay (Part A)',
    title: 'Integrated All 4 Engagement Devices into the Daily Loop & Post-Finale Garrick Recap',
    category: 'Retention & Recap', wasRealMistake: false,
    beforeText: 'Daily Theory Prompt, Weekly Poll, Personal Stake, and 1:1 Garrick Chat were undecided for v1.',
    afterText: 'Integrated all 4 into the app and linked them directly into the post-finale Garrick Recap.',
    filesUpdated: ['src/App.tsx'],
  },
  {
    id: 'B1', part: 'Technical, Rules, Simulator & Screens (Part B)',
    title: 'Synced Duplicate Master `mythios-gathering-scripts.md` with Episode Files',
    category: 'Duplicate Master', wasRealMistake: true,
    beforeText: 'mythios-gathering-scripts.md still had 11 [sim] tags, "The Hawser 60 · Your Line 60", and 4 instances of "Connect".',
    afterText: 'Replaced all [sim] tags with +500g / +75g / Battle rules, set Hawser to 100/100, and updated Connect to Match.',
    filesUpdated: ['docs/review-full-handoff-audit.md', 'src/data/mythiosGatheringsAndAudit.ts'],
  },
  {
    id: 'B2', part: 'Technical, Rules, Simulator & Screens (Part B)',
    title: 'Fixed Part 7 Table Bands in `mythios-united-effort-stories.md`',
    category: 'Numbers / Tables', wasRealMistake: true,
    beforeText: 'Header was updated to 100/100, but table bands still said 40–59 / 20–39 / 1–19.',
    afterText: 'Updated Part 7 table bands to 67–99 / 34–66 / 1–33 to match Parts 2–6.',
    filesUpdated: ['docs/review-full-handoff-audit.md'],
  },
  {
    id: 'B3', part: 'Technical, Rules, Simulator & Screens (Part B)',
    title: 'Merged All 6 Class Openings into Ep1 Day 1 & Aligned Summary Card to Might or Craft',
    category: 'Story / Rules', wasRealMistake: true,
    beforeText: 'Other 5 class openings only existed in review-content-pass-2.md (using retired word "Check").',
    afterText: 'Merged all 6 class openings with "Challenge" terminology and aligned to Core Rules §12.',
    filesUpdated: ['docs/review-full-handoff-audit.md', 'src/data/mythiosChaptersData.ts'],
  },
  {
    id: 'B4-B7', part: 'Technical, Rules, Simulator & Screens (Part B)',
    title: 'Fixed Ep2 Stray Seed Note, Ep2 D1 Extra Cup Table, Router Test Prompt State 2 & Ep5 Quote',
    category: 'Doc Connectors', wasRealMistake: true,
    beforeText: 'Stray seed bullet in Ep2 D2; Extra cup listed at Ep2 D2 instead of D1; State 2 in router prompt cited Verse of the Four in Ep3 D4.',
    afterText: 'Deleted stray seed bullet; updated extra cup to Ep2 D1; fixed State 2 to Verse of the Answering; aligned Ep5 quote.',
    filesUpdated: ['docs/garrick-router-test-prompt.md', 'docs/review-full-handoff-audit.md'],
  },
  {
    id: 'B8-B10', part: 'Technical, Rules, Simulator & Screens (Part B)',
    title: 'Removed [NOT NOW] from Sample Enemy Card, Stripped Cut Optional-Play Terms & Closed §13 Rules',
    category: 'Core Rules', wasRealMistake: true,
    beforeText: 'Sample Enemy Card showed [NOT NOW]; Core Rules §8/§11 still mentioned player "notes"; §13 had 3 open items.',
    afterText: 'Enemy Card shows [FIGHT] only; stripped cut terms; closed §13 (Record growth bar, "+1 Mei" Combat Relic tag, dropped Hold the line).',
    filesUpdated: ['docs/review-full-handoff-audit.md'],
  },
  {
    id: 'B11', part: 'Technical, Rules, Simulator & Screens (Part B)',
    title: 'Fixed Simulator Input (`bundle_new.md` Ep1 D6) & Battle Condition Keys (`1..5` → `2..6`)',
    category: 'Simulators', wasRealMistake: true,
    beforeText: 'bundle_new.md had Aim/Intellect on Ep1 D6; g_final.py keyed conditions 1..5 instead of 2..6.',
    afterText: 'Updated Ep1 D6 to Aim/Agility (58 offers match §12) and fixed g_final.py keys to 2..6.',
    filesUpdated: ['simulators/g_final.py', 'docs/review-full-handoff-audit.md'],
  },
  {
    id: 'B12-B15', part: 'Technical, Rules, Simulator & Screens (Part B)',
    title: 'Aligned Party-Chat Result Wording ("cleared"), Fragment Wording ("solved"), Fight/Story Screens & Week/Day Labels',
    category: 'Screens & Glossary', wasRealMistake: true,
    beforeText: 'Fight.png showed retired BONUS FIGHT + note; Story.png showed retired manual per-round [ROLL] and [ASK THE PARTY]; Main.png labeled The Mill as Week 2 Day 3.',
    afterText: 'Standardized "cleared today\'s Challenge" and "solved a word"; updated Fight screen to weekday FIGHT (+300g); updated Storyboard to automatic tumbling dice + [PRESS ON]; fixed Week 2 · Day 2 · The Mill; consolidated style guide.',
    filesUpdated: ['docs/mythios-visual-style-guide.md', 'src/App.tsx'],
  },
];

// First-use gates from canon (CLAUDE.md §6, Campfire v2.3 first-use map). A term may not
// appear in a day's text before the listed week and day. Updated 14 Oct 2026: the old list
// had "king" at W4D7, "throne" W5D7, "cairn" W5D4 and "wall" W5D6, all later than canon uses them.
export const CANON_TERM_GATES: { term: string; minWeek: number; minDay: number }[] = [
  { term: 'four children', minWeek: 2, minDay: 1 },
  { term: 'four names', minWeek: 2, minDay: 1 },
  { term: 'king', minWeek: 2, minDay: 5 },
  { term: 'malakor', minWeek: 2, minDay: 7 },
  { term: 'order', minWeek: 3, minDay: 1 },
  { term: 'fifth', minWeek: 3, minDay: 3 },
  { term: 'moon-blood', minWeek: 4, minDay: 4 },
  { term: 'heartbeat', minWeek: 4, minDay: 6 },
  { term: 'highwall', minWeek: 5, minDay: 1 },
];

export function runMythiosVerifier() {
  const challengeDays = WEEKDAY_INVENTORY.filter((d) => d.challengeTitle && d.challengeAttrs);
  const fightDays = WEEKDAY_INVENTORY.filter((d) => d.hasFight);
  const dualDays = WEEKDAY_INVENTORY.filter((d) => d.challengeTitle && d.hasFight);
  const pressOnDays = WEEKDAY_INVENTORY.filter((d) => d.hasPressOn);

  const attrCounts: Record<AttributeName, number> = {
    Agility: 0, Aim: 0, Craft: 0, Might: 0, Intellect: 0, Charm: 0,
  };
  for (const d of challengeDays) {
    if (d.challengeAttrs) {
      attrCounts[d.challengeAttrs[0]]++;
      attrCounts[d.challengeAttrs[1]]++;
    }
  }

  // Verify all 36 fragments and their 72 anagram jumbles
  let validAnagrams = 0;
  for (const f of SEEKER_FRAGMENTS) {
    const s1 = f.word1.toUpperCase().split('').sort().join('');
    const j1 = [...f.jumble1].sort().join('');
    const s2 = f.word2.toUpperCase().split('').sort().join('');
    const j2 = [...f.jumble2].sort().join('');
    if (s1 === j1) validAnagrams++;
    if (s2 === j2) validAnagrams++;
  }

  // First-use gates bind the build's own text (CLAUDE.md §6, 15 Oct): the Fan Out leads, the late lines,
  // the fire's meaning questions and the week questions. The episode files' story text may use a word earlier.
  const buildTexts: { week: number; day: number; text: string }[] = [];
  for (const [key, leads] of Object.entries(APPROVED_FAN_OUT_LEADS)) {
    const [week, day] = key.split('-').map(Number);
    for (const l of leads) buildTexts.push({ week, day, text: [l.place, l.clueTitle, l.clueText, ...l.actions.map((a) => a.verb)].join(' ') });
  }
  FAN_OUT_LATE_LINES.forEach((text) => buildTexts.push({ week: 1, day: 1, text }));
  for (const [key, text] of Object.entries(FRAGMENT_MEANING_QUESTIONS)) {
    const [week, day] = key.split('-').map(Number);
    buildTexts.push({ week, day, text });
  }
  for (const [week, text] of Object.entries(WEEK_QUESTIONS)) buildTexts.push({ week: Number(week), day: 1, text });
  const canonGateLeaks: string[] = [];
  for (const item of buildTexts) {
    for (const gate of CANON_TERM_GATES) {
      const isBeforeGate = item.week < gate.minWeek || (item.week === gate.minWeek && item.day < gate.minDay);
      if (isBeforeGate && new RegExp(`\\b${gate.term}\\b`, 'i').test(item.text)) {
        canonGateLeaks.push(`W${item.week}D${item.day} (${gate.term})`);
      }
    }
  }

  // Garrick is absent only at the W1D1 fire and present on all 35 other weekday evenings (Campfire v2.3).
  const absentEvenings = CAMPFIRE_DAYS_DATA.filter((d) => d.narratedNoGarrick).map((d) => d.id);

  return {
    totalWeekdays: WEEKDAY_INVENTORY.length, // 36
    totalChallenges: challengeDays.length, // 29
    totalWeekdayFights: fightDays.length, // 12
    totalDualDays: dualDays.length, // 5 (W1D1's tutorial, W2D3, W4D2, W4D5, W6D6)
    totalPressOnDays: pressOnDays.length, // 11 (W3D4's was dropped 15 Oct)
    totalFragments: SEEKER_FRAGMENTS.length, // 36
    validAnagrams, // 72 of 72
    attrCounts, // Agility 12, Aim 11, Craft 10, Might 9, Intellect 8, Charm 8
    totalGatherings: GATHERINGS_DATA.length, // 6
    // The Match steps the Gatherings really play (canon, gatheringScripts.ts).
    totalMatches: GATHERING_SCRIPTS.reduce((acc, g) => acc + g.steps.filter((st) => st.t === 'match').length, 0), // 10
    canonGateLeaks,
    garrickW1D1AbsentOnly: absentEvenings.length === 1 && absentEvenings[0] === '1-1',
  };
}

