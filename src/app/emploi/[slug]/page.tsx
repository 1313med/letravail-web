import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobCard } from "@/components/JobCard";
import { StickyApplyBar } from "@/components/StickyApplyBar";
import { JsonLd } from "@/components/JsonLd";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { REVALIDATE_SECONDS } from "@/lib/constants";
import { getAvatarGradient, getInitials } from "@/lib/gradients";
import {
  getJobBySlug,
  getRecentJobSlugs,
  getSimilarJobs,
} from "@/lib/queries";
import {
  buildBreadcrumbJsonLd,
  buildCanonical,
  buildJobPostingJsonLd,
  buildPageMetadata,
} from "@/lib/seo";
import {
  excerpt,
  formatDate,
  formatRelativeDate,
  isJobExpired,
} from "@/lib/utils";

export const revalidate = REVALIDATE_SECONDS;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getRecentJobSlugs(100);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Offre introuvable" };

  const description = excerpt(job.description, 155);
  return buildPageMetadata({
    title: `${job.title} — ${job.company}, ${job.city}`,
    description,
    path: `/emploi/${job.slug}`,
  });
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  const expired = isJobExpired(job.expiresAt);
  const similarJobs = await getSimilarJobs({
    id: job.id,
    city: job.city,
    companyId: job.companyId,
  });

  const citySlug = job.location?.slug;
  const companySlug = job.companyRef?.slug;
  const gradient = getAvatarGradient(job.company);

  const breadcrumbItems = [
    { label: "Accueil", href: "/" },
    ...(citySlug
      ? [{ label: job.city, href: `/emplois/${citySlug}` }]
      : [{ label: job.city }]),
    ...(companySlug
      ? [{ label: job.company, href: `/entreprise/${companySlug}` }]
      : [{ label: job.company }]),
    { label: job.title },
  ];

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: buildCanonical("/") },
    ...(citySlug
      ? [{ name: job.city, url: buildCanonical(`/emplois/${citySlug}`) }]
      : [{ name: job.city, url: buildCanonical(`/emploi/${job.slug}`) }]),
    ...(companySlug
      ? [{ name: job.company, url: buildCanonical(`/entreprise/${companySlug}`) }]
      : []),
    { name: job.title, url: buildCanonical(`/emploi/${job.slug}`) },
  ]);

  const jobJsonLd = buildJobPostingJsonLd({
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
  });

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, jobJsonLd]} />
      <StickyApplyBar applicationUrl={job.applicationUrl} company={job.company} />

      <div className="page-container py-8 pb-28 sm:py-10 lg:pb-10">
        <Breadcrumbs items={breadcrumbItems} />

        {expired && (
          <div
            className="mb-8 flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 text-sm text-amber-900"
            role="alert"
          >
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            Cette offre a expiré. Consultez les offres similaires ci-dessous.
          </div>
        )}

        <div className="lg:grid lg:grid-cols-3 lg:gap-10">
          <div className="lg:col-span-2">
            {/* Job header card */}
            <div className="card p-6 sm:p-8">
              <div className="flex items-start gap-5">
                <span
                  className={`avatar-gradient h-16 w-16 bg-gradient-to-br ${gradient} text-xl`}
                >
                  {getInitials(job.company)}
                </span>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {job.title}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {companySlug ? (
                      <Link
                        href={`/entreprise/${companySlug}`}
                        className="text-base font-semibold text-foreground transition-colors hover:text-accent"
                      >
                        {job.company}
                      </Link>
                    ) : (
                      <span className="text-base font-semibold">{job.company}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {citySlug ? (
                  <Link
                    href={`/emplois/${citySlug}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-surface px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-accent"
                  >
                    <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    {job.city}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-surface px-3 py-1.5 text-sm font-medium text-muted">
                    {job.city}
                  </span>
                )}
                {job.contractType && (
                  <span className="badge-contract">{job.contractType}</span>
                )}
                {job.remote && <span className="badge-remote">Télétravail</span>}
                {job.salary && (
                  <span className="badge-gold">{job.salary}</span>
                )}
              </div>

              {job.publishedAt && (
                <time
                  className="mt-4 block text-sm text-muted"
                  dateTime={job.publishedAt.toISOString()}
                >
                  Publié le {formatDate(job.publishedAt)} · {formatRelativeDate(job.publishedAt)}
                </time>
              )}
            </div>

            {/* Description */}
            <div className="mt-6 card p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground">Description du poste</h2>
              <div className="prose-job mt-4 whitespace-pre-wrap">
                {job.description}
              </div>

              {job.requirements && (
                <>
                  <h2 className="mt-10 text-lg font-bold text-foreground">
                    Profil recherché
                  </h2>
                  <div className="prose-job mt-4 whitespace-pre-wrap">
                    {job.requirements}
                  </div>
                </>
              )}
            </div>

            {job.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {job.tags.map(({ tag }) => (
                  <Link
                    key={tag.slug}
                    href={`/emplois?tag=${tag.slug}`}
                    className="badge bg-surface text-muted transition-colors hover:bg-accent/10 hover:text-accent"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            <p className="mt-6 text-xs text-muted-light">
              Source : {job.source}
            </p>
          </div>

          {/* Sidebar CTA */}
          <aside className="mt-8 lg:mt-0">
            <div className="sticky top-24 space-y-4">
              <div className="relative card overflow-hidden p-6">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent to-gold" />
                <h3 className="font-bold text-foreground">Intéressé(e) ?</h3>
                <p className="mt-2 text-sm text-muted">
                  Postulez directement sur le site officiel de {job.company}.
                </p>
                <a
                  href={job.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-5 w-full py-3.5 text-center"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  Postuler maintenant
                </a>
                <p className="mt-3 text-center text-xs text-muted-light">
                  Redirection vers le site de l&apos;employeur
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-surface p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-light">
                  Résumé
                </p>
                <dl className="mt-3 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted">Entreprise</dt>
                    <dd className="font-semibold text-foreground">{job.company}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Ville</dt>
                    <dd className="font-semibold text-foreground">{job.city}</dd>
                  </div>
                  {job.contractType && (
                    <div className="flex justify-between">
                      <dt className="text-muted">Contrat</dt>
                      <dd className="font-semibold text-foreground">{job.contractType}</dd>
                    </div>
                  )}
                  {job.remote && (
                    <div className="flex justify-between">
                      <dt className="text-muted">Mode</dt>
                      <dd className="font-semibold text-emerald-600">Télétravail</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </aside>
        </div>

        {similarJobs.length > 0 && (
          <section className="mt-20">
            <SectionHeader
              label="Suggestions"
              title="Offres similaires"
            />
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {similarJobs.map((similar) => (
                <JobCard key={similar.id} job={similar} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
