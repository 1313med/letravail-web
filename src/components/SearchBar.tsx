"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface SearchBarProps {
  defaultQuery?: string;
  defaultCity?: string;
  cities?: { city: string; slug: string }[];
  variant?: "hero" | "default";
}

export function SearchBar({
  defaultQuery = "",
  defaultCity = "",
  cities = [],
  variant = "default",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [city, setCity] = useState(defaultCity);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city) params.set("city", city);
    const qs = params.toString();
    router.push(qs ? `/emplois?${qs}` : "/emplois");
  }

  const isHero = variant === "hero";

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full ${isHero ? "max-w-3xl" : "max-w-2xl"}`}
      role="search"
      aria-label="Rechercher des offres d'emploi"
    >
      <div
        className={`flex flex-col gap-3 sm:flex-row sm:items-center ${
          isHero
            ? "rounded-2xl border border-white/20 bg-white/95 p-2 shadow-2xl shadow-black/20 backdrop-blur-xl"
            : "rounded-2xl border border-border bg-white p-2 shadow-card"
        }`}
      >
        <div className="relative flex-1">
          <label htmlFor="search-query" className="sr-only">
            Mot-clé ou poste
          </label>
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            id="search-query"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Développeur, analyste, commercial…"
            className="w-full rounded-xl border-0 bg-transparent py-3.5 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-0"
          />
        </div>

        <div className="hidden h-8 w-px bg-border sm:block" aria-hidden="true" />

        <div className="sm:w-44">
          <label htmlFor="search-city" className="sr-only">
            Ville
          </label>
          <select
            id="search-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border-0 bg-transparent py-3.5 px-4 text-sm text-foreground focus:outline-none focus:ring-0"
          >
            <option value="">Tout le Maroc</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.city}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className={`whitespace-nowrap rounded-xl px-8 py-3.5 text-sm font-semibold transition-all duration-300 ${
            isHero
              ? "bg-gradient-to-r from-accent to-primary-light text-white shadow-accent hover:shadow-accent-lg"
              : "btn-primary !shadow-none"
          }`}
        >
          Rechercher
        </button>
      </div>
    </form>
  );
}
