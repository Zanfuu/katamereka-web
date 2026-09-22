import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans space-y-8">
      {/* Header / Navbar Skeleton */}
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

      {/* Breadcrumb & Subtitle Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-3">
        <Skeleton className="w-64 h-4 rounded-md" />
        <Skeleton className="w-72 h-8 rounded-lg" />
        <Skeleton className="w-96 h-4 rounded-md" />
      </div>

      {/* Main Skeleton Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form Area Skeleton */}
          <div className="lg:col-span-8 space-y-6">
            {/* Business Info Banner */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="w-24 h-4 rounded-md" />
                  <Skeleton className="w-48 h-6 rounded-md" />
                  <Skeleton className="w-36 h-4 rounded-md" />
                </div>
              </div>
              <Skeleton className="w-40 h-10 rounded-xl" />
            </div>

            {/* Review Form Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-8">
              <Skeleton className="w-full h-16 rounded-2xl" />
              
              <div className="space-y-3">
                <Skeleton className="w-56 h-5 rounded-md" />
                <Skeleton className="w-full h-20 rounded-2xl" />
              </div>

              <div className="space-y-3">
                <Skeleton className="w-40 h-5 rounded-md" />
                <Skeleton className="w-full h-12 rounded-2xl" />
              </div>

              <div className="space-y-3">
                <Skeleton className="w-52 h-5 rounded-md" />
                <Skeleton className="w-full h-40 rounded-2xl" />
              </div>

              <div className="space-y-3">
                <Skeleton className="w-36 h-5 rounded-md" />
                <div className="grid grid-cols-4 gap-3">
                  <Skeleton className="w-full h-24 rounded-2xl" />
                  <Skeleton className="w-full h-24 rounded-2xl" />
                  <Skeleton className="w-full h-24 rounded-2xl" />
                  <Skeleton className="w-full h-24 rounded-2xl" />
                </div>
              </div>

              <Skeleton className="w-full h-12 rounded-2xl" />
              <div className="flex justify-end gap-4">
                <Skeleton className="w-28 h-12 rounded-2xl" />
                <Skeleton className="w-44 h-12 rounded-2xl" />
              </div>
            </div>
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <Skeleton className="w-44 h-6 rounded-md" />
              <Skeleton className="w-full h-16 rounded-xl" />
              <Skeleton className="w-full h-16 rounded-xl" />
              <Skeleton className="w-full h-16 rounded-xl" />
            </div>

            <Skeleton className="w-full h-40 rounded-3xl" />
          </div>

        </div>
      </main>
    </div>
  );
}
