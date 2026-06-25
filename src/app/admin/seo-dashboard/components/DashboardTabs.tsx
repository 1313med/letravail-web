"use client";

import { useState } from "react";
import type { ReactNode } from "react";

type TabId = "monitor" | "growth" | "intelligence";

export function DashboardTabs({
  monitor,
  growth,
  intelligence,
}: {
  monitor: ReactNode;
  growth: ReactNode;
  intelligence: ReactNode;
}) {
  const [tab, setTab] = useState<TabId>("monitor");

  const tabs: { id: TabId; label: string }[] = [
    { id: "monitor", label: "Monitor" },
    { id: "growth", label: "Growth Engine" },
    { id: "intelligence", label: "SEO Intelligence" },
  ];

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-xl border border-navy/10 bg-white p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition sm:px-4 ${
              tab === t.id
                ? "bg-navy text-white shadow-sm"
                : "text-slate-dim hover:text-navy"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "monitor" && monitor}
      {tab === "growth" && growth}
      {tab === "intelligence" && intelligence}
    </div>
  );
}
