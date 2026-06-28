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
    activationState: r.activationState,
    activationReason: r.activationReason,
    deactivationReason: r.deactivationReason,
    healthScore: r.healthScore,
    validationScore: r.validationScore,
    automaticActivation: r.automaticActivation,
    retryCount: r.retryCount,
    nextRetryAt: r.nextRetryAt?.toISOString() ?? null,
    lastValidationAt: r.lastValidationAt?.toISOString() ?? null,
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

type HistoryEvent = {
  at: string;
  type: string;
  label: string;
  detail?: string;
  score?: number | null;
};

function parseJsonHistory(value: unknown, type: string): HistoryEvent[] {
  if (!value || typeof value !== "object") return [];
  const obj = value as Record<string, unknown>;
  const list = obj.history ?? obj.events ?? obj.entries;
  if (!Array.isArray(list)) return [];
  const events: HistoryEvent[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const e = item as Record<string, unknown>;
    const at = e.at ?? e.timestamp ?? e.date;
    if (!at) continue;
    events.push({
      at: new Date(String(at)).toISOString(),
      type,
      label: String(e.label ?? e.type ?? type),
      detail: e.reason ? String(e.reason) : e.detail ? String(e.detail) : undefined,
      score: typeof e.score === "number" ? e.score : null,
    });
  }
  return events;
}

function buildSyntheticHistories(record: NonNullable<Awaited<ReturnType<typeof getAtsById>>>) {
  const healthHistory: HistoryEvent[] = [
    ...parseJsonHistory(record.validationSummary, "health"),
    ...(record.lastHealthCheck
      ? [
          {
            at: record.lastHealthCheck.toISOString(),
            type: "health",
            label: "Health check",
            score: record.healthScore,
          },
        ]
      : []),
  ];

  const validationHistory: HistoryEvent[] = [
    ...(record.lastValidationAt
      ? [
          {
            at: record.lastValidationAt.toISOString(),
            type: "validation",
            label: "Validation completed",
            score: record.validationScore,
            detail: record.validationSummary ? "See validation summary" : undefined,
          },
        ]
      : []),
  ];

  const retryHistory: HistoryEvent[] = [
    ...(record.nextRetryAt
      ? [
          {
            at: record.nextRetryAt.toISOString(),
            type: "retry",
            label: `Retry scheduled (#${record.retryCount})`,
          },
        ]
      : []),
  ];

  const activationHistory: HistoryEvent[] = [
    {
      at: record.probedAt.toISOString(),
      type: "probe",
      label: "Employer probed",
      detail: `${record.atsPlatform} · ${Math.round(record.confidence * 100)}% confidence`,
    },
    ...(record.activationReason
      ? [
          {
            at: record.updatedAt.toISOString(),
            type: "activation",
            label: "Activated",
            detail: record.activationReason,
          },
        ]
      : []),
    ...(record.deactivationReason
      ? [
          {
            at: record.updatedAt.toISOString(),
            type: "deactivation",
            label: "Deactivated",
            detail: record.deactivationReason,
          },
        ]
      : []),
  ];

  const sortDesc = (a: HistoryEvent, b: HistoryEvent) =>
    new Date(b.at).getTime() - new Date(a.at).getTime();

  return {
    healthHistory: healthHistory.sort(sortDesc),
    validationHistory: validationHistory.sort(sortDesc),
    retryHistory: retryHistory.sort(sortDesc),
    activationHistory: activationHistory.sort(sortDesc),
  };
}

export async function getAtsOperationalDetail(id: string) {
  const record = await getAtsById(id);
  if (!record) return null;

  const recentCrawls = record.sourceName
    ? await prisma.scrapeLog.findMany({
        where: { source: record.sourceName },
        orderBy: { startedAt: "desc" },
        take: 5,
        select: {
          id: true,
          status: true,
          startedAt: true,
          durationMs: true,
          jobsFound: true,
          errorMessage: true,
        },
      })
    : [];

  const apiStatus =
    record.apiEndpoints.length > 0
      ? record.confidence >= 0.7
        ? "detected"
        : "uncertain"
      : record.crawlStrategy.toLowerCase().includes("html")
        ? "html-only"
        : "none";

  return {
    ...record,
    probedAt: record.probedAt.toISOString(),
    nextRetryAt: record.nextRetryAt?.toISOString() ?? null,
    lastValidationAt: record.lastValidationAt?.toISOString() ?? null,
    lastHealthCheck: record.lastHealthCheck?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    apiStatus,
    recentCrawls: recentCrawls.map((c) => ({
      ...c,
      startedAt: c.startedAt.toISOString(),
    })),
    histories: buildSyntheticHistories(record),
    validationSummary: record.validationSummary,
    rawProbe: record.rawProbe,
  };
}

export async function getAtsSummary() {
  const [total, ready, investigate, avgConfidence, avgHealth, avgValidation, activeCount] =
    await Promise.all([
    prisma.employerAtsIntelligence.count(),
    prisma.employerAtsIntelligence.count({
      where: { onboardingStatus: { in: ["ready", "active", "onboarded"] } },
    }),
    prisma.employerAtsIntelligence.count({
      where: { OR: [{ issues: { isEmpty: false } }, { confidence: { lt: 0.5 } }] },
    }),
    prisma.employerAtsIntelligence.aggregate({ _avg: { confidence: true } }),
    prisma.employerAtsIntelligence.aggregate({
      where: { healthScore: { not: null } },
      _avg: { healthScore: true },
    }),
    prisma.employerAtsIntelligence.aggregate({
      where: { validationScore: { not: null } },
      _avg: { validationScore: true },
    }),
    prisma.employerAtsIntelligence.count({ where: { activationState: "ACTIVE" } }),
  ]);

  return {
    total,
    ready,
    investigate,
    avgConfidence: avgConfidence._avg.confidence ?? 0,
    avgHealth: avgHealth._avg.healthScore ?? 0,
    avgValidation: avgValidation._avg.validationScore ?? 0,
    activeCount,
  };
}
