import { Briefcase, Building2, MapPin, TrendingUp, RefreshCw } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

interface PlatformStatsProps {
  activeJobs: number;
  activeCompanies: number;
  activeCities: number;
  jobsAddedThisWeek: number;
  lastScrapeAt: Date | null;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 100) * 100}+`;
  return String(n);
}

export function PlatformStats({
  activeJobs,
  activeCompanies,
  activeCities,
  jobsAddedThisWeek,
  lastScrapeAt,
}: PlatformStatsProps) {
  const stats = [
    { icon: Briefcase, value: formatCount(activeJobs), label: "offres actives" },
    { icon: Building2, value: String(activeCompanies), label: "entreprises" },
    { icon: MapPin, value: String(activeCities), label: "villes couvertes" },
    { icon: TrendingUp, value: `+${jobsAddedThisWeek}`, label: "cette semaine" },
  ];

  return (
    <section className="section-light story-section">
      <div className="container-xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-label-light">Données en direct</p>
          <h2 className="display-section mt-6 text-navy">
            Le marché de l&apos;emploi,
            <br />
            <span className="text-navy/40">en chiffres réels.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-navy/50">
            Chaque statistique provient de notre base d&apos;offres agrégées automatiquement
            depuis les sites de recrutement des employeurs marocains.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 sm:gap-6 lg:mt-16">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-5 rounded-[1.5rem] border border-navy/6 bg-white p-6 shadow-[0_8px_32px_rgba(6,23,47,0.06)]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
                  <Icon className="h-5 w-5 text-emerald-600" />
                </span>
                <div>
                  <p className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">{stat.value}</p>
                  <p className="mt-0.5 text-sm font-medium text-navy/45">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {lastScrapeAt && (
          <p className="mt-8 flex items-center justify-center gap-2 text-sm text-navy/40">
            <RefreshCw className="h-3.5 w-3.5" />
            Dernière mise à jour {formatRelativeDate(lastScrapeAt)}
          </p>
        )}
      </div>
    </section>
  );
}
