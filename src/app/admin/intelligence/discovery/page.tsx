import type { Metadata } from "next";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { DiscoveryProbeForm } from "@/components/ats/DiscoveryProbeForm";
import { IntelPanel } from "@/components/intelligence/ui";
import { getRecentProbes } from "@/lib/intelligence";
import { formatDateTime, formatPercent } from "@/lib/intelligence/formatters";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Employer Discovery — Employment Intelligence",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DiscoveryPage() {
  const recentProbes = await getRecentProbes(15);

  return (
    <>
      <IntelligenceShell
        title="Employer Discovery"
        subtitle="Probe employer URLs against employer_ats_intelligence — ATS detection, endpoints, and recommended strategy."
      >
        <div className="space-y-6 pb-20 lg:pb-6">
          <DiscoveryProbeForm />

          <IntelPanel title="Recent Probes">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-xs uppercase text-slate-dim">
                    {["Company", "ATS", "Confidence", "Strategy", "Status", "Probed"].map((h) => (
                      <th key={h} className="px-3 py-2 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentProbes.map((probe) => (
                    <tr key={probe.id} className="hover:bg-white/[0.02]">
                      <td className="px-3 py-3">
                        <Link
                          href={`/admin/intelligence/ats/${probe.id}`}
                          className="font-medium text-white hover:text-mint"
                        >
                          {probe.companyName}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-slate-muted">{probe.atsPlatform}</td>
                      <td className="px-3 py-3 tabular-nums text-white">
                        {formatPercent(probe.confidence * 100)}
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-muted">{probe.crawlStrategy}</td>
                      <td className="px-3 py-3 text-xs text-slate-muted">{probe.onboardingStatus}</td>
                      <td className="px-3 py-3 text-slate-muted">{formatDateTime(probe.probedAt)}</td>
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
