import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "À propos",
  description:
    "Letravail.ma agrège automatiquement les offres d'emploi des principales entreprises marocaines pour vous faire gagner du temps dans votre recherche.",
  path: "/a-propos",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">À propos de Letravail.ma</h1>
      <div className="mt-6 space-y-4 text-muted leading-relaxed">
        <p>
          Letravail.ma est un job board marocain qui centralise les offres
          d&apos;emploi publiées par les entreprises du royaume. Notre plateforme
          met à jour automatiquement les annonces depuis les sites de recrutement
          des employeurs — banques, opérateurs télécoms, groupes industriels,
          administrations publiques et startups.
        </p>
        <p>
          Nous ne sommes pas un ATS : chaque candidature se fait directement sur
          le site de l&apos;employeur. Notre mission est de vous faire gagner du
          temps en regroupant toutes les offres au même endroit, avec une
          recherche par ville, entreprise et type de contrat.
        </p>
        <p>
          Les offres sont mises à jour plusieurs fois par semaine. Aucune saisie
          manuelle n&apos;est nécessaire : dès qu&apos;une entreprise publie une
          nouvelle offre, elle apparaît sur Letravail.ma.
        </p>
      </div>
    </div>
  );
}
