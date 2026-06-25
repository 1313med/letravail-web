import { NextRequest, NextResponse } from "next/server";
import { getSalaryByCity } from "@/lib/salary-intelligence";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const citySlug = req.nextUrl.searchParams.get("city");
  if (!citySlug) {
    return NextResponse.json({ error: "city required" }, { status: 400 });
  }

  const professionSlug = req.nextUrl.searchParams.get("profession") ?? undefined;
  const data = await getSalaryByCity(citySlug, professionSlug);

  if (data.observationCount === 0) {
    return NextResponse.json(
      { error: "Insufficient observations", citySlug },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
