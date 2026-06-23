"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Bookmark,
  ArrowUpRight,
  Sparkles,
  Clock,
  Building2,
} from "lucide-react";
import { JobListItem } from "@/lib/queries";
import { getCompanyLogo } from "@/lib/company-logos";
import { getAvatarGradient, getInitials } from "@/lib/gradients";
import { TOP_EMPLOYER_SLUGS } from "@/lib/jobs-discovery";
import { MagneticWrap, TiltCard } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { excerpt, formatRelativeDate, isNewJob } from "@/lib/utils";

const SAVED_KEY = "letravail-saved-jobs";

export function useSavedJobs() {
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
      if (Array.isArray(raw)) setSaved(new Set(raw));
    } catch { /* ignore */ }
  }, []);

  function toggle(slug: string) {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      localStorage.setItem(SAVED_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }

  return { saved, toggle };
}

function CompanyLogo({ job, size = "md" }: { job: JobListItem; size?: "sm" | "md" | "lg" }) {
  const logo = job.companyRef?.slug ? getCompanyLogo(job.companyRef.slug) : undefined;
  const dims = size === "lg" ? "h-16 w-16 rounded-2xl" : size === "md" ? "h-12 w-12 rounded-2xl" : "h-10 w-10 rounded-xl";
  const imgSize = size === "lg" ? 64 : size === "md" ? 48 : 40;

  if (logo) {
    return (
      <span className={cn("relative flex shrink-0 items-center justify-center overflow-hidden bg-white p-1.5", dims)}>
        <Image src={logo.logo} alt={logo.name} width={imgSize} height={imgSize / 2} className="h-auto max-h-full w-auto object-contain" unoptimized />
      </span>
    );
  }

  return (
    <span className={cn("flex shrink-0 items-center justify-center bg-gradient-to-br text-sm font-bold text-white", dims, getAvatarGradient(job.company))}>
      {getInitials(job.company)}
    </span>
  );
}

function SaveButton({ slug, saved, onToggle, className }: { slug: string; saved: Set<string>; onToggle: (s: string) => void; className?: string }) {
  const isSaved = saved.has(slug);
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(slug); }}
      className={cn(
        "rounded-xl p-2.5 transition-all",
        isSaved ? "bg-mint/15 text-mint" : "text-slate-dim hover:bg-white/5 hover:text-mint",
        className
      )}
      aria-label={isSaved ? "Retirer des favoris" : "Sauvegarder"}
    >
      <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
    </button>
  );
}

function JobBadges({ job }: { job: JobListItem }) {
  const isTop = job.companyRef?.slug && TOP_EMPLOYER_SLUGS.has(job.companyRef.slug);
  return (
    <div className="flex flex-wrap gap-2">
      {job.contractType && <span className="badge-mint">{job.contractType}</span>}
      {job.remote && <span className="badge-navy">Remote</span>}
      {isNewJob(job.createdAt) && <span className="badge-mint">Nouveau</span>}
      {isTop && <span className="inline-flex items-center rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300 ring-1 ring-amber-400/25">Top employeur</span>}
    </div>
  );
}

function SkillTags({ job }: { job: JobListItem }) {
  if (job.tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {job.tags.slice(0, 4).map((t) => (
        <span key={t.slug} className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-muted ring-1 ring-white/8">
          {t.name}
        </span>
      ))}
    </div>
  );
}

interface CardProps {
  job: JobListItem;
  saved: Set<string>;
  onToggleSave: (slug: string) => void;
}

export function FeaturedJobCard({ job, saved, onToggleSave }: CardProps) {
  const date = job.publishedAt || job.createdAt;
  const why = job.remote
    ? "Télétravail possible — idéal pour plus de flexibilité."
    : job.salary
      ? "Salaire affiché — transparence rare sur le marché marocain."
      : "Entreprise reconnue avec opportunités de carrière.";

  return (
    <TiltCard>
      <article className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-navy-700/90 to-navy-800/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-shadow hover:shadow-glow sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-mint/10 blur-[80px] transition-opacity group-hover:opacity-100" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mint/50 to-transparent" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-1 gap-5">
            <CompanyLogo job={job} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-mint/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-mint-glow">À la une</span>
              </div>
              <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white transition-colors group-hover:text-mint sm:text-3xl lg:text-4xl">
                <Link href={`/emploi/${job.slug}`}>{job.title}</Link>
              </h2>
              <p className="mt-2 text-lg text-white/70">
                {job.companyRef?.slug ? (
                  <Link href={`/entreprise/${job.companyRef.slug}`} className="hover:text-mint">{job.company}</Link>
                ) : job.company}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-text">
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-mint" />{job.city}</span>
                {job.salary && <span className="font-semibold text-mint-glow">{job.salary}</span>}
                <span className="flex items-center gap-1.5 text-slate-dim"><Clock className="h-3.5 w-3.5" />{formatRelativeDate(date)}</span>
              </div>
              <div className="mt-4"><JobBadges job={job} /></div>
              <p className="mt-5 line-clamp-2 text-base text-slate-muted">{excerpt(job.description, 180)}</p>
              <div className="mt-5"><SkillTags job={job} /></div>
            </div>
          </div>
          <SaveButton slug={job.slug} saved={saved} onToggle={onToggleSave} className="absolute right-0 top-0 lg:relative" />
        </div>

        <div className="relative mt-8 rounded-2xl border border-mint/15 bg-mint/5 p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint/70">Pourquoi ce poste ?</p>
          <p className="mt-2 text-sm text-slate-text">{why}</p>
        </div>

        <div className="relative mt-6 flex flex-col gap-3 sm:flex-row">
          <MagneticWrap className="flex-1">
            <Link href={`/emploi/${job.slug}`} className="btn-mint flex w-full items-center justify-center gap-2 !py-4">
              Postuler <ArrowUpRight className="h-4 w-4" />
            </Link>
          </MagneticWrap>
          <button type="button" onClick={() => onToggleSave(job.slug)} className="btn-ghost flex items-center justify-center gap-2 !py-4 sm:!px-8">
            <Bookmark className={cn("h-4 w-4", saved.has(job.slug) && "fill-current text-mint")} />
            {saved.has(job.slug) ? "Sauvegardé" : "Sauvegarder"}
          </button>
        </div>
      </article>
    </TiltCard>
  );
}

export function HorizontalJobCard({ job, saved, onToggleSave }: CardProps) {
  const date = job.publishedAt || job.createdAt;
  return (
    <TiltCard>
      <Link href={`/emploi/${job.slug}`} className="group flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition-all hover:border-mint/25 hover:bg-white/[0.07] hover:shadow-glow sm:flex-row sm:items-center sm:p-6">
        <CompanyLogo job={job} />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-white group-hover:text-mint sm:text-xl">{job.title}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-muted">
            <Building2 className="h-3.5 w-3.5" />{job.company} · {job.city}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <JobBadges job={job} />
            {job.salary && <span className="text-sm font-semibold text-mint-glow">{job.salary}</span>}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <time className="text-xs text-slate-dim">{formatRelativeDate(date)}</time>
          <SaveButton slug={job.slug} saved={saved} onToggle={onToggleSave} />
        </div>
      </Link>
    </TiltCard>
  );
}

export function CompactJobCard({ job, saved, onToggleSave, large }: CardProps & { large?: boolean }) {
  const date = job.publishedAt || job.createdAt;
  return (
    <TiltCard>
      <article className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl transition-all hover:border-mint/20 hover:shadow-glow",
        large ? "p-7 sm:p-8" : "p-5 sm:p-6"
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <CompanyLogo job={job} size={large ? "md" : "sm"} />
            <div>
              <h3 className={cn("font-bold leading-snug text-white group-hover:text-mint", large ? "text-xl" : "text-base")}>
                <Link href={`/emploi/${job.slug}`}>{job.title}</Link>
              </h3>
              <p className="mt-1 text-sm text-slate-muted">{job.company}</p>
            </div>
          </div>
          <SaveButton slug={job.slug} saved={saved} onToggle={onToggleSave} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="flex items-center gap-1 text-slate-text"><MapPin className="h-3.5 w-3.5 text-mint" />{job.city}</span>
          {job.salary && <span className="text-mint-glow">{job.salary}</span>}
        </div>
        <div className="mt-3"><JobBadges job={job} /></div>
        {!large && <p className="mt-3 line-clamp-2 text-sm text-slate-dim">{excerpt(job.description, 90)}</p>}
        {large && <p className="mt-4 line-clamp-3 text-sm text-slate-muted">{excerpt(job.description, 140)}</p>}
        {large && <div className="mt-4"><SkillTags job={job} /></div>}
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
          <time className="text-xs text-slate-dim">{formatRelativeDate(date)}</time>
          <Link href={`/emploi/${job.slug}`} className="flex items-center gap-1 text-xs font-semibold text-mint opacity-0 transition-opacity group-hover:opacity-100">
            Voir <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>
    </TiltCard>
  );
}

export function AiPromptCard() {
  const prompts = [
    { icon: Sparkles, text: "Analyse mon CV" },
    { icon: Sparkles, text: "Prépare-moi pour un entretien" },
    { icon: Sparkles, text: "Rédige une lettre de motivation" },
    { icon: Sparkles, text: "Quel salaire demander ?" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-navy-700/80 to-navy-800/60 p-5 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-mint/15">
          <Sparkles className="h-4 w-4 text-mint" />
        </span>
        <div>
          <p className="text-sm font-bold text-white">Assistant Carrière IA</p>
          <p className="text-[11px] text-slate-dim">Bientôt disponible</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {prompts.map((p) => (
          <button
            key={p.text}
            type="button"
            className="flex w-full items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-left text-xs text-slate-text transition-colors hover:border-mint/25 hover:bg-mint/5 hover:text-white"
          >
            <p.icon className="h-3.5 w-3.5 shrink-0 text-mint" />
            {p.text}
          </button>
        ))}
      </div>
    </div>
  );
}
