import { NextResponse } from "next/server";
import { probeEmployerUrl } from "@/lib/intelligence";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const url = typeof body.url === "string" ? body.url.trim() : "";

  if (!url) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  const record = await probeEmployerUrl(url);

  if (!record) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({
    found: true,
    record: {
      id: record.id,
      companyName: record.companyName,
      inputUrl: record.inputUrl,
      careersPageUrl: record.careersPageUrl,
      atsPlatform: record.atsPlatform,
      confidence: record.confidence,
      crawlStrategy: record.crawlStrategy,
      apiEndpoints: record.apiEndpoints,
      robotsAllowed: record.robotsAllowed,
      sitemapUrls: record.sitemapUrls,
      authRequired: record.authRequired,
      paginationType: record.paginationType,
      jsRenderingRequired: record.jsRenderingRequired,
      estimatedJobVolume: record.estimatedJobVolume,
      onboardingStatus: record.onboardingStatus,
      issues: record.issues,
    },
  });
}
