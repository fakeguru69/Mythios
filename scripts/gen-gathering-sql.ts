// Writes the six Gatherings into SQL for the online game's server (table public.gathering_scripts).
// Sources (never edit the output by hand; change these, then rerun and load again):
// - src/data/gatheringScripts.ts (Day 7 of each episode file, as the demo plays it)
// - src/data/unitedEffortStories.ts (the United Effort's story lines)
// - src/data/mythiosRulesData.ts (EPISODE_NUMBERS), src/data/mythiosGatheringsAndAudit.ts (GATHERINGS_DATA),
//   src/data/economy.ts (the Battle rewards), src/data/mythiosFragments.ts (each Match's answer)
// What changes on the way, so the server can play it with real friends:
// - "{F1}" / "{F3}" (canon's Mei and Jo) become the friend who really did it: {TAPPER} after a shared button,
//   {CHOSEN} in Gathering 6's act (the friend the light lets go of); "Say a name" lines name every friend who said it.
// - Gathering 1's "Dev" in the United Effort's lines becomes {RISK} (the friend in the drop).
// - Each pick says how it is played: a group vote, private picks with a majority, one chosen friend, or every friend.
// - The summary's "[a / b]" slots become tokens the server fills from what happened.
// - Each Match keeps its answer on the server (a fragment id); a phone sees the answer only once it is revealed.
// Run: npx tsx scripts/gen-gathering-sql.ts <week> [--json] > supabase/migrations/00NN_gathering_week<week>.sql
import { GATHERING_SCRIPTS, type GatheringStep } from '../src/data/gatheringScripts';
import { UNITED_EFFORT_STORIES } from '../src/data/unitedEffortStories';
import { EPISODE_NUMBERS } from '../src/data/mythiosRulesData';
import { GATHERINGS_DATA } from '../src/data/mythiosGatheringsAndAudit';
import { GOLD_GATHERING_BATTLE_REWARDS } from '../src/data/economy';
import { SEEKER_FRAGMENTS } from '../src/data/mythiosFragments';

const week = Number(process.argv[2]);
if (!week) throw new Error('usage: gen-gathering-sql.ts <week> [--json]');
const asJson = process.argv.includes('--json');
const q = (s: string) => `'${s.replace(/'/g, "''")}'`;

const script = GATHERING_SCRIPTS.find((g) => g.week === week);
const ep = EPISODE_NUMBERS.find((e) => e.week === week);
const gd = GATHERINGS_DATA.find((g) => g.week === week);
const story = UNITED_EFFORT_STORIES[week];
if (!script || !ep || !gd || !story) throw new Error(`no Gathering ${week}`);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();
const riskify = (s: string) => (week === 1 ? s.replace(/\bDev\b/g, '{RISK}') : s);

type Out = Record<string, unknown>;
const steps: Out[] = [];
let namesFrom = -1; // index of a "Say a name" pick; the say lines after it name who said each
let nameIndex = 0;
const pickMode = (st: GatheringStep, _i: number) =>
  st.t !== 'pick' ? undefined : st.vote ? 'vote' : st.question === 'THE FIFTH IS IN YOUR HANDS.' ? 'private' : st.question === '' ? 'chosen' : st.question === 'SAY A NAME.' ? 'each' : undefined;
script.steps.forEach((st: GatheringStep, i) => {
  const o: Out = { ...st };
  if (st.t === 'say') {
    let text = st.text;
    if (namesFrom >= 0 && /^\*\*[A-Z][a-z]+,\*\*/.test(text)) {
      o.nameOf = nameIndex++;
      text = text.replace(/\s*\*\{F\d\}\.\*\s*$/, '');
    } else if (/\{F\d\}/.test(text)) {
      // The act's friend, and the cliffhanger's branch line on the torn page ("The page is still in Jo's fist."), is {CHOSEN}.
      const chosen = st.section === 'The act' || (st.section === 'The Cliffhanger' && st.cond?.on === 'pick');
      text = text.replace(/\{F\d\}/g, chosen ? '{CHOSEN}' : '{TAPPER}');
    }
    o.text = text;
  }
  if (st.t === 'pick') {
    if (st.vote) o.mode = 'vote';
    else if (st.question === 'THE FIFTH IS IN YOUR HANDS.') o.mode = 'private'; // majority of private picks; a tie holds it back
    else if (st.question === '') o.mode = 'chosen'; // one friend, chosen at random, the act
    else if (st.question === 'SAY A NAME.') {
      o.mode = 'each';
      namesFrom = i;
      nameIndex = 0;
    } else throw new Error(`pick ${i}: how is it played?`);
  }
  if (st.t === 'act' && st.label === 'WHY WOULD YOURS WORK?') o.timeout = 30; // canon: if nobody taps in 30s, the night goes on
  if (st.t === 'match') {
    const f = SEEKER_FRAGMENTS.find((x) => norm(x.fullText) === norm(st.fragment));
    if (!f) throw new Error(`match ${i}: no fragment for "${st.fragment}"`);
    o.answer = f.id;
    delete o.fragment;
  }
  if (st.t === 'summary') {
    o.lines = st.lines.map((l) => {
      if (/^You earned:/.test(l)) return '{EARNED}';
      if (!/^The party:/.test(l)) return l;
      let p = l.replace('Battle won', 'Battle {battle}');
      // {pick:N:…} reads the pick at step N (g_pick_tokens, migration 0076), wherever the generator puts it.
      const pickAt = (mode: string) => script.steps.findIndex((x, j) => x.t === 'pick' && pickMode(x, j) === mode);
      p = p.replace('the fifth `[given / held back]`', `the fifth {pick:${pickAt('private')}:given|held back}`);
      p = p.replace('`[the page torn / the ring broken / nothing]`', `{pick:${pickAt('chosen')}:the page torn|the ring broken|nothing}`);
      p = p.replace('`[n]` questions asked', '{asked} questions asked');
      p = p.replace('`[he lived to answer, n questions asked / he did not wake]`', '{ue:he lived to answer, {asked} questions asked|he did not wake}');
      p = p.replace(/`\[([^\]/]+) \/ ([^\]]+)\]`/g, (_m, a: string, b: string) => `{ue:${a.trim()}|${b.trim()}}`);
      if (/`|\[/.test(p)) throw new Error(`summary ${i}: unfilled slot in "${p}"`);
      return p;
    });
  }
  steps.push(o);
});
// The act's pick and the fifth's pick must sit where the summary tokens say.
if (week === 6) {
  const summary = steps.find((x) => x.t === 'summary') as { lines: string[] } | undefined;
  for (const m of (summary?.lines ?? []).join(' ').matchAll(/\{pick:(\d+):/g)) {
    const at = steps[Number(m[1])] as { t: string; mode?: string };
    if (at?.t !== 'pick' || (at.mode !== 'private' && at.mode !== 'chosen')) throw new Error(`summary token pick:${m[1]} is not the fifth's or the act's pick`);
  }
}
// The step a say follows only if the button before it was tapped (Gathering 6: "if nobody taps, the night goes on").
steps.forEach((s, i) => {
  if (s.t === 'say' && i > 0 && (steps[i - 1] as { timeout?: number }).timeout) s.ifTapped = true;
});

const band = (r: Record<string, string[]>) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.map(riskify)]));
const data = {
  meta: {
    dc: ep.gatheringDC,
    ueDc: ep.ueDC,
    def: ep.gDef,
    atk: ep.gAtk,
    reward: GOLD_GATHERING_BATTLE_REWARDS[week],
    enemy: gd.enemyName,
    condition: week === 1 ? null : gd.conditionText,
    ueAttr: gd.ueAttr,
    ueTitle: gd.ueTitle,
    barWay: gd.ueBarAName,
    barRisk: week === 1 ? '{RISK} HP' : gd.ueBarBName,
  },
  steps,
  ue: { success: band(story.success), fail: band(story.fail), between: story.between.map(riskify) },
};

if (asJson) {
  console.log(JSON.stringify({ week, data }));
  process.exit(0);
}
console.log(`-- Gathering ${week}, generated by scripts/gen-gathering-sql.ts. Do not edit by hand.
insert into public.gathering_scripts (series_id, season_number, week, data) values
('dark-moon', 1, ${week}, ${q(JSON.stringify(data))}::jsonb)
on conflict (series_id, season_number, week) do update set data = excluded.data;`);
