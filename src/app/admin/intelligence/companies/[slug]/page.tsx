import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { IntelActivationBadge, IntelBackLink, IntelBadge, IntelPanel } from "@/components/intelligence/ui";
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

  const { company, growth, activation } = result;

  return (
    <>
      <IntelligenceShell
        title={company.name}
        subtitle={[company.sector, company.industry, company.headquartersCity].filter(Boolean).join(" · ")}
        actions={<IntelBackLink href="/admin/intelligence/companies" label="← Back" />}
      >
        <div className="space-y-6 pb-20 lg:pb-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MiniStat label="Active Jobs" value={company.activeJobCount} />
            <MiniStat label="Historical Jobs" value={company.activeJobCount + company.archivedJobCount} />
            <MiniStat label="Last Crawl" value={formatRelativeTime(company.lastCrawlAt?.toISOString() ?? null)} />
            <MiniStat label="Hiring Frequency" value={company.hiringFrequency ?? "—"} />
          </div>

          <IntelPanel title="Historical Growth" subtitle="Jobs first seen per day (90d)" accent="green">
            <TrendAreaChart data={growth} />
          </IntelPanel>

          {activation && (
            <IntelPanel title="Employer Activation" accent="green">
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                <div>
                  <dt className="text-xs text-slate-dim">Activation State</dt>
                  <dd className="mt-1">
                    <IntelActivationBadge state={activation.activationState} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-dim">Employer Health</dt>
                  <dd className="mt-1 font-medium text-navy">{formatScore(activation.healthScore)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-dim">Validation Score</dt>
                  <dd className="mt-1 font-medium text-navy">{formatScore(activation.validationScore)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-dim">Last Validation</dt>
                  <dd className="mt-1 text-slate-dim">
                    {formatRelativeTime(activation.lastValidationAt?.toISOString() ?? null)}
                  </dd>
                </div>
              </dl>
            </IntelPanel>
          )}

          <div className="grid gap-6 xl:grid-cols-2">
            <IntelPanel title="Company Profile" accent="blue">
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
                    <dd className="mt-0.5 break-all text-slate-dim">{value ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            </IntelPanel>

            <IntelPanel title="Aliases" accent="purple">
              {company.aliases.length > 0 ? (
                <ul className="space-y-2">
                  {company.aliases.map((a) => (
                    <li key={a.id} className="flex items-center justify-between text-sm">
                      <span className="text-navy">{a.alias}</span>
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

          <IntelPanel title="Recent Jobs" accent="blue">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-navy/8 text-xs uppercase text-slate-dim">
                    {["Title", "City", "Quality", "Skills", "Status", "First Seen"].map((h) => (
                      <th key={h} className="px-3 py-2 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/6">
                  {company.jobs.slice(0, 20).map((job) => (
                    <tr key={job.id}>
                      <td className="px-3 py-2">
                        <Link href={`/emploi/${job.slug}`} className="text-navy hover:text-mint-dim">
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-slate-dim">{job.city}</td>
                      <td className="px-3 py-2 tabular-nums">{formatScore(job.qualityScore)}</td>
                      <td className="px-3 py-2 tabular-nums text-slate-dim">{job.skills.length}</td>
                      <td className="px-3 py-2">
                        <IntelBadge tone={job.isActive ? "good" : "neutral"}>
                          {job.isActive ? "Active" : "Archived"}
                        </IntelBadge>
                      </td>
                      <td className="px-3 py-2 text-slate-dim">
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
