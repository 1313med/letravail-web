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
