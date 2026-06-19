export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="h-4 w-48 rounded bg-slate-100" />
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
