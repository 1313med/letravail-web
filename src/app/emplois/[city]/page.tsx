import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { PremiumJobCard } from "@/components/premium/JobCard";
import { CityGrid, CityHero } from "@/components/premium/CityVisuals";
import { JobFilters } from "@/components/JobFilters";
import { Pagination } from "@/components/Pagination";
import { JsonLd } from "@/components/JsonLd";
import { MIN_JOBS_FOR_CITY_INDEX, REVALIDATE_SECONDS } from "@/lib/constants";
import { getCityIntro } from "@/lib/cities";
import {
  getCityJobCount, getCompaniesInCity, getCompaniesForFilter,
  getContractTypes, getJobs, getLocationBySlug, getOtherCities, getTags, getTopCitySlugs,
} from "@/lib/queries";
import { buildBreadcrumbJsonLd, buildCanonical, buildPageMetadata } from "@/lib/seo";

export const revalidate = REVALIDATE_SECONDS;

interface Props {
  params: { city: string };
  searchParams: Record<string, string | undefined>;
}

export async function generateStaticParams() {
  return (await getTopCitySlugs()).map((city) => ({ city }));
}

export async function generateMetadata({ params }: Props) {
  const location = await getLocationBySlug(params.city);
  if (!location) return { title: "Ville introuvable" };
  const count = await getCityJobCount(params.city);
  return buildPageMetadata({
    title: `Emploi ${location.city} (${count} postes)`,
    description: `${count} offres d'emploi à ${location.city}, Maroc. CDI, CDD, stages — mises à jour automatiquement.`,
    path: `/emplois/${params.city}`,
    noindex: count < MIN_JOBS_FOR_CITY_INDEX,
  });
}

export default async function CityJobsPage({ params, searchParams: sp }: Props) {
  const location = await getLocationBySlug(params.city);
  if (!location || location._count.jobs === 0) notFound();

  const filters = { city: params.city, company: sp.company, contract: sp.contract, tag: sp.tag, page: sp.page ? parseInt(sp.page, 10) : 1 };
  const [jobsResult, companiesInCity, otherCities, contractTypes, allCompanies, tags] = await Promise.all([
    getJobs(filters), getCompaniesInCity(params.city), getOtherCities(params.city),
    getContractTypes(), getCompaniesForFilter(), getTags(),
  ]);
  const cityIntro = getCityIntro(location.city, params.city);

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: "Accueil", url: buildCanonical("/") },
        { name: location.city, url: buildCanonical(`/emplois/${params.city}`) },
      ])} />

      <CityHero city={location.city} slug={params.city} jobCount={location._count.jobs} />

      <div className="container-xl pb-24 pt-12">
        <div className="card-glass p-8">
          {cityIntro.paragraphs.map((p, i) => (
            <p key={i} className="mb-4 text-[15px] leading-[1.8] text-slate-text last:mb-0">{p}</p>
          ))}
        </div>

        <div className="mt-6 card-glass p-5">
          <Suspense fallback={null}>
            <JobFilters cities={[]} companies={allCompanies} contractTypes={contractTypes} tags={tags} basePath={`/emplois/${params.city}`} />
          </Suspense>
        </div>

        {jobsResult.jobs.length > 0 ? (
          <>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {jobsResult.jobs.map((job) => <PremiumJobCard key={job.id} job={job} />)}
            </div>
            <Pagination currentPage={jobsResult.page} totalPages={jobsResult.totalPages} basePath={`/emplois/${params.city}`} searchParams={sp} />
          </>
        ) : (
          <p className="mt-12 text-center text-slate-muted">Aucune offre ne correspond à vos filtres.</p>
        )}

        {companiesInCity.length > 0 && (
          <section className="mt-20">
            <h2 className="text-xl font-bold">Entreprises à {location.city}</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {companiesInCity.map((c) => (
                <Link key={c.slug} href={`/entreprise/${c.slug}`} className="badge-navy hover:border-mint/30">
                  {c.name} ({c._count.jobs})
                </Link>
              ))}
            </div>
          </section>
        )}

        {otherCities.length > 0 && (
          <section className="mt-20">
            <h2 className="text-xl font-bold">Autres villes</h2>
            <div className="mt-8">
              <CityGrid cities={otherCities} />
            </div>
          </section>
        )}
      </div>
    </>
  );
}
