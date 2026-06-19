import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
}

export function Logo({ size = "md", variant = "dark" }: LogoProps) {
  const sizes = {
    sm: { icon: "h-8 w-8 text-xs", text: "text-base" },
    md: { icon: "h-9 w-9 text-sm", text: "text-lg" },
    lg: { icon: "h-11 w-11 text-base", text: "text-xl" },
  };

  const textColor = variant === "light" ? "text-white" : "text-foreground";
  const accentColor = variant === "light" ? "text-accent-light" : "text-accent";

  return (
    <Link href="/" className="group flex items-center gap-2.5 shrink-0">
      <span
        className={`${sizes[size].icon} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary-light font-bold text-white shadow-accent transition-transform duration-300 group-hover:scale-105`}
      >
        <span className="relative z-10">LT</span>
        <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
      </span>
      <span className={`${sizes[size].text} font-bold tracking-tight ${textColor}`}>
        Letravail<span className={accentColor}>.ma</span>
      </span>
    </Link>
  );
}
