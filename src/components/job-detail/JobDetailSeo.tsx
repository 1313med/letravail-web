"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export function JobDetailFAQ({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="mb-8 sm:mb-14">
      <p className="section-label text-[10px] sm:text-xs">FAQ</p>
      <h2 className="mt-1.5 text-lg font-extrabold text-white sm:mt-3 sm:text-3xl">Questions fréquentes</h2>
      <div className="mt-4 space-y-2 sm:mt-8 sm:space-y-3">
        {items.map((item, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.03] sm:rounded-2xl">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:gap-4 sm:px-5 sm:py-4"
            >
              <span className="text-sm font-semibold leading-snug text-white sm:text-base">{item.q}</span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-mint transition-transform sm:h-5 sm:w-5", open === i && "rotate-180")} />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="border-t border-white/5 px-4 py-3 text-xs leading-relaxed text-slate-muted sm:px-5 sm:py-4 sm:text-sm">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

export function JobRelatedSearches({ links }: { links: { label: string; href: string }[] }) {
  if (links.length === 0) return null;
  return (
    <section className="mb-8 sm:mb-14">
      <p className="section-label text-[10px] sm:text-xs">Recherches associées</p>
      <h2 className="mt-1.5 text-base font-bold text-white sm:mt-3 sm:text-2xl">Explorez aussi</h2>
      <div className="-mx-1 mt-3 flex flex-wrap gap-2 sm:mt-6 sm:gap-2.5">
        {links.map((link) => (
          <Link
            key={link.href + link.label}
            href={link.href}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-text transition-all hover:border-mint/30 hover:bg-mint/10 hover:text-white sm:px-4 sm:py-2.5 sm:text-sm"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
