import { MIN_JOBS_FOR_CITY_INDEX, MIN_JOBS_FOR_LANDING_INDEX } from "./constants";

const FILTER_KEYS = [
  "q",
  "tag",
  "contract",
  "company",
  "remote",
  "experience",
  "minSalary",
  "city",
] as const;

export function hasListingFilters(
  searchParams: Record<string, string | undefined>
): boolean {
  return FILTER_KEYS.some((key) => Boolean(searchParams[key]));
}

export function shouldNoindexListing(
  searchParams: Record<string, string | undefined>,
  jobCount?: number,
  minJobs = MIN_JOBS_FOR_CITY_INDEX
): boolean {
  if (hasListingFilters(searchParams)) return true;
  if (jobCount !== undefined && jobCount < minJobs) return true;
  return false;
}

export function shouldNoindexLanding(jobCount: number): boolean {
  return jobCount < MIN_JOBS_FOR_LANDING_INDEX;
}

export function listingCanonicalPath(
  basePath: string,
  searchParams: Record<string, string | undefined>
): string {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  if (hasListingFilters(searchParams)) return basePath;
  if (page > 1) return `${basePath}?page=${page}`;
  return basePath;
}
