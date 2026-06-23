import { TOP_CITIES } from "./constants";

export const DISCOVERY_CONTRACT_TYPES = [
  "CDI",
  "CDD",
  "Freelance",
  "Stage",
  "Alternance",
] as const;

export const DISCOVERY_REMOTE_OPTIONS = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Sur site" },
] as const;

export const DISCOVERY_SECTORS = [
  { slug: "banque", label: "Banque" },
  { slug: "tech", label: "Tech" },
  { slug: "finance", label: "Finance" },
  { slug: "marketing", label: "Marketing" },
  { slug: "rh", label: "RH" },
  { slug: "logistique", label: "Logistique" },
  { slug: "telecom", label: "Télécom" },
  { slug: "industrie", label: "Industrie" },
  { slug: "sante", label: "Santé" },
  { slug: "education", label: "Éducation" },
] as const;

export const DISCOVERY_EXPERIENCE_LEVELS = [
  { value: "junior", label: "Junior", keywords: ["junior", "débutant", "stage"] },
  { value: "confirme", label: "Confirmé", keywords: ["confirmé", "intermédiaire"] },
  { value: "senior", label: "Senior", keywords: ["senior", "expert"] },
  { value: "manager", label: "Manager", keywords: ["manager", "directeur", "responsable", "chef"] },
] as const;

export const POPULAR_SEARCHES = [
  "Développeur",
  "Comptable",
  "Commercial",
  "Data Analyst",
  "Ingénieur",
  "RH",
] as const;

export const SALARY_SLIDER = {
  min: 5000,
  max: 50000,
  step: 1000,
  default: 0,
} as const;

/** SEO landing paths → internal routes */
export const SEO_JOB_ROUTES: Record<string, string> = {
  "/offres-emploi-maroc": "/emplois",
  "/offres-emploi-casablanca": "/emplois/casablanca-morocco",
  "/offres-emploi-rabat": "/emplois/rabat-morocco",
  "/offres-emploi-marrakech": "/emplois/marrakech-morocco",
  "/offres-emploi-tanger": "/emplois/tanger-morocco",
  "/offres-emploi-fes": "/emplois/fes-morocco",
  "/offres-emploi-agadir": "/emplois/agadir-morocco",
  "/offres-emploi-tech": "/emploi-tech-maroc",
  "/offres-emploi-finance": "/emploi-finance-maroc",
};

export function cityNameToSlug(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + "-morocco"
  );
}

export const DISCOVERY_CITIES = TOP_CITIES.slice(0, 6).map((name) => ({
  name,
  slug: cityNameToSlug(name),
}));

export const TOP_EMPLOYER_SLUGS = new Set([
  "attijariwafa-bank",
  "cih-bank",
  "ocp",
  "orange-maroc",
  "dxc-technology",
  "maroc-telecom",
  "capgemini",
]);

export function parseFiltersFromSearchParams(
  sp: Record<string, string | undefined>,
  fixedCity?: string
) {
  return {
    q: sp.q,
    city: fixedCity ?? sp.city,
    company: sp.company,
    contract: sp.contract,
    tag: sp.tag,
    remote: sp.remote,
    minSalary: sp.minSalary ? parseInt(sp.minSalary, 10) : undefined,
    experience: sp.experience,
    page: sp.page ? parseInt(sp.page, 10) : 1,
  };
}

export function buildFilterQueryString(
  filters: Record<string, string | number | undefined>,
  overrides?: Record<string, string | undefined>
): string {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(merged)) {
    if (val !== undefined && val !== "" && val !== 0 && key !== "page") {
      params.set(key, String(val));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
