"use client";

import { useState, useTransition, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { JobListItem } from "@/lib/queries";
import { JobsFeed } from "./JobsFeed";

interface LoadMoreJobsProps {
  initialPage: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}

function JobCardSkeleton() {
  return <div className="h-[68px] animate-pulse rounded-lg bg-white/5" />;
}

export function LoadMoreJobs({
  initialPage,
  totalPages,
  basePath,
  searchParams,
}: LoadMoreJobsProps) {
  const router = useRouter();
  const [page, setPage] = useState(initialPage);
  const [extraJobs, setExtraJobs] = useState<JobListItem[]>([]);
  const [pending, startTransition] = useTransition();
  const scrollYRef = useRef(0);

  const paramsKey = useMemo(
    () => JSON.stringify({ ...searchParams, page: undefined }),
    [searchParams]
  );

  useEffect(() => {
    setPage(initialPage);
    setExtraJobs([]);
  }, [paramsKey, initialPage]);

  const hasMore = page < totalPages;

  function updateUrl(nextPage: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== "page") params.set(k, v);
    }
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    const url = qs ? `${basePath}?${qs}` : basePath;
    router.replace(url, { scroll: false });
  }

  function loadMore() {
    scrollYRef.current = window.scrollY;
    const nextPage = page + 1;

    startTransition(async () => {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(searchParams)) {
        if (v) params.set(k, v);
      }
      params.set("page", String(nextPage));
      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      setExtraJobs((prev) => [...prev, ...data.jobs]);
      setPage(nextPage);
      updateUrl(nextPage);
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollYRef.current, behavior: "instant" as ScrollBehavior });
      });
    });
  }

  if (!hasMore && extraJobs.length === 0) return null;

  return (
    <div className="mt-3 space-y-1">
      {extraJobs.length > 0 && <JobsFeed jobs={extraJobs} skipFeatured />}
      {pending && (
        <div className="space-y-1" aria-hidden>
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      )}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={loadMore}
            disabled={pending}
            aria-busy={pending}
            className="flex min-h-[44px] w-full max-w-lg items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition-all hover:border-mint/30 hover:bg-mint/10 disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-mint" />
                Chargement…
              </>
            ) : (
              <>
                Charger plus d&apos;offres
                <span className="font-normal text-slate-dim">
                  ({page}/{totalPages})
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
