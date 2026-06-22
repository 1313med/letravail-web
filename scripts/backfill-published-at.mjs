import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$executeRaw`
    UPDATE jobs
    SET "publishedAt" = "createdAt"
    WHERE "publishedAt" IS NULL
  `;

  const total = await prisma.job.count();
  const linkedin = await prisma.job.count({ where: { source: "linkedin" } });
  const nullPublished = await prisma.job.count({ where: { publishedAt: null } });

  console.log(
    JSON.stringify(
      { backfilledRows: Number(result), total, linkedin, nullPublished },
      null,
      2
    )
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
