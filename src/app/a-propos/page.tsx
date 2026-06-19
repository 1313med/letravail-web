import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "À propos",
  description:
    "Letravail.ma agrège automatiquement les offres d'emploi des principales entreprises marocaines pour vous faire gagner du temps dans votre recherche.",
  path: "/a-propos",
});

export default function AboutPage() {
  return (
    <div className="page-container py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="section-label">À propos</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          La référence de l&apos;emploi au Maroc
        </h1>

        <div className="mt-10 space-y-6 text-[15px] leading-[1.8] text-muted">
          <p>
            <strong className="text-foreground">Letravail.ma</strong> est le job board
            marocain qui centralise les offres d&apos;emploi publiées par les entreprises
            du royaume. Notre plateforme met à jour automatiquement les annonces depuis
            les sites de recrutement des employeurs — banques, opérateurs télécoms, groupes
            industriels, administrations publiques et startups.
          </p>
          <p>
            Nous ne sommes pas un ATS : chaque candidature se fait directement sur le site
            de l&apos;employeur. Notre mission est de vous faire gagner du temps en
            regroupant toutes les offres au même endroit, avec une recherche par ville,
            entreprise et type de contrat.
          </p>
          <p>
            Les offres sont mises à jour plusieurs fois par semaine. Aucune saisie manuelle
            n&apos;est nécessaire : dès qu&apos;une entreprise publie une nouvelle offre,
            elle apparaît sur Letravail.ma.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { value: "100%", label: "Gratuit" },
            { value: "24/7", label: "Mise à jour" },
            { value: "🇲🇦", label: "100% Maroc" },
          ].map((stat) => (
            <div key={stat.label} className="card p-5 text-center">
              <span className="text-2xl font-bold text-accent">{stat.value}</span>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/emplois" className="btn-primary">
            Explorer les offres
          </Link>
        </div>
      </div>
    </div>
  );
}
