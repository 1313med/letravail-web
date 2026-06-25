import { NextRequest } from "next/server";
import { buildJobsSitemapPage } from "@/lib/sitemaps";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET(
  _req: NextRequest,
  { params }: { params: { page: string } }
) {
  const page = parseInt(params.page, 10);
  if (!Number.isFinite(page) || page < 1) {
    return new Response("Invalid page", { status: 400 });
  }

  const xml = await buildJobsSitemapPage(page);
  if (!xml) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
