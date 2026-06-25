import { Prisma } from "@prisma/client";
import { prisma } from "../db";

export async function getRecentSeoActionLogs(limit = 10) {
  try {
    return await prisma.seoActionLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        action: true,
        status: true,
        message: true,
        createdAt: true,
      },
    });
  } catch {
    return [];
  }
}

export async function logSeoActionSafe(
  action: string,
  status: "success" | "partial" | "failed",
  message: string,
  details: Record<string, unknown> = {}
) {
  try {
    await prisma.seoActionLog.create({
      data: {
        action,
        status,
        message,
        details: details as Prisma.InputJsonValue,
      },
    });
  } catch {
    // Table missing or DB unavailable — action still completes
  }
}

export async function getLatestGscPeriod() {
  try {
    return await prisma.gscPageMetric.findFirst({
      orderBy: { ingestedAt: "desc" },
      select: { periodStart: true, periodEnd: true },
    });
  } catch {
    return null;
  }
}

/** Safe access until `prisma generate` picks up SerpIntelligenceRecord */
const serpRecords = () =>
  (prisma as unknown as {
    serpIntelligenceRecord: {
      count: () => Promise<number>;
      findFirst: (args: {
        orderBy: { capturedAt: "desc" };
        select: { capturedAt: true };
      }) => Promise<{ capturedAt: Date } | null>;
      create: (args: {
        data: {
          provider: string;
          keyword: string;
          pagePath: string | null;
          ourPosition: number | null;
          competitorDomain: string | null;
          competitorPosition: number | null;
          searchVolume: number | null;
          raw: Prisma.InputJsonValue;
        };
      }) => Promise<unknown>;
    };
  }).serpIntelligenceRecord;

export async function countSerpIntelligenceRecords(): Promise<number> {
  try {
    return await serpRecords().count();
  } catch {
    return 0;
  }
}

export async function getLatestSerpCaptureAt(): Promise<Date | null> {
  try {
    const latest = await serpRecords().findFirst({
      orderBy: { capturedAt: "desc" },
      select: { capturedAt: true },
    });
    return latest?.capturedAt ?? null;
  } catch {
    return null;
  }
}

export async function createSerpIntelligenceRecord(data: {
  provider: string;
  keyword: string;
  pagePath?: string | null;
  ourPosition?: number | null;
  competitorDomain?: string | null;
  competitorPosition?: number | null;
  searchVolume?: number | null;
  raw?: Prisma.InputJsonValue;
}) {
  return serpRecords().create({
    data: {
      provider: data.provider,
      keyword: data.keyword,
      pagePath: data.pagePath ?? null,
      ourPosition: data.ourPosition ?? null,
      competitorDomain: data.competitorDomain ?? null,
      competitorPosition: data.competitorPosition ?? null,
      searchVolume: data.searchVolume ?? null,
      raw: data.raw ?? {},
    },
  });
}
