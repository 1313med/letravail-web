import { revalidatePath } from "next/cache";
import { syncSalaryObservations } from "../data-moat";
import { prisma } from "../db";
import {
  auditJobPostingFields,
  aggregateComplianceReport,
  complianceScore,
} from "../google-jobs-compliance";
import { activeJobsWhere } from "../queries";
import {
  getGoogleJobsHealth,
  getSeoRiskReport,
} from "./reports";
import type { SeoActionResult } from "./types";

export async function recomputeIndexationRules(): Promise<SeoActionResult> {
  revalidatePath("/emplois", "layout");
  revalidatePath("/emploi", "layout");
  revalidatePath("/entreprise", "layout");
  revalidatePath("/", "layout");

  return {
    ok: true,
    message: "Règles d'indexation recalculées — caches ISR invalidés.",
  };
}

export async function rebuildSitemap(): Promise<SeoActionResult> {
  revalidatePath("/sitemap.xml");
  revalidatePath("/sitemaps/static");
  revalidatePath("/sitemaps/cities");
  revalidatePath("/sitemaps/companies");
  revalidatePath("/sitemaps/landings");
  revalidatePath("/sitemaps/professions");
  revalidatePath("/sitemaps/salaries");
  revalidatePath("/sitemaps/jobs", "layout");

  return {
    ok: true,
    message: "Sitemap index et sous-sitemaps régénérés via revalidation ISR.",
  };
}

export async function recalculateSalaryObservations(): Promise<SeoActionResult> {
  const result = await syncSalaryObservations(5000);

  revalidatePath("/salaires");
  revalidatePath("/", "layout");

  return {
    ok: true,
    message: `Observations salariales recalculées — ${result.inserted} nouvelles entrées sur ${result.processed} offres analysées.`,
    details: result,
  };
}

export async function runSeoRiskScan(): Promise<SeoActionResult> {
  const report = await getSeoRiskReport();

  return {
    ok: true,
    message: `Scan terminé — ${report.summary.dangerous} pages DANGEREUSES, ${report.summary.warning} en WARNING.`,
    details: {
      safe: report.summary.safe,
      warning: report.summary.warning,
      dangerous: report.summary.dangerous,
      avgRiskScore: report.summary.avgRiskScore,
    },
  };
}

export async function validateJobPostingSchema(): Promise<SeoActionResult> {
  const [health, compliance] = await Promise.all([
    getGoogleJobsHealth(),
    runGoogleJobsComplianceReport(),
  ]);

  const critical = health.errorsByCategory.filter(
    (e) => e.severity === "critical"
  );

  return {
    ok: critical.every((e) => e.count === 0),
    message: `Validation JobPosting — ${health.validSchemaPct}% valides, score conformité moyen ${compliance.avgComplianceScore}/100.`,
    details: {
      validSchemaPct: health.validSchemaPct,
      missingBaseSalaryPct: health.missingBaseSalaryPct,
      estimatedSalaryPct: health.estimatedSalaryPct,
      expiredStillIndexed: health.expiredStillIndexed,
      avgComplianceScore: compliance.avgComplianceScore,
      fullyCompliant: compliance.fullyCompliant,
      topIssues: compliance.topIssues.slice(0, 5),
      criticalIssues: critical.map((c) => ({
        category: c.category,
        count: c.count,
      })),
    },
  };
}

export async function runGoogleJobsComplianceReport() {
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

  return aggregateComplianceReport(audits);
}
