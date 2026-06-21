"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function PremiumHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-navy/90 backdrop-blur-2xl pt-[env(safe-area-inset-top)]">
      <div className="container-xl flex h-14 items-center justify-between sm:h-16 lg:h-20">
        <Link href="/" className="group flex items-center gap-2.5 sm:gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-mint text-xs font-bold text-navy transition-transform group-hover:scale-105 sm:h-9 sm:w-9 sm:rounded-2xl sm:text-sm">
            LT
          </span>
          <span className="text-base font-bold tracking-tight text-white sm:text-lg">
            Letravail<span className="text-mint">.ma</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation">
          <Link href="/emplois" className="btn-ghost !rounded-2xl !py-2.5">Offres</Link>
          <Link href="/salaires" className="btn-ghost !rounded-2xl !py-2.5">Salaires</Link>
          <Link href="/a-propos" className="btn-ghost !rounded-2xl !py-2.5">À propos</Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/emplois" className="btn-mint !px-6 !py-3 !text-sm">
            Explorer les offres
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 md:hidden"
          aria-label="Menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open ? (
              <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/5 bg-navy-900/98 p-4 shadow-2xl md:hidden">
          <div className="flex flex-col gap-1">
            <Link href="/emplois" className="rounded-2xl px-4 py-3.5 text-base font-medium text-white hover:bg-white/5" onClick={() => setOpen(false)}>Offres</Link>
            <Link href="/salaires" className="rounded-2xl px-4 py-3.5 text-base font-medium text-white hover:bg-white/5" onClick={() => setOpen(false)}>Salaires</Link>
            <Link href="/a-propos" className="rounded-2xl px-4 py-3.5 text-base font-medium text-white hover:bg-white/5" onClick={() => setOpen(false)}>À propos</Link>
            <Link href="/emplois" className="btn-mint mt-3 w-full text-center" onClick={() => setOpen(false)}>Explorer les offres</Link>
          </div>
        </nav>
      )}
    </header>
  );
}

export function MobileBottomNav() {
  const items = [
    { href: "/", label: "Accueil", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/emplois", label: "Recherche", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
    { href: "/emplois", label: "Favoris", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
    { href: "/emplois", label: "Entreprises", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { href: "/a-propos", label: "Profil", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-navy/95 backdrop-blur-2xl lg:hidden" aria-label="Navigation mobile">
      <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-medium text-slate-muted transition-colors hover:text-mint"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function AiAssistant() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 sm:right-5 lg:bottom-8">
      {expanded && (
        <div className="mb-4 w-72 animate-fade-up rounded-3xl border border-white/10 bg-navy-800/95 p-5 shadow-glass backdrop-blur-2xl">
          <p className="text-sm font-semibold text-white">Assistant Carrière IA</p>
          <p className="mt-1 text-xs text-slate-muted">Bientôt disponible</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-text">
            <li className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">✨ Revue de CV</li>
            <li className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">📝 Lettre de motivation</li>
            <li className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">💰 Conseils salaire</li>
            <li className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">🎯 Préparation entretien</li>
          </ul>
        </div>
      )}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full bg-mint text-navy shadow-glow-lg transition-transform hover:scale-105",
          expanded && "rotate-45"
        )}
        aria-label="Assistant IA"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
