"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import {
  Star,
  Camera,
  ThumbsUp,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Building2,
  ExternalLink,
  ChevronRight,
  X,
  Share2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/api-client";
import { categoryDisplayName } from "@/lib/slug";
import {
  formatRelativeDate,
  type PublicUserProfileData,
  type PublicUserReview,
} from "@/lib/api-profile";

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatJoinDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Baru-baru ini";
  }
}

export default function UserProfileClient({
  profile,
}: {
  profile: PublicUserProfileData;
}) {
  const [sortOption, setSortOption] = useState<"newest" | "highest" | "lowest">("newest");
  const [activePhotoModal, setActivePhotoModal] = useState<{
    photos: string[];
    index: number;
  } | null>(null);

  const { user, stats, reviews } = profile;

  // Sorting logic
  const sortedReviews = useMemo(() => {
    const copy = [...reviews];
    if (sortOption === "highest") {
      return copy.sort((a, b) => b.rating - a.rating);
    }
    if (sortOption === "lowest") {
      return copy.sort((a, b) => a.rating - b.rating);
    }
    // newest default
    return copy.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [reviews, sortOption]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      toast.success("Tautan profil berhasil disalin ke clipboard!");
    }
  };

  const userAvatarUrl = resolveMediaUrl(user.avatar_url);
  const initials = getInitials(user.name);

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col font-sans text-slate-800">
      <Navbar />

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#008767] transition-colors">
            Utama
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link href="/ulasan" className="hover:text-[#008767] transition-colors">
            Komunitas Reviewer
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-semibold truncate max-w-[200px]">
            {user.name}
          </span>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Back Link */}
        <div>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#008767] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        </div>

        {/* Hero Customer Profile Card */}
        <section className="relative overflow-hidden bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10">
          {/* Subtle decorative background gradient */}
          <div className="absolute top-0 left-0 right-0 h-32 sm:h-36 bg-gradient-to-r from-[#008767]/15 via-[#00a880]/10 to-teal-500/10 pointer-events-none" />

          <div className="relative pt-6 sm:pt-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            {/* Avatar & User Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 w-full sm:w-auto">
              {/* Profile Avatar */}
              <div className="relative shrink-0">
                {userAvatarUrl ? (
                  <img
                    src={userAvatarUrl}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-md ring-4 ring-white border border-slate-200"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#008767] to-[#00b087] text-white flex items-center justify-center font-extrabold text-3xl sm:text-4xl shadow-md ring-4 ring-white border border-slate-200">
                    {initials}
                  </div>
                )}
                <div
                  className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white shadow-xs"
                  title="Member Terverifikasi"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>

              {/* Identity & Badges */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {user.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ecf8f3] text-[#008767] border border-[#008767]/20">
                    <Sparkles className="w-3 h-3" />
                    Reviewer Katamereka
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Bergabung sejak {formatJoinDate(user.created_at)}</span>
                </p>
              </div>
            </div>

            {/* Action buttons (Share) */}
            <div className="flex items-center gap-3 w-full sm:w-auto self-start sm:self-center">
              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <Share2 className="w-4 h-4 text-slate-500" />
                Bagikan Profil
              </button>
            </div>
          </div>

          {/* Stats Bar ala Google Maps */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-8 pt-8 border-t border-slate-100">
            <div className="bg-[#f9fbfb] rounded-2xl p-4 sm:p-5 border border-slate-200/70 text-center sm:text-left transition-all hover:border-[#008767]/30">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto sm:mx-0 mb-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {stats.total_reviews}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 font-medium">
                Total Ulasan
              </div>
            </div>

            <div className="bg-[#f9fbfb] rounded-2xl p-4 sm:p-5 border border-slate-200/70 text-center sm:text-left transition-all hover:border-[#008767]/30">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto sm:mx-0 mb-2">
                <Camera className="w-4 h-4" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {stats.total_photos}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 font-medium">
                Foto Dibagikan
              </div>
            </div>

            <div className="bg-[#f9fbfb] rounded-2xl p-4 sm:p-5 border border-slate-200/70 text-center sm:text-left transition-all hover:border-[#008767]/30">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto sm:mx-0 mb-2">
                <ThumbsUp className="w-4 h-4" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {stats.total_helpful_votes}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 font-medium">
                Vote Bermanfaat
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section Header & Controls */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span>Tempat yang Pernah Diulas</span>
                <span className="text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {reviews.length} bisnis
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Semua ulasan dan pengalaman nyata yang ditulis oleh {user.name}
              </p>
            </div>

            {/* Sort Dropdown */}
            {reviews.length > 1 && (
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-xs text-slate-500 font-medium">Urutkan:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008767]/20 cursor-pointer shadow-2xs"
                >
                  <option value="newest">Ulasan Terbaru</option>
                  <option value="highest">Rating Tertinggi (5 ★)</option>
                  <option value="lowest">Rating Terendah (1 ★)</option>
                </select>
              </div>
            )}
          </div>

          {/* Reviews List */}
          {sortedReviews.length > 0 ? (
            <div className="space-y-4">
              {sortedReviews.map((rev) => {
                const biz = rev.business;
                const bizLogoUrl = resolveMediaUrl(biz?.logo_url);
                const hasPhotos = Array.isArray(rev.photos) && rev.photos.length > 0;

                return (
                  <article
                    key={rev.id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs hover:border-slate-300 hover:shadow-md transition-all space-y-4"
                  >
                    {/* Business Context Header Banner */}
                    {biz ? (
                      <div className="flex items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-[#f8faf9] border border-slate-200/70 group/biz">
                        <Link
                          href={`/business/${biz.slug}`}
                          className="flex items-center gap-3 min-w-0"
                        >
                          {bizLogoUrl ? (
                            <img
                              src={bizLogoUrl}
                              alt={biz.name}
                              className="w-11 h-11 rounded-xl object-cover shrink-0 bg-white border border-slate-200 shadow-2xs"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#008767] to-[#00a880] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                              {biz.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0 space-y-0.5">
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover/biz:text-[#008767] transition-colors truncate">
                              {biz.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                              {biz.category && (
                                <span className="font-medium text-[#008767]">
                                  {categoryDisplayName(biz.category)}
                                </span>
                              )}
                              {biz.city && (
                                <>
                                  <span className="text-slate-300">·</span>
                                  <span className="flex items-center gap-1 truncate">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                    {biz.city}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>

                        <Link
                          href={`/business/${biz.slug}`}
                          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[#008767] group-hover/biz:bg-[#008767] group-hover/biz:text-white transition-all text-xs font-semibold shadow-2xs"
                        >
                          <span className="hidden sm:inline">Lihat Bisnis</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">
                        Bisnis tidak tersedia atau telah dihapus
                      </div>
                    )}

                    {/* Review Rating & Timestamp */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className="flex items-center gap-0.5"
                          role="img"
                          aria-label={`Rating ${rev.rating} dari 5`}
                        >
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i <= rev.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200 fill-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {rev.rating.toFixed(1)}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {formatRelativeDate(rev.created_at)}
                        </span>
                      </div>

                      {rev.helpful_count > 0 && (
                        <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium shrink-0">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{rev.helpful_count} terbantu</span>
                        </div>
                      )}
                    </div>

                    {/* Review Body */}
                    {rev.title && (
                      <h4 className="font-bold text-slate-900 text-base sm:text-lg leading-snug">
                        &ldquo;{rev.title}&rdquo;
                      </h4>
                    )}

                    {rev.content && (
                      <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                        {rev.content}
                      </p>
                    )}

                    {/* Review Photos Grid */}
                    {hasPhotos && (
                      <div className="pt-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
                          <Camera className="w-3.5 h-3.5 text-slate-400" />
                          <span>Foto dari pengalaman ({rev.photos.length})</span>
                        </div>
                        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                          {rev.photos.map((photo, pIdx) => {
                            const pUrl = resolveMediaUrl(photo);
                            return (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() =>
                                  setActivePhotoModal({
                                    photos: rev.photos.map(resolveMediaUrl),
                                    index: pIdx,
                                  })
                                }
                                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-200 group cursor-pointer hover:opacity-95 transition-all shadow-2xs"
                              >
                                <img
                                  src={pUrl}
                                  alt={`Foto ulasan ${pIdx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Business Owner Reply */}
                    {rev.business_reply && (
                      <div className="bg-[#f0f9f6] rounded-2xl p-4 sm:p-5 border border-[#008767]/20 space-y-2 mt-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-[#008767] text-white flex items-center justify-center shrink-0">
                              <Building2 className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-[#008767]">
                              Tanggapan dari {biz?.name || "Pemilik Bisnis"}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {formatRelativeDate(rev.business_reply.created_at)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-8">
                          {rev.business_reply.content}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Belum Ada Ulasan Publik
                </h3>
                <p className="text-xs text-slate-500">
                  Pengguna ini belum membagikan ulasan publik untuk bisnis mana pun.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#008767] text-white text-xs sm:text-sm font-semibold hover:bg-[#007458] transition-colors shadow-sm"
              >
                Jelajahi Bisnis Katamereka
              </Link>
            </div>
          )}
        </section>
      </main>

      {/* Lightbox / Photo Viewer Modal */}
      {activePhotoModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActivePhotoModal(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={activePhotoModal.photos[activePhotoModal.index]}
              alt="Tampilan Foto Ulasan"
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />

            {activePhotoModal.photos.length > 1 && (
              <div className="flex items-center gap-3 mt-4 text-white text-xs font-semibold">
                <button
                  onClick={() =>
                    setActivePhotoModal((prev) =>
                      prev
                        ? {
                            ...prev,
                            index:
                              (prev.index - 1 + prev.photos.length) %
                              prev.photos.length,
                          }
                        : null
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
                >
                  Sebelumnya
                </button>
                <span>
                  {activePhotoModal.index + 1} / {activePhotoModal.photos.length}
                </span>
                <button
                  onClick={() =>
                    setActivePhotoModal((prev) =>
                      prev
                        ? {
                            ...prev,
                            index: (prev.index + 1) % prev.photos.length,
                          }
                        : null
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer minimal */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Katamereka. Rekomendasi & Ulasan Bisnis Terpercaya Indonesia.</p>
          <div className="flex items-center gap-4">
            <Link href="/bantuan" className="hover:text-[#008767] transition-colors">
              Pusat Bantuan
            </Link>
            <Link href="/tentang-kami" className="hover:text-[#008767] transition-colors">
              Tentang Kami
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
