"use client";

import Image from "next/image";
import { MOROCCAN_COMPANY_LOGOS } from "@/lib/company-logos";
import { cn } from "@/lib/cn";

function LogoTrack({
  companies,
  reverse = false,
  slower = false,
}: {
  companies: typeof MOROCCAN_COMPANY_LOGOS;
  reverse?: boolean;
  slower?: boolean;
}) {
  const items = [...companies, ...companies];

  return (
    <div className="logo-marquee-mask relative flex overflow-hidden">
      <div
        className={cn(
          "logo-marquee-track flex w-max items-center gap-10 px-5 sm:gap-14 sm:px-8",
          reverse ? "logo-marquee-reverse" : "logo-marquee",
          slower && "logo-marquee-slower"
        )}
      >
        {items.map((company, i) => (
          <div
            key={`${company.slug}-${i}`}
            className="logo-marquee-item group flex shrink-0 items-center"
            title={company.name}
          >
            <Image
              src={company.logo}
              alt={company.name}
              width={160}
              height={48}
              className="h-9 w-auto max-w-[150px] object-contain opacity-60 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100 sm:h-10 sm:max-w-[170px]"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LogoMarquee() {
  const midpoint = Math.ceil(MOROCCAN_COMPANY_LOGOS.length / 2);
  const row1 = MOROCCAN_COMPANY_LOGOS.slice(0, midpoint);
  const row2 = MOROCCAN_COMPANY_LOGOS.slice(midpoint);

  return (
    <section
      aria-label="Entreprises marocaines qui recrutent"
      className="relative border-y border-white/5 bg-navy py-10 sm:py-12"
    >
      <div className="container-xl mb-8 text-center sm:mb-10">
        <p className="section-label">Confiance</p>
        <p className="mt-3 text-sm text-slate-muted sm:text-base">
          Banques · Télécoms · Industrie · Retail · Tech · Assurances · Secteur public
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <LogoTrack companies={row1} />
        <LogoTrack companies={row2} reverse slower />
      </div>
    </section>
  );
}
