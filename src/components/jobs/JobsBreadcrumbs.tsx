import Link from "next/link";

interface JobsBreadcrumbsProps {
  items: { label: string; href?: string }[];
}

export function JobsBreadcrumbs({ items }: JobsBreadcrumbsProps) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-6 sm:mb-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <svg className="h-3.5 w-3.5 shrink-0 text-slate-dim" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              )}
              {isLast || !item.href ? (
                <span className="font-semibold text-white/90" aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="font-medium text-slate-muted transition-colors hover:text-mint">
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
