import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import {
  JOBS_PER_PAGE,
  MIN_JOBS_FOR_CITY_INDEX,
} from "./constants";
import { DISCOVERY_EXPERIENCE_LEVELS } from "./jobs-discovery";

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
};

function buildJobWhere(filters: JobFilters): Prisma.JobWhereInput {
  const where: Prisma.JobWhereInput = {};

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
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      hybridClause,
    ];
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
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        { OR: expOr },
      ];
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
    where: { location: { slug } },
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

export async function getTotalJobCount() {
  return prisma.job.count();
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
    select: { slug: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getIndexableCitySlugs() {
  const cities = await prisma.location.findMany({
    select: { slug: true, _count: { select: { jobs: true } } },
  });
  return cities
    .filter((c) => c._count.jobs >= MIN_JOBS_FOR_CITY_INDEX)
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
