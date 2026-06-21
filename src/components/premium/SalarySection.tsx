import Link from "next/link";
import { SALARY_DATA } from "@/lib/premium-data";

export function SalarySection() {
  return (
    <section className="section-padding border-y border-white/5 bg-navy-800/50">
      <div className="container-xl">
        <div className="max-w-2xl">
          <p className="section-label">Intelligence salariale</p>
          <h2 className="heading-lg mt-4">Salaires au Maroc</h2>
          <p className="body-md mt-4">
            Données salariales par métier pour négocier en toute confiance.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2">
          {SALARY_DATA.map((item) => {
            const pct = ((item.median - item.min) / (item.max - item.min)) * 100;
            return (
              <Link
                key={item.slug}
                href={`/salaires/${item.slug}`}
                className="card-glass group p-8"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-white group-hover:text-mint transition-colors">
                    {item.title}
                  </h3>
                  <span className="badge-mint">{item.trend}</span>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between text-sm text-slate-muted">
                    <span>{item.min.toLocaleString("fr-MA")} MAD</span>
                    <span className="font-semibold text-mint">{item.median.toLocaleString("fr-MA")} MAD</span>
                    <span>{item.max.toLocaleString("fr-MA")} MAD</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-mint/50 to-mint"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-dim">Médiane · fourchette mensuelle</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link href="/salaires" className="btn-ghost">Voir tous les salaires →</Link>
        </div>
      </div>
    </section>
  );
}
