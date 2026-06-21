import Link from "next/link";
import { CITY_IMAGES } from "@/lib/premium-data";
import { cn } from "@/lib/cn";
import { pluralize } from "@/lib/utils";

interface City {
  city: string;
  slug: string;
  _count: { jobs: number };
}

interface CitiesSectionProps {
  cities: City[];
}

export function CitiesSection({ cities }: CitiesSectionProps) {
  return (
    <section className="section-padding">
      <div className="container-xl">
        <div className="max-w-2xl">
          <p className="section-label">Explorer</p>
          <h2 className="heading-lg mt-4">Par ville</h2>
          <p className="body-md mt-4">Découvrez les opportunités dans les grandes métropoles du royaume.</p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-6">
          {cities.slice(0, 6).map((city) => (
            <Link
              key={city.slug}
              href={`/emplois/${city.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 p-8 transition-all duration-500 hover:border-mint/30 hover:shadow-card-hover"
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity group-hover:opacity-80", CITY_IMAGES[city.slug] || "from-navy-600 to-navy-700")} />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
              <div className="relative">
                <p className="text-2xl font-bold text-white">{city.city}</p>
                <p className="mt-2 text-sm text-slate-text">
                  {pluralize(city._count.jobs, "offre", "offres")}
                </p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-mint opacity-0 transition-opacity group-hover:opacity-100">
                  Explorer →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
