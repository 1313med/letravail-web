"use client";

import Link from "next/link";
import { IntelPanel } from "@/components/intelligence/ui";
import { MiniStat } from "@/components/intelligence/KpiCard";
import { TrendBarChart } from "@/components/charts/IntelligenceCharts";
import { formatDuration, formatScore } from "@/lib/intelligence/formatters";
import type { TimeRange } from "@/lib/intelligence/types";

const RANGES: { id: TimeRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "quarter", label: "Quarter" },
  { id: "year", label: "Year" },
];

type ReportData = Awaited<
  ReturnType<typeof import("@/lib/intelligence").getIntelligenceReports>
>;

export function ReportsClient({
  data,
  currentRange,
}: {
  data: ReportData;
  currentRange: TimeRange;
}) {
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <Link
            key={r.id}
            href={`/admin/intelligence/reports?range=${r.id}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              currentRange === r.id
                ? "bg-mint text-navy shadow-glow"
                : "bg-white/8 text-slate-muted hover:text-white"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Jobs Added" value={data.summary.jobsAdded} />
        <MiniStat label="Jobs Archived" value={data.summary.jobsArchived} />
        <MiniStat label="Net Growth" value={data.summary.netGrowth} />
        <MiniStat label="Crawl Success" value={`${data.summary.crawlSuccessRate}%`} />
        <MiniStat label="Total Crawls" value={data.summary.totalCrawls} />
        <MiniStat label="Jobs Inserted" value={data.summary.jobsInserted} />
        <MiniStat label="Duplicates" value={data.summary.duplicates} />
        <MiniStat
          label="Avg Quality"
          value={formatScore(data.summary.avgQuality)}
        />
      </div>

      <IntelPanel title="Daily Job Additions">
        <TrendBarChart data={data.dailyJobs} />
      </IntelPanel>

      <IntelPanel title="Top Sources by Insertions">
        <div className="space-y-3">
          {data.topSources.map((s) => (
            <div key={s.source} className="flex items-center justify-between text-sm">
              <span className="text-white">{s.source}</span>
              <span className="tabular-nums text-emerald-400">
                +{s._sum.jobsInserted ?? 0}
              </span>
            </div>
          ))}
        </div>
      </IntelPanel>

      <p className="text-xs text-slate-dim">
        Period: {new Date(data.period.start).toLocaleDateString("fr-MA")} —{" "}
        {new Date(data.period.end).toLocaleDateString("fr-MA")}
        {data.summary.avgCrawlDurationMs != null &&
          ` · Avg crawl ${formatDuration(data.summary.avgCrawlDurationMs)}`}
      </p>
    </div>
  );
}
