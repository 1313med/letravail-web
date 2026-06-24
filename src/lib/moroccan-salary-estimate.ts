/**
 * Moroccan labor market salary estimation.
 * All values in MAD/month. No international benchmarks or currency conversion.
 */
import { SALARY_ROLES, type SalaryRole } from "./salary-data";
import { TOP_EMPLOYER_SLUGS } from "./jobs-discovery";

/** Relative market multipliers vs. national median (Morocco 2025 internal data). */
const CITY_MULTIPLIERS: Record<string, number> = {
  casablanca: 1.12,
  rabat: 1.08,
  tanger: 0.95,
  marrakech: 0.92,
  fes: 0.88,
  agadir: 0.9,
  kenitra: 0.93,
  mohammedia: 1.05,
  sale: 1.02,
};

/** Sector adjustments from Moroccan hiring patterns. */
const SECTOR_MULTIPLIERS: Record<string, number> = {
  tech: 1.08,
  finance: 1.1,
  banque: 1.12,
  telecom: 1.06,
  industrie: 1.0,
  marketing: 0.98,
  rh: 0.96,
  logistique: 0.94,
  sante: 1.02,
  education: 0.9,
};

const EXPERIENCE_MULTIPLIERS = {
  junior: 0.72,
  confirme: 1.0,
  senior: 1.38,
  manager: 1.58,
} as const;

const TOP_EMPLOYER_BOOST = 1.14;
const NATIONAL_DEFAULT_MEDIAN = 11_000;

export interface MoroccanSalaryInput {
  title: string;
  city?: string;
  citySlug?: string | null;
  tags?: { slug: string; name?: string }[];
  companySlug?: string | null;
  description?: string;
}

export interface MoroccanSalaryEstimate {
  median: number;
  role: string | null;
  confidence: "high" | "medium" | "low";
}

function normalizeCityKey(city?: string, citySlug?: string | null): string {
  const raw = (citySlug || city || "").toLowerCase();
  const stripped = raw.replace(/-morocco$/, "").replace(/-/g, " ");
  const first = stripped.split(" ")[0];
  return first.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function matchRole(title: string, description?: string): SalaryRole | null {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  let best: SalaryRole | null = null;
  let bestLen = 0;

  for (const role of SALARY_ROLES) {
    for (const kw of role.keywords) {
      if (text.includes(kw.toLowerCase()) && kw.length > bestLen) {
        best = role;
        bestLen = kw.length;
      }
    }
  }
  return best;
}

function detectExperience(
  title: string,
  description?: string
): keyof typeof EXPERIENCE_MULTIPLIERS {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  if (/\b(manager|directeur|directrice|responsable|chef de|head of|lead\b)/i.test(text)) {
    return "manager";
  }
  if (/\b(senior|sénior|expert|principal|architect)\b/i.test(text)) {
    return "senior";
  }
  if (/\b(junior|débutant|debutant|stage|stagiaire|alternance|apprenti)\b/i.test(text)) {
    return "junior";
  }
  return "confirme";
}

function sectorMultiplier(tags?: { slug: string }[]): number {
  if (!tags?.length) return 1;
  let max = 1;
  for (const tag of tags) {
    const m = SECTOR_MULTIPLIERS[tag.slug];
    if (m && m > max) max = m;
  }
  return max;
}

function roundMad(value: number): number {
  return Math.round(value / 500) * 500;
}

export function estimateMoroccanSalary(input: MoroccanSalaryInput): MoroccanSalaryEstimate {
  const role = matchRole(input.title, input.description);
  const baseMedian = role?.fallback.median ?? NATIONAL_DEFAULT_MEDIAN;

  const cityKey = normalizeCityKey(input.city, input.citySlug);
  const cityMult = CITY_MULTIPLIERS[cityKey] ?? 1.0;
  const exp = detectExperience(input.title, input.description);
  const expMult = EXPERIENCE_MULTIPLIERS[exp];
  const sectorMult = sectorMultiplier(input.tags);

  let multiplier = cityMult * expMult * sectorMult;

  if (input.companySlug && TOP_EMPLOYER_SLUGS.has(input.companySlug)) {
    multiplier *= TOP_EMPLOYER_BOOST;
  }

  const median = roundMad(baseMedian * multiplier);

  return {
    median,
    role: role?.title ?? null,
    confidence: role ? (cityMult !== 1 || sectorMult !== 1 ? "high" : "medium") : "low",
  };
}

export const MOROCCAN_SALARY_TOOLTIP = "Estimation basée sur le marché marocain";
