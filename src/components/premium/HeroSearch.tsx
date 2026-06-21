"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

interface HeroSearchProps {
  cities: { city: string; slug: string }[];
}

export function HeroSearch({ cities }: HeroSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [contract, setContract] = useState("");
  const [salary, setSalary] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city) params.set("city", city);
    if (contract) params.set("contract", contract);
    const qs = params.toString();
    router.push(qs ? `/emplois?${qs}` : "/emplois");
  }

  const fields = [
    {
      label: "Métier",
      content: (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Développeur, analyste…"
          className="w-full bg-transparent py-1 text-base text-white placeholder:text-slate-dim focus:outline-none"
        />
      ),
    },
    {
      label: "Ville",
      content: (
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full appearance-none bg-transparent py-1 text-base text-white focus:outline-none"
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
      content: (
        <select
          value={contract}
          onChange={(e) => setContract(e.target.value)}
          className="w-full appearance-none bg-transparent py-1 text-base text-white focus:outline-none"
        >
          <option value="" className="bg-navy">Tous</option>
          <option value="CDI" className="bg-navy">CDI</option>
          <option value="CDD" className="bg-navy">CDD</option>
          <option value="Stage" className="bg-navy">Stage</option>
        </select>
      ),
    },
    {
      label: "Salaire min.",
      content: (
        <select
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          className="w-full appearance-none bg-transparent py-1 text-base text-white focus:outline-none"
        >
          <option value="" className="bg-navy">Indifférent</option>
          <option value="8000" className="bg-navy">8 000 MAD+</option>
          <option value="12000" className="bg-navy">12 000 MAD+</option>
          <option value="18000" className="bg-navy">18 000 MAD+</option>
        </select>
      ),
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl" role="search">
      <motion.div
        whileHover={{ boxShadow: "0 0 80px rgba(55, 214, 181, 0.15)" }}
        className="overflow-hidden rounded-3xl border border-white/20 bg-white/[0.08] shadow-glass backdrop-blur-2xl transition-shadow duration-500"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          {fields.map((field, i) => (
            <div
              key={field.label}
              className={`border-white/10 p-5 sm:p-6 ${
                i < fields.length - 1 ? "border-b sm:border-b-0 sm:border-r" : ""
              } ${i === 1 ? "sm:border-r" : ""}`}
            >
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-muted">
                {field.label}
              </label>
              <div className="mt-2">{field.content}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 p-3 sm:p-4">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-mint py-4 text-base font-bold text-navy shadow-glow transition-shadow hover:shadow-glow-lg"
          >
            <Search className="h-5 w-5" />
            Rechercher des offres
          </motion.button>
        </div>
      </motion.div>
    </form>
  );
}
