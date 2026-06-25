"use client";

import { useState, useTransition } from "react";
import {
  executeGrowthAction,
  executeAutopilotActionById,
  type GrowthActionName,
} from "../growth-actions";
import type { AutopilotActionType, GrowthEngineBundle } from "@/lib/seo-engine/types";
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

  function runAutopilot(action: AutopilotActionType, targetPath: string) {
    startTransition(async () => {
      const result = await executeAutopilotActionById(action, targetPath);
      setLastResult(result.message);
    });
  }

  const {
    opportunities,
    forecast,
    gsc,
    pageScores,
    recentActionLogs,
    autopilot,
    demand,
    orchestrator,
  } = data;

  return (
    <div className="grid gap-6">
      {orchestrator.topAction && (
        <Panel
          title="Growth Orchestrator — #1 ROI Action"
          subtitle={`Potentiel total : +${orchestrator.totalPotentialGain} clics estimés`}
          accent="purple"
        >
          <div className="rounded-xl border-2 border-mint/30 bg-gradient-to-r from-navy/5 to-mint/5 p-5">
            <p className="text-lg font-bold text-navy">
              {orchestrator.topAction.rank}. {orchestrator.topAction.title}
            </p>
            <p className="mt-1 text-sm text-slate-dim">
              {orchestrator.topAction.targetPath} — {orchestrator.topAction.rationale}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <span className="font-semibold text-emerald-600">
                +{orchestrator.topAction.potentialGain} clics
              </span>
              <span>Confiance {orchestrator.topAction.confidence}%</span>
              <Badge>{orchestrator.topAction.action}</Badge>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                runAutopilot(
                  orchestrator.topAction!.action,
                  orchestrator.topAction!.targetPath
                )
              }
              className="mt-4 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-700 disabled:opacity-50"
            >
              Exécuter maintenant
            </button>
          </div>
          <DataTable
            headers={["#", "Action", "Gain", "Conf.", "Source"]}
          >
            {orchestrator.priorities.slice(1, 8).map((p) => (
              <tr key={p.actionId} className="hover:bg-navy/[0.02]">
                <td className="px-3 py-2 tabular-nums">{p.rank}</td>
                <td className="max-w-[200px] truncate px-3 py-2 text-sm">
                  {p.title}
                </td>
                <td className="px-3 py-2 font-medium text-emerald-600">
                  +{p.potentialGain}
                </td>
                <td className="px-3 py-2 tabular-nums">{p.confidence}%</td>
                <td className="px-3 py-2 text-xs text-slate-dim">{p.source}</td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      )}

      <Panel
        title="SEO Autopilot"
        subtitle={`Score santé moyen ${autopilot.summary.avgHealthScore}/100 — ${autopilot.summary.pagesNeedingAction} pages à traiter`}
        accent="green"
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Quick wins" value={autopilot.quickWinQueue.length} tone="good" />
          <StatCard label="Action queue" value={autopilot.actionQueue.length} />
          <StatCard
            label="Gain estimé"
            value={`+${autopilot.summary.totalEstimatedGain}`}
            tone="good"
          />
          <StatCard label="Link autopilot" value={autopilot.linkAutopilot.length} />
        </div>

        <h3 className="mb-2 text-sm font-semibold">Quick Win Queue (pos 4–15)</h3>
        <DataTable
          headers={["Page", "Pos.", "CTR", "Benchmark", "Gain", "Action", ""]}
        >
          {autopilot.quickWinQueue.slice(0, 8).map((qw) => (
            <tr key={qw.pagePath} className="hover:bg-navy/[0.02]">
              <td className="max-w-[140px] truncate px-3 py-2 text-xs">{qw.pagePath}</td>
              <td className="px-3 py-2 tabular-nums">{qw.position.toFixed(1)}</td>
              <td className="px-3 py-2 tabular-nums">{(qw.ctr * 100).toFixed(1)}%</td>
              <td className="px-3 py-2 tabular-nums text-slate-dim">
                {(qw.benchmarkCtr * 100).toFixed(1)}%
              </td>
              <td className="px-3 py-2 font-medium text-emerald-600">
                +{qw.estimatedTrafficGain}
              </td>
              <td className="px-3 py-2 text-xs">{qw.actionLabel}</td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => runAutopilot(qw.suggestedAction, qw.pagePath)}
                  className="rounded bg-navy px-2 py-1 text-xs text-white disabled:opacity-50"
                >
                  Run
                </button>
              </td>
            </tr>
          ))}
        </DataTable>

        <h3 className="mb-2 mt-4 text-sm font-semibold">SEO Health Scores</h3>
        <DataTable
          headers={["Page", "Score", "Issues", "Gain est."]}
        >
          {autopilot.healthScores.slice(0, 10).map((h) => (
            <tr key={h.pagePath} className="hover:bg-navy/[0.02]">
              <td className="max-w-[140px] truncate px-3 py-2 text-xs">{h.label}</td>
              <td className="px-3 py-2">
                <span
                  className={`font-semibold tabular-nums ${
                    h.score >= 70 ? "text-emerald-600" : h.score >= 50 ? "text-amber-600" : "text-red-600"
                  }`}
                >
                  {h.score}
                </span>
              </td>
              <td className="max-w-[200px] truncate px-3 py-2 text-xs text-slate-dim">
                {h.issues.slice(0, 2).join(" · ") || "—"}
              </td>
              <td className="px-3 py-2 tabular-nums text-emerald-600">+{h.estimatedTrafficGain}</td>
            </tr>
          ))}
        </DataTable>

        <h3 className="mb-2 mt-4 text-sm font-semibold">Action Queue — exécutable</h3>
        <div className="mb-4 space-y-2">
          {autopilot.actionQueue.slice(0, 8).map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy/8 bg-[#FAFBFC] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-navy">{item.label}</p>
                <p className="text-xs text-slate-dim">
                  {item.action} · +{item.estimatedTrafficGain} · {item.confidence}%
                </p>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => runAutopilot(item.action, item.targetPath)}
                className="shrink-0 rounded-lg bg-navy px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              >
                Run
              </button>
            </div>
          ))}
        </div>

        <h3 className="mb-2 text-sm font-semibold">Internal Link Autopilot</h3>
        {autopilot.linkAutopilot.slice(0, 3).map((link) => (
          <div key={link.sourcePath} className="mb-3 rounded-lg border border-navy/8 p-3">
            <p className="text-sm font-semibold">
              {link.sourceLabel}{" "}
              <span className="font-normal text-slate-dim">{link.sourcePath}</span>
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate-dim">
              {link.recommendedLinks.slice(0, 5).map((r) => (
                <li key={r.href}>
                  → <span className="text-navy">{r.label}</span> ({r.reason})
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Panel>

      <Panel
        title="Market Intelligence"
        subtitle="Tendances réelles depuis PostgreSQL — 7j / 30j / 90j"
        accent="yellow"
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            label="Villes en croissance"
            value={demand.market.fastestGrowingCities.filter((c) => c.delta > 0).length}
            tone="good"
          />
          <StatCard
            label="Skills momentum +"
            value={demand.skillTrends.fastestGrowing.length}
          />
          <StatCard
            label="Top pay (obs.)"
            value={demand.market.highestPayingProfessions.length}
          />
        </div>
        <DataTable headers={["Ville", "Offres actives", "Δ 30j"]}>
          {demand.market.fastestGrowingCities.slice(0, 8).map((c) => (
            <tr key={c.slug} className="hover:bg-navy/[0.02]">
              <td className="px-3 py-2 font-medium">{c.city}</td>
              <td className="px-3 py-2 tabular-nums">{c.count}</td>
              <td className={`px-3 py-2 tabular-nums ${c.delta > 0 ? "text-emerald-600" : "text-red-600"}`}>
                {c.delta > 0 ? "+" : ""}{c.delta}
              </td>
            </tr>
          ))}
        </DataTable>
        <h3 className="mb-2 mt-4 text-sm font-semibold">Fastest Growing Skills</h3>
        <DataTable headers={["Skill", "Fréquence", "Momentum"]}>
          {demand.skillTrends.fastestGrowing.slice(0, 8).map((s) => (
            <tr key={s.slug} className="hover:bg-navy/[0.02]">
              <td className="px-3 py-2">{s.skill}</td>
              <td className="px-3 py-2 tabular-nums">{s.frequency}</td>
              <td className="px-3 py-2 tabular-nums text-emerald-600">+{s.momentumScore}</td>
            </tr>
          ))}
        </DataTable>
      </Panel>

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
