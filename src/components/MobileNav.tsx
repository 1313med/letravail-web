"use client";

import Link from "next/link";
import { useState } from "react";

interface MobileNavProps {
  cities: { city: string; slug: string }[];
}

export function MobileNav({ cities }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-foreground shadow-sm transition-colors hover:bg-surface"
        aria-expanded={open}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav
            className="fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-border bg-white p-4 shadow-xl animate-fade-up"
            aria-label="Menu mobile"
          >
            <div className="space-y-1">
              <Link
                href="/emplois"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
              >
                <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .106-.08c1.067-.77 1.688-2.006 1.688-3.35V6.75a2.25 2.25 0 0 0-2.25-2.25h-13.5A2.25 2.25 0 0 0 3.75 6.75v3.97c0 1.344.62 2.58 1.688 3.35.033.025.068.05.106.08" />
                </svg>
                Toutes les offres
              </Link>
            </div>

            <p className="mt-4 px-4 text-xs font-bold uppercase tracking-wider text-muted-light">
              Villes populaires
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {cities.slice(0, 8).map((c) => (
                <Link
                  key={c.slug}
                  href={`/emplois/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-border-light bg-surface px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent/30 hover:bg-white"
                >
                  {c.city}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
