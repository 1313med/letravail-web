"use client";

import { useState, useTransition } from "react";
import {
  executeGrowthAction,
  type GrowthActionName,
} from "../growth-actions";
import type { GrowthEngineBundle } from "@/lib/seo-engine/types";
import { Badge, DataTable, Panel, StatCard } from "./ui";

const GROWTH_ACTIONS: {
  id: GrowthActionName;
  label: string;
  description: string;
}[] = [
  {
    id: "generate-cities",
    label: "Generate city pages",
    description: "Revalide les villes ≥5 offres (indexables uniquement)",
  },
  {
    id: "generate-professions",
    label: "Generate profession pages",
    description: "Active les landings secteur/métier ≥3 offres",
  },
  {
    id: "generate-salaries",
    label: "Generate salary pages",
    description: "Sync observations + revalide pages ≥5 obs.",
  },
  {
    id: "fix-links",
    label: "Fix internal links",
    description: "Enrichit le maillage offre → ville/entreprise/salaire",
  },
  {
    id: "rebuild-sitemap",
    label: "Rebuild sitemap",
    description: "Régénère sitemap.xml",
  },
  {
    id: "enrich-schema",
    label: "Enrich schema",
    description: "Revalide JobPosting avec salaires résolus",
  },
  {
    id: "fix-thin",
    label: "Fix thin pages",
    description: "Force noindex sur pages sous seuil",
  },
  {
    id: "sync-gsc",
    label: "Sync Search Console",
    description: "Importe impressions/clics/CTR depuis GSC API",
  },
  {
    id: "full-pipeline",
    label: "Run full pipeline",
    description: "Exécute toutes les actions growth en séquence",
  },
];

const TYPE_LABELS: Record<string, string> = {
  CITY_PAGE: "Ville",
  SALARY_PAGE: "Salaire",
  PROFESSION_PAGE: "Métier",
  LINKING: "Maillage",
  RANKING: "Ranking",
};

export function GrowthEngineTab({ data }: { data: GrowthEngineBundle }) {
  const [pending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<string | null>(null);

  function runAction(id: GrowthActionName) {
    startTransition(async () => {
      const result = await executeGrowthAction(id);
      setLastResult(result.message);
    });
  }

  const { opportunities, forecast, gsc, pageScores, recentActionLogs } = data;

  return (
    <div className="grid gap-6">
      <Panel
        title="Opportunity Board"
        subtitle={`${opportunities.summary.total} opportunités — gain estimé ${opportunities.summary.totalEstimatedGain} clics/mois`}
        accent="red"
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="HIGH" value={opportunities.summary.high} tone="bad" />
          <StatCard label="MEDIUM" value={opportunities.summary.medium} tone="warn" />
          <StatCard label="LOW" value={opportunities.summary.low} />
          <StatCard
            label="Quick wins"
            value={opportunities.quickWins.length}
            tone="good"
          />
        </div>

        <h3 className="mb-2 text-sm font-semibold text-navy">Quick wins</h3>
        <div className="mb-5 space-y-2">
          {opportunities.quickWins.map((opp, i) => (
            <div
              key={`qw-${i}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy/8 bg-[#FAFBFC] px-3 py-2 text-sm"
            >
              <div>
                <Badge tone={opp.priority === "HIGH" ? "bad" : "warn"}>
                  {TYPE_LABELS[opp.type] ?? opp.type}
                </Badge>
                <span className="ml-2 text-navy">{opp.reason}</span>
              </div>
              <span className="text-xs font-medium text-emerald-600">
                +{opp.estimatedTrafficGain} est.
              </span>
            </div>
          ))}
          {opportunities.quickWins.length === 0 && (
            <p className="text-sm text-slate-dim">Aucun quick win détecté.</p>
          )}
        </div>

        <DataTable
          headers={["Type", "Priorité", "Raison", "Gain est.", "Action"]}
        >
          {opportunities.opportunities.slice(0, 25).map((opp, i) => (
            <tr key={`opp-${i}`} className="hover:bg-navy/[0.02]">
              <td className="px-3 py-2">
                <Badge>{TYPE_LABELS[opp.type] ?? opp.type}</Badge>
              </td>
              <td className="px-3 py-2">
                <Badge
                  tone={
                    opp.priority === "HIGH"
                      ? "bad"
                      : opp.priority === "MEDIUM"
                        ? "warn"
                        : "neutral"
                  }
                >
                  {opp.priority}
                </Badge>
              </td>
              <td className="max-w-xs truncate px-3 py-2 text-xs">
                {opp.reason}
              </td>
              <td className="px-3 py-2 tabular-nums text-emerald-600">
                +{opp.estimatedTrafficGain}
              </td>
              <td className="max-w-[200px] truncate px-3 py-2 text-xs text-slate-dim">
                {opp.requiredAction}
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <Panel
        title="One Click Actions"
        subtitle="Automatisations SEO — respectent les seuils d'indexation"
        accent="purple"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GROWTH_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={pending}
              onClick={() => runAction(action.id)}
              className="rounded-xl border border-navy/10 bg-[#FAFBFC] px-4 py-3 text-left transition hover:border-mint/40 hover:bg-white disabled:opacity-50"
            >
              <p className="text-sm font-semibold text-navy">{action.label}</p>
              <p className="mt-1 text-xs text-slate-dim">{action.description}</p>
            </button>
          ))}
        </div>
        {lastResult && (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {lastResult}
          </p>
        )}
        {recentActionLogs.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-dim">
              Derniers logs
            </h3>
            <div className="space-y-1">
              {recentActionLogs.slice(0, 5).map((log, i) => (
                <p key={i} className="text-xs text-slate-dim">
                  <span className="font-medium text-navy">{log.action}</span> —{" "}
                  {log.message.slice(0, 100)}
                </p>
              ))}
            </div>
          </div>
        )}
      </Panel>

      <Panel
        title="Growth Forecast"
        subtitle="Gain de trafic estimé par action prioritaire"
        accent="yellow"
      >
        <DataTable
          headers={["Action", "Priorité", "Gain est.", "Effort"]}
        >
          {forecast.map((item, i) => (
            <tr key={i} className="hover:bg-navy/[0.02]">
              <td className="px-3 py-2 text-sm">{item.action}</td>
              <td className="px-3 py-2">
                <Badge
                  tone={
                    item.priority === "HIGH"
                      ? "bad"
                      : item.priority === "MEDIUM"
                        ? "warn"
                        : "neutral"
                  }
                >
                  {item.priority}
                </Badge>
              </td>
              <td className="px-3 py-2 tabular-nums font-medium text-emerald-600">
                +{item.estimatedTrafficGain}
              </td>
              <td className="px-3 py-2 text-xs capitalize">{item.effort}</td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <Panel
        title="Google Insights"
        subtitle={
          gsc.configured
            ? gsc.lastIngestedAt
              ? `Dernière sync : ${new Date(gsc.lastIngestedAt).toLocaleString("fr-MA")}`
              : "GSC configuré — lancez Sync Search Console"
            : "Configurez GSC_SERVICE_ACCOUNT_EMAIL + GSC_PRIVATE_KEY"
        }
        accent="blue"
      >
        {!gsc.lastIngestedAt ? (
          <p className="text-sm text-slate-dim">
            Aucune donnée Search Console. Utilisez le bouton « Sync Search Console »
            ou POST /api/admin/gsc avec des données manuelles.
          </p>
        ) : (
          <>
            <h3 className="mb-2 text-sm font-semibold">Top requêtes</h3>
            <DataTable headers={["Requête", "Impressions", "Clics", "CTR", "Position"]}>
              {gsc.topQueries.map((q) => (
                <tr key={q.query} className="hover:bg-navy/[0.02]">
                  <td className="px-3 py-2 font-medium">{q.query}</td>
                  <td className="px-3 py-2 tabular-nums">{q.impressions}</td>
                  <td className="px-3 py-2 tabular-nums">{q.clicks}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {(q.ctr * 100).toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 tabular-nums">{q.position.toFixed(1)}</td>
                </tr>
              ))}
            </DataTable>

            {gsc.ctrGaps.length > 0 && (
              <>
                <h3 className="mb-2 mt-5 text-sm font-semibold">CTR gaps</h3>
                <DataTable headers={["Requête", "Impressions", "CTR actuel", "CTR attendu"]}>
                  {gsc.ctrGaps.map((g) => (
                    <tr key={g.query} className="hover:bg-navy/[0.02]">
                      <td className="px-3 py-2">{g.query}</td>
                      <td className="px-3 py-2 tabular-nums">{g.impressions}</td>
                      <td className="px-3 py-2 tabular-nums text-red-600">
                        {(g.ctr * 100).toFixed(1)}%
                      </td>
                      <td className="px-3 py-2 tabular-nums text-emerald-600">
                        {(g.expectedCtr * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </DataTable>
              </>
            )}

            <h3 className="mb-2 mt-5 text-sm font-semibold">
              Pages à fort potentiel
            </h3>
            <DataTable headers={["Page", "Score", "Impressions", "Position"]}>
              {gsc.highPotential.slice(0, 10).map((p) => (
                <tr key={p.pagePath} className="hover:bg-navy/[0.02]">
                  <td className="max-w-[200px] truncate px-3 py-2 text-xs">
                    {p.pagePath}
                  </td>
                  <td className="px-3 py-2 tabular-nums font-medium">
                    {p.performanceScore}
                  </td>
                  <td className="px-3 py-2 tabular-nums">{p.impressions}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {p.position.toFixed(1)}
                  </td>
                </tr>
              ))}
            </DataTable>
          </>
        )}
      </Panel>

      <Panel
        title="Page Score (0–100)"
        subtitle="Score unifié : indexation, maillage, schema, contenu, trafic GSC"
        accent="green"
      >
        <DataTable
          headers={[
            "Page",
            "Score",
            "Index",
            "Liens",
            "Schema",
            "Contenu",
            "Trafic",
          ]}
        >
          {pageScores.slice(0, 20).map((p) => (
            <tr key={p.pagePath} className="hover:bg-navy/[0.02]">
              <td className="max-w-[180px] truncate px-3 py-2 text-sm font-medium">
                {p.label}
              </td>
              <td className="px-3 py-2">
                <span
                  className={`font-semibold tabular-nums ${
                    p.pageScore >= 70
                      ? "text-emerald-600"
                      : p.pageScore >= 40
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {p.pageScore}
                </span>
              </td>
              <td className="px-3 py-2 tabular-nums text-xs">{p.indexationScore}</td>
              <td className="px-3 py-2 tabular-nums text-xs">
                {p.internalLinksScore}
              </td>
              <td className="px-3 py-2 tabular-nums text-xs">{p.schemaScore}</td>
              <td className="px-3 py-2 tabular-nums text-xs">
                {p.contentDepthScore}
              </td>
              <td className="px-3 py-2 tabular-nums text-xs">{p.trafficScore}</td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </div>
  );
}
