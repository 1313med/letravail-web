"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin, Banknote, FileText, Building2, Clock, Star, Share2, Bookmark, Flag, ExternalLink,
} from "lucide-react";
import { getCompanyLogo } from "@/lib/company-logos";
import { getCompanyMeta, getWorkMode } from "@/lib/job-detail";
import { TOP_EMPLOYER_SLUGS } from "@/lib/jobs-discovery";
import { getAvatarGradient, getInitials } from "@/lib/gradients";
import { MagneticWrap } from "@/lib/motion";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { useSavedJobs } from "@/components/jobs/JobCardVariants";
import { trackApplyClick } from "@/lib/analytics";

interface JobApplyCardProps {
  slug: string;
  title: string;
  company: string;
  companySlug?: string;
  applicationUrl: string;
  expiresAt: Date | null;
  expired: boolean;
}

export function JobApplyCard({
  slug, title, company, applicationUrl, expiresAt, expired,
}: JobApplyCardProps) {
  const { saved, toggle } = useSavedJobs();
  const isSaved = saved.has(slug);

  function share() {
    if (navigator.share) {
      navigator.share({ title, text: `${title} chez ${company}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-navy-700/80 to-navy-800/60 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:rounded-[1.75rem]"
    >
      <div className="h-1 bg-gradient-to-r from-mint via-mint-glow to-emerald-300" />
      <div className="p-5 sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mint/70 sm:text-xs">Candidater</p>
        <p className="mt-1.5 text-xs text-slate-muted sm:mt-2 sm:text-sm">Redirection sécurisée vers {company}</p>

        <MagneticWrap className="mt-4 sm:mt-5">
          <a
            href={applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackApplyClick(slug, company)}
            className={cn(
              "btn-mint flex w-full items-center justify-center gap-2 !py-3.5 !text-sm shadow-glow-lg sm:!py-4 sm:!text-base",
              expired && "pointer-events-none opacity-50"
            )}
          >
            Postuler maintenant
            <ExternalLink className="h-4 w-4" />
          </a>
        </MagneticWrap>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4">
          <button
            type="button"
            onClick={() => toggle(slug)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-all sm:gap-2 sm:py-3 sm:text-sm",
              isSaved ? "border-mint/30 bg-mint/10 text-mint" : "border-white/10 bg-white/5 text-slate-text hover:border-mint/20"
            )}
          >
            <Bookmark className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isSaved && "fill-current")} />
            {isSaved ? "Sauvegardé" : "Sauvegarder"}
          </button>
          <button
            type="button"
            onClick={share}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-slate-text transition-all hover:border-mint/20 hover:text-white sm:gap-2 sm:py-3 sm:text-sm"
          >
            <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Partager
          </button>
        </div>

        <div className="mt-4 space-y-2 border-t border-white/8 pt-4 text-xs sm:mt-6 sm:space-y-3 sm:pt-5 sm:text-sm">
          {expiresAt && (
            <div className="flex items-center justify-between">
              <span className="text-slate-dim">Date limite</span>
              <span className="font-medium text-white">{formatDate(expiresAt)}</span>
            </div>
          )}
        </div>

        <button type="button" className="mt-3 flex w-full items-center justify-center gap-1.5 text-[11px] text-slate-dim hover:text-slate-muted sm:mt-4 sm:text-xs">
          <Flag className="h-3 w-3" /> Signaler cette offre
        </button>
      </div>
    </motion.div>
  );
}

interface JobCompanyMiniProps {
  company: string;
  companySlug?: string;
  city: string;
  activeJobs?: number;
}

export function JobCompanyMiniCard({ company, companySlug, city, activeJobs = 1 }: JobCompanyMiniProps) {
  const logo = companySlug ? getCompanyLogo(companySlug) : undefined;
  const meta = getCompanyMeta(companySlug);
  const isTop = companySlug && TOP_EMPLOYER_SLUGS.has(companySlug);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        {logo ? (
          <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-2">
            <Image src={logo.logo} alt={company} width={48} height={24} className="h-auto max-h-full w-auto object-contain" unoptimized />
          </span>
        ) : (
          <span className={cn("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white", getAvatarGradient(company))}>
            {getInitials(company)}
          </span>
        )}
        <div>
          {companySlug ? (
            <Link href={`/entreprise/${companySlug}`} className="text-lg font-bold text-white hover:text-mint">{company}</Link>
          ) : (
            <p className="text-lg font-bold text-white">{company}</p>
          )}
          <p className="text-sm text-slate-muted">{meta.industry}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {isTop && <span className="badge-mint">Top employeur</span>}
        {activeJobs > 0 && (
          <span className="badge-navy">{activeJobs} offre{activeJobs > 1 ? "s" : ""} active{activeJobs > 1 ? "s" : ""}</span>
        )}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-muted">
        <MapPin className="h-3.5 w-3.5 text-mint" />{city}
      </p>
      {companySlug && activeJobs > 0 && (
        <Link href={`/entreprise/${companySlug}`} className="mt-4 block text-sm font-semibold text-mint hover:text-mint-glow">
          {activeJobs} offre{activeJobs > 1 ? "s" : ""} active{activeJobs > 1 ? "s" : ""} →
        </Link>
      )}
    </div>
  );
}

interface JobHeroProps {
  title: string;
  company: string;
  companySlug?: string;
  city: string;
  citySlug?: string;
  salary: string | null;
  contractType: string | null;
  remote: boolean;
  description: string;
  publishedAt: Date | null;
  expired: boolean;
}

export function JobDetailHero({
  title, company, companySlug, city, citySlug, salary, contractType, remote, description, publishedAt, expired,
}: JobHeroProps) {
  const logo = companySlug ? getCompanyLogo(companySlug) : undefined;
  const isTop = companySlug && TOP_EMPLOYER_SLUGS.has(companySlug);
  const workMode = getWorkMode({ remote, description });
  const date = publishedAt;

  const pills = [
    isTop && { icon: Star, label: "Top Employeur", accent: true },
    { icon: MapPin, label: city, href: citySlug ? `/emplois/${citySlug}` : undefined },
    salary && { icon: Banknote, label: salary, accent: true },
    contractType && { icon: FileText, label: contractType },
    { icon: Building2, label: workMode },
    date && { icon: Clock, label: formatRelativeDate(date) },
  ].filter(Boolean) as { icon: typeof Star; label: string; href?: string; accent?: boolean }[];

  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-navy pt-[calc(3.75rem+env(safe-area-inset-top))] sm:pt-28">
      <div className="hero-aurora absolute inset-0 opacity-40 sm:opacity-50" />

      <div className="container-xl relative pb-5 pt-3 sm:pb-14 sm:pt-8">
        {expired && (
          <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200 sm:mb-6 sm:rounded-2xl sm:px-5 sm:py-3 sm:text-sm">
            Cette offre a expiré — consultez les offres similaires ci-dessous.
          </div>
        )}

        {/* Mobile: logo + company row */}
        <div className="mb-3 flex items-center gap-3 sm:mb-0 sm:hidden">
          {logo ? (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5">
              <Image src={logo.logo} alt={company} width={40} height={20} className="h-auto max-h-full w-auto object-contain" unoptimized />
            </span>
          ) : (
            <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white", getAvatarGradient(company))}>
              {getInitials(company)}
            </span>
          )}
          <div className="min-w-0">
            {companySlug ? (
              <Link href={`/entreprise/${companySlug}`} className="block truncate text-sm font-semibold text-slate-text hover:text-mint">{company}</Link>
            ) : (
              <p className="truncate text-sm font-semibold text-slate-text">{company}</p>
            )}
            {isTop && <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold text-amber-300"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Top Employeur</span>}
          </div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[clamp(1.25rem,4.5vw,3.25rem)] font-extrabold leading-[1.08] tracking-[-0.02em] text-white sm:text-[clamp(1.75rem,5vw,3.25rem)] lg:text-[clamp(2.25rem,4vw,3.75rem)]"
        >
          {title}
        </motion.h1>

        {/* Desktop company name */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-3 hidden text-xl font-semibold text-slate-text sm:mt-4 sm:block sm:text-2xl"
        >
          {companySlug ? (
            <Link href={`/entreprise/${companySlug}`} className="hover:text-mint">{company}</Link>
          ) : company}
        </motion.p>

        {/* Pills — horizontal scroll on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:mt-8 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
        >
          {pills.map((pill) => {
            const Icon = pill.icon;
            const inner = (
              <span className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-xl sm:gap-2 sm:px-4 sm:py-2 sm:text-sm",
                pill.accent
                  ? "border-mint/25 bg-mint/10 text-mint-glow"
                  : "border-white/12 bg-white/[0.06] text-slate-text"
              )}>
                <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", pill.accent ? "text-mint" : "text-mint/70")} />
                <span className="max-w-[140px] truncate sm:max-w-none">{pill.label}</span>
              </span>
            );
            return pill.href ? (
              <Link key={pill.label} href={pill.href}>{inner}</Link>
            ) : (
              <span key={pill.label}>{inner}</span>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
