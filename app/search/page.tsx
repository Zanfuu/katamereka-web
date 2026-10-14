"use client";

import { Suspense, useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { fetchBusinesses, fetchBusinessPlaceImage, mapApiBusinessToUiModel } from "@/lib/api-client";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Bookmark,
  ChevronRight,
  ChevronDown,
  Check,
  CheckCircle2,
  SlidersHorizontal,
  Building2,
  Briefcase,
  Package,
  Wrench,
  Smartphone,
  Globe,
  X,
  ArrowUp,
  MessageSquare
} from "lucide-react";


function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState<string>(initialQuery);
  const [activeQuery, setActiveQuery] = useState<string>(initialQuery);
  const [selectedType, setSelectedType] = useState<string>("Semua");
  const [selectedCategorySidebar, setSelectedCategorySidebar] = useState<string>("Semua");
  const [selectedLocation, setSelectedLocation] = useState<string>("Semua Lokasi");
  const [sortBy, setSortBy] = useState<string>("Paling Relevan");
  const [openLocationDropdown, setOpenLocationDropdown] = useState(false);
  const [openSortDropdown, setOpenSortDropdown] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [apiItems, setApiItems] = useState<any[]>([]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) {
        setOpenLocationDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setOpenSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleGlobalClick);
    return () => document.removeEventListener("mousedown", handleGlobalClick);
  }, []);

  // Live API integration: fetch businesses from GET /businesses endpoint
  useEffect(() => {
    async function loadLiveBusinesses() {
      try {
        const res = await fetchBusinesses({
          search: activeQuery.trim() || undefined,
          limit: 50
        });

        if (res && res.data && Array.isArray(res.data)) {
          const mapped = res.data.map((item) => {
            const ui = mapApiBusinessToUiModel(item);
            return {
              id: ui.id,
              slug: ui.slug,
              name: ui.name,
              website: `${ui.slug}.katamereka.id`,
              category: ui.category,
              location: ui.location,
              latitude: ui.latitude,
              longitude: ui.longitude,
              rating: typeof ui.rating === "number" ? ui.rating : (parseFloat(String(ui.rating)) || 0),
              reviewCount: ui.reviewCount || 0,
              reviewCountFormatted: ui.reviewCountFormatted || `${ui.reviewCount || 0} ulasan`,
              badge: "Terverifikasi" as const,
              initials: ui.initials || ui.name.substring(0, 2).toUpperCase(),
              color: ui.color || "bg-[#008767] text-white",
              type: ui.category.toLowerCase().includes("restoran") || ui.category.toLowerCase().includes("service") ? "Jasa" : "Bisnis",
              bannerUrl: ui.imageUrl || null,
            };
          });
          setApiItems(mapped);

          // Lazy load dynamic place images if missing
          mapped.forEach((biz) => {
            if (!biz.bannerUrl && biz.name) {
              fetchBusinessPlaceImage(
                biz.name,
                biz.location || "Indonesia",
                biz.latitude,
                biz.longitude
              )
                .then((img) => {
                  if (img) {
                    setApiItems((prev) =>
                      prev.map((b) => (b.id === biz.id ? { ...b, bannerUrl: img } : b))
                    );
                  }
                })
                .catch(() => {});
            }
          });
        }
      } catch (err) {
        console.warn("Error fetching live search businesses:", err);
      }
    }
    loadLiveBusinesses();
  }, [activeQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchInput);
    setSelectedLocation("Semua Lokasi");
    router.replace(searchInput.trim() ? `/search?q=${encodeURIComponent(searchInput)}` : "/search");
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Combine: only real API items (no mock data)
  const allSearchItems = useMemo(() => {
    return [...apiItems];
  }, [apiItems]);

  // Extract unique locations from active search results
  const availableLocations = useMemo(() => {
    const locSet = new Set<string>();
    allSearchItems.forEach((item) => {
      if (item.location && typeof item.location === "string") {
        const clean = item.location.trim();
        if (clean && clean !== "-") {
          locSet.add(clean);
        }
      }
    });
    return Array.from(locSet).sort((a, b) => a.localeCompare(b));
  }, [allSearchItems]);

  // Filter items
  const filteredResults = useMemo(() => {
    const q = activeQuery.toLowerCase().trim();

    let results = allSearchItems.filter((item) => {
      const targetText = `${item.name} ${item.category} ${item.location} ${item.website}`.toLowerCase();
      const queryWords = q.split(/\s+/).filter(Boolean);

      const matchesQuery =
        !q ||
        targetText.includes(q) ||
        queryWords.every((word) => targetText.includes(word)) ||
        queryWords.some((word) => word.length >= 3 && targetText.includes(word));

      const matchesType = selectedType === "Semua" || item.type === selectedType;
      const matchesCategorySidebar =
        selectedCategorySidebar === "Semua" || item.type === selectedCategorySidebar;
      const matchesLocation =
        selectedLocation === "Semua Lokasi" ||
        item.location === selectedLocation ||
        (typeof item.location === "string" &&
          item.location.toLowerCase().includes(selectedLocation.toLowerCase()));

      return matchesQuery && matchesType && matchesCategorySidebar && matchesLocation;
    });

    if (sortBy === "Rating Tertinggi") {
      results = [...results].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "Ulasan Terbanyak") {
      results = [...results].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    return results;
  }, [allSearchItems, activeQuery, selectedType, selectedCategorySidebar, selectedLocation, sortBy]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans flex flex-col justify-between">
      <div>
        <Navbar />

        {/* ================= HERO HEADER & SEARCH INPUT ================= */}
        <section className="bg-gradient-to-b from-white via-[#f4faf7]/60 to-slate-50/40 border-b border-slate-200/60 pt-6 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Link href="/" className="hover:text-[#008767] transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#008767] font-semibold">Hasil Pencarian</span>
            </nav>

            {/* Header Content & Searchbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
                  Hasil Pencarian
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Temukan bisnis terbaik yang sesuai dengan pencarian kamu.
                </p>
              </div>

              {/* Header Search Form Box */}
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2.5 w-full md:w-auto"
              >
                <div className="relative flex-1 md:w-96">
                  <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Cari nama bisnis, website, atau kategori..."
                    className="w-full pl-11 pr-9 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20 shadow-2xs transition-all"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => setSearchInput("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:border-[#008767] hover:text-[#008767] text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
                >
                  <Filter className="w-3.5 h-3.5 text-[#008767]" />
                  <span>Filter</span>
                </button>
              </form>
            </div>

            {/* Sub-Filter Pills & Sort Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
              {/* Type Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {["Semua", "Bisnis", "Produk", "Tempat", "Jasa", "Aplikasi", "Institusi"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 border ${
                      selectedType === type
                        ? "bg-[#008767] text-white border-[#008767] shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#008767] hover:text-[#008767]"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Filter Lokasi & Sort Selector (Satu Baris Bersebelahan & Palette Katamereka) */}
              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-semibold text-slate-600 w-full sm:w-auto shrink-0 flex-nowrap">
                {/* Custom Dropdown Filter Lokasi */}
                <div ref={locationDropdownRef} className="relative flex-1 sm:flex-initial min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenLocationDropdown((prev) => !prev);
                      setOpenSortDropdown(false);
                    }}
                    className={`w-full sm:w-auto flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                      openLocationDropdown || selectedLocation !== "Semua Lokasi"
                        ? "bg-[#e8f6f2] border-[#008767] text-[#008767]"
                        : "bg-white border-slate-200 text-slate-700 hover:border-[#008767]/50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-[#008767] shrink-0" />
                      <span className="truncate max-w-[95px] sm:max-w-[150px]">{selectedLocation}</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                        openLocationDropdown ? "rotate-180 text-[#008767]" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu Lokasi (Scrollable & Stylized) */}
                  {openLocationDropdown && (
                    <div className="absolute left-0 mt-2 w-64 sm:w-72 max-h-60 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 p-1.5 z-50">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                        Pilih Lokasi Bisnis
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLocation("Semua Lokasi");
                          setOpenLocationDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          selectedLocation === "Semua Lokasi"
                            ? "bg-[#008767] text-white font-bold"
                            : "text-slate-700 hover:bg-[#e8f6f2] hover:text-[#008767]"
                        }`}
                      >
                        <span>Semua Lokasi</span>
                        {selectedLocation === "Semua Lokasi" && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>

                      {availableLocations.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            setSelectedLocation(loc);
                            setOpenLocationDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            selectedLocation === loc
                              ? "bg-[#008767] text-white font-bold"
                              : "text-slate-700 hover:bg-[#e8f6f2] hover:text-[#008767]"
                          }`}
                        >
                          <span className="truncate pr-2">{loc}</span>
                          {selectedLocation === loc && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Dropdown Sort */}
                <div ref={sortDropdownRef} className="relative flex-1 sm:flex-initial min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenSortDropdown((prev) => !prev);
                      setOpenLocationDropdown(false);
                    }}
                    className={`w-full sm:w-auto flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                      openSortDropdown
                        ? "bg-[#e8f6f2] border-[#008767] text-[#008767]"
                        : "bg-white border-slate-200 text-slate-700 hover:border-[#008767]/50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#008767] shrink-0" />
                      <span className="truncate max-w-[85px] sm:max-w-[130px]">{sortBy}</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                        openSortDropdown ? "rotate-180 text-[#008767]" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu Sort */}
                  {openSortDropdown && (
                    <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 p-1.5 z-50">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                        Urutkan Berdasarkan
                      </div>
                      {["Paling Relevan", "Rating Tertinggi", "Ulasan Terbanyak", "Terbaru"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setSortBy(opt);
                            setOpenSortDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            sortBy === opt
                              ? "bg-[#008767] text-white font-bold"
                              : "text-slate-700 hover:bg-[#e8f6f2] hover:text-[#008767]"
                          }`}
                        >
                          <span>{opt}</span>
                          {sortBy === opt && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ================= MAIN CONTENT AREA ================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* Result Count Banner */}
          <div className="text-xs font-bold text-slate-600">
            <span>{filteredResults.length} hasil ditemukan untuk </span>
            <span className="text-[#008767]">"{activeQuery}"</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT 8 COLUMNS: LIST OF BUSINESS CARDS */}
            <div className="lg:col-span-8 space-y-5">
              {filteredResults.length > 0 ? (
                filteredResults.map((item) => (
                  <Link
                    key={item.id}
                    href={`/business/${item.slug}`}
                    className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-stretch justify-between gap-6 hover:border-slate-300 hover:shadow-md transition-all group"
                  >
                    {/* Left Part: Logo & Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Logo Box */}
                      <div
                        className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center font-bold text-base shadow-xs shrink-0 border border-slate-200/60 group-hover:scale-105 transition-transform`}
                      >
                        {item.initials}
                      </div>

                      {/* Text Details */}
                      <div className="space-y-2 min-w-0 flex-1">
                        <h3 className="font-extrabold text-slate-900 text-[15px] sm:text-lg group-hover:text-[#008767] transition-colors leading-snug break-words">
                          {item.name}
                        </h3>

                        {/* Website & Category Badge */}
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span className="text-slate-400 font-medium hover:underline flex items-center gap-1 truncate">
                            {item.website}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                            {item.category}
                          </span>
                        </div>

                        {/* Rating Stars & Count */}
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          {item.rating > 0 && item.reviewCount > 0 ? (
                            <>
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                              <span className="text-amber-500">{item.rating.toFixed(1)}</span>
                              <span className="text-slate-400 font-normal">
                                ({item.reviewCountFormatted})
                              </span>
                            </>
                          ) : (
                            <span className="text-slate-400 font-normal">-</span>
                          )}
                        </div>

                        {/* Location */}
                        <p className="text-xs text-slate-500 flex items-center gap-1 pt-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right Part: Banner Image & Actions */}
                    <div className="w-full md:w-56 h-36 rounded-2xl overflow-hidden relative bg-gradient-to-br from-slate-100 to-emerald-50 border border-slate-200/80 shrink-0 group">
                      {item.bannerUrl ? (
                        <img
                          src={item.bannerUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 flex items-center justify-center font-bold text-2xl text-emerald-800/60">
                          {item.initials}
                        </div>
                      )}

                      {/* Bookmark Icon Button Top Right */}
                      <button
                        onClick={(e) => toggleBookmark(item.id, e)}
                        className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all shadow-xs ${
                          bookmarks[item.id]
                            ? "bg-[#008767] text-white"
                            : "bg-white/90 text-slate-700 hover:bg-white hover:text-[#008767]"
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${bookmarks[item.id] ? "fill-white" : ""}`} />
                      </button>

                      {/* Circular Navigation Arrow Bottom Right */}
                      <div className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-slate-800 group-hover:bg-[#008767] group-hover:text-white transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      Tidak ada hasil ditemukan
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Coba gunakan kata kunci lain atau pilih kategori yang tersedia di menu samping.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT 4 COLUMNS: SIDEBAR CATEGORY SELECTOR */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Building2 className="w-5 h-5 text-[#008767]" />
                  <h3 className="font-bold text-slate-900 text-base">Kategori</h3>
                </div>

                <div className="space-y-1">
                  {[
                    { label: "Semua", icon: Building2, count: 6 },
                    { label: "Bisnis", icon: Briefcase, count: 3 },
                    { label: "Produk", icon: Package, count: 1 },
                    { label: "Tempat", icon: MapPin, count: 1 },
                    { label: "Jasa", icon: Wrench, count: 1 },
                    { label: "Aplikasi", icon: Smartphone, count: 0 },
                    { label: "Institusi", icon: Building2, count: 0 },
                  ].map((cat) => {
                    const IconComp = cat.icon;
                    const isSelected = selectedCategorySidebar === cat.label;
                    return (
                      <button
                        key={cat.label}
                        onClick={() => setSelectedCategorySidebar(cat.label)}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs transition-all ${
                          isSelected
                            ? "bg-[#e8f6f2] text-[#008767] font-bold border border-[#bce4d7]"
                            : "text-slate-700 hover:bg-slate-50 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <IconComp className={`w-4 h-4 ${isSelected ? "text-[#008767]" : "text-slate-400"}`} />
                          <span>{cat.label}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isSelected
                              ? "bg-[#008767] text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12 text-slate-600 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
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

            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Tautan Cepat</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/" className="hover:text-[#008767]">Beranda</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767]">Jelajahi</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767]">Kategori</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Kategori</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/businesses" className="hover:text-[#008767]">Asuransi & Keuangan</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767]">Restoran & Kuliner</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767]">Hotel & Penginapan</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} Katamereka. Semua hak dilindungi.</p>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#008767]"
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-[#008767] font-semibold text-sm">
            <div className="w-5 h-5 border-2 border-[#008767] border-t-transparent rounded-full animate-spin" />
            <span>Memuat hasil pencarian...</span>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
