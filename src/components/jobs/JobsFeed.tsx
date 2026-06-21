"use client";

import { motion } from "framer-motion";
import { JobListItem } from "@/lib/queries";
import {
  FeaturedJobCard,
  HorizontalJobCard,
  CompactJobCard,
  useSavedJobs,
} from "./JobCardVariants";
import { fadeUp, stagger } from "@/lib/motion";

interface JobsFeedProps {
  jobs: JobListItem[];
  continueFeed?: boolean;
}

type LayoutChunk =
  | { type: "featured"; job: JobListItem }
  | { type: "horizontal-pair"; jobs: [JobListItem, JobListItem] }
  | { type: "horizontal"; job: JobListItem }
  | { type: "compact-large"; job: JobListItem }
  | { type: "compact-pair"; jobs: [JobListItem, JobListItem] }
  | { type: "compact"; job: JobListItem };

function buildLayout(jobs: JobListItem[], continueFeed: boolean): LayoutChunk[] {
  if (jobs.length === 0) return [];
  const chunks: LayoutChunk[] = [];
  let i = 0;
  let cycle = 0;

  if (!continueFeed) {
    chunks.push({ type: "featured", job: jobs[0] });
    i = 1;
  }

  while (i < jobs.length) {
    const step = cycle % 5;
    if (step === 0 && i + 1 < jobs.length) {
      chunks.push({ type: "horizontal-pair", jobs: [jobs[i], jobs[i + 1]] });
      i += 2;
    } else if (step === 1) {
      chunks.push({ type: "horizontal", job: jobs[i] });
      i += 1;
    } else if (step === 2) {
      chunks.push({ type: "compact-large", job: jobs[i] });
      i += 1;
    } else if (step === 3 && i + 1 < jobs.length) {
      chunks.push({ type: "compact-pair", jobs: [jobs[i], jobs[i + 1]] });
      i += 2;
    } else {
      chunks.push({ type: "compact", job: jobs[i] });
      i += 1;
    }
    cycle += 1;
  }
  return chunks;
}

export function JobsFeed({ jobs, continueFeed = false }: JobsFeedProps) {
  const { saved, toggle } = useSavedJobs();
  const cardProps = { saved, onToggleSave: toggle };
  const chunks = buildLayout(jobs, continueFeed);

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-5 sm:space-y-6">
      {chunks.map((chunk, idx) => {
        const key = "job" in chunk ? chunk.job.id : chunk.jobs.map((j) => j.id).join("-");

        if (chunk.type === "featured") {
          return (
            <motion.div key={key} variants={fadeUp}>
              <FeaturedJobCard job={chunk.job} {...cardProps} />
            </motion.div>
          );
        }
        if (chunk.type === "horizontal-pair") {
          return (
            <motion.div key={key} variants={fadeUp} className="grid gap-5 lg:grid-cols-2">
              <HorizontalJobCard job={chunk.jobs[0]} {...cardProps} />
              <HorizontalJobCard job={chunk.jobs[1]} {...cardProps} />
            </motion.div>
          );
        }
        if (chunk.type === "horizontal") {
          return (
            <motion.div key={key} variants={fadeUp}>
              <HorizontalJobCard job={chunk.job} {...cardProps} />
            </motion.div>
          );
        }
        if (chunk.type === "compact-large") {
          return (
            <motion.div key={key} variants={fadeUp}>
              <CompactJobCard job={chunk.job} large {...cardProps} />
            </motion.div>
          );
        }
        if (chunk.type === "compact-pair") {
          return (
            <motion.div key={key} variants={fadeUp} className="grid gap-5 sm:grid-cols-2">
              <CompactJobCard job={chunk.jobs[0]} {...cardProps} />
              <CompactJobCard job={chunk.jobs[1]} {...cardProps} />
            </motion.div>
          );
        }
        return (
          <motion.div key={`${key}-${idx}`} variants={fadeUp}>
            <CompactJobCard job={chunk.job} {...cardProps} />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
