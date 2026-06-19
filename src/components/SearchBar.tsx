"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface SearchBarProps {
  defaultQuery?: string;
  defaultCity?: string;
  cities?: { city: string; slug: string }[];
  compact?: boolean;
}

export function SearchBar({
  defaultQuery = "",
  defaultCity = "",
  cities = [],
  compact = false,
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

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex w-full flex-col gap-3 sm:flex-row ${
        compact ? "max-w-xl" : "max-w-3xl"
      }`}
      role="search"
      aria-label="Rechercher des offres d'emploi"
    >
      <div className="relative flex-1">
        <label htmlFor="search-query" className="sr-only">
          Mot-clé ou poste
        </label>
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
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
          placeholder="Poste, mot-clé, entreprise…"
          className="w-full rounded-lg border border-border bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="sm:w-48">
        <label htmlFor="search-city" className="sr-only">
          Ville
        </label>
        <select
          id="search-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-lg border border-border bg-white py-3 px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Toutes les villes</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.city}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-primary whitespace-nowrap px-8 py-3">
        Rechercher
      </button>
    </form>
  );
}
