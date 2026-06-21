import { CinematicHero } from "@/components/home/CinematicHero";
import { TrustMarquee } from "@/components/home/TrustMarquee";
import { CityCarousel } from "@/components/home/CityCarousel";
import { FeaturedJobs } from "@/components/home/FeaturedJobs";
import { EmployerShowcase } from "@/components/home/EmployerShowcase";
import { SalaryInsights } from "@/components/home/SalaryInsights";
import { AiCareerBlock } from "@/components/home/AiCareerBlock";
import { TestimonialsGallery } from "@/components/home/TestimonialsGallery";
import { FinalCta } from "@/components/home/FinalCta";
import { REVALIDATE_SECONDS } from "@/lib/constants";
import {
  getCitiesForFilter,
  getLatestJobs,
  getTopCities,
  getTopCompanies,
  getTotalJobCount,
} from "@/lib/queries";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = REVALIDATE_SECONDS;

export const metadata = buildPageMetadata({
  title: "Votre prochain chapitre commence ici",
  description:
    "Découvrez les meilleures opportunités du royaume. Casablanca, Rabat, Marrakech, Tanger — banques, télécoms, tech et secteur public.",
  path: "/",
});

export default async function HomePage() {
  const [totalJobs, latestJobs, topCities, topCompanies, cities] =
    await Promise.all([
      getTotalJobCount(),
      getLatestJobs(8),
      getTopCities(12),
      getTopCompanies(12),
      getCitiesForFilter(),
    ]);

  return (
    <>
      {/* Moment 1 — Dark cinematic hero */}
      <CinematicHero cities={cities} />
      <TrustMarquee
        totalJobs={totalJobs}
        cityCount={topCities.length}
        companyCount={topCompanies.length}
      />

      {/* Moment 2 — Light cities */}
      <CityCarousel cities={topCities} />

      {/* Moment 3 — Dark featured jobs */}
      <FeaturedJobs jobs={latestJobs} />

      {/* Moment 4 — Light employers */}
      <EmployerShowcase companies={topCompanies} />

      {/* Moment 5 — Gradient salaries */}
      <SalaryInsights />

      {/* Moment 6 — Glass AI */}
      <AiCareerBlock />

      {/* Moment 7 — White testimonials */}
      <TestimonialsGallery />

      {/* Moment 8 — Dark finale */}
      <FinalCta />
    </>
  );
}
