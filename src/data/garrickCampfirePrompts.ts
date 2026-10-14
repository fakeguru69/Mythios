import { AttributeName } from './mythiosRulesData';
import { WEEKDAY_INVENTORY } from './mythiosChaptersData';
import { SEEKER_FRAGMENTS } from './mythiosFragments';
import { getPartyBoardCluesForDay, getSoloFanOutEncounter } from './soloLandmarkProse';

export type CampfireSpeakerId = 'GARRICK' | 'DEV' | 'MEI' | 'ARJUN';
export type CampfireShapeCode = 'A' | 'B' | 'C' | 'D' | 'E';

export interface CampfireCanonicalChip {
  kind: 'THEORY' | 'FRAGMENT' | 'WRY';
  label: string;
  playerLine: string;
  garrickPayoff: string;
}

export interface CampfireFriendHook {
  attr: AttributeName;
  rawTemplate: string;
  resolvedSpeaker: 'MEI' | 'ARJUN' | 'DEV';
  resolvedFriendName: string;
  label: string;
  playerLine: string;
  companionReply: string;
}

export interface CampfireEveningTableEntry {
  key: string;
  week: number;
  day: number;
  shape: CampfireShapeCode;
  shapeLabel: string;
  clueTag: string;
  garrickObservation: string;
  openQuestion: string;
  chips: [CampfireCanonicalChip, CampfireCanonicalChip, CampfireCanonicalChip];
  friendAttr: AttributeName;
  friendRawPrompt: string;
  friendReply: string;
}

export interface CampfireWaveStance {
  id: string;
  wave: 1 | 2 | 3;
  pillar: 'BOARD_AND_FRAGMENT' | 'MYSTERY_CASE' | 'NEXT_MOVE';
  chipKind?: 'THEORY' | 'FRAGMENT' | 'WRY' | 'FRIEND_HOOK';
  label: string;
  target: CampfireSpeakerId;
  playerLine: string;
  companionReply: string;
  garrickFollowUpHook: string;
}

export interface GarrickCampfireDayPrompt {
  week: number;
  day: number;
  shape: CampfireShapeCode;
  shapeLabel: string;
  clueTag: string;
  arrivalGreeting: string;
  beat1Observation: string;
  beat2Question: string;
  beat3Hook: string;
  boardCrossCheckReply: string;
  canonicalChips: [CampfireCanonicalChip, CampfireCanonicalChip, CampfireCanonicalChip];
  friendHook: CampfireFriendHook;
  wave1Stances: CampfireWaveStance[];
  wave2Stances: CampfireWaveStance[];
  wave3Stances: CampfireWaveStance[];
}

export function resolveFriendForAttribute(attr: AttributeName): {
  speaker: 'MEI' | 'ARJUN' | 'DEV';
  name: string;
} {
  if (attr === 'Intellect' || attr === 'Charm') {
    return { speaker: 'MEI', name: 'Mei' };
  }
  if (attr === 'Craft' || attr === 'Might') {
    return { speaker: 'ARJUN', name: 'Arjun' };
  }
  return { speaker: 'DEV', name: 'Dev' };
}

export const SHAPE_LABELS: Record<CampfireShapeCode, string> = {
  A: 'Shape A · Pick-One',
  B: 'Shape B · Odd-One-Out',
  C: 'Shape C · Missing Piece',
  D: 'Shape D · Who-Would',
  E: 'Shape E · Rank',
};

/**
 * Complete 36-Evening Hand-Authored Campfire Table (`1-1` through `6-6`)
 * - 1-1 is narrated by the roadside fire before meeting Garrick at the Hollow Wake Inn on 1-2.
 * - 1-2 through 6-6 are hosted by Garrick (including all of Week 6), obeying the Three-Verb Rule
 *   (never promises, predicts, or denies knowing; invents no facts about himself) and the First-Use Reveal Map.
 */
export const CAMPFIRE_36_EVENING_TABLE: Record<string, CampfireEveningTableEntry> = {
  '1-1': {
    key: '1-1', week: 1, day: 1, shape: 'A', shapeLabel: SHAPE_LABELS.A,
    clueTag: 'The List & Charcoal Rubbing · Forest Road',
    garrickObservation: 'By the roadside fire on the forest road—one night south of the Hollow Wake Inn—the four of you lay the half-burned charcoal rubbing beside the list found inside your cargo box.',
    openQuestion: 'A thief breaks a lock to take what is inside. Why break a lock on the forest road to put a list of names and an inn’s address in?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · Someone is gathering us at the inn on purpose',
        playerLine: 'Whoever sent that man wasn’t robbing us—they wanted all four of us walking into the Hollow Wake Inn tomorrow at the same hour.',
        garrickPayoff: 'The firelight catches the four names cut into the parchment—four strangers from four roads, all pointed at the same door.',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 1-1 · “Five fell when the dark ate the moon”',
        playerLine: 'Look at Fragment 1-1 from the roadside stone: “Five fell when the dark ate the moon.” The charcoal rubbing came off a stone just like it.',
        garrickPayoff: 'Mei traces the raised charcoal grain: the rubbing and the stone verse were cut by the same ancient chisel.',
      },
      {
        kind: 'WRY',
        label: 'Wry · Best thief in the hills—leaves more than he takes',
        playerLine: 'If every road-thief in these hills breaks into my box to leave me mail instead of taking my silver, I’ll sleep easy.',
        garrickPayoff: 'Dev snorts over his bowstring: "Wait until we see the bill at the Hollow Wake Inn before you call it free."',
      },
    ],
    friendAttr: 'Craft',
    friendRawPrompt: 'Ask {friend:Craft} whether the cargo-box lock was picked with thief’s wire or forced to make us look inside.',
    friendReply: 'The scratches round the latch are fresh and deliberate—he jammed the bolt on purpose so you’d have to pry the lid open before dark and find the list.',
  },
  '1-2': {
    key: '1-2', week: 1, day: 2, shape: 'B', shapeLabel: SHAPE_LABELS.B,
    clueTag: 'Meira’s Satchel & Stubs · Hollow Wake Inn',
    garrickObservation: 'Garrick sets the tin cups down beside Meira’s satchel: “Woman called Meira. Scholar. Sat right there most nights, two years near enough. Cheapest wine in the house, and tipped like a queen. Left this. Hasn’t been back in three weeks.”',
    openQuestion: 'Four stubs cut against a straight rule, a rubbing of a standing stone, and two children’s timelines on one page—which piece doesn’t fit a quiet country scholar?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · She knew she was being hunted before she left',
        playerLine: 'Garrick, a scholar doesn’t cut four separate stubs against a rule and leave her satchel behind unless she knew she wouldn’t make it back.',
        garrickPayoff: 'Garrick wipes the bar with his cloth: "She had her coat buttoned to the chin when she walked out that door."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 1-2 · “We hid them where their people lived”',
        playerLine: 'Fragment 1-2 says the Seekers hid the four stones where their people lived—and Meira’s page marks a child living right under the Widow’s Tooth.',
        garrickPayoff: 'Garrick glances at the page: "Old stones and village roofs. They’ve shared the same hill a long time."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Cheapest wine in the house and she still left a tab',
        playerLine: 'Two years of your cheapest wine, Garrick, and she still left her luggage on your table instead of settling up.',
        garrickPayoff: 'Garrick’s mouth twitches: "She paid her slate to the penny. The satchel she left for you."',
      },
    ],
    friendAttr: 'Intellect',
    friendRawPrompt: 'Ask {friend:Intellect} how the boy from two winters ago connects to the child in Fenmark on Meira’s page.',
    friendReply: 'Meira recorded two separate entries on the same leaf: a boy held near the Widow’s Tooth two winters back, and a second child born on the same dark-moon night living in Fenmark now.',
  },
  '1-3': {
    key: '1-3', week: 1, day: 3, shape: 'C', shapeLabel: SHAPE_LABELS.C,
    clueTag: 'A Small Carved Horse · The Widow’s Tooth',
    garrickObservation: 'Garrick turns the small carved wooden horse toward the firelight: “People tell a man with a cloth in his hand everything. They forget he’s got ears.”',
    openQuestion: 'The stone marking matches Meira’s rubbing, the dry shelf held a child’s wooden horse, and the lookout bolted toward Fenmark—what is still missing from the scene at the rock?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The child kept here is gone, and they’ve moved to Fenmark',
        playerLine: 'The shelf under the Widow’s Tooth was dry and empty—the boy who owned this wooden horse was taken long ago, and that runner is heading for the Fenmark child now.',
        garrickPayoff: 'Garrick sets the carved horse upright on the log: "Old wood, worn smooth by small thumbs. And fresh ruts heading for the village."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 1-3 · “Some locks already know their key”',
        playerLine: 'Fragment 1-3 says “Not every hand that tries will open it. Some locks already know their key.” That housing opened for our touch.',
        garrickPayoff: 'Garrick watches the coals: "A lock that waits for the right hand doesn’t need a watchman on the door."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Smelled of woodsmoke, lamp oil, and bad manners',
        playerLine: 'Next time we grab a lookout by the collar in the bracken, I’d like him to stay long enough to introduce himself.',
        garrickPayoff: 'Garrick pours the kettle: "Men who crouch in wet bracken rarely stay for tea."',
      },
    ],
    friendAttr: 'Aim',
    friendRawPrompt: 'Ask {friend:Aim} what the cart-ruts below the Widow’s Tooth tell us about their load.',
    friendReply: 'The left wheel cuts deeper into the turf than the right—whoever drove that cart toward Fenmark has a pulling left axle we’ll recognize again.',
  },
  '1-4': {
    key: '1-4', week: 1, day: 4, shape: 'D', shapeLabel: SHAPE_LABELS.D,
    clueTag: 'Nine-Year-Old Tamsin · Fenmark',
    garrickObservation: 'Garrick listens to the quiet lane of Fenmark beyond the fire: every shutter in the village was barred before your boots hit the street, yet a fourteen-year-old boy risked the elder’s anger to name Tamsin and the curved black-handled knife.',
    openQuestion: 'In a village too frightened to open its doors, who would tell the takers which house held a nine-year-old born under a dark moon?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · Nobody in Fenmark told them—they already had her birth-night',
        playerLine: 'The takers didn’t need an informant in Fenmark. Just like Meira’s notebook, they already knew the night Tamsin was born.',
        garrickPayoff: 'Garrick nods once at the fire: "Men who come straight to one door in the dark brought their own map."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 1-4 · “Born when the dark has eaten the moon”',
        playerLine: 'Fragment 1-4 from the Fenmark well names it plainly: “Born when the dark has eaten the moon, marked before the first cry’s through.”',
        garrickPayoff: 'Garrick looks at the well-stone rubbing: "The verse was cut in their own well-curb before a single house in Fenmark stood."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Only honest soul in Fenmark is fourteen years old',
        playerLine: 'The village elder brought out clubs, and a fourteen-year-old behind the grain store gave us the whole truth in two minutes.',
        garrickPayoff: 'Garrick remarks dryly: "Boys of fourteen haven’t learned how much trouble the truth costs yet."',
      },
    ],
    friendAttr: 'Charm',
    friendRawPrompt: 'Ask {friend:Charm} why the villagers barred their shutters instead of asking for help.',
    friendReply: 'They weren’t hiding guilt—they were terrified that speaking to strangers with weapons would cost them Tamsin’s life.',
  },
  '1-5': {
    key: '1-5', week: 1, day: 5, shape: 'E', shapeLabel: SHAPE_LABELS.E,
    clueTag: 'The Nephew’s Horse · Old Charcoal Camp',
    garrickObservation: 'Garrick sets the carved wooden horse beside the plain kitchen knife pulled from the shutter: “The power that gives is also the power that takes.”',
    openQuestion: 'Rank the three things we learned at the charcoal camp by what matters most for tomorrow: the runner’s kitchen knife, the nephew taken two winters ago, or the north track to the river.',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The two-winter cycle proves they’re collecting marked children',
        playerLine: 'The charcoal woman’s nephew two winters ago and Tamsin three nights ago—it’s the same man with the curved knife working a list down to the last name.',
        garrickPayoff: 'Garrick stares into the embers: "Two winters between them, and the same road north."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 1-5 · “The power that gives is also the power that takes”',
        playerLine: 'Fragment 1-5 at the charcoal kiln says “The power that gives is also the power that takes.” They think the stones are owed something back.',
        garrickPayoff: 'Garrick turns the tin cup in his fingers: "An old debt, written in stone."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Leaving a kitchen knife in the shutter is poor tradecraft',
        playerLine: 'For a band of shadowy child-takers, their runner from Fenmark fights with a borrowed kitchen knife and loses it in a wooden shutter.',
        garrickPayoff: 'Garrick eyes the blade: "The runner was local muscle hired to watch a shed. The man with the curved knife is further north."',
      },
    ],
    friendAttr: 'Agility',
    friendRawPrompt: 'Ask {friend:Agility} how much lead the runner’s boot-prints have on us heading north.',
    friendReply: 'His stride was winded when he tore free into the trees—if we press the Low Ford at first light, we’ll reach the river before they move Tamsin.',
  },
  '1-6': {
    key: '1-6', week: 1, day: 6, shape: 'A', shapeLabel: SHAPE_LABELS.A,
    clueTag: 'The Map & Extra Cup · The Low Ford',
    garrickObservation: 'Garrick pours an extra tin cup of tea and sets it by the stones at the edge of the firelight: “Family habit. We always pour one for whoever can’t be with us.”',
    openQuestion: 'Her small footprints walked unhurt to the waterline, a boat met her at the ford-stone, and all six fragments form a map ending at the mine across the river—why keep Tamsin unharmed?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · They need her alive at the mine across the ford',
        playerLine: 'Garrick, she walked to the boat unhurt because they need a living marked child inside that old river mine tomorrow night.',
        garrickPayoff: 'Garrick nods toward the dark water: "You don’t carry a key gently unless you still have a door to open."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 1-6 · “The key that locks is also the key that unlocks”',
        playerLine: 'Fragment 1-6 completes the week’s map: “The key that locks is also the key that unlocks.” The Seekers sealed the mine with the same bloodline.',
        garrickPayoff: 'Garrick looks at the six joined fragments: "Six pieces, one map, and the mark from Meira’s rubbing waiting on the far bank."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Pouring tea for ghosts on a wet riverbank',
        playerLine: 'An extra cup for whoever can’t be with us, Garrick? Out here by the ford, I’d rather not invite anyone else to camp.',
        garrickPayoff: 'Garrick leaves the tin cup where it sits: "Old habits don’t ask where you’ve pitched the tent."',
      },
    ],
    friendAttr: 'Might',
    friendRawPrompt: 'Ask {friend:Might} what it will take to cross the ford and breach the mine tomorrow night.',
    friendReply: 'The river current is high and the mine mouth is half-drowned, but with all six fragments locked into our map, we hit the guard before they expect us.',
  },

  // WEEK 2
  '2-1': {
    key: '2-1', week: 2, day: 1, shape: 'B', shapeLabel: SHAPE_LABELS.B,
    clueTag: 'Three More Names · The Mill Road',
    garrickObservation: 'In the farmer’s barn on the mill road, Garrick sets out the tin cups—one more than your count—and shakes the rain from his cloak: “Worst guests I’ve ever had. Good tippers, though.”',
    openQuestion: 'Tamsin is safe, three more children’s names came off the mine wall, and a lamp-less cart with a dragging wheel went up to the mill three nights ago—what changed between the mine and the mill?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The horseman from the mine rode ahead to speed up the second taking',
        playerLine: 'Garrick, the cart went up to the mill three nights ago—they were already moving on Corin while we were still tracking Tamsin.',
        garrickPayoff: 'Garrick’s eyes stay on the lantern: "Two crews, or one cart working a schedule older than our week."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 2-1 · “We held his last wall the night it was meant to fall”',
        playerLine: 'Fragment 2-1 from the farmhouse beam sounds like a siege: “We held his last wall the night it was meant to fall.”',
        garrickPayoff: 'Garrick listens to the rain on the barn roof: "Soldiers writing on the inside of the timber before the end."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Still setting out that extra tin cup in a leaky barn',
        playerLine: 'Even in a farmer’s barn on the mill road, Garrick, you still set out that extra tin cup.',
        garrickPayoff: 'Garrick doesn’t move the cup: "Told you at the ford. Family habit."',
      },
    ],
    friendAttr: 'Charm',
    friendRawPrompt: 'Ask {friend:Charm} how the farmer with the axe reacted once we mentioned the miller’s boy.',
    friendReply: 'Once he saw we weren’t part of the night-cart crew, his anger turned to fear for his neighbours—nobody on this road sleeps easy when a cart moves without lamps.',
  },
  '2-2': {
    key: '2-2', week: 2, day: 2, shape: 'C', shapeLabel: SHAPE_LABELS.C,
    clueTag: 'Horn Button & Mill Footing · The Mill',
    garrickObservation: 'Garrick looks from the horn button torn from the taker’s sleeve to the carving under the mill-wheel footing that matches Meira’s rubbing.',
    openQuestion: 'The taker knew Corin’s name, knew the exact night the boy was born, and took him from a mill built right over a Seeker mark—what link ties the family’s house to the stone beneath it?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The children were born near the stones because their families stayed there',
        playerLine: 'Garrick, the mark was cut into the mill’s stone footing long before Corin was born—the marked families have lived beside these stones for generations.',
        garrickPayoff: 'Garrick nods slowly: "A mill stays where the water runs, and a family stays where the mill is."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 2-2 · “Their campfires filled the plain from our wall to the hills”',
        playerLine: 'Fragment 2-2 under the mill wheel describes an army surrounding the old king’s wall for nights on end.',
        garrickPayoff: 'Garrick turns the horn button in the light: "Too many fires to count by the third night. And only one wall left."',
      },
      {
        kind: 'WRY',
        label: 'Wry · One pulling wheel and one missing coat button',
        playerLine: 'Between a dragging left wheel and a missing horn button, our kidnappers badly need a wheelwright and a tailor.',
        garrickPayoff: 'Garrick remarks dryly: "A man in a hurry rarely stops to mend his cuff."',
      },
    ],
    friendAttr: 'Intellect',
    friendRawPrompt: 'Ask {friend:Intellect} how the dragging left cart-wheel connects the Mill to the Low Ford.',
    friendReply: 'It’s the exact same lopsided left wheel-track we saw below the Widow’s Tooth and on the bank above the Low Ford—one cart working both roads.',
  },
  '2-3': {
    key: '2-3', week: 2, day: 3, shape: 'D', shapeLabel: SHAPE_LABELS.D,
    clueTag: 'The Dead Lockpick · Upriver',
    garrickObservation: 'Garrick studies the news from the hidden path upriver: a stranger lying dead a week beside a chained dog, his iron pick snapped inside a Seeker housing that opened at your bare touch.',
    openQuestion: 'If the takers already hold Corin in the hill above, who was the dead man with the lockpick—and why did the stone refuse him and answer you?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The takers tried to pick the Seeker locks themselves and failed',
        playerLine: 'Garrick, that dead man was one of theirs—they tried to force the Seeker housing with iron a week ago, failed, and realized they needed Seeker blood.',
        garrickPayoff: 'Garrick looks at your unharmed hands: "Iron broke in the keyhole. Your fingers didn’t."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 2-3 · “Four stones they brought to break his gate”',
        playerLine: 'Fragment 2-3 says “Four stones they brought to break his gate: the wind, the fire, the water, the earth.” The four stones were weapons brought against the king.',
        garrickPayoff: 'Garrick repeats softly: "Wind, fire, water, earth. Four stones brought to one gate."',
      },
      {
        kind: 'WRY',
        label: 'Wry · At least the dog was honest about its job',
        playerLine: 'After a week of tight-lipped villagers and hooded riders, a chained guard-dog is the most straightforward soul we’ve met.',
        garrickPayoff: 'Garrick hands over the stew bowl: "A dog on a chain never pretends it’s happy to see you."',
      },
    ],
    friendAttr: 'Craft',
    friendRawPrompt: 'Ask {friend:Craft} why the stranger’s lockpick jammed inside the Seeker housing.',
    friendReply: 'There are no tumblers inside that stone—the bronze seam only parts for living blood of the mark, so his iron pick wedged solid the moment he twisted it.',
  },
  '2-4': {
    key: '2-4', week: 2, day: 4, shape: 'E', shapeLabel: SHAPE_LABELS.E,
    clueTag: 'Ring of Lamps · Shaft in the Hillside',
    garrickObservation: 'Garrick keeps his voice low over the shielded coals: “That went about as well as it looked.” Below the shaft, Corin sits in a ring of lamps with his hands uncut while picks echo deeper in the rock.',
    openQuestion: 'Rank our three urgencies on this hillside tonight: the hooded watchers who saw us at the shaft, Corin waiting uncut in the lamp-ring, or the picks digging deeper under the hill.',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · They haven’t cut Corin’s hands because they haven’t reached the stone yet',
        playerLine: 'Garrick, they’re keeping Corin whole in that ring of lamps because their picks haven’t broken through to the deeper Seeker chamber yet.',
        garrickPayoff: 'Garrick glances toward the dark shaft: "No sense turning a key before you’ve dug out the door."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 2-4 · “When he came back up, his hand was bleeding”',
        playerLine: 'Fragment 2-4 from the shaft roots says the king went down alone when the moon went out and came back up with his hand bleeding.',
        garrickPayoff: 'Garrick’s own hand rests flat on his knee: "He went down alone into the oldest rooms of the house, and told his people to sleep."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Next time someone else goes halfway down the ladder',
        playerLine: 'Hanging halfway down a wet ladder while hooded strangers stare up at your boots is a view I don’t need twice.',
        garrickPayoff: 'Garrick nods once: "And now they’ve taken the ladder. Saves you the temptation."',
      },
    ],
    friendAttr: 'Agility',
    friendRawPrompt: 'Ask {friend:Agility} whether there is a second way into the hill now that the ladder is gone.',
    friendReply: 'The air draught coming up through the bracken means there’s a second, older shaft mouth higher on the slope if we sweep the hill before dawn.',
  },
  '2-5': {
    key: '2-5', week: 2, day: 5, shape: 'A', shapeLabel: SHAPE_LABELS.A,
    clueTag: 'The Black Circle · Hillside by Night',
    garrickObservation: 'Garrick holds the small black cloth circle torn from the lookout’s coat beside Meira’s open notebook page, where every chronicle has the old king’s name scraped out.',
    openQuestion: 'They wear a black circle on their coats, signal with shuttered lamps, and serve a king whose name was chiselled out of every history—who scraped his name away: his enemies, or his own followers?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The Seekers erased his name so no one could wake him',
        playerLine: 'Garrick, the Seekers who overthrew him scraped his name off every monument so future generations wouldn’t know who slept beneath the stones.',
        garrickPayoff: 'Garrick looks at the black cloth circle: "You take a man’s name off the stone when you want the world to forget he ever sat there."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 2-5 · “We took his name from every stone and every tongue”',
        playerLine: 'Fragment 2-5 answers Meira’s question directly: “We took his name from every stone and every tongue. Let the dark keep what the dark was given.”',
        garrickPayoff: 'Garrick traces the torn cloth edge: "From every stone. Yet someone on this hill still remembers."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Matching horn-button cuff—we found the mill visitor',
        playerLine: 'That lookout on the hill was missing the exact horn button the miller’s wife tore off his sleeve four nights ago.',
        garrickPayoff: 'Garrick allows a thin smile: "Now you’ve got the button and the badge. Only missing the coat."',
      },
    ],
    friendAttr: 'Aim',
    friendRawPrompt: 'Ask {friend:Aim} what the lookout’s two shuttered lamp-flashes signaled to the chamber below.',
    friendReply: 'Two short flashes straight down the shaft—that wasn’t a call for reinforcements, it was a warning to hurry the digging before tomorrow night.',
  },
  '2-6': {
    key: '2-6', week: 2, day: 6, shape: 'B', shapeLabel: SHAPE_LABELS.B,
    clueTag: 'The Second Shaft Map · Lip of the Shaft',
    garrickObservation: 'By a shielded chink of light at the lip of the shaft, Garrick watches you trace the six joined fragments in silence while picks ring out below where the loose stone clattered down.',
    openQuestion: 'Between the lamp-lit chamber where Corin sits, the deeper empty room underneath it, and the old Seeker shaft we just uncovered—which one is the real prize the hooded watchers came for?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The deeper room holds the second Stone, and they’re digging down to it',
        playerLine: 'Garrick, the upper chamber is just a staging room—the Stone is sealed in the older hollow underneath, and our old shaft drops straight into it.',
        garrickPayoff: 'Garrick folds the cloak over the lantern chink: "They’re coming through the ceiling with picks. You have the stair."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 2-6 · “Four to hold the four corners of his sleep”',
        playerLine: 'Fragment 2-6 completes the map: “Four we carried into the hills, four to hold the four corners of his sleep.” Each Stone anchors a quarter of his prison!',
        garrickPayoff: 'Garrick looks down into the dark hill: "Four corners in the hills. And you’re standing over the second."',
      },
      {
        kind: 'WRY',
        label: 'Wry · At least we didn’t shout the map aloud this week',
        playerLine: 'We traced the map in complete silence tonight—pity the hillside decided to drop a rock down the shaft for us anyway.',
        garrickPayoff: 'Garrick murmurs dryly: "Old hills have loose teeth. Best be down the stair before they finish counting."',
      },
    ],
    friendAttr: 'Might',
    friendRawPrompt: 'Ask {friend:Might} what we felt when we pressed an ear to the rock above the lower hollow.',
    friendReply: 'Below the lamp-room there’s a much larger vault—and the stone floor hums with a slow, heavy vibration every few minutes.',
  },

  // WEEK 3 ("Order" is now unlocked at W3·D1+)
  '3-1': {
    key: '3-1', week: 3, day: 1, shape: 'C', shapeLabel: SHAPE_LABELS.C,
    clueTag: '“Somewhere Warm” · Ashcombe Trail',
    garrickObservation: 'With Corin safe at his mother’s hearth and the Order’s ledger in hand, Garrick points west: “Ashcombe’s a shepherds’ village on the edge of the burned country. A long day west. And above it she’s marked a place. The Blackglass.”',
    openQuestion: 'Corin heard the Order tell the girl Wren they were taking her "somewhere warm"—and Ashcombe is her own home village. Why would kidnappers carry a stolen child back to where she was born?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · Because the third Stone is up on the Blackglass above her village',
        playerLine: 'Garrick, they took Wren under the mill hill first, realized each child only opens the stone beside their birthplace, and had to bring her back to the Blackglass.',
        garrickPayoff: 'Garrick taps Meira’s map: "A key only fits its own lock. And her lock is up on the black ridge."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 3-1 · “The third was fire, and burned the hills to glass”',
        playerLine: 'Fragment 3-1 explains the burned country: “The third was fire, and burned the hills to glass before we took it from his hand.”',
        garrickPayoff: 'Garrick gazes west toward the dark skyline: "Nothing’s grown on that ridge since the night they pried it out of his grip."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Corin told his mother all four of our names—so much for travelling quiet',
        playerLine: 'Corin gave his mother every one of our names before breakfast. Half the valley knows who we are now.',
        garrickPayoff: 'Garrick’s eyes crinkle: "The miller’s wife will feed you free for life. The Order already knew your names."',
      },
    ],
    friendAttr: 'Agility',
    friendRawPrompt: 'Ask {friend:Agility} about the Order straggler we caught climbing out of the shaft mouth at dawn.',
    friendReply: 'He came up after the collapse looking for the dropped ledger—and limped off west along the exact same ridge-track toward Ashcombe.',
  },
  '3-2': {
    key: '3-2', week: 3, day: 2, shape: 'D', shapeLabel: SHAPE_LABELS.D,
    clueTag: 'A Chip of Black Glass · Ashcombe',
    garrickObservation: 'Garrick looks from Wren’s windowsill of volcanic glass chips toward the high black road: “My family’s been in these hills longer than the roads have.”',
    openQuestion: 'Two polite men in grey coats told Wren’s mother they would "only need her the once" and rode straight through Ashcombe toward the Blackglass—who speaks politely to a mother while taking her child for a single use?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · Fanatics who believe they are fulfilling a sacred duty, not a crime',
        playerLine: 'Garrick, common brigands threaten or bargain. Men who promise they’ll "only need her the once" believe their doctrine justifies everything—and they truly intend to let her go once the Stone wakes.',
        garrickPayoff: 'Garrick looks into his tin cup: "Every child you’ve reached so far has had all ten fingers. They take what the lock asks for, and no more."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 3-2 · “A drop upon the stone, and what was cold remembers”',
        playerLine: 'Fragment 3-2 from the sheepfold wall tells us what "only the once" means: “A drop upon the stone, and what was cold remembers.” One drop of blood.',
        garrickPayoff: 'Garrick’s voice is even: "One nick of the palm. Then the stone remembers, and the child goes home."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Your family picked bleak country to outlast the roads in, Garrick',
        playerLine: 'If your family’s been in these hills longer than the roads have, Garrick, they had a strong stomach for sheep wind and black rock.',
        garrickPayoff: 'Garrick shrugs his grey cloak higher: "The rock doesn’t wash away in the rain. You get used to the wind."',
      },
    ],
    friendAttr: 'Charm',
    friendRawPrompt: 'Ask {friend:Charm} what else Wren’s mother noticed about the two men in grey coats.',
    friendReply: 'She said neither man raised his voice or lied to her—when she asked if Wren would be hurt, they stayed silent rather than make a false promise.',
  },
  '3-3': {
    key: '3-3', week: 3, day: 3, shape: 'E', shapeLabel: SHAPE_LABELS.E,
    clueTag: 'Hoof-Scratches on Glass · The Blackglass',
    garrickObservation: 'Garrick finishes stitching the split seam of a boot by the firelight and rubs his knee: “My knees have opinions about this glass. None of them good.”',
    openQuestion: 'Rank the three anomalies on the Blackglass today: six horses riding straight past Meira’s marked stone without stopping, the third mark matching the third child, or Fragment 3-3 counting five stones where Meira’s notes count four.',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The Fire Stone isn’t on the open glass anymore—it’s deeper in the ridges',
        playerLine: 'Garrick, six horses rode straight past Meira’s mark without dismounting because the Fire Stone was moved from this open shelf into the volcanic ridges ahead.',
        garrickPayoff: 'Garrick knots the waxed thread: "Six horses at a trot don’t stop for an empty socket."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 3-3 · “Five, the fragment says” vs Meira’s four',
        playerLine: 'Look at Fragment 3-3: “Four we hid, and one we kept where we could watch it.” Meira’s margin note says every history counts four—so where is the fifth?',
        garrickPayoff: 'Garrick sets the awl down: "Histories are written by whoever’s left standing. The people who cut that glass were counting with their own hands."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Innkeeper, guide, and cobbler—what’s the rate for boot-stitching?',
        playerLine: 'First you pour the tea, now you’re stitching split boots on volcanic glass. Are you adding cobbling to our inn tab?',
        garrickPayoff: 'Garrick tosses the mended boot back: "A limping guest slows the whole road down. Consider it self-interest."',
      },
    ],
    friendAttr: 'Aim',
    friendRawPrompt: 'Ask {friend:Aim} what the hoof-scratches on the glass revealed about the six riders.',
    friendReply: 'Five horses had deep iron-shod strikes, and the sixth carried double—the second rider weighed almost nothing. Wren is right ahead of us.',
  },
  '3-4': {
    key: '3-4', week: 3, day: 4, shape: 'A', shapeLabel: SHAPE_LABELS.A,
    clueTag: 'Three of Wren’s Chips · The Black Ridges',
    garrickObservation: 'Inside the ancient Seeker sleeping shelter on the black ridge, Garrick turns the smooth bone die from the wall-niche beside the three black-glass chips Wren dropped along the trail.',
    openQuestion: 'The Seekers built sleeping rooms into this barren ridge to watch the valley for generations, and Wren is dropping her windowsill glass chips behind the horses—what kept the Seekers on watch up here after the war was won?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The Seekers weren’t celebrating a victory—they were guarding a prison',
        playerLine: 'Garrick, nobody sleeps in a freezing volcanic ridge-niche with a bone die for years if the enemy is dead. The Seekers were watching to make sure the stones stayed sealed.',
        garrickPayoff: 'Garrick rolls the worn bone die once in his palm: "You don’t post a watch over a grave unless you think the tenant might get up."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 3-4 · “We built our rooms in the cold rock above them”',
        playerLine: 'Fragment 3-4 inside the doorway says: “We built our rooms in the cold rock above them, and took turns at the window until our hair went grey.”',
        garrickPayoff: 'Garrick glances at the narrow slit facing the valley: "Long nights, cold stone, and one window."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Eight-year-old Wren is outsmarting six armed riders',
        playerLine: 'Six grown men of the Order on horseback, and an Ashcombe shepherd girl is breadcrumbing their whole secret trail with window-sill glass.',
        garrickPayoff: 'Garrick’s voice warms a fraction: "Never bet against a shepherd’s child on her own ridge."',
      },
    ],
    friendAttr: 'Craft',
    friendRawPrompt: 'Ask {friend:Craft} how the buried Seeker doorway held up under centuries of rockfall.',
    friendReply: 'They keyed the lintel blocks without mortar so the mountain’s weight locks them tighter—built by masons who meant the watch-post to outlive their grandchildren.',
  },
  '3-5': {
    key: '3-5', week: 3, day: 5, shape: 'B', shapeLabel: SHAPE_LABELS.B,
    clueTag: '“Until the Throne Rise Whole” · Shepherd’s Hut',
    garrickObservation: 'Garrick eyes the catching pot on the hearth, the dropped tin cup, and the carving on the smoke-blackened beam over the pallet: “They’re always a step ahead of us.”',
    openQuestion: 'Wren scratched her name low on the doorframe, the pot on the fire was still hot, and over the bed is carved an old line ("Until the throne rise whole")—which detail in this hut was left for us, and which was left by generations of the Order?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · This shepherd’s hut is an old Order safe-house on the Kiln road',
        playerLine: 'Garrick, “Until the throne rise whole” is dark with years of smoke—the Order has used this hut as a way-station to the Kiln for generations, and Wren scratched her name to tell us she was just here.',
        garrickPayoff: 'Garrick looks up at the blackened beam: "Smoke takes fifty winters to darken a cut that deep. They didn’t carve it tonight."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 3-5 · “When the four have answered, the fifth will know its hour”',
        playerLine: 'Fragment 3-5 on the hearthstone warns: “When the four have answered, the fifth will know its hour.” Every Stone the Order wakes brings the fifth closer!',
        garrickPayoff: 'Garrick’s hand rests near the extra tin cup: "Four to answer first. Then the fifth."',
      },
      {
        kind: 'WRY',
        label: 'Wry · They left a hot pot of stew and didn’t even offer us bowls',
        playerLine: 'Leaving within the hour with the pot still catching on the fire is rude—even for men in grey coats.',
        garrickPayoff: 'Garrick lifts the pot off the coals: "Burnt at the bottom. I’d not serve it in my house."',
      },
    ],
    friendAttr: 'Might',
    friendRawPrompt: 'Ask {friend:Might} how fast the riders fled once we came down Wren’s goat-track.',
    friendReply: 'One blanket was folded and the second thrown flat on the floorboards—their ridge lookout barely gave them three minutes’ warning before we hit the door.',
  },
  '3-6': {
    key: '3-6', week: 3, day: 6, shape: 'C', shapeLabel: SHAPE_LABELS.C,
    clueTag: 'The Map & Eight Chips · The Cairn',
    garrickObservation: 'At the high cairn looking down at the round black hill breathing warm air through its cracked crown, Garrick pulls his cloak tight: “The Kiln. That’s the shepherds’ name for it.”',
    openQuestion: 'A lamp just went in through the Kiln’s crown ahead of you, a watcher on the lower ridge saw you turn toward it, and the third Stone is already waking—what is the Order planning to do with the Stone once Wren’s blood wakes it?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · They aren’t leaving the Stones in the hills—they’re carrying them away',
        playerLine: 'Garrick, the mine socket was empty and the mill chamber was breached—once Wren’s blood wakes the Fire Stone tonight, a courier team is going to carry it out of the Kiln.',
        garrickPayoff: 'Garrick watches the warm haze rising from the Kiln’s crown: "A stone that stays in the hill can’t join the others."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 3-6 · “Under the hill that breathes, we laid the fire to rest”',
        playerLine: 'Fragment 3-6 completes the Kiln map: “Under the hill that breathes, we laid the fire to rest.” The Seekers used the volcanic vent to hide the Fire Stone’s heat.',
        garrickPayoff: 'Garrick nods down the slope: "Six fragments, eight chips of black glass, and one crack in the crown."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Passing the map in silence and still getting spotted on the ridge',
        playerLine: 'We didn’t whisper a single word on the cairn tonight, and a lookout on the lower ridge still watched every head turn toward the Kiln.',
        garrickPayoff: 'Garrick’s mouth curves slightly: "Four silhouettes on a skyline point as loud as a shout."',
      },
    ],
    friendAttr: 'Intellect',
    friendRawPrompt: 'Ask {friend:Intellect} what the warm air rising from the Kiln’s crown means for our descent.',
    friendReply: 'The Fire Stone inside the vent is already answering—we have to go down through the crown now before they finish the blood-touch and seal the passage.',
  },

  // WEEK 4
  '4-1': {
    key: '4-1', week: 4, day: 1, shape: 'D', shapeLabel: SHAPE_LABELS.D,
    clueTag: 'Cut Ropes in the Dark · Under the Kiln',
    garrickObservation: 'Garrick looks slowly around the circle of faces as Ashcombe’s roofs come into view: “Every time they’ve had knives out at you, not one of you has died.”',
    openQuestion: 'While all eyes were up on the scree lifting Wren down, someone stood within arm’s reach in the dark with a bare blade, parted the prisoner’s ropes clean, and touched none of you—who in that dark had both a knife and a reason to keep you alive?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The Order is sparing us because our hands open the Seeker locks',
        playerLine: 'Garrick, their own lockpick died upriver—the Order has orders not to kill us because we’re the only ones whose blood opens the Seeker housings along the trail.',
        garrickPayoff: 'Garrick meets your eyes across the fire: "A hunter doesn’t shoot the hound that’s leading him to the door."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 4-1 · “The fourth was water, and we sank it with the town”',
        playerLine: 'Fragment 4-1 from the Kiln passage says: “The fourth was water, and we sank it with the town.” The Seekers flooded whole streets to hide the Water Stone.',
        garrickPayoff: 'Garrick looks north toward the lake road: "Reedham sits on the shore of a very deep lake."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Next prisoner we take gets tied with Arjun’s iron chain, not rope',
        playerLine: 'Hemp rope clearly doesn’t hold in the dark around this party. Next captive we take gets locked in Arjun’s iron.',
        garrickPayoff: 'Garrick remarks dryly: "He walked out at the pace of a man leaving a church. Didn’t even run."',
      },
    ],
    friendAttr: 'Aim',
    friendRawPrompt: 'Ask {friend:Aim} what the prisoner’s footprints in the volcanic ash showed before they hit bare glass.',
    friendReply: 'Heel, then toe, evenly spaced—his ropes were parted while we were lifting Wren down the scree, and whoever cut him loose came across the bare black glass without leaving a print.',
  },
  '4-2': {
    key: '4-2', week: 4, day: 2, shape: 'E', shapeLabel: SHAPE_LABELS.E,
    clueTag: 'Scraped Coin & Bread-Crock Box · North Road',
    garrickObservation: 'Garrick sets a pot of road-herb tea on the stones and flips the carter’s defaced silver coin into the light: “It’s terrible. Drink it anyway.”',
    openQuestion: 'Rank what gives away the Order’s true plan on the north road today: four swordsmen guarding one small box "no bigger than a bread crock," riding north away from Reedham lake, or paying with a coin whose king’s face was scraped off and reverse polished bright.',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The small box holds the Fire Stone—and it’s going north to their capital',
        playerLine: 'Garrick, four armed men riding north away from the lake with a bread-crock box aren’t chasing Joss—they’re escorting the woken Fire Stone to wherever the Stones are being gathered.',
        garrickPayoff: 'Garrick catches the scraped coin in his palm: "Four swords for one small box. And the road north goes a long way past the lake."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 4-2 · “No coin shall bear his face, no stone his name”',
        playerLine: 'Fragment 4-2 at the milestone decrees: “No coin shall bear his face, no stone his name.” And the Order scraped the new king’s face off to polish the blank side like a dark moon!',
        garrickPayoff: 'Garrick turns the polished reverse to the fire: "Scrape one king off, polish a black mirror on the back."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Even your terrible road-tea beats listening to that carter’s brother-in-law',
        playerLine: 'After hearing the carter’s thoughts on his brother-in-law at the ford, Garrick, your road-tea is the second worst thing today.',
        garrickPayoff: 'Garrick pours another splash: "Drink it while it’s hot. Tastes worse when it cools."',
      },
    ],
    friendAttr: 'Charm',
    friendRawPrompt: 'Ask {friend:Charm} how the carter described the four men guarding the bread-crock box.',
    friendReply: 'He said they rode in two pairs around the pack-horse and never let the carter within ten paces of the box—and paid him double just to keep moving north.',
  },
  '4-3': {
    key: '4-3', week: 4, day: 3, shape: 'A', shapeLabel: SHAPE_LABELS.A,
    clueTag: 'Eight Notches & Her Skiff · Reedham',
    garrickObservation: 'Garrick wrings lake water from the hem of his grey cloak beside the mended skiff: “I didn’t leave a warm bar to drown in a lake. I’d like that noted.”',
    openQuestion: 'Joss’s grandmother has cut eight notches on her doorpost—meaning Joss was taken eight nights ago, while we were still on the Blackglass—yet he is still being held nearby. Why hold the fourth child for over a week instead of waking the Stone and leaving?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · They took Joss early and are waiting for the dark-moon night or our arrival',
        playerLine: 'Garrick, eight notches means they took Joss before we even reached the Kiln—they’re holding him out on the lake until the exact night the fourth Stone can be reached.',
        garrickPayoff: 'Garrick looks out across the black water toward the drowned roofs: "Eight nights of feeding a boy in the wet. They’re waiting on a clock."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 4-3 · “When the water rose over the bell-tower’s knee”',
        playerLine: 'Fragment 4-3 on the drowned tower says: “When the water rose over the bell-tower’s knee, we locked the door below and rowed away.” The chamber is under the flooded church!',
        garrickPayoff: 'Garrick glances at the tower sticking out of the lake: "Locked the door below and rowed away. And left the bell-tower to mark it."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Duly noted in the party record: Garrick hates boats',
        playerLine: 'Mei, write it down in the official Seeker margin: the innkeeper of the Hollow Wake Inn objects to lake water.',
        garrickPayoff: 'Garrick’s voice is bone-dry: "A cellar should have barrels in it, not pike."',
      },
    ],
    friendAttr: 'Craft',
    friendRawPrompt: 'Ask {friend:Craft} what Joss’s unfinished wooden boat on his grandmother’s shelf tells us.',
    friendReply: 'The hull was carved with a sharp pocket-whittler and the mast wasn’t stepped yet—he was taken right in the middle of carving it, and took his pocket-knife with him.',
  },
  '4-4': {
    key: '4-4', week: 4, day: 4, shape: 'B', shapeLabel: SHAPE_LABELS.B,
    clueTag: '“Moon-Blood” Gloss · Old Reedham',
    garrickObservation: 'By the shielded fire on the shore facing Old Reedham, Garrick looks at Meira’s margin note glossing *"moon-blood — the old songs’ word for the marked"* while the grandmother’s window-lamp burns across the water.',
    openQuestion: 'In drowned Old Reedham tonight we found grey-coated ferrymen running supplies to the reed island, Joss’s shoe-prints pausing where he could see his grandmother’s lamp, and Meira’s note on "moon-blood"—which piece is Meira’s scholarly mistake?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · Wait—what if “moon-blood” isn’t the Seeker children at all?',
        playerLine: 'Garrick, Meira assumed “moon-blood” meant the marked children—but look at how careful the verses are. What if the old songs used “moon-blood” for a specific house, not just anyone born on a dark moon?',
        garrickPayoff: 'Garrick’s face is unreadable in the firelight: "Scholars write down what they think a word means. Songs remember who wore it."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 4-4 · “Only moon-blood wakes what sleeps”',
        playerLine: 'Fragment 4-4 in the drowned lane says: “Our blood will open the outer doors. Only moon-blood wakes what sleeps.” That’s two different bloodlines in the same sentence!',
        garrickPayoff: 'Garrick repeats the line without inflection: "Our blood opens the outer doors. Only moon-blood wakes what sleeps."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Even ten-year-old Joss stopped to check the lamp in the window',
        playerLine: 'Digging both heels into the cobbles just to look back at his grandmother’s window-lamp—that boy has more grit than his guards.',
        garrickPayoff: 'Garrick looks toward the distant shore-lamp: "A lamp in a window carries a long way over dark water."',
      },
    ],
    friendAttr: 'Agility',
    friendRawPrompt: 'Ask {friend:Agility} what route the Order’s night ferrymen took from the lowest lane.',
    friendReply: 'They pushed off from the deep-water steps and poled straight for the reed island a mile out—the only blind landing on the lake.',
  },
  '4-5': {
    key: '4-5', week: 4, day: 5, shape: 'C', shapeLabel: SHAPE_LABELS.C,
    clueTag: 'Fresh Wood-Shavings · The Reed Island',
    garrickObservation: 'Inside the captured Order ferry boat pulled up in the willow reeds, Garrick picks up one of the fresh pale curls of whittled wood lying beside a tiny split boat hull.',
    openQuestion: 'We have their ferry boat, fresh wood-shavings proving Joss is alive and still whittling, and a watch-lamp burning in the empty bell-tower across the water—why keep a watch-lamp lit in an empty tower after moving the boy?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The tower isn’t empty—it’s the dry stair down to the flooded vault below',
        playerLine: 'Garrick, they moved Joss from the reed island into the flooded chamber under the drowned church, and the lamp in the tower marks the stairhead for their night boat.',
        garrickPayoff: 'Garrick sets the wood-shaving back on the thwart: "And now you’re sitting in their night boat."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 4-5 · “A lock that bars the wicked out is also a door that lets them in”',
        playerLine: 'Fragment 4-5 on the reed-island willow post confesses: “A lock that bars the wicked out is also a door that lets them in.” The Seekers regretted leaving any way back.',
        garrickPayoff: 'Garrick’s voice is quiet: "Build a door, and sooner or later someone comes knocking with the right hand."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Upgrading from a leaky skiff to an official Order ferry',
        playerLine: 'Cheer up, Garrick—we traded the grandmother’s leaking skiff for the Order’s own dry ferry boat.',
        garrickPayoff: 'Garrick taps the gunwale with his knuckle: "Still a boat. Still a lake. Marginally fewer leaks."',
      },
    ],
    friendAttr: 'Aim',
    friendRawPrompt: 'Ask {friend:Aim} how we steer their boat into the drowned tower tonight without tipping off the watch.',
    friendReply: 'If we come in along the shadow of the sunken roofs with muffled oars, the watch in the bell-tower will think we’re their own relief boat.',
  },
  '4-6': {
    key: '4-6', week: 4, day: 6, shape: 'D', shapeLabel: SHAPE_LABELS.D,
    clueTag: 'Wood Knocking on Wood · The Tower at Night',
    garrickObservation: 'At the top of the wind-lashed bell-tower after the gust blew the lamp out and wood knocked on wood in the black water directly underneath, Garrick looks down the dark stair.',
    openQuestion: 'Mei called the joined map out over the storm wind, and a hidden boat directly under the tower arch heard every word and knocked against the piling—who is racing us down the drowned church stair right now?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The Order’s boat crew waited under the arch for us to read the map',
        playerLine: 'Garrick, they didn’t know which flooded room under Old Reedham held the fourth Stone until Mei read our six joined fragments over the wind!',
        garrickPayoff: 'Garrick’s hand is already on the stair rail: "Then we’d best not keep them waiting at the bottom."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 4-6 · “Down the stair of the drowned church, to a room below the streets”',
        playerLine: 'Fragment 4-6 finishes the fourth map: “Under Old Reedham. Down the stair of the drowned church, to a room below the streets.”',
        garrickPayoff: 'Garrick nods down into the dark: "The stair goes down dry until the last turn. After that, keep your blades above the water."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Storm wind, black water, and eavesdroppers under the floor',
        playerLine: 'Next time we assemble a secret Seeker map at night, I vote we check under the floorboards for boats first.',
        garrickPayoff: 'Garrick remarks dryly: "Hard to check the cellar when the cellar is a lake."',
      },
    ],
    friendAttr: 'Intellect',
    friendRawPrompt: 'Ask {friend:Intellect} whether all four children are accounted for once we pull Joss out.',
    friendReply: 'Tamsin, Corin, Wren, and tonight Joss—all four children from the mine wall will be home, which leaves only the unrecorded fifth Stone.',
  },

  // WEEK 5 ("Dark Moon Order" & "Highwall" unlocked)
  '5-1': {
    key: '5-1', week: 5, day: 1, shape: 'E', shapeLabel: SHAPE_LABELS.E,
    clueTag: 'HIGHWALL on the Waystone · Reedham Road',
    garrickObservation: 'With Joss safe on shore and the rubbing of the ancient milestone in your hands showing *HIGHWALL* above a chiselled-out second line, Garrick speaks quietly by the fire: “The fifth wasn’t hidden in the hills like the others. Every telling I know ends at Highwall.”',
    openQuestion: 'Rank the three truths on the table tonight: all four children are safe at home, the four hill Stones were taken by the Dark Moon Order despite our rescues, and the fifth Stone waits in the dead capital of Highwall.',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · We saved the children, but the Order still got all four hill Stones',
        playerLine: 'Garrick, every child is alive and home—which means we did what Meira’s list asked—but the Dark Moon Order still walked away with the four hill Stones heading for Highwall.',
        garrickPayoff: 'Garrick looks at the milestone rubbing: "Four children home. Four stones on the north road. And one city at the end of it."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 5-1 · “The fifth we did not carry to the hills”',
        playerLine: 'Fragment 5-1 on the waystone confirms it: “The fifth we did not carry to the hills. It stayed where the crown fell.”',
        garrickPayoff: 'Garrick nods once: "Two days north along the old kingdom’s road."',
      },
      {
        kind: 'WRY',
        label: 'Wry · A dead capital where nothing grows sounds like a terrible inn location',
        playerLine: 'A city where nothing grows and nobody goes, Garrick—don’t tell me you’re scouting a second branch of the Hollow Wake Inn.',
        garrickPayoff: 'Garrick’s mouth twitches: "Terrible foot traffic. Worse cellar."',
      },
    ],
    friendAttr: 'Craft',
    friendRawPrompt: 'Ask {friend:Craft} how the second line on the milestone was removed.',
    friendReply: 'It wasn’t weather—someone sat by the road with a narrow mason’s chisel and took the king’s name out stroke by stroke while leaving HIGHWALL above it.',
  },
  '5-2': {
    key: '5-2', week: 5, day: 2, shape: 'A', shapeLabel: SHAPE_LABELS.A,
    clueTag: 'The Heartbeat in the Graves · Old Kingdom’s Road',
    garrickObservation: 'By the refugee family’s cart beside the rows of ancient war-mounds, Garrick watches the grass blades settle after the low, slow thud from the north stops.',
    openQuestion: 'Every dusk a pulse like a slow heartbeat rolls out from Highwall, turning farm dogs feral and shivering the grass on hundreds of war graves—why is the pulse growing stronger each evening now?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The four woken hill Stones have arrived in Highwall',
        playerLine: 'Garrick, that heartbeat is stronger every dusk because the Dark Moon Order has already brought the four woken Stones inside Highwall’s walls.',
        garrickPayoff: 'Garrick rests his hand on the cart wheel: "Four corners brought back to the house they came from."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 5-2 · “We buried our dead in rows along the road so they would bar his way”',
        playerLine: 'Fragment 5-2 from the grave-mounds says: “We buried our dead in rows along the road so they would bar his way if he ever walked again.”',
        garrickPayoff: 'Garrick looks down the long line of mounds: "Even in the earth, they kept their faces toward the city."',
      },
      {
        kind: 'WRY',
        label: 'Wry · First chained dogs, now turned farm dogs—this road hates hounds',
        playerLine: 'Between the chained hound upriver and the turned farm dogs tonight, I’m sticking to cats when we get back to the inn.',
        garrickPayoff: 'Garrick hands a cup to the refugee father by the cart: "Dogs hear low sounds before men do."',
      },
    ],
    friendAttr: 'Agility',
    friendRawPrompt: 'Ask {friend:Agility} how close the pulse sounded when the turned dogs came over the road.',
    friendReply: 'You don’t hear it with your ears—it comes up through the soles of your boots from the bedrock, centered straight inside Highwall’s inner hill.',
  },
  '5-3': {
    key: '5-3', week: 5, day: 3, shape: 'B', shapeLabel: SHAPE_LABELS.B,
    clueTag: 'New Timber Bar · The Herald’s Gate',
    garrickObservation: 'Inside the shadow of the Herald’s Gate, Garrick looks at the pale new timber bar resting in iron brackets worn bright by centuries of bars, with dozens of rotted old bars stacked neatly against the gatehouse wall.',
    openQuestion: 'Highwall has been dead for an age, yet someone replaces the heavy timber bar on the inside of the main gate every generation and keeps every rotted bar in a neat stack—who bars a dead city from the inside: the Seekers’ heirs, or the Order?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The Seekers barred it first to keep the city in—and the Order kept the habit',
        playerLine: 'Garrick, those iron brackets were built on the inside to lock the dead city in—and generation after generation, someone stayed behind to renew the timber.',
        garrickPayoff: 'Garrick touches the worn iron bracket: "Centuries of oak, laid in the same iron. Whoever kept the gate never missed a decade."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 5-3 · “Bar the gate from within, and let no living foot go out or in”',
        playerLine: 'Fragment 5-3 on the gatehouse lintel commands: “Bar the gate from within, and let no living foot go out or in until the stones are dust.”',
        garrickPayoff: 'Garrick glances up at the walkway: "The stones aren’t dust yet. And there’s smoke below the hall."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Stacking centuries of rotted door-bars is peak housekeeper behaviour',
        playerLine: 'Keeping dozens of rotted timber bars stacked neatly against the wall for centuries feels like an innkeeper’s habit, Garrick.',
        garrickPayoff: 'Garrick’s mouth twitches: "A good house doesn’t throw away seasoned timber."',
      },
    ],
    friendAttr: 'Might',
    friendRawPrompt: 'Ask {friend:Might} how heavy that pale new oak bar on the gate really is.',
    friendReply: 'It takes four grown shoulders to lift a green oak beam that thick into the brackets—the watch camp below the hall has a full crew inside this city.',
  },
  '5-4': {
    key: '5-4', week: 5, day: 4, shape: 'C', shapeLabel: SHAPE_LABELS.C,
    clueTag: 'The Turned Helm · The Dead Streets',
    garrickObservation: 'Garrick pours a little faster than usual by the sheltered coals and looks back toward the street of frozen iron soldiers: “My family’s waited a long time for something. I’d like to live to see it.”',
    openQuestion: 'A whole company of the king’s soldiers stands frozen in the street on the exact same left-foot step from the night he fell—and as you backed out, the nearest helm was turned further toward you. What is waking the iron ranks?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · They are bound to the king’s heartbeat in the hall',
        playerLine: 'Garrick, every soldier stopped on the same step the night the king fell—as the Stones wake him in the hall above, his company is waking with him.',
        garrickPayoff: 'Garrick looks down into his cup: "They stopped when he stopped. Stands to reason they remember the step."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 5-4 · “His men stood in the street where the word found them”',
        playerLine: 'Fragment 5-4 on the corner plinth says: “His men stood in the street where the word found them, neither living nor dead, waiting on his voice.”',
        garrickPayoff: 'Garrick nods slowly: "Waiting on a voice behind a sealed door."',
      },
      {
        kind: 'WRY',
        label: 'Wry · What exactly has your family been waiting to see, Garrick?',
        playerLine: '“My family’s waited a long time for something.” That’s a heavy line for a man who pours ale on the drove road, Garrick.',
        garrickPayoff: 'Garrick sets the kettle back on the stone: "Old hill families all have a story they want to see the end of. Drink your tea."',
      },
    ],
    friendAttr: 'Intellect',
    friendRawPrompt: 'Ask {friend:Intellect} why every frozen soldier in that street had their left foot forward.',
    friendReply: 'They were marching up the hill toward the royal hall in step when the binding struck the city—they didn’t die in battle; they were halted mid-stride.',
  },
  '5-5': {
    key: '5-5', week: 5, day: 5, shape: 'D', shapeLabel: SHAPE_LABELS.D,
    clueTag: 'Eight Strokes Left · Below the Hall',
    garrickObservation: 'From the dark shelter above the square where the Dark Moon Order’s watchmen trade their pass-words (*"Keep the dark." / "It keeps us."*) and draw chalk through one stroke on their board leaving eight, Garrick watches the sealed hall doors.',
    openQuestion: 'The Dark Moon Order is camped right in front of the king’s sealed hall, crossing off one chalk stroke each dusk (eight nights left)—if they already hold the four hill Stones, why are they waiting outside the doors instead of going in?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · They don’t have the fifth Stone—and they can’t open the hall without us',
        playerLine: 'Garrick, they’re camped outside counting down the nights to the dark moon because the hall doors are sealed and they still haven’t found the fifth Stone!',
        garrickPayoff: 'Garrick looks down at the chalk board in the square: "Four stones in their camp, and a locked door in front of them."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 5-5 · “Nine nights before the dark moon, the shadow touches the rim”',
        playerLine: 'Fragment 5-5 on the square parapet explains their chalk board: “Nine nights before the dark moon, the shadow touches the rim.” They’re counting down to the eclipse!',
        garrickPayoff: 'Garrick counts the white marks from the shadow: "Eight strokes left on the board. Eight dusks until the moon goes dark."',
      },
      {
        kind: 'WRY',
        label: 'Wry · “Keep the dark / It keeps us” is a grim way to change the shift',
        playerLine: 'At the Hollow Wake Inn, changing the night watch probably just meant handing over the cellar key.',
        garrickPayoff: 'Garrick remarks dryly: "And telling the next man which barrel’s gone sour."',
      },
    ],
    friendAttr: 'Aim',
    friendRawPrompt: 'Ask {friend:Aim} where the fifth fragment trail points from the square below the hall.',
    friendReply: 'Every sighting-line on the five fragments we hold angles back toward the outer wall walk—the fifth Stone isn’t in the square; it’s hidden inside the wall itself.',
  },
  '5-6': {
    key: '5-6', week: 5, day: 6, shape: 'E', shapeLabel: SHAPE_LABELS.E,
    clueTag: 'Hidden Room in the Wall · The Wall Again',
    garrickObservation: 'After slipping forty paces along the open wall-walk during the watch change and passing the six joined fragments hand to hand in complete silence as the seventh stroke is crossed off below, Garrick steadies the shuttered lantern.',
    openQuestion: 'Rank our three advantages tonight as we prepare to breach the hidden room inside the thickness of Highwall’s wall: nobody in the square heard us pass the map, the fifth Stone is right inside this wall, and seven nights remain on the Order’s countdown.',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · If we claim the fifth Stone tonight, the Order can never complete the ring',
        playerLine: 'Garrick, the Seekers hid the fifth Stone inside the outer wall with one slit window watching the hall—if we take it tonight, the Order’s four Stones won’t be enough.',
        garrickPayoff: 'Garrick looks at the seamless masonry beside your hand: "Four begin it. The fifth ends it. Let’s see what’s inside the wall."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 5-6 · “Where he fell, under the dark moon, the five were joined”',
        playerLine: 'Fragment 5-6 completes the fifth map: “Where he fell, under the dark moon, the five were joined.” All five Stones were used together on the night he fell!',
        garrickPayoff: 'Garrick nods toward the wall seam: "The watch has changed, and it’s dark enough. Into the wall."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Crawling forty paces along a dead city’s wall builds character',
        playerLine: 'Forty paces of holding our breath above a square full of watchmen—and not one loose pebble this time.',
        garrickPayoff: 'Garrick allows a quiet nod: "You’re learning to walk like hill folk."',
      },
    ],
    friendAttr: 'Charm',
    friendRawPrompt: 'Ask {friend:Charm} how we timed the lookout’s hand-drop during the watch change below.',
    friendReply: 'When the relief guard turns to face the hall and strike the dusk chalk-mark, every eye in the square looks at the doors for ten full heartbeats.',
  },

  // WEEK 6 (Garrick is present for ALL of Week 6 — W6·D1 through W6·D6 & Gathering 6!)
  '6-1': {
    key: '6-1', week: 6, day: 1, shape: 'A', shapeLabel: SHAPE_LABELS.A,
    clueTag: 'The Fifth & Six Left · The Wall Room',
    garrickObservation: 'Inside the hidden Seeker room in the thickness of the wall, with the fifth Stone in your hands and the watch-page showing six nights left, Garrick checks the linen bandages on your palms: “I kept a tally behind my bar for years. Most of it was who owed me.”',
    openQuestion: 'Twice Order watchmen brushed right past the wall room’s hidden door without finding you (because it answers only Seeker blood), yet your cut palms failed to wake the fifth Stone last night—why did the door answer your blood while the fifth Stone stayed cold?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The fifth Stone only wakes in the hall where he fell under the dark moon',
        playerLine: 'Garrick, the wall door answered our Seeker blood, and Fragment 5-6 said the five were joined where he fell under the dark moon—the fifth won’t wake until that night in the hall.',
        garrickPayoff: 'Garrick glances through the slit window toward the sealed hall: "Six strokes left on the page. And an arrow under the sill pointing down to the barracks."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 6-1 · “His household ran the night we came to the hall… They were only servants”',
        playerLine: 'Fragment 6-1 in the wall room says: “His household ran the night we came to the hall. We let them go. They were only servants.” Someone from his house escaped Highwall!',
        garrickPayoff: 'Garrick’s voice is steady and quiet: "Servants and children in plain coats look much the same in the dark."',
      },
      {
        kind: 'WRY',
        label: 'Wry · A tally of bar debts is a lot friendlier than a countdown to a dark moon',
        playerLine: 'I’d trade this six-night watch-page for your old Hollow Wake bar tally any evening, Garrick.',
        garrickPayoff: 'Garrick folds the linen strip neatly: "My bar tally had fewer swords at the bottom of it."',
      },
    ],
    friendAttr: 'Intellect',
    friendRawPrompt: 'Ask {friend:Intellect} what the arrow scratched under the slit window points to.',
    friendReply: 'It points straight down through the floor-stones to the old defenders’ barracks under the wall—the Seekers left an interior route toward the hall.',
  },
  '6-2': {
    key: '6-2', week: 6, day: 2, shape: 'B', shapeLabel: SHAPE_LABELS.B,
    clueTag: 'Five Nights Left · Barracks Under the Wall',
    garrickObservation: 'In the collapsed defenders’ barracks under the wall (five nights left), Garrick watches the stair doorway where the armoured soldier turned at the heartbeat and climbed up toward the hall without looking at you.',
    openQuestion: 'The dead soldiers move when the heartbeat sounds, yet the one in the barracks stepped right past you to climb toward the hall—between the Order watchmen in the square, the walking iron soldiers, and the sealed hall doors, which one is actually guarding against us?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The soldiers aren’t hunting trespassers—they’re being called home to the hall',
        playerLine: 'Garrick, that armoured soldier didn’t care about us at all. Every time the heartbeat sounds, the king’s old company climbs a step closer to his hall.',
        garrickPayoff: 'Garrick looks up the dark stair: "They aren’t looking for thieves in the cellar. They’re answering the muster."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 6-2 · “We were marked, every one of us. That is how we found the shards”',
        playerLine: 'Fragment 6-2 on the barracks hearth says: “We were marked, every one of us. That is how we found the shards.” The original Seekers were born under the dark moon too!',
        garrickPayoff: 'Garrick nods slowly: "The Seekers had the mark. That’s why their doors know your hands."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Being ignored by a walking suit of iron is the best luck we’ve had all week',
        playerLine: 'I’ve never been happier to be completely beneath an ancient soldier’s notice.',
        garrickPayoff: 'Garrick’s mouth twitches: "Keep your boots out of the aisle and let him keep climbing."',
      },
    ],
    friendAttr: 'Might',
    friendRawPrompt: 'Ask {friend:Might} how we cleared the fallen barracks beam without bringing the ceiling down on the stair.',
    friendReply: 'The ancient hearth-arch took the weight when we levered the beam aside—and the stair beyond leads straight up to the edge of the great square.',
  },
  '6-3': {
    key: '6-3', week: 6, day: 3, shape: 'C', shapeLabel: SHAPE_LABELS.C,
    clueTag: 'Warm Stone & Four Left · The Great Square',
    garrickObservation: 'Back in the shadow of the wall after you crept into the lee of the hall and laid your palm against stone that was warm from the inside (four nights left), Garrick listens to the eleven watchmen around the square fire.',
    openQuestion: 'The front doors of the hall are sealed flush without a keyhole, six new dusty faithful just arrived for the fourth night, and the stone wall of the hall is warm from within—how did the Seekers themselves get out of the hall after sealing the front doors from the outside?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · There is a hidden Seeker door in the cracked hill behind the hall',
        playerLine: 'Garrick, if the front doors were sealed flush and the wall is warm inside, the Seekers must have left a hidden postern in the cracked hill behind the hall.',
        garrickPayoff: 'Garrick looks toward the dark mass of the hall’s rear crag: "Every house built against a hill has a back stair."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 6-3 · “He did not die. Tell our children’s children: he did not die”',
        playerLine: 'Fragment 6-3 on the square cistern says what the warm wall proves: “He did not die. Tell our children’s children: he did not die. The five hold him still.”',
        garrickPayoff: 'Garrick’s voice is low and even: "Stone stays cold unless there’s a fire on the other side of it."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Six new watchmen with road-dust on their knees and none of them brought supper',
        playerLine: 'Eleven watchmen in the square now, Garrick—their camp is getting crowded as the chalk strokes run down.',
        garrickPayoff: 'Garrick eyes the square below: "Six of them still have road-dust to the knee. They came for the last night, not for you."',
      },
    ],
    friendAttr: 'Agility',
    friendRawPrompt: 'Ask {friend:Agility} what we noticed about the six new watchmen sitting apart by the fire.',
    friendReply: 'Their packs aren’t even unrolled and they keep glancing nervously at the sealed hall doors—they weren’t sent to hunt us; they were summoned for the dark moon.',
  },
  '6-4': {
    key: '6-4', week: 6, day: 4, shape: 'D', shapeLabel: SHAPE_LABELS.D,
    clueTag: 'Full Moon Scored Dark · Hill Behind the Hall',
    garrickObservation: 'After you broke the one outward-facing iron soldier in the crack behind the hall and found the blank rock carved with a full moon scored dark (three nights left), Garrick looks at the rubbing by the shielded lamp: “The Seekers sealed the doors they knew about.”',
    openQuestion: 'Every soldier in Highwall faces inward toward the hall except the one stationed in that narrow crack facing outward—and behind it sits blank rock marked with a full moon scored dark. Why did the Seekers apologize in Fragment 6-4 for leaving this one way in?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The Seekers left a blood-door so their descendants could check the seal—and created a way back in',
        playerLine: 'Garrick, the Seekers left one hidden door behind the hall that only opens for Seeker blood under a dark moon—and they feared someone would one day use it to bring the fifth Stone back inside.',
        garrickPayoff: 'Garrick traces the scored-dark moon on the rubbing: "A door that only opens for your blood, on one night of the turn."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 6-4 · “We sealed his doors with our own hands and left one way in… Forgive us”',
        playerLine: 'Fragment 6-4 in the deep crack reads like a confession: “We sealed his doors with our own hands and left one way in, that only our blood will open. Forgive us for leaving it at all.”',
        garrickPayoff: 'Garrick repeats quietly: "Only your blood will open it. Not the men in the square."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Why did that one soldier in the crack face outward toward us?',
        playerLine: 'Every other iron soldier in Highwall faces the hall, but the one in the crack was facing outward waiting for visitors.',
        garrickPayoff: 'Garrick nods once: "Even the king knew where the back door was."',
      },
    ],
    friendAttr: 'Aim',
    friendRawPrompt: 'Ask {friend:Aim} how we spotted the soldier in the crack before its iron arm swung.',
    friendReply: 'The moonlight glinted off the front of its visor instead of the back of its helm—it was posted there to bar the crack from the inside.',
  },
  '6-5': {
    key: '6-5', week: 6, day: 5, shape: 'E', shapeLabel: SHAPE_LABELS.E,
    clueTag: 'Two Nights Left · The Moon-Tower',
    garrickObservation: 'Up in the roofless sky-watchers’ tower where the carved calendar of moons stops at a deep-cut full moon struck dark and your finger counted forward to the doorpost (two nights left), Garrick looks up at the pale moon overhead: “It always comes back.”',
    openQuestion: 'Rank the three pieces of the clock that just locked together in the moon-tower: the sky-watchers’ chisel put down on the night the king fell, the dark-moon eclipse returning in two nights, and the Order’s chalk board matching the sky-watchers’ count to the hour.',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · The dark moon is an eclipse—and in two nights the Seekers’ door will open',
        playerLine: 'Garrick, “when the dark ate the moon” wasn’t poetry—it’s a total lunar eclipse, and the sky-watchers’ wall proves the exact same eclipse falls in two nights!',
        garrickPayoff: 'Garrick keeps his eyes on the open sky above the tower: "The sky keeps better time than any inn clock. Two nights."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 6-5 · “What was bound under that shadow may only be loosed under its twin”',
        playerLine: 'Fragment 6-5 under the sky-watchers’ wall states the law: “What was bound under that shadow may only be loosed under its twin.”',
        garrickPayoff: 'Garrick nods once: "Bound under one dark moon. Loosed under its twin."',
      },
      {
        kind: 'WRY',
        label: 'Wry · The mason left his chisel and mallet on the ledge for an age',
        playerLine: 'Whoever carved that last dark moon put his chisel and mallet down on the ledge and never came back for his tools.',
        garrickPayoff: 'Garrick glances at the bronze mallet: "When the sky goes out over your head, you don’t pack your bag."',
      },
    ],
    friendAttr: 'Craft',
    friendRawPrompt: 'Ask {friend:Craft} how the sky-watchers’ blank stone measures the two remaining nights.',
    friendReply: 'Each finger-width of uncut stone after the last carved moon equals one turn of the cycle—and the measure lands squarely on the doorpost in two nights.',
  },
  '6-6': {
    key: '6-6', week: 6, day: 6, shape: 'A', shapeLabel: SHAPE_LABELS.A,
    clueTag: 'One Night Left · The Crack in the Hill',
    garrickObservation: 'On the sixth night, with the iron ranks walking slowly up the hill toward the hall, one chalk stroke left on the watch-page, and the six joined fragments marking the blank rock inside the crack *"here"*, Garrick sets out the tin cups—including the extra one—and raises his own: “Drinks are on me. Don’t get used to it.”',
    openQuestion: 'Tomorrow night the full moon goes dark, the blank rock in the crack opens at your Seeker blood-touch, and you carry the fifth Stone into His Hall—when we step through that door, what are we going in to do?',
    chips: [
      {
        kind: 'THEORY',
        label: 'Theory · Break the Order’s ring of four Stones before the dark moon completes the waking',
        playerLine: 'Garrick, we go through the Seekers’ door as the moon goes dark, keep the fifth Stone out of the Order’s hands, and shatter their ring before the king wakes.',
        garrickPayoff: 'Garrick looks around the circle—you, Mei, Dev, and Arjun—and drinks: "Six weeks on the road, and not one child lost. Tomorrow night you step into the hall."',
      },
      {
        kind: 'FRAGMENT',
        label: 'Fragment 6-6 · “Here, when the moon is dark, lay your hand upon the stone”',
        playerLine: 'Fragment 6-6 completes the last map of the season: “Here, when the moon is dark, lay your hand upon the stone, and finish what we began.”',
        garrickPayoff: 'Garrick sets his tin cup down beside the extra cup: "Finish what they began. Rest your hands tonight."',
      },
      {
        kind: 'WRY',
        label: 'Wry · Free drinks from Garrick on the last night—now I know the world is ending',
        playerLine: 'Six weeks of road-herb tea and bar tallies, and on the night before we breach the king’s hall, Garrick finally pours a free round.',
        garrickPayoff: 'Garrick’s voice is dry and quiet: "An innkeeper knows when to close the tab."',
      },
    ],
    friendAttr: 'Might',
    friendRawPrompt: 'Ask {friend:Might} how the walking iron ranks in the street behaved as we crossed to the crack.',
    friendReply: 'Two whole columns of iron were marching slowly up the hill toward the hall—only the single sentry at the crack turned on us, and now the way to the Seekers’ door is clear.',
  },
};

export function getGarrickCampfirePromptForDay(
  week: number,
  day: number,
  characterName: string = 'Jennifer',
  playerFanOutClue?: string,
  hasFirstLetterHint: boolean = false
): GarrickCampfireDayPrompt {
  const safeWeek = Math.min(6, Math.max(1, week));
  const safeDay = Math.min(6, Math.max(1, day));
  const key = `${safeWeek}-${safeDay}`;
  const isW1D1 = safeWeek === 1 && safeDay === 1;

  const ch =
    WEEKDAY_INVENTORY.find((d) => d.week === safeWeek && d.day === safeDay) ||
    WEEKDAY_INVENTORY[0];
  const frag =
    SEEKER_FRAGMENTS.find((f) => f.week === safeWeek && f.day === safeDay) ||
    SEEKER_FRAGMENTS[0];
  const boardClues = getPartyBoardCluesForDay(safeWeek, safeDay);
  const fanOut = getSoloFanOutEncounter(safeWeek, safeDay);
  const meiClue = boardClues.find((c) => c.member === 'MEI')?.clueText || '';
  const devClue = boardClues.find((c) => c.member === 'DEV')?.clueText || '';
  const arjunClue = boardClues.find((c) => c.member === 'ARJUN')?.clueText || '';

  const entry = CAMPFIRE_36_EVENING_TABLE[key] || CAMPFIRE_36_EVENING_TABLE['1-1'];
  const resolvedFriend = resolveFriendForAttribute(entry.friendAttr);
  const resolvedFriendPromptLabel = entry.friendRawPrompt.replace(
    /\{friend:[A-Za-z]+\}/g,
    `${resolvedFriend.name} (${entry.friendAttr})`
  );

  const cleanLearned = ch.summaryLearned.replace(/\[N\]/g, 'four');
  const cleanPull = ch.pullLine.replace(/\[N\]/g, String(Math.max(1, 7 - safeDay)));
  const cleanGarrickLine = (
    ch.garrickLine || 'The kettle’s hot and I’ve set the tin cups out.'
  ).replace(/^[“"]|[”"]$/g, '');

  const activePlayerClue = playerFanOutClue || fanOut.soloClueText;
  const hintClause = hasFirstLetterHint
    ? `, and the mason’s mark you uncovered gives us "${fanOut.seekerFirstLetter}" as the starting letter for Fragment ${frag.id}’s first lock-word`
    : `, and unjumbling Fragment ${frag.id} tonight will lock in the next piece of the Seeker map`;

  const boardCrossCheckReply = `Put what you found at ${ch.place} ("${activePlayerClue.replace(/\(Unlocks.*?\)/g, '').trim()}") beside Mei’s and Dev’s notes on the board: together they back up today’s lead (${cleanLearned})${hintClause}.`;

  const arrivalGreeting = isW1D1
    ? `You, Mei, Dev, and Arjun share the roadside fire on the forest road before tomorrow’s walk to the Hollow Wake Inn. Your three new companions have pinned what they noticed at ${ch.place} to the Party Findings Board above—what did you make of the man on the road?`
    : `Welcome to the fire, ${characterName}. "${cleanGarrickLine}" Mei, Dev, and Arjun have already pinned their Fan-Out findings from ${ch.place} to the Party Findings Board above. Did you uncover anything worth sharing when you fanned out at ${ch.place}?`;

  const hostTarget: CampfireSpeakerId = isW1D1 ? 'MEI' : 'GARRICK';
  const hostName = isW1D1 ? 'Mei' : 'Garrick';

  const friendHook: CampfireFriendHook = {
    attr: entry.friendAttr,
    rawTemplate: entry.friendRawPrompt,
    resolvedSpeaker: resolvedFriend.speaker,
    resolvedFriendName: resolvedFriend.name,
    label: `🎯 ${resolvedFriendPromptLabel}`,
    playerLine: `${resolvedFriend.name}, ${entry.friendRawPrompt
      .replace(/^Ask\s+\{friend:[A-Za-z]+\}\s+/i, '')
      .replace(/\.$/, '')}?`,
    companionReply: entry.friendReply,
  };

  // Wave 1 Stances built directly from the 36-Evening Table's 3 Canonical Chips (Theory, Fragment, Wry) + {friend:Attribute} Hook
  const wave1Stances: CampfireWaveStance[] = [
    ...entry.chips.map((chip, idx) => ({
      id: `w1-${key}-chip-${idx}`,
      wave: 1 as const,
      pillar: (chip.kind === 'FRAGMENT' ? 'BOARD_AND_FRAGMENT' : 'MYSTERY_CASE') as
        | 'BOARD_AND_FRAGMENT'
        | 'MYSTERY_CASE',
      chipKind: chip.kind,
      label: chip.label,
      target: hostTarget,
      playerLine: chip.playerLine,
      companionReply: chip.garrickPayoff,
      garrickFollowUpHook: `${chip.garrickPayoff} — Now check ${resolvedFriend.name}’s ${entry.friendAttr} angle or connect tonight’s board to the wider case below.`,
    })),
    {
      id: `w1-${key}-friend-hook`,
      wave: 1,
      pillar: 'BOARD_AND_FRAGMENT',
      chipKind: 'FRIEND_HOOK',
      label: friendHook.label,
      target: friendHook.resolvedSpeaker,
      playerLine: friendHook.playerLine,
      companionReply: friendHook.companionReply,
      garrickFollowUpHook: `${hostName} nods toward the board: "${resolvedFriend.name}’s ${entry.friendAttr} read lines right up with Fragment ${frag.id}. How do we connect that to the wider case?"`,
    },
  ];

  const wave2Stances: CampfireWaveStance[] = [
    {
      id: `w2-${key}-arjun-mech`,
      wave: 2,
      pillar: 'BOARD_AND_FRAGMENT',
      label: `Pull Arjun’s Board Finding into the Fragment ${frag.id} theory`,
      target: 'ARJUN',
      playerLine: `Arjun, bring your board clue from ${ch.place} in—how does the physical mechanism you inspected back up Mei’s reading of Fragment ${frag.id}?`,
      companionReply: `Look at what I pinned to the board: "${arjunClue}" Every bronze pin and chisel-mark at ${ch.place} was engineered to respond only to Seeker bloodlines, ${characterName}. That’s why unjumbling both lock-words on Fragment ${frag.id} matters so much for our Day 7 Gathering!`,
      garrickFollowUpHook: `Four clues on the board and the Seeker housing inspected. Keep pulling at the thread—or lock in tomorrow’s synthesis below.`,
    },
    {
      id: `w2-${key}-garrick-deeper`,
      wave: 2,
      pillar: 'MYSTERY_CASE',
      label: isW1D1
        ? 'Ask Dev why the stranger put a list IN the box instead of stealing'
        : safeWeek <= 2
        ? 'Press Garrick on why the takers never harm the children'
        : safeWeek <= 4
        ? 'Press Garrick on why they spared us in the dark'
        : 'Press Garrick on what waits inside Highwall’s sealed hall',
      target: isW1D1 ? 'DEV' : 'GARRICK',
      playerLine: isW1D1
        ? `Dev, why would a man on the forest road break into a cargo box just to leave a list and a charcoal rubbing inside?`
        : safeWeek <= 2
        ? `Garrick, looking at everything on our board so far—why go to such lengths to take a child unharmed and leave the Seeker stone untouched for us?`
        : safeWeek <= 4
        ? `Garrick, every board clue from ${ch.place} shows them watching our steps without striking us down. Why let us keep closing in?`
        : `Garrick, with the chalk strokes counting down at ${ch.place} and five sockets around the hall, what happens when the last lock opens?`,
      companionReply: isW1D1
        ? `That’s what keeps sticking in my craw, ${characterName}. A road-thief takes your silver and runs. Whoever sent that man wanted all four of us walking into the Hollow Wake Inn tomorrow at the exact same hour.`
        : safeWeek === 1
        ? `Look at the record on your board, ${characterName}. The girl was walked out calm, kept dry out of the rain, and carried without a scratch. You don’t guard a key unless you still have a door to open. What kind of door needs a child born beside an old stone?`
        : safeWeek === 2
        ? `Look at the record on your board, ${characterName}. Both Tamsin and Corin were kept dry, fed, and whole—and the takers knew the exact night Corin was born. You don’t guard a key unless you still have a door to open.`
        : safeWeek <= 4
        ? `A hunter doesn’t shoot the hound that’s leading him to the stag, ${characterName}. Look at Arjun’s note on the board—their own man died trying to pick a Seeker lock that opened at your touch. Does that tell you why your throats are still whole?`
        : `Five stones fell when the dark ate the moon, ${characterName}, and four have already answered. The board in front of you has every step written on it—ask Mei what the last verse says about the fifth.`,
      garrickFollowUpHook: `Mei glances up from Meira’s notebook by the firelight—ready if you want to connect tonight’s board to the overarching mystery.`,
    },
    {
      id: `w2-${key}-mei-big-picture`,
      wave: 2,
      pillar: 'MYSTERY_CASE',
      label: `Connect ${ch.place.replace(/^The\s+/i, '')} to our overall theory of the case`,
      target: 'MEI',
      playerLine: `Mei, step back and look at the whole mystery till date—how does today’s trail at ${ch.place} change our theory of what they’re building toward?`,
      companionReply:
        safeWeek <= 2
          ? `When we started on the road, we thought we were chasing ordinary kidnappers. But putting your clue from ${ch.place} beside Dev’s and Arjun’s board notes proves they are following Meira’s old list of dark-moon birth dates, ${characterName}—and every Seeker Fragment we decode shows what was hidden at these stones.`
          : safeWeek === 3
          ? `Putting your clue from ${ch.place} beside our board notes proves why the Order came to the Blackglass and the Kiln, ${characterName}: they aren’t mourning a dead past—they believe someone sleeps beneath the stone, and Fragment ${frag.id} is part of the record.`
          : `Putting your clue from ${ch.place} beside Dev’s and Arjun’s board notes proves they aren’t hoarding prisoners—they’re carrying every stone home in sequence, ${characterName}. And every time we solve a Seeker Fragment like ${frag.id}, we’re reading the blueprint they’re following!`,
      garrickFollowUpHook: `That’s the sharpest anyone’s put it all week. If you spot anything else on the Party Findings Board above, call it out.`,
    },
  ];

  const beat3Hook = `Compare your Fan-Out discovery from ${ch.place} with the three clues on the board and today’s Seeker Fragment (${frag.id})—what does it tell us about their next move?`;

  const wave3Stances: CampfireWaveStance[] = [
    {
      id: `w3-${key}-next-move-dev`,
      wave: 3,
      pillar: 'NEXT_MOVE',
      label: safeDay === 6
        ? `Commit to tomorrow’s Day 7 Gathering approach (${cleanPull})`
        : `Lock in tomorrow’s trail with Dev (${cleanPull})`,
      target: 'DEV',
      playerLine: `Dev, putting my Fan-Out clue from ${ch.place} beside the three board notes and Fragment ${frag.id}—our next move has to follow "${cleanPull}". What’s our vanguard plan at first light?`,
      companionReply: `${boardCrossCheckReply} That locks our course for tomorrow ("${cleanPull}"), ${characterName}. I’ll take the point watch before dawn so we hit the next landmark before their rear-guard can sweep it.`,
      garrickFollowUpHook: `${hostName} nods over the fire: "All four board clues and Fragment ${frag.id} point straight along '${cleanPull}'. Rest your blades—tomorrow we move on that line."`,
    },
    {
      id: `w3-${key}-next-move-mei`,
      wave: 3,
      pillar: 'NEXT_MOVE',
      label: `Synthesize Fragment ${frag.id} & our 4 Board Clues with Mei`,
      target: 'MEI',
      playerLine: `Mei, when we lay all four board clues from ${ch.place} over Fragment ${frag.id}, what does it prove about what waits ahead (${cleanPull})?`,
      companionReply: `${boardCrossCheckReply} And when you pair that with "${cleanPull}", ${characterName}, it proves the next Seeker housing is already on their route—we have to reach it and decode the remaining words before the seventh night.`,
      garrickFollowUpHook: `${hostName} closes the notebook cover: "Tonight’s synthesis is locked in—your Fan-Out clue, the three board notes, and Fragment ${frag.id} all point to '${cleanPull}'."`,
    },
  ];

  return {
    week: safeWeek,
    day: safeDay,
    shape: entry.shape,
    shapeLabel: entry.shapeLabel,
    clueTag: entry.clueTag,
    arrivalGreeting,
    beat1Observation: entry.garrickObservation,
    beat2Question: entry.openQuestion,
    beat3Hook,
    boardCrossCheckReply,
    canonicalChips: entry.chips,
    friendHook,
    wave1Stances,
    wave2Stances,
    wave3Stances,
  };
}

export function buildBoardClueDiscussionExchange(
  member: 'MEI' | 'DEV' | 'ARJUN' | 'YOU',
  clueTitle: string,
  clueText: string,
  week: number,
  day: number,
  characterName: string = 'Jennifer'
): {
  playerPrompt: string;
  targetSpeaker: CampfireSpeakerId;
  companionReply: string;
  garrickCue: string;
} {
  const ch =
    WEEKDAY_INVENTORY.find((d) => d.week === week && d.day === day) ||
    WEEKDAY_INVENTORY[0];
  const frag =
    SEEKER_FRAGMENTS.find((f) => f.week === week && d.day === day) ||
    SEEKER_FRAGMENTS[0];
  const isAbsent = week === 1 && day === 1;
  const hostName = isAbsent ? 'Mei' : 'Garrick';

  if (member === 'MEI') {
    return {
      playerPrompt: `Mei, I'm looking at your "${clueTitle}" note on the Party Findings Board—how does that fit with the rest of what we found at ${ch.place}?`,
      targetSpeaker: 'MEI',
      companionReply: `Look closely at what I logged at ${ch.place}, ${characterName}: "${clueText}" When you pair that with Fragment ${frag.id} (words starting with "${(frag.word1[0] || 'L').toUpperCase()}…" and "${(frag.word2[0] || 'S').toUpperCase()}…"), it shows the Seekers anticipated someone would come looking for the stone centuries later. What do you think, Dev—does that match the tracks you found?`,
      garrickCue: isAbsent
        ? `Dev glances up from the board: "Mei’s lore note and my perimeter track are two halves of the same coin. Ask Arjun how his mechanism check fits."`
        : `Garrick points his tin cup at the board: "Mei’s lore note and Dev’s perimeter track are two halves of the same coin. Ask Dev or Arjun how their piece fits."`,
    };
  }

  if (member === 'DEV') {
    return {
      playerPrompt: `Dev, about your "${clueTitle}" report on the Party Findings Board—what does that tell us about their numbers and direction from ${ch.place}?`,
      targetSpeaker: 'DEV',
      companionReply: `Glad you checked the board, ${characterName}. "${clueText}" They’re disciplined—moving fast without panic, and heading straight along the line toward "${ch.pullLine}" If Arjun’s right about the stonework, they knew this route before we ever left camp.`,
      garrickCue: `${hostName} nods slowly: "Dev’s eye for tracks doesn’t miss. Pair that with your own Fan-Out discovery on the board—why were they in such a hurry to clear ${ch.place}?"`,
    };
  }

  if (member === 'ARJUN') {
    return {
      playerPrompt: `Arjun, let's talk about your "${clueTitle}" entry on the Party Findings Board—what did you make of the craft at ${ch.place}?`,
      targetSpeaker: 'ARJUN',
      companionReply: `Tap the ironwork at ${ch.place} and it tells the whole story, ${characterName}: "${clueText}" Whoever built the housing for Fragment ${frag.id} designed it so brute force fails every time—only the right hand and the right sequence can unseal it.`,
      garrickCue: `${hostName} leans in: "And that’s why their own lockpick failed where your hands succeeded. What does the rest of the table make of that?"`,
    };
  }

  // YOU
  const promptObj = getGarrickCampfirePromptForDay(week, day, characterName, clueText);
  return {
    playerPrompt: `Everyone, I've pinned my Fan-Out discovery from ${ch.place} ("${clueTitle}") to the Party Findings Board: ${clueText}`,
    targetSpeaker: isAbsent ? 'MEI' : 'GARRICK',
    companionReply: promptObj.boardCrossCheckReply,
    garrickCue: `Mei and Dev lean over the board: "${promptObj.beat3Hook}"`,
  };
}

export function getGarrickCampfireDailyPrompt(
  week: number,
  day: number,
  characterName: string = 'Jennifer',
  playerFanOutClue?: string,
  hasFirstLetterHint: boolean = false
) {
  const p = getGarrickCampfirePromptForDay(
    week,
    day,
    characterName,
    playerFanOutClue,
    hasFirstLetterHint
  );
  return {
    shape: p.shape,
    shapeLabel: p.shapeLabel,
    clueTag: p.clueTag,
    welcomeAskShare: p.arrivalGreeting,
    garrickObservation: p.beat1Observation,
    openQuestion: p.beat2Question,
    beat1OpeningSynthesis: `${p.beat1Observation} ${p.beat2Question}`,
    beat3Hook: p.beat3Hook,
    boardCrossCheckReply: p.boardCrossCheckReply,
    canonicalChips: p.canonicalChips,
    friendHook: p.friendHook,
    wave1Options: p.wave1Stances,
    wave2Options: p.wave2Stances,
    wave3Options: p.wave3Stances,
  };
}

export function getBoardCrossCheckSynthesis(
  week: number,
  day: number,
  _member?: 'MEI' | 'DEV' | 'ARJUN',
  characterName: string = 'Jennifer',
  playerFanOutClue?: string,
  hasFirstLetterHint: boolean = false
): string {
  const p = getGarrickCampfirePromptForDay(
    week,
    day,
    characterName,
    playerFanOutClue,
    hasFirstLetterHint
  );
  return p.boardCrossCheckReply;
}
