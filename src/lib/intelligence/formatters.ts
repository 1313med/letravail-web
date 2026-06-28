export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString("fr-MA");
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatScore(value: number | null | undefined, digits = 1): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(digits);
}

export function formatDuration(ms: number | null | undefined): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}

export function formatRelativeTime(iso: string | Date | null): string {
  if (!iso) return "—";
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  return date.toLocaleDateString("fr-MA", { day: "numeric", month: "short" });
}

export function formatDateTime(iso: string | Date | null): string {
  if (!iso) return "—";
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return date.toLocaleString("fr-MA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function deltaTone(delta: number | null | undefined): "good" | "bad" | "neutral" {
  if (delta == null || delta === 0) return "neutral";
  return delta > 0 ? "good" : "bad";
}

export function statusTone(status: string): "good" | "warn" | "bad" | "neutral" {
  const s = status.toLowerCase();
  if (["active", "success", "completed", "ready", "valid", "healthy"].some((k) => s.includes(k))) {
    return "good";
  }
  if (["disabled", "failed", "error", "critical"].some((k) => s.includes(k))) {
    return "bad";
  }
  if (["pending", "investigate", "warning", "partial"].some((k) => s.includes(k))) {
    return "warn";
  }
  return "neutral";
}
