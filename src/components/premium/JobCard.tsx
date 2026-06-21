import Link from "next/link";
import { JobListItem } from "@/lib/queries";
import { getAvatarGradient, getInitials } from "@/lib/gradients";
import { cn } from "@/lib/cn";
import { excerpt, formatRelativeDate, isNewJob } from "@/lib/utils";

interface PremiumJobCardProps {
  job: JobListItem;
  className?: string;
}

export function PremiumJobCard({ job, className }: PremiumJobCardProps) {
  const date = job.publishedAt || job.createdAt;
  const gradient = getAvatarGradient(job.company);

  return (
    <article className={cn("card-glass group relative overflow-hidden p-6", className)}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mint/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold text-white", gradient)}>
            {getInitials(job.company)}
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-snug text-white group-hover:text-mint transition-colors">
              <Link href={`/emploi/${job.slug}`}>{job.title}</Link>
            </h3>
            <p className="mt-1 text-sm text-slate-muted">
              {job.companyRef?.slug ? (
                <Link href={`/entreprise/${job.companyRef.slug}`} className="hover:text-mint">{job.company}</Link>
              ) : job.company}
            </p>
          </div>
        </div>
        <button type="button" className="shrink-0 rounded-xl p-2 text-slate-dim transition-colors hover:bg-white/5 hover:text-mint" aria-label="Sauvegarder">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="badge-navy flex items-center gap-1">
          <svg className="h-3 w-3 text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
          </svg>
          {job.city}
        </span>
        {job.contractType && <span className="badge-mint">{job.contractType}</span>}
        {job.remote && <span className="badge-navy">Remote</span>}
        {isNewJob(job.createdAt) && <span className="badge-mint">Nouveau</span>}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-muted">{excerpt(job.description, 100)}</p>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
        <time className="text-xs text-slate-dim" dateTime={new Date(date).toISOString()}>
          {formatRelativeDate(date)}
        </time>
        <Link href={`/emploi/${job.slug}`} className="text-xs font-semibold text-mint opacity-0 transition-opacity group-hover:opacity-100">
          Voir l&apos;offre →
        </Link>
      </div>
    </article>
  );
}
