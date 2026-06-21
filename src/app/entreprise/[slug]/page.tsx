import { notFound } from "next/navigation";
import Link from "next/link";
import { PremiumJobCard } from "@/components/premium/JobCard";
import { JsonLd } from "@/components/JsonLd";
import { REVALIDATE_SECONDS } from "@/lib/constants";
import { getAvatarGradient, getInitials } from "@/lib/gradients";
import { FEATURED_COMPANIES } from "@/lib/premium-data";
import { getCompanyBySlug, getIndexableCompanySlugs } from "@/lib/queries";
import { buildBreadcrumbJsonLd, buildCanonical, buildPageMetadata } from "@/lib/seo";
import { pluralize } from "@/lib/utils";

export const revalidate = REVALIDATE_SECONDS;

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return (await getIndexableCompanySlugs()).slice(0, 50).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const company = await getCompanyBySlug(params.slug);
  if (!company) return { title: "Entreprise introuvable" };
  return buildPageMetadata({
    title: `Recrutement ${company.name} — ${company.jobs.length} offres`,
    description: `Offres d'emploi chez ${company.name} au Maroc.`,
    path: `/entreprise/${params.slug}`,
  });
}

export default async function CompanyPage({ params }: Props) {
  const company = await getCompanyBySlug(params.slug);
  if (!company || company.jobs.length === 0) notFound();

  const gradient = getAvatarGradient(company.name);
  const featured = FEATURED_COMPANIES.find((f) => f.slug === params.slug);
  const cities = Array.from(new Set(company.jobs.map((j) => j.city))).sort();
  const jobsByCity = new Map<string, typeof company.jobs>();
  for (const job of company.jobs) {
    const list = jobsByCity.get(job.city) || [];
    list.push(job);
    jobsByCity.set(job.city, list);
  }

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: "Accueil", url: buildCanonical("/") },
        { name: company.name, url: buildCanonical(`/entreprise/${params.slug}`) },
      ])} />

      <div className="pt-24 lg:pt-32">
        <div className="container-xl pb-24">
          <div className="card-glass p-8 sm:p-10">
            <div className="flex items-start gap-6">
              <span className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br text-2xl font-bold text-white ${gradient}`}>
                {getInitials(company.name)}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="heading-md">{company.name}</h1>
                  {featured?.topEmployer && <span className="badge-mint">Top Employeur</span>}
                </div>
                {featured?.industry && <p className="mt-2 text-slate-muted">{featured.industry}</p>}
                <p className="mt-3 text-slate-text">{pluralize(company.jobs.length, "offre active", "offres actives")}</p>
                {featured?.rating && <p className="mt-1 text-mint">★ {featured.rating} / 5</p>}
              </div>
            </div>
            {cities.length > 1 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {cities.map((city) => {
                  const slug = company.jobs.find((j) => j.city === city)?.location?.slug;
                  return slug ? (
                    <Link key={city} href={`/emplois/${slug}`} className="badge-navy hover:border-mint/30">{city}</Link>
                  ) : (
                    <span key={city} className="badge-navy">{city}</span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-12 space-y-14">
            {Array.from(jobsByCity.entries()).map(([city, jobs]) => (
              <section key={city}>
                <h2 className="text-xl font-bold">{city} <span className="text-slate-muted font-normal">({jobs.length})</span></h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {jobs.map((job) => <PremiumJobCard key={job.id} job={job} />)}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
