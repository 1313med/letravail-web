"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";
import { HeroSearch } from "@/components/premium/HeroSearch";
import { HERO_IMAGE } from "@/lib/city-images";

interface CinematicHeroProps {
  cities: { city: string; slug: string }[];
}

function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${(i * 13 + 5) % 100}%`,
        top: `${(i * 19 + 3) % 100}%`,
        size: i % 4 === 0 ? 2 : 1,
        duration: 5 + (i % 7),
        delay: (i % 10) * 0.35,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ y: [0, -140, 0], opacity: [0, 0.8, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function LightTrails() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-50" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <path d="M0 680 Q360 600 720 640 T1440 580" fill="none" stroke="url(#t1)" strokeWidth="2" className="light-trail" />
      <path d="M0 760 Q480 700 960 720 T1440 660" fill="none" stroke="url(#t2)" strokeWidth="1.5" className="light-trail" style={{ animationDelay: "2s" }} />
      <defs>
        <linearGradient id="t1" x1="0%" x2="100%"><stop offset="0%" stopColor="transparent" /><stop offset="40%" stopColor="#37D6B5" /><stop offset="100%" stopColor="transparent" /></linearGradient>
        <linearGradient id="t2" x1="0%" x2="100%"><stop offset="0%" stopColor="transparent" /><stop offset="50%" stopColor="#5EF2D6" stopOpacity="0.7" /><stop offset="100%" stopColor="transparent" /></linearGradient>
      </defs>
    </svg>
  );
}

export function CinematicHero({ cities }: CinematicHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="section-dark relative min-h-[100svh]">
      {/* Background — clipped separately so content can grow */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div style={{ y, scale }} className="absolute inset-0">
          <Image src={HERO_IMAGE} alt="Casablanca — Mosquée Hassan II" fill priority className="object-cover object-[center_25%] sm:object-[center_30%]" sizes="100vw" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/55 to-navy" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/50" />
        <div className="hero-aurora absolute inset-0 animate-aurora opacity-80" />
        <div className="stars absolute inset-0" />
        <Particles />
        <LightTrails />
        <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 8, repeat: Infinity }} className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint/8 blur-[140px]" />
      </div>

      {/* Content — top-aligned, never clipped by header */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex min-h-[100svh] flex-col items-center px-4 pb-28 pt-[calc(4.5rem+env(safe-area-inset-top))] text-center sm:px-6 sm:pb-20 sm:pt-28 md:pt-32 lg:px-8 lg:pb-16"
      >
        <div className="mx-auto w-full max-w-6xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-5 text-[11px] font-bold uppercase tracking-[0.28em] text-mint-glow/80 sm:mb-8 sm:text-sm sm:tracking-[0.35em]"
          >
            Letravail.ma
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(1.875rem,7.5vw,5.5rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-white lg:text-[clamp(3rem,6.5vw,7rem)] lg:leading-[0.92]"
          >
            <span className="block">Votre prochain</span>
            <span className="block">chapitre</span>
            <span className="relative mt-1 inline-block sm:mt-0">
              <span className="relative z-10 bg-gradient-to-r from-mint-glow via-mint to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(55,214,181,0.45)]">
                commence ici.
              </span>
              <motion.span
                animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -inset-3 -z-10 rounded-3xl bg-mint/20 blur-2xl sm:-inset-4"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-text/90 sm:mt-8 sm:text-xl lg:text-2xl"
          >
            Découvrez les meilleures opportunités du royaume.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55 }}
            className="mx-auto mt-8 w-full max-w-5xl sm:mt-12 lg:mt-14"
          >
            <HeroSearch cities={cities} compact />
          </motion.div>
        </div>

        {/* Scroll hint — desktop only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-auto hidden items-center justify-center gap-3 pb-4 pt-10 text-sm text-slate-muted lg:flex"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.2, repeat: Infinity }} className="flex h-10 w-6 items-start justify-center rounded-full border border-white/25 pt-2">
            <div className="h-2 w-0.5 rounded-full bg-mint" />
          </motion.div>
          Faites défiler pour explorer
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy to-transparent sm:h-32" />
    </section>
  );
}
