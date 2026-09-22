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
          </div>
        </div>
      </header>

      {/* Main Profile Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar Skeleton */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-4">
              <Skeleton className="w-24 h-24 rounded-full mx-auto" />
              <div className="space-y-1.5 flex flex-col items-center">
                <Skeleton className="w-36 h-6 rounded-md" />
                <Skeleton className="w-24 h-4 rounded-md" />
                <Skeleton className="w-20 h-5 rounded-full mt-1" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                <Skeleton className="w-full h-8 rounded-md" />
                <Skeleton className="w-full h-8 rounded-md" />
                <Skeleton className="w-full h-8 rounded-md" />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-3 space-y-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="w-full h-10 rounded-2xl" />
              ))}
            </div>
          </aside>

          {/* Right Main Area Skeleton */}
          <section className="lg:col-span-9 space-y-6">
            <Skeleton className="w-full h-32 rounded-3xl" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                <Skeleton className="w-44 h-6 rounded-md" />
                <div className="grid grid-cols-3 gap-3">
                  <Skeleton className="w-full h-24 rounded-2xl" />
                  <Skeleton className="w-full h-24 rounded-2xl" />
                  <Skeleton className="w-full h-24 rounded-2xl" />
                </div>
              </div>

              <div className="md:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                <Skeleton className="w-32 h-6 rounded-md" />
                <div className="space-y-3">
                  <Skeleton className="w-full h-10 rounded-xl" />
                  <Skeleton className="w-full h-10 rounded-xl" />
                  <Skeleton className="w-full h-10 rounded-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <div className="flex gap-6 border-b border-slate-100 pb-3">
                <Skeleton className="w-28 h-6 rounded-md" />
                <Skeleton className="w-32 h-6 rounded-md" />
                <Skeleton className="w-32 h-6 rounded-md" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-slate-100 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-16 h-16 rounded-xl" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="w-48 h-5 rounded-md" />
                      <Skeleton className="w-32 h-4 rounded-md" />
                      <Skeleton className="w-full h-8 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
