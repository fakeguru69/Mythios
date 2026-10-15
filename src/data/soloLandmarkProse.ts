import { AttributeName } from './mythiosRulesData';
import { WEEKDAY_INVENTORY, WeekdayInventoryItem } from './mythiosChaptersData';
import { SEEKER_FRAGMENTS } from './mythiosFragments';
import { getPublicFanOutClue } from './campfireDaysData';
import { GOLD_DETOUR_FIGHT_WIN } from './economy';

export interface DailyRecapData {
  header: string;
  yesterdayPlace: string;
  recapText: string;
}

export interface TeammateBoardFinding {
  id: string;
  member: 'MEI' | 'DEV' | 'ARJUN';
  author: string;
  role: string;
  roleTag: string;
  color: string;
  title: string;
  clueTitle: string;
  summary: string;
  clueText: string;
  garrickCrossCheckPrompt: string;
  memberFollowUpReply: string;
}

export interface DayFanOutData {
  leadInParagraph1: string;
  leadInParagraph2: string;
  branchA: FanOutBranchChallenge;
  branchB: FanOutBranchFight;
  branchC: FanOutBranchChallenge;
  teammateFindings: TeammateBoardFinding[];
  garrickSynthesisWhenPlayerShares: (playerClueText: string, fragWord1: string) => string;
}

/**
 * 1. DAILY RECAP AT THE START OF EVERY DAY (For Async Continuity)
 * Gives players who missed yesterday (or are logging in fresh) a crystal-clear
 * bridge from yesterday's landmark to today's arrival.
 */
export function getDailyRecap(week: number, day: number): DailyRecapData {
  if (week === 1 && day === 1) {
    return {
      header: 'PROLOGUE · THE DROVE ROAD',
      yesterdayPlace: 'The Autumn Forest Road',
      recapText:
        'You set out alone along the autumn forest road carrying your tools and gear. Ahead under the dripping oaks, a stranger crouches beside the jammed lock of your cargo box.',
    };
  }

  if (week === 1 && day === 2) {
    return {
      header: 'YESTERDAY’S TRAIL · W1·D1 THE FOREST ROAD',
      yesterdayPlace: 'W1·D1 · The forest road',
      recapText:
        'Yesterday on the autumn forest road, you drove off a stranger tampering with your cargo box alone and discovered nothing stolen—only a half-burned charcoal rubbing and a torn stub listing four names alongside an address: "The Hollow Wake Inn, on the drove road." Following that note north, you step through the inn door today.',
    };
  }

  let prevW = week;
  let prevD = day - 1;
  if (prevD < 1) {
    prevW = week - 1;
    prevD = 6;
  }

  const prevItem = WEEKDAY_INVENTORY.find((i) => i.week === prevW && i.day === prevD);
  const currItem = WEEKDAY_INVENTORY.find((i) => i.week === week && i.day === day);

  if (day === 1 && week > 1) {
    const gatheringRecaps: Record<number, { place: string; text: string }> = {
      2: {
        place: 'Week 1 Gathering · The Drowned Mine',
        text: 'Last night at the drowned mine, your party rescued nine-year-old Tamsin from the takers before the dark moon rose. On the stone wall behind her, you uncovered three more children’s names—sending you north toward the mill road at first light.',
      },
      3: {
        place: 'Week 2 Gathering · Under the Hillside',
        text: 'Last night in the buried chamber under the hillside, your party pulled the miller’s boy Corin alive from the ring of lamps before his hands could be cut. Before the watchers fled, they whispered that a third child had already been moved "somewhere warm."',
      },
      4: {
        place: 'Week 3 Gathering · Inside the Kiln',
        text: 'Last night inside the volcanic crown of the Kiln, your party freed young Wren from the grey-coated riders and bound their leader—only for someone standing among you in the pitch dark to slice his ropes clean and let him walk out untouched.',
      },
      5: {
        place: 'Week 4 Gathering · Under Old Reedham',
        text: 'Last night beneath the drowned church of Old Reedham, your party rescued the woodcarver’s boy Joss from the flooded vault. With four children safe and four Seeker maps recovered, only the unrecorded fifth Stone remains.',
      },
      6: {
        place: 'Week 5 Gathering · Inside the Wall of Highwall',
        text: 'Last night inside the hollow outer wall of the dead capital Highwall, your party claimed the fifth Seeker Stone and a watch-page counting down six nights until the dark moon rises over the sealed royal hall.',
      },
    };
    const g = gatheringRecaps[week] || gatheringRecaps[2];
    return {
      header: `PREVIOUSLY · AFTER ${g.place.toUpperCase()}`,
      yesterdayPlace: g.place,
      recapText: g.text,
    };
  }

  const resolveN = (str: string, w: number, d: number) =>
    str.replace(/\[N\]/g, w === 1 && d === 1 ? 'four (with blank lines below)' : String(Math.max(1, 7 - d)));

  const prevPlace = prevItem ? prevItem.place : 'Yesterday’s Landmark';
  const prevLearned = prevItem ? resolveN(prevItem.summaryLearned, prevW, prevD) : '';
  const currPlace = currItem ? currItem.place : 'Today’s Landmark';

  return {
    header: `YESTERDAY’S TRAIL · W${prevW}·D${prevD} ${prevPlace.toUpperCase()}`,
    yesterdayPlace: prevPlace,
    recapText: `At ${prevPlace}, your party uncovered a vital lead: ${prevLearned} Following that trail, you and your companions now arrive at ${currPlace}.`,
  };
}

/**
 * 2. OPENING SCENE NARRATION (2 Rich Paragraphs: Context-Aware World-Building + Clear Navigation)
 */
export function getOpeningSceneProse(dayData: WeekdayInventoryItem): {
  paragraph1: string;
  paragraph2: string;
} {
  // Do NOT leak asymmetricChoices[0].detail before the player chooses (preserves C5 agency).
  // Only include pre-fight notice hints so attentive players can deduce first-strike (preserves C6).
  const noticeLead = dayData.preFightChoice?.noticeHint
    ? ` ${dayData.preFightChoice.noticeHint.replace(/^.*Notice:\s*/i, '')}`
    : '';

  const isW1D1 = dayData.week === 1 && dayData.day === 1;
  const isW1D2 = dayData.week === 1 && dayData.day === 2;
  const isHighwallInterior = dayData.week === 6;
  const isNightOrDusk =
    dayData.day === 6 ||
    (dayData.week === 4 && dayData.day === 4) ||
    /night|dusk|dark|moon|lantern|lamp/i.test(dayData.place + ' ' + dayData.question);

  let arrivalLead = '';
  if (isW1D1) {
    arrivalLead = `You walk the wet autumn road alone at ${dayData.place}, where a stranger crouches beside the jammed lock of your cargo box under the dripping oaks.`;
  } else if (isW1D2) {
    arrivalLead = `Following the address from your cargo box into the warm lamplight of ${dayData.place}, you find the other travellers of your company already seated in the common room holding torn paper stubs matching yours, while the innkeeper Garrick sets a missing scholar’s leather satchel on the table between you.`;
  } else if (isHighwallInterior) {
    arrivalLead = `Slipping from the hidden Seeker safe-room inside the dead stone of Highwall, you and your companions move through the cold shadows of ${dayData.place} while Garrick keeps watch at the slit-window.`;
  } else if (isNightOrDusk) {
    arrivalLead = `As dusk deepens into shadow over ${dayData.place}, you and your party move in low behind the cover of the stonework while Garrick holds the rear watch.`;
  } else {
    arrivalLead = `Following yesterday’s lead to ${dayData.place}, you and your party fan out to examine the ground while Garrick keeps a quiet eye on the road behind you.`;
  }

  const cleanQuestion = dayData.question.replace(/\[N\]/g, 'the company');
  const questionFraming = isW1D1
    ? 'One urgent question hangs in the cold air here:'
    : isW1D2
    ? 'One urgent question hangs in the common room here:'
    : 'One urgent question hangs over your party here:';
  const paragraph1 = `${arrivalLead}${noticeLead} ${questionFraming} ${cleanQuestion}`;

  let paragraph2 = '';
  if (dayData.challengeTitle && dayData.hasFight) {
    const attrs = dayData.challengeAttrs
      ? `${dayData.challengeAttrs[0]} or ${dayData.challengeAttrs[1]}`
      : 'your best instincts';
    paragraph2 = `Before steel is drawn at ${dayData.place}, you face an immediate opening test—${dayData.challengeTitle.toLowerCase()}—calling on ${attrs}. How you handle this approach determines who takes the first strike when ${
      dayData.fightEnemyName || 'the sentry'
    } closes in.`;
  } else if (dayData.challengeTitle) {
    const attrs = dayData.challengeAttrs
      ? `${dayData.challengeAttrs[0]} or ${dayData.challengeAttrs[1]}`
      : 'your training';
    paragraph2 = `Your direct path to the truth at ${dayData.place} runs straight through a delicate obstacle: ${dayData.challengeTitle.toLowerCase()}. Choose whether to approach with ${attrs}—if you pass, the way opens cleanly; if you fail, the noise of the failed attempt will draw an alerted lookout right onto your position.`;
  } else {
    paragraph2 = `Before you can search the stonework at ${dayData.place} for today’s Seeker Fragment, steel scrapes against stone ahead. ${
      dayData.fightEnemyName || 'A sentry'
    } steps out to bar your path, leaving you no choice but to fight your way through to reach the clue beyond.`;
  }

  return { paragraph1, paragraph2 };
}

/**
 * 3. POST-CHALLENGE NARRATION (References Chosen Action, Never Repeats Summary, Clear Next Step)
 */
export function getPostChallengeProse(
  dayData: WeekdayInventoryItem,
  chosenAttr: AttributeName,
  cleared: boolean
): {
  paragraph1: string;
  paragraph2: string;
} {
  const attrActionPhrase: Record<AttributeName, string> = {
    Might: 'bringing raw physical force to bear at the exact point of leverage',
    Agility: 'moving with silent, sure-footed precision along the blind angle',
    Intellect: 'piecing together the quiet physical evidence and timeline before acting',
    Charm: 'speaking with measured warmth and steadiness to earn trust',
    Craft: 'reading the joints, latch-work, and tool-marks with a maker’s eye',
    Aim: 'sighting the angles and subtle tracks from a careful distance',
  };

  const approachText = attrActionPhrase[chosenAttr] || 'committing to your chosen approach';
  const isW1D2 = dayData.week === 1 && dayData.day === 2;

  if (cleared) {
    const paragraph1 = `Relying on your ${chosenAttr}—${approachText}—you clear the obstacle at ${dayData.place} on the first attempt. ${dayData.passBranchText.replace(/\[N\]/g, 'four')}`;

    const paragraph2 = dayData.hasFight
      ? `Because you handled the approach cleanly without giving yourself away, you spot ${
          dayData.fightEnemyName || 'the sentry'
        } moving in before they can spring their trap—granting you a First-Strike Advantage (+2 WEP) in the confrontation right ahead!`
      : isW1D2
      ? `As the torn stubs fit cleanly into Meira’s notebook (${dayData.summaryLearned.replace(/\[N\]/g, 'the company')}), you and the other travellers exchange a look across the common room while Garrick bolts the inn door—officially forming your party to ride north and save the first child! Stepping to the hearth-stone at ${dayData.place}, you also lift today’s carved Seeker Fragment free.`
      : `With the obstacle behind you and the truth in hand (${dayData.summaryLearned.replace(/\[N\]/g, 'the company')}), you step closer to the weathered masonry at ${dayData.place}, where your fingers catch the recessed socket of a carved Seeker Fragment waiting to be lifted free.`;

    return { paragraph1, paragraph2 };
  } else {
    const obstacleName = dayData.challengeTitle
      ? dayData.challengeTitle.toLowerCase()
      : 'the obstacle';
    const paragraph1 = `Despite ${approachText} with your ${chosenAttr}, your attempt on ${obstacleName} slips at the worst possible moment. ${dayData.failBranchText.replace(/\[N\]/g, 'the company')}`;

    const paragraph2 = dayData.hasFight
      ? `The sharp noise of your failed attempt echoes across ${dayData.place}, alerting ${
          dayData.fightEnemyName || 'the sentry'
        }! Before you can reset your stance, they lunge from cover as the fight begins.`
      : `Worse still, the sharp commotion from ${obstacleName} carries across ${dayData.place}—and heavy boots come running! An alerted lookout hears you and lunges out of the shadows to corner you, forcing you to fight your way clear before you can salvage the trail (+${GOLD_DETOUR_FIGHT_WIN}g Detour fight on victory).`;

    return { paragraph1, paragraph2 };
  }
}

/**
 * 4. POST-DETOUR FIGHT NARRATION (When a player fails a Challenge-only day, alerts a lookout, and wins the skirmish; pay is GOLD_DETOUR_FIGHT_WIN, pending the numbers pass)
 */
export function getPostDetourFightProse(dayData: WeekdayInventoryItem): {
  paragraph1: string;
  paragraph2: string;
} {
  const obstacleName = dayData.challengeTitle
    ? dayData.challengeTitle.toLowerCase()
    : 'the jammed obstacle';
  const isW1D2 = dayData.week === 1 && dayData.day === 2;
  const paragraph1 = `Breathing hard after driving off the lookout who heard you at ${obstacleName}, you recover an extra pouch from the fallen sentry’s belt (+${GOLD_DETOUR_FIGHT_WIN}g Detour skirmish win) and force the rest of the way open before another guard can answer the noise.`;
  const paragraph2 = isW1D2
    ? `Back inside ${dayData.place}, the torn stubs fit into Meira’s notebook (${dayData.summaryLearned.replace(/\[N\]/g, 'the company')}). Seeing the proof on the page, the company joins forces with Garrick—officially forming your party as you pry loose today’s carved Seeker Fragment from the hearth-stone.`
    : `Working quickly through the aftermath at ${dayData.place}, you piece together what the clean approach would have shown: ${dayData.summaryLearned.replace(/\[N\]/g, 'the company')} Right beside the mark, you pry loose today’s carved Seeker Fragment and slide it into your satchel.`;
  return { paragraph1, paragraph2 };
}

/**
 * 5. POST-MAIN-FIGHT NARRATION (Never duplicates Challenge passBranchText on Challenge+Fight days!)
 */
export function getPostFightProse(
  dayData: WeekdayInventoryItem,
  hadChallenge: boolean,
  challengeCleared: boolean
): {
  paragraph1: string;
  paragraph2: string;
} {
  const enemy =
    dayData.fightEnemyName ||
    (dayData.week < 3 ? 'the lookout' : 'the Order sentry');

  if (hadChallenge) {
    // On a Challenge + Fight day, passBranchText/failBranchText was already shown after the Challenge!
    // Here we deliver distinct combat-aftermath + synthesis prose so nothing ever repeats.
    const paragraph1 = challengeCleared
      ? `Pressing the advantage from your opening approach, your final strike drives ${enemy} back across ${dayData.place} until they break and retreat into the cover of the trees, leaving the ground in your hands.`
      : `Shaking off the sting of the opening ambush, you weather ${enemy}’s blows and turn the fight around at ${dayData.place}, forcing your opponent to abandon their post and flee down the trail.`;

    const paragraph2 = `With ${enemy} driven off, the picture at ${dayData.place} locks into focus: ${dayData.summaryLearned.replace(/\[N\]/g, 'four')} Crouching where ${enemy} stood guard, you brush away the dirt and lift today’s carved Seeker Fragment from its stone housing.`;
    return { paragraph1, paragraph2 };
  }

  // On a Fight-only day, passBranchText is the fight's canon outcome!
  const paragraph1 = `After a tense exchange of steel at ${dayData.place}, your final blow breaks ${enemy}’s guard. ${dayData.passBranchText.replace(/\[N\]/g, 'four')}`;
  const paragraph2 = `Standing over the cleared ground, the meaning of what happened at ${dayData.place} becomes unmistakable: ${dayData.summaryLearned.replace(/\[N\]/g, 'four')} Right beside the mark, your fingers uncover the recessed stone housing holding today’s Seeker Fragment.`;
  return { paragraph1, paragraph2 };
}

/**
 * 6. FULL UNRUSHED "FANNING OUT" SOLO ENCOUNTER BEAT (Beats 5, 6 & 7) + TEAMMATE BOARD CLUES
 * Every single day offers:
 * - Branch A: A full Solo Challenge Encounter (meeting a person / finding a locked chest or cache)
 * - Branch B: A full Solo Fight Skirmish (intercepting an Order scout / perimeter guard)
 * - Branch C: Regroup straight at Garrick's campfire
 * Completing Branch A or Branch B unlocks the 1st-letter placement hint on today's Seeker Fragment + a Solo Clue for the Campfire Board!
 */
export interface FanOutBranchChallenge extends FanOutBranchOption {
  kind: 'CHALLENGE';
  id: 'BRANCH_A' | 'BRANCH_C';
  summaryLabel: string;
  playerDeclareText: string;
  attrs: [AttributeName, AttributeName];
  attr1ActionTitle: string;
  attr1ActionDesc: string;
  attr2ActionTitle: string;
  attr2ActionDesc: string;
}

export interface FanOutBranchFight extends FanOutBranchOption {
  kind: 'FIGHT';
  id: 'BRANCH_B';
  summaryLabel: string;
  playerDeclareText: string;
  winParagraph1: string;
  winParagraph2: string;
}

export function getFanOutEncounterData(dayData: WeekdayInventoryItem): DayFanOutData {
  const place = dayData.place;
  const placeShort = place.replace(/^The\s+/i, '');
  const dayFrag = SEEKER_FRAGMENTS.find(
    (f) => f.week === dayData.week && f.day === dayData.day
  );
  const word1 = dayFrag?.word1 || 'LOCK';
  const firstLetter1 = (word1[0] || 'L').toUpperCase();

  const isW1 = dayData.week === 1;
  const isW2 = dayData.week === 2;
  const isW1D1 = dayData.week === 1 && dayData.day === 1;
  const factionName = isW1
    ? 'the quiet riders'
    : isW2
    ? 'the hooded watchers'
    : 'the Order';
  const scoutName = isW1
    ? 'Rear-Guard Lookout'
    : isW2
    ? 'Hooded Rear-Guard Scout'
    : 'Order Rear-Guard Scout';
  const campHostRef = 'Garrick expects you back at the campfire';

  // Canonical Fan Out clue from campfire-days.json (title + text verbatim)
  const canonicalClue = getPublicFanOutClue(dayData.week, dayData.day);

  const leadInParagraph1 = isW1D1
    ? `With today’s carved Seeker Fragment safely tucked into your satchel beside the torn stub naming The Hollow Wake Inn, you stand alone at ${place} as long purple shadows stretch across the wet timber.`
    : `With today’s carved Seeker Fragment safely tucked into your satchel, the four of you pause at ${place} as long purple shadows stretch across the ground. There is still half an hour of grey light left before ${campHostRef}.`;
  const leadInParagraph2 = isW1D1
    ? `Before you follow the drove road north toward The Hollow Wake Inn, you can fan out on a Challenge or Fight branch to uncover today’s clue ("${canonicalClue.title}") and the Seeker Fragment first-letter hint, or head straight on.`
    : `Before nightfall, each friend can take a Fan Out branch (Challenge or Fight — both bring back today’s clue "${canonicalClue.title}" and the Seeker Fragment first-letter hint) or choose Head to Campfire (bringing no clue and learning it from the board).`;

  const branchA: FanOutBranchChallenge = {
    kind: 'CHALLENGE',
    branchType: 'CHALLENGE',
    id: 'BRANCH_A',
    title: `CHALLENGE: ${canonicalClue.title.toUpperCase()}`,
    badge: '🎯 CHALLENGE · +150G & CLUE',
    color: '#4FD1C5',
    summaryLabel: `Investigate ${placeShort} to uncover "${canonicalClue.title}" and the first-letter Fragment hint.`,
    label: `Investigate ${placeShort} to uncover "${canonicalClue.title}" and the first-letter Fragment hint.`,
    playerDeclareText: `Before the light goes at ${place}, I’m fanning out to examine "${canonicalClue.title}".`,
    playerDeclaration: `Before the light goes at ${place}, I’m fanning out to examine "${canonicalClue.title}".`,
    arrivalParagraph1: isW1D1
      ? `Before leaving ${place} behind, you move in close to search the ground in the fading grey light.`
      : `You move in close at ${place} in the fading grey light before joining the others at the fire.`,
    arrivalParagraph2: `Trace the physical signs with Craft or piece the scene together with Intellect to uncover "${canonicalClue.title}" and reveal the starting letter "${firstLetter1}" for today’s Seeker Fragment.`,
    challengeTitle: canonicalClue.title.toUpperCase(),
    attrs: ['Craft', 'Intellect'],
    challengeAttrs: ['Craft', 'Intellect'],
    challengeObstacle: 34 + dayData.week * 5,
    attr1ActionTitle: `EXAMINE WITH CRAFT`,
    attr1ActionDesc: `Use Craft to read the physical details at ${placeShort}.`,
    attr2ActionTitle: `EXAMINE WITH INTELLECT`,
    attr2ActionDesc: `Use Intellect to read what happened at ${placeShort}.`,
    passParagraph1: `${canonicalClue.text}`,
    passParagraph2: `Alongside "${canonicalClue.title}", you trace the Seeker mason’s guide-letter confirming that today’s first Fragment lock-word begins with "${firstLetter1}".`,
    failParagraph1: `The fading light and shifting footing at ${place} work against you before you can lock the trace down.`,
    failParagraph2: `With night closing in over ${place}, you head toward the fire to check the board.`,
    soloClueTitle: canonicalClue.title,
    soloClueText: canonicalClue.text,
  };

  const branchBWin1 = `${canonicalClue.text}`;
  const branchBWin2 = `Driving the ${scoutName.toLowerCase()} back from ${place} also uncovers the Seeker mason’s guide-letter confirming that today’s first Fragment lock-word begins with "${firstLetter1}".`;

  const branchB: FanOutBranchFight = {
    kind: 'FIGHT',
    branchType: 'FIGHT',
    id: 'BRANCH_B',
    title: `FIGHT: ${canonicalClue.title.toUpperCase()}`,
    badge: '⚔️ FIGHT · +150G & CLUE',
    color: '#E5C158',
    summaryLabel: `Drive off the ${scoutName.toLowerCase()} at ${placeShort} to uncover "${canonicalClue.title}" and the first-letter Fragment hint.`,
    label: `Drive off the ${scoutName.toLowerCase()} at ${placeShort} to uncover "${canonicalClue.title}" and the first-letter Fragment hint.`,
    playerDeclareText: `I’ve spotted a ${scoutName.toLowerCase()} at ${place}—I’m moving in before they slip away.`,
    playerDeclaration: `I’ve spotted a ${scoutName.toLowerCase()} at ${place}—I’m moving in before they slip away.`,
    arrivalParagraph1: `Moving along the shadowed edge of ${place}, you catch the scrape of a boot where a lone ${scoutName} has lingered behind.`,
    arrivalParagraph2: `Drive them off in a fast skirmish to uncover "${canonicalClue.title}" and the starting letter "${firstLetter1}" for today’s Seeker Fragment.`,
    enemyName: `${scoutName} at ${placeShort}`,
    enemyHp: 70,
    enemyDef: Math.max(16, 17 + dayData.week),
    enemyAtk: 12 + dayData.week,
    winParagraph1: branchBWin1,
    winParagraph2: branchBWin2,
    passParagraph1: branchBWin1,
    passParagraph2: branchBWin2,
    failParagraph1: `Bruised from the exchange of steel in the fading light, you lose sight of the ${scoutName.toLowerCase()} as they slip away from ${place}.`,
    failParagraph2: `With night closing in fast over ${place}, you bind your scrape and head toward the fire.`,
    soloClueTitle: canonicalClue.title,
    soloClueText: canonicalClue.text,
  };

  const branchC: FanOutBranchChallenge = {
    kind: 'CHALLENGE',
    branchType: 'CAMPFIRE',
    id: 'BRANCH_C',
    title: `HEAD TO CAMPFIRE`,
    badge: '🔥 HEAD TO CAMPFIRE · NO CLUE',
    color: '#F0A552',
    summaryLabel: `Head straight to the fire without fanning out. You bring no clue and learn "${canonicalClue.title}" from the board.`,
    label: `Head straight to the fire without fanning out. You bring no clue and learn "${canonicalClue.title}" from the board.`,
    playerDeclareText: `I’m heading straight to the Campfire to see what’s on the board.`,
    playerDeclaration: `I’m heading straight to the Campfire to see what’s on the board.`,
    arrivalParagraph1: `You leave ${place} as dusk settles and walk straight toward the firelight.`,
    arrivalParagraph2: `You bring no Fan Out clue of your own tonight and will read "${canonicalClue.title}" from the Campfire board.`,
    challengeTitle: `HEAD TO CAMPFIRE`,
    attrs: ['Agility', 'Aim'],
    challengeAttrs: ['Agility', 'Aim'],
    challengeObstacle: 0,
    attr1ActionTitle: 'HEAD TO CAMPFIRE',
    attr1ActionDesc: `Walk straight to the Campfire and learn today’s clue from the board.`,
    attr2ActionTitle: 'HEAD TO CAMPFIRE',
    attr2ActionDesc: `Walk straight to the Campfire and learn today’s clue from the board.`,
    passParagraph1: `You arrive at the fire as the kettle goes on. You brought no Fan Out clue of your own and will read "${canonicalClue.title}" from the board.`,
    passParagraph2: ``,
    failParagraph1: `You arrive at the fire and will read "${canonicalClue.title}" from the board.`,
    failParagraph2: ``,
    soloClueTitle: '',
    soloClueText: '',
  };

  const teammateFindings: TeammateBoardFinding[] = [
    {
      id: `tf-mei-${dayData.week}-${dayData.day}`,
      member: 'MEI',
      author: 'Mei',
      role: 'SAGE · INTELLECT',
      roleTag: 'Fan Out Clue',
      color: '#F49CBB',
      title: canonicalClue.title,
      clueTitle: canonicalClue.title,
      summary: canonicalClue.text,
      clueText: canonicalClue.text,
      garrickCrossCheckPrompt: '',
      memberFollowUpReply: '',
    },
    {
      id: `tf-dev-${dayData.week}-${dayData.day}`,
      member: 'DEV',
      author: 'Dev',
      role: 'ARCHER · AIM',
      roleTag: 'Fan Out Clue',
      color: '#5BC0EB',
      title: canonicalClue.title,
      clueTitle: canonicalClue.title,
      summary: canonicalClue.text,
      clueText: canonicalClue.text,
      garrickCrossCheckPrompt: '',
      memberFollowUpReply: '',
    },
    {
      id: `tf-arjun-${dayData.week}-${dayData.day}`,
      member: 'ARJUN',
      author: 'Arjun',
      role: 'ARTIFICER · CRAFT',
      roleTag: 'Fan Out Clue',
      color: '#4FD1C5',
      title: canonicalClue.title,
      clueTitle: canonicalClue.title,
      summary: canonicalClue.text,
      clueText: canonicalClue.text,
      garrickCrossCheckPrompt: '',
      memberFollowUpReply: '',
    },
  ];

  const garrickSynthesisWhenPlayerShares = () => '';

  return {
    leadInParagraph1,
    leadInParagraph2,
    branchA,
    branchB,
    branchC,
    teammateFindings,
    garrickSynthesisWhenPlayerShares,
  };
}

export function getPartyBoardCluesForDay(week: number, day: number): TeammateBoardFinding[] {
  const ch =
    WEEKDAY_INVENTORY.find((d) => d.week === week && d.day === day) || WEEKDAY_INVENTORY[0];
  return getFanOutEncounterData(ch).teammateFindings;
}

export function getSoloFanOutEncounter(
  week: number,
  day: number
): {
  soloClueTitle: string;
  soloClueText: string;
  seekerFirstLetter: string;
} {
  const canonicalClue = getPublicFanOutClue(week, day);
  const frag =
    SEEKER_FRAGMENTS.find((f) => f.week === week && f.day === day) || SEEKER_FRAGMENTS[0];
  return {
    soloClueTitle: canonicalClue.title,
    soloClueText: canonicalClue.text,
    seekerFirstLetter: (frag.word1[0] || 'L').toUpperCase(),
  };
}

export interface FanOutBranchOption {
  id: string;
  branchType: 'CHALLENGE' | 'FIGHT' | 'CAMPFIRE';
  title: string;
  badge: string;
  color: string;
  label: string;
  playerDeclaration: string;
  arrivalParagraph1: string;
  arrivalParagraph2: string;
  challengeTitle?: string;
  challengeAttrs?: [AttributeName, AttributeName];
  challengeObstacle?: number;
  enemyName?: string;
  enemyHp?: number;
  enemyDef?: number;
  enemyAtk?: number;
  passParagraph1?: string;
  passParagraph2?: string;
  failParagraph1?: string;
  failParagraph2?: string;
  soloClueTitle?: string;
  soloClueText?: string;
}

export function getDailyRecapBanner(week: number, day: number): string {
  const r = getDailyRecap(week, day);
  return `${r.header} — ${r.recapText}`;
}

export function getOpeningProseParagraphs(dayData: WeekdayInventoryItem): [string, string] {
  const p = getOpeningSceneProse(dayData);
  return [p.paragraph1, p.paragraph2];
}

export function getChallengePassProseParagraphs(
  dayData: WeekdayInventoryItem,
  chosenAttr: AttributeName
): [string, string] {
  const p = getPostChallengeProse(dayData, chosenAttr, true);
  return [p.paragraph1, p.paragraph2];
}

export function getChallengeFailProseParagraphs(
  dayData: WeekdayInventoryItem,
  chosenAttr: AttributeName
): [string, string] {
  const p = getPostChallengeProse(dayData, chosenAttr, false);
  return [p.paragraph1, p.paragraph2];
}

export function getRecoveryProseParagraphs(
  dayData: WeekdayInventoryItem,
  _method?: string
): [string, string] {
  const p = getPostDetourFightProse(dayData);
  return [p.paragraph1, p.paragraph2];
}

export function getFightWinProseParagraphs(
  dayData: WeekdayInventoryItem,
  challengeCleared: boolean = true
): [string, string] {
  const p = getPostFightProse(
    dayData,
    Boolean(dayData.challengeTitle),
    challengeCleared
  );
  return [p.paragraph1, p.paragraph2];
}
