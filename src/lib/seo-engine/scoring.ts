import {
  MIN_JOBS_FOR_CITY_INDEX,
  MIN_JOBS_FOR_LANDING_INDEX,
  MIN_OBSERVATIONS_FOR_SALARY_INDEX,
} from "../constants";
import type { IndexStatus, PageType, RiskLabel, RiskLevel } from "./types";

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 70) return "low";
  if (score >= 40) return "medium";
  return "high";
}

export function riskLabelFromScore(score: number): RiskLabel {
  if (score >= 70) return "SAFE";
  if (score >= 40) return "WARNING";
  return "DANGEROUS";
}

export function computeQualityScore(params: {
  pageType: PageType;
  indexStatus: IndexStatus;
  jobCount: number;
  hasSalaryData: boolean;
  schemaComplete?: boolean;
  descriptionLength?: number;
}): number {
  let score = 100;

  if (params.indexStatus === "noindex") score -= 15;

  if (params.pageType === "city" && params.jobCount < MIN_JOBS_FOR_CITY_INDEX) {
    score -= Math.min(40, (MIN_JOBS_FOR_CITY_INDEX - params.jobCount) * 8);
  }
  if (params.pageType === "landing" && params.jobCount < MIN_JOBS_FOR_LANDING_INDEX) {
    score -= Math.min(50, (MIN_JOBS_FOR_LANDING_INDEX - params.jobCount) * 15);
  }
  if (params.pageType === "salary" && !params.hasSalaryData) {
    score -= 35;
  }
  if (params.pageType === "job") {
    if (!params.hasSalaryData) score -= 20;
    if (params.schemaComplete === false) score -= 25;
    if ((params.descriptionLength ?? 0) < 120) score -= 15;
  }
  if (params.pageType === "company" && params.jobCount < 3) {
    score -= 20;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function isThinPage(params: {
  pageType: PageType;
  jobCount: number;
  observationCount?: number;
  descriptionLength?: number;
}): boolean {
  if (params.pageType === "city") return params.jobCount < MIN_JOBS_FOR_CITY_INDEX;
  if (params.pageType === "landing") return params.jobCount < MIN_JOBS_FOR_LANDING_INDEX;
  if (params.pageType === "salary") {
    return (params.observationCount ?? 0) < MIN_OBSERVATIONS_FOR_SALARY_INDEX;
  }
  if (params.pageType === "company") return params.jobCount < 2;
  if (params.pageType === "job") return (params.descriptionLength ?? 0) < 80;
  return false;
}

export function computeRiskScore(signals: {
  duplicateContent: number;
  thinContent: number;
  missingSchema: number;
  lowJobCount: number;
  missingSalary: number;
  orphanPage: number;
}): number {
  const weighted =
    signals.duplicateContent * 15 +
    signals.thinContent * 25 +
    signals.missingSchema * 20 +
    signals.lowJobCount * 15 +
    signals.missingSalary * 10 +
    signals.orphanPage * 15;

  return Math.max(0, Math.min(100, Math.round(100 - weighted)));
}

export function signalStrength(condition: boolean, weight = 1): number {
  return condition ? weight : 0;
}
