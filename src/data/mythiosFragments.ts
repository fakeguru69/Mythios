export interface SeekerFragmentData {
  id: string;
  week: number;
  day: number;
  placeLabel: string;
  fullText: string;
  displayTemplate: string; // uses {0} and {1} for the two missing lock words
  word1: string;
  jumble1: string[];
  word2: string;
  jumble2: string[];
  closureInfo: string;
}

export const SEEKER_FRAGMENTS: SeekerFragmentData[] = [
  // WEEK 1
  {
    id: '1-1', week: 1, day: 1, placeLabel: 'The boundary stone',
    fullText: 'Five fell. Five were turned against him. Four were scattered after. One stayed close.',
    displayTemplate: 'Five fell. Five were turned against him. Four were {0} after. One stayed {1}.',
    word1: 'scattered', jumble1: ['C', 'R', 'E', 'T', 'S', 'D', 'T', 'A', 'E'],
    word2: 'close', jumble2: ['L', 'S', 'E', 'C', 'O'],
    closureInfo: 'Week 4 (fifth named) & Week 6 ("One stayed close")',
  },
  {
    id: '1-2', week: 1, day: 2, placeLabel: 'The inn door-beam',
    fullText: 'They wept for him before they feared him.',
    displayTemplate: 'They {0} for him before they {1} him.',
    word1: 'wept', jumble1: ['P', 'E', 'T', 'W'],
    word2: 'feared', jumble2: ['A', 'D', 'E', 'E', 'F', 'R'],
    closureInfo: 'Week 2 ("wept") & Week 3 ("feared")',
  },
  {
    id: '1-3', week: 1, day: 3, placeLabel: 'The Widow\'s Tooth',
    fullText: 'Not every hand that tries will open it. Some locks already know their key.',
    displayTemplate: 'Not every {0} that tries will open it. Some {1} already know their key.',
    word1: 'hand', jumble1: ['A', 'D', 'N', 'H'],
    word2: 'locks', jumble2: ['K', 'S', 'C', 'L', 'O'],
    closureInfo: 'Week 3 (Seeker blood-locks proven)',
  },
  {
    id: '1-4', week: 1, day: 4, placeLabel: 'The Fenmark well',
    fullText: 'Born when the dark has eaten the moon, marked before the first cry\'s through.',
    displayTemplate: 'Born when the dark has eaten the {0}, {1} before the first cry\'s through.',
    word1: 'moon', jumble1: ['O', 'O', 'N', 'M'],
    word2: 'marked', jumble2: ['K', 'M', 'D', 'R', 'A', 'E'],
    closureInfo: 'Week 2 (what marked means) & Week 4 (Verse of the Four)',
  },
  {
    id: '1-5', week: 1, day: 5, placeLabel: 'The hollow tree',
    fullText: 'The power that gives is also the power that takes.',
    displayTemplate: 'The power that {0} is also the power that {1}.',
    word1: 'gives', jumble1: ['E', 'I', 'V', 'G', 'S'],
    word2: 'takes', jumble2: ['E', 'K', 'T', 'A', 'S'],
    closureInfo: 'Refrain 1 — Week 3 & Week 6 finale',
  },
  {
    id: '1-6', week: 1, day: 6, placeLabel: 'The ford-stone',
    fullText: 'The key that locks is also the key that unlocks.',
    displayTemplate: 'The key that {0} is also the key that {1}.',
    word1: 'locks', jumble1: ['O', 'K', 'S', 'L', 'C'],
    word2: 'unlocks', jumble2: ['K', 'L', 'O', 'N', 'S', 'U', 'C'],
    closureInfo: 'Refrain 2 — Week 6 Twist 2 ("Same key. Turned the other way.")',
  },

  // WEEK 2
  {
    id: '2-1', week: 2, day: 1, placeLabel: 'The farmhouse beam',
    fullText: 'We held his last wall the night it was meant to fall. Not one of us expected to see morning.',
    displayTemplate: 'We held his last {0} the night it was meant to fall. Not one of us expected to see {1}.',
    word1: 'wall', jumble1: ['L', 'W', 'L', 'A'],
    word2: 'morning', jumble2: ['N', 'I', 'R', 'M', 'N', 'O', 'G'],
    closureInfo: 'Week 2 Gathering Match 1 (Verse of the Answering)',
  },
  {
    id: '2-2', week: 2, day: 2, placeLabel: 'The mill wheel',
    fullText: 'Their campfires filled the plain from our wall to the hills. The first night we tried to count them. By the third, we had stopped.',
    displayTemplate: 'Their {0} filled the plain from our wall to the hills. The first night we tried to {1} them. By the third, we had stopped.',
    word1: 'campfires', jumble1: ['A', 'C', 'F', 'R', 'P', 'I', 'M', 'E', 'S'],
    word2: 'count', jumble2: ['U', 'O', 'T', 'N', 'C'],
    closureInfo: 'Week 2 Gathering ("the enemy\'s fires outnumbered the stars")',
  },
  {
    id: '2-3', week: 2, day: 3, placeLabel: 'The hill-path housing',
    fullText: 'We watched the kingdoms go out like lamps — the ones that fought first, the ones that knelt after. By the end, ours was the last light burning.',
    displayTemplate: 'We watched the {0} go out like lamps — the ones that fought first, the ones that knelt after. By the end, ours was the last {1} burning.',
    word1: 'kingdoms', jumble1: ['O', 'I', 'S', 'D', 'K', 'M', 'G', 'N'],
    word2: 'light', jumble2: ['I', 'H', 'L', 'T', 'G'],
    closureInfo: 'Week 2 Gathering (Verse of the Answering)',
  },
  {
    id: '2-4', week: 2, day: 4, placeLabel: 'The roots by the shaft',
    fullText: 'The moon went out, and he went down alone into the oldest rooms of the house. When he came back up, his hand was bleeding, and he told us to sleep.',
    displayTemplate: 'The {0} went out, and he went down alone into the oldest rooms of the house. When he came back up, his hand was {1}, and he told us to sleep.',
    word1: 'moon', jumble1: ['N', 'M', 'O', 'O'],
    word2: 'bleeding', jumble2: ['G', 'D', 'L', 'E', 'E', 'N', 'I', 'B'],
    closureInfo: 'Week 2 Gathering Match 2 ("He opened his palm with his own knife.")',
  },
  {
    id: '2-5', week: 2, day: 5, placeLabel: 'The signal stone',
    fullText: 'That morning he came down off the wall and walked among us. There was not one of us who would not have died for him.',
    displayTemplate: 'That morning he came down off the wall and {0} among us. There was not one of us who would not have {1} for him.',
    word1: 'walked', jumble1: ['K', 'E', 'A', 'W', 'L', 'D'],
    word2: 'died', jumble2: ['E', 'I', 'D', 'D'],
    closureInfo: 'Week 2 Gathering (the morning of joy)',
  },
  {
    id: '2-6', week: 2, day: 6, placeLabel: 'The lip of the shaft',
    fullText: 'Morning came. The enemy did not.',
    displayTemplate: '{0} came. The {1} did not.',
    word1: 'morning', jumble1: ['R', 'O', 'I', 'M', 'N', 'G', 'N'],
    word2: 'enemy', jumble2: ['Y', 'N', 'E', 'E', 'M'],
    closureInfo: 'Week 2 Gathering (the empty camp)',
  },

  // WEEK 3
  {
    id: '3-1', week: 3, day: 1, placeLabel: 'The wayside shrine',
    fullText: 'First they stopped bleeding when cut. Then they stopped sleeping. Then they stopped being ours.',
    displayTemplate: 'First they stopped bleeding when cut. Then they stopped {0}. Then they stopped being {1}.',
    word1: 'sleeping', jumble1: ['L', 'G', 'S', 'N', 'E', 'E', 'I', 'P'],
    word2: 'ours', jumble2: ['U', 'R', 'S', 'O'],
    closureInfo: 'Week 3 Gathering Match 1 (the corruption / "gift")',
  },
  {
    id: '3-2', week: 3, day: 2, placeLabel: 'The pound wall',
    fullText: 'We held his wall for him. Remember that, when you hear where else we stood.',
    displayTemplate: 'We {0} his wall for him. Remember that, when you hear where else we {1}.',
    word1: 'held', jumble1: ['D', 'H', 'L', 'E'],
    word2: 'stood', jumble2: ['T', 'D', 'O', 'O', 'S'],
    closureInfo: 'Week 3 Gathering (the Seekers turned against him)',
  },
  {
    id: '3-3', week: 3, day: 3, placeLabel: 'The Blackglass',
    fullText: 'He never lied to us. He only never told us the price.',
    displayTemplate: 'He never {0} to us. He only never told us the {1}.',
    word1: 'lied', jumble1: ['D', 'L', 'I', 'E'],
    word2: 'price', jumble2: ['E', 'C', 'P', 'I', 'R'],
    closureInfo: 'Week 3 Gathering Match 2 & Week 6 Finale (Garrick\'s method)',
  },
  {
    id: '3-4', week: 3, day: 4, placeLabel: 'The black-ridge niche',
    fullText: 'What we hid, we locked with what we are.',
    displayTemplate: 'What we {0}, we {1} with what we are.',
    word1: 'hid', jumble1: ['D', 'H', 'I'],
    word2: 'locked', jumble2: ['O', 'C', 'E', 'L', 'D', 'K'],
    closureInfo: 'Week 3 Gathering ("set their own blood as the lock")',
  },
  {
    id: '3-5', week: 3, day: 5, placeLabel: 'The shepherd\'s hearth',
    fullText: 'Bloodlines outlast kingdoms. That is why kingdoms fear them.',
    displayTemplate: '{0} outlast kingdoms. That is why kingdoms {1} them.',
    word1: 'bloodlines', jumble1: ['L', 'L', 'S', 'I', 'D', 'E', 'B', 'O', 'N', 'O'],
    word2: 'fear', jumble2: ['R', 'F', 'A', 'E'],
    closureInfo: 'Week 6 Finale (it was his royal bloodline)',
  },
  {
    id: '3-6', week: 3, day: 6, placeLabel: 'The cairn\'s foot',
    fullText: 'We never dug him a grave. When we are gone, our blood will have to hold him.',
    displayTemplate: 'We never dug him a {0}. When we are gone, our {1} will have to hold him.',
    word1: 'grave', jumble1: ['R', 'E', 'V', 'G', 'A'],
    word2: 'blood', jumble2: ['O', 'L', 'B', 'O', 'D'],
    closureInfo: 'Week 3 Gathering (he did not die; he sleeps)',
  },

  // WEEK 4
  {
    id: '4-1', week: 4, day: 1, placeLabel: 'The last black rock',
    fullText: 'We did not trust four locks to hold what needed five.',
    // Lock words changed 15 Oct 2026 (Fake Guru, Phase 6): four·five gave each other away.
    displayTemplate: 'We did not {0} four locks to hold what needed {1}.',
    word1: 'trust', jumble1: ['T', 'S', 'U', 'R', 'T'],
    word2: 'five', jumble2: ['I', 'F', 'V', 'E'],
    closureInfo: 'Week 4 Gathering (Layer F false hope)',
  },
  {
    id: '4-2', week: 4, day: 2, placeLabel: 'The old ford',
    fullText: 'Earth, wind, water, fire — four we could name. The fifth had no element at all, and we feared it more than the other four together.',
    displayTemplate: 'Earth, wind, water, fire — four we could name. The {0} had no {1} at all, and we feared it more than the other four together.',
    word1: 'fifth', jumble1: ['T', 'H', 'F', 'F', 'I'],
    word2: 'element', jumble2: ['L', 'E', 'E', 'N', 'T', 'M', 'E'],
    closureInfo: 'Week 4 Gathering Match 2 (the torn page)',
  },
  {
    id: '4-3', week: 4, day: 3, placeLabel: 'The drowned tower',
    fullText: 'What fell when the moon broke still remembers the moon. So does anyone born in its dark.',
    displayTemplate: 'What fell when the moon broke still {0} the moon. So does anyone {1} in its dark.',
    word1: 'remembers', jumble1: ['E', 'E', 'E', 'R', 'M', 'R', 'B', 'M', 'S'],
    word2: 'born', jumble2: ['O', 'B', 'R', 'N'],
    closureInfo: 'Week 4 Gathering Match 1 (Verse of the Four)',
  },
  {
    id: '4-4', week: 4, day: 4, placeLabel: 'The market cross',
    fullText: 'Moon-blood woke it once. Moon-blood will wake it again, if it is ever let near.',
    // Lock words changed 15 Oct 2026 (Fake Guru, Phase 6): woke·wake gave each other away.
    displayTemplate: 'Moon-blood {0} it once. Moon-blood will wake it again, if it is ever let {1}.',
    word1: 'woke', jumble1: ['K', 'W', 'E', 'O'],
    word2: 'near', jumble2: ['R', 'A', 'E', 'N'],
    closureInfo: 'Week 6 Finale (Thread 1 misdirection anchor)',
  },
  {
    id: '4-5', week: 4, day: 5, placeLabel: 'The willow roots',
    fullText: 'We have built a lock. Pray no one ever learns it is also a door.',
    displayTemplate: 'We have built a {0}. Pray no one ever learns it is also a {1}.',
    word1: 'lock', jumble1: ['K', 'C', 'O', 'L'],
    word2: 'door', jumble2: ['R', 'O', 'D', 'O'],
    closureInfo: 'Week 6 Twist 2 (Refrain 2 echo)',
  },
  {
    id: '4-6', week: 4, day: 6, placeLabel: 'The tower stair',
    fullText: 'We made our children the only key. We never asked what that would make them.',
    // Lock words changed 15 Oct 2026 (Fake Guru, Phase 6): "key" was three letters and easy.
    displayTemplate: 'We made our {0} the only key. We never {1} what that would make them.',
    word1: 'children', jumble1: ['H', 'L', 'C', 'D', 'I', 'R', 'E', 'N'],
    word2: 'asked', jumble2: ['D', 'E', 'K', 'S', 'A'],
    closureInfo: 'Week 4 Gathering & Week 6 ("You were the key.")',
  },

  // WEEK 5
  {
    id: '5-1', week: 5, day: 1, placeLabel: 'The waystone',
    fullText: 'He gave us the war. Then it began to take.',
    displayTemplate: 'He {0} us the war. Then it began to {1}.',
    word1: 'gave', jumble1: ['V', 'A', 'G', 'E'],
    word2: 'take', jumble2: ['K', 'T', 'E', 'A'],
    closureInfo: 'Week 5 Gathering (Refrain 1 echo)',
  },
  {
    id: '5-2', week: 5, day: 2, placeLabel: 'The grave block',
    fullText: 'We had fought beside every one of them. That is why it had to be us.',
    displayTemplate: 'We had {0} {1} every one of them. That is why it had to be us.',
    word1: 'fought', jumble1: ['O', 'T', 'H', 'F', 'U', 'G'],
    word2: 'beside', jumble2: ['S', 'D', 'B', 'E', 'E', 'I'],
    closureInfo: 'Week 5 Gathering (the hollowed comrades)',
  },
  {
    id: '5-3', week: 5, day: 3, placeLabel: 'The gate walkway',
    fullText: 'Four of us gave to the four. None of us gave to the fifth.',
    displayTemplate: 'Four of us gave to the four. {0} of us gave to the {1}.',
    word1: 'none', jumble1: ['E', 'O', 'N', 'N'],
    word2: 'fifth', jumble2: ['I', 'F', 'F', 'H', 'T'],
    closureInfo: 'Week 6 Finale (the fifth drank the king\'s blood, not the Seekers\')',
  },
  {
    id: '5-4', week: 5, day: 4, placeLabel: 'The soldiers\' street',
    fullText: 'When he fell, the soldiers who had been nearest him stopped where they were, mid-stride. We could not bring ourselves to break them. We left them standing.',
    displayTemplate: 'When he fell, the {0} who had been nearest him stopped where they were, mid-stride. We could not bring ourselves to break them. We left them {1}.',
    word1: 'soldiers', jumble1: ['I', 'D', 'S', 'E', 'S', 'R', 'O', 'L'],
    word2: 'standing', jumble2: ['T', 'I', 'S', 'G', 'N', 'N', 'D', 'A'],
    closureInfo: 'Week 5 Gathering Match 1 (Verse of the Binding)',
  },
  {
    id: '5-5', week: 5, day: 5, placeLabel: 'The broken fountain',
    fullText: 'We kept the fifth where we could watch it, and watch him.',
    displayTemplate: 'We {0} the {1} where we could watch it, and watch him.',
    word1: 'kept', jumble1: ['E', 'P', 'T', 'K'],
    word2: 'fifth', jumble2: ['T', 'I', 'H', 'F', 'F'],
    closureInfo: 'Week 5 Gathering Match 2 (the hidden wall room)',
  },
  {
    id: '5-6', week: 5, day: 6, placeLabel: 'The wall crack',
    fullText: 'Where he fell, under the dark moon, the five were joined.',
    displayTemplate: 'Where he {0}, under the dark moon, the five were {1}.',
    word1: 'fell', jumble1: ['E', 'F', 'L', 'L'],
    word2: 'joined', jumble2: ['I', 'D', 'E', 'N', 'J', 'O'],
    closureInfo: 'Week 5 Gathering table question & Week 6 Finale',
  },

  // WEEK 6
  {
    id: '6-1', week: 6, day: 1, placeLabel: 'The wall room',
    fullText: 'His household ran the night we came to the hall. We let them go. They were only servants.',
    displayTemplate: 'His {0} ran the night we came to the hall. We let them go. They were only {1}.',
    word1: 'household', jumble1: ['L', 'S', 'H', 'H', 'O', 'O', 'E', 'U', 'D'],
    word2: 'servants', jumble2: ['R', 'S', 'V', 'A', 'N', 'E', 'T', 'S'],
    closureInfo: 'Week 6 Gathering Match 2 (Verse of the Name)',
  },
  {
    id: '6-2', week: 6, day: 2, placeLabel: 'The barracks hearth',
    fullText: 'We were marked, every one of us. That is how we found the shards.',
    displayTemplate: 'We were {0}, every one of us. That is how we found the {1}.',
    word1: 'marked', jumble1: ['D', 'A', 'K', 'R', 'M', 'E'],
    word2: 'shards', jumble2: ['H', 'A', 'R', 'S', 'D', 'S'],
    closureInfo: 'Week 6 Gathering Match 1 (Verse of the Name)',
  },
  {
    id: '6-3', week: 6, day: 3, placeLabel: 'The warm wall',
    fullText: 'We left him on the floor of his own hall, where he fell. None of us could bear to lift him. We carried the five away, one by one.',
    displayTemplate: 'We left him on the {0} of his own hall, where he fell. None of us could bear to lift him. We {1} the five away, one by one.',
    word1: 'floor', jumble1: ['R', 'L', 'O', 'F', 'O'],
    word2: 'carried', jumble2: ['R', 'D', 'A', 'R', 'E', 'C', 'I'],
    closureInfo: 'Week 6 Gathering (the hall layout & convergence)',
  },
  {
    id: '6-4', week: 6, day: 4, placeLabel: 'The deep crack',
    fullText: 'We sealed his doors with our own hands and left one way in, that only our blood will open. Forgive us for leaving it at all.',
    displayTemplate: 'We {0} his doors with our own hands and left one way in, that only our {1} will open. Forgive us for leaving it at all.',
    word1: 'sealed', jumble1: ['D', 'S', 'L', 'E', 'E', 'A'],
    word2: 'blood', jumble2: ['O', 'B', 'D', 'L', 'O'],
    closureInfo: 'Week 6 Day 6 door & Gathering arrival',
  },
  {
    id: '6-5', week: 6, day: 5, placeLabel: 'The moon ledge',
    fullText: 'The dark moon comes back. It always comes back. Be there when it does.',
    displayTemplate: 'The {0} moon comes back. It always comes back. Be {1} when it does.',
    word1: 'dark', jumble1: ['R', 'K', 'A', 'D'],
    word2: 'there', jumble2: ['E', 'H', 'R', 'T', 'E'],
    closureInfo: 'Week 6 Gathering (lock word changed from "always" to "there" on 5 Oct)',
  },
  {
    id: '6-6', week: 6, day: 6, placeLabel: 'The crack\'s end',
    fullText: 'If you are reading this, you are ours — and if he ever stirs, finish what we could not.',
    displayTemplate: 'If you are reading this, you are {0} — and if he ever stirs, {1} what we could not.',
    word1: 'ours', jumble1: ['R', 'U', 'S', 'O'],
    word2: 'finish', jumble2: ['S', 'F', 'I', 'H', 'N', 'I'],
    closureInfo: 'Week 6 Twist 2 (double meaning on reread)',
  },
];
