import type { Metadata } from "next";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { SourcesTable } from "@/components/source/SourcesTable";
import { getSources, getSourceStatuses } from "@/lib/intelligence";

export const metadata: Metadata = {
  title: "Sources — Employment Intelligence",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: {
    q?: string;
    status?: string;
    filter?: string;
    sort?: string;
    order?: "asc" | "desc";
    page?: string;
  };
};

export default async function SourcesPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const quickFilter = searchParams.filter as
    | "active"
    | "ready"
    | "retry"
    | "validation"
    | "lowHealth"
    | "failed"
    | undefined;

  const [data, statuses] = await Promise.all([
    getSources({
      search: searchParams.q,
      status: searchParams.status,
      quickFilter,
      sort: searchParams.sort,
      order: searchParams.order,
      page,
    }),
    getSourceStatuses(),
  ]);

  return (
    <>
      <IntelligenceShell
        title="Sources"
        subtitle="Monitor crawl sources — use quick filters to find what needs operator attention."
      >
        <SourcesTable
          data={data}
          statuses={statuses}
          initialSearch={searchParams.q ?? ""}
          initialStatus={searchParams.status ?? ""}
          initialFilter={searchParams.filter ?? ""}
          initialSort={searchParams.sort ?? "priorityScore"}
          initialOrder={searchParams.order ?? "desc"}
        />
      </IntelligenceShell>
      <IntelligenceMobileNav />
    </>
  );
}
