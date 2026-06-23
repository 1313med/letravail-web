import Link from "next/link";
import { SEO_CITIES, SEO_SECTORS, sectorLandingSlug, comboLandingSlug } from "@/lib/landing-pages";
import { SALARY_ROLES, salaryPublicSlug } from "@/lib/salary-data";

interface SeoHubFooterProps {
  currentSector?: string;
  currentCity?: string;
}

export function SeoHubFooter({ currentSector, currentCity }: SeoHubFooterProps) {
  const sectors = SEO_SECTORS.filter((s) => s.slug !== currentSector).slice(0, 6);
  const cities = SEO_CITIES.filter((c) => c.short !== currentCity).slice(0, 6);

  return (
    <section className="border-t border-white/5 bg-navy/50 py-16">
      <div className="container-xl grid gap-12 lg:grid-cols-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-mint/70">Secteurs</h2>
          <ul className="mt-5 space-y-3">
            {sectors.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/${sectorLandingSlug(s.slug)}`}
                  className="text-sm text-slate-muted transition-colors hover:text-white"
                >
                  Emploi {s.label} Maroc
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-mint/70">Villes</h2>
          <ul className="mt-5 space-y-3">
            {cities.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/emplois/${c.slug}`}
                  className="text-sm text-slate-muted transition-colors hover:text-white"
                >
                  Emploi {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-mint/70">Salaires</h2>
          <ul className="mt-5 space-y-3">
            {SALARY_ROLES.slice(0, 6).map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/${salaryPublicSlug(r.slug)}`}
                  className="text-sm text-slate-muted transition-colors hover:text-white"
                >
                  Salaire {r.title}
                </Link>
              </li>
            ))}
          </ul>
          {currentSector && currentCity && (
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-dim">Cette ville</p>
              <ul className="mt-3 space-y-2">
                {SEO_SECTORS.filter((s) => s.slug !== currentSector).slice(0, 4).map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/${comboLandingSlug(s.slug, currentCity)}`}
                      className="text-sm text-slate-muted hover:text-white"
                    >
                      {s.label} à {SEO_CITIES.find((c) => c.short === currentCity)?.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
