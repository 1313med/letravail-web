import { TOP_CITIES } from "./constants";
import { cityNameToSlug } from "./jobs-discovery";

export const SEO_SECTORS = [
  {
    slug: "tech",
    label: "Tech",
    tagSlug: "tech",
    intro:
      "Le secteur tech au Maroc connaît une croissance soutenue : développement, data, cybersécurité et cloud recrutent à Casablanca, Rabat et dans les technopoles du royaume.",
  },
  {
    slug: "finance",
    label: "Finance",
    tagSlug: "finance",
    intro:
      "La finance et la comptabilité restent des piliers du marché marocain. Banques, cabinets d'audit et sociétés de gestion publient régulièrement des postes en CDI et CDD.",
  },
  {
    slug: "marketing",
    label: "Marketing",
    tagSlug: "marketing",
    intro:
      "Marketing digital, communication et brand management : les entreprises marocaines investissent dans la visibilité et le growth, avec une forte demande à Casablanca et Rabat.",
  },
  {
    slug: "rh",
    label: "RH",
    tagSlug: "rh",
    intro:
      "Les ressources humaines et le recrutement sont en tension sur le marché marocain. DRH, chargés de recrutement et business partners RH sont très recherchés.",
  },
  {
    slug: "logistique",
    label: "Logistique",
    tagSlug: "logistique",
    intro:
      "Logistique, supply chain et transport : le Maroc, carrefour Afrique-Europe, offre de nombreuses opportunités autour de Tanger Med, Casablanca et Kénitra.",
  },
  {
    slug: "sante",
    label: "Santé",
    tagSlug: "sante",
    intro:
      "Le secteur de la santé recrute médecins, infirmiers, pharmaciens et profils administratifs dans les cliniques privées et établissements publics.",
  },
  {
    slug: "education",
    label: "Éducation",
    tagSlug: "education",
    intro:
      "Enseignement supérieur, formation et EdTech : les écoles et universités marocaines recrutent enseignants, formateurs et coordinateurs pédagogiques.",
  },
  {
    slug: "banque",
    label: "Banque",
    tagSlug: "banque",
    intro:
      "Les banques marocaines — Attijariwafa, CIH, BMCE et banques participatives — recrutent en permanence à Casablanca, Rabat et dans les grandes villes.",
  },
  {
    slug: "telecom",
    label: "Télécom",
    tagSlug: "telecom",
    intro:
      "Maroc Telecom, Orange et les opérateurs alternatifs recrutent des profils réseau, commercial, support et ingénierie à l'échelle nationale.",
  },
  {
    slug: "industrie",
    label: "Industrie",
    tagSlug: "industrie",
    intro:
      "Industrie automobile, agroalimentaire et chimie : OCP, Renault et les zones industrielles génèrent des milliers d'emplois techniques et opérationnels.",
  },
] as const;

export const SEO_CONTRACT_LANDINGS = [
  { slug: "stage", label: "Stage", contract: "Stage" },
  { slug: "cdi", label: "CDI", contract: "CDI" },
  { slug: "cdd", label: "CDD", contract: "CDD" },
] as const;

export const SEO_CITIES = TOP_CITIES.map((name) => {
  const short = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return { name, short, slug: cityNameToSlug(name) };
});

export type SectorLanding = {
  type: "sector";
  sector: (typeof SEO_SECTORS)[number];
  path: string;
};

export type ComboLanding = {
  type: "combo";
  sector: (typeof SEO_SECTORS)[number];
  city: (typeof SEO_CITIES)[number];
  path: string;
};

export type ContractLanding = {
  type: "contract";
  contract: (typeof SEO_CONTRACT_LANDINGS)[number];
  path: string;
};

export type LandingPage =
  | SectorLanding
  | ComboLanding
  | ContractLanding;

export function landingPath(slug: string): string {
  return `/${slug}`;
}

export function sectorLandingSlug(sectorSlug: string): string {
  return `emploi-${sectorSlug}-maroc`;
}

export function comboLandingSlug(sectorSlug: string, cityShort: string): string {
  return `emploi-${sectorSlug}-${cityShort}`;
}

export function contractLandingSlug(contractSlug: string): string {
  return `emploi-${contractSlug}-maroc`;
}

export function parseLandingSlug(slug: string): LandingPage | null {
  if (!slug.startsWith("emploi-")) return null;

  const rest = slug.slice("emploi-".length);

  for (const contract of SEO_CONTRACT_LANDINGS) {
    if (rest === `${contract.slug}-maroc`) {
      return {
        type: "contract",
        contract,
        path: landingPath(slug),
      };
    }
  }

  if (rest.endsWith("-maroc")) {
    const sectorSlug = rest.slice(0, -"-maroc".length);
    const sector = SEO_SECTORS.find((s) => s.slug === sectorSlug);
    if (sector) {
      return { type: "sector", sector, path: landingPath(slug) };
    }
    return null;
  }

  for (const city of SEO_CITIES) {
    const suffix = `-${city.short}`;
    if (rest.endsWith(suffix)) {
      const sectorSlug = rest.slice(0, -suffix.length);
      const sector = SEO_SECTORS.find((s) => s.slug === sectorSlug);
      if (sector) {
        return { type: "combo", sector, city, path: landingPath(slug) };
      }
    }
  }

  return null;
}

export function isLandingSlug(slug: string): boolean {
  return slug.startsWith("emploi-") || slug.startsWith("salaire-");
}

export function landingToJobFilters(landing: LandingPage) {
  switch (landing.type) {
    case "sector":
      return { tag: landing.sector.tagSlug };
    case "combo":
      return { tag: landing.sector.tagSlug, city: landing.city.slug };
    case "contract":
      return { contract: landing.contract.contract };
  }
}

export function landingTitle(landing: LandingPage): string {
  switch (landing.type) {
    case "sector":
      return `Emploi ${landing.sector.label} au Maroc`;
    case "combo":
      return `Emploi ${landing.sector.label} à ${landing.city.name}`;
    case "contract":
      return `Emploi ${landing.contract.label} au Maroc`;
  }
}

export function landingH1(landing: LandingPage, jobCount: number): string {
  switch (landing.type) {
    case "sector":
      return `Emploi ${landing.sector.label} au Maroc — ${jobCount} offres`;
    case "combo":
      return `Emploi ${landing.sector.label} à ${landing.city.name} — ${jobCount} offres`;
    case "contract":
      return `Offres en ${landing.contract.label} au Maroc — ${jobCount} postes`;
  }
}

export function landingIntro(landing: LandingPage): string {
  switch (landing.type) {
    case "sector":
      return landing.sector.intro;
    case "combo":
      return `${landing.sector.intro} Découvrez ci-dessous les offres ${landing.sector.label.toLowerCase()} à ${landing.city.name}, mises à jour automatiquement.`;
    case "contract":
      return `Trouvez des postes en ${landing.contract.label} au Maroc. Letravail.ma agrège les offres publiées par les employeurs marocains pour vous faire gagner du temps.`;
  }
}

export function buildLandingFaq(
  landing: LandingPage,
  jobCount: number
): { q: string; a: string }[] {
  const title = landingTitle(landing);
  const base = [
    {
      q: `Combien d'offres ${title.toLowerCase()} sont disponibles ?`,
      a: `Actuellement, ${jobCount} offre${jobCount > 1 ? "s" : ""} correspond${jobCount > 1 ? "ent" : ""} à votre recherche sur Letravail.ma.`,
    },
    {
      q: "Comment postuler à une offre ?",
      a: "Cliquez sur une offre puis sur « Postuler » — vous serez redirigé vers le site officiel de l'employeur pour candidater.",
    },
  ];

  if (landing.type === "combo") {
    base.unshift({
      q: `Pourquoi chercher un emploi ${landing.sector.label} à ${landing.city.name} ?`,
      a: `${landing.city.name} concentre de nombreuses entreprises du secteur ${landing.sector.label.toLowerCase()}. Letravail.ma centralise leurs offres au même endroit.`,
    });
  }

  return base;
}

export function getAllLandingSlugCandidates(): string[] {
  const slugs: string[] = [];
  for (const sector of SEO_SECTORS) {
    slugs.push(sectorLandingSlug(sector.slug));
    for (const city of SEO_CITIES) {
      slugs.push(comboLandingSlug(sector.slug, city.short));
    }
  }
  for (const contract of SEO_CONTRACT_LANDINGS) {
    slugs.push(contractLandingSlug(contract.slug));
  }
  return slugs;
}
