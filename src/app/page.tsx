import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { SearchBar } from "@/components/SearchBar";
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

  return (
    <>
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            Offres d&apos;emploi au Maroc
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            Trouvez votre prochain poste parmi les offres des banques, télécoms,
            groupes industriels et startups marocaines.
          </p>
          <div className="mx-auto mt-8 flex justify-center">
            <SearchBar cities={cities} />
          </div>
          <p className="mt-6 text-sm text-muted">
            {pluralize(totalJobs, "offre", "offres")}
            {lastScrape && (
              <> · Mises à jour {formatRelativeDate(lastScrape).toLowerCase()}</>
            )}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground">
          Emploi par ville
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {topCities.map((city) => (
            <Link
              key={city.slug}
              href={`/emplois/${city.slug}`}
              className="rounded-xl border border-border bg-card p-5 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-lg font-semibold text-foreground">
                {city.city}
              </span>
              <span className="mt-1 block text-sm text-muted">
                {pluralize(city._count.jobs, "offre", "offres")}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              Dernières offres
            </h2>
            <Link href="/emplois" className="text-sm font-medium text-primary hover:underline">
              Voir tout →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {latestJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground">
          Top employeurs
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {topCompanies.map((company) => (
            <Link
              key={company.slug}
              href={`/entreprise/${company.slug}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-primary">
                {company.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <span className="block truncate text-sm font-semibold">
                  {company.name}
                </span>
                <span className="text-xs text-muted">
                  {pluralize(company._count.jobs, "offre", "offres")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
