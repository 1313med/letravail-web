import Link from "next/link";
import { notFound } from "next/navigation";
import { SALARY_DATA } from "@/lib/premium-data";
import { buildPageMetadata } from "@/lib/seo";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return SALARY_DATA.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props) {
  const item = SALARY_DATA.find((s) => s.slug === params.slug);
  if (!item) return { title: "Salaire introuvable" };
  return buildPageMetadata({
    title: `Salaire ${item.title} au Maroc (${item.median.toLocaleString("fr-MA")} MAD)`,
    description: `Salaire moyen ${item.title} au Maroc : ${item.min.toLocaleString("fr-MA")} à ${item.max.toLocaleString("fr-MA")} MAD/mois. Tendances et insights.`,
    path: `/salaires/${item.slug}`,
  });
}

export default function SalaryDetailPage({ params }: Props) {
  const item = SALARY_DATA.find((s) => s.slug === params.slug);
  if (!item) notFound();

  const levels = [
    { label: "Junior", value: item.min },
    { label: "Confirmé", value: item.median },
    { label: "Senior", value: item.max },
  ];

  return (
    <div className="pt-24 lg:pt-32">
      <div className="container-xl section-padding !pt-0">
        <nav className="mb-8 text-sm text-slate-muted">
          <Link href="/" className="hover:text-mint">Accueil</Link>
          <span className="mx-2">/</span>
          <Link href="/salaires" className="hover:text-mint">Salaires</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{item.title}</span>
        </nav>

        <h1 className="heading-lg">Salaire {item.title} au Maroc</h1>
        <p className="body-md mt-4 max-w-2xl">
          Fourchettes salariales basées sur les offres publiées sur Letravail.ma et le marché marocain.
        </p>

        <div className="mt-12 card-glass p-8 sm:p-12">
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold text-mint">{item.median.toLocaleString("fr-MA")}</span>
            <span className="text-lg text-slate-muted">MAD / mois (médiane)</span>
            <span className="badge-mint ml-auto">{item.trend} vs. N-1</span>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {levels.map((level) => (
              <div key={level.label} className="rounded-2xl bg-white/5 p-6 text-center">
                <p className="text-sm text-slate-muted">{level.label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{level.value.toLocaleString("fr-MA")}</p>
                <p className="text-xs text-slate-dim">MAD/mois</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold">Offres {item.title}</h2>
          <p className="mt-2 text-slate-muted">Trouvez des postes correspondants sur Letravail.ma</p>
          <Link href={`/emplois?q=${encodeURIComponent(item.title)}`} className="btn-mint mt-6">
            Voir les offres
          </Link>
        </div>
      </div>
    </div>
  );
}
