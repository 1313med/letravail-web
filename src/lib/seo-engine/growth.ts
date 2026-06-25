import { getSiteUrl } from "../constants";
import { prisma } from "../db";
import { resolveJobPostingSalary } from "../job-salary-schema";
import { buildGrowthForecast, getOpportunitiesReport } from "./opportunities";
import { getGscInsightsReport, getPagePerformanceMap } from "./gsc-engine";
import {
  buildJobInternalLinks,
  contentDepthScore,
} from "./internal-links";
import { computePageScore } from "./page-scoring";
import { getIndexationReport } from "./reports";
import { getRecentSeoActionLogs } from "./seo-db";
import { getCompetitorIntelligenceReport } from "./competitor-intelligence";
import { getContentGenerationReport } from "./content-generation-engine";
import { getKeywordIntelligenceReport } from "./keyword-intelligence";
import { getRankingFeedbackReport } from "./ranking-feedback-engine";
import type {
  GrowthEngineBundle,
  PageScoreBreakdown,
  SeoIntelligenceBundle,
} from "./types";

export async function getSeoIntelligenceBundle(): Promise<SeoIntelligenceBundle> {
  const [keywords, ranking, competitors, content] = await Promise.all([
    getKeywordIntelligenceReport(),
    getRankingFeedbackReport(),
    getCompetitorIntelligenceReport(),
    getContentGenerationReport(),
  ]);

  return {
    keywords,
    ranking,
    competitors,
    content,
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
  const [opportunities, pageScores, gsc, logs, intelligence] = await Promise.all([
    getOpportunitiesReport(),
    computePageScores(),
    getGscInsightsReport(),
    getRecentSeoActionLogs(10),
    getSeoIntelligenceBundle(),
  ]);

  const forecast = buildGrowthForecast(opportunities.opportunities);

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
    generatedAt: new Date().toISOString(),
  };
}
