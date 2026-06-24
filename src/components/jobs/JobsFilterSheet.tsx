"use client";

import { useState, useEffect, useCallback } from "react";
import {
  SlidersHorizontal,
  X,
  Briefcase,
  MapPin,
  Banknote,
  Wifi,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { JobsFilterSidebar } from "./JobsFilterSidebar";
import { cn } from "@/lib/cn";

const SIDEBAR_COLLAPSED_KEY = "letravail-jobs-sidebar-collapsed";

interface JobsFilterSheetProps {
  basePath: string;
  tags: { name: string; slug: string; _count: { jobs: number } }[];
  hideCity?: boolean;
  open: boolean;
  onClose: () => void;
}

export function JobsFilterSheet({
  basePath,
  tags,
  hideCity,
  open,
  onClose,
}: JobsFilterSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-navy/75 backdrop-blur-sm xl:hidden"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[2rem] border-t border-white/10 bg-navy pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl xl:hidden"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/8 bg-navy/95 px-5 py-4 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white">Filtres</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <JobsFilterSidebar
                basePath={basePath}
                tags={tags}
                hideCity={hideCity}
                onFilterChange={onClose}
                className="border-0 bg-transparent p-0 backdrop-blur-none"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface FilterTriggerButtonProps {
  onClick: () => void;
  activeCount: number;
  className?: string;
}

export function FilterTriggerButton({ onClick, activeCount, className }: FilterTriggerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-white transition-colors hover:border-mint/25 hover:bg-mint/10 xl:hidden",
        className
      )}
      aria-label="Ouvrir les filtres"
    >
      <SlidersHorizontal className="h-4 w-4 text-mint" />
      {activeCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-mint px-1 text-[10px] font-bold text-navy">
          {activeCount}
        </span>
      )}
    </button>
  );
}

const RAIL_ICONS = [
  { icon: Briefcase, label: "Type de contrat" },
  { icon: Wifi, label: "Télétravail" },
  { icon: MapPin, label: "Ville" },
  { icon: Banknote, label: "Salaire" },
  { icon: GraduationCap, label: "Expérience" },
  { icon: Layers, label: "Secteur" },
] as const;

function FilterRailButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Briefcase;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-muted transition-colors hover:bg-white/5 hover:text-mint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-mint"
      aria-label={`Filtrer par ${label}`}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

interface CollapsibleFilterSidebarProps {
  basePath: string;
  tags: { name: string; slug: string; _count: { jobs: number } }[];
  hideCity?: boolean;
}

export function CollapsibleFilterSidebar({
  basePath,
  tags,
  hideCity,
}: CollapsibleFilterSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (stored === "true") setCollapsed(true);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  if (!hydrated) {
    return <div className="hidden w-[240px] shrink-0 xl:block" />;
  }

  return (
    <div
      className={cn(
        "hidden shrink-0 transition-[width] duration-300 ease-out xl:block",
        collapsed ? "w-14" : "w-[240px]"
      )}
    >
      <div className="sticky top-28">
        <button
          type="button"
          onClick={toggleCollapsed}
          className={cn(
            "mb-2 flex w-full items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] py-2 text-slate-muted transition-colors hover:border-mint/20 hover:text-mint",
            collapsed ? "px-0" : "px-3"
          )}
          aria-label={collapsed ? "Développer les filtres" : "Réduire les filtres"}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="ml-2 text-xs font-semibold">Réduire</span>
            </>
          )}
        </button>

        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.div
              key="rail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] py-2"
            >
              {(hideCity ? RAIL_ICONS.filter((r) => r.label !== "Ville") : RAIL_ICONS).map(
                ({ icon, label }) => (
                  <FilterRailButton key={label} icon={icon} label={label} onClick={toggleCollapsed} />
                )
              )}
            </motion.div>
          ) : (
            <motion.div
              key="sidebar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <JobsFilterSidebar basePath={basePath} tags={tags} hideCity={hideCity} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
