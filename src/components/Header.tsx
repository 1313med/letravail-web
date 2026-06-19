import Link from "next/link";
import { SearchBar } from "./SearchBar";
import { getCitiesForFilter } from "@/lib/queries";

export async function Header() {
  const cities = await getCitiesForFilter();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              LT
            </span>
            <span className="text-lg font-bold text-foreground">
              Letravail<span className="text-primary">.ma</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Navigation principale">
            <Link href="/emplois" className="text-sm font-medium text-muted hover:text-primary">
              Offres d&apos;emploi
            </Link>
          </nav>

          <div className="hidden lg:block">
            <SearchBar cities={cities} compact />
          </div>
        </div>
      </div>
    </header>
  );
}
