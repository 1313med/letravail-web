"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3 } from "lucide-react";
import { SALARY_DATA } from "@/lib/premium-data";
import { TiltCard, fadeUp, stagger } from "@/lib/motion";

function StripeChart({ data }: { data: typeof SALARY_DATA }) {
  const maxMedian = Math.max(...data.map((d) => d.median));

  return (
    <div className="relative mt-8 h-56">
      <div className="absolute inset-0 flex flex-col justify-between">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/8" />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-8 flex h-40 items-end justify-between gap-3">
        {data.map((item, i) => {
          const h = (item.median / maxMedian) * 100;
          return (
            <div key={item.slug} className="flex flex-1 flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full min-h-[4px] rounded-t-xl bg-gradient-to-t from-mint/50 via-mint to-mint-glow shadow-[0_0_20px_rgba(55,214,181,0.3)]"
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-mint-glow"
                >
                  {(item.median / 1000).toFixed(0)}k
                </motion.span>
              </motion.div>
              <span className="max-w-[72px] truncate text-center text-[10px] font-medium text-white/40">{item.title.split(" ")[0]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SalaryInsights() {
  const featured = SALARY_DATA[0];

  return (
    <section className="section-gradient story-section relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(55,214,181,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(94,242,214,0.06),transparent_50%)]" />

      <div className="container-xl relative">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mx-auto max-w-4xl text-center">
          <motion.p variants={fadeUp} className="section-label">Intelligence salariale</motion.p>
          <motion.h2 variants={fadeUp} className="display-section mt-6 text-white">
            Connaissez
            <br />
            <span className="gradient-text">votre vraie valeur</span>
          </motion.h2>
        </motion.div>

        <div className="mt-10 grid gap-6 sm:mt-16 lg:mt-20 lg:grid-cols-12 lg:gap-10">
          {/* Left — Stripe analytics chart */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-7">
            <TiltCard>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:rounded-[2rem] sm:p-10">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-2 text-xs font-semibold text-white/50 sm:text-sm">
                    <BarChart3 className="h-4 w-4 shrink-0" /> Comparatif salaires · Maroc 2025
                  </p>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
                    <TrendingUp className="h-3 w-3" /> Live
                  </span>
                </div>
                <StripeChart data={[...SALARY_DATA]} />
                <div className="mt-4 flex flex-col gap-2 border-t border-white/8 pt-4 sm:mt-6 sm:flex-row sm:items-baseline sm:gap-3 sm:pt-6">
                  <p className="text-3xl font-extrabold text-white sm:text-5xl">{featured.median.toLocaleString("fr-MA")}</p>
                  <div>
                    <p className="text-sm text-white/40">MAD/mois · médiane</p>
                    <p className="font-semibold text-mint-glow">{featured.title}</p>
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Right — floating salary cards */}
          <div className="flex flex-col gap-4 lg:col-span-5 lg:translate-y-8">
            {SALARY_DATA.slice(1).map((item, i) => (
              <motion.div key={item.slug} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className={i === 1 ? "lg:ml-6" : ""}>
                <TiltCard>
                  <Link href={`/salaires/${item.slug}`} className="group block rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-sm transition-all hover:border-mint/30 hover:bg-white/[0.08]">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-white/90 group-hover:text-white">{item.title}</p>
                        <p className="mt-3 text-3xl font-extrabold text-mint-glow">{item.median.toLocaleString("fr-MA")} <span className="text-sm font-normal text-white/40">MAD</span></p>
                      </div>
                      <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-300">{item.trend}</span>
                    </div>
                    <p className="mt-3 text-xs text-white/35">{item.min.toLocaleString("fr-MA")} – {item.max.toLocaleString("fr-MA")} MAD</p>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Popular salaries row */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16">
          <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.25em] text-white/40">Salaires populaires</p>
          <div className="flex flex-wrap justify-center gap-3">
            {SALARY_DATA.map((item) => (
              <Link
                key={item.slug}
                href={`/salaires/${item.slug}`}
                className="group rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/70 backdrop-blur-sm transition-all hover:border-mint/30 hover:bg-mint/10 hover:text-white"
              >
                {item.title}
                <span className="ml-2 text-mint-glow opacity-0 transition-opacity group-hover:opacity-100">→</span>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/salaires" className="btn-mint">Explorer tous les salaires</Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
