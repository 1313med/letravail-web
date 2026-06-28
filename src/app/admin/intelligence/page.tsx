import type { Metadata } from "next";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { KpiGrid } from "@/components/intelligence/KpiCard";
import { IntelPanel, LiveIndicator } from "@/components/intelligence/ui";
import { TrendAreaChart, HorizontalBarList } from "@/components/charts/IntelligenceCharts";
import { getOverviewBundle } from "@/lib/intelligence";
import { formatDateTime, formatDuration, formatRelativeTime } from "@/lib/intelligence/formatters";
import { IntelBadge } from "@/components/intelligence/ui";

export const metadata: Metadata = {
  title: "Employment Intelligence — Overview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function IntelligenceOverviewPage() {
  const data = await getOverviewBundle();

  return (
    <>
      <IntelligenceShell
        title="Overview"
        subtitle="Is Morocco's employment database becoming larger, fresher, richer and more trustworthy today than yesterday?"
        actions={<LiveIndicator />}
      >
        <div className="space-y-6 pb-20 lg:pb-6">
          <p className="text-xs text-slate-dim">
            Last updated {formatDateTime(data.generatedAt)}
          </p>

          <KpiGrid metrics={data.kpis} />

          <div className="grid gap-6 xl:grid-cols-2">
            <IntelPanel title="Jobs Growth" subtitle="New jobs discovered per day (30d)">
              <TrendAreaChart data={data.jobsGrowth} />
            </IntelPanel>
            <IntelPanel title="Quality Score Growth" subtitle="Average quality score (30d)">
              <TrendAreaChart data={data.qualityGrowth} color="#5EF2D6" valueSuffix="" />
            </IntelPanel>
            <IntelPanel title="Source Growth" subtitle="Cumulative registered sources">
              <TrendAreaChart data={data.sourceGrowth} color="#60a5fa" />
            </IntelPanel>
            <IntelPanel title="Coverage Growth" subtitle="Skill coverage % (30d)">
              <TrendAreaChart data={data.coverageGrowth} color="#a78bfa" valueSuffix="%" />
            </IntelPanel>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <IntelPanel title="Top Growing Employers">
              <HorizontalBarList items={data.topEmployers} />
            </IntelPanel>
            <IntelPanel title="Top Growing Cities">
              <HorizontalBarList items={data.topCities} />
            </IntelPanel>
            <IntelPanel title="Top Professions">
              <HorizontalBarList
                items={data.topProfessions.map((p) => ({ name: p.name, count: p.count }))}
              />
            </IntelPanel>
          </div>

          <IntelPanel title="Recent Crawl Activity" subtitle="Latest scraper runs from PostgreSQL">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-xs uppercase tracking-wide text-slate-dim">
                    {["Source", "Status", "Started", "Duration", "Found", "Inserted", "Updated"].map(
                      (h) => (
                        <th key={h} className="px-3 py-2.5 font-semibold">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.recentCrawls.map((crawl) => (
                    <tr key={crawl.id} className="hover:bg-white/[0.02]">
                      <td className="px-3 py-3 font-medium text-white">{crawl.source}</td>
                      <td className="px-3 py-3">
                        <IntelBadge
                          tone={
                            crawl.status === "success" || crawl.status === "completed"
                              ? "good"
                              : crawl.status === "failed"
                                ? "bad"
                                : "warn"
                          }
                        >
                          {crawl.status}
                        </IntelBadge>
                      </td>
                      <td className="px-3 py-3 text-slate-muted">
                        {formatRelativeTime(crawl.startedAt)}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-slate-muted">
                        {formatDuration(crawl.durationMs)}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-white">{crawl.jobsFound}</td>
                      <td className="px-3 py-3 tabular-nums text-emerald-400">
                        +{crawl.jobsInserted}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-slate-muted">
                        {crawl.jobsUpdated}
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
