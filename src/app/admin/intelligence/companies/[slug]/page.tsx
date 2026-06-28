import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { IntelPanel, IntelBadge } from "@/components/intelligence/ui";
import { MiniStat } from "@/components/intelligence/KpiCard";
import { TrendAreaChart } from "@/components/charts/IntelligenceCharts";
import { getCompanyBySlug } from "@/lib/intelligence";
import { formatDateTime, formatRelativeTime, formatScore } from "@/lib/intelligence/formatters";

export const metadata: Metadata = {
  title: "Company Details — Employment Intelligence",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export default async function CompanyDetailPage({ params }: Props) {
  const result = await getCompanyBySlug(params.slug);
  if (!result) notFound();

  const { company, growth } = result;

  return (
    <>
      <IntelligenceShell
        title={company.name}
        subtitle={[company.sector, company.industry, company.headquartersCity].filter(Boolean).join(" · ")}
        actions={
          <Link
            href="/admin/intelligence/companies"
            className="rounded-lg bg-white/8 px-4 py-2 text-sm text-white hover:bg-white/12"
          >
            ← Back
          </Link>
        }
      >
        <div className="space-y-6 pb-20 lg:pb-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MiniStat label="Active Jobs" value={company.activeJobCount} />
            <MiniStat label="Historical Jobs" value={company.activeJobCount + company.archivedJobCount} />
            <MiniStat label="Last Crawl" value={formatRelativeTime(company.lastCrawlAt?.toISOString() ?? null)} />
            <MiniStat label="Hiring Frequency" value={company.hiringFrequency ?? "—"} />
          </div>

          <IntelPanel title="Historical Growth" subtitle="Jobs first seen per day (90d)">
            <TrendAreaChart data={growth} />
          </IntelPanel>

          <div className="grid gap-6 xl:grid-cols-2">
            <IntelPanel title="Company Profile">
              <dl className="space-y-3 text-sm">
                {[
                  ["Website", company.websiteUrl],
                  ["Career Page", company.careerPageUrl],
                  ["LinkedIn", company.linkedinUrl],
                  ["Size", company.size],
                  ["Founded", company.foundedYear?.toString()],
                  ["Offices", company.moroccanOffices.join(", ") || null],
                  ["First Seen", company.firstSeenAt ? formatDateTime(company.firstSeenAt) : null],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-slate-dim">{label}</dt>
                    <dd className="mt-0.5 break-all text-slate-muted">{value ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            </IntelPanel>

            <IntelPanel title="Aliases">
              {company.aliases.length > 0 ? (
                <ul className="space-y-2">
                  {company.aliases.map((a) => (
                    <li key={a.id} className="flex items-center justify-between text-sm">
                      <span className="text-white">{a.alias}</span>
                      <IntelBadge tone={a.isManual ? "mint" : "neutral"}>
                        {Math.round(a.confidence * 100)}%
                      </IntelBadge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-dim">No aliases</p>
              )}
            </IntelPanel>
          </div>

          <IntelPanel title="Recent Jobs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-xs uppercase text-slate-dim">
                    {["Title", "City", "Quality", "Skills", "Status", "First Seen"].map((h) => (
                      <th key={h} className="px-3 py-2 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {company.jobs.slice(0, 20).map((job) => (
                    <tr key={job.id}>
                      <td className="px-3 py-2">
                        <Link href={`/emploi/${job.slug}`} className="text-white hover:text-mint">
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-slate-muted">{job.city}</td>
                      <td className="px-3 py-2 tabular-nums">{formatScore(job.qualityScore)}</td>
                      <td className="px-3 py-2 tabular-nums text-slate-muted">{job.skills.length}</td>
                      <td className="px-3 py-2">
                        <IntelBadge tone={job.isActive ? "good" : "neutral"}>
                          {job.isActive ? "Active" : "Archived"}
                        </IntelBadge>
                      </td>
                      <td className="px-3 py-2 text-slate-muted">
                        {formatRelativeTime(job.firstSeenAt.toISOString())}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </IntelPanel>
        </div>
      </IntelligenceShell>
      <IntelligenceMobileNav />
    </>
  );
}
