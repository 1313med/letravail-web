import Link from "next/link";
import { SalaryRole } from "@/lib/salary-data";
import { JobAlertSignup } from "@/components/seo/JobAlertSignup";
import { SEO_CITIES, sectorLandingSlug } from "@/lib/landing-pages";

interface SalaryStats {
  min: number;
  median: number;
  max: number;
  trend: string;
  sampleSize: number;
  byCity: { slug: string; median: number; count: number }[];
}

interface SalaryPageContentProps {
  role: SalaryRole;
  stats: SalaryStats;
  observationCount: number;
  indexable: boolean;
}

export function SalaryPageContent({ role, stats, observationCount, indexable }: SalaryPageContentProps) {
  const levels = [
    { label: "Junior (P25)", value: stats.min },
    { label: "Médiane", value: stats.median },
    { label: "Senior (P75)", value: stats.max },
  ];

  return (
    <div className="section-dark min-h-screen pt-24 lg:pt-32">
      <div className="container-xl pb-16">
        <nav className="mb-8 text-sm text-slate-muted">
          <Link href="/" className="hover:text-mint">Accueil</Link>
          <span className="mx-2">/</span>
          <Link href="/salaires" className="hover:text-mint">Salaires</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{role.title}</span>
        </nav>

        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Salaire {role.title} au Maroc
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-muted">
          {indexable
            ? `Basé sur ${observationCount} observations salariales réelles et ${stats.sampleSize} offres analysées sur Letravail.ma.`
            : `Estimation basée sur ${stats.sampleSize > 0 ? `${stats.sampleSize} offres analysées` : "le marché marocain"} — données insuffisantes pour une analyse indexable.`}
        </p>

        {!indexable && (
          <p className="mt-3 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
            Données estimées — {observationCount}/5 observations minimum
          </p>
        )}

        <div className="mt-12 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-8 sm:p-12">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-5xl font-bold text-mint">{stats.median.toLocaleString("fr-MA")}</span>
            <span className="text-lg text-slate-muted">MAD / mois (médiane)</span>
            <span className={indexable ? "badge-mint ml-auto" : "ml-auto rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-200"}>
              {indexable ? `${stats.trend} tendance` : "Estimation"}
            </span>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {levels.map((level) => (
              <div key={level.label} className="rounded-2xl bg-white/5 p-6 text-center">
                <p className="text-sm text-slate-muted">{level.label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{level.value.toLocaleString("fr-MA")}</p>
                <p className="text-xs text-slate-dim">MAD/mois</p>
              </div>
            ))}
          </div>
        </div>

        {stats.byCity.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-white">Salaire par ville</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stats.byCity.map((row) => {
                const city = SEO_CITIES.find((c) => c.slug === row.slug);
                return (
                  <div key={row.slug} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                    <p className="font-semibold text-white">{city?.name ?? row.slug}</p>
                    <p className="mt-1 text-2xl font-bold text-mint">{row.median.toLocaleString("fr-MA")} MAD</p>
                    <p className="mt-1 text-xs text-slate-dim">{row.count} offre{row.count > 1 ? "s" : ""}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-12">
          <h2 className="text-xl font-bold text-white">Offres {role.title}</h2>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link href={`/${sectorLandingSlug(role.tagSlug)}`} className="btn-mint">
              Voir les offres {role.title}
            </Link>
            <Link href={`/emplois?tag=${role.tagSlug}`} className="text-sm font-semibold text-mint hover:text-mint-glow self-center">
              Filtrer toutes les offres →
            </Link>
          </div>
        </section>

        <div className="mt-16">
          <JobAlertSignup sectorSlug={role.tagSlug} label={`Alertes offres ${role.title}`} />
        </div>
      </div>
    </div>
  );
}
