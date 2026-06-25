"use server";

import { revalidatePath } from "next/cache";
import {
  enrichJobPostingSchema,
  executeAutopilotAction,
  fixInternalLinks,
  fixThinPages,
  generateMissingCityPages,
  generateMissingProfessionPages,
  generateSalaryPages,
  rebuildSitemaps,
  runFullGrowthPipeline,
} from "@/lib/seo-engine/actions-engine";
import type { AutopilotActionType } from "@/lib/seo-engine/types";
import { syncGscFromApi, isGscConfigured } from "@/lib/seo-engine/gsc-engine";
import type { SeoActionResult } from "@/lib/seo-engine/types";

export type GrowthActionName =
  | "generate-cities"
  | "generate-professions"
  | "generate-salaries"
  | "fix-links"
  | "rebuild-sitemap"
  | "enrich-schema"
  | "fix-thin"
  | "full-pipeline"
  | "sync-gsc";

export async function executeAutopilotActionById(
  action: AutopilotActionType,
  targetPath: string
): Promise<SeoActionResult> {
  const result = await executeAutopilotAction(action, targetPath);
  revalidatePath("/admin/seo-dashboard");
  return result;
}

export async function executeGrowthAction(
  action: GrowthActionName
): Promise<SeoActionResult> {
  let result: SeoActionResult;

  switch (action) {
    case "generate-cities":
      result = await generateMissingCityPages();
      break;
    case "generate-professions":
      result = await generateMissingProfessionPages();
      break;
    case "generate-salaries":
      result = await generateSalaryPages();
      break;
    case "fix-links":
      result = await fixInternalLinks();
      break;
    case "rebuild-sitemap":
      result = await rebuildSitemaps();
      break;
    case "enrich-schema":
      result = await enrichJobPostingSchema();
      break;
    case "fix-thin":
      result = await fixThinPages();
      break;
    case "full-pipeline":
      result = await runFullGrowthPipeline();
      break;
    case "sync-gsc":
      if (!isGscConfigured()) {
        result = {
          ok: false,
          message:
            "GSC non configuré — définissez GSC_SERVICE_ACCOUNT_EMAIL et GSC_PRIVATE_KEY",
        };
      } else {
        const sync = await syncGscFromApi(28);
        result = {
          ok: true,
          message: `Search Console synchronisé — ${sync.pagesStored} pages, ${sync.queriesStored} requêtes.`,
          details: sync,
        };
      }
      break;
    default:
      return { ok: false, message: "Action inconnue" };
  }

  revalidatePath("/admin/seo-dashboard");
  return result;
}
