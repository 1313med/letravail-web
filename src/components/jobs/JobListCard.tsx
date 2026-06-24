"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, ArrowUpRight } from "lucide-react";
import { JobListItem } from "@/lib/queries";
import { getCompanyLogo } from "@/lib/company-logos";
import { getAvatarGradient, getInitials } from "@/lib/gradients";
import { TOP_EMPLOYER_SLUGS } from "@/lib/jobs-discovery";
import { formatJobCardSalaryFromJob, type JobCardSalary } from "@/lib/job-card-salary";
import { cn } from "@/lib/cn";
import { formatRelativeDate, isNewJob } from "@/lib/utils";

interface JobListCardProps {
  job: JobListItem;
  featured?: boolean;
  saved: Set<string>;
  onToggleSave: (slug: string) => void;
}

function CompanyLogo({ job }: { job: JobListItem }) {
  const logo = job.companyRef?.slug ? getCompanyLogo(job.companyRef.slug) : undefined;

  if (logo) {
    return (
      <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded bg-white p-0.5">
        <Image
          src={logo.logo}
          alt={logo.name}
          width={28}
          height={14}
          className="h-auto max-h-full w-auto object-contain"
          unoptimized
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gradient-to-br text-[9px] font-bold text-white",
        getAvatarGradient(job.company)
      )}
    >
      {getInitials(job.company)}
    </span>
  );
}

function SaveButton({
  slug,
  saved,
  onToggle,
}: {
  slug: string;
  saved: Set<string>;
  onToggle: (s: string) => void;
}) {
  const isSaved = saved.has(slug);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(slug);
      }}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors",
        isSaved
          ? "bg-mint/15 text-mint"
          : "text-slate-dim hover:bg-white/5 hover:text-mint"
      )}
      aria-label={isSaved ? "Retirer des favoris" : "Sauvegarder"}
    >
      <Bookmark className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
    </button>
  );
}

function SalaryDisplay({ job }: { job: JobListItem }) {
  const info: JobCardSalary = formatJobCardSalaryFromJob(job);

  return (
    <span
      className={cn(
        "shrink-0 text-[13px] leading-none sm:text-sm",
        info.type === "actual" && "font-bold text-mint-glow",
        info.type === "estimated" && "font-bold text-mint/90",
        info.type === "undisclosed" && "text-[11px] font-normal italic text-slate-dim sm:text-xs"
      )}
      title={info.tooltip}
    >
      {info.text}
    </span>
  );
}

export function JobListCard({ job, featured = false, saved, onToggleSave }: JobListCardProps) {
  const date = job.publishedAt || job.createdAt;
  const isSaved = saved.has(job.slug);
  const detailHref = `/emploi/${job.slug}`;
  const applyHref = `${detailHref}#postuler`;
  const isTop = job.companyRef?.slug && TOP_EMPLOYER_SLUGS.has(job.companyRef.slug);

  return (
    <article
      className={cn(
        "group relative rounded-lg border backdrop-blur-xl transition-colors",
        featured
          ? "border-l-[3px] border-l-mint border-white/10 bg-mint/[0.05] ring-1 ring-mint/25 px-3 py-2 shadow-[0_0_28px_rgba(55,214,181,0.1)]"
          : "border-white/10 bg-white/[0.04] px-2.5 py-1.5 sm:px-3 sm:py-2",
        isSaved && "bg-mint/[0.06]",
        "hover:border-mint/20 hover:bg-white/[0.06]"
      )}
    >
      <Link href={detailHref} className="absolute inset-0 z-0 rounded-lg" aria-label={`Voir ${job.title}`} />

      <div className="relative z-10 flex gap-2 pointer-events-none">
        <CompanyLogo job={job} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1.5">
            <div className="min-w-0 flex-1">
              {featured && (
                <span className="mb-0.5 inline-flex rounded bg-mint/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-mint-glow ring-1 ring-mint/30">
                  À la une
                </span>
              )}
              <h3
                className={cn(
                  "line-clamp-1 font-semibold leading-tight text-white group-hover:text-mint",
                  featured ? "text-[14px] sm:text-[15px]" : "text-[13px] sm:text-[14px]"
                )}
              >
                {job.title}
              </h3>
              <div className="mt-0.5">
                <SalaryDisplay job={job} />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-px pointer-events-auto">
              <SaveButton slug={job.slug} saved={saved} onToggle={onToggleSave} />
              {featured ? (
                <Link
                  href={applyHref}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-mint px-2 text-[10px] font-bold text-navy shadow-glow sm:px-2.5 sm:text-[11px]"
                >
                  Postuler
                </Link>
              ) : (
                <Link
                  href={detailHref}
                  className="inline-flex h-9 items-center gap-0.5 rounded-md border border-white/10 px-2 text-[10px] font-semibold text-slate-muted transition-colors hover:border-mint/20 hover:text-mint sm:text-[11px]"
                >
                  Voir
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>

          <p className="mt-px flex min-w-0 items-center gap-1 truncate text-[11px] text-slate-muted sm:text-[12px]">
            {job.companyRef?.slug ? (
              <Link
                href={`/entreprise/${job.companyRef.slug}`}
                className="truncate hover:text-mint pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {job.company}
              </Link>
            ) : (
              <span className="truncate">{job.company}</span>
            )}
            <span className="text-slate-dim">·</span>
            <span className="truncate">{job.city}</span>
          </p>

          <div className="mt-px flex items-center gap-1.5 text-[10px] sm:text-[11px]">
            <div className="flex min-w-0 flex-wrap items-center gap-1">
              {job.contractType && (
                <span className="badge-mint !px-1 !py-px !text-[9px] sm:!text-[10px]">{job.contractType}</span>
              )}
              {job.remote && (
                <span className="badge-navy !px-1 !py-px !text-[9px] sm:!text-[10px]">Remote</span>
              )}
              {isNewJob(job.createdAt) && (
                <span className="badge-mint !px-1 !py-px !text-[9px] sm:!text-[10px]">Nouveau</span>
              )}
              {isTop && (
                <span className="rounded-full bg-amber-400/15 px-1 py-px text-[8px] font-bold uppercase text-amber-300 ring-1 ring-amber-400/25 sm:text-[9px]">
                  Top
                </span>
              )}
            </div>
            <time className="ml-auto shrink-0 text-slate-dim">{formatRelativeDate(date)}</time>
          </div>
        </div>
      </div>
    </article>
  );
}
