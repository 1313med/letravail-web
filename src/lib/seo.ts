import { Metadata } from "next";
import { getSiteUrl, SITE_LOCALE, SITE_NAME } from "./constants";
import { getCompanyLogoUrl, getCompanyWebsiteUrl } from "./company-logos";
import { defaultValidThrough } from "./google-jobs-compliance";
import { resolveJobPostingSalary } from "./job-salary-schema";
import { mapContractType } from "./utils";

interface JobForSchema {
  id?: string;
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
  createdAt?: Date;
  salary?: string | null;
  citySlug?: string | null;
  companySlug?: string | null;
  requirements?: string | null;
  tags?: { slug: string }[];
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
  pagination,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  ogImage?: string;
  pagination?: { prev?: string; next?: string };
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
      ...(pagination?.prev && { prev: buildCanonical(pagination.prev) }),
      ...(pagination?.next && { next: buildCanonical(pagination.next) }),
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
  const jobUrl = `${siteUrl}/emploi/${job.slug}`;
  const datePosted = (job.publishedAt ?? job.createdAt ?? new Date()).toISOString();
  const validThrough = defaultValidThrough(job.publishedAt, job.expiresAt);

  const hiringOrg: Record<string, unknown> = {
    "@type": "Organization",
    name: job.company,
  };

  const logo = getCompanyLogoUrl(job.companySlug);
  if (logo) hiringOrg.logo = logo;

  const sameAs = getCompanyWebsiteUrl(job.companySlug);
  if (sameAs) hiringOrg.sameAs = sameAs;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    identifier: {
      "@type": "PropertyValue",
      name: "Letravail.ma",
      value: job.id ?? job.slug,
    },
    title: job.title,
    description: job.description,
    datePosted,
    validThrough,
    employmentType: mapContractType(job.contractType),
    hiringOrganization: hiringOrg,
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city,
        addressCountry: "MA",
      },
    },
    occupationLocation: {
      "@type": "Country",
      name: "Morocco",
    },
    url: jobUrl,
    directApply: true,
    applicationContact: {
      "@type": "ContactPoint",
      url: job.applicationUrl,
    },
  };

  if (job.remote) {
    jsonLd.jobLocationType = "TELECOMMUTE";
    jsonLd.applicantLocationRequirements = {
      "@type": "Country",
      name: "Morocco",
    };
  }

  const resolved = resolveJobPostingSalary({
    salary: job.salary ?? null,
    title: job.title,
    city: job.city,
    citySlug: job.citySlug,
    companySlug: job.companySlug,
    tags: job.tags,
    description: job.description,
    requirements: job.requirements,
  });

  if (resolved.amount) {
    if (resolved.source === "scraped") {
      jsonLd.baseSalary = resolved.amount;
    } else if (resolved.source === "estimated") {
      jsonLd.estimatedSalary = resolved.amount;
    }
  }

  return jsonLd;
}

export function buildJobListJsonLd(
  jobs: { slug: string; title: string }[],
  listName: string,
  listUrl: string
): object {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    url: listUrl,
    numberOfItems: jobs.length,
    itemListElement: jobs.map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: job.title,
      url: buildCanonical(`/emploi/${job.slug}`),
    })),
  };
}

export function buildFaqJsonLd(
  items: { question: string; answer: string }[]
): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
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

export function buildCompanyOrganizationJsonLd(company: {
  name: string;
  slug: string;
  jobCount: number;
  industry?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: buildCanonical(`/entreprise/${company.slug}`),
    ...(company.industry && { description: `Recrutement ${company.name} — ${company.industry}` }),
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      value: company.jobCount,
      unitText: "offres actives",
    },
  };
}

export function buildProfessionJsonLd(profession: {
  name: string;
  path: string;
  jobCount: number;
  skills: string[];
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Occupation",
    name: profession.name,
    occupationLocation: {
      "@type": "Country",
      name: "Morocco",
    },
    skills: profession.skills.join(", "),
    url: buildCanonical(profession.path),
    description: `${profession.jobCount} offres d'emploi ${profession.name} au Maroc sur Letravail.ma.`,
  };
}

export function buildSalaryJsonLd(role: {
  title: string;
  min: number;
  median: number;
  max: number;
  path: string;
  sampleSize: number;
  observationCount: number;
}): object {
  const basedOnObservations = role.observationCount >= role.sampleSize;
  return {
    "@context": "https://schema.org",
    "@type": "Occupation",
    name: role.title,
    occupationLocation: {
      "@type": "Country",
      name: "Morocco",
    },
    estimatedSalary: [
      {
        "@type": "MonetaryAmountDistribution",
        name: "base",
        currency: "MAD",
        duration: "P1M",
        minValue: role.min,
        maxValue: role.max,
        median: role.median,
      },
    ],
    url: buildCanonical(role.path),
    description: basedOnObservations
      ? `Salaire ${role.title} au Maroc basé sur ${role.observationCount} observations réelles.`
      : `Salaire ${role.title} au Maroc basé sur ${role.sampleSize} offres analysées.`,
  };
}
