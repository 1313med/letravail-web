import type { SeoRiskReport } from "@/lib/seo-engine/types";
import { Badge, DataTable, Panel, StatCard } from "./ui";

export function RiskPanel({ report }: { report: SeoRiskReport }) {
  const worst = report.items.slice(0, 25);

  return (
    <Panel
      title="SEO Risk Engine"
      subtitle="Score de risque par page — détection proactive avant Google"
      accent="red"
    >
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="SAFE" value={report.summary.safe} tone="good" />
        <StatCard label="WARNING" value={report.summary.warning} tone="warn" />
        <StatCard label="DANGEROUS" value={report.summary.dangerous} tone="bad" />
        <StatCard
          label="Score moyen"
          value={report.summary.avgRiskScore}
          hint="0 = risque max"
        />
      </div>

      <DataTable
        headers={[
          "Page",
          "Type",
          "Score",
          "Label",
          "Thin",
          "Schema",
          "Salaire",
          "Orpheline",
        ]}
      >
        {worst.map((item) => (
          <tr key={item.url} className="hover:bg-navy/[0.02]">
            <td className="max-w-[200px] truncate px-3 py-2">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-mint-dim hover:underline"
              >
                {item.label}
              </a>
            </td>
            <td className="px-3 py-2 text-xs">{item.pageType}</td>
            <td className="px-3 py-2 tabular-nums font-semibold">
              {item.riskScore}
            </td>
            <td className="px-3 py-2">
              <Badge
                tone={
                  item.label_ === "SAFE"
                    ? "good"
                    : item.label_ === "WARNING"
                      ? "warn"
                      : "bad"
                }
              >
                {item.label_}
              </Badge>
            </td>
            <td className="px-3 py-2 text-center">
              {item.signals.thinContent ? "⚠" : "—"}
            </td>
            <td className="px-3 py-2 text-center">
              {item.signals.missingSchema ? "⚠" : "—"}
            </td>
            <td className="px-3 py-2 text-center">
              {item.signals.missingSalary ? "⚠" : "—"}
            </td>
            <td className="px-3 py-2 text-center">
              {item.signals.orphanPage ? "⚠" : "—"}
            </td>
          </tr>
        ))}
      </DataTable>
    </Panel>
  );
}
