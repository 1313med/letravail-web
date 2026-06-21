import { JsonLd } from "@/components/JsonLd";
import { JobsDiscoveryShell } from "@/components/jobs/JobsDiscoveryShell";
import { JOBS_FAQ_ITEMS } from "@/lib/jobs-faq";
import { REVALIDATE_SECONDS } from "@/lib/constants";
import { parseFiltersFromSearchParams } from "@/lib/jobs-discovery";
import {
  getCitiesForFilter,
  getContractTypes,
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
  const path = page > 1 ? `/emplois?page=${page}` : "/emplois";
  const q = searchParams.q;
  const title = q
    ? `Offres d'emploi : ${q} au Maroc`
    : "Offres d'emploi au Maroc";
  const description = q
    ? `Trouvez des offres d'emploi pour « ${q} » au Maroc. CDI, CDD, stages — filtres par ville, contrat et salaire.`
    : "Découvrez les meilleures opportunités professionnelles du royaume. Parcourez des centaines d'offres mises à jour au Maroc.";

  return buildPageMetadata({ title, description, path });
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
        heroLabel="Explorer"
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Offres d'emploi" },
        ]}
      />
    </>
  );
}
