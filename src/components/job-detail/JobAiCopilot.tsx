"use client";

import { motion } from "framer-motion";
import { Sparkles, FileText, MessageCircle, PenLine, Coins } from "lucide-react";
import { fadeUp, stagger } from "@/lib/motion";

const PROMPTS = [
  { icon: FileText, text: "Analyse mon CV", full: "Analyse mon CV pour ce poste" },
  { icon: PenLine, text: "Lettre de motivation", full: "Rédiger une lettre de motivation" },
  { icon: MessageCircle, text: "Préparer entretien", full: "Préparer mon entretien" },
  { icon: Coins, text: "Salaire à demander", full: "Quel salaire demander ?" },
];

export function JobAiCopilot() {
  return (
    <section className="mb-8 overflow-hidden rounded-xl border border-mint/15 bg-gradient-to-br from-mint/5 via-navy-800/40 to-navy-900/60 p-4 sm:mb-14 sm:rounded-[1.75rem] sm:p-8">
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <motion.div variants={fadeUp} className="inline-flex items-center gap-1.5 rounded-full border border-mint/25 bg-mint/10 px-3 py-1.5 sm:gap-2 sm:px-4 sm:py-2">
          <Sparkles className="h-3.5 w-3.5 text-mint sm:h-4 sm:w-4" />
          <span className="text-xs font-bold text-mint-glow sm:text-sm">Assistant Carrière IA</span>
        </motion.div>
        <motion.h2 variants={fadeUp} className="mt-3 text-lg font-extrabold text-white sm:mt-5 sm:text-3xl">
          Préparez votre candidature
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-1 text-xs text-slate-muted sm:mt-2 sm:text-base">
          Bientôt disponible — optimisez votre profil.
        </motion.p>

        {/* Mobile: 2x2 compact grid */}
        <motion.div variants={fadeUp} className="mt-4 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-3 lg:grid-cols-2">
          {PROMPTS.map((p) => (
            <button
              key={p.full}
              type="button"
              className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-left transition-all hover:border-mint/30 hover:bg-mint/5 sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mint/10 sm:h-10 sm:w-10 sm:rounded-xl">
                <p.icon className="h-3.5 w-3.5 text-mint sm:h-4 sm:w-4" />
              </span>
              <span className="text-xs font-medium leading-tight text-slate-text group-hover:text-white sm:text-sm">
                <span className="sm:hidden">{p.text}</span>
                <span className="hidden sm:inline">{p.full}</span>
              </span>
            </button>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
