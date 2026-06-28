"use client";

import Link from "next/link";
import { IntelPanel } from "@/components/intelligence/ui";
import { MiniStat } from "@/components/intelligence/KpiCard";
import {
  CoverageDonut,
  HorizontalBarList,
  TrendAreaChart,
  TrendBarChart,
} from "@/components/charts/IntelligenceCharts";
import { formatDuration, formatPercent, formatScore } from "@/lib/intelligence/formatters";
import type { TimeRange } from "@/lib/intelligence/types";
import type { FullIntelligenceReports } from "@/lib/intelligence/repositories/reports.repository";

const RANGES: { id: TimeRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "quarter", label: "Quarter" },
  { id: "year", label: "Year" },
];

const ATS_COLORS = ["#37D6B5", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];

export function ReportsClient({
  data,
  currentRange,
}: {
  data: FullIntelligenceReports;
  currentRange: TimeRange;
}) {
  const r = data.reports;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-wrap gap-2">
        {RANGES.map((rng) => (
          <Link
            key={rng.id}
            href={`/admin/intelligence/reports?range=${rng.id}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              currentRange === rng.id
                ? "bg-navy text-white shadow-sm"
                : "border border-navy/10 bg-white text-slate-dim hover:border-mint/40 hover:text-navy"
            }`}
          >
            {rng.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Jobs Added" value={data.summary.jobsAdded} />
        <MiniStat label="Activation Success" value={`${r.activationSuccess.rate}%`} tone="good" />
        <MiniStat label="Crawl Success" value={`${data.summary.crawlSuccessRate}%`} tone="good" />
        <MiniStat label="Total Crawls" value={data.summary.totalCrawls} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <IntelPanel title="Activation Success" accent="green">
          <div className="grid grid-cols-3 gap-4">
            <MiniStat label="Success Rate" value={`${r.activationSuccess.rate}%`} tone="good" />
            <MiniStat label="Active" value={r.activationSuccess.active} />
            <MiniStat label="Failed" value={r.activationSuccess.failed} tone="bad" />
          </div>
        </IntelPanel>

        <IntelPanel title="Health Distribution" accent="blue">
          <HorizontalBarList
            items={r.healthDistribution.map((h) => ({ name: h.bucket, count: h.count }))}
          />
        </IntelPanel>

        <IntelPanel title="Employer Lifecycle" accent="purple">
          <HorizontalBarList
            items={r.employerLifecycle.map((l) => ({
              name: l.state ?? "UNKNOWN",
              count: l.count,
            }))}
          />
        </IntelPanel>

        <IntelPanel title="Validation Trend" accent="yellow">
          <TrendAreaChart data={r.validationTrend} color="#8b5cf6" />
        </IntelPanel>

        <IntelPanel title="Scheduler Performance" accent="blue">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-slate-dim">Active Sources</dt>
              <dd className="text-xl font-semibold text-navy">{r.schedulerPerformance.activeSources}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-dim">Crawl Success</dt>
              <dd className="text-xl font-semibold text-navy">{r.schedulerPerformance.crawlSuccessRate}%</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-dim">Avg Failure Rate</dt>
              <dd className="text-xl font-semibold text-navy">
                {formatPercent((r.schedulerPerformance.avgFailureRate ?? 0) * 100)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-dim">Avg Duration</dt>
              <dd className="text-xl font-semibold text-navy">
                {formatDuration(r.schedulerPerformance.avgCrawlDurationMs)}
              </dd>
            </div>
          </dl>
        </IntelPanel>

        <IntelPanel title="Crawler Performance" accent="green">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-slate-dim">Total Crawls</dt>
              <dd className="text-xl font-semibold text-navy">{r.crawlerPerformance.totalCrawls}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-dim">Success Rate</dt>
              <dd className="text-xl font-semibold text-navy">{r.crawlerPerformance.successRate}%</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-dim">Jobs Found</dt>
              <dd className="text-xl font-semibold text-navy">{r.crawlerPerformance.jobsFound}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-dim">Avg Duration</dt>
              <dd className="text-xl font-semibold text-navy">
                {formatDuration(r.crawlerPerformance.avgDurationMs)}
              </dd>
            </div>
          </dl>
        </IntelPanel>

        <IntelPanel title="Sector Growth" accent="green">
          <TrendAreaChart data={r.sectorGrowth} color="#22c55e" />
        </IntelPanel>

        <IntelPanel title="Source Growth" accent="blue">
          <TrendBarChart data={r.sourceGrowth} color="#3b82f6" />
        </IntelPanel>

        <IntelPanel title="ATS Market Share" accent="purple">
          <CoverageDonut
            segments={r.atsMarketShare.slice(0, 6).map((a, i) => ({
              label: a.name,
              value: a.count,
              color: ATS_COLORS[i % ATS_COLORS.length],
            }))}
          />
        </IntelPanel>

        <IntelPanel title="Top Improving Employers" accent="green">
          <HorizontalBarList items={r.topImproving.map((e) => ({ name: e.name, count: e.delta }))} />
        </IntelPanel>

        <IntelPanel title="Top Degrading Employers" accent="red">
          <div className="space-y-2 text-sm">
            {r.topDegrading.map((e) => (
              <div key={e.name} className="flex justify-between rounded-lg border border-navy/8 px-3 py-2">
                <span className="text-navy">{e.name}</span>
                <span className="text-red-600 tabular-nums">Health {formatScore(e.health)}</span>
              </div>
            ))}
          </div>
        </IntelPanel>
      </div>

      <IntelPanel title="Daily Job Additions" accent="green">
        <TrendBarChart data={data.dailyJobs} />
      </IntelPanel>

      <IntelPanel title="Top Sources by Insertions" accent="blue">
        <div className="space-y-3">
          {data.topSources.map((s) => (
            <div key={s.source} className="flex items-center justify-between text-sm">
              <span className="font-medium text-navy">{s.source}</span>
              <span className="tabular-nums font-medium text-emerald-600">
                +{s._sum.jobsInserted ?? 0}
              </span>
            </div>
          ))}
        </div>
      </IntelPanel>
    </div>
  );
}
