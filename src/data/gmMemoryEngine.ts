import { GarrickRouteResult, GarrickStoryState } from './garrickRouter';
import { canonDayFacts } from './canonDayFacts';
import { WEEKDAY_INVENTORY } from './mythiosChaptersData';

// The static system prefix lives in garrickPrompt.ts, so the online server function can use the same text.
export { GARRICK_IMPLICIT_CACHE_SYSTEM_PREFIX } from './garrickPrompt';
import { GARRICK_IMPLICIT_CACHE_SYSTEM_PREFIX } from './garrickPrompt';

export interface PartyMemoryDigest {
  partyName: string;
  activePlayer: string;
  playerClass: string;
  personalStakeShort: string;
  recentRolls: string[]; // Last 3 rolls (e.g. "W2D2 THE MILLER'S WIFE: Cleared (Charm 21 vs 7+)")
  relicsGiven: string[]; // Last 3 relic gifts (e.g. "Jennifer -> Mei (Charm Relic)")
  solvedFragmentsCount: number;
  garrickTopicsAsked: string[]; // Last 4 questions asked to Garrick
  last4ChatTurns: { speaker: string; line: string }[];
}

export interface AssembledPromptBreakdown {
  route: GarrickRouteResult['route'];
  isZeroTokenDeterministic: boolean;
  layer2StaticPrefixText: string;
  layer2StaticTokens: number;
  layer3SceneSliceText: string;
  layer3SceneTokens: number;
  layer4MemoryDigestText: string;
  layer4MemoryTokens: number;
  totalInputTokensUsed: number;
  estimatedOutputTokens: number;
  naiveFullHistoryTokens: number;
  percentSaved: number;
  implicitCacheEligible: boolean;
}

export function estimateTokens(text: string): number {
  // Standard ~4 chars per token approximation, calibrated so the static prefix + rules block is ~440 tokens
  return Math.max(1, Math.ceil(text.length / 3.8));
}

export function buildEpisodeSceneSlice(state: GarrickStoryState): string {
  const ch =
    WEEKDAY_INVENTORY.find((d) => d.week === state.episode && d.day === state.day) ||
    WEEKDAY_INVENTORY[0];
  // Canon's own words for the day (its question and "You learned" line), never the build's old summaries.
  const facts = canonDayFacts(ch.week, ch.day);

  return [
    `CURRENT SCENE SLICE (Week ${state.episode}, Day ${state.day} — ${ch.place}):`,
    `- Dramatic Question: ${facts.question}`,
    `- Scene Summary: ${facts.learned}`,
    `- Story Flags: ledgerOpened=${state.ledgerOpened}, prisonerHeld=${state.prisonerHeld}, allFourChildrenHome=${state.allFourChildrenHome}, atHighwall=${state.atHighwall}, ep6RevealLanded=${state.ep6RevealLanded}`,
  ].join('\n');
}

export function buildCompactMemoryDigestString(digest: PartyMemoryDigest): string {
  return JSON.stringify(
    {
      party: digest.partyName,
      hero: `${digest.activePlayer} (${digest.playerClass})`,
      stake: digest.personalStakeShort,
      recentRolls: digest.recentRolls.slice(0, 3),
      relicGifts: digest.relicsGiven.slice(0, 3),
      fragmentsSolved: digest.solvedFragmentsCount,
      recentGarrickQuestions: digest.garrickTopicsAsked.slice(0, 4),
      lastTurns: digest.last4ChatTurns.slice(-4),
    },
    null,
    2
  );
}

export function inspectGmTokenEfficiency(
  routeResult: GarrickRouteResult,
  state: GarrickStoryState,
  digest: PartyMemoryDigest
): AssembledPromptBreakdown {
  const layer2Text = GARRICK_IMPLICIT_CACHE_SYSTEM_PREFIX;
  const layer3Text = buildEpisodeSceneSlice(state);
  const layer4Text = buildCompactMemoryDigestString(digest);

  // ESTIMATES, not measured (Task 10): token counts assumed from the 4-layer spec (~440 static + ~150 scene + ~120 digest).
  const layer2StaticTokens = 442; // estimate
  const layer3SceneTokens = estimateTokens(layer3Text) + 65;
  const layer4MemoryTokens = estimateTokens(layer4Text) + 30;

  const isZeroTokenDeterministic = routeResult.route !== 'AI_SMALL_TALK';
  const totalInputTokensUsed = isZeroTokenDeterministic
    ? 0
    : layer2StaticTokens + layer3SceneTokens + layer4MemoryTokens;
  const estimatedOutputTokens = isZeroTokenDeterministic ? 0 : estimateTokens(routeResult.reply) + 12;

  // ESTIMATE: a naive full-history prompt (6 episode scripts ~38,000 + rules ~4,500 + chat ~2,500 = ~45,000 tokens)
  const naiveFullHistoryTokens = 45000; // estimate
  const percentSaved = Number(
    (((naiveFullHistoryTokens - totalInputTokensUsed) / naiveFullHistoryTokens) * 100).toFixed(2)
  );

  return {
    route: routeResult.route,
    isZeroTokenDeterministic,
    layer2StaticPrefixText: layer2Text,
    layer2StaticTokens,
    layer3SceneSliceText: layer3Text,
    layer3SceneTokens,
    layer4MemoryDigestText: layer4Text,
    layer4MemoryTokens,
    totalInputTokensUsed,
    estimatedOutputTokens,
    naiveFullHistoryTokens,
    percentSaved,
    implicitCacheEligible: !isZeroTokenDeterministic,
  };
}
