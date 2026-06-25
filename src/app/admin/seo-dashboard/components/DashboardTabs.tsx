"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { QuickStartBanner } from "./QuickStartBanner";
import { TABS } from "./dashboard-guide";

type TabId = keyof typeof TABS;

export function DashboardTabs({
  monitor,
  growth,
  intelligence,
  topActionTitle,
  hasGsc,
}: {
  monitor: ReactNode;
  growth: ReactNode;
  intelligence: ReactNode;
  topActionTitle?: string | null;
  hasGsc: boolean;
}) {
  const [tab, setTab] = useState<TabId>("growth");

  const tabs: TabId[] = ["monitor", "growth", "intelligence"];

  return (
    <div>
      <QuickStartBanner
        activeTab={tab}
        onGoToTab={setTab}
        topActionTitle={topActionTitle}
        hasGsc={hasGsc}
      />

      <div className="mb-6 grid gap-2 sm:grid-cols-3">
        {tabs.map((id) => {
          const meta = TABS[id];
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-xl border p-4 text-left transition ${
                active
                  ? "border-navy bg-navy text-white shadow-md"
                  : "border-navy/10 bg-white hover:border-mint/40 hover:shadow-sm"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  active ? "text-white/70" : "text-slate-dim"
                }`}
              >
                {meta.short}
              </p>
              <p className={`mt-1 text-base font-bold ${active ? "text-white" : "text-navy"}`}>
                {meta.label}
              </p>
              <p
                className={`mt-1.5 text-xs leading-relaxed ${
                  active ? "text-white/80" : "text-slate-dim"
                }`}
              >
                {meta.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mb-5 rounded-lg border border-navy/8 bg-[#FAFBFC] px-4 py-3">
        <p className="text-xs font-semibold text-navy">Dans cet onglet :</p>
        <ol className="mt-1.5 list-inside list-decimal space-y-0.5 text-xs text-slate-dim">
          {TABS[tab].steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      {tab === "monitor" && monitor}
      {tab === "growth" && growth}
      {tab === "intelligence" && intelligence}
    </div>
  );
}
