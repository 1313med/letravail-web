import Link from "next/link";
import { SALARY_DATA } from "@/lib/premium-data";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Salaires au Maroc — Intelligence salariale",
  description:
    "Consultez les salaires par métier au Maroc : développeur, data analyst, comptable, commercial. Fourchettes et tendances.",
  path: "/salaires",
});

export default function SalariesPage() {
  return (
    <div className="pt-24 lg:pt-32">
      <div className="container-xl section-padding !pt-0">
        <p className="section-label">Intelligence salariale</p>
        <h1 className="heading-lg mt-4">Salaires au Maroc</h1>
        <p className="body-md mt-4 max-w-2xl">
          Fourchettes salariales par métier pour vous aider à négocier et planifier votre carrière.
        </p>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {SALARY_DATA.map((item) => {
            const pct = ((item.median - item.min) / (item.max - item.min)) * 100;
            return (
              <Link
                key={item.slug}
                href={`/salaires/${item.slug}`}
                className="card-glass group p-8"
              >
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold text-white group-hover:text-mint transition-colors">
                    Salaire {item.title}
                  </h2>
                  <span className="badge-mint">{item.trend}</span>
                </div>
                <div className="mt-8">
                  <p className="text-3xl font-bold text-mint">
                    {item.median.toLocaleString("fr-MA")} <span className="text-lg text-slate-muted">MAD/mois</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-muted">
                    Fourchette : {item.min.toLocaleString("fr-MA")} – {item.max.toLocaleString("fr-MA")} MAD
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-gradient-to-r from-mint/50 to-mint" style={{ width: `${pct}%` }} />
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
