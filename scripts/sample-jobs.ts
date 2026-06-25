import { PrismaClient } from "@prisma/client";

async function main() {
  const p = new PrismaClient();
  const jobs = await p.job.findMany({
    where: { source: "attijariwafa-bank" },
    select: { title: true, description: true, salary: true },
  });
  for (const j of jobs) {
    const text = j.description ?? "";
    const hasMoney = /\d{4,}/.test(text);
    const hasSalaryWord = /salaire|r[eé]mun|mad|dh\b|dirham/i.test(text);
    console.log(`[${hasMoney ? "NUM" : "   "}${hasSalaryWord ? " SAL" : ""}] ${j.title.slice(0, 50)} (${text.length}c)`);
    if (hasMoney || hasSalaryWord) {
      const nums = text.match(/\d[\d\s.,]{2,10}/g);
      console.log("  numbers:", nums?.slice(0, 5));
    }
  }
  await p.$disconnect();
}

main();
