import { SALARY_DATA, FEATURED_COMPANIES } from "./premium-data";
import { estimateMoroccanSalary } from "./moroccan-salary-estimate";
import { extractSalaryFromJobText } from "./moroccan-salary-parser";
import {
  buildJobInternalLinks,
  matchSalaryRole,
  type JobLinkContext,
} from "./seo-engine/internal-links";

export interface JobSection {
  id: string;
  title: string;
  content: string;
}

export interface SalaryInsight {
  display: string | null;
  min: number | null;
  max: number | null;
  median: number | null;
  marketMedian: number;
  trend: string;
  source: "scraped" | "estimated" | "none";
}

export interface WhyHighlight {
  icon: string;
  title: string;
  description: string;
}

export interface BenefitItem {
  icon: string;
  title: string;
  description: string;
}

const SECTION_HEADERS = [
  { pattern: /^(mission|mision)\s*:?\s*$/i, id: "mission", title: "Mission" },
  { pattern: /^(responsabilit[eé]s?|vos missions)\s*:?\s*$/i, id: "responsibilities", title: "Responsabilités" },
  { pattern: /^(profil recherch[eé]|profil|exigences|qualifications|comp[eé]tences requises)\s*:?\s*$/i, id: "requirements", title: "Profil recherché" },
  { pattern: /^(avantages|benefits|b[eé]n[eé]fices|ce que nous offrons)\s*:?\s*$/i, id: "benefits", title: "Avantages" },
  { pattern: /^(technologies|stack technique|outils)\s*:?\s*$/i, id: "technologies", title: "Technologies" },
  { pattern: /^(langues|languages)\s*:?\s*$/i, id: "languages", title: "Langues" },
  { pattern: /^(exp[eé]rience|niveau d'exp[eé]rience)\s*:?\s*$/i, id: "experience", title: "Expérience" },
  { pattern: /^(formation|[eé]ducation|dipl[oô]me)\s*:?\s*$/i, id: "education", title: "Formation" },
  { pattern: /^(description|contexte|pr[eé]sentation)\s*:?\s*$/i, id: "description", title: "Description" },
];

const SKILL_KEYWORDS = [
  "SAP", "Excel", "Python", "Java", "React", "SQL", "Finance", "Comptabilité",
  "Leadership", "Communication", "English", "Anglais", "Français", "Arabic",
  "Project Management", "Agile", "Scrum", "Power BI", "Oracle", "Salesforce",
  "Risk Management", "Audit", "Marketing", "RH", "Jira", "AWS", "Docker",
];

const BENEFIT_PATTERNS: { pattern: RegExp; icon: string; title: string; description: string }[] = [
  { pattern: /t[eé]l[eé]travail|remote|hybride|hybrid/i, icon: "🏠", title: "Télétravail", description: "Flexibilité de travail à distance ou en mode hybride." },
  { pattern: /bonus|prime|13[eè]me mois/i, icon: "💰", title: "Bonus & primes", description: "Rémunération variable et primes de performance." },
  { pattern: /assurance|mutuelle|couverture sant[eé]/i, icon: "🏥", title: "Assurance santé", description: "Couverture médicale pour vous et votre famille." },
  { pattern: /formation|d[eé]veloppement professionnel|certification/i, icon: "📚", title: "Formation", description: "Programmes de montée en compétences et certifications." },
  { pattern: /horaires flexibles|flexibilit[eé]/i, icon: "⏰", title: "Horaires flexibles", description: "Organisation du temps de travail adaptée." },
  { pattern: /international|multicultural|global/i, icon: "🌍", title: "Environnement international", description: "Projets et équipes à dimension mondiale." },
  { pattern: /ticket restaurant|restauration/i, icon: "🍽", title: "Tickets restaurant", description: "Avantage repas quotidien." },
  { pattern: /v[eé]hicule|transport/i, icon: "🚗", title: "Transport", description: "Indemnités ou véhicule de fonction." },
];

export function parseSalaryRange(
  salary: string | null,
  title = "",
  description?: string | null,
  requirements?: string | null
): SalaryInsight {
  const parsed = extractSalaryFromJobText({ salary, description, requirements });
  let min: number | null = null;
  let max: number | null = null;
  let source: SalaryInsight["source"] = "none";

  if (parsed) {
    min = parsed.min;
    max = parsed.max;
    source = "scraped";
  }

  const median = min && max ? Math.round((min + max) / 2) : min ?? max;
  const market = estimateMarketMedian(title);

  return {
    display: source === "scraped" ? (salary ?? parsed?.raw ?? null) : null,
    min,
    max,
    median,
    marketMedian: market.median,
    trend: market.trend,
    source,
  };
}

function estimateMarketMedian(title: string): { median: number; trend: string } {
  const est = estimateMoroccanSalary({ title });
  const role = SALARY_DATA.find((item) => {
    const words = item.title.toLowerCase().split(" ");
    return words.some((w) => title.toLowerCase().includes(w));
  });
  return { median: est.median, trend: role?.trend ?? "+6%" };
}

export function parseJobSections(description: string, requirements?: string | null): JobSection[] {
  const sections: JobSection[] = [];
  const lines = description.split(/\r?\n/);
  let current: JobSection | null = null;
  const buffer: string[] = [];

  function flush() {
    if (current && buffer.length > 0) {
      current.content = buffer.join("\n").trim();
      if (current.content) sections.push(current);
    }
    buffer.length = 0;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    const header = SECTION_HEADERS.find((h) => h.pattern.test(trimmed));
    if (header && trimmed.length < 60) {
      flush();
      current = { id: header.id, title: header.title, content: "" };
    } else {
      if (!current) current = { id: "description", title: "Description", content: "" };
      buffer.push(line);
    }
  }
  flush();

  if (requirements?.trim()) {
    const existing = sections.find((s) => s.id === "requirements");
    if (existing) {
      existing.content += "\n\n" + requirements.trim();
    } else {
      sections.push({ id: "requirements", title: "Profil recherché", content: requirements.trim() });
    }
  }

  if (sections.length === 0) {
    const paragraphs = description.split(/\n\n+/).filter(Boolean);
    if (paragraphs.length > 1) {
      paragraphs.forEach((p, i) => {
        sections.push({
          id: i === 0 ? "mission" : `section-${i}`,
          title: i === 0 ? "Mission" : i === paragraphs.length - 1 ? "Profil recherché" : "Responsabilités",
          content: p.trim(),
        });
      });
    } else {
      sections.push({ id: "description", title: "Description du poste", content: description.trim() });
    }
  }

  return sections;
}

export function extractSkills(tags: { tag: { name: string; slug: string } }[], description: string): string[] {
  const fromTags = tags.map((t) => t.tag.name);
  const text = description.toLowerCase();
  const fromText = SKILL_KEYWORDS.filter((s) => text.includes(s.toLowerCase()));
  return Array.from(new Set([...fromTags, ...fromText])).slice(0, 12);
}

export function extractBenefits(description: string, requirements: string | null, remote: boolean): BenefitItem[] {
  const fullText = `${description} ${requirements ?? ""}`;
  const found = BENEFIT_PATTERNS.filter((b) => b.pattern.test(fullText)).map(({ icon, title, description: d }) => ({
    icon, title, description: d,
  }));

  if (remote && !found.some((f) => f.title.includes("Télétravail"))) {
    found.unshift(BENEFIT_PATTERNS[0]);
  }

  if (found.length < 3) {
    found.push(
      { icon: "📈", title: "Évolution de carrière", description: "Perspectives d'avancement au sein de l'entreprise." },
      { icon: "🤝", title: "Équipe dynamique", description: "Collaboration avec des professionnels talentueux." },
    );
  }

  return found.slice(0, 6);
}

export function buildWhyHighlights(
  job: {
    remote: boolean;
    salary: string | null;
    contractType: string | null;
    description: string;
    companyRef: { slug: string } | null;
  },
  isTopEmployer: boolean
): WhyHighlight[] {
  const highlights: WhyHighlight[] = [];

  if (job.salary) {
    highlights.push({ icon: "💰", title: "Salaire compétitif", description: "Rémunération attractive alignée sur le marché marocain." });
  }
  if (job.remote || /hybride|hybrid/i.test(job.description)) {
    highlights.push({ icon: "🏠", title: "Flexibilité", description: "Organisation de travail moderne avec options remote ou hybride." });
  }
  if (job.contractType === "CDI") {
    highlights.push({ icon: "📄", title: "Stabilité CDI", description: "Contrat durable pour construire votre avenir professionnel." });
  }
  if (isTopEmployer) {
    highlights.push({ icon: "⭐", title: "Top employeur", description: "Entreprise reconnue pour la qualité de vie au travail." });
  }
  if (/international|global|multicultural/i.test(job.description)) {
    highlights.push({ icon: "🌍", title: "Environnement international", description: "Exposition à des projets et standards internationaux." });
  }
  if (/leadership|manager|direction|responsable/i.test(job.description)) {
    highlights.push({ icon: "🚀", title: "Leadership", description: "Opportunités de prise de responsabilités et de management." });
  }

  if (highlights.length < 3) {
    highlights.push({ icon: "✨", title: "Opportunité premium", description: "Poste sélectionné pour sa qualité et son potentiel de carrière." });
  }

  return highlights.slice(0, 4);
}

export function getCompanyMeta(slug: string | undefined) {
  const featured = FEATURED_COMPANIES.find((c) => c.slug === slug);
  return {
    industry: featured?.industry ?? "Entreprise",
    topEmployer: featured?.topEmployer ?? false,
  };
}

export function buildJobFaq(job: {
  title: string;
  company: string;
  city: string;
  contractType: string | null;
  remote: boolean;
  salary: string | null;
  description: string;
  requirements: string | null;
}): { q: string; a: string }[] {
  const salaryInsight = parseSalaryRange(job.salary, job.title);
  return [
    {
      q: `Quel salaire pour ${job.title} au Maroc ?`,
      a: salaryInsight.source === "scraped" && salaryInsight.display
        ? `Pour ce poste chez ${job.company}, la fourchette annoncée est ${salaryInsight.display} (donnée réelle). La médiane du marché marocain pour des postes similaires est d'environ ${salaryInsight.marketMedian.toLocaleString("fr-MA")} MAD.`
        : `Pour ${job.title} au Maroc, l'estimation de marché est d'environ ${salaryInsight.marketMedian.toLocaleString("fr-MA")} MAD/mois (donnée estimée). Consultez notre section salaires pour des fourchettes détaillées par métier.`,
    },
    {
      q: `Quelles qualifications pour ${job.title} ?`,
      a: job.requirements
        ? excerptRequirements(job.requirements)
        : `Consultez la section profil recherché pour les compétences et qualifications attendues par ${job.company}.`,
    },
    {
      q: `Ce poste est-il en télétravail ?`,
      a: job.remote
        ? `Oui, ${job.company} propose une modalité de télétravail pour ce poste à ${job.city}.`
        : /hybride|hybrid/i.test(job.description)
          ? `Ce poste propose un mode de travail hybride à ${job.city}.`
          : `Ce poste est principalement sur site à ${job.city}. Contactez ${job.company} pour plus de détails.`,
    },
    {
      q: `Quelle expérience est requise ?`,
      a: /senior|5 ans|7 ans|10 ans/i.test(job.description + (job.requirements ?? ""))
        ? "Une expérience significative est requise pour ce poste. Consultez le profil recherché pour les détails."
        : /junior|d[eé]butant|stage|0-2 ans/i.test(job.description + (job.requirements ?? ""))
          ? "Ce poste convient aux profils junior ou en début de carrière."
          : "Une expérience intermédiaire est généralement attendue. Vérifiez les exigences dans la description.",
    },
  ];
}

function excerptRequirements(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 280 ? clean.slice(0, 277) + "…" : clean;
}

export function buildRelatedSearches(job: {
  company: string;
  city: string;
  contractType: string | null;
  title: string;
  companyRef: { slug: string } | null;
  location: { slug: string } | null;
  tags: { tag: { slug: string; name: string } }[];
}): { label: string; href: string }[] {
  const ctx: JobLinkContext = {
    title: job.title,
    company: job.company,
    city: job.city,
    contractType: job.contractType,
    companyRef: job.companyRef,
    location: job.location,
    tags: job.tags,
    salaryRoleSlug: matchSalaryRole(job.title)?.slug ?? null,
  };

  const internal = buildJobInternalLinks(ctx);

  const links = internal.map((l) => ({ label: l.label, href: l.href }));

  if (job.companyRef?.slug && job.location?.slug) {
    links.unshift({
      label: `Emploi ${job.company} ${job.city}`,
      href: `/emplois/${job.location.slug}?company=${job.companyRef.slug}`,
    });
  }

  if (job.contractType && job.location?.slug) {
    links.push({
      label: `Emploi ${job.contractType} ${job.city}`,
      href: `/emplois/${job.location.slug}?contract=${encodeURIComponent(job.contractType)}`,
    });
  }

  const seen = new Set<string>();
  const deduped: { label: string; href: string }[] = [];
  for (const link of links) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    deduped.push(link);
  }

  return deduped.slice(0, 8);
}

export function getWorkMode(job: { remote: boolean; description: string }): string {
  if (job.remote) return "Remote";
  if (/hybride|hybrid/i.test(job.description)) return "Hybride";
  return "Sur site";
}
