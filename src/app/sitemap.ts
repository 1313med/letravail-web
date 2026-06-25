import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/constants";
import {
  getAllJobSlugs,
  getIndexableCitySlugs,
  getIndexableCompanySlugs,
  getIndexableLandingSlugs,
  getIndexableSalarySlugs,
} from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const [jobs, cities, companies, landings, salaries] = await Promise.all([
    getAllJobSlugs(50000),
    getIndexableCitySlugs(),
    getIndexableCompanySlugs(),
    getIndexableLandingSlugs(),
    getIndexableSalarySlugs(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${siteUrl}/emplois`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${siteUrl}/salaires`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${siteUrl}/recruteurs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/a-propos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const salaryPages: MetadataRoute.Sitemap = salaries.map((slug) => ({
    url: `${siteUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const landingPages: MetadataRoute.Sitemap = landings.map((l) => ({
    url: `${siteUrl}/${l.slug}`,
    lastModified: l.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.88,
  }));

  const jobPages: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${siteUrl}/emploi/${job.slug}`,
    lastModified: job.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const cityPages: MetadataRoute.Sitemap = cities.map((slug) => ({
    url: `${siteUrl}/emplois/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  const companyPages: MetadataRoute.Sitemap = companies.map((slug) => ({
    url: `${siteUrl}/entreprise/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...landingPages,
    ...salaryPages,
    ...cityPages,
    ...companyPages,
    ...jobPages,
  ];
}
