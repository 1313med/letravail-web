"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, ArrowUpRight, Bookmark } from "lucide-react";
import { JobListItem } from "@/lib/queries";
import { getAvatarGradient, getInitials } from "@/lib/gradients";
import { MagneticWrap, TiltCard, fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { excerpt, formatRelativeDate, isNewJob } from "@/lib/utils";

interface FeaturedJobsProps {
  jobs: JobListItem[];
}

export function FeaturedJobs({ jobs }: FeaturedJobsProps) {
  if (jobs.length === 0) return null;

  const [featured, second, third, fourth, ...rest] = jobs;

  return (
    <section className="section-dark story-section relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(55,214,181,0.05),transparent_50%)]" />
      <div className="container-xl relative">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mx-auto max-w-4xl text-center">
          <motion.p variants={fadeUp} className="section-label">Opportunités</motion.p>
          <motion.h2 variants={fadeUp} className="display-section mt-6 text-white">
            Les postes qui
            <br />
            <span className="text-slate-muted">méritent votre talent</span>
          </motion.h2>
        </motion.div>

        {/* Magazine — full-width hero, offset pair below-right */}
        <div className="relative mt-10 sm:mt-16 lg:mt-20">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
            <TiltCard>
              <Link href={`/emploi/${featured.slug}`} className="group relative flex min-h-[360px] flex-col justify-end overflow-hidden rounded-2xl sm:min-h-[440px] sm:rounded-[2rem] lg:min-h-[560px] lg:max-w-[85%]">
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-95", getAvatarGradient(featured.company))} />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
                <motion.div animate={{ x: [0, 20, 0], y: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-mint/15 blur-[80px]" />

                <div className="relative p-6 sm:p-10 lg:p-16">
                  {isNewJob(featured.createdAt) && (
                    <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="badge-mint inline-block">
                      Nouveau
                    </motion.span>
                  )}
                  <h3 className="mt-4 max-w-3xl text-2xl font-extrabold leading-[1.05] text-white sm:mt-8 sm:text-4xl lg:text-6xl">{featured.title}</h3>
                  <p className="mt-3 text-lg text-white/75 sm:mt-4 sm:text-2xl">{featured.company}</p>
                  <p className="mt-4 max-w-xl text-sm text-slate-text/80 line-clamp-2 sm:mt-6 sm:text-lg">{excerpt(featured.description, 160)}</p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <span className="flex items-center gap-2 text-white/90"><MapPin className="h-4 w-4 text-mint" />{featured.city}</span>
                    {featured.contractType && <span className="badge-mint">{featured.contractType}</span>}
                  </div>
                </div>
              </Link>
            </TiltCard>
          </motion.div>

          {/* Floating offset cards */}
          <div className="mt-8 grid gap-6 lg:-mt-24 lg:ml-auto lg:max-w-[55%] lg:grid-cols-2 lg:gap-5">
            {[second, third, fourth].filter(Boolean).map((job, i) => (
              <motion.div
                key={job!.id}
                initial={{ opacity: 0, y: 40, x: i === 1 ? 20 : 0 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={cn(i === 2 && "lg:col-span-2 lg:max-w-[70%]")}
              >
                <TiltCard>
                  <Link href={`/emploi/${job!.slug}`} className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-navy-700/80 p-5 backdrop-blur-xl transition-shadow hover:shadow-glow sm:rounded-3xl sm:p-8">
                    <div>
                      <span className={cn("inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold text-white", getAvatarGradient(job!.company))}>
                        {getInitials(job!.company)}
                      </span>
                      <h4 className="mt-6 text-xl font-bold text-white group-hover:text-mint sm:text-2xl">{job!.title}</h4>
                      <p className="mt-2 text-slate-muted">{job!.company}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm text-slate-text">{job!.city}</span>
                      <ArrowUpRight className="h-4 w-4 text-mint opacity-0 group-hover:opacity-100" />
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </div>

          {rest.length > 0 && (
            <div className="mt-16 space-y-0 overflow-hidden rounded-3xl border border-white/8">
              {rest.slice(0, 2).map((job, i) => (
                <Link key={job.id} href={`/emploi/${job.slug}`} className={cn("group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-white/[0.04] sm:gap-6 sm:px-8 sm:py-5", i > 0 && "border-t border-white/6")}>
                  <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white", getAvatarGradient(job.company))}>{getInitials(job.company)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white group-hover:text-mint">{job.title}</p>
                    <p className="truncate text-sm text-slate-muted">{job.company} · {formatRelativeDate(job.publishedAt || job.createdAt)}</p>
                  </div>
                  <Bookmark className="h-4 w-4 text-slate-dim opacity-0 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <MagneticWrap>
              <Link href="/emplois" className="btn-mint !px-14 !py-5 !text-lg">Explorer toutes les offres</Link>
            </MagneticWrap>
          </div>
        </div>
      </div>
    </section>
  );
}
