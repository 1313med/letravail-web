import { prisma } from "@/lib/db";
import { resolveSourceActivationState } from "@/lib/intelligence/activation";
import type { SourceRow } from "@/lib/intelligence/types";

export type SourcesQuery = {
  search?: string;
  status?: string;
  quickFilter?: "active" | "ready" | "retry" | "validation" | "lowHealth" | "failed";
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

async function resolveQuickFilterSourceNames(
  quickFilter: SourcesQuery["quickFilter"]
): Promise<string[] | null> {
  if (!quickFilter) return null;

  switch (quickFilter) {
    case "active": {
      const rows = await prisma.employerAtsIntelligence.findMany({
        where: { activationState: "ACTIVE", sourceName: { not: null } },
        select: { sourceName: true },
      });
      return rows.map((r) => r.sourceName as string);
    }
    case "ready": {
      const rows = await prisma.employerAtsIntelligence.findMany({
        where: { activationState: "READY", sourceName: { not: null } },
        select: { sourceName: true },
      });
      return rows.map((r) => r.sourceName as string);
    }
    case "retry": {
      const rows = await prisma.employerAtsIntelligence.findMany({
        where: { nextRetryAt: { not: null }, sourceName: { not: null } },
        select: { sourceName: true },
      });
      return rows.map((r) => r.sourceName as string);
    }
    case "validation": {
      const rows = await prisma.employerAtsIntelligence.findMany({
        where: {
          lastValidationAt: null,
          activationState: { in: ["PROBED", "READY", "MONITORED"] },
          sourceName: { not: null },
        },
        select: { sourceName: true },
      });
      return rows.map((r) => r.sourceName as string);
    }
    case "lowHealth": {
      const [sources, ats] = await Promise.all([
        prisma.sourceProfile.findMany({
          where: { healthScore: { not: null, lt: 60 } },
          select: { sourceName: true },
        }),
        prisma.employerAtsIntelligence.findMany({
          where: { healthScore: { not: null, lt: 60 }, sourceName: { not: null } },
          select: { sourceName: true },
        }),
      ]);
      return Array.from(
        new Set([
          ...sources.map((s) => s.sourceName),
          ...ats.map((a) => a.sourceName as string),
        ])
      );
    }
    case "failed": {
      const rows = await prisma.sourceProfile.findMany({
        where: { status: { in: ["failed", "error"] } },
        select: { sourceName: true },
      });
      return rows.map((r) => r.sourceName);
    }
    default:
      return null;
  }
}

export async function getSources(params: SourcesQuery = {}) {
  const {
    search = "",
    status,
    quickFilter,
    sort = "priorityScore",
    order = "desc",
    page = 1,
    pageSize = 25,
  } = params;

  const filteredNames = await resolveQuickFilterSourceNames(quickFilter);

  const where = {
    ...(status ? { status } : {}),
    ...(filteredNames !== null
      ? { sourceName: { in: filteredNames.length > 0 ? filteredNames : ["__none__"] } }
      : {}),
    ...(search
      ? {
          OR: [
            { sourceName: { contains: search, mode: "insensitive" as const } },
            { companyName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const sortMap = {
    sourceName: { sourceName: order },
    status: { status: order },
    activeJobs: { activeJobs: order },
    lastCrawlAt: { lastCrawlAt: order },
    intelligenceScore: { intelligenceScore: order },
    freshnessScore: { freshnessScore: order },
    avgDescriptionLength: { avgDescriptionLength: order },
    failureRate: { failureRate: order },
    duplicateRate: { duplicateRate: order },
    priorityScore: { priorityScore: order },
    healthScore: { healthScore: order },
    activationState: { activationState: order },
  } as const;

  const [total, rows, errorCounts, atsRows] = await Promise.all([
    prisma.sourceProfile.count({ where }),
    prisma.sourceProfile.findMany({
      where,
      orderBy: sortMap[sort as keyof typeof sortMap] ?? sortMap.priorityScore,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.scrapeLog.groupBy({
      by: ["source"],
      where: { status: { in: ["failed", "error"] } },
      _count: { _all: true },
    }),
    prisma.employerAtsIntelligence.findMany({
      where: {
        sourceName: { not: null },
      },
      orderBy: { probedAt: "desc" },
      distinct: ["sourceName"],
      select: {
        sourceName: true,
        activationState: true,
        healthScore: true,
        validationScore: true,
        automaticActivation: true,
        nextRetryAt: true,
        lastValidationAt: true,
      },
    }),
  ]);

  const errorMap = new Map(errorCounts.map((e) => [e.source, e._count._all]));
  const atsMap = new Map(
    atsRows.filter((r) => r.sourceName).map((r) => [r.sourceName as string, r])
  );

  const items: SourceRow[] = rows.map((r) => {
    const ats = atsMap.get(r.sourceName);
    return {
      id: r.id,
      sourceName: r.sourceName,
      companyName: r.companyName,
      category: r.category,
      status: r.status,
      activeJobs: r.activeJobs,
      jobsDiscovered: r.jobsDiscovered,
      lastCrawlAt: r.lastCrawlAt?.toISOString() ?? null,
      nextCrawlAt: r.nextCrawlAt?.toISOString() ?? null,
      intelligenceScore: r.intelligenceScore,
      freshnessScore: r.freshnessScore,
      avgDescriptionLength: r.avgDescriptionLength,
      failureRate: r.failureRate,
      duplicateRate: r.duplicateRate,
      priorityScore: r.priorityScore,
      atsPlatform: r.atsPlatform,
      crawlStrategy: r.crawlStrategy,
      errorCount: errorMap.get(r.sourceName) ?? 0,
      activationState: resolveSourceActivationState(r.activationState, ats?.activationState ?? null),
      healthScore: ats?.healthScore ?? r.healthScore,
      validationScore: ats?.validationScore ?? null,
      automaticActivation: ats?.automaticActivation ?? false,
      nextRetryAt: ats?.nextRetryAt?.toISOString() ?? null,
      lastValidationAt: ats?.lastValidationAt?.toISOString() ?? null,
    };
  });

  return { total, page, pageSize, items };
}

export async function getSourceByName(sourceName: string) {
  return prisma.sourceProfile.findUnique({ where: { sourceName } });
}

export async function getSourceStatuses() {
  const rows = await prisma.sourceProfile.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  return rows.map((r) => ({ status: r.status, count: r._count._all }));
}

export async function updateSourceStatus(sourceName: string, status: string) {
  return prisma.sourceProfile.update({
    where: { sourceName },
    data: { status },
  });
}
