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

      {/* Hero Cover & Profile Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden space-y-4">
          <Skeleton className="w-full h-48 sm:h-56" />
          <div className="p-6 pt-0 relative space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14">
              <div className="flex items-end gap-4">
                <Skeleton className="w-28 h-28 rounded-2xl border-4 border-white" />
                <div className="space-y-2 pb-2">
                  <Skeleton className="w-48 h-8 rounded-xl" />
                  <Skeleton className="w-32 h-4 rounded-md" />
                  <Skeleton className="w-60 h-4 rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-32 h-11 rounded-xl" />
                <Skeleton className="w-24 h-11 rounded-xl" />
                <Skeleton className="w-11 h-11 rounded-xl" />
              </div>
            </div>
            <div className="flex gap-8 border-b border-slate-100 pb-3 pt-4">
              <Skeleton className="w-20 h-5 rounded-md" />
              <Skeleton className="w-24 h-5 rounded-md" />
              <Skeleton className="w-20 h-5 rounded-md" />
              <Skeleton className="w-16 h-5 rounded-md" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column Skeleton */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
              <Skeleton className="w-44 h-7 rounded-lg" />
              <Skeleton className="w-full h-16 rounded-xl" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="w-24 h-8 rounded-xl" />
                <Skeleton className="w-28 h-8 rounded-xl" />
                <Skeleton className="w-20 h-8 rounded-xl" />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <Skeleton className="w-48 h-7 rounded-lg" />
                <Skeleton className="w-28 h-8 rounded-lg" />
              </div>
              {[1, 2].map((i) => (
                <div key={i} className="space-y-3 pb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="w-32 h-4 rounded-md" />
                      <Skeleton className="w-24 h-3 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="w-full h-12 rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <Skeleton className="w-36 h-6 rounded-md" />
              <Skeleton className="w-full h-24 rounded-xl" />
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <Skeleton className="w-40 h-6 rounded-md" />
              <Skeleton className="w-full h-20 rounded-xl" />
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
