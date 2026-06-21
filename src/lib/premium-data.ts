export const SALARY_DATA = [
  {
    slug: "developpeur-full-stack-maroc",
    title: "Développeur Full Stack",
    min: 12000,
    max: 35000,
    median: 22000,
    currency: "MAD",
    trend: "+8%",
  },
  {
    slug: "data-analyst-maroc",
    title: "Data Analyst",
    min: 10000,
    max: 28000,
    median: 18000,
    currency: "MAD",
    trend: "+12%",
  },
  {
    slug: "comptable-maroc",
    title: "Comptable",
    min: 6000,
    max: 15000,
    median: 9500,
    currency: "MAD",
    trend: "+5%",
  },
  {
    slug: "commercial-maroc",
    title: "Commercial",
    min: 7000,
    max: 20000,
    median: 12000,
    currency: "MAD",
    trend: "+6%",
  },
] as const;

export const TESTIMONIALS = [
  {
    name: "Yasmine B.",
    role: "Développeuse · Casablanca",
    quote:
      "J'ai trouvé mon poste chez une banque en moins de deux semaines. L'interface est d'un autre niveau — on se croirait sur un site international.",
    avatar: "YB",
  },
  {
    name: "Karim E.",
    role: "Analyste financier · Rabat",
    quote:
      "Enfin une plateforme marocaine qui agrège tout. Plus besoin de visiter 20 sites de recrutement différents.",
    avatar: "KE",
  },
  {
    name: "Salma M.",
    role: "Responsable RH · Marrakech",
    quote:
      "En tant qu'employeur, Letravail.ma nous apporte une visibilité premium. Les candidats sont plus qualifiés.",
    avatar: "SM",
  },
] as const;

export const FEATURED_COMPANIES = [
  { name: "Attijariwafa Bank", slug: "attijariwafa-bank", industry: "Banque", rating: 4.5, topEmployer: true },
  { name: "CIH Bank", slug: "cih-bank", industry: "Banque", rating: 4.3, topEmployer: true },
  { name: "OCP", slug: "ocp", industry: "Industrie", rating: 4.4, topEmployer: true },
  { name: "Maroc Telecom", slug: "maroc-telecom", industry: "Télécom", rating: 4.2, topEmployer: false },
  { name: "Orange Maroc", slug: "orange-maroc", industry: "Télécom", rating: 4.1, topEmployer: false },
  { name: "DXC Technology", slug: "dxc-technology", industry: "Tech", rating: 4.0, topEmployer: false },
] as const;

export const CITY_IMAGES: Record<string, string> = {
  casablanca: "from-cyan-900/40 to-navy-700",
  rabat: "from-emerald-900/30 to-navy-700",
  marrakech: "from-orange-900/30 to-navy-700",
  tanger: "from-blue-900/30 to-navy-700",
  fes: "from-amber-900/30 to-navy-700",
  agadir: "from-teal-900/30 to-navy-700",
};
