import type { GoogleJobsHealth } from "@/lib/seo-engine/types";
import { Badge, DataTable, Panel, StatCard } from "./ui";

export function GoogleJobsPanel({ health }: { health: GoogleJobsHealth }) {
  return (
    <Panel
      title="Google Jobs Health"
      subtitle={`${health.totalJobPages} offres actives analysées en temps réel`}
      accent="blue"
    >
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="JobPosting pages"
          value={health.totalJobPages}
        />
        <StatCard
          label="Schema valide"
          value={`${health.validSchemaPct}%`}
          tone={health.validSchemaPct >= 90 ? "good" : "warn"}
        />
        <StatCard
          label="Sans baseSalary"
          value={`${health.missingBaseSalaryPct}%`}
          tone={health.missingBaseSalaryPct > 50 ? "warn" : "neutral"}
        />
        <StatCard
          label="estimatedSalary"
          value={`${health.estimatedSalaryPct}%`}
          tone="warn"
        />
        <StatCard
          label="Expirées en DB"
          value={health.expiredStillIndexed}
          hint="noindex automatique"
          tone={health.expiredStillIndexed > 0 ? "warn" : "good"}
        />
      </div>

      <DataTable headers={["Catégorie", "Sévérité", "Count", "%"]}>
        {health.errorsByCategory.map((row) => (
          <tr key={row.category} className="hover:bg-navy/[0.02]">
            <td className="px-3 py-2 font-medium">{row.category}</td>
            <td className="px-3 py-2">
              <Badge
                tone={
                  row.severity === "critical"
                    ? "bad"
                    : row.severity === "warning"
                      ? "warn"
                      : "good"
                }
              >
                {row.severity}
              </Badge>
            </td>
            <td className="px-3 py-2 tabular-nums">{row.count}</td>
            <td className="px-3 py-2 tabular-nums">{row.pct}%</td>
          </tr>
        ))}
      </DataTable>
    </Panel>
  );
}
