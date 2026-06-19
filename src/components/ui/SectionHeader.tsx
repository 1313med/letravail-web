interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: "left" | "center";
  dark?: boolean;
}

export function SectionHeader({
  label,
  title,
  description,
  action,
  align = "left",
  dark = false,
}: SectionHeaderProps) {
  const alignClass = align === "center" ? "text-center" : "text-left";
  const titleColor = dark ? "text-white" : "text-foreground";
  const descColor = dark ? "text-white/70" : "text-muted";

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${alignClass}`}
    >
      <div className={align === "center" ? "mx-auto max-w-2xl" : ""}>
        {label && <p className="section-label mb-2">{label}</p>}
        <h2 className={`text-2xl font-bold tracking-tight sm:text-3xl ${titleColor}`}>
          {title}
        </h2>
        {description && (
          <p className={`mt-2 text-base leading-relaxed ${descColor}`}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
