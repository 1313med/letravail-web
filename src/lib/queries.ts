import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import {
  JOBS_PER_PAGE,
  MIN_JOBS_FOR_CITY_INDEX,
  TOP_CITIES,
} from "./constants";

export type JobListItem = {
  id: string;
  slug: string;
  title: string;
  company: string;
  city: string;
  contractType: string | null;
  remote: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  description: string;
  companyRef: { slug: string } | null;
  location: { slug: string } | null;
};

export type JobFilters = {
  q?: string;
  city?: string;
  company?: string;
  contract?: string;
  tag?: string;
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
  publishedAt: true,
  createdAt: true,
  description: true,
  companyRef: { select: { slug: true } },
  location: { select: { slug: true } },
} satisfies Prisma.JobSelect;

export async function getJobs(filters: JobFilters = {}) {
  const page = Math.max(1, filters.page || 1);
  const where = buildJobWhere(filters);

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      select: jobListSelect,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * JOBS_PER_PAGE,
      take: JOBS_PER_PAGE,
    }),
    prisma.job.count({ where }),
  ]);

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
  return prisma.job.findMany({
    where: {
      id: { not: job.id },
      OR: [
        { city: job.city },
        ...(job.companyId ? [{ companyId: job.companyId }] : []),
      ],
    },
    select: jobListSelect,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 6,
  });
}

export async function getCompanyBySlug(slug: string) {
  return prisma.company.findUnique({
    where: { slug },
    include: {
      jobs: {
        select: jobListSelect,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      },
    },
  });
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
  return prisma.job.findMany({
    select: jobListSelect,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
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
    orderBy: { publishedAt: "desc" },
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

export async function getRecentJobSlugs(limit = 100) {
  const jobs = await prisma.job.findMany({
    select: { slug: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  return jobs.map((j) => j.slug);
}

export async function getTopCitySlugs() {
  return TOP_CITIES.map((c) =>
    c
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
  );
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
    orderBy: [{ city: "asc" }, { publishedAt: "desc" }],
  });

  const grouped = new Map<string, JobListItem[]>();
  for (const job of jobs) {
    const list = grouped.get(job.city) || [];
    list.push(job);
    grouped.set(job.city, list);
  }
  return grouped;
}
