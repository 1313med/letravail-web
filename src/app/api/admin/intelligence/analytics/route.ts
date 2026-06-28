import { NextResponse } from "next/server";
import { getExecutiveAnalytics } from "@/lib/intelligence";
import type { TimeRange } from "@/lib/intelligence/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") ?? "month") as TimeRange;
  const data = await getExecutiveAnalytics(range);
  return NextResponse.json(data);
}
