"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import { FEATURED_COMPANIES } from "@/lib/premium-data";
import { MOROCCAN_COMPANY_LOGOS } from "@/lib/company-logos";
import { TiltCard, fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/cn";

interface Company {
  name: string;
  slug: string;
  _count: { jobs: number };
}

interface EmployerShowcaseProps {
  companies: Company[];
}

export function EmployerShowcase({ companies }: EmployerShowcaseProps) {
  const merged = companies.slice(0, 4).map((c) => ({
    ...c,
    logo: MOROCCAN_COMPANY_LOGOS.find((l) => l.slug === c.slug)?.logo,
    ...FEATURED_COMPANIES.find((f) => f.slug === c.slug),
  }));

  const logos = MOROCCAN_COMPANY_LOGOS.slice(0, 14);

  return (
    <section className="section-light story-section overflow-hidden">
      <div className="container-xl">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mx-auto max-w-5xl text-center">
          <motion.p variants={fadeUp} className="section-label-light">Top employeurs</motion.p>
          <motion.h2 variants={fadeUp} className="display-section mt-6 text-navy">
            Les entreprises qui construisent
            <br />
            <span className="text-navy/40">le futur du royaume.</span>
          </motion.h2>
        </motion.div>

        {/* Logo ribbon */}
        <div className="logo-marquee-mask logo-marquee-mask--light relative mt-10 overflow-hidden py-4 sm:mt-16 sm:py-6">
          <div className="logo-marquee-track flex w-max items-center gap-14 px-4">
            {[...logos, ...logos].map((c, i) => (
              <Image key={`${c.slug}-${i}`} src={c.logo} alt={c.name} width={130} height={44} className="h-10 w-auto object-contain opacity-40 grayscale transition-all hover:opacity-100 hover:grayscale-0" unoptimized />
            ))}
          </div>
        </div>

        {/* Asymmetric bento — 1 large + 2 small offset */}
        <div className="relative mt-10 grid gap-4 sm:mt-16 sm:gap-6 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          {merged[0] && (
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-7">
              <EmployerCard company={merged[0]} hero />
            </motion.div>
          )}
          <div className="flex flex-col gap-6 lg:col-span-5 lg:translate-y-16">
            {merged.slice(1, 3).map((company, i) => (
              <motion.div key={company.slug} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.1 }} className={i === 1 ? "lg:ml-10" : ""}>
                <EmployerCard company={company} />
              </motion.div>
            ))}
          </div>
          {merged[3] && (
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-5 lg:-mt-8">
              <EmployerCard company={merged[3]} />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function EmployerCard({
  company,
  hero = false,
}: {
  company: Company & { logo?: string; industry?: string; rating?: number; topEmployer?: boolean };
  hero?: boolean;
}) {
  return (
    <TiltCard>
      <Link
        href={`/entreprise/${company.slug}`}
        className={cn(
          "group relative flex overflow-hidden rounded-[1.75rem] bg-white shadow-[0_12px_48px_rgba(6,23,47,0.08)] transition-all duration-500 hover:shadow-[0_28px_80px_rgba(6,23,47,0.14)]",
          hero ? "min-h-[280px] flex-col sm:min-h-[340px] sm:flex-row" : "min-h-[140px] flex-row items-center"
        )}
      >
        <div className={cn("flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100", hero ? "sm:w-2/5 p-10" : "w-1/3 p-6")}>
          {company.logo ? (
            <Image src={company.logo} alt={company.name} width={hero ? 180 : 100} height={hero ? 72 : 40} className={cn("w-auto object-contain", hero ? "h-16" : "h-10")} unoptimized />
          ) : (
            <span className="text-3xl font-extrabold text-navy/15">{company.name.slice(0, 2)}</span>
          )}
        </div>
        <div className={cn("flex flex-1 flex-col justify-center p-7", hero && "sm:p-10")}>
          <div className="flex items-start justify-between gap-3">
            <h3 className={cn("font-extrabold text-navy transition-colors group-hover:text-emerald-700", hero ? "text-3xl" : "text-xl")}>{company.name}</h3>
            {company.topEmployer && <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase text-emerald-700">Top</span>}
          </div>
          {company.industry && <p className="mt-1 text-sm text-navy/45">{company.industry}</p>}
          <div className="mt-4 flex items-center gap-4">
            <span className="font-semibold text-navy/60">{company._count.jobs} postes</span>
            {company.rating && (
              <span className="flex items-center gap-1 text-sm text-navy/50"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{company.rating}</span>
            )}
          </div>
          <ArrowUpRight className="mt-4 h-5 w-5 text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </Link>
    </TiltCard>
  );
}
