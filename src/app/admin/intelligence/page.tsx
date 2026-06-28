import type { Metadata } from "next";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { ExecutiveOverviewClient } from "@/components/intelligence/ExecutiveOverviewClient";
import { LiveIndicator } from "@/components/intelligence/ui";
import {
  getExecutiveAnalytics,
  getOverviewBundle,
  getRealtimeSnapshot,
} from "@/lib/intelligence";
import { formatDateTime } from "@/lib/intelligence/formatters";
import type { TimeRange } from "@/lib/intelligence/types";

export const metadata: Metadata = {
  title: "Employment Intelligence — Overview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { searchParams: { range?: TimeRange } };

export default async function IntelligenceOverviewPage({ searchParams }: Props) {
  const range = (searchParams.range ?? "month") as TimeRange;

  const [overview, analytics, realtime] = await Promise.all([
    getOverviewBundle(),
    getExecutiveAnalytics(range),
    getRealtimeSnapshot(),
  ]);

  return (
    <>
      <IntelligenceShell
        title="Executive Overview"
        subtitle="Morocco's employment intelligence control room — platform health, growth trends, and live operations."
        updatedAt={formatDateTime(analytics.generatedAt)}
        actions={<LiveIndicator />}
      >
        <ExecutiveOverviewClient
          initialAnalytics={analytics}
          kpis={overview.kpis}
          initialRealtime={realtime}
          currentRange={range}
          recentCrawls={overview.recentCrawls}
        />
      </IntelligenceShell>
      <IntelligenceMobileNav />
    </>
  );
}
