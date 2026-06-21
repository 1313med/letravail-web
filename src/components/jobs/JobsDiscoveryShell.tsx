"use client";

import { Suspense } from "react";
import { JobListItem } from "@/lib/queries";
import { JobsHero } from "./JobsHero";
import { JobsSearchBar } from "./JobsSearchBar";
import { JobsFilterSidebar } from "./JobsFilterSidebar";
import { JobsFeed } from "./JobsFeed";
import { JobsInsightsPanel } from "./JobsInsightsPanel";
import { JobsEmptyState } from "./JobsEmptyState";
import { LoadMoreJobs } from "./LoadMoreJobs";
import { MobileFilterSheet } from "./MobileFilterSheet";
import { JobsBreadcrumbs } from "./JobsBreadcrumbs";
import { JobsFAQ } from "./JobsFAQ";
import { pluralize } from "@/lib/utils";

interface JobsDiscoveryShellProps {
  jobs: JobListItem[];
  total: number;
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
  cities: { city: string; slug: string }[];
  contractTypes: string[];
  tags: { name: string; slug: string; _count: { jobs: number } }[];
  basePath: string;
  heroTitle: string;
  heroSubtitle: string;
  heroLabel?: string;
  hideCityFilter?: boolean;
  fixedCity?: string;
  breadcrumbs: { label: string; href?: string }[];
  intro?: React.ReactNode;
}

export function JobsDiscoveryShell({
  jobs,
  total,
  page,
  totalPages,
  searchParams,
  cities,
  contractTypes,
  tags,
  basePath,
  heroTitle,
  heroSubtitle,
  heroLabel,
  hideCityFilter,
  fixedCity,
  breadcrumbs,
  intro,
}: JobsDiscoveryShellProps) {
  const hasFilters = Boolean(
    searchParams.q || searchParams.city || searchParams.contract ||
    searchParams.tag || searchParams.remote || searchParams.experience ||
    searchParams.minSalary || searchParams.company
  );

  return (
    <div className="section-dark min-h-screen">
      <JobsHero title={heroTitle} subtitle={heroSubtitle} count={total} label={heroLabel} />

      <Suspense fallback={null}>
        <JobsSearchBar
          cities={cities}
          contractTypes={contractTypes}
          basePath={basePath}
          initialQ={searchParams.q}
          initialCity={fixedCity || searchParams.city}
          initialContract={searchParams.contract}
          initialMinSalary={searchParams.minSalary ? parseInt(searchParams.minSalary, 10) : 0}
        />
      </Suspense>

      <div className="container-xl py-8 sm:py-12 lg:py-16">
        <JobsBreadcrumbs items={breadcrumbs} />

        {intro}

        <p className="mb-8 text-sm text-slate-muted">
          {pluralize(total, "résultat", "résultats")}
          {searchParams.q && <> pour « <span className="text-white">{searchParams.q}</span> »</>}
        </p>

        <div className="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)_300px] xl:gap-10">
          <div className="hidden xl:block">
            <div className="sticky top-36">
              <Suspense fallback={null}>
                <JobsFilterSidebar basePath={basePath} tags={tags} hideCity={hideCityFilter} />
              </Suspense>
            </div>
          </div>

          <div className="min-w-0">
            {jobs.length > 0 ? (
              <>
                <JobsFeed jobs={jobs} />
                <Suspense fallback={null}>
                  <LoadMoreJobs initialPage={page} totalPages={totalPages} searchParams={searchParams} />
                </Suspense>
              </>
            ) : (
              <JobsEmptyState basePath={basePath} hasFilters={hasFilters} />
            )}
          </div>

          <div className="hidden xl:block">
            <div className="sticky top-36">
              <JobsInsightsPanel />
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <MobileFilterSheet basePath={basePath} tags={tags} hideCity={hideCityFilter} />
      </Suspense>

      <JobsFAQ />
    </div>
  );
}
