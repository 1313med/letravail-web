"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function RecruiterInquiryForm() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/recruteurs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setStatus("success");
      trackEvent("recruiter_inquiry", { company: form.company });
      setForm({ name: "", company: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  }

  if (status === "success") {
    return (
      <div className="card-glass p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-mint" />
        <p className="mt-4 text-lg font-bold text-white">Demande envoyée</p>
        <p className="mt-2 text-slate-muted">Notre équipe vous contactera sous 24–48h ouvrées.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-glass space-y-5 p-8 sm:p-10">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-dim">Nom</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-mint/40 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-dim">Entreprise</label>
          <input
            required
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-mint/40 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-dim">Email professionnel</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-mint/40 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-dim">Message</label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Nombre de postes, secteur, budget..."
          className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-dim focus:border-mint/40 focus:outline-none"
        />
      </div>
      {status === "error" && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={status === "loading"} className="btn-mint flex w-full items-center justify-center gap-2">
        {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Envoyer ma demande
      </button>
    </form>
  );
}
