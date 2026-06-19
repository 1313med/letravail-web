import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/constants";
import {
  getAllJobSlugs,
  getIndexableCitySlugs,
  getIndexableCompanySlugs,
} from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const [jobs, cities, companies] = await Promise.all([
    getAllJobSlugs(50000),
    getIndexableCitySlugs(),
    getIndexableCompanySlugs(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${siteUrl}/emplois`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  const jobPages: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${siteUrl}/emploi/${job.slug}`,
    lastModified: new Date(),
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

  return [...staticPages, ...cityPages, ...companyPages, ...jobPages];
}
