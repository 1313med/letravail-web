import { NextResponse } from "next/server";
import { getRealtimeSnapshot } from "@/lib/intelligence";

export async function GET() {
  const data = await getRealtimeSnapshot();
  return NextResponse.json(data);
}
