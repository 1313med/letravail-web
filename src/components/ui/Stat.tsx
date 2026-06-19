interface StatProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export function Stat({ value, label, icon }: StatProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm">
      {icon && <div className="mb-1 text-accent-light">{icon}</div>}
      <span className="text-2xl font-bold text-white sm:text-3xl">{value}</span>
      <span className="text-xs font-medium uppercase tracking-wider text-white/60">
        {label}
      </span>
    </div>
  );
}
