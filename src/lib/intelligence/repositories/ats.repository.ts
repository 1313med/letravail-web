import { prisma } from "@/lib/db";
import type { AtsRow } from "@/lib/intelligence/types";

export type AtsQuery = {
  search?: string;
  platform?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

function resolveHealth(row: {
  onboardingStatus: string;
  confidence: number;
  issues: string[];
}): AtsRow["health"] {
  const status = row.onboardingStatus.toLowerCase();
  if (["ready", "active", "onboarded"].includes(status) && row.confidence >= 0.7) {
    return "ready";
  }
  if (row.issues.length > 0 || row.confidence < 0.5 || status.includes("investigate")) {
    return "investigate";
  }
  return "unknown";
}

export async function getAtsIntelligence(params: AtsQuery = {}) {
  const { search = "", platform, status, page = 1, pageSize = 25 } = params;

  const where = {
    ...(platform ? { atsPlatform: platform } : {}),
    ...(status ? { onboardingStatus: status } : {}),
    ...(search
      ? {
          OR: [
            { companyName: { contains: search, mode: "insensitive" as const } },
            { sourceName: { contains: search, mode: "insensitive" as const } },
            { atsPlatform: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, rows, platforms] = await Promise.all([
    prisma.employerAtsIntelligence.count({ where }),
    prisma.employerAtsIntelligence.findMany({
      where,
      orderBy: [{ confidence: "desc" }, { probedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.employerAtsIntelligence.groupBy({
      by: ["atsPlatform"],
      _count: { _all: true },
      orderBy: { _count: { atsPlatform: "desc" } },
    }),
  ]);

  const sourcePriorities = await prisma.sourceProfile.findMany({
    where: { sourceName: { in: rows.map((r) => r.sourceName).filter(Boolean) as string[] } },
    select: { sourceName: true, priorityScore: true },
  });
  const priorityMap = new Map(sourcePriorities.map((s) => [s.sourceName, s.priorityScore]));

  const items: AtsRow[] = rows.map((r) => ({
    id: r.id,
    companyName: r.companyName,
    sourceName: r.sourceName,
    atsPlatform: r.atsPlatform,
    confidence: r.confidence,
    crawlStrategy: r.crawlStrategy,
    apiEndpoints: r.apiEndpoints,
    jsRenderingRequired: r.jsRenderingRequired,
    onboardingStatus: r.onboardingStatus,
    probedAt: r.probedAt.toISOString(),
    priority: r.sourceName ? priorityMap.get(r.sourceName) ?? null : null,
    health: resolveHealth(r),
    robotsAllowed: r.robotsAllowed,
    authRequired: r.authRequired,
  }));

  return {
    total,
    page,
    pageSize,
    items,
    platforms: platforms.map((p) => ({
      platform: p.atsPlatform,
      count: p._count._all,
    })),
  };
}

export async function getAtsById(id: string) {
  return prisma.employerAtsIntelligence.findUnique({ where: { id } });
}

export async function getAtsSummary() {
  const [total, ready, investigate, avgConfidence] = await Promise.all([
    prisma.employerAtsIntelligence.count(),
    prisma.employerAtsIntelligence.count({
      where: { onboardingStatus: { in: ["ready", "active", "onboarded"] } },
    }),
    prisma.employerAtsIntelligence.count({
      where: { OR: [{ issues: { isEmpty: false } }, { confidence: { lt: 0.5 } }] },
    }),
    prisma.employerAtsIntelligence.aggregate({ _avg: { confidence: true } }),
  ]);

  return {
    total,
    ready,
    investigate,
    avgConfidence: avgConfidence._avg.confidence ?? 0,
  };
}
