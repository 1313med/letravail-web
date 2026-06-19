import Link from "next/link";
import { JobListItem } from "@/lib/queries";
import {
  excerpt,
  formatRelativeDate,
  isNewJob,
} from "@/lib/utils";

interface JobCardProps {
  job: JobListItem;
}

export function JobCard({ job }: JobCardProps) {
  const date = job.publishedAt || job.createdAt;

  return (
    <article className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-primary"
          aria-hidden="true"
        >
          {job.company.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold">
            <Link
              href={`/emploi/${job.slug}`}
              className="text-foreground group-hover:text-primary"
            >
              {job.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted">
            {job.companyRef?.slug ? (
              <Link
                href={`/entreprise/${job.companyRef.slug}`}
                className="hover:text-primary"
              >
                {job.company}
              </Link>
            ) : (
              job.company
            )}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {job.location?.slug ? (
                <Link
                  href={`/emplois/${job.location.slug}`}
                  className="hover:text-primary"
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
            {job.remote && <span className="badge-remote">Télétravail</span>}
            {isNewJob(job.createdAt) && <span className="badge-new">Nouveau</span>}
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted">
            {excerpt(job.description, 120)}
          </p>
          <time
            className="mt-2 block text-xs text-muted"
            dateTime={new Date(date).toISOString()}
          >
            {formatRelativeDate(date)}
          </time>
        </div>
      </div>
    </article>
  );
}
