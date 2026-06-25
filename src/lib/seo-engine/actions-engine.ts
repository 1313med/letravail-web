import { revalidatePath } from "next/cache";
import { logSeoActionSafe } from "./seo-db";
import {
  generateCityPageContent,
  generateSalaryPageContent,
  generateCompanyPageContent,
} from "./content-generation-engine";
import {
  MIN_JOBS_FOR_CITY_INDEX,
  MIN_JOBS_FOR_LANDING_INDEX,
  MIN_OBSERVATIONS_FOR_SALARY_INDEX,
} from "../constants";
import { prisma } from "../db";
import { syncSalaryObservations } from "../data-moat";
import { shouldNoindexLanding, shouldNoindexSalaryPage } from "../indexation";
import { resolveJobPostingSalary } from "../job-salary-schema";
import {
  getAllLandingSlugCandidates,
  landingToJobFilters,
  parseLandingSlug,
  sectorLandingSlug,
} from "../landing-pages";
import { activeJobsWhere, getCityJobCount, getJobCount, activeJobTagWhere, tagHasActiveJobsWhere } from "../queries";
import { SALARY_ROLES, salaryPublicSlug } from "../salary-data";
import { rebuildSitemap, recalculateSalaryObservations } from "./actions";
import { buildJobInternalLinks, detectMissingLinkTypes } from "./internal-links";
import type { SeoActionResult } from "./types";

async function logSeoAction(
  action: string,
  status: "success" | "partial" | "failed",
  message: string,
  details: Record<string, unknown> = {}
) {
  await logSeoActionSafe(action, status, message, details);
}

export async function generateMissingCityPages(): Promise<SeoActionResult> {
  const locations = await prisma.location.findMany({
    select: { slug: true, city: true },
  });

  const activated: string[] = [];
  const skipped: string[] = [];

  for (const loc of locations) {
    const jobCount = await getCityJobCount(loc.slug);
    if (jobCount < MIN_JOBS_FOR_CITY_INDEX) {
      skipped.push(`${loc.city} (${jobCount} offres — seuil ${MIN_JOBS_FOR_CITY_INDEX})`);
      continue;
    }
    revalidatePath(`/emplois/${loc.slug}`);
    activated.push(`${loc.city} (${jobCount} offres)`);
  }

  revalidatePath("/sitemap.xml");

  const message = `${activated.length} page(s) ville revalidée(s), ${skipped.length} sous le seuil (non indexées).`;
  await logSeoAction("generateMissingCityPages", "success", message, {
    activated,
    skipped: skipped.slice(0, 20),
  });

  return {
    ok: true,
    message,
    details: { activatedCount: activated.length, skippedCount: skipped.length },
  };
}

export async function generateMissingProfessionPages(): Promise<SeoActionResult> {
  const taxonomy = await prisma.jobTitleTaxonomy.findMany();
  const activated: string[] = [];
  const skipped: string[] = [];

  if (taxonomy.length === 0) {
    const tags = await prisma.tag.findMany({
      where: tagHasActiveJobsWhere(),
      select: {
        slug: true,
        name: true,
        _count: { select: { jobs: { where: activeJobTagWhere() } } },
      },
    });

    for (const tag of tags) {
      const path = `/${sectorLandingSlug(tag.slug)}`;
      if (tag._count.jobs < MIN_JOBS_FOR_LANDING_INDEX) {
        skipped.push(`${tag.name} (${tag._count.jobs} offres)`);
        continue;
      }
      revalidatePath(path);
      activated.push(path);
    }
  } else {
    for (const entry of taxonomy) {
      const keywords = entry.keywords.length > 0 ? entry.keywords : [entry.label];
      const jobCount = await prisma.job.count({
        where: {
          AND: [
            activeJobsWhere(),
            {
              OR: keywords.map((kw) => ({
                title: { contains: kw, mode: "insensitive" as const },
              })),
            },
          ],
        },
      });

      if (jobCount < MIN_JOBS_FOR_LANDING_INDEX) {
        skipped.push(`${entry.label} (${jobCount} offres)`);
        continue;
      }

      if (entry.sectorSlug) {
        const path = `/${sectorLandingSlug(entry.sectorSlug)}`;
        revalidatePath(path);
        activated.push(`${entry.label} → ${path}`);
      } else {
        activated.push(`${entry.label} (recherche /emplois?q=)`);
      }
    }
  }

  const candidates = getAllLandingSlugCandidates();
  for (const slug of candidates) {
    const landing = parseLandingSlug(slug);
    if (!landing) continue;
    const count = await getJobCount(landingToJobFilters(landing));
    if (!shouldNoindexLanding(count)) {
      revalidatePath(`/${slug}`);
    }
  }

  revalidatePath("/sitemap.xml");

  const message = `${activated.length} page(s) profession/secteur activée(s). ${skipped.length} sous seuil ignorée(s).`;
  await logSeoAction("generateMissingProfessionPages", "success", message, {
    activated: activated.slice(0, 30),
    skipped: skipped.slice(0, 20),
  });

  return { ok: true, message, details: { activated, skipped } };
}

export async function generateSalaryPages(): Promise<SeoActionResult> {
  const syncResult = await syncSalaryObservations(5000);

  const obsGroups = await prisma.salaryObservation.groupBy({
    by: ["titleNorm"],
    _count: { _all: true },
  });
  const countMap = new Map(obsGroups.map((g) => [g.titleNorm, g._count._all]));

  const activated: string[] = [];
  const waiting: string[] = [];

  for (const role of SALARY_ROLES) {
    const count = countMap.get(role.slug) ?? 0;
    const path = `/${salaryPublicSlug(role.slug)}`;

    if (shouldNoindexSalaryPage(count, MIN_OBSERVATIONS_FOR_SALARY_INDEX)) {
      waiting.push(`${role.title} (${count}/${MIN_OBSERVATIONS_FOR_SALARY_INDEX})`);
      continue;
    }

    revalidatePath(path);
    activated.push(`${role.title} (${count} obs.)`);
  }

  revalidatePath("/sitemap.xml");
  revalidatePath("/salaires");

  const message = `${activated.length} page(s) salaire indexable(s). ${waiting.length} en attente de données.`;
  await logSeoAction("generateSalaryPages", "success", message, {
    syncResult,
    activated,
    waiting,
  });

  return {
    ok: true,
    message,
    details: { activated, waiting, syncResult },
  };
}

export async function fixInternalLinks(): Promise<SeoActionResult> {
  const jobs = await prisma.job.findMany({
    where: activeJobsWhere(),
    select: {
      slug: true,
      title: true,
      company: true,
      city: true,
      contractType: true,
      companyRef: { select: { slug: true } },
      location: { select: { slug: true } },
      tags: { select: { tag: { select: { slug: true, name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: 1000,
  });

  let fixed = 0;
  const sampleFixed: string[] = [];

  for (const job of jobs) {
    const ctx = {
      title: job.title,
      company: job.company,
      city: job.city,
      contractType: job.contractType,
      companyRef: job.companyRef,
      location: job.location,
      tags: job.tags,
    };

    const legacyHrefs: string[] = [];
    if (job.location?.slug) legacyHrefs.push(`/emplois/${job.location.slug}`);

    const missing = detectMissingLinkTypes(ctx, legacyHrefs);
    if (missing.length === 0) continue;

    const enriched = buildJobInternalLinks(ctx);
    if (enriched.length > legacyHrefs.length) {
      revalidatePath(`/emploi/${job.slug}`);
      fixed++;
      if (sampleFixed.length < 15) sampleFixed.push(job.slug);
    }
  }

  revalidatePath("/emploi", "layout");

  const message = `${fixed} offre(s) revalidée(s) avec maillage interne enrichi (company, salaire, secteur).`;
  await logSeoAction("fixInternalLinks", fixed > 0 ? "success" : "partial", message, {
    fixed,
    sampleFixed,
    totalScanned: jobs.length,
  });

  return {
    ok: true,
    message,
    details: { fixed, totalScanned: jobs.length, sampleFixed },
  };
}

export async function rebuildSitemaps(): Promise<SeoActionResult> {
  const result = await rebuildSitemap();
  await logSeoAction("rebuildSitemaps", "success", result.message, result.details);
  return result;
}

export async function enrichJobPostingSchema(): Promise<SeoActionResult> {
  const jobs = await prisma.job.findMany({
    where: activeJobsWhere(),
    select: {
      slug: true,
      title: true,
      salary: true,
      city: true,
      description: true,
      applicationUrl: true,
      publishedAt: true,
      location: { select: { slug: true } },
      companyRef: { select: { slug: true } },
      tags: { select: { tag: { select: { slug: true } } } },
    },
    take: 2000,
  });

  let enriched = 0;
  let alreadyComplete = 0;

  for (const job of jobs) {
    const resolved = resolveJobPostingSalary({
      salary: job.salary,
      title: job.title,
      city: job.city,
      citySlug: job.location?.slug,
      companySlug: job.companyRef?.slug,
      tags: job.tags.map((t) => t.tag),
      description: job.description,
    });

    const complete = Boolean(
      job.title &&
        job.description &&
        job.applicationUrl &&
        job.publishedAt &&
        resolved.amount
    );

    if (complete) {
      alreadyComplete++;
      continue;
    }

    if (resolved.source !== "none" || job.description.length >= 120) {
      revalidatePath(`/emploi/${job.slug}`);
      enriched++;
    }
  }

  const message = `${enriched} offre(s) revalidée(s) pour schema enrichi. ${alreadyComplete} déjà complètes.`;
  await logSeoAction("enrichJobPostingSchema", "success", message, {
    enriched,
    alreadyComplete,
    total: jobs.length,
  });

  return {
    ok: true,
    message,
    details: { enriched, alreadyComplete, total: jobs.length },
  };
}

export async function fixThinPages(): Promise<SeoActionResult> {
  const locations = await prisma.location.findMany({ select: { slug: true, city: true } });
  let noindexed = 0;

  for (const loc of locations) {
    const count = await getCityJobCount(loc.slug);
    if (count < MIN_JOBS_FOR_CITY_INDEX) {
      revalidatePath(`/emplois/${loc.slug}`);
      noindexed++;
    }
  }

  const landings = getAllLandingSlugCandidates();
  for (const slug of landings) {
    const landing = parseLandingSlug(slug);
    if (!landing) continue;
    const count = await getJobCount(landingToJobFilters(landing));
    if (shouldNoindexLanding(count)) {
      revalidatePath(`/${slug}`);
      noindexed++;
    }
  }

  for (const role of SALARY_ROLES) {
    const count = await prisma.salaryObservation.count({
      where: { titleNorm: role.slug },
    });
    if (shouldNoindexSalaryPage(count, MIN_OBSERVATIONS_FOR_SALARY_INDEX)) {
      revalidatePath(`/${salaryPublicSlug(role.slug)}`);
      noindexed++;
    }
  }

  revalidatePath("/sitemap.xml");

  const message = `${noindexed} page(s) fine(s) revalidée(s) en noindex — aucune page créée.`;
  await logSeoAction("fixThinPages", "success", message, { noindexed });

  return { ok: true, message, details: { noindexed } };
}

export async function runFullGrowthPipeline(): Promise<SeoActionResult> {
  const results = await Promise.all([
    recalculateSalaryObservations(),
    generateMissingCityPages(),
    generateMissingProfessionPages(),
    generateSalaryPages(),
    fixInternalLinks(),
    enrichJobPostingSchema(),
    fixThinPages(),
    rebuildSitemaps(),
  ]);

  const message = "Pipeline SEO growth exécuté — 8 actions terminées.";
  await logSeoAction("runFullGrowthPipeline", "success", message, {
    steps: results.map((r) => r.message),
  });

  return { ok: true, message, details: { steps: results } };
}

export async function executeAutopilotAction(
  action: import("./types").AutopilotActionType,
  targetPath: string
): Promise<import("./types").SeoActionResult> {
  let message = "";
  const path = targetPath.startsWith("/") ? targetPath : `/${targetPath}`;

  switch (action) {
    case "revalidate_page":
      revalidatePath(path);
      message = `Page revalidée : ${path}`;
      break;
    case "refresh_metadata":
      revalidatePath(path);
      message = `Metadata ISR invalidée pour ${path}`;
      break;
    case "add_internal_links":
      await fixInternalLinks();
      revalidatePath(path);
      message = `Maillage interne enrichi + revalidation ${path}`;
      break;
    case "regenerate_content": {
      if (path.startsWith("/emplois/")) {
        const slug = path.replace("/emplois/", "").split("?")[0];
        const content = await generateCityPageContent(slug);
        revalidatePath(path);
        message = content
          ? `Contenu ville régénéré (${content.blocks.length} blocs)`
          : `Revalidation ${path} — seuil non atteint`;
      } else if (path.startsWith("/salaire-")) {
        const roleSlug = path.replace("/salaire-", "");
        const content = await generateSalaryPageContent(roleSlug);
        revalidatePath(path);
        message = content
          ? `Contenu salaire régénéré (${content.blocks.length} blocs)`
          : `Revalidation ${path}`;
      } else if (path.startsWith("/entreprise/")) {
        const slug = path.replace("/entreprise/", "");
        const content = await generateCompanyPageContent(slug);
        revalidatePath(path);
        message = content
          ? `Contenu entreprise régénéré (${content.blocks.length} blocs)`
          : `Revalidation ${path}`;
      } else {
        revalidatePath(path);
        message = `Contenu revalidé : ${path}`;
      }
      break;
    }
    case "regenerate_faq":
      revalidatePath(path);
      message = `FAQ/blocs revalidés : ${path}`;
      break;
    case "rebuild_schema":
      await enrichJobPostingSchema();
      revalidatePath(path);
      message = `Schema JobPosting enrichi + ${path} revalidé`;
      break;
    default:
      return { ok: false, message: "Action autopilot inconnue" };
  }

  await logSeoActionSafe("executeAutopilotAction", "success", message, {
    action,
    targetPath: path,
  });

  return { ok: true, message };
}
