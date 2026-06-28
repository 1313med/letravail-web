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
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-navy/8 bg-white">
      <div className="border-b border-navy/8 px-5 py-6">
        <Link href="/admin/intelligence" className="group block">
          <p className="text-xs font-medium uppercase tracking-widest text-mint-dim">
            Letravail.ma
          </p>
          <h1 className="mt-1 text-sm font-semibold text-navy group-hover:text-mint-dim transition-colors">
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
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-navy text-white shadow-sm"
                  : "text-slate-dim hover:bg-navy/5 hover:text-navy"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-mint" : "opacity-70"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-navy/8 px-5 py-4">
        <Link
          href="/admin/seo-dashboard"
          className="flex items-center gap-2 text-xs text-slate-dim hover:text-navy transition-colors"
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
  updatedAt,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  updatedAt?: string;
}) {
  return (
    <div className="flex min-h-screen bg-[#F7F9FC] text-navy">
      <IntelligenceSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-navy/8 bg-[#F7F9FC]/95 px-6 py-6 backdrop-blur-sm lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-mint-dim">
                Centre de commande — Intelligence emploi
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-dim">
                  {subtitle}
                </p>
              )}
              {updatedAt && (
                <p className="mt-2 text-xs text-slate-dim">
                  Dernière mise à jour : {updatedAt}
                </p>
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
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-navy/10 bg-white/95 backdrop-blur-sm shadow-[0_-4px_24px_rgba(6,23,47,0.08)] lg:hidden">
      <div className="flex overflow-x-auto scrollbar-hide px-2 py-2">
        {NAV.slice(0, 6).map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-[4.5rem] flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium ${
                active ? "text-navy" : "text-slate-dim"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-mint-dim" : ""}`} />
              <span className="truncate">{label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
      {current && (
        <p className="border-t border-navy/6 px-4 py-1 text-center text-[10px] text-slate-dim">
          {current.label}
        </p>
      )}
    </div>
  );
}
