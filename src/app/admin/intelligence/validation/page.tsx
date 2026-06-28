import type { Metadata } from "next";
import Link from "next/link";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
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
        subtitle="Every validation issue from jobs.validationStatus, validationFlags, and source lastValidationReport."
      >
        <div className="space-y-6 pb-20 lg:pb-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <MiniStat label="Total Issues" value={data.summary.totalIssues} />
            <MiniStat label="Errors" value={data.summary.errors} />
            <MiniStat label="Warnings" value={data.summary.warnings} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.issues.map((issue) => (
              <Link
                key={issue.id}
                href={`/admin/intelligence/validation/${issue.id}`}
                className="group rounded-2xl border border-white/8 bg-white/[0.02] p-5 transition-all hover:border-mint/20 hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-white group-hover:text-mint">{issue.type}</p>
                  <IntelBadge tone={issue.severity === "error" ? "bad" : "warn"}>
                    {issue.severity}
                  </IntelBadge>
                </div>
                <p className="mt-2 text-3xl font-bold tabular-nums text-white">{issue.count}</p>
                <p className="mt-1 text-xs text-slate-dim">{issue.message}</p>
              </Link>
            ))}
          </div>

          <IntelPanel title="Status Breakdown">
            <div className="flex flex-wrap gap-3">
              {data.statusBreakdown.map((s) => (
                <div
                  key={s.status}
                  className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3"
                >
                  <p className="text-xs text-slate-dim">{s.status}</p>
                  <p className="text-xl font-semibold text-white">{s.count}</p>
                </div>
              ))}
            </div>
          </IntelPanel>

          <IntelPanel title="Recently Flagged Jobs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-xs uppercase text-slate-dim">
                    {["Title", "Company", "Source", "Status", "Flags"].map((h) => (
                      <th key={h} className="px-3 py-2 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.flaggedJobs.slice(0, 25).map((job) => (
                    <tr key={job.id}>
                      <td className="px-3 py-2">
                        <Link href={`/emploi/${job.slug}`} className="text-white hover:text-mint">
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-slate-muted">{job.company}</td>
                      <td className="px-3 py-2 text-slate-muted">{job.source}</td>
                      <td className="px-3 py-2">
                        <IntelBadge tone="warn">{job.validationStatus ?? "unknown"}</IntelBadge>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-dim">
                        {job.validationFlags.join(", ") || "—"}
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
