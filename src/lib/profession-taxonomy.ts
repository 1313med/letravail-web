import { slugify } from "./utils";

export type ProfessionSeed = {
  slug: string;
  name: string;
  aliases: string[];
  sectorSlug: string;
  skills: string[];
  salarySlug?: string;
  relatedSlugs: string[];
  keywords: string[];
};

/** 50 normalized professions — canonical taxonomy for SEO + knowledge graph */
export const PROFESSION_SEEDS: ProfessionSeed[] = [
  { slug: "developpeur-web", name: "Développeur Web", aliases: ["dev web", "web developer"], sectorSlug: "tech", skills: ["HTML", "CSS", "JavaScript", "PHP"], salarySlug: "developpeur-maroc", relatedSlugs: ["developpeur-frontend", "developpeur-backend", "developpeur-full-stack"], keywords: ["développeur web", "web developer", "dev web"] },
  { slug: "developpeur-frontend", name: "Développeur Frontend", aliases: ["front-end developer", "front end"], sectorSlug: "tech", skills: ["React", "Vue.js", "TypeScript", "CSS"], salarySlug: "developpeur-maroc", relatedSlugs: ["developpeur-web", "developpeur-full-stack", "designer-ux-ui"], keywords: ["développeur frontend", "front-end", "frontend developer"] },
  { slug: "developpeur-backend", name: "Développeur Backend", aliases: ["back-end developer", "backend engineer"], sectorSlug: "tech", skills: ["Node.js", "Python", "Java", "SQL"], salarySlug: "developpeur-maroc", relatedSlugs: ["developpeur-web", "developpeur-full-stack", "devops"], keywords: ["développeur backend", "back-end", "backend developer"] },
  { slug: "developpeur-full-stack", name: "Développeur Full Stack", aliases: ["fullstack", "full stack developer"], sectorSlug: "tech", skills: ["JavaScript", "React", "Node.js", "SQL"], salarySlug: "developpeur-maroc", relatedSlugs: ["developpeur-frontend", "developpeur-backend", "developpeur-web"], keywords: ["full stack", "fullstack", "développeur full stack"] },
  { slug: "data-analyst", name: "Data Analyst", aliases: ["analyste data", "analyste de données"], sectorSlug: "tech", skills: ["SQL", "Excel", "Power BI", "Python"], salarySlug: "data-analyst-maroc", relatedSlugs: ["data-scientist", "business-analyst", "developpeur-backend"], keywords: ["data analyst", "analyste data", "analyste de données"] },
  { slug: "data-scientist", name: "Data Scientist", aliases: ["scientifique des données"], sectorSlug: "tech", skills: ["Python", "Machine Learning", "TensorFlow", "SQL"], salarySlug: "data-analyst-maroc", relatedSlugs: ["data-analyst", "ingenieur-ia", "developpeur-backend"], keywords: ["data scientist", "machine learning", "scientifique données"] },
  { slug: "devops", name: "DevOps", aliases: ["ingénieur devops", "sre"], sectorSlug: "tech", skills: ["Docker", "Kubernetes", "CI/CD", "AWS"], relatedSlugs: ["developpeur-backend", "ingenieur-reseau", "ingenieur-cloud"], keywords: ["devops", "sre", "site reliability"] },
  { slug: "ingenieur-cloud", name: "Ingénieur Cloud", aliases: ["cloud engineer", "architecte cloud"], sectorSlug: "tech", skills: ["AWS", "Azure", "Docker", "Terraform"], relatedSlugs: ["devops", "ingenieur-reseau", "developpeur-backend"], keywords: ["cloud engineer", "ingénieur cloud", "architecte cloud"] },
  { slug: "ingenieur-ia", name: "Ingénieur IA", aliases: ["ingénieur intelligence artificielle", "ai engineer"], sectorSlug: "tech", skills: ["Python", "TensorFlow", "NLP", "Deep Learning"], relatedSlugs: ["data-scientist", "developpeur-backend"], keywords: ["intelligence artificielle", "ai engineer", "ingénieur ia"] },
  { slug: "cybersecurite", name: "Expert Cybersécurité", aliases: ["analyste sécurité", "pentester"], sectorSlug: "tech", skills: ["Sécurité réseau", "Pentest", "SIEM", "ISO 27001"], relatedSlugs: ["ingenieur-reseau", "administrateur-systeme"], keywords: ["cybersécurité", "sécurité informatique", "pentest"] },
  { slug: "administrateur-systeme", name: "Administrateur Système", aliases: ["sysadmin", "admin système"], sectorSlug: "tech", skills: ["Linux", "Windows Server", "VMware", "Active Directory"], relatedSlugs: ["ingenieur-reseau", "technicien-support", "devops"], keywords: ["administrateur système", "sysadmin", "admin système"] },
  { slug: "ingenieur-reseau", name: "Ingénieur Réseau", aliases: ["network engineer", "ingénieur réseaux"], sectorSlug: "tech", skills: ["Cisco", "Routage", "Switching", "Firewall"], relatedSlugs: ["administrateur-systeme", "cybersecurite", "technicien-support"], keywords: ["ingénieur réseau", "network engineer", "réseaux"] },
  { slug: "technicien-support", name: "Technicien Support", aliases: ["support IT", "technicien informatique"], sectorSlug: "tech", skills: ["Helpdesk", "Windows", "Réseau", "Ticketing"], salarySlug: "support-client-maroc", relatedSlugs: ["administrateur-systeme", "technicien-support-client"], keywords: ["technicien support", "support it", "helpdesk"] },
  { slug: "comptable", name: "Comptable", aliases: ["accountant", "aide-comptable"], sectorSlug: "finance", skills: ["Comptabilité générale", "Sage", "TVA", "Bilan"], salarySlug: "comptable-maroc", relatedSlugs: ["controleur-gestion", "auditeur", "gestionnaire-paie"], keywords: ["comptable", "comptabilité", "accountant"] },
  { slug: "controleur-gestion", name: "Contrôleur de Gestion", aliases: ["controller", "contrôle de gestion"], sectorSlug: "finance", skills: ["Budget", "Reporting", "Excel", "ERP"], relatedSlugs: ["comptable", "auditeur", "chef-de-projet"], keywords: ["contrôleur de gestion", "controller", "contrôle gestion"] },
  { slug: "auditeur", name: "Auditeur", aliases: ["auditeur financier", "auditeur interne"], sectorSlug: "finance", skills: ["Audit", "Normes IFRS", "Risques", "Conformité"], relatedSlugs: ["comptable", "controleur-gestion"], keywords: ["auditeur", "audit financier", "auditeur interne"] },
  { slug: "gestionnaire-paie", name: "Gestionnaire de Paie", aliases: ["payroll", "responsable paie"], sectorSlug: "finance", skills: ["Paie", "CNSS", "Droit social", "Sage Paie"], relatedSlugs: ["comptable", "responsable-rh"], keywords: ["gestionnaire paie", "paie", "payroll"] },
  { slug: "commercial", name: "Commercial", aliases: ["chargé d'affaires", "vendeur"], sectorSlug: "marketing", skills: ["Prospection", "Négociation", "CRM", "Vente B2B"], salarySlug: "commercial-maroc", relatedSlugs: ["business-developer", "key-account-manager", "directeur-commercial"], keywords: ["commercial", "vente", "chargé d'affaires"] },
  { slug: "business-developer", name: "Business Developer", aliases: ["biz dev", "développeur commercial"], sectorSlug: "marketing", skills: ["Prospection", "Partenariats", "Pitch", "CRM"], salarySlug: "commercial-maroc", relatedSlugs: ["commercial", "key-account-manager"], keywords: ["business developer", "biz dev", "développeur commercial"] },
  { slug: "key-account-manager", name: "Key Account Manager", aliases: ["grands comptes", "kam"], sectorSlug: "marketing", skills: ["Grands comptes", "Négociation", "Fidélisation", "CRM"], relatedSlugs: ["commercial", "directeur-commercial"], keywords: ["key account", "grands comptes", "kam"] },
  { slug: "directeur-commercial", name: "Directeur Commercial", aliases: ["head of sales", "directeur des ventes"], sectorSlug: "marketing", skills: ["Stratégie commerciale", "Management", "KPI", "Budget"], relatedSlugs: ["commercial", "key-account-manager"], keywords: ["directeur commercial", "head of sales", "directeur ventes"] },
  { slug: "marketing-digital", name: "Marketing Digital", aliases: ["digital marketer", "chargé marketing digital"], sectorSlug: "marketing", skills: ["SEO", "Google Ads", "Social Media", "Analytics"], salarySlug: "marketing-maroc", relatedSlugs: ["community-manager", "charge-communication", "chef-de-projet-marketing"], keywords: ["marketing digital", "digital marketing", "growth"] },
  { slug: "community-manager", name: "Community Manager", aliases: ["social media manager", "cm"], sectorSlug: "marketing", skills: ["Réseaux sociaux", "Content", "Community", "Canva"], relatedSlugs: ["marketing-digital", "charge-communication"], keywords: ["community manager", "social media", "cm"] },
  { slug: "charge-communication", name: "Chargé de Communication", aliases: ["communication officer", "chargé com"], sectorSlug: "marketing", skills: ["Rédaction", "Relations presse", "Événementiel", "Branding"], salarySlug: "marketing-maroc", relatedSlugs: ["marketing-digital", "community-manager"], keywords: ["chargé communication", "communication", "relations presse"] },
  { slug: "chef-de-projet-marketing", name: "Chef de Projet Marketing", aliases: ["marketing project manager"], sectorSlug: "marketing", skills: ["Gestion de projet", "Campagnes", "Budget", "KPI"], relatedSlugs: ["marketing-digital", "chef-de-projet"], keywords: ["chef projet marketing", "marketing project manager"] },
  { slug: "designer-ux-ui", name: "Designer UX/UI", aliases: ["ux designer", "ui designer", "product designer"], sectorSlug: "marketing", skills: ["Figma", "UX Research", "Prototypage", "Design System"], salarySlug: "designer-maroc", relatedSlugs: ["developpeur-frontend", "designer-graphique"], keywords: ["ux designer", "ui designer", "product designer"] },
  { slug: "designer-graphique", name: "Designer Graphique", aliases: ["graphiste", "graphic designer"], sectorSlug: "marketing", skills: ["Photoshop", "Illustrator", "InDesign", "Branding"], salarySlug: "designer-maroc", relatedSlugs: ["designer-ux-ui", "community-manager"], keywords: ["designer graphique", "graphiste", "graphic designer"] },
  { slug: "chef-de-projet", name: "Chef de Projet", aliases: ["project manager", "chef projet"], sectorSlug: "tech", skills: ["Agile", "Scrum", "Gestion de projet", "Jira"], salarySlug: "chef-projet-maroc", relatedSlugs: ["product-owner", "scrum-master", "business-analyst"], keywords: ["chef de projet", "project manager", "chef projet"] },
  { slug: "product-owner", name: "Product Owner", aliases: ["po", "product manager"], sectorSlug: "tech", skills: ["Product Management", "Backlog", "Agile", "User Stories"], relatedSlugs: ["chef-de-projet", "scrum-master", "business-analyst"], keywords: ["product owner", "product manager", "po"] },
  { slug: "scrum-master", name: "Scrum Master", aliases: ["agile coach"], sectorSlug: "tech", skills: ["Scrum", "Agile", "Facilitation", "Kanban"], relatedSlugs: ["chef-de-projet", "product-owner"], keywords: ["scrum master", "agile coach", "scrum"] },
  { slug: "business-analyst", name: "Business Analyst", aliases: ["analyste fonctionnel", "ba"], sectorSlug: "tech", skills: ["Analyse fonctionnelle", "UML", "SQL", "Documentation"], relatedSlugs: ["data-analyst", "chef-de-projet", "product-owner"], keywords: ["business analyst", "analyste fonctionnel", "ba"] },
  { slug: "responsable-rh", name: "Responsable RH", aliases: ["drh", "hr manager", "responsable ressources humaines"], sectorSlug: "rh", skills: ["Recrutement", "GPEC", "Droit du travail", "Paie"], salarySlug: "rh-maroc", relatedSlugs: ["charge-recrutement", "gestionnaire-paie"], keywords: ["responsable rh", "drh", "ressources humaines"] },
  { slug: "charge-recrutement", name: "Chargé de Recrutement", aliases: ["recruteur", "talent acquisition"], sectorSlug: "rh", skills: ["Sourcing", "Entretiens", "ATS", "LinkedIn"], salarySlug: "rh-maroc", relatedSlugs: ["responsable-rh"], keywords: ["chargé recrutement", "recruteur", "talent acquisition"] },
  { slug: "technicien-support-client", name: "Support Client", aliases: ["service client", "customer support"], sectorSlug: "telecom", skills: ["Relation client", "Ticketing", "Communication", "CRM"], salarySlug: "support-client-maroc", relatedSlugs: ["technicien-support", "teleconseiller"], keywords: ["support client", "service client", "customer support"] },
  { slug: "teleconseiller", name: "Téléconseiller", aliases: ["call center", "conseiller client"], sectorSlug: "telecom", skills: ["Téléphone", "Écoute active", "Vente", "CRM"], salarySlug: "support-client-maroc", relatedSlugs: ["technicien-support-client", "commercial"], keywords: ["téléconseiller", "call center", "conseiller client"] },
  { slug: "ingenieur", name: "Ingénieur", aliases: ["engineer", "ing."], sectorSlug: "industrie", skills: ["Génie industriel", "AutoCAD", "Qualité", "Production"], salarySlug: "ingenieur-maroc", relatedSlugs: ["ingenieur-mecanique", "ingenieur-electrique", "technicien-maintenance"], keywords: ["ingénieur", "engineer", "ing."] },
  { slug: "ingenieur-mecanique", name: "Ingénieur Mécanique", aliases: ["mécanicien ingénieur"], sectorSlug: "industrie", skills: ["CAO", "SolidWorks", "Maintenance", "Production"], salarySlug: "ingenieur-maroc", relatedSlugs: ["ingenieur", "technicien-maintenance"], keywords: ["ingénieur mécanique", "mécanique", "solidworks"] },
  { slug: "ingenieur-electrique", name: "Ingénieur Électrique", aliases: ["électricien ingénieur"], sectorSlug: "industrie", skills: ["Électricité", "Automatisme", "Schémas", "Maintenance"], salarySlug: "ingenieur-maroc", relatedSlugs: ["ingenieur", "technicien-maintenance"], keywords: ["ingénieur électrique", "électricité", "automatisme"] },
  { slug: "technicien-maintenance", name: "Technicien de Maintenance", aliases: ["maintenance industrielle"], sectorSlug: "industrie", skills: ["Maintenance préventive", "Diagnostic", "Hydraulique", "Pneumatique"], relatedSlugs: ["ingenieur-mecanique", "ingenieur"], keywords: ["technicien maintenance", "maintenance industrielle"] },
  { slug: "logisticien", name: "Logisticien", aliases: ["responsable logistique", "supply chain"], sectorSlug: "logistique", skills: ["Supply Chain", "WMS", "Transport", "Stock"], relatedSlugs: ["responsable-achats", "gestionnaire-stock"], keywords: ["logisticien", "logistique", "supply chain"] },
  { slug: "responsable-achats", name: "Responsable Achats", aliases: ["acheteur", "procurement"], sectorSlug: "logistique", skills: ["Négociation", "Sourcing", "ERP", "Contrats"], relatedSlugs: ["logisticien", "gestionnaire-stock"], keywords: ["responsable achats", "acheteur", "procurement"] },
  { slug: "gestionnaire-stock", name: "Gestionnaire de Stock", aliases: ["magasinier", "inventory manager"], sectorSlug: "logistique", skills: ["Inventaire", "WMS", "Réception", "Expédition"], relatedSlugs: ["logisticien", "responsable-achats"], keywords: ["gestionnaire stock", "magasinier", "inventaire"] },
  { slug: "infirmier", name: "Infirmier", aliases: ["infirmière", "nurse"], sectorSlug: "sante", skills: ["Soins", "Premiers secours", "Dossier patient", "Hygiène"], relatedSlugs: ["medecin", "pharmacien"], keywords: ["infirmier", "infirmière", "nurse"] },
  { slug: "medecin", name: "Médecin", aliases: ["docteur", "médecin généraliste"], sectorSlug: "sante", skills: ["Diagnostic", "Prescription", "Consultation", "Urgences"], relatedSlugs: ["infirmier", "pharmacien"], keywords: ["médecin", "docteur", "médecin généraliste"] },
  { slug: "pharmacien", name: "Pharmacien", aliases: ["pharmacienne"], sectorSlug: "sante", skills: ["Dispensation", "Conseil", "Réglementation", "Stock"], relatedSlugs: ["medecin", "infirmier"], keywords: ["pharmacien", "pharmacienne", "officine"] },
  { slug: "enseignant", name: "Enseignant", aliases: ["professeur", "formateur"], sectorSlug: "education", skills: ["Pédagogie", "Formation", "Évaluation", "Programme"], relatedSlugs: ["formateur", "coordinateur-pedagogique"], keywords: ["enseignant", "professeur", "formateur"] },
  { slug: "formateur", name: "Formateur", aliases: ["trainer", "coach formation"], sectorSlug: "education", skills: ["Animation", "Pédagogie", "E-learning", "Évaluation"], relatedSlugs: ["enseignant", "coordinateur-pedagogique"], keywords: ["formateur", "trainer", "formation"] },
  { slug: "coordinateur-pedagogique", name: "Coordinateur Pédagogique", aliases: ["responsable formation"], sectorSlug: "education", skills: ["Conception pédagogique", "LMS", "Programmes", "Qualité"], relatedSlugs: ["formateur", "enseignant"], keywords: ["coordinateur pédagogique", "responsable formation"] },
  { slug: "conseiller-bancaire", name: "Conseiller Bancaire", aliases: ["chargé de clientèle", "bank advisor"], sectorSlug: "banque", skills: ["Conseil client", "Crédit", "Produits bancaires", "Vente"], relatedSlugs: ["analyste-credit", "gestionnaire-back-office"], keywords: ["conseiller bancaire", "chargé clientèle", "banque"] },
  { slug: "analyste-credit", name: "Analyste Crédit", aliases: ["credit analyst", "risque crédit"], sectorSlug: "banque", skills: ["Analyse financière", "Scoring", "Risque", "Dossiers crédit"], relatedSlugs: ["conseiller-bancaire", "comptable"], keywords: ["analyste crédit", "credit analyst", "risque crédit"] },
  { slug: "gestionnaire-back-office", name: "Gestionnaire Back Office", aliases: ["back office bancaire"], sectorSlug: "banque", skills: ["Traitement dossiers", "Conformité", "SWIFT", "KYC"], relatedSlugs: ["conseiller-bancaire", "comptable"], keywords: ["back office", "gestionnaire back office", "opérations bancaires"] },
  { slug: "architecte", name: "Architecte", aliases: ["architecte d'intérieur"], sectorSlug: "industrie", skills: ["AutoCAD", "SketchUp", "Plans", "Réglementation"], relatedSlugs: ["ingenieur", "designer-graphique"], keywords: ["architecte", "architecture", "plans"] },
];

export function professionLandingSlug(professionSlug: string): string {
  return `emploi-${professionSlug}-maroc`;
}

export function parseProfessionLandingSlug(slug: string): ProfessionSeed | null {
  if (!slug.startsWith("emploi-") || !slug.endsWith("-maroc")) return null;
  const inner = slug.slice("emploi-".length, -"-maroc".length);
  return PROFESSION_SEEDS.find((p) => p.slug === inner) ?? null;
}

export function professionToJobFilters(profession: ProfessionSeed) {
  return { q: profession.keywords[0] ?? profession.name };
}

export function professionTitle(profession: ProfessionSeed, jobCount: number): string {
  return `Emploi ${profession.name} au Maroc — ${jobCount} offres`;
}

export function professionIntro(profession: ProfessionSeed, jobCount: number): string {
  return `Découvrez ${jobCount} offre${jobCount > 1 ? "s" : ""} d'emploi pour ${profession.name} au Maroc. Letravail.ma agrège les annonces réelles des employeurs marocains — secteur ${profession.sectorSlug}, compétences clés : ${profession.skills.slice(0, 4).join(", ")}.`;
}

export function getProfessionBySlug(slug: string): ProfessionSeed | undefined {
  return PROFESSION_SEEDS.find((p) => p.slug === slug);
}

export function getAllProfessionSlugCandidates(): string[] {
  return PROFESSION_SEEDS.map((p) => professionLandingSlug(p.slug));
}

export function matchProfessionFromTitle(title: string): ProfessionSeed | null {
  const lower = title.toLowerCase();
  for (const profession of PROFESSION_SEEDS) {
    const terms = [profession.name, ...profession.aliases, ...profession.keywords];
    if (terms.some((t) => lower.includes(t.toLowerCase()))) {
      return profession;
    }
  }
  return null;
}

export function professionJobWhere(profession: ProfessionSeed) {
  const terms = [...profession.keywords, ...profession.aliases, profession.name];
  return {
    OR: terms.map((kw) => ({
      OR: [
        { title: { contains: kw, mode: "insensitive" as const } },
        { description: { contains: kw, mode: "insensitive" as const } },
      ],
    })),
  };
}

export function seedSlugFromName(name: string): string {
  return slugify(name);
}
