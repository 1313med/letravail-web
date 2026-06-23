export const SALARY_ROLES = [
  {
    slug: "developpeur-maroc",
    title: "Développeur",
    keywords: ["développeur", "developer", "dev ", "full stack", "fullstack", "software", "ingénieur logiciel"],
    tagSlug: "tech",
    fallback: { min: 12000, median: 22000, max: 35000, trend: "+8%" },
  },
  {
    slug: "data-analyst-maroc",
    title: "Data Analyst",
    keywords: ["data analyst", "analyste data", "business analyst", "data scientist"],
    tagSlug: "tech",
    fallback: { min: 10000, median: 18000, max: 28000, trend: "+12%" },
  },
  {
    slug: "comptable-maroc",
    title: "Comptable",
    keywords: ["comptable", "comptabilité", "accountant"],
    tagSlug: "finance",
    fallback: { min: 6000, median: 9500, max: 15000, trend: "+5%" },
  },
  {
    slug: "commercial-maroc",
    title: "Commercial",
    keywords: ["commercial", "vente", "business developer", "account manager"],
    tagSlug: "marketing",
    fallback: { min: 7000, median: 12000, max: 20000, trend: "+6%" },
  },
  {
    slug: "chef-projet-maroc",
    title: "Chef de projet",
    keywords: ["chef de projet", "project manager", "chef projet", "pmo"],
    tagSlug: "tech",
    fallback: { min: 14000, median: 22000, max: 38000, trend: "+7%" },
  },
  {
    slug: "rh-maroc",
    title: "Responsable RH",
    keywords: ["rh", "ressources humaines", "hr ", "recruteur", "talent"],
    tagSlug: "rh",
    fallback: { min: 8000, median: 14000, max: 24000, trend: "+5%" },
  },
  {
    slug: "marketing-maroc",
    title: "Marketing",
    keywords: ["marketing", "digital marketing", "brand manager", "communication"],
    tagSlug: "marketing",
    fallback: { min: 8000, median: 13000, max: 22000, trend: "+6%" },
  },
  {
    slug: "ingenieur-maroc",
    title: "Ingénieur",
    keywords: ["ingénieur", "engineer", "ing. "],
    tagSlug: "industrie",
    fallback: { min: 10000, median: 16000, max: 28000, trend: "+5%" },
  },
] as const;

export type SalaryRole = (typeof SALARY_ROLES)[number];

export function salaryPublicSlug(roleSlug: string): string {
  return `salaire-${roleSlug}`;
}

export function parseSalaryPublicSlug(slug: string): SalaryRole | null {
  if (!slug.startsWith("salaire-")) return null;
  const roleSlug = slug.slice("salaire-".length);
  return SALARY_ROLES.find((r) => r.slug === roleSlug) ?? null;
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

export function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[idx];
}
