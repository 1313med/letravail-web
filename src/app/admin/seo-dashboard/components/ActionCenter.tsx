"use client";

import { useState, useTransition } from "react";
import {
  executeSeoAction,
  type SeoActionName,
} from "../actions";
import { Panel } from "./ui";

const ACTIONS: {
  id: SeoActionName;
  label: string;
  description: string;
}[] = [
  {
    id: "recompute-indexation",
    label: "Recompute indexation",
    description: "Invalide les caches ISR des pages listées",
  },
  {
    id: "rebuild-sitemap",
    label: "Rebuild sitemap",
    description: "Régénère sitemap.xml via revalidation",
  },
  {
    id: "recalculate-salary",
    label: "Recalculate salary observations",
    description: "Synchronise SalaryObservation depuis les offres",
  },
  {
    id: "run-risk-scan",
    label: "Run SEO risk scan",
    description: "Analyse les signaux de risque sur toutes les pages",
  },
  {
    id: "validate-jobposting",
    label: "Validate JobPosting schema",
    description: "Vérifie la conformité schema.org des offres actives",
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
      title="Action Center"
      subtitle="Opérations SEO backend — données réelles, pas de mocks"
      accent="purple"
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
            <p className="mt-1 text-xs text-slate-dim">{action.description}</p>
          </button>
        ))}
      </div>

      {lastResult && (
        <div
          className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
            lastResult.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          <span className="font-medium">{lastResult.action}:</span>{" "}
          {lastResult.message}
        </div>
      )}
    </Panel>
  );
}
