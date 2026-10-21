"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Search,
  Compass,
  History,
  Pencil,
  Star,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  Home,
  User,
  Briefcase,
  CheckCircle2,
  Building2,
  Package,
  MapPin,
  Wrench,
  Smartphone,
  GraduationCap,
  Utensils,
  Hotel,
  Sparkles,
  Laptop,
  Plane,
  Store,
  ArrowUp,
  ArrowUpRight,
  ShieldCheck,
  Coffee,
  Bed,
  ShoppingBag,
  Flower2,
  Zap,
  LayoutGrid,
  Headphones,
  Heart,
  Calendar,
  Users,
  Flame,
  Car,
  Trash2
} from "lucide-react";

import Navbar from "@/components/navbar";
import {
  fetchBusinesses,
  fetchPopularBusinesses,
  fetchCategoryFacets,
  fetchCityFacets,
  fetchBusinessPlaceImage,
  mapApiBusinessToUiModel,
  ApiCategoryFacet,
  ApiCityFacet
} from "@/lib/api-client";
import { Business } from "@/lib/mock-data";
import { slugify, categoryDisplayName, isRealBusinessCategory } from "@/lib/slug";
import { fetchRecentActivities, clearRecentActivities, RecentActivity } from "@/lib/recent-activity";

interface HomeContentProps {
  initialCategoryFacets?: ApiCategoryFacet[];
  initialCityFacets?: ApiCityFacet[];
  initialPopularBusinesses?: Business[];
}

function getCategoryIconAndColor(categoryRaw: string, index: number) {
  const lower = (categoryRaw || "").toLowerCase();

  if (lower.includes("apartment") || lower.includes("apartemen")) {
    return { icon: Building2, bgColor: "bg-sky-100/80 text-sky-600" };
  }
  if (lower.includes("chalet")) {
    return { icon: Sparkles, bgColor: "bg-[#e8f6f2] text-[#008767]" };
  }
  if (lower.includes("guest_house") || lower.includes("guesthouse") || lower.includes("guest house") || lower.includes("homestay")) {
    return { icon: Store, bgColor: "bg-amber-100/80 text-amber-600" };
  }
  if (lower.includes("hostel")) {
    return { icon: Bed, bgColor: "bg-pink-100/80 text-pink-600" };
  }
  if (lower.includes("hotel") || lower.includes("motel")) {
    return { icon: Hotel, bgColor: "bg-purple-100/80 text-purple-600" };
  }
  if (lower.includes("accommodation") || lower.includes("akomodasi")) {
    return { icon: Bed, bgColor: "bg-indigo-100/80 text-indigo-600" };
  }
  if (lower.includes("restaurant") || lower.includes("catering") || lower.includes("makan") || lower.includes("kuliner")) {
    return { icon: Utensils, bgColor: "bg-orange-100/80 text-orange-600" };
  }
  if (lower.includes("cafe") || lower.includes("coffee") || lower.includes("ngopi")) {
    return { icon: Coffee, bgColor: "bg-amber-100/80 text-amber-600" };
  }
  if (lower.includes("car") || lower.includes("jasa") || lower.includes("service") || lower.includes("repair") || lower.includes("rental")) {
    return { icon: Wrench, bgColor: "bg-sky-100/80 text-sky-600" };
  }
  if (lower.includes("shop") || lower.includes("store") || lower.includes("belanja") || lower.includes("supermarket") || lower.includes("mall")) {
    return { icon: ShoppingBag, bgColor: "bg-pink-100/80 text-pink-600" };
  }
  if (lower.includes("beauty") || lower.includes("kecantikan") || lower.includes("spa") || lower.includes("perawatan") || lower.includes("health")) {
    return { icon: Flower2, bgColor: "bg-teal-100/80 text-teal-600" };
  }

  const presets = [
    { icon: Hotel, bgColor: "bg-purple-100/80 text-purple-600" },
    { icon: Bed, bgColor: "bg-indigo-100/80 text-indigo-600" },
    { icon: Building2, bgColor: "bg-sky-100/80 text-sky-600" },
    { icon: Sparkles, bgColor: "bg-[#e8f6f2] text-[#008767]" },
    { icon: Store, bgColor: "bg-amber-100/80 text-amber-600" },
    { icon: Bed, bgColor: "bg-pink-100/80 text-pink-600" },
  ];
  return presets[index % presets.length];
}

export default function LandingPage({ initialCategoryFacets, initialCityFacets, initialPopularBusinesses }: HomeContentProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeChoice, setActiveChoice] = useState<"recent" | "categories" | null>(null);
  const [openFaqIds, setOpenFaqIds] = useState<number[]>([]);
  const [popularBusinesses, setPopularBusinesses] = useState<Business[]>(initialPopularBusinesses || []);
  const [categoryFacets, setCategoryFacets] = useState<ApiCategoryFacet[]>(initialCategoryFacets || []);
  const [cityFacets, setCityFacets] = useState<ApiCityFacet[]>(initialCityFacets || []);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchRecentActivities().then((items) => {
      if (!cancelled) setRecentActivities(items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClearRecentActivities = () => {
    setRecentActivities([]);
    clearRecentActivities();
  };

  const curatedCategories = [
    { title: "Hotel", href: "/kategori/hotel", icon: Hotel },
    { title: "Hotel & Akomodasi", href: "/kategori/hotel-dan-akomodasi", icon: Bed },
    { title: "Apartemen", href: "/kategori/apartemen", icon: Building2 },
    { title: "Chalet", href: "/kategori/chalet", icon: Home },
    { title: "Guest House", href: "/kategori/guest-house", icon: Store },
    { title: "Rental Kendaraan", href: "/kategori/rental-kendaraan", icon: Car },
  ];

  const recentReviews = [
    {
      id: 1,
      userName: "Rani Putri",
      userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      timeAgo: "2 hari lalu",
      rating: 5,
      comment: "Pelayanannya ramah, prosesnya cepat, dan tempatnya bersih. Rekomendasi banget!",
      business: {
        name: "Hotel Santika Bogor",
        category: "Hotel",
        slug: "hotel-santika-bogor",
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=120&auto=format&fit=crop&q=80",
      },
    },
    {
      id: 2,
      userName: "Ahmad Fauzi",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      timeAgo: "4 hari lalu",
      rating: 5,
      comment: "Unitnya bagus dan terawat. Cocok untuk liburan keluarga. Pasti sewa lagi!",
      business: {
        name: "DCK Rental Mobil Pontianak",
        category: "Rental Kendaraan",
        slug: "dck-rental-mobil-pontianak",
        imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=120&auto=format&fit=crop&q=80",
      },
    },
    {
      id: 3,
      userName: "Siti Aisyah",
      userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
      timeAgo: "1 minggu lalu",
      rating: 5,
      comment: "Suasananya tenang, udara sejuk, dan lokasinya strategis. Sangat nyaman!",
      business: {
        name: "Vila Kayu Lembang",
        category: "Guest House",
        slug: "vila-kayu-lembang",
        imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=120&auto=format&fit=crop&q=80",
      },
    },
  ];

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const searchRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const faqScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: "left" | "right") => {
    if (categoryScrollRef.current) {
      const { scrollLeft, clientWidth } = categoryScrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      categoryScrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollFaqs = (direction: "left" | "right") => {
    if (faqScrollRef.current) {
      const { scrollLeft, clientWidth } = faqScrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      faqScrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const toggleFaq = (id: number) => {
    setOpenFaqIds((prev) => (prev.includes(id) ? [] : [id]));
  };

  useEffect(() => {
    async function loadFacets() {
      try {
        const [cats, cities] = await Promise.all([
          fetchCategoryFacets(),
          fetchCityFacets(),
        ]);
        if (cats && cats.length > 0) setCategoryFacets(cats);
        if (cities && cities.length > 0) setCityFacets(cities);
      } catch (err) {
        console.warn("Error loading category/city facets:", err);
      }
    }

    if (!initialCategoryFacets || initialCategoryFacets.length === 0) {
      loadFacets();
    }
  }, [initialCategoryFacets]);

  useEffect(() => {
    // The server already fetched (and resolved images for) the popular list;
    // re-requesting it here costs ~50 API calls per visitor for identical data.
    if (initialPopularBusinesses && initialPopularBusinesses.length > 0) return;
    async function loadPopular() {
      try {
        const res = await fetchBusinesses({ limit: 50, sort: "popular" });
        if (res && res.data && res.data.length > 0) {
          const mapped = res.data.map(mapApiBusinessToUiModel);
          mapped.sort((a, b) => {
            const countA = a.reviewCount || 0;
            const countB = b.reviewCount || 0;
            if (countB !== countA) return countB - countA;
            return (b.rating || 0) - (a.rating || 0);
          });
          const top5 = mapped.slice(0, 5);
          setPopularBusinesses(top5);

          // Lazy load dynamic place images if image is not present
          top5.forEach((biz) => {
            if (!biz.imageUrl && biz.name) {
              fetchBusinessPlaceImage(
                biz.name,
                biz.location || "Indonesia",
                biz.latitude,
                biz.longitude
              )
                .then((img) => {
                  if (img) {
                    setPopularBusinesses((prev) =>
                      prev.map((b) => (b.id === biz.id ? { ...b, imageUrl: img } : b))
                    );
                  }
                })
                .catch(() => { });
            }
          });
        }
      } catch (err) {
        console.warn("Error loading popular businesses:", err);
      }
    }
    loadPopular();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const faqs = [
    {
      id: 1,
      q: "Apa itu platform Katamereka dan apa saja manfaatnya bagi pengguna?",
      a: "Katamereka adalah platform ulasan dan pencarian bisnis yang membantu kamu menemukan tempat terbaik berdasarkan pengalaman nyata pengguna.",
      category: "Umum",
      icon: HelpCircle
    },
    {
      id: 2,
      q: "Apakah seluruh layanan Katamereka gratis untuk membaca dan menulis ulasan?",
      a: "Ya, Katamereka sepenuhnya gratis untuk pengguna umum. Kamu bisa membaca ulasan, mencari bisnis, dan menulis ulasan sendiri tanpa biaya apapun.",
      category: "Umum",
      icon: ShieldCheck
    },
    {
      id: 3,
      q: "Bagaimana cara mudah menulis dan membagikan ulasan di Katamereka?",
      a: "Cukup daftarkan akun Customer secara gratis, lalu kunjungi halaman bisnis yang ingin kamu ulas. Klik tombol 'Tulis Ulasan', berikan rating bintang, dan tuliskan pengalamanmu.",
      category: "Ulasan",
      icon: Star
    },
    {
      id: 4,
      q: "Apakah seluruh ulasan pengguna di Katamereka sudah terverifikasi keasliannya?",
      a: "Kami memiliki sistem moderasi untuk memastikan kualitas ulasan. Ulasan yang terverifikasi akan mendapatkan badge 'Verified Experience' sehingga pembaca bisa membedakannya dari ulasan biasa.",
      category: "Ulasan",
      icon: Star
    },
    {
      id: 5,
      q: "Bisakah pemilik bisnis mendaftarkan dan memverifikasi usahanya ke Katamereka?",
      a: "Tentu! Pemilik bisnis bisa mendaftar dengan memilih tipe 'Akun Bisnis' saat registrasi. Setelah itu kamu bisa mengelola profil bisnis, membalas ulasan pelanggan, dan mengakses Dashboard Admin.",
      category: "Untuk Bisnis",
      icon: Briefcase
    },
    {
      id: 6,
      q: "Bagaimana cara melaporkan jika ada ulasan yang tidak jujur atau menyesatkan?",
      a: "Kamu bisa melaporkan ulasan yang mencurigakan langsung dari halaman ulasan tersebut. Tim Katamereka akan meninjau dan mengambil tindakan sesuai kebijakan platform.",
      category: "Ulasan",
      icon: ShieldCheck
    },
    {
      id: 7,
      q: "Di mana dan melalui saluran apa saya bisa menghubungi tim Katamereka?",
      a: "Kamu bisa menghubungi kami melalui halaman Pusat Bantuan atau mengirim email ke support@katamereka.id. Kami siap membantu setiap hari Senin–Jumat pukul 09.00–17.00 WIB.",
      category: "Bantuan",
      icon: MessageSquare
    }
  ];

  const filteredFaqs = faqs;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans">
      <Navbar />

      {/* ================= HERO BANNER HEADER (MATCHING MOCKUP) ================= */}
      <section className="relative w-full bg-gradient-to-b from-[#eaf6f0]/75 via-[#f8fbf9] to-white py-12 sm:py-16 lg:py-20 flex items-center justify-center">
        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center space-y-3 sm:space-y-4">
          {/* Main Headline */}
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-slate-900 tracking-tight leading-[1.18] text-center max-w-2xl mx-auto">
            Temukan bisnis <br />
            yang sesuai dengan <br />
            <span className="text-[#008767]">kebutuhanmu.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xs sm:text-sm md:text-base text-slate-500 max-w-xl mx-auto leading-relaxed text-center font-normal pt-1">
            Baca pengalaman nyata dari orang-orang seperti kamu, <br className="hidden sm:inline" />
            temukan rekomendasi terpercaya, dan pilih layanan dengan lebih yakin.
          </p>

          {/* Search Box */}
          <div className="w-full max-w-2xl mx-auto pt-4 sm:pt-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="bg-white rounded-2xl shadow-lg shadow-slate-900/5 border border-slate-200/90 p-2 sm:p-2.5 flex items-center gap-2 sm:gap-3 w-full focus-within:ring-2 focus-within:ring-[#008767]/30 transition-all"
            >
              <Search className="w-5 h-5 text-slate-400 ml-3 sm:ml-3.5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Cari nama bisnis, lokasi, atau kategori"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm md:text-base py-1 font-normal"
              />
              <button
                type="submit"
                className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-[#008767] hover:bg-[#007458] text-white text-xs sm:text-sm font-semibold flex items-center justify-center flex-shrink-0 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <span>Cari</span>
              </button>
            </form>

          </div>
        </div>
      </section>

      {/* ================= SECTION: LANJUT DARI AKTIVITAS TERAKHIR ================= */}
      {recentActivities.length > 0 && (
        <section className="pt-8 sm:pt-10 pb-4 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Lanjut dari aktivitas terakhir
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lihat kembali pencarian atau bisnis yang terakhir kamu lihat.
                </p>
              </div>
              <button
                onClick={handleClearRecentActivities}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Hapus riwayat</span>
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {recentActivities.map((act) => (
                <Link
                  key={act.id}
                  href={act.href}
                  className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-3.5 flex items-center justify-between hover:shadow-md hover:border-[#008767]/30 transition-all group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {act.imageUrl ? (
                      <img
                        src={act.imageUrl}
                        alt={act.title}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 bg-slate-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                        <Search className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate group-hover:text-[#008767] transition-colors">
                        {act.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {act.subtitle}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-[#008767] transition-all shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= SECTION: JELAJAHI BERDASARKAN KATEGORI ================= */}
      <section className="py-6 sm:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Jelajahi berdasarkan kategori
            </h2>
            <Link
              href="/businesses"
              className="text-xs sm:text-sm font-semibold text-[#008767] hover:text-[#006e54] flex items-center gap-1.5 transition-colors"
            >
              <span>Lihat semua kategori</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {curatedCategories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="group bg-[#f4faf7] hover:bg-white rounded-2xl border border-[#d8ece4] hover:border-[#008767]/40 hover:shadow-md p-4 sm:p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-2xs"
              >
                <div className="mb-2 text-[#008767] group-hover:scale-110 transition-transform">
                  <cat.icon className="w-6 h-6 stroke-[1.8]" />
                </div>
                <span className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-[#008767] transition-colors leading-tight">
                  {cat.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 1: BISNIS POPULER ================= */}
      <section className="pt-6 sm:pt-8 pb-10 sm:pb-14 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">

          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 flex-shrink-0 shadow-2xs">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
              </div>
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Bisnis Populer
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Jelajahi bisnis yang paling banyak dilihat dan direkomendasikan oleh komunitas KataMereka.
                </p>
              </div>
            </div>
            <Link
              href="/businesses"
              className="group text-xs sm:text-sm font-semibold text-[#008767] hover:text-[#006e54] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <span>Lihat semua</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 5-Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {popularBusinesses.slice(0, 5).map((biz, idx) => {
              const { icon: CategoryIcon } = getCategoryIconAndColor(biz.category || "", idx);
              const isLiked = !!wishlist[biz.id || biz.slug];
              const badgeText =
                biz.badge && biz.badge !== "Pilihan Pengguna" && biz.badge !== "Terverifikasi"
                  ? biz.badge
                  : (biz.rating >= 4.7 || (biz.reviewCount || 0) >= 100)
                    ? "🔥 Populer"
                    : "⭐ Favorit";

              return (
                <Link
                  key={biz.id || biz.slug || idx}
                  href={`/business/${biz.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200/80 p-3 flex flex-col justify-between hover:shadow-lg hover:border-[#008767]/30 transition-all"
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-100 mb-3">
                      {biz.imageUrl ? (
                        <img
                          src={biz.imageUrl}
                          alt={biz.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 flex items-center justify-center">
                          <span className="font-bold text-xl text-emerald-800">{biz.initials || "KM"}</span>
                        </div>
                      )}

                      {/* Wishlist Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleWishlist(biz.id || biz.slug, e)}
                        className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-slate-600 hover:text-red-500 hover:scale-110 transition-all shadow-xs z-10 cursor-pointer"
                        aria-label="Simpan ke favorit"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-slate-600"
                            }`}
                        />
                      </button>

                      {/* Status Badge */}
                      <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-bold text-slate-800 shadow-xs flex items-center gap-1 z-10">
                        <span>{badgeText}</span>
                      </div>
                    </div>

                    {/* Category Row */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <CategoryIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{biz.category || "Bisnis"}</span>
                    </div>

                    {/* Business Name */}
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-[#008767] transition-colors mt-1">
                      {biz.name}
                    </h3>

                    {/* Rating Row */}
                    <div className="flex items-center gap-1 text-xs mt-1.5">
                      {biz.rating > 0 ? (
                        <>
                          <div className="flex items-center text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < Math.round(biz.rating)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200 fill-slate-100"
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-slate-900 ml-0.5">{Number(biz.rating).toFixed(1)}</span>
                          <span className="text-slate-400 font-normal">
                            ({biz.reviewCount || 0} ulasan)
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Belum ada ulasan</span>
                      )}
                    </div>

                    {/* Location Row */}
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mt-1.5 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{biz.location || "Indonesia"}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-3.5 pt-1">
                    <span className="w-full py-2 px-3 rounded-xl bg-[#ecf8f3] text-[#008767] group-hover:bg-[#008767] group-hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
                      <span>Lihat Profil</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bottom Centered Button */}
          <div className="pt-5 sm:pt-6 flex justify-center">
            <Link
              href="/businesses"
              className="px-6 py-2.5 rounded-full border border-[#008767] text-[#008767] hover:bg-[#008767] hover:text-white font-semibold text-xs sm:text-sm transition-all shadow-2xs hover:scale-105 inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Jelajahi lebih banyak bisnis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SECTION: ULASAN TERBARU ================= */}
      <section className="py-10 sm:py-14 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Ulasan Terbaru
            </h2>
            <Link
              href="/review"
              className="text-xs sm:text-sm font-semibold text-[#008767] hover:text-[#006e54] flex items-center gap-1.5 transition-colors"
            >
              <span>Lihat semua ulasan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {recentReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.userAvatar}
                      alt={rev.userName}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                        {rev.userName}
                      </h4>
                      <span className="text-xs text-slate-400 font-normal">
                        {rev.timeAgo}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400 my-2.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    "{rev.comment}"
                  </p>
                </div>

                <Link
                  href={`/business/${rev.business.slug}`}
                  className="bg-[#fafcfb] border border-slate-200/70 rounded-xl p-2.5 flex items-center justify-between group/biz hover:bg-[#f0f8f4] transition-colors mt-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={rev.business.imageUrl}
                      alt={rev.business.name}
                      className="w-9 h-9 rounded-lg object-cover shrink-0 bg-slate-100"
                    />
                    <div className="min-w-0">
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm truncate group-hover/biz:text-[#008767] transition-colors">
                        {rev.business.name}
                      </h5>
                      <p className="text-[11px] text-slate-400 truncate">
                        {rev.business.category}
                      </p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#ecf8f3] text-[#008767] flex items-center justify-center shrink-0 group-hover/biz:bg-[#008767] group-hover/biz:text-white transition-colors ml-2">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ================= SECTION 5: FAQ ================= */}
      <section className="py-14 sm:py-16 lg:py-20 bg-white border-t border-[#d8ece4] relative overflow-hidden">
        {/* Background Decorative Graphic Components (Diperbesar sedikit sesuai permintaan) */}
        <div className="absolute top-0 right-0 pointer-events-none select-none z-0">
          <img
            src="/faq-bg-top-right.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            className="w-48 sm:w-64 md:w-76 lg:w-84 xl:w-92 h-auto object-contain select-none pointer-events-none opacity-90"
            style={{ userSelect: "none" }}
          />
        </div>

        <div className="absolute bottom-0 left-0 pointer-events-none select-none z-0">
          <img
            src="/faq-bg-bottom-left.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            className="w-48 sm:w-64 md:w-76 lg:w-84 xl:w-92 h-auto object-contain select-none pointer-events-none opacity-90"
            style={{ userSelect: "none" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">

          {/* Centered Top Badge (Tanpa Singkatan) */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#dcf4ea] text-[#008767] text-xs sm:text-sm font-bold tracking-wide uppercase shadow-xs">
              <HelpCircle className="w-4 h-4 text-[#008767]" />
              <span>Frequently Asked Questions</span>
            </div>
          </div>

          {/* Header Row: Left Info + Right Illustration */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
            {/* Left Header info */}
            <div className="space-y-3 max-w-xl">
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Pertanyaan yang <br className="hidden sm:inline" />
                <span className="text-[#008767]">Sering Diajukan</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-500 leading-relaxed pt-1">
                Temukan jawaban seputar penggunaan Katamereka. Jika tidak menemukan yang kamu cari, kamu bisa menghubungi kami melalui kontak yang tersedia.
              </p>
            </div>

            {/* Right Illustration: Protected from copy and drag (Digeser ke kiri) */}
            <div className="flex justify-center lg:justify-end shrink-0 select-none lg:-translate-x-16 xl:-translate-x-28 lg:mr-4">
              <div className="relative w-44 sm:w-52 md:w-56 lg:w-60 select-none">
                <img
                  src="/faq-illustration.png"
                  alt="Ilustrasi FAQ Katamereka"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-auto object-contain hover:scale-105 transition-transform duration-300 drop-shadow-xs select-none pointer-events-none"
                  style={{ userSelect: "none" }}
                />
              </div>
            </div>
          </div>

          {/* Cards Carousel: 1 card box per question */}
          <div
            ref={faqScrollRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto pb-6 pt-2 px-1 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filteredFaqs.length === 0 ? (
              <div className="w-full text-center py-12 bg-white rounded-3xl border border-slate-200">
                <p className="text-slate-500 text-sm">Tidak ada pertanyaan pada kategori ini.</p>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = openFaqIds.includes(faq.id);

                return (
                  <div
                    key={faq.id}
                    onClick={() => toggleFaq(faq.id)}
                    className={`relative shrink-0 snap-start rounded-3xl h-[215px] sm:h-[225px] overflow-hidden cursor-pointer select-none group transition-all duration-500 ease-in-out ${isOpen
                        ? "w-[245px] sm:w-[265px] bg-gradient-to-br from-[#008767] via-[#00785a] to-[#005a43] text-white shadow-xl shadow-[#008767]/25 ring-2 ring-[#008767]/30 border border-transparent"
                        : "w-[195px] sm:w-[210px] bg-white border border-[#d5ece3] hover:border-[#008767]/50 hover:shadow-lg hover:shadow-[#008767]/10 text-slate-900"
                      }`}
                  >
                    {/* SISI DEFAULT: HANYA PERTANYAAN (Warna Putih, Bentuk Memanjang) */}
                    <div
                      className={`absolute inset-0 p-5 sm:p-6 flex flex-col justify-between transition-all duration-400 ease-in-out ${isOpen
                          ? "-translate-y-8 opacity-0 pointer-events-none"
                          : "translate-y-0 opacity-100"
                        }`}
                    >
                      <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#008767] transition-colors duration-200 leading-snug line-clamp-5">
                        {faq.q}
                      </h3>

                      {/* Action CTA */}
                      <div className="pt-2">
                        <div className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-[#008767] group-hover:translate-x-1 transition-transform duration-200">
                          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#008767] text-white flex items-center justify-center shadow-xs shrink-0">
                            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </span>
                          <span className="truncate">Lihat jawaban</span>
                        </div>
                      </div>
                    </div>

                    {/* SISI JAWABAN: MUNCUL DARI BAWAH (Warna Hijau, Sedikit Melebar) */}
                    <div
                      className={`absolute inset-0 p-5 sm:p-6 flex flex-col justify-between transition-all duration-500 ease-out ${isOpen
                          ? "translate-y-0 opacity-100"
                          : "translate-y-full opacity-0 pointer-events-none"
                        }`}
                    >
                      {/* Jawaban yang muncul meluncur dari bawah */}
                      <div
                        className={`transition-all duration-500 ease-out delay-100 overflow-y-auto no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                          }`}
                      >
                        <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed font-normal text-justify">
                          {faq.a}
                        </p>
                      </div>

                      {/* Action CTA untuk kembali */}
                      <div className="pt-2">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-100 hover:text-white transition-colors duration-200">
                          <span className="w-7 h-7 rounded-full bg-white text-[#008767] flex items-center justify-center shadow-xs shrink-0">
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </span>
                          <span>Kembali ke pertanyaan</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom CTA */}
          <div className="text-center pt-2">
            <p className="text-sm text-slate-500">
              Masih punya pertanyaan?{" "}
              <a
                href="mailto:support@katamereka.id"
                className="font-semibold text-[#008767] hover:underline inline-flex items-center gap-1 transition-colors"
              >
                <span>Hubungi kami</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </p>
          </div>

        </div>
      </section>

      {/* ================= SECTION: BANNER CTA (BAGIKAN PENGALAMANMU) ================= */}
      <section className="py-6 sm:py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#eef8f3] via-[#e5f5ec] to-[#eef8f3] border border-[#d2efe2] py-6 sm:py-8 px-6 sm:px-10 text-center shadow-xs flex flex-col items-center justify-center">

            {/* Left Decorative Botanical Leaves */}
            <div className="absolute -left-3 sm:left-3 bottom-0 sm:bottom-1 pointer-events-none select-none opacity-70 sm:opacity-90">
              <svg className="w-16 sm:w-24 md:w-28 h-auto text-[#008767]/30" viewBox="0 0 160 160" fill="none">
                <path d="M20 160 C30 110 70 70 140 40 C110 80 80 120 20 160 Z" fill="currentColor" opacity="0.6" />
                <path d="M10 160 C20 125 50 95 105 70 C85 105 60 135 10 160 Z" fill="currentColor" opacity="0.4" />
                <path d="M40 160 C50 130 90 100 155 80 C125 110 95 138 40 160 Z" fill="currentColor" opacity="0.5" />
              </svg>
            </div>

            {/* Right Decorative Minimal Books */}
            <div className="absolute -right-3 sm:right-4 bottom-0 sm:bottom-2 pointer-events-none select-none opacity-70 sm:opacity-90">
              <svg className="w-16 sm:w-22 md:w-26 h-auto text-slate-400/40" viewBox="0 0 140 100" fill="none">
                <rect x="20" y="50" width="100" height="16" rx="3" fill="#cbd5e1" opacity="0.8" />
                <rect x="30" y="32" width="85" height="15" rx="3" fill="#94a3b8" opacity="0.9" />
                <rect x="40" y="15" width="70" height="14" rx="3" fill="#008767" opacity="0.5" />
              </svg>
            </div>

            {/* Center Content */}
            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
              <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#008767] uppercase mb-1.5">
                BAGIKAN PENGALAMANMU
              </span>
              <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Pernah mencoba sesuatu?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1.5 mb-4 leading-relaxed">
                Tulis ulasan dan bantu orang lain membuat keputusan yang lebih baik.
              </p>
              <Link
                href="/review"
                className="px-6 py-2.5 sm:py-3 rounded-full bg-[#007052] hover:bg-[#005a42] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#007052]/20 inline-flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <span>Tulis Ulasan</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t border-slate-100 pt-12 pb-8 text-slate-600 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-5 space-y-3.5">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-full overflow-hidden shadow-xs group-hover:scale-105 transition-transform shrink-0 bg-[#008767]">
                  <img src="/logo.png" alt="Katamereka Logo" className="w-full h-full object-cover" />
                </div>
                <span className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Kata<span className="text-[#008767]">mereka</span>
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm">
                Platform ulasan dan rekomendasi bisnis dari orang-orang seperti kamu. Temukan ulasan terpercaya dan layanan yang tepat.
              </p>
            </div>

            {/* Column 2: Tautan Cepat */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-heading font-bold text-slate-900 text-sm">Tautan Cepat</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/" className="hover:text-[#008767] transition-colors">Beranda</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Jelajahi</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Kategori</Link></li>
                <li><Link href="/tentang-kami" className="hover:text-[#008767] transition-colors">Tentang Kami</Link></li>
              </ul>
            </div>

            {/* Column 3: Dukungan */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-heading font-bold text-slate-900 text-sm">Dukungan</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/bantuan" className="hover:text-[#008767] transition-colors">Pusat Bantuan</Link></li>
                <li><Link href="/kebijakan-privasi" className="hover:text-[#008767] transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="/syarat-ketentuan" className="hover:text-[#008767] transition-colors">Syarat & Ketentuan</Link></li>
                <li><a href="mailto:support@katamereka.id" className="hover:text-[#008767] transition-colors">Hubungi Kami</a></li>
              </ul>
            </div>

            {/* Column 4: Socials */}
            <div className="lg:col-span-2 flex items-start lg:justify-end gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-slate-200 hover:border-[#008767] hover:text-[#008767] text-slate-600 transition-all flex items-center justify-center"
              >
                <svg className="w-3.5 h-3.5 fill-none" viewBox="0 0 24 24">
                  <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full border border-slate-200 hover:border-[#008767] hover:text-[#008767] text-slate-600 transition-all flex items-center justify-center"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full border border-slate-200 hover:border-[#008767] hover:text-[#008767] text-slate-600 transition-all flex items-center justify-center"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-8 h-8 rounded-full border border-slate-200 hover:border-[#008767] hover:text-[#008767] text-slate-600 transition-all flex items-center justify-center"
              >
                <svg className="w-3 h-3 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Bottom Footer Bar */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2026 Katamereka. Semua hak dilindungi.</p>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#008767] transition-colors cursor-pointer"
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
