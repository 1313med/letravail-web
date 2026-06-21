"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { JobsFilterSidebar } from "./JobsFilterSidebar";

interface MobileFilterSheetProps {
  basePath: string;
  tags: { name: string; slug: string; _count: { jobs: number } }[];
  hideCity?: boolean;
}

export function MobileFilterSheet({ basePath, tags, hideCity }: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 z-40 flex items-center gap-2 rounded-full border border-white/15 bg-navy/95 px-5 py-3.5 text-sm font-bold text-white shadow-glass backdrop-blur-xl lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4 text-mint" />
        Filtres
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-navy/70 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[2rem] border-t border-white/10 bg-navy p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Filtres</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <JobsFilterSidebar
                basePath={basePath}
                tags={tags}
                hideCity={hideCity}
                onFilterChange={() => setOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
