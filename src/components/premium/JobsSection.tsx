import Link from "next/link";
import { JobListItem } from "@/lib/queries";
import { PremiumJobCard } from "./JobCard";

interface JobsSectionProps {
  jobs: JobListItem[];
}

export function JobsSection({ jobs }: JobsSectionProps) {
  return (
    <section className="section-padding bg-navy-800/30">
      <div className="container-xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label">En direct</p>
            <h2 className="heading-lg mt-4">Offres récentes</h2>
            <p className="body-md mt-4">Les dernières opportunités publiées au Maroc.</p>
          </div>
          <Link href="/emplois" className="btn-ghost shrink-0">
            Voir tout →
          </Link>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {jobs.slice(0, 9).map((job) => (
            <PremiumJobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </section>
  );
}
