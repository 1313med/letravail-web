import { NextResponse } from "next/server";
import { getAtsOperationalDetail } from "@/lib/intelligence";

type Props = { params: { id: string } };

export async function GET(_request: Request, { params }: Props) {
  const detail = await getAtsOperationalDetail(params.id);
  if (!detail) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}
