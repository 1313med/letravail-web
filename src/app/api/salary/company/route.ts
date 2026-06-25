import { NextRequest, NextResponse } from "next/server";
import { getSalaryByCompany } from "@/lib/salary-intelligence";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const companySlug = req.nextUrl.searchParams.get("company");
  if (!companySlug) {
    return NextResponse.json({ error: "company required" }, { status: 400 });
  }

  const professionSlug = req.nextUrl.searchParams.get("profession") ?? undefined;
  const data = await getSalaryByCompany(companySlug, professionSlug);

  if (data.observationCount === 0) {
    return NextResponse.json(
      { error: "Insufficient observations", companySlug },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
