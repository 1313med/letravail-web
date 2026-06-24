interface JobsContextBarProps {
  title: string;
  subtitle?: string;
}

export function JobsContextBar({ title, subtitle }: JobsContextBarProps) {
  return (
    <section className="border-b border-white/5 bg-navy pt-[calc(3.5rem+env(safe-area-inset-top))] lg:pt-20">
      <div className="container-xl py-2 sm:py-2.5">
        <h1 className="truncate text-base font-extrabold tracking-tight text-white sm:text-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 hidden truncate text-xs text-slate-muted sm:block sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
