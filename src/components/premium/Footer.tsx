import Link from "next/link";
import { TOP_CITIES } from "@/lib/constants";
import { slugify } from "@/lib/utils";

export function PremiumFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#040E1A] text-white">
      {/* Luxury top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-mint/50 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(55,214,181,0.06),transparent_60%)]" />

      <div className="container-xl relative py-24 lg:py-28">
        {/* Brand block — full width */}
        <div className="max-w-2xl">
          <Link href="/" className="group inline-flex items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint text-sm font-bold text-navy transition-transform group-hover:scale-105">LT</span>
            <span className="text-2xl font-extrabold tracking-tight">
              Letravail<span className="text-mint">.ma</span>
            </span>
          </Link>
          <p className="mt-6 text-lg leading-relaxed text-slate-muted">
            La plateforme d&apos;emploi la plus ambitieuse du Maroc.
            <br />
            Conçue pour ceux qui visent l&apos;excellence.
          </p>
        </div>

        {/* Links grid — asymmetric columns */}
        <div className="mt-20 grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4 lg:col-start-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-mint/70">Villes</p>
            <ul className="mt-6 space-y-4">
              {TOP_CITIES.slice(0, 6).map((city) => (
                <li key={city}>
                  <Link href={`/emplois/${slugify(city)}-morocco`} className="text-[15px] text-slate-muted transition-colors hover:text-white">
                    Emploi {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-mint/70">Plateforme</p>
            <ul className="mt-6 space-y-4">
              <li><Link href="/emplois" className="text-[15px] text-slate-muted hover:text-white">Offres d&apos;emploi</Link></li>
              <li><Link href="/salaires" className="text-[15px] text-slate-muted hover:text-white">Salaires</Link></li>
              <li><Link href="/a-propos" className="text-[15px] text-slate-muted hover:text-white">À propos</Link></li>
              <li><Link href="/mentions-legales" className="text-[15px] text-slate-muted hover:text-white">Mentions légales</Link></li>
            </ul>
          </div>
          <div className="lg:col-span-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-mint/70">Contact</p>
            <a href="mailto:contact@letravail.ma" className="mt-6 inline-block text-[15px] font-semibold text-mint hover:text-mint-glow">
              contact@letravail.ma
            </a>
          </div>
        </div>

        <div className="mt-24 flex flex-col items-start justify-between gap-6 border-t border-white/6 pt-10 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-dim">© {year} Letravail.ma — Tous droits réservés</p>
          <p className="text-sm text-slate-dim">Conçu avec passion au Maroc 🇲🇦</p>
        </div>
      </div>
    </footer>
  );
}
