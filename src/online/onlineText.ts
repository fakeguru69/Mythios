// Player-facing words for the online screens, from canon:
// docs/canon/review-accounts-and-invites.md (the screens) and mythios-core-rules.md §7 (Session Zero), §12a.
// Change the wording in canon first, then here.

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
