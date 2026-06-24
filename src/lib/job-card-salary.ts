import { parseSalaryRange } from "./job-detail";
import { estimateMoroccanSalary, MOROCCAN_SALARY_TOOLTIP } from "./moroccan-salary-estimate";
import type { JobListItem } from "./queries";

export type JobCardSalaryType = "actual" | "estimated" | "undisclosed";

export interface JobCardSalary {
  text: string;
  type: JobCardSalaryType;
  tooltip?: string;
}

export function formatJobCardSalaryFromJob(job: Pick<
  JobListItem,
  "salary" | "title" | "city" | "companyRef" | "location" | "tags" | "description"
>): JobCardSalary {
  const insight = parseSalaryRange(job.salary, job.title);

  if (insight.display) {
    return { text: insight.display, type: "actual" };
  }

  const estimate = estimateMoroccanSalary({
    title: job.title,
    city: job.city,
    citySlug: job.location?.slug,
    tags: job.tags,
    companySlug: job.companyRef?.slug,
    description: job.description,
  });

  if (estimate.median > 0) {
    return {
      text: `~${estimate.median.toLocaleString("fr-MA")} MAD estimé`,
      type: "estimated",
      tooltip: MOROCCAN_SALARY_TOOLTIP,
    };
  }

  return { text: "Salaire non communiqué", type: "undisclosed" };
}

/** @deprecated Use formatJobCardSalaryFromJob for full Moroccan context. */
export function formatJobCardSalary(salary: string | null, title: string): JobCardSalary {
  return formatJobCardSalaryFromJob({
    salary,
    title,
    city: "",
    companyRef: null,
    location: null,
    tags: [],
    description: "",
  });
}
