import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobCard } from "@/components/JobCard";
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
import {
  buildBreadcrumbJsonLd,
  buildCanonical,
  buildPageMetadata,
} from "@/lib/seo";
import { pluralize } from "@/lib/utils";

export const revalidate = REVALIDATE_SECONDS;

interface Props {
  searchParams: Record<string, string | undefined>;
}

export async function generateMetadata({ searchParams }: Props) {
  const sp = searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const path = page > 1 ? `/emplois?page=${page}` : "/emplois";

  return buildPageMetadata({
    title: "Toutes les offres d'emploi au Maroc",
    description:
      "Parcourez toutes les offres d'emploi au Maroc. Filtrez par ville, entreprise, type de contrat et secteur. Mises à jour automatiquement.",
    path,
  });
}

export default async function AllJobsPage({ searchParams }: Props) {
  const sp = searchParams;

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

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: buildCanonical("/") },
    { name: "Offres d'emploi", url: buildCanonical("/emplois") },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Offres d'emploi" },
          ]}
        />

        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Toutes les offres d&apos;emploi au Maroc
        </h1>
        <p className="mt-2 text-muted">
          {pluralize(totalJobs, "offre au total", "offres au total")}
          {filters.q && (
            <> · Résultats pour &ldquo;{filters.q}&rdquo;</>
          )}
        </p>

        <div className="mt-8">
          <Suspense fallback={null}>
            <JobFilters
              cities={cities}
              companies={companies}
              contractTypes={contractTypes}
              tags={tags}
              basePath="/emplois"
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
              basePath="/emplois"
              searchParams={sp}
            />
          </>
        ) : (
          <p className="mt-8 text-center text-muted">
            Aucune offre ne correspond à votre recherche.
          </p>
        )}
      </div>
    </>
  );
}
