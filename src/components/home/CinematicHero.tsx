"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { HeroSearch } from "@/components/premium/HeroSearch";
import { HERO_IMAGE } from "@/lib/city-images";

interface CinematicHeroProps {
  cities: { city: string; slug: string }[];
}

export function CinematicHero({ cities }: CinematicHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden">
      {/* Cinematic background */}
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt="Casablanca de nuit — Mosquée Hassan II"
          fill
          priority
          className="object-cover object-center scale-105"
          sizes="100vw"
        />
      </motion.div>

      {/* Layered overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/50 to-navy" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-transparent to-navy/60" />
      <div className="hero-aurora absolute inset-0 animate-aurora opacity-60" />

      {/* Stars */}
      <div className="stars absolute inset-0 opacity-40" />

      {/* Floating orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[15%] top-[20%] h-72 w-72 rounded-full bg-mint/10 blur-[100px]"
      />
      <motion.div
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[25%] right-[10%] h-96 w-96 rounded-full bg-mint-glow/8 blur-[120px]"
      />

      {/* Emerald light trail */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-mint/60 to-transparent" />

      {/* Content */}
      <motion.div style={{ opacity }} className="relative z-10 flex min-h-[100svh] flex-col justify-end pb-20 pt-32 lg:pb-28 lg:pt-40">
        <div className="container-xl">
          <div className="max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8 inline-flex items-center gap-3 rounded-full border border-mint/25 bg-mint/10 px-5 py-2 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
              </span>
              <span className="text-sm font-medium tracking-wide text-mint-glow">
                Le futur de l&apos;emploi · Maroc
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35 }}
              className="text-[clamp(2.75rem,8vw,6.5rem)] font-extrabold leading-[0.95] tracking-tight text-white"
            >
              Le futur de
              <br />
              l&apos;emploi{" "}
              <span className="gradient-text">au Maroc</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="mt-8 max-w-xl text-lg leading-relaxed text-slate-text sm:text-xl lg:text-2xl"
            >
              Des milliers d&apos;opportunités mises à jour automatiquement.
              <span className="text-white"> Chaque jour.</span>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.75 }}
            className="mt-14 lg:mt-16"
          >
            <HeroSearch cities={cities} />
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-20 hidden items-center gap-3 text-sm text-slate-muted lg:flex"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 pt-2"
            >
              <div className="h-2 w-0.5 rounded-full bg-mint" />
            </motion.div>
            Découvrir la plateforme
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
