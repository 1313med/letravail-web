import Link from "next/link";
import { FEATURED_COMPANIES } from "@/lib/premium-data";
import { getAvatarGradient, getInitials } from "@/lib/gradients";
import { cn } from "@/lib/cn";

interface Company {
  name: string;
  slug: string;
  _count: { jobs: number };
}

interface CompaniesSectionProps {
  companies: Company[];
}

export function CompaniesSection({ companies }: CompaniesSectionProps) {
  const merged = companies.map((c) => {
    const featured = FEATURED_COMPANIES.find((f) => f.slug === c.slug);
    return { ...c, ...featured };
  });

  return (
    <section className="section-padding">
      <div className="container-xl">
        <div className="max-w-2xl">
          <p className="section-label">Employeurs</p>
          <h2 className="heading-lg mt-4">Entreprises qui recrutent</h2>
          <p className="body-md mt-4">Les leaders économiques du Maroc publient leurs offres ici.</p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {merged.slice(0, 6).map((company) => {
            const gradient = getAvatarGradient(company.name);
            return (
              <Link
                key={company.slug}
                href={`/entreprise/${company.slug}`}
                className="card-glass group p-6"
              >
                <div className="flex items-start justify-between">
                  <span className={cn("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-base font-bold text-white", gradient)}>
                    {getInitials(company.name)}
                  </span>
                  {"topEmployer" in company && company.topEmployer && (
                    <span className="badge-mint">Top Employeur</span>
                  )}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white group-hover:text-mint transition-colors">
                  {company.name}
                </h3>
                {"industry" in company && company.industry && (
                  <p className="mt-1 text-sm text-slate-muted">{company.industry}</p>
                )}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-slate-muted">{company._count.jobs} offres actives</span>
                  {"rating" in company && company.rating && (
                    <span className="flex items-center gap-1 text-mint">
                      ★ {company.rating}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
