import { prisma } from "@/lib/db";
import type { CrawlActivityRow } from "@/lib/intelligence/types";

export type CrawlQuery = {
  source?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export async function getCrawlActivity(params: CrawlQuery = {}) {
  const { source, status, page = 1, pageSize = 50 } = params;

  const where = {
    ...(source ? { source: { contains: source, mode: "insensitive" as const } } : {}),
    ...(status ? { status } : {}),
  };

  const [total, rows, stats] = await Promise.all([
    prisma.scrapeLog.count({ where }),
    prisma.scrapeLog.findMany({
      where,
      orderBy: { startedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.scrapeLog.aggregate({
      where: { startedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      _count: { _all: true },
      _avg: { durationMs: true },
      _sum: { jobsInserted: true, jobsUpdated: true, duplicates: true },
    }),
  ]);

  const items: CrawlActivityRow[] = rows.map((r) => ({
    id: r.id,
    source: r.source,
    category: r.category,
    status: r.status,
    startedAt: r.startedAt.toISOString(),
    endedAt: r.endedAt?.toISOString() ?? null,
    durationMs: r.durationMs,
    jobsFound: r.jobsFound,
    jobsInserted: r.jobsInserted,
    jobsUpdated: r.jobsUpdated,
    duplicates: r.duplicates,
    errorMessage: r.errorMessage,
  }));

  return {
    total,
    page,
    pageSize,
    items,
    last24h: {
      crawls: stats._count._all,
      avgDurationMs: stats._avg.durationMs,
      jobsInserted: stats._sum.jobsInserted ?? 0,
      jobsUpdated: stats._sum.jobsUpdated ?? 0,
      duplicates: stats._sum.duplicates ?? 0,
    },
  };
}

export async function getRecentCrawlTimeline(limit = 100) {
  return getCrawlActivity({ pageSize: limit });
}
