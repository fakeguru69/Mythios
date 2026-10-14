export interface CampfireRiddle {
  id: string;
  week: number;
  day: number;
  slot: 'MORNING' | 'MIDDAY' | 'NIGHTFALL';
  timeOfDay: 'Morning' | 'Midday' | 'Nightfall';
  prompt: string;
  punchlinePrefix: string;
  answerWord: string;
  jumbleLetters: string[];
  explanation: string;
}

interface PunSeed {
  q: string;
  prefix: string;
  word: string;
  jumble: string[];
  exp: string;
}

const MORNING_PUN_SEEDS: PunSeed[] = [
  {
    q: "I've got one for you while the kettle boils... What's blue in colour, but doesn't weigh much?",
    prefix: 'Light',
    word: 'BLUE',
    jumble: ['L', 'U', 'B', 'E'],
    exp: 'Garrick grins behind his tin cup while Dev groans: "Light blue. Get your boots on, everyone."',
  },
  {
    q: 'Why did the scarecrow on the Fenmark road win a medal from the village Reeve?',
    prefix: 'He was out-standing in his',
    word: 'FIELD',
    jumble: ['I', 'F', 'L', 'E', 'D'],
    exp: 'Mei pinches the bridge of her nose: "Outstanding in his field. Truly terrible, Garrick."',
  },
  {
    q: 'What has four wheels, carries the camp turnips, and flies all the way down the hill?',
    prefix: 'A garbage',
    word: 'CART',
    jumble: ['R', 'A', 'T', 'C'],
    exp: 'Arjun laughs: "Only flies after the flies find yesterday\'s salt-fish in the back."',
  },
  {
    q: 'Why can you never trust the cobbler who mends boots by the river ford?',
    prefix: 'His work is always a little',
    word: 'SHADY',
    jumble: ['D', 'A', 'H', 'S', 'Y'],
    exp: 'Garrick chuckles dryly: "Because he sits under the willow tree. Keep walking."',
  },
  {
    q: 'What do you call a sleeping bull blocking the middle of the mill lane?',
    prefix: 'A bull-',
    word: 'DOZER',
    jumble: ['Z', 'O', 'R', 'D', 'E'],
    exp: 'Dev shakes his head: "Dozer. Walk around the horns, not behind the hooves."',
  },
  {
    q: 'Why did the baker at the crossroads stop making round loaves this morning?',
    prefix: 'He got tired of kneading the',
    word: 'DOUGH',
    jumble: ['G', 'U', 'O', 'D', 'H'],
    exp: 'Garrick tosses a biscuit across the fire: "Still tastes fine with hot tea."',
  },
];

const MIDDAY_PUN_SEEDS: PunSeed[] = [
  {
    q: 'Wait till you hear this one... What has ears all down its side, yet cannot hear a single word you say?',
    prefix: 'A field of',
    word: 'CORN',
    jumble: ['R', 'O', 'N', 'C'],
    exp: 'Arjun groans: "Ears of corn. And here I thought you were talking about Dev on night watch."',
  },
  {
    q: 'What runs all the way around the farmer’s pasture at noon without ever taking a breath or moving a leg?',
    prefix: 'The wooden',
    word: 'FENCE',
    jumble: ['E', 'C', 'N', 'F', 'E'],
    exp: 'Garrick taps the gatepost: "A fence. Never gets winded, either."',
  },
  {
    q: 'What kind of coat is always put on wet and never has a single button or sleeve?',
    prefix: 'A fresh coat of',
    word: 'PAINT',
    jumble: ['N', 'T', 'I', 'P', 'A'],
    exp: 'Mei smiles despite herself: "A coat of paint. At least that one was clever."',
  },
  {
    q: 'I have a neck but no head, and I wear a cork hat until the midday halt. What am I?',
    prefix: 'A water',
    word: 'BOTTLE',
    jumble: ['T', 'O', 'L', 'B', 'E', 'T'],
    exp: 'Garrick uncorks his canteen: "Pass the water-bottle before Dev drinks the stream dry."',
  },
  {
    q: 'What gets wetter and wetter the more it dries your hands by the pump?',
    prefix: 'A linen',
    word: 'TOWEL',
    jumble: ['W', 'L', 'O', 'T', 'E'],
    exp: 'Dev grins: "Even I got that one before the soup cooled."',
  },
  {
    q: 'What has a bottom right at the very top so you can walk through the mud?',
    prefix: 'Your',
    word: 'LEGS',
    jumble: ['G', 'S', 'L', 'E'],
    exp: 'Garrick chuckles: "Your legs. Keep them moving—we have three miles before dusk."',
  },
];

const NIGHTFALL_PUN_SEEDS: PunSeed[] = [
  {
    q: 'One last one before you turn in... What can you catch by the river at night, but can never throw back?',
    prefix: 'A head',
    word: 'COLD',
    jumble: ['L', 'D', 'O', 'C'],
    exp: 'Garrick pulls his grey cloak tight: "A cold. Pull your blankets up by the embers."',
  },
  {
    q: 'What has four stiff legs all night long, yet can never walk across the tavern floor by itself?',
    prefix: 'A wooden',
    word: 'TABLE',
    jumble: ['B', 'L', 'E', 'T', 'A'],
    exp: 'Arjun rests his boots on the bench: "Unless the tavern ale is stronger than usual."',
  },
  {
    q: 'What belongs only to you, yet your three friends use it ten times more every day than you do?',
    prefix: 'Your own',
    word: 'NAME',
    jumble: ['M', 'E', 'N', 'A'],
    exp: 'Mei nods by the firelight: "Your name. Good night, Garrick."',
  },
  {
    q: 'What is so fragile that merely speaking its name out loud by the campfire breaks it at once?',
    prefix: 'The night',
    word: 'SILENCE',
    jumble: ['E', 'C', 'N', 'S', 'L', 'I', 'E'],
    exp: 'Garrick raises one eyebrow: "Silence. Which I suggest we test until first watch."',
  },
  {
    q: 'What has a single eye that cannot see a yard, yet mends every torn cloak in camp?',
    prefix: 'A brass',
    word: 'NEEDLE',
    jumble: ['E', 'D', 'L', 'N', 'E', 'E'],
    exp: 'Dev tucks his sewing kit away: "A needle. Saved my sleeve after that bramble hedge."',
  },
  {
    q: 'What goes up the hill and down the valley every day, yet never moves an inch from its stones?',
    prefix: 'The country',
    word: 'ROAD',
    jumble: ['D', 'A', 'R', 'O'],
    exp: 'Garrick banks the coals: "The road itself. Rest easy—tomorrow it climbs again."',
  },
];

export function getDailyCampfireRiddles(
  week: number,
  day: number,
  place: string
): CampfireRiddle[] {
  const safeWeek = Math.min(6, Math.max(1, week));
  const safeDay = Math.min(6, Math.max(1, day));
  const seedIdx = ((safeWeek - 1) * 6 + (safeDay - 1)) % 6;

  const isGarrickAbsent = safeWeek === 1 && safeDay === 1;
  const hostName = isGarrickAbsent ? 'Mei' : 'Garrick';
  const scrubGarrickFromExp = (exp: string) =>
    isGarrickAbsent
      ? exp
          .replace(/\bGarrick\b/g, 'Dev')
          .replace(/Truly terrible, Dev\./g, 'Truly terrible, Dev.')
      : exp;

  const m = MORNING_PUN_SEEDS[seedIdx];
  const d = MIDDAY_PUN_SEEDS[seedIdx];
  const n = NIGHTFALL_PUN_SEEDS[seedIdx];

  return [
    {
      id: `w${safeWeek}-d${safeDay}-morning`,
      week: safeWeek,
      day: safeDay,
      slot: 'MORNING',
      timeOfDay: 'Morning',
      prompt: `${hostName} leans by the fire near ${place}: "${m.q}"`,
      punchlinePrefix: m.prefix,
      answerWord: m.word,
      jumbleLetters: m.jumble,
      explanation: scrubGarrickFromExp(m.exp),
    },
    {
      id: `w${safeWeek}-d${safeDay}-midday`,
      week: safeWeek,
      day: safeDay,
      slot: 'MIDDAY',
      timeOfDay: 'Midday',
      prompt: `${hostName} glances over a tin cup: "${d.q}"`,
      punchlinePrefix: d.prefix,
      answerWord: d.word,
      jumbleLetters: d.jumble,
      explanation: scrubGarrickFromExp(d.exp),
    },
    {
      id: `w${safeWeek}-d${safeDay}-nightfall`,
      week: safeWeek,
      day: safeDay,
      slot: 'NIGHTFALL',
      timeOfDay: 'Nightfall',
      prompt: `${hostName} pokes the evening embers: "${n.q}"`,
      punchlinePrefix: n.prefix,
      answerWord: n.word,
      jumbleLetters: n.jumble,
      explanation: scrubGarrickFromExp(n.exp),
    },
  ];
}
