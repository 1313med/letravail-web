"use client";

import { useEffect } from "react";
import { trackJobView } from "@/lib/analytics";

export function JobViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackJobView(slug);
  }, [slug]);
  return null;
}
