import type { ReactNode } from "react";

export function IntelPanel({
  title,
  subtitle,
  children,
  action,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-white/6 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-dim">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function IntelBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "mint";
}) {
  const styles = {
    neutral: "bg-white/8 text-slate-text",
    good: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25",
    warn: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25",
    bad: "bg-red-500/15 text-red-400 ring-1 ring-red-500/25",
    mint: "bg-mint/10 text-mint ring-1 ring-mint/25",
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles[tone]}`}>
      {children}
    </span>
  );
}

export function IntelTable({
  headers,
  children,
  emptyMessage = "No data available",
}: {
  headers: string[];
  children: ReactNode;
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/8 text-xs uppercase tracking-wide text-slate-dim">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">{children}</tbody>
      </table>
      {!children && (
        <p className="py-8 text-center text-sm text-slate-dim">{emptyMessage}</p>
      )}
    </div>
  );
}

export function IntelEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-dim">{description}</p>
    </div>
  );
}

export function IntelSkeleton({ className = "h-32" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-white/8 bg-white/[0.04] ${className}`}
    />
  );
}

export function LiveIndicator() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      Live data
    </span>
  );
}
