"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { JobListItem } from "@/lib/queries";
import { JobsFeed } from "./JobsFeed";

interface LoadMoreJobsProps {
  initialPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export function LoadMoreJobs({ initialPage, totalPages, searchParams }: LoadMoreJobsProps) {
  const [page, setPage] = useState(initialPage);
  const [extraJobs, setExtraJobs] = useState<JobListItem[]>([]);
  const [pending, startTransition] = useTransition();
  const hasMore = page < totalPages;

  function loadMore() {
    startTransition(async () => {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(searchParams)) {
        if (v) params.set(k, v);
      }
      params.set("page", String(page + 1));
      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      setExtraJobs((prev) => [...prev, ...data.jobs]);
      setPage(page + 1);
    });
  }

  if (!hasMore && extraJobs.length === 0) return null;

  return (
    <div className="mt-10 space-y-6">
      {extraJobs.length > 0 && <JobsFeed jobs={extraJobs} continueFeed />}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center pt-4"
        >
          <button
            type="button"
            onClick={loadMore}
            disabled={pending}
            className="group flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-10 py-4 text-sm font-bold text-white transition-all hover:border-mint/30 hover:bg-mint/10 disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-mint" />
                Chargement…
              </>
            ) : (
              <>
                Voir plus d&apos;offres
                <span className="text-slate-dim">({page}/{totalPages})</span>
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}
