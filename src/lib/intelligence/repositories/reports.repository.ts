import { prisma } from "@/lib/db";
import { resolvePeriod } from "@/lib/intelligence/date-ranges";
import type { TimeRange } from "@/lib/intelligence/types";
import { getRecentProbes, probeEmployerUrl } from "./discovery.repository";
import { getExecutiveAnalytics } from "./analytics.repository";

export { getRecentProbes, probeEmployerUrl };

export async function getIntelligenceReports(range: TimeRange = "month") {
  return getFullIntelligenceReports(range);
}

export async function getFullIntelligenceReports(range: TimeRange = "month") {
  const analytics = await getExecutiveAnalytics(range);
  const { start, end } = resolvePeriod(range);

  const [crawlStats, schedulerStats, sourceGrowthRows, validationTrendRows, activationSuccess] =
    await Promise.all([
      prisma.scrapeLog.aggregate({
        where: { startedAt: { gte: start, lte: end } },
        _count: { _all: true },
        _sum: { jobsFound: true, jobsInserted: true, jobsUpdated: true, duplicates: true },
        _avg: { durationMs: true },
      }),
      prisma.sourceProfile.aggregate({
        where: { status: "active" },
        _avg: { failureRate: true, avgCrawlDurationMs: true },
        _count: { _all: true },
      }),
      prisma.$queryRaw<{ day: Date; count: bigint }[]>`
        SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
        FROM source_profiles WHERE "createdAt" >= ${start}
        GROUP BY 1 ORDER BY 1
      `,
      prisma.$queryRaw<{ day: Date; avg: number | null }[]>`
        SELECT date_trunc('day', "lastValidationAt") AS day, AVG("validationScore") AS avg
        FROM employer_ats_intelligence
        WHERE "lastValidationAt" >= ${start} AND "validationScore" IS NOT NULL
        GROUP BY 1 ORDER BY 1
      `,
      prisma.$queryRaw<{ active: bigint; failed: bigint }[]>`
        SELECT
          COUNT(*) FILTER (WHERE "activationState" = 'ACTIVE')::bigint AS active,
          COUNT(*) FILTER (WHERE "activationState" = 'FAILED')::bigint AS failed
        FROM employer_ats_intelligence
      `,
    ]);

  const successData = activationSuccess[0];
  const activationTotal = Number(successData?.active ?? 0) + Number(successData?.failed ?? 0);
  const activationSuccessRate =
    activationTotal > 0
      ? Math.round((Number(successData?.active ?? 0) / activationTotal) * 100)
      : 0;

  const crawls = await prisma.scrapeLog.findMany({
    where: { startedAt: { gte: start, lte: end } },
    select: { status: true },
  });
  const crawlSuccessRate =
    crawls.length > 0
      ? Math.round(
          (crawls.filter((c) => c.status === "success" || c.status === "completed").length /
            crawls.length) *
            100
        )
      : 0;

  const jobsAdded = analytics.trends.jobGrowth.reduce((s, p) => s + p.value, 0);

  return {
    ...analytics,
    summary: {
      jobsAdded,
      jobsArchived: 0,
      netGrowth: jobsAdded,
      totalCrawls: crawlStats._count._all,
      jobsFound: crawlStats._sum.jobsFound ?? 0,
      jobsInserted: crawlStats._sum.jobsInserted ?? 0,
      jobsUpdated: crawlStats._sum.jobsUpdated ?? 0,
      duplicates: crawlStats._sum.duplicates ?? 0,
      avgCrawlDurationMs: crawlStats._avg.durationMs,
      avgQuality: analytics.analytics.avgEmployerHealth,
      sourcesAdded: sourceGrowthRows.reduce((s, r) => s + Number(r.count), 0),
      validationIssues: 0,
      crawlSuccessRate,
      activationSuccessRate,
      activeSources: schedulerStats._count._all,
    },
    dailyJobs: analytics.trends.jobGrowth,
    topSources: await prisma.scrapeLog.groupBy({
      by: ["source"],
      where: { startedAt: { gte: start, lte: end } },
      _sum: { jobsInserted: true },
      orderBy: { _sum: { jobsInserted: "desc" } },
      take: 10,
    }),
    reports: {
      activationSuccess: {
        rate: activationSuccessRate,
        active: Number(successData?.active ?? 0),
        failed: Number(successData?.failed ?? 0),
      },
      healthDistribution: analytics.healthDistribution,
      employerLifecycle: analytics.lifecycleCounts,
      validationTrend: validationTrendRows.map((r) => ({
        date: r.day.toISOString().slice(0, 10),
        value: r.avg != null ? Math.round(r.avg * 10) / 10 : 0,
      })),
      schedulerPerformance: {
        activeSources: schedulerStats._count._all,
        avgFailureRate: schedulerStats._avg.failureRate ?? 0,
        avgCrawlDurationMs: schedulerStats._avg.avgCrawlDurationMs ?? 0,
        crawlSuccessRate,
      },
      crawlerPerformance: {
        totalCrawls: crawlStats._count._all,
        jobsFound: crawlStats._sum.jobsFound ?? 0,
        jobsInserted: crawlStats._sum.jobsInserted ?? 0,
        avgDurationMs: crawlStats._avg.durationMs ?? 0,
        successRate: crawlSuccessRate,
      },
      sectorGrowth: analytics.trends.sectorGrowth,
      sourceGrowth: sourceGrowthRows.map((r) => ({
        date: r.day.toISOString().slice(0, 10),
        value: Number(r.count),
      })),
      atsMarketShare: analytics.trends.atsDistribution,
      topImproving: analytics.topImproving,
      topDegrading: analytics.topDegrading,
    },
  };
}

export type FullIntelligenceReports = Awaited<ReturnType<typeof getFullIntelligenceReports>>;
