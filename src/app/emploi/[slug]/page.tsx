import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { StickyApplyBar } from "@/components/StickyApplyBar";
import { JobDetailHero, JobApplyCard, JobCompanyMiniCard } from "@/components/job-detail/JobHero";
import { JobBreadcrumbs } from "@/components/job-detail/JobBreadcrumbs";
import { JobWhySection } from "@/components/job-detail/JobWhySection";
import { JobDescription } from "@/components/job-detail/JobDescription";
import { JobSkillsSection, JobBenefitsSection } from "@/components/job-detail/JobSkillsBenefits";
import { JobSalaryBlock } from "@/components/job-detail/JobSalaryBlock";
import { JobCompanyProfile } from "@/components/job-detail/JobCompanyProfile";
import { JobAiCopilot } from "@/components/job-detail/JobAiCopilot";
import { JobDetailFAQ, JobRelatedSearches } from "@/components/job-detail/JobDetailSeo";
import { SimilarJobsCarousel } from "@/components/job-detail/SimilarJobsCarousel";
import { JobViewTracker } from "@/components/seo/JobViewTracker";
import { REVALIDATE_SECONDS } from "@/lib/constants";
import { buildOgImageUrl } from "@/lib/og-images";
import {
  parseJobSections,
  extractSkills,
  extractBenefits,
  buildWhyHighlights,
  getCompanyMeta,
  parseSalaryRange,
  buildJobFaq,
  buildRelatedSearches,
} from "@/lib/job-detail";
import { TOP_EMPLOYER_SLUGS } from "@/lib/jobs-discovery";
import { getJobBySlug, getRecentJobSlugs, getSimilarJobs, getCompanyBySlug } from "@/lib/queries";
import { buildBreadcrumbJsonLd, buildCanonical, buildFaqJsonLd, buildJobPostingJsonLd, buildPageMetadata } from "@/lib/seo";
import { formatJobCardSalaryFromJob } from "@/lib/job-card-salary";
import { excerpt, isJobExpired } from "@/lib/utils";

export const revalidate = REVALIDATE_SECONDS;

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  const slugs = await getRecentJobSlugs(500);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const job = await getJobBySlug(params.slug);
  if (!job) return { title: "Offre introuvable" };
  const expired = isJobExpired(job.expiresAt);
  return buildPageMetadata({
    title: `${job.title} — ${job.company}, ${job.city}`,
    description: excerpt(job.description, 155),
    path: `/emploi/${job.slug}`,
    noindex: expired,
    ogImage: buildOgImageUrl("job", {
      title: job.title,
      subtitle: `${job.company} · ${job.city}`,
    }),
  });
}

export default async function JobDetailPage({ params }: Props) {
  const job = await getJobBySlug(params.slug);
  if (!job) notFound();

  const expired = isJobExpired(job.expiresAt);
  const citySlug = job.location?.slug;
  const companySlug = job.companyRef?.slug;
  const similarJobs = await getSimilarJobs({ id: job.id, city: job.city, companyId: job.companyId });
  const companyData = companySlug ? await getCompanyBySlug(companySlug) : null;

  const companyMeta = getCompanyMeta(companySlug);
  const isTopEmployer = companySlug ? TOP_EMPLOYER_SLUGS.has(companySlug) || companyMeta.topEmployer : false;
  const sections = parseJobSections(job.description, job.requirements);
  const skills = extractSkills(job.tags, job.description);
  const benefits = extractBenefits(job.description, job.requirements, job.remote);
  const whyHighlights = buildWhyHighlights(job, isTopEmployer);
  const salaryInsight = parseSalaryRange(job.salary, job.title);
  const jobTags = job.tags.map((t) => ({ slug: t.tag.slug, name: t.tag.name }));
  const salaryCard = formatJobCardSalaryFromJob({
    salary: job.salary,
    title: job.title,
    city: job.city,
    companyRef: job.companyRef,
    location: job.location,
    tags: jobTags,
    description: job.description,
  });
  const salaryDisplay =
    salaryCard.type !== "undisclosed"
      ? { text: salaryCard.text, isEstimated: salaryCard.type === "estimated" }
      : null;
  const faqItems = buildJobFaq(job);
  const relatedLinks = buildRelatedSearches(job);
  const otherCompanyJobs = companyData?.jobs.filter((j) => j.id !== job.id) ?? [];
  const activeJobs = companyData?.jobs.length ?? 0;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: buildCanonical("/") },
    ...(citySlug ? [{ name: job.city, url: buildCanonical(`/emplois/${citySlug}`) }] : []),
    ...(companySlug ? [{ name: job.company, url: buildCanonical(`/entreprise/${companySlug}`) }] : []),
    { name: job.title, url: buildCanonical(`/emploi/${job.slug}`) },
  ]);

  const jobJsonLd = !expired
    ? buildJobPostingJsonLd({
        id: job.id,
        slug: job.slug,
        title: job.title,
        description: job.description,
        company: job.company,
        city: job.city,
        country: job.country,
        contractType: job.contractType,
        remote: job.remote,
        applicationUrl: job.applicationUrl,
        publishedAt: job.publishedAt,
        expiresAt: job.expiresAt,
        createdAt: job.createdAt,
        salary: job.salary,
        citySlug: job.location?.slug,
        companySlug: job.companyRef?.slug,
        tags: jobTags,
      })
    : null;

  const breadcrumbs = [
    { label: "Accueil", href: "/" },
    ...(citySlug ? [{ label: job.city, href: `/emplois/${citySlug}` }] : []),
    { label: job.title },
  ];

  return (
    <>
      <JobViewTracker slug={job.slug} />
      <JsonLd data={[breadcrumbJsonLd, ...(jobJsonLd ? [jobJsonLd] : [])]} />
      <JsonLd data={buildFaqJsonLd(faqItems.map((f) => ({ question: f.q, answer: f.a })))} />

      <div className="section-dark min-h-screen pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-16">
        <JobDetailHero
          title={job.title}
          company={job.company}
          companySlug={companySlug}
          city={job.city}
          citySlug={citySlug}
          salaryDisplay={salaryDisplay}
          contractType={job.contractType}
          remote={job.remote}
          description={job.description}
          publishedAt={job.publishedAt}
          expired={expired}
        />

        <JobBreadcrumbs items={breadcrumbs} />

        <div className="container-xl pb-10 sm:pb-16">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-16">
            <main className="min-w-0">
              <JobWhySection highlights={whyHighlights} />
              <JobDescription sections={sections} />
              <JobSkillsSection skills={skills} />
              <JobBenefitsSection benefits={benefits} />
              <JobSalaryBlock insight={salaryInsight} title={job.title} />
              <JobCompanyProfile
                company={job.company}
                companySlug={companySlug}
                city={job.city}
                industry={companyMeta.industry}
                topEmployer={isTopEmployer}
                activeJobs={activeJobs}
                otherJobs={otherCompanyJobs}
              />
              <JobAiCopilot />
              <JobDetailFAQ items={faqItems} />
              <JobRelatedSearches links={relatedLinks} />
            </main>

            <aside className="hidden xl:block">
              <div className="sticky top-28 space-y-6">
                <JobApplyCard
                  slug={job.slug}
                  title={job.title}
                  company={job.company}
                  companySlug={companySlug}
                  applicationUrl={job.applicationUrl}
                  expiresAt={job.expiresAt}
                  expired={expired}
                />
                <JobCompanyMiniCard
                  company={job.company}
                  companySlug={companySlug}
                  city={job.city}
                  activeJobs={activeJobs}
                />
              </div>
            </aside>
          </div>
        </div>

        <SimilarJobsCarousel jobs={similarJobs} />
      </div>

      <StickyApplyBar
        slug={job.slug}
        applicationUrl={job.applicationUrl}
        company={job.company}
        expired={expired}
      />
    </>
  );
}
