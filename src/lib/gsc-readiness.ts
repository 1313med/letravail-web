import { isGscConfigured } from "./seo-engine/gsc-engine";
import { getSiteUrl } from "./constants";

export type GscReadinessCheck = {
  id: string;
  label: string;
  status: "ready" | "partial" | "missing";
  detail: string;
};

export function getGscReadinessReport(): {
  ready: boolean;
  checks: GscReadinessCheck[];
  integrationPoints: {
    sitemapIndex: string;
    gscSyncApi: string;
    gscIngestApi: string;
    schemaValidation: string;
    robotsTxt: string;
  };
} {
  const siteUrl = getSiteUrl();
  const gscConfigured = isGscConfigured();

  const checks: GscReadinessCheck[] = [
    {
      id: "sitemap-index",
      label: "Sitemap index (multi-sitemap)",
      status: "ready",
      detail: `${siteUrl}/sitemap.xml — index vers sitemaps segmentés`,
    },
    {
      id: "robots",
      label: "robots.txt",
      status: "ready",
      detail: `${siteUrl}/robots.txt — référence sitemap.xml`,
    },
    {
      id: "gsc-credentials",
      label: "Credentials GSC (service account)",
      status: gscConfigured ? "ready" : "missing",
      detail: gscConfigured
        ? "GSC_SERVICE_ACCOUNT_EMAIL + GSC_PRIVATE_KEY configurés"
        : "Configurer GSC_SERVICE_ACCOUNT_EMAIL, GSC_PRIVATE_KEY, GSC_SITE_URL",
    },
    {
      id: "gsc-sync",
      label: "GSC sync API",
      status: gscConfigured ? "ready" : "partial",
      detail: `${siteUrl}/api/admin/gsc — ingestion métriques Search Console`,
    },
    {
      id: "schema-monitoring",
      label: "JobPosting schema monitoring",
      status: "ready",
      detail: "google-jobs-compliance.ts + validateJobPostingSchema action",
    },
    {
      id: "indexation-rules",
      label: "Indexation thresholds",
      status: "ready",
      detail: "Cities ≥5, Landings/Professions ≥3, Salaries ≥5 observations",
    },
    {
      id: "canonical-rules",
      label: "Canonical + noindex filter URLs",
      status: "ready",
      detail: "Filter params (?q=, ?city=) → noindex + canonical hub",
    },
    {
      id: "salary-apis",
      label: "Salary intelligence APIs",
      status: "ready",
      detail: "/api/salary/* — données observations Maroc uniquement",
    },
  ];

  const ready = checks.every((c) => c.status === "ready");

  return {
    ready,
    checks,
    integrationPoints: {
      sitemapIndex: `${siteUrl}/sitemap.xml`,
      gscSyncApi: `${siteUrl}/api/admin/gsc`,
      gscIngestApi: `${siteUrl}/api/admin/gsc`,
      schemaValidation: "validateJobPostingSchema (admin SEO actions)",
      robotsTxt: `${siteUrl}/robots.txt`,
    },
  };
}
