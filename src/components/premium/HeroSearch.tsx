"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Search, Sparkles, Mic, Clock, TrendingUp, MapPin, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MagneticWrap } from "@/lib/motion";

interface HeroSearchProps {
  cities: { city: string; slug: string }[];
  compact?: boolean;
}

const POPULAR_SEARCHES = [
  "Développeur",
  "Comptable",
  "Commercial",
  "Data Analyst",
  "Ingénieur",
];

const POPULAR_JOBS = [
  { title: "Développeur Full Stack", slug: "developpeur-full-stack-maroc" },
  { title: "Analyste financier", city: "casablanca-morocco" },
  { title: "Responsable RH", city: "rabat-morocco" },
  { title: "Commercial B2B", city: "marrakech-morocco" },
];

const RECENT_KEY = "letravail-recent-searches";

export function HeroSearch({ cities, compact = false }: HeroSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [contract, setContract] = useState("");
  const [mode, setMode] = useState<"classic" | "ai">("classic");
  const [aiPrompt, setAiPrompt] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      if (Array.isArray(stored)) setRecent(stored.slice(0, 4));
    } catch { /* ignore */ }
  }, []);

  function saveRecent(q: string) {
    if (!q.trim()) return;
    const next = [q.trim(), ...recent.filter((r) => r !== q.trim())].slice(0, 4);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === "ai" && aiPrompt.trim()) {
      saveRecent(aiPrompt);
      router.push(`/emplois?q=${encodeURIComponent(aiPrompt.trim())}`);
      return;
    }
    saveRecent(query);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city) params.set("city", city);
    if (contract) params.set("contract", contract);
    const qs = params.toString();
    router.push(qs ? `/emplois?${qs}` : "/emplois");
  }

  function applySearch(term: string) {
    setQuery(term);
    saveRecent(term);
    router.push(`/emplois?q=${encodeURIComponent(term)}`);
  }

  return (
    <div className="w-full" role="search">
      {/* Mode toggle */}
      <div className="mb-3 flex justify-center gap-1.5 sm:mb-4 sm:gap-2">
        <button
          type="button"
          onClick={() => setMode("classic")}
          className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-all sm:px-5 sm:text-sm ${
            mode === "classic"
              ? "bg-white/15 text-white backdrop-blur-md"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          Classique
        </button>
        <button
          type="button"
          onClick={() => setMode("ai")}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all sm:gap-2 sm:px-5 sm:text-sm ${
            mode === "ai"
              ? "bg-mint/20 text-mint-glow backdrop-blur-md ring-1 ring-mint/40"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          IA
        </button>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        animate={{
          boxShadow: focused
            ? "0 0 0 1px rgba(55,214,181,0.4), 0 16px 48px rgba(0,0,0,0.35), 0 0 80px rgba(55,214,181,0.1)"
            : "0 0 0 1px rgba(255,255,255,0.15), 0 12px 40px rgba(0,0,0,0.3)",
        }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-2xl border border-white/20 bg-white/[0.1] backdrop-blur-3xl sm:rounded-[2rem]"
      >
        <AnimatePresence mode="wait">
          {mode === "ai" ? (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 sm:p-8"
            >
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-mint-glow">
                <Sparkles className="h-3.5 w-3.5" />
                Décrivez le job de vos rêves
              </label>
              <div className="mt-4 flex gap-3">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex: CDI à Casablanca, télétravail, 15 000 MAD+, secteur banque…"
                  className="flex-1 bg-transparent text-lg text-white placeholder:text-white/35 focus:outline-none sm:text-xl"
                />
                <button
                  type="button"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white/60 transition-colors hover:border-mint/30 hover:text-mint"
                  aria-label="Recherche vocale (bientôt)"
                >
                  <Mic className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="classic"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid sm:grid-cols-2 lg:grid-cols-4"
            >
              {[
                {
                  label: "Métier ou mot-clé",
                  icon: Briefcase,
                  el: (
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Développeur, analyste, RH…"
                      className="w-full bg-transparent py-1 text-base font-medium text-white placeholder:text-white/35 focus:outline-none sm:text-lg"
                    />
                  ),
                },
                {
                  label: "Ville",
                  icon: MapPin,
                  el: (
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full appearance-none bg-transparent py-1 text-base font-medium text-white focus:outline-none sm:text-lg"
                    >
                      <option value="" className="bg-navy">Tout le Maroc</option>
                      {cities.map((c) => (
                        <option key={c.slug} value={c.slug} className="bg-navy">{c.city}</option>
                      ))}
                    </select>
                  ),
                },
                {
                  label: "Contrat",
                  icon: Clock,
                  el: (
                    <select
                      value={contract}
                      onChange={(e) => setContract(e.target.value)}
                      className="w-full appearance-none bg-transparent py-1 text-base font-medium text-white focus:outline-none sm:text-lg"
                    >
                      <option value="" className="bg-navy">Tous les contrats</option>
                      <option value="CDI" className="bg-navy">CDI</option>
                      <option value="CDD" className="bg-navy">CDD</option>
                      <option value="Stage" className="bg-navy">Stage</option>
                    </select>
                  ),
                },
                {
                  label: "Secteur",
                  icon: TrendingUp,
                  el: (
                    <select className="w-full appearance-none bg-transparent py-1 text-base font-medium text-white focus:outline-none sm:text-lg">
                      <option value="" className="bg-navy">Tous les secteurs</option>
                      <option value="banque" className="bg-navy">Banque</option>
                      <option value="tech" className="bg-navy">Tech</option>
                      <option value="telecom" className="bg-navy">Télécom</option>
                    </select>
                  ),
                },
              ].map((field, i) => (
                <div
                  key={field.label}
                  className={`border-white/10 p-4 sm:p-7 ${
                    i < 3 ? "border-b sm:border-b-0 sm:border-r" : ""
                  }`}
                >
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                    <field.icon className="h-3 w-3" />
                    {field.label}
                  </label>
                  <div className="mt-3">{field.el}</div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="border-t border-white/10 p-3 sm:p-5">
          <MagneticWrap>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.99 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-mint py-4 text-base font-bold text-navy shadow-glow transition-shadow hover:shadow-glow-lg sm:gap-3 sm:rounded-2xl sm:py-5 sm:text-lg"
            >
              <Search className="h-5 w-5" />
              {mode === "ai" ? "Trouver avec l'IA" : "Rechercher"}
            </motion.button>
          </MagneticWrap>
        </div>
      </motion.form>

      {/* Suggestions — hidden in compact hero on mobile, full on scroll pages */}
      <div className={`mt-4 space-y-4 text-left sm:mt-6 sm:space-y-5 ${compact ? "hidden sm:block" : ""}`}>
        {recent.length > 0 && (
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              <Clock className="h-3 w-3" /> Recherches récentes
            </p>
            <div className="flex flex-wrap gap-2">
              {recent.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => applySearch(term)}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-sm transition-all hover:border-mint/30 hover:bg-mint/10 hover:text-white"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/40">
            Recherches populaires
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => applySearch(term)}
                className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/70 backdrop-blur-sm transition-all hover:border-mint/25 hover:text-mint-glow"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        <div className={compact ? "hidden md:block" : ""}>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/40">
            Offres tendance
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {POPULAR_JOBS.map((job) => (
              <Link
                key={job.title}
                href={job.slug ? `/salaires/${job.slug}` : `/emplois/${job.city}`}
                className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 backdrop-blur-sm transition-all hover:border-mint/20 hover:bg-white/[0.08]"
              >
                <TrendingUp className="h-4 w-4 shrink-0 text-mint/70" />
                <span className="text-sm font-medium text-white/80 group-hover:text-white">{job.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
