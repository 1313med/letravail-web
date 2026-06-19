"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface JobFiltersProps {
  cities: { city: string; slug: string }[];
  companies: { name: string; slug: string }[];
  contractTypes: string[];
  tags: { name: string; slug: string }[];
  basePath: string;
}

export function JobFilters({
  cities,
  companies,
  contractTypes,
  tags,
  basePath,
}: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  const currentCity = searchParams.get("city") || "";
  const currentCompany = searchParams.get("company") || "";
  const currentContract = searchParams.get("contract") || "";
  const currentTag = searchParams.get("tag") || "";

  return (
    <div className="flex flex-wrap gap-3" role="group" aria-label="Filtres">
      <select
        value={currentCity}
        onChange={(e) => updateFilter("city", e.target.value)}
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        aria-label="Filtrer par ville"
      >
        <option value="">Toutes les villes</option>
        {cities.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.city}
          </option>
        ))}
      </select>

      <select
        value={currentCompany}
        onChange={(e) => updateFilter("company", e.target.value)}
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        aria-label="Filtrer par entreprise"
      >
        <option value="">Toutes les entreprises</option>
        {companies.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={currentContract}
        onChange={(e) => updateFilter("contract", e.target.value)}
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        aria-label="Filtrer par type de contrat"
      >
        <option value="">Tous les contrats</option>
        {contractTypes.map((ct) => (
          <option key={ct} value={ct}>
            {ct}
          </option>
        ))}
      </select>

      {tags.length > 0 && (
        <select
          value={currentTag}
          onChange={(e) => updateFilter("tag", e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          aria-label="Filtrer par secteur"
        >
          <option value="">Tous les secteurs</option>
          {tags.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
