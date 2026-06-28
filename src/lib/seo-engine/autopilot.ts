import { getRankingFeedbackReport } from "./ranking-feedback-engine";
import { getIndexationReport } from "./reports";
import { getSiteUrl } from "../constants";
import {
  buildInternalLinkAutopilotBatch,
  estimateTrafficGain,
} from "./internal-links";
import {
  computeSeoHealthScore,
  estimateTrafficGainFromGsc,
  confidenceFromSignals,
  expectedCtrForPosition,
} from "./page-scoring";
import type {
  AutopilotActionItem,
  AutopilotActionType,
  QuickWinItem,
  SeoAutopilotReport,
  SeoHealthScore,
} from "./types";

function actionId(action: AutopilotActionType, path: string): string {
  return `${action}:${path}`;
}

function mapRankingActionToAutopilot(
  actions: ("metadata" | "internal_links" | "content" | "revalidate")[]
): AutopilotActionType {
  if (actions.includes("metadata")) return "refresh_metadata";
  if (actions.includes("content")) return "regenerate_content";
  if (actions.includes("internal_links")) return "add_internal_links";
  return "revalidate_page";
}

export async function getSeoAutopilotReport(): Promise<SeoAutopilotReport> {
  const [indexation, ranking, linkAutopilot] = await Promise.all([
    getIndexationReport(),
    getRankingFeedbackReport(),
    buildInternalLinkAutopilotBatch(12),
  ]);

  const gscByPath = new Map(
    ranking.pagePerformance.map((p) => [p.pagePath, p])
  );

  const healthScores: SeoHealthScore[] = [];

  for (const row of indexation.rows.slice(0, 80)) {
    const path = row.url.replace(getSiteUrl(), "");
    const gsc = gscByPath.get(path);

    const health = computeSeoHealthScore({
      indexStatus: row.indexStatus,
      internalLinkCount: row.pageType === "job" ? 3 : 5,
      expectedInternalLinks: row.pageType === "job" ? 5 : 6,
      schemaComplete: row.hasSalaryData && row.qualityScore >= 60,
      contentDepth: row.jobCount > 10 ? 90 : Math.min(90, row.jobCount * 8),
      impressions: gsc?.impressions,
      clicks: gsc?.clicks,
      ctr: gsc?.ctr,
      position: gsc?.position,
      freshnessDays: row.pageType === "city" ? 7 : 14,
    });

    const gain = gsc
      ? estimateTrafficGainFromGsc(gsc.impressions, gsc.ctr, gsc.position)
      : estimateTrafficGain({ jobCount: row.jobCount });

    healthScores.push({
      pagePath: path,
      pageType: row.pageType,
      label: row.label,
      score: health.score,
      indexationScore: health.indexationScore,
      internalLinksScore: health.internalLinksScore,
      ctrScore: health.ctrScore,
      positionScore: health.positionScore,
      schemaScore: health.schemaScore,
      contentDepthScore: health.contentDepthScore,
      freshnessScore: health.freshnessScore,
      issues: health.issues,
      opportunities: health.opportunities,
      estimatedTrafficGain: gain,
      impressions: gsc?.impressions ?? 0,
      position: gsc?.position ?? 0,
      ctr: gsc?.ctr ?? 0,
    });
  }

  healthScores.sort((a, b) => a.score - b.score);

  const quickWinQueue: QuickWinItem[] = ranking.pagePerformance
    .filter(
      (p) =>
        p.position >= 4 &&
        p.position <= 15 &&
        p.impressions >= 30 &&
        p.ctr < expectedCtrForPosition(p.position) * 0.85
    )
    .map((p) => {
      const benchmark = expectedCtrForPosition(p.position);
      const gain = estimateTrafficGainFromGsc(p.impressions, p.ctr, p.position);
      const suggestedAction: AutopilotActionType =
        p.ctr < benchmark * 0.5 ? "refresh_metadata" : "add_internal_links";

      return {
        pagePath: p.pagePath,
        pageType: p.pageType,
        label: p.pagePath.split("/").pop()?.replace(/-/g, " ") ?? p.pagePath,
        position: p.position,
        impressions: p.impressions,
        ctr: p.ctr,
        benchmarkCtr: benchmark,
        estimatedTrafficGain: gain,
        confidence: confidenceFromSignals({
          impressions: p.impressions,
          position: p.position,
          hasGsc: true,
        }),
        suggestedAction,
        actionLabel:
          suggestedAction === "refresh_metadata"
            ? "Refresh metadata"
            : "Add internal links",
      };
    })
    .sort((a, b) => b.estimatedTrafficGain - a.estimatedTrafficGain)
    .slice(0, 20);

  const actionQueue: AutopilotActionItem[] = [];

  for (const rec of ranking.recommendations.slice(0, 15)) {
    const action = mapRankingActionToAutopilot(rec.actions);
    actionQueue.push({
      id: actionId(action, rec.page),
      action,
      label: rec.recommendation.slice(0, 80),
      targetPath: rec.page,
      expectedImpact: rec.issue,
      confidence: confidenceFromSignals({
        impressions: rec.impressions,
        position: rec.position,
        hasGsc: true,
      }),
      estimatedTrafficGain: rec.estimatedGain,
      source: "ranking_feedback",
    });
  }

  for (const link of linkAutopilot.slice(0, 10)) {
    actionQueue.push({
      id: actionId("add_internal_links", link.sourcePath),
      action: "add_internal_links",
      label: `Ajouter ${link.recommendedLinks.length} liens → ${link.sourceLabel}`,
      targetPath: link.sourcePath,
      expectedImpact: "internal_link_autopilot",
      confidence: 75,
      estimatedTrafficGain: link.estimatedTrafficGain,
      source: "knowledge_graph",
    });
  }

  for (const h of healthScores.filter((s) => s.score < 55).slice(0, 8)) {
    if (actionQueue.some((a) => a.targetPath === h.pagePath)) continue;
    actionQueue.push({
      id: actionId("regenerate_content", h.pagePath),
      action: "regenerate_content",
      label: `Enrichir contenu — score ${h.score}`,
      targetPath: h.pagePath,
      expectedImpact: h.issues.join(", ") || "low_health",
      confidence: 60,
      estimatedTrafficGain: h.estimatedTrafficGain,
      source: "health_score",
    });
  }

  actionQueue.sort((a, b) => b.estimatedTrafficGain - a.estimatedTrafficGain);

  const totalGain = actionQueue.reduce((s, a) => s + a.estimatedTrafficGain, 0);

  return {
    healthScores: healthScores.slice(0, 40),
    quickWinQueue,
    actionQueue: actionQueue.slice(0, 25),
    linkAutopilot: linkAutopilot.map((l) => ({
      sourcePath: l.sourcePath,
      sourceLabel: l.sourceLabel,
      recommendedLinks: l.recommendedLinks,
      missingLinkCount: l.missingLinkCount,
      estimatedTrafficGain: l.estimatedTrafficGain,
    })),
    summary: {
      avgHealthScore:
        healthScores.length > 0
          ? Math.round(
              healthScores.reduce((s, h) => s + h.score, 0) / healthScores.length
            )
          : 0,
      pagesNeedingAction: healthScores.filter((h) => h.score < 70).length,
      totalEstimatedGain: totalGain,
      topPriorityPath: actionQueue[0]?.targetPath ?? null,
    },
    generatedAt: new Date().toISOString(),
  };
}
