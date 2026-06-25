/**
 * Moroccan salary text parser — single source of truth for extraction + normalization.
 * Handles: MAD, DH, DHS, Dirham, k suffix, ranges, net/brut, monthly indicators.
 */

export type ParsedMoroccanSalary = {
  min: number;
  max: number;
  raw: string;
  period: "monthly" | "annual" | "unknown";
  confidence: "high" | "medium" | "low";
};

const FOREIGN_CURRENCY =
  /(?:€\s*\d|\d\s*€|\beur(?:o)?s?\b|\busd\b|\bus\$\b|dollars?|\bgbp\b|£\s*\d|\d\s*£)/i;

const ANNUAL_HINT = /\b(an|annuel|annual|par an|\/\s*an)\b/i;
const MONTHLY_HINT =
  /\b(mois|mensuel|monthly|par mois|\/\s*mois|\/\s*m\b|net\b|brut\b)\b/i;

/** Salary-like line patterns in job text */
const SALARY_PATTERNS = [
  // 12000-15000 DH, 12 000 – 15 000 MAD
  /(\d[\d\s.,]*\s*k?)\s*[-–—àto/]\s*(\d[\d\s.,]*\s*k?)\s*(?:mad|dh|dhs|dirhams?)\b/gi,
  // 15000 MAD, 8 000 DH, 15k MAD
  /\b(\d[\d\s.,]*\s*k)\s*(?:mad|dh|dhs|dirhams?)(?:\s*\/\s*mois)?\b/gi,
  /\b(\d[\d\s.,]{3,})\s*(?:mad|dh|dhs|dirhams?)(?:\s*\/\s*mois)?\b/gi,
  // MAD 15000, DH 8000
  /\b(?:mad|dh|dhs|dirhams?)\s*(\d[\d\s.,]*\s*k?)\b/gi,
  // 20000 dh/mois, 15000 MAD mensuel
  /\b(\d[\d\s.,]*\s*k?)\s*(?:dh|mad|dhs)\s*\/\s*mois\b/gi,
  /\b(\d[\d\s.,]*\s*k?)\s*(?:mad|dh|dhs)\s*(?:net|brut)\b/gi,
  // Salaire : 12000 DH
  /salaire\s*:?\s*(\d[\d\s.,]*\s*k?)\s*(?:[-–—àto/]\s*(\d[\d\s.,]*\s*k?)\s*)?(?:mad|dh|dhs|dirhams?)?/gi,
  /r[eé]mun[eé]ration\s*:?\s*(\d[\d\s.,]*\s*k?)\s*(?:[-–—àto/]\s*(\d[\d\s.,]*\s*k?)\s*)?(?:mad|dh|dhs|dirhams?)?/gi,
];

export function isMoroccanSalaryText(text: string): boolean {
  if (!text?.trim()) return false;
  if (FOREIGN_CURRENCY.test(text)) return false;
  return /\b(mad|dh|dhs|dirhams?)\b/i.test(text) || /salaire|r[eé]mun/i.test(text);
}

function parseToken(token: string): number | null {
  const cleaned = token.trim().toLowerCase().replace(/\s/g, "").replace(/,/g, ".");
  const kMatch = cleaned.match(/^(\d+(?:\.\d+)?)k$/);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);

  const numMatch = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (!numMatch) return null;

  let n = parseFloat(numMatch[1]);
  if (cleaned.includes("k")) n *= 1000;
  n = Math.round(n);

  // Monthly MAD sanity: 2 000 – 150 000
  if (n < 2000 || n > 150000) return null;
  return n;
}

function inferPeriod(snippet: string): ParsedMoroccanSalary["period"] {
  if (ANNUAL_HINT.test(snippet)) return "annual";
  if (MONTHLY_HINT.test(snippet)) return "monthly";
  return "unknown";
}

function annualToMonthly(n: number): number {
  return Math.round(n / 12);
}

export function parseMoroccanSalaryText(
  text: string | null | undefined
): ParsedMoroccanSalary | null {
  if (!text?.trim()) return null;
  if (FOREIGN_CURRENCY.test(text) && !/\b(mad|dh|dhs|dirhams?)\b/i.test(text)) {
    return null;
  }

  for (const pattern of SALARY_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (!match) continue;

    const raw = match[0];
    const snippet = text.slice(Math.max(0, match.index - 30), match.index + raw.length + 30);
    const nums: number[] = [];

    for (let i = 1; i < match.length; i++) {
      if (match[i]) {
        const n = parseToken(match[i]);
        if (n) nums.push(n);
      }
    }

    if (nums.length === 0) continue;

    let min = Math.min(...nums);
    let max = Math.max(...nums);
    let period = inferPeriod(snippet);

    if (period === "annual" || (period === "unknown" && min > 50000)) {
      min = annualToMonthly(min);
      max = annualToMonthly(max);
      period = "monthly";
    }

    const confidence: ParsedMoroccanSalary["confidence"] =
      /\b(mad|dh|dhs|dirhams?)\b/i.test(raw) ? "high" : "medium";

    return { min, max, raw, period, confidence };
  }

  // Fallback: number near salary keyword without currency
  const nearKeyword =
    /(?:salaire|r[eé]mun[eé]ration)[^.\n]{0,40}?(\d[\d\s.,]*\s*k?)\s*(?:[-–—àto/]\s*(\d[\d\s.,]*\s*k?))?/gi;
  nearKeyword.lastIndex = 0;
  const kwMatch = nearKeyword.exec(text);
  if (kwMatch) {
    const nums: number[] = [];
    for (let i = 1; i < kwMatch.length; i++) {
      if (kwMatch[i]) {
        const n = parseToken(kwMatch[i]);
        if (n) nums.push(n);
      }
    }
    if (nums.length > 0) {
      return {
        min: Math.min(...nums),
        max: Math.max(...nums),
        raw: kwMatch[0],
        period: "monthly",
        confidence: "low",
      };
    }
  }

  return null;
}

export function extractSalaryFromJobText(parts: {
  salary?: string | null;
  description?: string | null;
  requirements?: string | null;
}): ParsedMoroccanSalary | null {
  if (parts.salary?.trim()) {
    const fromField = parseMoroccanSalaryText(parts.salary);
    if (fromField) return fromField;
  }

  const combined = [parts.description, parts.requirements].filter(Boolean).join("\n");
  return parseMoroccanSalaryText(combined);
}

export function formatSalaryRange(min: number, max: number): string {
  if (min === max) return `${min.toLocaleString("fr-MA")} MAD/mois`;
  return `${min.toLocaleString("fr-MA")} – ${max.toLocaleString("fr-MA")} MAD/mois`;
}
