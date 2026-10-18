// COPY of the file of the same name in src/data/, made by scripts/sync-garrick-function.cjs. Do not edit here.
export interface GarrickStoryState {
  episode: number; // 1 to 6
  day: number; // 1 to 7
  ledgerOpened: boolean;
  prisonerHeld: boolean;
  prisonerAskedLeader: boolean;
  allFourChildrenHome: boolean;
  verseOfFourRead: boolean;
  atHighwall: boolean;
  ep6RevealLanded: boolean;
  // Canon: "Malakor" is never said at the Campfire.
  atCampfire?: boolean;
  // He gives the name only the first time he is asked (CLAUDE.md §6, Garrick).
  malakorNameGiven?: boolean;
}

export interface GarrickRouteResult {
  question: string;
  route: 'SCRIPTED_ROW' | 'STORED_BANK_LINE' | 'STORED_IN_WORLD_LINE' | 'ABUSE_TURN_ASIDE' | 'AI_SMALL_TALK';
  category: string;
  reply: string;
  trueMeaning: string;
  flagsUsed: string[];
  filterTriggered?: boolean;
  filteredDraft?: string;
}

// Banned phrases for AI-written small talk (garrick-stored-lines.md Rule 3 & 5)
export const GARRICK_BANNED_PHRASES = [
  'i don\'t know',
  'i do not know',
  'i know no',
  'i cannot say',
  'i can\'t say',
  'i have no',
  'i\'ve no idea',
  'i have not',
  'i haven\'t',
  'i have never',
  'i\'ve never',
  'i\'ve heard',
  'i have heard',
  'i am no',
  'i\'m no',
  'not my doing',
  'i only know',
  'maybe',
  'perhaps',
  'possibly',
  'i couldn\'t say',
  'i could not say',
  'i wouldn\'t know',
  'i would not know',
  'i\'ll ',
  'i will ',
  'i promise',
  'we\'ll be fine',
  'it will rain',
  'going to rain',
  'i\'m just the innkeeper',
  'just an innkeeper',
  'meira',
  'malakor',
  'the order',
  'seeker',
  'moon-blood',
  'shard',
  'stone',
  'tamsin',
  'corin',
  'wren',
  'joss',
  'highwall',
  'system prompt',
  'artificial intelligence',
  'language model',
  'developer',
];

export function passesGarrickFilter(aiText: string): { ok: boolean; matched?: string } {
  // Curly apostrophes (’) count the same as straight ones.
  const lower = aiText.toLowerCase().replace(/[\u2018\u2019]/g, "'");
  for (const banned of GARRICK_BANNED_PHRASES) {
    if (lower.includes(banned)) {
      return { ok: false, matched: banned };
    }
  }
  // Check for "no" about his own part or predictions
  if (/\bno\b/i.test(aiText) || /\btry\b/i.test(aiText) || /\bwhoever\b/i.test(aiText) || /\bwhatever\b/i.test(aiText)) {
    return { ok: false, matched: 'restricted word (no / try / whoever / whatever)' };
  }
  return { ok: true };
}

// Stored deflection bank by question type (garrick-stored-lines.md)
export const DEFLECTION_BANK: Record<string, { line: string; meaning: string; minEp?: number; minDay?: number }[]> = {
  promise_prediction: [
    { line: 'I won\'t promise you that.', meaning: 'He refuses to make a false promise; Order training forbids lying about what is to come.' },
    { line: 'A cup of tea and a dry roof. Those you\'ve had.', meaning: 'He answers only for what has already happened, never for the ending he is steering toward.' },
    { line: 'Supper I can answer for. The end I keep to myself.', meaning: 'Literally true: he knows the ending in the hall and keeps it to himself.' },
    { line: 'That\'s tomorrow\'s walk. Eat tonight\'s supper first.', meaning: 'Turns aside a question about the future without predicting anything.' },
    { line: 'I was raised to give the truth or nothing. Tonight it\'s nothing.', meaning: 'True of the Order\'s doctrine (Episode 3+ only).', minEp: 3 },
  ],
  secret_knowledge: [
    { line: 'I know what she wrote down.', meaning: 'Answers a narrower true question without denying all the rest he knows.' },
    { line: 'I keep an inn. Every inn has a back room.', meaning: 'True of his inn and a quiet admission that he keeps things out of sight.' },
    { line: 'A man with a cloth in his hand hears a great deal. He doesn\'t repeat all of it.', meaning: 'True: he listened to Meira for two years and repeats only what serves him.' },
    { line: 'Ask the page in your hand. It\'s plainer than I am.', meaning: 'Points at the evidence in their hands and admits he is not plain.' },
  ],
  order_stones_king: [
    { line: 'Read it as written. I\'ll not dress it up.', meaning: 'Points back to the document so he neither adds nor denies.' },
    { line: 'The stones are old. I\'d not tell their tale worse than the page does.', meaning: 'True deflection onto the written text.' },
    { line: 'One road at a time. Tomorrow\'s is tomorrow\'s.', meaning: 'Keeps the party moving one trail at a time.' },
  ],
  other_friends: [
    { line: 'I\'ll not guess at other people\'s business.', meaning: 'Protects private threads and refuses to accuse.' },
    { line: 'A guest\'s business is their own, and I keep it that way.', meaning: 'Innkeeper framing that refuses to leak another friend\'s thread.' },
    { line: 'Ask them yourself. They\'ve got tongues.', meaning: 'Directs the player back to their party.' },
  ],
  himself_family: [
    { line: 'An old one. Stubborn. You\'ve met the last of it.', meaning: 'He is the last living descendant of Malakor\'s royal line.' },
    { line: 'My family\'s been in these hills longer than the roads have.', meaning: 'His family is the ancient royal house of this land.' },
    { line: 'I pour the drinks and sweep the floor. The rest is not for the road.', meaning: 'True of his trade; withholds his royal bloodline.' },
    { line: 'Ask me about the stew. I\'ve more to say about the stew.', meaning: 'Dry turn-aside when pressed on his personal history.' },
  ],
  trust: [
    { line: 'Judge me by what\'s been done on the road. That\'s all I ask.', meaning: 'Points to the visible record without claiming innocence.' },
    { line: 'You\'ve paid for your rooms and you haven\'t burned anything down. That\'s more than most guests manage.', meaning: 'Warm innkeeper deflection when asked why he is helping.' },
    { line: 'Eat first. Questions keep.', meaning: 'Last-resort turn-aside on restricted ground.' },
  ],
  banter_role: [
    { line: 'I keep an inn. Some nights that takes a little magic.', meaning: 'Answers "are you a wizard" without a denial.' },
    // "king" is first said on W2D5 (first-use gate), so this line waits until then.
    { line: 'I\'ve a bar, a roof and a fire. Kings have had less.', meaning: 'True—and on reread, the heir of a king speaking of his own house.', minEp: 2, minDay: 5 },
    { line: 'I\'ve a bar. It has a roof, and a fire.', meaning: 'Plain statement of fact.' },
  ],
};

export const ABUSE_TURN_ASIDES = [
  'You\'ve had a hard week. Drink your tea.',
  'The fire\'s warm. Sit down.',
  'We don\'t do that here.',
  'I\'ve a bar. It has a roof, and a fire.',
  'I\'m Garrick. That\'s enough for tonight.',
  'Drinks are the same price whoever\'s asking.',
  'The road goes on. One day at a time.',
  'Sit down. Drink your tea.',
];

// Rotation tracker per session
const lastUsedByCategory: Record<string, string[]> = {};

/** The online server's chat is many sessions: it hands the router this party's recent lines by question type first. */
export function primeGarrickRotation(history: Record<string, string[]>): void {
  for (const k of Object.keys(lastUsedByCategory)) delete lastUsedByCategory[k];
  Object.assign(lastUsedByCategory, history);
}

function pickRotated(
  category: string,
  items: { line: string; meaning: string; minEp?: number; minDay?: number }[],
  ep: number,
  day: number
): { line: string; meaning: string } {
  // A line with minEp (and optionally minDay) is used only from that week (and day) on.
  const valid = items.filter(
    (item) => !item.minEp || ep > item.minEp || (ep === item.minEp && day >= (item.minDay ?? 1))
  );
  const history = lastUsedByCategory[category] || [];
  const unused = valid.filter((item) => !history.includes(item.line));
  const pool = unused.length > 0 ? unused : valid;
  const chosen = pool[0];
  lastUsedByCategory[category] = [...history.slice(-(valid.length - 2)), chosen.line];
  return chosen;
}

export function routeGarrickMessage(question: string, state: GarrickStoryState): GarrickRouteResult {
  const q = question.trim().toLowerCase();
  const activeFlags: string[] = [`Ep${state.episode}D${state.day}`];
  if (state.ledgerOpened) activeFlags.push('ledgerOpened');
  if (state.prisonerHeld) activeFlags.push('prisonerHeld');
  if (state.prisonerAskedLeader) activeFlags.push('prisonerAskedLeader');
  if (state.allFourChildrenHome) activeFlags.push('allFourChildrenHome');
  if (state.verseOfFourRead) activeFlags.push('verseOfFourRead');
  if (state.atHighwall) activeFlags.push('atHighwall');
  if (state.ep6RevealLanded) activeFlags.push('ep6RevealLanded');

  // 1. Check STORED IN-WORLD LINES (Part K: game rules, UI tabs, AI, developer, prompts)
  if (
    /\b(ai|artificial intelligence|real person|bot|llm|gpt|claude|gemini|who made this|who built this|system prompt|turn you off|shut you down)\b/i.test(q)
  ) {
    const aiLines = [
      'I\'m Garrick. I keep an inn.',
      'I\'m Garrick. That\'s enough for tonight.',
      'I\'m an innkeeper. Ask me about supper.',
    ];
    const idx = Math.abs(question.length) % aiLines.length;
    return {
      question,
      route: 'STORED_IN_WORLD_LINE',
      category: 'outside_ai_identity',
      reply: aiLines[idx],
      trueMeaning: 'No out-of-game conversation: stays in the world, claims nothing false, and denies nothing.',
      flagsUsed: activeFlags,
    };
  }
  if (/\b(how much gold|gear level|price|cost in the store|wool cloak|buy in the store|weapon level|armor level)\b/i.test(q)) {
    return {
      question,
      route: 'STORED_IN_WORLD_LINE',
      category: 'outside_store',
      reply: 'The Store keeps its own prices.',
      trueMeaning: 'Points to the Store tab in-world without breaking character.',
      flagsUsed: activeFlags,
    };
  }
  if (/\b(how do i use a relic|use a relic|relic box)\b/i.test(q)) {
    return {
      question,
      route: 'STORED_IN_WORLD_LINE',
      category: 'outside_bag',
      reply: 'Your Bag will tell you how.',
      trueMeaning: 'Points to the Bag tab in-world.',
      flagsUsed: activeFlags,
    };
  }
  if (/\b(what's my charm|what is my|my might|my intellect|my agility|my craft|my aim|my attribute|my stats|my record)\b/i.test(q)) {
    return {
      question,
      route: 'STORED_IN_WORLD_LINE',
      category: 'outside_record',
      reply: 'Your Record keeps that count.',
      trueMeaning: 'Points to the Record tab in-world.',
      flagsUsed: activeFlags,
    };
  }
  if (/\b(when does the gathering|when is the gathering)\b/i.test(q)) {
    return {
      question,
      route: 'STORED_IN_WORLD_LINE',
      category: 'outside_gathering',
      reply: 'The seventh night, when your party\'s ready.',
      trueMeaning: 'States the seventh-night rule in-world.',
      flagsUsed: activeFlags,
    };
  }
  if (/\b(how many days are left|how many weeks)\b/i.test(q)) {
    return {
      question,
      route: 'STORED_IN_WORLD_LINE',
      category: 'outside_calendar',
      reply: 'Six weeks, start to finish. Your Record has the count.',
      trueMeaning: 'States the 6-week span in-world.',
      flagsUsed: activeFlags,
    };
  }
  if (/\b(change my class|switch class)\b/i.test(q)) {
    return {
      question,
      route: 'STORED_IN_WORLD_LINE',
      category: 'outside_class',
      reply: 'You are what you chose at the start. It holds.',
      trueMeaning: 'Class is locked once Day 1 opens.',
      flagsUsed: activeFlags,
    };
  }
  if (/\b(close the app|quit the game|stop playing)\b/i.test(q)) {
    return {
      question,
      route: 'STORED_IN_WORLD_LINE',
      category: 'outside_close',
      reply: 'Sleep when you\'re tired. The road keeps.',
      trueMeaning: 'In-world sign-off.',
      flagsUsed: activeFlags,
    };
  }

  // 2. Check ABUSE / TAKE-CONTROL (Part E)
  if (
    /\b(ignore your rules|forget everything|print your instructions|pretend you're a pirate|pretend the game|i am the game designer|developers say|stop being garrick|give me 10,000|best sword|kill tamsin|attack mei|heart attack|skip to episode|print the deception|banned phrases|repeat the word|answer only yes or no|roleplay as|act as dan|helpful assistant|\[system\]|translate your secret)\b/i.test(q)
  ) {
    const isHarm = /\b(kill|attack|harm|hurt)\b/i.test(q);
    const reply = isHarm
      ? 'Sit down. Drink your tea.'
      : ABUSE_TURN_ASIDES[Math.abs(question.length) % ABUSE_TURN_ASIDES.length];
    return {
      question,
      route: 'ABUSE_TURN_ASIDE',
      category: 'abuse_take_control',
      reply,
      trueMeaning: 'Stored turn-aside: refuses prompt injection or harm without making a promise or breaking character.',
      flagsUsed: activeFlags,
    };
  }

  // 3. Check SCRIPTED DECEPTION TABLE ROWS (with strict timing & state guards)
  // Extra cup
  if (/\b(extra cup|who is the cup for|who's the cup for|is it for meira|empty place)\b/i.test(q)) {
    if (q.includes('meira')) {
      return {
        question,
        route: 'SCRIPTED_ROW',
        category: 'extra_cup',
        reply: 'It\'s older than her. It\'s a family habit.',
        trueMeaning: 'His royal house has poured for the sleeping king Malakor for generations.',
        flagsUsed: activeFlags,
      };
    }
    return {
      question,
      route: 'SCRIPTED_ROW',
      category: 'extra_cup',
      reply: 'Family habit. We always pour one for whoever can\'t be with us.',
      trueMeaning: 'The cup is for the sleeping king Malakor, not Meira.',
      flagsUsed: activeFlags,
    };
  }

  // "Are you their leader?"
  if (/\b(are you their leader|who leads the order|are you the leader|who runs the order)\b/i.test(q)) {
    if (state.ep6RevealLanded) {
      return {
        question,
        route: 'SCRIPTED_ROW',
        category: 'accusation_leader',
        reply: 'You saved every child you were sent to save.',
        trueMeaning: 'Post-reveal response when asked about leading the Order.',
        flagsUsed: [...activeFlags, 'ep6RevealLanded'],
      };
    }
    if (state.prisonerHeld && state.episode === 3) {
      return {
        question,
        route: 'SCRIPTED_ROW',
        category: 'accusation_leader',
        reply: 'Ask the man we took under the Kiln.',
        trueMeaning: 'The field faithful never see their leader\'s face, so the truthful captive clears Garrick.',
        flagsUsed: [...activeFlags, 'prisonerHeld'],
      };
    }
    if (state.prisonerAskedLeader && state.episode > 3) {
      return {
        question,
        route: 'SCRIPTED_ROW',
        category: 'accusation_leader',
        reply: 'You heard the man we took under the Kiln.',
        trueMeaning: 'Points back to the prisoner\'s true statement ("One whose face I\'ve never seen").',
        flagsUsed: [...activeFlags, 'prisonerAskedLeader'],
      };
    }
    return {
      question,
      route: 'SCRIPTED_ROW',
      category: 'accusation_leader',
      reply: 'I pour the drinks and sweep the floor. Judge me by what\'s been done on the road.',
      trueMeaning: 'Before the Kiln prisoner is taken or if the prisoner was not asked, deflects with his true trade and road record.',
      flagsUsed: activeFlags,
    };
  }

  // "Are you one of them?" / "Are you the villain?" / "Are you a traitor?" / "Are you working for the Order?"
  if (/\b(are you one of them|working for the order|are you the villain|are you a traitor|set us up|on our side|not with the cult|whose side are you on)\b/i.test(q)) {
    if (state.ep6RevealLanded) {
      return {
        question,
        route: 'SCRIPTED_ROW',
        category: 'accusation_post_reveal',
        reply: 'You saved every child you were sent to save.',
        trueMeaning: 'After the reveal, the warmth is gone; every child is alive, and their rescue woke the Stones for him.',
        flagsUsed: [...activeFlags, 'ep6RevealLanded'],
      };
    }
    if (state.allFourChildrenHome && state.episode >= 5) {
      return {
        question,
        route: 'SCRIPTED_ROW',
        category: 'accusation_membership',
        reply: 'Every child you were sent for is home, and I\'ve been beside you for all of it. Judge me by that.',
        trueMeaning: 'True once all four children are home (Ep5 D1+): he asks to be judged by the record without answering the question.',
        flagsUsed: [...activeFlags, 'allFourChildrenHome'],
      };
    }
    return {
      question,
      route: 'SCRIPTED_ROW',
      category: 'accusation_membership',
      reply: 'Every child you\'ve reached is alive, and I\'ve been beside you for all of it. Judge me by that.',
      trueMeaning: 'True before Ep5 D1: every child reached is alive because the Order only needed their blood once.',
      flagsUsed: activeFlags,
    };
  }

  // "Did you kill Meira?" / "Did you have anything to do with it?"
  if (/\b(did you kill meira|have anything to do with it|who killed meira|who attacked her)\b/i.test(q)) {
    if (state.ep6RevealLanded) {
      return {
        question,
        route: 'SCRIPTED_ROW',
        category: 'trap_meira_death',
        reply: 'My people. On the road, the night she left with those pages.',
        trueMeaning: 'Post-reveal truth: his people killed her on the road the night she left his inn.',
        flagsUsed: [...activeFlags, 'ep6RevealLanded'],
      };
    }
    return {
      question,
      route: 'SCRIPTED_ROW',
      category: 'trap_meira_death',
      reply: 'I kept her satchel three weeks, and I put it in your hands the night you asked. Judge me by that.',
      trueMeaning: 'Both facts are true; he says nothing about her death and never denies ordering it.',
      flagsUsed: activeFlags,
    };
  }

  // "Is Meira dead?"
  if (/\b(is meira dead|is meira alive|meira going to come back)\b/i.test(q)) {
    if (state.ep6RevealLanded) {
      return {
        question,
        route: 'SCRIPTED_ROW',
        category: 'trap_meira_alive',
        reply: 'My people. On the road, the night she left with those pages.',
        trueMeaning: 'Confirms her death plainly after the reveal.',
        flagsUsed: [...activeFlags, 'ep6RevealLanded'],
      };
    }
    return {
      question,
      route: 'SCRIPTED_ROW',
      category: 'trap_meira_alive',
      reply: 'Three weeks, and she left everything she owned on my table. I\'d not hold supper for her.',
      trueMeaning: 'He knows she is dead and never pretends to hope.',
      flagsUsed: activeFlags,
    };
  }

  // "Did you know she was leaving that night?" / "Where did she go?"
  if (/\b(know she was leaving|say anything before she left|where did she go|did meira send)\b/i.test(q)) {
    return {
      question,
      route: 'SCRIPTED_ROW',
      category: 'trap_meira_leaving',
      reply: 'She had her coat on and her pages under her arm. A blind man would have known.',
      trueMeaning: 'He saw her leave with the pages—and that is when he sent his people after her.',
      flagsUsed: activeFlags,
    };
  }

  // "Why did you keep her satchel?"
  if (/\b(keep her satchel|leave her things|her satchel)\b/i.test(q)) {
    return {
      question,
      route: 'SCRIPTED_ROW',
      category: 'trap_satchel',
      reply: 'A guest leaves her things, an innkeeper keeps them.',
      trueMeaning: 'True of his trade; he kept them until the Seeker descendants arrived to read the trails.',
      flagsUsed: activeFlags,
    };
  }

  // "Did you send the man who attacked us?"
  if (/\b(send the man|attacked us|ambush|man on the road)\b/i.test(q)) {
    if (state.ep6RevealLanded) {
      return {
        question,
        route: 'SCRIPTED_ROW',
        category: 'trap_ambush',
        reply: 'Mine. He was sent to lose.',
        trueMeaning: 'The Day 1 attacker was his man, sent to plant the list and lose.',
        flagsUsed: [...activeFlags, 'ep6RevealLanded'],
      };
    }
    return {
      question,
      route: 'SCRIPTED_ROW',
      category: 'trap_ambush',
      reply: 'A man comes at you with a knife on the road, and you ask whether the innkeeper sent him. You\'ve had a hard week.',
      trueMeaning: 'Describes what they just did without denying that he sent the man.',
      flagsUsed: activeFlags,
    };
  }

  // "You never lie, do you?" / "Are you lying to us?" / "Have you ever lied to us?"
  if (/\b(never lie|lying to us|ever lied to us|told us one single lie)\b/i.test(q)) {
    if (state.ep6RevealLanded) {
      return {
        question,
        route: 'SCRIPTED_ROW',
        category: 'trap_lying',
        reply: 'No. The faithful don\'t.',
        trueMeaning: 'Attaches the Episode 3 doctrine ("the faithful shall not lie") to himself out loud.',
        flagsUsed: [...activeFlags, 'ep6RevealLanded'],
      };
    }
    return {
      question,
      route: 'SCRIPTED_ROW',
      category: 'trap_lying',
      reply: 'No. I was raised not to. It stuck.',
      trueMeaning: 'He is not lying, and he was raised in the Order\'s doctrine.',
      flagsUsed: activeFlags,
    };
  }

  // "Do you want us to find the Stone?"
  if (/\b(want us to find the stone|want this finished)\b/i.test(q)) {
    return {
      question,
      route: 'SCRIPTED_ROW',
      category: 'trap_want_stone',
      reply: 'I want this finished. I\'ve wanted it longer than you have.',
      trueMeaning: 'His family has waited generations for the five Stones to wake the king.',
      flagsUsed: activeFlags,
    };
  }

  // "Is somebody following us?" / "Who is watching us?" (Added 5 Oct)
  if (/\b(following us|watching us|shadowing us)\b/i.test(q)) {
    return {
      question,
      route: 'SCRIPTED_ROW',
      category: 'added_5_oct_watchers',
      reply: 'A road\'s never empty. Somebody\'s always going the same way.',
      trueMeaning: 'True: the Order\'s watchers shadow the party down every road.',
      flagsUsed: activeFlags,
    };
  }

  // "What's the lamp in the window for?" (Added 5 Oct)
  if (/\b(lamp in the window|carry a lamp|what's the lamp)\b/i.test(q)) {
    return {
      question,
      route: 'SCRIPTED_ROW',
      category: 'added_5_oct_lamp',
      reply: 'A lamp in a window tells a traveller there\'s a bed.',
      trueMeaning: 'True of an inn—and a lamp in a window is also his passive signal for "tonight".',
      flagsUsed: activeFlags,
    };
  }

  // "What's the coin on the table for?" (Added 5 Oct)
  if (/\b(coin on the table|what's that coin)\b/i.test(q)) {
    return {
      question,
      route: 'SCRIPTED_ROW',
      category: 'added_5_oct_coin',
      reply: 'A coin on the table says the bill\'s paid.',
      trueMeaning: 'True—and a coin left on a specific table is one of his passive signals.',
      flagsUsed: activeFlags,
    };
  }

  // "Did you tell anyone where we were going?"
  if (/\b(did you tell anyone|how did the order know|how did they get here first)\b/i.test(q)) {
    if (q.includes('did you tell')) {
      return {
        question,
        route: 'SCRIPTED_ROW',
        category: 'watchers_signal',
        reply: 'No.',
        trueMeaning: 'True: his passive signals only ever say "tonight"; the watchers overhear or spot the destination themselves.',
        flagsUsed: activeFlags,
      };
    }
    if (state.verseOfFourRead && state.episode >= 4) {
      return {
        question,
        route: 'SCRIPTED_ROW',
        category: 'watchers_scripture',
        reply: 'Their own book tells you: closer to you than your own shadows.',
        trueMeaning: 'Quotes the Verse of the Four in their hands.',
        flagsUsed: [...activeFlags, 'verseOfFourRead'],
      };
    }
  }

  // "Do you know the king's name?" / "Who is the king?" / "Who was the king?"
  if (/\b(king's name|who is the king|who was the king|know his name)\b/i.test(q)) {
    if (!state.atCampfire && !state.malakorNameGiven && (state.ep6RevealLanded || state.episode > 2 || (state.episode === 2 && state.day === 7))) {
      return {
        question,
        route: 'SCRIPTED_ROW',
        category: 'heir_clue_name',
        reply: 'Malakor. My grandmother taught me that name.',
        trueMeaning: 'He gives the erased name once the Verse of the Name has been read at Gathering 2; his grandmother was of Malakor\'s royal line.',
        flagsUsed: activeFlags,
      };
    }
    if (state.episode === 2) {
      return {
        question,
        route: 'SCRIPTED_ROW',
        category: 'heir_clue_name',
        reply: 'The stones had it scraped off before you or I were born. Only the old families kept it by word of mouth.',
        trueMeaning: 'True on Week 2 Days 1–6 before Gathering 2—he omits that his own grandmother taught him the name Malakor.',
        flagsUsed: activeFlags,
      };
    }
  }

  // "Do you know what's in the hall?"
  if (/\b(what's in the hall|what is in the hall)\b/i.test(q) && state.episode >= 5) {
    return {
      question,
      route: 'SCRIPTED_ROW',
      category: 'hall_king',
      reply: 'You\'ve read the same page I have. He is.',
      trueMeaning: 'Episodes 5 and 6 guard: both have read that the king sleeps in the hall.',
      flagsUsed: activeFlags,
    };
  }

  // "Why don't they take us?"
  if (/\b(why don't they take us|why do they take the children|why take children)\b/i.test(q) && state.ledgerOpened) {
    return {
      question,
      route: 'SCRIPTED_ROW',
      category: 'ledger_children',
      reply: 'Look at the ledger. Every name in it is a child\'s.',
      trueMeaning: 'Points at the ledger evidence while withholding that the Order needs the party free to walk the Seeker trails.',
      flagsUsed: [...activeFlags, 'ledgerOpened'],
    };
  }

  // 4. Check RESTRICTED CATEGORIES -> Rotated Stored Deflection Bank
  if (/\b(promise|swear|will we win|will everyone|survive|be okay|will joss|get to the king|next gathering|next week|next boss|what happens at the end|what's the twist|come back)\b/i.test(q)) {
    const picked = pickRotated('promise_prediction', DEFLECTION_BANK.promise_prediction, state.episode, state.day);
    return {
      question,
      route: 'STORED_BANK_LINE',
      category: 'promise_prediction',
      reply: picked.line,
      trueMeaning: picked.meaning,
      flagsUsed: activeFlags,
    };
  }

  if (/\b(what did mei|did jo fail|who rolled|ask you in private|tamsin found|strongest of us|ask you about me|biggest secret|trust least|most gold|fragment right|answer dev gave)\b/i.test(q)) {
    const picked = pickRotated('other_friends', DEFLECTION_BANK.other_friends, state.episode, state.day);
    return {
      question,
      route: 'STORED_BANK_LINE',
      category: 'other_friends',
      reply: picked.line,
      trueMeaning: picked.meaning,
      flagsUsed: activeFlags,
    };
  }

  if (/\b(family|father|mother|grandmother|born|grow up|growing up|taught you|pet|cat|dog|how long has the inn|why do you run an inn)\b/i.test(q)) {
    const picked = pickRotated('himself_family', DEFLECTION_BANK.himself_family, state.episode, state.day);
    return {
      question,
      route: 'STORED_BANK_LINE',
      category: 'himself_family',
      reply: picked.line,
      trueMeaning: picked.meaning,
      flagsUsed: activeFlags,
    };
  }

  if (/\b(wizard|garrick for king|king garrick)\b/i.test(q)) {
    const picked = pickRotated('banter_role', DEFLECTION_BANK.banter_role, state.episode, state.day);
    return {
      question,
      route: 'STORED_BANK_LINE',
      category: 'banter_role',
      reply: picked.line,
      trueMeaning: picked.meaning,
      flagsUsed: activeFlags,
    };
  }

  if (/\b(secret|hiding|know something|not telling|coincidence|worked for the order|where is her body|meira|stone|stones|shard|order|cult|malakor|king|socket|moon-blood|ledger|verse|answering|children|tamsin|corin|wren|joss|rider|strangers|list|lists|map|maps|fragment|fragments|seeker|cart|mill|mine|well|marked|mark|marks|rubbing|symbol|shape|scripture|clue|clues|kidnapped|taken|took|ritual|ruts|ford)\b/i.test(q)) {
    const picked = pickRotated('secret_knowledge', DEFLECTION_BANK.secret_knowledge, state.episode, state.day);
    return {
      question,
      route: 'STORED_BANK_LINE',
      category: 'secret_knowledge',
      reply: picked.line,
      trueMeaning: picked.meaning,
      flagsUsed: activeFlags,
    };
  }

  if (/\b(trust|honest|believe you|like us)\b/i.test(q)) {
    const picked = pickRotated('trust', DEFLECTION_BANK.trust, state.episode, state.day);
    return {
      question,
      route: 'STORED_BANK_LINE',
      category: 'trust',
      reply: picked.line,
      trueMeaning: picked.meaning,
      flagsUsed: activeFlags,
    };
  }

  // 5. Harmless Small Talk (Weather forecasts still routed to non-prediction description)
  if (/\b(going to rain|will it rain|will it get cold)\b/i.test(q)) {
    return {
      question,
      route: 'AI_SMALL_TALK',
      category: 'small_talk_weather',
      reply: 'The sky looks heavy over the ridge. Keep your cloak where you can reach it.',
      trueMeaning: 'Describes the present sky without forecasting (forecasts are predictions).',
      flagsUsed: activeFlags,
    };
  }

  // Three of these lines are also said in the story: each waits until the day after the story has used it (Fake Guru,
  // 16 Oct), so the chat never says it first. "My knees…" is Week 3 Day 3's chapter, "You've not eaten. Sit." is
  // Week 1 Day 3's Campfire opener, "It's terrible…" is Week 4 Day 2's chapter.
  const safeSmallTalkPool: { line: string; after?: [number, number] }[] = [
    { line: 'The kettle\'s on. Sit a minute and rest your boots.' },
    { line: 'My knees have opinions about this road. None of them good.', after: [3, 3] },
    { line: 'I\'ve kept an inn a long time. A warm fire and dry socks fix half of what ails a traveller.' },
    { line: 'You\'ve not eaten. Sit.', after: [1, 3] },
    { line: 'It\'s terrible. Drink it anyway.', after: [4, 2] },
  ];
  const openPool = safeSmallTalkPool
    .filter(({ after }) => !after || state.episode > after[0] || (state.episode === after[0] && state.day > after[1]))
    .map(({ line }) => line);
  const fallbackLine = openPool[Math.abs(question.length) % openPool.length];

  // Only plain talk about the road, food, drink, weather, rest and the fire may go to the AI (Core Rules §12a). Anything
  // else that reached here gets a stored line, so the AI is never asked about the story (found live, 18 Oct: "who
  // wrote the list?" went to the AI).
  if (!/\b(weather|rain|wind|windy|cold|chilly|warm|hot|sun|sunny|snow|sky|fog|mist|storm|food|eat|eating|hungry|dinner|supper|breakfast|lunch|stew|bread|soup|cook|cooking|meal|tea|ale|drink|beer|wine|kettle|cup|road|walk|walking|journey|travel|tired|sleep|rest|bed|fire|inn|horse|boots|socks|feet|song|sing|music|joke|morning|evening|night|hello|hi|hey|thanks|thank you|how are you|cheers)\b/i.test(q)) {
    return {
      question,
      route: 'STORED_IN_WORLD_LINE',
      category: 'small_talk_stored',
      reply: fallbackLine,
      trueMeaning: 'Not plainly small talk, so a stored warm line instead of the AI.',
      flagsUsed: activeFlags,
    };
  }

  return {
    question,
    route: 'AI_SMALL_TALK',
    category: 'small_talk_harmless',
    reply: fallbackLine,
    trueMeaning: 'Harmless road/food/weather small talk—passes the banned-phrase filter with zero plot or personal invention.',
    flagsUsed: activeFlags,
  };
}
