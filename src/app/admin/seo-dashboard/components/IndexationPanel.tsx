"use client";

import { useMemo, useState } from "react";
import type { IndexationReport } from "@/lib/seo-engine/types";
import { GLOSSARY, INDEX_STATUS } from "./dashboard-guide";
import { Badge, DataTable, Panel, StatCard, SubSection } from "./ui";

type Filter = "all" | "thin" | "high-risk" | "noindex";

const PAGE_TYPE_LABELS: Record<string, string> = {
  city: "Ville",
  landing: "Métier / secteur",
  salary: "Salaire",
  company: "Entreprise",
  job: "Offre",
};

export function IndexationPanel({ report }: { report: IndexationReport }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    let rows = report.rows;
    if (filter === "thin") rows = rows.filter((r) => r.isThin);
    if (filter === "high-risk") rows = rows.filter((r) => r.riskLevel === "high");
    if (filter === "noindex") rows = rows.filter((r) => r.indexStatus === "noindex");
    return rows.slice(0, 100);
  }, [report.rows, filter]);

  const filters: { id: Filter; label: string; hint: string }[] = [
    { id: "all", label: "Toutes", hint: "Vue complète" },
    { id: "thin", label: "Pages pauvres", hint: GLOSSARY.thinPage },
    { id: "high-risk", label: "À risque", hint: "Problèmes SEO détectés" },
    { id: "noindex", label: "Cachées Google", hint: "Volontairement non indexées" },
  ];

  return (
    <Panel
      title="Contrôle d'indexation"
      subtitle="Quelles pages Google peut afficher dans ses résultats de recherche"
      accent="green"
      help={GLOSSARY.indexation}
      whatToDo={[
        "Vérifiez que le nombre « Visible Google » augmente avec vos nouvelles pages.",
        "Filtrez « Pages pauvres » : enrichissez le contenu ou ajoutez des offres.",
        "Les pages « Cachées » sont normales si elles n'ont pas assez d'offres (seuils automatiques).",
      ]}
    >
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Pages analysées" value={report.summary.total} />
        <StatCard
          label="Visible Google"
          value={report.summary.indexed}
          hint="Peuvent apparaître dans les résultats"
          tone="good"
        />
        <StatCard
          label="Cachées (noindex)"
          value={report.summary.noindexed}
          hint="Souvent : pas assez d'offres"
          tone="warn"
        />
        <StatCard
          label="Haut risque"
          value={report.summary.highRisk}
          hint="À corriger en priorité"
          tone="bad"
        />
      </div>

      <SubSection title="Filtrer les pages" hint="Cliquez un filtre pour cibler un type de problème.">
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              title={f.hint}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filter === f.id
                  ? "bg-navy text-white"
                  : "bg-navy/5 text-navy hover:bg-navy/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </SubSection>

      <DataTable
        headers={[
          "Type",
          "Page",
          "Lien",
          "Google",
          "Offres",
          "Données salaire",
          "Qualité",
          "Risque",
        ]}
      >
        {filtered.map((row) => (
          <tr key={row.url} className="hover:bg-navy/[0.02]">
            <td className="px-3 py-2">
              <Badge>{PAGE_TYPE_LABELS[row.pageType] ?? row.pageType}</Badge>
            </td>
            <td className="max-w-[180px] truncate px-3 py-2 font-medium">
              {row.label}
            </td>
            <td className="max-w-[200px] truncate px-3 py-2 text-xs text-slate-dim">
              <a
                href={row.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-mint-dim hover:underline"
              >
                {row.url.replace(/^https?:\/\/[^/]+/, "")}
              </a>
            </td>
            <td className="px-3 py-2">
              <Badge
                tone={
                  INDEX_STATUS[row.indexStatus as keyof typeof INDEX_STATUS]?.tone ??
                  "neutral"
                }
              >
                {INDEX_STATUS[row.indexStatus as keyof typeof INDEX_STATUS]?.label ??
                  row.indexStatus}
              </Badge>
            </td>
            <td className="px-3 py-2 tabular-nums">{row.jobCount}</td>
            <td className="px-3 py-2">
              {row.hasSalaryData ? (
                <span className="text-emerald-600" title="Données salaire présentes">
                  Oui
                </span>
              ) : (
                <span className="text-red-500" title="Salaire manquant">
                  Non
                </span>
              )}
            </td>
            <td className="px-3 py-2 tabular-nums font-medium">{row.qualityScore}</td>
            <td className="px-3 py-2">
              <Badge
                tone={
                  row.riskLevel === "low"
                    ? "good"
                    : row.riskLevel === "medium"
                      ? "warn"
                      : "bad"
                }
              >
                {row.riskLevel === "low"
                  ? "Faible"
                  : row.riskLevel === "medium"
                    ? "Moyen"
                    : "Élevé"}
              </Badge>
            </td>
          </tr>
        ))}
      </DataTable>
      {filtered.length === 0 && (
        <p className="py-6 text-center text-sm text-slate-dim">
          Aucune page pour ce filtre — essayez « Toutes ».
        </p>
      )}
      {report.rows.length > 100 && filter === "all" && (
        <p className="mt-3 text-xs text-slate-dim">
          Affichage limité aux 100 premières lignes. Utilisez les filtres pour cibler les
          pages problématiques.
        </p>
      )}
    </Panel>
  );
}
