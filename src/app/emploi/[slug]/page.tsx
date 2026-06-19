import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobCard } from "@/components/JobCard";
import { JsonLd } from "@/components/JsonLd";
import { REVALIDATE_SECONDS } from "@/lib/constants";
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

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    [
      { name: "Accueil", url: buildCanonical("/") },
      ...(citySlug
        ? [{ name: job.city, url: buildCanonical(`/emplois/${citySlug}`) }]
        : [{ name: job.city, url: buildCanonical(`/emploi/${job.slug}`) }]),
      ...(companySlug
        ? [{ name: job.company, url: buildCanonical(`/entreprise/${companySlug}`) }]
        : []),
      { name: job.title, url: buildCanonical(`/emploi/${job.slug}`) },
    ]
  );

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

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />

        {expired && (
          <div
            className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            role="alert"
          >
            Cette offre a expiré. Consultez les offres similaires ci-dessous.
          </div>
        )}

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {job.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
                {companySlug ? (
                  <Link
                    href={`/entreprise/${companySlug}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {job.company}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">{job.company}</span>
                )}
                <span aria-hidden="true">·</span>
                {citySlug ? (
                  <Link
                    href={`/emplois/${citySlug}`}
                    className="hover:text-primary"
                  >
                    {job.city}
                  </Link>
                ) : (
                  <span>{job.city}</span>
                )}
                {job.contractType && (
                  <span className="badge-contract">{job.contractType}</span>
                )}
                {job.remote && <span className="badge-remote">Télétravail</span>}
                {job.salary && (
                  <span className="font-medium text-foreground">{job.salary}</span>
                )}
              </div>
              {job.publishedAt && (
                <time
                  className="mt-2 block text-sm text-muted"
                  dateTime={job.publishedAt.toISOString()}
                >
                  Publié le {formatDate(job.publishedAt)} ({formatRelativeDate(job.publishedAt)})
                </time>
              )}
            </header>

            <section className="prose prose-slate max-w-none">
              <h2 className="text-lg font-semibold">Description du poste</h2>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {job.description}
              </div>

              {job.requirements && (
                <>
                  <h2 className="mt-8 text-lg font-semibold">Profil recherché</h2>
                  <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {job.requirements}
                  </div>
                </>
              )}
            </section>

            {job.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {job.tags.map(({ tag }) => (
                  <Link
                    key={tag.slug}
                    href={`/emplois?tag=${tag.slug}`}
                    className="badge bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            <p className="mt-6 text-xs text-muted">
              Source : {job.source}
            </p>
          </div>

          <aside className="mt-8 lg:mt-0">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-6 shadow-sm">
              <a
                href={job.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full py-3 text-center"
              >
                Postuler sur le site de l&apos;employeur
              </a>
              <p className="mt-3 text-center text-xs text-muted">
                Vous serez redirigé vers le site de recrutement de {job.company}
              </p>
            </div>
          </aside>
        </div>

        {similarJobs.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold text-foreground">Offres similaires</h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
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
