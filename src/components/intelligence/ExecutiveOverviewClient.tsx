"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { KpiGrid, MiniStat } from "@/components/intelligence/KpiCard";
import {
  IntelBadge,
  IntelHealthBadge,
  IntelPanel,
  IntelTable,
} from "@/components/intelligence/ui";
import {
  CoverageDonut,
  HorizontalBarList,
  TrendAreaChart,
  TrendBarChart,
} from "@/components/charts/IntelligenceCharts";
import {
  formatDateTime,
  formatDuration,
  formatPercent,
  formatRelativeTime,
  formatScore,
} from "@/lib/intelligence/formatters";
import type { KpiMetric, TimeRange } from "@/lib/intelligence/types";
import type { ExecutiveAnalytics } from "@/lib/intelligence/repositories/analytics.repository";

const RANGES: { id: TimeRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "quarter", label: "Quarter" },
  { id: "year", label: "Year" },
];

type RealtimeData = {
  lastUpdated: string;
  databaseConnected: boolean;
  schedulerRunning: boolean;
  jobsAddedLive: number;
  activeEmployers: number;
  recentActivations: { id: string; company: string; source: string | null; at: string }[];
  recentFailures: { id: string; source: string; at: string; error: string | null }[];
};

type Props = {
  initialAnalytics: ExecutiveAnalytics;
  kpis: KpiMetric[];
  initialRealtime: RealtimeData;
  currentRange: TimeRange;
  recentCrawls: {
    id: string;
    source: string;
    status: string;
    startedAt: string;
    durationMs: number | null;
    jobsFound: number;
    jobsInserted: number;
    jobsUpdated: number;
  }[];
};

const ATS_COLORS = ["#37D6B5", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#64748b"];

export function ExecutiveOverviewClient({
  initialAnalytics,
  kpis,
  initialRealtime,
  currentRange,
  recentCrawls,
}: Props) {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [realtime, setRealtime] = useState(initialRealtime);
  const [lastRefresh, setLastRefresh] = useState(initialRealtime.lastUpdated);

  const refresh = useCallback(async () => {
    try {
      const [aRes, rRes] = await Promise.all([
        fetch(`/api/admin/intelligence/analytics?range=${currentRange}`),
        fetch("/api/admin/intelligence/realtime"),
      ]);
      if (aRes.ok) setAnalytics(await aRes.json());
      if (rRes.ok) {
        const r = await rRes.json();
        setRealtime(r);
        setLastRefresh(r.lastUpdated);
      }
    } catch {
      /* keep last good data */
    }
  }, [currentRange]);

  useEffect(() => {
    setAnalytics(initialAnalytics);
  }, [initialAnalytics]);

  useEffect(() => {
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  const exec = analytics.executive;
  const trends = analytics.trends;
  const a = analytics.analytics;

  const atsSegments = trends.atsDistribution.slice(0, 6).map((item, i) => ({
    label: item.name,
    value: item.count,
    color: ATS_COLORS[i % ATS_COLORS.length],
  }));

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Realtime status bar */}
      <div className="rounded-2xl border border-navy/8 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live · refreshes every 30s
            </span>
            <IntelBadge tone={realtime.databaseConnected ? "good" : "bad"}>
              Database {realtime.databaseConnected ? "Connected" : "Offline"}
            </IntelBadge>
            <IntelBadge tone={realtime.schedulerRunning ? "good" : "warn"}>
              Scheduler {realtime.schedulerRunning ? "Running" : "Idle"}
            </IntelBadge>
          </div>
          <p className="text-xs text-slate-dim">
            Last updated {formatDateTime(lastRefresh)}
          </p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MiniStat label="Jobs Added (1h)" value={realtime.jobsAddedLive} tone="good" />
          <MiniStat label="Active Employers" value={realtime.activeEmployers} />
          <div className="rounded-xl border border-navy/8 bg-[#FAFBFC] px-3 py-2 sm:col-span-2">
            <p className="text-[10px] font-semibold uppercase text-slate-dim">Recent Activations</p>
            {realtime.recentActivations.length === 0 ? (
              <p className="mt-1 text-xs text-slate-dim">None today</p>
            ) : (
              <p className="mt-1 truncate text-sm text-navy">
                {realtime.recentActivations.map((x) => x.company).join(" · ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Time range filter */}
      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <Link
            key={r.id}
            href={`/admin/intelligence?range=${r.id}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              currentRange === r.id
                ? "bg-navy text-white shadow-sm"
                : "border border-navy/10 bg-white text-slate-dim hover:border-mint/40 hover:text-navy"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      {/* Executive summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MiniStat
          label="Platform Health"
          value={formatScore(exec.platformHealthScore)}
          tone={exec.platformHealthScore >= 70 ? "good" : exec.platformHealthScore >= 50 ? "warn" : "bad"}
        />
        <MiniStat label="Active Employers" value={exec.activeEmployers} tone="good" />
        <MiniStat label="Active Jobs" value={exec.activeJobs.toLocaleString("fr-MA")} />
        <MiniStat label="Active Sources" value={exec.activeSources} />
        <MiniStat
          label="Job Growth (period)"
          value={exec.growthRate >= 0 ? `+${exec.growthRate}` : String(exec.growthRate)}
          tone={exec.growthRate >= 0 ? "good" : "bad"}
        />
      </div>

      <KpiGrid metrics={kpis} />

      {/* Trend charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        <IntelPanel title="Employer Growth" subtitle="New employers discovered" accent="green">
          <TrendAreaChart data={trends.employerGrowth} color="#37D6B5" />
        </IntelPanel>
        <IntelPanel title="Automatic Activations" accent="blue">
          <TrendBarChart data={trends.autoActivations} color="#3b82f6" />
        </IntelPanel>
        <IntelPanel title="Health Trend" accent="green">
          <TrendAreaChart data={trends.healthTrend} color="#22c55e" />
        </IntelPanel>
        <IntelPanel title="Validation Trend" accent="purple">
          <TrendAreaChart data={trends.validationTrend} color="#8b5cf6" />
        </IntelPanel>
        <IntelPanel title="Retry Trend" accent="yellow">
          <TrendBarChart data={trends.retryTrend} color="#f59e0b" />
        </IntelPanel>
        <IntelPanel title="Job Growth" accent="green">
          <TrendAreaChart data={trends.jobGrowth} />
        </IntelPanel>
        <IntelPanel title="Sector Growth" subtitle="Jobs in companies with sector data" accent="blue">
          <TrendAreaChart data={trends.sectorGrowth} color="#2AB89A" />
        </IntelPanel>
        <IntelPanel title="ATS Distribution" accent="purple">
          {atsSegments.length > 0 ? (
            <CoverageDonut segments={atsSegments} />
          ) : (
            <p className="text-sm text-slate-dim">No ATS data yet</p>
          )}
        </IntelPanel>
      </div>

      {/* Analytics */}
      <IntelPanel title="Platform Analytics" subtitle="Key operational metrics from PostgreSQL">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MiniStat
            label="Avg DISCOVERED → ACTIVE"
            value={formatDuration(a.avgDiscoveredToActiveMs)}
          />
          <MiniStat label="Validation Success" value={formatPercent(a.validationSuccessPct)} tone="good" />
          <MiniStat label="Avg Employer Health" value={formatScore(a.avgEmployerHealth)} />
          <MiniStat label="Avg Crawl Duration" value={formatDuration(a.avgCrawlDurationMs)} />
          <MiniStat label="Jobs / Employer" value={a.jobsPerEmployer} />
        </div>
      </IntelPanel>

      <div className="grid gap-6 xl:grid-cols-3">
        <IntelPanel title="Jobs Per ATS" accent="blue">
          <HorizontalBarList items={a.jobsPerAts.map((x) => ({ name: x.name, count: x.count }))} />
        </IntelPanel>
        <IntelPanel title="Jobs Per Sector" accent="green">
          <HorizontalBarList items={a.jobsPerSector.map((x) => ({ name: x.name, count: x.count }))} />
        </IntelPanel>
        <IntelPanel title="Jobs Per Region" accent="purple">
          <HorizontalBarList items={a.jobsPerRegion.map((x) => ({ name: x.name, count: x.count }))} />
        </IntelPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <IntelPanel title="Top Improving Employers" accent="green">
          <HorizontalBarList
            items={analytics.topImproving.map((e) => ({ name: e.name, count: e.delta }))}
          />
        </IntelPanel>
        <IntelPanel title="Employers Needing Attention" accent="red">
          <div className="space-y-2">
            {analytics.topDegrading.map((e) => (
              <div
                key={e.name}
                className="flex items-center justify-between rounded-lg border border-navy/8 px-3 py-2 text-sm"
              >
                <span className="font-medium text-navy">{e.name}</span>
                <div className="flex items-center gap-2">
                  <IntelHealthBadge score={e.health} />
                  {e.failures > 0 && (
                    <span className="text-xs text-red-600">{Math.round(e.failures * 100)}% fail</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </IntelPanel>
      </div>

      <IntelPanel title="Recent Crawl Activity" accent="blue">
        <IntelTable headers={["Source", "Status", "Started", "Duration", "Found", "Inserted"]}>
          {recentCrawls.map((crawl) => (
            <tr key={crawl.id} className="hover:bg-navy/[0.02]">
              <td className="px-3 py-3 font-medium text-navy">{crawl.source}</td>
              <td className="px-3 py-3">
                <IntelBadge tone={crawl.status === "success" ? "good" : crawl.status === "failed" ? "bad" : "warn"}>
                  {crawl.status}
                </IntelBadge>
              </td>
              <td className="px-3 py-3 text-slate-dim">{formatRelativeTime(crawl.startedAt)}</td>
              <td className="px-3 py-3 text-slate-dim">{formatDuration(crawl.durationMs)}</td>
              <td className="px-3 py-3 tabular-nums">{crawl.jobsFound}</td>
              <td className="px-3 py-3 tabular-nums text-emerald-600">+{crawl.jobsInserted}</td>
            </tr>
          ))}
        </IntelTable>
      </IntelPanel>

      {realtime.recentFailures.length > 0 && (
        <IntelPanel title="Recent Failures (1h)" accent="red">
          <div className="space-y-2">
            {realtime.recentFailures.map((f) => (
              <div key={f.id} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-navy">{f.source}</span>
                  <span className="text-xs text-slate-dim">{formatRelativeTime(f.at)}</span>
                </div>
                {f.error && <p className="mt-1 text-xs text-red-800 line-clamp-1">{f.error}</p>}
              </div>
            ))}
          </div>
        </IntelPanel>
      )}
    </div>
  );
}
