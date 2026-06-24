"use client";

import { useEffect, useState } from "react";

const SAVED_KEY = "letravail-saved-jobs";

export function useSavedJobs() {
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
      if (Array.isArray(raw)) setSaved(new Set(raw));
    } catch {
      /* ignore */
    }
  }, []);

  function toggle(slug: string) {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      localStorage.setItem(SAVED_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }

  return { saved, toggle };
}
