"use client";

import { useCallback, useEffect, useState } from "react";
import { IntelActivationBadge, IntelBadge, IntelPanel } from "@/components/intelligence/ui";
import {
  formatDateTime,
  formatDuration,
  formatPercent,
  formatRelativeTime,
  formatScore,
} from "@/lib/intelligence/formatters";

type HistoryEvent = {
  at: string;
  type: string;
  label: string;
  detail?: string;
  score?: number | null;
};

type OperationalDetail = {
  companyName: string;
  atsPlatform: string;
  confidence: number;
  crawlStrategy: string;
  apiEndpoints: string[];
  jsRenderingRequired: boolean;
  apiStatus: string;
  healthScore: number | null;
  validationScore: number | null;
  activationState: string | null;
  activationReason: string | null;
  deactivationReason: string | null;
  automaticActivation: boolean;
  retryCount: number;
  nextRetryAt: string | null;
  recentCrawls: {
    id: string;
    status: string;
    startedAt: string;
    durationMs: number | null;
    jobsFound: number;
  }[];
  histories: {
    healthHistory: HistoryEvent[];
    validationHistory: HistoryEvent[];
    retryHistory: HistoryEvent[];
    activationHistory: HistoryEvent[];
  };
};

function HistoryList({ events, empty }: { events: HistoryEvent[]; empty: string }) {
  if (events.length === 0) {
    return <p className="text-sm text-slate-dim">{empty}</p>;
  }
  return (
    <ul className="space-y-2">
      {events.map((e, i) => (
        <li key={`${e.at}-${i}`} className="rounded-lg border border-navy/8 px-3 py-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-navy">{e.label}</p>
            <p className="text-xs text-slate-dim">{formatRelativeTime(e.at)}</p>
          </div>
          {e.detail && <p className="mt-1 text-xs text-slate-dim">{e.detail}</p>}
          {e.score != null && (
            <p className="mt-1 text-xs text-mint-dim">Score: {formatScore(e.score)}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

export function AtsEmployerDrawer({
  employerId,
  onClose,
}: {
  employerId: string | null;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<OperationalDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/intelligence/ats/${id}`);
      if (res.ok) setDetail(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (employerId) load(employerId);
    else setDetail(null);
  }, [employerId, load]);

  if (!employerId) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-navy/20 backdrop-blur-[1px]" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-navy/10 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-navy/8 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-mint-dim">Employer Detail</p>
            <h2 className="text-lg font-semibold text-navy">
              {detail?.companyName ?? (loading ? "Loading…" : "—")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-navy/10 px-3 py-1.5 text-sm text-slate-dim hover:bg-navy/5"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading && !detail && (
            <p className="text-sm text-slate-dim">Loading employer intelligence…</p>
          )}

          {detail && (
            <>
              <div className="flex flex-wrap gap-2">
                <IntelActivationBadge state={detail.activationState} />
                <IntelBadge tone={detail.apiStatus === "detected" ? "good" : "warn"}>
                  API {detail.apiStatus}
                </IntelBadge>
                <IntelBadge tone={detail.jsRenderingRequired ? "warn" : "good"}>
                  {detail.jsRenderingRequired ? "Playwright required" : "Static HTML"}
                </IntelBadge>
                <IntelBadge tone={detail.automaticActivation ? "good" : "neutral"}>
                  {detail.automaticActivation ? "Auto activation" : "Manual"}
                </IntelBadge>
              </div>

              <IntelPanel title="Detection">
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                  {[
                    ["ATS", detail.atsPlatform],
                    ["Confidence", formatPercent(detail.confidence * 100)],
                    ["Strategy", detail.crawlStrategy],
                    ["Health", formatScore(detail.healthScore)],
                    ["Validation", formatScore(detail.validationScore)],
                    ["Retries", String(detail.retryCount)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-slate-dim">{k}</dt>
                      <dd className="font-medium text-navy">{v}</dd>
                    </div>
                  ))}
                </dl>
              </IntelPanel>

              <IntelPanel title="Endpoints">
                {detail.apiEndpoints.length > 0 ? (
                  <ul className="space-y-1">
                    {detail.apiEndpoints.map((ep) => (
                      <li key={ep} className="break-all font-mono text-xs text-mint-dim">
                        {ep}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-dim">No API endpoints — HTML strategy</p>
                )}
              </IntelPanel>

              {detail.recentCrawls.length > 0 && (
                <IntelPanel title="Recent Crawls">
                  <ul className="space-y-2 text-sm">
                    {detail.recentCrawls.map((c) => (
                      <li key={c.id} className="flex justify-between rounded-lg border border-navy/8 px-3 py-2">
                        <IntelBadge tone={c.status === "success" ? "good" : "bad"}>{c.status}</IntelBadge>
                        <span className="text-xs text-slate-dim">
                          {formatRelativeTime(c.startedAt)} · {formatDuration(c.durationMs)} · {c.jobsFound} jobs
                        </span>
                      </li>
                    ))}
                  </ul>
                </IntelPanel>
              )}

              <IntelPanel title="Health History">
                <HistoryList events={detail.histories.healthHistory} empty="No health events recorded" />
              </IntelPanel>

              <IntelPanel title="Validation History">
                <HistoryList events={detail.histories.validationHistory} empty="Not validated yet" />
              </IntelPanel>

              <IntelPanel title="Retry History">
                <HistoryList events={detail.histories.retryHistory} empty="No retries scheduled" />
                {detail.nextRetryAt && (
                  <p className="mt-2 text-xs text-amber-700">
                    Next retry: {formatDateTime(detail.nextRetryAt)}
                  </p>
                )}
              </IntelPanel>

              <IntelPanel title="Activation History">
                <HistoryList events={detail.histories.activationHistory} empty="No activation events" />
                {detail.activationReason && (
                  <p className="mt-2 text-xs text-slate-dim">Reason: {detail.activationReason}</p>
                )}
                {detail.deactivationReason && (
                  <p className="mt-2 text-xs text-red-700">Deactivated: {detail.deactivationReason}</p>
                )}
              </IntelPanel>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
