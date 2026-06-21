"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MagneticWrap, fadeUp, stagger } from "@/lib/motion";

export function FinalCta() {
  return (
    <section className="section-dark relative overflow-hidden py-20 sm:py-36 lg:py-52">
      <div className="hero-aurora absolute inset-0 opacity-60" />
      <div className="stars absolute inset-0 opacity-25" />
      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 12, repeat: Infinity }} className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint/10 blur-[140px]" />

      <div className="container-xl relative">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mx-auto max-w-4xl text-center">
          <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-[0.35em] text-mint-glow">
            Votre moment
          </motion.p>
          <motion.h2 variants={fadeUp} className="mt-6 text-[clamp(2rem,7vw,6rem)] font-extrabold leading-[0.92] tracking-tight text-white sm:mt-8">
            Le Maroc recrute.
            <br />
            <span className="bg-gradient-to-r from-mint-glow to-emerald-300 bg-clip-text text-transparent">Et vous ?</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mx-auto mt-5 max-w-lg text-base text-slate-text sm:mt-8 sm:text-xl">
            Votre prochain chapitre commence ici.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-14 sm:flex-row sm:items-center sm:gap-4">
            <MagneticWrap>
              <Link href="/emplois" className="btn-mint group w-full !px-8 !py-4 !text-base sm:w-auto sm:!px-14 sm:!py-5 sm:!text-lg">
                Commencer maintenant
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </MagneticWrap>
            <MagneticWrap>
              <Link href="/salaires" className="btn-ghost w-full !px-8 !py-4 !text-base sm:w-auto sm:!px-10 sm:!py-5">
                Explorer les salaires
              </Link>
            </MagneticWrap>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
