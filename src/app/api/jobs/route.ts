import { NextRequest } from "next/server";
import { getJobs } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const filters = {
    q: sp.get("q") || undefined,
    city: sp.get("city") || undefined,
    company: sp.get("company") || undefined,
    contract: sp.get("contract") || undefined,
    tag: sp.get("tag") || undefined,
    remote: sp.get("remote") || undefined,
    minSalary: sp.get("minSalary") ? parseInt(sp.get("minSalary")!, 10) : undefined,
    experience: sp.get("experience") || undefined,
    page: sp.get("page") ? parseInt(sp.get("page")!, 10) : 1,
  };

  const result = await getJobs(filters);
  return Response.json(result);
}
