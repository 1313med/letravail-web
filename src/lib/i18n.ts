/**
 * i18n structure — French (fr-MA) primary, Arabic (ar-MA) prepared for later.
 *
 * Usage (future):
 *   import { getDictionary } from '@/lib/i18n';
 *   const t = await getDictionary('fr-MA');
 */

export type Locale = "fr-MA" | "ar-MA";

export const defaultLocale: Locale = "fr-MA";
export const locales: Locale[] = ["fr-MA", "ar-MA"];

const dictionaries: Record<Locale, Record<string, string>> = {
  "fr-MA": {
    "nav.jobs": "Offres d'emploi",
    "nav.search": "Rechercher",
    "job.apply": "Postuler sur le site de l'employeur",
    "job.new": "Nouveau",
    "job.remote": "Télétravail",
    "home.title": "Offres d'emploi au Maroc",
    "footer.about": "À propos",
    "footer.legal": "Mentions légales",
  },
  "ar-MA": {
    // Arabic translations to be added
    "nav.jobs": "عروض الشغل",
    "nav.search": "بحث",
    "job.apply": "التقديم على موقع الشركة",
    "job.new": "جديد",
    "job.remote": "عمل عن بُعد",
    "home.title": "عروض الشغل في المغرب",
    "footer.about": "حول الموقع",
    "footer.legal": "إشعار قانوني",
  },
};

export function getDictionary(locale: Locale = defaultLocale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function t(
  locale: Locale,
  key: string,
  fallback?: string
): string {
  return dictionaries[locale]?.[key] ?? fallback ?? key;
}
