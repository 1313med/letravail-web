import Image from "next/image";
import Link from "next/link";
import { getCityImage } from "@/lib/city-images";
import { pluralize } from "@/lib/utils";

interface City {
  city: string;
  slug: string;
  _count: { jobs: number };
}

interface CityHeroProps {
  city: string;
  slug: string;
  jobCount: number;
}

export function CityHero({ city, slug, jobCount }: CityHeroProps) {
  const img = getCityImage(slug, city);

  return (
    <section className="relative h-[50vh] min-h-[360px] overflow-hidden lg:h-[55vh]">
      <Image
        src={img.src}
        alt={img.alt}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-navy/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-transparent to-transparent" />

      <div className="container-xl relative flex h-full flex-col justify-end pb-12 pt-28">
        <p className="section-label">Ville</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Emploi {city}
        </h1>
        <p className="mt-4 text-lg text-slate-text">
          {pluralize(jobCount, "offre disponible", "offres disponibles")}
        </p>
      </div>
    </section>
  );
}

interface CityGridProps {
  cities: City[];
}

export function CityGrid({ cities }: CityGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {cities.map((city) => {
        const img = getCityImage(city.slug, city.city);
        return (
          <Link
            key={city.slug}
            href={`/emplois/${city.slug}`}
            className="group relative h-48 overflow-hidden rounded-3xl sm:h-56"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-lg font-bold text-white">{city.city}</p>
              <p className="text-sm text-slate-text">
                {pluralize(city._count.jobs, "offre", "offres")}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
