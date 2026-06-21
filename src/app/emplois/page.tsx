import { Suspense } from "react";
import Link from "next/link";
import { PremiumJobCard } from "@/components/premium/JobCard";
import { JobFilters } from "@/components/JobFilters";
import { Pagination } from "@/components/Pagination";
import { JsonLd } from "@/components/JsonLd";
import { REVALIDATE_SECONDS } from "@/lib/constants";
import {
  getCitiesForFilter,
  getCompaniesForFilter,
  getContractTypes,
  getJobs,
  getTags,
  getTotalJobCount,
} from "@/lib/queries";
import { buildBreadcrumbJsonLd, buildCanonical, buildPageMetadata } from "@/lib/seo";
import { pluralize } from "@/lib/utils";

export const revalidate = REVALIDATE_SECONDS;

interface Props {
  searchParams: Record<string, string | undefined>;
}

export async function generateMetadata({ searchParams }: Props) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const path = page > 1 ? `/emplois?page=${page}` : "/emplois";
  return buildPageMetadata({
    title: "Offres d'emploi au Maroc",
    description: "Parcourez toutes les offres d'emploi au Maroc. Filtrez par ville, entreprise, contrat et secteur.",
    path,
  });
}

export default async function AllJobsPage({ searchParams: sp }: Props) {
  const filters = {
    q: sp.q,
    city: sp.city,
    company: sp.company,
    contract: sp.contract,
    tag: sp.tag,
    page: sp.page ? parseInt(sp.page, 10) : 1,
  };

  const [jobsResult, totalJobs, cities, companies, contractTypes, tags] =
    await Promise.all([
      getJobs(filters),
      getTotalJobCount(),
      getCitiesForFilter(),
      getCompaniesForFilter(),
      getContractTypes(),
      getTags(),
    ]);

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: "Accueil", url: buildCanonical("/") },
        { name: "Offres", url: buildCanonical("/emplois") },
      ])} />

      <div className="pt-24 lg:pt-32">
        <div className="container-xl pb-24">
          <p className="section-label">Recherche</p>
          <h1 className="heading-lg mt-4">Offres d&apos;emploi au Maroc</h1>
          <p className="body-md mt-4">
            {pluralize(totalJobs, "offre", "offres")}
            {filters.q && <> · « {filters.q} »</>}
          </p>

          <div className="mt-10 card-glass p-5">
            <Suspense fallback={null}>
              <JobFilters cities={cities} companies={companies} contractTypes={contractTypes} tags={tags} basePath="/emplois" />
            </Suspense>
          </div>

          {jobsResult.jobs.length > 0 ? (
            <>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {jobsResult.jobs.map((job) => (
                  <PremiumJobCard key={job.id} job={job} />
                ))}
              </div>
              <Pagination currentPage={jobsResult.page} totalPages={jobsResult.totalPages} basePath="/emplois" searchParams={sp} />
            </>
          ) : (
            <div className="mt-16 rounded-3xl border border-dashed border-white/10 py-20 text-center">
              <p className="text-lg font-semibold">Aucune offre trouvée</p>
              <p className="mt-2 text-slate-muted">Modifiez vos filtres pour élargir la recherche.</p>
              <Link href="/emplois" className="btn-ghost mt-6 inline-flex">Effacer les filtres</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
