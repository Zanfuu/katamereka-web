"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Star,
  ArrowLeft,
  ArrowUp,
  ThumbsUp,
  Trash2,
  Edit3,
  MessageSquare,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Building2,
  MapPin,
  Calendar,
  X,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/navbar";
import { useAuth } from "@/lib/auth-context";
import {
  fetchBusinessBySlug,
  API_BASE_URL,
  ApiBusinessDetail,
  ApiReviewSummary,
  resolveMediaUrl,
} from "@/lib/api-client";
import { deleteReview, toggleReviewHelpful, fetchMyHelpfulVotes, getLocalHelpfulVotes, getCachedHelpfulCount, saveLocalHelpfulVote } from "@/lib/api-profile";
import { getCleanCategory, slugify } from "@/lib/slug";
import { getBusinessBySlug } from "@/lib/mock-data";
import { toast } from "sonner";
import { LoginDialog } from "@/components/login-dialog";


interface ReviewItem {
  id: string;
  rating: number;
  title?: string;
  content: string;
  status?: string;
  created_at?: string;
  createdAt?: string;
  user?: { id?: string; name?: string; initials?: string };
  userId?: string;
  helpfulCount?: number;
  helpful_count?: number;
  business_reply?: {
    id?: string;
    content?: string;
    reply?: string;
    created_at?: string;
    replied_at?: string;
  } | null;
  reply?: {
    id?: string;
    content?: string;
    reply?: string;
    created_at?: string;
  } | string | null;
}

// `initialBusiness` / `initialReviews` are fetched by the server component
// (page.tsx) so the first HTML response already contains the business header,
// rating summary and every review — see the note in business-profile-client.tsx.
export default function BusinessReviewsPage({
  initialBusiness = null,
  initialReviews = [],
  initialReviewSummary = null,
}: {
  initialBusiness?: ApiBusinessDetail | null;
  initialReviews?: ReviewItem[];
  initialReviewSummary?: ApiReviewSummary | null;
}) {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const { user } = useAuth();

  const hasInitialData = Boolean(initialBusiness);
  const [business, setBusiness] = useState<ApiBusinessDetail | null>(initialBusiness);
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [reviewSummary, setReviewSummary] = useState<ApiReviewSummary | null>(initialReviewSummary ?? null);
  const [loading, setLoading] = useState<boolean>(!initialBusiness);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<"newest" | "highest" | "lowest">("newest");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [mobileRatingModalOpen, setMobileRatingModalOpen] = useState<boolean>(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState<boolean>(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState<boolean>(false);
  const [myHelpfulVoteIds, setMyHelpfulVoteIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const local = getLocalHelpfulVotes();
    if (local.length > 0) {
      setMyHelpfulVoteIds(new Set(local));
    }

    if (user) {
      fetchMyHelpfulVotes().then((ids) => {
        if (Array.isArray(ids)) {
          setMyHelpfulVoteIds(new Set(ids));
        }
      });
    }

    const handleHelpfulChanged = (e: any) => {
      const { reviewId, isHelpful } = e.detail || {};
      if (reviewId) {
        setMyHelpfulVoteIds((prev) => {
          const next = new Set(prev);
          if (isHelpful) next.add(reviewId);
          else next.delete(reviewId);
          return next;
        });
      }
    };
    window.addEventListener("km_helpful_changed", handleHelpfulChanged);
    return () => window.removeEventListener("km_helpful_changed", handleHelpfulChanged);
  }, [user]);

  // Fetch business detail and reviews
  useEffect(() => {
    if (!slug) return;
    let isMounted = true;
    // Refresh silently when the server already rendered the content.
    if (!hasInitialData) setLoading(true);

    const loadData = async () => {
      try {
        const decodedSlug = decodeURIComponent(slug).trim();
        const res = await fetchBusinessBySlug(decodedSlug);
        const bizData = res?.data;

        if (isMounted) {
          if (bizData) {
            setBusiness(bizData);
          } else if (!hasInitialData) {
            // Fallback to mock-data
            const mock = getBusinessBySlug(decodedSlug);
            setBusiness(mock as any);
          }
        }

        const bizId = bizData?.id || decodedSlug;
        if (bizId) {
          const [revRes, sumRes] = await Promise.all([
            fetch(`${API_BASE_URL}/businesses/${bizId}/reviews`, { cache: "no-store" }),
            fetch(`${API_BASE_URL}/businesses/${bizId}/review-summary`, { cache: "no-store" }),
          ]);
          if (revRes.ok) {
            const revData = await revRes.json();
            if (isMounted) {
              const list = Array.isArray(revData?.data)
                ? revData.data
                : Array.isArray(revData?.reviews)
                  ? revData.reviews
                  : [];
              setReviews(list);
            }
          }
          if (sumRes.ok) {
            const sumData = await sumRes.json();
            if (isMounted && sumData && typeof sumData.review_count === "number") {
              setReviewSummary(sumData);
            }
          }
        }
      } catch (err) {
        console.error("Error loading reviews:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Derived business display info
  const businessName = business?.name || getBusinessBySlug(slug)?.name || slug;
  const rawRating =
    reviewSummary?.average_rating ??
    business?.rating ??
    business?.averageRating ??
    (business as any)?.average_rating ??
    business?.externalRating ??
    0;
  const initialRating = typeof rawRating === "number" ? rawRating : parseFloat(String(rawRating || 0));

  const actualRating = useMemo(() => {
    if (reviewSummary?.average_rating && reviewSummary.average_rating > 0) {
      return reviewSummary.average_rating;
    }
    if (!isNaN(initialRating) && initialRating > 0) {
      return initialRating > 5 ? parseFloat((initialRating / 2).toFixed(1)) : initialRating;
    }
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => {
        const rat = typeof r.rating === "number" ? r.rating : parseFloat(String(r.rating ?? 0));
        return acc + (isNaN(rat) ? 0 : rat);
      }, 0);
      return parseFloat((sum / reviews.length).toFixed(1));
    }
    return 0;
  }, [reviewSummary, initialRating, reviews]);

  const ratingFormatted = actualRating > 0 ? actualRating.toFixed(1) : "0.0";
  const businessTotalReviews =
    reviewSummary?.review_count ??
    Number((business as any)?.review_count ?? business?.reviews_count ?? (business as any)?.reviewCount ?? 0);
  const totalReviewsCount = businessTotalReviews > 0 ? businessTotalReviews : reviews.length;

  // Rating distribution counts (1 to 5 stars)
  const ratingDistribution = useMemo(() => {
    if (reviewSummary?.distribution) {
      return {
        5: Number(reviewSummary.distribution["5"] || 0),
        4: Number(reviewSummary.distribution["4"] || 0),
        3: Number(reviewSummary.distribution["3"] || 0),
        2: Number(reviewSummary.distribution["2"] || 0),
        1: Number(reviewSummary.distribution["1"] || 0),
      };
    }
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rat = Math.round(typeof r.rating === "number" ? r.rating : parseFloat(String(r.rating ?? 0)));
      if (rat >= 1 && rat <= 5) {
        counts[rat] = (counts[rat] || 0) + 1;
      }
    });
    return counts;
  }, [reviewSummary, reviews]);

  // Filter & Sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];

    if (selectedRatingFilter !== null) {
      result = result.filter((r) => {
        const rat = Math.round(typeof r.rating === "number" ? r.rating : parseFloat(String(r.rating ?? 0)));
        return rat === selectedRatingFilter;
      });
    }

    result.sort((a, b) => {
      if (sortOption === "highest") {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortOption === "lowest") {
        return (a.rating || 0) - (b.rating || 0);
      }
      // "newest" by default
      const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
      const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return result;
  }, [reviews, selectedRatingFilter, sortOption]);

  const handleDeleteReview = async (reviewId: string) => {
    setDeletingReviewId(reviewId);
    try {
      const res = await deleteReview(reviewId);
      if (res?.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        toast.success("Ulasan berhasil dihapus");
      } else {
        toast.error(res?.message || "Gagal menghapus ulasan");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus ulasan");
    } finally {
      setDeletingReviewId(null);
      setConfirmDeleteId(null);
    }
  };

  const categoryName = getCleanCategory(
    (business as any)?.categories,
    business?.category
  ) || "Bisnis";

  const renderRatingSummaryContent = (isMobileModal = false) => (
    <div className="space-y-5">
      {/* Score Banner */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center flex-shrink-0">
          <Star className="w-9 h-9 fill-amber-400 text-amber-400" />
        </div>
        <div>
          <div className="text-3xl font-extrabold text-slate-900 leading-none">
            {actualRating > 0 ? ratingFormatted : "-"}
            <span className="text-sm font-normal text-slate-400 ml-1">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.round(actualRating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-slate-200 text-slate-200"
                  }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Berdasarkan {totalReviewsCount} ulasan
          </p>
        </div>
      </div>

      {/* Distribution Bars */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = ratingDistribution[star] || 0;
          const percent =
            reviews.length > 0
              ? Math.round((count / reviews.length) * 100)
              : 0;
          const isSelected = selectedRatingFilter === star;

          return (
            <button
              key={star}
              type="button"
              onClick={() => {
                setSelectedRatingFilter(isSelected ? null : star);
                if (isMobileModal) setMobileRatingModalOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 text-xs py-1 px-1.5 rounded-lg transition-colors cursor-pointer text-left ${isSelected
                  ? "bg-emerald-50 text-[#008767] font-semibold"
                  : "hover:bg-slate-50 text-slate-600"
                }`}
              title={`Filter ulasan ${star} bintang`}
            >
              <span className="w-12 font-medium flex items-center gap-1 flex-shrink-0">
                <span>{star}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-8 text-right text-slate-400 font-mono text-[11px] flex-shrink-0">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter reset button if active */}
      {selectedRatingFilter !== null && (
        <button
          onClick={() => {
            setSelectedRatingFilter(null);
            if (isMobileModal) setMobileRatingModalOpen(false);
          }}
          className="w-full py-2 rounded-xl text-xs font-semibold text-[#008767] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
        >
          Tampilkan Semua Bintang
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans flex flex-col justify-between">
      <div>
        <Navbar />

        {/* ================= BREADCRUMBS ================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-[#008767] transition-colors">
              Beranda
            </Link>
            <span className="text-slate-400">&gt;</span>
            <Link href="/businesses" className="hover:text-[#008767] transition-colors">
              Kategori
            </Link>
            <span className="text-slate-400">&gt;</span>
            <Link
              href={`/kategori/${slugify(categoryName)}`}
              className="hover:text-[#008767] transition-colors"
            >
              {categoryName}
            </Link>
            <span className="text-slate-400">&gt;</span>
            <Link
              href={`/business/${slug}`}
              className="hover:text-[#008767] transition-colors truncate max-w-xs"
            >
              {businessName}
            </Link>
            <span className="text-slate-400 hidden sm:inline">&gt;</span>
            <span className="text-slate-700 font-semibold hidden sm:inline">Semua Ulasan</span>
          </nav>
        </div>

        {/* ================= HEADER HERO ================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Link
                  href={`/business/${slug}`}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#008767] hover:underline mb-2.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Profil {businessName}</span>
                </Link>
                <div className="flex items-center sm:items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#008767] text-white flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0">
                    {businessName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                      <span className="hidden sm:inline">Semua Ulasan: </span>
                      {businessName}
                    </h1>
                    <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="inline-flex items-center gap-1 font-medium text-[#008767] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        <Building2 className="w-3 h-3" />
                        {categoryName}
                      </span>
                      {business?.city && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {business.city}
                          {business.province ? `, ${business.province}` : ""}
                        </span>
                      )}
                    </div>

                    {/* Mobile Button: aligned vertically directly under the text */}
                    <div className="pt-1.5 sm:hidden">
                      <Link
                        href={`/review?business=${slug}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#008767] hover:bg-[#007458] text-white text-xs font-semibold transition-all shadow-md shadow-[#008767]/20 cursor-pointer active:scale-95"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Tulis Ulasan</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Button: on the right side */}
              <div className="hidden sm:flex items-center gap-3 flex-wrap">
                <Link
                  href={`/review?business=${slug}`}
                  className="px-5 py-2.5 rounded-2xl bg-[#008767] hover:bg-[#007458] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-[#008767]/20 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Tulis Ulasan</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT / TOP: RATING SUMMARY & DISTRIBUTION (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5 sticky top-24">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base border-b border-slate-100 pb-3">
                  <MessageSquare className="w-4 h-4 text-[#008767]" />
                  <span>Ringkasan Rating</span>
                </div>
                {renderRatingSummaryContent(false)}
              </div>
            </div>

            {/* RIGHT / MAIN: REVIEWS LIST */}
            <div className="col-span-1 lg:col-span-8 space-y-5">

              {/* FILTER & SORT BAR */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs flex flex-row items-center justify-between gap-2.5 sm:gap-3">
                {/* Custom Filter Dropdown */}
                <div className="relative flex-1 sm:flex-initial">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterDropdownOpen(!filterDropdownOpen);
                      setSortDropdownOpen(false);
                    }}
                    className="w-full sm:w-auto h-10 inline-flex items-center justify-between gap-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 sm:px-3.5 focus:outline-none focus:border-[#008767] cursor-pointer transition-colors whitespace-nowrap"
                  >
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      {selectedRatingFilter === null ? (
                        <span>Semua Bintang</span>
                      ) : (
                        <>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                          <span>{selectedRatingFilter} Bintang</span>
                        </>
                      )}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform flex-shrink-0 ${filterDropdownOpen ? "rotate-180 text-[#008767]" : ""}`} />
                  </button>

                  {filterDropdownOpen && (
                    <>
                      {/* Click outside backdrop */}
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setFilterDropdownOpen(false)}
                      />
                      {/* Dropdown Menu */}
                      <div className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-1.5 z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRatingFilter(null);
                            setFilterDropdownOpen(false);
                          }}
                          className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${selectedRatingFilter === null
                              ? "bg-emerald-50 text-[#008767] font-semibold"
                              : "hover:bg-slate-50 text-slate-700"
                            }`}
                        >
                          <span>Semua Bintang</span>
                        </button>

                        {[5, 4, 3, 2, 1].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => {
                              setSelectedRatingFilter(star);
                              setFilterDropdownOpen(false);
                            }}
                            className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${selectedRatingFilter === star
                                ? "bg-emerald-50 text-[#008767] font-semibold"
                                : "hover:bg-slate-50 text-slate-700"
                              }`}
                          >
                            <span className="inline-flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                              <span className="font-semibold text-slate-800">{star}</span>
                              <span className="text-slate-500 text-[11px]">Bintang</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Custom Sort Dropdown */}
                <div className="relative flex-1 sm:flex-initial">
                  <button
                    type="button"
                    onClick={() => {
                      setSortDropdownOpen(!sortDropdownOpen);
                      setFilterDropdownOpen(false);
                    }}
                    className="w-full sm:w-auto h-10 inline-flex items-center justify-between gap-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 sm:px-3.5 focus:outline-none focus:border-[#008767] cursor-pointer transition-colors whitespace-nowrap"
                  >
                    <span className="whitespace-nowrap">
                      {sortOption === "newest"
                        ? "Terbaru"
                        : sortOption === "highest"
                          ? "Rating Tertinggi"
                          : "Rating Terendah"}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform flex-shrink-0 ${sortDropdownOpen ? "rotate-180 text-[#008767]" : ""}`} />
                  </button>

                  {sortDropdownOpen && (
                    <>
                      {/* Click outside backdrop */}
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setSortDropdownOpen(false)}
                      />
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-1.5 z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                        {(
                          [
                            { value: "newest", label: "Terbaru" },
                            { value: "highest", label: "Rating Tertinggi" },
                            { value: "lowest", label: "Rating Terendah" },
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setSortOption(opt.value);
                              setSortDropdownOpen(false);
                            }}
                            className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${sortOption === opt.value
                                ? "bg-emerald-50 text-[#008767] font-semibold"
                                : "hover:bg-slate-50 text-slate-700"
                              }`}
                          >
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* REVIEW CARDS OR LOADING */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 animate-pulse"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-slate-200 rounded-md w-1/4" />
                          <div className="h-3 bg-slate-200 rounded-md w-1/6" />
                        </div>
                      </div>
                      <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                      <div className="h-12 bg-slate-100 rounded-xl w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredAndSortedReviews.length > 0 ? (
                <div className="space-y-4">
                  {filteredAndSortedReviews.map((rev) => (
                    <ReviewCardItem
                      key={rev.id}
                      review={rev}
                      businessSlug={slug}
                      currentUserId={user?.id}
                      isInitiallyHelpful={myHelpfulVoteIds.has(rev.id)}
                      onDelete={(id) => setConfirmDeleteId(id)}
                      isDeleting={deletingReviewId === rev.id}
                    />
                  ))}
                </div>
              ) : (
                /* EMPTY STATE */
                <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center space-y-4 shadow-xs">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-[#008767]">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5 max-w-sm mx-auto">
                    <h4 className="font-bold text-slate-800 text-base">
                      {selectedRatingFilter !== null
                        ? `Belum ada ulasan dengan rating ${selectedRatingFilter} bintang`
                        : "Belum Ada Ulasan"}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {selectedRatingFilter !== null
                        ? "Coba ganti filter bintang atau lihat semua ulasan."
                        : "Jadilah pelanggan pertama yang membagikan pengalaman mengenai bisnis ini."}
                    </p>
                  </div>
                  {selectedRatingFilter !== null ? (
                    <button
                      onClick={() => setSelectedRatingFilter(null)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  ) : (
                    <Link
                      href={`/review?business=${slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#008767] hover:bg-[#007458] text-white text-xs font-semibold transition-all shadow-md shadow-[#008767]/20 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Tulis Ulasan Pertama</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Katamereka. Semua hak dilindungi.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#008767] cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Kembali ke atas</span>
          </button>
        </div>
      </footer>

      {/* ================= MOBILE FLOATING RATING BADGE ================= */}
      <button
        type="button"
        onClick={() => setMobileRatingModalOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-white border-2 border-amber-300 text-slate-800 rounded-full w-14 h-14 shadow-2xl flex flex-col items-center justify-center p-1 cursor-pointer transition-transform active:scale-90 hover:scale-105 shadow-amber-500/25 ring-4 ring-amber-100/50"
        title="Ringkasan Rating Bisnis"
        aria-label="Ringkasan Rating Bisnis"
      >
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <span className="text-[12px] font-black text-slate-900 leading-none mt-0.5">
          {actualRating > 0 ? ratingFormatted : "-"}
        </span>
      </button>

      {/* ================= MOBILE RATING MODAL (BOTTOM SHEET) ================= */}
      {mobileRatingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setMobileRatingModalOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <MessageSquare className="w-4 h-4 text-[#008767]" />
                <span>Ringkasan Rating</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileRatingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {renderRatingSummaryContent(true)}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDeleteReview(confirmDeleteId)}
        isDeleting={Boolean(deletingReviewId)}
      />
    </div>
  );
}

// Review Card Item Component
interface ReviewCardItemProps {
  review: ReviewItem;
  businessSlug: string;
  currentUserId?: string;
  isInitiallyHelpful?: boolean;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

function ReviewCardItem({
  review,
  businessSlug,
  currentUserId,
  isInitiallyHelpful,
  onDelete,
  isDeleting,
}: ReviewCardItemProps) {
  const rating =
    typeof review.rating === "number"
      ? review.rating
      : parseFloat(String(review.rating ?? 0));
  const safeRating = isNaN(rating) ? 0 : Math.min(5, Math.max(0, rating));
  const initials =
    review.user?.initials ||
    review.user?.name
      ?.split(" ")
      .map((w: string) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() ||
    "U";
  const displayName = review.user?.name || "Pengguna";
  const userAvatar = (review.user as any)?.avatar_url || (review.user as any)?.avatarUrl || null;
  const userReviewsCount = (review.user as any)?.reviews_count ?? (review.user as any)?.reviewsCount ?? 1;
  const userPhotosCount = (review.user as any)?.photos_count ?? (review.user as any)?.photosCount ?? 0;
  const reviewerUserId = review.user?.id || (review as any).userId;
  const isOwnReview = Boolean(
    currentUserId &&
    (review.user?.id === currentUserId || review.userId === currentUserId)
  );

  const [isHelpful, setIsHelpful] = useState<boolean>(Boolean(isInitiallyHelpful));
  const cachedCount = getCachedHelpfulCount(review.id);
  const rawCount = review.helpfulCount ?? (review as any).helpful_count ?? 0;
  const initialHelpfulCount = Math.max(
    rawCount,
    cachedCount ?? 0,
    isInitiallyHelpful ? 1 : 0
  );
  const [helpfulCount, setHelpfulCount] = useState<number>(initialHelpfulCount);
  const [helpfulLoading, setHelpfulLoading] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  useEffect(() => {
    const cached = getCachedHelpfulCount(review.id);
    const count = Math.max(
      review.helpfulCount ?? (review as any).helpful_count ?? 0,
      cached ?? 0,
      isHelpful ? 1 : 0
    );
    setHelpfulCount(count);
  }, [review.id, review.helpfulCount, (review as any).helpful_count, isHelpful]);

  useEffect(() => {
    if (isInitiallyHelpful !== undefined) {
      setIsHelpful(Boolean(isInitiallyHelpful));
      if (isInitiallyHelpful) {
        setHelpfulCount((prev) => Math.max(1, prev));
      }
    }
  }, [isInitiallyHelpful]);

  useEffect(() => {
    const onHelpfulChange = (e: any) => {
      if (e.detail?.reviewId === review.id) {
        setIsHelpful(Boolean(e.detail.isHelpful));
        if (typeof e.detail.helpfulCount === "number") {
          setHelpfulCount(e.detail.helpfulCount);
        } else if (e.detail.isHelpful) {
          setHelpfulCount((prev) => Math.max(1, prev));
        } else {
          setHelpfulCount((prev) => Math.max(0, prev - 1));
        }
      }
    };
    window.addEventListener("km_helpful_changed", onHelpfulChange);
    return () => window.removeEventListener("km_helpful_changed", onHelpfulChange);
  }, [review.id]);

  const toggleHelpful = async () => {
    if (helpfulLoading) return;
    if (!currentUserId) {
      setShowLoginModal(true);
      return;
    }
    if (isOwnReview) {
      toast.error("Anda tidak dapat menandai ulasan milik sendiri");
      return;
    }

    const nextState = !isHelpful;
    setIsHelpful(nextState);
    setHelpfulCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    setHelpfulLoading(true);

    try {
      const res = await toggleReviewHelpful(review.id);
      if (res && res.success) {
        const finalHelpful = typeof res.isHelpful === "boolean" ? res.isHelpful : (typeof res.is_helpful === "boolean" ? res.is_helpful : nextState);
        setIsHelpful(finalHelpful);
        let finalCount = typeof res.helpfulCount === "number" ? res.helpfulCount : (typeof res.helpful_count === "number" ? res.helpful_count : (finalHelpful ? 1 : 0));
        setHelpfulCount(finalCount);
        saveLocalHelpfulVote(review.id, finalHelpful, finalCount);
        toast.success(res.message || (finalHelpful ? "Ulasan ditandai bermanfaat" : "Batal menandai bermanfaat"));
      } else {
        // Rollback
        setIsHelpful(!nextState);
        setHelpfulCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
        toast.error(res?.message || "Gagal memperbarui vote helpful");
      }
    } catch {
      // Rollback
      setIsHelpful(!nextState);
      setHelpfulCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
      toast.error("Terjadi kesalahan saat memproses vote");
    } finally {
      setHelpfulLoading(false);
    }
  };

  function relativeDate(dateStr?: string) {
    if (!dateStr) return "Baru saja";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Baru saja";
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      if (diffSec < 60) return "Baru saja";
      if (diffMin < 60) return `${diffMin} menit lalu`;
      if (diffHour < 24) return `${diffHour} jam lalu`;
      if (diffDay < 7) return `${diffDay} hari lalu`;
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Baru saja";
    }
  }

  const dateValue =
    review.created_at || review.createdAt || (review as any).createdAt;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 space-y-3.5 shadow-xs hover:border-[#008767]/30 transition-colors">
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* User avatar (clickable to reviewer public profile) */}
        {reviewerUserId ? (
          <Link
            href={`/user/${reviewerUserId}`}
            className="flex-shrink-0 group/uav cursor-pointer"
            title={`Lihat profil ${displayName}`}
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover shadow-xs border border-slate-200 group-hover/uav:ring-2 group-hover/uav:ring-[#008767] transition-all"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#008767] text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover/uav:ring-2 group-hover/uav:ring-[#008767] transition-all">
                {initials}
              </div>
            )}
          </Link>
        ) : userAvatar ? (
          <img
            src={userAvatar}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-xs border border-slate-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#008767] text-white flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-xs">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {reviewerUserId ? (
              <Link
                href={`/user/${reviewerUserId}`}
                className="group/uname hover:underline max-w-[200px] truncate"
                title={`Lihat ulasan lain dari ${displayName}`}
              >
                <p className="font-bold text-slate-900 text-sm truncate group-hover/uname:text-[#008767] transition-colors">
                  {displayName}
                </p>
              </Link>
            ) : (
              <p className="font-bold text-slate-900 text-sm truncate" title={displayName}>
                {displayName}
              </p>
            )}
            {/* Rating Stars */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < safeRating
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200 fill-slate-200"
                    }`}
                />
              ))}
              <span className="text-xs font-bold text-slate-700 ml-1">
                {safeRating.toFixed(1)}
              </span>
            </div>
          </div>
          {/* Reviewer stats ala Google Maps: X ulasan · Y foto · waktu */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-0.5 flex-wrap">
            <span>{userReviewsCount} ulasan</span>
            {userPhotosCount > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span>{userPhotosCount} foto</span>
              </>
            )}
            <span className="text-slate-300">·</span>
            <span className="text-slate-400">{relativeDate(dateValue)}</span>
          </div>
        </div>
      </div>

      {/* Review body */}
      {review.title && (
        <p className="font-semibold text-slate-900 text-sm break-words">
          "{review.title}"
        </p>
      )}
      {review.content && (
        <p className="text-sm text-slate-600 leading-relaxed break-words whitespace-pre-line">
          {review.content}
        </p>
      )}

      {/* Review photos */}
      {Array.isArray((review as any).photos) && (review as any).photos.length > 0 && (
        <div className="flex gap-2 flex-wrap pt-1">
          {(review as any).photos.map((photo: string, idx: number) => (
            <a
              key={idx}
              href={resolveMediaUrl(photo)}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group rounded-xl overflow-hidden w-16 h-16 sm:w-20 sm:h-20 border border-slate-200 block shadow-2xs hover:border-[#008767] transition-all"
            >
              <img
                src={resolveMediaUrl(photo)}
                alt={`Foto ulasan ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </a>
          ))}
        </div>
      )}

      {/* Business Reply Box if any */}
      {(review.business_reply || (review as any).reply) && (
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 space-y-1.5 mt-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#008767]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Respon dari Pemilik Bisnis</span>
            </div>
            {(review.business_reply?.created_at || (review as any).reply?.created_at) && (
              <span className="text-[11px] font-normal text-slate-400">
                {relativeDate(review.business_reply?.created_at || (review as any).reply?.created_at)}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words">
            {review.business_reply?.content ||
              review.business_reply?.reply ||
              (review as any).reply?.content ||
              (typeof (review as any).reply === "string" ? (review as any).reply : "")}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={toggleHelpful}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer ${isHelpful
                ? "bg-emerald-50 text-[#008767] border-emerald-200"
                : "bg-white text-slate-600 border-slate-200/80 hover:border-[#008767]/40 hover:text-[#008767]"
              }`}
            title="Tandai ulasan ini bermanfaat"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isHelpful ? "fill-[#008767]" : ""}`} />
            <span>Helpful</span>
            {helpfulCount > 0 && <span className="font-bold">({helpfulCount})</span>}
          </button>

          {review.status === "APPROVED" ? (
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Terverifikasi
            </span>
          ) : review.status === "PENDING" ? (
            <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Menunggu Review
            </span>
          ) : null}
        </div>

        {isOwnReview && (
          <div className="flex items-center gap-2">
            {businessSlug && (
              <Link
                href={`/review?business=${businessSlug}`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#008767] hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors text-xs font-medium cursor-pointer"
                title="Edit Ulasan Saya"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Link>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(review.id)}
                disabled={isDeleting}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors text-xs font-medium cursor-pointer"
                title="Hapus Ulasan Saya"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            )}
          </div>
        )}
      </div>

      <LoginDialog
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        title="Masuk untuk Menandai Ulasan"
        description="Silakan masuk dengan akun Google untuk menandai ulasan ini bermanfaat."
      />
    </div>
  );
}

// ─── Delete Confirmation Modal Dialog ─────────────────────────────────────────
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-100 text-center space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
          <Trash2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900">Hapus Ulasan Ini?</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Apakah Anda yakin ingin menghapus ulasan ini? Tindakan ini tidak dapat
            dibatalkan dan ulasan akan dihapus secara permanen.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <span>Ya, Hapus</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
