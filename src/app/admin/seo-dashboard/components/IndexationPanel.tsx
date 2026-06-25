"use client";

import { useMemo, useState } from "react";
import type { IndexationReport } from "@/lib/seo-engine/types";
import { Badge, DataTable, Panel, StatCard } from "./ui";

type Filter = "all" | "thin" | "high-risk" | "noindex";

const PAGE_TYPE_LABELS: Record<string, string> = {
  city: "Ville",
  landing: "Landing",
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

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Toutes" },
    { id: "thin", label: "Pages fines" },
    { id: "high-risk", label: "Haut risque" },
    { id: "noindex", label: "Noindex" },
  ];

  return (
    <Panel
      title="Indexation Control"
      subtitle="Statut d'indexation par page — villes, landings, salaires, entreprises, offres (échantillon)"
      accent="green"
    >
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total pages" value={report.summary.total} />
        <StatCard label="Indexées" value={report.summary.indexed} tone="good" />
        <StatCard label="Noindex" value={report.summary.noindexed} tone="warn" />
        <StatCard label="Haut risque" value={report.summary.highRisk} tone="bad" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
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

      <DataTable
        headers={[
          "Type",
          "Page",
          "URL",
          "Index",
          "Offres",
          "Salaire",
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
              <Badge tone={row.indexStatus === "index" ? "good" : "warn"}>
                {row.indexStatus}
              </Badge>
            </td>
            <td className="px-3 py-2 tabular-nums">{row.jobCount}</td>
            <td className="px-3 py-2">
              {row.hasSalaryData ? (
                <span className="text-emerald-600">✓</span>
              ) : (
                <span className="text-red-500">✗</span>
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
                {row.riskLevel}
              </Badge>
            </td>
          </tr>
        ))}
      </DataTable>
      {filtered.length === 0 && (
        <p className="py-6 text-center text-sm text-slate-dim">
          Aucune page pour ce filtre.
        </p>
      )}
      {report.rows.length > 100 && filter === "all" && (
        <p className="mt-3 text-xs text-slate-dim">
          Affichage limité aux 100 premières lignes. Utilisez les filtres pour cibler les pages à risque.
        </p>
      )}
    </Panel>
  );
}
