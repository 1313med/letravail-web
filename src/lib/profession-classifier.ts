import { PROFESSION_SEEDS, type ProfessionSeed } from "./profession-taxonomy";

export type ProfessionMatch = {
  profession: ProfessionSeed;
  score: number;
  matchedTerms: string[];
};

const TITLE_ALIASES: Record<string, string[]> = {
  "developpeur-frontend": [
    "frontend",
    "front-end",
    "front end",
    "react",
    "vue",
    "angular",
    "ui engineer",
  ],
  "developpeur-backend": [
    "backend",
    "back-end",
    "back end",
    "api developer",
    "node.js",
    "java developer",
  ],
  "developpeur-full-stack": ["full stack", "fullstack", "full-stack"],
  "developpeur-web": ["développeur web", "web developer", "dev web"],
  "data-analyst": ["data analyst", "analyste data", "business analyst data"],
  "data-scientist": ["data scientist", "machine learning", "ml engineer"],
  "devops": ["devops", "sre", "site reliability"],
  "product-owner": ["product owner", "product manager", "chef de produit"],
  "chef-de-projet": ["chef de projet", "project manager", "chef projet", "pmo"],
  "business-analyst": ["business analyst", "analyste fonctionnel"],
  "technicien-support": ["support it", "helpdesk", "technicien support"],
  "marketing-digital": ["marketing digital", "digital marketing", "growth"],
  "community-manager": ["community manager", "social media"],
  "comptable": ["comptable", "accountant", "comptabilité"],
  "commercial": ["commercial", "chargé d'affaires", "business developer"],
  "responsable-rh": ["responsable rh", "drh", "ressources humaines"],
  "ingenieur": ["ingénieur", "engineer"],
};

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function scoreProfession(title: string, profession: ProfessionSeed): ProfessionMatch | null {
  const normTitle = normalize(title);
  const matchedTerms: string[] = [];
  let score = 0;

  const allTerms = [
    profession.name,
    ...profession.aliases,
    ...profession.keywords,
    ...(TITLE_ALIASES[profession.slug] ?? []),
  ];

  for (const term of allTerms) {
    const normTerm = normalize(term);
    if (normTerm.length < 3) continue;

    if (normTitle === normTerm) {
      score += 100;
      matchedTerms.push(term);
    } else if (normTitle.includes(normTerm)) {
      const weight = normTerm.length >= 10 ? 40 : normTerm.length >= 6 ? 30 : 20;
      score += weight;
      matchedTerms.push(term);
    } else if (normTerm.split(/\s+/).every((w) => w.length > 2 && normTitle.includes(w))) {
      score += 25;
      matchedTerms.push(term);
    }
  }

  if (score === 0) return null;
  return { profession, score, matchedTerms: Array.from(new Set(matchedTerms)) };
}

/** Best profession match for a job title */
export function classifyJobTitle(title: string): ProfessionMatch | null {
  const matches = classifyJobTitleAll(title);
  return matches[0] ?? null;
}

/** All profession matches above threshold, sorted by score */
export function classifyJobTitleAll(title: string, minScore = 20): ProfessionMatch[] {
  const results: ProfessionMatch[] = [];
  for (const profession of PROFESSION_SEEDS) {
    const m = scoreProfession(title, profession);
    if (m && m.score >= minScore) results.push(m);
  }
  results.sort((a, b) => b.score - a.score);
  return results;
}

export function isWeakMatch(match: ProfessionMatch | null): boolean {
  if (!match) return true;
  return match.score < 30;
}

export function isMultiMatch(matches: ProfessionMatch[]): boolean {
  return matches.length >= 2 && matches[0].score - matches[1].score < 15;
}

export function isUnclassified(matches: ProfessionMatch[]): boolean {
  return matches.length === 0 || matches[0].score < 20;
}

export function professionSearchTerms(profession: ProfessionSeed): string[] {
  return Array.from(
    new Set([
      profession.name,
      ...profession.aliases,
      ...profession.keywords,
      ...(TITLE_ALIASES[profession.slug] ?? []),
    ])
  );
}

export function matchProfessionFromTitle(title: string): ProfessionSeed | null {
  return classifyJobTitle(title)?.profession ?? null;
}

export function professionJobWhere(profession: ProfessionSeed) {
  const terms = professionSearchTerms(profession);
  return {
    OR: terms.map((kw) => ({
      OR: [
        { title: { contains: kw, mode: "insensitive" as const } },
        { description: { contains: kw, mode: "insensitive" as const } },
      ],
    })),
  };
}
