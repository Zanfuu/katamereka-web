"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getBusinessBySlug } from "@/lib/mock-data";
import { fetchBusinessBySlug, ApiBusinessDetail } from "@/lib/api-client";
import {
  Search,
  ChevronDown,
  Star,
  CheckCircle2,
  ShieldCheck,
  Share2,
  Bookmark,
  Edit3,
  Wifi,
  Trees,
  Toilet,
  Car,
  CalendarCheck,
  Phone,
  MapPin,
  Clock,
  ImageIcon,
  ThumbsUp,
  MessageCircle,
  MoreVertical,
  AppWindow,
  Smartphone,
  ArrowUp,
  LayoutDashboard,
  MessageSquare
} from "lucide-react";
import Navbar from "@/components/navbar";
import { useAuth } from "@/lib/auth-context";

export default function BusinessProfilePage() {
  const params = useParams();
  const slug = (params.slug as string) || "sunny-cafe";
  const mockBusiness = getBusinessBySlug(slug);
  const { user } = useAuth();

  const [apiDetail, setApiDetail] = useState<ApiBusinessDetail | null>(null);

  useEffect(() => {
    async function loadApiBusinessDetail() {
      try {
        const res = await fetchBusinessBySlug(slug);
        if (res && res.data) {
          setApiDetail(res.data);
        }
      } catch (err) {
        // Fallback to mock data
      }
    }
    loadApiBusinessDetail();
  }, [slug]);

  const business = apiDetail
    ? {
        ...mockBusiness,
        id: apiDetail.id,
        name: apiDetail.name,
        slug: apiDetail.slug,
        category: apiDetail.category || mockBusiness.category,
        location: apiDetail.city ? `${apiDetail.city}, ${apiDetail.province}` : mockBusiness.location,
        address: apiDetail.address || mockBusiness.address,
        phone: apiDetail.phone || mockBusiness.phone,
        rating: apiDetail.rating ? (typeof apiDetail.rating === 'number' ? apiDetail.rating : parseFloat(apiDetail.rating)) : mockBusiness.rating,
        reviewCount: apiDetail.reviews_count || mockBusiness.reviewCount,
        reviewCountFormatted: `${apiDetail.reviews_count || mockBusiness.reviewCount} ulasan`,
      }
    : mockBusiness;

  const [activeTab, setActiveTab] = useState<"profil" | "review" | "foto" | "info">("profil");
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState<Record<number, number>>({ 1: 12, 2: 8, 3: 15, 4: 9, 5: 6, 6: 11 });
  const [likedState, setLikedState] = useState<Record<number, boolean>>({});
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const mockReviews = [
    {
      id: 1,
      author: "Dinda Putri",
      initials: "DP",
      color: "bg-emerald-100 border-emerald-200 text-emerald-800",
      time: "2 hari yang lalu",
      count: "1 ulasan",
      rating: 5,
      title: "Tempat yang nyaman dengan kopi yang enak",
      content: "Suasananya di sini benar-benar nyaman, cocok untuk kerja maupun sekadar nongkrong. Kopinya juga enak banget, terutama latte-nya. Pelayanannya ramah dan cepat.",
      hasImages: true,
    },
    {
      id: 2,
      author: "Rizky Maulana",
      initials: "RM",
      color: "bg-blue-100 border-blue-200 text-blue-800",
      time: "1 minggu yang lalu",
      count: "3 ulasan",
      rating: 4,
      title: "Tempatnya bagus, makanan juga enak",
      content: "Overall oke, cuma pas saya datang agak ramai jadi sedikit lama nunggu pesanan. Tapi tetap worth it, makanannya enak dan tempatnya cozy.",
      hasImages: false,
    },
    {
      id: 3,
      author: "Budi Santoso",
      initials: "BS",
      color: "bg-amber-100 border-amber-200 text-amber-800",
      time: "2 minggu yang lalu",
      count: "5 ulasan",
      rating: 5,
      title: "Pelayanan sangat profesional dan tepat waktu!",
      content: "Sangat terkesan dengan keramahan staf dan kebersihan lokasi ini. Semua kebutuhan saya fulfilled dengan cepat. Pasti kembali lagi.",
      hasImages: false,
    },
    {
      id: 4,
      author: "Maya Indah",
      initials: "MI",
      color: "bg-purple-100 border-purple-200 text-purple-800",
      time: "3 minggu yang lalu",
      count: "2 ulasan",
      rating: 5,
      title: "Sangat memuaskan, rekomendasi terbaik!",
      content: "Pengalaman terbaik sejauh ini. Fasilitas sangat lengkap, pencahayaan dan dekorasi ruangan bikin betah berlama-lama. Recommended!",
      hasImages: true,
    },
    {
      id: 5,
      author: "Hendra Wijaya",
      initials: "HW",
      color: "bg-rose-100 border-rose-200 text-rose-800",
      time: "1 bulan yang lalu",
      count: "8 ulasan",
      rating: 4,
      title: "Harga terjangkau dan kualitas mantap",
      content: "Sesuai dengan ekspektasi. Kualitas rasa dan pelayanan sebanding dengan harga yang ditawarkan. Tempat parkir juga cukup luas.",
      hasImages: false,
    },
    {
      id: 6,
      author: "Siti Rahma",
      initials: "SR",
      color: "bg-teal-100 border-teal-200 text-teal-800",
      time: "1 bulan yang lalu",
      count: "4 ulasan",
      rating: 5,
      title: "Lokasi strategis & staf sangat ramah",
      content: "Penjelasannya sangat detail saat ditanya rekomendasi terbaik. Tempatnya harum dan sangat terawat. Pengalaman bintang 5!",
      hasImages: false,
    },
  ];

  const toggleLike = (id: number) => {
    setLikedState((prev) => {
      const isAlreadyLiked = prev[id];
      setLikes((likesPrev) => ({
        ...likesPrev,
        [id]: isAlreadyLiked ? (likesPrev[id] || 0) - 1 : (likesPrev[id] || 0) + 1,
      }));
      return { ...prev, [id]: !isAlreadyLiked };
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans">
      <Navbar />

      {/* ================= HERO COVER & PROFILE CARD ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Cover Banner (Stylized Cover Container matching user request "tanpa foto external") */}
          <div className="h-44 sm:h-56 bg-gradient-to-r from-emerald-100 via-[#e0f4ee] to-teal-100/70 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#008767_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="text-center space-y-1 z-10 opacity-70">
              <p className="text-xl sm:text-2xl font-extrabold text-[#008767] tracking-wider uppercase">
                Good Food • Good Mood
              </p>
              <p className="text-xs text-slate-500 font-medium">Official Profile Banner</p>
            </div>
          </div>

          {/* Profile Details Bar */}
          <div className="p-6 sm:p-8 pt-0 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-12 sm:-mt-14">
              
              {/* Left: Avatar & Business Name */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                {/* Logo Box */}
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl shadow-lg border-4 border-white flex items-center justify-center font-bold text-2xl sm:text-3xl ${business.color}`}
                >
                  {business.initials}
                </div>

                {/* Name & Subtitle */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {business.name}
                    </h1>
                    <CheckCircle2 className="w-5 h-5 text-[#008767] fill-[#008767]/10" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                    {/* Rating */}
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{business.rating}</span>
                      <span className="text-slate-400 font-normal">
                        ({business.reviewCountFormatted})
                      </span>
                    </div>

                    {/* Verified Badge */}
                    {business.badge && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{business.badge}</span>
                      </span>
                    )}

                    {/* Category & Location */}
                    <span className="text-slate-500 font-medium">
                      📍 {business.category} • {business.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <Link
                  href={`/review?business=${slug}`}
                  className="px-6 py-3 rounded-xl bg-[#008767] hover:bg-[#007458] text-white font-semibold text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Tulis Review</span>
                </Link>

                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all border ${
                    isSaved
                      ? "bg-[#e8f6f2] text-[#008767] border-[#008767]/30"
                      : "bg-white text-slate-700 border-slate-200 hover:border-[#008767]/40 hover:text-[#008767]"
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-[#008767]" : ""}`} />
                  <span>{isSaved ? "Tersimpan" : "Simpan"}</span>
                </button>

                <button
                  aria-label="Share"
                  className="w-11 h-11 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Sub-Navigation Tabs Bar */}
            <div className="flex items-center gap-8 border-b border-slate-100 mt-8 text-sm font-semibold sticky top-20 z-20 bg-white/95 backdrop-blur-md pt-2 overflow-x-auto no-scrollbar whitespace-nowrap">
              {[
                { id: "profil", label: "Profil" },
                { id: "review", label: `Review (${business.reviewCountFormatted})` },
                { id: "foto", label: `Foto (${business.photoCount || 432})` },
                { id: "info", label: "Info" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 border-b-2 transition-colors flex-shrink-0 ${
                    activeTab === tab.id
                      ? "border-[#008767] text-[#008767]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT (LEFT 2 COLUMNS + RIGHT SIDEBAR) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* TAB PROFIL */}
            {activeTab === "profil" && (
              <>
                {/* CARD 1: Tentang Business */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                  <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                    Tentang {business.name}
                  </h3>

                  <div className="space-y-2">
                    <p
                      className={`text-sm text-slate-600 leading-relaxed ${
                        !isDescriptionExpanded ? "line-clamp-3 sm:line-clamp-none" : ""
                      }`}
                    >
                      {business.description}
                    </p>
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="sm:hidden text-xs font-semibold text-[#008767] flex items-center gap-1"
                    >
                      <span>{isDescriptionExpanded ? "Sembunyikan" : "Selengkapnya"}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDescriptionExpanded ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {/* Fasilitas / Features Grid */}
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {[
                      { name: "WiFi Gratis", icon: Wifi },
                      { name: "Outdoor Area", icon: Trees },
                      { name: "Toilet", icon: Toilet },
                      { name: "Parkir", icon: Car },
                      { name: "Menerima Reservasi", icon: CalendarCheck },
                    ].map((feat, idx) => {
                      const IconComp = feat.icon;
                      return (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-medium text-slate-700"
                        >
                          <IconComp className="w-4 h-4 text-[#008767]" />
                          <span>{feat.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CARD 2: Ulasan Pelanggan (Fixed 3 Ulasan) */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                        Ulasan Pelanggan
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Menampilkan 3 ulasan teratas
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {mockReviews.slice(0, 3).map((rev, index) => (
                      <div
                        key={rev.id}
                        className={`space-y-4 ${
                          index < 2 ? "pb-6 border-b border-slate-100" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${rev.color}`}>
                              {rev.initials}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{rev.author}</h4>
                              <p className="text-xs text-slate-400">{rev.count} • {rev.time}</p>
                            </div>
                          </div>
                          <button className="text-slate-400 hover:text-slate-600">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-amber-500 text-xs font-bold">
                            <div className="flex text-amber-400">
                              {"★".repeat(rev.rating)}
                              {"★".repeat(5 - rev.rating).split("").map((_, i) => (
                                <span key={i} className="text-slate-200">★</span>
                              ))}
                            </div>
                            <span>{rev.rating}.0</span>
                          </div>

                          <h5 className="font-bold text-slate-900 text-sm">
                            {rev.title}
                          </h5>

                          <p className="text-sm text-slate-600 leading-relaxed">
                            {rev.content}
                          </p>
                        </div>

                        {/* Attached Images */}
                        {rev.hasImages && (
                          <div className="flex items-center gap-3 pt-1">
                            {[1, 2, 3].map((imgIdx) => (
                              <div
                                key={imgIdx}
                                className="w-20 h-20 rounded-xl bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50 border border-slate-200/80 flex items-center justify-center text-slate-400 hover:border-[#008767] transition-colors cursor-pointer"
                              >
                                <ImageIcon className="w-5 h-5 text-slate-400" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action Bar */}
                        <div className="flex items-center gap-6 pt-2 text-xs font-medium text-slate-500">
                          <button
                            onClick={() => toggleLike(rev.id)}
                            className={`flex items-center gap-1.5 hover:text-[#008767] transition-colors ${
                              likedState[rev.id] ? "text-[#008767] font-bold" : ""
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${likedState[rev.id] ? "fill-[#008767]" : ""}`} />
                            <span>{likes[rev.id] || 0}</span>
                          </button>

                          <button className="flex items-center gap-1.5 hover:text-[#008767] transition-colors">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Balas</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* LIHAT ULASAN LAINNYA — switch ke tab review */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setActiveTab("review");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full py-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#008767] font-bold text-xs sm:text-sm border border-slate-200/80 transition-all flex items-center justify-center gap-2 active:scale-98 shadow-xs"
                    >
                      <span>Lihat ulasan lainnya ({mockReviews.length} ulasan)</span>
                      <ChevronDown className="w-4 h-4 -rotate-90 text-[#008767]" />
                    </button>
                  </div>

                </div>
              </>
            )}

            {/* TAB REVIEW — Khusus Ulasan Pelanggan & Foto Ulasan (Setiap Ulasan Dibuatkan Card Terpisah) */}
            {activeTab === "review" && (
              <div className="space-y-6">
                {/* Header Sub-Bar & Filter */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                      Semua Ulasan Pelanggan
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Total {mockReviews.length} ulasan terverifikasi
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#008767]">
                      <option value="Terbaru">Terbaru</option>
                      <option value="Rating Tertinggi">Rating Tertinggi</option>
                      <option value="Rating Terendah">Rating Terendah</option>
                      <option value="Dengan Foto">Dengan Foto</option>
                    </select>
                  </div>
                </div>

                {/* List Card Ulasan */}
                {mockReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4 hover:border-slate-300 transition-all"
                  >
                    {/* Header Reviewer */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border shadow-xs ${rev.color}`}>
                          {rev.initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{rev.author}</h4>
                          <p className="text-xs text-slate-400">{rev.count} • {rev.time}</p>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Rating & Content */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-400 text-sm">
                          {"★".repeat(rev.rating)}
                          {"★".repeat(5 - rev.rating).split("").map((_, i) => (
                            <span key={i} className="text-slate-200">★</span>
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                          {rev.rating}.0
                        </span>
                      </div>

                      <h5 className="font-bold text-slate-900 text-base">
                        {rev.title}
                      </h5>

                      <p className="text-sm text-slate-600 leading-relaxed">
                        {rev.content}
                      </p>
                    </div>

                    {/* Foto Lampiran Ulasan */}
                    {rev.hasImages && (
                      <div className="pt-2">
                        <p className="text-xs font-semibold text-slate-400 mb-2">Foto dari Ulasan ini:</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          {[1, 2, 3].map((imgIdx) => (
                            <div
                              key={imgIdx}
                              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-slate-100 via-emerald-50/50 to-teal-50 border border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-[#008767] hover:shadow-sm transition-all cursor-pointer group"
                            >
                              <ImageIcon className="w-6 h-6 text-slate-400 group-hover:scale-110 group-hover:text-[#008767] transition-all" />
                              <span className="text-[10px] text-slate-400 mt-1">Foto {imgIdx}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Bar (Like & Balas) */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => toggleLike(rev.id)}
                          className={`flex items-center gap-1.5 hover:text-[#008767] transition-colors ${
                            likedState[rev.id] ? "text-[#008767] font-bold" : ""
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${likedState[rev.id] ? "fill-[#008767]" : ""}`} />
                          <span>{likes[rev.id] || 0} Menyukai</span>
                        </button>

                        <button className="flex items-center gap-1.5 hover:text-[#008767] transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span>Balas Ulasan</span>
                        </button>
                      </div>

                      <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
                        ✓ Ulasan Terverifikasi
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB FOTO */}
            {activeTab === "foto" && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                    Galeri Foto {business.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Menampilkan {business.photoCount || 432} foto dari pengunjung & pemilik bisnis
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((idx) => (
                    <div
                      key={idx}
                      className="h-36 sm:h-44 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50 border border-slate-200/80 flex flex-col items-center justify-center text-slate-400 hover:border-[#008767] hover:shadow-md transition-all cursor-pointer"
                    >
                      <ImageIcon className="w-8 h-8 text-slate-400 mb-1" />
                      <span className="text-xs font-medium text-slate-500">Foto Suasana {idx}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB INFO */}
            {activeTab === "info" && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                  Informasi Lengkap {business.name}
                </h3>
                <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                  <p>{business.description}</p>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <p className="font-bold text-slate-900">Alamat Lengkap:</p>
                    <p>{business.address || "Jl. Melawai Raya No. 12, Kebayoran Baru, Jakarta Selatan 12160"}</p>
                    <p className="font-bold text-slate-900 pt-2">Jam Operasional:</p>
                    <p>{business.hours || "Senin - Minggu: 07:00 - 22:00 WIB"}</p>
                    <p className="font-bold text-slate-900 pt-2">Kontak / Telepon:</p>
                    <p>{business.phone || "+62 812 3456 7890"}</p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ================= RIGHT SIDEBAR ================= */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* CARD 1: Rating Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 leading-none">
                    {business.rating}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    ({business.reviewCountFormatted})
                  </p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-2 text-xs font-medium text-slate-600 pt-1">
                {[
                  { star: 5, pct: "72%" },
                  { star: 4, pct: "18%" },
                  { star: 3, pct: "6%" },
                  { star: 2, pct: "2%" },
                  { star: 1, pct: "2%" },
                ].map((item) => (
                  <div key={item.star} className="flex items-center gap-2">
                    <span className="w-4 text-slate-600 font-bold">{item.star} ★</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-[#008767] rounded-full"
                        style={{ width: item.pct }}
                      />
                    </div>
                    <span className="w-8 text-right text-slate-400 text-[11px]">{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 2: Informasi Kontak */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs sm:text-sm">
              <h4 className="font-bold text-slate-900 text-base">Informasi Kontak</h4>

              <div className="space-y-3.5">
                {/* Phone */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Phone className="w-4 h-4 text-[#008767] flex-shrink-0" />
                    <span>{business.phone || "+62 812 3456 7890"}</span>
                  </div>
                  <button className="px-3 py-1 rounded-lg bg-emerald-50 text-[#008767] font-semibold text-xs border border-emerald-200 hover:bg-emerald-100 transition-colors">
                    Hubungi
                  </button>
                </div>

                {/* Address */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 text-slate-700">
                    <MapPin className="w-4 h-4 text-[#008767] flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">
                      {business.address || "Jl. Melawai Raya No. 12, Jakarta Selatan 12160"}
                    </span>
                  </div>
                  <button className="text-xs font-semibold text-[#008767] hover:underline flex-shrink-0">
                    Lihat Peta
                  </button>
                </div>

                {/* Hours */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Clock className="w-4 h-4 text-[#008767] flex-shrink-0" />
                    <span>{business.hours || "Setiap hari, 07:00 - 22:00"}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    • Buka
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 3: Media Sosial */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-900 text-base">Media Sosial</h4>
              <div className="flex items-center gap-4 pt-1">
                <button
                  aria-label="Instagram"
                  className="flex flex-col items-center gap-1 text-slate-600 hover:text-pink-600 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium">Instagram</span>
                </button>

                <button
                  aria-label="TikTok"
                  className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .56.04.82.11V9.3a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.57a6.34 6.34 0 0 0 11 4.38V12.9a8.27 8.27 0 0 0 5.59 2.19v-3.4a4.86 4.86 0 0 1-3.77-1.4 4.86 4.86 0 0 1-1.23-3.6z"/>
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium">TikTok</span>
                </button>

                <button
                  aria-label="X"
                  className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 group-hover:scale-105 transition-transform">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium">X</span>
                </button>
              </div>
            </div>

            {/* CARD 4: Galeri / Foto */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-base">Foto</h4>
                <button className="text-xs font-semibold text-[#008767] hover:underline">
                  Lihat Semua
                </button>
              </div>

              {/* Photo Card Placeholders */}
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="h-20 rounded-xl bg-gradient-to-br from-slate-100 to-emerald-50 border border-slate-200/80 flex items-center justify-center text-slate-400 hover:border-[#008767] transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-5 h-5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 5: Klaim / Kelola Profil Bisnis CTA */}
            {user?.role === "bisnis" ? (
              <div className="bg-gradient-to-r from-amber-50 via-amber-50/80 to-emerald-50 rounded-3xl border border-amber-300 p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <LayoutDashboard className="w-5 h-5 text-amber-700" />
                  <span>Dashboard Akun Bisnis Anda</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kelola profil toko, balas review pelanggan, dan lihat statistik analitik usaha Anda.
                </p>
                <Link
                  href="/dashboard"
                  className="block w-full text-center py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                >
                  Buka Dashboard
                </Link>
              </div>
            ) : !user || user.role !== "customer" ? (
              <div className="bg-gradient-to-r from-emerald-50 via-[#ebf7f3] to-teal-50 rounded-3xl border border-emerald-200 p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-[#008767]" />
                  <span>Apakah Anda pemilik bisnis ini?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kelola profil bisnis Anda, balas review, dan jangkau lebih banyak pelanggan.
                </p>
                <Link
                  href="/signup?role=bisnis"
                  className="block w-full text-center py-2.5 rounded-xl bg-[#008767] hover:bg-[#007458] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  Klaim / Daftar Akun Bisnis
                </Link>
              </div>
            ) : null}

          </div>

        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12 text-slate-600 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Top Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Brand Info */}
            <div className="lg:col-span-4 space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#008767] flex items-center justify-center text-white">
                  <MessageSquare className="w-4 h-4 fill-white/20" />
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  Kata<span className="text-[#008767]">mereka</span>
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
                Suara nyata, keputusan lebih baik. Platform ulasan terpercaya di Indonesia.
              </p>
              
              {/* Social Icons */}
              <div className="flex items-center gap-3 pt-2">
                {["Instagram", "TikTok", "X", "YouTube"].map((soc, idx) => (
                  <button
                    key={idx}
                    aria-label={soc}
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-[#008767] hover:text-white flex items-center justify-center text-slate-600 text-xs font-semibold transition-colors"
                  >
                    {soc[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Links Column 1: Tautan Cepat */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Tautan Cepat</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/" className="hover:text-[#008767] transition-colors">Beranda</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Jelajahi</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Kategori</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Untuk Bisnis</Link></li>
                <li><Link href="#" className="hover:text-[#008767] transition-colors">Tentang Kami</Link></li>
              </ul>
            </div>

            {/* Links Column 2: Kategori */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Kategori</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Restoran</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Hotel</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Kecantikan</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Elektronik</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Travel & Wisata</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Lainnya</Link></li>
              </ul>
            </div>

            {/* Links Column 3: Dukungan */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Dukungan</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="#" className="hover:text-[#008767] transition-colors">Pusat Bantuan</Link></li>
                <li><Link href="#" className="hover:text-[#008767] transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="#" className="hover:text-[#008767] transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link href="#" className="hover:text-[#008767] transition-colors">Hubungi Kami</Link></li>
              </ul>
            </div>

            {/* Links Column 4: Download Aplikasi */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Download Aplikasi</h4>
              <p className="text-xs text-slate-500">
                Nikmati pengalaman lebih baik di perangkatmu.
              </p>
              <div className="space-y-2 pt-1">
                <div className="px-3.5 py-2 rounded-xl bg-slate-900 text-white flex items-center gap-2.5 cursor-pointer hover:bg-slate-800 transition-colors">
                  <AppWindow className="w-5 h-5 text-white" />
                  <div>
                    <p className="text-[10px] text-slate-300 leading-none">Download on the</p>
                    <p className="text-xs font-semibold leading-tight mt-0.5">App Store</p>
                  </div>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-slate-900 text-white flex items-center gap-2.5 cursor-pointer hover:bg-slate-800 transition-colors">
                  <Smartphone className="w-5 h-5 text-white" />
                  <div>
                    <p className="text-[10px] text-slate-300 leading-none">GET IT ON</p>
                    <p className="text-xs font-semibold leading-tight mt-0.5">Google Play</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Footer Bar */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2025 Katamereka. Semua hak dilindungi.</p>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#008767] transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Kembali ke atas</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
