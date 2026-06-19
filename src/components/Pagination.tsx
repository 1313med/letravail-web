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
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1">
      {currentPage > 1 && (
        <Link
          href={buildUrl(currentPage - 1)}
          className="btn-secondary px-3 py-2"
          aria-label="Page précédente"
        >
          ← Précédent
        </Link>
      )}
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(page)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${
              page === currentPage
                ? "bg-primary text-white"
                : "text-muted hover:bg-slate-100"
            }`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link
          href={buildUrl(currentPage + 1)}
          className="btn-secondary px-3 py-2"
          aria-label="Page suivante"
        >
          Suivant →
        </Link>
      )}
    </nav>
  );
}
