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
import { getLatestGscPeriod } from "./seo-db";
import type {
  KeywordCluster,
  KeywordIntent,
  KeywordIntelligenceReport,
  KeywordOpportunity,
} from "./types";

const GENERAL_PATTERNS = [
  /emploi\s+maroc/i,
  /offre\s+d['']?emploi/i,
  /travail\s+au\s+maroc/i,
  /recrutement\s+maroc/i,
  /job\s+maroc/i,
];

const CITY_PATTERNS = [
  /emploi\s+(.+)/i,
  /offre.*emploi.*(.+)/i,
  /travail\s+(.+)/i,
  /recrutement\s+(.+)/i,
];

const SALARY_PATTERNS = [
  /salaire\s+(.+)/i,
  /rémunération\s+(.+)/i,
  /combien\s+gagne/i,
];

const COMPANY_PATTERNS = [
  /recrutement\s+(.+)/i,
  /emploi\s+(.+)/i,
  /carrière\s+(.+)/i,
  /jobs?\s+(.+)/i,
];

export interface PageIndexEntry {
  path: string;
  label: string;
  pageType: KeywordIntent;
  keywords: string[];
}

export function classifyKeywordIntent(keyword: string): KeywordIntent {
  const lower = keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (SALARY_PATTERNS.some((p) => p.test(lower))) return "SALARY";
  if (GENERAL_PATTERNS.some((p) => p.test(lower))) return "GENERAL";

  const moroccanCities = [
    "casablanca", "rabat", "marrakech", "tanger", "fes", "agadir",
    "meknes", "oujda", "kenitra", "tetouan",
  ];
  if (moroccanCities.some((c) => lower.includes(c))) return "CITY";

  if (COMPANY_PATTERNS.some((p) => p.test(lower))) {
    if (lower.includes("salaire")) return "SALARY";
    return "COMPANY";
  }

  const professionSignals = [
    "developpeur", "développeur", "comptable", "commercial", "ingenieur",
    "ingénieur", "rh", "marketing", "data", "tech", "banque",
  ];
  if (professionSignals.some((s) => lower.includes(s))) return "PROFESSION";

  return "GENERAL";
}

function normalizeKeyword(kw: string): string {
  return kw.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export async function buildPageIndex(): Promise<PageIndexEntry[]> {
  const [locations, companies, roleCounts] = await Promise.all([
    prisma.location.findMany({ select: { city: true, slug: true } }),
    prisma.company.findMany({
      where: { jobs: { some: activeJobsWhere() } },
      select: { name: true, slug: true },
      take: 500,
    }),
    prisma.salaryObservation.groupBy({
      by: ["titleNorm"],
      _count: { _all: true },
    }),
  ]);

  const obsMap = new Map(roleCounts.map((r) => [r.titleNorm, r._count._all]));
  const entries: PageIndexEntry[] = [
    { path: "/emplois", label: "Toutes les offres", pageType: "GENERAL", keywords: ["emploi maroc", "offre emploi maroc"] },
    { path: "/salaires", label: "Salaires", pageType: "SALARY", keywords: ["salaire maroc"] },
  ];

  for (const loc of locations) {
    const count = await getCityJobCount(loc.slug);
    if (count < MIN_JOBS_FOR_CITY_INDEX) continue;
    const cityLower = loc.city.toLowerCase();
    entries.push({
      path: `/emplois/${loc.slug}`,
      label: loc.city,
      pageType: "CITY",
      keywords: [
        `emploi ${cityLower}`,
        `offre emploi ${cityLower}`,
        `travail ${cityLower}`,
        `recrutement ${cityLower}`,
      ],
    });
  }

  for (const role of SALARY_ROLES) {
    const count = obsMap.get(role.slug) ?? 0;
    if (shouldNoindexSalaryPage(count, MIN_OBSERVATIONS_FOR_SALARY_INDEX)) continue;
    const path = `/${salaryPublicSlug(role.slug)}`;
    entries.push({
      path,
      label: role.title,
      pageType: "SALARY",
      keywords: [
        `salaire ${role.title.toLowerCase()} maroc`,
        `salaire ${role.title.toLowerCase()}`,
        `rémunération ${role.title.toLowerCase()}`,
      ],
    });
  }

  for (const company of companies) {
    entries.push({
      path: `/entreprise/${company.slug}`,
      label: company.name,
      pageType: "COMPANY",
      keywords: [
        `recrutement ${company.name.toLowerCase()}`,
        `emploi ${company.name.toLowerCase()}`,
        `carrière ${company.name.toLowerCase()}`,
      ],
    });
  }

  const tags = await prisma.tag.findMany({
    where: tagHasActiveJobsWhere(),
    select: {
      name: true,
      slug: true,
      _count: { select: { jobs: { where: activeJobTagWhere() } } },
    },
    orderBy: { jobs: { _count: "desc" } },
    take: 30,
  });

  for (const tag of tags) {
    if (tag._count.jobs < MIN_JOBS_FOR_LANDING_INDEX) continue;
    const path = `/${sectorLandingSlug(tag.slug)}`;
    entries.push({
      path,
      label: tag.name,
      pageType: "PROFESSION",
      keywords: [
        `emploi ${tag.name.toLowerCase()} maroc`,
        `offre ${tag.name.toLowerCase()} maroc`,
      ],
    });
  }

  return entries;
}

export function mapKeywordToPage(
  keyword: string,
  pageIndex: PageIndexEntry[]
): string | null {
  const norm = normalizeKeyword(keyword);

  for (const entry of pageIndex) {
    if (entry.keywords.some((k) => norm.includes(normalizeKeyword(k)) || normalizeKeyword(k).includes(norm))) {
      return entry.path;
    }
  }

  for (const entry of pageIndex) {
    const labelNorm = normalizeKeyword(entry.label);
    if (norm.includes(labelNorm) || labelNorm.includes(norm)) {
      return entry.path;
    }
  }

  return null;
}

function computeOpportunityScore(params: {
  impressions: number;
  position: number;
  mapped: boolean;
  intent: KeywordIntent;
}): number {
  let score = 0;
  if (params.impressions >= 100) score += 30;
  else if (params.impressions >= 20) score += 15;
  else score += 5;

  if (params.position >= 8 && params.position <= 30) score += 35;
  else if (params.position >= 4 && params.position < 8) score += 25;
  else if (params.position > 30) score += 10;

  if (!params.mapped) score += 25;
  if (params.intent === "SALARY" || params.intent === "CITY") score += 10;

  return Math.min(100, score);
}

function recommendedAction(
  keyword: string,
  intent: KeywordIntent,
  mappedPage: string | null,
  position: number
): string {
  if (!mappedPage) {
    switch (intent) {
      case "CITY":
        return "Créer/activer page ville indexable (≥5 offres) et lier depuis la home";
      case "SALARY":
        return "Enrichir observations salariales (≥5) puis indexer page salaire";
      case "COMPANY":
        return "Vérifier page entreprise + maillage depuis offres actives";
      case "PROFESSION":
        return "Activer landing secteur (≥3 offres) avec contenu enrichi";
      default:
        return "Mapper vers /emplois ou landing sectorielle pertinente";
    }
  }
  if (position >= 8 && position <= 30) {
    return `Optimiser ${mappedPage} : title/meta, contenu DB, liens internes`;
  }
  if (position > 30) {
    return `Renforcer autorité de ${mappedPage} via maillage + contenu`;
  }
  return `Maintenir ${mappedPage} — améliorer CTR si impressions élevées`;
}

async function loadGscKeywords(): Promise<
  { keyword: string; impressions: number; clicks: number; position: number; pagePath: string | null }[]
> {
  const period = await getLatestGscPeriod();
  if (!period) return [];

  const queries = await prisma.gscQueryMetric.findMany({
    where: { periodStart: period.periodStart, periodEnd: period.periodEnd },
    orderBy: { impressions: "desc" },
    take: 500,
  });

  return queries.map((q) => ({
    keyword: q.query,
    impressions: q.impressions,
    clicks: q.clicks,
    position: q.position,
    pagePath: q.pagePath || null,
  }));
}

async function deriveKeywordsFromDb(pageIndex: PageIndexEntry[]): Promise<
  { keyword: string; impressions: number; position: number }[]
> {
  const derived: { keyword: string; impressions: number; position: number }[] = [];

  for (const entry of pageIndex) {
    for (const kw of entry.keywords) {
      derived.push({ keyword: kw, impressions: 0, position: 50 });
    }
  }

  const titles = await prisma.job.groupBy({
    by: ["title"],
    where: activeJobsWhere(),
    _count: { _all: true },
    orderBy: { _count: { title: "desc" } },
    take: 50,
  });

  for (const t of titles) {
    if (t._count._all < 3) continue;
    derived.push({
      keyword: `emploi ${t.title.toLowerCase()} maroc`,
      impressions: t._count._all * 5,
      position: 25,
    });
  }

  return derived;
}

export async function getKeywordIntelligenceReport(): Promise<KeywordIntelligenceReport> {
  const pageIndex = await buildPageIndex();
  const [gscKeywords, dbKeywords] = await Promise.all([
    loadGscKeywords(),
    deriveKeywordsFromDb(pageIndex),
  ]);

  const seen = new Set<string>();
  const opportunities: KeywordOpportunity[] = [];

  const allKeywords = [
    ...gscKeywords.map((k) => ({
      keyword: k.keyword,
      impressions: k.impressions,
      position: k.position,
      gscPage: k.pagePath,
    })),
    ...dbKeywords.map((k) => ({
      keyword: k.keyword,
      impressions: k.impressions,
      position: k.position,
      gscPage: null as string | null,
    })),
  ];

  for (const item of allKeywords) {
    const norm = normalizeKeyword(item.keyword);
    if (seen.has(norm)) continue;
    seen.add(norm);

    const intent = classifyKeywordIntent(item.keyword);
    const mappedPage = mapKeywordToPage(item.keyword, pageIndex);
    const opportunityScore = computeOpportunityScore({
      impressions: item.impressions,
      position: item.position,
      mapped: mappedPage != null,
      intent,
    });

    opportunities.push({
      keyword: item.keyword,
      intent,
      mappedPage,
      impressions: item.impressions,
      position: item.position,
      opportunityScore,
      recommendedAction: recommendedAction(
        item.keyword,
        intent,
        mappedPage,
        item.position
      ),
      source: item.impressions > 0 ? "gsc" : "db",
    });
  }

  opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);

  const clusters: KeywordCluster[] = (
    ["CITY", "SALARY", "COMPANY", "PROFESSION", "GENERAL"] as KeywordIntent[]
  ).map((intent) => {
    const subset = opportunities.filter((o) => o.intent === intent);
    return {
      intent,
      count: subset.length,
      unmapped: subset.filter((o) => !o.mappedPage).length,
      opportunityZone: subset.filter((o) => o.position >= 8 && o.position <= 30).length,
      topKeywords: subset.slice(0, 8),
    };
  });

  const missingLanding = opportunities.filter((o) => !o.mappedPage && o.impressions >= 10);
  const seoZone = opportunities.filter((o) => o.position >= 8 && o.position <= 30);

  return {
    opportunities: opportunities.slice(0, 100),
    clusters,
    missingLandingPages: missingLanding.slice(0, 25),
    seoOpportunityZone: seoZone.slice(0, 25),
    pageIndexCount: pageIndex.length,
    summary: {
      totalKeywords: opportunities.length,
      mapped: opportunities.filter((o) => o.mappedPage).length,
      unmapped: opportunities.filter((o) => !o.mappedPage).length,
      highOpportunity: opportunities.filter((o) => o.opportunityScore >= 60).length,
    },
    generatedAt: new Date().toISOString(),
  };
}
