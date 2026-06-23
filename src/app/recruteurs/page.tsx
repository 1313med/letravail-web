import Link from "next/link";
import { RecruiterInquiryForm } from "@/components/recruteurs/RecruiterInquiryForm";
import { getPlatformStats } from "@/lib/queries";
import { buildPageMetadata } from "@/lib/seo";
import { SEO_SECTORS, sectorLandingSlug } from "@/lib/landing-pages";

export const metadata = buildPageMetadata({
  title: "Recruteurs — Publiez et mettez en avant vos offres",
  description:
    "Atteignez des milliers de candidats qualifiés au Maroc. Mise en avant d'offres, visibilité sectorielle et pages employeur premium.",
  path: "/recruteurs",
});

const PLANS = [
  {
    name: "Featured",
    price: "1 500 MAD",
    period: "/ offre / 30 jours",
    features: ["Mise en tête de liste", "Badge « Featured »", "Statistiques de vues"],
  },
  {
    name: "Premium",
    price: "4 000 MAD",
    period: "/ offre / 30 jours",
    features: ["Tout Featured +", "Page entreprise enrichie", "Priorité secteur & ville", "Rapport candidatures"],
    highlight: true,
  },
];

export default async function RecruteursPage() {
  const stats = await getPlatformStats();

  return (
    <div className="section-dark min-h-screen pt-24 lg:pt-32">
      <div className="container-xl pb-24">
        <p className="section-label">Espace recruteurs</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Touchez les meilleurs talents du Maroc
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-muted">
          Letravail.ma agrège {stats.activeJobs.toLocaleString("fr-MA")} offres actives pour{" "}
          {stats.activeCompanies} entreprises. Mettez vos postes en avant là où les candidats cherchent.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { value: stats.activeJobs, label: "offres indexées" },
            { value: stats.activeCities, label: "villes couvertes" },
            { value: `+${stats.jobsAddedThisWeek}`, label: "nouvelles / semaine" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-center">
              <p className="text-3xl font-extrabold text-mint">{s.value}</p>
              <p className="mt-1 text-sm text-slate-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[1.75rem] border p-8 ${
                plan.highlight
                  ? "border-mint/30 bg-mint/5"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {plan.highlight && <span className="badge-mint">Recommandé</span>}
              <h2 className="mt-4 text-2xl font-bold text-white">{plan.name}</h2>
              <p className="mt-2">
                <span className="text-3xl font-extrabold text-mint">{plan.price}</span>
                <span className="text-sm text-slate-muted">{plan.period}</span>
              </p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-slate-text">✓ {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section className="mt-20">
          <h2 className="text-xl font-bold text-white">Pages secteur — visibilité ciblée</h2>
          <p className="mt-2 text-slate-muted">Vos offres apparaissent sur nos hubs SEO à fort trafic :</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {SEO_SECTORS.slice(0, 6).map((s) => (
              <Link key={s.slug} href={`/${sectorLandingSlug(s.slug)}`} className="badge-navy hover:border-mint/30">
                Emploi {s.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-xl font-bold text-white">Contactez-nous</h2>
          <p className="mt-2 text-slate-muted">Réponse sous 24–48h ouvrées. Paiement et mise en ligne manuels pour l&apos;instant.</p>
          <div className="mt-8">
            <RecruiterInquiryForm />
          </div>
        </section>
      </div>
    </div>
  );
}
