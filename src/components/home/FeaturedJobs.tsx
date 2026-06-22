"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  ArrowUpRight,
  Bookmark,
  Clock,
  Sparkles,
  Banknote,
  Briefcase,
} from "lucide-react";
import { JobListItem } from "@/lib/queries";
import { getCompanyLogo } from "@/lib/company-logos";
import { getAvatarGradient, getInitials } from "@/lib/gradients";
import { MagneticWrap, TiltCard, fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { excerpt, formatRelativeDate, isNewJob } from "@/lib/utils";
import { useSavedJobs } from "@/components/jobs/JobCardVariants";

interface FeaturedJobsProps {
  jobs: JobListItem[];
}

const EASE = [0.22, 1, 0.36, 1] as const;

function CompanyMark({
  job,
  size = "md",
}: {
  job: JobListItem;
  size?: "sm" | "md" | "lg";
}) {
  const logo = job.companyRef?.slug ? getCompanyLogo(job.companyRef.slug) : undefined;
  const dims =
    size === "lg"
      ? "h-16 w-16 rounded-2xl sm:h-[4.5rem] sm:w-[4.5rem]"
      : size === "md"
        ? "h-12 w-12 rounded-2xl"
        : "h-10 w-10 rounded-xl";
  const imgSize = size === "lg" ? 64 : size === "md" ? 48 : 40;

  if (logo) {
    return (
      <span className={cn("relative flex shrink-0 items-center justify-center overflow-hidden bg-white p-2 shadow-lg", dims)}>
        <Image
          src={logo.logo}
          alt={logo.name}
          width={imgSize}
          height={imgSize / 2}
          className="h-auto max-h-full w-auto object-contain"
          unoptimized
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-gradient-to-br text-sm font-bold text-white shadow-lg",
        dims,
        getAvatarGradient(job.company)
      )}
    >
      {getInitials(job.company)}
    </span>
  );
}

function HeroCornerPanel({ job }: { job: JobListItem }) {
  const date = job.publishedAt || job.createdAt;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.7, ease: EASE }}
      className="absolute right-4 top-4 z-10 sm:right-8 sm:top-8 lg:right-10 lg:top-10"
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative overflow-hidden rounded-2xl border border-white/15 bg-navy/50 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:rounded-3xl sm:p-5"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mint/50 to-transparent" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-mint/20 blur-2xl" />

        <div className="relative flex items-start gap-3 sm:gap-4">
          <CompanyMark job={job} size="lg" />
          <div className="min-w-0 pt-0.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-mint">
              <Sparkles className="h-3 w-3" />
              Sélection
            </span>
            <p className="mt-2 truncate text-sm font-bold text-white sm:text-base">{job.company}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-text">
              <Clock className="h-3 w-3 shrink-0 text-mint/70" />
              {formatRelativeDate(date)}
            </p>
          </div>
        </div>

        <div className="relative mt-4 flex flex-wrap gap-2 border-t border-white/8 pt-4">
          {job.contractType && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/80 ring-1 ring-white/10">
              <Briefcase className="h-3 w-3 text-mint" />
              {job.contractType}
            </span>
          )}
          {job.salary && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-mint/10 px-2.5 py-1 text-[11px] font-semibold text-mint ring-1 ring-mint/20">
              <Banknote className="h-3 w-3" />
              {job.salary}
            </span>
          )}
          {job.remote && (
            <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/70 ring-1 ring-white/10">
              Remote
            </span>
          )}
        </div>
      </motion.div>

      {/* Decorative watermark behind panel */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-1 -top-6 select-none text-7xl font-black leading-none text-white/[0.05] sm:text-8xl"
      >
        {getInitials(job.company)}
      </span>
    </motion.div>
  );
}

function OpportunityListRow({
  job,
  index,
  saved,
  onToggleSave,
  delay,
  isFirst,
}: {
  job: JobListItem;
  index: number;
  saved: Set<string>;
  onToggleSave: (slug: string) => void;
  delay: number;
  isFirst: boolean;
}) {
  const date = job.publishedAt || job.createdAt;
  const isSaved = saved.has(job.slug);
  const displayIndex = String(index + 5).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.55, ease: EASE }}
    >
      <Link
        href={`/emploi/${job.slug}`}
        className={cn(
          "group relative flex items-center gap-3 overflow-hidden px-4 py-4 transition-colors hover:bg-white/[0.04] sm:gap-5 sm:px-7 sm:py-[1.125rem]",
          !isFirst && "border-t border-white/6"
        )}
      >
        <span className="pointer-events-none absolute inset-y-2 left-0 w-0.5 scale-y-0 rounded-full bg-mint transition-transform duration-300 group-hover:scale-y-100" />

        <span className="hidden w-7 shrink-0 text-[10px] font-bold tabular-nums tracking-[0.2em] text-mint/40 sm:block">
          {displayIndex}
        </span>

        <CompanyMark job={job} size="sm" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-white transition-colors group-hover:text-mint sm:text-base">
            {job.title}
          </p>
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-xs text-slate-muted sm:text-sm">
            <span className="truncate">{job.company}</span>
            <span className="text-white/20">·</span>
            <span className="flex shrink-0 items-center gap-1">
              <MapPin className="h-3 w-3 text-mint/70" />
              {job.city}
            </span>
            <span className="hidden text-white/20 sm:inline">·</span>
            <span className="hidden shrink-0 text-slate-dim sm:inline">{formatRelativeDate(date)}</span>
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          {job.contractType && (
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/65 ring-1 ring-white/10">
              {job.contractType}
            </span>
          )}
          {isNewJob(job.createdAt) && (
            <span className="rounded-full bg-mint/10 px-2 py-0.5 text-[10px] font-bold text-mint ring-1 ring-mint/20">
              Nouveau
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave(job.slug);
            }}
            className={cn(
              "rounded-lg p-1.5 transition-all",
              isSaved ? "text-mint" : "text-slate-dim opacity-0 group-hover:opacity-100 hover:text-mint"
            )}
            aria-label={isSaved ? "Retirer des favoris" : "Sauvegarder"}
          >
            <Bookmark className={cn("h-4 w-4", isSaved && "fill-current opacity-100")} />
          </button>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-mint opacity-0 transition-all group-hover:opacity-100 group-hover:border-mint/25 group-hover:bg-mint/10">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export function FeaturedJobs({ jobs }: FeaturedJobsProps) {
  const { saved, toggle } = useSavedJobs();
  const display = jobs.slice(0, 8);
  if (display.length === 0) return null;

  const [featured, second, third, fourth, ...rest] = display;
  const poolKey = display.map((j) => j.slug).join("|");

  return (
    <section className="section-dark story-section relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(55,214,181,0.05),transparent_50%)]" />
      <div className="container-xl relative">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.p variants={fadeUp} className="section-label">
            Opportunités
          </motion.p>
          <motion.h2 variants={fadeUp} className="display-section mt-6 text-white">
            Les postes qui
            <br />
            <span className="text-slate-muted">méritent votre talent</span>
          </motion.h2>
        </motion.div>

        <div key={poolKey} className="relative mt-10 sm:mt-16 lg:mt-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <TiltCard>
              <Link
                href={`/emploi/${featured.slug}`}
                className="group relative flex min-h-[360px] flex-col justify-end overflow-hidden rounded-2xl sm:min-h-[440px] sm:rounded-[2rem] lg:min-h-[560px] lg:max-w-[85%]"
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-95", getAvatarGradient(featured.company))} />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
                <motion.div
                  animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
                  transition={{ duration: 10, repeat: Infinity }}
                  className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-mint/15 blur-[80px]"
                />

                <HeroCornerPanel job={featured} />

                <div className="relative p-6 sm:p-10 lg:p-16 lg:pr-[min(42%,12rem)]">
                  {isNewJob(featured.createdAt) && (
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="badge-mint inline-block"
                    >
                      Nouveau
                    </motion.span>
                  )}
                  <h3 className="mt-4 max-w-3xl text-2xl font-extrabold leading-[1.05] text-white sm:mt-8 sm:text-4xl lg:text-6xl">
                    {featured.title}
                  </h3>
                  <p className="mt-3 text-lg text-white/75 sm:mt-4 sm:text-2xl">{featured.company}</p>
                  <p className="mt-4 max-w-xl text-sm text-slate-text/80 line-clamp-2 sm:mt-6 sm:text-lg">
                    {excerpt(featured.description, 160)}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <span className="flex items-center gap-2 text-white/90">
                      <MapPin className="h-4 w-4 text-mint" />
                      {featured.city}
                    </span>
                    {featured.contractType && <span className="badge-mint">{featured.contractType}</span>}
                  </div>
                </div>
              </Link>
            </TiltCard>
          </motion.div>

          <div className="mt-8 grid gap-6 lg:-mt-24 lg:ml-auto lg:max-w-[55%] lg:grid-cols-2 lg:gap-5">
            {[second, third, fourth].filter(Boolean).map((job, i) => (
              <motion.div
                key={job!.id}
                initial={{ opacity: 0, y: 40, x: i === 1 ? 20 : 0 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.75, ease: EASE }}
                className={cn(i === 2 && "lg:col-span-2 lg:max-w-[70%]")}
              >
                <TiltCard>
                  <Link
                    href={`/emploi/${job!.slug}`}
                    className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-navy-700/80 p-5 backdrop-blur-xl transition-shadow hover:shadow-glow sm:rounded-3xl sm:p-8"
                  >
                    <div>
                      <CompanyMark job={job!} size="md" />
                      <h4 className="mt-6 text-xl font-bold text-white group-hover:text-mint sm:text-2xl">
                        {job!.title}
                      </h4>
                      <p className="mt-2 text-slate-muted">{job!.company}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm text-slate-text">{job!.city}</span>
                      <ArrowUpRight className="h-4 w-4 text-mint opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </div>

          {rest.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.65, ease: EASE }}
              className="mt-16 overflow-hidden rounded-3xl border border-white/8 bg-white/[0.02] backdrop-blur-sm"
            >
              <div className="flex items-center justify-between border-b border-white/6 px-4 py-3 sm:px-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mint/60">
                  À découvrir aussi
                </p>
                <span className="text-[10px] font-semibold tabular-nums text-slate-dim">
                  {String(rest.length).padStart(2, "0")} offres
                </span>
              </div>

              {rest.map((job, i) => (
                <OpportunityListRow
                  key={job.id}
                  job={job}
                  index={i}
                  saved={saved}
                  onToggleSave={toggle}
                  delay={0.62 + i * 0.07}
                  isFirst={i === 0}
                />
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7, ease: EASE }}
            className="mt-16 text-center"
          >
            <MagneticWrap>
              <Link href="/emplois" className="btn-mint !px-14 !py-5 !text-lg">
                Explorer toutes les offres
              </Link>
            </MagneticWrap>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
