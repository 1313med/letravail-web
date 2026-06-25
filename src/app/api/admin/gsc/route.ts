import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { ingestGscData, syncGscFromApi, isGscConfigured } from "@/lib/seo-engine/gsc-engine";
import type { GscIngestRow } from "@/lib/seo-engine/gsc-engine";

export async function POST(request: Request) {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));

  if (body.action === "sync") {
    if (!isGscConfigured()) {
      return NextResponse.json(
        { error: "GSC not configured" },
        { status: 503 }
      );
    }
    try {
      const result = await syncGscFromApi(body.days ?? 28);
      return NextResponse.json({ ok: true, ...result });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Sync failed" },
        { status: 500 }
      );
    }
  }

  if (body.action === "ingest" && Array.isArray(body.rows)) {
    const periodStart = new Date(body.periodStart ?? Date.now() - 28 * 86400000);
    const periodEnd = new Date(body.periodEnd ?? Date.now());
    const result = await ingestGscData(
      body.rows as GscIngestRow[],
      periodStart,
      periodEnd
    );
    return NextResponse.json({ ok: true, ...result });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
