import type { SalaryCoverageMatrix } from "@/lib/seo-engine/types";
import { Badge, DataTable, Panel, StatCard } from "./ui";

export function SalaryPanel({ matrix }: { matrix: SalaryCoverageMatrix }) {
  return (
    <Panel
      title="Salary Intelligence"
      subtitle={`${matrix.totalObservations} observations salariales en base`}
      accent="yellow"
    >
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Rôles indexables" value={matrix.indexableCount} tone="good" />
        <StatCard
          label="Non indexables"
          value={matrix.nonIndexableCount}
          tone="warn"
        />
        <StatCard label="Villes couvertes" value={matrix.byCity.length} />
        <StatCard label="Observations" value={matrix.totalObservations} />
      </div>

      <h3 className="mb-2 text-sm font-semibold text-navy">Par rôle</h3>
      <DataTable
        headers={[
          "Rôle",
          "Observations",
          "Statut",
          "Readiness",
          "Tendance",
        ]}
      >
        {matrix.byRole.map((role) => (
          <tr key={role.roleSlug} className="hover:bg-navy/[0.02]">
            <td className="px-3 py-2 font-medium">{role.roleTitle}</td>
            <td className="px-3 py-2 tabular-nums">{role.observationCount}</td>
            <td className="px-3 py-2">
              <Badge tone={role.indexStatus === "index" ? "good" : "warn"}>
                {role.indexStatus}
              </Badge>
            </td>
            <td className="px-3 py-2">
              <Badge tone={role.readiness.startsWith("READY") ? "good" : "warn"}>
                {role.readiness}
              </Badge>
            </td>
            <td className="px-3 py-2">
              <span
                className={
                  role.trend === "up"
                    ? "text-emerald-600"
                    : role.trend === "down"
                      ? "text-red-600"
                      : "text-slate-dim"
                }
              >
                {role.trend === "up" ? "↑" : role.trend === "down" ? "↓" : "—"}{" "}
                {role.trendDelta !== 0 && (
                  <span className="text-xs">({role.trendDelta > 0 ? "+" : ""}
                  {role.trendDelta})</span>
                )}
              </span>
            </td>
          </tr>
        ))}
      </DataTable>

      {matrix.byCity.length > 0 && (
        <>
          <h3 className="mb-2 mt-6 text-sm font-semibold text-navy">
            Par ville (top 15)
          </h3>
          <DataTable headers={["Ville", "Observations", "Rôles"]}>
            {matrix.byCity.slice(0, 15).map((city) => (
              <tr key={city.citySlug} className="hover:bg-navy/[0.02]">
                <td className="px-3 py-2 font-medium">{city.citySlug}</td>
                <td className="px-3 py-2 tabular-nums">
                  {city.observationCount}
                </td>
                <td className="px-3 py-2 tabular-nums">{city.roleCount}</td>
              </tr>
            ))}
          </DataTable>
        </>
      )}
    </Panel>
  );
}
