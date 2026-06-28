import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.job.findMany({
    where: { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    select: { title: true, salary: true, description: true, requirements: true, source: true },
    take: 568,
  });

  const patterns = [
    { name: "salaire", re: /salaire/i },
    { name: "rémunération", re: /r[eé]mun[eé]ration/i },
    { name: "MAD", re: /\bmad\b/i },
    { name: "DH", re: /\b\d+\s*dh\b|\bdh\b/i },
    { name: "dirham", re: /dirham/i },
    { name: "net/brut", re: /\b(net|brut)\b/i },
    { name: "k MAD", re: /\d\s*k\b/i },
    { name: "4+ digit", re: /\b\d{4,6}\b/ },
    { name: "€", re: /€|eur\b/i },
  ];

  console.log("Jobs by source:");
  const bySource = new Map<string, number>();
  jobs.forEach((j) => bySource.set(j.source, (bySource.get(j.source) ?? 0) + 1));
  bySource.forEach((c, s) => console.log(`  ${s}: ${c}`));

  console.log("\nPattern hits in description+requirements:");
  for (const p of patterns) {
    const hits = jobs.filter((j) =>
      p.re.test(j.description + " " + (j.requirements ?? ""))
    );
    console.log(`  ${p.name}: ${hits.length}`);
    if (hits.length > 0 && hits.length <= 5) {
      hits.forEach((j) => {
        const text = (j.description + " " + (j.requirements ?? "")).slice(0, 200);
        const m = text.match(p.re);
        console.log(`    → ${j.title.slice(0, 35)} | ${m?.[0]}`);
      });
    }
  }

  // Sample jobs with salaire keyword
  const salaireJobs = jobs.filter((j) => /salaire|r[eé]mun/i.test(j.description));
  console.log(`\nJobs mentioning salaire/rémunération: ${salaireJobs.length}`);
  salaireJobs.slice(0, 8).forEach((j) => {
    const idx = j.description.toLowerCase().search(/salaire|r[eé]mun/);
    console.log(`  ${j.title.slice(0, 40)}`);
    console.log(`    ...${j.description.slice(Math.max(0, idx - 20), idx + 80).replace(/\n/g, " ")}...`);
  });
}

main().finally(() => prisma.$disconnect());
