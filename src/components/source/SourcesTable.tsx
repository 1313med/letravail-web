"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { IntelBadge, IntelPanel, IntelTable } from "@/components/intelligence/ui";
import { formatPercent, formatRelativeTime, formatScore } from "@/lib/intelligence/formatters";
import type { SourceRow } from "@/lib/intelligence/types";

type SourcesData = {
  total: number;
  page: number;
  pageSize: number;
  items: SourceRow[];
};

export function SourcesTable({
  data,
  statuses,
  initialSearch,
  initialStatus,
}: {
  data: SourcesData;
  statuses: { status: string; count: number }[];
  initialSearch: string;
  initialStatus: string;
  initialSort?: string;
  initialOrder?: "asc" | "desc";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const [disabling, setDisabling] = useState<string | null>(null);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      startTransition(() => {
        router.push(`/admin/intelligence/sources?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  async function handleDisable(sourceName: string) {
    if (!confirm(`Disable source "${sourceName}"?`)) return;
    setDisabling(sourceName);
    try {
      await fetch("/api/admin/intelligence/sources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceName, status: "disabled" }),
      });
      router.refresh();
    } finally {
      setDisabling(null);
    }
  }

  const totalPages = Math.ceil(data.total / data.pageSize);

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search sources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && updateParams({ q: search, page: "1" })}
          className="min-w-[240px] flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-dim focus:border-mint/40 focus:outline-none focus:ring-2 focus:ring-mint/20"
        />
        <select
          value={initialStatus}
          onChange={(e) => updateParams({ status: e.target.value || undefined, page: "1" })}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-mint/40 focus:outline-none"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s.status} value={s.status}>
              {s.status} ({s.count})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => updateParams({ q: search, page: "1" })}
          disabled={pending}
          className="rounded-xl bg-mint px-4 py-2.5 text-sm font-semibold text-navy hover:bg-mint-glow disabled:opacity-50"
        >
          Search
        </button>
      </div>

      <IntelPanel
        title={`${data.total.toLocaleString("fr-MA")} sources`}
        subtitle={`Page ${data.page} of ${totalPages || 1}`}
      >
        <IntelTable
          headers={[
            "Source",
            "Status",
            "Jobs",
            "Last Crawl",
            "Quality",
            "Freshness",
            "Avg Desc",
            "Success",
            "Errors",
            "Priority",
            "ATS",
            "Actions",
          ]}
        >
          {data.items.map((row) => (
            <tr key={row.id} className="hover:bg-white/[0.02]">
              <td className="px-3 py-3">
                <p className="font-medium text-white">{row.sourceName}</p>
                <p className="text-xs text-slate-dim">{row.companyName}</p>
              </td>
              <td className="px-3 py-3">
                <IntelBadge tone={row.status === "active" ? "good" : row.status === "disabled" ? "bad" : "warn"}>
                  {row.status}
                </IntelBadge>
              </td>
              <td className="px-3 py-3 tabular-nums text-white">{row.activeJobs}</td>
              <td className="px-3 py-3 text-slate-muted">
                {formatRelativeTime(row.lastCrawlAt)}
              </td>
              <td className="px-3 py-3 tabular-nums text-white">
                {formatScore(row.intelligenceScore)}
              </td>
              <td className="px-3 py-3 tabular-nums text-white">
                {formatScore(row.freshnessScore)}
              </td>
              <td className="px-3 py-3 tabular-nums text-slate-muted">
                {row.avgDescriptionLength ?? "—"}
              </td>
              <td className="px-3 py-3 tabular-nums text-slate-muted">
                {row.failureRate != null ? formatPercent(row.failureRate * 100) : "—"}
              </td>
              <td className="px-3 py-3 tabular-nums text-red-400">{row.errorCount}</td>
              <td className="px-3 py-3 tabular-nums text-mint">
                {formatScore(row.priorityScore)}
              </td>
              <td className="px-3 py-3 text-xs text-slate-muted">{row.atsPlatform ?? "—"}</td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap gap-1.5">
                  <Link
                    href={`/admin/intelligence/crawl?source=${encodeURIComponent(row.sourceName)}`}
                    className="rounded-md bg-white/8 px-2 py-1 text-xs text-white hover:bg-white/12"
                  >
                    Logs
                  </Link>
                  {row.status !== "disabled" && (
                    <button
                      type="button"
                      disabled={disabling === row.sourceName}
                      onClick={() => handleDisable(row.sourceName)}
                      className="rounded-md bg-red-500/15 px-2 py-1 text-xs text-red-400 hover:bg-red-500/25 disabled:opacity-50"
                    >
                      Disable
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </IntelTable>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => updateParams({ page: String(p) })}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  p === data.page
                    ? "bg-mint text-navy font-semibold"
                    : "bg-white/8 text-slate-muted hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </IntelPanel>
    </div>
  );
}
