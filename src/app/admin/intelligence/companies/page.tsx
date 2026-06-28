import type { Metadata } from "next";
import Link from "next/link";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { IntelPanel } from "@/components/intelligence/ui";
import { searchCompanies } from "@/lib/intelligence";
import { formatPercent, formatRelativeTime, formatScore } from "@/lib/intelligence/formatters";

export const metadata: Metadata = {
  title: "Company Intelligence — Employment Intelligence",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { searchParams: { q?: string; page?: string } };

export default async function CompaniesPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const data = await searchCompanies({ search: searchParams.q, page });
  const totalPages = Math.ceil(data.total / data.pageSize);

  return (
    <>
      <IntelligenceShell
        title="Company Intelligence"
        subtitle="Search employers — hiring trends, quality scores, and enrichment from companies + jobs."
      >
        <div className="space-y-4 pb-20 lg:pb-6">
          <form className="flex gap-3">
            <input
              name="q"
              defaultValue={searchParams.q ?? ""}
              placeholder="Search companies..."
              className="min-w-[240px] flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-dim focus:border-mint/40 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-mint px-4 py-2.5 text-sm font-semibold text-navy hover:bg-mint-glow"
            >
              Search
            </button>
          </form>

          <IntelPanel title={`${data.total.toLocaleString("fr-MA")} companies`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-xs uppercase tracking-wide text-slate-dim">
                    {[
                      "Company",
                      "Active Jobs",
                      "Historical",
                      "Quality",
                      "Last Crawl",
                      "Skill Density",
                      "Experience",
                      "HQ",
                      "Industry",
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
                          href={`/admin/intelligence/companies/${row.slug}`}
                          className="font-medium text-white hover:text-mint"
                        >
                          {row.name}
                        </Link>
                      </td>
                      <td className="px-3 py-3 tabular-nums text-white">{row.activeJobs}</td>
                      <td className="px-3 py-3 tabular-nums text-slate-muted">
                        {row.historicalJobs}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-white">
                        {formatScore(row.qualityScore)}
                      </td>
                      <td className="px-3 py-3 text-slate-muted">
                        {formatRelativeTime(row.lastCrawlAt)}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-slate-muted">
                        {row.skillDensity != null ? formatPercent(row.skillDensity) : "—"}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-slate-muted">
                        {row.experienceDensity != null ? formatPercent(row.experienceDensity) : "—"}
                      </td>
                      <td className="px-3 py-3 text-slate-muted">{row.headquartersCity ?? "—"}</td>
                      <td className="px-3 py-3 text-slate-muted">{row.industry ?? row.sector ?? "—"}</td>
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
                    href={`/admin/intelligence/companies?page=${p}${
                      searchParams.q ? `&q=${encodeURIComponent(searchParams.q)}` : ""
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
