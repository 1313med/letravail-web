import type { PageQualityStats } from "@/lib/seo-engine/types";
import { DataTable, Panel, SubSection } from "./ui";

const TYPE_LABELS: Record<string, string> = {
  city: "Pages ville",
  landing: "Pages métier / secteur",
  salary: "Pages salaire",
  company: "Pages entreprise",
  job: "Pages offre",
};

export function PageQualityPanel({ stats }: { stats: PageQualityStats }) {
  return (
    <Panel
      title="Qualité des pages par type"
      subtitle="Vue d'ensemble : combien de pages sont visibles Google et leur score de qualité moyen"
      accent="purple"
      help="La barre de progression montre la qualité moyenne (0–100). Vert = bon, orange = moyen, rouge = faible. Un type avec beaucoup de « noindex » manque souvent d'offres."
      whatToDo={[
        "Identifiez le type avec le score le plus bas → concentrez vos efforts là.",
        "Si beaucoup de noindex sur un type → ajoutez des offres ou du contenu.",
        "Comparez avec l'onglet Croissance pour les actions automatiques.",
      ]}
    >
      <SubSection title="Répartition par type de page">
        <DataTable
          headers={[
            "Type de page",
            "Total",
            "Visible Google",
            "Cachées",
            "Qualité moyenne",
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
                  <div
                    className="h-2.5 w-28 overflow-hidden rounded-full bg-navy/10"
                    title={`Score : ${row.avgQualityScore}/100`}
                  >
                    <div
                      className={`h-full rounded-full transition-all ${
                        row.avgQualityScore >= 70
                          ? "bg-emerald-500"
                          : row.avgQualityScore >= 40
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, row.avgQualityScore)}%` }}
                    />
                  </div>
                  <span className="tabular-nums text-sm font-semibold">
                    {row.avgQualityScore}/100
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </SubSection>
    </Panel>
  );
}
