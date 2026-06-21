"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark, MapPin, ArrowUpRight } from "lucide-react";
import { JobListItem } from "@/lib/queries";
import { getAvatarGradient, getInitials } from "@/lib/gradients";
import { cn } from "@/lib/cn";
import { excerpt, formatRelativeDate, isNewJob } from "@/lib/utils";

interface FeaturedJobsProps {
  jobs: JobListItem[];
}

export function FeaturedJobs({ jobs }: FeaturedJobsProps) {
  if (jobs.length === 0) return null;

  const [featured, ...rest] = jobs;
  const gradient = getAvatarGradient(featured.company);

  return (
    <section className="story-section bg-navy-800/40">
      <div className="container-xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="section-label">Sélection</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Offres en vedette
            </h2>
          </div>
          <Link href="/emplois" className="btn-ghost hidden sm:inline-flex">
            Voir tout
          </Link>
        </div>

        {/* Asymmetric layout — LinkedIn Premium */}
        <div className="mt-16 grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Hero job — large */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7"
          >
            <Link
              href={`/emploi/${featured.slug}`}
              className="group relative flex h-full min-h-[420px] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-navy-700/80 to-navy p-8 transition-all duration-500 hover:border-mint/30 hover:shadow-glow-lg sm:p-10"
            >
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-mint/5 blur-3xl transition-all group-hover:bg-mint/10" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <span className={cn("flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-bold text-white", gradient)}>
                    {getInitials(featured.company)}
                  </span>
                  {isNewJob(featured.createdAt) && (
                    <span className="badge-mint">Nouveau</span>
                  )}
                </div>
                <h3 className="mt-8 text-2xl font-bold leading-tight text-white transition-colors group-hover:text-mint sm:text-3xl">
                  {featured.title}
                </h3>
                <p className="mt-3 text-lg text-slate-text">{featured.company}</p>
              </div>

              <div className="relative mt-8">
                <p className="line-clamp-3 text-slate-muted">{excerpt(featured.description, 200)}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 text-sm text-slate-text">
                    <MapPin className="h-4 w-4 text-mint" />
                    {featured.city}
                  </span>
                  {featured.contractType && <span className="badge-mint">{featured.contractType}</span>}
                  {featured.remote && <span className="badge-navy">Remote</span>}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <time className="text-sm text-slate-dim">{formatRelativeDate(featured.publishedAt || featured.createdAt)}</time>
                  <span className="flex items-center gap-1 text-sm font-semibold text-mint opacity-0 transition-opacity group-hover:opacity-100">
                    Voir l&apos;offre <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Side list — editorial */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            {rest.slice(0, 4).map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  href={`/emploi/${job.slug}`}
                  className="group flex items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all duration-300 hover:border-mint/20 hover:bg-white/[0.06]"
                >
                  <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white", getAvatarGradient(job.company))}>
                    {getInitials(job.company)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-semibold text-white group-hover:text-mint transition-colors">{job.title}</h4>
                    <p className="truncate text-sm text-slate-muted">{job.company} · {job.city}</p>
                  </div>
                  <button type="button" className="shrink-0 rounded-xl p-2 text-slate-dim opacity-0 transition-all hover:bg-white/5 hover:text-mint group-hover:opacity-100" aria-label="Sauvegarder">
                    <Bookmark className="h-4 w-4" />
                  </button>
                </Link>
              </motion.div>
            ))}
            <Link href="/emplois" className="mt-2 text-center text-sm font-semibold text-mint hover:text-mint-glow lg:hidden">
              Voir toutes les offres →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
