import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
      <div className="relative">
        <span className="text-[8rem] font-extrabold leading-none text-surface sm:text-[10rem]">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl" aria-hidden="true">🔍</span>
        </div>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-foreground">
        Page introuvable
      </h1>
      <p className="mt-3 max-w-md text-muted">
        Cette page n&apos;existe pas ou a été déplacée. Retournez à l&apos;accueil
        pour continuer votre recherche d&apos;emploi.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/" className="btn-primary">
          Accueil
        </Link>
        <Link href="/emplois" className="btn-secondary">
          Voir les offres
        </Link>
      </div>
    </div>
  );
}
