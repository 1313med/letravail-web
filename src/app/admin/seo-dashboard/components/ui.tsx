import type { ReactNode } from "react";

export function Panel({
  title,
  subtitle,
  accent,
  children,
  action,
  help,
  whatToDo,
}: {
  title: string;
  subtitle?: string;
  accent: "green" | "blue" | "yellow" | "red" | "purple";
  children: ReactNode;
  action?: ReactNode;
  /** Explication pédagogique pour débutants */
  help?: string;
  /** Actions concrètes recommandées */
  whatToDo?: string[];
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
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-navy">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-slate-dim">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="space-y-4 p-5">
        {help && <HelpBox>{help}</HelpBox>}
        {whatToDo && whatToDo.length > 0 && <WhatToDo steps={whatToDo} />}
        {children}
      </div>
    </section>
  );
}

export function HelpBox({
  children,
  title = "À quoi ça sert ?",
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-900">
      <span className="mt-0.5 shrink-0 text-base" aria-hidden>
        ℹ️
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700/80">
          {title}
        </p>
        <p className="mt-1 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

export function WhatToDo({ steps }: { steps: string[] }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
        Que faire concrètement ?
      </p>
      <ol className="mt-2 space-y-1.5">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-2 text-sm text-emerald-900">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-200/80 text-xs font-bold text-emerald-800">
              {i + 1}
            </span>
            <span className="leading-snug">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function SubSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-2">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-navy">{title}</h3>
        {hint && (
          <p className="mt-0.5 text-xs leading-relaxed text-slate-dim">{hint}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  tooltip,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "neutral" | "good" | "warn" | "bad";
  tooltip?: string;
}) {
  const toneClass = {
    neutral: "text-navy",
    good: "text-emerald-600",
    warn: "text-amber-600",
    bad: "text-red-600",
  }[tone];

  return (
    <div
      className="rounded-xl border border-navy/8 bg-[#FAFBFC] px-4 py-3"
      title={tooltip}
    >
      <p className="text-xs font-medium text-slate-dim">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass}`}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs leading-snug text-slate-dim">{hint}</p>}
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
  emptyMessage,
}: {
  headers: string[];
  children: ReactNode;
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-navy/8 text-xs text-slate-dim">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy/6">{children}</tbody>
      </table>
      {emptyMessage && (
        <p className="py-6 text-center text-sm text-slate-dim">{emptyMessage}</p>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-navy/15 bg-[#FAFBFC] px-6 py-8 text-center">
      <p className="text-sm font-semibold text-navy">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-dim">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ActionButton({
  children,
  onClick,
  disabled,
  variant = "primary",
  size = "md",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "success";
  size?: "sm" | "md";
}) {
  const variants = {
    primary: "bg-navy text-white hover:bg-navy/90",
    secondary: "border border-navy/15 bg-white text-navy hover:bg-navy/5",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
  };
  const sizes = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-4 py-2 text-sm",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </button>
  );
}

export function ResultToast({
  message,
  ok = true,
}: {
  message: string;
  ok?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-amber-200 bg-amber-50 text-amber-900"
      }`}
      role="status"
    >
      <span className="mr-1.5" aria-hidden>
        {ok ? "✓" : "!"}
      </span>
      {message}
    </div>
  );
}

export function PriorityHero({
  rank,
  title,
  path,
  rationale,
  gain,
  confidence,
  actionLabel,
  onExecute,
  disabled,
}: {
  rank: number;
  title: string;
  path: string;
  rationale: string;
  gain: number;
  confidence: number;
  actionLabel: string;
  onExecute: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-xl border-2 border-mint/35 bg-gradient-to-br from-white via-mint/5 to-navy/[0.04] p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">
          Priorité #{rank}
        </span>
        <span className="text-xs text-slate-dim">La meilleure action à faire maintenant</span>
      </div>
      <h3 className="text-xl font-bold leading-snug text-navy sm:text-2xl">{title}</h3>
      <p className="mt-2 font-mono text-xs text-slate-dim">{path}</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-dim">{rationale}</p>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div>
          <p className="text-xs text-slate-dim">Gain estimé</p>
          <p className="text-lg font-bold text-emerald-600">+{gain} clics/mois</p>
        </div>
        <div>
          <p className="text-xs text-slate-dim">Confiance</p>
          <p className="text-lg font-bold text-navy">{confidence}%</p>
        </div>
        <div>
          <p className="text-xs text-slate-dim">Type d&apos;action</p>
          <Badge>{actionLabel}</Badge>
        </div>
      </div>

      <ActionButton
        onClick={onExecute}
        disabled={disabled}
        variant="success"
        size="md"
      >
        Exécuter cette action maintenant
      </ActionButton>
    </div>
  );
}
