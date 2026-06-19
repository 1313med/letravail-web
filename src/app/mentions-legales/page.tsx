import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Mentions légales",
  description: "Mentions légales du site Letravail.ma",
  path: "/mentions-legales",
  noindex: true,
});

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Mentions légales</h1>
      <div className="mt-6 space-y-4 text-muted leading-relaxed">
        <p>
          Le site Letravail.ma est un agrégateur d&apos;offres d&apos;emploi au
          Maroc. Les annonces proviennent des sites de recrutement des
          employeurs et sont reproduites à titre informatif.
        </p>
        <p>
          Pour postuler, vous êtes redirigé vers le site officiel de
          l&apos;employeur. Letravail.ma n&apos;est pas responsable du contenu
          des offres publiées par les tiers.
        </p>
        <p>
          Contact :{" "}
          <a href="mailto:contact@letravail.ma" className="text-primary hover:underline">
            contact@letravail.ma
          </a>
        </p>
      </div>
    </div>
  );
}
