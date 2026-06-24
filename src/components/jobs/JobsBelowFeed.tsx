"use client";

import Image from "next/image";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { MOROCCAN_COMPANY_LOGOS } from "@/lib/company-logos";
import { SALARY_DATA } from "@/lib/premium-data";

const BELOW_FEED_COMPANIES = [
  "attijariwafa-bank",
  "cih-bank",
  "ocp",
  "orange-maroc",
  "dxc-technology",
  "maroc-telecom",
];

export function JobsBelowFeed() {
  const avgMedian = Math.round(
    SALARY_DATA.reduce((s, d) => s + d.median, 0) / SALARY_DATA.length
  );
  const companies = BELOW_FEED_COMPANIES.map((slug) =>
    MOROCCAN_COMPANY_LOGOS.find((c) => c.slug === slug)
  ).filter(Boolean);

  return (
    <div className="mt-10 space-y-8 border-t border-white/5 pt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
            Salaires au Maroc
          </p>
          <p className="mt-1 text-lg font-bold text-white">
            Médiane marché ·{" "}
            <span className="text-mint-glow">{avgMedian.toLocaleString("fr-MA")} MAD/mois</span>
          </p>
        </div>
        <Link
          href="/salaires"
          className="inline-flex items-center gap-2 text-sm font-semibold text-mint hover:text-mint-glow"
        >
          <BarChart3 className="h-4 w-4" />
          Explorer les salaires →
        </Link>
      </div>

      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-white/40">
          Top entreprises qui recrutent
        </p>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {companies.map(
            (c) =>
              c && (
                <Link
                  key={c.slug}
                  href={`/entreprise/${c.slug}`}
                  className="group flex shrink-0 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 transition-colors hover:border-mint/20 hover:bg-white/[0.06]"
                >
                  <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white p-1">
                    <Image
                      src={c.logo}
                      alt={c.name}
                      width={32}
                      height={16}
                      className="h-auto max-h-full w-auto object-contain"
                      unoptimized
                    />
                  </span>
                  <span className="text-sm font-medium text-slate-text group-hover:text-white">
                    {c.name}
                  </span>
                </Link>
              )
          )}
        </div>
      </div>
    </div>
  );
}
