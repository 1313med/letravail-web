import type { KpiMetric } from "@/lib/intelligence/types";
import { formatNumber, formatPercent, formatScore } from "@/lib/intelligence/formatters";
import { StatCard } from "@/app/admin/seo-dashboard/components/ui";

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

function mapTone(tone?: KpiMetric["tone"]): "neutral" | "good" | "warn" | "bad" {
  if (tone === "good" || tone === "warn" || tone === "bad") return tone;
  return "neutral";
}

export function KpiCard({ metric }: { metric: KpiMetric }) {
  const deltaHint =
    metric.delta != null
      ? `${metric.delta >= 0 ? "+" : ""}${
          metric.format === "percent" ? formatPercent(metric.delta) : metric.delta
        } ${metric.deltaLabel ?? "change"}`
      : undefined;

  return (
    <StatCard
      label={metric.label}
      value={formatValue(metric)}
      hint={deltaHint}
      tone={mapTone(metric.tone)}
    />
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
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  return <StatCard label={label} value={value} hint={sub} tone={tone} />;
}
