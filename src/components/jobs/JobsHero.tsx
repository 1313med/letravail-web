"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "@/lib/motion";

function HeroParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 24 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-mint/40"
          style={{ left: `${(i * 17 + 8) % 100}%`, top: `${(i * 23 + 5) % 100}%` }}
          animate={{ opacity: [0.2, 0.8, 0.2], y: [0, -20, 0] }}
          transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

interface JobsHeroProps {
  title: string;
  subtitle: string;
  count: number;
  label?: string;
}

export function JobsHero({ title, subtitle, count, label = "Explorer" }: JobsHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-navy pt-[calc(4rem+env(safe-area-inset-top))] sm:pt-28">
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-[#0a2240] to-navy" />
      <div className="hero-aurora absolute inset-0 opacity-60" />
      <HeroParticles />
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute left-1/2 top-0 h-72 w-[600px] -translate-x-1/2 rounded-full bg-mint/8 blur-[100px]"
      />

      <div className="container-xl relative pb-10 pt-6 sm:pb-14 sm:pt-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="section-label"
        >
          {label}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-[clamp(2rem,6vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-white"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-2xl font-bold text-mint-glow sm:text-3xl"
        >
          <AnimatedNumber value={count} suffix={count >= 1000 ? "+" : ""} />{" "}
          <span className="text-lg font-semibold text-white/60 sm:text-xl">
            {count === 1 ? "offre disponible" : "offres disponibles"}
          </span>
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 max-w-2xl text-base text-slate-text sm:text-lg"
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
}
