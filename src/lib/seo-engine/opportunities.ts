import {
  MIN_JOBS_FOR_CITY_INDEX,
  MIN_JOBS_FOR_LANDING_INDEX,
  MIN_OBSERVATIONS_FOR_SALARY_INDEX,
} from "../constants";
import { prisma } from "../db";
import { shouldNoindexSalaryPage } from "../indexation";
import { sectorLandingSlug } from "../landing-pages";
import { activeJobsWhere, getCityJobCount, activeJobTagWhere, tagHasActiveJobsWhere } from "../queries";
import { SALARY_ROLES, salaryPublicSlug } from "../salary-data";
import { getGscInsightsReport } from "./gsc-engine";
import {
  buildJobInternalLinks,
  detectMissingLinkTypes,
  estimateTrafficGain,
} from "./internal-links";
import type {
  OpportunitiesReport,
  OpportunityPriority,
  SeoOpportunity,
} from "./types";

function priorityFromGain(gain: number): OpportunityPriority {
  if (gain >= 80) return "HIGH";
  if (gain >= 30) return "MEDIUM";
  return "LOW";
}

function sortOpportunities(opps: SeoOpportunity[]): SeoOpportunity[] {
  const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return [...opps].sort(
    (a, b) =>
      order[a.priority] - order[b.priority] ||
      b.estimatedTrafficGain - a.estimatedTrafficGain
  );
}

async function detectCityOpportunities(): Promise<SeoOpportunity[]> {
  const locations = await prisma.location.findMany({
    select: { slug: true, city: true },
  });

  const opportunities: SeoOpportunity[] = [];

  for (const loc of locations) {
    const jobCount = await getCityJobCount(loc.slug);
    if (jobCount < MIN_JOBS_FOR_CITY_INDEX && jobCount >= MIN_JOBS_FOR_CITY_INDEX - 2) {
      const gain = estimateTrafficGain({ jobCount });
      opportunities.push({
        type: "CITY_PAGE",
        priority: priorityFromGain(gain),
        reason: `${loc.city} a ${jobCount} offres — seuil indexation ville = ${MIN_JOBS_FOR_CITY_INDEX}`,
        estimatedTrafficGain: gain,
        requiredAction: `Attendre ${MIN_JOBS_FOR_CITY_INDEX - jobCount} offre(s) supplémentaire(s) avant indexation`,
        targetPath: `/emplois/${loc.slug}`,
        targetLabel: loc.city,
        metadata: { jobCount, threshold: MIN_JOBS_FOR_CITY_INDEX },
      });
    } else if (jobCount >= MIN_JOBS_FOR_CITY_INDEX) {
      const gain = estimateTrafficGain({ jobCount });
      opportunities.push({
        type: "CITY_PAGE",
        priority: "MEDIUM",
        reason: `${loc.city} est indexable (${jobCount} offres) — optimiser maillage interne`,
        estimatedTrafficGain: gain,
        requiredAction: "Renforcer les liens depuis la home et les landings sectorielles",
        targetPath: `/emplois/${loc.slug}`,
        targetLabel: loc.city,
        metadata: { jobCount, indexable: true },
      });
    }
  }

  const orphanCities = await prisma.$queryRaw<{ city: string; count: bigint }[]>`
    SELECT city, COUNT(*)::bigint as count
    FROM jobs
    WHERE "locationId" IS NULL
      AND ( "expiresAt" IS NULL OR "expiresAt" > NOW() )
    GROUP BY city
    HAVING COUNT(*) >= ${MIN_JOBS_FOR_CITY_INDEX}
    ORDER BY count DESC
    LIMIT 20
  `;

  for (const row of orphanCities) {
    const jobCount = Number(row.count);
    const gain = estimateTrafficGain({ jobCount: jobCount * 1.5 });
    opportunities.push({
      type: "CITY_PAGE",
      priority: "HIGH",
      reason: `${row.city} a ${jobCount} offres sans page ville liée (locationId manquant)`,
      estimatedTrafficGain: gain,
      requiredAction: "Backfill Location depuis le scraper ou lier les offres à une ville",
      targetLabel: row.city,
      metadata: { jobCount, orphan: true },
    });
  }

  return opportunities;
}

async function detectProfessionOpportunities(): Promise<SeoOpportunity[]> {
  const taxonomy = await prisma.jobTitleTaxonomy.findMany({
    orderBy: { label: "asc" },
  });

  if (taxonomy.length === 0) {
    const tagCounts = await prisma.tag.findMany({
      where: tagHasActiveJobsWhere(),
      select: {
        name: true,
        slug: true,
        _count: { select: { jobs: { where: activeJobTagWhere() } } },
      },
      orderBy: { jobs: { _count: "desc" } },
      take: 15,
    });

    return tagCounts
      .filter((t) => t._count.jobs >= MIN_JOBS_FOR_LANDING_INDEX)
      .map((tag) => {
        const gain = estimateTrafficGain({ jobCount: tag._count.jobs });
        return {
          type: "PROFESSION_PAGE" as const,
          priority: priorityFromGain(gain),
          reason: `Secteur ${tag.name} avec ${tag._count.jobs} offres — landing ${sectorLandingSlug(tag.slug)}`,
          estimatedTrafficGain: gain,
          requiredAction: "Vérifier indexation landing sectorielle et enrichir contenu",
          targetPath: `/${sectorLandingSlug(tag.slug)}`,
          targetLabel: tag.name,
          metadata: { jobCount: tag._count.jobs, source: "tags" },
        };
      });
  }

  const opportunities: SeoOpportunity[] = [];

  for (const entry of taxonomy) {
    const keywords = entry.keywords.length > 0 ? entry.keywords : [entry.label];
    const titleOr = keywords.map((kw) => ({
      title: { contains: kw, mode: "insensitive" as const },
    }));

    const jobCount = await prisma.job.count({
      where: { AND: [activeJobsWhere(), { OR: titleOr }] },
    });

    if (jobCount < MIN_JOBS_FOR_LANDING_INDEX) continue;

    const landingPath = entry.sectorSlug
      ? `/${sectorLandingSlug(entry.sectorSlug)}`
      : `/emplois?q=${encodeURIComponent(entry.label)}`;

    const gain = estimateTrafficGain({ jobCount });
    opportunities.push({
      type: "PROFESSION_PAGE",
      priority: priorityFromGain(gain),
      reason: `Métier « ${entry.label} » : ${jobCount} offres actives au Maroc`,
      estimatedTrafficGain: gain,
      requiredAction:
        jobCount >= MIN_JOBS_FOR_LANDING_INDEX
          ? `Activer landing profession via ${landingPath}`
          : "En attente du seuil de 3 offres minimum",
      targetPath: landingPath,
      targetLabel: entry.label,
      metadata: { jobCount, taxonomySlug: entry.slug, sectorSlug: entry.sectorSlug },
    });
  }

  return opportunities;
}

async function detectSalaryOpportunities(): Promise<SeoOpportunity[]> {
  const obsGroups = await prisma.salaryObservation.groupBy({
    by: ["titleNorm", "citySlug"],
    _count: { _all: true },
    where: { citySlug: { not: null } },
  });

  const roleCityMap = new Map<string, number>();
  for (const g of obsGroups) {
    const key = `${g.titleNorm}::${g.citySlug}`;
    roleCityMap.set(key, g._count._all);
  }

  const roleTotals = await prisma.salaryObservation.groupBy({
    by: ["titleNorm"],
    _count: { _all: true },
  });
  const roleCountMap = new Map(roleTotals.map((r) => [r.titleNorm, r._count._all]));

  const opportunities: SeoOpportunity[] = [];

  for (const role of SALARY_ROLES) {
    const count = roleCountMap.get(role.slug) ?? 0;
    const indexable = !shouldNoindexSalaryPage(count, MIN_OBSERVATIONS_FOR_SALARY_INDEX);

    if (!indexable && count > 0) {
      const gain = estimateTrafficGain({ observationCount: count });
      opportunities.push({
        type: "SALARY_PAGE",
        priority: count >= MIN_OBSERVATIONS_FOR_SALARY_INDEX - 2 ? "HIGH" : "MEDIUM",
        reason: `Page salaire ${role.title} : ${count}/${MIN_OBSERVATIONS_FOR_SALARY_INDEX} observations`,
        estimatedTrafficGain: gain,
        requiredAction: `Synchroniser observations — ${MIN_OBSERVATIONS_FOR_SALARY_INDEX - count} manquante(s)`,
        targetPath: `/${salaryPublicSlug(role.slug)}`,
        targetLabel: role.title,
        metadata: { observationCount: count, threshold: MIN_OBSERVATIONS_FOR_SALARY_INDEX },
      });
    }

    for (const [key, obsCount] of Array.from(roleCityMap.entries())) {
      const [titleNorm, citySlug] = key.split("::");
      if (titleNorm !== role.slug) continue;
      if (obsCount >= MIN_OBSERVATIONS_FOR_SALARY_INDEX) {
        const gain = estimateTrafficGain({ observationCount: obsCount, jobCount: obsCount });
        opportunities.push({
          type: "SALARY_PAGE",
          priority: "MEDIUM",
          reason: `Combo ${role.title} × ${citySlug} : ${obsCount} observations (données riches)`,
          estimatedTrafficGain: gain,
          requiredAction:
            "Enrichir page salaire nationale avec données ville — pas de page combo tant que seuil national OK",
          targetPath: `/${salaryPublicSlug(role.slug)}`,
          targetLabel: `${role.title} — ${citySlug}`,
          metadata: { citySlug, observationCount: obsCount, combo: true },
        });
      }
    }
  }

  return opportunities;
}

async function detectLinkingOpportunities(): Promise<SeoOpportunity[]> {
  const jobs = await prisma.job.findMany({
    where: activeJobsWhere(),
    select: {
      id: true,
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
    take: 500,
  });

  const opportunities: SeoOpportunity[] = [];
  let missingCount = 0;

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

    const expected = buildJobInternalLinks(ctx);
    const legacyHrefs: string[] = [];
    if (job.location?.slug) legacyHrefs.push(`/emplois/${job.location.slug}`);
    for (const tag of job.tags.slice(0, 1)) {
      legacyHrefs.push(`/${sectorLandingSlug(tag.tag.slug)}`);
    }

    const missing = detectMissingLinkTypes(ctx, legacyHrefs);
    if (missing.length === 0) continue;

    missingCount++;
    if (opportunities.length >= 40) continue;

    const gain = estimateTrafficGain({ missingLinkCount: missing.length });
    opportunities.push({
      type: "LINKING",
      priority: missing.includes("company") || missing.includes("salary") ? "HIGH" : "MEDIUM",
      reason: `Offre « ${job.title} » — liens manquants : ${missing.join(", ")}`,
      estimatedTrafficGain: gain,
      requiredAction: "Exécuter fixInternalLinks() pour enrichir Related Searches",
      targetPath: `/emploi/${job.slug}`,
      targetLabel: job.title,
      metadata: { jobId: job.id, missingLinks: missing, expectedLinkCount: expected.length },
    });
  }

  if (missingCount > 40) {
    opportunities.unshift({
      type: "LINKING",
      priority: "HIGH",
      reason: `${missingCount} offres sur 500 analysées ont un maillage interne incomplet`,
      estimatedTrafficGain: estimateTrafficGain({ missingLinkCount: missingCount }),
      requiredAction: "Lancer fixInternalLinks() en lot + revalidation ISR",
      metadata: { totalMissing: missingCount, sampled: 500 },
    });
  }

  return opportunities;
}

async function detectRankingOpportunities(): Promise<SeoOpportunity[]> {
  const gsc = await getGscInsightsReport();
  if (!gsc.configured) return [];

  const opportunities: SeoOpportunity[] = [];

  for (const page of gsc.underperforming.slice(0, 15)) {
    opportunities.push({
      type: "RANKING",
      priority: page.impressions >= 500 ? "HIGH" : "MEDIUM",
      reason: `CTR faible (${(page.ctr * 100).toFixed(1)}%) malgré ${page.impressions} impressions — pos. ${page.position.toFixed(1)}`,
      estimatedTrafficGain: estimateTrafficGain({ impressions: page.impressions }),
      requiredAction: "Améliorer title/meta description et profondeur de contenu",
      targetPath: page.pagePath,
      targetLabel: page.pagePath,
      metadata: {
        clicks: page.clicks,
        impressions: page.impressions,
        ctr: page.ctr,
        position: page.position,
        performanceScore: page.performanceScore,
      },
    });
  }

  for (const page of gsc.highPotential.slice(0, 10)) {
    opportunities.push({
      type: "RANKING",
      priority: "HIGH",
      reason: `Fort potentiel : position ${page.position.toFixed(1)} avec ${page.impressions} impressions`,
      estimatedTrafficGain: estimateTrafficGain({
        impressions: page.impressions * 1.5,
      }),
      requiredAction: "Renforcer contenu + liens internes pour passer top 3",
      targetPath: page.pagePath,
      targetLabel: page.pagePath,
      metadata: { performanceScore: page.performanceScore },
    });
  }

  return opportunities;
}

export async function getOpportunitiesReport(): Promise<OpportunitiesReport> {
  const [city, profession, salary, linking, ranking] = await Promise.all([
    detectCityOpportunities(),
    detectProfessionOpportunities(),
    detectSalaryOpportunities(),
    detectLinkingOpportunities(),
    detectRankingOpportunities(),
  ]);

  const opportunities = sortOpportunities([
    ...city,
    ...profession,
    ...salary,
    ...linking,
    ...ranking,
  ]);

  const quickWins = opportunities.filter(
    (o) =>
      o.priority === "HIGH" &&
      (o.type === "LINKING" ||
        o.type === "SALARY_PAGE" ||
        (o.type === "RANKING" && (o.metadata?.impressions as number) > 100))
  );

  const highPotential = opportunities.filter(
    (o) => o.estimatedTrafficGain >= 50 || o.type === "RANKING"
  );

  const high = opportunities.filter((o) => o.priority === "HIGH").length;
  const medium = opportunities.filter((o) => o.priority === "MEDIUM").length;
  const low = opportunities.filter((o) => o.priority === "LOW").length;

  return {
    opportunities: opportunities.slice(0, 80),
    quickWins: quickWins.slice(0, 12),
    highPotential: highPotential.slice(0, 15),
    summary: {
      total: opportunities.length,
      high,
      medium,
      low,
      totalEstimatedGain: opportunities.reduce(
        (s, o) => s + o.estimatedTrafficGain,
        0
      ),
    },
    generatedAt: new Date().toISOString(),
  };
}

export function buildGrowthForecast(
  opportunities: SeoOpportunity[]
): {
  action: string;
  priority: OpportunityPriority;
  estimatedTrafficGain: number;
  effort: "low" | "medium" | "high";
}[] {
  const actionMap = new Map<
    string,
    { gain: number; priority: OpportunityPriority; effort: "low" | "medium" | "high" }
  >();

  for (const opp of opportunities) {
    const key = opp.requiredAction.split("—")[0].trim().slice(0, 60);
    const existing = actionMap.get(key);
    const effort: "low" | "medium" | "high" =
      opp.type === "LINKING" ? "low" : opp.type === "RANKING" ? "medium" : "high";

    if (existing) {
      existing.gain += opp.estimatedTrafficGain;
      if (opp.priority === "HIGH") existing.priority = "HIGH";
    } else {
      actionMap.set(key, {
        gain: opp.estimatedTrafficGain,
        priority: opp.priority,
        effort,
      });
    }
  }

  return Array.from(actionMap.entries())
    .map(([action, data]) => ({
      action,
      priority: data.priority,
      estimatedTrafficGain: data.gain,
      effort: data.effort,
    }))
    .sort((a, b) => b.estimatedTrafficGain - a.estimatedTrafficGain)
    .slice(0, 10);
}
