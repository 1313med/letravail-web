"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import {
  IntelActivationBadge,
  IntelBadge,
  IntelPanel,
  IntelPrimaryButton,
  IntelSearchInput,
  IntelSelect,
  IntelTable,
} from "@/components/intelligence/ui";
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
  initialFilter = "",
}: {
  data: SourcesData;
  statuses: { status: string; count: number }[];
  initialSearch: string;
  initialStatus: string;
  initialFilter?: string;
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

  const QUICK_FILTERS = [
    { id: "active", label: "Only ACTIVE" },
    { id: "ready", label: "Only READY" },
    { id: "retry", label: "Needs Retry" },
    { id: "validation", label: "Needs Validation" },
    { id: "lowHealth", label: "Health Below 60" },
    { id: "failed", label: "Failed Sources" },
  ] as const;

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateParams({ filter: undefined, page: "1" })}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            !initialFilter
              ? "bg-navy text-white shadow-sm"
              : "bg-navy/5 text-slate-dim hover:text-navy"
          }`}
        >
          All sources
        </button>
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => updateParams({ filter: f.id, page: "1" })}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              initialFilter === f.id
                ? "bg-navy text-white shadow-sm"
                : "bg-navy/5 text-slate-dim hover:text-navy"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <IntelSearchInput
          type="search"
          placeholder="Search sources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && updateParams({ q: search, page: "1" })}
        />
        <IntelSelect
          value={initialStatus}
          onChange={(e) => updateParams({ status: e.target.value || undefined, page: "1" })}
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s.status} value={s.status}>
              {s.status} ({s.count})
            </option>
          ))}
        </IntelSelect>
        <IntelPrimaryButton
          onClick={() => updateParams({ q: search, page: "1" })}
          disabled={pending}
        >
          Search
        </IntelPrimaryButton>
      </div>

      <IntelPanel
        title={`${data.total.toLocaleString("fr-MA")} sources`}
        subtitle={`Page ${data.page} of ${totalPages || 1}`}
        accent="blue"
      >
        <IntelTable
          headers={[
            "Source",
            "Status",
            "Activation",
            "Health",
            "Validation",
            "Auto",
            "Next Retry",
            "Last Validation",
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
            <tr key={row.id} className="hover:bg-navy/[0.02]">
              <td className="px-3 py-3">
                <p className="font-medium text-navy">{row.sourceName}</p>
                <p className="text-xs text-slate-dim">{row.companyName}</p>
              </td>
              <td className="px-3 py-3">
                <IntelBadge tone={row.status === "active" ? "good" : row.status === "disabled" ? "bad" : "warn"}>
                  {row.status}
                </IntelBadge>
              </td>
              <td className="px-3 py-3">
                <IntelActivationBadge state={row.activationState} />
              </td>
              <td className="px-3 py-3 tabular-nums text-navy">
                {formatScore(row.healthScore)}
              </td>
              <td className="px-3 py-3 tabular-nums text-navy">
                {formatScore(row.validationScore)}
              </td>
              <td className="px-3 py-3">
                <IntelBadge tone={row.automaticActivation ? "good" : "neutral"}>
                  {row.automaticActivation ? "Yes" : "No"}
                </IntelBadge>
              </td>
              <td className="px-3 py-3 text-slate-dim">
                {formatRelativeTime(row.nextRetryAt)}
              </td>
              <td className="px-3 py-3 text-slate-dim">
                {formatRelativeTime(row.lastValidationAt)}
              </td>
              <td className="px-3 py-3 tabular-nums text-navy">{row.activeJobs}</td>
              <td className="px-3 py-3 text-slate-dim">
                {formatRelativeTime(row.lastCrawlAt)}
              </td>
              <td className="px-3 py-3 tabular-nums text-navy">
                {formatScore(row.intelligenceScore)}
              </td>
              <td className="px-3 py-3 tabular-nums text-navy">
                {formatScore(row.freshnessScore)}
              </td>
              <td className="px-3 py-3 tabular-nums text-slate-dim">
                {row.avgDescriptionLength ?? "—"}
              </td>
              <td className="px-3 py-3 tabular-nums text-slate-dim">
                {row.failureRate != null ? formatPercent(row.failureRate * 100) : "—"}
              </td>
              <td className="px-3 py-3 tabular-nums text-red-600">{row.errorCount}</td>
              <td className="px-3 py-3 tabular-nums font-medium text-mint-dim">
                {formatScore(row.priorityScore)}
              </td>
              <td className="px-3 py-3 text-xs text-slate-dim">{row.atsPlatform ?? "—"}</td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap gap-1.5">
                  <Link
                    href={`/admin/intelligence/crawl?source=${encodeURIComponent(row.sourceName)}`}
                    className="rounded-md border border-navy/10 bg-white px-2 py-1 text-xs font-medium text-navy hover:bg-navy/5"
                  >
                    Logs
                  </Link>
                  {row.status !== "disabled" && (
                    <button
                      type="button"
                      disabled={disabling === row.sourceName}
                      onClick={() => handleDisable(row.sourceName)}
                      className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
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
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  p === data.page
                    ? "bg-navy text-white"
                    : "border border-navy/10 bg-white text-slate-dim hover:bg-navy/5"
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
