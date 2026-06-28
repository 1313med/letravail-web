import type { Metadata } from "next";
import Link from "next/link";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { IntelActivationBadge, IntelBadge, IntelPanel } from "@/components/intelligence/ui";
import { MiniStat } from "@/components/intelligence/KpiCard";
import { getProductionMonitor } from "@/lib/intelligence";
import {
  formatDateTime,
  formatDuration,
  formatRelativeTime,
  formatScore,
} from "@/lib/intelligence/formatters";

export const metadata: Metadata = {
  title: "Production Monitor — Employment Intelligence",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function EmployerQueueList({
  items,
  showRetry,
}: {
  items: {
    id: string;
    company: string;
    source: string | null;
    ats: string;
    health: number | null;
    state: string | null;
    nextRetryAt?: string | null;
    reason?: string | null;
  }[];
  showRetry?: boolean;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-dim">Queue empty</p>;
  }
  return (
    <div className="space-y-2">
      {items.map((e) => (
        <Link
          key={e.id}
          href={`/admin/intelligence/ats/${e.id}`}
          className="flex items-center justify-between rounded-lg border border-navy/8 px-3 py-2 text-sm transition hover:bg-[#FAFBFC]"
        >
          <div>
            <p className="font-medium text-navy">{e.company}</p>
            <p className="text-xs text-slate-dim">
              {e.ats}
              {e.source ? ` · ${e.source}` : ""}
            </p>
          </div>
          <div className="text-right">
            <IntelActivationBadge state={e.state} />
            <p className="mt-1 text-xs tabular-nums text-slate-dim">
              Health {formatScore(e.health)}
              {showRetry && e.nextRetryAt && ` · retry ${formatRelativeTime(e.nextRetryAt)}`}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function MonitorPage() {
  const data = await getProductionMonitor();

  return (
    <>
      <IntelligenceShell
        title="Production Monitor"
        subtitle="Live operations — queues, alerts, activations, and scheduler state from PostgreSQL."
        actions={
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
        }
      >
        <div className="space-y-6 pb-20 lg:pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <IntelBadge tone={data.systemHealth === "healthy" ? "good" : "bad"}>
              System {data.systemHealth}
            </IntelBadge>
            <IntelBadge tone={data.database.connected ? "good" : "bad"}>
              Database connected
            </IntelBadge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <MiniStat label="Active Employers" value={data.activation.activeEmployers} tone="good" />
            <MiniStat label="Ready Queue" value={data.activation.readyQueue} />
            <MiniStat label="Retry Queue" value={data.activation.retryQueue} tone="warn" />
            <MiniStat label="Validation Queue" value={data.activation.validationQueue} tone="warn" />
            <MiniStat label="Avg Health" value={formatScore(data.activation.averageHealth)} />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <IntelPanel title="Activation Queue" accent="green">
              <EmployerQueueList items={data.queues.activation} />
            </IntelPanel>
            <IntelPanel title="Retry Queue" accent="yellow">
              <EmployerQueueList items={data.queues.retry} showRetry />
            </IntelPanel>
            <IntelPanel title="Validation Queue" accent="blue">
              <EmployerQueueList items={data.queues.validation} />
            </IntelPanel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <IntelPanel title="Health Alerts" accent="red">
              <p className="mb-3 text-xs text-slate-dim">Employers with health score below 60</p>
              <EmployerQueueList items={data.healthAlerts} />
            </IntelPanel>
            <IntelPanel title="Lowest Health Employers" accent="red">
              <EmployerQueueList items={data.lowestHealth} />
            </IntelPanel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <IntelPanel title="Recently Activated" accent="green">
              <EmployerQueueList items={data.recentlyActivated} />
            </IntelPanel>
            <IntelPanel title="Recently Deactivated" accent="red">
              <EmployerQueueList items={data.recentlyDeactivated} />
            </IntelPanel>
          </div>

          <IntelPanel title="Highest Priority Employers" accent="purple">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-navy/8 text-xs uppercase text-slate-dim">
                    {["Company", "Source", "ATS", "Priority", "Health", "State"].map((h) => (
                      <th key={h} className="px-3 py-2 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/6">
                  {data.highestPriority.map((e) => (
                    <tr key={e.id}>
                      <td className="px-3 py-2">
                        <Link href={`/admin/intelligence/ats/${e.id}`} className="text-navy hover:text-mint-dim">
                          {e.company}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-slate-dim">{e.source ?? "—"}</td>
                      <td className="px-3 py-2 text-slate-dim">{e.ats}</td>
                      <td className="px-3 py-2 tabular-nums font-medium text-mint-dim">
                        {formatScore(e.priority)}
                      </td>
                      <td className="px-3 py-2 tabular-nums">{formatScore(e.health)}</td>
                      <td className="px-3 py-2">
                        <IntelActivationBadge state={e.state} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </IntelPanel>

          <IntelPanel title="Upcoming Scheduler Jobs" accent="blue">
            <div className="space-y-2">
              {data.upcomingScheduler.length === 0 ? (
                <p className="text-sm text-slate-dim">No scheduled crawls</p>
              ) : (
                data.upcomingScheduler.map((s) => (
                  <div
                    key={s.source}
                    className="flex items-center justify-between rounded-lg border border-navy/8 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-navy">{s.source}</p>
                      <p className="text-xs text-slate-dim">{s.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-mint-dim">{formatRelativeTime(s.nextCrawlAt)}</p>
                      <p className="text-[10px] text-slate-dim">
                        Last: {formatRelativeTime(s.lastCrawlAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </IntelPanel>

          <div className="grid gap-6 xl:grid-cols-2">
            <IntelPanel title="Throughput">
              <div className="grid grid-cols-2 gap-4">
                <MiniStat label="Active Jobs" value={data.database.activeJobs.toLocaleString("fr-MA")} />
                <MiniStat label="Jobs / Hour" value={data.throughput.jobsPerHour} />
                <MiniStat label="Freshness" value={`${data.freshnessIndex}%`} />
                <MiniStat
                  label="Avg Crawl"
                  value={formatDuration(data.throughput.avgCrawlDurationMs)}
                />
              </div>
            </IntelPanel>
            <IntelPanel title="Last Crawl">
              {data.throughput.lastCrawl ? (
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-slate-dim">Source</dt>
                    <dd className="text-navy">{data.throughput.lastCrawl.source}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-dim">Started</dt>
                    <dd className="text-slate-dim">{formatDateTime(data.throughput.lastCrawl.startedAt)}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-slate-dim">No crawls yet</p>
              )}
            </IntelPanel>
          </div>

          {data.recentFailures.length > 0 && (
            <IntelPanel title="Recent Failures (24h)" accent="red">
              <div className="space-y-3">
                {data.recentFailures.map((f) => (
                  <div key={f.id} className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <div className="flex justify-between">
                      <p className="font-medium text-navy">{f.source}</p>
                      <p className="text-xs text-slate-dim">{formatRelativeTime(f.startedAt)}</p>
                    </div>
                    {f.errorMessage && (
                      <p className="mt-1 text-xs text-red-800 line-clamp-2">{f.errorMessage}</p>
                    )}
                  </div>
                ))}
              </div>
            </IntelPanel>
          )}
        </div>
      </IntelligenceShell>
      <IntelligenceMobileNav />
    </>
  );
}
