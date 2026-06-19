import { Metadata } from "next";
import { getSiteUrl, SITE_LOCALE, SITE_NAME } from "./constants";
import { mapContractType } from "./utils";

interface JobForSchema {
  slug: string;
  title: string;
  description: string;
  company: string;
  city: string;
  country: string;
  contractType: string | null;
  remote: boolean;
  applicationUrl: string;
  publishedAt: Date | null;
  expiresAt: Date | null;
}

export function buildCanonical(path: string): string {
  const base = getSiteUrl();
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  noindex = false,
  ogImage,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  ogImage?: string;
}): Metadata {
  const canonical = buildCanonical(path);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical,
      languages: {
        [SITE_LOCALE]: canonical,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: SITE_LOCALE.replace("-", "_"),
      type: "website",
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[]
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildJobPostingJsonLd(job: JobForSchema): object {
  const siteUrl = getSiteUrl();
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.publishedAt?.toISOString() || new Date().toISOString(),
    employmentType: mapContractType(job.contractType),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city,
        addressCountry: "MA",
      },
    },
    url: `${siteUrl}/emploi/${job.slug}`,
    directApply: true,
    applicationContact: {
      "@type": "ContactPoint",
      url: job.applicationUrl,
    },
  };

  if (job.expiresAt) {
    jsonLd.validThrough = job.expiresAt.toISOString();
  }

  if (job.remote) {
    jsonLd.jobLocationType = "TELECOMMUTE";
  }

  return jsonLd;
}

export function buildOrganizationJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getSiteUrl()}/emplois?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
