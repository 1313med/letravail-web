import { unstable_noStore as noStore } from "next/cache";
import { getRandomJobs } from "@/lib/queries";
import { FeaturedJobs } from "./FeaturedJobs";

export async function FeaturedJobsSection() {
  noStore();
  const jobs = await getRandomJobs(8);
  return <FeaturedJobs jobs={jobs} />;
}
