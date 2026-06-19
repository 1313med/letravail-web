import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobCard } from "@/components/JobCard";
import { JobFilters } from "@/components/JobFilters";
import { Pagination } from "@/components/Pagination";
import { JsonLd } from "@/components/JsonLd";
import { MIN_JOBS_FOR_CITY_INDEX, REVALIDATE_SECONDS } from "@/lib/constants";
import { getCityIntro } from "@/lib/cities";
import {
  getCityJobCount,
  getCompaniesInCity,
  getCompaniesForFilter,
  getContractTypes,
  getJobs,
  getLocationBySlug,
  getOtherCities,
  getTags,
  getTopCitySlugs,
} from "@/lib/queries";
import {
  buildBreadcrumbJsonLd,
  buildCanonical,
  buildPageMetadata,
} from "@/lib/seo";
import { pluralize } from "@/lib/utils";

export const revalidate = REVALIDATE_SECONDS;

interface Props {
  params: { city: string };
  searchParams: Record<string, string | undefined>;
}

export async function generateStaticParams() {
  const slugs = await getTopCitySlugs();
  return slugs.map((city) => ({ city }));
}

export async function generateMetadata({ params }: Props) {
  const { city: citySlug } = params;
  const location = await getLocationBySlug(citySlug);
  if (!location) return { title: "Ville introuvable" };

  const count = await getCityJobCount(citySlug);
  const noindex = count < MIN_JOBS_FOR_CITY_INDEX;

  return buildPageMetadata({
    title: `Offres d'emploi à ${location.city} (${count} postes)`,
    description: `Découvrez ${count} offres d'emploi à ${location.city}, Maroc. CDI, CDD, stages — banques, télécoms, industrie et plus. Mises à jour automatiquement.`,
    path: `/emplois/${citySlug}`,
    noindex,
  });
}

export default async function CityJobsPage({ params, searchParams }: Props) {
  const { city: citySlug } = params;
  const sp = searchParams;

  const location = await getLocationBySlug(citySlug);
  if (!location) notFound();

  const jobCount = location._count.jobs;
  if (jobCount === 0) notFound();

  const filters = {
    city: citySlug,
    company: sp.company,
    contract: sp.contract,
    tag: sp.tag,
    page: sp.page ? parseInt(sp.page, 10) : 1,
  };

  const [jobsResult, companiesInCity, otherCities, contractTypes, allCompanies, tags] =
    await Promise.all([
      getJobs(filters),
      getCompaniesInCity(citySlug),
      getOtherCities(citySlug),
      getContractTypes(),
      getCompaniesForFilter(),
      getTags(),
    ]);

  const cityIntro = getCityIntro(location.city, citySlug);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: buildCanonical("/") },
    { name: "Offres d'emploi", url: buildCanonical("/emplois") },
    { name: location.city, url: buildCanonical(`/emplois/${citySlug}`) },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Offres d'emploi", href: "/emplois" },
            { label: location.city },
          ]}
        />

        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Offres d&apos;emploi à {location.city}
        </h1>
        <p className="mt-2 text-muted">
          {pluralize(jobCount, "offre disponible", "offres disponibles")}
        </p>

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
          {cityIntro.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="mt-8">
          <Suspense fallback={null}>
            <JobFilters
              cities={[]}
              companies={allCompanies}
              contractTypes={contractTypes}
              tags={tags}
              basePath={`/emplois/${citySlug}`}
            />
          </Suspense>
        </div>

        {jobsResult.jobs.length > 0 ? (
          <>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {jobsResult.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            <Pagination
              currentPage={jobsResult.page}
              totalPages={jobsResult.totalPages}
              basePath={`/emplois/${citySlug}`}
              searchParams={sp}
            />
          </>
        ) : (
          <p className="mt-8 text-center text-muted">
            Aucune offre ne correspond à vos filtres à {location.city}.
          </p>
        )}

        {companiesInCity.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold">
              Entreprises qui recrutent à {location.city}
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {companiesInCity.map((c) => (
                <Link
                  key={c.slug}
                  href={`/entreprise/${c.slug}`}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm hover:shadow-sm"
                >
                  {c.name}{" "}
                  <span className="text-muted">
                    ({c._count.jobs})
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {otherCities.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold">Autres villes</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {otherCities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/emplois/${c.slug}`}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm hover:shadow-sm"
                >
                  {c.city}{" "}
                  <span className="text-muted">
                    ({c._count.jobs})
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
