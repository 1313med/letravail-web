import {
  MIN_JOBS_FOR_CITY_INDEX,
  MIN_JOBS_FOR_LANDING_INDEX,
  MIN_OBSERVATIONS_FOR_SALARY_INDEX,
} from "../constants";
import { sectorLandingSlug, comboLandingSlug, SEO_CITIES } from "../landing-pages";
import { SALARY_ROLES, salaryPublicSlug } from "../salary-data";
import type { SalaryRole } from "../salary-data";

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

  if (job.taxonomySlug) {
    links.push({
      type: "profession",
      label: `Emploi ${job.title.split(" ").slice(0, 3).join(" ")} Maroc`,
      href: `/emplois?q=${encodeURIComponent(job.taxonomySlug)}`,
    });
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
