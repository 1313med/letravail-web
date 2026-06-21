"use client";

import { motion } from "framer-motion";
import { BenefitItem } from "@/lib/job-detail";
import { fadeUp, stagger } from "@/lib/motion";

export function JobSkillsSection({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;
  return (
    <section className="mb-8 sm:mb-14">
      <p className="section-label text-[10px] sm:text-xs">Compétences</p>
      <h2 className="mt-1.5 text-lg font-extrabold text-white sm:mt-3 sm:text-3xl">Skills & expertises</h2>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={stagger}
        className="mt-4 flex flex-wrap gap-2 sm:mt-8 sm:gap-2.5"
      >
        {skills.map((skill) => (
          <motion.span
            key={skill}
            variants={fadeUp}
            className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-text backdrop-blur-sm sm:px-4 sm:py-2.5 sm:text-sm"
          >
            {skill}
          </motion.span>
        ))}
      </motion.div>
    </section>
  );
}

export function JobBenefitsSection({ benefits }: { benefits: BenefitItem[] }) {
  return (
    <section className="mb-8 sm:mb-14">
      <p className="section-label text-[10px] sm:text-xs">Avantages</p>
      <h2 className="mt-1.5 text-lg font-extrabold text-white sm:mt-3 sm:text-3xl">Ce que vous gagnez</h2>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={stagger}
        className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-4 lg:grid-cols-3"
      >
        {benefits.map((b) => (
          <motion.div
            key={b.title}
            variants={fadeUp}
            className="rounded-xl border border-white/8 bg-gradient-to-br from-white/[0.05] to-transparent p-3 sm:rounded-2xl sm:p-5"
          >
            <span className="text-lg sm:text-2xl">{b.icon}</span>
            <h3 className="mt-2 text-xs font-bold text-white sm:mt-3 sm:text-base">{b.title}</h3>
            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-muted sm:mt-1.5 sm:line-clamp-none sm:text-sm">{b.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
