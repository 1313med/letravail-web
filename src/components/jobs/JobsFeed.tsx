"use client";

import { JobListItem } from "@/lib/queries";
import { JobListCard } from "./JobListCard";
import { useSavedJobs } from "./useSavedJobs";

interface JobsFeedProps {
  jobs: JobListItem[];
  /** When true, skip featured treatment (e.g. load-more pages). */
  skipFeatured?: boolean;
}

export function JobsFeed({ jobs, skipFeatured = false }: JobsFeedProps) {
  const { saved, toggle } = useSavedJobs();

  return (
    <div className="space-y-1">
      {jobs.map((job, index) => (
        <JobListCard
          key={job.id}
          job={job}
          featured={!skipFeatured && index === 0}
          saved={saved}
          onToggleSave={toggle}
        />
      ))}
    </div>
  );
}
