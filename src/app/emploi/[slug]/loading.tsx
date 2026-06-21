export default function JobDetailLoading() {
  return (
    <div className="section-dark min-h-screen animate-pulse">
      <div className="border-b border-white/5 bg-navy pt-28">
        <div className="container-xl pb-12">
          <div className="h-10 w-3/4 max-w-2xl rounded-xl bg-white/10" />
          <div className="mt-4 h-6 w-48 rounded-lg bg-white/10" />
          <div className="mt-8 flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 w-28 rounded-full bg-white/10" />
            ))}
          </div>
        </div>
      </div>
      <div className="container-xl py-12">
        <div className="grid gap-12 xl:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            <div className="h-48 rounded-2xl bg-white/5" />
            <div className="h-64 rounded-2xl bg-white/5" />
            <div className="h-40 rounded-2xl bg-white/5" />
          </div>
          <div className="hidden h-80 rounded-2xl bg-white/5 xl:block" />
        </div>
      </div>
    </div>
  );
}
