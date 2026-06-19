import Link from "next/link";
import { getAvatarGradient, getInitials } from "@/lib/gradients";
import { pluralize } from "@/lib/utils";

interface CompanyCardProps {
  name: string;
  slug: string;
  jobCount: number;
}

export function CompanyCard({ name, slug, jobCount }: CompanyCardProps) {
  const gradient = getAvatarGradient(name);

  return (
    <Link
      href={`/entreprise/${slug}`}
      className="card-interactive group flex items-center gap-4 p-4"
    >
      <span
        className={`avatar-gradient h-12 w-12 bg-gradient-to-br ${gradient} text-sm transition-transform duration-300 group-hover:scale-105`}
      >
        {getInitials(name)}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-accent">
          {name}
        </h3>
        <p className="text-sm text-muted">
          {pluralize(jobCount, "offre active", "offres actives")}
        </p>
      </div>
      <svg
        className="h-5 w-5 shrink-0 text-muted-light transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-accent"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}
