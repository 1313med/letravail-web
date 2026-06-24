"use client";

import { buildSearchScope } from "./active-filter-utils";
import { JobSearchAlert } from "./JobSearchAlert";

interface JobsResultsContextProps {
  total: number;
  searchParams: Record<string, string | undefined>;
  tags: { name: string; slug: string }[];
  cities: { city: string; slug: string }[];
  hideCityFilter?: boolean;
  fixedCity?: string;
}

export function JobsResultsContext({
  total,
  searchParams,
  tags,
  cities,
  hideCityFilter,
  fixedCity,
}: JobsResultsContextProps) {
  const scope = buildSearchScope(searchParams, cities, tags, {
    hideCity: hideCityFilter,
    fixedCity,
  });

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[1.35rem] font-extrabold tabular-nums leading-none tracking-tight text-white sm:text-2xl">
            {total.toLocaleString("fr-MA")}
          </span>
          <span className="text-sm font-semibold text-slate-muted">
            {total === 1 ? "offre" : "offres"}
          </span>
        </p>
        <p className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-1 text-[12px] leading-snug text-slate-muted sm:text-[13px]">
          {scope.parts.map((part, i) => (
            <span key={`${part}-${i}`} className="inline-flex items-center gap-1">
              {i > 0 && <span className="text-slate-dim" aria-hidden>•</span>}
              <span className={i === 0 ? "font-semibold text-slate-text" : undefined}>{part}</span>
            </span>
          ))}
          {scope.query && (
            <span className="inline-flex items-center gap-1">
              <span className="text-slate-dim" aria-hidden>•</span>
              <span className="truncate text-mint-glow">« {scope.query} »</span>
            </span>
          )}
        </p>
      </div>
      <JobSearchAlert searchParams={searchParams} scope={scope} className="shrink-0 self-start sm:self-center" />
    </div>
  );
}
