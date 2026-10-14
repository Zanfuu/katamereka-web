"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Star,
  ChevronDown,
  Check,
  Search,
  MapPin,
  CheckCircle2,
  Building2,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { mapApiBusinessToUiModel, ApiBusinessListItem } from "@/lib/api-client";

interface CategoryClientProps {
  categoryName: string;
  categorySlug: string;
  initialBusinesses: ApiBusinessListItem[];
  cityList: string[];
}

function formatCategoryUnitLabel(categoryName: string): string {
  const lower = categoryName.toLowerCase();
  if (lower.includes("hotel") || lower.includes("akomodasi")) return "hotel";
  if (lower.includes("restoran") || lower.includes("kuliner") || lower.includes("makan")) return "restoran & tempat makan";
  if (lower.includes("kafe") || lower.includes("coffee") || lower.includes("kopi")) return "kafe";
  if (lower.includes("kecantikan") || lower.includes("salon") || lower.includes("spa")) return "layanan kecantikan";
  if (lower.includes("otomotif") || lower.includes("bengkel")) return "tempat otomotif";
  if (lower.includes("belanja") || lower.includes("supermarket") || lower.includes("ritel")) return "tempat belanja";
  return categoryName.toLowerCase();
}

export default function CategoryClient({
  categoryName,
  categorySlug,
  initialBusinesses,
  cityList,
}: CategoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Semua Lokasi");
  const [sortBy, setSortBy] = useState("Terpopuler");
  const [openCityDropdown, setOpenCityDropdown] = useState(false);
  const [openSortDropdown, setOpenSortDropdown] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent | TouchEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setOpenCityDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setOpenSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleGlobalClick);
    document.addEventListener("touchstart", handleGlobalClick);
    return () => {
      document.removeEventListener("mousedown", handleGlobalClick);
      document.removeEventListener("touchstart", handleGlobalClick);
    };
  }, []);

  const uiBusinesses = useMemo(() => {
    return (initialBusinesses || []).map(mapApiBusinessToUiModel);
  }, [initialBusinesses]);

  const filteredBusinesses = useMemo(() => {
    return uiBusinesses.filter((b) => {
      const matchSearch =
        !searchQuery ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCity =
        selectedCity === "Semua" ||
        selectedCity === "Semua Lokasi" ||
        selectedCity === "Lokasi" ||
        b.location.toLowerCase().includes(selectedCity.toLowerCase()) ||
        (b.address || "").toLowerCase().includes(selectedCity.toLowerCase());

      return matchSearch && matchCity;
    });
  }, [uiBusinesses, searchQuery, selectedCity]);

  const sortedBusinesses = useMemo(() => {
    const list = [...filteredBusinesses];
    if (sortBy === "Rating Tertinggi") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "Ulasan Terbanyak") {
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    return list;
  }, [filteredBusinesses, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedBusinesses.length / itemsPerPage));

  const paginatedBusinesses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedBusinesses.slice(start, start + itemsPerPage);
  }, [sortedBusinesses, currentPage, itemsPerPage]);

  const availableCities = useMemo(() => {
    // Extract unique locations strictly from businesses present in this category
    const extractedCities = uiBusinesses
      .map((b) => {
        const loc = (b.location || b.address || "").trim();
        if (!loc) return "";
        // Extract city name if formatted like "Palembang, South Sumatra"
        const primaryCity = loc.split(",")[0].trim();
        return primaryCity;
      })
      .filter(Boolean);

    const uniqueCities = Array.from(new Set(extractedCities));
    return ["Semua Lokasi", ...uniqueCities];
  }, [uiBusinesses]);

  const visiblePageNumbers = useMemo(() => {
    const maxButtons = 5;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="space-y-8">
      
      {/* ── HERO BANNER HEADER ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 rounded-3xl p-6 sm:p-10 border border-emerald-100/80 shadow-xs">
        <div className="max-w-3xl space-y-4">
          <div>
            <span className="inline-block text-[11px] font-bold text-[#008767] bg-[#e8f6f2] px-3 py-1 rounded-md border border-[#c4ebde] mb-3 tracking-wider uppercase">
              KATEGORI
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {categoryName} di Indonesia
            </h1>
          </div>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Temukan {categoryName.toLowerCase()} terbaik di berbagai kota, lengkap dengan informasi, ulasan, dan rating dari pelanggan Katamereka.
          </p>

          {/* Integrated Search Box */}
          <div className="pt-2 max-w-xl">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200/90 flex items-center gap-2 focus-within:ring-2 focus-within:ring-[#008767]/30 transition-all"
            >
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Cari nama ${categoryName.toLowerCase()} atau lokasi...`}
                className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-sm py-1 font-medium"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007458] text-white text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-xs"
              >
                Cari
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── LOCATION FILTER & SORT DROPDOWN BAR ── */}
      <div className="relative z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-3 sm:px-6 sm:py-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Count / Info */}
        <p className="text-xs sm:text-sm font-medium text-slate-600">
          Menampilkan <span className="font-bold text-slate-900">{sortedBusinesses.length}</span> {formatCategoryUnitLabel(categoryName)}
        </p>

        {/* Dropdowns Container (1 Row Horizontal Bersebelahan 50%-50% & Palette Katamereka) */}
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-2.5">
          {/* Custom Location Dropdown */}
          <div ref={cityDropdownRef} className={`relative w-full sm:w-auto min-w-0 ${openCityDropdown ? "z-50" : "z-10"}`}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenCityDropdown((prev) => !prev);
                setOpenSortDropdown(false);
              }}
              className={`w-full sm:w-auto flex items-center justify-between gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                openCityDropdown || (selectedCity !== "Semua" && selectedCity !== "Semua Lokasi" && selectedCity !== "Lokasi")
                  ? "bg-[#e8f6f2] border-[#008767] text-[#008767]"
                  : "bg-white border-slate-200 text-slate-700 hover:border-[#008767]/50"
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-[#008767] shrink-0" />
                <span className="truncate">
                  {selectedCity === "Semua" || selectedCity === "Semua Lokasi" || selectedCity === "Lokasi"
                    ? "Lokasi"
                    : selectedCity}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                  openCityDropdown ? "rotate-180 text-[#008767]" : ""
                }`}
              />
            </button>

            {openCityDropdown && (
              <div className="absolute left-0 mt-2 w-56 sm:w-64 max-h-60 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 p-1.5 z-50">
                {availableCities.map((city) => {
                  const isDefaultCity = city === "Semua Lokasi" || city === "Semua" || city === "Lokasi";
                  const isSelected =
                    selectedCity === city ||
                    ((selectedCity === "Semua Lokasi" || selectedCity === "Semua" || selectedCity === "Lokasi") && isDefaultCity);
                  const displayLabel = isDefaultCity ? "Lokasi" : city;
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCity(city);
                        setOpenCityDropdown(false);
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
          <div ref={sortDropdownRef} className={`relative w-full sm:w-auto min-w-0 ${openSortDropdown ? "z-50" : "z-10"}`}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenSortDropdown((prev) => !prev);
                setOpenCityDropdown(false);
              }}
              className={`w-full sm:w-auto flex items-center justify-between gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                openSortDropdown
                  ? "bg-[#e8f6f2] border-[#008767] text-[#008767]"
                  : "bg-white border-slate-200 text-slate-700 hover:border-[#008767]/50"
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#008767] shrink-0" />
                <span className="truncate">{sortBy}</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                  openSortDropdown ? "rotate-180 text-[#008767]" : ""
                }`}
              />
            </button>

            {openSortDropdown && (
              <div className="absolute right-0 mt-2 w-48 sm:w-52 max-h-60 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 p-1.5 z-50">
                {["Terpopuler", "Rating Tertinggi", "Ulasan Terbanyak"].map((opt) => {
                  const isSelected = sortBy === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
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

      {/* ── 3-COLUMN CARDS GRID ── */}
      {sortedBusinesses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-sm text-slate-500 space-y-2">
          <p className="font-bold text-slate-700">Tidak ada {categoryName.toLowerCase()} yang sesuai pencarian atau filter.</p>
          <p className="text-xs text-slate-400">Coba ubah kata kunci atau pilih kota lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedBusinesses.map((biz, idx) => (
            <div
              key={biz.id || idx}
              className="group bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-xl hover:border-[#008767]/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Card Top: Initials */}
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#008767] border border-emerald-100 font-extrabold text-sm flex items-center justify-center shrink-0">
                    {biz.initials || biz.name.charAt(0)}
                  </div>
                </div>

                {/* Card Info */}
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-[#008767] transition-colors line-clamp-2 leading-snug">
                    {biz.name}
                  </h3>

                  {/* Rating & Review Count: ONLY show if rating > 0 AND reviewCount > 0 */}
                  {biz.rating > 0 && biz.reviewCount > 0 ? (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-900">{biz.rating}</span>
                      <span className="text-slate-400 font-medium">
                        ({biz.reviewCountFormatted || `${biz.reviewCount} ulasan`})
                      </span>
                    </div>
                  ) : null}

                  {/* Location */}
                  <div className="flex items-center gap-1 text-xs text-slate-500 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{biz.location}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Detail Link */}
              <div className="pt-4 mt-4 border-t border-slate-100/80">
                <Link
                  href={`/business/${biz.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#008767] hover:text-[#006e54] transition-colors"
                >
                  <span>Lihat Detail</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── INTERACTIVE PAGINATION BAR ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-6 text-xs font-semibold">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 300, behavior: "smooth" });
            }}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-[#008767] hover:text-[#008767] disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Halaman Sebelumnya"
          >
            ‹
          </button>

          {visiblePageNumbers.map((pageNum) => {
            const isActive = currentPage === pageNum;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => {
                  setCurrentPage(pageNum);
                  window.scrollTo({ top: 300, behavior: "smooth" });
                }}
                className={`w-8 h-8 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#008767] text-white font-bold shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-[#008767] hover:text-[#008767]"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => {
              setCurrentPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 300, behavior: "smooth" });
            }}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-[#008767] hover:text-[#008767] disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Halaman Berikutnya"
          >
            ›
          </button>
        </div>
      )}

      {/* ── BOTTOM CALLOUT BANNER ── */}
      <div className="bg-[#e8f6f2]/80 border border-[#bce4d7] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mt-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#008767] flex items-center justify-center shrink-0 border border-[#bce4d7] shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-slate-900 text-base">
              Belum menemukan {categoryName.toLowerCase()} yang Anda cari?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              Coba cari dengan nama {categoryName.toLowerCase()}, lokasi, atau kata kunci lainnya.
            </p>
          </div>
        </div>

        <Link
          href="/businesses"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#008767] text-[#008767] text-xs sm:text-sm font-bold hover:bg-[#008767] hover:text-white transition-all shrink-0 shadow-xs"
        >
          <Search className="w-4 h-4" />
          <span>Cari {categoryName} Lainnya</span>
        </Link>
      </div>

    </div>
  );
}

