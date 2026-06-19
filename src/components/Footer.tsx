import Link from "next/link";
import { Logo } from "./ui/Logo";
import { TOP_CITIES } from "@/lib/constants";
import { slugify } from "@/lib/utils";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-border bg-foreground text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="page-container py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo variant="light" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              La plateforme de référence pour l&apos;emploi au Maroc. Nous agrégeons
              automatiquement les offres des leaders économiques du royaume —
              banques, télécoms, industrie et tech.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse-slow" />
              <span className="text-xs font-medium text-white/50">
                Données mises à jour en temps réel
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-accent-light">
                Villes
              </h3>
              <ul className="mt-4 space-y-2.5">
                {TOP_CITIES.slice(0, 6).map((city) => (
                  <li key={city}>
                    <Link
                      href={`/emplois/${slugify(city)}`}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      Emploi {city}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-accent-light">
                Plateforme
              </h3>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link href="/emplois" className="text-sm text-white/60 transition-colors hover:text-white">
                    Toutes les offres
                  </Link>
                </li>
                <li>
                  <Link href="/a-propos" className="text-sm text-white/60 transition-colors hover:text-white">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link href="/mentions-legales" className="text-sm text-white/60 transition-colors hover:text-white">
                    Mentions légales
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-accent-light">
                Contact
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                Employeurs & partenaires
              </p>
              <a
                href="mailto:contact@letravail.ma"
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-accent-light transition-colors hover:text-white"
              >
                contact@letravail.ma
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/40">
            © {year} Letravail.ma — Tous droits réservés
          </p>
          <p className="text-xs text-white/30">
            Fait avec passion au Maroc 🇲🇦
          </p>
        </div>
      </div>
    </footer>
  );
}
