export default function JobsLoading() {
  return (
    <div className="section-dark min-h-screen animate-pulse overflow-x-hidden">
      <div className="border-b border-white/5 bg-navy pt-20">
        <div className="container-xl py-2">
          <div className="h-5 w-48 rounded bg-white/10" />
        </div>
      </div>
      <div className="sticky top-20 bg-navy/95">
        <div className="container-xl border-b border-white/5 py-2.5">
          <div className="h-10 rounded-xl bg-white/10" />
        </div>
        <div className="border-b border-mint/15 bg-mint/[0.06] py-2">
          <div className="container-xl flex gap-2">
            <div className="h-8 w-24 rounded-full bg-mint/10" />
            <div className="h-8 w-20 rounded-full bg-mint/10" />
          </div>
        </div>
        <div className="container-xl border-t border-white/5 py-2">
          <div className="h-7 w-32 rounded bg-white/10" />
          <div className="mt-1.5 h-4 w-56 rounded bg-white/10" />
        </div>
      </div>
      <div className="container-xl py-4">
        <div className="flex gap-4">
          <div className="hidden h-72 w-14 shrink-0 rounded-xl bg-white/5 xl:block" />
          <div className="flex-1 space-y-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-[68px] rounded-lg bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
