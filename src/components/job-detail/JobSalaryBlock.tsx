"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3 } from "lucide-react";
import { SalaryInsight } from "@/lib/job-detail";
import { AnimatedNumber } from "@/lib/motion";

export function JobSalaryBlock({ insight, title }: { insight: SalaryInsight; title: string }) {
  const jobMedian = insight.median ?? insight.marketMedian;
  const marketPct = insight.marketMedian > 0 ? Math.round((jobMedian / insight.marketMedian) * 100) : 100;

  return (
    <section className="mb-8 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-navy-700/60 to-navy-800/40 p-4 sm:mb-14 sm:rounded-[1.75rem] sm:p-8">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="section-label text-[10px] sm:text-xs">Intelligence salariale</p>
          <h2 className="mt-1.5 text-base font-extrabold leading-tight text-white sm:mt-3 sm:text-3xl">
            Salaire pour ce poste au Maroc
          </h2>
          <p className="mt-1 line-clamp-2 text-xs text-slate-muted sm:mt-2 sm:text-sm">{title}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300 sm:px-3 sm:py-1 sm:text-xs">
          <TrendingUp className="h-3 w-3" /> {insight.trend}
        </span>
      </div>

      <div className="mt-4 space-y-4 sm:mt-8 sm:grid sm:grid-cols-2 sm:gap-8 sm:space-y-0">
        <div>
          {insight.display && (
            <p className="text-xs text-slate-dim sm:text-sm">Fourchette annoncée</p>
          )}
          <p className="mt-0.5 text-2xl font-extrabold text-mint-glow sm:mt-1 sm:text-5xl">
            {insight.display ? (
              insight.display
            ) : (
              <>
                <AnimatedNumber value={jobMedian} /> <span className="text-sm font-normal text-white/40 sm:text-lg">MAD/mois</span>
              </>
            )}
          </p>
          {insight.min && insight.max && insight.min !== insight.max && (
            <p className="mt-1 text-xs text-slate-muted sm:mt-2 sm:text-sm">
              {insight.min.toLocaleString("fr-MA")} – {insight.max.toLocaleString("fr-MA")} MAD
            </p>
          )}
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs text-slate-dim sm:gap-2 sm:text-sm">
            <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> vs. marché marocain
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10 sm:mt-4 sm:h-3">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.min(marketPct, 150)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full max-w-full rounded-full bg-gradient-to-r from-mint/60 to-mint-glow"
            />
          </div>
          <p className="mt-2 text-xs text-slate-text sm:mt-3 sm:text-sm">
            Médiane : <span className="font-semibold text-white">{insight.marketMedian.toLocaleString("fr-MA")} MAD</span>
            {marketPct >= 100 && (
              <span className="ml-1 text-mint-glow sm:ml-2">+{marketPct - 100}%</span>
            )}
          </p>
        </div>
      </div>

      <Link href="/salaires" className="mt-4 inline-flex text-xs font-semibold text-mint hover:text-mint-glow sm:mt-6 sm:text-sm">
        Explorer les salaires →
      </Link>
    </section>
  );
}
