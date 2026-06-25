"use client";

import type { SeoIntelligenceBundle } from "@/lib/seo-engine/types";
import { GLOSSARY, PRIORITY_LABELS } from "./dashboard-guide";
import {
  Badge,
  DataTable,
  EmptyState,
  Panel,
  StatCard,
  SubSection,
} from "./ui";

const INTENT_LABELS: Record<string, string> = {
  CITY: "Ville",
  SALARY: "Salaire",
  COMPANY: "Entreprise",
  PROFESSION: "Métier",
  GENERAL: "Général",
};

export function SeoIntelligenceTab({
  intelligence,
}: {
  intelligence: SeoIntelligenceBundle;
}) {
  const { keywords, ranking, competitors, content, serpLayer } = intelligence;

  return (
    <div className="grid gap-6">
      {serpLayer && (
        <Panel
          title="Couche intelligence SERP (concurrence Google)"
          subtitle="Préparé pour connecter DataForSEO, Ahrefs ou SEMrush — aucune position inventée"
          accent="purple"
          help="Quand un outil payant sera connecté, vous verrez ici les vraies positions concurrents, les mots-clés à attaquer et les gaps SERP. En attendant, seules les données structurelles sont affichées."
          whatToDo={[
            "Ajoutez les clés API dans .env (voir .env.example).",
            "Une fois connecté, synchronisez pour remplir les enregistrements.",
            "Les rankings réels remplaceront les « — » dans les tableaux.",
          ]}
        >
          <p className="mb-4 rounded-lg bg-navy/5 px-3 py-2 text-sm text-slate-dim">
            {serpLayer.dataNote}
          </p>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Données stockées" value={serpLayer.storedRecords} />
            <StatCard
              label="Prêt pour données réelles"
              value={serpLayer.readyForRealSerp ? "Oui" : "Non"}
              tone={serpLayer.readyForRealSerp ? "good" : "warn"}
            />
          </div>
          <DataTable headers={["Outil", "Connecté", "Enregistrements", "Dernière sync"]}>
            {serpLayer.providers.map((p) => (
              <tr key={p.id} className="hover:bg-navy/[0.02]">
                <td className="px-3 py-2 font-medium">{p.name}</td>
                <td className="px-3 py-2">
                  <Badge tone={p.configured ? "good" : "warn"}>
                    {p.configured ? "Oui" : "Non configuré"}
                  </Badge>
                </td>
                <td className="px-3 py-2 tabular-nums">{p.recordCount}</td>
                <td className="px-3 py-2 text-xs text-slate-dim">
                  {p.lastSyncAt
                    ? new Date(p.lastSyncAt).toLocaleDateString("fr-FR")
                    : "—"}
                </td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      )}

      <Panel
        title="Opportunités mots-clés"
        subtitle={`${keywords.summary.totalKeywords} recherches Google analysées — ${keywords.summary.unmapped} sans page dédiée sur votre site`}
        accent="green"
        help="Un mot-clé « non mappé » = des gens cherchent sur Google mais vous n'avez pas de page optimisée pour eux. C'est une opportunité de créer ou améliorer du contenu."
        whatToDo={[
          "Triez par score d'opportunité (plus haut = plus intéressant).",
          "Si « Page » est vide → créez une landing ou enrichissez une page existante.",
          "Lisez la colonne « Action recommandée » pour savoir quoi faire.",
        ]}
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Avec page dédiée"
            value={keywords.summary.mapped}
            tone="good"
          />
          <StatCard
            label="Sans page"
            value={keywords.summary.unmapped}
            hint="Opportunités de contenu"
            tone="warn"
          />
          <StatCard
            label="Fort potentiel"
            value={keywords.summary.highOpportunity}
          />
          <StatCard label="Pages référencées" value={keywords.pageIndexCount} />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {keywords.clusters.map((c) => (
            <span
              key={c.intent}
              className="rounded-lg bg-navy/5 px-3 py-1.5 text-xs font-medium text-navy"
            >
              {INTENT_LABELS[c.intent]}: {c.count} mots-clés ({c.unmapped} sans page)
            </span>
          ))}
        </div>

        <DataTable
          headers={[
            "Recherche Google",
            "Type",
            "Votre page",
            "Score",
            "Position",
            "Que faire",
          ]}
        >
          {keywords.opportunities.slice(0, 20).map((kw) => (
            <tr key={kw.keyword} className="hover:bg-navy/[0.02]">
              <td className="max-w-[160px] truncate px-3 py-2 text-sm font-medium">
                {kw.keyword}
              </td>
              <td className="px-3 py-2">
                <Badge>{INTENT_LABELS[kw.intent]}</Badge>
              </td>
              <td className="max-w-[140px] truncate px-3 py-2 text-xs text-slate-dim">
                {kw.mappedPage ?? (
                  <span className="text-amber-600">Aucune page</span>
                )}
              </td>
              <td className="px-3 py-2 tabular-nums font-semibold">
                {kw.opportunityScore}
              </td>
              <td className="px-3 py-2 tabular-nums text-xs">
                {kw.position > 0 ? kw.position.toFixed(1) : "—"}
              </td>
              <td className="max-w-[200px] px-3 py-2 text-xs text-slate-dim">
                {kw.recommendedAction}
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <Panel
        title="Écarts vs concurrence (structure)"
        subtitle={competitors.dataNote}
        accent="red"
        help="Compare la structure de votre site (pages ville, salaire, métier…) avec ce que font les grands sites emploi marocains. Ce n'est pas encore du ranking SERP réel — c'est de la couverture thématique."
        whatToDo={[
          "Lisez les « gaps structurels » : types de pages où vous êtes en retard.",
          "Priorisez les lignes « Urgent » — ce sont des thèmes que les concurrents couvrent mieux.",
          "Créez les pages manquantes via l'onglet Croissance.",
        ]}
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Écarts détectés" value={competitors.summary.totalGaps} />
          <StatCard
            label="Urgent"
            value={competitors.summary.highPriority}
            tone="bad"
          />
          <StatCard
            label="Pages manquantes"
            value={competitors.summary.missingPages}
            tone="warn"
          />
          <StatCard
            label="Pertes de ranking"
            value={competitors.summary.rankingLosses}
            hint="Nécessite provider SERP"
          />
        </div>

        <SubSection title="Où votre site est en retard structurellement">
          <div className="mb-4 space-y-2">
            {competitors.structureGaps.map((g) => (
              <div
                key={g.pageType}
                className="rounded-lg border border-navy/8 bg-[#FAFBFC] px-3 py-2 text-sm"
              >
                <Badge tone={g.priority === "HIGH" ? "bad" : "warn"}>
                  {PRIORITY_LABELS[g.priority as keyof typeof PRIORITY_LABELS]?.label ??
                    g.priority}
                </Badge>
                <span className="ml-2 text-slate-dim">{g.gapDescription}</span>
              </div>
            ))}
          </div>
        </SubSection>

        <DataTable
          headers={[
            "Mot-clé",
            "Concurrent type",
            "Notre position",
            "Type d'écart",
            "Stratégie",
            "Urgence",
          ]}
        >
          {competitors.gaps.slice(0, 15).map((g) => (
            <tr key={`${g.keyword}-${g.competitor}`} className="hover:bg-navy/[0.02]">
              <td className="max-w-[140px] truncate px-3 py-2 text-sm">
                {g.keyword}
              </td>
              <td className="px-3 py-2 text-xs">{g.competitor}</td>
              <td className="px-3 py-2 tabular-nums text-xs">
                {g.ourPosition?.toFixed(1) ?? "—"}
              </td>
              <td className="px-3 py-2 text-xs">{g.gapType}</td>
              <td className="px-3 py-2">
                <Badge tone={g.serpClass === "STRATEGIC" ? "bad" : "neutral"}>
                  {g.serpClass === "STRATEGIC" ? "Stratégique" : g.serpClass}
                </Badge>
              </td>
              <td className="px-3 py-2">
                <Badge
                  tone={
                    g.priority === "HIGH"
                      ? "bad"
                      : g.priority === "MEDIUM"
                        ? "warn"
                        : "neutral"
                  }
                >
                  {PRIORITY_LABELS[g.priority as keyof typeof PRIORITY_LABELS]?.label ??
                    g.priority}
                </Badge>
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <Panel
        title="Suggestions de contenu (données réelles)"
        subtitle="Blocs SEO générés depuis vos offres et salaires — rien d'inventé"
        accent="yellow"
        help="Aperçu du contenu que le moteur peut produire automatiquement pour vos pages. Chaque bloc cite sa source (offres, observations salariales)."
        whatToDo={[
          "Vérifiez que les blocs correspondent à la réalité du marché.",
          "Pour publier : allez dans Croissance → « Régénérer le contenu » sur la page cible.",
          "Plus vous avez d'offres, plus le contenu est riche.",
        ]}
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {content.availablePages.map((p) => (
            <span
              key={p.pageType}
              className="rounded-lg bg-navy/5 px-3 py-1.5 text-xs font-medium"
            >
              {p.pageType}: {p.count} pages disponibles
            </span>
          ))}
        </div>

        {content.samples.length === 0 ? (
          <EmptyState
            title="Pas encore d'échantillons"
            description="Ajoutez des offres avec assez de volume pour générer du contenu automatique."
          />
        ) : (
          content.samples.map((sample) => (
            <div
              key={sample.pagePath}
              className="mb-4 rounded-xl border border-navy/8 bg-[#FAFBFC] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{sample.pageType}</Badge>
                <span className="font-semibold text-navy">{sample.label}</span>
                <span className="font-mono text-xs text-slate-dim">{sample.pagePath}</span>
              </div>
              <p className="mt-1 text-xs text-slate-dim">
                Source des données : {sample.dataSource}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {sample.blocks.map((block) => (
                  <div
                    key={block.title}
                    className="rounded-lg border border-navy/6 bg-white p-3"
                  >
                    <p className="text-xs font-semibold uppercase text-slate-dim">
                      {block.type}
                    </p>
                    <p className="text-sm font-medium text-navy">{block.title}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </Panel>

      <Panel
        title="Feedback Google (positions & CTR)"
        subtitle={
          ranking.summary.totalPages > 0
            ? `Jusqu'à +${ranking.summary.totalEstimatedGain} clics/mois si vous corrigez tout`
            : "Connectez Search Console pour activer cette section"
        }
        accent="blue"
        help={`${GLOSSARY.impressions} ${GLOSSARY.ctr} ${GLOSSARY.position}`}
        whatToDo={[
          "Lignes « sous-performantes » = visibles mais pas assez cliquées ou mal positionnées.",
          "Suivez la colonne « Recommandation » — souvent : améliorer le titre ou ajouter des liens.",
          "Les gains estimés en vert = clics supplémentaires possibles par mois.",
        ]}
      >
        {ranking.summary.totalPages === 0 ? (
          <EmptyState
            title="Données Google manquantes"
            description="Allez dans l'onglet Croissance et cliquez « Synchroniser Search Console » pour voir positions, CTR et recommandations."
          />
        ) : (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard
                label="Pages sous-performantes"
                value={ranking.summary.underperforming}
                hint="À optimiser"
                tone="warn"
              />
              <StatCard
                label="Gains rapides"
                value={ranking.summary.quickWins}
                hint="Position 5–15"
                tone="good"
              />
              <StatCard
                label="Pages suivies"
                value={ranking.summary.totalPages}
              />
            </div>

            <DataTable
              headers={[
                "Page",
                "Problème",
                "Impressions",
                "CTR",
                "Position",
                "Clics à gagner",
                "Recommandation",
              ]}
            >
              {ranking.recommendations.slice(0, 15).map((r) => (
                <tr key={r.page} className="hover:bg-navy/[0.02]">
                  <td className="max-w-[120px] truncate px-3 py-2 text-xs">
                    {r.page}
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone="warn">{r.issue}</Badge>
                  </td>
                  <td className="px-3 py-2 tabular-nums">{r.impressions}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {(r.ctr * 100).toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 tabular-nums">{r.position.toFixed(1)}</td>
                  <td className="px-3 py-2 font-semibold text-emerald-600">
                    +{r.estimatedGain}
                  </td>
                  <td className="max-w-[200px] px-3 py-2 text-xs text-slate-dim">
                    {r.recommendation}
                  </td>
                </tr>
              ))}
            </DataTable>

            {ranking.metadataUpdates.length > 0 && (
              <SubSection
                title="Titres suggérés (à copier ou appliquer via Pilote SEO)"
                hint="Ces titres sont optimisés pour améliorer le CTR dans Google."
              >
                <div className="space-y-2">
                  {ranking.metadataUpdates.slice(0, 5).map((m) => (
                    <div
                      key={m.page}
                      className="rounded-lg border border-navy/8 bg-white px-3 py-2 text-xs"
                    >
                      <p className="font-medium text-navy">{m.page}</p>
                      <p className="mt-1 text-slate-dim">
                        Titre suggéré : <strong>{m.suggestedTitle}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              </SubSection>
            )}
          </>
        )}
      </Panel>
    </div>
  );
}
