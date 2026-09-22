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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <Skeleton className="w-48 h-6 rounded-full" />
            <Skeleton className="w-full sm:w-[500px] h-14 rounded-2xl" />
            <Skeleton className="w-4/5 h-6 rounded-lg" />
            <Skeleton className="w-full max-w-xl h-14 rounded-full" />
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="w-16 h-6 rounded-full" />
              <Skeleton className="w-24 h-6 rounded-full" />
              <Skeleton className="w-20 h-6 rounded-full" />
              <Skeleton className="w-28 h-6 rounded-full" />
            </div>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <Skeleton className="w-[340px] h-[340px] rounded-full" />
          </div>
        </div>
      </section>

      {/* Bisnis Populer Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="w-48 h-8 rounded-xl" />
          <Skeleton className="w-24 h-5 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="w-11 h-11 rounded-xl" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-3/4 h-5 rounded-md" />
                <Skeleton className="w-1/2 h-4 rounded-md" />
                <Skeleton className="w-1/3 h-3 rounded-md" />
              </div>
              <Skeleton className="w-full h-24 rounded-xl" />
            </div>
          ))}
        </div>
      </section>

      {/* Review Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <Skeleton className="w-52 h-8 rounded-xl" />
          <Skeleton className="w-24 h-5 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="w-3/4 h-4 rounded-md" />
                  <Skeleton className="w-1/2 h-3 rounded-md" />
                </div>
              </div>
              <Skeleton className="w-full h-12 rounded-lg" />
              <Skeleton className="w-32 h-6 rounded-md" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
