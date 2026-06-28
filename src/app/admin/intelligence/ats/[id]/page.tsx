import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { IntelActivationBadge, IntelBackLink, IntelBadge, IntelPanel } from "@/components/intelligence/ui";
import { getAtsById } from "@/lib/intelligence";
import { formatDateTime, formatPercent, formatRelativeTime, formatScore } from "@/lib/intelligence/formatters";

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
        actions={<IntelBackLink href="/admin/intelligence/ats" label="← Back to ATS" />}
      >
        <div className="grid gap-6 pb-20 lg:pb-6 xl:grid-cols-2">
          <IntelPanel title="Activation & Health" accent="green">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-dim">Activation State</dt>
                <dd className="mt-1">
                  <IntelActivationBadge state={record.activationState} />
                </dd>
              </div>
              {[
                ["Health Score", formatScore(record.healthScore)],
                ["Validation Score", formatScore(record.validationScore)],
                ["Retry Count", record.retryCount.toString()],
                ["Next Retry", formatRelativeTime(record.nextRetryAt?.toISOString() ?? null)],
                ["Last Validation", formatRelativeTime(record.lastValidationAt?.toISOString() ?? null)],
                ["Last Health Check", formatRelativeTime(record.lastHealthCheck?.toISOString() ?? null)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-dim">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-navy">{value}</dd>
                </div>
              ))}
              <div>
                <dt className="text-xs text-slate-dim">Automatic Activation</dt>
                <dd className="mt-1">
                  <IntelBadge tone={record.automaticActivation ? "good" : "neutral"}>
                    {record.automaticActivation ? "Enabled" : "Manual"}
                  </IntelBadge>
                </dd>
              </div>
              {record.activationReason && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-dim">Activation Reason</dt>
                  <dd className="mt-1 text-sm text-navy">{record.activationReason}</dd>
                </div>
              )}
              {record.deactivationReason && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-dim">Deactivation Reason</dt>
                  <dd className="mt-1 text-sm text-red-800">{record.deactivationReason}</dd>
                </div>
              )}
            </dl>
          </IntelPanel>

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
                  <dd className="mt-1 text-sm font-medium text-navy">{value}</dd>
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
                <p className="text-navy">{record.paginationType ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-dim">Detail Endpoint</p>
                <p className="break-all font-mono text-xs text-slate-dim">
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
                    className="rounded-lg border border-navy/8 bg-[#FAFBFC] px-4 py-2 font-mono text-xs text-mint-dim break-all"
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
                  <dd className="mt-0.5 break-all text-slate-dim">{value ?? "—"}</dd>
                </div>
              ))}
            </dl>
          </IntelPanel>

          <IntelPanel title="Sitemaps">
            {record.sitemapUrls.length > 0 ? (
              <ul className="space-y-1 text-xs text-slate-dim">
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
                    className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
                  >
                    {issue}
                  </li>
                ))}
              </ul>
            </IntelPanel>
          )}

          {config && Object.keys(config).length > 0 && (
            <IntelPanel title="Platform Config" className="xl:col-span-2">
              <pre className="overflow-x-auto rounded-lg border border-navy/8 bg-[#FAFBFC] p-4 text-xs text-slate-dim">
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
