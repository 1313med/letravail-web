import { CinematicHero } from "@/components/home/CinematicHero";
import { TrustMarquee } from "@/components/home/TrustMarquee";
import { LogoMarquee } from "@/components/home/LogoMarquee";
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
  title: "Le futur de l'emploi au Maroc",
  description:
    "Des milliers d'opportunités mises à jour automatiquement. Casablanca, Rabat, Marrakech, Tanger — banques, télécoms, tech et secteur public.",
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
      <CinematicHero cities={cities} />
      <TrustMarquee
        totalJobs={totalJobs}
        cityCount={topCities.length}
        companyCount={topCompanies.length}
      />
      <LogoMarquee />
      <CityCarousel cities={topCities} />
      <FeaturedJobs jobs={latestJobs} />
      <EmployerShowcase companies={topCompanies} />
      <SalaryInsights />
      <AiCareerBlock />
      <TestimonialsGallery />
      <FinalCta />
    </>
  );
}
