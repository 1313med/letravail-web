import { revalidatePath } from "next/cache";
import { syncSalaryObservations } from "../data-moat";
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

  return {
    ok: true,
    message: "Sitemap régénéré via revalidation ISR.",
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
  const health = await getGoogleJobsHealth();

  const critical = health.errorsByCategory.filter(
    (e) => e.severity === "critical"
  );

  return {
    ok: critical.every((e) => e.count === 0),
    message: `Validation JobPosting — ${health.validSchemaPct}% valides sur ${health.totalJobPages} offres actives.`,
    details: {
      validSchemaPct: health.validSchemaPct,
      missingBaseSalaryPct: health.missingBaseSalaryPct,
      estimatedSalaryPct: health.estimatedSalaryPct,
      expiredStillIndexed: health.expiredStillIndexed,
      criticalIssues: critical.map((c) => ({
        category: c.category,
        count: c.count,
      })),
    },
  };
}
