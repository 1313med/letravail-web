import { prisma } from "@/lib/db";
import { resolvePeriod } from "@/lib/intelligence/date-ranges";
import type { TimeRange, TrendPoint } from "@/lib/intelligence/types";

export async function getIntelligenceReports(range: TimeRange = "month") {
  const { start, end } = resolvePeriod(range);

  const [
    jobsAdded,
    jobsArchived,
    crawls,
    crawlStats,
    qualityAvg,
    sourcesAdded,
    duplicates,
    validationIssues,
  ] = await Promise.all([
    prisma.job.count({ where: { firstSeenAt: { gte: start, lte: end } } }),
    prisma.job.count({ where: { archivedAt: { gte: start, lte: end } } }),
    prisma.scrapeLog.findMany({
      where: { startedAt: { gte: start, lte: end } },
      orderBy: { startedAt: "asc" },
    }),
    prisma.scrapeLog.aggregate({
      where: { startedAt: { gte: start, lte: end } },
      _count: { _all: true },
      _sum: { jobsFound: true, jobsInserted: true, jobsUpdated: true, duplicates: true },
      _avg: { durationMs: true },
    }),
    prisma.job.aggregate({
      where: {
        firstSeenAt: { gte: start, lte: end },
        qualityScore: { not: null },
      },
      _avg: { qualityScore: true },
    }),
    prisma.sourceProfile.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.scrapeLog.aggregate({
      where: { startedAt: { gte: start, lte: end } },
      _sum: { duplicates: true },
    }),
    prisma.job.count({
      where: {
        updatedAt: { gte: start, lte: end },
        validationStatus: { not: "valid" },
      },
    }),
  ]);

  const dailyJobs: TrendPoint[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const dayStart = new Date(cursor);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(cursor);
    dayEnd.setHours(23, 59, 59, 999);

    const count = await prisma.job.count({
      where: { firstSeenAt: { gte: dayStart, lte: dayEnd } },
    });
    dailyJobs.push({
      date: dayStart.toISOString().slice(0, 10),
      value: count,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const successRate =
    crawls.length > 0
      ? Math.round(
          (crawls.filter((c) => c.status === "success" || c.status === "completed").length /
            crawls.length) *
            100
        )
      : 0;

  return {
    range,
    period: { start: start.toISOString(), end: end.toISOString() },
    summary: {
      jobsAdded,
      jobsArchived,
      netGrowth: jobsAdded - jobsArchived,
      totalCrawls: crawlStats._count._all,
      jobsFound: crawlStats._sum.jobsFound ?? 0,
      jobsInserted: crawlStats._sum.jobsInserted ?? 0,
      jobsUpdated: crawlStats._sum.jobsUpdated ?? 0,
      duplicates: duplicates._sum.duplicates ?? 0,
      avgCrawlDurationMs: crawlStats._avg.durationMs,
      avgQuality: qualityAvg._avg.qualityScore ?? 0,
      sourcesAdded,
      validationIssues,
      crawlSuccessRate: successRate,
    },
    dailyJobs,
    topSources: await prisma.scrapeLog.groupBy({
      by: ["source"],
      where: { startedAt: { gte: start, lte: end } },
      _sum: { jobsInserted: true },
      orderBy: { _sum: { jobsInserted: "desc" } },
      take: 10,
    }),
  };
}

export async function probeEmployerUrl(url: string) {
  const normalized = url.trim();
  const match = await prisma.employerAtsIntelligence.findFirst({
    where: {
      OR: [
        { inputUrl: { contains: normalized, mode: "insensitive" } },
        { careersPageUrl: { contains: normalized, mode: "insensitive" } },
        { finalUrl: { contains: normalized, mode: "insensitive" } },
      ],
    },
    orderBy: { probedAt: "desc" },
  });

  if (match) return match;

  const domain = normalized.replace(/^https?:\/\//, "").split("/")[0];
  return prisma.employerAtsIntelligence.findFirst({
    where: {
      OR: [
        { inputUrl: { contains: domain, mode: "insensitive" } },
        { companyName: { contains: domain.split(".")[0], mode: "insensitive" } },
      ],
    },
    orderBy: { probedAt: "desc" },
  });
}

export async function getRecentProbes(limit = 20) {
  return prisma.employerAtsIntelligence.findMany({
    orderBy: { probedAt: "desc" },
    take: limit,
  });
}
