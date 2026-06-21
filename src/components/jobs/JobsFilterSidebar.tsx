"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import {
  DISCOVERY_CONTRACT_TYPES,
  DISCOVERY_REMOTE_OPTIONS,
  DISCOVERY_SECTORS,
  DISCOVERY_EXPERIENCE_LEVELS,
  DISCOVERY_CITIES,
  SALARY_SLIDER,
} from "@/lib/jobs-discovery";

interface JobsFilterSidebarProps {
  basePath: string;
  tags: { name: string; slug: string; _count: { jobs: number } }[];
  hideCity?: boolean;
  className?: string;
  onFilterChange?: () => void;
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-white/8 pb-5 last:border-0 last:pb-0">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">{title}</p>
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all",
        active
          ? "bg-mint/15 text-mint-glow ring-1 ring-mint/30"
          : "text-slate-text hover:bg-white/5 hover:text-white"
      )}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span className={cn("text-xs tabular-nums", active ? "text-mint/70" : "text-slate-dim")}>{count}</span>
      )}
    </motion.button>
  );
}

export function JobsFilterSidebar({
  basePath,
  tags,
  hideCity = false,
  className,
  onFilterChange,
}: JobsFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const active = {
    contract: searchParams.get("contract") || "",
    remote: searchParams.get("remote") || "",
    city: searchParams.get("city") || "",
    tag: searchParams.get("tag") || "",
    experience: searchParams.get("experience") || "",
    minSalary: parseInt(searchParams.get("minSalary") || "0", 10),
  };

  function setFilter(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
    onFilterChange?.();
  }

  function toggleFilter(key: string, value: string, current: string) {
    setFilter(key, current === value ? undefined : value);
  }

  const sectorOptions = tags.length > 0
    ? tags.slice(0, 8).map((t) => ({ slug: t.slug, label: t.name, count: t._count.jobs }))
    : DISCOVERY_SECTORS.map((s) => ({ slug: s.slug, label: s.label }));

  return (
    <aside className={cn("rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl sm:p-6", className)}>
      <p className="mb-5 text-sm font-bold text-white">Affiner la recherche</p>
      <div className="space-y-5">
        <FilterSection title="Type de contrat">
          <div className="space-y-1">
            <Pill active={!active.contract} onClick={() => setFilter("contract", undefined)}>Tous</Pill>
            {DISCOVERY_CONTRACT_TYPES.map((type) => (
              <Pill key={type} active={active.contract === type} onClick={() => toggleFilter("contract", type, active.contract)}>
                {type}
              </Pill>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Télétravail">
          <div className="space-y-1">
            <Pill active={!active.remote} onClick={() => setFilter("remote", undefined)}>Tous</Pill>
            {DISCOVERY_REMOTE_OPTIONS.map((opt) => (
              <Pill key={opt.value} active={active.remote === opt.value} onClick={() => toggleFilter("remote", opt.value, active.remote)}>
                {opt.label}
              </Pill>
            ))}
          </div>
        </FilterSection>

        {!hideCity && (
          <FilterSection title="Ville">
            <div className="space-y-1">
              <Pill active={!active.city} onClick={() => setFilter("city", undefined)}>Tout le Maroc</Pill>
              {DISCOVERY_CITIES.map((c) => (
                <Pill key={c.slug} active={active.city === c.slug} onClick={() => toggleFilter("city", c.slug, active.city)}>
                  {c.name}
                </Pill>
              ))}
            </div>
          </FilterSection>
        )}

        <FilterSection title="Secteur">
          <div className="space-y-1">
            <Pill active={!active.tag} onClick={() => setFilter("tag", undefined)}>Tous</Pill>
            {sectorOptions.map((s) => (
              <Pill
                key={s.slug}
                active={active.tag === s.slug}
                onClick={() => toggleFilter("tag", s.slug, active.tag)}
                count={"count" in s ? s.count : undefined}
              >
                {s.label}
              </Pill>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Salaire minimum">
          <div className="px-1">
            <input
              type="range"
              min={SALARY_SLIDER.min}
              max={SALARY_SLIDER.max}
              step={SALARY_SLIDER.step}
              value={active.minSalary || SALARY_SLIDER.min}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setFilter("minSalary", v > SALARY_SLIDER.min ? String(v) : undefined);
              }}
              className="jobs-salary-slider w-full"
            />
            <div className="mt-2 flex justify-between text-xs text-slate-dim">
              <span>{(SALARY_SLIDER.min / 1000).toFixed(0)}k</span>
              <span className="font-semibold text-mint-glow">
                {active.minSalary > SALARY_SLIDER.min
                  ? `${(active.minSalary / 1000).toFixed(0)}k+ MAD`
                  : "Tous"}
              </span>
              <span>{(SALARY_SLIDER.max / 1000).toFixed(0)}k</span>
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Expérience">
          <div className="flex flex-wrap gap-2">
            {DISCOVERY_EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => toggleFilter("experience", level.value, active.experience)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                  active.experience === level.value
                    ? "bg-mint/15 text-mint-glow ring-1 ring-mint/30"
                    : "bg-white/5 text-slate-muted hover:bg-white/10 hover:text-white"
                )}
              >
                {level.label}
              </button>
            ))}
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}
