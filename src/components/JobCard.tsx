import Link from "next/link";
import { JobListItem } from "@/lib/queries";
import { getAvatarGradient, getInitials } from "@/lib/gradients";
import {
  excerpt,
  formatRelativeDate,
  isNewJob,
} from "@/lib/utils";

interface JobCardProps {
  job: JobListItem;
  featured?: boolean;
}

export function JobCard({ job, featured = false }: JobCardProps) {
  const date = job.publishedAt || job.createdAt;
  const gradient = getAvatarGradient(job.company);

  return (
    <article
      className={`card-hover group relative overflow-hidden ${
        featured ? "p-6" : "p-5"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent/0 via-accent/60 to-accent/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start gap-4">
        <span
          className={`avatar-gradient bg-gradient-to-br ${gradient} ${
            featured ? "h-14 w-14 text-base" : "h-12 w-12 text-sm"
          } transition-transform duration-300 group-hover:scale-105`}
          aria-hidden="true"
        >
          {getInitials(job.company)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className={`font-bold leading-snug ${featured ? "text-lg" : "text-base"}`}>
              <Link
                href={`/emploi/${job.slug}`}
                className="text-foreground transition-colors group-hover:text-accent"
              >
                {job.title}
              </Link>
            </h3>
            {isNewJob(job.createdAt) && (
              <span className="badge-new shrink-0">Nouveau</span>
            )}
          </div>

          <p className="mt-1.5 text-sm font-medium text-muted">
            {job.companyRef?.slug ? (
              <Link
                href={`/entreprise/${job.companyRef.slug}`}
                className="transition-colors hover:text-accent"
              >
                {job.company}
              </Link>
            ) : (
              job.company
            )}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1 text-xs font-medium text-muted">
              <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {job.location?.slug ? (
                <Link
                  href={`/emplois/${job.location.slug}`}
                  className="transition-colors hover:text-accent"
                >
                  {job.city}
                </Link>
              ) : (
                job.city
              )}
            </span>
            {job.contractType && (
              <span className="badge-contract">{job.contractType}</span>
            )}
            {job.remote && <span className="badge-remote">Remote</span>}
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
            {excerpt(job.description, 140)}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <time
              className="text-xs font-medium text-muted-light"
              dateTime={new Date(date).toISOString()}
            >
              {formatRelativeDate(date)}
            </time>
            <span className="link-arrow text-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Voir l&apos;offre
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
