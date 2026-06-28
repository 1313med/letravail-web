"use client";

import { useState } from "react";
import {
  IntelBadge,
  IntelPanel,
  IntelPrimaryButton,
  IntelSearchInput,
} from "@/components/intelligence/ui";
import { formatPercent } from "@/lib/intelligence/formatters";

type ProbeResult = {
  id: string;
  companyName: string;
  inputUrl: string;
  careersPageUrl: string | null;
  atsPlatform: string;
  confidence: number;
  crawlStrategy: string;
  apiEndpoints: string[];
  robotsAllowed: boolean;
  sitemapUrls: string[];
  authRequired: boolean;
  paginationType: string | null;
  jsRenderingRequired: boolean;
  estimatedJobVolume: string | null;
  onboardingStatus: string;
  issues: string[];
};

export function DiscoveryProbeForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProbeResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function handleProbe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setNotFound(false);

    try {
      const res = await fetch("/api/admin/intelligence/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.found) {
        setResult(data.record);
      } else {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <IntelPanel title="Probe Employer URL" accent="blue">
        <form onSubmit={handleProbe} className="flex flex-wrap gap-3">
          <IntelSearchInput
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://careers.example.ma"
            required
          />
          <IntelPrimaryButton type="submit" disabled={loading}>
            {loading ? "Probing..." : "Probe"}
          </IntelPrimaryButton>
        </form>
        <p className="mt-2 text-xs text-slate-dim">
          Reads from employer_ats_intelligence — no scraping executed from this dashboard.
        </p>
      </IntelPanel>

      {notFound && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No intelligence record found for this URL. Run the scraper probe pipeline first.
        </div>
      )}

      {result && (
        <div className="grid gap-6 xl:grid-cols-2">
          <IntelPanel title={result.companyName} accent="green">
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ["Detected ATS", result.atsPlatform],
                ["Confidence", formatPercent(result.confidence * 100)],
                ["Strategy", result.crawlStrategy],
                ["Estimated Jobs", result.estimatedJobVolume ?? "—"],
                ["Status", result.onboardingStatus],
                ["Pagination", result.paginationType ?? "—"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-dim">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-navy">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <IntelBadge tone={result.robotsAllowed ? "good" : "bad"}>
                Robots {result.robotsAllowed ? "OK" : "Blocked"}
              </IntelBadge>
              <IntelBadge tone={result.jsRenderingRequired ? "warn" : "good"}>
                {result.jsRenderingRequired ? "Playwright" : "Static"}
              </IntelBadge>
              <IntelBadge tone={result.authRequired ? "warn" : "good"}>
                {result.authRequired ? "Auth Required" : "Public"}
              </IntelBadge>
              <IntelBadge tone={result.onboardingStatus === "ready" ? "good" : "warn"}>
                {result.onboardingStatus === "ready" ? "Ready to Add" : result.onboardingStatus}
              </IntelBadge>
            </div>
          </IntelPanel>

          <IntelPanel title="Endpoints" accent="purple">
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium text-slate-dim">API Endpoints</p>
                {result.apiEndpoints.length > 0 ? (
                  <ul className="mt-1 space-y-1">
                    {result.apiEndpoints.map((ep) => (
                      <li key={ep} className="break-all font-mono text-xs text-mint-dim">
                        {ep}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-dim">None detected</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-dim">Sitemaps</p>
                {result.sitemapUrls.length > 0 ? (
                  <ul className="mt-1 space-y-1">
                    {result.sitemapUrls.map((s) => (
                      <li key={s} className="break-all text-xs text-slate-dim">
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-dim">None found</p>
                )}
              </div>
            </div>
          </IntelPanel>

          {result.issues.length > 0 && (
            <IntelPanel title="Issues" accent="red" className="xl:col-span-2">
              <ul className="space-y-2">
                {result.issues.map((issue) => (
                  <li
                    key={issue}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
                  >
                    {issue}
                  </li>
                ))}
              </ul>
            </IntelPanel>
          )}
        </div>
      )}
    </div>
  );
}
