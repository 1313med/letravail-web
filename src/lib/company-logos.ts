export interface CompanyLogo {
  name: string;
  slug: string;
  logo: string;
  category: "banque" | "telecom" | "industrie" | "retail" | "tech" | "public" | "assurance";
}

/** Curated Moroccan employers — logos from official site favicons + brand SVG fallbacks. */
export const MOROCCAN_COMPANY_LOGOS: CompanyLogo[] = [
  { name: "Attijariwafa Bank", slug: "attijariwafa-bank", logo: "/logos/attijariwafa-bank.png", category: "banque" },
  { name: "CIH Bank", slug: "cih-bank", logo: "/logos/cih-bank.png", category: "banque" },
  { name: "Bank of Africa", slug: "bank-of-africa", logo: "/logos/bank-of-africa.png", category: "banque" },
  { name: "Banque Populaire", slug: "banque-populaire", logo: "/logos/banque-populaire.png", category: "banque" },
  { name: "BMCI", slug: "bmci", logo: "/logos/bmci.png", category: "banque" },
  { name: "Crédit Agricole", slug: "credit-agricole-maroc", logo: "/logos/credit-agricole.png", category: "banque" },
  { name: "Société Générale", slug: "societe-generale-maroc", logo: "/logos/societe-generale.svg", category: "banque" },
  { name: "CDM", slug: "credit-du-maroc", logo: "/logos/cdm.png", category: "banque" },
  { name: "Bank Al-Maghrib", slug: "bank-al-maghrib", logo: "/logos/bank-al-maghrib.png", category: "banque" },
  { name: "Maroc Telecom", slug: "maroc-telecom", logo: "/logos/maroc-telecom.png", category: "telecom" },
  { name: "Orange Maroc", slug: "orange-maroc", logo: "/logos/orange-maroc.svg", category: "telecom" },
  { name: "inwi", slug: "inwi", logo: "/logos/inwi.png", category: "telecom" },
  { name: "OCP Group", slug: "ocp", logo: "/logos/ocp.png", category: "industrie" },
  { name: "Royal Air Maroc", slug: "royal-air-maroc", logo: "/logos/royal-air-maroc.svg", category: "industrie" },
  { name: "ONCF", slug: "oncf", logo: "/logos/oncf.png", category: "industrie" },
  { name: "Managem", slug: "managem", logo: "/logos/managem.png", category: "industrie" },
  { name: "LafargeHolcim", slug: "lafargeholcim-maroc", logo: "/logos/lafargeholcim.png", category: "industrie" },
  { name: "Renault Maroc", slug: "renault-maroc", logo: "/logos/renault-maroc.png", category: "industrie" },
  { name: "Stellantis", slug: "stellantis", logo: "/logos/stellantis.png", category: "industrie" },
  { name: "Marjane", slug: "marjane", logo: "/logos/marjane.png", category: "retail" },
  { name: "Label'Vie", slug: "labelvie", logo: "/logos/labelvie.png", category: "retail" },
  { name: "Aswak Assalam", slug: "aswak-assalam", logo: "/logos/aswak-assalam.png", category: "retail" },
  { name: "BIM", slug: "bim", logo: "/logos/bim.svg", category: "retail" },
  { name: "Auto Hall", slug: "auto-hall", logo: "/logos/auto-hall.png", category: "retail" },
  { name: "Capgemini", slug: "capgemini", logo: "/logos/capgemini.png", category: "tech" },
  { name: "CGI", slug: "cgi", logo: "/logos/cgi.png", category: "tech" },
  { name: "DXC Technology", slug: "dxc-technology", logo: "/logos/dxc-technology.png", category: "tech" },
  { name: "Wafa Assurance", slug: "wafa-assurance", logo: "/logos/wafa-assurance.png", category: "assurance" },
  { name: "RMA Watanya", slug: "rma-watanya", logo: "/logos/rma-watanya.png", category: "assurance" },
  { name: "Saham Assurance", slug: "saham-assurance", logo: "/logos/saham-assurance.png", category: "assurance" },
  { name: "AXA Assurance", slug: "axa-maroc", logo: "/logos/axa-maroc.png", category: "assurance" },
  { name: "CDG", slug: "cdg", logo: "/logos/cdg.svg", category: "public" },
  { name: "ANAPEC", slug: "anapec", logo: "/logos/anapec.svg", category: "public" },
  { name: "Emploi Public", slug: "emploi-public", logo: "/logos/emploi-public.svg", category: "public" },
  { name: "ONEE", slug: "onee", logo: "/logos/onee.png", category: "public" },
  { name: "MASEN", slug: "masen", logo: "/logos/masen.png", category: "public" },
];

export const LOGO_CATEGORIES = [
  "Banques",
  "Télécoms",
  "Industrie",
  "Retail",
  "Tech",
  "Assurances",
  "Secteur public",
] as const;
