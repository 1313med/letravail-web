"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="story-section pb-32 lg:pb-40">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[2.5rem] px-8 py-24 text-center sm:px-16 sm:py-32"
        >
          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-mint/20 via-navy-700 to-navy" />
          <div className="hero-aurora absolute inset-0 opacity-40" />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint/10 blur-[100px]"
          />

          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-mint-glow">
              Commencez maintenant
            </p>
            <h2 className="mx-auto mt-6 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight text-white">
              Votre prochain chapitre
              <br />
              commence ici.
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-lg text-slate-text">
              Rejoignez des milliers de Marocains qui trouvent leur emploi sur Letravail.ma.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/emplois" className="btn-mint group !px-10 !py-5 !text-lg">
                Explorer les offres
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/salaires" className="btn-ghost !px-8 !py-5 !text-base">
                Voir les salaires
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
