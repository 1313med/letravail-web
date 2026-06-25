import { getSiteUrl, SITEMAP_JOBS_PER_PAGE } from "./constants";
import {
  getAllJobSlugs,
  getIndexableCitySlugs,
  getIndexableCompanySlugs,
  getIndexableLandingSlugs,
  getIndexableSalarySlugs,
} from "./queries";
import { getIndexableProfessionSlugs } from "./knowledge-graph";

export type SitemapUrl = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
};

export function buildSitemapXml(urls: SitemapUrl[]): string {
  const entries = urls
    .map((u) => {
      const parts = [`    <url>`, `      <loc>${escapeXml(u.loc)}</loc>`];
      if (u.lastmod) parts.push(`      <lastmod>${u.lastmod}</lastmod>`);
      if (u.changefreq) parts.push(`      <changefreq>${u.changefreq}</changefreq>`);
      if (u.priority !== undefined)
        parts.push(`      <priority>${u.priority.toFixed(1)}</priority>`);
      parts.push(`    </url>`);
      return parts.join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

export function buildSitemapIndexXml(sitemaps: { loc: string; lastmod?: string }[]): string {
  const entries = sitemaps
    .map((s) => {
      const parts = [`    <sitemap>`, `      <loc>${escapeXml(s.loc)}</loc>`];
      if (s.lastmod) parts.push(`      <lastmod>${s.lastmod}</lastmod>`);
      parts.push(`    </sitemap>`);
      return parts.join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isoDate(d: Date = new Date()): string {
  return d.toISOString().split("T")[0];
}

export async function buildSitemapIndex(): Promise<string> {
  const siteUrl = getSiteUrl();
  const now = isoDate();
  const jobs = await getAllJobSlugs(100000);
  const jobPages = Math.max(1, Math.ceil(jobs.length / SITEMAP_JOBS_PER_PAGE));

  const sitemaps = [
    { loc: `${siteUrl}/sitemaps/static`, lastmod: now },
    { loc: `${siteUrl}/sitemaps/cities`, lastmod: now },
    { loc: `${siteUrl}/sitemaps/companies`, lastmod: now },
    { loc: `${siteUrl}/sitemaps/landings`, lastmod: now },
    { loc: `${siteUrl}/sitemaps/professions`, lastmod: now },
    { loc: `${siteUrl}/sitemaps/salaries`, lastmod: now },
    ...Array.from({ length: jobPages }, (_, i) => ({
      loc: `${siteUrl}/sitemaps/jobs/${i + 1}`,
      lastmod: now,
    })),
  ];

  return buildSitemapIndexXml(sitemaps);
}

export async function buildStaticSitemap(): Promise<string> {
  const siteUrl = getSiteUrl();
  const now = isoDate();
  const urls: SitemapUrl[] = [
    { loc: siteUrl, lastmod: now, changefreq: "hourly", priority: 1 },
    { loc: `${siteUrl}/emplois`, lastmod: now, changefreq: "hourly", priority: 0.9 },
    { loc: `${siteUrl}/salaires`, lastmod: now, changefreq: "weekly", priority: 0.85 },
    { loc: `${siteUrl}/recruteurs`, lastmod: now, changefreq: "monthly", priority: 0.7 },
    { loc: `${siteUrl}/a-propos`, lastmod: now, changefreq: "monthly", priority: 0.5 },
  ];
  return buildSitemapXml(urls);
}

export async function buildCitiesSitemap(): Promise<string> {
  const siteUrl = getSiteUrl();
  const cities = await getIndexableCitySlugs();
  return buildSitemapXml(
    cities.map((slug) => ({
      loc: `${siteUrl}/emplois/${slug}`,
      lastmod: isoDate(),
      changefreq: "daily",
      priority: 0.85,
    }))
  );
}

export async function buildCompaniesSitemap(): Promise<string> {
  const siteUrl = getSiteUrl();
  const companies = await getIndexableCompanySlugs();
  return buildSitemapXml(
    companies.map((slug) => ({
      loc: `${siteUrl}/entreprise/${slug}`,
      lastmod: isoDate(),
      changefreq: "daily",
      priority: 0.7,
    }))
  );
}

export async function buildLandingsSitemap(): Promise<string> {
  const siteUrl = getSiteUrl();
  const landings = await getIndexableLandingSlugs();
  return buildSitemapXml(
    landings.map((l) => ({
      loc: `${siteUrl}/${l.slug}`,
      lastmod: isoDate(l.updatedAt),
      changefreq: "daily",
      priority: 0.88,
    }))
  );
}

export async function buildProfessionsSitemap(): Promise<string> {
  const siteUrl = getSiteUrl();
  const professions = await getIndexableProfessionSlugs();
  return buildSitemapXml(
    professions.map((p) => ({
      loc: `${siteUrl}/${p.slug}`,
      lastmod: isoDate(),
      changefreq: "daily",
      priority: 0.9,
    }))
  );
}

export async function buildSalariesSitemap(): Promise<string> {
  const siteUrl = getSiteUrl();
  const salaries = await getIndexableSalarySlugs();
  return buildSitemapXml(
    salaries.map((slug) => ({
      loc: `${siteUrl}/${slug}`,
      lastmod: isoDate(),
      changefreq: "weekly",
      priority: 0.8,
    }))
  );
}

export async function buildJobsSitemapPage(page: number): Promise<string | null> {
  const siteUrl = getSiteUrl();
  const allJobs = await getAllJobSlugs(100000);
  const start = (page - 1) * SITEMAP_JOBS_PER_PAGE;
  if (start >= allJobs.length) return null;

  const slice = allJobs.slice(start, start + SITEMAP_JOBS_PER_PAGE);
  return buildSitemapXml(
    slice.map((job) => ({
      loc: `${siteUrl}/emploi/${job.slug}`,
      lastmod: isoDate(job.updatedAt),
      changefreq: "daily",
      priority: 0.8,
    }))
  );
}

/** Legacy single sitemap for backward compatibility */
export async function buildLegacySitemapUrls() {
  const siteUrl = getSiteUrl();
  const [jobs, cities, companies, landings, salaries, professions] = await Promise.all([
    getAllJobSlugs(50000),
    getIndexableCitySlugs(),
    getIndexableCompanySlugs(),
    getIndexableLandingSlugs(),
    getIndexableSalarySlugs(),
    getIndexableProfessionSlugs(),
  ]);

  return [
    ...[
      { url: siteUrl, priority: 1 },
      { url: `${siteUrl}/emplois`, priority: 0.9 },
      { url: `${siteUrl}/salaires`, priority: 0.85 },
    ],
    ...professions.map((p) => ({ url: `${siteUrl}/${p.slug}`, priority: 0.9 })),
    ...landings.map((l) => ({ url: `${siteUrl}/${l.slug}`, priority: 0.88 })),
    ...salaries.map((s) => ({ url: `${siteUrl}/${s}`, priority: 0.8 })),
    ...cities.map((s) => ({ url: `${siteUrl}/emplois/${s}`, priority: 0.85 })),
    ...companies.map((s) => ({ url: `${siteUrl}/entreprise/${s}`, priority: 0.7 })),
    ...jobs.map((j) => ({ url: `${siteUrl}/emploi/${j.slug}`, priority: 0.8 })),
  ];
}
