import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { IntelBadge, IntelPanel } from "@/components/intelligence/ui";
import { getAtsById } from "@/lib/intelligence";
import { formatDateTime, formatPercent } from "@/lib/intelligence/formatters";

export const metadata: Metadata = {
  title: "ATS Details — Employment Intelligence",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export default async function AtsDetailPage({ params }: Props) {
  const record = await getAtsById(params.id);
  if (!record) notFound();

  const config = record.platformConfig as Record<string, unknown> | null;

  return (
    <>
      <IntelligenceShell
        title={record.companyName}
        subtitle={`${record.atsPlatform} · ${record.crawlStrategy}`}
        actions={
          <Link
            href="/admin/intelligence/ats"
            className="rounded-lg bg-white/8 px-4 py-2 text-sm text-white hover:bg-white/12"
          >
            ← Back to ATS
          </Link>
        }
      >
        <div className="grid gap-6 pb-20 lg:pb-6 xl:grid-cols-2">
          <IntelPanel title="Detection Summary">
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ["Confidence", formatPercent(record.confidence * 100)],
                ["Status", record.onboardingStatus],
                ["Strategy", record.crawlStrategy],
                ["Adapter", record.recommendedAdapter ?? "—"],
                ["Estimated Jobs", record.estimatedJobVolume ?? "—"],
                ["Complexity", record.technicalComplexity ?? "—"],
                ["Maintenance", record.maintenanceEffort ?? "—"],
                ["Last Probe", formatDateTime(record.probedAt)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-dim">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </IntelPanel>

          <IntelPanel title="Technical Configuration">
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <IntelBadge tone={record.robotsAllowed ? "good" : "bad"}>
                  Robots {record.robotsAllowed ? "Allowed" : "Blocked"}
                </IntelBadge>
                <IntelBadge tone={record.jsRenderingRequired ? "warn" : "good"}>
                  {record.jsRenderingRequired ? "JS Required" : "Static HTML"}
                </IntelBadge>
                <IntelBadge tone={record.authRequired ? "warn" : "good"}>
                  {record.authRequired ? "Auth Required" : "Public"}
                </IntelBadge>
                <IntelBadge tone={record.graphqlDetected ? "mint" : "neutral"}>
                  {record.graphqlDetected ? "GraphQL" : "REST/HTML"}
                </IntelBadge>
                <IntelBadge tone={record.structuredData ? "good" : "neutral"}>
                  {record.structuredData ? "Structured Data" : "No Schema"}
                </IntelBadge>
              </div>
              <div>
                <p className="text-xs text-slate-dim">Pagination</p>
                <p className="text-white">{record.paginationType ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-dim">Detail Endpoint</p>
                <p className="break-all font-mono text-xs text-slate-muted">
                  {record.detailEndpoint ?? "—"}
                </p>
              </div>
            </div>
          </IntelPanel>

          <IntelPanel title="API Endpoints" className="xl:col-span-2">
            {record.apiEndpoints.length > 0 ? (
              <ul className="space-y-2">
                {record.apiEndpoints.map((ep) => (
                  <li
                    key={ep}
                    className="rounded-lg border border-white/8 bg-white/[0.03] px-4 py-2 font-mono text-xs text-mint break-all"
                  >
                    {ep}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-dim">No API endpoints detected</p>
            )}
          </IntelPanel>

          <IntelPanel title="URLs">
            <dl className="space-y-3 text-sm">
              {[
                ["Input URL", record.inputUrl],
                ["Careers Page", record.careersPageUrl],
                ["Final URL", record.finalUrl],
                ["Application Pattern", record.applicationUrlPattern],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-dim">{label}</dt>
                  <dd className="mt-0.5 break-all text-slate-muted">{value ?? "—"}</dd>
                </div>
              ))}
            </dl>
          </IntelPanel>

          <IntelPanel title="Sitemaps">
            {record.sitemapUrls.length > 0 ? (
              <ul className="space-y-1 text-xs text-slate-muted">
                {record.sitemapUrls.map((url) => (
                  <li key={url} className="break-all">
                    {url}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-dim">No sitemaps found</p>
            )}
          </IntelPanel>

          {record.issues.length > 0 && (
            <IntelPanel title="Issues" className="xl:col-span-2">
              <ul className="space-y-2">
                {record.issues.map((issue) => (
                  <li
                    key={issue}
                    className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-300"
                  >
                    {issue}
                  </li>
                ))}
              </ul>
            </IntelPanel>
          )}

          {config && Object.keys(config).length > 0 && (
            <IntelPanel title="Platform Config" className="xl:col-span-2">
              <pre className="overflow-x-auto rounded-lg bg-black/30 p-4 text-xs text-slate-muted">
                {JSON.stringify(config, null, 2)}
              </pre>
            </IntelPanel>
          )}
        </div>
      </IntelligenceShell>
      <IntelligenceMobileNav />
    </>
  );
}
