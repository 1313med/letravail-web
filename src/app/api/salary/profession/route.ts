import { NextRequest, NextResponse } from "next/server";
import { getSalaryByProfession } from "@/lib/salary-intelligence";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const data = await getSalaryByProfession(slug);
  if (data.sampleSize === 0 && data.confidence.observationCount === 0) {
    return NextResponse.json(
      { error: "Insufficient observations", professionSlug: slug },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
