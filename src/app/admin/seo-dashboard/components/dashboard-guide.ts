/** Textes pédagogiques — dashboard SEO pour débutants */

export const GLOSSARY = {
  impressions:
    "Nombre de fois où votre page est apparue dans les résultats Google (même sans clic).",
  clicks: "Nombre de visites venant de Google.",
  ctr: "Taux de clic = clics ÷ impressions. Un CTR bas signifie que votre titre/description n'attire pas assez.",
  position:
    "Position moyenne dans Google (1 = tout en haut). Entre 4 et 15 = proche de la 1ère page, gros potentiel.",
  healthScore:
    "Note de 0 à 100 sur la santé SEO d'une page : indexation, liens, CTR, position, schema, contenu, fraîcheur.",
  confidence:
    "Fiabilité de l'estimation (0–100 %). Plus c'est haut, plus les données Google sont solides.",
  trafficGain:
    "Clics supplémentaires estimés par mois si vous corrigez le problème (basé sur vos vraies données GSC).",
  indexation:
    "Une page « indexée » peut apparaître sur Google. « Noindex » = volontairement cachée (souvent page trop pauvre).",
  thinPage:
    "Page avec trop peu de contenu ou d'offres — risque de ne pas bien se positionner.",
  internalLinks:
    "Liens entre vos pages. Ils aident Google à comprendre le site et distribuent l'autorité SEO.",
  schema:
    "Données structurées (JobPosting, FAQ…) qui enrichissent l'affichage dans Google.",
  quickWin:
    "Action rapide à fort impact : page déjà visible sur Google mais sous-optimisée.",
  orchestrator:
    "Le système classe toutes les actions par gain potentiel et vous propose LA priorité #1.",
} as const;

export const TABS = {
  monitor: {
    label: "Surveillance",
    short: "État du site",
    description:
      "Vérifiez si vos pages sont bien indexées, sans risque, et conformes. Commencez ici si vous découvrez le dashboard.",
    steps: [
      "Regardez les chiffres verts/rouges en haut de chaque bloc.",
      "Filtrez les pages « à risque » ou « noindex ».",
      "Lancez une action corrective si un indicateur est rouge.",
    ],
  },
  growth: {
    label: "Croissance",
    short: "Agir & gagner du trafic",
    description:
      "Le moteur vous dit quoi faire en priorité et permet d'exécuter les actions en un clic.",
    steps: [
      "Lisez l'action #1 du Orchestrateur — c'est votre priorité.",
      "Cliquez « Exécuter » pour appliquer automatiquement.",
      "Consultez Market Intelligence pour créer du contenu aligné sur la demande.",
    ],
  },
  intelligence: {
    label: "Intelligence",
    short: "Mots-clés & concurrence",
    description:
      "Analyse des requêtes Google, feedback ranking et opportunités de contenu.",
    steps: [
      "Repérez les mots-clés sans page dédiée.",
      "Lisez les recommandations Ranking Feedback.",
      "Comparez votre couverture vs la structure des concurrents.",
    ],
  },
} as const;

export const ACTION_LABELS: Record<string, string> = {
  revalidate_page: "Rafraîchir la page",
  refresh_metadata: "Améliorer titre & description",
  add_internal_links: "Ajouter des liens internes",
  regenerate_content: "Regénérer le contenu",
  regenerate_faq: "Regénérer la FAQ",
  rebuild_schema: "Reconstruire le schema",
  ranking_feedback: "Feedback Google",
  knowledge_graph: "Graphe emploi",
  health_score: "Score santé",
  opportunities: "Opportunité détectée",
  keyword_intelligence: "Mot-clé à mapper",
};

export const SOURCE_LABELS: Record<string, string> = {
  ranking_feedback: "Données Google",
  knowledge_graph: "Liens recommandés",
  health_score: "Score santé page",
  opportunities: "Opportunité SEO",
  keyword_intelligence: "Mots-clés",
};

export const PRIORITY_LABELS = {
  HIGH: { label: "Urgent", hint: "À traiter en premier" },
  MEDIUM: { label: "Important", hint: "Planifier cette semaine" },
  LOW: { label: "Plus tard", hint: "Quand le reste est fait" },
} as const;

export const RISK_LABELS = {
  SAFE: { label: "Sain", hint: "Rien d'urgent" },
  WARNING: { label: "Attention", hint: "Surveiller et corriger" },
  DANGEROUS: { label: "Critique", hint: "Corriger rapidement" },
} as const;

export const INDEX_STATUS = {
  index: { label: "Visible Google", tone: "good" as const },
  noindex: { label: "Cachée", tone: "warn" as const },
};
