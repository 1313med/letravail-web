import Link from "next/link";
import { Logo } from "./ui/Logo";
import { MobileNav } from "./MobileNav";
import { getCitiesForFilter } from "@/lib/queries";

export async function Header() {
  const cities = await getCitiesForFilter();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/80 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <div className="page-container">
        <div className="flex h-[4.25rem] items-center justify-between gap-4">
          <Logo />

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Navigation principale"
          >
            <Link href="/emplois" className="btn-ghost">
              Offres d&apos;emploi
            </Link>
            <Link href="/a-propos" className="btn-ghost">
              À propos
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/emplois"
              className="btn-primary hidden !px-5 !py-2.5 sm:inline-flex"
            >
              Explorer les offres
            </Link>
            <MobileNav cities={cities} />
          </div>
        </div>
      </div>
    </header>
  );
}
