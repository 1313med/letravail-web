"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Sparkles, MapPin } from "lucide-react";
import { POPULAR_SEARCHES, DISCOVERY_CITIES } from "@/lib/jobs-discovery";
import { MagneticWrap } from "@/lib/motion";

interface JobsEmptyStateProps {
  basePath: string;
  hasFilters: boolean;
}

export function JobsEmptyState({ basePath, hasFilters }: JobsEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2rem] border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center sm:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(55,214,181,0.08),transparent_70%)]" />
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-mint/10 ring-1 ring-mint/25"
      >
        <Search className="h-9 w-9 text-mint" />
      </motion.div>
      <h2 className="relative mt-8 text-2xl font-extrabold text-white sm:text-3xl">
        {hasFilters ? "Aucune offre ne correspond" : "Aucune offre pour le moment"}
      </h2>
      <p className="relative mx-auto mt-4 max-w-md text-slate-muted">
        {hasFilters
          ? "Essayez d'élargir vos critères ou explorez d'autres villes du royaume."
          : "Revenez bientôt — de nouvelles opportunités arrivent chaque jour."}
      </p>

      {hasFilters && (
        <MagneticWrap className="relative mt-8 inline-block">
          <Link href={basePath} className="btn-mint !px-8">
            Effacer tous les filtres
          </Link>
        </MagneticWrap>
      )}

      <div className="relative mt-12">
        <p className="mb-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/35">
          <Sparkles className="h-3.5 w-3.5" /> Suggestions
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {POPULAR_SEARCHES.map((term) => (
            <Link
              key={term}
              href={`${basePath}?q=${encodeURIComponent(term)}`}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-text transition-colors hover:border-mint/30 hover:text-white"
            >
              {term}
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {DISCOVERY_CITIES.slice(0, 4).map((c) => (
            <Link
              key={c.slug}
              href={`/emplois/${c.slug}`}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-text hover:border-mint/30 hover:text-white"
            >
              <MapPin className="h-3.5 w-3.5 text-mint" />
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
