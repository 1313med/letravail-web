import type { SeoRiskReport } from "@/lib/seo-engine/types";
import { GLOSSARY, RISK_LABELS } from "./dashboard-guide";
import { Badge, DataTable, Panel, StatCard, SubSection } from "./ui";

export function RiskPanel({ report }: { report: SeoRiskReport }) {
  const worst = report.items.slice(0, 25);

  return (
    <Panel
      title="Détection des risques SEO"
      subtitle="Pages qui pourraient perdre en visibilité Google si rien n'est fait"
      accent="red"
      help="Chaque page reçoit un score de risque. Plus le score est bas, plus c'est urgent. Les symboles ⚠ indiquent le type de problème."
      whatToDo={[
        "Commencez par les pages « Critique » (rouge) en haut du tableau.",
        "Contenu faible (⚠) → ajoutez des offres ou du texte.",
        "Schema manquant (⚠) → lancez « Vérifier Google for Jobs » dans Actions de maintenance.",
        "Page orpheline (⚠) → lancez « Améliorer les liens internes » dans l'onglet Croissance.",
      ]}
    >
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Saines"
          value={report.summary.safe}
          hint={RISK_LABELS.SAFE.hint}
          tone="good"
        />
        <StatCard
          label="Attention"
          value={report.summary.warning}
          hint={RISK_LABELS.WARNING.hint}
          tone="warn"
        />
        <StatCard
          label="Critiques"
          value={report.summary.dangerous}
          hint={RISK_LABELS.DANGEROUS.hint}
          tone="bad"
        />
        <StatCard
          label="Score moyen"
          value={report.summary.avgRiskScore}
          hint="0 = danger max, 100 = aucun risque"
        />
      </div>

      <SubSection
        title="Pages les plus à risque"
        hint="Cliquez sur le nom pour ouvrir la page dans un nouvel onglet et vérifier visuellement."
      >
        <DataTable
          headers={[
            "Page",
            "Type",
            "Score",
            "Niveau",
            "Contenu faible",
            "Schema",
            "Salaire",
            "Isolée",
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
              <td className="px-3 py-2 tabular-nums font-semibold">{item.riskScore}</td>
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
                  {RISK_LABELS[item.label_ as keyof typeof RISK_LABELS]?.label ??
                    item.label_}
                </Badge>
              </td>
              <td className="px-3 py-2 text-center text-xs">
                {item.signals.thinContent ? (
                  <span title="Peu de contenu ou d'offres">⚠ Oui</span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-3 py-2 text-center text-xs">
                {item.signals.missingSchema ? (
                  <span title="Données structurées manquantes">⚠ Oui</span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-3 py-2 text-center text-xs">
                {item.signals.missingSalary ? (
                  <span title="Pas de donnée salariale">⚠ Oui</span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-3 py-2 text-center text-xs">
                {item.signals.orphanPage ? (
                  <span title={GLOSSARY.internalLinks}>⚠ Oui</span>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      </SubSection>
    </Panel>
  );
}
