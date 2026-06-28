import type { Metadata } from "next";
import Link from "next/link";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { AtsIntelligenceClient } from "@/components/intelligence/AtsIntelligenceClient";
import { IntelPanel } from "@/components/intelligence/ui";
import { MiniStat } from "@/components/intelligence/KpiCard";
import { getAtsIntelligence, getAtsSummary } from "@/lib/intelligence";
import { formatScore } from "@/lib/intelligence/formatters";

export const metadata: Metadata = {
  title: "ATS Intelligence — Employment Intelligence",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: { q?: string; platform?: string; page?: string };
};

export default async function AtsIntelligencePage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const [data, summary] = await Promise.all([
    getAtsIntelligence({
      search: searchParams.q,
      platform: searchParams.platform,
      page,
    }),
    getAtsSummary(),
  ]);

  const totalPages = Math.ceil(data.total / data.pageSize);

  return (
    <>
      <IntelligenceShell
        title="ATS Intelligence"
        subtitle="Click any employer to open the operational drawer — endpoints, history, and activation details."
      >
        <div className="space-y-6 pb-20 lg:pb-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MiniStat label="Total Probed" value={summary.total} />
            <MiniStat label="Active" value={summary.activeCount} tone="good" />
            <MiniStat label="Avg Health" value={formatScore(summary.avgHealth)} />
            <MiniStat label="Avg Validation" value={formatScore(summary.avgValidation)} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/intelligence/ats"
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                !searchParams.platform
                  ? "bg-navy text-white shadow-sm"
                  : "bg-navy/5 text-slate-dim hover:text-navy"
              }`}
            >
              All platforms
            </Link>
            {data.platforms.map((p) => (
              <Link
                key={p.platform}
                href={`/admin/intelligence/ats?platform=${encodeURIComponent(p.platform)}`}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  searchParams.platform === p.platform
                    ? "bg-navy text-white shadow-sm"
                    : "bg-navy/5 text-slate-dim hover:text-navy"
                }`}
              >
                {p.platform} ({p.count})
              </Link>
            ))}
          </div>

          <IntelPanel title={`${data.total} ATS records`} subtitle="Click a row to open employer drawer">
            <AtsIntelligenceClient
              items={data.items}
              page={page}
              totalPages={totalPages}
              platformParam={searchParams.platform}
            />
          </IntelPanel>
        </div>
      </IntelligenceShell>
      <IntelligenceMobileNav />
    </>
  );
}
