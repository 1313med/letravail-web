import {
  MIN_JOBS_FOR_CITY_INDEX,
  MIN_OBSERVATIONS_FOR_SALARY_INDEX,
} from "../constants";
import { prisma } from "../db";
import { parseSalaryRange } from "../job-detail";
import { shouldNoindexSalaryPage } from "../indexation";
import { activeJobsWhere, getCityJobCount, getCompaniesInCity, tagHasActiveJobsWhere } from "../queries";
import { SALARY_ROLES, median, percentile, salaryPublicSlug } from "../salary-data";
import type {
  ContentBlock,
  ContentGenerationReport,
  ContentPageType,
  GeneratedPageContent,
} from "./types";

export async function generateCityPageContent(
  citySlug: string
): Promise<GeneratedPageContent | null> {
  const location = await prisma.location.findUnique({
    where: { slug: citySlug },
    select: { city: true, slug: true },
  });
  if (!location) return null;

  const jobCount = await getCityJobCount(citySlug);
  if (jobCount < MIN_JOBS_FOR_CITY_INDEX) return null;

  const [employers, obsByCity, professions, trend] = await Promise.all([
    getCompaniesInCity(citySlug, 8),
    prisma.salaryObservation.groupBy({
      by: ["titleNorm"],
      where: { citySlug },
      _avg: { salaryMin: true, salaryMax: true },
      _count: { _all: true },
    }),
    prisma.job.groupBy({
      by: ["title"],
      where: { AND: [activeJobsWhere(), { location: { slug: citySlug } }] },
      _count: { _all: true },
      orderBy: { _count: { title: "desc" } },
      take: 8,
    }),
    computeHiringTrend(citySlug),
  ]);

  const salaryMedians = obsByCity
    .filter((o) => o._count._all >= 2)
    .map((o) => ({
      role: o.titleNorm,
      medianMin: o._avg.salaryMin,
      medianMax: o._avg.salaryMax,
      observations: o._count._all,
    }));

  const blocks: ContentBlock[] = [
    {
      type: "SUMMARY",
      title: `Marché emploi ${location.city}`,
      data: {
        jobCount,
        city: location.city,
        slug: citySlug,
        indexable: true,
      },
    },
    {
      type: "STATS",
      title: "Top employeurs",
      data: {
        employers: employers.map((e) => ({
          name: e.name,
          slug: e.slug,
          jobCount: e._count.jobs,
        })),
      },
    },
    {
      type: "STATS",
      title: "Salaires médians (observations réelles)",
      data: { salaries: salaryMedians },
    },
    {
      type: "STATS",
      title: "Métiers les plus recrutés",
      data: {
        professions: professions.map((p) => ({
          title: p.title,
          count: p._count._all,
        })),
      },
    },
    {
      type: "TRENDS",
      title: "Tendance recrutement",
      data: trend,
    },
    {
      type: "FAQ",
      title: "FAQ emploi",
      data: {
        items: [
          {
            q: `Combien d'offres à ${location.city} ?`,
            a: `${jobCount} offres actives sur Letravail.ma.`,
          },
          {
            q: `Quels employeurs recrutent à ${location.city} ?`,
            a: employers.slice(0, 3).map((e) => e.name).join(", ") || "Consultez la liste ci-dessus.",
          },
        ],
      },
    },
  ];

  return {
    pageType: "CITY",
    pagePath: `/emplois/${citySlug}`,
    label: location.city,
    blocks,
    dataSource: "jobs + salary_observations + companies",
    generatedAt: new Date().toISOString(),
  };
}

export async function generateSalaryPageContent(
  roleSlug: string
): Promise<GeneratedPageContent | null> {
  const role = SALARY_ROLES.find((r) => r.slug === roleSlug);
  if (!role) return null;

  const observationCount = await prisma.salaryObservation.count({
    where: { titleNorm: roleSlug },
  });

  if (shouldNoindexSalaryPage(observationCount, MIN_OBSERVATIONS_FOR_SALARY_INDEX)) {
    return null;
  }

  const observations = await prisma.salaryObservation.findMany({
    where: { titleNorm: roleSlug },
    select: {
      salaryMin: true,
      salaryMax: true,
      citySlug: true,
      jobId: true,
    },
  });

  const medians: number[] = [];
  const byCity = new Map<string, number[]>();

  for (const obs of observations) {
    const mid =
      obs.salaryMin && obs.salaryMax
        ? Math.round((obs.salaryMin + obs.salaryMax) / 2)
        : obs.salaryMin ?? obs.salaryMax;
    if (!mid) continue;
    medians.push(mid);
    if (obs.citySlug) {
      const list = byCity.get(obs.citySlug) ?? [];
      list.push(mid);
      byCity.set(obs.citySlug, list);
    }
  }

  const p25 = percentile(medians, 25);
  const med = median(medians);
  const p75 = percentile(medians, 75);

  const cityComparison = Array.from(byCity.entries())
    .map(([slug, vals]) => ({
      citySlug: slug,
      median: median(vals),
      observations: vals.length,
    }))
    .filter((c) => c.median != null && c.observations >= 2)
    .sort((a, b) => (b.median ?? 0) - (a.median ?? 0))
    .slice(0, 8);

  const titleOr = role.keywords.map((kw) => ({
    title: { contains: kw, mode: "insensitive" as const },
  }));

  const topCompanies = await prisma.job.groupBy({
    by: ["company"],
    where: {
      AND: [activeJobsWhere(), { salary: { not: null } }, { OR: titleOr }],
    },
    _count: { _all: true },
    orderBy: { _count: { company: "desc" } },
    take: 8,
  });

  const blocks: ContentBlock[] = [
    {
      type: "SUMMARY",
      title: `Salaire ${role.title} Maroc`,
      data: {
        role: role.title,
        observationCount,
        currency: "MAD",
      },
    },
    {
      type: "STATS",
      title: "Distribution salariale",
      data: {
        p25,
        median: med,
        p75,
        sampleSize: medians.length,
        unit: "MAD/mois",
      },
    },
    {
      type: "STATS",
      title: "Comparaison par ville",
      data: { cities: cityComparison },
    },
    {
      type: "STATS",
      title: "Entreprises qui paient ce rôle",
      data: {
        companies: topCompanies.map((c) => ({
          name: c.company,
          jobCount: c._count._all,
        })),
      },
    },
    {
      type: "FAQ",
      title: "FAQ salaire",
      data: {
        items: [
          {
            q: `Quel salaire pour ${role.title} au Maroc ?`,
            a: med
              ? `Médiane observée : ${med.toLocaleString("fr-MA")} MAD/mois (${observationCount} observations).`
              : "Données insuffisantes.",
          },
        ],
      },
    },
  ];

  return {
    pageType: "SALARY",
    pagePath: `/${salaryPublicSlug(roleSlug)}`,
    label: role.title,
    blocks,
    dataSource: "salary_observations + jobs",
    generatedAt: new Date().toISOString(),
  };
}

export async function generateCompanyPageContent(
  companySlug: string
): Promise<GeneratedPageContent | null> {
  const company = await prisma.company.findUnique({
    where: { slug: companySlug },
    include: {
      jobs: {
        where: activeJobsWhere(),
        select: {
          title: true,
          city: true,
          salary: true,
          location: { select: { slug: true } },
          createdAt: true,
        },
      },
    },
  });

  if (!company || company.jobs.length === 0) return null;

  const salaries: number[] = [];
  const byCity = new Map<string, number>();
  const byRole = new Map<string, number>();

  for (const job of company.jobs) {
    byCity.set(job.city, (byCity.get(job.city) ?? 0) + 1);
    byRole.set(job.title, (byRole.get(job.title) ?? 0) + 1);
    const parsed = parseSalaryRange(job.salary, job.title);
    if (parsed.median) salaries.push(parsed.median);
  }

  const trend = await computeCompanyHiringTrend(companySlug);
  const topCities = Array.from(byCity.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([city, count]) => ({ city, count }));

  const topRoles = Array.from(byRole.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([title, count]) => ({ title, count }));

  const blocks: ContentBlock[] = [
    {
      type: "SUMMARY",
      title: `Recrutement ${company.name}`,
      data: {
        name: company.name,
        activeJobs: company.jobs.length,
        slug: companySlug,
      },
    },
    {
      type: "STATS",
      title: "Fourchette salariale (offres avec salaire)",
      data: {
        min: salaries.length ? Math.min(...salaries) : null,
        median: median(salaries),
        max: salaries.length ? Math.max(...salaries) : null,
        sampleSize: salaries.length,
        currency: "MAD",
      },
    },
    {
      type: "TRENDS",
      title: "Tendance recrutement",
      data: trend,
    },
    {
      type: "STATS",
      title: "Villes de recrutement",
      data: { cities: topCities },
    },
    {
      type: "STATS",
      title: "Postes les plus ouverts",
      data: { roles: topRoles },
    },
    {
      type: "FAQ",
      title: "FAQ entreprise",
      data: {
        items: [
          {
            q: `${company.name} recrute-t-elle actuellement ?`,
            a: `Oui, ${company.jobs.length} offre(s) active(s) sur Letravail.ma.`,
          },
        ],
      },
    },
  ];

  return {
    pageType: "COMPANY",
    pagePath: `/entreprise/${companySlug}`,
    label: company.name,
    blocks,
    dataSource: "jobs",
    generatedAt: new Date().toISOString(),
  };
}

async function computeHiringTrend(citySlug: string) {
  const now = new Date();
  const thirtyAgo = new Date(now);
  thirtyAgo.setDate(thirtyAgo.getDate() - 30);
  const sixtyAgo = new Date(now);
  sixtyAgo.setDate(sixtyAgo.getDate() - 60);

  const [recent, previous] = await Promise.all([
    prisma.job.count({
      where: {
        AND: [
          activeJobsWhere(),
          { location: { slug: citySlug } },
          { createdAt: { gte: thirtyAgo } },
        ],
      },
    }),
    prisma.job.count({
      where: {
        AND: [
          activeJobsWhere(),
          { location: { slug: citySlug } },
          { createdAt: { gte: sixtyAgo, lt: thirtyAgo } },
        ],
      },
    }),
  ]);

  const delta = recent - previous;
  return {
    last30Days: recent,
    previous30Days: previous,
    delta,
    trend: delta > 0 ? "up" : delta < 0 ? "down" : "stable",
  };
}

async function computeCompanyHiringTrend(companySlug: string) {
  const now = new Date();
  const thirtyAgo = new Date(now);
  thirtyAgo.setDate(thirtyAgo.getDate() - 30);
  const sixtyAgo = new Date(now);
  sixtyAgo.setDate(sixtyAgo.getDate() - 60);

  const [recent, previous] = await Promise.all([
    prisma.job.count({
      where: {
        AND: [
          activeJobsWhere(),
          { companyRef: { slug: companySlug } },
          { createdAt: { gte: thirtyAgo } },
        ],
      },
    }),
    prisma.job.count({
      where: {
        AND: [
          activeJobsWhere(),
          { companyRef: { slug: companySlug } },
          { createdAt: { gte: sixtyAgo, lt: thirtyAgo } },
        ],
      },
    }),
  ]);

  const delta = recent - previous;
  return {
    last30Days: recent,
    previous30Days: previous,
    delta,
    trend: delta > 0 ? "up" : delta < 0 ? "down" : "stable",
  };
}

export async function getContentGenerationReport(): Promise<ContentGenerationReport> {
  const [topCities, topCompanies, indexableRoles] = await Promise.all([
    prisma.location.findMany({
      select: { slug: true },
      take: 20,
    }),
    prisma.company.findMany({
      where: { jobs: { some: activeJobsWhere() } },
      select: { slug: true },
      orderBy: { jobs: { _count: "desc" } },
      take: 10,
    }),
    prisma.salaryObservation.groupBy({
      by: ["titleNorm"],
      _count: { _all: true },
    }),
  ]);

  const samples: GeneratedPageContent[] = [];

  for (const loc of topCities) {
    const content = await generateCityPageContent(loc.slug);
    if (content) {
      samples.push(content);
      if (samples.length >= 3) break;
    }
  }

  for (const role of SALARY_ROLES) {
    if (samples.filter((s) => s.pageType === "SALARY").length >= 2) break;
    const count =
      indexableRoles.find((r) => r.titleNorm === role.slug)?._count._all ?? 0;
    if (count < MIN_OBSERVATIONS_FOR_SALARY_INDEX) continue;
    const content = await generateSalaryPageContent(role.slug);
    if (content) samples.push(content);
  }

  for (const company of topCompanies.slice(0, 3)) {
    const content = await generateCompanyPageContent(company.slug);
    if (content) samples.push(content);
  }

  const cityIndexable = await Promise.all(
    topCities.map(async (c) => ({
      slug: c.slug,
      ok: (await getCityJobCount(c.slug)) >= MIN_JOBS_FOR_CITY_INDEX,
    }))
  );

  return {
    samples,
    availablePages: [
      {
        pageType: "CITY" as const,
        count: cityIndexable.filter((c) => c.ok).length,
      },
      {
        pageType: "SALARY" as const,
        count: indexableRoles.filter(
          (r) => r._count._all >= MIN_OBSERVATIONS_FOR_SALARY_INDEX
        ).length,
      },
      {
        pageType: "COMPANY" as const,
        count: topCompanies.length,
      },
      {
        pageType: "PROFESSION" as const,
        count: await prisma.tag.count({ where: tagHasActiveJobsWhere() }),
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}
