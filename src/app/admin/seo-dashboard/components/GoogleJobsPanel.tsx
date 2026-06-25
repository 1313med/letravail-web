import type { GoogleJobsHealth } from "@/lib/seo-engine/types";
import { GLOSSARY } from "./dashboard-guide";
import { Badge, DataTable, Panel, StatCard, SubSection } from "./ui";

export function GoogleJobsPanel({ health }: { health: GoogleJobsHealth }) {
  return (
    <Panel
      title="Santé Google for Jobs"
      subtitle={`${health.totalJobPages} offres actives analysées — format requis pour apparaître dans l'encart emploi Google`}
      accent="blue"
      help={GLOSSARY.schema}
      whatToDo={[
        "Visez « Schema valide » au-dessus de 90 %.",
        "Si beaucoup d'offres n'ont pas de salaire → enrichissez les imports ou lancez « Enrichir les données Google Jobs » (onglet Croissance).",
        "Les offres expirées doivent être à 0 — sinon elles polluent l'index.",
      ]}
    >
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Offres analysées" value={health.totalJobPages} />
        <StatCard
          label="Format correct"
          value={`${health.validSchemaPct}%`}
          hint="Objectif : > 90 %"
          tone={health.validSchemaPct >= 90 ? "good" : "warn"}
        />
        <StatCard
          label="Sans salaire de base"
          value={`${health.missingBaseSalaryPct}%`}
          hint="baseSalary manquant"
          tone={health.missingBaseSalaryPct > 50 ? "warn" : "neutral"}
        />
        <StatCard
          label="Salaire estimé"
          value={`${health.estimatedSalaryPct}%`}
          hint="Moins précis pour Google"
          tone="warn"
        />
        <StatCard
          label="Expirées encore visibles"
          value={health.expiredStillIndexed}
          hint="Devrait être 0"
          tone={health.expiredStillIndexed > 0 ? "warn" : "good"}
        />
      </div>

      <SubSection title="Détail des problèmes par catégorie">
        <DataTable headers={["Problème", "Gravité", "Nombre", "% des offres"]}>
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
                  {row.severity === "critical"
                    ? "Critique"
                    : row.severity === "warning"
                      ? "Attention"
                      : "Mineur"}
                </Badge>
              </td>
              <td className="px-3 py-2 tabular-nums">{row.count}</td>
              <td className="px-3 py-2 tabular-nums">{row.pct}%</td>
            </tr>
          ))}
        </DataTable>
      </SubSection>
    </Panel>
  );
}
