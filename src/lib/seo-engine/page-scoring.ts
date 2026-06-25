import type { IndexStatus } from "./types";

export interface SeoHealthInput {
  indexStatus: IndexStatus;
  internalLinkCount: number;
  expectedInternalLinks: number;
  schemaComplete: boolean;
  contentDepth: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  position?: number;
  freshnessDays?: number;
}

export interface SeoHealthBreakdown {
  score: number;
  indexationScore: number;
  internalLinksScore: number;
  ctrScore: number;
  positionScore: number;
  schemaScore: number;
  contentDepthScore: number;
  freshnessScore: number;
  issues: string[];
  opportunities: string[];
}

export function freshnessScoreFromDays(days: number): number {
  if (days <= 3) return 100;
  if (days <= 7) return 85;
  if (days <= 14) return 70;
  if (days <= 30) return 50;
  if (days <= 60) return 30;
  return 15;
}

export function ctrScoreFromBenchmark(ctr: number, position: number): number {
  const expected = expectedCtrForPosition(position);
  if (expected <= 0) return 50;
  const ratio = ctr / expected;
  return Math.round(Math.min(100, Math.max(0, ratio * 100)));
}

export function positionScoreFromRank(position: number): number {
  if (position <= 3) return 100;
  if (position <= 5) return 85;
  if (position <= 10) return 70;
  if (position <= 15) return 55;
  if (position <= 20) return 40;
  if (position <= 30) return 25;
  return 10;
}

export function computeSeoHealthScore(input: SeoHealthInput): SeoHealthBreakdown {
  const indexationScore = input.indexStatus === "index" ? 100 : 35;
  const internalLinksScore =
    input.expectedInternalLinks > 0
      ? Math.round(
          Math.min(100, (input.internalLinkCount / input.expectedInternalLinks) * 100)
        )
      : 100;
  const schemaScore = input.schemaComplete ? 100 : 40;
  const contentDepthScore = Math.max(0, Math.min(100, input.contentDepth));
  const freshnessScore = freshnessScoreFromDays(input.freshnessDays ?? 30);

  const hasGsc = (input.impressions ?? 0) > 0 && (input.position ?? 0) > 0;
  const ctrScore = hasGsc
    ? ctrScoreFromBenchmark(input.ctr ?? 0, input.position ?? 50)
    : 50;
  const positionScore = hasGsc
    ? positionScoreFromRank(input.position ?? 50)
    : 50;

  const score = Math.round(
    indexationScore * 0.15 +
      internalLinksScore * 0.15 +
      ctrScore * 0.15 +
      positionScore * 0.15 +
      schemaScore * 0.15 +
      contentDepthScore * 0.15 +
      freshnessScore * 0.1
  );

  const issues: string[] = [];
  const opportunities: string[] = [];

  if (indexationScore < 100) issues.push("Page non indexée");
  if (internalLinksScore < 70) issues.push("Maillage interne insuffisant");
  if (schemaScore < 80) issues.push("Schema incomplet");
  if (contentDepthScore < 60) issues.push("Contenu fin");
  if (freshnessScore < 60) issues.push("Données peu fraîches");
  if (hasGsc && ctrScore < 60) issues.push("CTR sous le benchmark");
  if (hasGsc && input.position! >= 4 && input.position! <= 15) {
    opportunities.push("Quick win — position 4–15");
  }
  if (hasGsc && (input.impressions ?? 0) >= 100 && ctrScore < 50) {
    opportunities.push("Fort potentiel CTR");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    indexationScore,
    internalLinksScore,
    ctrScore,
    positionScore,
    schemaScore,
    contentDepthScore,
    freshnessScore,
    issues,
    opportunities,
  };
}

export function estimateTrafficGainFromGsc(
  impressions: number,
  ctr: number,
  position: number
): number {
  const expected = expectedCtrForPosition(position);
  return Math.round(Math.max(0, impressions * (expected - ctr)));
}

export function confidenceFromSignals(params: {
  impressions: number;
  position: number;
  hasGsc: boolean;
  jobCount?: number;
}): number {
  let c = 40;
  if (params.hasGsc) c += 25;
  if (params.impressions >= 100) c += 20;
  else if (params.impressions >= 30) c += 10;
  if (params.position >= 4 && params.position <= 15) c += 15;
  if ((params.jobCount ?? 0) >= 5) c += 10;
  return Math.min(100, c);
}

export function computePagePerformanceScore(
  clicks: number,
  impressions: number,
  position: number
): number {
  const safePosition = Math.max(position, 1);
  const raw = (clicks * 2 + impressions * 0.1) / safePosition;
  return Math.round(Math.min(100, raw * 10));
}

export function computePageScore(params: {
  indexStatus: IndexStatus;
  internalLinkCount: number;
  expectedInternalLinks: number;
  schemaComplete: boolean;
  contentDepth: number;
  trafficPerformanceScore?: number;
}): {
  pageScore: number;
  indexationScore: number;
  internalLinksScore: number;
  schemaScore: number;
  contentDepthScore: number;
  trafficScore: number;
} {
  const indexationScore = params.indexStatus === "index" ? 100 : 40;
  const internalLinksScore =
    params.expectedInternalLinks > 0
      ? Math.round(
          Math.min(100, (params.internalLinkCount / params.expectedInternalLinks) * 100)
        )
      : 100;
  const schemaScore = params.schemaComplete ? 100 : 35;
  const contentDepthScore = Math.max(0, Math.min(100, params.contentDepth));
  const trafficScore = params.trafficPerformanceScore ?? 50;

  const pageScore = Math.round(
    indexationScore * 0.2 +
      internalLinksScore * 0.2 +
      schemaScore * 0.2 +
      contentDepthScore * 0.2 +
      trafficScore * 0.2
  );

  return {
    pageScore: Math.max(0, Math.min(100, pageScore)),
    indexationScore,
    internalLinksScore,
    schemaScore,
    contentDepthScore,
    trafficScore,
  };
}

export function expectedCtrForPosition(position: number): number {
  if (position <= 1) return 0.28;
  if (position <= 3) return 0.12;
  if (position <= 5) return 0.07;
  if (position <= 10) return 0.04;
  return 0.02;
}
