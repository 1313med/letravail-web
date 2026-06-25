import { getSiteUrl } from "./constants";

export type OgImageType = "job" | "company" | "city" | "profession" | "salary";

export function buildOgImageUrl(
  type: OgImageType,
  params: Record<string, string>
): string {
  const siteUrl = getSiteUrl();
  const q = new URLSearchParams(params);
  return `${siteUrl}/api/og/${type}?${q.toString()}`;
}
