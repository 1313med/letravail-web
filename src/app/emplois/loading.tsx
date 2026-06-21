export default function JobsLoading() {
  return (
    <div className="section-dark min-h-screen animate-pulse">
      <div className="border-b border-white/5 bg-navy pt-28">
        <div className="container-xl pb-12">
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="mt-4 h-12 w-2/3 max-w-lg rounded-xl bg-white/10" />
          <div className="mt-4 h-8 w-48 rounded-lg bg-white/10" />
        </div>
      </div>
      <div className="container-xl py-12">
        <div className="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
          <div className="hidden h-96 rounded-2xl bg-white/5 xl:block" />
          <div className="space-y-6">
            <div className="h-80 rounded-2xl bg-white/5" />
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="h-32 rounded-2xl bg-white/5" />
              <div className="h-32 rounded-2xl bg-white/5" />
            </div>
            <div className="h-48 rounded-2xl bg-white/5" />
          </div>
          <div className="hidden h-80 rounded-2xl bg-white/5 xl:block" />
        </div>
      </div>
    </div>
  );
}
