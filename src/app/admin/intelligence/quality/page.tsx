import type { Metadata } from "next";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { IntelBadge, IntelPanel } from "@/components/intelligence/ui";
import { MiniStat } from "@/components/intelligence/KpiCard";
import { TrendAreaChart } from "@/components/charts/IntelligenceCharts";
import { getDataQuality } from "@/lib/intelligence";
import { formatPercent, formatScore } from "@/lib/intelligence/formatters";

export const metadata: Metadata = {
  title: "Data Quality — Employment Intelligence",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function QualityPage() {
  const data = await getDataQuality();

  return (
    <>
      <IntelligenceShell
        title="Data Quality"
        subtitle="Visual analytics on extraction quality, coverage evolution, and source bottlenecks."
      >
        <div className="space-y-6 pb-20 lg:pb-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MiniStat label="Overall Quality" value={`${data.overallQuality}/100`} />
            <MiniStat label="Active Jobs Analyzed" value={data.totalActiveJobs.toLocaleString("fr-MA")} />
            <MiniStat label="Dimensions Tracked" value={data.dimensions.length} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {data.dimensions.map((dim) => (
              <IntelPanel
                key={dim.key}
                title={dim.label}
                action={
                  <IntelBadge
                    tone={
                      dim.status === "healthy"
                        ? "good"
                        : dim.status === "attention"
                          ? "warn"
                          : "bad"
                    }
                  >
                    {dim.status === "healthy"
                      ? "Healthy"
                      : dim.status === "attention"
                        ? "Needs attention"
                        : "Critical"}
                  </IntelBadge>
                }
              >
                <div className="mb-4 flex gap-6">
                  <div>
                    <p className="text-xs text-slate-dim">Score</p>
                    <p className="text-2xl font-bold text-white">{dim.score}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-dim">Coverage</p>
                    <p className="text-2xl font-bold text-mint">{formatPercent(dim.coverage)}</p>
                  </div>
                </div>
                <TrendAreaChart data={dim.trend} height={180} />
              </IntelPanel>
            ))}
          </div>

          <IntelPanel title="Source Bottlenecks" subtitle="Per-source quality health from source_profiles">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-xs uppercase text-slate-dim">
                    {["Source", "Company", "Status", "Intelligence", "Freshness", "Skills", "Avg Desc"].map(
                      (h) => (
                        <th key={h} className="px-3 py-2 font-semibold">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.bottlenecks.map((b) => (
                    <tr key={b.source} className="hover:bg-white/[0.02]">
                      <td className="px-3 py-3 font-medium text-white">{b.source}</td>
                      <td className="px-3 py-3 text-slate-muted">{b.company}</td>
                      <td className="px-3 py-3">
                        <IntelBadge
                          tone={
                            b.status === "healthy"
                              ? "good"
                              : b.status === "attention"
                                ? "warn"
                                : "bad"
                          }
                        >
                          {b.status}
                        </IntelBadge>
                      </td>
                      <td className="px-3 py-3 tabular-nums">{formatScore(b.intelligenceScore)}</td>
                      <td className="px-3 py-3 tabular-nums">{formatScore(b.freshnessScore)}</td>
                      <td className="px-3 py-3 tabular-nums">
                        {b.skillCoverage != null ? formatPercent(b.skillCoverage * 100) : "—"}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-slate-muted">
                        {b.avgDescriptionLength ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </IntelPanel>
        </div>
      </IntelligenceShell>
      <IntelligenceMobileNav />
    </>
  );
}
