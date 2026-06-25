import type { IndexStatus } from "./types";

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
