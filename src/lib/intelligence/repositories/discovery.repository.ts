import { prisma } from "@/lib/db";
import {
  OPERATIONS_LIFECYCLE_STAGES,
  getStageEnteredAt,
  resolveOperationsStage,
  type OperationsLifecycleStage,
} from "@/lib/intelligence/activation";

export type LifecycleEmployerCard = {
  id: string;
  companyName: string;
  sourceName: string | null;
  atsPlatform: string;
  confidence: number;
  healthScore: number | null;
  validationScore: number | null;
  priority: number | null;
  activationReason: string | null;
  stage: OperationsLifecycleStage;
  stageEnteredAt: string;
  timeInStageMs: number;
};

export type LifecyclePipeline = {
  stages: {
    stage: OperationsLifecycleStage;
    count: number;
    employers: LifecycleEmployerCard[];
  }[];
  total: number;
};

export async function getEmployerLifecyclePipeline(): Promise<LifecyclePipeline> {
  const now = Date.now();
  const rows = await prisma.employerAtsIntelligence.findMany({
    orderBy: [{ updatedAt: "desc" }, { probedAt: "desc" }],
    select: {
      id: true,
      companyName: true,
      sourceName: true,
      atsPlatform: true,
      confidence: true,
      healthScore: true,
      validationScore: true,
      activationReason: true,
      activationState: true,
      onboardingStatus: true,
      lastValidationAt: true,
      createdAt: true,
      probedAt: true,
      updatedAt: true,
      lastHealthCheck: true,
    },
  });

  const sourceNames = rows.map((r) => r.sourceName).filter(Boolean) as string[];
  const priorities = sourceNames.length
    ? await prisma.sourceProfile.findMany({
        where: { sourceName: { in: sourceNames } },
        select: { sourceName: true, priorityScore: true },
      })
    : [];
  const priorityMap = new Map(priorities.map((p) => [p.sourceName, p.priorityScore]));

  const buckets = new Map<OperationsLifecycleStage, LifecycleEmployerCard[]>(
    OPERATIONS_LIFECYCLE_STAGES.map((s) => [s, []])
  );

  for (const row of rows) {
    const stage = resolveOperationsStage(row);
    const enteredAt = getStageEnteredAt(stage, row);
    const card: LifecycleEmployerCard = {
      id: row.id,
      companyName: row.companyName,
      sourceName: row.sourceName,
      atsPlatform: row.atsPlatform,
      confidence: row.confidence,
      healthScore: row.healthScore,
      validationScore: row.validationScore,
      priority: row.sourceName ? priorityMap.get(row.sourceName) ?? null : null,
      activationReason: row.activationReason,
      stage,
      stageEnteredAt: enteredAt.toISOString(),
      timeInStageMs: now - enteredAt.getTime(),
    };
    buckets.get(stage)?.push(card);
  }

  return {
    total: rows.length,
    stages: OPERATIONS_LIFECYCLE_STAGES.map((stage) => ({
      stage,
      count: buckets.get(stage)?.length ?? 0,
      employers: buckets.get(stage) ?? [],
    })),
  };
}

export async function getRecentProbes(limit = 20) {
  return prisma.employerAtsIntelligence.findMany({
    orderBy: { probedAt: "desc" },
    take: limit,
  });
}

export async function probeEmployerUrl(url: string) {
  const normalized = url.trim();
  const match = await prisma.employerAtsIntelligence.findFirst({
    where: {
      OR: [
        { inputUrl: { contains: normalized, mode: "insensitive" } },
        { careersPageUrl: { contains: normalized, mode: "insensitive" } },
        { finalUrl: { contains: normalized, mode: "insensitive" } },
      ],
    },
    orderBy: { probedAt: "desc" },
  });

  if (match) return match;

  const domain = normalized.replace(/^https?:\/\//, "").split("/")[0];
  return prisma.employerAtsIntelligence.findFirst({
    where: {
      OR: [
        { inputUrl: { contains: domain, mode: "insensitive" } },
        { companyName: { contains: domain.split(".")[0], mode: "insensitive" } },
      ],
    },
    orderBy: { probedAt: "desc" },
  });
}
