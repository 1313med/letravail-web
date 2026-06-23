import Link from "next/link";
import { SALARY_ROLES, salaryPublicSlug } from "@/lib/salary-data";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Salaires au Maroc — Intelligence salariale",
  description:
    "Consultez les salaires par métier au Maroc : développeur, data analyst, comptable, commercial. Fourchettes et tendances.",
  path: "/salaires",
});

export default function SalariesPage() {
  return (
    <div className="section-dark min-h-screen pt-24 lg:pt-32">
      <div className="container-xl pb-24">
        <p className="section-label">Intelligence salariale</p>
        <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">Salaires au Maroc</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-muted">
          Fourchettes salariales calculées à partir des offres publiées sur Letravail.ma.
        </p>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {SALARY_ROLES.map((item) => {
            const pct =
              ((item.fallback.median - item.fallback.min) /
                (item.fallback.max - item.fallback.min)) *
              100;
            return (
              <Link
                key={item.slug}
                href={`/${salaryPublicSlug(item.slug)}`}
                className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-8 transition-all hover:border-mint/25"
              >
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold text-white transition-colors group-hover:text-mint">
                    Salaire {item.title}
                  </h2>
                  <span className="badge-mint">{item.fallback.trend}</span>
                </div>
                <div className="mt-8">
                  <p className="text-3xl font-bold text-mint">
                    {item.fallback.median.toLocaleString("fr-MA")}{" "}
                    <span className="text-lg text-slate-muted">MAD/mois</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-muted">
                    Fourchette : {item.fallback.min.toLocaleString("fr-MA")} –{" "}
                    {item.fallback.max.toLocaleString("fr-MA")} MAD
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-mint/50 to-mint"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
