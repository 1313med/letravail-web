import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobCard } from "@/components/JobCard";
import { JobFilters } from "@/components/JobFilters";
import { Pagination } from "@/components/Pagination";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
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

      <PageHero
        badge={`${pluralize(totalJobs, "offre", "offres")} au Maroc`}
        title="Toutes les offres d'emploi"
        subtitle={
          filters.q
            ? `Résultats pour « ${filters.q} »`
            : "Parcourez et filtrez les opportunités dans tout le royaume."
        }
      />

      <div className="page-container py-10">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Offres d'emploi" },
          ]}
        />

        <div className="card p-4 sm:p-5">
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

        <p className="mt-6 text-sm font-medium text-muted">
          {pluralize(jobsResult.total, "résultat", "résultats")}
          {jobsResult.totalPages > 1 && (
            <> · Page {jobsResult.page} sur {jobsResult.totalPages}</>
          )}
        </p>

        {jobsResult.jobs.length > 0 ? (
          <>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
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
          <div className="mt-12 flex flex-col items-center rounded-3xl border border-dashed border-border bg-surface py-16 text-center">
            <span className="text-5xl" aria-hidden="true">🔍</span>
            <h2 className="mt-4 text-lg font-bold text-foreground">
              Aucune offre trouvée
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Essayez de modifier vos filtres ou élargissez votre recherche.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
