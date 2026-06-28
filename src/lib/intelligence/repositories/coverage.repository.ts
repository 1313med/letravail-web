import { prisma } from "@/lib/db";
import { activeJobWhere, coveragePct } from "@/lib/intelligence/queries";
import type { CoverageSegment } from "@/lib/intelligence/types";

async function topSegments(
  field: "sector" | "city" | "region" | "company" | "profession",
  limit = 15
): Promise<CoverageSegment[]> {
  if (field === "sector") {
    const rows = await prisma.company.groupBy({
      by: ["sector"],
      where: { sector: { not: null }, jobs: { some: activeJobWhere() } },
      _count: { _all: true },
      orderBy: { _count: { sector: "desc" } },
      take: limit,
    });
    const total = rows.reduce((s, r) => s + r._count._all, 0);
    return rows
      .filter((r) => r.sector)
      .map((r) => ({
        key: r.sector!,
        label: r.sector!,
        captured: r._count._all,
        coveragePct: coveragePct(r._count._all, total),
      }));
  }

  if (field === "city") {
    const rows = await prisma.job.groupBy({
      by: ["city"],
      where: activeJobWhere(),
      _count: { _all: true },
      orderBy: { _count: { city: "desc" } },
      take: limit,
    });
    const total = await prisma.job.count({ where: activeJobWhere() });
    return rows.map((r) => ({
      key: r.city,
      label: r.city,
      captured: r._count._all,
      coveragePct: coveragePct(r._count._all, total),
    }));
  }

  if (field === "region") {
    const rows = await prisma.location.groupBy({
      by: ["region"],
      where: { region: { not: null }, jobs: { some: activeJobWhere() } },
      _count: { _all: true },
      orderBy: { _count: { region: "desc" } },
      take: limit,
    });
    const total = rows.reduce((s, r) => s + r._count._all, 0);
    return rows
      .filter((r) => r.region)
      .map((r) => ({
        key: r.region!,
        label: r.region!,
        captured: r._count._all,
        coveragePct: coveragePct(r._count._all, total),
      }));
  }

  if (field === "company") {
    const rows = await prisma.company.findMany({
      orderBy: { activeJobCount: "desc" },
      take: limit,
      select: { slug: true, name: true, activeJobCount: true },
    });
    const total = await prisma.job.count({ where: activeJobWhere() });
    return rows.map((r) => ({
      key: r.slug,
      label: r.name,
      captured: r.activeJobCount,
      coveragePct: coveragePct(r.activeJobCount, total),
    }));
  }

  const rows = await prisma.professionSkill.findMany({
    orderBy: { jobCount: "desc" },
    take: limit,
    select: { profession: true, jobCount: true },
  });
  const total = rows.reduce((s, r) => s + r.jobCount, 0);
  return rows.map((r) => ({
    key: r.profession,
    label: r.profession,
    captured: r.jobCount,
    coveragePct: coveragePct(r.jobCount, total),
  }));
}

async function missingSectors(limit = 10): Promise<CoverageSegment[]> {
  const covered = await prisma.company.groupBy({
    by: ["sector"],
    where: { sector: { not: null } },
    _count: { _all: true },
  });
  const coveredSet = new Set(covered.map((c) => c.sector));
  const taxonomy = await prisma.jobTitleTaxonomy.findMany({
    where: { sectorSlug: { not: null } },
    select: { sectorSlug: true },
    distinct: ["sectorSlug"],
  });
  const missing = taxonomy
    .map((t) => t.sectorSlug!)
    .filter((s) => !coveredSet.has(s))
    .slice(0, limit);

  return missing.map((s) => ({
    key: s,
    label: s,
    captured: 0,
    estimated: null,
    coveragePct: 0,
  }));
}

export async function getMarketCoverage() {
  const [totalJobs, activeSources, bySector, byCity, byRegion, byEmployer, byProfession, missing] =
    await Promise.all([
      prisma.job.count({ where: activeJobWhere() }),
      prisma.sourceProfile.count({ where: { status: "active" } }),
      topSegments("sector"),
      topSegments("city"),
      topSegments("region"),
      topSegments("company"),
      topSegments("profession"),
      missingSectors(),
    ]);

  const cityHeatmap = byCity.map((c) => ({
    city: c.label,
    jobs: c.captured,
    intensity: c.coveragePct,
  }));

  return {
    totalJobs,
    activeSources,
    estimatedMarketSize: totalJobs + missing.length * 50,
    capturedJobs: totalJobs,
    missingJobs: Math.max(0, missing.length * 50),
    overallCoverage: bySector.length > 0 ? Math.round(bySector.reduce((s, x) => s + x.coveragePct, 0) / bySector.length) : 0,
    bySector,
    byCity,
    byRegion,
    byEmployer,
    byProfession,
    missingSectors: missing,
    cityHeatmap,
  };
}
