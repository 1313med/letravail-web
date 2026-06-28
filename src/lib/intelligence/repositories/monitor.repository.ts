import { prisma } from "@/lib/db";
import { activeJobWhere } from "@/lib/intelligence/queries";

export async function getProductionMonitor() {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    activeSources,
    queuedSources,
    failedSources,
    lastCrawl,
    upcomingCrawls,
    jobsPerHour,
    avgCrawlDuration,
    activeJobs,
    recentFailures,
    dbHealth,
  ] = await Promise.all([
    prisma.sourceProfile.count({ where: { status: "active" } }),
    prisma.sourceProfile.count({
      where: { status: "active", nextCrawlAt: { lte: now } },
    }),
    prisma.sourceProfile.count({ where: { status: { in: ["failed", "error", "disabled"] } } }),
    prisma.scrapeLog.findFirst({ orderBy: { startedAt: "desc" } }),
    prisma.sourceProfile.findMany({
      where: { status: "active", nextCrawlAt: { not: null } },
      orderBy: { nextCrawlAt: "asc" },
      take: 10,
      select: {
        sourceName: true,
        companyName: true,
        nextCrawlAt: true,
        lastCrawlAt: true,
      },
    }),
    prisma.job.count({
      where: { firstSeenAt: { gte: hourAgo } },
    }),
    prisma.scrapeLog.aggregate({
      where: { startedAt: { gte: dayAgo }, durationMs: { not: null } },
      _avg: { durationMs: true },
    }),
    prisma.job.count({ where: activeJobWhere() }),
    prisma.scrapeLog.findMany({
      where: {
        status: { in: ["failed", "error"] },
        startedAt: { gte: dayAgo },
      },
      orderBy: { startedAt: "desc" },
      take: 10,
    }),
    prisma.$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`,
  ]);

  const freshnessRows = await prisma.job.aggregate({
    where: activeJobWhere(),
    _avg: {
      qualityScore: true,
    },
  });

  const staleJobs = await prisma.job.count({
    where: {
      ...activeJobWhere(),
      lastSeenAt: { lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    },
  });

  const freshnessIndex =
    activeJobs > 0
      ? Math.round(((activeJobs - staleJobs) / activeJobs) * 100)
      : 0;

  return {
    systemHealth: dbHealth.length > 0 ? "healthy" : "degraded",
    database: {
      connected: dbHealth.length > 0,
      activeJobs,
    },
    scheduler: {
      activeSources,
      queuedSources,
      failedSources,
      upcomingCrawls: upcomingCrawls.map((s) => ({
        source: s.sourceName,
        company: s.companyName,
        nextCrawlAt: s.nextCrawlAt?.toISOString() ?? null,
        lastCrawlAt: s.lastCrawlAt?.toISOString() ?? null,
      })),
    },
    throughput: {
      jobsPerHour,
      avgCrawlDurationMs: avgCrawlDuration._avg.durationMs,
      lastCrawl: lastCrawl
        ? {
            source: lastCrawl.source,
            status: lastCrawl.status,
            startedAt: lastCrawl.startedAt.toISOString(),
            durationMs: lastCrawl.durationMs,
          }
        : null,
    },
    freshnessIndex,
    avgQuality: freshnessRows._avg.qualityScore ?? 0,
    recentFailures: recentFailures.map((f) => ({
      id: f.id,
      source: f.source,
      startedAt: f.startedAt.toISOString(),
      errorMessage: f.errorMessage,
    })),
  };
}
