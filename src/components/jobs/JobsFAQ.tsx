"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { JOBS_FAQ_ITEMS } from "@/lib/jobs-faq";

export function JobsFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-white/5 bg-navy py-16 sm:py-24">
      <div className="container-xl">
        <p className="section-label">Questions fréquentes</p>
        <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
          Tout savoir sur la recherche d&apos;emploi
        </h2>
        <div className="mt-10 max-w-3xl space-y-3">
          {JOBS_FAQ_ITEMS.map((item, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-semibold text-white">{item.q}</span>
                <ChevronDown className={cn("h-5 w-5 shrink-0 text-mint transition-transform", open === i && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="border-t border-white/5 px-5 py-4 text-sm leading-relaxed text-slate-muted">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
