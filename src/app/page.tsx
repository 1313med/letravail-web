import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { SearchBar } from "@/components/SearchBar";
import { CityCard } from "@/components/ui/CityCard";
import { CompanyCard } from "@/components/ui/CompanyCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stat } from "@/components/ui/Stat";
import { REVALIDATE_SECONDS } from "@/lib/constants";
import {
  getCitiesForFilter,
  getLastScrapeTime,
  getLatestJobs,
  getTopCities,
  getTopCompanies,
  getTotalJobCount,
} from "@/lib/queries";
import { buildPageMetadata } from "@/lib/seo";
import { formatRelativeDate, pluralize } from "@/lib/utils";

export const revalidate = REVALIDATE_SECONDS;

export const metadata = buildPageMetadata({
  title: "Offres d'emploi au Maroc — Recrutement & Emploi",
  description:
    "Découvrez des milliers d'offres d'emploi au Maroc : Casablanca, Rabat, Marrakech, Tanger et plus. Banques, télécoms, tech, secteur public — mises à jour automatiquement.",
  path: "/",
});

export default async function HomePage() {
  const [totalJobs, latestJobs, topCities, topCompanies, lastScrape, cities] =
    await Promise.all([
      getTotalJobCount(),
      getLatestJobs(20),
      getTopCities(12),
      getTopCompanies(12),
      getLastScrapeTime(),
      getCitiesForFilter(),
    ]);

  const formattedTotal =
    totalJobs >= 1000
      ? `${Math.floor(totalJobs / 100) * 100}+`
      : String(totalJobs);

  return (
    <>
      {/* Hero */}
      <section className="hero-glow relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />

        <div className="page-container relative py-20 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
              Plateforme #1 de l&apos;emploi au Maroc
            </div>

            <h1 className="animate-fade-up-delay-1 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
              Trouvez votre{" "}
              <span className="gradient-text">prochain emploi</span>{" "}
              au Maroc
            </h1>

            <p className="animate-fade-up-delay-2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70 sm:text-xl">
              Des milliers d&apos;offres des banques, télécoms, groupes industriels
              et startups — mises à jour automatiquement chaque jour.
            </p>

            <div className="animate-fade-up-delay-3 mx-auto mt-10 flex justify-center">
              <SearchBar cities={cities} variant="hero" />
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
            <Stat value={formattedTotal} label="Offres actives" />
            <Stat
              value={String(topCities.length)}
              label="Villes couvertes"
            />
            <Stat
              value={String(topCompanies.length)}
              label="Employeurs"
            />
          </div>

          {lastScrape && (
            <p className="mt-8 text-center text-sm text-white/40">
              Dernière mise à jour {formatRelativeDate(lastScrape).toLowerCase()}
            </p>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Cities */}
      <section className="page-container -mt-8 relative py-16 sm:py-20">
        <SectionHeader
          label="Par ville"
          title="Emploi dans tout le Maroc"
          description="Explorez les opportunités dans les principales métropoles du royaume."
        />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {topCities.map((city) => (
            <CityCard
              key={city.slug}
              city={city.city}
              slug={city.slug}
              jobCount={city._count.jobs}
            />
          ))}
        </div>
      </section>

      {/* Latest jobs */}
      <section className="border-y border-border/60 bg-white py-16 sm:py-20">
        <div className="page-container">
          <SectionHeader
            label="En direct"
            title="Dernières offres publiées"
            description="Les opportunités les plus récentes, ajoutées automatiquement."
            action={
              <Link href="/emplois" className="link-arrow">
                Voir toutes les offres
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            }
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {latestJobs.map((job, i) => (
              <JobCard key={job.id} job={job} featured={i < 2} />
            ))}
          </div>
        </div>
      </section>

      {/* Top employers */}
      <section className="page-container py-16 sm:py-20">
        <SectionHeader
          label="Employeurs"
          title="Les entreprises qui recrutent"
          description="Banques, opérateurs télécoms, groupes industriels et institutions publiques."
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topCompanies.map((company) => (
            <CompanyCard
              key={company.slug}
              name={company.name}
              slug={company.slug}
              jobCount={company._count.jobs}
            />
          ))}
        </div>
      </section>

      {/* Value props — investors & employers */}
      <section className="relative overflow-hidden bg-foreground py-16 sm:py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="page-container relative">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-label !text-gold-light">Pourquoi Letravail.ma</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl text-balance">
              La référence de l&apos;emploi au Maroc
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: "⚡",
                title: "Temps réel",
                desc: "Offres synchronisées automatiquement depuis les sites de recrutement des employeurs.",
              },
              {
                icon: "🎯",
                title: "Couverture nationale",
                desc: "Casablanca, Rabat, Marrakech, Tanger et toutes les grandes villes du royaume.",
              },
              {
                icon: "🏢",
                title: "Top employeurs",
                desc: "Banques, télécoms, retail, secteur public et tech — les leaders du marché marocain.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-accent/30 hover:bg-white/10"
              >
                <span className="text-3xl" aria-hidden="true">{item.icon}</span>
                <h3 className="mt-4 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/emplois" className="btn-gold">
              Commencer ma recherche
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust line */}
      <section className="border-t border-border/60 bg-surface py-8">
        <div className="page-container flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center text-sm text-muted">
          <span className="font-semibold text-foreground">
            {pluralize(totalJobs, "offre", "offres")} disponibles
          </span>
          <span className="hidden sm:inline text-border">|</span>
          <span>Mises à jour automatiquement</span>
          <span className="hidden sm:inline text-border">|</span>
          <span>100% gratuit pour les candidats</span>
        </div>
      </section>
    </>
  );
}
