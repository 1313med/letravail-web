import { CrawlActivityFeed } from "@/components/coverage/CrawlActivityFeed";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { MiniStat } from "@/components/intelligence/KpiCard";
import { getCrawlActivity } from "@/lib/intelligence";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crawl Activity — Employment Intelligence",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: { source?: string; status?: string; page?: string };
};

export default async function CrawlActivityPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const data = await getCrawlActivity({
    source: searchParams.source,
    status: searchParams.status,
    page,
  });

  return (
    <>
      <IntelligenceShell
        title="Crawl Activity"
        subtitle="Every crawl run from scrape_logs — duration, jobs found, inserted, updated, and errors."
      >
        <div className="space-y-6 pb-20 lg:pb-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MiniStat label="Crawls (24h)" value={data.last24h.crawls} />
            <MiniStat label="Jobs Inserted (24h)" value={data.last24h.jobsInserted} />
            <MiniStat label="Jobs Updated (24h)" value={data.last24h.jobsUpdated} />
            <MiniStat label="Duplicates (24h)" value={data.last24h.duplicates} />
          </div>

          <CrawlActivityFeed
            initialData={data}
            initialSource={searchParams.source ?? ""}
            initialStatus={searchParams.status ?? ""}
          />
        </div>
      </IntelligenceShell>
      <IntelligenceMobileNav />
    </>
  );
}
