import { CinematicHero } from "@/components/home/CinematicHero";
import { TrustMarquee } from "@/components/home/TrustMarquee";
import { CityCarousel } from "@/components/home/CityCarousel";
import { FeaturedJobsSection } from "@/components/home/FeaturedJobsSection";
import { EmployerShowcase } from "@/components/home/EmployerShowcase";
import { SalaryInsights } from "@/components/home/SalaryInsights";
import { JobAlertSignup } from "@/components/seo/JobAlertSignup";
import { PlatformStats } from "@/components/home/PlatformStats";
import { FinalCta } from "@/components/home/FinalCta";
import { REVALIDATE_SECONDS } from "@/lib/constants";
import { getCitiesForFilter, getPlatformStats, getTopCities, getTopCompanies } from "@/lib/queries";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = REVALIDATE_SECONDS;

export const metadata = buildPageMetadata({
  title: "Votre prochain chapitre commence ici",
  description:
    "Découvrez les meilleures opportunités du royaume. Casablanca, Rabat, Marrakech, Tanger — banques, télécoms, tech et secteur public.",
  path: "/",
});

export default async function HomePage() {
  const [stats, topCities, topCompanies, cities] = await Promise.all([
    getPlatformStats(),
    getTopCities(12),
    getTopCompanies(12),
    getCitiesForFilter(),
  ]);

  return (
    <>
      <CinematicHero cities={cities} />
      <TrustMarquee
        totalJobs={stats.activeJobs}
        cityCount={stats.activeCities}
        companyCount={stats.activeCompanies}
        jobsAddedThisWeek={stats.jobsAddedThisWeek}
      />

      <CityCarousel cities={topCities} />
      <FeaturedJobsSection />
      <EmployerShowcase companies={topCompanies} />
      <SalaryInsights />
      <section className="section-glass story-section">
        <div className="container-xl">
          <JobAlertSignup variant="light" label="Recevez les meilleures offres par email" />
        </div>
      </section>
      <PlatformStats
        activeJobs={stats.activeJobs}
        activeCompanies={stats.activeCompanies}
        activeCities={stats.activeCities}
        jobsAddedThisWeek={stats.jobsAddedThisWeek}
        lastScrapeAt={stats.lastScrapeAt}
      />
      <FinalCta />
    </>
  );
}
