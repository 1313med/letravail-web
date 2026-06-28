import { prisma } from "@/lib/db";
import type { SourceRow } from "@/lib/intelligence/types";

export type SourcesQuery = {
  search?: string;
  status?: string;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export async function getSources(params: SourcesQuery = {}) {
  const {
    search = "",
    status,
    sort = "priorityScore",
    order = "desc",
    page = 1,
    pageSize = 25,
  } = params;

  const where = {
    ...(status ? { status } : {}),
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
  } as const;

  const [total, rows, errorCounts] = await Promise.all([
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
  ]);

  const errorMap = new Map(errorCounts.map((e) => [e.source, e._count._all]));

  const items: SourceRow[] = rows.map((r) => ({
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
  }));

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
