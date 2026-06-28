import { NextResponse } from "next/server";
import { getCrawlActivity } from "@/lib/intelligence";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const data = await getCrawlActivity({ source, status, page });
  return NextResponse.json(data);
}
