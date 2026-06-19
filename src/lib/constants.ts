export const SITE_NAME = "Letravail.ma";
export const SITE_DESCRIPTION =
  "Trouvez les meilleures offres d'emploi au Maroc. Banques, télécoms, retail, secteur public et tech — mises à jour automatiquement.";
export const SITE_LOCALE = "fr-MA";
export const JOBS_PER_PAGE = 24;
export const MIN_JOBS_FOR_CITY_INDEX = 5;
export const NEW_JOB_DAYS = 7;
export const REVALIDATE_SECONDS = Number(process.env.REVALIDATE_SECONDS) || 3600;

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://letravail.ma").replace(/\/$/, "");
}

export const TOP_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Tanger",
  "Fès",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kenitra",
  "Tétouan",
] as const;
