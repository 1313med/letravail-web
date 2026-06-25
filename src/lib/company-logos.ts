import { getSiteUrl } from "./constants";

export type CompanyLogoEntry = {
  slug: string;
  name: string;
  logo: string;
};

const LOGO_FILES = [
  "attijariwafa-bank",
  "cih-bank",
  "ocp",
  "maroc-telecom",
  "orange-maroc",
  "dxc-technology",
  "bank-of-africa",
  "banque-populaire",
  "bmci",
  "credit-agricole",
  "societe-generale",
  "cdm",
  "bank-al-maghrib",
  "inwi",
  "royal-air-maroc",
  "oncf",
  "lafargeholcim",
  "managem",
  "stellantis",
  "marjane",
  "labelvie",
  "aswak-assalam",
  "bim",
  "capgemini",
  "auto-hall",
  "cgi",
  "wafa-assurance",
  "rma-watanya",
  "saham-assurance",
  "axa-maroc",
  "cdg",
  "anapec",
  "emploi-public",
  "onee",
  "masen",
  "renault-maroc",
] as const;

const DISPLAY_NAMES: Record<string, string> = {
  "attijariwafa-bank": "Attijariwafa Bank",
  "cih-bank": "CIH Bank",
  ocp: "OCP",
  "maroc-telecom": "Maroc Telecom",
  "orange-maroc": "Orange Maroc",
  "dxc-technology": "DXC Technology",
  "bank-of-africa": "Bank of Africa",
  "banque-populaire": "Banque Populaire",
  bmci: "BMCI",
  "credit-agricole": "Crédit Agricole",
  "societe-generale": "Société Générale",
  cdm: "CDM",
  "bank-al-maghrib": "Bank Al-Maghrib",
  inwi: "Inwi",
  "royal-air-maroc": "Royal Air Maroc",
  oncf: "ONCF",
  lafargeholcim: "LafargeHolcim",
  managem: "Managem",
  stellantis: "Stellantis",
  marjane: "Marjane",
  labelvie: "LabelVie",
  "aswak-assalam": "Aswak Assalam",
  bim: "BIM",
  capgemini: "Capgemini",
  "auto-hall": "Auto Hall",
  cgi: "CGI",
  "wafa-assurance": "Wafa Assurance",
  "rma-watanya": "RMA Watanya",
  "saham-assurance": "Saham Assurance",
  "axa-maroc": "AXA Maroc",
  cdg: "CDG",
  anapec: "ANAPEC",
  "emploi-public": "Emploi Public",
  onee: "ONEE",
  masen: "MASEN",
  "renault-maroc": "Renault Maroc",
};

export const MOROCCAN_COMPANY_LOGOS: CompanyLogoEntry[] = LOGO_FILES.map((slug) => ({
  slug,
  name: DISPLAY_NAMES[slug] ?? slug,
  logo: `/logos/${slug}.svg`,
}));

export function getCompanyLogo(slug: string): { logo: string; name: string } | undefined {
  const entry = MOROCCAN_COMPANY_LOGOS.find((c) => c.slug === slug);
  if (!entry) return undefined;
  return { logo: entry.logo, name: entry.name };
}

export function getCompanyLogoUrl(companySlug: string | null | undefined): string | null {
  if (!companySlug) return null;
  const entry = getCompanyLogo(companySlug);
  if (!entry) return null;
  return `${getSiteUrl()}${entry.logo}`;
}

export function getCompanyWebsiteUrl(companySlug: string | null | undefined): string | null {
  const sites: Record<string, string> = {
    "attijariwafa-bank": "https://www.attijariwafabank.com",
    "cih-bank": "https://www.cihbank.ma",
    ocp: "https://www.ocpgroup.ma",
    "maroc-telecom": "https://www.iam.ma",
    "orange-maroc": "https://www.orange.ma",
    inwi: "https://www.inwi.ma",
    "royal-air-maroc": "https://www.royalairmaroc.com",
    oncf: "https://www.oncf.ma",
    marjane: "https://www.marjane.ma",
    capgemini: "https://www.capgemini.com",
  };
  if (!companySlug) return null;
  return sites[companySlug] ?? null;
}
