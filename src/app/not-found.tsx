import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-foreground">404</h1>
      <p className="mt-4 text-lg text-muted">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <div className="mt-8 flex justify-center gap-4">
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
