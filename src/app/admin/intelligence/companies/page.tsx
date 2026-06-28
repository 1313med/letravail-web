import type { Metadata } from "next";
import Link from "next/link";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { IntelActivationBadge, IntelPanel } from "@/components/intelligence/ui";
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
              className="min-w-[240px] flex-1 rounded-xl border border-navy/10 bg-white px-4 py-2.5 text-sm text-navy placeholder:text-slate-dim focus:border-mint/40 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90"
            >
              Search
            </button>
          </form>

          <IntelPanel title={`${data.total.toLocaleString("fr-MA")} companies`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead>
                  <tr className="border-b border-navy/8 text-xs uppercase tracking-wide text-slate-dim">
                    {[
                      "Company",
                      "Active Jobs",
                      "Historical",
                      "Quality",
                      "Employer Health",
                      "Activation",
                      "Validation",
                      "Last Validation",
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
                <tbody className="divide-y divide-navy/6">
                  {data.items.map((row) => (
                    <tr key={row.id} className="hover:bg-[#FAFBFC]">
                      <td className="px-3 py-3">
                        <Link
                          href={`/admin/intelligence/companies/${row.slug}`}
                          className="font-medium text-navy hover:text-mint-dim"
                        >
                          {row.name}
                        </Link>
                      </td>
                      <td className="px-3 py-3 tabular-nums text-navy">{row.activeJobs}</td>
                      <td className="px-3 py-3 tabular-nums text-slate-dim">
                        {row.historicalJobs}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-navy">
                        {formatScore(row.qualityScore)}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-navy">
                        {formatScore(row.employerHealth)}
                      </td>
                      <td className="px-3 py-3">
                        <IntelActivationBadge state={row.activationState} />
                      </td>
                      <td className="px-3 py-3 tabular-nums text-navy">
                        {formatScore(row.validationScore)}
                      </td>
                      <td className="px-3 py-3 text-slate-dim">
                        {formatRelativeTime(row.lastValidationAt)}
                      </td>
                      <td className="px-3 py-3 text-slate-dim">
                        {formatRelativeTime(row.lastCrawlAt)}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-slate-dim">
                        {row.skillDensity != null ? formatPercent(row.skillDensity) : "—"}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-slate-dim">
                        {row.experienceDensity != null ? formatPercent(row.experienceDensity) : "—"}
                      </td>
                      <td className="px-3 py-3 text-slate-dim">{row.headquartersCity ?? "—"}</td>
                      <td className="px-3 py-3 text-slate-dim">{row.industry ?? row.sector ?? "—"}</td>
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
                        ? "bg-navy text-white font-semibold"
                        : "bg-navy/5 text-slate-dim hover:text-navy"
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
