import type { Metadata } from "next";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { IntelPanel } from "@/components/intelligence/ui";
import { KpiGrid } from "@/components/intelligence/KpiCard";
import { HorizontalBarList, CoverageDonut } from "@/components/charts/IntelligenceCharts";
import { getMarketCoverage } from "@/lib/intelligence";
import { formatPercent } from "@/lib/intelligence/formatters";

export const metadata: Metadata = {
  title: "Market Coverage — Employment Intelligence",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CoveragePage() {
  const data = await getMarketCoverage();

  return (
    <>
      <IntelligenceShell
        title="Market Coverage"
        subtitle="Where should the scraper grow next? Real coverage from jobs, companies, and locations."
      >
        <div className="space-y-6 pb-20 lg:pb-6">
          <KpiGrid
            metrics={[
              { key: "captured", label: "Captured Jobs", value: data.capturedJobs, format: "number", tone: "good" },
              { key: "missing", label: "Estimated Missing", value: data.missingJobs, format: "number", tone: "warn" },
              { key: "market", label: "Est. Market Size", value: data.estimatedMarketSize, format: "number" },
              { key: "coverage", label: "Coverage %", value: data.overallCoverage, format: "percent" },
            ]}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <IntelPanel title="Morocco Heatmap" subtitle="Job density by city">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {data.cityHeatmap.map((city) => (
                  <div
                    key={city.city}
                    className="rounded-xl border border-white/8 p-3 transition-all hover:border-mint/30"
                    style={{
                      background: `rgba(55, 214, 181, ${Math.min(city.intensity / 100, 0.35)})`,
                    }}
                  >
                    <p className="text-sm font-medium text-white">{city.city}</p>
                    <p className="text-xs text-slate-muted">{city.jobs} jobs</p>
                    <p className="text-xs text-mint">{formatPercent(city.intensity)}</p>
                  </div>
                ))}
              </div>
            </IntelPanel>

            <IntelPanel title="Sector Distribution">
              <CoverageDonut
                segments={data.bySector.slice(0, 5).map((s, i) => ({
                  label: s.label,
                  value: s.captured,
                  color: ["#37D6B5", "#5EF2D6", "#60a5fa", "#a78bfa", "#f472b6"][i] ?? "#91A4B7",
                }))}
              />
            </IntelPanel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <IntelPanel title="Coverage by Sector">
              <HorizontalBarList
                items={data.bySector.map((s) => ({ name: s.label, count: s.captured }))}
              />
            </IntelPanel>
            <IntelPanel title="Coverage by Region">
              <HorizontalBarList
                items={data.byRegion.map((s) => ({ name: s.label, count: s.captured }))}
              />
            </IntelPanel>
            <IntelPanel title="Top Employers">
              <HorizontalBarList
                items={data.byEmployer.map((s) => ({ name: s.label, count: s.captured }))}
              />
            </IntelPanel>
            <IntelPanel title="Top Professions">
              <HorizontalBarList
                items={data.byProfession.map((s) => ({ name: s.label, count: s.captured }))}
              />
            </IntelPanel>
          </div>

          <IntelPanel title="Top Missing Sectors" subtitle="Sectors in taxonomy without company coverage">
            {data.missingSectors.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.missingSectors.map((s) => (
                  <span
                    key={s.key}
                    className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 ring-1 ring-amber-500/20"
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-dim">All taxonomy sectors have coverage</p>
            )}
          </IntelPanel>
        </div>
      </IntelligenceShell>
      <IntelligenceMobileNav />
    </>
  );
}
