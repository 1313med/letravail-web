import type { Metadata } from "next";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { IntelBadge, IntelPanel } from "@/components/intelligence/ui";
import { MiniStat } from "@/components/intelligence/KpiCard";
import { getProductionMonitor } from "@/lib/intelligence";
import { formatDateTime, formatDuration, formatRelativeTime } from "@/lib/intelligence/formatters";

export const metadata: Metadata = {
  title: "Production Monitor — Employment Intelligence",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MonitorPage() {
  const data = await getProductionMonitor();

  return (
    <>
      <IntelligenceShell
        title="Production Monitor"
        subtitle="System health, scheduler state, throughput, and freshness index from live PostgreSQL."
      >
        <div className="space-y-6 pb-20 lg:pb-6">
          <div className="flex items-center gap-3">
            <IntelBadge tone={data.systemHealth === "healthy" ? "good" : "bad"}>
              System {data.systemHealth}
            </IntelBadge>
            <IntelBadge tone={data.database.connected ? "good" : "bad"}>
              Database {data.database.connected ? "Connected" : "Disconnected"}
            </IntelBadge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MiniStat label="Active Jobs" value={data.database.activeJobs.toLocaleString("fr-MA")} />
            <MiniStat label="Jobs / Hour" value={data.throughput.jobsPerHour} />
            <MiniStat
              label="Avg Crawl Duration"
              value={formatDuration(data.throughput.avgCrawlDurationMs)}
            />
            <MiniStat label="Freshness Index" value={`${data.freshnessIndex}%`} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <IntelPanel title="Scheduler">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <MiniStat label="Active" value={data.scheduler.activeSources} />
                <MiniStat label="Queued" value={data.scheduler.queuedSources} />
                <MiniStat label="Failed" value={data.scheduler.failedSources} />
              </div>
              <p className="mb-3 text-xs font-semibold uppercase text-slate-dim">Upcoming Crawls</p>
              <div className="space-y-2">
                {data.scheduler.upcomingCrawls.map((c) => (
                  <div
                    key={c.source}
                    className="flex items-center justify-between rounded-lg border border-white/8 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="text-white">{c.source}</p>
                      <p className="text-xs text-slate-dim">{c.company}</p>
                    </div>
                    <p className="text-xs text-mint">{formatRelativeTime(c.nextCrawlAt)}</p>
                  </div>
                ))}
              </div>
            </IntelPanel>

            <IntelPanel title="Last Crawl">
              {data.throughput.lastCrawl ? (
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-slate-dim">Source</dt>
                    <dd className="text-white">{data.throughput.lastCrawl.source}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-dim">Status</dt>
                    <dd>
                      <IntelBadge
                        tone={
                          data.throughput.lastCrawl.status === "success" ? "good" : "warn"
                        }
                      >
                        {data.throughput.lastCrawl.status}
                      </IntelBadge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-dim">Started</dt>
                    <dd className="text-slate-muted">
                      {formatDateTime(data.throughput.lastCrawl.startedAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-dim">Duration</dt>
                    <dd className="text-slate-muted">
                      {formatDuration(data.throughput.lastCrawl.durationMs)}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-slate-dim">No crawls recorded yet</p>
              )}
            </IntelPanel>
          </div>

          {data.recentFailures.length > 0 && (
            <IntelPanel title="Recent Failures (24h)">
              <div className="space-y-3">
                {data.recentFailures.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">{f.source}</p>
                      <p className="text-xs text-slate-dim">{formatRelativeTime(f.startedAt)}</p>
                    </div>
                    {f.errorMessage && (
                      <p className="mt-1 text-xs text-red-300 line-clamp-2">{f.errorMessage}</p>
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
