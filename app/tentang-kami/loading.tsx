import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans space-y-12">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-32 h-7 rounded-lg" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Skeleton className="w-16 h-4 rounded-md" />
            <Skeleton className="w-20 h-4 rounded-md" />
            <Skeleton className="w-20 h-4 rounded-md" />
            <Skeleton className="w-24 h-4 rounded-md" />
            <Skeleton className="w-24 h-4 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-16 h-8 rounded-full" />
            <Skeleton className="w-20 h-9 rounded-full" />
          </div>
        </div>
      </header>

      {/* Hero Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-6">
        <Skeleton className="w-44 h-6 rounded-full mx-auto" />
        <Skeleton className="w-full max-w-3xl h-14 rounded-2xl mx-auto" />
        <Skeleton className="w-full max-w-xl h-10 rounded-xl mx-auto" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-full h-28 rounded-2xl" />
          ))}
        </div>
      </section>

      {/* Visi Misi Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="w-full h-64 rounded-3xl" />
          <Skeleton className="w-full h-64 rounded-3xl" />
        </div>
      </section>
    </div>
  );
}
