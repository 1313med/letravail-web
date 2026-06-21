import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

export function Pagination({ currentPage, totalPages, basePath, searchParams = {} }: PaginationProps) {
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
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      {currentPage > 1 && (
        <Link href={buildUrl(currentPage - 1)} className="btn-ghost !px-4 !py-2.5">← Préc.</Link>
      )}
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`e-${i}`} className="px-2 text-slate-dim">…</span>
        ) : (
          <Link
            key={page}
            href={buildUrl(page)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold transition-all ${
              page === currentPage ? "bg-mint text-navy" : "text-slate-muted hover:bg-white/5 hover:text-white"
            }`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link href={buildUrl(currentPage + 1)} className="btn-ghost !px-4 !py-2.5">Suiv. →</Link>
      )}
    </nav>
  );
}
