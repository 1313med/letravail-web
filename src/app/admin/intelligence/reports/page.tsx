import type { Metadata } from "next";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { ReportsClient } from "@/components/intelligence/ReportsClient";
import { getIntelligenceReports } from "@/lib/intelligence";
import type { TimeRange } from "@/lib/intelligence/types";

export const metadata: Metadata = {
  title: "Reports — Employment Intelligence",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { searchParams: { range?: TimeRange } };

export default async function ReportsPage({ searchParams }: Props) {
  const range = (searchParams.range ?? "month") as TimeRange;
  const data = await getIntelligenceReports(range);

  return (
    <>
      <IntelligenceShell
        title="Reports"
        subtitle="Interactive intelligence reports with period filtering — all metrics from PostgreSQL."
      >
        <ReportsClient data={data} currentRange={range} />
      </IntelligenceShell>
      <IntelligenceMobileNav />
    </>
  );
}
