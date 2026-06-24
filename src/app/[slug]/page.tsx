import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { JobsDiscoveryShell } from "@/components/jobs/JobsDiscoveryShell";
import { JobAlertSignup } from "@/components/seo/JobAlertSignup";
import { SeoHubFooter } from "@/components/seo/SeoHubFooter";
import { REVALIDATE_SECONDS } from "@/lib/constants";
import { shouldNoindexLanding, shouldNoindexListing } from "@/lib/indexation";
import {
  buildLandingFaq,
  isLandingSlug,
  landingH1,
  landingIntro,
  landingToJobFilters,
  parseLandingSlug,
  sectorLandingSlug,
  type LandingPage,
} from "@/lib/landing-pages";
import { parseFiltersFromSearchParams } from "@/lib/jobs-discovery";
import {
  getCitiesForFilter,
  getCompaniesForLanding,
  getContractTypes,
  getIndexableLandingSlugs,
  getJobCount,
  getJobs,
  getSalaryStatsForRole,
  getTags,
} from "@/lib/queries";
import {
  parseSalaryPublicSlug,
  SALARY_ROLES,
  salaryPublicSlug,
} from "@/lib/salary-data";
import {
  buildBreadcrumbJsonLd,
  buildCanonical,
  buildFaqJsonLd,
  buildJobListJsonLd,
  buildPageMetadata,
  buildSalaryJsonLd,
} from "@/lib/seo";
import { SalaryPageContent } from "@/components/salaires/SalaryPageContent";

export const revalidate = REVALIDATE_SECONDS;

interface Props {
  params: { slug: string };
  searchParams: Record<string, string | undefined>;
}

export async function generateStaticParams() {
  const [landings, salaries] = await Promise.all([
    getIndexableLandingSlugs(),
    Promise.resolve(SALARY_ROLES.map((r) => ({ slug: salaryPublicSlug(r.slug) }))),
  ]);
  return [...landings, ...salaries];
}

export async function generateMetadata({ params, searchParams }: Props) {
  const salaryRole = parseSalaryPublicSlug(params.slug);
  if (salaryRole) {
    const data = await getSalaryStatsForRole(salaryRole.slug);
    const median = data?.stats.median ?? salaryRole.fallback.median;
    return buildPageMetadata({
      title: `Salaire ${salaryRole.title} au Maroc (${median.toLocaleString("fr-MA")} MAD)`,
      description: `Salaire moyen ${salaryRole.title} au Maroc. Fourchettes junior, confirmé, senior et salaires par ville.`,
      path: `/${params.slug}`,
    });
  }

  const landing = parseLandingSlug(params.slug);
  if (!landing) return { title: "Page introuvable" };

  const jobCount = await getJobCount(landingToJobFilters(landing));
  const title = landingH1(landing, jobCount);
  const description = `${jobCount} offres — ${landingIntro(landing).slice(0, 140)}…`;

  return buildPageMetadata({
    title,
    description,
    path: `/${params.slug}`,
    noindex: shouldNoindexLanding(jobCount) || shouldNoindexListing(searchParams),
  });
}

function landingBreadcrumbs(landing: LandingPage): { label: string; href?: string }[] {
  const items: { label: string; href?: string }[] = [
    { label: "Accueil", href: "/" },
    { label: "Offres", href: "/emplois" },
  ];
  if (landing.type === "sector") {
    items.push({ label: `Emploi ${landing.sector.label} Maroc` });
  } else if (landing.type === "combo") {
    items.push({
      label: `Emploi ${landing.sector.label} Maroc`,
      href: `/${sectorLandingSlug(landing.sector.slug)}`,
    });
    items.push({ label: landing.city.name });
  } else {
    items.push({ label: `Emploi ${landing.contract.label} Maroc` });
  }
  return items;
}

export default async function DynamicLandingPage({ params, searchParams: sp }: Props) {
  const salaryRole = parseSalaryPublicSlug(params.slug);
  if (salaryRole) {
    const data = await getSalaryStatsForRole(salaryRole.slug);
    if (!data) notFound();
    const path = `/${params.slug}`;
    const faq = [
      {
        q: `Quel est le salaire moyen d'un ${salaryRole.title} au Maroc ?`,
        a: `La médiane observée est d'environ ${data.stats.median.toLocaleString("fr-MA")} MAD/mois (${data.stats.sampleSize} offres analysées).`,
      },
      {
        q: "Ces données sont-elles fiables ?",
        a: "Les fourchettes sont calculées à partir des salaires affichés dans les offres publiées sur Letravail.ma.",
      },
    ];
    return (
      <>
        <JsonLd
          data={buildSalaryJsonLd({
            title: salaryRole.title,
            min: data.stats.min,
            median: data.stats.median,
            max: data.stats.max,
            path,
            sampleSize: data.stats.sampleSize,
          })}
        />
        <JsonLd data={buildFaqJsonLd(faq.map((f) => ({ question: f.q, answer: f.a })))} />
        <SalaryPageContent role={data.role} stats={data.stats} />
        <SeoHubFooter />
      </>
    );
  }

  if (!isLandingSlug(params.slug)) notFound();
  const landing = parseLandingSlug(params.slug);
  if (!landing) notFound();

  const filters = { ...landingToJobFilters(landing), ...parseFiltersFromSearchParams(sp) };
  const [jobsResult, cities, contractTypes, tags, companies, jobCount] = await Promise.all([
    getJobs(filters),
    getCitiesForFilter(),
    getContractTypes(),
    getTags(),
    getCompaniesForLanding(landingToJobFilters(landing)),
    getJobCount(landingToJobFilters(landing)),
  ]);

  const h1 = landingH1(landing, jobCount);
  const intro = landingIntro(landing);
  const faq = buildLandingFaq(landing, jobCount);
  const path = `/${params.slug}`;
  const sectorSlug = landing.type !== "contract" ? landing.sector.slug : undefined;
  const cityShort = landing.type === "combo" ? landing.city.short : undefined;

  const contractList =
    contractTypes.length > 0 ? contractTypes : ["CDI", "CDD", "Stage", "Freelance", "Alternance"];

  const introBlock = (
    <div className="mb-10 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
      <p className="text-[15px] leading-relaxed text-slate-text">{intro}</p>
      {companies.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-dim">Entreprises qui recrutent</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {companies.map((c) => (
              <Link key={c.slug} href={`/entreprise/${c.slug}`} className="badge-navy hover:border-mint/30">
                {c.name} ({c._count.jobs})
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const footerExtra = (
    <div className="container-xl pb-16">
      <JobAlertSignup
        citySlug={landing.type === "combo" ? landing.city.slug : undefined}
        sectorSlug={sectorSlug}
        label={`Alertes emploi${landing.type === "combo" ? ` à ${landing.city.name}` : ""}${sectorSlug ? ` — ${landing.type !== "contract" ? landing.sector.label : ""}` : ""}`}
      />
    </div>
  );

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd(
          landingBreadcrumbs(landing).map((b, i, arr) => ({
            name: b.label,
            url: buildCanonical(b.href ?? (i === arr.length - 1 ? path : "/emplois")),
          }))
        )}
      />
      <JsonLd
        data={buildJobListJsonLd(jobsResult.jobs, h1, buildCanonical(path))}
      />
      <JsonLd data={buildFaqJsonLd(faq.map((f) => ({ question: f.q, answer: f.a })))} />

      <JobsDiscoveryShell
        jobs={jobsResult.jobs}
        total={jobsResult.total}
        page={jobsResult.page}
        totalPages={jobsResult.totalPages}
        searchParams={sp}
        cities={cities}
        contractTypes={contractList}
        tags={tags}
        basePath={path}
        heroTitle={h1}
        heroSubtitle={intro.slice(0, 120) + "…"}
        hideCityFilter={landing.type === "combo"}
        fixedCity={landing.type === "combo" ? landing.city.slug : undefined}
        breadcrumbs={landingBreadcrumbs(landing)}
        intro={introBlock}
      />

      {footerExtra}
      <SeoHubFooter currentSector={sectorSlug} currentCity={cityShort} />
    </>
  );
}
