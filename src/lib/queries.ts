import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import {
  JOBS_PER_PAGE,
  MIN_JOBS_FOR_CITY_INDEX,
  MIN_JOBS_FOR_LANDING_INDEX,
  MIN_OBSERVATIONS_FOR_SALARY_INDEX,
} from "./constants";
import { DISCOVERY_EXPERIENCE_LEVELS } from "./jobs-discovery";
import {
  getAllLandingSlugCandidates,
  landingToJobFilters,
  parseLandingSlug,
} from "./landing-pages";
import { SALARY_ROLES, median, percentile, salaryPublicSlug } from "./salary-data";
import { shouldNoindexSalaryPage } from "./indexation";
import { parseSalaryRange } from "./job-detail";

export type JobListItem = {
  id: string;
  slug: string;
  title: string;
  company: string;
  city: string;
  contractType: string | null;
  remote: boolean;
  salary: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  description: string;
  companyRef: { slug: string } | null;
  location: { slug: string } | null;
  tags: { name: string; slug: string }[];
};

export type JobFilters = {
  q?: string;
  city?: string;
  company?: string;
  contract?: string;
  tag?: string;
  remote?: string;
  minSalary?: number;
  experience?: string;
  page?: number;
  includeExpired?: boolean;
};

export function activeJobsWhere(): Prisma.JobWhereInput {
  return {
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  };
}

/** Filter JobTag rows whose linked job is still active */
export function activeJobTagWhere(): Prisma.JobTagWhereInput {
  return { job: activeJobsWhere() };
}

/** Tags with at least one active job (Tag → JobTag → Job) */
export function tagHasActiveJobsWhere(): Prisma.TagWhereInput {
  return { jobs: { some: activeJobTagWhere() } };
}

function buildJobWhere(filters: JobFilters): Prisma.JobWhereInput {
  const where: Prisma.JobWhereInput = {};

  if (!filters.includeExpired) {
    const active = activeJobsWhere();
    where.AND = [active];
  }

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { company: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  if (filters.city) {
    where.location = { slug: filters.city };
  }

  if (filters.company) {
    where.companyRef = { slug: filters.company };
  }

  if (filters.contract) {
    where.contractType = filters.contract;
  }

  if (filters.tag) {
    where.tags = { some: { tag: { slug: filters.tag } } };
  }

  if (filters.remote === "remote") {
    where.remote = true;
  } else if (filters.remote === "onsite") {
    where.remote = false;
  } else   if (filters.remote === "hybrid") {
    const hybridClause = {
      OR: [
        { description: { contains: "hybride", mode: "insensitive" as const } },
        { description: { contains: "hybrid", mode: "insensitive" as const } },
      ],
    };
    const existingAnd = Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];
    where.AND = [...existingAnd, hybridClause];
  }

  if (filters.minSalary && filters.minSalary > 0) {
    where.salary = { not: null };
  }

  if (filters.experience) {
    const level = DISCOVERY_EXPERIENCE_LEVELS.find((l) => l.value === filters.experience);
    if (level) {
      const expOr = level.keywords.map((kw) => ({
        title: { contains: kw, mode: "insensitive" as const },
      }));
      const existingAnd = Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];
      where.AND = [...existingAnd, { OR: expOr }];
    }
  }

  return where;
}

const jobListSelect = {
  id: true,
  slug: true,
  title: true,
  company: true,
  city: true,
  contractType: true,
  remote: true,
  salary: true,
  publishedAt: true,
  createdAt: true,
  description: true,
  companyRef: { select: { slug: true } },
  location: { select: { slug: true } },
  tags: { select: { tag: { select: { name: true, slug: true } } } },
} satisfies Prisma.JobSelect;

/** Newest jobs first — createdAt is always set; publishedAt may be null for LinkedIn imports */
const jobListOrderBy: Prisma.JobOrderByWithRelationInput[] = [
  { createdAt: "desc" },
];

function mapJobRow(job: {
  tags: { tag: { name: string; slug: string } }[];
} & Omit<JobListItem, "tags">): JobListItem {
  return {
    ...job,
    tags: job.tags.map((t) => t.tag),
  };
}

export async function getJobs(filters: JobFilters = {}) {
  const page = Math.max(1, filters.page || 1);
  const where = buildJobWhere(filters);

  const [rawJobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      select: jobListSelect,
      orderBy: jobListOrderBy,
      skip: (page - 1) * JOBS_PER_PAGE,
      take: JOBS_PER_PAGE,
    }),
    prisma.job.count({ where }),
  ]);

  const jobs = rawJobs.map(mapJobRow);

  return { jobs, total, page, totalPages: Math.ceil(total / JOBS_PER_PAGE) };
}

export async function getJobBySlug(slug: string) {
  return prisma.job.findUnique({
    where: { slug },
    include: {
      companyRef: true,
      location: true,
      tags: { include: { tag: true } },
    },
  });
}

export async function getSimilarJobs(job: {
  id: string;
  city: string;
  companyId: string | null;
}) {
  const rows = await prisma.job.findMany({
    where: {
      id: { not: job.id },
      OR: [
        { city: job.city },
        ...(job.companyId ? [{ companyId: job.companyId }] : []),
      ],
    },
    select: jobListSelect,
    orderBy: jobListOrderBy,
    take: 6,
  });
  return rows.map(mapJobRow);
}

export async function getCompanyBySlug(slug: string) {
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      jobs: {
        where: activeJobsWhere(),
        select: jobListSelect,
        orderBy: jobListOrderBy,
      },
    },
  });
  if (!company) return null;
  return { ...company, jobs: company.jobs.map(mapJobRow) };
}

export async function getLocationBySlug(slug: string) {
  return prisma.location.findUnique({
    where: { slug },
    include: {
      _count: { select: { jobs: true } },
    },
  });
}

export async function getCityJobCount(slug: string) {
  return prisma.job.count({
    where: { AND: [{ location: { slug } }, activeJobsWhere()] },
  });
}

export async function getTopCities(limit = 12) {
  const cities = await prisma.location.findMany({
    select: {
      city: true,
      slug: true,
      _count: { select: { jobs: true } },
    },
    orderBy: { jobs: { _count: "desc" } },
    take: limit,
  });

  return cities.filter((c) => c._count.jobs >= MIN_JOBS_FOR_CITY_INDEX);
}

export async function getTopCompanies(limit = 12) {
  const companies = await prisma.company.findMany({
    select: {
      name: true,
      slug: true,
      _count: { select: { jobs: true } },
    },
    orderBy: { jobs: { _count: "desc" } },
    take: limit,
  });

  return companies.filter((c) => c._count.jobs > 0);
}

export async function getLatestJobs(limit = 20) {
  const rows = await prisma.job.findMany({
    select: jobListSelect,
    orderBy: jobListOrderBy,
    take: limit,
  });
  return rows.map(mapJobRow);
}

export async function getRandomJobs(limit = 8) {
  const picks = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM (
      SELECT DISTINCT ON (COALESCE("companyId", LOWER(TRIM(company)))) id
      FROM jobs
      ORDER BY COALESCE("companyId", LOWER(TRIM(company))), RANDOM()
    ) AS diverse
    ORDER BY RANDOM()
    LIMIT ${limit}
  `;
  if (picks.length === 0) return [];

  const rows = await prisma.job.findMany({
    where: { id: { in: picks.map((p) => p.id) } },
    select: jobListSelect,
  });

  const byId = new Map(rows.map((row) => [row.id, row]));
  return picks
    .map((p) => byId.get(p.id))
    .filter((row): row is NonNullable<typeof row> => row != null)
    .map(mapJobRow);
}

export async function getJobCount(filters: JobFilters = {}) {
  return prisma.job.count({ where: buildJobWhere(filters) });
}

export async function getCompaniesForLanding(
  filters: JobFilters,
  limit = 10
) {
  const where = buildJobWhere(filters);
  return prisma.company.findMany({
    where: { jobs: { some: where } },
    select: {
      name: true,
      slug: true,
      _count: { select: { jobs: true } },
    },
    orderBy: { jobs: { _count: "desc" } },
    take: limit,
  });
}

export async function getIndexableLandingSlugs(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  const candidates = getAllLandingSlugCandidates();
  const results = await Promise.all(
    candidates.map(async (slug) => {
      const landing = parseLandingSlug(slug);
      if (!landing) return null;
      const count = await getJobCount(landingToJobFilters(landing));
      if (count < MIN_JOBS_FOR_LANDING_INDEX) return null;
      return { slug, updatedAt: new Date() };
    })
  );
  return results.filter((r): r is { slug: string; updatedAt: Date } => r != null);
}

export async function getSalaryObservationCount(roleSlug: string): Promise<number> {
  return prisma.salaryObservation.count({
    where: { titleNorm: roleSlug },
  });
}

export async function getSalaryObservationCounts(): Promise<Map<string, number>> {
  const groups = await prisma.salaryObservation.groupBy({
    by: ["titleNorm"],
    _count: { _all: true },
  });
  return new Map(groups.map((g) => [g.titleNorm, g._count._all]));
}

export async function getIndexableSalarySlugs(): Promise<string[]> {
  const counts = await getSalaryObservationCounts();
  return SALARY_ROLES.filter((role) => {
    const count = counts.get(role.slug) ?? 0;
    return !shouldNoindexSalaryPage(count, MIN_OBSERVATIONS_FOR_SALARY_INDEX);
  }).map((role) => salaryPublicSlug(role.slug));
}

export async function getSalaryStatsForRole(roleSlug: string) {
  const role = SALARY_ROLES.find((r) => r.slug === roleSlug);
  if (!role) return null;

  const observationCount = await getSalaryObservationCount(roleSlug);

  const titleOr = role.keywords.map((kw) => ({
    title: { contains: kw, mode: "insensitive" as const },
  }));

  const jobs = await prisma.job.findMany({
    where: {
      AND: [
        activeJobsWhere(),
        { salary: { not: null } },
        { OR: titleOr },
      ],
    },
    select: {
      id: true,
      title: true,
      salary: true,
      city: true,
      location: { select: { slug: true } },
    },
    take: 500,
    orderBy: { updatedAt: "desc" },
  });

  const medians: number[] = [];
  const byCity = new Map<string, number[]>();

  for (const job of jobs) {
    const parsed = parseSalaryRange(job.salary, job.title);
    if (parsed.median) {
      medians.push(parsed.median);
      const cityKey = job.location?.slug ?? job.city;
      const list = byCity.get(cityKey) ?? [];
      list.push(parsed.median);
      byCity.set(cityKey, list);
    }
  }

  const sampleSize = medians.length;
  const computed = {
    min: percentile(medians, 25) ?? role.fallback.min,
    median: median(medians) ?? role.fallback.median,
    max: percentile(medians, 75) ?? role.fallback.max,
    trend: role.fallback.trend,
    sampleSize,
    byCity: Array.from(byCity.entries())
      .map(([slug, vals]) => ({
        slug,
        median: median(vals) ?? 0,
        count: vals.length,
      }))
      .sort((a, b) => b.median - a.median)
      .slice(0, 5),
  };

  return { role, stats: computed, jobs, observationCount };
}

export async function getTotalJobCount() {
  return prisma.job.count({ where: activeJobsWhere() });
}

export async function getActiveCompanyCount() {
  return prisma.company.count({
    where: { jobs: { some: activeJobsWhere() } },
  });
}

export async function getActiveCityCount() {
  return prisma.location.count({
    where: { jobs: { some: activeJobsWhere() } },
  });
}

export async function getJobsAddedThisWeek() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return prisma.job.count({ where: { createdAt: { gte: weekAgo } } });
}

export async function getPlatformStats() {
  const [activeJobs, activeCompanies, activeCities, jobsAddedThisWeek, lastScrapeAt] =
    await Promise.all([
      getTotalJobCount(),
      getActiveCompanyCount(),
      getActiveCityCount(),
      getJobsAddedThisWeek(),
      getLastScrapeTime(),
    ]);

  return { activeJobs, activeCompanies, activeCities, jobsAddedThisWeek, lastScrapeAt };
}

export async function getLastScrapeTime() {
  const log = await prisma.scrapeLog.findFirst({
    where: { status: "success" },
    orderBy: { endedAt: "desc" },
    select: { endedAt: true },
  });
  return log?.endedAt ?? null;
}

export async function getContractTypes() {
  const results = await prisma.job.groupBy({
    by: ["contractType"],
    where: { contractType: { not: null } },
    _count: true,
    orderBy: { _count: { contractType: "desc" } },
  });
  return results
    .filter((r) => r.contractType)
    .map((r) => r.contractType as string);
}

export async function getTags() {
  return prisma.tag.findMany({
    select: { name: true, slug: true, _count: { select: { jobs: true } } },
    orderBy: { jobs: { _count: "desc" } },
  });
}

export async function getCompaniesInCity(citySlug: string, limit = 10) {
  const companies = await prisma.company.findMany({
    where: { jobs: { some: { location: { slug: citySlug } } } },
    select: {
      name: true,
      slug: true,
      _count: {
        select: {
          jobs: { where: { location: { slug: citySlug } } },
        },
      },
    },
    orderBy: { jobs: { _count: "desc" } },
    take: limit,
  });
  return companies;
}

export async function getOtherCities(currentSlug: string, limit = 8) {
  return prisma.location.findMany({
    where: {
      slug: { not: currentSlug },
      jobs: { some: {} },
    },
    select: {
      city: true,
      slug: true,
      _count: { select: { jobs: true } },
    },
    orderBy: { jobs: { _count: "desc" } },
    take: limit,
  });
}

export async function getAllJobSlugs(limit = 5000) {
  return prisma.job.findMany({
    where: activeJobsWhere(),
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

export async function getIndexableCitySlugs() {
  const cities = await prisma.location.findMany({
    select: { slug: true, _count: { select: { jobs: true } } },
  });
  const counts = await Promise.all(
    cities.map(async (c) => ({
      slug: c.slug,
      count: await getCityJobCount(c.slug),
    }))
  );
  return counts
    .filter((c) => c.count >= MIN_JOBS_FOR_CITY_INDEX)
    .map((c) => c.slug);
}

export async function getIndexableCompanySlugs() {
  const companies = await prisma.company.findMany({
    where: { jobs: { some: {} } },
    select: { slug: true },
  });
  return companies.map((c) => c.slug);
}

export async function getRecentJobSlugs(limit = 500) {
  const jobs = await prisma.job.findMany({
    where: activeJobsWhere(),
    select: { slug: true },
    orderBy: jobListOrderBy,
    take: limit,
  });
  return jobs.map((j) => j.slug);
}

export async function getTopCitySlugs(limit = 20) {
  const cities = await prisma.location.findMany({
    select: { slug: true, _count: { select: { jobs: true } } },
    orderBy: { jobs: { _count: "desc" } },
    take: limit,
  });
  return cities
    .filter((c) => c._count.jobs > 0)
    .map((c) => c.slug);
}

export async function getCitiesForFilter() {
  return prisma.location.findMany({
    where: { jobs: { some: {} } },
    select: { city: true, slug: true },
    orderBy: { city: "asc" },
  });
}

export async function getCompaniesForFilter() {
  return prisma.company.findMany({
    where: { jobs: { some: {} } },
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  });
}

export async function getJobsByCityGrouped(companySlug: string) {
  const jobs = await prisma.job.findMany({
    where: { companyRef: { slug: companySlug } },
    select: { ...jobListSelect, city: true },
    orderBy: [{ city: "asc" }, { createdAt: "desc" }],
  });

  const grouped = new Map<string, JobListItem[]>();
  for (const job of jobs) {
    const mapped = mapJobRow(job);
    const list = grouped.get(mapped.city) || [];
    list.push(mapped);
    grouped.set(mapped.city, list);
  }
  return grouped;
}
