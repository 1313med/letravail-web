import { getSiteUrl, MIN_OBSERVATIONS_FOR_SALARY_INDEX } from "../constants";
import { prisma } from "../db";
import {
  shouldNoindexLanding,
  shouldNoindexSalaryPage,
} from "../indexation";
import { resolveJobPostingSalary } from "../job-salary-schema";
import {
  getAllLandingSlugCandidates,
  landingToJobFilters,
  parseLandingSlug,
} from "../landing-pages";
import { activeJobsWhere, getCityJobCount, getJobCount } from "../queries";
import { SALARY_ROLES, salaryPublicSlug } from "../salary-data";
import { isJobExpired } from "../utils";
import {
  computeQualityScore,
  computeRiskScore,
  isThinPage,
  riskLevelFromScore,
  riskLabelFromScore,
  signalStrength,
} from "./scoring";
import type {
  GoogleJobsHealth,
  IndexationReport,
  IndexationRow,
  IndexStatus,
  PageQualityStats,
  SeoRiskReport,
} from "./types";

const JOB_SAMPLE_LIMIT = 300;

function buildUrl(path: string): string {
  return `${getSiteUrl()}${path}`;
}

async function buildCityRows(): Promise<IndexationRow[]> {
  const locations = await prisma.location.findMany({
    select: { slug: true, city: true },
    orderBy: { city: "asc" },
  });

  const rows: IndexationRow[] = [];

  for (const loc of locations) {
    const jobCount = await getCityJobCount(loc.slug);
    const indexStatus: IndexStatus = jobCount >= 5 ? "index" : "noindex";
    const hasSalaryData = jobCount > 0;
    const qualityScore = computeQualityScore({
      pageType: "city",
      indexStatus,
      jobCount,
      hasSalaryData,
    });
    const thin = isThinPage({ pageType: "city", jobCount });

    if (jobCount > 0 || thin) {
      rows.push({
        pageType: "city",
        label: loc.city,
        url: buildUrl(`/emplois/${loc.slug}`),
        indexStatus,
        jobCount,
        hasSalaryData,
        qualityScore,
        riskLevel: riskLevelFromScore(qualityScore),
        isThin: thin,
      });
    }
  }

  return rows;
}

async function buildLandingRows(): Promise<IndexationRow[]> {
  const candidates = getAllLandingSlugCandidates();

  const rows: IndexationRow[] = [];

  for (const slug of candidates) {
    const landing = parseLandingSlug(slug);
    if (!landing) continue;

    const jobCount = await getJobCount(landingToJobFilters(landing));
    const indexStatus: IndexStatus = shouldNoindexLanding(jobCount)
      ? "noindex"
      : "index";
    const hasSalaryData = jobCount > 0;
    const qualityScore = computeQualityScore({
      pageType: "landing",
      indexStatus,
      jobCount,
      hasSalaryData,
    });

    rows.push({
      pageType: "landing",
      label: slug,
      url: buildUrl(`/${slug}`),
      indexStatus,
      jobCount,
      hasSalaryData,
      qualityScore,
      riskLevel: riskLevelFromScore(qualityScore),
      isThin: isThinPage({ pageType: "landing", jobCount }),
    });
  }

  return rows;
}

async function buildSalaryRows(): Promise<IndexationRow[]> {
  const counts = await prisma.salaryObservation.groupBy({
    by: ["titleNorm"],
    _count: { _all: true },
  });
  const countMap = new Map(counts.map((c) => [c.titleNorm, c._count._all]));

  return SALARY_ROLES.map((role) => {
    const observationCount = countMap.get(role.slug) ?? 0;
    const noindex = shouldNoindexSalaryPage(
      observationCount,
      MIN_OBSERVATIONS_FOR_SALARY_INDEX
    );
    const indexStatus: IndexStatus = noindex ? "noindex" : "index";
    const hasSalaryData = observationCount > 0;
    const qualityScore = computeQualityScore({
      pageType: "salary",
      indexStatus,
      jobCount: observationCount,
      hasSalaryData,
    });

    return {
      pageType: "salary" as const,
      label: role.title,
      url: buildUrl(`/${salaryPublicSlug(role.slug)}`),
      indexStatus,
      jobCount: observationCount,
      hasSalaryData,
      qualityScore,
      riskLevel: riskLevelFromScore(qualityScore),
      isThin: isThinPage({
        pageType: "salary",
        jobCount: 0,
        observationCount,
      }),
    };
  });
}

async function buildCompanyRows(): Promise<IndexationRow[]> {
  const companies = await prisma.company.findMany({
    select: {
      name: true,
      slug: true,
      _count: {
        select: {
          jobs: { where: activeJobsWhere() },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return companies
    .filter((c) => c._count.jobs > 0)
    .map((company) => {
      const jobCount = company._count.jobs;
      const indexStatus = "index" as const;
      const qualityScore = computeQualityScore({
        pageType: "company",
        indexStatus,
        jobCount,
        hasSalaryData: true,
      });

      return {
        pageType: "company" as const,
        label: company.name,
        url: buildUrl(`/entreprise/${company.slug}`),
        indexStatus,
        jobCount,
        hasSalaryData: true,
        qualityScore,
        riskLevel: riskLevelFromScore(qualityScore),
        isThin: isThinPage({ pageType: "company", jobCount }),
      };
    });
}

async function buildJobRows(): Promise<IndexationRow[]> {
  const jobs = await prisma.job.findMany({
    where: activeJobsWhere(),
    select: {
      slug: true,
      title: true,
      description: true,
      salary: true,
      applicationUrl: true,
      publishedAt: true,
      expiresAt: true,
      city: true,
      location: { select: { slug: true } },
      companyRef: { select: { slug: true } },
      tags: { select: { tag: { select: { slug: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: JOB_SAMPLE_LIMIT,
  });

  return jobs.map((job) => {
    const expired = isJobExpired(job.expiresAt);
    const indexStatus: IndexStatus = expired ? "noindex" : "index";
    const salaryResolved = resolveJobPostingSalary({
      salary: job.salary,
      title: job.title,
      city: job.city,
      citySlug: job.location?.slug,
      companySlug: job.companyRef?.slug,
      tags: job.tags.map((t) => t.tag),
      description: job.description,
    });
    const hasSalaryData = salaryResolved.source !== "none";
    const schemaComplete = Boolean(
      job.title &&
        job.description &&
        job.applicationUrl &&
        job.publishedAt
    );
    const qualityScore = computeQualityScore({
      pageType: "job",
      indexStatus,
      jobCount: 1,
      hasSalaryData,
      schemaComplete,
      descriptionLength: job.description?.length ?? 0,
    });

    return {
      pageType: "job" as const,
      label: job.title,
      url: buildUrl(`/emploi/${job.slug}`),
      indexStatus,
      jobCount: 1,
      hasSalaryData,
      qualityScore,
      riskLevel: riskLevelFromScore(qualityScore),
      isThin: isThinPage({
        pageType: "job",
        jobCount: 1,
        descriptionLength: job.description?.length ?? 0,
      }),
    };
  });
}

export async function getIndexationReport(): Promise<IndexationReport> {
  const [cities, landings, salaries, companies, jobs] = await Promise.all([
    buildCityRows(),
    buildLandingRows(),
    buildSalaryRows(),
    buildCompanyRows(),
    buildJobRows(),
  ]);

  const rows = [...cities, ...landings, ...salaries, ...companies, ...jobs];

  return {
    rows,
    summary: {
      total: rows.length,
      indexed: rows.filter((r) => r.indexStatus === "index").length,
      noindexed: rows.filter((r) => r.indexStatus === "noindex").length,
      thin: rows.filter((r) => r.isThin).length,
      highRisk: rows.filter((r) => r.riskLevel === "high").length,
    },
    generatedAt: new Date().toISOString(),
  };
}

export async function getGoogleJobsHealth(): Promise<GoogleJobsHealth> {
  const [activeJobs, expiredCount] = await Promise.all([
    prisma.job.findMany({
      where: activeJobsWhere(),
      select: {
        slug: true,
        title: true,
        description: true,
        salary: true,
        applicationUrl: true,
        publishedAt: true,
        expiresAt: true,
        city: true,
        remote: true,
        contractType: true,
        location: { select: { slug: true } },
        companyRef: { select: { slug: true } },
        tags: { select: { tag: { select: { slug: true } } } },
      },
    }),
    prisma.job.count({
      where: { expiresAt: { lt: new Date() } },
    }),
  ]);

  let validSchema = 0;
  let missingBaseSalary = 0;
  let estimatedSalary = 0;
  let hasScrapedSalary = 0;
  let missingSalary = 0;
  let emptyDescription = 0;
  let shortDescription = 0;
  let missingApplicationUrl = 0;
  let missingPublishedAt = 0;

  for (const job of activeJobs) {
    const salaryResolved = resolveJobPostingSalary({
      salary: job.salary,
      title: job.title,
      city: job.city,
      citySlug: job.location?.slug,
      companySlug: job.companyRef?.slug,
      tags: job.tags.map((t) => t.tag),
      description: job.description,
    });

    const hasRequiredFields = Boolean(
      job.title && job.description && job.applicationUrl && job.city
    );
    const hasDate = Boolean(job.publishedAt);

    if (hasRequiredFields && hasDate) validSchema++;

    if (salaryResolved.source === "scraped") hasScrapedSalary++;
    else if (salaryResolved.source === "estimated") estimatedSalary++;
    else missingSalary++;

    if (salaryResolved.source !== "scraped") missingBaseSalary++;

    if (!job.description) emptyDescription++;
    else if (job.description.length < 100) shortDescription++;

    if (!job.applicationUrl) missingApplicationUrl++;
    if (!job.publishedAt) missingPublishedAt++;
  }

  const total = activeJobs.length || 1;
  const pct = (n: number) => Math.round((n / total) * 1000) / 10;

  const errorsByCategory = [
    {
      category: "Valid JobPosting schema",
      severity: "healthy" as const,
      count: validSchema,
      pct: pct(validSchema),
    },
    {
      category: "Missing baseSalary (scraped)",
      severity: "warning" as const,
      count: missingBaseSalary,
      pct: pct(missingBaseSalary),
    },
    {
      category: "Using estimatedSalary",
      severity: "warning" as const,
      count: estimatedSalary,
      pct: pct(estimatedSalary),
    },
    {
      category: "No salary in schema",
      severity: "critical" as const,
      count: missingSalary,
      pct: pct(missingSalary),
    },
    {
      category: "Missing applicationUrl",
      severity: "critical" as const,
      count: missingApplicationUrl,
      pct: pct(missingApplicationUrl),
    },
    {
      category: "Missing datePosted",
      severity: "warning" as const,
      count: missingPublishedAt,
      pct: pct(missingPublishedAt),
    },
    {
      category: "Empty description",
      severity: "critical" as const,
      count: emptyDescription,
      pct: pct(emptyDescription),
    },
    {
      category: "Thin description (<100 chars)",
      severity: "warning" as const,
      count: shortDescription,
      pct: pct(shortDescription),
    },
    {
      category: "Has scraped baseSalary",
      severity: "healthy" as const,
      count: hasScrapedSalary,
      pct: pct(hasScrapedSalary),
    },
  ].sort((a, b) => {
    const order = { critical: 0, warning: 1, healthy: 2 };
    return order[a.severity] - order[b.severity];
  });

  return {
    totalJobPages: activeJobs.length,
    validSchemaPct: pct(validSchema),
    missingBaseSalaryPct: pct(missingBaseSalary),
    estimatedSalaryPct: pct(estimatedSalary),
    expiredStillIndexed: expiredCount,
    errorsByCategory,
    sampledJobs: activeJobs.length,
  };
}

export async function getSalaryCoverageMatrix() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const [roleGroups, cityGroups, recentByRole, previousByRole, totalObs] =
    await Promise.all([
      prisma.salaryObservation.groupBy({
        by: ["titleNorm"],
        _count: { _all: true },
      }),
      prisma.salaryObservation.groupBy({
        by: ["citySlug"],
        where: { citySlug: { not: null } },
        _count: { _all: true },
      }),
      prisma.salaryObservation.groupBy({
        by: ["titleNorm"],
        where: { observedAt: { gte: thirtyDaysAgo } },
        _count: { _all: true },
      }),
      prisma.salaryObservation.groupBy({
        by: ["titleNorm"],
        where: {
          observedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
        _count: { _all: true },
      }),
      prisma.salaryObservation.count(),
    ]);

  const roleCountMap = new Map(
    roleGroups.map((g) => [g.titleNorm, g._count._all])
  );
  const recentMap = new Map(
    recentByRole.map((g) => [g.titleNorm, g._count._all])
  );
  const prevMap = new Map(
    previousByRole.map((g) => [g.titleNorm, g._count._all])
  );

  const cityRoleCounts = await prisma.salaryObservation.groupBy({
    by: ["citySlug", "titleNorm"],
    where: { citySlug: { not: null } },
    _count: { _all: true },
  });

  const rolesPerCity = new Map<string, Set<string>>();
  for (const row of cityRoleCounts) {
    if (!row.citySlug) continue;
    const set = rolesPerCity.get(row.citySlug) ?? new Set();
    set.add(row.titleNorm);
    rolesPerCity.set(row.citySlug, set);
  }

  const byRole = SALARY_ROLES.map((role) => {
    const observationCount = roleCountMap.get(role.slug) ?? 0;
    const indexable = !shouldNoindexSalaryPage(
      observationCount,
      MIN_OBSERVATIONS_FOR_SALARY_INDEX
    );
    const recent = recentMap.get(role.slug) ?? 0;
    const previous = prevMap.get(role.slug) ?? 0;
    const trendDelta = recent - previous;
    const trend: "up" | "down" | "stable" =
      trendDelta > 0 ? "up" : trendDelta < 0 ? "down" : "stable";

    return {
      roleSlug: role.slug,
      roleTitle: role.title,
      observationCount,
      indexStatus: indexable ? ("index" as const) : ("noindex" as const),
      readiness: indexable
        ? ("READY FOR INDEX" as const)
        : ("NOT READY (needs ≥5 observations)" as const),
      trend,
      trendDelta,
      url: buildUrl(`/${salaryPublicSlug(role.slug)}`),
    };
  });

  const byCity = cityGroups
    .filter((g) => g.citySlug)
    .map((g) => ({
      citySlug: g.citySlug as string,
      observationCount: g._count._all,
      roleCount: rolesPerCity.get(g.citySlug as string)?.size ?? 0,
    }))
    .sort((a, b) => b.observationCount - a.observationCount);

  const indexableCount = byRole.filter((r) => r.indexStatus === "index").length;
  const nonIndexableCount = byRole.length - indexableCount;

  return {
    byRole,
    byCity,
    indexableCount,
    nonIndexableCount,
    totalObservations: totalObs,
  };
}

export async function getPageQualityStats(
  report?: IndexationReport
): Promise<PageQualityStats> {
  const data = report ?? (await getIndexationReport());

  const types = ["city", "landing", "salary", "company", "job"] as const;

  const breakdown = types.map((pageType) => {
    const subset = data.rows.filter((r) => r.pageType === pageType);
    const indexed = subset.filter((r) => r.indexStatus === "index");
    const avgQualityScore =
      subset.length > 0
        ? Math.round(
            subset.reduce((s, r) => s + r.qualityScore, 0) / subset.length
          )
        : 0;

    return {
      pageType,
      totalPages: subset.length,
      indexedPages: indexed.length,
      noindexedPages: subset.length - indexed.length,
      avgQualityScore,
    };
  });

  return {
    breakdown,
    generatedAt: new Date().toISOString(),
  };
}

export async function getSeoRiskReport(
  report?: IndexationReport
): Promise<SeoRiskReport> {
  const data = report ?? (await getIndexationReport());
  const indexableSlugs = new Set(
    data.rows
      .filter((r) => r.indexStatus === "index")
      .map((r) => r.url.replace(getSiteUrl(), ""))
  );

  const items = data.rows.map((row) => {
    const path = row.url.replace(getSiteUrl(), "");
    const signals = {
      duplicateContent: signalStrength(
        row.pageType === "landing" && row.jobCount > 0 && row.jobCount < 5
      ),
      thinContent: signalStrength(row.isThin),
      missingSchema: signalStrength(
        row.pageType === "job" && row.qualityScore < 60
      ),
      lowJobCount: signalStrength(
        (row.pageType === "city" || row.pageType === "landing") &&
          row.jobCount < 10
      ),
      missingSalary: signalStrength(!row.hasSalaryData),
      orphanPage: signalStrength(
        row.indexStatus === "noindex" && !indexableSlugs.has(path)
      ),
    };

    const riskScore = computeRiskScore(signals);

    return {
      pageType: row.pageType,
      label: row.label,
      url: row.url,
      riskScore,
      label_: riskLabelFromScore(riskScore),
      signals,
    };
  });

  items.sort((a, b) => a.riskScore - b.riskScore);

  const safe = items.filter((i) => i.label_ === "SAFE").length;
  const warning = items.filter((i) => i.label_ === "WARNING").length;
  const dangerous = items.filter((i) => i.label_ === "DANGEROUS").length;
  const avgRiskScore =
    items.length > 0
      ? Math.round(items.reduce((s, i) => s + i.riskScore, 0) / items.length)
      : 0;

  return {
    items: items.slice(0, 150),
    summary: { safe, warning, dangerous, avgRiskScore },
    generatedAt: new Date().toISOString(),
  };
}

export async function getDashboardBundle() {
  const [indexation, googleJobs, salary] = await Promise.all([
    getIndexationReport(),
    getGoogleJobsHealth(),
    getSalaryCoverageMatrix(),
  ]);

  const [risk, pageQuality] = await Promise.all([
    getSeoRiskReport(indexation),
    getPageQualityStats(indexation),
  ]);

  return { indexation, googleJobs, salary, risk, pageQuality };
}
