import type { ReportPeriod, TimeRange } from "./types";

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function resolvePeriod(range: TimeRange, now = new Date()): ReportPeriod {
  const end = endOfDay(now);
  const start = startOfDay(now);

  switch (range) {
    case "today":
      return { range, start, end };
    case "week": {
      const s = new Date(start);
      s.setDate(s.getDate() - 6);
      return { range, start: s, end };
    }
    case "month": {
      const s = new Date(start);
      s.setDate(s.getDate() - 29);
      return { range, start: s, end };
    }
    case "quarter": {
      const s = new Date(start);
      s.setDate(s.getDate() - 89);
      return { range, start: s, end };
    }
    case "year": {
      const s = new Date(start);
      s.setFullYear(s.getFullYear() - 1);
      return { range, start: s, end };
    }
  }
}

export function daysAgo(n: number, from = new Date()): Date {
  const d = startOfDay(from);
  d.setDate(d.getDate() - n);
  return d;
}

export function isoDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function bucketDates(days: number, from = new Date()): string[] {
  return Array.from({ length: days }, (_, i) => {
    const d = daysAgo(days - 1 - i, from);
    return isoDateKey(d);
  });
}
