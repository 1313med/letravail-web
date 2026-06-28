"use client";

import { useState, useEffect } from "react";
import { Bell, X, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import type { SearchScopeLabels } from "./active-filter-utils";

const ALERTS_KEY = "letravail-job-alerts";

export interface SavedJobAlert {
  id: string;
  createdAt: string;
  email?: string;
  searchParams: Record<string, string | undefined>;
  label: string;
}

function buildAlertLabel(
  scope: SearchScopeLabels,
  searchParams: Record<string, string | undefined>
): string {
  const parts: string[] = [];
  if (searchParams.q) parts.push(searchParams.q);
  const scopeParts = scope.parts.filter(
    (p) => p !== "Maroc" && p !== "Tous contrats" && p !== "Tous salaires"
  );
  parts.push(...scopeParts);
  return parts.length > 0 ? parts.join(" · ") : "Toutes les offres au Maroc";
}

function searchParamsKey(params: Record<string, string | undefined>): string {
  const clean = { ...params };
  delete clean.page;
  return JSON.stringify(clean);
}

function saveAlertLocally(alert: SavedJobAlert) {
  try {
    const raw = JSON.parse(localStorage.getItem(ALERTS_KEY) || "[]");
    const list: SavedJobAlert[] = Array.isArray(raw) ? raw : [];
    const key = searchParamsKey(alert.searchParams);
    const filtered = list.filter((a) => searchParamsKey(a.searchParams) !== key);
    filtered.unshift(alert);
    localStorage.setItem(ALERTS_KEY, JSON.stringify(filtered.slice(0, 20)));
  } catch {
    /* ignore */
  }
}

function hasAlertForSearch(params: Record<string, string | undefined>): boolean {
  try {
    const raw = JSON.parse(localStorage.getItem(ALERTS_KEY) || "[]");
    const list: SavedJobAlert[] = Array.isArray(raw) ? raw : [];
    const key = searchParamsKey(params);
    return list.some((a) => searchParamsKey(a.searchParams) === key);
  } catch {
    return false;
  }
}

interface JobSearchAlertProps {
  searchParams: Record<string, string | undefined>;
  scope: SearchScopeLabels;
  className?: string;
}

export function JobSearchAlert({ searchParams, scope, className }: JobSearchAlertProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const label = buildAlertLabel(scope, searchParams);

  useEffect(() => {
    setIsActive(hasAlertForSearch(searchParams));
  }, [searchParams]);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 4000);
    return () => clearTimeout(t);
  }, [showToast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    const alert: SavedJobAlert = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      email: email.trim(),
      searchParams: { ...searchParams, page: undefined },
      label,
    };

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          citySlug: searchParams.city,
          sectorSlug: searchParams.tag,
          searchQuery: searchParams.q,
          contract: searchParams.contract,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");

      saveAlertLocally(alert);
      trackEvent("job_search_alert", {
        query: searchParams.q,
        city: searchParams.city,
        contract: searchParams.contract,
      });
      setStatus("success");
      setMessage("Alerte créée — vous recevrez les nouvelles offres correspondantes.");
      setIsActive(true);
      setShowToast(true);
      setEmail("");
      setTimeout(() => setOpen(false), 2200);
    } catch {
      saveAlertLocally({ ...alert, email: undefined });
      setStatus("success");
      setMessage("Alerte enregistrée — notification email bientôt disponible.");
      setIsActive(true);
      setShowToast(true);
      setEmail("");
      setTimeout(() => setOpen(false), 2200);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStatus("idle");
          setOpen(true);
        }}
        className={cn(
          "inline-flex min-h-[40px] items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors",
          isActive
            ? "border-mint/30 bg-mint/12 text-mint-glow"
            : "border-white/10 bg-white/[0.04] text-slate-text hover:border-mint/25 hover:text-mint",
          className
        )}
      >
        {isActive ? (
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <Bell className="h-3.5 w-3.5 shrink-0 text-mint" />
        )}
        <span className="hidden sm:inline">
          {isActive ? "Alerte active" : "Créer une alerte emploi"}
        </span>
        <span className="sm:hidden">{isActive ? "Active" : "Alerte"}</span>
      </button>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 right-4 z-50 mx-auto flex max-w-sm items-center gap-2 rounded-xl border border-mint/25 bg-navy/95 px-4 py-3 text-sm font-semibold text-mint-glow shadow-glass backdrop-blur-xl sm:left-auto sm:right-6"
            role="status"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Alerte créée
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-navy/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="fixed inset-x-4 top-[15%] z-50 mx-auto max-w-md rounded-2xl border border-white/10 bg-navy p-5 shadow-2xl sm:inset-x-auto"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-white">Créer une alerte emploi</p>
                  <p className="mt-1 text-sm text-slate-muted">Soyez notifié des nouvelles offres</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-mint/15 bg-mint/5 px-3 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-mint/70">
                  Recherche sauvegardée
                </p>
                <p className="mt-1 text-sm font-medium text-white">{label}</p>
                <p className="mt-1 text-xs text-slate-dim">{scope.parts.join(" · ")}</p>
              </div>

              {status === "success" ? (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-mint/20 bg-mint/10 px-4 py-3 text-sm font-semibold text-mint-glow">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  {message}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-dim focus:border-mint/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="btn-mint flex w-full items-center justify-center gap-2 !py-3"
                  >
                    {status === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Bell className="h-4 w-4" />
                        Activer l&apos;alerte
                      </>
                    )}
                  </button>
                </form>
              )}
              {status === "error" && <p className="mt-2 text-sm text-red-400">{message}</p>}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function getSavedJobAlerts(): SavedJobAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(ALERTS_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}
