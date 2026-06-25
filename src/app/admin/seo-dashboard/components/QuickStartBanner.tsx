"use client";

import { useState } from "react";
import { TABS } from "./dashboard-guide";

type TabId = keyof typeof TABS;

export function QuickStartBanner({
  activeTab,
  onGoToTab,
  topActionTitle,
  hasGsc,
}: {
  activeTab: TabId;
  onGoToTab: (tab: TabId) => void;
  topActionTitle?: string | null;
  hasGsc: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="mb-6 flex w-full items-center gap-2 rounded-xl border border-mint/30 bg-mint/5 px-4 py-2.5 text-left text-sm text-navy hover:bg-mint/10"
      >
        <span aria-hidden>💡</span>
        <span className="font-medium">Afficher le guide débutant</span>
      </button>
    );
  }

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-mint/25 bg-gradient-to-br from-mint/8 via-white to-navy/[0.03] shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-mint/15 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-mint-dim">
            Par où commencer ?
          </p>
          <h2 className="mt-0.5 text-lg font-bold text-navy">
            Guide rapide — 3 étapes pour utiliser ce dashboard
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="rounded-lg px-2 py-1 text-xs text-slate-dim hover:bg-navy/5"
        >
          Masquer
        </button>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-3">
        <StepCard
          step={1}
          title="Comprendre l'état du site"
          body="Onglet Surveillance : indexation, risques, qualité des pages."
          cta="Voir Surveillance"
          active={activeTab === "monitor"}
          onClick={() => onGoToTab("monitor")}
        />
        <StepCard
          step={2}
          title="Exécuter la priorité #1"
          body={
            topActionTitle
              ? `Action recommandée : « ${topActionTitle.slice(0, 50)}${topActionTitle.length > 50 ? "…" : ""} »`
              : "Onglet Croissance : le Orchestrateur choisit la meilleure action pour vous."
          }
          cta="Aller à Croissance"
          active={activeTab === "growth"}
          onClick={() => onGoToTab("growth")}
          highlight
        />
        <StepCard
          step={3}
          title="Analyser mots-clés & marché"
          body="Onglet Intelligence : requêtes Google, tendances recrutement, concurrence."
          cta="Voir Intelligence"
          active={activeTab === "intelligence"}
          onClick={() => onGoToTab("intelligence")}
        />
      </div>

      {!hasGsc && (
        <div className="mx-5 mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Conseil :</strong> connectez Google Search Console (onglet Croissance → «
          Synchroniser Search Console ») pour débloquer CTR, positions et gains estimés en
          clics réels.
        </div>
      )}
    </div>
  );
}

function StepCard({
  step,
  title,
  body,
  cta,
  active,
  onClick,
  highlight,
}: {
  step: number;
  title: string;
  body: string;
  cta: string;
  active: boolean;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-mint/40 bg-white shadow-sm ring-1 ring-mint/20"
          : "border-navy/8 bg-white/80"
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
            active ? "bg-navy text-white" : "bg-navy/10 text-navy"
          }`}
        >
          {step}
        </span>
        <h3 className="text-sm font-semibold text-navy">{title}</h3>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-slate-dim">{body}</p>
      <button
        type="button"
        onClick={onClick}
        className={`text-xs font-semibold ${
          active ? "text-mint-dim" : "text-navy hover:underline"
        }`}
      >
        {cta} →
      </button>
    </div>
  );
}
