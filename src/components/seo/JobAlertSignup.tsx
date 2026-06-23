"use client";

import { useState } from "react";
import { Bell, Loader2, CheckCircle2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface JobAlertSignupProps {
  citySlug?: string;
  sectorSlug?: string;
  label?: string;
  variant?: "dark" | "light";
}

export function JobAlertSignup({
  citySlug,
  sectorSlug,
  label = "Recevez les nouvelles offres par email",
  variant = "dark",
}: JobAlertSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, citySlug, sectorSlug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setStatus("success");
      setMessage("Inscription confirmée — à bientôt dans votre boîte mail.");
      trackEvent("alert_signup", { city_slug: citySlug, sector_slug: sectorSlug });
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  }

  const isLight = variant === "light";

  return (
    <div
      className={
        isLight
          ? "rounded-[1.75rem] border border-navy/8 bg-white p-8 shadow-[0_12px_48px_rgba(6,23,47,0.08)]"
          : "overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl"
      }
    >
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isLight ? "bg-emerald-50" : "bg-mint/10"}`}>
          <Bell className={`h-5 w-5 ${isLight ? "text-emerald-600" : "text-mint"}`} />
        </span>
        <div>
          <p className={`text-lg font-bold ${isLight ? "text-navy" : "text-white"}`}>{label}</p>
          <p className={`text-sm ${isLight ? "text-navy/45" : "text-slate-muted"}`}>
            Gratuit · Désinscription en un clic
          </p>
        </div>
      </div>

      {status === "success" ? (
        <p className="mt-6 flex items-center gap-2 text-sm font-medium text-emerald-500">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            className={
              isLight
                ? "flex-1 rounded-2xl border border-navy/10 bg-slate-50 px-5 py-3.5 text-sm text-navy placeholder:text-navy/30 focus:border-emerald-400 focus:outline-none"
                : "flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white placeholder:text-slate-dim focus:border-mint/40 focus:outline-none"
            }
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-mint shrink-0 !px-6"
          >
            {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "S'inscrire"}
          </button>
        </form>
      )}
      {status === "error" && <p className="mt-3 text-sm text-red-400">{message}</p>}
    </div>
  );
}
