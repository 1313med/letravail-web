import Link from "next/link";

export function JobBreadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="container-xl py-2 sm:py-6">
      <ol className="flex flex-wrap items-center gap-1 text-xs sm:gap-1.5 sm:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex min-w-0 items-center gap-1 sm:gap-1.5">
              {index > 0 && <span className="text-slate-dim">/</span>}
              {isLast || !item.href ? (
                <span className="truncate font-medium text-white/70 sm:text-white/80" aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="shrink-0 text-slate-muted transition-colors hover:text-mint">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
