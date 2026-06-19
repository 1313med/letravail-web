interface PageHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: React.ReactNode;
}

export function PageHero({ title, subtitle, badge, children }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-surface via-white to-accent/5">
      <div className="absolute inset-0 bg-dot-pattern opacity-40" />
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />

      <div className="page-container relative py-10 sm:py-14">
        {badge && (
          <span className="badge-gold mb-4 inline-flex">{badge}</span>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-lg text-muted">{subtitle}</p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
