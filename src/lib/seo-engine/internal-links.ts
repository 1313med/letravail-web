import { MIN_JOBS_FOR_CITY_INDEX, MIN_JOBS_FOR_LANDING_INDEX, MIN_OBSERVATIONS_FOR_SALARY_INDEX } from "../constants";
import { prisma } from "../db";
import { shouldNoindexSalaryPage } from "../indexation";
import { sectorLandingSlug, comboLandingSlug, SEO_CITIES } from "../landing-pages";
import {
  matchProfessionFromTitle,
  professionLandingSlug,
} from "../profession-taxonomy";
import { activeJobsWhere, getCityJobCount } from "../queries";
import { SALARY_ROLES, salaryPublicSlug } from "../salary-data";
import type { SalaryRole } from "../salary-data";
import type { GraphEntity, GraphEntityType, PageGraphContext } from "./types";

export type InternalLinkType =
  | "city"
  | "company"
  | "salary"
  | "profession"
  | "sector";

export interface InternalLink {
  type: InternalLinkType;
  label: string;
  href: string;
}

export interface JobLinkContext {
  title: string;
  company: string;
  city: string;
  contractType: string | null;
  companyRef: { slug: string } | null;
  location: { slug: string } | null;
  tags: { tag: { slug: string; name: string } }[];
  taxonomySlug?: string | null;
  salaryRoleSlug?: string | null;
}

export function matchSalaryRole(title: string): SalaryRole | null {
  const lower = title.toLowerCase();
  return (
    SALARY_ROLES.find((role) =>
      role.keywords.some((kw) => lower.includes(kw.toLowerCase()))
    ) ?? null
  );
}

export function buildJobInternalLinks(job: JobLinkContext): InternalLink[] {
  const links: InternalLink[] = [];
  const citySlug = job.location?.slug;

  if (citySlug) {
    links.push({
      type: "city",
      label: `Emploi ${job.city}`,
      href: `/emplois/${citySlug}`,
    });
  }

  if (job.companyRef?.slug) {
    links.push({
      type: "company",
      label: job.company,
      href: `/entreprise/${job.companyRef.slug}`,
    });
  }

  const salaryRole = job.salaryRoleSlug
    ? SALARY_ROLES.find((r) => r.slug === job.salaryRoleSlug) ?? null
    : matchSalaryRole(job.title);

  if (salaryRole) {
    links.push({
      type: "salary",
      label: `Salaire ${salaryRole.title} Maroc`,
      href: `/${salaryPublicSlug(salaryRole.slug)}`,
    });
  }

  const matchedProfession = matchProfessionFromTitle(job.title);
  if (matchedProfession) {
    links.push({
      type: "profession",
      label: `Emploi ${matchedProfession.name} Maroc`,
      href: `/${professionLandingSlug(matchedProfession.slug)}`,
    });
  }

  for (const tag of job.tags.slice(0, 2)) {
    links.push({
      type: "sector",
      label: `Emploi ${tag.tag.name} Maroc`,
      href: `/${sectorLandingSlug(tag.tag.slug)}`,
    });

    if (citySlug) {
      const cityShort = SEO_CITIES.find((c) => c.slug === citySlug)?.short;
      if (cityShort) {
        links.push({
          type: "profession",
          label: `Emploi ${tag.tag.name} ${job.city}`,
          href: `/${comboLandingSlug(tag.tag.slug, cityShort)}`,
        });
      }
    }
  }

  return dedupeLinks(links);
}

export function detectMissingLinkTypes(
  job: JobLinkContext,
  existingHrefs: string[]
): InternalLinkType[] {
  const expected = buildJobInternalLinks(job);
  const existing = new Set(existingHrefs);
  const missing = new Set<InternalLinkType>();

  for (const link of expected) {
    if (!existing.has(link.href)) {
      missing.add(link.type);
    }
  }

  if (!job.location?.slug) missing.add("city");
  if (job.companyRef?.slug && !existingHrefs.some((h) => h.includes("/entreprise/"))) {
    missing.add("company");
  }
  if (matchSalaryRole(job.title) && !existingHrefs.some((h) => h.startsWith("/salaire-"))) {
    missing.add("salary");
  }
  if (job.tags.length === 0) missing.add("sector");

  return Array.from(missing);
}

function dedupeLinks(links: InternalLink[]): InternalLink[] {
  const seen = new Set<string>();
  const result: InternalLink[] = [];
  for (const link of links) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    result.push(link);
  }
  return result.slice(0, 8);
}

export function contentDepthScore(descriptionLength: number): number {
  if (descriptionLength >= 800) return 100;
  if (descriptionLength >= 400) return 80;
  if (descriptionLength >= 200) return 60;
  if (descriptionLength >= 120) return 40;
  return 20;
}

export function internalLinksScore(linkCount: number, expectedCount: number): number {
  if (expectedCount === 0) return 100;
  const ratio = Math.min(1, linkCount / expectedCount);
  return Math.round(ratio * 100);
}

export function estimateTrafficGain(params: {
  jobCount?: number;
  observationCount?: number;
  impressions?: number;
  missingLinkCount?: number;
}): number {
  const base =
    (params.jobCount ?? 0) * 3 +
    (params.observationCount ?? 0) * 2 +
    (params.impressions ?? 0) * 0.08 +
    (params.missingLinkCount ?? 0) * 15;
  return Math.max(5, Math.round(base));
}

export {
  MIN_JOBS_FOR_CITY_INDEX,
  MIN_JOBS_FOR_LANDING_INDEX,
  MIN_OBSERVATIONS_FOR_SALARY_INDEX,
};

// --- Employment Knowledge Graph (DB-driven, no hardcoded mappings) ---

export async function discoverCityPageLinks(citySlug: string): Promise<
  InternalLinkAutopilotRec[]
> {
  const location = await prisma.location.findUnique({
    where: { slug: citySlug },
    select: { city: true, slug: true },
  });
  if (!location) return [];

  const jobCount = await getCityJobCount(citySlug);
  if (jobCount < MIN_JOBS_FOR_CITY_INDEX) return [];

  const cityShort = SEO_CITIES.find((c) => c.slug === citySlug)?.short;
  const recommendations: InternalLinkAutopilotRec[] = [];

  const sectorCounts = await prisma.jobTag.groupBy({
    by: ["tagId"],
    where: { job: { AND: [activeJobsWhere(), { location: { slug: citySlug } }] } },
    _count: { _all: true },
    orderBy: { _count: { tagId: "desc" } },
    take: 8,
  });

  const tagIds = sectorCounts.map((s) => s.tagId);
  const tags = tagIds.length
    ? await prisma.tag.findMany({ where: { id: { in: tagIds } } })
    : [];
  const tagMap = new Map(tags.map((t) => [t.id, t]));

  for (const sc of sectorCounts) {
    const tag = tagMap.get(sc.tagId);
    if (!tag || sc._count._all < MIN_JOBS_FOR_LANDING_INDEX) continue;

    if (cityShort) {
      recommendations.push({
        href: `/${comboLandingSlug(tag.slug, cityShort)}`,
        label: `Emploi ${tag.name} ${location.city}`,
        reason: `${sc._count._all} offres ${tag.name} à ${location.city}`,
        entityType: "PROFESSION",
        jobCount: sc._count._all,
      });
    }
    recommendations.push({
      href: `/${sectorLandingSlug(tag.slug)}`,
      label: `Emploi ${tag.name} Maroc`,
      reason: `${sc._count._all} offres locales — hub sectoriel`,
      entityType: "SECTOR",
      jobCount: sc._count._all,
    });
  }

  const companies = await prisma.company.findMany({
    where: {
      jobs: { some: { AND: [activeJobsWhere(), { location: { slug: citySlug } }] } },
    },
    select: {
      name: true,
      slug: true,
      _count: {
        select: {
          jobs: {
            where: { AND: [activeJobsWhere(), { location: { slug: citySlug } }] },
          },
        },
      },
    },
    orderBy: { jobs: { _count: "desc" } },
    take: 6,
  });

  for (const co of companies) {
    if (co._count.jobs < 1) continue;
    recommendations.push({
      href: `/entreprise/${co.slug}`,
      label: `Recrutement ${co.name}`,
      reason: `${co._count.jobs} offres actives à ${location.city}`,
      entityType: "COMPANY",
      jobCount: co._count.jobs,
    });
  }

  const roleObs = await prisma.salaryObservation.groupBy({
    by: ["titleNorm"],
    where: { citySlug },
    _count: { _all: true },
    orderBy: { _count: { titleNorm: "desc" } },
    take: 5,
  });

  for (const ro of roleObs) {
    const role = SALARY_ROLES.find((r) => r.slug === ro.titleNorm);
    if (!role) continue;
    if (shouldNoindexSalaryPage(ro._count._all, MIN_OBSERVATIONS_FOR_SALARY_INDEX)) continue;
    recommendations.push({
      href: `/${salaryPublicSlug(role.slug)}`,
      label: `Salaire ${role.title} Maroc`,
      reason: `${ro._count._all} observations salariales à ${location.city}`,
      entityType: "SALARY",
      jobCount: ro._count._all,
    });
  }

  return dedupeAutopilotRecs(recommendations).slice(0, 12);
}

export interface InternalLinkAutopilotRec {
  href: string;
  label: string;
  reason: string;
  entityType: GraphEntityType;
  jobCount?: number;
}

function dedupeAutopilotRecs(recs: InternalLinkAutopilotRec[]): InternalLinkAutopilotRec[] {
  const seen = new Set<string>();
  return recs.filter((r) => {
    if (seen.has(r.href)) return false;
    seen.add(r.href);
    return true;
  });
}

export async function getPageGraphContext(pagePath: string): Promise<PageGraphContext> {
  const relatedPages: PageGraphContext["relatedPages"] = [];
  const entities: GraphEntity[] = [];

  if (pagePath.startsWith("/emplois/")) {
    const citySlug = pagePath.replace("/emplois/", "").split("?")[0];
    const loc = await prisma.location.findUnique({
      where: { slug: citySlug },
      select: { city: true, slug: true },
    });
    if (loc) {
      entities.push({ type: "CITY", id: loc.slug, label: loc.city, slug: loc.slug });
      const links = await discoverCityPageLinks(citySlug);
      for (const l of links) {
        relatedPages.push({
          path: l.href,
          label: l.label,
          reason: l.reason,
          score: l.jobCount ?? 1,
        });
      }
    }
  }

  return { pagePath, entities, relatedPages };
}

export async function buildInternalLinkAutopilotBatch(
  limit = 15
): Promise<
  {
    sourcePath: string;
    sourceLabel: string;
    recommendedLinks: InternalLinkAutopilotRec[];
    missingLinkCount: number;
    estimatedTrafficGain: number;
  }[]
> {
  const cities = await prisma.location.findMany({
    select: { slug: true, city: true },
    take: 30,
  });

  const results: {
    sourcePath: string;
    sourceLabel: string;
    recommendedLinks: InternalLinkAutopilotRec[];
    missingLinkCount: number;
    estimatedTrafficGain: number;
  }[] = [];

  for (const loc of cities) {
    const count = await getCityJobCount(loc.slug);
    if (count < MIN_JOBS_FOR_CITY_INDEX) continue;

    const links = await discoverCityPageLinks(loc.slug);
    if (links.length === 0) continue;

    results.push({
      sourcePath: `/emplois/${loc.slug}`,
      sourceLabel: loc.city,
      recommendedLinks: links,
      missingLinkCount: links.length,
      estimatedTrafficGain: estimateTrafficGain({
        jobCount: count,
        missingLinkCount: links.length,
      }),
    });

    if (results.length >= limit) break;
  }

  return results.sort((a, b) => b.estimatedTrafficGain - a.estimatedTrafficGain);
}
