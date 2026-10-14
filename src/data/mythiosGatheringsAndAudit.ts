import { AttributeName } from './mythiosRulesData';
import { SEEKER_FRAGMENTS } from './mythiosFragments';
import { WEEKDAY_INVENTORY } from './mythiosChaptersData';

export interface GatheringData {
  week: number;
  title: string;
  location: string;
  tonightMessage: string;
  approachQuestion: string;
  approachOptA: { label: string; desc: string; attr: AttributeName; bestFriend: string; bestBonus: number };
  approachOptB: { label: string; desc: string; attr: AttributeName; bestFriend: string; bestBonus: number };
  enemyName: string;
  conditionText: string;
  ueTitle: string;
  ueAttr: AttributeName;
  ueBarAName: string;
  ueBarBName: string;
  ueWinText: string;
  ueLoseText: string;
  matches: {
    scriptureQuote: string;
    correctFragmentId: string;
    revealLine: string;
  }[];
  tableQuestion: string;
  hypothesisA: { title: string; line: string };
  hypothesisB: { title: string; line: string };
  hypothesisC: { title: string; line: string };
  correctHypothesis: 'A' | 'B' | 'C';
  wrongHypothesisHint: string;
  tableAnswer: string;
  twistHeadline: string;
  cliffhangerText: string;
}

export const GATHERINGS_DATA: GatheringData[] = [
  {
    week: 1, title: 'Gathering 1 · The Mine', location: 'Old river mine across the ford',
    tonightMessage: 'Tonight: the Gathering. The map ends across the ford, at the mark from Meira\'s rubbing. Tonight calls on Might.',
    approachQuestion: 'HOW DO YOU GO IN?',
    approachOptA: { label: 'GARRICK\'S WAY', desc: 'A dry side-passage up the bank. Come in above them.', attr: 'Aim', bestFriend: 'Dev', bestBonus: 2 },
    approachOptB: { label: 'THE DROWNED MOUTH', desc: 'Waist-deep, with the river loud enough to cover you.', attr: 'Agility', bestFriend: 'Jennifer', bestBonus: 2 },
    enemyName: 'Mine Guard',
    conditionText: 'This is a Battle. All of you fight at once, and it ends when the last enemy falls.',
    ueTitle: 'THE DROP', ueAttr: 'Might', ueBarAName: 'The Drop', ueBarBName: 'Dev HP',
    ueWinText: 'Dev comes out of the hole like a cork onto stone. In the chamber beyond, the dust on the empty socket\'s rim is undisturbed—lifted out recently, not centuries ago.',
    ueLoseText: 'Dev washes out alive at the drowned mouth; by the time you lift the slab, your own wet boots have trampled the dust on the socket\'s rim.',
    matches: [
      {
        scriptureQuote: '“The child was born on the night the moon went dark.”',
        correctFragmentId: '1-4',
        revealLine: 'From the Fenmark well: "Born when the dark has eaten the moon, marked before the first cry\'s through."',
      },
      {
        scriptureQuote: '“Only the right blood-touch opens the stone housing.”',
        correctFragmentId: '1-3',
        revealLine: 'From the Widow\'s Tooth: "Not every hand that tries will open it. Some locks already know their key."',
      },
      {
        scriptureQuote: '“What sealed the chamber is the very thing that will unseal it.”',
        correctFragmentId: '1-6',
        revealLine: 'From the ford-stone: "The key that locks is also the key that unlocks."',
      },
    ],
    tableQuestion: 'Your names were on a list. So are these four under the empty socket (Tamsin\'s first). What is different about them?',
    hypothesisA: {
      title: 'THEY ARE ALL CHILDREN’S NAMES',
      line: 'Tamsin is nine years old—these four names under the socket are all children. The list Meira left us was never a bounty on our heads; she sent us to find the children.',
    },
    hypothesisB: {
      title: 'THEY ARE RIVAL MERCENARIES HIRED TO HUNT US',
      line: 'Those four names are another crew of road-wardens hired to ambush us at the Hollow Wake Inn and take the reward.',
    },
    hypothesisC: {
      title: 'THEY ARE THE FOUR ORIGINAL SEEKER ELDERS',
      line: 'The four names carved under the socket are the ancient Seeker founders who built this river mine centuries ago.',
    },
    correctHypothesis: 'A',
    wrongHypothesisHint: 'Mei shakes her head gently: "Look at the first name on the wall—Tamsin. She is nine years old, and the charcoal woman’s nephew was a child too. Look again at who those four names really are."',
    tableAnswer: 'They are children\'s names. This was never about you.',
    twistHeadline: 'This was never about you.',
    cliffhangerText: 'Garrick counts the names twice: "Three more." From the mine mouth, far behind you: one horse, already at a full gallop, going away.',
  },
  {
    week: 2, title: 'Gathering 2 · Under the Mill Hill', location: 'The older room down the soft stair',
    tonightMessage: 'Tonight: the Gathering. The old shaft goes down to a room older than the mill, and they are digging toward it. Tonight calls on Intellect.',
    approachQuestion: 'HOW DO YOU GO DOWN?',
    approachOptA: { label: 'NOW, UNDER THE CHANT', desc: 'The chanting swallows the scrape of your boots.', attr: 'Agility', bestFriend: 'Jennifer', bestBonus: 2 },
    approachOptB: { label: 'WAIT, AND COUNT', desc: 'Hold at the stair\'s turn until you set every voice in its place.', attr: 'Aim', bestFriend: 'Dev', bestBonus: 2 },
    enemyName: 'The Robed',
    conditionText: 'The chant: while more than half of them are standing, each has DEF +1.',
    ueTitle: 'THE BREACH', ueAttr: 'Intellect', ueBarAName: 'The Tunnel', ueBarBName: 'The Room',
    ueWinText: 'The last prop goes and the hill shuts their tunnel like a book. The room is yours: you have time to Look Closer (+75g) and separate the scorched leaves of the Verse in order.',
    ueLoseText: 'The room comes in; you escape up the soft stair with Corin and the ledger, but lose your chance to Look Closer in the chamber and must piece the Verse together from three loose clumps.',
    matches: [
      {
        scriptureQuote: '“…one wall, and one king upon it.”',
        correctFragmentId: '2-1',
        revealLine: 'From the farmhouse on the mill road: "We held his last wall the night it was meant to fall. Not one of us expected to see morning."',
      },
      {
        scriptureQuote: '“He opened his palm with his own knife.”',
        correctFragmentId: '2-4',
        revealLine: 'From the roots at the shaft\'s mouth: "The moon went out, and he went down alone into the oldest rooms of the house. When he came back up, his hand was bleeding, and he told us to sleep."',
      },
      {
        scriptureQuote: '“The enemy’s fires outnumbered the stars across the plain.”',
        correctFragmentId: '2-2',
        revealLine: 'From the mill wheel: "Their campfires filled the plain from our wall to the hills. The first night we tried to count them. By the third, we had stopped."',
      },
    ],
    tableQuestion: 'The miller\'s wife said they knew the night Corin was born. Meira\'s page has a date beside each of your names. What do these nights have in common?',
    hypothesisA: {
      title: 'THEY ARE THE NIGHTS THE STONES FELL',
      line: 'The dates beside our names record the ancient nights when the four elemental stones first fell from the sky.',
    },
    hypothesisB: {
      title: 'EVERY ONE OF US WAS BORN UNDER A DARK MOON',
      line: 'Just like Corin and Tamsin, every date beside our four names in Meira’s notebook is a night the moon went dark—we carry the exact same mark.',
    },
    hypothesisC: {
      title: 'THEY ARE THE DATES WE JOINED MEIRA’S COMPANY',
      line: 'Meira wrote down the calendar day each of us first signed her ledger to take the road-warden contract.',
    },
    correctHypothesis: 'B',
    wrongHypothesisHint: 'Mei points to the birth-years in Meira’s notebook: "Those dates aren’t centuries old or contract dates—they match our own birth-years, and the miller’s wife said the takers knew the night Corin was born. What kind of night was it?"',
    tableAnswer: 'Every one of them is a night the moon went dark. You\'re marked too. Every one of you.',
    twistHeadline: 'You\'re marked too. Every one of you.',
    cliffhangerText: 'Garrick tucks the ledger inside his coat: "Two places. Two children." Corin whispers: "There was a girl down here with me... She said they told her she was going somewhere warm."',
  },
  {
    week: 3, title: 'Gathering 3 · Under the Kiln', location: 'The warm chamber beneath the black hill',
    tonightMessage: 'Tonight: the Gathering. The map goes in through the crack in the Kiln\'s crown. A lamp went in before you. Tonight calls on Agility.',
    approachQuestion: 'HOW DO YOU GO DOWN?',
    approachOptA: { label: 'THE ROPE', desc: 'One at a time. Slow, and quiet.', attr: 'Craft', bestFriend: 'Arjun', bestBonus: 4 },
    approachOptB: { label: 'THE SCREE', desc: 'All together, down the slope of loose black glass.', attr: 'Might', bestFriend: 'Mei', bestBonus: 2 },
    enemyName: 'The Faithful',
    conditionText: 'Blade and torch: when an enemy hits a friend, that friend loses 2 more HP at the start of the next round.',
    ueTitle: 'THE SCREE', ueAttr: 'Agility', ueBarAName: 'The Climb', ueBarBName: 'Wren\'s Hold',
    ueWinText: 'You have her wrist; she comes down the rope inside your arm unhurt, her fist still shut on a polished chip of black glass.',
    ueLoseText: 'The slope lets go with a sound like the sea; Wren is alive at the foot of it, cut in a dozen places, and must be carried home tomorrow.',
    matches: [
      {
        scriptureQuote: '“They no longer felt the cold, nor the blade, nor the long fear of dying.”',
        correctFragmentId: '3-1',
        revealLine: 'From behind the wayside shrine: "First they stopped bleeding when cut. Then they stopped sleeping. Then they stopped being ours."',
      },
      {
        scriptureQuote: '“He never spoke a false word to his people — not one. He only kept silent about the price.”',
        correctFragmentId: '3-3',
        revealLine: 'From the Blackglass: "He never lied to us. He only never told us the price."',
      },
      {
        scriptureQuote: '“No tomb was ever cut for him; only living blood holds the seal.”',
        correctFragmentId: '3-6',
        revealLine: 'From the cairn\'s foot: "We never dug him a grave. When we are gone, our blood will have to hold him."',
      },
    ],
    tableQuestion: 'The captive cannot lie. Asked why they take the children, he answers: "To wake him." What does their prayer ("Until the throne rise whole") actually mean?',
    hypothesisA: {
      title: 'THE KING IS NOT DEAD—HE SLEEPS',
      line: '“Until the throne rise whole” isn’t a memorial for a fallen dynasty—their king is still sleeping, and they are using the marked children’s blood to wake him.',
    },
    hypothesisB: {
      title: 'THEY ARE CROWNING ONE OF THE CHILDREN',
      line: 'The Order is gathering the four children to choose a new child-heir to sit on the empty throne.',
    },
    hypothesisC: {
      title: 'THEY ARE REFORGING A SHATTERED STONE CHAIR',
      line: 'The phrase is purely architectural—they are melting black glass in the Kiln to repair a broken throne room.',
    },
    correctHypothesis: 'A',
    wrongHypothesisHint: 'Garrick shakes his head over the captive’s words: "Listen to what the prisoner just swore—he cannot speak a falsehood, and he said \'To wake him.\' Look at the word \'rise\' in their prayer again."',
    tableAnswer: 'Rise. They are not mourning a dead king—he sleeps, and they are waking him.',
    twistHeadline: 'He sleeps. And they are bleeding children to wake him.',
    cliffhangerText: 'Asked why you are still alive, he says: "We\'re not finished with you." Every lamp in the chamber goes out at once; when relit, his ropes lie cut clean and he is gone.',
  },
  {
    week: 4, title: 'Gathering 4 · The Drowned Undercroft', location: 'Under Old Reedham in the Stillwater',
    tonightMessage: 'Tonight: the Gathering. After the oars, in the boat you took from them. Tonight calls on Craft.',
    approachQuestion: 'HOW DO YOU FOLLOW?',
    approachOptA: { label: 'OPEN WATER', desc: 'Quick, and nothing in it to steer by but the sound.', attr: 'Aim', bestFriend: 'Dev', bestBonus: 4 },
    approachOptB: { label: 'THE DROWNED ROOFS', desc: 'A road you can feel with an oar.', attr: 'Might', bestFriend: 'Mei', bestBonus: 2 },
    enemyName: 'The Faithful',
    conditionText: 'Knee-deep: roll a 1, 2 or 3 on a strike and you lose your next strike. So does he.',
    ueTitle: 'THE WATER-GATE', ueAttr: 'Craft', ueBarAName: 'The Pin', ueBarBName: 'His Breath',
    ueWinText: 'The iron pin comes out in your hand; you drag the last of the faithful clear coughing black water, and he answers your Ask board all night.',
    ueLoseText: 'It takes too long; when the gate comes up he is breathing and senseless—the entire Ask board is lost for the night, though Meira\'s brass pen and the torn page are in his pouch.',
    matches: [
      {
        scriptureQuote: '“Their blood remembers what the shards remember.”',
        correctFragmentId: '4-3',
        revealLine: 'From the housing at the drowned tower: "What fell when the moon broke still remembers the moon. So does anyone born in its dark."',
      },
      {
        scriptureQuote: '“The fifth heeds no element at all…”',
        correctFragmentId: '4-2',
        revealLine: 'From the old ford, on the north road: "Earth, wind, water, fire — four we could name. The fifth had no element at all, and we feared it more than the other four together."',
      },
      {
        scriptureQuote: '“Every lock they set in stone was also a way back in.”',
        correctFragmentId: '4-5',
        revealLine: 'From the willow roots: "We have built a lock. Pray no one ever learns it is also a door."',
      },
    ],
    tableQuestion: 'Under the Kiln: a small box going up the vent. On the north road: a closed box under four swords. Tonight: a second boat pulling away. Every socket was empty. Where did they go?',
    hypothesisA: {
      title: 'THE SEEKERS DESTROYED THE FOUR STONES CENTURIES AGO',
      line: 'The sockets are empty because the original Seekers smashed the four stones into dust before hiding the housings.',
    },
    hypothesisB: {
      title: 'THE CHILDREN OPENED THE HOUSINGS & THE STONES WERE CARRIED TO HIM',
      line: 'The Order used each child’s blood to unseal the four sockets and has already carried all four Stones north in those guarded boxes toward the sleeping king.',
    },
    hypothesisC: {
      title: 'THE FOUR STONES SANK INTO THE RIVER MUD',
      line: 'When the valley flooded around Old Reedham, the four elemental stones washed out of their sockets into the river channel.',
    },
    correctHypothesis: 'B',
    wrongHypothesisHint: 'Arjun taps the fresh dust on the socket rim: "Remember the undisturbed dust on the first socket and the small bread-crock box under four swords on the north road—the stones weren’t destroyed or washed away. Where were those boxes heading?"',
    tableAnswer: 'Carried home to him. Every one, through a door that only your blood could open.',
    twistHeadline: 'What the four begin, the fifth shall end—',
    cliffhangerText: 'In the east, the dawn stops halfway. And from far to the north, so deep you feel it in your teeth, comes a single slow sound like a heartbeat.',
  },
  {
    week: 5, title: 'Gathering 5 · The Wall at Highwall', location: 'The Seekers\' hidden room in the wall',
    tonightMessage: 'Tonight: the Gathering. Into the wall, to the room they never found. Tonight calls on Charm.',
    approachQuestion: 'WHERE DO YOU MEET THEM?',
    approachOptA: { label: 'THE GATE-TOWER DOOR', desc: 'They can come at you only one at a time.', attr: 'Might', bestFriend: 'Mei', bestBonus: 4 },
    approachOptB: { label: 'THE STREET', desc: 'Under the herald\'s gate. Room for you, and room for them.', attr: 'Intellect', bestFriend: 'Arjun', bestBonus: 4 },
    enemyName: 'The Hollowed',
    conditionText: 'The hollowed: the first time an enemy is put down, it rises with 2 HP and loses its next strike.',
    ueTitle: 'THE ROLL-CALL', ueAttr: 'Charm', ueBarAName: 'The Roll-Call', ueBarBName: 'Their Trust',
    ueWinText: 'The last post answers "It keeps us" in the wind; on the hill the lantern is set down. The dying watchman recites the Verse of the Binding, and you earn the second Match and Look Closer.',
    ueLoseText: 'A third and fourth lantern light on the hill; you slip inside the wall with no time for Look Closer, and Week 6 Day 1\'s Challenge becomes +2 DC harder.',
    matches: [
      {
        scriptureQuote: '“Those who had stood nearest him, when he fell, stood on.”',
        correctFragmentId: '5-4',
        revealLine: 'From the house wall at the end of the soldiers\' street: "When he fell, the soldiers who had been nearest him stopped where they were, mid-stride. We could not bring ourselves to break them. We left them standing."',
      },
      {
        scriptureQuote: '“They kept it near him, under their own eyes.”',
        correctFragmentId: '5-5',
        revealLine: 'From the broken fountain below the hall: "We kept the fifth where we could watch it, and watch him."',
      },
      {
        scriptureQuote: '“Only on the stones where he fell, under a dark sky, were the five bound.”',
        correctFragmentId: '5-6',
        revealLine: 'From the wall crack: "Where he fell, under the dark moon, the five were joined."',
      },
    ],
    tableQuestion: 'You open your palms over the fifth Stone, and nothing happens. What did the Seekers\' last fragment say?',
    hypothesisA: {
      title: 'ONLY WHERE HE FELL, UNDER THE DARK MOON, WHEN ALL FIVE ARE JOINED',
      line: 'The fifth Stone won’t answer in this wall room—the Seeker verse says the five were joined where he fell, under the dark moon, seven nights from now.',
    },
    hypothesisB: {
      title: 'THE STONE IN THE WALL ROOM IS A COUNTERFEIT DECOY',
      line: 'Our blood failed because the Seekers hid a fake stone in the wall and buried the real fifth Stone outside the city.',
    },
    hypothesisC: {
      title: 'THE FIFTH STONE LOST ITS POWER WHEN THE CITY FELL',
      line: 'Centuries inside the cold outer wall drained the fifth Stone completely, leaving it an inert piece of grey rock.',
    },
    correctHypothesis: 'A',
    wrongHypothesisHint: 'Mei traces Fragment 5-6 by the lantern light: "The Stone itself is real and still alive—feel the heartbeat in the wall. Look at the exact place and night named in the Verse of the Binding: where and when were the five joined?"',
    tableAnswer: '“Where he fell, under the dark moon, the five were joined.” Not here. Not now. Seven nights.',
    twistHeadline: 'Where he fell, under the dark moon. Seven nights.',
    cliffhangerText: 'Garrick binds each of your cut palms in neat white linen. Across the square, a fresh watchman strikes tonight\'s stroke—seven left—and looks straight down the hill at your slit window.',
  },
  {
    week: 6, title: 'Gathering 6 · His Hall (The Finale)', location: 'The sealed hall at Highwall',
    tonightMessage: 'Tonight: the Gathering. Through the Seekers\' door, with the fifth, as the moon goes dark. Tonight calls on Aim.',
    approachQuestion: 'HOW DO YOU GO IN?',
    approachOptA: { label: 'LAMPS DARK', desc: 'Unseen, and half blind.', attr: 'Agility', bestFriend: 'Jennifer', bestBonus: 4 },
    approachOptB: { label: 'LAMPS LIT', desc: 'You will see every step, and so will anything looking.', attr: 'Intellect', bestFriend: 'Arjun', bestBonus: 4 },
    enemyName: 'The Faithful & The Hollowed',
    conditionText: 'Half faithful (the chant: DEF +1 while >50% stand), half hollowed (rises once at 2 HP).',
    ueTitle: 'THE HAWSER', ueAttr: 'Aim', ueBarAName: 'The Hawser', ueBarBName: 'Your Line',
    ueWinText: 'The tarred hawser parts; the great iron lamp crashes down like a bell, breaking the singing line ("The Lamp Came Down" recorded on your Season Summary).',
    ueLoseText: 'The chain holds and you fight through their singing line a step at a time, leaving your palm already bleeding when you reach the ring of four Stones.',
    matches: [
      {
        scriptureQuote: '“They had known him all his life as one of the marked.”',
        correctFragmentId: '6-2',
        revealLine: 'From the barracks hearth: "We were marked, every one of us. That is how we found the shards."',
      },
      {
        scriptureQuote: '“We were only servants, they said.”',
        correctFragmentId: '6-1',
        revealLine: 'From the wall room: "His household ran the night we came to the hall. We let them go. They were only servants."',
      },
      {
        scriptureQuote: '“Only one hidden way remained, sealed to answer Seeker blood alone.”',
        correctFragmentId: '6-4',
        revealLine: 'From the deep crack: "We sealed his doors with our own hands and left one way in, that only our blood will open. Forgive us for leaving it at all."',
      },
    ],
    tableQuestion: 'Your blood fails again. Garrick holds out his hand: "Let me." It answers him in a flood of cold light, and he reads his untorn page: "What the four begin, the fifth shall end, and the throne rise whole."',
    hypothesisA: {
      title: 'GARRICK STOLE MEIRA’S RING TO TRICK THE FIFTH STONE',
      line: 'Garrick is using a hidden artificer’s ring from Meira’s satchel to counterfeit the blood-lock on the fifth Stone.',
    },
    hypothesisB: {
      title: 'MOON-BLOOD IS THE ROYAL HOUSE—GARRICK IS THE LAST HEIR, AND WE CARRIED THE FIFTH IN FOR HIM',
      line: 'Our Seeker blood could open the doors, but the fifth Stone only answers the royal Moon-blood—Garrick is the last of the king’s house, and he guided us here to carry the fifth through the Seekers’ door for him.',
    },
    hypothesisC: {
      title: 'GARRICK IS ONE OF THE IMMORTAL HOLLOWED SOLDIERS',
      line: 'Garrick is an ancient guard from the Soldiers’ Street who survived the fall of Highwall and wants to destroy the throne.',
    },
    correctHypothesis: 'B',
    wrongHypothesisHint: 'Mei stares at Garrick’s bare, bleeding palm over the glowing fifth Stone: "There is no ring on his hand, and a Hollowed soldier has no living blood to give—that is royal Moon-blood answering the King’s Stone, and the extra tin cup he poured every night was for the king. Who is Garrick really?"',
    tableAnswer: 'Moon-blood was the king\'s title, and his house\'s. Garrick is the last of that house. He never lied to you—and you carried the fifth into the hall for him.',
    twistHeadline: 'What the four begin, the fifth shall end, and the throne rise whole.',
    cliffhangerText: 'Garrick sets the extra tin cup beside the king and closes the king\'s hand around the fifth. The king opens his eyes, passes over Garrick, and looks straight at you: "You saved every child you were sent to save."',
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

  // Verify First-Use Canon Gates (including Malakor W2D7+ and Order W3D1+)
  const canonGateLeaks: string[] = [];
  for (const item of WEEKDAY_INVENTORY) {
    const combinedText = `${item.question} ${item.summaryLearned} ${item.youHold} ${item.garrickLine || ''}`.toLowerCase();
    for (const gate of CANON_TERM_GATES) {
      const isBeforeGate = item.week < gate.minWeek || (item.week === gate.minWeek && item.day < gate.minDay);
      if (isBeforeGate) {
        const regex = new RegExp(`\\b${gate.term}\\b`, 'i');
        if (regex.test(combinedText)) {
          canonGateLeaks.push(`W${item.week}D${item.day} (${gate.term})`);
        }
      }
    }
  }

  // Verify Garrick is absent only on W1D1 and present on all 35 other weekday evenings (W1D2–W6D6)
  const w1d1 = WEEKDAY_INVENTORY.find((d) => d.week === 1 && d.day === 1);
  const activeGarrickEvenings = WEEKDAY_INVENTORY.filter(
    (d) => !(d.week === 1 && d.day === 1) && Boolean(d.garrickLine && d.garrickLine.trim().length > 0)
  ).length;

  return {
    totalWeekdays: WEEKDAY_INVENTORY.length, // 36
    totalChallenges: challengeDays.length, // 29
    totalWeekdayFights: fightDays.length, // 12
    totalDualDays: dualDays.length, // 6
    totalPressOnDays: pressOnDays.length, // 12
    totalFragments: SEEKER_FRAGMENTS.length, // 36
    validAnagrams, // 72 of 72
    attrCounts, // Agility 12, Aim 11, Craft 10, Might 9, Intellect 8, Charm 8
    totalGatherings: GATHERINGS_DATA.length, // 6
    totalMatches: GATHERINGS_DATA.reduce((acc, g) => acc + g.matches.length, 0), // 18
    canonGateLeaks,
    garrickW1D1AbsentOnly: w1d1?.garrickLine === null && activeGarrickEvenings === 35,
  };
}

