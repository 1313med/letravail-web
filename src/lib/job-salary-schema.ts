import { estimateMoroccanSalary } from "./moroccan-salary-estimate";
import {
  extractSalaryFromJobText,
  parseMoroccanSalaryText,
  type ParsedMoroccanSalary,
} from "./moroccan-salary-parser";

export type JobSalarySource = "scraped" | "estimated" | "none";

export { isMoroccanSalaryText } from "./moroccan-salary-parser";
export { parseMoroccanSalaryText, extractSalaryFromJobText, formatSalaryRange } from "./moroccan-salary-parser";

export function parseScrapedMadSalary(
  salary: string | null,
  title = "",
  description?: string | null,
  requirements?: string | null
): { min: number; max: number } | null {
  const parsed =
    extractSalaryFromJobText({ salary, description, requirements }) ??
  (salary ? parseMoroccanSalaryText(salary) : null);
  if (!parsed) return null;
  return { min: parsed.min, max: parsed.max };
}

export function buildSalaryMonetaryAmount(min: number, max: number): object {
  return {
    "@type": "MonetaryAmount",
    currency: "MAD",
    value: {
      "@type": "QuantitativeValue",
      minValue: min,
      maxValue: max,
      unitText: "MONTH",
    },
  };
}

export interface JobSalaryInput {
  salary: string | null;
  title: string;
  city?: string;
  citySlug?: string | null;
  tags?: { slug: string }[];
  companySlug?: string | null;
  description?: string;
  requirements?: string | null;
}

export function resolveJobPostingSalary(job: JobSalaryInput): {
  source: JobSalarySource;
  amount: object | null;
} {
  const scraped = parseScrapedMadSalary(
    job.salary,
    job.title,
    job.description,
    job.requirements
  );

  if (scraped) {
    return {
      source: "scraped",
      amount: buildSalaryMonetaryAmount(scraped.min, scraped.max),
    };
  }

  const estimate = estimateMoroccanSalary({
    title: job.title,
    city: job.city,
    citySlug: job.citySlug,
    tags: job.tags,
    companySlug: job.companySlug,
    description: job.description,
  });

  if (estimate.median > 0) {
    return {
      source: "estimated",
      amount: buildSalaryMonetaryAmount(estimate.median, estimate.median),
    };
  }

  return { source: "none", amount: null };
}
