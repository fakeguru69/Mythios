// Player-facing words for the online screens, from canon:
// docs/canon/review-accounts-and-invites.md (the screens) and mythios-core-rules.md §7 (Session Zero), §12a.
// Change the wording in canon first, then here.

// MYTHIOS, the app (Fake Guru, 16 Oct): a teller of serialised stories. A series is one world, told over seasons;
// you play one character per series, under a name you choose.
// The intro below: approved by Fake Guru, 16 Oct.
export const MYTHIOS_INTRO = {
  opener: 'At the edge of every map there is a fire, and beside it someone telling a story that has not finished yet.',
  name: 'Mythios is that teller.',
  lines: [
    'Its stories are too long for one night, so it tells them a little each day: a chapter every morning, read wherever you are, and one evening a week when your whole company sits down together.',
    'Each series is a world of its own, told over seasons. You walk it as someone of your own making, under a name you choose, beside the friends you bring.',
    'The teller remembers everything. What you do today is still there next week.',
  ],
  call: 'Choose a story. Gather your friends. Begin.',
};

// The series on the shelf. Each has seasons; a party plays one season.
export const SERIES: { id: string; title: string; premise: string; seasons: number[]; facts: string }[] = [
  {
    id: 'dark-moon',
    title: 'Tales of the Dark Moon',
    premise: 'In the hill villages, children are going missing, and nobody is looking for them.',
    seasons: [1],
    facts: 'Six weeks · two to six friends',
  },
];
export const seriesTitle = (id: string | null | undefined) => SERIES.find((x) => x.id === id)?.title ?? 'Mythios';

export const PREMISE_LINE = 'In the hill villages, children are going missing, and nobody is looking for them.';
export const TAGLINE = 'A story for you and your friends, told a little each day.';
// The invite's three lines (review §1 Screen 1). "About ten minutes a day" (Fake Guru, 16 Oct; was "five":
// the day now takes 8 to 12 minutes).
export const INVITE_BULLETS = ['Six weeks.', 'About ten minutes a day, whenever suits you.', 'One evening a week, together.'];
export const CREDIT_LINE = 'A fake guru game. The story is told by Mythios AI.';

// Session Zero (Core Rules §7).
export const SZ_PREMISE = [
  'In the hill villages, children are going missing, and nobody is looking for them.',
  'Before the week is out, it will be your business.',
  'One short chapter a day. One night a week, you meet the others.',
];
export const SZ_CHOOSE = 'Choose the one who will walk this road.';
export const SZ_SECOND = 'Nobody is only one thing. What else are you good at?';
export const SZ_QUESTIONS = ['Where were you born?', "What was a grandparent's name?"];
export const SZ_QUESTIONS_NOTE = 'You can skip these. They only make the story a little more yours.';
// The character's name in this series (Fake Guru, 16 Oct; wording approved 16 Oct).
export const SZ_NAME = 'What is your name in this story?';
export const SZ_NAME_NOTE = 'Your friends will know you by it in every season of this series.';
export const SZ_DOOR = 'Day 1 opens at 5:00am. Sleep, if you can.';

export type ClassName = 'Warrior' | 'Artificer' | 'Sage' | 'Trickster' | 'Assassin' | 'Archer';
export type AttributeName = 'Might' | 'Craft' | 'Intellect' | 'Charm' | 'Agility' | 'Aim';

export const ATTRIBUTES: AttributeName[] = ['Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim'];

export const CLASSES: { name: ClassName; attribute: AttributeName; line: string }[] = [
  { name: 'Warrior', attribute: 'Might', line: "When a door won't open, you are the reason it does." },
  { name: 'Artificer', attribute: 'Craft', line: 'You know how things are put together, and so how they come apart.' },
  { name: 'Sage', attribute: 'Intellect', line: 'You notice what the room is not saying.' },
  { name: 'Trickster', attribute: 'Charm', line: 'People tell you things. They are not always sure why.' },
  { name: 'Assassin', attribute: 'Agility', line: "You are already where they weren't looking." },
  { name: 'Archer', attribute: 'Aim', line: 'You see the one thing that matters, from a long way off.' },
];

// Starting values (Core Rules §2): the class Attribute 14, the second 12, the rest 10. Gear Level 1 (§4). Gold 0.
export const START_CLASS_ATTR = 14;
export const START_SECOND_ATTR = 12;
export const START_OTHER_ATTR = 10;
export const START_WEAPON = 14;
export const START_ARMOR = 27;
