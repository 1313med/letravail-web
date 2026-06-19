import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobCard } from "@/components/JobCard";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { REVALIDATE_SECONDS } from "@/lib/constants";
import { getAvatarGradient, getInitials } from "@/lib/gradients";
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

  const gradient = getAvatarGradient(company.name);
  const cities = Array.from(new Set(company.jobs.map((j) => j.city))).sort();

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

      <PageHero
        badge="Employeur"
        title={`Recrutement chez ${company.name}`}
        subtitle={pluralize(company.jobs.length, "offre active", "offres actives")}
      >
        <div className="flex items-center gap-4">
          <span
            className={`avatar-gradient h-14 w-14 bg-gradient-to-br ${gradient} text-lg`}
          >
            {getInitials(company.name)}
          </span>
        </div>
      </PageHero>

      <div className="page-container py-10">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Offres d'emploi", href: "/emplois" },
            { label: company.name },
          ]}
        />

        {cities.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {cities.map((city) => {
              const cityJob = company.jobs.find((j) => j.city === city);
              const citySlug = cityJob?.location?.slug;
              return citySlug ? (
                <Link
                  key={city}
                  href={`/emplois/${citySlug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-1.5 text-sm font-medium text-foreground shadow-sm transition-all hover:border-accent/30 hover:shadow-md"
                >
                  <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  {city}
                </Link>
              ) : (
                <span
                  key={city}
                  className="rounded-full border border-border px-4 py-1.5 text-sm text-muted"
                >
                  {city}
                </span>
              );
            })}
          </div>
        )}

        {cities.length > 1 ? (
          <div className="space-y-14">
            {Array.from(jobsByCity.entries()).map(([city, jobs]) => (
              <section key={city}>
                <SectionHeader
                  title={city}
                  description={pluralize(jobs.length, "offre", "offres")}
                />
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {company.jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
