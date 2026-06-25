import { prisma } from "./db";
import { activeJobsWhere } from "./queries";
import { parseSalaryRange } from "./job-detail";
import { extractSalaryFromJobText, formatSalaryRange } from "./moroccan-salary-parser";
import { classifyJobTitle } from "./profession-classifier";
import { SALARY_ROLES } from "./salary-data";

function resolveTitleNorm(title: string): string {
  const classified = classifyJobTitle(title);
  if (classified) {
    const salarySlug = classified.profession.salarySlug;
    if (salarySlug) return salarySlug;
  }
  const role = SALARY_ROLES.find((r) =>
    r.keywords.some((kw) => title.toLowerCase().includes(kw.toLowerCase()))
  );
  return role?.slug ?? title.toLowerCase().slice(0, 80);
}

export async function syncSalaryObservations(limit = 5000) {
  const jobs = await prisma.job.findMany({
    where: activeJobsWhere(),
    select: {
      id: true,
      title: true,
      salary: true,
      description: true,
      requirements: true,
      contractType: true,
      location: { select: { slug: true } },
      tags: { select: { tag: { select: { slug: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  let inserted = 0;
  let skippedNoSalary = 0;
  let backfilledField = 0;

  for (const job of jobs) {
    let salaryText = job.salary;

    if (!salaryText?.trim()) {
      const extracted = extractSalaryFromJobText({
        description: job.description,
        requirements: job.requirements,
      });
      if (extracted) {
        salaryText = formatSalaryRange(extracted.min, extracted.max);
        await prisma.job.update({
          where: { id: job.id },
          data: { salary: salaryText },
        });
        backfilledField++;
      }
    }

    const parsed = parseSalaryRange(
      salaryText,
      job.title,
      job.description,
      job.requirements
    );
    if (!parsed.min && !parsed.max) {
      skippedNoSalary++;
      continue;
    }

    const sectorSlug = job.tags[0]?.tag.slug ?? null;
    const titleNorm = resolveTitleNorm(job.title);

    const existing = await prisma.salaryObservation.findFirst({
      where: { jobId: job.id },
      orderBy: { observedAt: "desc" },
    });

    if (
      existing &&
      existing.salaryMin === parsed.min &&
      existing.salaryMax === parsed.max
    ) {
      continue;
    }

    await prisma.salaryObservation.create({
      data: {
        jobId: job.id,
        titleNorm,
        citySlug: job.location?.slug ?? null,
        sectorSlug,
        salaryMin: parsed.min,
        salaryMax: parsed.max,
        contractType: job.contractType,
        source: "scraped",
      },
    });
    inserted++;
  }

  return {
    processed: jobs.length,
    inserted,
    skippedNoSalary,
    backfilledField,
  };
}
