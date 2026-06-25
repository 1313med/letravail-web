import { NextRequest } from "next/server";
import {
  buildStaticSitemap,
  buildCitiesSitemap,
  buildCompaniesSitemap,
  buildLandingsSitemap,
  buildProfessionsSitemap,
  buildSalariesSitemap,
} from "@/lib/sitemaps";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const BUILDERS: Record<string, () => Promise<string>> = {
  static: buildStaticSitemap,
  cities: buildCitiesSitemap,
  companies: buildCompaniesSitemap,
  landings: buildLandingsSitemap,
  professions: buildProfessionsSitemap,
  salaries: buildSalariesSitemap,
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { type: string } }
) {
  const builder = BUILDERS[params.type];
  if (!builder) {
    return new Response("Not found", { status: 404 });
  }

  const xml = await builder();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
