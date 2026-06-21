import { slugify } from "./utils";

export const HERO_IMAGE = "/images/cities/casablanca.jpg";

export const CITY_IMAGES: Record<string, { src: string; alt: string }> = {
  casablanca: {
    src: "/images/cities/casablanca.jpg",
    alt: "Casablanca — Mosquée Hassan II au coucher du soleil",
  },
  rabat: {
    src: "/images/cities/rabat.jpg",
    alt: "Rabat — Kasbah des Oudayas",
  },
  marrakech: {
    src: "/images/cities/marrakech.jpg",
    alt: "Marrakech — Koutoubia et l'Atlas",
  },
  tanger: {
    src: "/images/cities/tanger.jpg",
    alt: "Tanger — Baie et médina au crépuscule",
  },
  fes: {
    src: "/images/cities/fes.jpg",
    alt: "Fès — Bab Boujloud au coucher du soleil",
  },
  agadir: {
    src: "/images/cities/agadir.jpg",
    alt: "Agadir — Marina et baie",
  },
  kenitra: {
    src: "/images/cities/kenitra.jpg",
    alt: "Kénitra — Bouregreg au golden hour",
  },
};

export const DEFAULT_CITY_IMAGE = "/images/cities/casablanca.jpg";

export const TESTIMONIAL_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
];

/** DB slugs are often "casablanca-morocco" — map them to image keys. */
function resolveCityKey(slug: string, cityName: string): string | null {
  const stripped = slug.replace(/-morocco(?:-[a-z0-9-]+)?$/, "");
  const candidates = [slug, stripped, slugify(cityName)];

  for (const key of candidates) {
    if (CITY_IMAGES[key]) return key;
  }

  for (const key of Object.keys(CITY_IMAGES)) {
    if (stripped === key || stripped.startsWith(`${key}-`)) return key;
  }

  return null;
}

export function getCityImage(slug: string, cityName: string) {
  const key = resolveCityKey(slug, cityName);
  if (key) return CITY_IMAGES[key];

  return {
    src: DEFAULT_CITY_IMAGE,
    alt: `Emploi ${cityName}`,
  };
}
