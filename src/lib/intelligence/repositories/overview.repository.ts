import { prisma } from "@/lib/db";
import {
  activeJobWhere,
  archivedTodayWhere,
  coveragePct,
  createdTodayWhere,
  enrichedCompanyWhere,
  freshDescriptionWhere,
  hasEducationWhere,
  hasExperienceWhere,
  hasSalaryWhere,
  hasSkillsWhere,
} from "@/lib/intelligence/queries";
import { bucketDates, daysAgo, endOfDay, isoDateKey, startOfDay } from "@/lib/intelligence/date-ranges";
import type { KpiMetric, TrendPoint } from "@/lib/intelligence/types";

async function getActivationMetrics(todayStart: Date, todayEnd: Date) {
  const [
    activeEmployers,
    readyForActivation,
    validationQueue,
    retryQueue,
    avgHealth,
    avgValidation,
    activeCount,
    failedCount,
    autoActivationsToday,
    autoDeactivationsToday,
  ] = await Promise.all([
    prisma.employerAtsIntelligence.count({ where: { activationState: "ACTIVE" } }),
    prisma.employerAtsIntelligence.count({ where: { activationState: "READY" } }),
    prisma.employerAtsIntelligence.count({
      where: {
        lastValidationAt: null,
        activationState: { in: ["PROBED", "READY", "MONITORED"] },
      },
    }),
    prisma.employerAtsIntelligence.count({ where: { nextRetryAt: { not: null } } }),
    prisma.employerAtsIntelligence.aggregate({
      where: { healthScore: { not: null } },
      _avg: { healthScore: true },
    }),
    prisma.employerAtsIntelligence.aggregate({
      where: { validationScore: { not: null } },
      _avg: { validationScore: true },
    }),
    prisma.employerAtsIntelligence.count({ where: { activationState: "ACTIVE" } }),
    prisma.employerAtsIntelligence.count({ where: { activationState: "FAILED" } }),
    prisma.employerAtsIntelligence.count({
      where: {
        automaticActivation: true,
        activationState: "ACTIVE",
        updatedAt: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.employerAtsIntelligence.count({
      where: {
        deactivationReason: { not: null },
        updatedAt: { gte: todayStart, lte: todayEnd },
      },
    }),
  ]);

  const activationAttempts = activeCount + failedCount;
  const activationSuccessRate =
    activationAttempts > 0 ? coveragePct(activeCount, activationAttempts) : 0;

  return {
    activeEmployers,
    readyForActivation,
    validationQueue,
    retryQueue,
    avgHealthScore: avgHealth._avg.healthScore ?? 0,
    avgValidationScore: avgValidation._avg.validationScore ?? 0,
    activationSuccessRate,
    autoActivationsToday,
    autoDeactivationsToday,
  };
}

export type OverviewCrawlRow = {
  id: string;
  source: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  durationMs: number | null;
  jobsFound: number;
  jobsInserted: number;
  jobsUpdated: number;
  duplicates: number;
  errorMessage: string | null;
};

export type OverviewBundle = {
  generatedAt: string;
  kpis: KpiMetric[];
  jobsGrowth: TrendPoint[];
  qualityGrowth: TrendPoint[];
  sourceGrowth: TrendPoint[];
  coverageGrowth: TrendPoint[];
  recentCrawls: OverviewCrawlRow[];
  topEmployers: { name: string; count: number; delta: number }[];
  topCities: { name: string; count: number; delta: number }[];
  topProfessions: { name: string; count: number }[];
};

async function getRecentCrawls(limit = 8) {
  return prisma.scrapeLog.findMany({
    orderBy: { startedAt: "desc" },
    take: limit,
    select: {
      id: true,
      source: true,
      status: true,
      startedAt: true,
      endedAt: true,
      durationMs: true,
      jobsFound: true,
      jobsInserted: true,
      jobsUpdated: true,
      duplicates: true,
      errorMessage: true,
    },
  });
}

async function dailyJobCounts(days: number): Promise<TrendPoint[]> {
  const since = daysAgo(days - 1);
  const rows = await prisma.$queryRaw<{ day: Date; count: bigint }[]>`
    SELECT date_trunc('day', "firstSeenAt") AS day, COUNT(*)::bigint AS count
    FROM jobs
    WHERE "firstSeenAt" >= ${since}
    GROUP BY 1
    ORDER BY 1
  `;
  const map = new Map(rows.map((r) => [isoDateKey(new Date(r.day)), Number(r.count)]));
  return bucketDates(days).map((date) => ({
    date,
    value: map.get(date) ?? 0,
  }));
}

async function dailyQualityAvg(days: number): Promise<TrendPoint[]> {
  const since = daysAgo(days - 1);
  const rows = await prisma.$queryRaw<{ day: Date; avg: number | null }[]>`
    SELECT date_trunc('day', "firstSeenAt") AS day, AVG("qualityScore") AS avg
    FROM jobs
    WHERE "firstSeenAt" >= ${since} AND "qualityScore" IS NOT NULL
    GROUP BY 1
    ORDER BY 1
  `;
  const map = new Map(
    rows.map((r) => [isoDateKey(new Date(r.day)), r.avg != null ? Math.round(r.avg * 10) / 10 : 0])
  );
  return bucketDates(days).map((date) => ({
    date,
    value: map.get(date) ?? 0,
  }));
}

async function dailySourceCounts(days: number): Promise<TrendPoint[]> {
  const since = daysAgo(days - 1);
  const rows = await prisma.$queryRaw<{ day: Date; count: bigint }[]>`
    SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
    FROM source_profiles
    WHERE "createdAt" >= ${since}
    GROUP BY 1
    ORDER BY 1
  `;
  const map = new Map(rows.map((r) => [isoDateKey(new Date(r.day)), Number(r.count)]));
  const cumulative: TrendPoint[] = [];
  let running = await prisma.sourceProfile.count({
    where: { createdAt: { lt: since } },
  });
  for (const date of bucketDates(days)) {
    running += map.get(date) ?? 0;
    cumulative.push({ date, value: running });
  }
  return cumulative;
}

async function dailyCoveragePct(days: number): Promise<TrendPoint[]> {
  const points: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const end = endOfDay(daysAgo(i));
    const [total, withSkills] = await Promise.all([
      prisma.job.count({ where: { isActive: true, firstSeenAt: { lte: end } } }),
      prisma.job.count({
        where: {
          isActive: true,
          firstSeenAt: { lte: end },
          skills: { some: {} },
        },
      }),
    ]);
    points.push({
      date: isoDateKey(end),
      value: coveragePct(withSkills, total),
    });
  }
  return points;
}

export async function getOverviewBundle(): Promise<OverviewBundle> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const yesterdayStart = daysAgo(1);
  const yesterdayEnd = endOfDay(yesterdayStart);

  const [
    activeJobs,
    totalEmployers,
    activeSources,
    registeredSources,
    jobsAddedToday,
    jobsArchivedToday,
    jobsAddedYesterday,
    activeJobsTotal,
    freshDescriptions,
    withSkills,
    withExperience,
    withEducation,
    withSalary,
    enrichedCompanies,
    duplicateRows,
    atsReady,
    atsTotal,
    avgQuality,
    avgQualityYesterday,
    jobsGrowth,
    qualityGrowth,
    sourceGrowth,
    coverageGrowth,
    recentCrawls,
    employerGrowth,
    cityGrowth,
    topProfessions,
    activation,
  ] = await Promise.all([
    prisma.job.count({ where: activeJobWhere() }),
    prisma.company.count(),
    prisma.sourceProfile.count({ where: { status: "active" } }),
    prisma.sourceProfile.count(),
    prisma.job.count({ where: createdTodayWhere(todayStart, todayEnd) }),
    prisma.job.count({ where: archivedTodayWhere(todayStart, todayEnd) }),
    prisma.job.count({ where: createdTodayWhere(yesterdayStart, yesterdayEnd) }),
    prisma.job.count({ where: activeJobWhere() }),
    prisma.job.count({ where: freshDescriptionWhere() }),
    prisma.job.count({ where: hasSkillsWhere() }),
    prisma.job.count({ where: hasExperienceWhere() }),
    prisma.job.count({ where: hasEducationWhere() }),
    prisma.job.count({ where: hasSalaryWhere() }),
    prisma.job.count({ where: enrichedCompanyWhere() }),
    prisma.scrapeLog.aggregate({ _sum: { duplicates: true } }),
    prisma.employerAtsIntelligence.count({
      where: { onboardingStatus: { in: ["ready", "active", "onboarded"] } },
    }),
    prisma.employerAtsIntelligence.count(),
    prisma.job.aggregate({
      where: { ...activeJobWhere(), qualityScore: { not: null } },
      _avg: { qualityScore: true },
    }),
    prisma.job.aggregate({
      where: {
        ...activeJobWhere(),
        qualityScore: { not: null },
        firstSeenAt: { lte: yesterdayEnd },
      },
      _avg: { qualityScore: true },
    }),
    dailyJobCounts(30),
    dailyQualityAvg(30),
    dailySourceCounts(30),
    dailyCoveragePct(30),
    getRecentCrawls(8),
    prisma.$queryRaw<{ company: string; count: bigint; prev: bigint }[]>`
      SELECT j.company,
        COUNT(*) FILTER (WHERE j."isActive" = true)::bigint AS count,
        COUNT(*) FILTER (WHERE j."firstSeenAt" < ${todayStart} AND j."isActive" = true)::bigint AS prev
      FROM jobs j
      WHERE j."isActive" = true
      GROUP BY j.company
      ORDER BY count DESC
      LIMIT 10
    `,
    prisma.$queryRaw<{ city: string; count: bigint; prev: bigint }[]>`
      SELECT j.city,
        COUNT(*) FILTER (WHERE j."isActive" = true)::bigint AS count,
        COUNT(*) FILTER (WHERE j."firstSeenAt" < ${todayStart} AND j."isActive" = true)::bigint AS prev
      FROM jobs j
      WHERE j."isActive" = true
      GROUP BY j.city
      ORDER BY count DESC
      LIMIT 10
    `,
    prisma.professionSkill.findMany({
      orderBy: { jobCount: "desc" },
      take: 10,
      select: { profession: true, jobCount: true },
    }),
    getActivationMetrics(todayStart, todayEnd),
  ]);

  const qualityScore = avgQuality._avg.qualityScore ?? 0;
  const qualityYesterday = avgQualityYesterday._avg.qualityScore ?? qualityScore;
  const duplicateRate = duplicateRows._sum.duplicates ?? 0;
  const totalCrawlJobs = await prisma.scrapeLog.aggregate({
    _sum: { jobsFound: true },
  });
  const duplicatePct =
    totalCrawlJobs._sum.jobsFound && totalCrawlJobs._sum.jobsFound > 0
      ? coveragePct(duplicateRate, totalCrawlJobs._sum.jobsFound)
      : 0;

  const kpis: KpiMetric[] = [
    { key: "activeJobs", label: "Active Jobs", value: activeJobs, format: "number", tone: "good" },
    { key: "totalEmployers", label: "Total Employers", value: totalEmployers, format: "number" },
    {
      key: "activeSources",
      label: "Active Sources",
      value: activeSources,
      format: "number",
    },
    {
      key: "activeEmployers",
      label: "Active Employers",
      value: activation.activeEmployers,
      format: "number",
      tone: "good",
    },
    {
      key: "readyForActivation",
      label: "Ready For Activation",
      value: activation.readyForActivation,
      format: "number",
      tone: activation.readyForActivation > 0 ? "warn" : "neutral",
    },
    {
      key: "validationQueue",
      label: "Validation Queue",
      value: activation.validationQueue,
      format: "number",
      tone: activation.validationQueue > 0 ? "warn" : "neutral",
    },
    {
      key: "retryQueue",
      label: "Retry Queue",
      value: activation.retryQueue,
      format: "number",
      tone: activation.retryQueue > 0 ? "warn" : "neutral",
    },
    {
      key: "avgHealthScore",
      label: "Average Health Score",
      value: Math.round(activation.avgHealthScore * 10) / 10,
      format: "score",
      tone: activation.avgHealthScore >= 70 ? "good" : activation.avgHealthScore >= 50 ? "warn" : "bad",
    },
    {
      key: "avgValidationScore",
      label: "Average Validation Score",
      value: Math.round(activation.avgValidationScore * 10) / 10,
      format: "score",
      tone:
        activation.avgValidationScore >= 70
          ? "good"
          : activation.avgValidationScore >= 50
            ? "warn"
            : "bad",
    },
    {
      key: "activationSuccessRate",
      label: "Activation Success Rate",
      value: activation.activationSuccessRate,
      format: "percent",
      tone:
        activation.activationSuccessRate >= 80
          ? "good"
          : activation.activationSuccessRate >= 50
            ? "warn"
            : "bad",
    },
    {
      key: "autoActivationsToday",
      label: "Automatic Activations Today",
      value: activation.autoActivationsToday,
      format: "number",
      tone: activation.autoActivationsToday > 0 ? "good" : "neutral",
    },
    {
      key: "autoDeactivationsToday",
      label: "Automatic Deactivations Today",
      value: activation.autoDeactivationsToday,
      format: "number",
      tone: activation.autoDeactivationsToday > 0 ? "warn" : "neutral",
    },
    { key: "registeredSources", label: "Registered Sources", value: registeredSources, format: "number" },
    {
      key: "jobsAddedToday",
      label: "Jobs Added Today",
      value: jobsAddedToday,
      delta: jobsAddedToday - jobsAddedYesterday,
      deltaLabel: "vs yesterday",
      format: "number",
      tone: jobsAddedToday >= jobsAddedYesterday ? "good" : "warn",
    },
    {
      key: "jobsArchivedToday",
      label: "Jobs Archived Today",
      value: jobsArchivedToday,
      format: "number",
    },
    {
      key: "qualityScore",
      label: "Quality Score",
      value: Math.round(qualityScore * 10) / 10,
      delta: Math.round((qualityScore - qualityYesterday) * 10) / 10,
      format: "score",
      tone: qualityScore >= 0.7 ? "good" : qualityScore >= 0.5 ? "warn" : "bad",
    },
    {
      key: "freshDescriptions",
      label: "Fresh Description %",
      value: coveragePct(freshDescriptions, activeJobsTotal),
      format: "percent",
    },
    {
      key: "skillCoverage",
      label: "Skill Coverage",
      value: coveragePct(withSkills, activeJobsTotal),
      format: "percent",
    },
    {
      key: "educationCoverage",
      label: "Education Coverage",
      value: coveragePct(withEducation, activeJobsTotal),
      format: "percent",
    },
    {
      key: "experienceCoverage",
      label: "Experience Coverage",
      value: coveragePct(withExperience, activeJobsTotal),
      format: "percent",
    },
    {
      key: "companyEnrichment",
      label: "Company Enrichment",
      value: coveragePct(enrichedCompanies, activeJobsTotal),
      format: "percent",
    },
    {
      key: "salaryCoverage",
      label: "Salary Coverage",
      value: coveragePct(withSalary, activeJobsTotal),
      format: "percent",
    },
    {
      key: "duplicateRate",
      label: "Duplicate Rate",
      value: duplicatePct,
      format: "percent",
      tone: duplicatePct <= 5 ? "good" : duplicatePct <= 15 ? "warn" : "bad",
    },
    {
      key: "atsSuccessRate",
      label: "ATS Success Rate",
      value: atsTotal > 0 ? coveragePct(atsReady, atsTotal) : 0,
      format: "percent",
      tone: "good",
    },
  ];

  return {
    generatedAt: now.toISOString(),
    kpis,
    jobsGrowth,
    qualityGrowth,
    sourceGrowth,
    coverageGrowth,
    recentCrawls: recentCrawls.map((c) => ({
      ...c,
      startedAt: c.startedAt.toISOString(),
      endedAt: c.endedAt?.toISOString() ?? null,
    })),
    topEmployers: employerGrowth.map((r) => ({
      name: r.company,
      count: Number(r.count),
      delta: Number(r.count) - Number(r.prev),
    })),
    topCities: cityGrowth.map((r) => ({
      name: r.city,
      count: Number(r.count),
      delta: Number(r.count) - Number(r.prev),
    })),
    topProfessions: topProfessions.map((p) => ({
      name: p.profession,
      count: p.jobCount,
    })),
  };
}
