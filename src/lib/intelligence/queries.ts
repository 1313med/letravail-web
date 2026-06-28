import type { Prisma } from "@prisma/client";

export function activeJobWhere(): Prisma.JobWhereInput {
  return { isActive: true };
}

export function archivedTodayWhere(start: Date, end: Date): Prisma.JobWhereInput {
  return {
    isActive: false,
    archivedAt: { gte: start, lte: end },
  };
}

export function createdTodayWhere(start: Date, end: Date): Prisma.JobWhereInput {
  return {
    firstSeenAt: { gte: start, lte: end },
  };
}

export function freshDescriptionWhere(minScore = 0.6): Prisma.JobWhereInput {
  return {
    ...activeJobWhere(),
    descriptionScore: { gte: minScore },
  };
}

export function hasSkillsWhere(): Prisma.JobWhereInput {
  return {
    ...activeJobWhere(),
    skills: { some: {} },
  };
}

export function hasExperienceWhere(): Prisma.JobWhereInput {
  return {
    ...activeJobWhere(),
    OR: [{ experienceLevel: { not: null } }, { experienceYears: { not: null } }],
  };
}

export function hasEducationWhere(): Prisma.JobWhereInput {
  return {
    ...activeJobWhere(),
    educationLevel: { not: null },
  };
}

export function hasSalaryWhere(): Prisma.JobWhereInput {
  return {
    ...activeJobWhere(),
    OR: [
      { salaryMin: { not: null } },
      { salaryMax: { not: null } },
      { salary: { not: null } },
    ],
  };
}

export function enrichedCompanyWhere(): Prisma.JobWhereInput {
  return {
    ...activeJobWhere(),
    companyId: { not: null },
    companyRef: {
      OR: [
        { industry: { not: null } },
        { sector: { not: null } },
        { careerPageUrl: { not: null } },
        { linkedinUrl: { not: null } },
      ],
    },
  };
}

export function invalidJobWhere(): Prisma.JobWhereInput {
  return {
    OR: [
      { validationStatus: { not: "valid" } },
      { validationFlags: { isEmpty: false } },
    ],
  };
}

export function coveragePct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}
