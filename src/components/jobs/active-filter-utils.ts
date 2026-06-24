import {
  DISCOVERY_CITIES,
  DISCOVERY_EXPERIENCE_LEVELS,
  DISCOVERY_REMOTE_OPTIONS,
  DISCOVERY_SECTORS,
} from "@/lib/jobs-discovery";

export interface FilterChip {
  key: string;
  label: string;
}

export function buildChips(
  params: URLSearchParams,
  tags: { name: string; slug: string }[],
  hideCity?: boolean
): FilterChip[] {
  const chips: FilterChip[] = [];

  const q = params.get("q");
  if (q) chips.push({ key: "q", label: q });

  const city = params.get("city");
  if (city && !hideCity) {
    const label =
      DISCOVERY_CITIES.find((c) => c.slug === city)?.name ??
      city.replace("-morocco", "").replace(/-/g, " ");
    chips.push({ key: "city", label });
  }

  const contract = params.get("contract");
  if (contract) chips.push({ key: "contract", label: contract });

  const tag = params.get("tag");
  if (tag) {
    const label =
      tags.find((t) => t.slug === tag)?.name ??
      DISCOVERY_SECTORS.find((s) => s.slug === tag)?.label ??
      tag;
    chips.push({ key: "tag", label });
  }

  const remote = params.get("remote");
  if (remote) {
    const label = DISCOVERY_REMOTE_OPTIONS.find((o) => o.value === remote)?.label ?? remote;
    chips.push({ key: "remote", label });
  }

  const experience = params.get("experience");
  if (experience) {
    const label =
      DISCOVERY_EXPERIENCE_LEVELS.find((e) => e.value === experience)?.label ?? experience;
    chips.push({ key: "experience", label });
  }

  const minSalary = parseInt(params.get("minSalary") || "0", 10);
  if (minSalary > 0) {
    chips.push({
      key: "minSalary",
      label: `${minSalary.toLocaleString("fr-MA")}+ MAD`,
    });
  }

  const company = params.get("company");
  if (company) chips.push({ key: "company", label: company });

  return chips;
}

export interface SearchScopeLabels {
  parts: string[];
  query?: string;
}

export function buildSearchScope(
  searchParams: Record<string, string | undefined>,
  cities: { city: string; slug: string }[],
  tags: { name: string; slug: string }[] = [],
  options?: { hideCity?: boolean; fixedCity?: string }
): SearchScopeLabels {
  const citySlug = options?.fixedCity ?? searchParams.city;
  let location = "Maroc";

  if (citySlug) {
    location =
      cities.find((c) => c.slug === citySlug)?.city ??
      citySlug.replace("-morocco", "").replace(/-/g, " ");
  }

  const parts: string[] = [location];

  if (searchParams.contract) {
    parts.push(searchParams.contract);
  } else {
    parts.push("Tous contrats");
  }

  if (searchParams.remote) {
    const remoteLabel =
      DISCOVERY_REMOTE_OPTIONS.find((o) => o.value === searchParams.remote)?.label ??
      searchParams.remote;
    parts.push(remoteLabel);
  }

  if (searchParams.tag) {
    const tagLabel =
      tags.find((t) => t.slug === searchParams.tag)?.name ??
      DISCOVERY_SECTORS.find((s) => s.slug === searchParams.tag)?.label ??
      searchParams.tag;
    parts.push(tagLabel);
  }

  if (searchParams.experience) {
    const expLabel =
      DISCOVERY_EXPERIENCE_LEVELS.find((e) => e.value === searchParams.experience)?.label ??
      searchParams.experience;
    parts.push(expLabel);
  }

  const minSalary = searchParams.minSalary ? parseInt(searchParams.minSalary, 10) : 0;
  parts.push(minSalary > 0 ? `${minSalary.toLocaleString("fr-MA")}+ MAD` : "Tous salaires");

  return {
    parts,
    query: searchParams.q,
  };
}
