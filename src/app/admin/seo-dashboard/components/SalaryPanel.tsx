import type { SalaryCoverageMatrix } from "@/lib/seo-engine/types";
import { INDEX_STATUS } from "./dashboard-guide";
import { Badge, DataTable, Panel, StatCard, SubSection } from "./ui";

export function SalaryPanel({ matrix }: { matrix: SalaryCoverageMatrix }) {
  return (
    <Panel
      title="Intelligence salariale"
      subtitle={`${matrix.totalObservations} observations salariales calculées depuis vos offres réelles`}
      accent="yellow"
      help="Les pages salaire ne s'indexent que s'il y a assez d'observations (≥5). Plus vous avez d'offres avec salaires, plus vos pages salaire sont visibles sur Google."
      whatToDo={[
        "Priorisez les rôles « Prêt » (READY) — ils peuvent déjà ranker.",
        "Les rôles non indexables manquent d'observations → importez plus d'offres avec salaires.",
        "Croisez avec l'onglet Croissance → Intelligence marché pour les métiers en demande.",
      ]}
    >
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Pages salaire actives"
          value={matrix.indexableCount}
          hint="Assez de données"
          tone="good"
        />
        <StatCard
          label="En attente de données"
          value={matrix.nonIndexableCount}
          hint="Pas assez d'observations"
          tone="warn"
        />
        <StatCard label="Villes couvertes" value={matrix.byCity.length} />
        <StatCard label="Total observations" value={matrix.totalObservations} />
      </div>

      <SubSection title="Couverture par métier" hint="↑ = hausse des observations, ↓ = baisse.">
        <DataTable
          headers={[
            "Métier",
            "Observations",
            "Google",
            "État",
            "Tendance",
          ]}
        >
          {matrix.byRole.map((role) => (
            <tr key={role.roleSlug} className="hover:bg-navy/[0.02]">
              <td className="px-3 py-2 font-medium">{role.roleTitle}</td>
              <td className="px-3 py-2 tabular-nums">{role.observationCount}</td>
              <td className="px-3 py-2">
                <Badge tone={role.indexStatus === "index" ? "good" : "warn"}>
                  {INDEX_STATUS[role.indexStatus as keyof typeof INDEX_STATUS]?.label ??
                    role.indexStatus}
                </Badge>
              </td>
              <td className="px-3 py-2">
                <Badge tone={role.readiness.startsWith("READY") ? "good" : "warn"}>
                  {role.readiness.startsWith("READY") ? "Prêt" : "Incomplet"}
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
                  {role.trend === "up" ? "↑ Hausse" : role.trend === "down" ? "↓ Baisse" : "— Stable"}
                  {role.trendDelta !== 0 && (
                    <span className="ml-1 text-xs">
                      ({role.trendDelta > 0 ? "+" : ""}
                      {role.trendDelta})
                    </span>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </DataTable>
      </SubSection>

      {matrix.byCity.length > 0 && (
        <SubSection title="Couverture par ville (top 15)">
          <DataTable headers={["Ville", "Observations", "Métiers couverts"]}>
            {matrix.byCity.slice(0, 15).map((city) => (
              <tr key={city.citySlug} className="hover:bg-navy/[0.02]">
                <td className="px-3 py-2 font-medium">{city.citySlug}</td>
                <td className="px-3 py-2 tabular-nums">{city.observationCount}</td>
                <td className="px-3 py-2 tabular-nums">{city.roleCount}</td>
              </tr>
            ))}
          </DataTable>
        </SubSection>
      )}
    </Panel>
  );
}
