import { prisma } from "./db";
import { MIN_JOBS_FOR_PROFESSION_INDEX } from "./constants";
import { activeJobsWhere } from "./queries";
import {
  PROFESSION_SEEDS,
  professionLandingSlug,
  professionJobWhere,
  type ProfessionSeed,
} from "./profession-taxonomy";
import { salaryPublicSlug } from "./salary-data";
import { sectorLandingSlug } from "./landing-pages";
import type { GraphEntity, GraphEntityType } from "./seo-engine/types";

export type GraphEdge = {
  from: { type: GraphEntityType; id: string; label: string };
  to: { type: GraphEntityType; id: string; label: string };
  relation: string;
};

export type ProfessionGraphContext = {
  profession: ProfessionSeed;
  jobCount: number;
  entities: GraphEntity[];
  edges: GraphEdge[];
  relatedLinks: { href: string; label: string; type: GraphEntityType }[];
  coverage: GraphCoverageMetrics;
};

export type GraphCoverageMetrics = {
  skillsLinked: number;
  citiesLinked: number;
  companiesLinked: number;
  salariesLinked: number;
  relatedProfessionsLinked: number;
  jobsLinked: number;
  coverageScore: number;
};

export async function getProfessionJobCount(profession: ProfessionSeed): Promise<number> {
  return prisma.job.count({
    where: { AND: [activeJobsWhere(), professionJobWhere(profession)] },
  });
}

export async function getIndexableProfessionSlugs(): Promise<
  { slug: string; professionSlug: string; jobCount: number }[]
> {
  const results = await Promise.all(
    PROFESSION_SEEDS.map(async (profession) => {
      const jobCount = await getProfessionJobCount(profession);
      if (jobCount < MIN_JOBS_FOR_PROFESSION_INDEX) return null;
      return {
        slug: professionLandingSlug(profession.slug),
        professionSlug: profession.slug,
        jobCount,
      };
    })
  );
  return results.filter((r): r is NonNullable<typeof r> => r !== null);
}

export async function getProfessionHiringCities(profession: ProfessionSeed, limit = 8) {
  const jobs = await prisma.job.findMany({
    where: { AND: [activeJobsWhere(), professionJobWhere(profession)] },
    select: {
      location: { select: { slug: true, city: true } },
      city: true,
    },
    take: 500,
  });

  const counts = new Map<string, { slug: string; city: string; count: number }>();
  for (const job of jobs) {
    const slug = job.location?.slug;
    if (!slug) continue;
    const entry = counts.get(slug) ?? {
      slug,
      city: job.location?.city ?? job.city,
      count: 0,
    };
    entry.count++;
    counts.set(slug, entry);
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getProfessionHiringCompanies(profession: ProfessionSeed, limit = 10) {
  return prisma.company.findMany({
    where: {
      jobs: {
        some: { AND: [activeJobsWhere(), professionJobWhere(profession)] },
      },
    },
    select: {
      name: true,
      slug: true,
      _count: {
        select: {
          jobs: {
            where: { AND: [activeJobsWhere(), professionJobWhere(profession)] },
          },
        },
      },
    },
    orderBy: { jobs: { _count: "desc" } },
    take: limit,
  });
}

function computeCoverageScore(metrics: Omit<GraphCoverageMetrics, "coverageScore">): number {
  const weights = {
    skills: 15,
    cities: 25,
    companies: 25,
    salaries: 15,
    relatedProfessions: 10,
    jobs: 10,
  };
  let score = 0;
  if (metrics.skillsLinked > 0) score += weights.skills;
  if (metrics.citiesLinked >= 3) score += weights.cities;
  else if (metrics.citiesLinked > 0) score += weights.cities / 2;
  if (metrics.companiesLinked >= 3) score += weights.companies;
  else if (metrics.companiesLinked > 0) score += weights.companies / 2;
  if (metrics.salariesLinked > 0) score += weights.salaries;
  if (metrics.relatedProfessionsLinked >= 2) score += weights.relatedProfessions;
  else if (metrics.relatedProfessionsLinked > 0) score += weights.relatedProfessions / 2;
  if (metrics.jobsLinked >= MIN_JOBS_FOR_PROFESSION_INDEX) score += weights.jobs;
  return Math.min(100, Math.round(score));
}

export async function buildProfessionGraph(
  profession: ProfessionSeed
): Promise<ProfessionGraphContext> {
  const [jobCount, cities, companies] = await Promise.all([
    getProfessionJobCount(profession),
    getProfessionHiringCities(profession),
    getProfessionHiringCompanies(profession),
  ]);

  const entities: GraphEntity[] = [
    { type: "PROFESSION", id: profession.slug, label: profession.name, slug: profession.slug },
    { type: "SECTOR", id: profession.sectorSlug, label: profession.sectorSlug, slug: profession.sectorSlug },
  ];

  const edges: GraphEdge[] = [];
  const relatedLinks: { href: string; label: string; type: GraphEntityType }[] = [];

  for (const skill of profession.skills) {
    entities.push({ type: "SKILL", id: skill, label: skill });
    edges.push({
      from: { type: "PROFESSION", id: profession.slug, label: profession.name },
      to: { type: "SKILL", id: skill, label: skill },
      relation: "requires_skill",
    });
  }

  for (const city of cities) {
    entities.push({ type: "CITY", id: city.slug, label: city.city, slug: city.slug });
    edges.push({
      from: { type: "PROFESSION", id: profession.slug, label: profession.name },
      to: { type: "CITY", id: city.slug, label: city.city },
      relation: "hiring_in",
    });
    relatedLinks.push({
      href: `/emplois/${city.slug}`,
      label: `Emploi ${profession.name} ${city.city}`,
      type: "CITY",
    });
  }

  for (const company of companies) {
    entities.push({ type: "COMPANY", id: company.slug, label: company.name, slug: company.slug });
    edges.push({
      from: { type: "PROFESSION", id: profession.slug, label: profession.name },
      to: { type: "COMPANY", id: company.slug, label: company.name },
      relation: "hired_by",
    });
    relatedLinks.push({
      href: `/entreprise/${company.slug}`,
      label: `Recrutement ${company.name}`,
      type: "COMPANY",
    });
  }

  if (profession.salarySlug) {
    entities.push({
      type: "SALARY",
      id: profession.salarySlug,
      label: `Salaire ${profession.name}`,
      slug: profession.salarySlug,
    });
    edges.push({
      from: { type: "PROFESSION", id: profession.slug, label: profession.name },
      to: { type: "SALARY", id: profession.salarySlug, label: profession.salarySlug },
      relation: "has_salary_page",
    });
    relatedLinks.push({
      href: `/${salaryPublicSlug(profession.salarySlug)}`,
      label: `Salaire ${profession.name} Maroc`,
      type: "SALARY",
    });
  }

  for (const relatedSlug of profession.relatedSlugs.slice(0, 5)) {
    const related = PROFESSION_SEEDS.find((p) => p.slug === relatedSlug);
    if (!related) continue;
    entities.push({
      type: "PROFESSION",
      id: related.slug,
      label: related.name,
      slug: related.slug,
    });
    edges.push({
      from: { type: "PROFESSION", id: profession.slug, label: profession.name },
      to: { type: "PROFESSION", id: related.slug, label: related.name },
      relation: "related_to",
    });
    relatedLinks.push({
      href: `/${professionLandingSlug(related.slug)}`,
      label: `Emploi ${related.name} Maroc`,
      type: "PROFESSION",
    });
  }

  edges.push({
    from: { type: "PROFESSION", id: profession.slug, label: profession.name },
    to: { type: "SECTOR", id: profession.sectorSlug, label: profession.sectorSlug },
    relation: "in_sector",
  });
  relatedLinks.push({
    href: `/${sectorLandingSlug(profession.sectorSlug)}`,
    label: `Emploi ${profession.sectorSlug} Maroc`,
    type: "SECTOR",
  });

  const coverage: GraphCoverageMetrics = {
    skillsLinked: profession.skills.length,
    citiesLinked: cities.length,
    companiesLinked: companies.length,
    salariesLinked: profession.salarySlug ? 1 : 0,
    relatedProfessionsLinked: profession.relatedSlugs.length,
    jobsLinked: jobCount,
    coverageScore: 0,
  };
  coverage.coverageScore = computeCoverageScore(coverage);

  return {
    profession,
    jobCount,
    entities,
    edges,
    relatedLinks: relatedLinks.slice(0, 12),
    coverage,
  };
}

export async function getGlobalGraphCoverage() {
  const indexable = await getIndexableProfessionSlugs();
  const graphs = await Promise.all(
    indexable.slice(0, 20).map((p) => {
      const profession = PROFESSION_SEEDS.find((s) => s.slug === p.professionSlug)!;
      return buildProfessionGraph(profession);
    })
  );

  const avgCoverage =
    graphs.length > 0
      ? Math.round(
          graphs.reduce((s, g) => s + g.coverage.coverageScore, 0) / graphs.length
        )
      : 0;

  return {
    indexableProfessions: indexable.length,
    totalProfessions: PROFESSION_SEEDS.length,
    avgCoverageScore: avgCoverage,
    professions: indexable,
    generatedAt: new Date().toISOString(),
  };
}
