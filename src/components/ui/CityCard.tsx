import Link from "next/link";
import { getCityEmoji } from "@/lib/gradients";
import { pluralize } from "@/lib/utils";

interface CityCardProps {
  city: string;
  slug: string;
  jobCount: number;
}

export function CityCard({ city, slug, jobCount }: CityCardProps) {
  return (
    <Link
      href={`/emplois/${slug}`}
      className="card-interactive group relative overflow-hidden p-5"
    >
      <div className="absolute -right-4 -top-4 text-5xl opacity-10 transition-transform duration-300 group-hover:scale-110 group-hover:opacity-20">
        {getCityEmoji(slug)}
      </div>
      <div className="relative">
        <span className="text-2xl" aria-hidden="true">
          {getCityEmoji(slug)}
        </span>
        <h3 className="mt-3 text-lg font-bold text-foreground transition-colors group-hover:text-accent">
          {city}
        </h3>
        <p className="mt-1 text-sm text-muted">
          {pluralize(jobCount, "offre", "offres")}
        </p>
        <span className="link-arrow mt-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Explorer
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
