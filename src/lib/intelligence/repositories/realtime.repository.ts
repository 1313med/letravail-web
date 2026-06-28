import { prisma } from "@/lib/db";

export async function getRealtimeSnapshot() {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const [
    dbHealth,
    jobsAddedLive,
    schedulerQueued,
    recentActivations,
    recentFailures,
    activeEmployers,
  ] = await Promise.all([
    prisma.$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`,
    prisma.job.count({ where: { firstSeenAt: { gte: hourAgo } } }),
    prisma.sourceProfile.count({
      where: { status: "active", nextCrawlAt: { lte: now } },
    }),
    prisma.employerAtsIntelligence.findMany({
      where: { activationState: "ACTIVE", updatedAt: { gte: todayStart } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        companyName: true,
        sourceName: true,
        updatedAt: true,
        automaticActivation: true,
        activationReason: true,
      },
    }),
    prisma.scrapeLog.findMany({
      where: {
        status: { in: ["failed", "error"] },
        startedAt: { gte: hourAgo },
      },
      orderBy: { startedAt: "desc" },
      take: 5,
      select: { id: true, source: true, startedAt: true, errorMessage: true },
    }),
    prisma.employerAtsIntelligence.count({ where: { activationState: "ACTIVE" } }),
  ]);

  return {
    lastUpdated: now.toISOString(),
    databaseConnected: dbHealth.length > 0,
    schedulerRunning: schedulerQueued > 0 || activeEmployers > 0,
    jobsAddedLive,
    activeEmployers,
    recentActivations: recentActivations.map((a) => ({
      id: a.id,
      company: a.companyName,
      source: a.sourceName,
      at: a.updatedAt.toISOString(),
      automatic: a.automaticActivation,
      reason: a.activationReason,
    })),
    recentFailures: recentFailures.map((f) => ({
      id: f.id,
      source: f.source,
      at: f.startedAt.toISOString(),
      error: f.errorMessage,
    })),
  };
}
