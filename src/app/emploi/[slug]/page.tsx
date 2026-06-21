import { notFound } from "next/navigation";
import Link from "next/link";
import { PremiumJobCard } from "@/components/premium/JobCard";
import { StickyApplyBar } from "@/components/StickyApplyBar";
import { JsonLd } from "@/components/JsonLd";
import { REVALIDATE_SECONDS } from "@/lib/constants";
import { getAvatarGradient, getInitials } from "@/lib/gradients";
import { getJobBySlug, getRecentJobSlugs, getSimilarJobs } from "@/lib/queries";
import { buildBreadcrumbJsonLd, buildCanonical, buildJobPostingJsonLd, buildPageMetadata } from "@/lib/seo";
import { excerpt, formatRelativeDate, isJobExpired } from "@/lib/utils";

export const revalidate = REVALIDATE_SECONDS;

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  const slugs = await getRecentJobSlugs(100);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const job = await getJobBySlug(params.slug);
  if (!job) return { title: "Offre introuvable" };
  return buildPageMetadata({
    title: `${job.title} — ${job.company}, ${job.city}`,
    description: excerpt(job.description, 155),
    path: `/emploi/${job.slug}`,
  });
}

export default async function JobDetailPage({ params }: Props) {
  const job = await getJobBySlug(params.slug);
  if (!job) notFound();

  const expired = isJobExpired(job.expiresAt);
  const similarJobs = await getSimilarJobs({ id: job.id, city: job.city, companyId: job.companyId });
  const citySlug = job.location?.slug;
  const companySlug = job.companyRef?.slug;
  const gradient = getAvatarGradient(job.company);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: buildCanonical("/") },
    ...(citySlug ? [{ name: job.city, url: buildCanonical(`/emplois/${citySlug}`) }] : []),
    ...(companySlug ? [{ name: job.company, url: buildCanonical(`/entreprise/${companySlug}`) }] : []),
    { name: job.title, url: buildCanonical(`/emploi/${job.slug}`) },
  ]);

  const jobJsonLd = buildJobPostingJsonLd({
    slug: job.slug, title: job.title, description: job.description,
    company: job.company, city: job.city, country: job.country,
    contractType: job.contractType, remote: job.remote,
    applicationUrl: job.applicationUrl, publishedAt: job.publishedAt, expiresAt: job.expiresAt,
  });

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, jobJsonLd]} />
      <StickyApplyBar applicationUrl={job.applicationUrl} company={job.company} />

      <div className="pt-24 lg:pt-32">
        <div className="container-xl pb-28 lg:pb-16">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-muted">
            <Link href="/" className="hover:text-mint">Accueil</Link>
            <span>/</span>
            {citySlug ? <Link href={`/emplois/${citySlug}`} className="hover:text-mint">{job.city}</Link> : <span>{job.city}</span>}
            <span>/</span>
            <span className="text-white">{job.title}</span>
          </nav>

          {expired && (
            <div className="mb-8 rounded-3xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-200" role="alert">
              Cette offre a expiré. Consultez les offres similaires ci-dessous.
            </div>
          )}

          <div className="lg:grid lg:grid-cols-3 lg:gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="card-glass p-8">
                <div className="flex items-start gap-5">
                  <span className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-bold text-white ${gradient}`}>
                    {getInitials(job.company)}
                  </span>
                  <div>
                    <h1 className="text-2xl font-bold sm:text-3xl">{job.title}</h1>
                    <p className="mt-2 text-lg text-slate-text">
                      {companySlug ? <Link href={`/entreprise/${companySlug}`} className="hover:text-mint">{job.company}</Link> : job.company}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {citySlug && <Link href={`/emplois/${citySlug}`} className="badge-navy">{job.city}</Link>}
                  {job.contractType && <span className="badge-mint">{job.contractType}</span>}
                  {job.remote && <span className="badge-navy">Remote</span>}
                  {job.salary && <span className="badge-mint">{job.salary}</span>}
                </div>
                {job.publishedAt && (
                  <time className="mt-4 block text-sm text-slate-dim" dateTime={job.publishedAt.toISOString()}>
                    Publié {formatRelativeDate(job.publishedAt)}
                  </time>
                )}
              </div>

              <div className="card-glass p-8">
                <h2 className="text-lg font-bold">Description</h2>
                <div className="mt-4 whitespace-pre-wrap text-[15px] leading-[1.8] text-slate-text">{job.description}</div>
                {job.requirements && (
                  <>
                    <h2 className="mt-10 text-lg font-bold">Profil recherché</h2>
                    <div className="mt-4 whitespace-pre-wrap text-[15px] leading-[1.8] text-slate-text">{job.requirements}</div>
                  </>
                )}
              </div>
            </div>

            <aside className="mt-8 lg:mt-0">
              <div className="sticky top-28 space-y-4">
                <div className="card-glass overflow-hidden p-6">
                  <div className="h-1 bg-gradient-to-r from-mint to-mint-glow" />
                  <h3 className="mt-4 font-bold">Postuler</h3>
                  <p className="mt-2 text-sm text-slate-muted">Redirection vers le site de {job.company}</p>
                  <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer" className="btn-mint mt-5 w-full text-center">
                    Postuler maintenant
                  </a>
                </div>
                <div className="card-glass p-5 text-sm">
                  <dl className="space-y-3">
                    <div className="flex justify-between"><dt className="text-slate-muted">Entreprise</dt><dd className="font-medium">{job.company}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-muted">Ville</dt><dd className="font-medium">{job.city}</dd></div>
                    {job.contractType && <div className="flex justify-between"><dt className="text-slate-muted">Contrat</dt><dd className="font-medium">{job.contractType}</dd></div>}
                  </dl>
                </div>
              </div>
            </aside>
          </div>

          {similarJobs.length > 0 && (
            <section className="mt-20">
              <h2 className="heading-md">Offres similaires</h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {similarJobs.map((j) => <PremiumJobCard key={j.id} job={j} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
