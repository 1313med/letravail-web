import Link from "next/link";
import type { ReactNode } from "react";
import {
  Badge,
  DataTable,
  EmptyState,
  Panel,
  StatCard,
} from "@/app/admin/seo-dashboard/components/ui";
import {
  activationStateTone,
  normalizeActivationState,
} from "@/lib/intelligence/activation";
import {
  HEALTH_COLORS,
  healthLevel,
  priorityLevel,
  validationLevel,
} from "@/lib/intelligence/badges";
import { formatScore } from "@/lib/intelligence/formatters";

export type IntelAccent = "green" | "blue" | "yellow" | "red" | "purple";

export function IntelPanel({
  title,
  subtitle,
  children,
  action,
  className = "",
  accent = "blue",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  accent?: IntelAccent;
}) {
  return (
    <div className={className}>
      <Panel title={title} subtitle={subtitle} accent={accent} action={action}>
        {children}
      </Panel>
    </div>
  );
}

export function IntelBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "mint";
}) {
  const mapped =
    tone === "mint" ? "good" : tone === "neutral" ? "neutral" : tone;
  return <Badge tone={mapped}>{children}</Badge>;
}

export function IntelActivationBadge({ state }: { state: string | null | undefined }) {
  if (!state) return <span className="text-slate-dim">—</span>;
  return (
    <IntelBadge tone={activationStateTone(state)}>
      {normalizeActivationState(state)}
    </IntelBadge>
  );
}

export function IntelHealthBadge({ score }: { score: number | null | undefined }) {
  if (score == null) return <span className="text-slate-dim">—</span>;
  const level = healthLevel(score);
  const c = HEALTH_COLORS[level];
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${c.bg} ${c.text} ${c.border}`}>
      {formatScore(score)}
    </span>
  );
}

export function IntelValidationBadge({ score }: { score: number | null | undefined }) {
  if (score == null) return <span className="text-slate-dim">—</span>;
  const level = validationLevel(score);
  const c = HEALTH_COLORS[level];
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${c.bg} ${c.text} ${c.border}`}>
      {formatScore(score)}
    </span>
  );
}

export function IntelAtsBadge({ platform }: { platform: string | null | undefined }) {
  if (!platform) return <span className="text-slate-dim">—</span>;
  return (
    <span className="inline-flex rounded-full border border-navy/10 bg-[#FAFBFC] px-2 py-0.5 text-[11px] font-medium text-navy">
      {platform}
    </span>
  );
}

export function IntelPriorityBadge({ score }: { score: number | null | undefined }) {
  const level = priorityLevel(score);
  if (level === "none") return <span className="text-slate-dim">—</span>;
  const tone = level === "high" ? "good" : level === "medium" ? "warn" : "neutral";
  return <IntelBadge tone={tone}>{level === "high" ? "High" : level === "medium" ? "Medium" : "Low"}</IntelBadge>;
}

export function IntelLifecycleBadge({ state }: { state: string | null | undefined }) {
  return <IntelActivationBadge state={state} />;
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
    <DataTable headers={headers} emptyMessage={emptyMessage}>
      {children}
    </DataTable>
  );
}

export { EmptyState as IntelEmptyState };

export function IntelSkeleton({ className = "h-32" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-navy/8 bg-[#FAFBFC] ${className}`}
    />
  );
}

export function LiveIndicator() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      Live data
    </span>
  );
}

export function IntelBackLink({ href, label = "← Back" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-lg border border-navy/15 bg-white px-4 py-2 text-sm font-medium text-navy transition hover:bg-navy/5"
    >
      {label}
    </Link>
  );
}

export function IntelSearchInput({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`min-w-[240px] flex-1 rounded-xl border border-navy/10 bg-white px-4 py-2.5 text-sm text-navy placeholder:text-slate-dim focus:border-mint/40 focus:outline-none focus:ring-2 focus:ring-mint/20 ${className}`}
    />
  );
}

export function IntelSelect({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`rounded-xl border border-navy/10 bg-white px-4 py-2.5 text-sm text-navy focus:border-mint/40 focus:outline-none ${className}`}
    >
      {children}
    </select>
  );
}

export function IntelPrimaryButton({
  children,
  className = "",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      {...props}
      className={`rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function IntelFilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? "bg-navy text-white shadow-sm"
          : "border border-navy/10 bg-white text-slate-dim hover:border-mint/40 hover:text-navy"
      }`}
    >
      {children}
    </a>
  );
}

export function IntelPageButton({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-navy text-white"
          : "border border-navy/10 bg-white text-slate-dim hover:bg-navy/5 hover:text-navy"
      }`}
    >
      {children}
    </a>
  );
}

export { StatCard };
