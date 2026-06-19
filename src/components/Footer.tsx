import Link from "next/link";
import { TOP_CITIES } from "@/lib/constants";
import { slugify } from "@/lib/utils";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                LT
              </span>
              <span className="font-bold">Letravail.ma</span>
            </Link>
            <p className="mt-3 text-sm text-muted">
              Le job board marocain qui agrège automatiquement les offres d&apos;emploi
              des principales entreprises du royaume.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Villes</h3>
            <ul className="mt-3 space-y-2">
              {TOP_CITIES.map((city) => (
                <li key={city}>
                  <Link
                    href={`/emplois/${slugify(city)}`}
                    className="text-sm text-muted hover:text-primary"
                  >
                    Emploi {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Liens utiles</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/emplois" className="text-sm text-muted hover:text-primary">
                  Toutes les offres
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="text-sm text-muted hover:text-primary">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="text-sm text-muted hover:text-primary">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Contact</h3>
            <p className="mt-3 text-sm text-muted">
              Des questions ? Écrivez-nous à{" "}
              <a href="mailto:contact@letravail.ma" className="text-primary hover:underline">
                contact@letravail.ma
              </a>
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted">
          © {year} Letravail.ma — Offres d&apos;emploi au Maroc
        </div>
      </div>
    </footer>
  );
}
