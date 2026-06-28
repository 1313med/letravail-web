import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { ValidationIssue } from "@/lib/intelligence/types";

export async function getValidationCenter() {
  const [
    invalidJobs,
    missingDescriptions,
    brokenLocations,
    duplicateCompanies,
    rejectedJobs,
    brokenUrls,
    sourceReports,
  ] = await Promise.all([
    prisma.job.count({
      where: { validationStatus: { not: "valid" } },
    }),
    prisma.job.count({
      where: {
        isActive: true,
        OR: [{ description: "" }, { descriptionScore: { lt: 0.3 } }],
      },
    }),
    prisma.job.count({
      where: {
        isActive: true,
        OR: [{ city: "" }, { locationId: null }],
      },
    }),
    prisma.companyAlias.count(),
    prisma.job.count({
      where: { validationStatus: { in: ["rejected", "invalid", "blocked"] } },
    }),
    prisma.job.count({
      where: {
        isActive: true,
        OR: [
          { applicationUrl: "" },
          { applicationUrl: { startsWith: "http://localhost" } },
        ],
      },
    }),
    prisma.sourceProfile.findMany({
      where: { lastValidationReport: { not: Prisma.AnyNull } },
      select: {
        sourceName: true,
        companyName: true,
        lastValidationReport: true,
      },
      take: 50,
    }),
  ]);

  const flagGroups = await prisma.job.groupBy({
    by: ["validationStatus"],
    _count: { _all: true },
    where: { validationStatus: { not: null } },
  });

  const issues: ValidationIssue[] = [
    {
      id: "invalid-jobs",
      type: "Invalid Jobs",
      severity: "error",
      source: null,
      company: null,
      title: null,
      message: "Jobs with non-valid validation status",
      count: invalidJobs,
    },
    {
      id: "missing-descriptions",
      type: "Missing Descriptions",
      severity: "warning",
      source: null,
      company: null,
      title: null,
      message: "Active jobs with empty or low-quality descriptions",
      count: missingDescriptions,
    },
    {
      id: "broken-locations",
      type: "Broken Locations",
      severity: "warning",
      source: null,
      company: null,
      title: null,
      message: "Jobs missing city or normalized location",
      count: brokenLocations,
    },
    {
      id: "duplicate-companies",
      type: "Duplicate Companies",
      severity: "warning",
      source: null,
      company: null,
      title: null,
      message: "Companies with multiple alias mappings",
      count: duplicateCompanies,
    },
    {
      id: "rejected-jobs",
      type: "Jobs Rejected",
      severity: "error",
      source: null,
      company: null,
      title: null,
      message: "Jobs rejected by validation pipeline",
      count: rejectedJobs,
    },
    {
      id: "broken-urls",
      type: "Broken URLs",
      severity: "error",
      source: null,
      company: null,
      title: null,
      message: "Jobs with missing or invalid application URLs",
      count: brokenUrls,
    },
  ];

  const flaggedJobs = await prisma.job.findMany({
    where: {
      OR: [
        { validationStatus: { not: "valid" } },
        { validationFlags: { isEmpty: false } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      company: true,
      source: true,
      validationStatus: true,
      validationFlags: true,
      slug: true,
      applicationUrl: true,
    },
  });

  return {
    summary: {
      totalIssues: issues.reduce((s, i) => s + i.count, 0),
      errors: issues.filter((i) => i.severity === "error").reduce((s, i) => s + i.count, 0),
      warnings: issues.filter((i) => i.severity === "warning").reduce((s, i) => s + i.count, 0),
    },
    issues,
    statusBreakdown: flagGroups.map((g) => ({
      status: g.validationStatus ?? "unknown",
      count: g._count._all,
    })),
    flaggedJobs,
    sourceReports: sourceReports.map((r) => ({
      source: r.sourceName,
      company: r.companyName,
      report: r.lastValidationReport,
    })),
  };
}

export async function getValidationIssueDetails(issueId: string, page = 1, pageSize = 25) {
  const skip = (page - 1) * pageSize;

  switch (issueId) {
    case "invalid-jobs":
      return prisma.job.findMany({
        where: { validationStatus: { not: "valid" } },
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
        select: { id: true, title: true, company: true, source: true, validationStatus: true, slug: true },
      });
    case "missing-descriptions":
      return prisma.job.findMany({
        where: {
          isActive: true,
          OR: [{ description: "" }, { descriptionScore: { lt: 0.3 } }],
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
        select: { id: true, title: true, company: true, source: true, descriptionScore: true, slug: true },
      });
    case "broken-locations":
      return prisma.job.findMany({
        where: { isActive: true, OR: [{ city: "" }, { locationId: null }] },
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
        select: { id: true, title: true, company: true, city: true, source: true, slug: true },
      });
    default:
      return [];
  }
}
