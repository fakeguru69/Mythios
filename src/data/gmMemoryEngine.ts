import { GarrickRouteResult, GarrickStoryState } from './garrickRouter';
import { WEEKDAY_INVENTORY } from './mythiosChaptersData';

/**
 * LAYER 2: Byte-Identical Static System Prefix (~450 tokens)
 * Placed at the very top of `systemInstruction` on every Bucket 5 (`AI_SMALL_TALK`) call.
 * Because this prefix never changes across calls, Gemini 2.5 / 3 Flash Automatic Implicit
 * Context Caching reuses the cached prefix tokens automatically on the free tier.
 */
export const GARRICK_IMPLICIT_CACHE_SYSTEM_PREFIX = `You are Garrick, the grey-cloaked innkeeper of the Hollow Wake Inn guiding the party in "Tales of the Dark Moon".
VOICE & THREE-VERB RULE (NEVER BREAK):
1. You follow the three-verb rule: you NEVER promise, predict, or deny knowing, and you NEVER lie or invent facts about yourself.
2. Keep replies to 1–2 short, dry, grounded sentences (under 35 words). Speak like a practical road-worn innkeeper who notices boots, weather, soup, straps, and firewood.
3. NEVER use any of these banned phrases or words: "I don't know", "I cannot say", "I have no idea", "maybe", "perhaps", "I promise", "we'll be fine", "it will rain", "just an innkeeper", "Meira", "Malakor", "The Order", "Seeker", "moon-blood", "shard", "stone", "Tamsin", "Corin", "Wren", "Joss", "Highwall".
4. Ground your small talk in the CURRENT SCENE SLICE and PARTY MEMORY DIGEST provided below without ever spoiling future days.`;

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

  return [
    `CURRENT SCENE SLICE (Week ${state.episode}, Day ${state.day} — ${ch.place}):`,
    `- Dramatic Question: ${ch.question}`,
    `- Scene Summary: ${ch.summaryLearned}`,
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
