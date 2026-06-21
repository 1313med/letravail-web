"use client";

import { Bookmark, ExternalLink } from "lucide-react";
import { useSavedJobs } from "@/components/jobs/JobCardVariants";
import { cn } from "@/lib/cn";

interface StickyApplyBarProps {
  slug: string;
  applicationUrl: string;
  company: string;
  expired?: boolean;
}

export function StickyApplyBar({ slug, applicationUrl, company, expired }: StickyApplyBarProps) {
  const { saved, toggle } = useSavedJobs();
  const isSaved = saved.has(slug);

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 border-t border-white/10 bg-navy/95 p-3 backdrop-blur-2xl lg:hidden">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => toggle(slug)}
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-all",
            isSaved ? "border-mint/30 bg-mint/10 text-mint" : "border-white/10 bg-white/5 text-slate-text"
          )}
          aria-label="Sauvegarder"
        >
          <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
        </button>
        <a
          href={applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "btn-mint flex flex-1 items-center justify-center gap-2 !py-3 !text-base",
            expired && "pointer-events-none opacity-50"
          )}
        >
          Postuler
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
