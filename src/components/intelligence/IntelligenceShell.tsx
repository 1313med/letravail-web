"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Building2,
  Globe2,
  LayoutDashboard,
  Map,
  Monitor,
  Radar,
  Search,
  ShieldCheck,
  FileBarChart,
  Radio,
} from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { href: "/admin/intelligence", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/intelligence/sources", label: "Sources", icon: Radio },
  { href: "/admin/intelligence/ats", label: "ATS Intelligence", icon: Radar },
  { href: "/admin/intelligence/coverage", label: "Market Coverage", icon: Map },
  { href: "/admin/intelligence/companies", label: "Company Intelligence", icon: Building2 },
  { href: "/admin/intelligence/crawl", label: "Crawl Activity", icon: Activity },
  { href: "/admin/intelligence/quality", label: "Data Quality", icon: BarChart3 },
  { href: "/admin/intelligence/discovery", label: "Employer Discovery", icon: Search },
  { href: "/admin/intelligence/validation", label: "Validation Center", icon: ShieldCheck },
  { href: "/admin/intelligence/monitor", label: "Production Monitor", icon: Monitor },
  { href: "/admin/intelligence/reports", label: "Reports", icon: FileBarChart },
];

export function IntelligenceSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-white/8 bg-[#050d18]/80 backdrop-blur-xl">
      <div className="border-b border-white/8 px-5 py-6">
        <Link href="/admin/intelligence" className="group block">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-mint/80">
            Letravail.ma
          </p>
          <h1 className="mt-1 text-sm font-semibold text-white group-hover:text-mint transition-colors">
            Employment Intelligence
          </h1>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-mint/10 text-mint shadow-[inset_0_0_0_1px_rgba(55,214,181,0.25)]"
                  : "text-slate-muted hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/8 px-5 py-4">
        <Link
          href="/admin/seo-dashboard"
          className="flex items-center gap-2 text-xs text-slate-dim hover:text-mint transition-colors"
        >
          <Globe2 className="h-3.5 w-3.5" />
          SEO Dashboard
        </Link>
      </div>
    </aside>
  );
}

export function IntelligenceShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#030912] text-slate-text">
      <IntelligenceSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-white/8 bg-[#030912]/90 px-6 py-5 backdrop-blur-xl lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mint/70">
                Intelligence Center
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">{title}</h1>
              {subtitle && (
                <p className="mt-1 max-w-3xl text-sm text-slate-muted">{subtitle}</p>
              )}
            </div>
            {actions}
          </div>
        </header>
        <main className="flex-1 px-6 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function IntelligenceMobileNav() {
  const pathname = usePathname();
  const current = NAV.find((n) =>
    n.exact ? pathname === n.href : pathname.startsWith(n.href)
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#050d18]/95 backdrop-blur-xl lg:hidden">
      <div className="flex overflow-x-auto scrollbar-hide px-2 py-2">
        {NAV.slice(0, 6).map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-[4.5rem] flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] ${
                active ? "text-mint" : "text-slate-dim"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
      {current && (
        <p className="border-t border-white/5 px-4 py-1 text-center text-[10px] text-slate-dim">
          {current.label}
        </p>
      )}
    </div>
  );
}
