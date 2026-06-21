"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Bookmark, ArrowUpRight } from "lucide-react";
import { JobListItem } from "@/lib/queries";
import { getCompanyLogo } from "@/lib/company-logos";
import { getAvatarGradient, getInitials } from "@/lib/gradients";
import { useSavedJobs } from "@/components/jobs/JobCardVariants";
import { cn } from "@/lib/cn";

function CarouselCard({ job }: { job: JobListItem }) {
  const { saved, toggle } = useSavedJobs();
  const logo = job.companyRef?.slug ? getCompanyLogo(job.companyRef.slug) : undefined;

  return (
    <Link
      href={`/emploi/${job.slug}`}
      className="group flex w-[240px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-navy-700/80 to-navy-800/60 p-4 transition-all hover:border-mint/25 sm:w-[300px] sm:rounded-2xl sm:p-6 lg:w-[340px]"
    >
      <div className="flex items-start justify-between gap-2">
        {logo ? (
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white p-1 sm:h-12 sm:w-12 sm:rounded-xl sm:p-1.5">
            <Image src={logo.logo} alt={job.company} width={40} height={20} className="h-auto max-h-full w-auto object-contain" unoptimized />
          </span>
        ) : (
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white sm:h-12 sm:w-12 sm:rounded-xl sm:text-sm", getAvatarGradient(job.company))}>
            {getInitials(job.company)}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); toggle(job.slug); }}
          className={cn("rounded-lg p-1.5 sm:p-2", saved.has(job.slug) ? "text-mint" : "text-slate-dim hover:text-mint")}
          aria-label="Sauvegarder"
        >
          <Bookmark className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", saved.has(job.slug) && "fill-current")} />
        </button>
      </div>
      <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-snug text-white group-hover:text-mint sm:mt-5 sm:text-lg">{job.title}</h3>
      <p className="mt-0.5 truncate text-xs text-slate-muted sm:mt-1 sm:text-sm">{job.company}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-4 sm:gap-2">
        <span className="flex items-center gap-1 text-[10px] text-slate-text sm:text-xs"><MapPin className="h-3 w-3 text-mint" />{job.city}</span>
        {job.salary && <span className="text-[10px] font-semibold text-mint-glow sm:text-xs">{job.salary}</span>}
        {job.contractType && <span className="badge-mint !px-2 !py-0.5 !text-[9px] sm:!text-[10px]">{job.contractType}</span>}
      </div>
      <div className="mt-auto flex justify-end pt-3 sm:pt-6">
        <ArrowUpRight className="h-3.5 w-3.5 text-mint opacity-0 transition-opacity group-hover:opacity-100 sm:h-4 sm:w-4" />
      </div>
    </Link>
  );
}

export function SimilarJobsCarousel({ jobs }: { jobs: JobListItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (jobs.length === 0) return null;

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" });
  }

  return (
    <section className="border-t border-white/5 bg-navy py-10 sm:py-24">
      <div className="container-xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="section-label text-[10px] sm:text-xs">Continuer l&apos;exploration</p>
            <h2 className="mt-1.5 text-lg font-extrabold text-white sm:mt-3 sm:text-3xl">Offres similaires</h2>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button type="button" onClick={() => scroll("left")} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:border-mint/30" aria-label="Précédent">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => scroll("right")} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:border-mint/30" aria-label="Suivant">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:mt-8 sm:gap-5 sm:px-0 sm:pb-4"
        >
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <CarouselCard job={job} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
