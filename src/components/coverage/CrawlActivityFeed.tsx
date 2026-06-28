"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IntelBadge, IntelPanel } from "@/components/intelligence/ui";
import { formatDateTime, formatDuration } from "@/lib/intelligence/formatters";
import type { CrawlActivityRow } from "@/lib/intelligence/types";

type CrawlData = {
  total: number;
  page: number;
  pageSize: number;
  items: CrawlActivityRow[];
  last24h: {
    crawls: number;
    avgDurationMs: number | null;
    jobsInserted: number;
    jobsUpdated: number;
    duplicates: number;
  };
};

export function CrawlActivityFeed({
  initialData,
  initialSource,
  initialStatus,
}: {
  initialData: CrawlData;
  initialSource: string;
  initialStatus: string;
}) {
  const [data, setData] = useState(initialData);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const params = new URLSearchParams();
      if (initialSource) params.set("source", initialSource);
      if (initialStatus) params.set("status", initialStatus);
      params.set("page", String(data.page));

      const res = await fetch(`/api/admin/intelligence/crawl?${params}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [initialSource, initialStatus, data.page]);

  return (
    <IntelPanel
      title="Crawl Timeline"
      subtitle="Auto-refreshes every 30 seconds"
      action={
        <span className="flex items-center gap-2 text-xs text-emerald-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Live
        </span>
      }
    >
      <div className="relative space-y-0">
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-white/10" />
        {data.items.map((crawl) => (
          <div key={crawl.id} className="relative pl-10 pb-6">
            <div
              className={`absolute left-3 top-1.5 h-3 w-3 rounded-full ring-4 ring-[#030912] ${
                crawl.status === "success" || crawl.status === "completed"
                  ? "bg-emerald-400"
                  : crawl.status === "failed"
                    ? "bg-red-400"
                    : "bg-amber-400"
              }`}
            />
            <div
              className="cursor-pointer rounded-xl border border-white/8 bg-white/[0.02] p-4 transition-all hover:border-mint/20"
              onClick={() => setExpanded(expanded === crawl.id ? null : crawl.id)}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{crawl.source}</p>
                  <p className="text-xs text-slate-dim">{crawl.category}</p>
                </div>
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
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 lg:grid-cols-7">
                <div>
                  <p className="text-slate-dim">Started</p>
                  <p className="text-white">{formatDateTime(crawl.startedAt)}</p>
                </div>
                <div>
                  <p className="text-slate-dim">Duration</p>
                  <p className="text-white">{formatDuration(crawl.durationMs)}</p>
                </div>
                <div>
                  <p className="text-slate-dim">Found</p>
                  <p className="tabular-nums text-white">{crawl.jobsFound}</p>
                </div>
                <div>
                  <p className="text-slate-dim">Inserted</p>
                  <p className="tabular-nums text-emerald-400">+{crawl.jobsInserted}</p>
                </div>
                <div>
                  <p className="text-slate-dim">Updated</p>
                  <p className="tabular-nums text-white">{crawl.jobsUpdated}</p>
                </div>
                <div>
                  <p className="text-slate-dim">Duplicates</p>
                  <p className="tabular-nums text-amber-400">{crawl.duplicates}</p>
                </div>
                <div>
                  <p className="text-slate-dim">Finished</p>
                  <p className="text-white">{formatDateTime(crawl.endedAt)}</p>
                </div>
              </div>

              {expanded === crawl.id && crawl.errorMessage && (
                <pre className="mt-3 overflow-x-auto rounded-lg bg-red-500/10 p-3 text-xs text-red-300">
                  {crawl.errorMessage}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {data.page > 1 && (
          <Link
            href={`/admin/intelligence/crawl?page=${data.page - 1}${
              initialSource ? `&source=${initialSource}` : ""
            }`}
            className="rounded-lg bg-white/8 px-3 py-1.5 text-sm text-white hover:bg-white/12"
          >
            Previous
          </Link>
        )}
        <span className="px-3 py-1.5 text-sm text-slate-dim">
          Page {data.page} · {data.total} crawls
        </span>
      </div>
    </IntelPanel>
  );
}
