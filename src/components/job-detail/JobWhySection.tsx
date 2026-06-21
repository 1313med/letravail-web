"use client";

import { motion } from "framer-motion";
import { WhyHighlight } from "@/lib/job-detail";
import { fadeUp, stagger } from "@/lib/motion";

function HighlightCard({ h, compact }: { h: WhyHighlight; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex w-[220px] shrink-0 snap-start flex-col rounded-xl border border-white/10 bg-white/[0.04] p-3.5 sm:w-auto">
        <span className="text-xl">{h.icon}</span>
        <h3 className="mt-2 text-sm font-bold leading-tight text-white">{h.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-muted">{h.description}</p>
      </div>
    );
  }

  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all hover:border-mint/25 hover:bg-white/[0.06] hover:shadow-glow sm:p-6">
      <span className="text-2xl sm:text-3xl">{h.icon}</span>
      <h3 className="mt-3 text-base font-bold text-white group-hover:text-mint sm:mt-4 sm:text-lg">{h.title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-muted sm:mt-2 sm:text-sm">{h.description}</p>
    </div>
  );
}

export function JobWhySection({ highlights }: { highlights: WhyHighlight[] }) {
  return (
    <section className="mb-8 sm:mb-14">
      <p className="section-label text-[10px] sm:text-xs">Pourquoi ce poste ?</p>
      <h2 className="mt-1.5 text-lg font-extrabold text-white sm:mt-3 sm:text-3xl">
        Une opportunité qui se démarque
      </h2>

      {/* Mobile: horizontal snap carousel */}
      <div className="-mx-4 mt-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-hide sm:hidden">
        {highlights.map((h) => (
          <HighlightCard key={h.title} h={h} compact />
        ))}
      </div>

      {/* Desktop: grid */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={stagger}
        className="mt-6 hidden gap-4 sm:mt-8 sm:grid sm:grid-cols-2"
      >
        {highlights.map((h) => (
          <motion.div key={h.title} variants={fadeUp}>
            <HighlightCard h={h} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
