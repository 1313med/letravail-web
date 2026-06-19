export default function Loading() {
  return (
    <div className="page-container py-12">
      <div className="animate-pulse space-y-8">
        <div className="space-y-3">
          <div className="h-4 w-24 rounded-lg bg-surface" />
          <div className="h-10 w-80 max-w-full rounded-xl bg-surface" />
          <div className="h-5 w-48 rounded-lg bg-surface" />
        </div>
        <div className="card p-5">
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-36 rounded-xl bg-surface" />
            ))}
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-40 p-5">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-xl bg-surface" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-surface" />
                  <div className="h-3 w-1/2 rounded bg-surface" />
                  <div className="h-3 w-full rounded bg-surface" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
