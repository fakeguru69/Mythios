import { AttributeName } from './mythiosRulesData';

export type FriendId = 'YOU' | 'MEI' | 'DEV' | 'ARJUN';

export interface CampfireRiddleEntry {
  q: string;
  a: string;
  quip: string;
  accept: string[];
  maxTries: number;
}

export interface CampfireFanOutClueInternal {
  title: string;
  text: string;
  source: string;
  bearsOnFork: string;
  qaNote: string;
}

export interface CampfireFanOutCluePublic {
  title: string;
  text: string;
  source: string;
}

export interface CampfireDayEntry {
  week: number;
  day: number;
  id: string;
  place: string;
  narratedNoGarrick: boolean;
  tone: 'wry' | 'quiet';
  cupNight: boolean;
  opener: string;
  forkA: string;
  forkB: string;
  callback: string;
  riddle: CampfireRiddleEntry | null;
  nudge: string;
  fanOutClue: CampfireFanOutClueInternal;
}

export const CUP_NIGHT_IDS: readonly string[] = [
  '1-2',
  '1-6',
  '2-1',
  '2-6',
  '3-4',
  '4-2',
  '5-4',
  '6-6',
];

export const QUIET_DAY_IDS: readonly string[] = [
  '1-4',
  '3-2',
  '4-3',
  '4-6',
  '5-4',
  '6-2',
];

export const CAMPFIRE_STORED_LINES = {
  theoryPinAcks: [
    'Pinned.',
    "That's on the board.",
    'Pinned under your name, {friend}.',
    'On the board. What would change your mind?',
    'Written up where everyone can see.',
  ],
  closers: [
    'Enough for one day.',
    'Off to bed, the lot of you.',
    "Sleep. I'll mind the fire.",
    'Same fire tomorrow?',
  ],
  firstArrivalGreeting: "You're first. Pull up a log.",
  messageInABottlePrompt: 'Leave one for the others. It goes on the board.',
  catchUpTemplate: '{friend} thinks {reading}.',
  day6WeeklyPinLine: 'Those are on the board.',
  cupNightStageDirection:
    'Garrick pours one extra tin cup and sets it at the empty place at the edge of the firelight without a word.',
  noticingTemplates: {
    bruisedScrape: "{friend}, you're favouring that arm.",
    solvedFragmentFirst: '{friend} got the stone-words first today.',
    lentRelic: '{friend} handed over a Relic today.',
    backAfterMissedDay: 'Back with us, {friend}. Kettle is still hot.',
    notYetArrived: "{friend} isn't by the fire yet.",
  },
} as const;

export const CAMPFIRE_DAYS_DATA: CampfireDayEntry[] = [
  // ==================== WEEK 1 ====================
  {
    week: 1,
    day: 1,
    id: '1-1',
    place: 'The forest road',
    narratedNoGarrick: true,
    tone: 'wry',
    cupNight: false,
    opener:
      'A man breaks your cargo lock on the forest road — and instead of taking a thing, puts a list of names inside.',
    forkA: 'The list is a warning.',
    forkB: 'The list is an invitation.',
    callback:
      'Look at the half-burned charcoal rubbing from the leaf-mould beside the list in your hand.',
    riddle: null,
    nudge:
      '{friend:Craft}, look at the scratches round that latch — was it picked to steal, or forced so you would open the box before dark?',
    fanOutClue: {
      title: 'The folded list',
      text: 'The parchment was folded twice before it went into your box. Along the outer crease sits a speck of dried red sealing-wax — and a faint smell of cheap tavern wine.',
      source: 'Challenge & Fight Fan Out (1-1)',
      bearsOnFork:
        'Supports both readings: a sealed tavern dispatch could be an urgent warning or a deliberate summons.',
      qaNote:
        'Plants the Hollow Wake Inn wine detail for W1D2 without naming Garrick or Meira early.',
    },
  },
  {
    week: 1,
    day: 2,
    id: '1-2',
    place: 'The Hollow Wake Inn',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: true,
    opener:
      'Woman called Meira. Scholar. Sat right there most nights, two years near enough. Cheapest wine in the house, and tipped like a queen. Left this. Hasn\'t been back in three weeks.',
    forkA: 'Meira left the satchel for us because she knew she was being followed.',
    forkB: 'Meira meant to come back for the satchel and ran out of time.',
    callback:
      'Four stubs cut against a straight rule, and your list from the forest road is the third.',
    riddle: {
      q: 'What has a neck, no head, and sits in my bar all night without paying its slate?',
      a: 'A bottle.',
      quip: 'Meira paid hers to the penny, mind.',
      accept: ['bottle', 'a bottle', 'wine bottle', 'the bottle'],
      maxTries: 3,
    },
    nudge:
      '{friend:Intellect}, she put two children on the same notebook leaf — what connects the rock two winters back to Fenmark now?',
    fanOutClue: {
      title: 'The ink on the fourth stub',
      text: 'Three of the cut stubs in Meira\'s satchel are dry and faded. The fourth was written in wetter ink that blotted against the leather lining — she cut it the same night she walked out.',
      source: 'Challenge & Fight Fan Out (1-2)',
      bearsOnFork:
        'Bears directly on whether she planned the handover in advance or left in sudden haste.',
      qaNote: 'Clean Week 1 clue; no future terms used.',
    },
  },
  {
    week: 1,
    day: 3,
    id: '1-3',
    place: "The Widow's Tooth",
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'People tell a man with a cloth in his hand everything. They forget he\'s got ears.',
    forkA: 'The lookout in the bracken was waiting for us.',
    forkB: 'The lookout was watching the rock for someone else.',
    callback:
      'Meira\'s charcoal rubbing from Day 1 fits the stone cut at the Widow\'s Tooth to the hair.',
    riddle: {
      q: 'What has four legs, one head, and never walks a step until a child picks it up?',
      a: 'A carved wooden horse.',
      quip: 'Small thumbs wore the paint right off its mane.',
      accept: ['horse', 'wooden horse', 'carved horse', 'a carved horse', 'toy horse', 'a horse'],
      maxTries: 3,
    },
    nudge:
      '{friend:Aim}, look at how the bracken was flattened — was he facing the south road we came up, or the village lane toward Fenmark?',
    fanOutClue: {
      title: 'Cold tallow in the niche',
      text: 'At the back of the dry stone shelf where the carved horse lay, someone pinched out a tallow stub not two nights ago. The shelf was empty, yet they still came back to check it.',
      source: 'Challenge & Fight Fan Out (1-3)',
      bearsOnFork:
        'Shows the watchers were checking the rock on a schedule, bearing on who they expected.',
      qaNote: 'No early reveals.',
    },
  },
  {
    week: 1,
    day: 4,
    id: '1-4',
    place: 'Fenmark',
    narratedNoGarrick: false,
    tone: 'quiet',
    cupNight: false,
    opener:
      'Every shutter in Fenmark barred in broad daylight, and a boy of fourteen is the only soul with the spine to name Tamsin.',
    forkA: 'Someone inside Fenmark told the takers which house was hers.',
    forkB: 'The takers already knew her door before they entered the lane.',
    callback:
      'Just like the boy at the Widow\'s Tooth two winters back, Tamsin was born on a night the moon went dark.',
    riddle: {
      q: 'What is so brittle that speaking a single word in a barred street breaks it?',
      a: 'Silence.',
      quip: 'That boy broke plenty of it behind the grain store.',
      accept: ['silence', 'the silence', 'quiet'],
      maxTries: 3,
    },
    nudge:
      '{friend:Charm}, when the village elder brought out clubs, was that guilt in his eyes or plain terror?',
    fanOutClue: {
      title: 'The unlatched gate',
      text: 'Every house in the lane has fresh iron staples driven into the shutters — except Tamsin\'s. On her gatepost, someone drew a tiny charcoal crescent three nights ago and wiped half of it away.',
      source: 'Challenge & Fight Fan Out (1-4)',
      bearsOnFork:
        'Directly tests whether a scout marked the gate from within or brought a list from outside.',
      qaNote: 'Quiet tone day; riddle hidden unless requested.',
    },
  },
  {
    week: 1,
    day: 5,
    id: '1-5',
    place: 'The old charcoal camp',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'Two winters between the charcoal woman\'s nephew and Tamsin, and the same curved black-handled knife both times.',
    forkA: 'The runner with the kitchen knife is one of the takers.',
    forkB: 'The runner is local muscle hired to watch the back trail.',
    callback:
      'The carved wooden horse from the Widow\'s Tooth belonged to the charcoal woman\'s nephew all along.',
    riddle: {
      q: 'What eats the forest all week long, yet dies the moment you give it a drink of water?',
      a: 'Fire.',
      quip: 'Charcoal burners know how to starve it just enough.',
      accept: ['fire', 'a fire', 'the fire', 'flame', 'flames'],
      maxTries: 3,
    },
    nudge:
      '{friend:Agility}, you saw the runner bolt north — did he move like a man heading home, or a man reporting to a camp?',
    fanOutClue: {
      title: 'Three copper pence',
      text: 'Where the runner crouched behind the charcoal shed, three common market pence fell from his pocket beside a crust of village rye. The blade he left in the shutter came from a Fenmark kitchen set.',
      source: 'Challenge & Fight Fan Out (1-5)',
      bearsOnFork:
        'Bears directly on whether the runner is an inner member of the takers or paid village look-out.',
      qaNote: 'Clean Week 1 vocabulary.',
    },
  },
  {
    week: 1,
    day: 6,
    id: '1-6',
    place: 'The Low Ford',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: true,
    opener:
      'Family habit. We always pour one for whoever can\'t be with us.',
    forkA: 'They carried Tamsin across the river because their camp is in the old mine.',
    forkB: 'The old mine is only a staging post before they move her further north.',
    callback:
      'All six stone fragments from this week lock together into one map — and it ends at the mark from Meira\'s Day 1 rubbing.',
    riddle: {
      q: 'What runs from the hills to the sea day and night without ever leaving its bed?',
      a: 'A river.',
      quip: 'Cold enough at the ford to wake your boots up.',
      accept: ['river', 'the river', 'a river', 'water', 'stream'],
      maxTries: 3,
    },
    nudge:
      '{friend:Might}, her footprints walked unhurt to the boat — why handle a stolen child so carefully?',
    fanOutClue: {
      title: 'Dry wool in the reeds',
      text: 'Snagged on the willow roots beside the upstream mooring-stone is a strip of dry grey blanket-wool. Whoever lifted Tamsin into the boat wrapped her shoulders against the river mist first.',
      source: 'Challenge & Fight Fan Out (1-6)',
      bearsOnFork:
        'Shows they are keeping her warm and unharmed for what waits across the ford.',
      qaNote: 'Cup Night #2 (1-6).',
    },
  },

  // ==================== WEEK 2 ====================
  {
    week: 2,
    day: 1,
    id: '2-1',
    place: 'The mine, then the mill road',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: true,
    opener:
      'Worst guests I\'ve ever had. Good tippers, though.',
    forkA: 'The horseman who galloped from the mine is the same man driving the mill-road cart.',
    forkB: 'A second crew was already working the mill road while we were at the ford.',
    callback:
      'Under the empty socket in the mine sat four children\'s names — Tamsin\'s first, and three more.',
    riddle: {
      q: 'What goes all the way up the mill road without lamps, yet leaves its signature in every puddle?',
      a: 'A dragging wheel.',
      quip: 'Pulls to the left like a mule with a sore ear.',
      accept: ['wheel', 'a wheel', 'cart wheel', 'dragging wheel', 'a dragging wheel', 'cart', 'rut', 'ruts'],
      maxTries: 3,
    },
    nudge:
      '{friend:Charm}, the farmer with the axe said the lamp-less cart went up three nights ago — where were we three nights ago?',
    fanOutClue: {
      title: 'Iron filings on the axle-stone',
      text: 'Where the lamp-less cart scraped the milestone on the mill road, fresh iron curl-shavings sit in the mud. The left axle-pin is wearing through its washer mile by mile.',
      source: 'Challenge & Fight Fan Out (2-1)',
      bearsOnFork:
        'Proves the cart has been hauling heavy loads across multiple roads on a tight timetable.',
      qaNote: 'Cup Night #3 (2-1 per Confirmed Decision 3).',
    },
  },
  {
    week: 2,
    day: 2,
    id: '2-2',
    place: 'The mill',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'He asked for Corin by name, knew the night the boy was born, and left a horn button in the miller\'s wife\'s fist.',
    forkA: 'The takers have a copy of Meira\'s notebook.',
    forkB: 'Meira copied her list from an older record the takers already use.',
    callback:
      'Cut into the old stone footing under the mill-wheel is the exact shape from the Widow\'s Tooth and the river mine.',
    riddle: {
      q: 'What turns all day in the race, grinds every sack of grain, and never eats a mouthful?',
      a: 'A millstone.',
      quip: 'Old stone under that wheel is older than the mill.',
      accept: ['millstone', 'a millstone', 'mill wheel', 'the mill wheel', 'wheel', 'waterwheel'],
      maxTries: 3,
    },
    nudge:
      '{friend:Intellect}, why is every marked child we\'ve traced living within a stone\'s throw of one of those carvings?',
    fanOutClue: {
      title: 'The ruts',
      text: 'The left wheel pulls. You have seen that track before, coming down a muddy bank to a ford. It is the same cart.',
      source: 'Challenge & Fight Fan Out (2-2)',
      bearsOnFork:
        'Proves a single cart and crew worked both the Low Ford road and the mill lane.',
      qaNote:
        'Flagged in report per prompt instructions: reuses the [PRESS ON] detail noted in continuity item L1; left unchanged.',
    },
  },
  {
    week: 2,
    day: 3,
    id: '2-3',
    place: 'Upriver',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'A man lies dead a week on the hidden path with his iron pick snapped inside a stone lock that opened at your bare touch.',
    forkA: 'The dead lockpick worked for the takers and failed.',
    forkB: 'The dead lockpick was a rival thief who found the path before them.',
    callback:
      'Fragment 1-3 at the Widow\'s Tooth warned us: "Not every hand that tries will open it. Some locks already know their key."',
    riddle: {
      q: 'What has no teeth to bite a stranger, yet keeps the dog from walking past the post?',
      a: 'A chain.',
      quip: 'Poor beast was hungry enough to chew the iron.',
      accept: ['chain', 'a chain', 'the chain', 'iron chain', 'collar'],
      maxTries: 3,
    },
    nudge:
      '{friend:Craft}, look at the snapped steel inside the housing — what killed him when the pick jammed?',
    fanOutClue: {
      title: 'The greased leather roll',
      text: 'Tucked inside the dead man\'s boot is a greased leather roll of seven fine steel picks — and a folded slip of paper with the mill-wheel mark drawn in the same ink as the fourth stub at the inn.',
      source: 'Challenge & Fight Fan Out (2-3)',
      bearsOnFork:
        'Shows the dead lockpick was sent to open the housing with tools before they realized living blood was required.',
      qaNote: 'Clean Week 2 vocabulary.',
    },
  },
  {
    week: 2,
    day: 4,
    id: '2-4',
    place: 'The shaft in the hillside',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'That went about as well as it looked.',
    forkA: 'Corin\'s hands are uncut because they haven\'t dug down to the stone yet.',
    forkB: 'Corin\'s hands are uncut because they are waiting for a specific night.',
    callback:
      'In the river mine on Night 7, the socket was already empty when we got there — here the picks are still ringing below.',
    riddle: {
      q: 'What grows deeper the more you take away from it?',
      a: 'A shaft.',
      quip: 'And they took the ladder with them too.',
      accept: ['shaft', 'a shaft', 'hole', 'a hole', 'pit', 'a pit', 'mine'],
      maxTries: 3,
    },
    nudge:
      '{friend:Agility}, when the watchman hauled the ladder away, where did the sound of the picks echo from?',
    fanOutClue: {
      title: 'Fresh limestone dust',
      text: 'The baskets hauled to the side of the upper chamber are full of pale, dry limestone chips — not the dark surface shale of the shaft. They are breaking through an older mortared floor below the lamp-ring.',
      source: 'Challenge & Fight Fan Out (2-4)',
      bearsOnFork:
        'Supports the reading that they are still digging through to the sealed chamber beneath Corin.',
      qaNote: 'Clean Week 2 vocabulary.',
    },
  },
  {
    week: 2,
    day: 5,
    id: '2-5',
    place: 'The hillside by night',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'A small black cloth circle torn from the lookout\'s coat, and a king whose name was chiselled out of every book Meira read.',
    forkA: 'The king\'s enemies scraped his name from history to keep him forgotten.',
    forkB: 'The king\'s own people hid his name to protect where he lay.',
    callback:
      'Look at the lookout\'s right cuff beside the horn button the miller\'s wife gave you on Day 2.',
    riddle: {
      q: 'What can signal across a dark hill in the blink of an eye, yet disappears the moment you shut its door?',
      a: 'A shuttered lamp.',
      quip: 'Two flashes down the shaft. They know we\'re on the roof.',
      accept: ['lamp', 'a lamp', 'shuttered lamp', 'lantern', 'a lantern', 'light'],
      maxTries: 3,
    },
    nudge:
      '{friend:Aim}, those two flashes of the shuttered lamp — were they calling men up the hill, or telling the diggers below to hurry?',
    fanOutClue: {
      title: 'The frayed cuff-thread',
      text: 'Inside the torn strip of black coat-cloth sits a loop of waxed linen thread — dyed with the exact walnut stain as the horn button from the mill.',
      source: 'Challenge & Fight Fan Out (2-5)',
      bearsOnFork:
        'Ties the hillside watcher directly to the man who took Corin at the mill.',
      qaNote: 'First use of "king" allowed at W2D5 per First-Use Map.',
    },
  },
  {
    week: 2,
    day: 6,
    id: '2-6',
    place: 'The lip of the shaft',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: true,
    opener:
      'Six fragments traced in silence by a chink of light, and an older shaft going down into the hollow under their feet.',
    forkA: 'We go down the old Seeker stair before their picks break the ceiling.',
    forkB: 'We wait until their picks breach the vault and take them in the dust.',
    callback:
      'Fragment 2-3 named four stones — wind, fire, water, earth — brought to break his gate.',
    riddle: {
      q: 'What has no voice of its own, yet answers every pick-stroke from the dark below?',
      a: 'An echo.',
      quip: 'And that loose stone we dropped had plenty to say.',
      accept: ['echo', 'an echo', 'the echo', 'stone', 'rock'],
      maxTries: 3,
    },
    nudge:
      '{friend:Might}, when you pressed your ear to the rock, how big did that lower hollow sound compared to the lamp-room?',
    fanOutClue: {
      title: 'Chisel-marks on the stair lip',
      text: 'The stone steps inside the second shaft are worn smooth going down, but the mason\'s chisel-marks on the wall all point upward — whoever sealed the lower vault built this stair as their way out.',
      source: 'Challenge & Fight Fan Out (2-6)',
      bearsOnFork:
        'Shows the second shaft leads directly into the sealed lower vault beneath the diggers.',
      qaNote: 'Cup Night #4 (2-6).',
    },
  },

  // ==================== WEEK 3 ====================
  {
    week: 3,
    day: 1,
    id: '3-1',
    place: 'Somewhere warm',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'Ashcombe\'s a shepherds\' village on the edge of the burned country. A long day west. And above it she\'s marked a place. The Blackglass.',
    forkA: 'They took Wren back toward her own village because her Stone is above Ashcombe.',
    forkB: 'They held Wren at the mill hill first to test if one child could open another child\'s lock.',
    callback:
      'Corin is safe with his mother, and the Order\'s ledger in your pack has two places and two children left.',
    riddle: {
      q: 'What has two covers, no blanket, and tells you where the Order has been without speaking a word?',
      a: 'A ledger.',
      quip: 'Pity the man who dropped it on his way up the shaft.',
      accept: ['ledger', 'a ledger', 'the ledger', 'book', 'a book', 'notebook'],
      maxTries: 3,
    },
    nudge:
      '{friend:Agility}, that Order straggler climbing out of the shaft at dawn — was he coming back for Corin, or for the ledger?',
    fanOutClue: {
      title: 'The warm one',
      text: 'Before Corin fell asleep at the mill, he remembered one more thing the hooded men said when they lifted Wren into the second cart: they called her "the warm one," and never said why.',
      source: 'Challenge & Fight Fan Out (3-1)',
      bearsOnFork:
        'Connects Wren directly to the Fire Stone and the burned country above Ashcombe.',
      qaNote:
        'Flagged in report per prompt instructions: adds a small detail to Corin\'s account not in Episode 3 Day 1 chapter text; left unchanged.',
    },
  },
  {
    week: 3,
    day: 2,
    id: '3-2',
    place: 'Ashcombe',
    narratedNoGarrick: false,
    tone: 'quiet',
    cupNight: false,
    opener:
      'My family\'s been in these hills longer than the roads have.',
    forkA: 'The two men in grey coats truly mean to return Wren after "only the once."',
    forkB: '"Only need her the once" was a lie to keep her mother from raising the lane.',
    callback:
      'Tamsin walked unhurt to the boat, and Corin sat uncut in the lamp-ring until the Stone was reached.',
    riddle: {
      q: 'What is black as midnight, sharp as a razor, and born when the mountain bled fire?',
      a: 'Black glass.',
      quip: 'Wren lined her whole windowsill with it.',
      accept: ['glass', 'black glass', 'blackglass', 'obsidian', 'volcanic glass', 'a chip of black glass'],
      maxTries: 3,
    },
    nudge:
      '{friend:Charm}, Wren\'s mother said the two men were polite and never raised their voices — what kind of men steal a child politely?',
    fanOutClue: {
      title: 'Silver on the table-edge',
      text: 'Under the edge of the mother\'s wooden trencher sits a single silver coin with its face scraped flat. The two men in grey coats left it on the table without her seeing.',
      source: 'Challenge & Fight Fan Out (3-2)',
      bearsOnFork:
        'Shows the grey-coated men view their taking as a lawful duty or debt rather than banditry.',
      qaNote: 'Quiet tone day (3-2); riddle hidden unless requested.',
    },
  },
  {
    week: 3,
    day: 3,
    id: '3-3',
    place: 'The Blackglass',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'My knees have opinions about this glass. None of them good.',
    forkA: 'The six horses rode past Meira\'s mark because the Stone was moved deeper into the ridges.',
    forkB: 'Meira\'s mark on the Blackglass was only an outer boundary stone, never a socket.',
    callback:
      'Fragment 1-1 said "Five fell" — and today Meira\'s margin note admits every history counts only four.',
    riddle: {
      q: 'What has a tongue that cannot speak, a sole that cannot feel, and needs my needle after a day on the glass?',
      a: 'A boot.',
      quip: 'Walk on the flat panes tomorrow, if you please.',
      accept: ['boot', 'a boot', 'boots', 'shoe', 'a shoe', 'shoes'],
      maxTries: 3,
    },
    nudge:
      '{friend:Aim}, six horses scratched the glass, and one carried double — how fresh were the white scores on the stone?',
    fanOutClue: {
      title: 'The fifth tally-cut',
      text: 'On the underside of the Blackglass marker-ledge, hidden from the rain, four deep strokes are cut in a row — and a fifth stroke sits a thumb\'s-breadth apart, half-polished away.',
      source: 'Challenge & Fight Fan Out (3-3)',
      bearsOnFork:
        'Reinforces the 4-vs-5 stone discrepancy introduced on W3D3.',
      qaNote: 'First use of "fifth" / "five" allowed at W3D3 per First-Use Map.',
    },
  },
  {
    week: 3,
    day: 4,
    id: '3-4',
    place: 'The black ridges',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: true,
    opener:
      'Three chips of Wren\'s windowsill glass on the trail, and a Seeker watch-room built into cold volcanic rock.',
    forkA: 'The Seekers built these ridge rooms to guard a prisoner who could still wake.',
    forkB: 'The Seekers built these ridge rooms to hide from the people of the plain.',
    callback:
      'A single bone die with its spots worn smooth — somebody spent years at that narrow slit window.',
    riddle: {
      q: 'What has six faces, twenty-one eyes, and never sees the hand that throws it?',
      a: 'A bone die.',
      quip: 'Worn smooth by long watches in the dark.',
      accept: ['die', 'a die', 'bone die', 'a bone die', 'dice'],
      maxTries: 3,
    },
    nudge:
      '{friend:Craft}, look at how the narrow window in that sleeping room is angled — what single point in the valley does it watch?',
    fanOutClue: {
      title: 'The sight-line notch',
      text: 'Cut into the sill of the Seeker watch-slit is a V-shaped sight-notch. When you lay your eye to it, it points past the open Blackglass straight at the smoking crown of a round black hill higher up.',
      source: 'Challenge & Fight Fan Out (3-4)',
      bearsOnFork:
        'Shows the Seekers built the shelter specifically to watch the hill where the Fire Stone lay.',
      qaNote: 'Cup Night #5 (3-4).',
    },
  },
  {
    week: 3,
    day: 5,
    id: '3-5',
    place: "The shepherd's hut",
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'They\'re always a step ahead of us.',
    forkA: '"Until the throne rise whole" was carved by the Order who use this hut as a way-station.',
    forkB: '"Until the throne rise whole" is an older village prayer the Order took for themselves.',
    callback:
      'Wren scratched her name low on the doorframe — eight of her black-glass chips are in your hand now.',
    riddle: {
      q: 'What hangs over the bed for fifty winters, eats the hearth-smoke, and never closes an eye?',
      a: 'A roof-beam.',
      quip: 'Cut deep with a knife before any of you were born.',
      accept: ['beam', 'a beam', 'roof-beam', 'the beam', 'rafter', 'lintel', 'timber'],
      maxTries: 3,
    },
    nudge:
      '{friend:Might}, one blanket folded neat and one thrown down by the catching pot — why did they leave at a run?',
    fanOutClue: {
      title: 'Wax on the hearthstone',
      text: 'Beside the dropped tin cup on the hearth sits a ring of black sealing-wax stamped with a plain circle — the riders opened written orders here less than an hour before your boots hit the goat-track.',
      source: 'Challenge & Fight Fan Out (3-5)',
      bearsOnFork:
        'Proves the shepherd\'s hut is an active Order relay post on the road to the Kiln.',
      qaNote: 'Clean Week 3 vocabulary.',
    },
  },
  {
    week: 3,
    day: 6,
    id: '3-6',
    place: 'The cairn',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'The Kiln. That\'s the shepherds\' name for it.',
    forkA: 'The Order is waking the Fire Stone inside the Kiln to carry it away.',
    forkB: 'The Order means to leave the woken Fire Stone burning inside the hill.',
    callback:
      'In the river mine on Week 1 Night 7, the dust on the empty socket rim was fresh — someone had lifted that Stone out.',
    riddle: {
      q: 'What breathes warm air through a cracked crown all winter, yet has no lungs inside its chest?',
      a: 'The Kiln.',
      quip: 'A lamp went in through the crown ahead of us.',
      accept: ['kiln', 'the kiln', 'hill', 'the hill', 'vent', 'volcano'],
      maxTries: 3,
    },
    nudge:
      '{friend:Intellect}, all six fragments point down through the crack in the Kiln\'s crown — why did that watcher on the lower ridge let us climb?',
    fanOutClue: {
      title: 'Two padded carrying-poles',
      text: 'Hidden under a shelf of slate below the cairn lie two ash carrying-poles rigged with leather slings and lined with wet sheep\'s wool — built for two men to carry something heavy and hot.',
      source: 'Challenge & Fight Fan Out (3-6)',
      bearsOnFork:
        'Strongly supports the reading that they intend to carry the woken Stone out of the Kiln.',
      qaNote: 'Clean Week 3 vocabulary.',
    },
  },

  // ==================== WEEK 4 ====================
  {
    week: 4,
    day: 1,
    id: '4-1',
    place: 'Under the Kiln, then Ashcombe',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'Every time they\'ve had knives out at you, not one of you has died.',
    forkA: 'A second Order member hid in the dark passage and cut the prisoner loose.',
    forkB: 'The prisoner\'s ropes were cut by someone who was already standing in the room with us.',
    callback:
      'Before the lamps went out, the captive swore he could not lie — and said: "We\'re not finished with you."',
    riddle: {
      q: 'What holds a man fast while the lamps are lit, yet parts without a sound when a blade touches it in the dark?',
      a: 'A rope.',
      quip: 'Walked out like a man leaving church.',
      accept: ['rope', 'a rope', 'the rope', 'ropes', 'hemp', 'cord'],
      maxTries: 3,
    },
    nudge:
      '{friend:Aim}, you read his footprints in the volcanic ash — did he run for his life, or walk at an even pace?',
    fanOutClue: {
      title: 'Follow them',
      text: 'They end where the ash gives out and the rock turns to bare black glass. No prints come in. Whoever cut him loose came over the glass and was waiting.',
      source: 'Challenge & Fight Fan Out (4-1)',
      bearsOnFork:
        'Frames the central mystery of how the rope-cutter approached and left without leaving incoming ash prints.',
      qaNote:
        'Flagged in report per prompt instructions: reuses the [PRESS ON] detail noted in continuity item L6; left unchanged.',
    },
  },
  {
    week: 4,
    day: 2,
    id: '4-2',
    place: 'The north road',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: true,
    opener:
      'It\'s terrible. Drink it anyway.',
    forkA: 'The small box under four swords holds the Stone from the Kiln.',
    forkB: 'The small box is a decoy to draw us north away from Reedham lake.',
    callback:
      'The silver coin the riders paid the carter with has the king\'s face scraped off one side and the other polished like a mirror.',
    riddle: {
      q: 'What has a face that was scraped away, yet still buys a carter\'s silence on the north road?',
      a: 'A silver coin.',
      quip: 'Polished bright on the blank side.',
      accept: ['coin', 'a coin', 'silver coin', 'a silver coin', 'the coin', 'silver'],
      maxTries: 3,
    },
    nudge:
      '{friend:Charm}, four armed horsemen guarding one box "no bigger than a bread crock" — why ride past the lake without stopping for Joss?',
    fanOutClue: {
      title: 'Scorched wool on the ford-plank',
      text: 'Where the four horsemen rested their box on the wooden bridge-rail at the old ford, the oak is warm and darkened in a neat square, with a singed strand of sheep\'s wool stuck to the pitch.',
      source: 'Challenge & Fight Fan Out (4-2)',
      bearsOnFork:
        'Connects the bread-crock box on the north road to the wool-lined carrying poles from the Kiln (3-6).',
      qaNote: 'Cup Night #6 (4-2).',
    },
  },
  {
    week: 4,
    day: 3,
    id: '4-3',
    place: 'Reedham',
    narratedNoGarrick: false,
    tone: 'quiet',
    cupNight: false,
    opener:
      'I didn\'t leave a warm bar to drown in a lake. I\'d like that noted.',
    forkA: 'They have held Joss for eight nights because they haven\'t found the Water Stone\'s room yet.',
    forkB: 'They have held Joss for eight nights because they are waiting for the right night to use him.',
    callback:
      'In Ashcombe, the grey-coated men said they needed Wren "only the once" — yet they kept her two weeks.',
    riddle: {
      q: 'What burns in every Reedham window at noon, yet gives no heat to the drowned streets outside?',
      a: 'A lamp.',
      quip: 'Eight notches on the doorpost since she lit it.',
      accept: ['lamp', 'a lamp', 'the lamp', 'candle', 'window lamp', 'light'],
      maxTries: 3,
    },
    nudge:
      '{friend:Craft}, look at Joss\'s unfinished wooden boat on the shelf — the hull is done and the knife lies beside it. How sudden was his taking?',
    fanOutClue: {
      title: 'Dry reeds on the threshold',
      text: 'Pressed into the crack of the grandmother\'s back threshold is a twist of pale lake-sedge that only grows on the outer reed island — tracked in on a dry boot eight nights ago.',
      source: 'Challenge & Fight Fan Out (4-3)',
      bearsOnFork:
        'Points across the water toward the reed island while showing the takers came by boat.',
      qaNote: 'Quiet tone day (4-3); riddle hidden unless requested.',
    },
  },
  {
    week: 4,
    day: 4,
    id: '4-4',
    place: 'Old Reedham',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'Two grey-coated ferrymen unloading supplies in a drowned street, and Meira\'s margin note: "\'Moon-blood\' — the old songs\' word for the marked."',
    forkA: '"Moon-blood" in Fragment 4-4 means the marked children and us.',
    forkB: '"Moon-blood" means an older line that woke the Stone the first time.',
    callback:
      'Joss\'s small shoe-prints stopped on the drowned cobbles and turned back toward his grandmother\'s lighted window.',
    riddle: {
      q: 'What has streets of stone, roofs of slate, and only fishes walking down the lane?',
      a: 'A drowned village.',
      quip: 'Old Reedham keeps its cobbles cold.',
      accept: ['old reedham', 'drowned village', 'a drowned village', 'drowned town', 'sunken village', 'reedham'],
      maxTries: 3,
    },
    nudge:
      '{friend:Agility}, the ferrymen were unloading food and dry firewood at the deep water\'s edge — where were they ferrying it to?',
    fanOutClue: {
      title: 'Four loaves in the oilskin',
      text: 'Inside the oilskin bundle the ferrymen dropped on the drowned quay are four small loaves of fresh village bread and a pot of salve — rations for a small table, not a garrison.',
      source: 'Challenge & Fight Fan Out (4-4)',
      bearsOnFork:
        'Shows a small watch-crew is holding Joss alive nearby while waiting.',
      qaNote: 'First use of "moon-blood" allowed at W4D4 per First-Use Map.',
    },
  },
  {
    week: 4,
    day: 5,
    id: '4-5',
    place: 'The reed island',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'In the bottom of the Order\'s boat, among the rope, lie pale curls of whittled wood, still fresh.',
    forkA: 'Joss was moved from the reed island to the drowned village tonight.',
    forkB: 'The reed island was only the ferry staging-post; Joss has been under Old Reedham all along.',
    callback:
      'On his grandmother\'s shelf on Day 3 sat a row of little carved wooden boats with the newest left unfinished.',
    riddle: {
      q: 'What hides an island at dawn, blinds the steersman at noon, and costs nothing to wrap around a lake?',
      a: 'Fog.',
      quip: 'Thick enough to chew out there today.',
      accept: ['fog', 'the fog', 'mist', 'the mist'],
      maxTries: 3,
    },
    nudge:
      '{friend:Aim}, when the fog lifted for a breath, where was that single shuttered lamp shining from?',
    fanOutClue: {
      title: 'Pine shavings in the bilge',
      text: 'The pale wood-curls in the bottom of the captured boat are dry alder — the same soft wood as the unfinished boat on his grandmother\'s shelf — and beside them lies a tiny split mast cut with a dull pocket-knife.',
      source: 'Challenge & Fight Fan Out (4-5)',
      bearsOnFork:
        'Proves Joss was carried in this very boat recently and has his hands free enough to whittle.',
      qaNote: 'Clean Week 4 vocabulary.',
    },
  },
  {
    week: 4,
    day: 6,
    id: '4-6',
    place: 'The tower at night',
    narratedNoGarrick: false,
    tone: 'quiet',
    cupNight: false,
    opener:
      'Under Old Reedham. Down the stair of the drowned church, to a room below the streets.',
    forkA: 'The boat under the tower was a sentry waiting to hear us read the map.',
    forkB: 'The boat under the tower is the courier crew preparing to carry the fourth Stone out.',
    callback:
      'Fragment 4-5 warned us: "We have built a lock. Pray no one ever learns it is also a door."',
    riddle: {
      q: 'What climbs out of the lake with a dry head and drowned feet, and holds a lamp in the wind?',
      a: 'A tower.',
      quip: 'And someone was listening right under its stair.',
      accept: ['tower', 'a tower', 'the tower', 'drowned tower'],
      maxTries: 3,
    },
    nudge:
      '{friend:Craft}, when wood knocked on wood in the black water beneath the stair, which way did the oar-ripples pull?',
    fanOutClue: {
      title: 'Oar-grease on the lower step',
      text: 'On the submerged stone step at the foot of the drowned tower, someone smeared tallow on an iron mooring-ring tonight so a boat could cast off in the dark without a creak.',
      source: 'Challenge & Fight Fan Out (4-6)',
      bearsOnFork:
        'Proves the hidden boat moored silently beneath the tower before you climbed the stair.',
      qaNote: 'Quiet tone day (4-6); first use of "heartbeat" allowed at W4D6/G4 per First-Use Map.',
    },
  },

  // ==================== WEEK 5 ====================
  {
    week: 5,
    day: 1,
    id: '5-1',
    place: 'Reedham, and the waystone',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'The fifth wasn\'t hidden in the hills like the others. Every telling I know ends at Highwall.',
    forkA: 'The Seekers kept the fifth Stone at Highwall because it was too dangerous to move.',
    forkB: 'The Seekers kept the fifth Stone at Highwall because it was part of the seal holding the king.',
    callback:
      'Fragment 1-1 on our very first day on the forest road said: "Four were scattered after. One stayed close."',
    riddle: {
      q: 'What stands by the road for a thousand rains, points every traveller north, and never walks a mile itself?',
      a: 'A waystone.',
      quip: 'Someone spent a patient hour cutting its second line away.',
      accept: ['waystone', 'a waystone', 'the waystone', 'milestone', 'stone', 'signpost'],
      maxTries: 3,
    },
    nudge:
      '{friend:Craft}, look at the second line chiselled off the waystone — was that weathered away by rain, or cut out stroke by stroke?',
    fanOutClue: {
      title: 'Fresh iron-rust in the cut',
      text: 'The word HIGHWALL on the waystone is grey with lichen, but the chiselled-out groove where the second line stood has specks of unrusted steel in the stone grain — someone recut that groove this year so no traveller could read the king\'s title.',
      source: 'Challenge & Fight Fan Out (5-1)',
      bearsOnFork:
        'Shows the erasure and maintenance along the northern road is still active.',
      qaNote: 'First use of "Highwall" allowed at W5D1 per First-Use Map.',
    },
  },
  {
    week: 5,
    day: 2,
    id: '5-2',
    place: "The old kingdom's road",
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'The grass on hundreds of war-graves shivers at dusk, and the heartbeat in the ground is turning the farm beasts wild.',
    forkA: 'The heartbeat is waking because the four Stones from the hills have reached Highwall.',
    forkB: 'The heartbeat is waking because the dark moon is coming round.',
    callback:
      'Fragment 3-1 at the wayside shrine warned: "First they stopped bleeding when cut. Then they stopped sleeping. Then they stopped being ours."',
    riddle: {
      q: 'What beats without a chest, shakes the grass on a hundred graves, and comes from the north at dusk?',
      a: 'The heartbeat.',
      quip: 'You feel that one in your back teeth before you hear it.',
      accept: ['heartbeat', 'the heartbeat', 'a heartbeat', 'pulse'],
      maxTries: 3,
    },
    nudge:
      '{friend:Might}, those farm dogs didn\'t flinch when struck — why did they break off the instant the heartbeat stopped?',
    fanOutClue: {
      title: 'The silent collar-bell',
      text: 'Around the neck of the felled farm dog hangs a brass sheep-bell stuffed tight with river clay. Someone on the north road muffled the beast before turning it loose toward the graves.',
      source: 'Challenge & Fight Fan Out (5-2)',
      bearsOnFork:
        'Shows the Order is actively managing the perimeter along the old kingdom\'s road.',
      qaNote: 'Clean Week 5 vocabulary.',
    },
  },
  {
    week: 5,
    day: 3,
    id: '5-3',
    place: "The herald's gate",
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'It is barred. The bar is new timber, still pale. The iron brackets it lies in are worn smooth, and bright.',
    forkA: 'The Order inside the city bars the gate to keep strangers out while they work.',
    forkB: 'Generations of watchmen have barred the gate from inside to keep what is in the city from walking out.',
    callback:
      'Stacked against the gatehouse wall lie dozens of old bars, the lowest rotted to a brown line.',
    riddle: {
      q: 'What lies across a doorway for twenty winters, rots to a brown line, and is replaced by a pale brother?',
      a: 'A gate-bar.',
      quip: 'Whoever changes that timber keeps a tidy stack.',
      accept: ['bar', 'a bar', 'gate-bar', 'a gate-bar', 'the bar', 'timber', 'beam'],
      maxTries: 3,
    },
    nudge:
      '{friend:Aim}, from the top of the herald\'s gate, there was only one fire burning in the whole dead city — right below the hall.',
    fanOutClue: {
      title: 'Stacked against the gatehouse',
      text: 'Stacked against the gatehouse wall lie dozens of old bars, the lowest rotted to a brown line. Whoever changes the bar has kept every one.',
      source: 'Challenge & Fight Fan Out (5-3)',
      bearsOnFork:
        'Proves the gate has been continuously barred and maintained across generations, not just this week.',
      qaNote: 'Clean Week 5 vocabulary.',
    },
  },
  {
    week: 5,
    day: 4,
    id: '5-4',
    place: 'The dead streets',
    narratedNoGarrick: false,
    tone: 'quiet',
    cupNight: true,
    opener:
      'My family\'s waited a long time for something. I\'d like to live to see it.',
    forkA: 'Thenearest soldier\'s helm actually turned to watch us pass.',
    forkB: 'The shadows shifted at dusk — the soldiers cannot move until the king wakes.',
    callback:
      'Fragment 5-4 on the house wall said: "When he fell, the soldiers who had been nearest him stopped where they were, mid-stride."',
    riddle: {
      q: 'What stands in the street for an age with its left foot lifted, and never puts its heel down?',
      a: 'A soldier.',
      quip: 'Best not brush a breastplate on your way past.',
      accept: ['soldier', 'a soldier', 'soldiers', 'the soldiers', 'iron soldier', 'hollowed'],
      maxTries: 3,
    },
    nudge:
      '{friend:Intellect}, every soldier in that street stopped with the left heel lifted on the exact same step — what stopped an entire company mid-stride?',
    fanOutClue: {
      title: 'Scraped dust under the heel',
      text: 'Around the boots of thefrozen company, the grey street-dust lies an inch thick — except beneath the last soldier\'s iron gorget, where a crescent of fresh rust flakes fell onto clean stone today.',
      source: 'Challenge & Fight Fan Out (5-4)',
      bearsOnFork:
        'Provides physical evidence that the last soldier\'s helm genuinely turned today.',
      qaNote: 'Cup Night #7 (5-4); Quiet tone day (5-4).',
    },
  },
  {
    week: 5,
    day: 5,
    id: '5-5',
    place: 'Below the hall',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      '"Keep the dark." "It keeps us." And one more chalk stroke crossed out at dusk, leaving eight.',
    forkA: 'The eight chalk strokes count the nights until the dark moon.',
    forkB: 'The eight chalk strokes count the watch-shifts until the fifth Stone is found.',
    callback:
      'Around the watch-fire sit four small chests the size of bread-crocks — the four Stones from the hills are already in the square.',
    riddle: {
      q: 'What grows shorter by one stroke every dusk, yet brings the night closer each time it shrinks?',
      a: 'A chalk tally.',
      quip: 'Eight strokes left on their board tonight.',
      accept: ['tally', 'chalk', 'chalk tally', 'the tally', 'strokes', 'chalk board', 'board'],
      maxTries: 3,
    },
    nudge:
      '{friend:Agility}, the watchmen in the square are facing the sealed hall doors, yet they haven\'t gone inside — why wait outside?',
    fanOutClue: {
      title: 'Four chests by the fire',
      text: 'Set in a neat row beside the watch-captain\'s stool are four small iron-bound boxes — one damp with lake-weed, one dark with volcanic ash, one dusted with mill-flour, and one red with river-mine clay.',
      source: 'Challenge & Fight Fan Out (5-5)',
      bearsOnFork:
        'Confirms all four elemental Stones have already arrived in the square while the Order waits for the eighth night.',
      qaNote: 'Clean Week 5 vocabulary.',
    },
  },
  {
    week: 5,
    day: 6,
    id: '5-6',
    place: 'The wall again',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'Six fragments passed hand to hand in silence, and the fifth is inside the thickness of the wall under our boots.',
    forkA: 'The Seekers hid the fifth Stone inside the wall so the Order would never find it.',
    forkB: 'The Seekers hid the fifth Stone overlooking the square so a watchman could guard both.',
    callback:
      'Fragment 5-5 at the broken fountain told us: "We kept the fifth where we could watch it, and watch him."',
    riddle: {
      q: 'What has a slit for an eye, stone for a coat, and hides a room inside its ribs?',
      a: 'The city wall.',
      quip: 'Forty paces across the open walk, and not a lantern lifted.',
      accept: ['wall', 'the wall', 'city wall', 'the city wall', 'outer wall'],
      maxTries: 3,
    },
    nudge:
      '{friend:Charm}, when the lookout\'s hand dropped at the watch-change, why did nobody on the wall look up at the walkway?',
    fanOutClue: {
      title: 'Unmortared seam by the slit',
      text: 'At knee-height beside the narrow slit window, the mortar between two wall-blocks is only dry grey sand brushed in with a thumb — someone has known where this seam sits for a very long time.',
      source: 'Challenge & Fight Fan Out (5-6)',
      bearsOnFork:
        'Shows the hidden wall room was built for deliberate access overlooking the hall.',
      qaNote: 'Clean Week 5 vocabulary.',
    },
  },

  // ==================== WEEK 6 ====================
  {
    week: 6,
    day: 1,
    id: '6-1',
    place: 'The wall room (Six nights)',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'I kept a tally behind my bar for years. Most of it was who owed me.',
    forkA: 'The fifth Stone didn\'t answer our palms because we are in the wrong room.',
    forkB: 'The fifth Stone didn\'t answer our palms because it is waiting for the dark moon.',
    callback:
      'Twice boots scraped right past the hidden wall door — to any hand without Seeker blood, it is only stone.',
    riddle: {
      q: 'What points down into the dark under the wall, yet never moves a finger?',
      a: 'A carved arrow.',
      quip: 'Scratched under the window-sill by the last watch.',
      accept: ['arrow', 'an arrow', 'carved arrow', 'the arrow'],
      maxTries: 3,
    },
    nudge:
      '{friend:Intellect}, Fragment 5-3 said "Four of us gave to the four. None of us gave to the fifth." Why didn\'t the Seekers give their blood to the fifth?',
    fanOutClue: {
      title: 'Dry linen in the wall-chest',
      text: 'In the cedar box beneath the fifth Stone\'s cradle lie four clean rolls of white bandage-linen and a dry bronze lancet — left by the Seekers, yet the stone cradle itself has no blood-stain on its rim.',
      source: 'Challenge & Fight Fan Out (6-1)',
      bearsOnFork:
        'Deepens the question of why the fifth Stone did not drink Seeker blood in the wall room.',
      qaNote: 'Garrick present in Week 6 Day 1.',
    },
  },
  {
    week: 6,
    day: 2,
    id: '6-2',
    place: 'The barracks under the wall (Five nights)',
    narratedNoGarrick: false,
    tone: 'quiet',
    cupNight: false,
    opener:
      'The heartbeat comes. The soldier in the stair doorway turns, steps past you, and climbs toward the hall.',
    forkA: 'The iron soldiers ignore us because they only hear the king\'s call.',
    forkB: 'The iron soldiers ignore us because we carry the fifth Stone.',
    callback:
      'On the soldiers\' street on Week 5 Day 4, every one of them stood frozen mid-stride — now they are climbing the hill.',
    riddle: {
      q: 'What walks up the stair when the heartbeat sounds, yet draws no breath at the top?',
      a: 'An iron soldier.',
      quip: 'Stepped right over the dust without looking down.',
      accept: ['soldier', 'iron soldier', 'an iron soldier', 'the soldier', 'hollowed', 'armour'],
      maxTries: 3,
    },
    nudge:
      '{friend:Might}, when you cleared the fallen beam in the barracks, why were all the soldiers\' bunks still made up neat?',
    fanOutClue: {
      title: 'Unburned tallow by the bunks',
      text: 'Beside every neatly folded blanket in the underground barracks sits a full tallow dip that was never lit — matches Fragment 2-4: "he told us to sleep," and none of them ever woke as men again.',
      source: 'Challenge & Fight Fan Out (6-2)',
      bearsOnFork:
        'Connects the sleeping barracks directly to the night the king went down alone and bound his army.',
      qaNote: 'Quiet tone day (6-2); Garrick present.',
    },
  },
  {
    week: 6,
    day: 3,
    id: '6-3',
    place: 'The great square (Four nights)',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'Eleven watchmen by the fire now, four strokes left on the board, and the stone wall of the hall is warm under your palm.',
    forkA: 'The hall wall is warm because the king is waking inside.',
    forkB: 'The hall wall is warm because the four Stones in the square are answering him through the rock.',
    callback:
      'Fragment 6-3 on the warm wall says: "We left him on the floor of his own hall, where he fell... We carried the five away, one by one."',
    riddle: {
      q: 'What has no hearth inside it, no sun above it, and still warms a flat palm through three feet of stone?',
      a: 'The sealed hall.',
      quip: 'Something on the other side of that wall is awake.',
      accept: ['hall', 'the hall', 'wall', 'the wall', 'the warm wall', 'sealed hall'],
      maxTries: 3,
    },
    nudge:
      '{friend:Agility}, six of those eleven watchmen still had road-dust to the knee — why are they still arriving with four nights left?',
    fanOutClue: {
      title: 'The fire',
      text: 'Eleven watchmen. Six have road-dust to the knee and packs not yet unrolled — they did not send for men to hunt you; these were already coming for the night.',
      source: 'Challenge & Fight Fan Out (6-3)',
      bearsOnFork:
        'Proves the Order is gathering for the fourth night from now rather than searching the city for you.',
      qaNote: 'Garrick present in W6D3 (no empty seat or store lock).',
    },
  },
  {
    week: 6,
    day: 4,
    id: '6-4',
    place: 'The hill behind the hall (Three nights)',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'The Seekers sealed the doors they knew about.',
    forkA: 'The Seekers left the hidden crack so their children could go in and finish him.',
    forkB: 'The Seekers left the hidden crack because they could not seal themselves inside.',
    callback:
      'Fragment 6-4 in the crack confessed: "We sealed his doors with our own hands and left one way in, that only our blood will open. Forgive us for leaving it at all."',
    riddle: {
      q: 'What has no hinges, no keyhole, and only opens when a marked palm bleeds under a dark sky?',
      a: 'The blank rock.',
      quip: 'And the Order in the square doesn\'t have your blood.',
      accept: ['rock', 'blank rock', 'the blank rock', 'door', 'the door', 'seeker door', 'stone'],
      maxTries: 3,
    },
    nudge:
      '{friend:Aim}, every iron soldier in Highwall faces the hall — why was the one in the crack facing outward toward us?',
    fanOutClue: {
      title: 'Chisel-scars on the soldier\'s heels',
      text: 'The iron boots of the outward-facing sentry in the crack are bolted into lead plugs poured by the Seekers themselves — they turned one of the king\'s own frozen guards around to bar their back door against strangers.',
      source: 'Challenge & Fight Fan Out (6-4)',
      bearsOnFork:
        'Explains why that single sentry faced outward and why the Seekers feared anyone else finding the crack.',
      qaNote: 'Garrick present in W6D4.',
    },
  },
  {
    week: 6,
    day: 5,
    id: '6-5',
    place: 'The moon-tower (Two nights)',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: false,
    opener:
      'It always comes back.',
    forkA: 'The dark moon is a natural eclipse the sky-watchers knew how to count.',
    forkB: 'The dark moon is caused by the five Stones waking together.',
    callback:
      'Counted forward across the blank stone from the night he fell, your finger lands on the doorpost — two nights left, matching the Order\'s chalk board to the hour.',
    riddle: {
      q: 'What puts the chisel down on the ledge, leaves the sky dark at midnight, and comes back to the same doorpost in two nights?',
      a: 'The dark moon.',
      quip: 'Sky-watchers kept a cleaner slate than any innkeeper.',
      accept: ['dark moon', 'the dark moon', 'moon', 'the moon', 'eclipse'],
      maxTries: 3,
    },
    nudge:
      '{friend:Craft}, the chisel and mallet are still lying on the ledge where the sky-watcher set them down — how fast did that night end?',
    fanOutClue: {
      title: 'The blank stone',
      text: 'On the ledge under the last moon, a chisel is lying where it was put down, the mallet beside it. Nobody came back for them.',
      source: 'Challenge & Fight Fan Out (6-5)',
      bearsOnFork:
        'Shows the sky-watchers\' record stopped abruptly on the exact night the dark moon fell.',
      qaNote: 'Garrick present in W6D5.',
    },
  },
  {
    week: 6,
    day: 6,
    id: '6-6',
    place: 'The crack in the hill (One night)',
    narratedNoGarrick: false,
    tone: 'wry',
    cupNight: true,
    opener:
      'Drinks are on me. Don\'t get used to it.',
    forkA: 'Tomorrow night we carry the fifth Stone through the Seekers\' door to break the waking.',
    forkB: 'Tomorrow night we keep the fifth Stone outside the hall until the dark moon passes.',
    callback:
      'All six fragments of the final week join on the blank rock inside the crack: "If you are reading this, you are ours — and if he ever stirs, finish what we could not."',
    riddle: {
      q: 'What has been poured eight times on this road for someone who wasn\'t by the fire, and sits full one last night?',
      a: 'The extra cup.',
      quip: 'Rest your hands tonight. Tomorrow the door opens.',
      accept: ['cup', 'extra cup', 'the extra cup', 'tin cup', 'a cup'],
      maxTries: 3,
    },
    nudge:
      '{friend:Might}, two whole columns of iron walked past us up the hill toward the hall — why didn\'t a single helm turn our way tonight?',
    fanOutClue: {
      title: 'Fresh oil on the hall steps',
      text: 'At the top of the square where the walking iron ranks halt before the sealed doors, the Order has laid four open iron cradles in a semicircle — with a fifth empty cradle set directly before the threshold.',
      source: 'Challenge & Fight Fan Out (6-6)',
      bearsOnFork:
        'Frames the final choice of bringing the fifth Stone into the hall tomorrow night.',
      qaNote: 'Cup Night #8 (6-6); Garrick present.',
    },
  },
];

export function getCampfireDayEntry(week: number, day: number): CampfireDayEntry {
  const safeWeek = Math.min(6, Math.max(1, week));
  const safeDay = Math.min(6, Math.max(1, day));
  const id = `${safeWeek}-${safeDay}`;
  return (
    CAMPFIRE_DAYS_DATA.find((d) => d.id === id) ||
    CAMPFIRE_DAYS_DATA[0]
  );
}

/**
 * Strips internal QA-only fields (`bearsOnFork` and `qaNote`) so they can never be rendered to players.
 */
export function getPublicFanOutClue(week: number, day: number): CampfireFanOutCluePublic {
  const entry = getCampfireDayEntry(week, day);
  return {
    title: entry.fanOutClue.title,
    text: entry.fanOutClue.text,
    source: entry.fanOutClue.source,
  };
}

/**
 * Resolves `{friend:Attribute}` dynamically to the friend with the highest score in that Attribute.
 */
export function resolveCampfireNudgeText(
  nudgeTemplate: string,
  partyAttributes?: Record<FriendId, Record<AttributeName, number>>,
  youName: string = 'You'
): { resolvedText: string; targetFriend: FriendId; attribute: AttributeName } {
  const match = nudgeTemplate.match(/\{friend:([A-Za-z]+)\}/);
  const attr = ((match?.[1] as AttributeName) || 'Intellect') as AttributeName;

  const defaultScores: Record<FriendId, Record<AttributeName, number>> = {
    YOU: { Charm: 38, Agility: 34, Intellect: 30, Might: 26, Craft: 28, Aim: 32 },
    MEI: { Intellect: 44, Charm: 40, Craft: 30, Agility: 28, Aim: 26, Might: 24 },
    DEV: { Aim: 44, Agility: 40, Might: 32, Craft: 28, Charm: 26, Intellect: 26 },
    ARJUN: { Craft: 44, Might: 42, Intellect: 32, Aim: 28, Agility: 24, Charm: 24 },
  };

  const scores = partyAttributes || defaultScores;
  const order: FriendId[] = ['MEI', 'DEV', 'ARJUN', 'YOU'];
  let bestFriend: FriendId = 'MEI';
  let bestScore = -1;

  for (const fid of order) {
    const val = scores[fid]?.[attr] ?? 0;
    if (val > bestScore) {
      bestScore = val;
      bestFriend = fid;
    }
  }

  const displayNames: Record<FriendId, string> = {
    YOU: youName,
    MEI: 'Mei',
    DEV: 'Dev',
    ARJUN: 'Arjun',
  };

  const resolvedText = nudgeTemplate.replace(
    /\{friend:[A-Za-z]+\}/g,
    displayNames[bestFriend]
  );

  return {
    resolvedText,
    targetFriend: bestFriend,
    attribute: attr,
  };
}

export interface DayTheoryPin {
  friendId: FriendId;
  friendName: string;
  reading: 'A' | 'B' | 'NEITHER';
  readingText: string;
  customLine?: string;
  timestamp: string;
  fromPrivatePrompt?: boolean;
  storedAck?: string;
}

export interface DayQuestionPin {
  id: string;
  authorId: FriendId;
  authorName: string;
  questionText: string;
  timestamp: string;
  readToNextArrival: boolean;
}

export interface MessageInABottle {
  authorId: FriendId;
  authorName: string;
  text: string;
  timestamp: string;
}

export interface CampfireEveningTelemetry {
  dayId: string;
  friendsAttended: FriendId[];
  pinsCount: number;
  questionsPinnedCount: number;
  riddleTries: number;
  riddleSolved: boolean;
  riddleGivenUp: boolean;
  durationSeconds: number;
  garrickMessagesSent: number;
  leaveFireTaps: number;
}

const lastLineIndexByPool: Record<string, number> = {
  theoryPinAcks: -1,
  closers: -1,
};

/**
 * Picks the next stored line from a pool without ever repeating the same line twice in a row.
 */
export function pickRotatedCampfireLine(
  poolKey: 'theoryPinAcks' | 'closers',
  friendDisplayName: string = 'friend'
): string {
  const pool = CAMPFIRE_STORED_LINES[poolKey];
  const prevIdx = lastLineIndexByPool[poolKey] ?? -1;
  const nextIdx = (prevIdx + 1) % pool.length;
  lastLineIndexByPool[poolKey] = nextIdx;
  return pool[nextIdx].replace(/\{friend\}/g, friendDisplayName);
}

/**
 * Evaluates true Noticing templates for the evening and returns at most TWO lines.
 */
export function evaluateEveningNoticings(params: {
  bruisedScrapeFriend?: string | null;
  solvedFragmentFirstFriend?: string | null;
  lentRelicFriend?: string | null;
  missedYesterdayFriend?: string | null;
  notYetArrivedFriends?: string[];
}): string[] {
  const lines: string[] = [];
  const tpl = CAMPFIRE_STORED_LINES.noticingTemplates;

  if (params.bruisedScrapeFriend) {
    lines.push(tpl.bruisedScrape.replace('{friend}', params.bruisedScrapeFriend));
  }
  if (params.solvedFragmentFirstFriend && lines.length < 2) {
    lines.push(tpl.solvedFragmentFirst.replace('{friend}', params.solvedFragmentFirstFriend));
  }
  if (params.lentRelicFriend && lines.length < 2) {
    lines.push(tpl.lentRelic.replace('{friend}', params.lentRelicFriend));
  }
  if (params.missedYesterdayFriend && lines.length < 2) {
    lines.push(tpl.backAfterMissedDay.replace('{friend}', params.missedYesterdayFriend));
  }
  if (
    params.notYetArrivedFriends &&
    params.notYetArrivedFriends.length > 0 &&
    lines.length < 2
  ) {
    lines.push(
      tpl.notYetArrived.replace('{friend}', params.notYetArrivedFriends[0])
    );
  }

  return lines.slice(0, 2);
}

/**
 * Builds factual one-line summaries per friend for Step 7 ("What We Did Today").
 * Only emits lines for actions actually taken today; never grades theories or attaches gold.
 */
export function buildWhatWeDidTodayLines(params: {
  dayEntry: CampfireDayEntry;
  youName: string;
  arrivedFriends: FriendId[];
  clueContributors: FriendId[];
  solvedWord1By?: string;
  solvedWord2By?: string;
  relicGiftedByYouTo?: string | null;
  challengeClearedByYou?: boolean;
  bruisedScrapeByYou?: boolean;
}): { friendId: FriendId; friendName: string; line: string }[] {
  const nameMap: Record<FriendId, string> = {
    YOU: params.youName || 'You',
    MEI: 'Mei',
    DEV: 'Dev',
    ARJUN: 'Arjun',
  };

  const results: { friendId: FriendId; friendName: string; line: string }[] = [];
  const roster: FriendId[] = ['YOU', 'MEI', 'DEV', 'ARJUN'];

  for (const fid of roster) {
    const fname = nameMap[fid];
    const parts: string[] = [];

    if (fid === 'YOU') {
      if (params.challengeClearedByYou) {
        parts.push(`cleared the landmark roll at ${params.dayEntry.place}`);
      } else if (params.bruisedScrapeByYou) {
        parts.push(`pressed through a bruised scrape at ${params.dayEntry.place}`);
      }
      if (params.relicGiftedByYouTo) {
        parts.push(`handed a Relic to ${params.relicGiftedByYouTo}`);
      }
    }

    if (params.clueContributors.includes(fid)) {
      parts.push(`brought back "${params.dayEntry.fanOutClue.title}" from Fan Out`);
    }

    const solvedW1 =
      params.solvedWord1By &&
      params.solvedWord1By.toLowerCase() === fname.toLowerCase();
    const solvedW2 =
      params.solvedWord2By &&
      params.solvedWord2By.toLowerCase() === fname.toLowerCase();

    if (solvedW1 && solvedW2) {
      parts.push(`unlocked both stone-words on Fragment ${params.dayEntry.id}`);
    } else if (solvedW1 || solvedW2) {
      parts.push(
        `unlocked lock-word ${solvedW1 ? '1' : '2'} on Fragment ${params.dayEntry.id}`
      );
    }

    if (parts.length > 0) {
      results.push({
        friendId: fid,
        friendName: fname,
        line: `${fname} ${parts.join(' · ')}.`,
      });
    }
  }

  return results;
}

export interface CampfireQAVerificationReport {
  totalDays: number;
  w1d1NoGarrickNoRiddle: boolean;
  cupNightsCount: number;
  cupNightsExactMatch: boolean;
  quietDaysCount: number;
  quietDaysExactMatch: boolean;
  firstUseMapViolations: string[];
  bannedPhraseViolations: string[];
  goldMentionViolations: string[];
  genericFallbackViolations: string[];
  flaggedCanonAuditNotes: { id: string; title: string; note: string }[];
  allPassed: boolean;
}

/**
 * Automated 36-Day QA & First-Use Map Verifier (Part 2 + Part 4 + Part 8).
 */
export function runCampfireV22Verifier(): CampfireQAVerificationReport {
  const firstUseMapViolations: string[] = [];
  const bannedPhraseViolations: string[] = [];
  const goldMentionViolations: string[] = [];
  const genericFallbackViolations: string[] = [];

  const bannedPhrases = [
    'maybe',
    'perhaps',
    'possibly',
    'i promise',
    "i don't know",
    'i do not know',
    "couldn't say",
    "wouldn't know",
  ];

  for (const d of CAMPFIRE_DAYS_DATA) {
    const pos = d.week * 10 + d.day;
    const textBundle = [
      d.opener,
      d.forkA,
      d.forkB,
      d.callback,
      d.nudge,
      d.riddle?.q || '',
      d.riddle?.a || '',
      d.riddle?.quip || '',
      d.fanOutClue.title,
      d.fanOutClue.text,
    ].join(' ');
    const lower = textBundle.toLowerCase();

    // 1. First-Use Map Checks
    if (pos < 31 && /\bthe order\b|\border's\b/i.test(textBundle)) {
      firstUseMapViolations.push(`${d.id}: named "Order" before W3D1`);
    }
    if (pos < 21 && /\bfour children\b|\bfour names\b/i.test(textBundle)) {
      firstUseMapViolations.push(`${d.id}: named "four children / four names" before W2D1`);
    }
    if (pos < 25 && /\bking\b|\bking's\b/i.test(textBundle)) {
      firstUseMapViolations.push(`${d.id}: named "king" before W2D5`);
    }
    if (/\bmalakor\b/i.test(textBundle)) {
      firstUseMapViolations.push(`${d.id}: named "Malakor" at Campfire (never allowed)`);
    }
    if (pos < 33 && /\bfifth\b|\bfive stones\b/i.test(textBundle)) {
      firstUseMapViolations.push(`${d.id}: named "fifth / five" before W3D3`);
    }
    if (pos < 44 && /\bmoon-blood\b/i.test(textBundle)) {
      firstUseMapViolations.push(`${d.id}: named "moon-blood" before W4D4`);
    }
    if (pos < 51 && /\bhighwall\b/i.test(textBundle)) {
      firstUseMapViolations.push(`${d.id}: named "Highwall" before W5D1`);
    }
    if (pos < 46 && /\bheartbeat\b/i.test(textBundle)) {
      firstUseMapViolations.push(`${d.id}: named "heartbeat" before W4D6`);
    }

    // 2. Banned Phrases
    for (const bp of bannedPhrases) {
      if (lower.includes(bp)) {
        bannedPhraseViolations.push(`${d.id}: contains banned phrase "${bp}"`);
      }
    }

    // 3. Zero Gold Mentions in Campfire Data
    if (/\+\d+\s*g\b|\bgold\b/i.test(textBundle)) {
      goldMentionViolations.push(`${d.id}: mentions gold in Campfire data`);
    }

    // 4. Zero Generic Fallback Text
    if (/courier box|waxed tally-strip|perimeter note/i.test(textBundle)) {
      genericFallbackViolations.push(`${d.id}: contains generic fallback text`);
    }
  }

  const d11 = getCampfireDayEntry(1, 1);
  const w1d1NoGarrickNoRiddle = d11.narratedNoGarrick === true && d11.riddle === null;

  const cupDays = CAMPFIRE_DAYS_DATA.filter((d) => d.cupNight).map((d) => d.id);
  const cupNightsExactMatch =
    cupDays.length === CUP_NIGHT_IDS.length &&
    cupDays.every((id, i) => id === CUP_NIGHT_IDS[i]);

  const quietDays = CAMPFIRE_DAYS_DATA.filter((d) => d.tone === 'quiet').map((d) => d.id);
  const quietDaysExactMatch =
    quietDays.length === QUIET_DAY_IDS.length &&
    quietDays.every((id, i) => id === QUIET_DAY_IDS[i]);

  const flaggedCanonAuditNotes = [
    {
      id: '3-1',
      title: 'W3·D1 ("The warm one")',
      note: 'Corin says the men called Wren "the warm one" and never said why; flagged against Episode 3 Day 1 chapter text and preserved unchanged per build brief.',
    },
    {
      id: '2-2',
      title: 'W2·D2 ("The ruts")',
      note: 'Reuses the [PRESS ON] cart-rut detail noted in continuity item L1; flagged in report and preserved unchanged per build brief.',
    },
    {
      id: '4-1',
      title: 'W4·D1 ("Follow them")',
      note: 'Reuses the [PRESS ON] wet reed-stalk detail noted in continuity item L6; flagged in report and preserved unchanged per build brief.',
    },
  ];

  const allPassed =
    CAMPFIRE_DAYS_DATA.length === 36 &&
    w1d1NoGarrickNoRiddle &&
    cupNightsExactMatch &&
    quietDaysExactMatch &&
    firstUseMapViolations.length === 0 &&
    bannedPhraseViolations.length === 0 &&
    goldMentionViolations.length === 0 &&
    genericFallbackViolations.length === 0;

  return {
    totalDays: CAMPFIRE_DAYS_DATA.length,
    w1d1NoGarrickNoRiddle,
    cupNightsCount: cupDays.length,
    cupNightsExactMatch,
    quietDaysCount: quietDays.length,
    quietDaysExactMatch,
    firstUseMapViolations,
    bannedPhraseViolations,
    goldMentionViolations,
    genericFallbackViolations,
    flaggedCanonAuditNotes,
    allPassed,
  };
}

