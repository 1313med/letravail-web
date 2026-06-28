import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { activeJobWhere } from "@/lib/intelligence/queries";
import type { ValidationIssue } from "@/lib/intelligence/types";

export type ValidationDimension = {
  key: string;
  label: string;
  passed: number;
  failed: number;
  total: number;
  passRate: number;
  status: "pass" | "warn" | "fail";
  explanation: string;
  failReason: string;
};

function dimensionStatus(passRate: number): ValidationDimension["status"] {
  if (passRate >= 90) return "pass";
  if (passRate >= 70) return "warn";
  return "fail";
}

export async function getValidationBreakdown(): Promise<ValidationDimension[]> {
  const base = activeJobWhere();
  const total = await prisma.job.count({ where: base });
  if (total === 0) return [];

  const [
    descriptionPass,
    skillsPass,
    educationPass,
    experiencePass,
    salaryPass,
    locationPass,
    urlPass,
    duplicateFlags,
  ] = await Promise.all([
    prisma.job.count({
      where: {
        ...base,
        NOT: { OR: [{ description: "" }, { descriptionScore: { lt: 0.3 } }] },
      },
    }),
    prisma.job.count({ where: { ...base, skills: { some: {} } } }),
    prisma.job.count({ where: { ...base, educationLevel: { not: null } } }),
    prisma.job.count({
      where: {
        ...base,
        OR: [{ experienceLevel: { not: null } }, { experienceYears: { not: null } }],
      },
    }),
    prisma.job.count({
      where: {
        ...base,
        OR: [
          { salaryMin: { not: null } },
          { salaryMax: { not: null } },
          { AND: [{ salary: { not: null } }, { salary: { not: "" } }] },
        ],
      },
    }),
    prisma.job.count({
      where: { ...base, NOT: { OR: [{ city: "" }, { locationId: null }] } },
    }),
    prisma.job.count({
      where: {
        ...base,
        NOT: {
          OR: [
            { applicationUrl: "" },
            { applicationUrl: { startsWith: "http://localhost" } },
          ],
        },
      },
    }),
    prisma.job.count({
      where: {
        ...base,
        validationFlags: { hasSome: ["duplicate", "duplicates", "duplicate_title"] },
      },
    }),
  ]);

  const mk = (
    key: string,
    label: string,
    passed: number,
    explanation: string,
    failReason: string
  ): ValidationDimension => {
    const failed = total - passed;
    const passRate = Math.round((passed / total) * 1000) / 10;
    return {
      key,
      label,
      passed,
      failed,
      total,
      passRate,
      status: dimensionStatus(passRate),
      explanation,
      failReason,
    };
  };

  return [
    mk(
      "description",
      "Description",
      descriptionPass,
      "Jobs must have a non-empty description with quality score ≥ 0.3.",
      "Empty or low-quality descriptions reduce search relevance and user trust."
    ),
    mk(
      "skills",
      "Skills",
      skillsPass,
      "At least one skill must be linked to the job record.",
      "Missing skills block profession matching and salary intelligence."
    ),
    mk(
      "education",
      "Education",
      educationPass,
      "educationLevel must be populated from the posting.",
      "Missing education data weakens candidate filtering."
    ),
    mk(
      "experience",
      "Experience",
      experiencePass,
      "experienceLevel or experienceYears must be present.",
      "Missing experience signals reduce match quality."
    ),
    mk(
      "salary",
      "Salary",
      salaryPass,
      "Salary min/max or salary text must be extracted.",
      "Salary gaps reduce transparency for job seekers."
    ),
    mk(
      "location",
      "Location",
      locationPass,
      "City and normalized locationId must both be set.",
      "Broken locations break city pages and geo filters."
    ),
    mk(
      "duplicates",
      "Duplicates",
      total - duplicateFlags,
      "Jobs should not carry duplicate validation flags.",
      "Duplicate postings inflate counts and confuse employers."
    ),
    mk(
      "url",
      "URL Quality",
      urlPass,
      "applicationUrl must be a valid external apply link.",
      "Missing or localhost URLs block applications."
    ),
  ];
}

export async function getValidationCenter() {
  const [breakdown, invalidJobs, missingDescriptions, brokenLocations, duplicateCompanies, rejectedJobs, brokenUrls, sourceReports] =
    await Promise.all([
      getValidationBreakdown(),
      prisma.job.count({ where: { validationStatus: { not: "valid" } } }),
      prisma.job.count({
        where: { isActive: true, OR: [{ description: "" }, { descriptionScore: { lt: 0.3 } }] },
      }),
      prisma.job.count({
        where: { isActive: true, OR: [{ city: "" }, { locationId: null }] },
      }),
      prisma.companyAlias.count(),
      prisma.job.count({
        where: { validationStatus: { in: ["rejected", "invalid", "blocked"] } },
      }),
      prisma.job.count({
        where: {
          isActive: true,
          OR: [{ applicationUrl: "" }, { applicationUrl: { startsWith: "http://localhost" } }],
        },
      }),
      prisma.sourceProfile.findMany({
        where: { lastValidationReport: { not: Prisma.AnyNull } },
        select: { sourceName: true, companyName: true, lastValidationReport: true },
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
      OR: [{ validationStatus: { not: "valid" } }, { validationFlags: { isEmpty: false } }],
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
      descriptionScore: true,
      qualityScore: true,
    },
  });

  return {
    summary: {
      totalIssues: issues.reduce((s, i) => s + i.count, 0),
      errors: issues.filter((i) => i.severity === "error").reduce((s, i) => s + i.count, 0),
      warnings: issues.filter((i) => i.severity === "warning").reduce((s, i) => s + i.count, 0),
    },
    breakdown,
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
        select: {
          id: true,
          title: true,
          company: true,
          source: true,
          validationStatus: true,
          validationFlags: true,
          slug: true,
        },
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
        select: {
          id: true,
          title: true,
          company: true,
          source: true,
          descriptionScore: true,
          slug: true,
        },
      });
    case "broken-locations":
      return prisma.job.findMany({
        where: { isActive: true, OR: [{ city: "" }, { locationId: null }] },
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
        select: { id: true, title: true, company: true, city: true, source: true, slug: true },
      });
    case "rejected-jobs":
      return prisma.job.findMany({
        where: { validationStatus: { in: ["rejected", "invalid", "blocked"] } },
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          title: true,
          company: true,
          source: true,
          validationStatus: true,
          validationFlags: true,
          slug: true,
        },
      });
    case "broken-urls":
      return prisma.job.findMany({
        where: {
          isActive: true,
          OR: [{ applicationUrl: "" }, { applicationUrl: { startsWith: "http://localhost" } }],
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          title: true,
          company: true,
          source: true,
          applicationUrl: true,
          slug: true,
        },
      });
    case "duplicate-companies":
      return prisma.companyAlias.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          alias: true,
          confidence: true,
          company: { select: { name: true, slug: true } },
        },
      });
    default:
      return [];
  }
}
