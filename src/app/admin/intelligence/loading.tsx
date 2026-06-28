import { IntelSkeleton } from "@/components/intelligence/ui";

export default function IntelligenceLoading() {
  return (
    <div className="min-h-screen bg-[#030912] p-8">
      <div className="mb-8 h-8 w-64 animate-pulse rounded-lg bg-white/8" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <IntelSkeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <IntelSkeleton className="h-72" />
        <IntelSkeleton className="h-72" />
      </div>
    </div>
  );
}
