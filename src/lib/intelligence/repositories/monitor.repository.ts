import { prisma } from "@/lib/db";
import { activeJobWhere } from "@/lib/intelligence/queries";
import { normalizeHealthScore } from "@/lib/intelligence/activation";

const employerSelect = {
  id: true,
  companyName: true,
  sourceName: true,
  atsPlatform: true,
  confidence: true,
  healthScore: true,
  validationScore: true,
  activationState: true,
  activationReason: true,
  deactivationReason: true,
  automaticActivation: true,
  nextRetryAt: true,
  retryCount: true,
  updatedAt: true,
  lastValidationAt: true,
} as const;

export async function getProductionMonitor() {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    activeEmployers,
    readyQueueCount,
    retryQueueCount,
    validationQueueCount,
    avgHealth,
    lastAutomaticActivation,
    lastCrawl,
    jobsPerHour,
    avgCrawlDuration,
    activeJobs,
    recentFailures,
    dbHealth,
    activationQueue,
    retryQueue,
    validationQueue,
    healthAlerts,
    recentlyActivated,
    recentlyDeactivated,
    highestPriority,
    lowestHealth,
    upcomingScheduler,
  ] = await Promise.all([
    prisma.employerAtsIntelligence.count({ where: { activationState: "ACTIVE" } }),
    prisma.employerAtsIntelligence.count({ where: { activationState: "READY" } }),
    prisma.employerAtsIntelligence.count({ where: { nextRetryAt: { not: null } } }),
    prisma.employerAtsIntelligence.count({
      where: {
        lastValidationAt: null,
        activationState: { in: ["PROBED", "READY", "MONITORED"] },
      },
    }),
    prisma.employerAtsIntelligence.aggregate({
      where: { healthScore: { not: null } },
      _avg: { healthScore: true },
    }),
    prisma.employerAtsIntelligence.findFirst({
      where: { automaticActivation: true, activationState: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
      select: {
        companyName: true,
        sourceName: true,
        updatedAt: true,
        activationReason: true,
      },
    }),
    prisma.scrapeLog.findFirst({ orderBy: { startedAt: "desc" } }),
    prisma.job.count({ where: { firstSeenAt: { gte: hourAgo } } }),
    prisma.scrapeLog.aggregate({
      where: { startedAt: { gte: dayAgo }, durationMs: { not: null } },
      _avg: { durationMs: true },
    }),
    prisma.job.count({ where: activeJobWhere() }),
    prisma.scrapeLog.findMany({
      where: { status: { in: ["failed", "error"] }, startedAt: { gte: dayAgo } },
      orderBy: { startedAt: "desc" },
      take: 10,
    }),
    prisma.$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`,
    prisma.employerAtsIntelligence.findMany({
      where: { activationState: "READY" },
      orderBy: { updatedAt: "asc" },
      take: 12,
      select: employerSelect,
    }),
    prisma.employerAtsIntelligence.findMany({
      where: { nextRetryAt: { not: null } },
      orderBy: { nextRetryAt: "asc" },
      take: 12,
      select: employerSelect,
    }),
    prisma.employerAtsIntelligence.findMany({
      where: {
        lastValidationAt: null,
        activationState: { in: ["PROBED", "READY", "MONITORED"] },
      },
      orderBy: { probedAt: "asc" },
      take: 12,
      select: employerSelect,
    }),
    prisma.employerAtsIntelligence.findMany({
      where: { healthScore: { not: null, lt: 60 } },
      orderBy: { healthScore: "asc" },
      take: 12,
      select: employerSelect,
    }),
    prisma.employerAtsIntelligence.findMany({
      where: {
        activationState: "ACTIVE",
        updatedAt: { gte: weekAgo },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: employerSelect,
    }),
    prisma.employerAtsIntelligence.findMany({
      where: {
        deactivationReason: { not: null },
        updatedAt: { gte: weekAgo },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: employerSelect,
    }),
    prisma.$queryRaw<
      {
        id: string;
        companyName: string;
        sourceName: string | null;
        atsPlatform: string;
        healthScore: number | null;
        activationState: string | null;
        priorityScore: number | null;
      }[]
    >`
      SELECT e.id, e."companyName", e."sourceName", e."atsPlatform",
             e."healthScore", e."activationState", s."priorityScore"
      FROM employer_ats_intelligence e
      LEFT JOIN source_profiles s ON s."sourceName" = e."sourceName"
      WHERE s."priorityScore" IS NOT NULL
      ORDER BY s."priorityScore" DESC
      LIMIT 10
    `,
    prisma.employerAtsIntelligence.findMany({
      where: { healthScore: { not: null } },
      orderBy: { healthScore: "asc" },
      take: 10,
      select: employerSelect,
    }),
    prisma.sourceProfile.findMany({
      where: { status: "active", nextCrawlAt: { not: null } },
      orderBy: { nextCrawlAt: "asc" },
      take: 12,
      select: {
        sourceName: true,
        companyName: true,
        nextCrawlAt: true,
        lastCrawlAt: true,
        status: true,
      },
    }),
  ]);

  const freshnessRows = await prisma.job.aggregate({
    where: activeJobWhere(),
    _avg: { qualityScore: true },
  });

  const staleJobs = await prisma.job.count({
    where: {
      ...activeJobWhere(),
      lastSeenAt: { lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    },
  });

  const freshnessIndex =
    activeJobs > 0 ? Math.round(((activeJobs - staleJobs) / activeJobs) * 100) : 0;

  const mapEmployer = (e: (typeof activationQueue)[0]) => ({
    id: e.id,
    company: e.companyName,
    source: e.sourceName,
    ats: e.atsPlatform,
    health: e.healthScore,
    validation: e.validationScore,
    state: e.activationState,
    reason: e.activationReason ?? e.deactivationReason,
    retryCount: e.retryCount,
    nextRetryAt: e.nextRetryAt?.toISOString() ?? null,
    updatedAt: e.updatedAt.toISOString(),
  });

  return {
    systemHealth: dbHealth.length > 0 ? "healthy" : "degraded",
    database: { connected: dbHealth.length > 0, activeJobs },
    activation: {
      activeEmployers,
      readyQueue: readyQueueCount,
      retryQueue: retryQueueCount,
      validationQueue: validationQueueCount,
      averageHealth: avgHealth._avg.healthScore ?? 0,
      lastAutomaticActivation: lastAutomaticActivation
        ? {
            company: lastAutomaticActivation.companyName,
            source: lastAutomaticActivation.sourceName,
            activatedAt: lastAutomaticActivation.updatedAt.toISOString(),
            reason: lastAutomaticActivation.activationReason,
          }
        : null,
    },
    queues: {
      activation: activationQueue.map(mapEmployer),
      retry: retryQueue.map(mapEmployer),
      validation: validationQueue.map(mapEmployer),
    },
    healthAlerts: healthAlerts.map(mapEmployer),
    recentlyActivated: recentlyActivated.map(mapEmployer),
    recentlyDeactivated: recentlyDeactivated.map(mapEmployer),
    highestPriority: highestPriority.map((e) => ({
      id: e.id,
      company: e.companyName,
      source: e.sourceName,
      ats: e.atsPlatform,
      health: e.healthScore,
      state: e.activationState,
      priority: e.priorityScore,
    })),
    lowestHealth: lowestHealth.map(mapEmployer),
    upcomingScheduler: upcomingScheduler.map((s) => ({
      source: s.sourceName,
      company: s.companyName,
      nextCrawlAt: s.nextCrawlAt?.toISOString() ?? null,
      lastCrawlAt: s.lastCrawlAt?.toISOString() ?? null,
      status: s.status,
    })),
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

export function isLowHealthScore(score: number | null | undefined): boolean {
  const normalized = normalizeHealthScore(score);
  return normalized != null && normalized < 60;
}
