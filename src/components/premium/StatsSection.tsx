interface StatsSectionProps {
  totalJobs: number;
  cityCount: number;
  companyCount: number;
}

export function StatsSection({ totalJobs, cityCount, companyCount }: StatsSectionProps) {
  const formattedJobs = totalJobs >= 1000 ? `${Math.floor(totalJobs / 100) * 100}+` : String(totalJobs);

  const stats = [
    { value: formattedJobs, label: "Offres d'emploi" },
    { value: String(cityCount || 60), label: "Villes du Maroc" },
    { value: `${companyCount || 300}+`, label: "Entreprises actives" },
    { value: "Temps réel", label: "Mises à jour auto." },
  ];

  return (
    <section className="section-padding border-y border-white/5 bg-navy-800/50">
      <div className="container-xl">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="card-glass group p-8 text-center"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <p className="text-3xl font-bold text-white transition-colors group-hover:text-mint sm:text-4xl lg:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
