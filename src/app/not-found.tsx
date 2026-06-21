import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-[10rem] font-bold leading-none text-white/5">404</p>
      <h1 className="heading-md -mt-8">Page introuvable</h1>
      <p className="body-md mt-4 max-w-md">Cette page n&apos;existe pas ou a été déplacée.</p>
      <div className="mt-10 flex gap-4">
        <Link href="/" className="btn-mint">Accueil</Link>
        <Link href="/emplois" className="btn-ghost">Voir les offres</Link>
      </div>
    </div>
  );
}
