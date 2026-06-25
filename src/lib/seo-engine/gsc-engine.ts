import { createSign } from "crypto";
import { getSiteUrl } from "../constants";
import { prisma } from "../db";
import type { PageType } from "./types";
import {
  computePagePerformanceScore,
  expectedCtrForPosition,
} from "./page-scoring";
import type { GscInsightsReport, GscPageInsight } from "./types";

export interface GscIngestRow {
  pagePath: string;
  query?: string | null;
  impressions: number;
  clicks: number;
  ctr?: number;
  position: number;
}

export function isGscConfigured(): boolean {
  return Boolean(
    process.env.GSC_SERVICE_ACCOUNT_EMAIL &&
      process.env.GSC_PRIVATE_KEY &&
      (process.env.GSC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL)
  );
}

export function classifyPagePath(pagePath: string): PageType {
  if (pagePath.startsWith("/emploi/")) return "job";
  if (pagePath.startsWith("/emplois/")) return "city";
  if (pagePath.startsWith("/entreprise/")) return "company";
  if (pagePath.startsWith("/salaire-")) return "salary";
  if (pagePath.startsWith("/emploi-")) return "landing";
  return "landing";
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getGoogleAccessToken(): Promise<string> {
  const email = process.env.GSC_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !privateKey) {
    throw new Error("GSC credentials not configured");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );

  const signInput = `${header}.${claim}`;
  const sign = createSign("RSA-SHA256");
  sign.update(signInput);
  const signature = base64url(sign.sign(privateKey));
  const jwt = `${signInput}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`GSC token error: ${err}`);
  }

  const data = (await tokenRes.json()) as { access_token: string };
  return data.access_token;
}

export async function fetchGscAnalytics(
  startDate: string,
  endDate: string
): Promise<GscIngestRow[]> {
  const siteUrl = encodeURIComponent(
    process.env.GSC_SITE_URL || `${getSiteUrl()}/`
  );
  const token = await getGoogleAccessToken();

  const rows: GscIngestRow[] = [];

  for (const dimensions of [["page"], ["query", "page"]] as const) {
    let startRow = 0;
    const rowLimit = 25000;

    while (true) {
      const res = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate,
            endDate,
            dimensions,
            rowLimit,
            startRow,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`GSC API error: ${err}`);
      }

      const data = (await res.json()) as {
        rows?: {
          keys: string[];
          clicks: number;
          impressions: number;
          ctr: number;
          position: number;
        }[];
      };

      if (!data.rows?.length) break;

      for (const row of data.rows) {
        if (dimensions.length === 1) {
          rows.push({
            pagePath: row.keys[0],
            impressions: row.impressions,
            clicks: row.clicks,
            ctr: row.ctr,
            position: row.position,
          });
        } else {
          rows.push({
            query: row.keys[0],
            pagePath: row.keys[1],
            impressions: row.impressions,
            clicks: row.clicks,
            ctr: row.ctr,
            position: row.position,
          });
        }
      }

      if (data.rows.length < rowLimit) break;
      startRow += rowLimit;
    }
  }

  return rows;
}

export async function ingestGscData(
  rows: GscIngestRow[],
  periodStart: Date,
  periodEnd: Date
): Promise<{ pagesStored: number; queriesStored: number }> {
  let pagesStored = 0;
  let queriesStored = 0;

  for (const row of rows) {
    const pagePath = row.pagePath.startsWith("http")
      ? new URL(row.pagePath).pathname
      : row.pagePath;

    const pageType = classifyPagePath(pagePath);
    const ctr = row.ctr ?? (row.impressions > 0 ? row.clicks / row.impressions : 0);

    if (row.query) {
      await prisma.gscQueryMetric.upsert({
        where: {
          query_pagePath_periodStart_periodEnd: {
            query: row.query,
            pagePath,
            periodStart,
            periodEnd,
          },
        },
        create: {
          query: row.query,
          pagePath,
          impressions: row.impressions,
          clicks: row.clicks,
          ctr,
          position: row.position,
          periodStart,
          periodEnd,
        },
        update: {
          impressions: row.impressions,
          clicks: row.clicks,
          ctr,
          position: row.position,
          ingestedAt: new Date(),
        },
      });
      queriesStored++;
    } else {
      await prisma.gscPageMetric.upsert({
        where: {
          pagePath_query_periodStart_periodEnd: {
            pagePath,
            query: "",
            periodStart,
            periodEnd,
          },
        },
        create: {
          pagePath,
          pageType,
          query: "",
          impressions: row.impressions,
          clicks: row.clicks,
          ctr,
          position: row.position,
          periodStart,
          periodEnd,
        },
        update: {
          impressions: row.impressions,
          clicks: row.clicks,
          ctr,
          position: row.position,
          ingestedAt: new Date(),
        },
      });
      pagesStored++;
    }
  }

  return { pagesStored, queriesStored };
}

export async function syncGscFromApi(days = 28): Promise<{
  pagesStored: number;
  queriesStored: number;
}> {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const rows = await fetchGscAnalytics(fmt(start), fmt(end));
  return ingestGscData(rows, start, end);
}

function toPageInsight(
  pagePath: string,
  pageType: PageType,
  impressions: number,
  clicks: number,
  ctr: number,
  position: number
): GscPageInsight {
  const performanceScore = computePagePerformanceScore(
    clicks,
    impressions,
    position
  );
  const expectedCtr = expectedCtrForPosition(position);

  let insight: GscPageInsight["insight"] = "healthy";
  if (impressions >= 100 && ctr < expectedCtr * 0.6) {
    insight = "underperforming";
  } else if (position > 3 && position <= 15 && impressions >= 50) {
    insight = "high_potential";
  } else if (impressions >= 200 && ctr < 0.03) {
    insight = "metadata_gap";
  }

  return {
    pagePath,
    pageType,
    impressions,
    clicks,
    ctr,
    position,
    performanceScore,
    insight,
  };
}

export async function getGscInsightsReport(): Promise<GscInsightsReport> {
  const configured = isGscConfigured();
  const empty: GscInsightsReport = {
    configured,
    lastIngestedAt: null,
    topQueries: [],
    underperforming: [],
    highPotential: [],
    metadataGaps: [],
    ctrGaps: [],
    generatedAt: new Date().toISOString(),
  };

  try {
  const latestPage = await prisma.gscPageMetric.findFirst({
    orderBy: { ingestedAt: "desc" },
    select: { ingestedAt: true, periodStart: true, periodEnd: true },
  });

  const periodFilter = latestPage
    ? { periodStart: latestPage.periodStart, periodEnd: latestPage.periodEnd }
    : null;

  const pageMetrics = periodFilter
    ? await prisma.gscPageMetric.findMany({
        where: { ...periodFilter, query: "" },
        orderBy: { impressions: "desc" },
        take: 200,
      })
    : [];

  const queryMetrics = periodFilter
    ? await prisma.gscQueryMetric.findMany({
        where: periodFilter,
        orderBy: { impressions: "desc" },
        take: 50,
      })
    : [];

  const insights = pageMetrics.map((m) =>
    toPageInsight(
      m.pagePath,
      classifyPagePath(m.pagePath) as PageType,
      m.impressions,
      m.clicks,
      m.ctr,
      m.position
    )
  );

  const underperforming = insights
    .filter((i) => i.insight === "underperforming")
    .sort((a, b) => b.impressions - a.impressions);

  const highPotential = insights
    .filter((i) => i.insight === "high_potential")
    .sort((a, b) => b.performanceScore - a.performanceScore);

  const metadataGaps = insights
    .filter((i) => i.insight === "metadata_gap")
    .sort((a, b) => b.impressions - a.impressions);

  const ctrGaps = queryMetrics
    .map((q) => ({
      query: q.query,
      impressions: q.impressions,
      ctr: q.ctr,
      expectedCtr: expectedCtrForPosition(q.position),
    }))
    .filter((q) => q.impressions >= 50 && q.ctr < q.expectedCtr * 0.5)
    .slice(0, 20);

  return {
    configured,
    lastIngestedAt: latestPage?.ingestedAt.toISOString() ?? null,
    topQueries: queryMetrics.slice(0, 15).map((q) => ({
      query: q.query,
      impressions: q.impressions,
      clicks: q.clicks,
      ctr: q.ctr,
      position: q.position,
    })),
    underperforming: underperforming.slice(0, 20),
    highPotential: highPotential.slice(0, 15),
    metadataGaps: metadataGaps.slice(0, 15),
    ctrGaps,
    generatedAt: new Date().toISOString(),
  };
  } catch {
    return empty;
  }
}

export async function getPagePerformanceMap(): Promise<
  Map<string, number>
> {
  try {
  const latest = await prisma.gscPageMetric.findFirst({
    orderBy: { ingestedAt: "desc" },
    select: { periodStart: true, periodEnd: true },
  });

  if (!latest) return new Map();

  const metrics = await prisma.gscPageMetric.findMany({
    where: {
      periodStart: latest.periodStart,
      periodEnd: latest.periodEnd,
      query: "",
    },
  });

  return new Map(
    metrics.map((m) => [
      m.pagePath,
      computePagePerformanceScore(m.clicks, m.impressions, m.position),
    ])
  );
  } catch {
    return new Map();
  }
}
