"use client";

import { motion } from "framer-motion";
import { Sparkles, FileText, PenLine, Coins, MessageCircle } from "lucide-react";

const features = [
  { icon: FileText, label: "Revue de CV", desc: "Optimisez votre profil" },
  { icon: PenLine, label: "Lettre de motivation", desc: "Générée en secondes" },
  { icon: Coins, label: "Conseils salaire", desc: "Négociez mieux" },
  { icon: MessageCircle, label: "Préparation entretien", desc: "Questions types" },
];

export function AiCareerBlock() {
  return (
    <section className="story-section relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-mint/[0.03] to-transparent" />

      <div className="container-xl relative">
        <div className="relative overflow-hidden rounded-[2rem] border border-mint/20 bg-gradient-to-br from-navy-700 via-navy-800 to-navy p-10 sm:p-16 lg:p-20">
          {/* Glow */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-mint/10 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-mint-glow/5 blur-[100px]" />

          <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-4 py-2"
              >
                <Sparkles className="h-4 w-4 text-mint" />
                <span className="text-sm font-semibold text-mint">Assistant Carrière IA</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-8 text-4xl font-bold tracking-tight text-white sm:text-5xl"
              >
                Votre copilote
                <br />
                <span className="gradient-text">professionnel</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mt-6 text-lg text-slate-muted"
              >
                CV, lettre de motivation, préparation d&apos;entretien —
                propulsé par l&apos;intelligence artificielle. Bientôt disponible.
              </motion.p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-colors hover:border-mint/25 hover:bg-white/[0.08]"
                >
                  <f.icon className="h-6 w-6 text-mint" />
                  <p className="mt-4 font-semibold text-white">{f.label}</p>
                  <p className="mt-1 text-sm text-slate-muted">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
