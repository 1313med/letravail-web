"use client";

import { useState, useTransition } from "react";
import { executeSeoAction, type SeoActionName } from "../actions";
import { Panel, ResultToast } from "./ui";

const ACTIONS: {
  id: SeoActionName;
  label: string;
  description: string;
  when: string;
}[] = [
  {
    id: "recompute-indexation",
    label: "Recalculer l'indexation",
    description: "Met à jour quelles pages peuvent apparaître sur Google.",
    when: "Après avoir ajouté ou retiré beaucoup d'offres.",
  },
  {
    id: "rebuild-sitemap",
    label: "Regénérer le sitemap",
    description: "Informe Google de toutes les pages du site.",
    when: "Une fois par semaine ou après création de pages.",
  },
  {
    id: "recalculate-salary",
    label: "Recalculer les salaires",
    description: "Met à jour les stats salariales depuis les offres.",
    when: "Après import d'offres avec fourchettes salariales.",
  },
  {
    id: "run-risk-scan",
    label: "Scanner les risques SEO",
    description: "Détecte pages faibles, schema manquant, pages orphelines.",
    when: "Pour un bilan santé complet du site.",
  },
  {
    id: "validate-jobposting",
    label: "Vérifier Google for Jobs",
    description: "Contrôle que les offres respectent le format JobPosting.",
    when: "Si les offres n'apparaissent pas bien dans Google Jobs.",
  },
];

export function ActionCenter() {
  const [pending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<{
    action: string;
    ok: boolean;
    message: string;
  } | null>(null);

  function runAction(action: SeoActionName, label: string) {
    startTransition(async () => {
      const result = await executeSeoAction(action);
      setLastResult({ action: label, ...result });
    });
  }

  return (
    <Panel
      title="Actions de maintenance"
      subtitle="Opérations techniques pour garder le site sain — utilisez-les quand l'onglet Surveillance signale un problème"
      accent="purple"
      help="Ces boutons ne créent pas de contenu marketing : ils recalculent et corrigent la structure technique du site à partir de vos données réelles."
      whatToDo={[
        "Si des pages sont « noindex » par erreur → « Recalculer l'indexation ».",
        "Si Google ne voit pas vos nouvelles pages → « Regénérer le sitemap ».",
        "Pour un diagnostic global → « Scanner les risques SEO ».",
      ]}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={pending}
            onClick={() => runAction(action.id, action.label)}
            className="rounded-xl border border-navy/10 bg-[#FAFBFC] px-4 py-3 text-left transition hover:border-mint/40 hover:bg-white disabled:opacity-50"
          >
            <p className="text-sm font-semibold text-navy">{action.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-dim">
              {action.description}
            </p>
            <p className="mt-2 text-xs font-medium text-mint-dim">Quand ? {action.when}</p>
          </button>
        ))}
      </div>

      {lastResult && (
        <div className="mt-4">
          <ResultToast
            ok={lastResult.ok}
            message={`${lastResult.action} : ${lastResult.message}`}
          />
        </div>
      )}
    </Panel>
  );
}
