import type { PageQualityStats } from "@/lib/seo-engine/types";
import { DataTable, Panel } from "./ui";

const TYPE_LABELS: Record<string, string> = {
  city: "Pages ville",
  landing: "Landing pages",
  salary: "Pages salaire",
  company: "Pages entreprise",
  job: "Pages offre",
};

export function PageQualityPanel({ stats }: { stats: PageQualityStats }) {
  return (
    <Panel
      title="Page Quality Monitor"
      subtitle="Qualité moyenne et répartition index / noindex par type"
      accent="purple"
    >
      <DataTable
        headers={[
          "Type",
          "Total",
          "Indexées",
          "Noindex",
          "Score qualité moy.",
        ]}
      >
        {stats.breakdown.map((row) => (
          <tr key={row.pageType} className="hover:bg-navy/[0.02]">
            <td className="px-3 py-2 font-medium">
              {TYPE_LABELS[row.pageType] ?? row.pageType}
            </td>
            <td className="px-3 py-2 tabular-nums">{row.totalPages}</td>
            <td className="px-3 py-2 tabular-nums text-emerald-600">
              {row.indexedPages}
            </td>
            <td className="px-3 py-2 tabular-nums text-amber-600">
              {row.noindexedPages}
            </td>
            <td className="px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-navy/10">
                  <div
                    className={`h-full rounded-full ${
                      row.avgQualityScore >= 70
                        ? "bg-emerald-500"
                        : row.avgQualityScore >= 40
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${row.avgQualityScore}%` }}
                  />
                </div>
                <span className="tabular-nums text-sm font-medium">
                  {row.avgQualityScore}
                </span>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </Panel>
  );
}
