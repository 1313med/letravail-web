import { normalizeHealthScore } from "./activation";

export type HealthLevel = "green" | "yellow" | "orange" | "red";

export function healthLevel(score: number | null | undefined): HealthLevel {
  const n = normalizeHealthScore(score);
  if (n == null) return "yellow";
  if (n >= 80) return "green";
  if (n >= 60) return "yellow";
  if (n >= 40) return "orange";
  return "red";
}

export const HEALTH_COLORS: Record<HealthLevel, { bg: string; text: string; border: string }> = {
  green: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  yellow: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  orange: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
  red: { bg: "bg-red-50", text: "text-red-800", border: "border-red-200" },
};

export function validationLevel(score: number | null | undefined): HealthLevel {
  const n = normalizeHealthScore(score);
  if (n == null) return "yellow";
  if (n >= 85) return "green";
  if (n >= 70) return "yellow";
  if (n >= 50) return "orange";
  return "red";
}

export function priorityLevel(score: number | null | undefined): "high" | "medium" | "low" | "none" {
  if (score == null) return "none";
  if (score >= 0.8 || score >= 80) return "high";
  if (score >= 0.5 || score >= 50) return "medium";
  return "low";
}
