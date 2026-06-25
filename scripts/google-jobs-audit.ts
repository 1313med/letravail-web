import { PrismaClient } from "@prisma/client";
import {
  auditJobPostingFields,
  aggregateComplianceReport,
  complianceScore,
} from "../src/lib/google-jobs-compliance";

const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.job.findMany({
    where: {
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
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

  console.log("\n=== GOOGLE JOBS COMPLIANCE REPORT ===\n");
  console.log(`Total active jobs: ${report.totalJobs}`);
  console.log(`Avg compliance score: ${report.avgComplianceScore}/100`);
  console.log(`Fully compliant (≥95): ${report.fullyCompliant}`);
  console.log("\nTop issues:");
  for (const issue of report.topIssues) {
    console.log(`  - ${issue.field}: ${issue.count} jobs (${issue.impact} impact)`);
  }
  console.log("\nField breakdown:");
  for (const field of report.fieldBreakdown) {
    const gap = field.missing + field.weak;
    if (gap > 0) {
      console.log(
        `  - ${field.field}: ${field.ok} ok, ${field.missing} missing, ${field.weak} weak, ${field.autoFixed} auto-fixed`
      );
    }
  }
  console.log(`\nGenerated: ${report.generatedAt}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
