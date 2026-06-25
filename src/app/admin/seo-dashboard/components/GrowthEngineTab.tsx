"use client";

import { useState, useTransition } from "react";
import {
  executeGrowthAction,
  executeAutopilotActionById,
  type GrowthActionName,
} from "../growth-actions";
import type { AutopilotActionType, GrowthEngineBundle } from "@/lib/seo-engine/types";
import {
  ACTION_LABELS,
  GLOSSARY,
  PRIORITY_LABELS,
  SOURCE_LABELS,
} from "./dashboard-guide";
import {
  ActionButton,
  Badge,
  DataTable,
  EmptyState,
  Panel,
  PriorityHero,
  ResultToast,
  StatCard,
  SubSection,
} from "./ui";

const GROWTH_ACTIONS: {
  id: GrowthActionName;
  label: string;
  description: string;
  when: string;
}[] = [
  {
    id: "generate-cities",
    label: "Activer les pages villes",
    description: "Publie les pages ville qui ont assez d'offres (≥5).",
    when: "Quand de nouvelles villes ont des offres mais pas de page SEO.",
  },
  {
    id: "generate-professions",
    label: "Activer les pages métiers",
    description: "Publie les landings secteur/métier avec ≥3 offres.",
    when: "Pour couvrir des recherches type « emploi développeur ».",
  },
  {
    id: "generate-salaries",
    label: "Mettre à jour les salaires",
    description: "Recalcule les observations salariales depuis les offres.",
    when: "Après import d'offres avec salaires — améliore les pages salaire.",
  },
  {
    id: "fix-links",
    label: "Améliorer les liens internes",
    description: "Relie offres → villes, entreprises, pages salaire.",
    when: "Quand des pages sont isolées ou peu liées entre elles.",
  },
  {
    id: "rebuild-sitemap",
    label: "Regénérer le sitemap",
    description: "Met à jour sitemap.xml pour Google.",
    when: "Après avoir créé ou activé de nouvelles pages.",
  },
  {
    id: "enrich-schema",
    label: "Enrichir les données Google Jobs",
    description: "Améliore le schema JobPosting des offres actives.",
    when: "Pour mieux apparaître dans Google for Jobs.",
  },
  {
    id: "fix-thin",
    label: "Masquer les pages trop pauvres",
    description: "Applique noindex aux pages sous le seuil minimum.",
    when: "Pour éviter que Google indexe du contenu faible.",
  },
  {
    id: "sync-gsc",
    label: "Synchroniser Search Console",
    description: "Importe clics, impressions et positions depuis Google.",
    when: "À faire en premier si les données Google sont vides.",
  },
  {
    id: "full-pipeline",
    label: "Tout lancer d'un coup",
    description: "Exécute toutes les actions ci-dessus en séquence.",
    when: "Maintenance hebdomadaire ou après gros import d'offres.",
  },
];

const TYPE_LABELS: Record<string, string> = {
  CITY_PAGE: "Page ville",
  SALARY_PAGE: "Page salaire",
  PROFESSION_PAGE: "Page métier",
  LINKING: "Maillage",
  RANKING: "Position Google",
};

export function GrowthEngineTab({ data }: { data: GrowthEngineBundle }) {
  const [pending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<{ message: string; ok: boolean } | null>(
    null
  );

  function runAction(id: GrowthActionName) {
    startTransition(async () => {
      const result = await executeGrowthAction(id);
      setLastResult({ message: result.message, ok: result.ok });
    });
  }

  function runAutopilot(action: AutopilotActionType, targetPath: string) {
    startTransition(async () => {
      const result = await executeAutopilotActionById(action, targetPath);
      setLastResult({ message: result.message, ok: result.ok });
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
      {orchestrator.topAction ? (
        <Panel
          title="Votre priorité #1 — action à plus fort impact"
          subtitle={`Si vous ne faites qu'une chose aujourd'hui, faites celle-ci. Potentiel total du top 15 : +${orchestrator.totalPotentialGain} clics/mois`}
          accent="purple"
          help={GLOSSARY.orchestrator}
          whatToDo={[
            "Lisez l'action recommandée ci-dessous.",
            "Cliquez « Exécuter cette action » — le système applique la correction automatiquement.",
            "Revenez demain : une nouvelle priorité sera calculée avec les données à jour.",
          ]}
        >
          <PriorityHero
            rank={orchestrator.topAction.rank}
            title={orchestrator.topAction.title}
            path={orchestrator.topAction.targetPath}
            rationale={orchestrator.topAction.rationale}
            gain={orchestrator.topAction.potentialGain}
            confidence={orchestrator.topAction.confidence}
            actionLabel={
              ACTION_LABELS[orchestrator.topAction.action] ??
              orchestrator.topAction.action
            }
            onExecute={() =>
              runAutopilot(
                orchestrator.topAction!.action,
                orchestrator.topAction!.targetPath
              )
            }
            disabled={pending}
          />

          <SubSection
            title="Autres actions classées par impact"
            hint="Traitez-les dans l'ordre après la priorité #1."
          >
            <DataTable headers={["Rang", "Action", "Gain estimé", "Confiance", "Origine"]}>
              {orchestrator.priorities.slice(1, 8).map((p) => (
                <tr key={p.actionId} className="hover:bg-navy/[0.02]">
                  <td className="px-3 py-2 tabular-nums font-medium">{p.rank}</td>
                  <td className="max-w-[220px] px-3 py-2 text-sm">
                    <span className="line-clamp-2">{p.title}</span>
                  </td>
                  <td className="px-3 py-2 font-semibold text-emerald-600">
                    +{p.potentialGain}
                  </td>
                  <td className="px-3 py-2 tabular-nums">{p.confidence}%</td>
                  <td className="px-3 py-2 text-xs text-slate-dim">
                    {SOURCE_LABELS[p.source] ?? p.source}
                  </td>
                </tr>
              ))}
            </DataTable>
          </SubSection>
        </Panel>
      ) : (
        <Panel
          title="Orchestrateur de croissance"
          accent="purple"
          help="Le système a besoin de données (offres + idéalement Google Search Console) pour calculer votre priorité #1."
        >
          <EmptyState
            title="Aucune action prioritaire pour l'instant"
            description="Synchronisez Google Search Console et assurez-vous d'avoir des pages indexées avec des offres actives."
            action={
              <ActionButton onClick={() => runAction("sync-gsc")} disabled={pending}>
                Synchroniser Search Console
              </ActionButton>
            }
          />
        </Panel>
      )}

      {lastResult && (
        <ResultToast message={lastResult.message} ok={lastResult.ok} />
      )}

      <Panel
        title="Pilote SEO automatique"
        subtitle={`Note santé moyenne : ${autopilot.summary.avgHealthScore}/100 — ${autopilot.summary.pagesNeedingAction} page(s) à améliorer`}
        accent="green"
        help={GLOSSARY.healthScore}
        whatToDo={[
          "Consultez les « Gains rapides » : pages déjà sur Google mais sous-optimisées.",
          "Cliquez « Appliquer » sur une ligne pour exécuter la correction suggérée.",
          "Utilisez le maillage automatique pour relier villes, métiers et entreprises.",
        ]}
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Gains rapides"
            value={autopilot.quickWinQueue.length}
            hint="Pages proches du top Google"
            tone="good"
            tooltip={GLOSSARY.quickWin}
          />
          <StatCard
            label="Actions en attente"
            value={autopilot.actionQueue.length}
            hint="Prêtes à exécuter"
          />
          <StatCard
            label="Clics à gagner"
            value={`+${autopilot.summary.totalEstimatedGain}`}
            hint="Estimation mensuelle"
            tone="good"
            tooltip={GLOSSARY.trafficGain}
          />
          <StatCard
            label="Suggestions de liens"
            value={autopilot.linkAutopilot.length}
            hint="Pages à mieux relier"
            tooltip={GLOSSARY.internalLinks}
          />
        </div>

        <SubSection
          title="Gains rapides"
          hint={`Pages en position 4–15 avec beaucoup d'impressions mais un CTR en dessous de la norme. ${GLOSSARY.ctr}`}
        >
          {autopilot.quickWinQueue.length === 0 ? (
            <EmptyState
              title="Aucun gain rapide détecté"
              description="Connectez Google Search Console pour analyser positions et CTR."
            />
          ) : (
            <DataTable
              headers={[
                "Page",
                "Position",
                "Votre CTR",
                "CTR attendu",
                "Clics à gagner",
                "Action suggérée",
                "",
              ]}
            >
              {autopilot.quickWinQueue.slice(0, 8).map((qw) => (
                <tr key={qw.pagePath} className="hover:bg-navy/[0.02]">
                  <td className="max-w-[140px] truncate px-3 py-2 text-xs font-medium">
                    {qw.pagePath}
                  </td>
                  <td className="px-3 py-2 tabular-nums" title={GLOSSARY.position}>
                    {qw.position.toFixed(1)}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-red-600">
                    {(qw.ctr * 100).toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 tabular-nums text-emerald-600">
                    {(qw.benchmarkCtr * 100).toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 font-semibold text-emerald-600">
                    +{qw.estimatedTrafficGain}
                  </td>
                  <td className="px-3 py-2 text-xs">{qw.actionLabel}</td>
                  <td className="px-3 py-2">
                    <ActionButton
                      size="sm"
                      onClick={() => runAutopilot(qw.suggestedAction, qw.pagePath)}
                      disabled={pending}
                    >
                      Appliquer
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </SubSection>

        <SubSection
          title="Santé SEO par page"
          hint="Score global 0–100. En dessous de 50 = action recommandée. En dessous de 70 = à surveiller."
        >
          <DataTable headers={["Page", "Score", "Problèmes détectés", "Clics à gagner"]}>
            {autopilot.healthScores.slice(0, 10).map((h) => (
              <tr key={h.pagePath} className="hover:bg-navy/[0.02]">
                <td className="max-w-[140px] truncate px-3 py-2 text-xs">{h.label}</td>
                <td className="px-3 py-2">
                  <span
                    className={`font-bold tabular-nums ${
                      h.score >= 70
                        ? "text-emerald-600"
                        : h.score >= 50
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}
                  >
                    {h.score}/100
                  </span>
                </td>
                <td className="max-w-[220px] truncate px-3 py-2 text-xs text-slate-dim">
                  {h.issues.slice(0, 2).join(" · ") || "RAS"}
                </td>
                <td className="px-3 py-2 tabular-nums text-emerald-600">
                  +{h.estimatedTrafficGain}
                </td>
              </tr>
            ))}
          </DataTable>
        </SubSection>

        <SubSection
          title="File d'actions — cliquez pour exécuter"
          hint="Chaque ligne est une correction concrète que le système peut appliquer seul."
        >
          <div className="space-y-2">
            {autopilot.actionQueue.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy/8 bg-[#FAFBFC] px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-navy">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-dim">
                    <Badge>{ACTION_LABELS[item.action] ?? item.action}</Badge>
                    <span className="ml-2">
                      +{item.estimatedTrafficGain} clics · confiance {item.confidence}%
                    </span>
                  </p>
                </div>
                <ActionButton
                  size="sm"
                  variant="success"
                  onClick={() => runAutopilot(item.action, item.targetPath)}
                  disabled={pending}
                >
                  Exécuter
                </ActionButton>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection
          title="Maillage interne automatique"
          hint="Le système détecte quelles pages devraient se lier entre elles (ville → métier → entreprise) sans configuration manuelle."
        >
          {autopilot.linkAutopilot.slice(0, 3).map((link) => (
            <div
              key={link.sourcePath}
              className="mb-3 rounded-xl border border-navy/8 bg-white p-4"
            >
              <p className="text-sm font-semibold text-navy">{link.sourceLabel}</p>
              <p className="font-mono text-xs text-slate-dim">{link.sourcePath}</p>
              <p className="mt-2 text-xs text-slate-dim">
                Liens recommandés (+{link.estimatedTrafficGain} clics estimés) :
              </p>
              <ul className="mt-2 space-y-1.5">
                {link.recommendedLinks.slice(0, 5).map((r) => (
                  <li key={r.href} className="flex gap-2 text-sm">
                    <span className="text-mint-dim">→</span>
                    <span>
                      <span className="font-medium text-navy">{r.label}</span>
                      <span className="text-xs text-slate-dim"> — {r.reason}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </SubSection>
      </Panel>

      <Panel
        title="Intelligence marché emploi"
        subtitle="Tendances calculées depuis vos vraies offres d'emploi — pas d'estimations fictives"
        accent="yellow"
        help="Utilisez ces données pour décider quelles pages créer ou enrichir : villes en croissance, compétences demandées, salaires."
        whatToDo={[
          "Repérez les villes où le recrutement accélère → priorisez leurs pages SEO.",
          "Notez les compétences en forte hausse → créez du contenu ciblé.",
          "Croisez avec l'onglet Intelligence pour les mots-clés associés.",
        ]}
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            label="Villes en croissance"
            value={demand.market.fastestGrowingCities.filter((c) => c.delta > 0).length}
            hint="Plus d'offres qu'il y a 30j"
            tone="good"
          />
          <StatCard
            label="Compétences montantes"
            value={demand.skillTrends.fastestGrowing.length}
            hint="Momentum positif"
          />
          <StatCard
            label="Métiers bien payés"
            value={demand.market.highestPayingProfessions.length}
            hint="D'après les offres"
          />
        </div>

        <SubSection title="Villes où le recrutement accélère" hint="Δ 30j = différence d'offres actives sur 30 jours.">
          <DataTable headers={["Ville", "Offres actives", "Évolution 30j"]}>
            {demand.market.fastestGrowingCities.slice(0, 8).map((c) => (
              <tr key={c.slug} className="hover:bg-navy/[0.02]">
                <td className="px-3 py-2 font-medium">{c.city}</td>
                <td className="px-3 py-2 tabular-nums">{c.count}</td>
                <td
                  className={`px-3 py-2 tabular-nums font-medium ${
                    c.delta > 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {c.delta > 0 ? "+" : ""}
                  {c.delta} offres
                </td>
              </tr>
            ))}
          </DataTable>
        </SubSection>

        <SubSection title="Compétences les plus demandées (en hausse)">
          <DataTable headers={["Compétence", "Fréquence dans les offres", "Score momentum"]}>
            {demand.skillTrends.fastestGrowing.slice(0, 8).map((s) => (
              <tr key={s.slug} className="hover:bg-navy/[0.02]">
                <td className="px-3 py-2 font-medium">{s.skill}</td>
                <td className="px-3 py-2 tabular-nums">{s.frequency}</td>
                <td className="px-3 py-2 tabular-nums text-emerald-600">+{s.momentumScore}</td>
              </tr>
            ))}
          </DataTable>
        </SubSection>
      </Panel>

      <Panel
        title="Opportunités SEO détectées"
        subtitle={`${opportunities.summary.total} opportunité(s) — jusqu'à +${opportunities.summary.totalEstimatedGain} clics/mois si tout est corrigé`}
        accent="red"
        help="Le moteur scanne vos pages et signale ce qui manque : contenu, liens, indexation, etc."
        whatToDo={[
          "Commencez par les badges « Urgent » (rouge).",
          "Lisez la colonne « Que faire » — c'est l'action manuelle ou automatique à lancer.",
          "Pour automatiser, utilisez la file d'actions du Pilote SEO ci-dessus.",
        ]}
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Urgent"
            value={opportunities.summary.high}
            hint={PRIORITY_LABELS.HIGH.hint}
            tone="bad"
          />
          <StatCard
            label="Important"
            value={opportunities.summary.medium}
            hint={PRIORITY_LABELS.MEDIUM.hint}
            tone="warn"
          />
          <StatCard label="Plus tard" value={opportunities.summary.low} hint={PRIORITY_LABELS.LOW.hint} />
          <StatCard
            label="Gains rapides"
            value={opportunities.quickWins.length}
            tone="good"
          />
        </div>

        <DataTable headers={["Type", "Urgence", "Problème", "Clics à gagner", "Que faire"]}>
          {opportunities.opportunities.slice(0, 20).map((opp, i) => (
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
                  {PRIORITY_LABELS[opp.priority]?.label ?? opp.priority}
                </Badge>
              </td>
              <td className="max-w-xs px-3 py-2 text-xs">{opp.reason}</td>
              <td className="px-3 py-2 font-semibold text-emerald-600">
                +{opp.estimatedTrafficGain}
              </td>
              <td className="max-w-[200px] px-3 py-2 text-xs text-slate-dim">
                {opp.requiredAction}
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <Panel
        title="Actions manuelles (maintenance)"
        subtitle="Lancez une opération précise quand vous savez ce dont le site a besoin"
        accent="purple"
        whatToDo={[
          "En début de semaine : « Synchroniser Search Console » puis « Tout lancer ».",
          "Après import d'offres : « Mettre à jour les salaires » + « Améliorer les liens ».",
          "Chaque bouton explique quand l'utiliser — survolez la description.",
        ]}
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
              <p className="mt-1 text-xs leading-relaxed text-slate-dim">
                {action.description}
              </p>
              <p className="mt-2 text-xs font-medium text-mint-dim">
                Quand ? {action.when}
              </p>
            </button>
          ))}
        </div>

        {recentActionLogs.length > 0 && (
          <SubSection title="Historique récent" hint="Les 5 dernières actions exécutées sur le site.">
            <div className="space-y-2">
              {recentActionLogs.slice(0, 5).map((log, i) => (
                <p key={i} className="rounded-lg bg-navy/[0.03] px-3 py-2 text-xs text-slate-dim">
                  <span className="font-semibold text-navy">{log.action}</span> —{" "}
                  {log.message.slice(0, 120)}
                </p>
              ))}
            </div>
          </SubSection>
        )}
      </Panel>

      <Panel
        title="Données Google Search Console"
        subtitle={
          gsc.configured
            ? gsc.lastIngestedAt
              ? `Dernière synchronisation : ${new Date(gsc.lastIngestedAt).toLocaleString("fr-MA")}`
              : "Compte connecté — cliquez « Synchroniser Search Console » ci-dessus"
            : "Non configuré — ajoutez GSC_SERVICE_ACCOUNT_EMAIL et GSC_PRIVATE_KEY dans .env"
        }
        accent="blue"
        help={`${GLOSSARY.impressions} ${GLOSSARY.position}`}
        whatToDo={[
          "Si ce bloc est vide : lancez « Synchroniser Search Console ».",
          "Regardez « Écarts de CTR » : requêtes visibles mais peu cliquées → améliorez titres.",
          "Pages à fort potentiel = beaucoup d'impressions, position améliorable.",
        ]}
      >
        {!gsc.lastIngestedAt ? (
          <EmptyState
            title="Pas encore de données Google"
            description="Sans Search Console, les gains en clics et les positions ne peuvent pas être calculés. C'est la première chose à configurer."
            action={
              <ActionButton onClick={() => runAction("sync-gsc")} disabled={pending}>
                Synchroniser maintenant
              </ActionButton>
            }
          />
        ) : (
          <>
            <SubSection title="Requêtes les plus visibles sur Google">
              <DataTable
                headers={[
                  "Recherche Google",
                  "Impressions",
                  "Clics",
                  "CTR",
                  "Position moy.",
                ]}
              >
                {gsc.topQueries.map((q) => (
                  <tr key={q.query} className="hover:bg-navy/[0.02]">
                    <td className="px-3 py-2 font-medium">{q.query}</td>
                    <td className="px-3 py-2 tabular-nums">{q.impressions}</td>
                    <td className="px-3 py-2 tabular-nums">{q.clicks}</td>
                    <td className="px-3 py-2 tabular-nums">{(q.ctr * 100).toFixed(1)}%</td>
                    <td className="px-3 py-2 tabular-nums">{q.position.toFixed(1)}</td>
                  </tr>
                ))}
              </DataTable>
            </SubSection>

            {gsc.ctrGaps.length > 0 && (
              <SubSection
                title="Écarts de CTR — vous êtes visible mais peu cliqué"
                hint="Le CTR actuel est en rouge, le CTR possible en vert si vous améliorez titre et description."
              >
                <DataTable
                  headers={["Requête", "Impressions", "CTR actuel", "CTR possible"]}
                >
                  {gsc.ctrGaps.map((g) => (
                    <tr key={g.query} className="hover:bg-navy/[0.02]">
                      <td className="px-3 py-2">{g.query}</td>
                      <td className="px-3 py-2 tabular-nums">{g.impressions}</td>
                      <td className="px-3 py-2 tabular-nums font-medium text-red-600">
                        {(g.ctr * 100).toFixed(1)}%
                      </td>
                      <td className="px-3 py-2 tabular-nums font-medium text-emerald-600">
                        {(g.expectedCtr * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </DataTable>
              </SubSection>
            )}
          </>
        )}
      </Panel>

      <Panel
        title="Prévisions de croissance"
        subtitle="Estimation du gain si vous appliquez chaque type d'action"
        accent="yellow"
        help="Classement par impact estimé. « Effort » = temps/complexité approximative (low = rapide)."
      >
        <DataTable headers={["Action", "Urgence", "Clics à gagner", "Effort"]}>
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
                  {PRIORITY_LABELS[item.priority as keyof typeof PRIORITY_LABELS]?.label ??
                    item.priority}
                </Badge>
              </td>
              <td className="px-3 py-2 font-semibold text-emerald-600">
                +{item.estimatedTrafficGain}
              </td>
              <td className="px-3 py-2 text-xs capitalize text-slate-dim">
                {item.effort === "low"
                  ? "Rapide"
                  : item.effort === "medium"
                    ? "Moyen"
                    : "Long"}
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <Panel
        title="Score qualité par page"
        subtitle="Vue détaillée : indexation, liens, schema, contenu, trafic Google"
        accent="green"
        help="Chaque colonne est une note sur 100. Le score global aide à trier les pages à traiter en premier."
      >
        <DataTable
          headers={[
            "Page",
            "Score",
            "Indexation",
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
                  className={`font-bold tabular-nums ${
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
              <td className="px-3 py-2 tabular-nums text-xs">{p.internalLinksScore}</td>
              <td className="px-3 py-2 tabular-nums text-xs">{p.schemaScore}</td>
              <td className="px-3 py-2 tabular-nums text-xs">{p.contentDepthScore}</td>
              <td className="px-3 py-2 tabular-nums text-xs">{p.trafficScore}</td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </div>
  );
}
