import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobCard } from "@/components/JobCard";
import { JsonLd } from "@/components/JsonLd";
import { REVALIDATE_SECONDS } from "@/lib/constants";
import {
  getCompanyBySlug,
  getIndexableCompanySlugs,
} from "@/lib/queries";
import {
  buildBreadcrumbJsonLd,
  buildCanonical,
  buildPageMetadata,
} from "@/lib/seo";
import { pluralize } from "@/lib/utils";

export const revalidate = REVALIDATE_SECONDS;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getIndexableCompanySlugs();
  return slugs.slice(0, 50).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = params;
  const company = await getCompanyBySlug(slug);
  if (!company) return { title: "Entreprise introuvable" };

  const count = company.jobs.length;
  return buildPageMetadata({
    title: `Recrutement ${company.name} — ${count} offres d'emploi au Maroc`,
    description: `Consultez les ${count} offres d'emploi chez ${company.name} au Maroc. CDI, CDD, stages — postulez directement sur le site de l'employeur.`,
    path: `/entreprise/${slug}`,
  });
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = params;
  const company = await getCompanyBySlug(slug);
  if (!company || company.jobs.length === 0) notFound();

  const cities = [
    ...new Set(company.jobs.map((j) => j.city)),
  ].sort();

  const jobsByCity = new Map<string, typeof company.jobs>();
  for (const job of company.jobs) {
    const list = jobsByCity.get(job.city) || [];
    list.push(job);
    jobsByCity.set(job.city, list);
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: buildCanonical("/") },
    { name: "Entreprises", url: buildCanonical("/emplois") },
    { name: company.name, url: buildCanonical(`/entreprise/${slug}`) },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Offres d'emploi", href: "/emplois" },
            { label: company.name },
          ]}
        />

        <div className="flex items-start gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl font-bold text-primary">
            {company.name.charAt(0)}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Offres d&apos;emploi chez {company.name}
            </h1>
            <p className="mt-2 text-muted">
              {pluralize(company.jobs.length, "offre disponible", "offres disponibles")}
            </p>
          </div>
        </div>

        {cities.length > 1 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {cities.map((city) => {
              const cityJob = company.jobs.find((j) => j.city === city);
              const citySlug = cityJob?.location?.slug;
              return citySlug ? (
                <Link
                  key={city}
                  href={`/emplois/${citySlug}`}
                  className="rounded-full border border-border px-3 py-1 text-sm hover:bg-slate-50"
                >
                  {city}
                </Link>
              ) : (
                <span
                  key={city}
                  className="rounded-full border border-border px-3 py-1 text-sm text-muted"
                >
                  {city}
                </span>
              );
            })}
          </div>
        )}

        {cities.length > 1 ? (
          <div className="mt-10 space-y-12">
            {[...jobsByCity.entries()].map(([city, jobs]) => (
              <section key={city}>
                <h2 className="text-xl font-bold text-foreground">
                  {city}{" "}
                  <span className="text-base font-normal text-muted">
                    ({jobs.length})
                  </span>
                </h2>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {company.jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
