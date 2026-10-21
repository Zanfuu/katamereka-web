"use client";

// Directory Catalog Page
import Link from "next/link";
import { useState, useMemo, useEffect, useRef } from "react";
import { Business } from "@/lib/mock-data";
import { fetchBusinesses, fetchCategoryFacets, mapApiBusinessToUiModel, fetchBusinessPlaceImage } from "@/lib/api-client";
import { categoryDisplayName, isRealBusinessCategory } from "@/lib/slug";
import {
  Search,
  ChevronDown,
  Check,
  Star,
  Heart,
  Bookmark,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Home,
  ChevronRight,
  Utensils,
  Hotel,
  Sparkles,
  Laptop,
  Plane,
  Store,
  Smartphone,
  ArrowUp
} from "lucide-react";

import Navbar from "@/components/navbar";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { fetchMyFavorites, toggleFavorite, unfavoriteBusiness } from "@/lib/api-profile";

interface InitialDirectoryData {
  businesses: Business[];
  totalCount: number;
  totalPages: number;
  categories: string[];
}

// `initial` is the first page (default filters) fetched on the server by
// page.tsx, so the business names, ratings and categories are in the raw HTML.
export default function BusinessesPage({
  initial = { businesses: [], totalCount: 0, totalPages: 1, categories: [] },
}: {
  initial?: InitialDirectoryData;
}) {
  const { isLoggedIn } = useAuth();
  // First run of the fetch effect reuses `initial` instead of re-requesting it.
  const usedInitialData = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [selectedLocation, setSelectedLocation] = useState("Semua Lokasi");
  const [selectedRating, setSelectedRating] = useState("Semua Rating");
  const [sortBy, setSortBy] = useState("Terpopuler");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [togglingFavId, setTogglingFavId] = useState<string | null>(null);
  const [apiBusinesses, setApiBusinesses] = useState<Business[]>(initial.businesses);
  const [currentPage, setCurrentPage] = useState(1);
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState(false);
  const [openLocationDropdown, setOpenLocationDropdown] = useState(false);
  const [openSortDropdown, setOpenSortDropdown] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const paginationContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setOpenCategoryDropdown(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) {
        setOpenLocationDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setOpenSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Safely scroll ONLY the pagination container horizontally without scrolling the entire window
  useEffect(() => {
    if (paginationContainerRef.current) {
      const activeButton = paginationContainerRef.current.querySelector(
        `[data-page="${currentPage}"]`
      ) as HTMLElement | null;
      if (activeButton) {
        const container = paginationContainerRef.current;
        const scrollTarget =
          activeButton.offsetLeft - container.offsetWidth / 2 + activeButton.offsetWidth / 2;
        container.scrollTo({ left: scrollTarget, behavior: "smooth" });
      }
    }
  }, [currentPage]);
  const [totalCount, setTotalCount] = useState(initial.totalCount);
  const [totalPages, setTotalPages] = useState(initial.totalPages);
  const [fetchedCategories, setFetchedCategories] = useState<string[]>(initial.categories);

  // Default Categories fallback
  const defaultCategories = [
    "Semua Kategori",
    "Hotel",
    "Akomodasi",
    "Apartemen",
    "Chalet",
    "Guest House",
    "Hostel",
    "Restoran",
    "Kafe",
    "Supermarket",
    "Kecantikan",
    "Elektronik",
    "Otomotif",
    "Jasa",
    "Fashion",
    "Kesehatan",
    "Pendidikan"
  ];

  const categories = fetchedCategories.length > 0 ? fetchedCategories : defaultCategories;

  // Dynamic Locations extracted from loaded businesses and popular cities
  const locations = useMemo(() => {
    const fromData = apiBusinesses
      .map((b) => b.location)
      .filter((l): l is string => Boolean(l && l !== "-" && l.trim() !== ""))
      .map((l) => {
        const parts = l.split(",").map((p) => p.trim());
        return parts.length > 1 ? parts[parts.length - 1] : parts[0];
      })
      .filter((v, i, a) => v && a.indexOf(v) === i);

    const baseCities = [
      "Jakarta",
      "Bandung",
      "Surabaya",
      "Yogyakarta",
      "Medan",
      "Makassar",
      "Palembang",
      "Banyuwangi",
      "Bali",
      "Semarang",
      "Malang"
    ];

    const uniqueLocs = Array.from(new Set([...fromData, ...baseCities]));
    return ["Semua Lokasi", ...uniqueLocs];
  }, [apiBusinesses]);

  // Filter Ratings
  const ratings = [
    { label: "Semua Rating", min: 0 },
    { label: "5 Bintang", min: 5 },
    { label: "4+ Bintang", min: 4 },
    { label: "3+ Bintang", min: 3 },
    { label: "2+ Bintang", min: 2 },
    { label: "1+ Bintang", min: 1 }
  ];

  useEffect(() => {
    if (initial.categories.length > 0) return; // already provided by the server
    async function loadCategories() {
      try {
        const facets = await fetchCategoryFacets();
        if (facets && facets.length > 0) {
          const names = facets
            .filter((f) => isRealBusinessCategory(f.category))
            .map((f) => categoryDisplayName(f.category))
            .filter((v, i, a) => v && a.indexOf(v) === i);
          if (names.length > 0) {
            setFetchedCategories(["Semua Kategori", ...names]);
          }
        }
      } catch (err) {
        console.warn("Failed fetching category facets:", err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadApiBusinesses() {
      try {
        const sortParam =
          sortBy === "Rating Tertinggi"
            ? "rating"
            : sortBy === "Ulasan Terbanyak"
            ? "reviews"
            : "popular";

        // First run with default filters: the server already gave us this page.
        // Skip the refetch (it would just replace identical rows) but still fall
        // through to the lazy image loading below.
        let mapped: Business[] | null = null;
        if (!usedInitialData.current && initial.businesses.length > 0) {
          usedInitialData.current = true;
          mapped = initial.businesses;
        } else {
          usedInitialData.current = true;
          const res = await fetchBusinesses({
            search: searchQuery.trim() || undefined,
            city: selectedLocation === "Semua Lokasi" ? undefined : selectedLocation,
            category: selectedCategory === "Semua Kategori" ? undefined : selectedCategory,
            sort: sortParam,
            page: currentPage,
            limit: 12,
          });
          if (res && res.data) {
            mapped = res.data.map(mapApiBusinessToUiModel);
            setApiBusinesses(mapped);
            setTotalCount(res.pagination?.total || res.data.length);
            setTotalPages(res.pagination?.total_pages || 1);
          }
        }

        if (mapped) {
          // Lazy load dynamic place images from /business-places/search endpoint
          mapped.forEach((biz) => {
            if (!biz.imageUrl && biz.name) {
              fetchBusinessPlaceImage(
                biz.name,
                biz.location || "Indonesia",
                biz.latitude,
                biz.longitude
              )
                .then((img) => {
                  if (img) {
                    setApiBusinesses((prev) =>
                      prev.map((b) => (b.id === biz.id ? { ...b, imageUrl: img } : b))
                    );
                  }
                })
                .catch(() => {});
            }
          });
        }
      } catch (err) {
        console.warn("Error fetching API businesses:", err);
      }
    }
    loadApiBusinesses();
  }, [searchQuery, selectedCategory, selectedLocation, selectedRating, sortBy, currentPage]);

  // Fetch user favorites when logged in
  useEffect(() => {
    async function loadUserFavorites() {
      if (!isLoggedIn) return;
      try {
        const res = await fetchMyFavorites();
        if (res?.success && Array.isArray(res.data)) {
          const map: Record<string, boolean> = {};
          res.data.forEach((fav) => {
            if (fav.business?.id) {
              map[fav.business.id] = true;
            }
          });
          setFavorites(map);
        }
      } catch (err) {
        console.warn("Failed fetching user favorites:", err);
      }
    }
    loadUserFavorites();
  }, [isLoggedIn]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Semua Kategori");
    setSelectedLocation("Semua Lokasi");
    setSelectedRating("Semua Rating");
    setSortBy("Terpopuler");
    setCurrentPage(1);
  };

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.error("Silakan login terlebih dahulu untuk menyimpan bisnis");
      return;
    }
    if (togglingFavId === id) return;

    setTogglingFavId(id);
    const isFav = !!favorites[id];
    try {
      if (isFav) {
        const res = await unfavoriteBusiness(id);
        if (res?.success) {
          setFavorites((prev) => ({ ...prev, [id]: false }));
          toast.success("Bisnis berhasil dihapus dari daftar favorit");
        } else {
          toast.error(res?.message || "Gagal menghapus favorit");
        }
      } else {
        const res = await toggleFavorite(id);
        if (res?.success) {
          setFavorites((prev) => ({ ...prev, [id]: true }));
          toast.success("Bisnis berhasil ditambahkan ke daftar favorit");
        } else {
          toast.error(res?.message || "Gagal menyimpan favorit");
        }
      }
    } catch {
      toast.error("Terjadi kesalahan saat memproses favorit");
    } finally {
      setTogglingFavId(null);
    }
  };

  // Filtered & Sorted Businesses from API
  const filteredBusinesses = useMemo(() => {
    return apiBusinesses.filter((biz) => {
      const minRating =
        selectedRating === "Semua Rating"
          ? 0
          : parseInt(selectedRating.replace(/[^0-9]/g, "")) || 0;
      return biz.rating >= minRating;
    });
  }, [apiBusinesses, selectedRating]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans">
      <Navbar />

      {/* ================= BREADCRUMB & HERO BANNER ================= */}
      <section className="bg-gradient-to-b from-white to-[#f4faf7]/60 border-b border-slate-200/60 pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-[#008767] flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-semibold">Daftar Bisnis</span>
          </div>

          {/* Banner Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Header */}
            <div className="lg:col-span-6 space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008767]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Temukan bisnis terbaik di sekitar kamu</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Jelajahi <span className="text-[#008767]">Daftar Bisnis</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
                Temukan berbagai bisnis terbaik dari berbagai kategori dengan ulasan asli dari pengguna Katamereka.
              </p>
            </div>

            {/* Right Search & Quick Filters */}
            <div className="lg:col-span-6 space-y-3 bg-white p-4 sm:p-5 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/80">
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-[#008767]/30 transition-all">
                <Search className="w-4 h-4 text-slate-400 ml-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Cari nama bisnis, kategori, atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm py-1"
                />
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-full bg-[#008767] hover:bg-[#007458] text-white text-xs font-semibold flex-shrink-0 transition-all shadow-xs"
                >
                  Cari
                </button>
              </div>

              {/* Quick Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 pt-1">
                {[
                  { label: "Restoran", icon: Utensils, color: "text-amber-500" },
                  { label: "Hotel", icon: Hotel, color: "text-blue-500" },
                  { label: "Kecantikan", icon: Sparkles, color: "text-pink-500" },
                  { label: "Elektronik", icon: Laptop, color: "text-indigo-500" },
                  { label: "Travel & Wisata", icon: Plane, color: "text-sky-500" },
                ].map((chip) => {
                  const IconComp = chip.icon;
                  const isSelected = selectedCategory === chip.label;
                  return (
                    <button
                      key={chip.label}
                      onClick={() =>
                        setSelectedCategory(isSelected ? "Semua Kategori" : chip.label)
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-[#008767] text-white border-[#008767]"
                          : "bg-slate-50 border-slate-200 hover:border-[#008767] hover:text-[#008767]"
                      }`}
                    >
                      <IconComp className={`w-3.5 h-3.5 ${isSelected ? "text-white" : chip.color}`} />
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
                <Link
                  href="/klaim-bisnis"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold transition-all shadow-2xs ml-auto"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Klaim Bisnis Anda &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT (SIDEBAR + GRID) ================= */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ================= LEFT SIDEBAR FILTER (Desktop Only) ================= */}
            <aside className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6 lg:sticky lg:top-24">
              {/* Filter Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Filter Pencarian</h3>
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-[#008767] hover:underline"
                >
                  Reset
                </button>
              </div>

              {/* 1. Kategori */}
              <div className="space-y-2.5">
                <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider text-slate-400">
                  Kategori
                </h4>
                <div className="space-y-1.5 text-xs text-slate-600">
                  {categories.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2 cursor-pointer hover:text-[#008767] transition-colors py-0.5"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        className="accent-[#008767] w-3.5 h-3.5"
                      />
                      <span className={selectedCategory === cat ? "font-bold text-[#008767]" : ""}>
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 2. Lokasi */}
              <div className="space-y-2.5 border-t border-slate-100 pt-4">
                <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider text-slate-400">
                  Lokasi
                </h4>
                <div className="space-y-1.5 text-xs text-slate-600">
                  {locations.map((loc) => (
                    <label
                      key={loc}
                      className="flex items-center gap-2 cursor-pointer hover:text-[#008767] transition-colors py-0.5"
                    >
                      <input
                        type="radio"
                        name="location"
                        checked={selectedLocation === loc}
                        onChange={() => setSelectedLocation(loc)}
                        className="accent-[#008767] w-3.5 h-3.5"
                      />
                      <span className={selectedLocation === loc ? "font-bold text-[#008767]" : ""}>
                        {loc}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Rating Minimal */}
              <div className="space-y-2.5 border-t border-slate-100 pt-4">
                <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider text-slate-400">
                  Rating Minimal
                </h4>
                <div className="space-y-1.5 text-xs text-slate-600">
                  {ratings.map((r) => (
                    <label
                      key={r.label}
                      className="flex items-center gap-2 cursor-pointer hover:text-[#008767] transition-colors py-0.5"
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={selectedRating === r.label}
                        onChange={() => setSelectedRating(r.label)}
                        className="accent-[#008767] w-3.5 h-3.5"
                      />
                      <span className={selectedRating === r.label ? "font-bold text-[#008767]" : ""}>
                        {r.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* ================= RIGHT BUSINESS CARDS GRID ================= */}
            <main className="lg:col-span-9 space-y-6">
              {/* Results Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 bg-white px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <p className="text-xs sm:text-sm font-medium text-slate-600">
                  Menampilkan <span className="font-bold text-slate-900">{filteredBusinesses.length}</span> bisnis
                </p>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 w-full sm:w-auto sm:flex sm:items-center">
                  {/* Custom Category Filter Dropdown */}
                  <div ref={categoryDropdownRef} className="relative w-full sm:w-auto min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenCategoryDropdown((prev) => !prev);
                        setOpenLocationDropdown(false);
                        setOpenSortDropdown(false);
                      }}
                      className={`w-full sm:w-auto flex items-center justify-between gap-1 px-1.5 xs:px-2 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                        openCategoryDropdown || selectedCategory !== "Semua Kategori"
                          ? "bg-[#e8f6f2] border-[#008767] text-[#008767]"
                          : "bg-white border-slate-200 text-slate-700 hover:border-[#008767]/50"
                      }`}
                    >
                      <span className="truncate">{selectedCategory === "Semua Kategori" ? "Kategori" : selectedCategory}</span>
                      <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${openCategoryDropdown ? "rotate-180 text-[#008767]" : ""}`} />
                    </button>

                    {openCategoryDropdown && (
                      <div className="absolute left-0 mt-2 w-56 sm:w-64 max-h-60 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 p-1.5 z-50">
                        <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                          Pilih Kategori
                        </div>
                        {categories.map((cat) => {
                          const isSelected = selectedCategory === cat;
                          const displayLabel = cat === "Semua Kategori" ? "Kategori (Semua)" : cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setSelectedCategory(cat);
                                setCurrentPage(1);
                                setOpenCategoryDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-[#008767] text-white font-bold"
                                  : "text-slate-700 hover:bg-[#e8f6f2] hover:text-[#008767]"
                              }`}
                            >
                              <span className="truncate pr-2">{displayLabel}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Custom Location Filter Dropdown */}
                  <div ref={locationDropdownRef} className="relative w-full sm:w-auto min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenLocationDropdown((prev) => !prev);
                        setOpenCategoryDropdown(false);
                        setOpenSortDropdown(false);
                      }}
                      className={`w-full sm:w-auto flex items-center justify-between gap-1 px-1.5 xs:px-2 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                        openLocationDropdown || selectedLocation !== "Semua Lokasi"
                          ? "bg-[#e8f6f2] border-[#008767] text-[#008767]"
                          : "bg-white border-slate-200 text-slate-700 hover:border-[#008767]/50"
                      }`}
                    >
                      <span className="truncate">{selectedLocation === "Semua Lokasi" ? "Lokasi" : selectedLocation}</span>
                      <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${openLocationDropdown ? "rotate-180 text-[#008767]" : ""}`} />
                    </button>

                    {openLocationDropdown && (
                      <div className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 w-56 sm:w-64 max-h-60 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 p-1.5 z-50">
                        <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                          Pilih Lokasi
                        </div>
                        {locations.map((loc) => {
                          const isSelected = selectedLocation === loc;
                          const displayLabel = loc === "Semua Lokasi" ? "Lokasi (Semua)" : loc;
                          return (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => {
                                setSelectedLocation(loc);
                                setCurrentPage(1);
                                setOpenLocationDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-[#008767] text-white font-bold"
                                  : "text-slate-700 hover:bg-[#e8f6f2] hover:text-[#008767]"
                              }`}
                            >
                              <span className="truncate pr-2">{displayLabel}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Custom Sort Dropdown */}
                  <div ref={sortDropdownRef} className="relative w-full sm:w-auto min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenSortDropdown((prev) => !prev);
                        setOpenCategoryDropdown(false);
                        setOpenLocationDropdown(false);
                      }}
                      className={`w-full sm:w-auto flex items-center justify-between gap-1 px-1.5 xs:px-2 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                        openSortDropdown
                          ? "bg-[#e8f6f2] border-[#008767] text-[#008767]"
                          : "bg-white border-slate-200 text-slate-700 hover:border-[#008767]/50"
                      }`}
                    >
                      <span className="truncate">{sortBy}</span>
                      <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${openSortDropdown ? "rotate-180 text-[#008767]" : ""}`} />
                    </button>

                    {openSortDropdown && (
                      <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 p-1.5 z-50">
                        <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                          Urutkan
                        </div>
                        {["Terpopuler", "Rating Tertinggi", "Ulasan Terbanyak"].map((opt) => {
                          const isSelected = sortBy === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setSortBy(opt);
                                setOpenSortDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-[#008767] text-white font-bold"
                                  : "text-slate-700 hover:bg-[#e8f6f2] hover:text-[#008767]"
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid 3x3 */}
              {filteredBusinesses.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Store className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">Tidak ada bisnis ditemukan</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Coba sesuaikan kata kunci atau reset filter pencarian Anda.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 rounded-full bg-[#008767] text-white text-xs font-semibold shadow-xs"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredBusinesses.map((biz) => {
                    const isFav = !!favorites[biz.id];
                    return (
                      <div
                        key={biz.id}
                        className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 hover:border-[#008767]/40 transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Banner Container with Dynamic Photo */}
                          <div className="relative h-32 bg-slate-100 overflow-hidden p-3 border-b border-slate-100 flex items-start justify-between">
                            {biz.imageUrl ? (
                              <img
                                src={biz.imageUrl}
                                alt={biz.name}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50/40">
                                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                  <Store className="w-20 h-20 text-slate-800" />
                                </div>
                              </div>
                            )}
                            {biz.imageUrl && (
                              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                            )}

                          </div>

                          {/* Content Body */}
                          <div className="p-4 space-y-3 relative pt-6">
                            {/* Overlapping Logo Badge */}
                            <div
                              className={`absolute -top-6 left-4 w-12 h-12 rounded-xl shadow-md border-2 border-white flex items-center justify-center font-bold text-sm ${biz.color}`}
                            >
                              {biz.initials}
                            </div>

                            {/* Title, Info & Love Button */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-slate-900 text-base group-hover:text-[#008767] transition-colors line-clamp-1">
                                  {biz.name}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                  {biz.category} • {biz.location}
                                </p>
                              </div>

                              {/* Love Button beside business name */}
                              <button
                                onClick={(e) => handleToggleFavorite(biz.id, e)}
                                disabled={togglingFavId === biz.id}
                                aria-label="Favorit"
                                title={isFav ? "Hapus dari favorit" : "Tambah ke favorit"}
                                className={`p-1.5 -mr-1 -mt-1 rounded-full transition-all flex-shrink-0 cursor-pointer ${
                                  isFav
                                    ? "text-rose-500 bg-rose-50 hover:bg-rose-100"
                                    : "text-slate-400 hover:text-rose-500 hover:bg-rose-50/60"
                                }`}
                              >
                                <Heart
                                  className={`w-4 h-4 ${
                                    isFav ? "fill-rose-500 text-rose-500" : ""
                                  }`}
                                />
                              </button>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-1 text-xs font-semibold">
                              {biz.rating > 0 && biz.reviewCount > 0 ? (
                                <>
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  <span className="text-amber-500">{biz.rating.toFixed(1)}</span>
                                  <span className="text-slate-400 font-normal">
                                    ({biz.reviewCountFormatted})
                                  </span>
                                </>
                              ) : (
                                <span className="text-slate-400 font-normal">-</span>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {biz.description}
                            </p>
                          </div>
                        </div>

                        {/* Card Bottom Link */}
                        <div className="px-4 pb-4 pt-2">
                          <Link
                            href={`/business/${biz.slug}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#008767] hover:text-[#006e54] transition-colors group-hover:translate-x-1 transition-transform"
                          >
                            <span>Lihat Detail</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Bar */}
              <div className="flex items-center justify-center gap-2 pt-6 text-xs font-semibold">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-[#008767] hover:text-[#008767] flex items-center justify-center transition-colors disabled:opacity-40 shrink-0 shadow-2xs"
                >
                  ‹
                </button>

                {/* 5-Box Width Scrollable Container (Independent horizontal scroll) */}
                <div
                  ref={paginationContainerRef}
                  className="flex items-center gap-1.5 overflow-x-auto max-w-[220px] py-1 px-1 no-scrollbar scroll-smooth"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      data-page={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-xl font-bold shrink-0 transition-all ${
                        currentPage === page
                          ? "bg-[#008767] text-white shadow-md shadow-[#008767]/25"
                          : "bg-white border border-slate-200 text-slate-600 hover:border-[#008767] hover:text-[#008767]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-[#008767] hover:text-[#008767] flex items-center justify-center transition-colors disabled:opacity-40 shrink-0 shadow-2xs"
                >
                  ›
                </button>
              </div>
            </main>

          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12 text-slate-600 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Top Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Brand Info */}
            <div className="lg:col-span-6 space-y-4">
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

          </div>

          {/* Bottom Footer Bar */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} Katamereka. Semua hak dilindungi.</p>
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
