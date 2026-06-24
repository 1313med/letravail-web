"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { buildChips } from "./active-filter-utils";

interface ActiveFiltersBarProps {
  basePath: string;
  tags: { name: string; slug: string }[];
  hideCity?: boolean;
}

export function ActiveFiltersBar({ basePath, tags, hideCity }: ActiveFiltersBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chips = buildChips(searchParams, tags, hideCity);

  if (chips.length === 0) return null;

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  function clearAll() {
    router.push(basePath);
  }

  return (
    <div
      className="border-b border-mint/15 bg-mint/[0.06]"
      role="region"
      aria-label="Filtres actifs"
      aria-live="polite"
    >
      <div className="container-xl py-2">
        <div className="flex items-center gap-2">
          <span className="hidden shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-mint/80 sm:flex">
            <Filter className="h-3 w-3" />
            Filtres
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto overscroll-x-contain py-0.5 scrollbar-none">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => removeFilter(chip.key)}
                  className={cn(
                    "inline-flex min-h-[34px] shrink-0 items-center gap-1.5 rounded-full",
                    "border border-mint/30 bg-mint/12 px-3 py-1",
                    "text-xs font-semibold text-mint-glow",
                    "transition-colors hover:bg-mint/20 active:bg-mint/25"
                  )}
                >
                  {chip.label}
                  <X className="h-3 w-3 opacity-80" aria-hidden />
                  <span className="sr-only">Retirer {chip.label}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="shrink-0 min-h-[34px] whitespace-nowrap px-1 text-xs font-bold text-slate-dim transition-colors hover:text-mint"
            >
              Effacer tout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
