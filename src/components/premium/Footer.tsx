import Link from "next/link";
import { TOP_CITIES } from "@/lib/constants";
import { slugify } from "@/lib/utils";

export function PremiumFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-navy">
      <div className="container-xl py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-mint text-sm font-bold text-navy">LT</span>
              <span className="text-xl font-bold">Letravail<span className="text-mint">.ma</span></span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-muted">
              Le futur de l&apos;emploi au Maroc. Des milliers d&apos;opportunités mises à jour automatiquement.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <div>
              <p className="section-label !text-[10px]">Villes</p>
              <ul className="mt-4 space-y-3">
                {TOP_CITIES.slice(0, 6).map((city) => (
                  <li key={city}>
                    <Link href={`/emplois/${slugify(city)}`} className="text-sm text-slate-muted transition-colors hover:text-mint">
                      Emploi {city}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="section-label !text-[10px]">Plateforme</p>
              <ul className="mt-4 space-y-3">
                <li><Link href="/emplois" className="text-sm text-slate-muted hover:text-mint">Offres</Link></li>
                <li><Link href="/salaires" className="text-sm text-slate-muted hover:text-mint">Salaires</Link></li>
                <li><Link href="/a-propos" className="text-sm text-slate-muted hover:text-mint">À propos</Link></li>
              </ul>
            </div>
            <div>
              <p className="section-label !text-[10px]">Contact</p>
              <a href="mailto:contact@letravail.ma" className="mt-4 inline-block text-sm font-medium text-mint hover:text-mint-glow">
                contact@letravail.ma
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-slate-dim">© {year} Letravail.ma</p>
          <p className="text-xs text-slate-dim">Conçu au Maroc 🇲🇦</p>
        </div>
      </div>
    </footer>
  );
}
