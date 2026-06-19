import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildUrl(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value);
    }
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 2 && i <= currentPage + 2)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-2"
    >
      {currentPage > 1 && (
        <Link
          href={buildUrl(currentPage - 1)}
          className="btn-secondary !px-4 !py-2.5"
          aria-label="Page précédente"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Précédent
        </Link>
      )}

      <div className="flex items-center gap-1">
        {pages.map((page, i) =>
          page === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-muted-light">
              …
            </span>
          ) : (
            <Link
              key={page}
              href={buildUrl(page)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                page === currentPage
                  ? "bg-gradient-to-r from-accent to-primary-light text-white shadow-accent"
                  : "text-muted hover:bg-surface hover:text-foreground"
              }`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Link>
          )
        )}
      </div>

      {currentPage < totalPages && (
        <Link
          href={buildUrl(currentPage + 1)}
          className="btn-secondary !px-4 !py-2.5"
          aria-label="Page suivante"
        >
          Suivant
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      )}
    </nav>
  );
}
