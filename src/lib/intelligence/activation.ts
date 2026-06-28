export const ACTIVATION_LIFECYCLE_STATES = [
  "DISCOVERED",
  "PROBED",
  "READY",
  "ACTIVE",
  "MONITORED",
  "FAILED",
] as const;

export type ActivationLifecycleState = (typeof ACTIVATION_LIFECYCLE_STATES)[number];

/** Operations Center pipeline stages (Discovery page) */
export const OPERATIONS_LIFECYCLE_STAGES = [
  "DISCOVERED",
  "PROBED",
  "VALIDATED",
  "READY",
  "ACTIVE",
  "MONITORED",
] as const;

export type OperationsLifecycleStage = (typeof OPERATIONS_LIFECYCLE_STAGES)[number];

export function normalizeActivationState(state: string | null | undefined): string {
  if (!state) return "—";
  return state.toUpperCase();
}

export function normalizeHealthScore(score: number | null | undefined): number | null {
  if (score == null || Number.isNaN(score)) return null;
  return score <= 1 ? score * 100 : score;
}

export function resolveOperationsStage(row: {
  activationState: string | null;
  onboardingStatus: string;
  lastValidationAt: Date | null;
  validationScore: number | null;
}): OperationsLifecycleStage {
  const raw = (row.activationState ?? row.onboardingStatus ?? "DISCOVERED").toUpperCase();
  if (raw === "VALIDATED") return "VALIDATED";
  if (raw === "ACTIVE") return "ACTIVE";
  if (raw === "MONITORED") return "MONITORED";
  if (raw === "READY") return "READY";
  if (raw === "DISCOVERED") return "DISCOVERED";
  if (raw === "FAILED") return "PROBED";
  if (raw === "PROBED") {
    if (row.lastValidationAt || row.validationScore != null) return "VALIDATED";
    return "PROBED";
  }
  if (row.lastValidationAt || row.validationScore != null) return "VALIDATED";
  return "DISCOVERED";
}

export function getStageEnteredAt(
  stage: OperationsLifecycleStage,
  row: {
    createdAt: Date;
    probedAt: Date;
    lastValidationAt: Date | null;
    updatedAt: Date;
    lastHealthCheck: Date | null;
  }
): Date {
  switch (stage) {
    case "DISCOVERED":
      return row.createdAt;
    case "PROBED":
      return row.probedAt;
    case "VALIDATED":
      return row.lastValidationAt ?? row.probedAt;
    case "READY":
    case "ACTIVE":
    case "MONITORED":
      return row.updatedAt;
    default:
      return row.updatedAt;
  }
}

export function activationStateTone(
  state: string | null | undefined
): "neutral" | "good" | "warn" | "bad" | "mint" {
  const s = normalizeActivationState(state);
  switch (s) {
    case "DISCOVERED":
      return "neutral";
    case "PROBED":
      return "warn";
    case "VALIDATED":
      return "mint";
    case "READY":
      return "mint";
    case "ACTIVE":
    case "MONITORED":
      return "good";
    case "FAILED":
      return "bad";
    default:
      return "neutral";
  }
}

export function resolveSourceActivationState(
  sourceState: string | null | undefined,
  atsState: string | null | undefined
): string | null {
  if (atsState) return atsState;
  if (sourceState) return sourceState;
  return null;
}
