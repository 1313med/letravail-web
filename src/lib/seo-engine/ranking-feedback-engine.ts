import { getSiteUrl } from "../constants";
import { classifyPagePath } from "./gsc-engine";
import { buildJobInternalLinks } from "./internal-links";
import { computePagePerformanceScore, expectedCtrForPosition } from "./page-scoring";
import { getLatestGscPeriod } from "./seo-db";
import { prisma } from "../db";
import type {
  PageType,
  RankingFeedbackReport,
  RankingIssue,
  RankingRecommendation,
} from "./types";

function estimateGain(impressions: number, currentCtr: number, targetCtr: number): number {
  const additionalClicks = impressions * Math.max(0, targetCtr - currentCtr);
  return Math.round(additionalClicks);
}

function detectIssue(
  impressions: number,
  clicks: number,
  ctr: number,
  position: number
): RankingIssue | null {
  const expectedCtr = expectedCtrForPosition(position);

  if (impressions >= 100 && ctr < expectedCtr * 0.5) {
    return "HIGH_IMPRESSIONS_LOW_CLICKS";
  }
  if (impressions >= 50 && ctr < expectedCtr * 0.7) {
    return "LOW_CTR";
  }
  if (position >= 5 && position <= 15 && impressions >= 30) {
    return "LOW_POSITION";
  }
  if (position > 15 && impressions >= 20) {
    return "LOW_POSITION";
  }
  return null;
}

function buildRecommendation(
  pagePath: string,
  pageType: PageType,
  issue: RankingIssue,
  impressions: number,
  clicks: number,
  ctr: number,
  position: number
): RankingRecommendation {
  const expectedCtr = expectedCtrForPosition(position);
  const estimatedGain = estimateGain(impressions, ctr, expectedCtr);
  const actions: RankingRecommendation["actions"] = [];

  let recommendation = "";

  switch (issue) {
    case "LOW_CTR":
      recommendation = `Améliorer title et meta description sur ${pagePath} — CTR ${(ctr * 100).toFixed(1)}% vs ${(expectedCtr * 100).toFixed(1)}% attendu`;
      actions.push("metadata");
      break;
    case "HIGH_IMPRESSIONS_LOW_CLICKS":
      recommendation = `${impressions} impressions mais seulement ${clicks} clics — réécrire snippet SEO et enrichir H1`;
      actions.push("metadata", "content");
      break;
    case "LOW_POSITION":
      recommendation = `Position ${position.toFixed(1)} — zone quick win : enrichir contenu DB, FAQ, et maillage interne`;
      actions.push("content", "internal_links", "revalidate");
      break;
    case "RANKING_DECLINE":
      recommendation = `Perte de ranking détectée — revalider ISR et renforcer liens entrants internes`;
      actions.push("revalidate", "internal_links");
      break;
  }

  return {
    page: pagePath,
    pageType,
    issue,
    recommendation,
    estimatedGain,
    impressions,
    clicks,
    ctr,
    position,
    actions,
  };
}

export async function getRankingFeedbackReport(): Promise<RankingFeedbackReport> {
  const empty: RankingFeedbackReport = {
    pagePerformance: [],
    underperforming: [],
    quickWins: [],
    recommendations: [],
    metadataUpdates: [],
    summary: {
      totalPages: 0,
      underperforming: 0,
      quickWins: 0,
      totalEstimatedGain: 0,
    },
    generatedAt: new Date().toISOString(),
  };

  try {
    const period = await getLatestGscPeriod();
    if (!period) return empty;

    const metrics = await prisma.gscPageMetric.findMany({
      where: {
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
        query: "",
      },
      orderBy: { impressions: "desc" },
      take: 300,
    });

    const pagePerformance = metrics.map((m) => ({
      pagePath: m.pagePath,
      pageType: classifyPagePath(m.pagePath) as PageType,
      impressions: m.impressions,
      clicks: m.clicks,
      ctr: m.ctr,
      position: m.position,
      performanceScore: computePagePerformanceScore(
        m.clicks,
        m.impressions,
        m.position
      ),
    }));

    const recommendations: RankingRecommendation[] = [];

    for (const page of pagePerformance) {
      const issue = detectIssue(
        page.impressions,
        page.clicks,
        page.ctr,
        page.position
      );
      if (!issue) continue;
      recommendations.push(
        buildRecommendation(
          page.pagePath,
          page.pageType,
          issue,
          page.impressions,
          page.clicks,
          page.ctr,
          page.position
        )
      );
    }

    recommendations.sort((a, b) => b.estimatedGain - a.estimatedGain);

    const underperforming = recommendations.filter(
      (r) => r.issue === "HIGH_IMPRESSIONS_LOW_CLICKS" || r.issue === "LOW_CTR"
    );

    const quickWins = recommendations.filter(
      (r) => r.position >= 5 && r.position <= 15
    );

    const metadataUpdates = underperforming.slice(0, 15).map((r) => {
      const label = r.page.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ?? "emploi";
      return {
        page: r.page,
        suggestedTitle: `${label} au Maroc — offres actualisées | Letravail.ma`,
        suggestedDescription: `Découvrez les meilleures offres ${label} au Maroc. Salaires réels, entreprises vérifiées, mises à jour automatiquement sur Letravail.ma.`,
      };
    });

    return {
      pagePerformance: pagePerformance.slice(0, 50),
      underperforming: underperforming.slice(0, 20),
      quickWins: quickWins.slice(0, 15),
      recommendations: recommendations.slice(0, 40),
      metadataUpdates,
      summary: {
        totalPages: pagePerformance.length,
        underperforming: underperforming.length,
        quickWins: quickWins.length,
        totalEstimatedGain: recommendations.reduce(
          (s, r) => s + r.estimatedGain,
          0
        ),
      },
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return empty;
  }
}

export function getRankingFeedbackActions(
  rec: RankingRecommendation
): { action: string; target: string }[] {
  const items: { action: string; target: string }[] = [];

  for (const type of rec.actions) {
    switch (type) {
      case "metadata":
        items.push({
          action: "update_metadata",
          target: rec.page,
        });
        break;
      case "internal_links":
        items.push({
          action: "fix_internal_links",
          target: rec.page,
        });
        break;
      case "content":
        items.push({
          action: "generate_content_blocks",
          target: rec.page,
        });
        break;
      case "revalidate":
        items.push({
          action: "revalidate_path",
          target: rec.page,
        });
        break;
    }
  }

  return items;
}

export async function getInternalLinkRecommendationsForPage(
  pagePath: string
): Promise<string[]> {
  if (!pagePath.startsWith("/emploi/")) return [];

  const slug = pagePath.replace("/emploi/", "");
  const job = await prisma.job.findUnique({
    where: { slug },
    select: {
      title: true,
      company: true,
      city: true,
      contractType: true,
      companyRef: { select: { slug: true } },
      location: { select: { slug: true } },
      tags: { select: { tag: { select: { slug: true, name: true } } } },
    },
  });

  if (!job) return [];

  const links = buildJobInternalLinks({
    title: job.title,
    company: job.company,
    city: job.city,
    contractType: job.contractType,
    companyRef: job.companyRef,
    location: job.location,
    tags: job.tags,
  });

  return links.map((l) => l.href);
}
