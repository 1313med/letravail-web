"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ArrowUpRight } from "lucide-react";
import { FEATURED_COMPANIES } from "@/lib/premium-data";
import { getAvatarGradient, getInitials } from "@/lib/gradients";
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
  const merged = companies.slice(0, 6).map((c) => ({
    ...c,
    ...FEATURED_COMPANIES.find((f) => f.slug === c.slug),
  }));

  return (
    <section className="story-section">
      <div className="container-xl">
        <div className="max-w-2xl">
          <p className="section-label">Employeurs</p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Les entreprises qui
            <span className="block text-slate-muted">façonnent le Maroc</span>
          </h2>
        </div>

        {/* Apple Store grid — asymmetric */}
        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {merged.map((company, i) => {
            const gradient = getAvatarGradient(company.name);
            const isLarge = i === 0;

            return (
              <motion.div
                key={company.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className={cn(isLarge && "sm:col-span-2 lg:col-span-1 lg:row-span-1")}
              >
                <Link
                  href={`/entreprise/${company.slug}`}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-transparent transition-all duration-500 hover:border-mint/25 hover:shadow-glow",
                    isLarge ? "min-h-[320px] p-10" : "min-h-[260px] p-8"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className={cn(
                      "flex items-center justify-center rounded-3xl bg-gradient-to-br font-bold text-white shadow-lg",
                      gradient,
                      isLarge ? "h-20 w-20 text-2xl" : "h-14 w-14 text-lg"
                    )}>
                      {getInitials(company.name)}
                    </span>
                    {"topEmployer" in company && company.topEmployer && (
                      <span className="rounded-full bg-mint/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-mint">
                        Top Employeur
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-8">
                    <h3 className={cn("font-bold text-white transition-colors group-hover:text-mint", isLarge ? "text-2xl" : "text-xl")}>
                      {company.name}
                    </h3>
                    {"industry" in company && company.industry && (
                      <p className="mt-1 text-sm text-slate-muted">{company.industry}</p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-slate-text">
                        {company._count.jobs} postes ouverts
                      </span>
                      {"rating" in company && company.rating && (
                        <span className="flex items-center gap-1 text-sm text-mint">
                          <Star className="h-3.5 w-3.5 fill-mint" />
                          {company.rating}
                        </span>
                      )}
                    </div>
                  </div>

                  <ArrowUpRight className="absolute right-6 top-6 h-5 w-5 text-slate-dim opacity-0 transition-all group-hover:opacity-100 group-hover:text-mint" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
