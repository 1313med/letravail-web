"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { SALARY_DATA } from "@/lib/premium-data";

function SalaryChart({ min, median, max }: { min: number; median: number; max: number }) {
  const range = max - min;
  const medianPct = ((median - min) / range) * 100;

  return (
    <div className="relative mt-6 h-32">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-px w-full bg-white/5" />
        ))}
      </div>
      {/* Bar */}
      <div className="absolute inset-x-0 bottom-8 h-3 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-mint/30 via-mint to-mint-glow"
        />
      </div>
      {/* Median marker */}
      <motion.div
        initial={{ left: "0%" }}
        whileInView={{ left: `${medianPct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        className="absolute bottom-6 h-8 w-0.5 -translate-x-1/2 bg-white"
      >
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-mint px-2 py-0.5 text-xs font-bold text-navy">
          {median.toLocaleString("fr-MA")}
        </div>
      </motion.div>
      <div className="absolute inset-x-0 bottom-0 flex justify-between text-xs text-slate-dim">
        <span>{min.toLocaleString("fr-MA")}</span>
        <span>{max.toLocaleString("fr-MA")} MAD</span>
      </div>
    </div>
  );
}

export function SalaryInsights() {
  const featured = SALARY_DATA[0];

  return (
    <section className="story-section overflow-hidden">
      <div className="container-xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-24">
          {/* Left — editorial */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="section-label"
            >
              Intelligence salariale
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl"
            >
              Connaissez
              <br />
              <span className="gradient-text">votre valeur</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-lg leading-relaxed text-slate-muted"
            >
              Fourchettes salariales par métier, basées sur le marché marocain.
              Négociez en toute confiance.
            </motion.p>
            <Link href="/salaires" className="btn-mint mt-10 inline-flex">
              Explorer les salaires
            </Link>
          </div>

          {/* Right — Stripe-style chart card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-navy-700/50 to-navy p-8 shadow-glass sm:p-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-muted">Salaire médian</p>
                  <p className="mt-1 text-4xl font-bold text-white">
                    {featured.median.toLocaleString("fr-MA")}
                    <span className="ml-2 text-lg font-normal text-slate-muted">MAD/mois</span>
                  </p>
                  <p className="mt-2 text-lg font-medium text-white">{featured.title}</p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                  {featured.trend}
                </span>
              </div>
              <SalaryChart min={featured.min} median={featured.median} max={featured.max} />
            </div>

            {/* Floating mini cards */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              {SALARY_DATA.slice(1, 3).map((item) => (
                <Link
                  key={item.slug}
                  href={`/salaires/${item.slug}`}
                  className="group rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition-all hover:border-mint/20 hover:bg-white/[0.06]"
                >
                  <p className="text-sm font-medium text-white group-hover:text-mint transition-colors">{item.title}</p>
                  <p className="mt-2 text-2xl font-bold text-mint">{item.median.toLocaleString("fr-MA")}</p>
                  <p className="text-xs text-slate-dim">MAD/mois</p>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
