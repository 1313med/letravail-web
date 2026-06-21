"use client";

import { motion } from "framer-motion";
import { Sparkles, FileText, PenLine, Coins, MessageCircle, Wand2, Send } from "lucide-react";
import { MagneticWrap, TiltCard, fadeUp, stagger } from "@/lib/motion";

const PROMPTS = [
  { icon: FileText, text: "Analyse mon CV" },
  { icon: MessageCircle, text: "Prépare-moi pour un entretien" },
  { icon: PenLine, text: "Rédige une lettre de motivation" },
  { icon: Coins, text: "Quel salaire puis-je demander ?" },
];

const FEATURES = [
  { label: "Revue de CV", desc: "Optimisé pour le marché marocain" },
  { label: "Lettre de motivation", desc: "Générée en secondes" },
  { label: "Simulation entretien", desc: "Questions par secteur" },
  { label: "Conseils salaire", desc: "Fourchettes par métier" },
];

export function AiCareerBlock() {
  return (
    <section className="section-glass story-section overflow-hidden">
      <div className="container-xl">
        <div className="relative">
          {/* Floating orb illustration */}
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -right-10 top-0 hidden h-72 w-72 rounded-full bg-gradient-to-br from-mint/30 to-blue-400/20 blur-[60px] lg:block"
          />

          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/50 p-8 shadow-[0_32px_100px_rgba(6,23,47,0.1)] backdrop-blur-3xl sm:p-12 lg:p-16">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-5 py-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-700">✨ Assistant Carrière IA</span>
                </motion.div>

                <motion.h2 variants={fadeUp} className="mt-8 text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[0.95] tracking-tight text-navy">
                  Votre copilote
                  <br />
                  <span className="text-navy/40">professionnel</span>
                </motion.h2>

                <motion.p variants={fadeUp} className="mt-6 text-lg text-navy/55">
                  Posez n&apos;importe quelle question sur votre carrière au Maroc.
                </motion.p>

                {/* Prompt chips — Raycast style */}
                <motion.div variants={fadeUp} className="mt-8 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-navy/35">Demandez :</p>
                  <div className="flex flex-wrap gap-2">
                    {PROMPTS.map((p, i) => (
                      <motion.button
                        key={p.text}
                        type="button"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(55,214,181,0.2)" }}
                        className="flex items-center gap-2 rounded-2xl border border-navy/8 bg-white/80 px-4 py-3 text-sm font-semibold text-navy/70 shadow-sm backdrop-blur-sm transition-colors hover:border-mint/40 hover:text-navy"
                      >
                        <p.icon className="h-4 w-4 text-emerald-600" />
                        {p.text}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Fake input */}
                <motion.div variants={fadeUp} className="mt-8 flex items-center gap-3 rounded-2xl border border-navy/10 bg-white/70 p-2 pl-5 shadow-inner backdrop-blur-xl">
                  <input type="text" placeholder="Comment améliorer mon profil pour un poste en banque ?" className="flex-1 bg-transparent text-sm text-navy placeholder:text-navy/30 focus:outline-none" readOnly />
                  <MagneticWrap strength={0.15}>
                    <button type="button" className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-white transition-colors hover:bg-emerald-700">
                      <Send className="h-4 w-4" />
                    </button>
                  </MagneticWrap>
                </motion.div>

                <MagneticWrap className="mt-8 inline-block">
                  <button type="button" className="btn-dark gap-2">
                    <Wand2 className="h-4 w-4" />
                    Rejoindre la liste d&apos;attente
                  </button>
                </MagneticWrap>
              </motion.div>

              {/* Floating glass cards */}
              <div className="relative hidden min-h-[400px] lg:block">
                {FEATURES.map((f, i) => (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.12 }}
                    className="absolute"
                    style={{
                      top: `${i * 22}%`,
                      left: i % 2 === 0 ? "0%" : "25%",
                      width: i === 1 ? "75%" : "65%",
                    }}
                  >
                    <TiltCard>
                      <div className="rounded-2xl border border-white/80 bg-white/60 p-5 shadow-lg backdrop-blur-xl">
                        <p className="font-bold text-navy">{f.label}</p>
                        <p className="mt-1 text-sm text-navy/45">{f.desc}</p>
                      </div>
                    </TiltCard>
                  </motion.div>
                ))}
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-8 right-8 h-32 w-32 rounded-full bg-gradient-to-br from-mint/40 to-emerald-300/30 blur-xl"
                />
              </div>

              {/* Mobile feature grid */}
              <div className="grid grid-cols-2 gap-3 lg:hidden">
                {FEATURES.map((f) => (
                  <div key={f.label} className="rounded-2xl border border-white/80 bg-white/60 p-4 backdrop-blur-xl">
                    <p className="font-bold text-navy text-sm">{f.label}</p>
                    <p className="mt-1 text-xs text-navy/45">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
