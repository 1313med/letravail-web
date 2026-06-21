import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Briefcase } from "lucide-react";
import { JobListItem } from "@/lib/queries";
import { getCompanyLogo } from "@/lib/company-logos";
import { getAvatarGradient, getInitials } from "@/lib/gradients";
import { cn } from "@/lib/cn";

interface JobCompanyProfileProps {
  company: string;
  companySlug?: string;
  city: string;
  industry: string;
  rating: number;
  topEmployer: boolean;
  employees: string;
  otherJobs: JobListItem[];
}

export function JobCompanyProfile({
  company, companySlug, city, industry, rating, topEmployer, employees, otherJobs,
}: JobCompanyProfileProps) {
  const logo = companySlug ? getCompanyLogo(companySlug) : undefined;

  return (
    <section className="mb-8 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:mb-14 sm:rounded-[1.75rem] sm:p-8">
      <p className="section-label text-[10px] sm:text-xs">L&apos;entreprise</p>
      <h2 className="mt-1.5 text-lg font-extrabold text-white sm:mt-3 sm:text-3xl">À propos de {company}</h2>

      <div className="mt-4 flex items-start gap-3 sm:mt-8 sm:gap-6">
        {logo ? (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-2 sm:h-20 sm:w-20 sm:rounded-2xl sm:p-3">
            <Image src={logo.logo} alt={company} width={72} height={36} className="h-auto max-h-full w-auto object-contain" unoptimized />
          </span>
        ) : (
          <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-base font-bold text-white sm:h-20 sm:w-20 sm:rounded-2xl sm:text-2xl", getAvatarGradient(company))}>
            {getInitials(company)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          {companySlug ? (
            <Link href={`/entreprise/${companySlug}`} className="text-base font-bold text-white hover:text-mint sm:text-2xl">{company}</Link>
          ) : (
            <p className="text-base font-bold text-white sm:text-2xl">{company}</p>
          )}
          <p className="text-xs text-slate-muted sm:text-base">{industry}</p>
          <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
            {topEmployer && <span className="badge-mint !text-[10px] sm:!text-xs">Top employeur</span>}
            <span className="flex items-center gap-1 badge-navy !text-[10px] sm:!text-xs"><Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400 sm:h-3 sm:w-3" />{rating}/5</span>
            <span className="badge-navy !text-[10px] sm:!text-xs">{employees}</span>
            <span className="hidden items-center gap-1 badge-navy sm:flex"><MapPin className="h-3 w-3 text-mint" />{city}</span>
          </div>
          <p className="mt-2 hidden text-[15px] leading-relaxed text-slate-text sm:mt-5 sm:block">
            {company} recrute au Maroc via Letravail.ma. Découvrez l&apos;ensemble des opportunités et postulez en quelques clics.
          </p>
        </div>
      </div>

      {otherJobs.length > 0 && (
        <div className="mt-4 border-t border-white/8 pt-4 sm:mt-8 sm:pt-8">
          <p className="flex items-center gap-1.5 text-xs font-bold text-white sm:gap-2 sm:text-sm">
            <Briefcase className="h-3.5 w-3.5 text-mint sm:h-4 sm:w-4" /> Autres offres
          </p>
          <ul className="mt-2 space-y-0.5 sm:mt-4 sm:space-y-2">
            {otherJobs.slice(0, 4).map((j) => (
              <li key={j.id}>
                <Link href={`/emploi/${j.slug}`} className="group flex items-center justify-between gap-2 rounded-lg px-2 py-2 transition-all hover:bg-white/[0.04] sm:rounded-xl sm:px-3 sm:py-2.5">
                  <span className="truncate text-sm font-medium text-slate-text group-hover:text-mint">{j.title}</span>
                  <span className="shrink-0 text-[10px] text-slate-dim sm:text-xs">{j.city}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
