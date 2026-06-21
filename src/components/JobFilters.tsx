"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface JobFiltersProps {
  cities: { city: string; slug: string }[];
  companies: { name: string; slug: string }[];
  contractTypes: string[];
  tags: { name: string; slug: string }[];
  basePath: string;
}

export function JobFilters({ cities, companies, contractTypes, tags, basePath }: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  const currentCity = searchParams.get("city") || "";
  const currentCompany = searchParams.get("company") || "";
  const currentContract = searchParams.get("contract") || "";
  const currentTag = searchParams.get("tag") || "";
  const hasFilters = currentCity || currentCompany || currentContract || currentTag;

  const selectClass = "input-dark !py-3 !text-sm";

  return (
    <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Filtres">
      {cities.length > 0 && (
        <select value={currentCity} onChange={(e) => updateFilter("city", e.target.value)} className={selectClass} aria-label="Ville">
          <option value="">Toutes les villes</option>
          {cities.map((c) => <option key={c.slug} value={c.slug}>{c.city}</option>)}
        </select>
      )}
      <select value={currentCompany} onChange={(e) => updateFilter("company", e.target.value)} className={selectClass} aria-label="Entreprise">
        <option value="">Toutes les entreprises</option>
        {companies.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
      </select>
      <select value={currentContract} onChange={(e) => updateFilter("contract", e.target.value)} className={selectClass} aria-label="Contrat">
        <option value="">Tous les contrats</option>
        {contractTypes.map((ct) => <option key={ct} value={ct}>{ct}</option>)}
      </select>
      {tags.length > 0 && (
        <select value={currentTag} onChange={(e) => updateFilter("tag", e.target.value)} className={selectClass} aria-label="Secteur">
          <option value="">Tous les secteurs</option>
          {tags.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
        </select>
      )}
      {hasFilters && (
        <button type="button" onClick={() => router.push(basePath)} className="btn-ghost !py-3 !text-xs text-mint">
          Effacer
        </button>
      )}
    </div>
  );
}
