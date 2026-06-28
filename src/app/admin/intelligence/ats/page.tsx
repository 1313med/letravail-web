import type { Metadata } from "next";
import Link from "next/link";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { IntelBadge, IntelPanel } from "@/components/intelligence/ui";
import { MiniStat } from "@/components/intelligence/KpiCard";
import { getAtsIntelligence, getAtsSummary } from "@/lib/intelligence";
import { formatPercent, formatRelativeTime, formatScore } from "@/lib/intelligence/formatters";

export const metadata: Metadata = {
  title: "ATS Intelligence — Employment Intelligence",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: { q?: string; platform?: string; page?: string };
};

export default async function AtsIntelligencePage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const [data, summary] = await Promise.all([
    getAtsIntelligence({
      search: searchParams.q,
      platform: searchParams.platform,
      page,
    }),
    getAtsSummary(),
  ]);

  const totalPages = Math.ceil(data.total / data.pageSize);

  return (
    <>
      <IntelligenceShell
        title="ATS Intelligence"
        subtitle="Employer ATS detection, confidence scores, and crawl strategies from employer_ats_intelligence."
      >
        <div className="space-y-6 pb-20 lg:pb-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MiniStat label="Total Probed" value={summary.total} />
            <MiniStat label="Ready" value={summary.ready} sub="Onboarded employers" />
            <MiniStat label="Needs Investigation" value={summary.investigate} />
            <MiniStat
              label="Avg Confidence"
              value={formatPercent(summary.avgConfidence * 100)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/intelligence/ats"
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                !searchParams.platform
                  ? "bg-mint/15 text-mint ring-1 ring-mint/30"
                  : "bg-white/8 text-slate-muted hover:text-white"
              }`}
            >
              All platforms
            </Link>
            {data.platforms.map((p) => (
              <Link
                key={p.platform}
                href={`/admin/intelligence/ats?platform=${encodeURIComponent(p.platform)}`}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  searchParams.platform === p.platform
                    ? "bg-mint/15 text-mint ring-1 ring-mint/30"
                    : "bg-white/8 text-slate-muted hover:text-white"
                }`}
              >
                {p.platform} ({p.count})
              </Link>
            ))}
          </div>

          <IntelPanel title={`${data.total} ATS records`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-xs uppercase tracking-wide text-slate-dim">
                    {[
                      "Employer",
                      "ATS",
                      "Confidence",
                      "Strategy",
                      "API",
                      "Playwright",
                      "Status",
                      "Last Probe",
                      "Priority",
                      "Health",
                    ].map((h) => (
                      <th key={h} className="px-3 py-2.5 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.items.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.02]">
                      <td className="px-3 py-3">
                        <Link
                          href={`/admin/intelligence/ats/${row.id}`}
                          className="font-medium text-white hover:text-mint"
                        >
                          {row.companyName}
                        </Link>
                        {row.sourceName && (
                          <p className="text-xs text-slate-dim">{row.sourceName}</p>
                        )}
                      </td>
                      <td className="px-3 py-3 text-slate-muted">{row.atsPlatform}</td>
                      <td className="px-3 py-3 tabular-nums text-white">
                        {formatPercent(row.confidence * 100)}
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-muted">{row.crawlStrategy}</td>
                      <td className="px-3 py-3 tabular-nums text-slate-muted">
                        {row.apiEndpoints.length}
                      </td>
                      <td className="px-3 py-3">
                        <IntelBadge tone={row.jsRenderingRequired ? "warn" : "good"}>
                          {row.jsRenderingRequired ? "Yes" : "No"}
                        </IntelBadge>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-muted">
                        {row.onboardingStatus}
                      </td>
                      <td className="px-3 py-3 text-slate-muted">
                        {formatRelativeTime(row.probedAt)}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-mint">
                        {formatScore(row.priority)}
                      </td>
                      <td className="px-3 py-3">
                        <IntelBadge
                          tone={
                            row.health === "ready"
                              ? "good"
                              : row.health === "investigate"
                                ? "warn"
                                : "neutral"
                          }
                        >
                          {row.health === "ready"
                            ? "Ready"
                            : row.health === "investigate"
                              ? "Investigate"
                              : "Unknown"}
                        </IntelBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/admin/intelligence/ats?page=${p}${
                      searchParams.platform ? `&platform=${searchParams.platform}` : ""
                    }`}
                    className={`rounded-lg px-3 py-1.5 text-sm ${
                      p === page
                        ? "bg-mint text-navy font-semibold"
                        : "bg-white/8 text-slate-muted hover:text-white"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </IntelPanel>
        </div>
      </IntelligenceShell>
      <IntelligenceMobileNav />
    </>
  );
}
