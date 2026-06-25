import { getSiteUrl } from "../constants";
import { prisma } from "../db";
import { resolveJobPostingSalary } from "../job-salary-schema";
import { getSeoAutopilotReport } from "./autopilot";
import { getCompetitorIntelligenceReport, getCompetitorSerpLayer } from "./competitor-intelligence";
import { getContentGenerationReport } from "./content-generation-engine";
import { getDemandIntelligenceReport } from "./demand-intelligence";
import { buildGrowthForecast, getOpportunitiesReport } from "./opportunities";
import { getGscInsightsReport, getPagePerformanceMap } from "./gsc-engine";
import {
  buildJobInternalLinks,
  contentDepthScore,
} from "./internal-links";
import { getKeywordIntelligenceReport } from "./keyword-intelligence";
import { computePageScore } from "./page-scoring";
import { getRankingFeedbackReport } from "./ranking-feedback-engine";
import { getIndexationReport } from "./reports";
import { getRecentSeoActionLogs } from "./seo-db";
import type {
  AutopilotActionItem,
  GrowthEngineBundle,
  GrowthOrchestratorReport,
  OrchestratorPriorityItem,
  PageScoreBreakdown,
  SeoIntelligenceBundle,
} from "./types";

export function buildGrowthOrchestrator(params: {
  actionQueue: AutopilotActionItem[];
  opportunities: { requiredAction: string; estimatedTrafficGain: number; targetPath?: string; targetLabel?: string }[];
  keywordGaps: { keyword: string; mappedPage: string | null; opportunityScore: number; recommendedAction: string }[];
}): GrowthOrchestratorReport {
  const items: OrchestratorPriorityItem[] = [];
  let rank = 1;

  for (const action of params.actionQueue.slice(0, 12)) {
    items.push({
      rank: rank++,
      title: action.label,
      targetPath: action.targetPath,
      action: action.action,
      potentialGain: action.estimatedTrafficGain,
      confidence: action.confidence,
      source: action.source,
      rationale: action.expectedImpact,
      actionId: action.id,
    });
  }

  for (const opp of params.opportunities.slice(0, 8)) {
    if (!opp.targetPath) continue;
    items.push({
      rank: rank++,
      title: opp.targetLabel ?? opp.requiredAction.slice(0, 60),
      targetPath: opp.targetPath,
      action: "regenerate_content",
      potentialGain: opp.estimatedTrafficGain,
      confidence: 55,
      source: "opportunities",
      rationale: opp.requiredAction,
      actionId: `regenerate_content:${opp.targetPath}`,
    });
  }

  for (const kw of params.keywordGaps.filter((k) => !k.mappedPage).slice(0, 5)) {
    items.push({
      rank: rank++,
      title: `Mapper « ${kw.keyword} »`,
      targetPath: kw.mappedPage ?? "/emplois",
      action: "refresh_metadata",
      potentialGain: Math.round(kw.opportunityScore * 15),
      confidence: 45,
      source: "keyword_intelligence",
      rationale: kw.recommendedAction,
      actionId: `refresh_metadata:${kw.keyword}`,
    });
  }

  const merged = new Map<string, OrchestratorPriorityItem>();
  for (const item of items) {
    const key = `${item.action}:${item.targetPath}`;
    const existing = merged.get(key);
    if (!existing || item.potentialGain > existing.potentialGain) {
      merged.set(key, item);
    }
  }

  const priorities = Array.from(merged.values())
    .sort((a, b) => b.potentialGain - a.potentialGain)
    .map((p, i) => ({ ...p, rank: i + 1 }))
    .slice(0, 15);

  const totalPotentialGain = priorities.reduce((s, p) => s + p.potentialGain, 0);

  return {
    topAction: priorities[0] ?? null,
    priorities,
    totalPotentialGain,
    generatedAt: new Date().toISOString(),
  };
}

export async function getSeoIntelligenceBundle(): Promise<SeoIntelligenceBundle> {
  const [keywords, ranking, competitors, content, serpLayer] = await Promise.all([
    getKeywordIntelligenceReport(),
    getRankingFeedbackReport(),
    getCompetitorIntelligenceReport(),
    getContentGenerationReport(),
    getCompetitorSerpLayer(),
  ]);

  return {
    keywords,
    ranking,
    competitors,
    content,
    serpLayer,
    generatedAt: new Date().toISOString(),
  };
}

export async function computePageScores(): Promise<PageScoreBreakdown[]> {
  const [indexation, perfMap] = await Promise.all([
    getIndexationReport(),
    getPagePerformanceMap(),
  ]);

  const scores: PageScoreBreakdown[] = [];

  for (const row of indexation.rows.slice(0, 120)) {
    const path = row.url.replace(getSiteUrl(), "");
    const trafficScore = perfMap.get(path);

    const breakdown = computePageScore({
      indexStatus: row.indexStatus,
      internalLinkCount: row.pageType === "job" ? 3 : 5,
      expectedInternalLinks: row.pageType === "job" ? 5 : 6,
      schemaComplete: row.hasSalaryData && row.qualityScore >= 60,
      contentDepth: row.jobCount > 10 ? 90 : row.jobCount * 8,
      trafficPerformanceScore: trafficScore,
    });

    scores.push({
      pagePath: path,
      pageType: row.pageType,
      label: row.label,
      ...breakdown,
    });
  }

  const jobs = await prisma.job.findMany({
    where: {
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: {
      slug: true,
      title: true,
      company: true,
      city: true,
      contractType: true,
      description: true,
      salary: true,
      applicationUrl: true,
      publishedAt: true,
      location: { select: { slug: true } },
      companyRef: { select: { slug: true } },
      tags: { select: { tag: { select: { slug: true, name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  for (const job of jobs) {
    const path = `/emploi/${job.slug}`;
    if (scores.some((s) => s.pagePath === path)) continue;

    const links = buildJobInternalLinks({
      title: job.title,
      company: job.company,
      city: job.city,
      contractType: job.contractType,
      companyRef: job.companyRef,
      location: job.location,
      tags: job.tags,
    });

    const salaryResolved = resolveJobPostingSalary({
      salary: job.salary,
      title: job.title,
      city: job.city,
      citySlug: job.location?.slug,
      companySlug: job.companyRef?.slug,
      tags: job.tags.map((t) => t.tag),
      description: job.description,
    });

    const breakdown = computePageScore({
      indexStatus: "index",
      internalLinkCount: links.length,
      expectedInternalLinks: 5,
      schemaComplete: Boolean(
        job.applicationUrl && job.publishedAt && salaryResolved.amount
      ),
      contentDepth: contentDepthScore(job.description.length),
      trafficPerformanceScore: perfMap.get(path),
    });

    scores.push({
      pagePath: path,
      pageType: "job",
      label: job.title,
      ...breakdown,
    });
  }

  return scores.sort((a, b) => a.pageScore - b.pageScore).slice(0, 80);
}

export async function getGrowthEngineBundle(): Promise<GrowthEngineBundle> {
  const [opportunities, pageScores, gsc, logs, intelligence, autopilot, demand] =
    await Promise.all([
      getOpportunitiesReport(),
      computePageScores(),
      getGscInsightsReport(),
      getRecentSeoActionLogs(10),
      getSeoIntelligenceBundle(),
      getSeoAutopilotReport(),
      getDemandIntelligenceReport(),
    ]);

  const forecast = buildGrowthForecast(opportunities.opportunities);

  const orchestrator = buildGrowthOrchestrator({
    actionQueue: autopilot.actionQueue,
    opportunities: opportunities.opportunities,
    keywordGaps: intelligence.keywords.opportunities.filter((k) => !k.mappedPage),
  });

  return {
    opportunities,
    pageScores,
    gsc,
    forecast,
    recentActionLogs: logs.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
    intelligence,
    autopilot,
    demand,
    orchestrator,
    generatedAt: new Date().toISOString(),
  };
}
