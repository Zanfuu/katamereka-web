"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Lock, LogIn, MessageSquareText, Star } from "lucide-react";
import Navbar from "@/components/navbar";
import PublicReviewCard from "@/components/public-review-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { fetchLatestReviews, type ApiLatestReview } from "@/lib/api-client";

/** Reviews a visitor can read without an account. */
const GUEST_LIMIT = 6;
const MEMBER_PAGE_SIZE = 12;
const LOGIN_HREF = "/login?redirect=/review";

/**
 * /review without ?business= — every published review across all businesses,
 * newest first. Guests only get the first GUEST_LIMIT (the API is never asked
 * for more); logging in unlocks the rating filter and the rest of the list.
 */
export default function AllReviewsView() {
  const { isLoggedIn, isAuthReady } = useAuth();
  const [reviews, setReviews] = useState<ApiLatestReview[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(
    async (nextPage: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setFailed(false);

      const res = await fetchLatestReviews({
        limit: isLoggedIn ? MEMBER_PAGE_SIZE : GUEST_LIMIT,
        page: nextPage,
        rating: isLoggedIn && rating ? rating : undefined,
      });

      if (!res) {
        setFailed(true);
      } else {
        setReviews((prev) => (append ? [...prev, ...res.data] : res.data));
        setPage(res.pagination?.page ?? nextPage);
        setTotalPages(res.pagination?.total_pages ?? 1);
        setTotal(res.pagination?.total ?? res.data.length);
      }
      setLoading(false);
      setLoadingMore(false);
    },
    [isLoggedIn, rating]
  );

  useEffect(() => {
    if (!isAuthReady) return;
    void load(1, false);
  }, [isAuthReady, load]);

  const hiddenCount = Math.max(total - reviews.length, 0);
  const showGate = !isLoggedIn && isAuthReady && !loading && hiddenCount > 0;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        <div className="space-y-1.5">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Semua Ulasan
          </h1>
          <p className="text-sm text-slate-500">
            Ulasan terbaru dari pelanggan untuk berbagai bisnis di Katamereka.
            {total > 0 && ` ${total.toLocaleString("id-ID")} ulasan tersedia.`}
          </p>
        </div>

        {isLoggedIn ? (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter rating">
            {[null, 5, 4, 3, 2, 1].map((r) => {
              const active = rating === r;
              return (
                <button
                  key={r ?? "all"}
                  type="button"
                  onClick={() => setRating(r)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? "bg-[#008767] border-[#008767] text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:border-[#008767] hover:text-[#008767]"
                  }`}
                >
                  {r === null ? (
                    "Semua"
                  ) : (
                    <>
                      {r}
                      <Star className={`w-3 h-3 ${active ? "fill-white" : "fill-amber-400 text-amber-400"}`} />
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-3xl" />
            ))}
          </div>
        ) : failed ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
            <p className="text-sm text-slate-600">Ulasan gagal dimuat. Periksa koneksi lalu coba lagi.</p>
            <button
              type="button"
              onClick={() => void load(1, false)}
              className="px-5 py-2 rounded-full bg-[#008767] hover:bg-[#007458] text-white text-xs font-bold cursor-pointer"
            >
              Coba lagi
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-2">
            <MessageSquareText className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm text-slate-600">
              {rating ? `Belum ada ulasan dengan rating ${rating} bintang.` : "Belum ada ulasan."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {reviews.map((review) => (
              <PublicReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        {showGate && (
          <div className="bg-[#f0faf7] border border-[#008767]/20 rounded-3xl p-6 sm:p-8 text-center space-y-3">
            <div className="w-11 h-11 rounded-full bg-white text-[#008767] flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-900 text-base sm:text-lg">
              Masuk untuk melihat {hiddenCount.toLocaleString("id-ID")} ulasan lainnya
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Login gratis untuk membaca seluruh ulasan, memfilter berdasarkan rating, dan menulis ulasanmu sendiri.
            </p>
            <Link
              href={LOGIN_HREF}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#008767] hover:bg-[#007458] text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              Masuk untuk Melihat Lebih Banyak
            </Link>
          </div>
        )}

        {isLoggedIn && !loading && !failed && page < totalPages && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => void load(page + 1, true)}
              className="px-6 py-2.5 rounded-full border border-[#008767] text-[#008767] hover:bg-[#008767] hover:text-white font-semibold text-xs sm:text-sm transition-all disabled:opacity-60 cursor-pointer"
            >
              {loadingMore ? "Memuat..." : "Muat lebih banyak"}
            </button>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Katamereka. Platform Review Bisnis Terpercaya No. 1 Indonesia.</p>
        </div>
      </footer>
    </div>
  );
}
