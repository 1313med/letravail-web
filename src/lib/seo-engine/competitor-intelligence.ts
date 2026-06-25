import {
  MIN_JOBS_FOR_CITY_INDEX,
  MIN_JOBS_FOR_LANDING_INDEX,
  MIN_OBSERVATIONS_FOR_SALARY_INDEX,
} from "../constants";
import { prisma } from "../db";
import { shouldNoindexSalaryPage } from "../indexation";
import { activeJobsWhere, getCityJobCount, tagHasActiveJobsWhere, activeJobTagWhere } from "../queries";
import { SALARY_ROLES } from "../salary-data";
import {
  buildPageIndex,
  classifyKeywordIntent,
  mapKeywordToPage,
} from "./keyword-intelligence";
import {
  countSerpIntelligenceRecords,
  createSerpIntelligenceRecord,
  getLatestGscPeriod,
  getLatestSerpCaptureAt,
} from "./seo-db";
import { Prisma } from "@prisma/client";
import type {
  CompetitorGap,
  CompetitorIntelligenceReport,
  CompetitorName,
  CompetitorSerpLayer,
  CompetitorStructureGap,
  SerpOpportunityClass,
  SerpProviderCapabilities,
  SerpProviderId,
  SerpProviderStatus,
} from "./types";

const COMPETITOR_INTENT_MAP: Record<string, CompetitorName> = {
  CITY: "Emploi.ma",
  SALARY: "ReKrute",
  COMPANY: "Indeed Morocco",
  PROFESSION: "ReKrute",
  GENERAL: "Emploi.ma",
};

function classifySerpOpportunity(
  impressions: number,
  ourPosition: number | null,
  intent: string
): SerpOpportunityClass {
  if (intent === "SALARY" || intent === "COMPANY") return "STRATEGIC";
  if (ourPosition != null && ourPosition >= 4 && ourPosition <= 10) return "EASY_WIN";
  if (impressions >= 100) return "HIGH_VALUE";
  return "EASY_WIN";
}

function inferGapType(
  mappedPage: string | null,
  ourPosition: number | null
): CompetitorGap["gapType"] {
  if (!mappedPage) return "MISSING_PAGE";
  if (ourPosition != null && ourPosition > 10) return "RANKING_LOSS";
  return "CONTENT_WEAKNESS";
}

function priorityFromGap(
  gapType: CompetitorGap["gapType"],
  impressions: number
): CompetitorGap["priority"] {
  if (gapType === "MISSING_PAGE" && impressions >= 50) return "HIGH";
  if (gapType === "RANKING_LOSS" && impressions >= 30) return "HIGH";
  if (impressions >= 20) return "MEDIUM";
  return "LOW";
}

async function analyzeStructureGaps(): Promise<CompetitorStructureGap[]> {
  const [cityCount, salaryCount, companyCount, tagCount] = await Promise.all([
    prisma.location.count(),
    prisma.salaryObservation
      .groupBy({ by: ["titleNorm"], _count: { _all: true } })
      .then((groups) =>
        groups.filter((g) => g._count._all >= MIN_OBSERVATIONS_FOR_SALARY_INDEX).length
      ),
    prisma.company.count({ where: { jobs: { some: activeJobsWhere() } } }),
    prisma.tag.count({ where: tagHasActiveJobsWhere() }),
  ]);

  let indexableCities = 0;
  const locations = await prisma.location.findMany({ select: { slug: true } });
  for (const loc of locations) {
    const count = await getCityJobCount(loc.slug);
    if (count >= MIN_JOBS_FOR_CITY_INDEX) indexableCities++;
  }

  return [
    {
      pageType: "city",
      ourCount: indexableCities,
      competitorStrength: "Emploi.ma",
      gapDescription: `Emploi.ma couvre toutes les grandes villes — nous avons ${indexableCities} villes indexables (≥${MIN_JOBS_FOR_CITY_INDEX} offres)`,
      priority: indexableCities < 8 ? "HIGH" : "MEDIUM",
    },
    {
      pageType: "salary",
      ourCount: salaryCount,
      competitorStrength: "ReKrute",
      gapDescription: `ReKrute publie des guides salaire — nous avons ${salaryCount}/${SALARY_ROLES.length} pages salaire indexables`,
      priority: salaryCount < 5 ? "HIGH" : "MEDIUM",
    },
    {
      pageType: "company",
      ourCount: companyCount,
      competitorStrength: "Indeed Morocco",
      gapDescription: `Indeed domine les pages employeur — nous avons ${companyCount} pages entreprise actives`,
      priority: "MEDIUM",
    },
    {
      pageType: "profession",
      ourCount: tagCount,
      competitorStrength: "ReKrute",
      gapDescription: `ReKrute segmente par métier — nous avons ${tagCount} secteurs avec offres actives (landings ≥${MIN_JOBS_FOR_LANDING_INDEX})`,
      priority: tagCount < 8 ? "HIGH" : "LOW",
    },
  ];
}

export async function getCompetitorIntelligenceReport(): Promise<CompetitorIntelligenceReport> {
  const pageIndex = await buildPageIndex();
  const structureGaps = await analyzeStructureGaps();
  const gaps: CompetitorGap[] = [];

  const period = await getLatestGscPeriod();
  if (period) {
    const queries = await prisma.gscQueryMetric.findMany({
      where: { periodStart: period.periodStart, periodEnd: period.periodEnd },
      orderBy: { impressions: "desc" },
      take: 200,
    });

    for (const q of queries) {
      const intent = classifyKeywordIntent(q.query);
      const mappedPage = mapKeywordToPage(q.query, pageIndex);
      const ourPosition = q.position;
      const gapType = inferGapType(mappedPage, ourPosition);
      const competitor = COMPETITOR_INTENT_MAP[intent] ?? "Emploi.ma";

      gaps.push({
        keyword: q.query,
        competitor,
        theirPosition: null,
        ourPosition,
        gapType,
        priority: priorityFromGap(gapType, q.impressions),
        serpClass: classifySerpOpportunity(q.impressions, ourPosition, intent),
        recommendedPage: mappedPage,
        reason:
          gapType === "MISSING_PAGE"
            ? `Aucune page forte pour « ${q.query} » (${q.impressions} impressions)`
            : `Position ${ourPosition.toFixed(1)} — concurrent ${competitor} typiquement fort sur intent ${intent}`,
      });
    }
  }

  if (gaps.length === 0) {
    for (const entry of pageIndex.slice(0, 30)) {
      for (const kw of entry.keywords.slice(0, 1)) {
        const intent = classifyKeywordIntent(kw);
        gaps.push({
          keyword: kw,
          competitor: COMPETITOR_INTENT_MAP[intent] ?? "Emploi.ma",
          theirPosition: null,
          ourPosition: null,
          gapType: "CONTENT_WEAKNESS",
          priority: "MEDIUM",
          serpClass: intent === "SALARY" ? "STRATEGIC" : "HIGH_VALUE",
          recommendedPage: entry.path,
          reason: `Couverture à renforcer vs ${COMPETITOR_INTENT_MAP[intent]} — données GSC non disponibles`,
        });
      }
    }
  }

  gaps.sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return order[a.priority] - order[b.priority];
  });

  return {
    gaps: gaps.slice(0, 60),
    structureGaps,
    summary: {
      totalGaps: gaps.length,
      highPriority: gaps.filter((g) => g.priority === "HIGH").length,
      missingPages: gaps.filter((g) => g.gapType === "MISSING_PAGE").length,
      rankingLosses: gaps.filter((g) => g.gapType === "RANKING_LOSS").length,
    },
    dataNote:
      "theirPosition=null : positions concurrents non suivies (pas de SERP API). Analyse basée sur GSC réel + structure de couverture.",
    generatedAt: new Date().toISOString(),
  };
}

const PROVIDER_CAPS: Record<SerpProviderId, SerpProviderCapabilities> = {
  dataforseo: {
    keywordGapAnalysis: true,
    serpOwnership: true,
    competitorRankings: true,
    attackOpportunities: true,
  },
  ahrefs: {
    keywordGapAnalysis: true,
    serpOwnership: true,
    competitorRankings: true,
    attackOpportunities: true,
  },
  semrush: {
    keywordGapAnalysis: true,
    serpOwnership: true,
    competitorRankings: true,
    attackOpportunities: false,
  },
  gsc: {
    keywordGapAnalysis: true,
    serpOwnership: false,
    competitorRankings: false,
    attackOpportunities: true,
  },
};

function isProviderConfigured(id: SerpProviderId): boolean {
  switch (id) {
    case "dataforseo":
      return Boolean(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD);
    case "ahrefs":
      return Boolean(process.env.AHREFS_API_TOKEN);
    case "semrush":
      return Boolean(process.env.SEMRUSH_API_KEY);
    case "gsc":
      return Boolean(
        process.env.GSC_SERVICE_ACCOUNT_EMAIL && process.env.GSC_PRIVATE_KEY
      );
  }
}

export async function getCompetitorSerpLayer(): Promise<CompetitorSerpLayer> {
  const storedRecords = await countSerpIntelligenceRecords();
  const lastSync = await getLatestSerpCaptureAt();

  const providerIds: SerpProviderId[] = ["dataforseo", "ahrefs", "semrush", "gsc"];
  const providers: SerpProviderStatus[] = providerIds.map((id) => ({
    id,
    name: id === "gsc" ? "Google Search Console" : id.charAt(0).toUpperCase() + id.slice(1),
    configured: isProviderConfigured(id),
    lastSyncAt: id === "gsc" && lastSync ? lastSync.toISOString() : null,
    recordCount: id === "gsc" ? storedRecords : 0,
  }));

  const anySerpProvider = providers.some(
    (p) => p.id !== "gsc" && p.configured
  );

  return {
    providers,
    capabilities: PROVIDER_CAPS,
    storedRecords,
    readyForRealSerp: anySerpProvider && storedRecords > 0,
    dataNote: anySerpProvider
      ? "Provider configuré — prêt pour ingestion SERP réelle."
      : "Connectez DataForSEO, Ahrefs ou SEMrush pour débloquer rankings concurrents réels. Aucune position inventée.",
  };
}

/** Future: ingest provider payload into SerpIntelligenceRecord */
export async function ingestSerpProviderRecords(
  provider: SerpProviderId,
  rows: {
    keyword: string;
    pagePath?: string;
    ourPosition?: number;
    competitorDomain?: string;
    competitorPosition?: number;
    searchVolume?: number;
    raw?: Record<string, unknown>;
  }[]
) {
  let inserted = 0;
  for (const row of rows) {
    await createSerpIntelligenceRecord({
      provider,
      keyword: row.keyword,
      pagePath: row.pagePath ?? null,
      ourPosition: row.ourPosition ?? null,
      competitorDomain: row.competitorDomain ?? null,
      competitorPosition: row.competitorPosition ?? null,
      searchVolume: row.searchVolume ?? null,
      raw: (row.raw ?? {}) as Prisma.InputJsonValue,
    });
    inserted++;
  }
  return { inserted };
}
