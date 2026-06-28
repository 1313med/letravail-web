"use client";

import { useState } from "react";
import Link from "next/link";
import { AtsEmployerDrawer } from "@/components/intelligence/AtsEmployerDrawer";
import {
  IntelActivationBadge,
  IntelAtsBadge,
  IntelBadge,
  IntelHealthBadge,
  IntelPriorityBadge,
  IntelValidationBadge,
} from "@/components/intelligence/ui";
import { formatPercent, formatRelativeTime, formatScore } from "@/lib/intelligence/formatters";
import type { AtsRow } from "@/lib/intelligence/types";

export function AtsIntelligenceClient({
  items,
  page,
  totalPages,
  platformParam,
}: {
  items: AtsRow[];
  page: number;
  totalPages: number;
  platformParam?: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy/8 text-xs uppercase tracking-wide text-slate-dim">
              {[
                "Employer",
                "ATS",
                "Confidence",
                "Strategy",
                "Activation",
                "Health",
                "Validation",
                "Auto",
                "Retry",
                "Next Retry",
                "API",
                "Playwright",
                "Status",
                "Last Probe",
                "Priority",
              ].map((h) => (
                <th key={h} className="px-3 py-2.5 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/6">
            {items.map((row) => (
              <tr
                key={row.id}
                className="cursor-pointer hover:bg-[#FAFBFC]"
                onClick={() => setSelectedId(row.id)}
              >
                <td className="px-3 py-3">
                  <p className="font-medium text-navy">{row.companyName}</p>
                  {row.sourceName && (
                    <p className="text-xs text-slate-dim">{row.sourceName}</p>
                  )}
                </td>
                <td className="px-3 py-3 text-slate-dim">
                  <IntelAtsBadge platform={row.atsPlatform} />
                </td>
                <td className="px-3 py-3 tabular-nums text-navy">
                  {formatPercent(row.confidence * 100)}
                </td>
                <td className="px-3 py-3 text-xs text-slate-dim">{row.crawlStrategy}</td>
                <td className="px-3 py-3">
                  <IntelActivationBadge state={row.activationState} />
                </td>
                <td className="px-3 py-3">
                  <IntelHealthBadge score={row.healthScore} />
                </td>
                <td className="px-3 py-3">
                  <IntelValidationBadge score={row.validationScore} />
                </td>
                <td className="px-3 py-3">
                  <IntelBadge tone={row.automaticActivation ? "good" : "neutral"}>
                    {row.automaticActivation ? "Yes" : "No"}
                  </IntelBadge>
                </td>
                <td className="px-3 py-3 tabular-nums text-slate-dim">{row.retryCount}</td>
                <td className="px-3 py-3 text-slate-dim">
                  {formatRelativeTime(row.nextRetryAt)}
                </td>
                <td className="px-3 py-3 tabular-nums text-slate-dim">
                  {row.apiEndpoints.length}
                </td>
                <td className="px-3 py-3">
                  <IntelBadge tone={row.jsRenderingRequired ? "warn" : "good"}>
                    {row.jsRenderingRequired ? "Yes" : "No"}
                  </IntelBadge>
                </td>
                <td className="px-3 py-3 text-xs text-slate-dim">{row.onboardingStatus}</td>
                <td className="px-3 py-3 text-slate-dim">{formatRelativeTime(row.probedAt)}</td>
                <td className="px-3 py-3">
                  <IntelPriorityBadge score={row.priority} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/intelligence/ats?page=${p}${
                platformParam ? `&platform=${encodeURIComponent(platformParam)}` : ""
              }`}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                p === page
                  ? "bg-navy text-white font-semibold"
                  : "bg-navy/5 text-slate-dim hover:text-navy"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}

      <AtsEmployerDrawer employerId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}
