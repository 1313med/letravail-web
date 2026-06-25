import { prisma } from "../db";
import { activeJobsWhere } from "../queries";
import { Prisma } from "@prisma/client";
import { SALARY_ROLES } from "../salary-data";
import type { DemandIntelligenceReport, HiringTrendItem, SkillTrendItem, TrendPoint, TrendWindow } from "./types";

const WINDOWS: TrendWindow[] = ["7d", "30d", "90d"];

function windowDates(window: TrendWindow): { current: Date; previous: Date; start: Date } {
  const now = new Date();
  const days = window === "7d" ? 7 : window === "30d" ? 30 : 90;
  const current = new Date(now);
  current.setDate(current.getDate() - days);
  const previous = new Date(current);
  previous.setDate(previous.getDate() - days);
  const start = new Date(previous);
  start.setDate(start.getDate() - days);
  return { current, previous, start };
}

async function countJobsInRange(
  where: Prisma.JobWhereInput,
  from: Date,
  to: Date
) {
  return prisma.job.count({
    where: {
      AND: [
        where ?? {},
        activeJobsWhere(),
        { createdAt: { gte: from, lt: to } },
      ],
    },
  });
}

function buildTrendPoints(
  counts: { w7: [number, number]; w30: [number, number]; w90: [number, number] }
): TrendPoint[] {
  return WINDOWS.map((window) => {
    const [current, previous] =
      window === "7d" ? counts.w7 : window === "30d" ? counts.w30 : counts.w90;
    const delta = current - previous;
    const deltaPct = previous > 0 ? Math.round((delta / previous) * 100) : current > 0 ? 100 : 0;
    return {
      window,
      current,
      previous,
      delta,
      deltaPct,
      trend: delta > 0 ? "up" : delta < 0 ? "down" : "stable",
    };
  });
}

async function hiringTrendForCities(limit = 12): Promise<HiringTrendItem[]> {
  const cities = await prisma.location.findMany({
    select: { city: true, slug: true },
    take: 40,
  });

  const items: HiringTrendItem[] = [];

  for (const loc of cities) {
    const baseWhere = { location: { slug: loc.slug } };
    const w7 = windowDates("7d");
    const w30 = windowDates("30d");
    const w90 = windowDates("90d");

    const [c7, p7, c30, p30, c90, p90, total] = await Promise.all([
      countJobsInRange(baseWhere, w7.current, new Date()),
      countJobsInRange(baseWhere, w7.previous, w7.current),
      countJobsInRange(baseWhere, w30.current, new Date()),
      countJobsInRange(baseWhere, w30.previous, w30.current),
      countJobsInRange(baseWhere, w90.current, new Date()),
      countJobsInRange(baseWhere, w90.previous, w90.current),
      prisma.job.count({ where: { AND: [activeJobsWhere(), baseWhere] } }),
    ]);

    if (total < 2) continue;

    items.push({
      label: loc.city,
      slug: loc.slug,
      type: "city",
      trends: buildTrendPoints({ w7: [c7, p7], w30: [c30, p30], w90: [c90, p90] }),
      totalActive: total,
    });
  }

  return items
    .sort((a, b) => b.trends[1].delta - a.trends[1].delta)
    .slice(0, limit);
}

async function hiringTrendForSectors(limit = 10): Promise<HiringTrendItem[]> {
  const tags = await prisma.tag.findMany({
    select: { name: true, slug: true, id: true },
    take: 30,
  });

  const items: HiringTrendItem[] = [];

  for (const tag of tags) {
    const baseWhere = { tags: { some: { tagId: tag.id } } };
    const w30 = windowDates("30d");
    const w7 = windowDates("7d");
    const w90 = windowDates("90d");

    const [c7, p7, c30, p30, c90, p90, total] = await Promise.all([
      countJobsInRange(baseWhere, w7.current, new Date()),
      countJobsInRange(baseWhere, w7.previous, w7.current),
      countJobsInRange(baseWhere, w30.current, new Date()),
      countJobsInRange(baseWhere, w30.previous, w30.current),
      countJobsInRange(baseWhere, w90.current, new Date()),
      countJobsInRange(baseWhere, w90.previous, w90.current),
      prisma.job.count({
        where: { AND: [activeJobsWhere(), baseWhere] },
      }),
    ]);

    if (total < 2) continue;

    items.push({
      label: tag.name,
      slug: tag.slug,
      type: "sector",
      trends: buildTrendPoints({ w7: [c7, p7], w30: [c30, p30], w90: [c90, p90] }),
      totalActive: total,
    });
  }

  return items.sort((a, b) => b.trends[1].delta - a.trends[1].delta).slice(0, limit);
}

async function hiringTrendForCompanies(limit = 10): Promise<HiringTrendItem[]> {
  const companies = await prisma.company.findMany({
    where: { jobs: { some: activeJobsWhere() } },
    select: { name: true, slug: true },
    take: 25,
  });

  const items: HiringTrendItem[] = [];

  for (const co of companies) {
    const baseWhere = { companyRef: { slug: co.slug } };
    const w30 = windowDates("30d");
    const w7 = windowDates("7d");
    const w90 = windowDates("90d");

    const [c7, p7, c30, p30, c90, p90, total] = await Promise.all([
      countJobsInRange(baseWhere, w7.current, new Date()),
      countJobsInRange(baseWhere, w7.previous, w7.current),
      countJobsInRange(baseWhere, w30.current, new Date()),
      countJobsInRange(baseWhere, w30.previous, w30.current),
      countJobsInRange(baseWhere, w90.current, new Date()),
      countJobsInRange(baseWhere, w90.previous, w90.current),
      prisma.job.count({ where: { AND: [activeJobsWhere(), baseWhere] } }),
    ]);

    items.push({
      label: co.name,
      slug: co.slug,
      type: "company",
      trends: buildTrendPoints({ w7: [c7, p7], w30: [c30, p30], w90: [c90, p90] }),
      totalActive: total,
    });
  }

  return items.sort((a, b) => b.trends[1].delta - a.trends[1].delta).slice(0, limit);
}

async function hiringTrendForProfessions(limit = 10): Promise<HiringTrendItem[]> {
  const titles = await prisma.job.groupBy({
    by: ["title"],
    where: activeJobsWhere(),
    _count: { _all: true },
    orderBy: { _count: { title: "desc" } },
    take: 25,
  });

  const items: HiringTrendItem[] = [];

  for (const t of titles) {
    if (t._count._all < 3) continue;
    const baseWhere = { title: t.title };
    const w30 = windowDates("30d");
    const w7 = windowDates("7d");
    const w90 = windowDates("90d");

    const [c7, p7, c30, p30, c90, p90] = await Promise.all([
      countJobsInRange(baseWhere, w7.current, new Date()),
      countJobsInRange(baseWhere, w7.previous, w7.current),
      countJobsInRange(baseWhere, w30.current, new Date()),
      countJobsInRange(baseWhere, w30.previous, w30.current),
      countJobsInRange(baseWhere, w90.current, new Date()),
      countJobsInRange(baseWhere, w90.previous, w90.current),
    ]);

    items.push({
      label: t.title,
      type: "profession",
      trends: buildTrendPoints({ w7: [c7, p7], w30: [c30, p30], w90: [c90, p90] }),
      totalActive: t._count._all,
    });
  }

  return items.sort((a, b) => b.trends[1].delta - a.trends[1].delta).slice(0, limit);
}

async function computeSkillTrends(): Promise<{
  fastestGrowing: SkillTrendItem[];
  fastestDeclining: SkillTrendItem[];
}> {
  const tags = await prisma.tag.findMany({
    select: { name: true, slug: true, id: true },
    take: 40,
  });

  const items: SkillTrendItem[] = [];

  for (const tag of tags) {
    const baseWhere = { tags: { some: { tagId: tag.id } } };
    const w30 = windowDates("30d");
    const w7 = windowDates("7d");
    const w90 = windowDates("90d");

    const [c7, p7, c30, p30, c90, p90, total] = await Promise.all([
      countJobsInRange(baseWhere, w7.current, new Date()),
      countJobsInRange(baseWhere, w7.previous, w7.current),
      countJobsInRange(baseWhere, w30.current, new Date()),
      countJobsInRange(baseWhere, w30.previous, w30.current),
      countJobsInRange(baseWhere, w90.current, new Date()),
      countJobsInRange(baseWhere, w90.previous, w90.current),
      prisma.job.count({
        where: { AND: [activeJobsWhere(), baseWhere] },
      }),
    ]);

    if (total < 2) continue;

    const trends = buildTrendPoints({ w7: [c7, p7], w30: [c30, p30], w90: [c90, p90] });
    const momentumScore = trends[1].deltaPct + trends[0].deltaPct * 0.5;

    items.push({
      skill: tag.name,
      slug: tag.slug,
      frequency: total,
      trends,
      momentumScore: Math.round(momentumScore),
    });
  }

  const sorted = [...items].sort((a, b) => b.momentumScore - a.momentumScore);
  return {
    fastestGrowing: sorted.slice(0, 10),
    fastestDeclining: [...items]
      .sort((a, b) => a.momentumScore - b.momentumScore)
      .slice(0, 10),
  };
}

export async function getDemandIntelligenceReport(): Promise<DemandIntelligenceReport> {
  const [
    byCity,
    bySector,
    byCompany,
    byProfession,
    skillTrends,
    salaryByRole,
    growingTitles,
  ] = await Promise.all([
    hiringTrendForCities(),
    hiringTrendForSectors(),
    hiringTrendForCompanies(),
    hiringTrendForProfessions(),
    computeSkillTrends(),
    prisma.salaryObservation.groupBy({
      by: ["titleNorm"],
      _avg: { salaryMin: true, salaryMax: true },
      _count: { _all: true },
      orderBy: { _avg: { salaryMax: "desc" } },
      take: 10,
    }),
    prisma.job.groupBy({
      by: ["title"],
      where: activeJobsWhere(),
      _count: { _all: true },
      orderBy: { _count: { title: "desc" } },
      take: 15,
    }),
  ]);

  const w30 = windowDates("30d");

  const growingJobs = await Promise.all(
    growingTitles.slice(0, 10).map(async (t) => {
      const recent = await countJobsInRange({ title: t.title }, w30.current, new Date());
      const prev = await countJobsInRange({ title: t.title }, w30.previous, w30.current);
      return { title: t.title, delta: recent - prev, count: t._count._all };
    })
  );

  const highestPaying = salaryByRole
    .filter((r) => r._count._all >= 3)
    .map((r) => {
      const role = SALARY_ROLES.find((x) => x.slug === r.titleNorm);
      const med =
        r._avg.salaryMin && r._avg.salaryMax
          ? Math.round((r._avg.salaryMin + r._avg.salaryMax) / 2)
          : r._avg.salaryMax ?? r._avg.salaryMin ?? 0;
      return {
        role: role?.title ?? r.titleNorm,
        medianSalary: med ?? 0,
        observations: r._count._all,
      };
    })
    .sort((a, b) => b.medianSalary - a.medianSalary)
    .slice(0, 10);

  return {
    hiringTrends: {
      byProfession,
      byCity,
      byCompany,
      bySector,
    },
    skillTrends,
    market: {
      fastestGrowingJobs: growingJobs.sort((a, b) => b.delta - a.delta),
      fastestGrowingCities: byCity
        .map((c) => ({
          city: c.label,
          slug: c.slug ?? "",
          delta: c.trends[1].delta,
          count: c.totalActive,
        }))
        .sort((a, b) => b.delta - a.delta)
        .slice(0, 10),
      mostActiveRecruiters: byCompany
        .map((c) => ({
          company: c.label,
          slug: c.slug ?? "",
          jobCount: c.totalActive,
          delta: c.trends[1].delta,
        }))
        .slice(0, 10),
      fastestGrowingSectors: bySector
        .map((s) => ({
          sector: s.label,
          slug: s.slug ?? "",
          delta: s.trends[1].delta,
          count: s.totalActive,
        }))
        .slice(0, 10),
      highestPayingProfessions: highestPaying,
    },
    generatedAt: new Date().toISOString(),
  };
}
