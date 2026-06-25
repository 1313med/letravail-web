/** Quick salary field diagnostic — run: npx tsx scripts/diagnose-salary.ts */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SALARY_IN_DESC = /(?:\d[\d\s.,]*\s*k?\s*(?:mad|dh|dhs|dirham|dirhams)|(?:mad|dh|dhs)\s*\d[\d\s.,]*|\d[\d\s.,]+\s*(?:mad|dh|dhs|dirham)(?:\s*\/\s*mois)?|\d{4,5}\s*(?:net|brut))/i;

async function main() {
  const jobs = await prisma.job.findMany({
    where: { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    select: { id: true, title: true, salary: true, description: true },
  });

  const withSalaryField = jobs.filter((j) => j.salary?.trim());
  const salaryInDesc = jobs.filter(
    (j) => !j.salary?.trim() && SALARY_IN_DESC.test(j.description)
  );
  const both = jobs.filter(
    (j) => j.salary?.trim() && SALARY_IN_DESC.test(j.description)
  );

  console.log("Total active jobs:", jobs.length);
  console.log("With salary field:", withSalaryField.length);
  console.log("Salary in description only:", salaryInDesc.length);
  console.log("Both field + description:", both.length);

  console.log("\nSample salary fields:");
  withSalaryField.slice(0, 15).forEach((j) =>
    console.log(`  [${j.title.slice(0, 40)}] → "${j.salary}"`)
  );

  console.log("\nSample description-only salaries:");
  salaryInDesc.slice(0, 10).forEach((j) => {
    const m = j.description.match(SALARY_IN_DESC);
    console.log(`  [${j.title.slice(0, 40)}] → "${m?.[0]}"`);
  });

  const obs = await prisma.salaryObservation.count();
  console.log("\nSalaryObservation count:", obs);
}

main().finally(() => prisma.$disconnect());
