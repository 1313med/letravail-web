import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { JobsDiscoveryShell } from "@/components/jobs/JobsDiscoveryShell";
import { JobAlertSignup } from "@/components/seo/JobAlertSignup";
import { SeoHubFooter } from "@/components/seo/SeoHubFooter";
import { REVALIDATE_SECONDS } from "@/lib/constants";
import { shouldNoindexLanding, shouldNoindexListing, shouldNoindexProfession, shouldNoindexSalaryPage } from "@/lib/indexation";
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
import { buildProfessionGraph } from "@/lib/knowledge-graph";
import { buildOgImageUrl } from "@/lib/og-images";
import {
  parseProfessionLandingSlug,
  professionIntro,
  professionTitle,
} from "@/lib/profession-taxonomy";
import { parseFiltersFromSearchParams } from "@/lib/jobs-discovery";
import {
  getCitiesForFilter,
  getCompaniesForLanding,
  getContractTypes,
  getIndexableLandingSlugs,
  getIndexableProfessionSlugs,
  getJobCount,
  getJobs,
  getProfessionJobCount,
  getProfessionJobs,
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
  buildProfessionJsonLd,
  buildSalaryJsonLd,
} from "@/lib/seo";
import { SalaryPageContent } from "@/components/salaires/SalaryPageContent";

export const revalidate = REVALIDATE_SECONDS;

interface Props {
  params: { slug: string };
  searchParams: Record<string, string | undefined>;
}

export async function generateStaticParams() {
  const [landings, salaries, professions] = await Promise.all([
    getIndexableLandingSlugs(),
    Promise.resolve(SALARY_ROLES.map((r) => ({ slug: salaryPublicSlug(r.slug) }))),
    getIndexableProfessionSlugs(),
  ]);
  return [
    ...landings,
    ...salaries,
    ...professions.map((p) => ({ slug: p.slug })),
  ];
}

export async function generateMetadata({ params, searchParams }: Props) {
  const profession = parseProfessionLandingSlug(params.slug);
  if (profession) {
    const jobCount = await getProfessionJobCount(profession);
    return buildPageMetadata({
      title: professionTitle(profession, jobCount),
      description: professionIntro(profession, jobCount).slice(0, 155),
      path: `/${params.slug}`,
      noindex: shouldNoindexProfession(jobCount) || shouldNoindexListing(searchParams),
      ogImage: buildOgImageUrl("profession", {
        title: `Emploi ${profession.name} Maroc`,
        subtitle: `${jobCount} offres actives`,
      }),
    });
  }

  const salaryRole = parseSalaryPublicSlug(params.slug);
  if (salaryRole) {
    const data = await getSalaryStatsForRole(salaryRole.slug);
    const median = data?.stats.median ?? salaryRole.fallback.median;
    const observationCount = data?.observationCount ?? 0;
    return buildPageMetadata({
      title: `Salaire ${salaryRole.title} au Maroc (${median.toLocaleString("fr-MA")} MAD)`,
      description: `Salaire moyen ${salaryRole.title} au Maroc. Fourchettes junior, confirmé, senior et salaires par ville.`,
      path: `/${params.slug}`,
      noindex: shouldNoindexSalaryPage(observationCount),
      ogImage: buildOgImageUrl("salary", {
        title: `Salaire ${salaryRole.title}`,
        subtitle: `Médiane ${median.toLocaleString("fr-MA")} MAD/mois`,
      }),
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
  const profession = parseProfessionLandingSlug(params.slug);
  if (profession) {
    const path = `/${params.slug}`;
    const extraFilters = parseFiltersFromSearchParams(sp);
    const [jobsResult, jobCount, graph, cities, contractTypes, tags] = await Promise.all([
      getProfessionJobs(profession, extraFilters),
      getProfessionJobCount(profession),
      buildProfessionGraph(profession),
      getCitiesForFilter(),
      getContractTypes(),
      getTags(),
    ]);

    const indexable = !shouldNoindexProfession(jobCount);
    const h1 = professionTitle(profession, jobCount);
    const intro = professionIntro(profession, jobCount);
    const faq = [
      {
        q: `Combien d'offres ${profession.name} au Maroc ?`,
        a: `${jobCount} offre${jobCount > 1 ? "s" : ""} active${jobCount > 1 ? "s" : ""} pour ${profession.name} sur Letravail.ma.`,
      },
      {
        q: `Quelles compétences pour ${profession.name} ?`,
        a: `Compétences fréquentes : ${profession.skills.join(", ")}.`,
      },
      {
        q: `Où trouve-t-on le plus d'offres ${profession.name} ?`,
        a: graph.relatedLinks
          .filter((l) => l.type === "CITY")
          .slice(0, 3)
          .map((l) => l.label)
          .join(", ") || "Consultez les villes listées ci-dessous.",
      },
    ];

    const introBlock = (
      <div className="mb-10 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-[15px] leading-relaxed text-slate-text">{intro}</p>
        {profession.skills.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-dim">Compétences clés</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {profession.skills.map((skill) => (
                <span key={skill} className="badge-navy">{skill}</span>
              ))}
            </div>
          </div>
        )}
        {graph.relatedLinks.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-dim">Pages liées</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {graph.relatedLinks.map((link) => (
                <Link key={link.href} href={link.href} className="badge-navy hover:border-mint/30">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    const contractList =
      contractTypes.length > 0 ? contractTypes : ["CDI", "CDD", "Stage", "Freelance", "Alternance"];

    return (
      <>
        {indexable && (
          <>
            <JsonLd
              data={buildProfessionJsonLd({
                name: profession.name,
                path,
                jobCount,
                skills: profession.skills,
              })}
            />
            <JsonLd data={buildFaqJsonLd(faq.map((f) => ({ question: f.q, answer: f.a })))} />
          </>
        )}
        <JsonLd
          data={buildJobListJsonLd(jobsResult.jobs, h1, buildCanonical(path))}
        />

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
          breadcrumbs={[
            { label: "Accueil", href: "/" },
            { label: "Offres", href: "/emplois" },
            { label: profession.name },
          ]}
          intro={introBlock}
        />
        <SeoHubFooter currentSector={profession.sectorSlug} />
      </>
    );
  }

  const salaryRole = parseSalaryPublicSlug(params.slug);
  if (salaryRole) {
    const data = await getSalaryStatsForRole(salaryRole.slug);
    if (!data) notFound();
    const path = `/${params.slug}`;
    const indexable = !shouldNoindexSalaryPage(data.observationCount);
    const faq = [
      {
        q: `Quel est le salaire moyen d'un ${salaryRole.title} au Maroc ?`,
        a: `La médiane observée est d'environ ${data.stats.median.toLocaleString("fr-MA")} MAD/mois (${data.stats.sampleSize} offres analysées).`,
      },
      {
        q: "Ces données sont-elles fiables ?",
        a: data.observationCount >= 5
          ? `Les fourchettes sont calculées à partir de ${data.observationCount} observations salariales réelles sur Letravail.ma.`
          : "Les fourchettes affichées sont des estimations basées sur le marché marocain — données insuffisantes pour une analyse indexable.",
      },
    ];
    return (
      <>
        {indexable && (
          <>
            <JsonLd
              data={buildSalaryJsonLd({
                title: salaryRole.title,
                min: data.stats.min,
                median: data.stats.median,
                max: data.stats.max,
                path,
                sampleSize: data.stats.sampleSize,
                observationCount: data.observationCount,
              })}
            />
            <JsonLd data={buildFaqJsonLd(faq.map((f) => ({ question: f.q, answer: f.a })))} />
          </>
        )}
        <SalaryPageContent
          role={data.role}
          stats={data.stats}
          observationCount={data.observationCount}
          indexable={indexable}
        />
        <SeoHubFooter />
      </>
    );
  }

  if (!isLandingSlug(params.slug) && !parseProfessionLandingSlug(params.slug)) notFound();
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
