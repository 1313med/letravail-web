import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.job.count();
  const bySource = await prisma.job.groupBy({
    by: ["source"],
    _count: true,
    orderBy: { _count: { source: "desc" } },
  });

  const linkedin = await prisma.job.count({ where: { source: "linkedin" } });
  const linkedinNoLoc = await prisma.job.count({
    where: { source: "linkedin", locationId: null },
  });
  const linkedinNoPub = await prisma.job.count({
    where: { source: "linkedin", publishedAt: null },
  });
  const linkedinNoCompany = await prisma.job.count({
    where: { source: "linkedin", companyId: null },
  });

  const recentLinkedin = await prisma.job.findMany({
    where: { source: "linkedin" },
    select: {
      slug: true,
      title: true,
      company: true,
      city: true,
      locationId: true,
      publishedAt: true,
      createdAt: true,
      applicationUrl: true,
    },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  // Jobs in listing order (first page)
  const page1 = await prisma.job.findMany({
    select: { slug: true, title: true, source: true, publishedAt: true, createdAt: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 30,
  });

  const linkedinOnPage1 = page1.filter((j) => j.source === "linkedin").length;

  // LinkedIn jobs NOT in top 100 by publishedAt sort
  const top100 = await prisma.job.findMany({
    select: { slug: true, source: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 100,
  });
  const top100Slugs = new Set(top100.map((j) => j.slug));
  const linkedinNotInTop100 = await prisma.job.findMany({
    where: { source: "linkedin", slug: { notIn: [...top100Slugs] } },
    select: { slug: true, title: true, publishedAt: true, createdAt: true },
    take: 10,
  });

  console.log(
    JSON.stringify(
      {
        total,
        linkedin,
        linkedinNoLoc,
        linkedinNoPub,
        linkedinNoCompany,
        linkedinOnPage1,
        linkedinNotInTop100Count: linkedinNotInTop100.length,
        linkedinNotInTop100Sample: linkedinNotInTop100,
        bySource: bySource.slice(0, 20),
        recentLinkedin,
        page1Sources: page1.map((j) => j.source),
      },
      null,
      2
    )
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
