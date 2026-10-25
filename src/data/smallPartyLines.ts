// Canon writes the friends as Mei, Dev and Jo ({F1} {F2} {F3}). A party of 2 has one friend and a party of 3
// has two, so the lines that name more friends than the party has get a shorter version.
// Approved by Fake Guru 15 Oct (docs/party-size-wording-15oct.md, List 2). Each `full` is the line exactly as
// chapterScripts.ts holds it (after the episode files' own 15 Oct he/she rewording); `byFriends[n]` is used when
// the party has n friends besides the player. A line not listed for a size stays as canon.

export interface SmallPartyLine {
  full: string;
  byFriends: Partial<Record<1 | 2, string>>;
}

export const SMALL_PARTY_LINES: SmallPartyLine[] = [
  // W1D2's recap (dayRecaps.ts; 25 Oct, the plan after the audits, Phase 2): with one friend, nobody else is "the rest".
  {
    full: 'At the Hollow Wake Inn the rest of the list was waiting, each of them holding a torn page in the same neat hand.',
    byFriends: { 1: 'At the Hollow Wake Inn the other name on the list was waiting, holding a torn page in the same neat hand.' },
  },
  // W1D2, the taproom (episode-1:140-142)
  {
    full: 'There are {N-1} strangers in it who are not drinking.',
    byFriends: { 1: 'There is a stranger in it who is not drinking.' },
  },
  {
    full: "{F1} has a torn page flat on the table under one hand. {F2} is turning one over and over. {F3}'s is folded small, the way you fold a thing you have read too many times.",
    byFriends: {
      1: '{F1} has a torn page flat on the table under one hand.',
      2: '{F1} has a torn page flat on the table under one hand. {F2} is turning one over and over.',
    },
  },
  // W1D2, the Agility notice (episode-1:166)
  {
    full: "{F2}'s knuckles are skinned. So are {F3}'s.",
    byFriends: { 1: "{F1}'s knuckles are skinned.", 2: "{F2}'s knuckles are skinned." },
  },
  // W1D4 (episode-1:370)
  {
    full: '{F1} takes the left side of the lane, {F2} the right. You take the well.',
    byFriends: { 1: '{F1} takes the lane. You take the well.' },
  },
  // W1D5 (episode-1:524)
  {
    full: "{F1} has a hand on {F2}'s arm, to stop {F2} following into the dark.",
    byFriends: { 1: "{F1}'s hand is on your arm, to stop you following into the dark." },
  },
  // W2D2 (episode-2:165)
  {
    full: '{F1} is still crouched in the lane. {F2} has the rubbing held flat against the footing, and is not moving.',
    byFriends: { 1: '{F1} is still crouched in the lane, the rubbing held flat against the footing, not moving.' },
  },
  // W2D2, after the lane or the footing (Phase 3, 24 Oct)
  {
    full: '{F1} is still at the door, turning the bent nail over and over between finger and thumb. {F2} has the rubbing held flat against the footing, and is not moving.',
    byFriends: { 1: '{F1} has the rubbing held flat against the footing, and is not moving.' },
  },
  {
    full: '{F1} is still crouched in the lane. {F2} is standing at the door with the broken latch in one hand, looking at the house, not at the latch.',
    byFriends: { 1: '{F1} is still crouched in the lane, reading the ruts.' },
  },
  // W2D3 (episode-2:296)
  {
    full: 'until {F1} and {F3} drag you through by the collar.',
    byFriends: { 1: 'until {F1} drags you through by the collar.', 2: 'until {F1} and {F2} drag you through by the collar.' },
  },
  // W2D5 (episode-2:437)
  {
    full: '{F1} comes back off the hill with a shake of the head. {F3} is holding a page under the lamp with one finger on the margin.',
    byFriends: {
      1: '{F1} comes back off the hill, and holds a page under the lamp with one finger on the margin.',
      2: '{F1} comes back off the hill with a shake of the head. {F2} is holding a page under the lamp with one finger on the margin.',
    },
  },
  // W3D4 (episode-3:375)
  {
    full: '{F1} and {F3} are already at the fall of rock, with their sleeves rolled.',
    byFriends: { 1: '{F1} is already at the fall of rock, sleeves rolled.', 2: '{F1} and {F2} are already at the fall of rock, with their sleeves rolled.' },
  },
  // W4D2, the fork beyond the ford (episode-4, Day 2; storybook wording, 17 Oct)
  {
    full: '{F1} and {F3} take the lake road, the one to Reedham.',
    byFriends: { 1: '{F1} takes the lake road, the one to Reedham.', 2: '{F1} and {F2} take the lake road, the one to Reedham.' },
  },
  {
    full: '{F1} and {F3} come back to the fork with nothing to tell but sheep.',
    byFriends: {
      1: '{F1} comes back to the fork with nothing to tell but sheep.',
      2: '{F1} and {F2} come back to the fork with nothing to tell but sheep.',
    },
  },
];

/** Swaps in the short version of any listed line for a party with one or two friends. */
export function applySmallPartyLines(text: string, friendCount: number): string {
  if (friendCount >= 3) return text;
  let out = text;
  for (const line of SMALL_PARTY_LINES) {
    const short = line.byFriends[friendCount as 1 | 2];
    if (short && out.includes(line.full)) out = out.split(line.full).join(short);
  }
  return out;
}
