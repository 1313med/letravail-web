import { estimateMoroccanSalary } from "./moroccan-salary-estimate";

export type JobSalarySource = "scraped" | "estimated" | "none";

const FOREIGN_CURRENCY = /(?:€|eur\b|euros?|usd\b|us\$|\$|dollar|£|gbp|pound)/i;

export function isMoroccanSalaryText(salary: string): boolean {
  return !FOREIGN_CURRENCY.test(salary);
}

function parseMadNumbers(salary: string): { min: number; max: number } | null {
  const numbers =
    salary
      .match(/\d[\d\s]*/g)
      ?.map((n) => parseInt(n.replace(/\s/g, ""), 10))
      .filter((n) => n > 1000) ?? [];

  if (numbers.length >= 2) {
    return { min: Math.min(...numbers), max: Math.max(...numbers) };
  }
  if (numbers.length === 1) {
    return { min: numbers[0], max: numbers[0] };
  }
  return null;
}

export function parseScrapedMadSalary(
  salary: string | null,
  _title = ""
): { min: number; max: number } | null {
  if (!salary || !isMoroccanSalaryText(salary)) return null;
  return parseMadNumbers(salary);
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
}

export function resolveJobPostingSalary(job: JobSalaryInput): {
  source: JobSalarySource;
  amount: object | null;
} {
  const scraped = parseScrapedMadSalary(job.salary, job.title);
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
