"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { TESTIMONIALS } from "@/lib/premium-data";
import { TESTIMONIAL_AVATARS } from "@/lib/city-images";
import { fadeUp, stagger } from "@/lib/motion";

function StoryCard({ t, avatar, compact }: { t: typeof TESTIMONIALS[number]; avatar: string; compact?: boolean }) {
  if (compact) {
    return (
      <blockquote className="flex w-[260px] shrink-0 snap-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-navy">
          <Image src={avatar} alt={t.name} fill className="object-cover" sizes="40px" />
        </div>
        <div className="min-w-0">
          <p className="line-clamp-3 text-xs leading-relaxed text-slate-text">&ldquo;{t.quote}&rdquo;</p>
          <footer className="mt-2">
            <cite className="not-italic text-xs font-bold text-white">{t.name}</cite>
            <p className="truncate text-[10px] text-slate-dim">{t.role}</p>
          </footer>
        </div>
      </blockquote>
    );
  }

  return (
    <blockquote className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-5 sm:p-7">
      <div className="relative h-14 w-14 overflow-hidden rounded-full ring-4 ring-navy shadow-xl">
        <Image src={avatar} alt={t.name} fill className="object-cover" sizes="56px" />
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-text sm:mt-6 sm:text-[15px]">&ldquo;{t.quote}&rdquo;</p>
      <footer className="mt-4 border-t border-white/5 pt-3 sm:mt-6 sm:pt-4">
        <cite className="not-italic font-bold text-white">{t.name}</cite>
        <p className="mt-0.5 text-xs text-slate-dim sm:text-sm">{t.role}</p>
      </footer>
    </blockquote>
  );
}

export function JobSuccessStories() {
  return (
    <section className="mb-8 sm:mb-14">
      <p className="section-label text-[10px] sm:text-xs">Histoires vraies</p>
      <h2 className="mt-1.5 text-lg font-extrabold text-white sm:mt-3 sm:text-3xl">
        Ils ont trouvé leur voie au Maroc
      </h2>

      {/* Mobile: horizontal compact cards */}
      <div className="-mx-4 mt-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-hide sm:hidden">
        {TESTIMONIALS.map((t, i) => (
          <StoryCard key={t.name} t={t} avatar={TESTIMONIAL_AVATARS[i]} compact />
        ))}
      </div>

      {/* Desktop: grid */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={stagger}
        className="mt-6 hidden gap-5 sm:mt-8 sm:grid md:grid-cols-3 md:gap-6"
      >
        {TESTIMONIALS.map((t, i) => (
          <motion.div key={t.name} variants={fadeUp}>
            <StoryCard t={t} avatar={TESTIMONIAL_AVATARS[i]} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
