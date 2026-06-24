import { JsonLd } from "@/components/JsonLd";
import { JobsDiscoveryShell } from "@/components/jobs/JobsDiscoveryShell";
import { JOBS_FAQ_ITEMS } from "@/lib/jobs-faq";
import { REVALIDATE_SECONDS, JOBS_PER_PAGE } from "@/lib/constants";
import { listingCanonicalPath, shouldNoindexListing } from "@/lib/indexation";
import { parseFiltersFromSearchParams } from "@/lib/jobs-discovery";
import {
  getCitiesForFilter,
  getContractTypes,
  getJobCount,
  getJobs,
  getTags,
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
  searchParams: Record<string, string | undefined>;
}

export async function generateMetadata({ searchParams }: Props) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const path = listingCanonicalPath("/emplois", searchParams);
  const q = searchParams.q;
  const title = q
    ? `Offres d'emploi : ${q} au Maroc`
    : page > 1
      ? `Offres d'emploi au Maroc — page ${page}`
      : "Offres d'emploi au Maroc";
  const description = q
    ? `Trouvez des offres d'emploi pour « ${q} » au Maroc. CDI, CDD, stages — filtres par ville, contrat et salaire.`
    : "Découvrez les meilleures opportunités professionnelles du royaume. Parcourez des centaines d'offres mises à jour au Maroc.";

  const total = shouldNoindexListing(searchParams)
    ? undefined
    : await getJobCount(parseFiltersFromSearchParams(searchParams));

  const totalPages = total ? Math.ceil(total / JOBS_PER_PAGE) : 1;
  const pagination =
    !shouldNoindexListing(searchParams) && totalPages > 1
      ? {
          prev: page > 1 ? (page === 2 ? "/emplois" : `/emplois?page=${page - 1}`) : undefined,
          next: page < totalPages ? `/emplois?page=${page + 1}` : undefined,
        }
      : undefined;

  return buildPageMetadata({
    title,
    description,
    path,
    noindex: shouldNoindexListing(searchParams),
    pagination,
  });
}

export default async function AllJobsPage({ searchParams: sp }: Props) {
  const filters = parseFiltersFromSearchParams(sp);

  const [jobsResult, cities, contractTypes, tags] = await Promise.all([
    getJobs(filters),
    getCitiesForFilter(),
    getContractTypes(),
    getTags(),
  ]);

  const contractList = contractTypes.length > 0
    ? contractTypes
    : ["CDI", "CDD", "Stage", "Freelance", "Alternance"];

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: "Accueil", url: buildCanonical("/") },
        { name: "Offres d'emploi", url: buildCanonical("/emplois") },
      ])} />
      <JsonLd
        data={buildJobListJsonLd(
          jobsResult.jobs,
          "Offres d'emploi au Maroc",
          buildCanonical("/emplois")
        )}
      />
      <JsonLd data={buildFaqJsonLd(JOBS_FAQ_ITEMS.map((f) => ({ question: f.q, answer: f.a })))} />

      <JobsDiscoveryShell
        jobs={jobsResult.jobs}
        total={jobsResult.total}
        page={jobsResult.page}
        totalPages={jobsResult.totalPages}
        searchParams={sp}
        cities={cities}
        contractTypes={contractList}
        tags={tags}
        basePath="/emplois"
        heroTitle="Offres d'emploi au Maroc"
        heroSubtitle="Découvrez les meilleures opportunités professionnelles du royaume."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Offres d'emploi" },
        ]}
      />
    </>
  );
}
