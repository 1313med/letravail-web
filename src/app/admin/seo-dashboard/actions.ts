"use server";

import { revalidatePath } from "next/cache";
import {
  recomputeIndexationRules,
  rebuildSitemap,
  recalculateSalaryObservations,
  runSeoRiskScan,
  validateJobPostingSchema,
} from "@/lib/seo-engine/actions";
import type { SeoActionResult } from "@/lib/seo-engine/types";

export type SeoActionName =
  | "recompute-indexation"
  | "rebuild-sitemap"
  | "recalculate-salary"
  | "run-risk-scan"
  | "validate-jobposting";

export async function executeSeoAction(
  action: SeoActionName
): Promise<SeoActionResult> {
  let result: SeoActionResult;

  switch (action) {
    case "recompute-indexation":
      result = await recomputeIndexationRules();
      break;
    case "rebuild-sitemap":
      result = await rebuildSitemap();
      break;
    case "recalculate-salary":
      result = await recalculateSalaryObservations();
      break;
    case "run-risk-scan":
      result = await runSeoRiskScan();
      break;
    case "validate-jobposting":
      result = await validateJobPostingSchema();
      break;
    default:
      return { ok: false, message: "Action inconnue" };
  }

  revalidatePath("/admin/seo-dashboard");
  return result;
}
