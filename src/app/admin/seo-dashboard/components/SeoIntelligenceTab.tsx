"use client";

import type { SeoIntelligenceBundle } from "@/lib/seo-engine/types";
import { Badge, DataTable, Panel, StatCard } from "./ui";

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
          title="SERP Intelligence Layer"
          subtitle={serpLayer.dataNote}
          accent="purple"
        >
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Records stockés"
              value={serpLayer.storedRecords}
            />
            <StatCard
              label="Prêt SERP réel"
              value={serpLayer.readyForRealSerp ? "Oui" : "Non"}
              tone={serpLayer.readyForRealSerp ? "good" : "warn"}
            />
          </div>
          <DataTable headers={["Provider", "Configuré", "Records", "Dernière sync"]}>
            {serpLayer.providers.map((p) => (
              <tr key={p.id} className="hover:bg-navy/[0.02]">
                <td className="px-3 py-2 font-medium">{p.name}</td>
                <td className="px-3 py-2">
                  <Badge tone={p.configured ? "good" : "warn"}>
                    {p.configured ? "Oui" : "Non"}
                  </Badge>
                </td>
                <td className="px-3 py-2 tabular-nums">{p.recordCount}</td>
                <td className="px-3 py-2 text-xs text-slate-dim">
                  {p.lastSyncAt ? new Date(p.lastSyncAt).toLocaleDateString("fr-FR") : "—"}
                </td>
              </tr>
            ))}
          </DataTable>
          <p className="mt-3 text-xs text-slate-dim">
            Capacités futures : keyword gap, SERP ownership, rankings concurrents, attack opportunities — débloquées à la connexion d&apos;un provider.
          </p>
        </Panel>
      )}

      <Panel
        title="Keyword Opportunities"
        subtitle={`${keywords.summary.totalKeywords} mots-clés — ${keywords.summary.unmapped} sans page mappée`}
        accent="green"
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Mappés" value={keywords.summary.mapped} tone="good" />
          <StatCard label="Non mappés" value={keywords.summary.unmapped} tone="warn" />
          <StatCard label="High opportunity" value={keywords.summary.highOpportunity} />
          <StatCard label="Pages index" value={keywords.pageIndexCount} />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {keywords.clusters.map((c) => (
            <span
              key={c.intent}
              className="rounded-lg bg-navy/5 px-3 py-1.5 text-xs font-medium text-navy"
            >
              {INTENT_LABELS[c.intent]}: {c.count} ({c.unmapped} unmapped)
            </span>
          ))}
        </div>

        <DataTable
          headers={[
            "Mot-clé",
            "Intent",
            "Page",
            "Score",
            "Pos.",
            "Action",
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
                {kw.mappedPage ?? "—"}
              </td>
              <td className="px-3 py-2 tabular-nums font-semibold">
                {kw.opportunityScore}
              </td>
              <td className="px-3 py-2 tabular-nums text-xs">
                {kw.position > 0 ? kw.position.toFixed(1) : "—"}
              </td>
              <td className="max-w-[180px] truncate px-3 py-2 text-xs text-slate-dim">
                {kw.recommendedAction}
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <Panel
        title="Competitor Gaps"
        subtitle={competitors.dataNote}
        accent="red"
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total gaps" value={competitors.summary.totalGaps} />
          <StatCard label="HIGH" value={competitors.summary.highPriority} tone="bad" />
          <StatCard label="Pages manquantes" value={competitors.summary.missingPages} tone="warn" />
          <StatCard label="Ranking loss" value={competitors.summary.rankingLosses} />
        </div>

        <h3 className="mb-2 text-sm font-semibold">Structure gaps</h3>
        <div className="mb-4 space-y-2">
          {competitors.structureGaps.map((g) => (
            <div
              key={g.pageType}
              className="rounded-lg border border-navy/8 bg-[#FAFBFC] px-3 py-2 text-sm"
            >
              <Badge tone={g.priority === "HIGH" ? "bad" : "warn"}>
                {g.pageType}
              </Badge>
              <span className="ml-2 text-slate-dim">{g.gapDescription}</span>
            </div>
          ))}
        </div>

        <DataTable
          headers={[
            "Mot-clé",
            "Concurrent",
            "Notre pos.",
            "Type",
            "Classe",
            "Priorité",
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
                  {g.serpClass}
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
                  {g.priority}
                </Badge>
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <Panel
        title="Content Suggestions"
        subtitle="Blocs SEO générés depuis jobs + salary_observations — zéro hallucination"
        accent="yellow"
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {content.availablePages.map((p) => (
            <span
              key={p.pageType}
              className="rounded-lg bg-navy/5 px-3 py-1.5 text-xs font-medium"
            >
              {p.pageType}: {p.count} pages
            </span>
          ))}
        </div>

        {content.samples.map((sample) => (
          <div
            key={sample.pagePath}
            className="mb-4 rounded-xl border border-navy/8 bg-[#FAFBFC] p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{sample.pageType}</Badge>
              <span className="font-semibold text-navy">{sample.label}</span>
              <span className="text-xs text-slate-dim">{sample.pagePath}</span>
            </div>
            <p className="mt-1 text-xs text-slate-dim">
              Source: {sample.dataSource}
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
                  <pre className="mt-1 max-h-24 overflow-auto text-[10px] text-slate-dim">
                    {JSON.stringify(block.data, null, 0).slice(0, 200)}…
                  </pre>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Panel>

      <Panel
        title="Ranking Feedback"
        subtitle={
          ranking.summary.totalPages > 0
            ? `Gain estimé total: +${ranking.summary.totalEstimatedGain} clics`
            : "Synchronisez GSC pour activer le feedback loop"
        }
        accent="blue"
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            label="Underperforming"
            value={ranking.summary.underperforming}
            tone="warn"
          />
          <StatCard
            label="Quick wins (pos 5–15)"
            value={ranking.summary.quickWins}
            tone="good"
          />
          <StatCard
            label="Pages GSC"
            value={ranking.summary.totalPages}
          />
        </div>

        <DataTable
          headers={[
            "Page",
            "Issue",
            "Impressions",
            "CTR",
            "Pos.",
            "Gain est.",
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
              <td className="px-3 py-2 tabular-nums text-emerald-600">
                +{r.estimatedGain}
              </td>
              <td className="max-w-[200px] truncate px-3 py-2 text-xs text-slate-dim">
                {r.recommendation}
              </td>
            </tr>
          ))}
        </DataTable>

        {ranking.metadataUpdates.length > 0 && (
          <>
            <h3 className="mb-2 mt-5 text-sm font-semibold">
              Metadata suggestions (seo.ts)
            </h3>
            <div className="space-y-2">
              {ranking.metadataUpdates.slice(0, 5).map((m) => (
                <div
                  key={m.page}
                  className="rounded-lg border border-navy/8 px-3 py-2 text-xs"
                >
                  <p className="font-medium text-navy">{m.page}</p>
                  <p className="text-slate-dim">Title: {m.suggestedTitle}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
