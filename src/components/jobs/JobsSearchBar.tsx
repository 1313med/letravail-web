"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Clock, TrendingUp, Briefcase, MapPin, Banknote, X, ChevronDown } from "lucide-react";
import { FilterTriggerButton } from "./JobsFilterSheet";
import { POPULAR_SEARCHES } from "@/lib/jobs-discovery";
import { MagneticWrap } from "@/lib/motion";
import { cn } from "@/lib/cn";

const RECENT_KEY = "letravail-recent-searches";

interface JobsSearchBarProps {
  cities: { city: string; slug: string }[];
  contractTypes: string[];
  basePath: string;
  sticky?: boolean;
  initialQ?: string;
  initialCity?: string;
  initialContract?: string;
  initialMinSalary?: number;
  onOpenFilters?: () => void;
  filterCount?: number;
}

function SearchFormFields({
  query,
  setQuery,
  city,
  setCity,
  contract,
  setContract,
  minSalary,
  setMinSalary,
  cities,
  contractTypes,
  layout = "full",
}: {
  query: string;
  setQuery: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  contract: string;
  setContract: (v: string) => void;
  minSalary: number;
  setMinSalary: (v: number) => void;
  cities: { city: string; slug: string }[];
  contractTypes: string[];
  layout?: "full" | "stacked";
}) {
  const fieldClass = layout === "stacked"
    ? "flex flex-col gap-1.5 border-b border-white/10 p-4 last:border-0"
    : "flex flex-col gap-1.5 border-white/10 p-4 sm:border-r";

  return (
    <>
      <label className={fieldClass}>
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          <Briefcase className="h-3 w-3" /> Métier
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Développeur, analyste…"
          className="bg-transparent text-base font-medium text-white placeholder:text-white/30 focus:outline-none"
        />
      </label>
      <label className={fieldClass}>
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          <MapPin className="h-3 w-3" /> Ville
        </span>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="cursor-pointer bg-transparent text-base font-medium text-white focus:outline-none [&>option]:bg-navy"
        >
          <option value="">Tout le Maroc</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>{c.city}</option>
          ))}
        </select>
      </label>
      <label className={fieldClass}>
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          Contrat
        </span>
        <select
          value={contract}
          onChange={(e) => setContract(e.target.value)}
          className="cursor-pointer bg-transparent text-base font-medium text-white focus:outline-none [&>option]:bg-navy"
        >
          <option value="">Tous</option>
          {contractTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className={layout === "stacked" ? fieldClass : "flex flex-col gap-1.5 p-4"}>
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          <Banknote className="h-3 w-3" /> Salaire
        </span>
        <select
          value={minSalary}
          onChange={(e) => setMinSalary(parseInt(e.target.value, 10))}
          className="cursor-pointer bg-transparent text-base font-medium text-white focus:outline-none [&>option]:bg-navy"
        >
          <option value={0}>Tous salaires</option>
          <option value={8000}>8 000+ MAD</option>
          <option value={12000}>12 000+ MAD</option>
          <option value={18000}>18 000+ MAD</option>
          <option value={25000}>25 000+ MAD</option>
        </select>
      </label>
    </>
  );
}

function SearchSuggestions({
  recent,
  onSelect,
}: {
  recent: string[];
  onSelect: (term: string) => void;
}) {
  return (
    <div className="space-y-3 border-t border-white/8 pt-4">
      {recent.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
            <Clock className="h-3 w-3" /> Recherches récentes
          </p>
          <div className="flex flex-wrap gap-2">
            {recent.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => onSelect(term)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-text hover:border-mint/30 hover:text-white"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
          <TrendingUp className="h-3 w-3" /> Populaires
        </p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => onSelect(term)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-text hover:border-mint/30 hover:text-white"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function JobsSearchBar({
  cities,
  contractTypes,
  basePath,
  sticky = true,
  initialQ = "",
  initialCity = "",
  initialContract = "",
  initialMinSalary = 0,
  onOpenFilters,
  filterCount = 0,
}: JobsSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQ);
  const [city, setCity] = useState(initialCity);
  const [contract, setContract] = useState(initialContract);
  const [minSalary, setMinSalary] = useState(initialMinSalary);
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setQuery(initialQ);
    setCity(initialCity);
    setContract(initialContract);
    setMinSalary(initialMinSalary);
  }, [initialQ, initialCity, initialContract, initialMinSalary]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      if (Array.isArray(stored)) setRecent(stored.slice(0, 5));
    } catch { /* ignore */ }
  }, []);

  const cityLabel = useMemo(
    () => cities.find((c) => c.slug === city)?.city ?? (city ? city.replace("-morocco", "") : null),
    [cities, city]
  );

  const summary = useMemo(() => {
    const parts: string[] = [];
    if (query.trim()) parts.push(query.trim());
    else parts.push("Métier, ville, contrat…");
    return parts[0];
  }, [query]);

  function saveRecent(q: string) {
    if (!q.trim()) return;
    const next = [q.trim(), ...recent.filter((r) => r !== q.trim())].slice(0, 5);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  }

  function navigate(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(overrides)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  function handleSubmit(e: FormEvent, closeMobile = false) {
    e.preventDefault();
    saveRecent(query);
    navigate({
      q: query.trim() || undefined,
      city: city || undefined,
      contract: contract || undefined,
      minSalary: minSalary > 0 ? String(minSalary) : undefined,
    });
    if (closeMobile) setMobileOpen(false);
  }

  function selectSuggestion(term: string) {
    setQuery(term);
    saveRecent(term);
    navigate({ q: term });
    setMobileOpen(false);
  }

  return (
    <>
      <div className={cn(sticky && "sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-40 lg:top-20")}>
        <div className={cn(!sticky ? "" : "border-b border-white/5 bg-navy/90 backdrop-blur-2xl")}>
          <div className="container-xl py-2.5 sm:py-3">
            {/* Mobile — search + filter */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex min-h-[44px] flex-1 items-center gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-left backdrop-blur-3xl transition-colors hover:border-mint/25"
              >
                <Search className="h-4 w-4 shrink-0 text-mint" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{summary}</span>
                  <span className="block truncate text-xs text-slate-dim">
                    {cityLabel || contract || minSalary > 0 ? "Filtres actifs" : "Métier, ville, contrat…"}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 text-slate-dim" />
              </button>
              {onOpenFilters && (
                <FilterTriggerButton onClick={onOpenFilters} activeCount={filterCount} />
              )}
            </div>

            {/* Desktop — full inline form */}
            <motion.form
              onSubmit={(e) => handleSubmit(e)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 180)}
              animate={{
                boxShadow: focused
                  ? "0 0 0 1px rgba(55,214,181,0.35), 0 12px 40px rgba(0,0,0,0.25)"
                  : "0 0 0 1px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.2)",
              }}
              className="hidden overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/[0.06] backdrop-blur-3xl lg:block"
            >
              <div className="grid lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
                <SearchFormFields
                  query={query}
                  setQuery={setQuery}
                  city={city}
                  setCity={setCity}
                  contract={contract}
                  setContract={setContract}
                  minSalary={minSalary}
                  setMinSalary={setMinSalary}
                  cities={cities}
                  contractTypes={contractTypes}
                />
                <div className="flex items-stretch p-3">
                  <MagneticWrap className="w-full">
                    <button type="submit" className="flex h-full w-full items-center justify-center gap-2 rounded-xl bg-mint px-6 py-3.5 text-sm font-bold text-navy shadow-glow transition-shadow hover:shadow-glow-lg lg:min-w-[120px]">
                      <Search className="h-4 w-4" />
                      Rechercher
                    </button>
                  </MagneticWrap>
                </div>
              </div>
            </motion.form>

            {/* Desktop suggestions */}
            <AnimatePresence>
              {focused && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="hidden overflow-hidden lg:block"
                >
                  <SearchSuggestions recent={recent} onSelect={selectSuggestion} />
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setSuggestionsOpen(!suggestionsOpen)}
              className="mt-2 hidden items-center gap-1 text-xs text-slate-dim hover:text-mint lg:flex"
            >
              <Sparkles className="h-3 w-3" />
              {suggestionsOpen ? "Masquer suggestions" : "Suggestions de recherche"}
            </button>

            <AnimatePresence>
              {suggestionsOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="hidden overflow-hidden lg:block"
                >
                  <SearchSuggestions recent={recent} onSelect={selectSuggestion} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile — bottom sheet search */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-navy/75 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-[2rem] border-t border-white/10 bg-navy shadow-2xl lg:hidden"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/8 bg-navy/95 px-5 py-4 backdrop-blur-xl">
                <h2 className="text-lg font-bold text-white">Rechercher</h2>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => handleSubmit(e, true)}
                className="border-b border-white/8 bg-white/[0.04]"
              >
                <SearchFormFields
                  query={query}
                  setQuery={setQuery}
                  city={city}
                  setCity={setCity}
                  contract={contract}
                  setContract={setContract}
                  minSalary={minSalary}
                  setMinSalary={setMinSalary}
                  cities={cities}
                  contractTypes={contractTypes}
                  layout="stacked"
                />
                <div className="p-4">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-mint py-4 text-base font-bold text-navy shadow-glow"
                  >
                    <Search className="h-5 w-5" />
                    Rechercher des offres
                  </button>
                </div>
              </form>

              <div className="px-5 py-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                <SearchSuggestions recent={recent} onSelect={selectSuggestion} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
