import type { ReactNode } from "react";

export function Panel({
  title,
  subtitle,
  accent,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  accent: "green" | "blue" | "yellow" | "red" | "purple";
  children: ReactNode;
  action?: ReactNode;
}) {
  const accentMap = {
    green: "border-l-emerald-500",
    blue: "border-l-blue-500",
    yellow: "border-l-amber-500",
    red: "border-l-red-500",
    purple: "border-l-violet-500",
  };

  return (
    <section className="rounded-2xl border border-navy/8 bg-white shadow-sm">
      <div
        className={`flex flex-wrap items-start justify-between gap-3 border-b border-navy/6 px-5 py-4 border-l-4 ${accentMap[accent]}`}
      >
        <div>
          <h2 className="text-base font-semibold text-navy">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-slate-dim">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const toneClass = {
    neutral: "text-navy",
    good: "text-emerald-600",
    warn: "text-amber-600",
    bad: "text-red-600",
  }[tone];

  return (
    <div className="rounded-xl border border-navy/8 bg-[#FAFBFC] px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-dim">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass}`}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-slate-dim">{hint}</p>}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const classes = {
    neutral: "bg-navy/5 text-navy",
    good: "bg-emerald-50 text-emerald-700",
    warn: "bg-amber-50 text-amber-800",
    bad: "bg-red-50 text-red-700",
  }[tone];

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${classes}`}
    >
      {children}
    </span>
  );
}

export function DataTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-navy/8 text-xs uppercase tracking-wide text-slate-dim">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy/6">{children}</tbody>
      </table>
    </div>
  );
}
