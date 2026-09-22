import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans space-y-8">
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

      {/* Banner Skeleton */}
      <section className="bg-white border-b border-slate-200/60 pt-6 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton className="w-36 h-4 rounded-md" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-3">
              <Skeleton className="w-48 h-5 rounded-full" />
              <Skeleton className="w-72 h-10 rounded-xl" />
              <Skeleton className="w-full max-w-lg h-12 rounded-lg" />
            </div>
            <div className="lg:col-span-6 space-y-3 bg-slate-50 p-5 rounded-3xl border border-slate-200">
              <Skeleton className="w-full h-12 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="w-20 h-7 rounded-full" />
                <Skeleton className="w-20 h-7 rounded-full" />
                <Skeleton className="w-20 h-7 rounded-full" />
                <Skeleton className="w-20 h-7 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content (Sidebar + Cards Grid) Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Filter Skeleton */}
          <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <Skeleton className="w-32 h-5 rounded-md" />
              <Skeleton className="w-12 h-4 rounded-md" />
            </div>
            <div className="space-y-3">
              <Skeleton className="w-24 h-4 rounded-md" />
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <Skeleton className="w-28 h-4 rounded-md" />
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <Skeleton className="w-20 h-4 rounded-md" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <Skeleton className="w-24 h-4 rounded-md" />
                </div>
              ))}
            </div>
          </aside>

          {/* Business Grid Skeleton */}
          <main className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-slate-200">
              <Skeleton className="w-40 h-5 rounded-md" />
              <Skeleton className="w-36 h-8 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
                  <Skeleton className="w-full h-32 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="w-3/4 h-5 rounded-md" />
                    <Skeleton className="w-1/2 h-4 rounded-md" />
                    <Skeleton className="w-1/3 h-3 rounded-md" />
                    <Skeleton className="w-full h-10 rounded-lg" />
                  </div>
                  <Skeleton className="w-24 h-4 rounded-md" />
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2 pt-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="w-8 h-8 rounded-lg" />
              ))}
            </div>
          </main>

        </div>
      </section>
    </div>
  );
}
