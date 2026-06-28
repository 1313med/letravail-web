import { IntelBadge, IntelPanel } from "@/components/intelligence/ui";
import type { ValidationDimension } from "@/lib/intelligence/repositories/validation.repository";
import { formatPercent } from "@/lib/intelligence/formatters";

function toneForStatus(status: ValidationDimension["status"]) {
  if (status === "pass") return "good" as const;
  if (status === "warn") return "warn" as const;
  return "bad" as const;
}

export function ValidationBreakdown({ dimensions }: { dimensions: ValidationDimension[] }) {
  return (
    <IntelPanel title="Validation Breakdown" subtitle="Why validation passed or failed across active jobs">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dimensions.map((dim) => (
          <div
            key={dim.key}
            className="rounded-xl border border-navy/8 bg-[#FAFBFC] p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-navy">{dim.label}</p>
              <IntelBadge tone={toneForStatus(dim.status)}>
                {dim.status === "pass" ? "Pass" : dim.status === "warn" ? "Review" : "Fail"}
              </IntelBadge>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-navy">
              {formatPercent(dim.passRate)}
            </p>
            <p className="mt-1 text-xs text-slate-dim">
              {dim.passed.toLocaleString("fr-MA")} passed · {dim.failed.toLocaleString("fr-MA")} failed
            </p>
            <p className="mt-3 text-xs text-slate-dim leading-relaxed">{dim.explanation}</p>
            {dim.failed > 0 && (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-900">
                {dim.failReason}
              </p>
            )}
          </div>
        ))}
      </div>
    </IntelPanel>
  );
}
