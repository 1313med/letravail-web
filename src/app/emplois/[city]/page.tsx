import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobCard } from "@/components/JobCard";
import { JobFilters } from "@/components/JobFilters";
import { Pagination } from "@/components/Pagination";
import { JsonLd } from "@/components/JsonLd";
import { CityCard } from "@/components/ui/CityCard";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MIN_JOBS_FOR_CITY_INDEX, REVALIDATE_SECONDS } from "@/lib/constants";
import { getCityIntro } from "@/lib/cities";
import { getCityEmoji } from "@/lib/gradients";
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

      <PageHero
        badge={`${getCityEmoji(citySlug)} ${location.city}`}
        title={`Offres d'emploi à ${location.city}`}
        subtitle={pluralize(jobCount, "offre disponible", "offres disponibles")}
      />

      <div className="page-container py-10">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Offres d'emploi", href: "/emplois" },
            { label: location.city },
          ]}
        />

        <div className="card p-6 sm:p-8">
          <div className="space-y-4 text-[15px] leading-[1.8] text-muted">
            {cityIntro.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        <div className="mt-6 card p-4 sm:p-5">
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
          <div className="mt-12 flex flex-col items-center rounded-3xl border border-dashed border-border bg-surface py-16 text-center">
            <span className="text-5xl" aria-hidden="true">🔍</span>
            <h2 className="mt-4 text-lg font-bold text-foreground">
              Aucune offre à {location.city}
            </h2>
            <p className="mt-2 text-sm text-muted">
              Modifiez vos filtres pour voir plus de résultats.
            </p>
          </div>
        )}

        {companiesInCity.length > 0 && (
          <section className="mt-20">
            <SectionHeader
              label="Employeurs"
              title={`Entreprises qui recrutent à ${location.city}`}
            />
            <div className="mt-6 flex flex-wrap gap-2">
              {companiesInCity.map((c) => (
                <Link
                  key={c.slug}
                  href={`/entreprise/${c.slug}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:border-accent/30 hover:shadow-md"
                >
                  {c.name}
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
                    {c._count.jobs}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {otherCities.length > 0 && (
          <section className="mt-16">
            <SectionHeader label="Explorer" title="Autres villes" />
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {otherCities.map((c) => (
                <CityCard
                  key={c.slug}
                  city={c.city}
                  slug={c.slug}
                  jobCount={c._count.jobs}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
