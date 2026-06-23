import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { JobsDiscoveryShell } from "@/components/jobs/JobsDiscoveryShell";
import { JOBS_FAQ_ITEMS } from "@/lib/jobs-faq";
import { CityGrid } from "@/components/premium/CityVisuals";
import { MIN_JOBS_FOR_CITY_INDEX, REVALIDATE_SECONDS } from "@/lib/constants";
import { getCityIntro } from "@/lib/cities";
import { listingCanonicalPath, shouldNoindexListing } from "@/lib/indexation";
import { parseFiltersFromSearchParams } from "@/lib/jobs-discovery";
import {
  getCityJobCount,
  getCompaniesInCity,
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
  buildFaqJsonLd,
  buildJobListJsonLd,
  buildPageMetadata,
} from "@/lib/seo";

export const revalidate = REVALIDATE_SECONDS;

interface Props {
  params: { city: string };
  searchParams: Record<string, string | undefined>;
}

export async function generateStaticParams() {
  return (await getTopCitySlugs()).map((city) => ({ city }));
}

export async function generateMetadata({ params, searchParams }: Props) {
  const location = await getLocationBySlug(params.city);
  if (!location) return { title: "Ville introuvable" };
  const count = await getCityJobCount(params.city);
  return buildPageMetadata({
    title: `Emploi ${location.city} — ${count} offres`,
    description: `${count} offres d'emploi à ${location.city}, Maroc. CDI, CDD, stages et alternance — mises à jour automatiquement.`,
    path: listingCanonicalPath(`/emplois/${params.city}`, searchParams),
    noindex: count < MIN_JOBS_FOR_CITY_INDEX || shouldNoindexListing(searchParams, count),
  });
}

export default async function CityJobsPage({ params, searchParams: sp }: Props) {
  const location = await getLocationBySlug(params.city);
  if (!location || location._count.jobs === 0) notFound();

  const filters = parseFiltersFromSearchParams(sp, params.city);
  const [jobsResult, companiesInCity, otherCities, contractTypes, tags] =
    await Promise.all([
      getJobs(filters),
      getCompaniesInCity(params.city),
      getOtherCities(params.city),
      getContractTypes(),
      getTags(),
    ]);

  const cityIntro = getCityIntro(location.city, params.city);
  const contractList = contractTypes.length > 0
    ? contractTypes
    : ["CDI", "CDD", "Stage", "Freelance", "Alternance"];

  const intro = (
    <div className="mb-10 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
      {cityIntro.paragraphs.map((p, i) => (
        <p key={i} className="mb-3 text-[15px] leading-relaxed text-slate-text last:mb-0">{p}</p>
      ))}
    </div>
  );

  const footerSections = (
    <>
      {companiesInCity.length > 0 && (
        <section className="mt-16 border-t border-white/5 pt-12">
          <h2 className="text-xl font-bold text-white">Entreprises à {location.city}</h2>
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
        <section className="mt-16 border-t border-white/5 pt-12">
          <h2 className="text-xl font-bold text-white">Autres villes</h2>
          <div className="mt-8">
            <CityGrid cities={otherCities} />
          </div>
        </section>
      )}
    </>
  );

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: "Accueil", url: buildCanonical("/") },
        { name: "Offres", url: buildCanonical("/emplois") },
        { name: location.city, url: buildCanonical(`/emplois/${params.city}`) },
      ])} />
      <JsonLd
        data={buildJobListJsonLd(
          jobsResult.jobs,
          `Offres d'emploi à ${location.city}`,
          buildCanonical(`/emplois/${params.city}`)
        )}
      />
      <JsonLd data={buildFaqJsonLd(JOBS_FAQ_ITEMS.map((f) => ({ question: f.q, answer: f.a })))} />

      <JobsDiscoveryShell
        jobs={jobsResult.jobs}
        total={jobsResult.total}
        page={jobsResult.page}
        totalPages={jobsResult.totalPages}
        searchParams={sp}
        cities={[]}
        contractTypes={contractList}
        tags={tags}
        basePath={`/emplois/${params.city}`}
        heroTitle={`Emploi à ${location.city}`}
        heroSubtitle={`Explorez les opportunités professionnelles à ${location.city} et trouvez votre prochain chapitre.`}
        heroLabel={location.city}
        hideCityFilter
        fixedCity={params.city}
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Offres", href: "/emplois" },
          { label: location.city },
        ]}
        intro={intro}
      />

      <div className="section-dark container-xl pb-24">
        {footerSections}
      </div>
    </>
  );
}
