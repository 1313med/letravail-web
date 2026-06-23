import { prisma } from "./db";
import { activeJobsWhere } from "./queries";
import { parseSalaryRange } from "./job-detail";
import { SALARY_ROLES } from "./salary-data";

export async function syncSalaryObservations(limit = 1000) {
  const jobs = await prisma.job.findMany({
    where: { AND: [activeJobsWhere(), { salary: { not: null } }] },
    select: {
      id: true,
      title: true,
      salary: true,
      contractType: true,
      location: { select: { slug: true } },
      tags: { select: { tag: { select: { slug: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  let inserted = 0;
  for (const job of jobs) {
    const parsed = parseSalaryRange(job.salary, job.title);
    if (!parsed.min && !parsed.max) continue;

    const sectorSlug = job.tags[0]?.tag.slug ?? null;
    const titleNorm =
      SALARY_ROLES.find((r) =>
        r.keywords.some((kw) => job.title.toLowerCase().includes(kw.toLowerCase()))
      )?.slug ?? job.title.toLowerCase().slice(0, 80);

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

  return { processed: jobs.length, inserted };
}
