import { NextResponse } from "next/server";
import { updateSourceStatus } from "@/lib/intelligence";

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const sourceName = typeof body.sourceName === "string" ? body.sourceName : "";
  const status = typeof body.status === "string" ? body.status : "";

  if (!sourceName || !status) {
    return NextResponse.json({ error: "sourceName and status required" }, { status: 400 });
  }

  if (!["active", "disabled", "paused"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const updated = await updateSourceStatus(sourceName, status);
    return NextResponse.json({ ok: true, source: updated });
  } catch {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }
}
