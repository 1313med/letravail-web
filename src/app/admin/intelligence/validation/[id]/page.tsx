import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { IntelPanel } from "@/components/intelligence/ui";
import { getValidationIssueDetails } from "@/lib/intelligence";

export const metadata: Metadata = {
  title: "Validation Details — Employment Intelligence",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const TITLES: Record<string, string> = {
  "invalid-jobs": "Invalid Jobs",
  "missing-descriptions": "Missing Descriptions",
  "broken-locations": "Broken Locations",
};

type Props = { params: { id: string } };

export default async function ValidationDetailPage({ params }: Props) {
  if (!TITLES[params.id]) notFound();

  const jobs = await getValidationIssueDetails(params.id);

  return (
    <>
      <IntelligenceShell
        title={TITLES[params.id]}
        actions={
          <Link
            href="/admin/intelligence/validation"
            className="rounded-lg bg-white/8 px-4 py-2 text-sm text-white hover:bg-white/12"
          >
            ← Back
          </Link>
        }
      >
        <IntelPanel title={`${jobs.length} records`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/8 text-xs uppercase text-slate-dim">
                  {["Title", "Company", "Source", "Details"].map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-3 py-2">
                      {"slug" in job && job.slug ? (
                        <Link href={`/emploi/${job.slug}`} className="text-white hover:text-mint">
                          {job.title}
                        </Link>
                      ) : (
                        job.title
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-muted">{job.company}</td>
                    <td className="px-3 py-2 text-slate-muted">{job.source}</td>
                    <td className="px-3 py-2 text-xs text-slate-dim">
                      {"validationStatus" in job && job.validationStatus}
                      {"descriptionScore" in job && job.descriptionScore != null &&
                        ` · score ${job.descriptionScore}`}
                      {"city" in job && job.city && ` · ${job.city}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </IntelPanel>
      </IntelligenceShell>
      <IntelligenceMobileNav />
    </>
  );
}
