/**
 * Phase 1 validation — reads real DB data only, no synthetic estimates.
 * Run: npm run validate:phase1
 */
import { PrismaClient } from "@prisma/client";
import {
  auditJobPostingFields,
  aggregateComplianceReport,
  complianceScore,
} from "../src/lib/google-jobs-compliance";
import { getGscReadinessReport } from "../src/lib/gsc-readiness";
import {
  buildProfessionGraph,
  getProfessionHiringCities,
  getProfessionHiringCompanies,
  getProfessionJobCount,
} from "../src/lib/knowledge-graph";
import { shouldNoindexProfession } from "../src/lib/indexation";
import { MIN_JOBS_FOR_PROFESSION_INDEX, MIN_OBSERVATIONS_FOR_SALARY_INDEX } from "../src/lib/constants";
import { PROFESSION_SEEDS } from "../src/lib/profession-taxonomy";
import {
  computeSalaryConfidence,
  getSalaryByProfession,
  getSalaryObservationsFiltered,
} from "../src/lib/salary-intelligence";
import { SALARY_ROLES, salaryPublicSlug } from "../src/lib/salary-data";
import { getIndexableProfessionSlugs } from "../src/lib/knowledge-graph";

const prisma = new PrismaClient();

function activeJobsWhere() {
  return { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] };
}

type TaxonomyStatus = "READY" | "PARTIAL" | "WEAK";
type Tier = "A" | "B" | "C";
type SalaryStatus = "READY" | "NEAR READY" | "INSUFFICIENT DATA";

function taxonomyStatus(skills: number, related: number, keywords: number): TaxonomyStatus {
  if (skills >= 3 && keywords >= 2 && related >= 1) return "READY";
  if (skills >= 1 && keywords >= 1) return "PARTIAL";
  return "WEAK";
}

function classifyTier(
  jobs: number,
  companies: number,
  cities: number,
  coverage: number,
  indexable: boolean
): Tier {
  if (!indexable) return "C";
  if (jobs >= 10 && companies >= 3 && cities >= 2 && coverage >= 60) return "A";
  if (jobs >= MIN_JOBS_FOR_PROFESSION_INDEX) return "B";
  return "C";
}

function salaryStatus(obs: number): SalaryStatus {
  if (obs >= MIN_OBSERVATIONS_FOR_SALARY_INDEX) return "READY";
  if (obs >= 3) return "NEAR READY";
  return "INSUFFICIENT DATA";
}

function graphMissingRelations(coverage: {
  skillsLinked: number;
  citiesLinked: number;
  companiesLinked: number;
  salariesLinked: number;
  relatedProfessionsLinked: number;
  jobsLinked: number;
}, profession: (typeof PROFESSION_SEEDS)[0]): string[] {
  const missing: string[] = [];
  if (profession.skills.length === 0) missing.push("skills");
  if (coverage.citiesLinked === 0) missing.push("cities");
  if (coverage.companiesLinked === 0) missing.push("companies");
  if (profession.salarySlug && coverage.salariesLinked === 0) missing.push("salary");
  if (coverage.relatedProfessionsLinked === 0) missing.push("related_professions");
  if (coverage.jobsLinked < MIN_JOBS_FOR_PROFESSION_INDEX) missing.push("jobs");
  return missing;
}

async function report1TaxonomyValidation() {
  const [dbProfessions, dbSkills] = await Promise.all([
    prisma.profession.findMany({ orderBy: { slug: "asc" } }),
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
  ]);

  const seedSlugs = PROFESSION_SEEDS.map((p) => p.slug);
  const duplicateSlugs = seedSlugs.filter((s, i) => seedSlugs.indexOf(s) !== i);
  const duplicateNames = PROFESSION_SEEDS.map((p) => p.name.toLowerCase()).filter(
    (n, i, arr) => arr.indexOf(n) !== i
  );

  const dbOnly = dbProfessions.filter((p) => !seedSlugs.includes(p.slug));
  const seedOnly = PROFESSION_SEEDS.filter(
    (s) => !dbProfessions.some((p) => p.slug === s.slug)
  );

  const rows = await Promise.all(
    PROFESSION_SEEDS.map(async (p) => {
      const [jobs, companies, cities] = await Promise.all([
        getProfessionJobCount(p),
        getProfessionHiringCompanies(p, 100),
        getProfessionHiringCities(p, 100),
      ]);
      const dbRow = dbProfessions.find((d) => d.slug === p.slug);
      const skills = dbRow?.skills.length ? dbRow.skills : p.skills;
      return {
        profession: p.name,
        slug: p.slug,
        skills: skills.length,
        skillList: skills.join(", "),
        activeJobs: jobs,
        companies: companies.length,
        cities: cities.length,
        relatedProfessions: p.relatedSlugs.length,
        salarySlug: p.salarySlug ?? "—",
        inDatabase: Boolean(dbRow),
        status: taxonomyStatus(skills.length, p.relatedSlugs.length, p.keywords.length),
      };
    })
  );

  const withoutSkills = rows.filter((r) => r.skills === 0);
  const emptyRelations = rows.filter((r) => r.relatedProfessions === 0);

  return {
    summary: {
      totalProfessionsSeed: PROFESSION_SEEDS.length,
      totalProfessionsDb: dbProfessions.length,
      totalSkillsDb: dbSkills.length,
      avgSkillsPerProfession:
        Math.round((rows.reduce((s, r) => s + r.skills, 0) / rows.length) * 10) / 10,
      professionsWithoutSkills: withoutSkills.length,
      duplicateSlugs,
      duplicateNames,
      seedNotInDb: seedOnly.map((p) => p.slug),
      dbNotInSeed: dbOnly.map((p) => p.slug),
      emptyRelatedProfessions: emptyRelations.map((r) => r.profession),
      statusCounts: {
        READY: rows.filter((r) => r.status === "READY").length,
        PARTIAL: rows.filter((r) => r.status === "PARTIAL").length,
        WEAK: rows.filter((r) => r.status === "WEAK").length,
      },
    },
    rows,
  };
}

async function report2ProfessionCoverage() {
  const rows = await Promise.all(
    PROFESSION_SEEDS.map(async (p) => {
      const graph = await buildProfessionGraph(p);
      const salarySlug = p.salarySlug ?? p.slug;
      const salaryObs = await prisma.salaryObservation.count({
        where: { titleNorm: salarySlug },
      });
      const indexable = !shouldNoindexProfession(graph.jobCount);

      return {
        profession: p.name,
        slug: p.slug,
        jobs: graph.jobCount,
        companies: graph.coverage.companiesLinked,
        cities: graph.coverage.citiesLinked,
        skills: graph.coverage.skillsLinked,
        salaryObs,
        coverageScore: graph.coverage.coverageScore,
        indexable: indexable ? "Yes" : "No",
        tier: classifyTier(
          graph.jobCount,
          graph.coverage.companiesLinked,
          graph.coverage.citiesLinked,
          graph.coverage.coverageScore,
          indexable
        ),
        pageUrl: `/emploi-${p.slug}-maroc`,
      };
    })
  );

  rows.sort((a, b) => b.jobs - a.jobs);

  return {
    summary: {
      tierA: rows.filter((r) => r.tier === "A"),
      tierB: rows.filter((r) => r.tier === "B"),
      tierC: rows.filter((r) => r.tier === "C"),
      indexableCount: rows.filter((r) => r.indexable === "Yes").length,
      totalProfessions: rows.length,
    },
    rows,
  };
}

async function report3SalaryCoverage() {
  const allObs = await prisma.salaryObservation.groupBy({
    by: ["titleNorm"],
    _count: { _all: true },
  });
  const obsMap = new Map(allObs.map((o) => [o.titleNorm, o._count._all]));

  const salaryRoleSlugs = new Set<string>(SALARY_ROLES.map((r) => r.slug));
  const professionSalarySlugs = Array.from(
    new Set(PROFESSION_SEEDS.map((p) => p.salarySlug).filter(Boolean) as string[])
  );

  const rows = await Promise.all(
    professionSalarySlugs.map(async (slug) => {
      const role = SALARY_ROLES.find((r) => r.slug === slug);
      const obs = obsMap.get(slug) ?? 0;
      let p25: number | null = null;
      let p50: number | null = null;
      let p75: number | null = null;
      let confidenceScore = 0;

      if (obs > 0) {
        const salary = await getSalaryByProfession(slug);
        p25 = salary.p25;
        p50 = salary.p50;
        p75 = salary.p75;
        confidenceScore = salary.confidence.score;
      } else {
        const conf = await computeSalaryConfidence(slug);
        confidenceScore = conf.score;
      }

      return {
        profession: role?.title ?? slug,
        salarySlug: slug,
        observations: obs,
        p25,
        p50,
        p75,
        confidenceScore,
        indexable: obs >= MIN_OBSERVATIONS_FOR_SALARY_INDEX ? "Yes" : "No",
        status: salaryStatus(obs),
        pageUrl: `/${salaryPublicSlug(slug)}`,
        inSalaryRoles: salaryRoleSlugs.has(slug),
      };
    })
  );

  rows.sort((a, b) => b.observations - a.observations);

  const indexableSalaryPages = SALARY_ROLES.filter(
    (r) => (obsMap.get(r.slug) ?? 0) >= MIN_OBSERVATIONS_FOR_SALARY_INDEX
  );

  return {
    summary: {
      totalObservations: await prisma.salaryObservation.count(),
      indexableSalaryPagesToday: indexableSalaryPages.length,
      totalSalaryRoles: SALARY_ROLES.length,
      ready: rows.filter((r) => r.status === "READY"),
      nearReady: rows.filter((r) => r.status === "NEAR READY"),
      insufficient: rows.filter((r) => r.status === "INSUFFICIENT DATA"),
      unmappedObservations: allObs
        .filter((o) => !salaryRoleSlugs.has(o.titleNorm))
        .map((o) => ({ titleNorm: o.titleNorm, count: o._count._all }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15),
    },
    rows,
  };
}

async function report4KnowledgeGraph() {
  const rows = await Promise.all(
    PROFESSION_SEEDS.map(async (p) => {
      const graph = await buildProfessionGraph(p);
      const missing = graphMissingRelations(graph.coverage, p);
      return {
        profession: p.name,
        coveragePct: graph.coverage.coverageScore,
        skills: graph.coverage.skillsLinked,
        companies: graph.coverage.companiesLinked,
        cities: graph.coverage.citiesLinked,
        salaries: graph.coverage.salariesLinked,
        jobs: graph.coverage.jobsLinked,
        relatedProfessions: graph.coverage.relatedProfessionsLinked,
        missingRelationships: missing.length ? missing.join(", ") : "—",
        edgeCount: graph.edges.length,
      };
    })
  );

  rows.sort((a, b) => a.coveragePct - b.coveragePct);

  const avgCoverage =
    rows.length > 0
      ? Math.round(rows.reduce((s, r) => s + r.coveragePct, 0) / rows.length)
      : 0;

  return {
    summary: {
      avgCoveragePct: avgCoverage,
      strong: rows.filter((r) => r.coveragePct >= 70),
      weak: rows.filter((r) => r.coveragePct < 40),
      mostConnected: [...rows].sort((a, b) => b.coveragePct - a.coveragePct).slice(0, 5),
      leastConnected: rows.slice(0, 5),
    },
    rows,
  };
}

async function report5GoogleJobs() {
  const jobs = await prisma.job.findMany({
    where: activeJobsWhere(),
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
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
    return { slug: job.slug, issues, score: complianceScore(issues) };
  });

  const report = aggregateComplianceReport(audits);

  const fieldFreq = new Map<string, number>();
  for (const a of audits) {
    for (const issue of a.issues) {
      if (issue.status === "ok" || issue.status === "auto_fixed") continue;
      fieldFreq.set(issue.field, (fieldFreq.get(issue.field) ?? 0) + 1);
    }
  }

  return {
    summary: {
      totalJobsAudited: report.totalJobs,
      avgComplianceScore: report.avgComplianceScore,
      jobsAbove90: audits.filter((a) => a.score >= 90).length,
      jobsBelow70: audits.filter((a) => a.score < 70).length,
      fullyCompliant: report.fullyCompliant,
      targetMet: report.avgComplianceScore >= 90,
      topMissingFields: Array.from(fieldFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([field, count]) => ({ field, count, pct: Math.round((count / report.totalJobs) * 100) })),
    },
    fieldBreakdown: report.fieldBreakdown,
    topIssues: report.topIssues,
  };
}

async function report6LaunchReadiness(
  r2: Awaited<ReturnType<typeof report2ProfessionCoverage>>,
  r3: Awaited<ReturnType<typeof report3SalaryCoverage>>,
  r4: Awaited<ReturnType<typeof report4KnowledgeGraph>>,
  r5: Awaited<ReturnType<typeof report5GoogleJobs>>
) {
  const gsc = getGscReadinessReport();
  const indexableProfessions = await getIndexableProfessionSlugs();
  const totalActiveJobs = await prisma.job.count({ where: activeJobsWhere() });

  const areas = [
    {
      area: "Google Jobs",
      score: r5.summary.avgComplianceScore,
      risk: r5.summary.avgComplianceScore >= 85 ? "Low" : r5.summary.avgComplianceScore >= 70 ? "Medium" : "High",
      blocking: r5.summary.targetMet ? [] : [`Avg compliance ${r5.summary.avgComplianceScore}/100 (target >90)`],
      fixes: r5.summary.topMissingFields.slice(0, 3).map((f) => `Fix ${f.field} (${f.pct}% jobs)`),
    },
    {
      area: "Profession Pages",
      score: Math.round((r2.summary.indexableCount / PROFESSION_SEEDS.length) * 100),
      risk: r2.summary.tierA.length >= 4 ? "Low" : "Medium",
      blocking: r2.summary.indexableCount === 0 ? ["No indexable profession pages"] : [],
      fixes: r2.summary.tierB.slice(0, 3).map((p) => `Grow job volume for ${p.profession} (${p.jobs} jobs)`),
    },
    {
      area: "Salary Pages",
      score: Math.round((r3.summary.indexableSalaryPagesToday / SALARY_ROLES.length) * 100),
      risk: r3.summary.indexableSalaryPagesToday >= 3 ? "Low" : "High",
      blocking: r3.summary.indexableSalaryPagesToday === 0 ? ["No indexable salary pages (need ≥5 obs each)"] : [],
      fixes: r3.summary.nearReady.map((s) => `Sync observations for ${s.profession} (${s.observations}/5)`),
    },
    {
      area: "Knowledge Graph",
      score: r4.summary.avgCoveragePct,
      risk: r4.summary.avgCoveragePct >= 50 ? "Medium" : "High",
      blocking: [],
      fixes: r4.summary.leastConnected.slice(0, 3).map((p) => `Enrich graph for ${p.profession} (${p.coveragePct}%)`),
    },
    {
      area: "Internal Linking",
      score: r2.summary.tierA.length >= 3 ? 75 : 50,
      risk: "Low",
      blocking: [],
      fixes: ["Verify profession→company→city links on Tier A pages"],
    },
    {
      area: "Sitemaps",
      score: gsc.checks.find((c) => c.id === "sitemap-index")?.status === "ready" ? 90 : 50,
      risk: "Low",
      blocking: [],
      fixes: ["Submit /sitemap.xml to GSC on deploy"],
    },
    {
      area: "Search Console",
      score: gsc.ready ? 90 : gsc.checks.filter((c) => c.status === "ready").length * 12,
      risk: gsc.checks.find((c) => c.id === "gsc-credentials")?.status === "missing" ? "Medium" : "Low",
      blocking: gsc.checks.filter((c) => c.status === "missing").map((c) => c.label),
      fixes: ["Configure GSC_SERVICE_ACCOUNT_EMAIL + GSC_PRIVATE_KEY before launch"],
    },
  ];

  const blockers = areas.flatMap((a) => a.blocking);
  const avgScore = Math.round(areas.reduce((s, a) => s + a.score, 0) / areas.length);
  const ready =
    blockers.length === 0 &&
    r5.summary.avgComplianceScore >= 80 &&
    r2.summary.indexableCount >= 3 &&
    totalActiveJobs >= 50;

  return {
    verdict: ready ? "READY FOR DEPLOYMENT" : "NOT READY FOR DEPLOYMENT",
    justification: ready
      ? `${r2.summary.indexableCount} indexable profession pages, ${r3.summary.indexableSalaryPagesToday} salary pages, ${totalActiveJobs} active jobs, Google Jobs compliance ${r5.summary.avgComplianceScore}/100.`
      : `Blockers: ${blockers.length ? blockers.join("; ") : "Data thresholds not met"}. Avg area score ${avgScore}/100.`,
    totalActiveJobs,
    indexableProfessions: indexableProfessions.length,
    areas,
    gscChecks: gsc.checks,
  };
}

function printMarkdown(
  r1: Awaited<ReturnType<typeof report1TaxonomyValidation>>,
  r2: Awaited<ReturnType<typeof report2ProfessionCoverage>>,
  r3: Awaited<ReturnType<typeof report3SalaryCoverage>>,
  r4: Awaited<ReturnType<typeof report4KnowledgeGraph>>,
  r5: Awaited<ReturnType<typeof report5GoogleJobs>>,
  r6: Awaited<ReturnType<typeof report6LaunchReadiness>>
) {
  console.log("\n# LETRAVAIL.MA — PHASE 1 VALIDATION REPORT\n");
  console.log(`Generated: ${new Date().toISOString()}\n`);

  console.log("## 1. Profession Taxonomy Validation\n");
  console.log(`| Metric | Value |`);
  console.log(`|--------|-------|`);
  console.log(`| Total professions (seed) | ${r1.summary.totalProfessionsSeed} |`);
  console.log(`| Total professions (DB) | ${r1.summary.totalProfessionsDb} |`);
  console.log(`| Total skills (DB) | ${r1.summary.totalSkillsDb} |`);
  console.log(`| Avg skills/profession | ${r1.summary.avgSkillsPerProfession} |`);
  console.log(`| Without skills | ${r1.summary.professionsWithoutSkills} |`);
  console.log(`| READY / PARTIAL / WEAK | ${r1.summary.statusCounts.READY} / ${r1.summary.statusCounts.PARTIAL} / ${r1.summary.statusCounts.WEAK} |`);
  if (r1.summary.seedNotInDb.length) console.log(`\n⚠ Seed not in DB: ${r1.summary.seedNotInDb.join(", ")}`);
  console.log(`\n| Profession | Skills | Jobs | Companies | Cities | Status |`);
  console.log(`|------------|--------|------|-----------|--------|--------|`);
  for (const r of r1.rows) {
    console.log(`| ${r.profession} | ${r.skills} | ${r.activeJobs} | ${r.companies} | ${r.cities} | ${r.status} |`);
  }

  console.log("\n## 2. Profession Coverage Audit\n");
  console.log(`| Tier A (launch first) | ${r2.summary.tierA.length} |`);
  console.log(`| Tier B (needs volume) | ${r2.summary.tierB.length} |`);
  console.log(`| Tier C (noindex) | ${r2.summary.tierC.length} |`);
  console.log(`| Indexable today | ${r2.summary.indexableCount} |\n`);
  console.log(`| Profession | Jobs | Cos | Cities | Skills | Sal Obs | Coverage | Index | Tier |`);
  console.log(`|------------|------|-----|--------|--------|---------|----------|-------|------|`);
  for (const r of r2.rows) {
    console.log(`| ${r.profession} | ${r.jobs} | ${r.companies} | ${r.cities} | ${r.skills} | ${r.salaryObs} | ${r.coverageScore}% | ${r.indexable} | ${r.tier} |`);
  }

  console.log("\n## 3. Salary Coverage Audit\n");
  console.log(`| Total observations | ${r3.summary.totalObservations} |`);
  console.log(`| Indexable salary pages | ${r3.summary.indexableSalaryPagesToday} / ${r3.summary.totalSalaryRoles} |`);
  console.log(`| READY / NEAR READY / INSUFFICIENT | ${r3.summary.ready.length} / ${r3.summary.nearReady.length} / ${r3.summary.insufficient.length} |\n`);
  console.log(`| Profession | Obs | P25 | P50 | P75 | Confidence | Status | Index |`);
  console.log(`|------------|-----|-----|-----|-----|------------|--------|-------|`);
  for (const r of r3.rows) {
    console.log(`| ${r.profession} | ${r.observations} | ${r.p25 ?? "—"} | ${r.p50 ?? "—"} | ${r.p75 ?? "—"} | ${r.confidenceScore} | ${r.status} | ${r.indexable} |`);
  }

  console.log("\n## 4. Knowledge Graph Coverage\n");
  console.log(`| Avg coverage | ${r4.summary.avgCoveragePct}% |\n`);
  console.log(`| Profession | Coverage | Skills | Cos | Cities | Sal | Jobs | Missing |`);
  console.log(`|------------|----------|--------|-----|--------|-----|------|---------|`);
  for (const r of r4.rows) {
    console.log(`| ${r.profession} | ${r.coveragePct}% | ${r.skills} | ${r.companies} | ${r.cities} | ${r.salaries} | ${r.jobs} | ${r.missingRelationships} |`);
  }

  console.log("\n## 5. Google Jobs Compliance Baseline\n");
  console.log(`| Total audited | ${r5.summary.totalJobsAudited} |`);
  console.log(`| Avg score | ${r5.summary.avgComplianceScore}/100 |`);
  console.log(`| Jobs ≥90 | ${r5.summary.jobsAbove90} |`);
  console.log(`| Jobs <70 | ${r5.summary.jobsBelow70} |`);
  console.log(`| Target >90 met | ${r5.summary.targetMet ? "YES" : "NO"} |\n`);
  console.log("Top missing fields:");
  for (const f of r5.summary.topMissingFields) {
    console.log(`  - ${f.field}: ${f.count} jobs (${f.pct}%)`);
  }

  console.log("\n## 6. Launch Readiness\n");
  console.log(`**Verdict: ${r6.verdict}**\n`);
  console.log(r6.justification + "\n");
  for (const a of r6.areas) {
    console.log(`- **${a.area}**: score ${a.score}, risk ${a.risk}${a.blocking.length ? `, BLOCKING: ${a.blocking.join("; ")}` : ""}`);
  }

  console.log("\n## 7. Month 2 Execution Plan (data-driven)\n");
  const tierA = r2.summary.tierA;
  const tierB = r2.summary.tierB;
  const noindex = r2.summary.tierC.filter((p) => p.indexable === "No");
  const enrich = r4.summary.weak;
  const dominate = tierA.filter((p) => p.coverageScore >= 60);

  console.log("### Launch first (Tier A)");
  tierA.forEach((p) => console.log(`  1. ${p.profession} — ${p.jobs} jobs, ${p.pageUrl}`));
  console.log("\n### Remain noindex (Tier C)");
  noindex.slice(0, 15).forEach((p) => console.log(`  - ${p.profession} (${p.jobs} jobs)`));
  console.log("\n### Need enrichment (weak graph)");
  enrich.forEach((p) => console.log(`  - ${p.profession} (${p.coveragePct}% coverage)`));
  console.log("\n### Ready to dominate search");
  dominate.forEach((p) => console.log(`  - ${p.profession}: ${p.jobs} jobs, ${p.companies} companies, ${p.cities} cities`));
  console.log("\n### Grow volume (Tier B → A)");
  tierB.slice(0, 10).forEach((p) => console.log(`  - ${p.profession}: ${p.jobs} jobs (target ≥10)`));
  console.log("\n### Salary priorities (Month 4 prep)");
  r3.summary.nearReady.forEach((s) => console.log(`  - ${s.profession}: ${s.observations}/5 observations`));
  r3.summary.ready.forEach((s) => console.log(`  - INDEX NOW: ${s.profession} (${s.observations} obs, P50=${s.p50} MAD)`));
}

async function main() {
  console.error("Running Phase 1 validation against live database…\n");

  const r1 = await report1TaxonomyValidation();
  const r2 = await report2ProfessionCoverage();
  const r3 = await report3SalaryCoverage();
  const r4 = await report4KnowledgeGraph();
  const r5 = await report5GoogleJobs();
  const r6 = await report6LaunchReadiness(r2, r3, r4, r5);

  printMarkdown(r1, r2, r3, r4, r5, r6);

  const outPath = "reports/phase1-validation.json";
  const fs = await import("fs");
  const path = await import("path");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(
    outPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), r1, r2, r3, r4, r5, r6 }, null, 2)
  );
  console.error(`\nJSON saved to ${outPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
