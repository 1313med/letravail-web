"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3 } from "lucide-react";
import { SALARY_DATA } from "@/lib/premium-data";
import { MOROCCAN_COMPANY_LOGOS } from "@/lib/company-logos";
import { AnimatedNumber } from "@/lib/motion";
import { AiPromptCard } from "./JobCardVariants";

const SIDEBAR_COMPANIES = [
  "attijariwafa-bank",
  "cih-bank",
  "ocp",
  "orange-maroc",
  "dxc-technology",
];

export function JobsInsightsPanel({ className }: { className?: string }) {
  const avgMedian = Math.round(
    SALARY_DATA.reduce((s, d) => s + d.median, 0) / SALARY_DATA.length
  );
  const maxMedian = Math.max(...SALARY_DATA.map((d) => d.median));
  const companies = SIDEBAR_COMPANIES.map((slug) =>
    MOROCCAN_COMPANY_LOGOS.find((c) => c.slug === slug)
  ).filter(Boolean);

  return (
    <aside className={className}>
      <div className="space-y-5">
        {/* Salary insights */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-navy-700/60 to-navy-800/40 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-white/45">
              <BarChart3 className="h-3.5 w-3.5" /> Salaires Maroc
            </p>
            <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              <TrendingUp className="h-3 w-3" /> +8%
            </span>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-white">
            <AnimatedNumber value={avgMedian} /> <span className="text-sm font-normal text-white/40">MAD/mois</span>
          </p>
          <p className="mt-1 text-xs text-slate-dim">Médiane du marché · 2025</p>

          <div className="mt-5 flex h-24 items-end gap-2">
            {SALARY_DATA.map((item, i) => {
              const h = (item.median / maxMedian) * 100;
              return (
                <div key={item.slug} className="flex flex-1 flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.6 }}
                    className="w-full min-h-[4px] rounded-t-lg bg-gradient-to-t from-mint/40 to-mint-glow"
                  />
                  <span className="max-w-full truncate text-[9px] text-white/35">{item.title.split(" ")[0]}</span>
                </div>
              );
            })}
          </div>
          <Link href="/salaires" className="mt-4 block text-center text-xs font-semibold text-mint hover:text-mint-glow">
            Explorer les salaires →
          </Link>
        </div>

        {/* Top companies */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">Top entreprises</p>
          <div className="mt-4 space-y-2">
            {companies.map((c) => c && (
              <Link
                key={c.slug}
                href={`/entreprise/${c.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition-all hover:border-white/10 hover:bg-white/[0.04]"
              >
                <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white p-1">
                  <Image src={c.logo} alt={c.name} width={36} height={18} className="h-auto max-h-full w-auto object-contain" unoptimized />
                </span>
                <span className="text-sm font-medium text-slate-text group-hover:text-white">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <AiPromptCard />
      </div>
    </aside>
  );
}
