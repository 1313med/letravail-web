import { prisma } from "@/lib/db";
import {
  activeJobWhere,
  coveragePct,
  enrichedCompanyWhere,
  freshDescriptionWhere,
  hasEducationWhere,
  hasExperienceWhere,
  hasSalaryWhere,
  hasSkillsWhere,
} from "@/lib/intelligence/queries";
import { bucketDates, daysAgo, isoDateKey } from "@/lib/intelligence/date-ranges";
import type { QualityDimension, TrendPoint } from "@/lib/intelligence/types";

async function dimensionTrend(
  check: "skills" | "experience" | "education" | "salary" | "description" | "company",
  days: number
): Promise<TrendPoint[]> {
  const since = daysAgo(days - 1);

  const queryByCheck = {
    skills: prisma.$queryRaw<{ day: Date; pct: number | null }[]>`
      SELECT date_trunc('day', j."firstSeenAt") AS day,
        ROUND(100.0 * COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM job_skills js WHERE js."jobId" = j.id)) / NULLIF(COUNT(*), 0), 1) AS pct
      FROM jobs j WHERE j."isActive" = true AND j."firstSeenAt" >= ${since}
      GROUP BY 1 ORDER BY 1`,
    experience: prisma.$queryRaw<{ day: Date; pct: number | null }[]>`
      SELECT date_trunc('day', j."firstSeenAt") AS day,
        ROUND(100.0 * COUNT(*) FILTER (WHERE j."experienceLevel" IS NOT NULL OR j."experienceYears" IS NOT NULL) / NULLIF(COUNT(*), 0), 1) AS pct
      FROM jobs j WHERE j."isActive" = true AND j."firstSeenAt" >= ${since}
      GROUP BY 1 ORDER BY 1`,
    education: prisma.$queryRaw<{ day: Date; pct: number | null }[]>`
      SELECT date_trunc('day', j."firstSeenAt") AS day,
        ROUND(100.0 * COUNT(*) FILTER (WHERE j."educationLevel" IS NOT NULL) / NULLIF(COUNT(*), 0), 1) AS pct
      FROM jobs j WHERE j."isActive" = true AND j."firstSeenAt" >= ${since}
      GROUP BY 1 ORDER BY 1`,
    salary: prisma.$queryRaw<{ day: Date; pct: number | null }[]>`
      SELECT date_trunc('day', j."firstSeenAt") AS day,
        ROUND(100.0 * COUNT(*) FILTER (WHERE j."salaryMin" IS NOT NULL OR j."salaryMax" IS NOT NULL OR j.salary IS NOT NULL) / NULLIF(COUNT(*), 0), 1) AS pct
      FROM jobs j WHERE j."isActive" = true AND j."firstSeenAt" >= ${since}
      GROUP BY 1 ORDER BY 1`,
    description: prisma.$queryRaw<{ day: Date; pct: number | null }[]>`
      SELECT date_trunc('day', j."firstSeenAt") AS day,
        ROUND(100.0 * COUNT(*) FILTER (WHERE j."descriptionScore" >= 0.6) / NULLIF(COUNT(*), 0), 1) AS pct
      FROM jobs j WHERE j."isActive" = true AND j."firstSeenAt" >= ${since}
      GROUP BY 1 ORDER BY 1`,
    company: prisma.$queryRaw<{ day: Date; pct: number | null }[]>`
      SELECT date_trunc('day', j."firstSeenAt") AS day,
        ROUND(100.0 * COUNT(*) FILTER (WHERE j."companyId" IS NOT NULL) / NULLIF(COUNT(*), 0), 1) AS pct
      FROM jobs j WHERE j."isActive" = true AND j."firstSeenAt" >= ${since}
      GROUP BY 1 ORDER BY 1`,
  };

  const rows = await queryByCheck[check];
  const map = new Map(rows.map((r) => [isoDateKey(new Date(r.day)), Number(r.pct ?? 0)]));
  return bucketDates(days).map((date) => ({ date, value: map.get(date) ?? 0 }));
}

function statusFromScore(score: number): QualityDimension["status"] {
  if (score >= 70) return "healthy";
  if (score >= 40) return "attention";
  return "critical";
}

export async function getDataQuality() {
  const total = await prisma.job.count({ where: activeJobWhere() });

  const [
    freshDesc,
    withSkills,
    withExperience,
    withEducation,
    withSalary,
    enriched,
    normalizedLocations,
    avgQuality,
    sourceHealth,
  ] = await Promise.all([
    prisma.job.count({ where: freshDescriptionWhere() }),
    prisma.job.count({ where: hasSkillsWhere() }),
    prisma.job.count({ where: hasExperienceWhere() }),
    prisma.job.count({ where: hasEducationWhere() }),
    prisma.job.count({ where: hasSalaryWhere() }),
    prisma.job.count({ where: enrichedCompanyWhere() }),
    prisma.job.count({
      where: { ...activeJobWhere(), locationId: { not: null } },
    }),
    prisma.job.aggregate({
      where: { ...activeJobWhere(), qualityScore: { not: null } },
      _avg: { qualityScore: true, descriptionScore: true },
    }),
    prisma.sourceProfile.findMany({
      orderBy: { intelligenceScore: "desc" },
      take: 20,
      select: {
        sourceName: true,
        companyName: true,
        intelligenceScore: true,
        freshnessScore: true,
        skillCoverage: true,
        failureRate: true,
        avgDescriptionLength: true,
      },
    }),
  ]);

  const dimensions: QualityDimension[] = [
    {
      key: "description",
      label: "Description Quality",
      score: Math.round((avgQuality._avg.descriptionScore ?? 0) * 100),
      coverage: coveragePct(freshDesc, total),
      trend: await dimensionTrend("description", 30),
      status: statusFromScore(coveragePct(freshDesc, total)),
    },
    {
      key: "skills",
      label: "Skill Extraction",
      score: coveragePct(withSkills, total),
      coverage: coveragePct(withSkills, total),
      trend: await dimensionTrend("skills", 30),
      status: statusFromScore(coveragePct(withSkills, total)),
    },
    {
      key: "experience",
      label: "Experience Extraction",
      score: coveragePct(withExperience, total),
      coverage: coveragePct(withExperience, total),
      trend: await dimensionTrend("experience", 30),
      status: statusFromScore(coveragePct(withExperience, total)),
    },
    {
      key: "education",
      label: "Education Extraction",
      score: coveragePct(withEducation, total),
      coverage: coveragePct(withEducation, total),
      trend: await dimensionTrend("education", 30),
      status: statusFromScore(coveragePct(withEducation, total)),
    },
    {
      key: "salary",
      label: "Salary Coverage",
      score: coveragePct(withSalary, total),
      coverage: coveragePct(withSalary, total),
      trend: await dimensionTrend("salary", 30),
      status: statusFromScore(coveragePct(withSalary, total)),
    },
    {
      key: "company",
      label: "Company Coverage",
      score: coveragePct(enriched, total),
      coverage: coveragePct(enriched, total),
      trend: await dimensionTrend("company", 30),
      status: statusFromScore(coveragePct(enriched, total)),
    },
    {
      key: "location",
      label: "Location Normalization",
      score: coveragePct(normalizedLocations, total),
      coverage: coveragePct(normalizedLocations, total),
      trend: await dimensionTrend("company", 30),
      status: statusFromScore(coveragePct(normalizedLocations, total)),
    },
  ];

  const bottlenecks = sourceHealth.map((s) => {
    const score = s.intelligenceScore ?? 0;
    const freshness = s.freshnessScore ?? 0;
    let status: "healthy" | "attention" | "critical" = "healthy";
    if ((s.failureRate ?? 0) > 0.2 || score < 0.5) status = "critical";
    else if (freshness < 0.6 || score < 0.7) status = "attention";
    return {
      source: s.sourceName,
      company: s.companyName,
      status,
      intelligenceScore: score,
      freshnessScore: freshness,
      skillCoverage: s.skillCoverage,
      avgDescriptionLength: s.avgDescriptionLength,
    };
  });

  return {
    overallQuality: Math.round((avgQuality._avg.qualityScore ?? 0) * 100),
    dimensions,
    bottlenecks,
    totalActiveJobs: total,
  };
}
