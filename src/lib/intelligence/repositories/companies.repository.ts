import { prisma } from "@/lib/db";
import { activeJobWhere } from "@/lib/intelligence/queries";
import { bucketDates, daysAgo, isoDateKey } from "@/lib/intelligence/date-ranges";
import type { CompanyIntelligenceRow, TrendPoint } from "@/lib/intelligence/types";

export type CompaniesQuery = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function searchCompanies(params: CompaniesQuery = {}) {
  const { search = "", page = 1, pageSize = 25 } = params;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
          { sector: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [total, companies, atsRecords] = await Promise.all([
    prisma.company.count({ where }),
    prisma.company.findMany({
      where,
      orderBy: { activeJobCount: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        jobs: {
          where: activeJobWhere(),
          select: {
            qualityScore: true,
            description: true,
            experienceLevel: true,
            experienceYears: true,
            skills: { select: { skillId: true } },
          },
        },
      },
    }),
    prisma.employerAtsIntelligence.findMany({
      orderBy: { probedAt: "desc" },
      distinct: ["companyName"],
      select: {
        companyName: true,
        activationState: true,
        healthScore: true,
        validationScore: true,
        lastValidationAt: true,
      },
    }),
  ]);

  const atsMap = new Map(atsRecords.map((r) => [r.companyName.toLowerCase(), r]));

  const items: CompanyIntelligenceRow[] = companies.map((c) => {
    const jobs = c.jobs;
    const ats = atsMap.get(c.name.toLowerCase());
    const qualityScores = jobs.map((j) => j.qualityScore).filter((v): v is number => v != null);
    const avgQuality =
      qualityScores.length > 0
        ? qualityScores.reduce((s, v) => s + v, 0) / qualityScores.length
        : null;
    const avgDesc =
      jobs.length > 0
        ? Math.round(jobs.reduce((s, j) => s + j.description.length, 0) / jobs.length)
        : null;
    const withSkills = jobs.filter((j) => j.skills.length > 0).length;
    const withExp = jobs.filter((j) => j.experienceLevel || j.experienceYears).length;

    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      activeJobs: c.activeJobCount,
      historicalJobs: c.activeJobCount + c.archivedJobCount,
      qualityScore: avgQuality,
      lastCrawlAt: c.lastCrawlAt?.toISOString() ?? null,
      avgDescriptionLength: avgDesc,
      skillDensity: jobs.length > 0 ? Math.round((withSkills / jobs.length) * 100) : null,
      experienceDensity: jobs.length > 0 ? Math.round((withExp / jobs.length) * 100) : null,
      hiringTrend: null,
      headquartersCity: c.headquartersCity,
      industry: c.industry,
      sector: c.sector,
      careerPageUrl: c.careerPageUrl,
      linkedinUrl: c.linkedinUrl,
      websiteUrl: c.websiteUrl,
      employerHealth: ats?.healthScore ?? null,
      activationState: ats?.activationState ?? null,
      validationScore: ats?.validationScore ?? null,
      lastValidationAt: ats?.lastValidationAt?.toISOString() ?? null,
    };
  });

  return { total, page, pageSize, items };
}

export async function getCompanyBySlug(slug: string) {
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      aliases: true,
      jobs: {
        orderBy: { firstSeenAt: "desc" },
        take: 50,
        select: {
          id: true,
          title: true,
          slug: true,
          isActive: true,
          qualityScore: true,
          firstSeenAt: true,
          city: true,
          skills: { include: { skill: true } },
        },
      },
    },
  });

  if (!company) return null;

  const atsRecord = await prisma.employerAtsIntelligence.findFirst({
    where: { companyName: company.name },
    orderBy: { probedAt: "desc" },
    select: {
      activationState: true,
      healthScore: true,
      validationScore: true,
      lastValidationAt: true,
      automaticActivation: true,
      activationReason: true,
      deactivationReason: true,
      retryCount: true,
      nextRetryAt: true,
    },
  });

  const growth = await getCompanyGrowth(slug, 90);

  return { company, growth, activation: atsRecord };
}

async function getCompanyGrowth(slug: string, days: number): Promise<TrendPoint[]> {
  const since = daysAgo(days - 1);
  const company = await prisma.company.findUnique({ where: { slug }, select: { id: true } });
  if (!company) return [];

  const rows = await prisma.$queryRaw<{ day: Date; count: bigint }[]>`
    SELECT date_trunc('day', "firstSeenAt") AS day, COUNT(*)::bigint AS count
    FROM jobs
    WHERE "companyId" = ${company.id} AND "firstSeenAt" >= ${since}
    GROUP BY 1
    ORDER BY 1
  `;
  const map = new Map(rows.map((r) => [isoDateKey(new Date(r.day)), Number(r.count)]));
  return bucketDates(days).map((date) => ({ date, value: map.get(date) ?? 0 }));
}

export async function getCompanyGrowthChart(slug: string, days = 90) {
  return getCompanyGrowth(slug, days);
}
