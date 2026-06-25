import { prisma } from "./db";
import { MIN_OBSERVATIONS_FOR_SALARY_INDEX } from "./constants";
import { percentile, median } from "./salary-data";
import { shouldNoindexSalaryPage } from "./indexation";

export type SalaryConfidenceLevel = "high" | "medium" | "low" | "insufficient";

export type SalaryPercentiles = {
  p25: number | null;
  p50: number | null;
  p75: number | null;
  sampleSize: number;
};

export type SalaryConfidence = {
  score: number;
  level: SalaryConfidenceLevel;
  observationCount: number;
  freshnessDays: number | null;
  cityCoverage: number;
  companyDiversity: number;
  indexable: boolean;
};

function observationMidpoint(obs: {
  salaryMin: number | null;
  salaryMax: number | null;
}): number | null {
  if (obs.salaryMin && obs.salaryMax) {
    return Math.round((obs.salaryMin + obs.salaryMax) / 2);
  }
  return obs.salaryMin ?? obs.salaryMax ?? null;
}

export function computeSalaryPercentiles(values: number[]): SalaryPercentiles {
  return {
    p25: percentile(values, 25),
    p50: median(values),
    p75: percentile(values, 75),
    sampleSize: values.length,
  };
}

export async function getSalaryObservationsFiltered(filters: {
  professionSlug?: string;
  citySlug?: string;
  companySlug?: string;
  experience?: string;
}) {
  const where: {
    titleNorm?: string;
    citySlug?: string | null;
    sectorSlug?: string;
  } = {};

  if (filters.professionSlug) where.titleNorm = filters.professionSlug;
  if (filters.citySlug) where.citySlug = filters.citySlug;

  const observations = await prisma.salaryObservation.findMany({
    where,
    select: {
      salaryMin: true,
      salaryMax: true,
      citySlug: true,
      sectorSlug: true,
      observedAt: true,
      jobId: true,
    },
    orderBy: { observedAt: "desc" },
    take: 2000,
  });

  let filtered = observations;

  if (filters.companySlug) {
    const jobIds = observations.map((o) => o.jobId);
    const jobs = await prisma.job.findMany({
      where: { id: { in: jobIds }, companyRef: { slug: filters.companySlug } },
      select: { id: true },
    });
    const allowed = new Set(jobs.map((j) => j.id));
    filtered = observations.filter((o) => allowed.has(o.jobId));
  }

  return filtered;
}

export async function computeSalaryConfidence(
  professionSlug: string
): Promise<SalaryConfidence> {
  const observations = await prisma.salaryObservation.findMany({
    where: { titleNorm: professionSlug },
    select: {
      citySlug: true,
      jobId: true,
      observedAt: true,
    },
  });

  const count = observations.length;
  if (count === 0) {
    return {
      score: 0,
      level: "insufficient",
      observationCount: 0,
      freshnessDays: null,
      cityCoverage: 0,
      companyDiversity: 0,
      indexable: false,
    };
  }

  const cities = new Set(observations.map((o) => o.citySlug).filter(Boolean));
  const jobIds = observations.map((o) => o.jobId);
  const jobs = await prisma.job.findMany({
    where: { id: { in: jobIds } },
    select: { companyId: true, company: true },
  });
  const companies = new Set(
    jobs.map((j) => j.companyId ?? j.company.toLowerCase())
  );

  const latest = observations.reduce(
    (max, o) => (o.observedAt > max ? o.observedAt : max),
    observations[0].observedAt
  );
  const freshnessDays = Math.floor(
    (Date.now() - latest.getTime()) / (1000 * 60 * 60 * 24)
  );

  let score = 0;
  score += Math.min(40, count * 4);
  score += Math.min(20, cities.size * 4);
  score += Math.min(20, companies.size * 2);
  if (freshnessDays <= 30) score += 20;
  else if (freshnessDays <= 60) score += 10;
  else if (freshnessDays <= 90) score += 5;

  const level: SalaryConfidenceLevel =
    score >= 75 ? "high" : score >= 50 ? "medium" : score >= 25 ? "low" : "insufficient";

  return {
    score: Math.min(100, score),
    level,
    observationCount: count,
    freshnessDays,
    cityCoverage: cities.size,
    companyDiversity: companies.size,
    indexable: !shouldNoindexSalaryPage(count, MIN_OBSERVATIONS_FOR_SALARY_INDEX),
  };
}

export async function getSalaryByProfession(professionSlug: string) {
  const observations = await getSalaryObservationsFiltered({ professionSlug });
  const values = observations
    .map(observationMidpoint)
    .filter((v): v is number => v !== null && v > 0);

  const percentiles = computeSalaryPercentiles(values);
  const confidence = await computeSalaryConfidence(professionSlug);

  return {
    professionSlug,
    currency: "MAD",
    source: "observations" as const,
    country: "Morocco",
    ...percentiles,
    confidence,
  };
}

export async function getSalaryByCity(citySlug: string, professionSlug?: string) {
  const observations = await getSalaryObservationsFiltered({
    citySlug,
    professionSlug,
  });
  const values = observations
    .map(observationMidpoint)
    .filter((v): v is number => v !== null && v > 0);

  return {
    citySlug,
    professionSlug: professionSlug ?? null,
    currency: "MAD",
    source: "observations" as const,
    country: "Morocco",
    ...computeSalaryPercentiles(values),
    observationCount: observations.length,
  };
}

export async function getSalaryByCompany(companySlug: string, professionSlug?: string) {
  const observations = await getSalaryObservationsFiltered({
    companySlug,
    professionSlug,
  });
  const values = observations
    .map(observationMidpoint)
    .filter((v): v is number => v !== null && v > 0);

  return {
    companySlug,
    professionSlug: professionSlug ?? null,
    currency: "MAD",
    source: "observations" as const,
    country: "Morocco",
    ...computeSalaryPercentiles(values),
    observationCount: observations.length,
  };
}

export async function getSalaryByExperience(
  professionSlug: string,
  experience: "junior" | "mid" | "senior"
) {
  const keywords: Record<string, string[]> = {
    junior: ["junior", "débutant", "stage", "0-2", "1 an", "2 ans"],
    mid: ["confirmé", "3 ans", "4 ans", "5 ans", "intermédiaire"],
    senior: ["senior", "expert", "5+ ans", "7 ans", "10 ans", "lead"],
  };

  const observations = await prisma.salaryObservation.findMany({
    where: { titleNorm: professionSlug },
    select: {
      salaryMin: true,
      salaryMax: true,
      jobId: true,
    },
    take: 1000,
  });

  const jobIds = observations.map((o) => o.jobId);
  const jobs = await prisma.job.findMany({
    where: { id: { in: jobIds } },
    select: { id: true, title: true, description: true },
  });
  const jobMap = new Map(jobs.map((j) => [j.id, j]));

  const kws = keywords[experience];
  const matched = observations.filter((o) => {
    const job = jobMap.get(o.jobId);
    if (!job) return false;
    const text = `${job.title} ${job.description}`.toLowerCase();
    return kws.some((kw) => text.includes(kw));
  });

  const values = matched
    .map(observationMidpoint)
    .filter((v): v is number => v !== null && v > 0);

  return {
    professionSlug,
    experience,
    currency: "MAD",
    source: "observations" as const,
    country: "Morocco",
    ...computeSalaryPercentiles(values),
    observationCount: matched.length,
  };
}
