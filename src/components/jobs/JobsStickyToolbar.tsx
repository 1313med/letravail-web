"use client";

import { JobsResultsContext } from "./JobsResultsContext";

interface JobsStickyToolbarProps {
  total: number;
  searchParams: Record<string, string | undefined>;
  tags: { name: string; slug: string }[];
  cities: { city: string; slug: string }[];
  hideCityFilter?: boolean;
  fixedCity?: string;
}

export function JobsStickyToolbar(props: JobsStickyToolbarProps) {
  return (
    <div className="container-xl border-t border-white/5 py-2">
      <JobsResultsContext {...props} />
    </div>
  );
}
