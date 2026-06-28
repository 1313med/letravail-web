import type { Metadata } from "next";
import Link from "next/link";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { ValidationBreakdown } from "@/components/intelligence/ValidationBreakdown";
import { IntelBadge, IntelPanel } from "@/components/intelligence/ui";
import { MiniStat } from "@/components/intelligence/KpiCard";
import { getValidationCenter } from "@/lib/intelligence";

export const metadata: Metadata = {
  title: "Validation Center — Employment Intelligence",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ValidationPage() {
  const data = await getValidationCenter();

  return (
    <>
      <IntelligenceShell
        title="Validation Center"
        subtitle="Understand why validation passed or failed — dimension breakdown, issue drill-down, and source reports."
      >
        <div className="space-y-6 pb-20 lg:pb-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <MiniStat label="Total Issues" value={data.summary.totalIssues} />
            <MiniStat label="Errors" value={data.summary.errors} tone="bad" />
            <MiniStat label="Warnings" value={data.summary.warnings} tone="warn" />
          </div>

          <ValidationBreakdown dimensions={data.breakdown} />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.issues.map((issue) => (
              <Link
                key={issue.id}
                href={`/admin/intelligence/validation/${issue.id}`}
                className="group rounded-2xl border border-navy/8 bg-[#FAFBFC] p-5 transition-all hover:border-mint/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-navy group-hover:text-mint-dim">{issue.type}</p>
                  <IntelBadge tone={issue.severity === "error" ? "bad" : "warn"}>
                    {issue.severity}
                  </IntelBadge>
                </div>
                <p className="mt-2 text-3xl font-bold tabular-nums text-navy">{issue.count}</p>
                <p className="mt-1 text-xs text-slate-dim">{issue.message}</p>
              </Link>
            ))}
          </div>

          {data.sourceReports.length > 0 && (
            <IntelPanel title="Source Validation Reports" accent="purple">
              <div className="grid gap-3 sm:grid-cols-2">
                {data.sourceReports.slice(0, 12).map((r) => (
                  <div
                    key={r.source}
                    className="rounded-xl border border-navy/8 bg-[#FAFBFC] p-4 text-sm"
                  >
                    <p className="font-medium text-navy">{r.source}</p>
                    <p className="text-xs text-slate-dim">{r.company}</p>
                    <pre className="mt-2 max-h-32 overflow-auto rounded-lg border border-navy/8 bg-white p-2 text-[10px] text-slate-dim">
                      {JSON.stringify(r.report, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </IntelPanel>
          )}

          <IntelPanel title="Recently Flagged Jobs" accent="blue">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-navy/8 text-xs uppercase text-slate-dim">
                    {["Title", "Company", "Source", "Status", "Flags", "Why"].map((h) => (
                      <th key={h} className="px-3 py-2 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/6">
                  {data.flaggedJobs.slice(0, 25).map((job) => (
                    <tr key={job.id}>
                      <td className="px-3 py-2">
                        <Link href={`/emploi/${job.slug}`} className="text-navy hover:text-mint-dim">
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-slate-dim">{job.company}</td>
                      <td className="px-3 py-2 text-slate-dim">{job.source}</td>
                      <td className="px-3 py-2">
                        <IntelBadge tone="warn">{job.validationStatus ?? "unknown"}</IntelBadge>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-dim">
                        {job.validationFlags.join(", ") || "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-dim">
                        {job.validationFlags.length > 0
                          ? `Failed: ${job.validationFlags.join(", ")}`
                          : job.validationStatus !== "valid"
                            ? `Status: ${job.validationStatus}`
                            : "Flagged for review"}
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
