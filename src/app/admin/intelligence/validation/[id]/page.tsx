import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { IntelBackLink, IntelPanel } from "@/components/intelligence/ui";
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
  "duplicate-companies": "Duplicate Companies",
  "rejected-jobs": "Jobs Rejected",
  "broken-urls": "Broken URLs",
};

type Props = { params: { id: string } };

export default async function ValidationDetailPage({ params }: Props) {
  if (!TITLES[params.id]) notFound();

  const records = await getValidationIssueDetails(params.id);

  return (
    <>
      <IntelligenceShell
        title={TITLES[params.id]}
        actions={<IntelBackLink href="/admin/intelligence/validation" label="← Back" />}
      >
        <IntelPanel title={`${records.length} records`} accent="red">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy/8 text-xs uppercase text-slate-dim">
                  {params.id === "duplicate-companies"
                    ? ["Alias", "Company", "Confidence"].map((h) => (
                        <th key={h} className="px-3 py-2 font-semibold">{h}</th>
                      ))
                    : ["Title", "Company", "Source", "Details"].map((h) => (
                        <th key={h} className="px-3 py-2 font-semibold">{h}</th>
                      ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/6">
                {params.id === "duplicate-companies"
                  ? records.map((row) => {
                      const alias = row as {
                        id: string;
                        alias: string;
                        confidence: number;
                        company: { name: string; slug: string };
                      };
                      return (
                        <tr key={alias.id}>
                          <td className="px-3 py-2 text-navy">{alias.alias}</td>
                          <td className="px-3 py-2">
                            <Link
                              href={`/admin/intelligence/companies/${alias.company.slug}`}
                              className="text-navy hover:text-mint-dim"
                            >
                              {alias.company.name}
                            </Link>
                          </td>
                          <td className="px-3 py-2 text-slate-dim">
                            {Math.round(alias.confidence * 100)}%
                          </td>
                        </tr>
                      );
                    })
                  : records.map((job) => {
                      const j = job as Record<string, unknown>;
                      return (
                        <tr key={String(j.id)}>
                          <td className="px-3 py-2">
                            {j.slug ? (
                              <Link
                                href={`/emploi/${j.slug}`}
                                className="text-navy hover:text-mint-dim"
                              >
                                {String(j.title)}
                              </Link>
                            ) : (
                              String(j.title)
                            )}
                          </td>
                          <td className="px-3 py-2 text-slate-dim">{String(j.company ?? "—")}</td>
                          <td className="px-3 py-2 text-slate-dim">{String(j.source ?? "—")}</td>
                          <td className="px-3 py-2 text-xs text-slate-dim">
                            {j.validationStatus != null && `Status: ${String(j.validationStatus)}`}
                            {Array.isArray(j.validationFlags) && j.validationFlags.length > 0 &&
                              ` · Flags: ${(j.validationFlags as string[]).join(", ")}`}
                            {j.descriptionScore != null && ` · Desc score: ${String(j.descriptionScore)}`}
                            {j.city != null && j.city !== "" && ` · City: ${String(j.city)}`}
                            {j.applicationUrl != null && j.applicationUrl !== "" && (
                              <span className="block truncate max-w-xs">{String(j.applicationUrl)}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </IntelPanel>
      </IntelligenceShell>
      <IntelligenceMobileNav />
    </>
  );
}
