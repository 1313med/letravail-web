import { prisma } from "@/lib/db";
import { bucketDates, isoDateKey, rangeToDays, resolvePeriod } from "@/lib/intelligence/date-ranges";
import type { TimeRange } from "@/lib/intelligence/types";

async function dailyEmployerGrowth(days: number, since: Date) {
  const rows = await prisma.$queryRaw<{ day: Date; count: bigint }[]>`
    SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
    FROM employer_ats_intelligence WHERE "createdAt" >= ${since}
    GROUP BY 1 ORDER BY 1
  `;
  const map = new Map(rows.map((r) => [isoDateKey(new Date(r.day)), Number(r.count)]));
  return bucketDates(days).map((date) => ({ date, value: map.get(date) ?? 0 }));
}

async function dailyJobGrowth(days: number, since: Date) {
  const rows = await prisma.$queryRaw<{ day: Date; count: bigint }[]>`
    SELECT date_trunc('day', "firstSeenAt") AS day, COUNT(*)::bigint AS count
    FROM jobs WHERE "firstSeenAt" >= ${since}
    GROUP BY 1 ORDER BY 1
  `;
  const map = new Map(rows.map((r) => [isoDateKey(new Date(r.day)), Number(r.count)]));
  return bucketDates(days).map((date) => ({ date, value: map.get(date) ?? 0 }));
}

async function dailyAvgHealth(days: number, since: Date) {
  const rows = await prisma.$queryRaw<{ day: Date; avg: number | null }[]>`
    SELECT date_trunc('day', "lastHealthCheck") AS day, AVG("healthScore") AS avg
    FROM employer_ats_intelligence
    WHERE "lastHealthCheck" >= ${since} AND "healthScore" IS NOT NULL
    GROUP BY 1 ORDER BY 1
  `;
  const map = new Map(
    rows.map((r) => [isoDateKey(new Date(r.day)), r.avg != null ? Math.round(r.avg * 10) / 10 : 0])
  );
  return bucketDates(days).map((date) => ({ date, value: map.get(date) ?? 0 }));
}

async function dailyAvgValidation(days: number, since: Date) {
  const rows = await prisma.$queryRaw<{ day: Date; avg: number | null }[]>`
    SELECT date_trunc('day', "lastValidationAt") AS day, AVG("validationScore") AS avg
    FROM employer_ats_intelligence
    WHERE "lastValidationAt" >= ${since} AND "validationScore" IS NOT NULL
    GROUP BY 1 ORDER BY 1
  `;
  const map = new Map(
    rows.map((r) => [isoDateKey(new Date(r.day)), r.avg != null ? Math.round(r.avg * 10) / 10 : 0])
  );
  return bucketDates(days).map((date) => ({ date, value: map.get(date) ?? 0 }));
}

export async function getExecutiveAnalytics(range: TimeRange = "month") {
  const days = rangeToDays(range);
  const { start, end } = resolvePeriod(range);

  const [
    employerGrowth,
    autoActivations,
    healthTrend,
    validationTrend,
    retryTrend,
    jobGrowth,
    sectorGrowth,
    atsDistribution,
    avgDiscoveredToActiveMs,
    validationSuccessPct,
    avgEmployerHealth,
    avgCrawlDuration,
    jobsPerEmployer,
    jobsPerAts,
    jobsPerSector,
    jobsPerRegion,
    lifecycleCounts,
    healthDistribution,
    topImproving,
    topDegrading,
    executiveSummary,
  ] = await Promise.all([
    dailyEmployerGrowth(days, start),
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', "updatedAt") AS day, COUNT(*)::bigint AS count
      FROM employer_ats_intelligence
      WHERE "automaticActivation" = true AND "activationState" = 'ACTIVE'
        AND "updatedAt" >= ${start}
      GROUP BY 1 ORDER BY 1
    `.then((rows) => {
      const map = new Map(rows.map((r) => [isoDateKey(new Date(r.day)), Number(r.count)]));
      return bucketDates(days).map((date) => ({ date, value: map.get(date) ?? 0 }));
    }),
    dailyAvgHealth(days, start),
    dailyAvgValidation(days, start),
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', "nextRetryAt") AS day, COUNT(*)::bigint AS count
      FROM employer_ats_intelligence
      WHERE "nextRetryAt" IS NOT NULL AND "nextRetryAt" >= ${start}
      GROUP BY 1 ORDER BY 1
    `.then((rows) => {
      const map = new Map(rows.map((r) => [isoDateKey(new Date(r.day)), Number(r.count)]));
      return bucketDates(days).map((date) => ({ date, value: map.get(date) ?? 0 }));
    }),
    dailyJobGrowth(days, start),
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', j."firstSeenAt") AS day, COUNT(*)::bigint AS count
      FROM jobs j
      JOIN companies c ON c.id = j."companyId"
      WHERE j."firstSeenAt" >= ${start} AND c.sector IS NOT NULL
      GROUP BY 1 ORDER BY 1
    `.then((rows) => {
      const map = new Map(rows.map((r) => [isoDateKey(new Date(r.day)), Number(r.count)]));
      return bucketDates(days).map((date) => ({ date, value: map.get(date) ?? 0 }));
    }),
    prisma.employerAtsIntelligence.groupBy({
      by: ["atsPlatform"],
      _count: { _all: true },
      orderBy: { _count: { atsPlatform: "desc" } },
    }),
    prisma.$queryRaw<{ avg_ms: number | null }[]>`
      SELECT AVG(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")) * 1000) AS avg_ms
      FROM employer_ats_intelligence
      WHERE "activationState" = 'ACTIVE'
    `,
    prisma.$queryRaw<{ rate: number | null }[]>`
      SELECT
        CASE WHEN COUNT(*) FILTER (WHERE "validationScore" IS NOT NULL) = 0 THEN 0
        ELSE 100.0 * COUNT(*) FILTER (WHERE "validationScore" >= 70) /
             COUNT(*) FILTER (WHERE "validationScore" IS NOT NULL)
        END AS rate
      FROM employer_ats_intelligence
    `,
    prisma.employerAtsIntelligence.aggregate({
      where: { healthScore: { not: null } },
      _avg: { healthScore: true },
    }),
    prisma.scrapeLog.aggregate({
      where: { startedAt: { gte: start, lte: end }, durationMs: { not: null } },
      _avg: { durationMs: true },
    }),
    prisma.$queryRaw<{ avg: number | null }[]>`
      SELECT AVG(job_count)::float AS avg FROM (
        SELECT COUNT(*) AS job_count FROM jobs WHERE "isActive" = true GROUP BY company
      ) t
    `,
    prisma.$queryRaw<{ ats: string; jobs: bigint }[]>`
      SELECT COALESCE(sp."atsPlatform", 'Unknown') AS ats, COUNT(j.id)::bigint AS jobs
      FROM jobs j
      JOIN source_profiles sp ON sp."sourceName" = j.source
      WHERE j."isActive" = true
      GROUP BY 1 ORDER BY jobs DESC LIMIT 10
    `,
    prisma.$queryRaw<{ sector: string; jobs: bigint }[]>`
      SELECT COALESCE(c.sector, 'Unknown') AS sector, COUNT(j.id)::bigint AS jobs
      FROM jobs j
      LEFT JOIN companies c ON c.id = j."companyId"
      WHERE j."isActive" = true
      GROUP BY 1 ORDER BY jobs DESC LIMIT 10
    `,
    prisma.$queryRaw<{ region: string; jobs: bigint }[]>`
      SELECT COALESCE(l.region, j.city, 'Unknown') AS region, COUNT(j.id)::bigint AS jobs
      FROM jobs j
      LEFT JOIN locations l ON l.id = j."locationId"
      WHERE j."isActive" = true
      GROUP BY 1 ORDER BY jobs DESC LIMIT 10
    `,
    prisma.employerAtsIntelligence.groupBy({
      by: ["activationState"],
      _count: { _all: true },
    }),
    prisma.$queryRaw<{ bucket: string; count: bigint }[]>`
      SELECT
        CASE
          WHEN "healthScore" >= 80 THEN '80-100'
          WHEN "healthScore" >= 60 THEN '60-79'
          WHEN "healthScore" >= 40 THEN '40-59'
          ELSE '0-39'
        END AS bucket,
        COUNT(*)::bigint AS count
      FROM employer_ats_intelligence
      WHERE "healthScore" IS NOT NULL
      GROUP BY 1 ORDER BY 1
    `,
    prisma.$queryRaw<{ company: string; delta: bigint }[]>`
      SELECT j.company,
        COUNT(*) FILTER (WHERE j."firstSeenAt" >= ${start})::bigint AS delta
      FROM jobs j WHERE j."isActive" = true
      GROUP BY j.company
      HAVING COUNT(*) FILTER (WHERE j."firstSeenAt" >= ${start}) > 0
      ORDER BY delta DESC LIMIT 10
    `,
    prisma.$queryRaw<{ company: string; health: number; failures: number | null }[]>`
      SELECT e."companyName" AS company,
        COALESCE(e."healthScore", 0) AS health,
        sp."failureRate" AS failures
      FROM employer_ats_intelligence e
      LEFT JOIN source_profiles sp ON sp."sourceName" = e."sourceName"
      WHERE e."healthScore" IS NOT NULL
      ORDER BY e."healthScore" ASC, sp."failureRate" DESC NULLS LAST
      LIMIT 10
    `,
    Promise.all([
      prisma.job.count({ where: { isActive: true } }),
      prisma.company.count(),
      prisma.sourceProfile.count({ where: { status: "active" } }),
      prisma.employerAtsIntelligence.count({ where: { activationState: "ACTIVE" } }),
    ]),
  ]);

  const [activeJobs, totalCompanies, activeSources, activeEmployerCount] = executiveSummary;

  return {
    range,
    period: { start: start.toISOString(), end: end.toISOString() },
    generatedAt: new Date().toISOString(),
    trends: {
      employerGrowth,
      autoActivations,
      healthTrend,
      validationTrend,
      retryTrend,
      jobGrowth,
      sectorGrowth,
      atsDistribution: atsDistribution.map((a) => ({
        name: a.atsPlatform,
        count: a._count._all,
      })),
    },
    analytics: {
      avgDiscoveredToActiveMs: avgDiscoveredToActiveMs[0]?.avg_ms ?? 0,
      validationSuccessPct: Math.round(validationSuccessPct[0]?.rate ?? 0),
      avgEmployerHealth: avgEmployerHealth._avg.healthScore ?? 0,
      avgCrawlDurationMs: avgCrawlDuration._avg.durationMs ?? 0,
      jobsPerEmployer: Math.round((jobsPerEmployer[0]?.avg ?? 0) * 10) / 10,
      jobsPerAts: jobsPerAts.map((r) => ({ name: r.ats, count: Number(r.jobs) })),
      jobsPerSector: jobsPerSector.map((r) => ({ name: r.sector, count: Number(r.jobs) })),
      jobsPerRegion: jobsPerRegion.map((r) => ({ name: r.region, count: Number(r.jobs) })),
    },
    executive: {
      platformHealthScore: Math.round(avgEmployerHealth._avg.healthScore ?? 0),
      activeEmployers: activeEmployerCount,
      activeJobs,
      activeSources,
      totalCompanies,
      growthRate: jobGrowth.length >= 2
        ? jobGrowth[jobGrowth.length - 1].value - jobGrowth[0].value
        : 0,
    },
    lifecycleCounts: lifecycleCounts.map((l) => ({
      state: l.activationState ?? "UNKNOWN",
      count: l._count._all,
    })),
    healthDistribution: healthDistribution.map((h) => ({
      bucket: h.bucket,
      count: Number(h.count),
    })),
    topImproving: topImproving.map((t) => ({
      name: t.company,
      delta: Number(t.delta),
    })),
    topDegrading: topDegrading.map((t) => ({
      name: t.company,
      health: t.health,
      failures: t.failures ?? 0,
    })),
  };
}

export type ExecutiveAnalytics = Awaited<ReturnType<typeof getExecutiveAnalytics>>;
