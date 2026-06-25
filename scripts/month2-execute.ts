/**
 * Month 2 sprint — data recovery, seeding, classification audit, before/after compliance.
 * Run: npm run month2:execute
 */
import { PrismaClient } from "@prisma/client";
import { syncSalaryObservations } from "../src/lib/data-moat";
import {
  auditJobPostingFields,
  aggregateComplianceReport,
  complianceScore,
} from "../src/lib/google-jobs-compliance";
import { buildProfessionGraph, getProfessionJobCount } from "../src/lib/knowledge-graph";
import { shouldNoindexProfession } from "../src/lib/indexation";
import { MIN_JOBS_FOR_PROFESSION_INDEX, MIN_OBSERVATIONS_FOR_SALARY_INDEX } from "../src/lib/constants";
import { extractSalaryFromJobText } from "../src/lib/moroccan-salary-parser";
import {
  classifyJobTitleAll,
  isMultiMatch,
  isUnclassified,
  isWeakMatch,
  professionSearchTerms,
} from "../src/lib/profession-classifier";
import { PROFESSION_SEEDS } from "../src/lib/profession-taxonomy";
import { computeSalaryConfidence, getSalaryByProfession } from "../src/lib/salary-intelligence";
import { SALARY_ROLES } from "../src/lib/salary-data";
import { activeJobsWhere } from "../src/lib/queries";

const prisma = new PrismaClient();

function activeWhere() {
  return { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] };
}

async function salaryInvestigation() {
  const jobs = await prisma.job.findMany({
    where: activeWhere(),
    select: {
      id: true,
      title: true,
      salary: true,
      description: true,
      requirements: true,
      source: true,
    },
  });

  const withField = jobs.filter((j) => j.salary?.trim());
  const extractable = jobs.filter((j) =>
    extractSalaryFromJobText({
      salary: j.salary,
      description: j.description,
      requirements: j.requirements,
    })
  );
  const thinDesc = jobs.filter((j) => (j.description?.length ?? 0) <= 50);

  const bySource = new Map<string, { total: number; extractable: number }>();
  for (const j of jobs) {
    const e = bySource.get(j.source) ?? { total: 0, extractable: 0 };
    e.total++;
    if (
      extractSalaryFromJobText({
        salary: j.salary,
        description: j.description,
        requirements: j.requirements,
      })
    ) {
      e.extractable++;
    }
    bySource.set(j.source, e);
  }

  return {
    totalJobs: jobs.length,
    withSalaryField: withField.length,
    extractableFromText: extractable.length,
    thinDescriptions: thinDesc.length,
    rootCause:
      withField.length === 0
        ? "Scraper never populates job.salary; 85% of jobs have title-only descriptions (≤50 chars)"
        : "Partial salary field population",
    bySource: Object.fromEntries(bySource),
    samples: extractable.slice(0, 5).map((j) => ({
      title: j.title,
      extracted: extractSalaryFromJobText({
        salary: j.salary,
        description: j.description,
        requirements: j.requirements,
      }),
    })),
  };
}

async function potentialSalaryCoverage() {
  const rows = await Promise.all(
    PROFESSION_SEEDS.filter((p) => p.salarySlug).map(async (p) => {
      const jobs = await prisma.job.findMany({
        where: { AND: [activeJobsWhere(), { OR: professionSearchTerms(p).map((kw) => ({ title: { contains: kw, mode: "insensitive" as const } })) }] },
        select: { salary: true, description: true, requirements: true },
      });
      const withSalary = jobs.filter((j) =>
        extractSalaryFromJobText({
          salary: j.salary,
          description: j.description,
          requirements: j.requirements,
        })
      );
      return {
        profession: p.name,
        totalJobs: jobs.length,
        jobsWithSalary: withSalary.length,
        coveragePct: jobs.length ? Math.round((withSalary.length / jobs.length) * 100) : 0,
        expectedObservations: withSalary.length,
        salarySlug: p.salarySlug,
      };
    })
  );
  return rows.sort((a, b) => b.jobsWithSalary - a.jobsWithSalary);
}

async function classificationReport() {
  const jobs = await prisma.job.findMany({
    where: activeWhere(),
    select: { title: true },
  });

  let unclassified = 0;
  let weak = 0;
  let multi = 0;
  const examples: { title: string; match: string; score: number }[] = [];

  for (const job of jobs) {
    const matches = classifyJobTitleAll(job.title);
    if (isUnclassified(matches)) unclassified++;
    else if (isWeakMatch(matches[0])) weak++;
    if (isMultiMatch(matches)) multi++;
    if (isUnclassified(matches) && examples.length < 8) {
      examples.push({ title: job.title, match: "—", score: 0 });
    }
  }

  return {
    totalJobs: jobs.length,
    unclassified,
    weaklyClassified: weak,
    multiMatch: multi,
    classified: jobs.length - unclassified,
    classificationRate: Math.round(((jobs.length - unclassified) / jobs.length) * 100),
    unclassifiedExamples: examples,
  };
}

async function tierCBacklog() {
  const rows = await Promise.all(
    PROFESSION_SEEDS.map(async (p) => {
      const jobs = await getProfessionJobCount(p);
      const graph = await buildProfessionGraph(p);
      const indexable = !shouldNoindexProfession(jobs);
      if (indexable) return null;

      let blocking = "no_jobs";
      let action = "Await scraper volume or broaden matching rules";
      if (jobs > 0 && jobs < MIN_JOBS_FOR_PROFESSION_INDEX) {
        blocking = "below_index_threshold";
        action = `Need ${MIN_JOBS_FOR_PROFESSION_INDEX - jobs} more active jobs (has ${jobs})`;
      } else if (jobs >= MIN_JOBS_FOR_PROFESSION_INDEX && graph.coverage.companiesLinked === 0) {
        blocking = "no_companies";
        action = "Improve company linking on profession page";
      } else if (graph.coverage.citiesLinked === 0 && jobs > 0) {
        blocking = "no_city_diversity";
        action = "Enrich city coverage via location normalization";
      }

      return { profession: p.name, blockingFactor: blocking, requiredAction: action, jobs };
    })
  );
  return rows.filter(Boolean);
}

async function googleJobsAudit() {
  const jobs = await prisma.job.findMany({
    where: activeWhere(),
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      requirements: true,
      company: true,
      city: true,
      country: true,
      contractType: true,
      remote: true,
      applicationUrl: true,
      publishedAt: true,
      expiresAt: true,
      salary: true,
      location: { select: { slug: true } },
      companyRef: { select: { slug: true } },
      tags: { select: { tag: { select: { slug: true } } } },
    },
  });

  const audits = jobs.map((job) => {
    const issues = auditJobPostingFields({
      id: job.id,
      slug: job.slug,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      company: job.company,
      city: job.city,
      country: job.country,
      contractType: job.contractType,
      remote: job.remote,
      applicationUrl: job.applicationUrl,
      publishedAt: job.publishedAt,
      expiresAt: job.expiresAt,
      salary: job.salary,
      citySlug: job.location?.slug,
      companySlug: job.companyRef?.slug,
      tags: job.tags.map((t) => t.tag),
    });
    return { score: complianceScore(issues) };
  });

  const report = aggregateComplianceReport(
    audits.map((a, i) => ({
      slug: jobs[i].slug,
      issues: auditJobPostingFields({
        id: jobs[i].id,
        slug: jobs[i].slug,
        title: jobs[i].title,
        description: jobs[i].description,
        requirements: jobs[i].requirements,
        company: jobs[i].company,
        city: jobs[i].city,
        country: jobs[i].country,
        contractType: jobs[i].contractType,
        remote: jobs[i].remote,
        applicationUrl: jobs[i].applicationUrl,
        publishedAt: jobs[i].publishedAt,
        expiresAt: jobs[i].expiresAt,
        salary: jobs[i].salary,
        citySlug: jobs[i].location?.slug,
        companySlug: jobs[i].companyRef?.slug,
        tags: jobs[i].tags.map((t) => t.tag),
      }),
      score: a.score,
    }))
  );

  return {
    totalJobs: report.totalJobs,
    avgScore: report.avgComplianceScore,
    above90: audits.filter((a) => a.score >= 90).length,
    below70: audits.filter((a) => a.score < 70).length,
    targetMet: report.avgComplianceScore >= 90,
  };
}

async function dominationPlan() {
  const rows = await Promise.all(
    PROFESSION_SEEDS.map(async (p) => {
      const [jobs, graph] = await Promise.all([
        getProfessionJobCount(p),
        buildProfessionGraph(p),
      ]);
      const indexable = !shouldNoindexProfession(jobs);
      const priorityScore =
        jobs * 3 +
        graph.coverage.companiesLinked * 10 +
        graph.coverage.citiesLinked * 8 +
        graph.coverage.coverageScore * 0.5;

      let tier: "A" | "B" | "C" = "C";
      if (!indexable) tier = "C";
      else if (jobs >= 10 && graph.coverage.companiesLinked >= 3 && graph.coverage.citiesLinked >= 2)
        tier = "A";
      else tier = "B";

      return {
        profession: p.name,
        jobs,
        companies: graph.coverage.companiesLinked,
        cities: graph.coverage.citiesLinked,
        coverage: graph.coverage.coverageScore,
        indexable: indexable ? "Yes" : "No",
        tier,
        priorityScore: Math.round(priorityScore),
      };
    })
  );
  return rows.sort((a, b) => b.priorityScore - a.priorityScore);
}

async function main() {
  console.log("\n# MONTH 2 EXECUTION\n");

  // BEFORE compliance
  const beforeGJ = await googleJobsAudit();
  console.log("## Google Jobs BEFORE:", beforeGJ);

  // P1: Salary sync
  console.log("\n## P1: Salary investigation");
  const investigation = await salaryInvestigation();
  console.log(JSON.stringify(investigation, null, 2));

  console.log("\nRunning salary sync pipeline…");
  const syncResult = await syncSalaryObservations(5000);
  console.log("Sync result:", syncResult);

  const obsCount = await prisma.salaryObservation.count();
  console.log("SalaryObservation rows after sync:", obsCount);

  console.log("\n## Potential salary coverage");
  const potential = await potentialSalaryCoverage();
  console.table(potential.filter((p) => p.totalJobs > 0).slice(0, 15));

  // P2: Seed professions
  console.log("\n## P2: Seeding professions + skills…");
  const { execSync } = await import("child_process");
  execSync("npx tsx scripts/seed-professions.ts", { stdio: "inherit" });

  const [profCount, skillCount] = await Promise.all([
    prisma.profession.count(),
    prisma.skill.count(),
  ]);
  console.log(`DB: ${profCount} professions, ${skillCount} skills`);

  // P3-P4
  console.log("\n## P4: Classification report");
  const classification = await classificationReport();
  console.log(classification);

  console.log("\n## P3: Tier C enrichment backlog (sample)");
  const backlog = await tierCBacklog();
  console.table(backlog?.slice(0, 15) ?? []);

  // P5 AFTER
  const afterGJ = await googleJobsAudit();
  console.log("\n## P5: Google Jobs AFTER:", afterGJ);
  console.log(`Delta: ${afterGJ.avgScore - beforeGJ.avgScore} points`);

  // P6
  console.log("\n## P6: Month 2 domination plan (top 15)");
  const plan = await dominationPlan();
  console.table(plan.slice(0, 15));

  const indexableSalaries = await Promise.all(
    SALARY_ROLES.map(async (r) => {
      const obs = await prisma.salaryObservation.count({ where: { titleNorm: r.slug } });
      return { role: r.title, obs, indexable: obs >= MIN_OBSERVATIONS_FOR_SALARY_INDEX };
    })
  );
  console.log("\n## Salary indexability:", indexableSalaries);

  console.log("\n## SUCCESS METRICS");
  console.log({
    professionsInDb: profCount,
    skillsInDb: skillCount,
    salaryObservations: obsCount,
    googleJobsScore: afterGJ.avgScore,
    googleJobsTargetMet: afterGJ.targetMet,
    indexableProfessions: plan.filter((p) => p.indexable === "Yes").length,
    tierA: plan.filter((p) => p.tier === "A").length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
