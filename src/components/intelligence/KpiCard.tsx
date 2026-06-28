import type { KpiMetric } from "@/lib/intelligence/types";
import { formatNumber, formatPercent, formatScore } from "@/lib/intelligence/formatters";

function formatValue(metric: KpiMetric): string {
  if (typeof metric.value === "string") return metric.value;
  switch (metric.format) {
    case "percent":
      return formatPercent(metric.value);
    case "score":
      return formatScore(metric.value);
    default:
      return formatNumber(metric.value);
  }
}

const toneStyles = {
  neutral: "text-white",
  good: "text-emerald-400",
  warn: "text-amber-400",
  bad: "text-red-400",
};

export function KpiCard({ metric }: { metric: KpiMetric }) {
  const tone = metric.tone ?? "neutral";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5 transition-all hover:border-mint/20 hover:shadow-glow">
      <div className="absolute inset-0 bg-gradient-to-br from-mint/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-dim">
          {metric.label}
        </p>
        <p className={`mt-2 text-3xl font-bold tabular-nums tracking-tight ${toneStyles[tone]}`}>
          {formatValue(metric)}
        </p>
        {metric.delta != null && (
          <p
            className={`mt-1.5 text-xs font-medium ${
              metric.delta >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {metric.delta >= 0 ? "+" : ""}
            {metric.format === "percent" ? formatPercent(metric.delta) : metric.delta}{" "}
            {metric.deltaLabel ?? "change"}
          </p>
        )}
      </div>
    </div>
  );
}

export function KpiGrid({ metrics }: { metrics: KpiMetric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
      {metrics.map((metric) => (
        <KpiCard key={metric.key} metric={metric} />
      ))}
    </div>
  );
}

export function MiniStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-xs text-slate-dim">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-dim">{sub}</p>}
    </div>
  );
}
