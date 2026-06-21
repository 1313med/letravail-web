import { HeroSearch } from "./HeroSearch";

interface HeroSectionProps {
  cities: { city: string; slug: string }[];
}

export function HeroSection({ cities }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden hero-bg">
      {/* Aurora + stars */}
      <div className="pointer-events-none absolute inset-0 hero-aurora animate-aurora" />
      <div className="pointer-events-none absolute inset-0 stars opacity-60" />

      {/* Glowing orbs */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-mint/5 blur-[120px] animate-pulse-glow" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-mint-glow/5 blur-[100px] animate-float" />

      {/* Skyline silhouette */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 opacity-30">
        <svg viewBox="0 0 1440 200" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
          <path fill="#0B2648" d="M0 200V120h80v80H0zm80-80V60h40v140H80zm120 0V40h60v160h-60zm100 40V80h50v120h-50zm80-60V20h80v180h-80zm120 30V50h70v150h-70zm100-50V30h90v170h-90zm110 60V70h60v130h-60zm90-40V50h80v150h-80zm100 20V90h50v110h-50zm80-70V10h100v190h-100zm120 50V60h70v140h-70zm100-30V40h80v160h-80z" />
          {/* Mosque minaret hint */}
          <path fill="#37D6B5" fillOpacity="0.15" d="M680 200V30h8v170h-8zm-4-170h16l-8-20-8 20zm0 0l-20 10 20-5 20 5-20-10z" />
        </svg>
      </div>

      <div className="container-xl relative z-10 py-32 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-mint/20 bg-mint/5 px-5 py-2 text-sm font-medium text-mint">
            <span className="h-2 w-2 rounded-full bg-mint animate-pulse-glow" />
            Plateforme #1 de l&apos;emploi au Maroc
          </div>

          <h1 className="heading-xl animate-fade-up-1 text-balance">
            Le futur de l&apos;emploi{" "}
            <span className="gradient-text">au Maroc</span>
          </h1>

          <p className="body-lg animate-fade-up-2 mx-auto mt-8 max-w-2xl">
            Des milliers d&apos;opportunités mises à jour automatiquement chaque jour.
          </p>

          <div className="mt-12 flex justify-center">
            <HeroSearch cities={cities} />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-navy to-transparent" />
    </section>
  );
}
