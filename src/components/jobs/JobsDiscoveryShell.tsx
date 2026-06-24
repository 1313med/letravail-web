"use client";

import { Suspense, useState } from "react";
import { JobListItem } from "@/lib/queries";
import { JobsContextBar } from "./JobsContextBar";
import { JobsSearchBar } from "./JobsSearchBar";
import { ActiveFiltersBar } from "./ActiveFiltersBar";
import { JobsStickyToolbar } from "./JobsStickyToolbar";
import { JobsFeed } from "./JobsFeed";
import { JobsEmptyState } from "./JobsEmptyState";
import { LoadMoreJobs } from "./LoadMoreJobs";
import { JobsBreadcrumbs } from "./JobsBreadcrumbs";
import { JobsFAQ } from "./JobsFAQ";
import { JobsBelowFeed } from "./JobsBelowFeed";
import { CollapsibleFilterSidebar, JobsFilterSheet } from "./JobsFilterSheet";
import { buildChips } from "./active-filter-utils";
import { cn } from "@/lib/cn";

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
  hideCityFilter,
  fixedCity,
  breadcrumbs,
  intro,
}: JobsDiscoveryShellProps) {
  const [filterOpen, setFilterOpen] = useState(false);

  const hasFilters = Boolean(
    searchParams.q ||
      searchParams.city ||
      searchParams.contract ||
      searchParams.tag ||
      searchParams.remote ||
      searchParams.experience ||
      searchParams.minSalary ||
      searchParams.company
  );

  const filterParams = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (v) filterParams.set(k, v);
  }
  const filterCount = buildChips(filterParams, tags, hideCityFilter).length;

  return (
    <div className="section-dark min-h-screen overflow-x-hidden">
      <JobsContextBar title={heroTitle} subtitle={heroSubtitle} />

      <div
        className={cn(
          "sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-40 lg:top-20",
          "bg-navy/95 backdrop-blur-2xl"
        )}
      >
        <div className="border-b border-white/5">
          <Suspense fallback={null}>
            <JobsSearchBar
              cities={cities}
              contractTypes={contractTypes}
              basePath={basePath}
              initialQ={searchParams.q}
              initialCity={fixedCity || searchParams.city}
              initialContract={searchParams.contract}
              initialMinSalary={searchParams.minSalary ? parseInt(searchParams.minSalary, 10) : 0}
              onOpenFilters={() => setFilterOpen(true)}
              filterCount={filterCount}
              sticky={false}
            />
          </Suspense>
        </div>

        <Suspense fallback={null}>
          <ActiveFiltersBar basePath={basePath} tags={tags} hideCity={hideCityFilter} />
        </Suspense>

        <JobsStickyToolbar
          total={total}
          searchParams={searchParams}
          tags={tags}
          cities={cities}
          hideCityFilter={hideCityFilter}
          fixedCity={fixedCity}
        />
      </div>

      <div className="container-xl py-3 sm:py-4">
        <JobsBreadcrumbs items={breadcrumbs} />

        {intro}

        <div className="mt-2 flex gap-3 sm:mt-3 sm:gap-4">
          <Suspense fallback={null}>
            <CollapsibleFilterSidebar
              basePath={basePath}
              tags={tags}
              hideCity={hideCityFilter}
            />
          </Suspense>

          <div className="min-w-0 flex-1">
            {jobs.length > 0 ? (
              <>
                <JobsFeed jobs={jobs} skipFeatured={page > 1} />

                <LoadMoreJobs
                  initialPage={page}
                  totalPages={totalPages}
                  basePath={basePath}
                  searchParams={searchParams}
                />

                <JobsBelowFeed />
              </>
            ) : (
              <JobsEmptyState basePath={basePath} hasFilters={hasFilters} />
            )}
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <JobsFilterSheet
          basePath={basePath}
          tags={tags}
          hideCity={hideCityFilter}
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
        />
      </Suspense>

      <JobsFAQ />
    </div>
  );
}
