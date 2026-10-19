"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import { getBusinessBySlug } from "@/lib/mock-data";
import { fetchBusinessBySlug, fetchBusinessPlaceImage, mapApiBusinessToUiModel } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import {
  Calendar,
  User,
  Store,
  Search,
  ArrowRight,
  MapPin,
  Star,
} from "lucide-react";

function unslugify(slug: string): string {
  if (!slug) return "Bisnis";
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "KM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function ReviewSuccessContent() {
  const searchParams = useSearchParams();
  const businessSlug = searchParams.get("business") || searchParams.get("slug") || "hanz-pickup-rent-car";
  const ratingParam = searchParams.get("rating");
  const { user } = useAuth();

  const [businessData, setBusinessData] = useState<{
    name: string;
    location: string;
    imageUrl?: string | null;
    slug: string;
    rating: number;
    initials: string;
  }>(() => {
    const mock = getBusinessBySlug(businessSlug);
    const fallbackName = mock?.name || unslugify(businessSlug);
    return {
      name: fallbackName,
      location: mock?.location || "Pontianak, Kalimantan Barat",
      imageUrl: mock?.imageUrl || null,
      slug: businessSlug,
      rating: ratingParam ? parseFloat(ratingParam) : (mock?.rating || 5.0),
      initials: mock?.initials || getInitials(fallbackName),
    };
  });

  useEffect(() => {
    async function loadData() {
      if (!businessSlug) return;
      try {
        const res = await fetchBusinessBySlug(businessSlug);
        if (res) {
          const rawBusiness = (res as any)?.data || res;
          const mapped = mapApiBusinessToUiModel(rawBusiness);
          const resolvedName = mapped.name && mapped.name !== "KM" ? mapped.name : unslugify(businessSlug);

          let img = mapped.imageUrl;
          if (!img && resolvedName) {
            try {
              const placeImg = await fetchBusinessPlaceImage(
                resolvedName,
                mapped.location || "Pontianak",
                mapped.latitude,
                mapped.longitude
              );
              if (placeImg) img = placeImg;
            } catch {}
          }

          setBusinessData({
            name: resolvedName,
            location: mapped.location && mapped.location !== "-" ? mapped.location : "Pontianak, Kalimantan Barat",
            imageUrl: img,
            slug: mapped.slug || businessSlug,
            rating: ratingParam ? parseFloat(ratingParam) : (mapped.rating || 5.0),
            initials: getInitials(resolvedName),
          });
        } else {
          const fallbackName = unslugify(businessSlug);
          setBusinessData((prev) => ({
            ...prev,
            name: prev.name && prev.name !== "Hanz Pickup Rent Car" ? prev.name : fallbackName,
            initials: getInitials(prev.name || fallbackName),
            location: prev.location && prev.location !== "-" ? prev.location : "Pontianak, Kalimantan Barat",
          }));
        }
      } catch (err) {
        console.warn("Could not fetch business detail for success page:", err);
      }
    }
    loadData();
  }, [businessSlug, ratingParam]);

  const publishedDateStr = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const authorName = user?.name || (user?.email ? user.email.split("@")[0] : "oeyy");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4faf7]/40 via-white to-[#edf8f3]/50 text-slate-800 font-sans flex flex-col justify-between relative overflow-hidden">
      <div>
        <Navbar />

        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col items-center">
          {/* 1. TEKS TERIMA KASIH & SUBTEKS DI TENGAH ATAS */}
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-[#008767] border border-emerald-100 text-xs font-semibold mb-3.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Ulasan Terpublikasikan
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#111827] tracking-tight leading-tight">
              Terima Kasih <br className="sm:hidden" />
              Atas Ulasanmu!
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 max-w-lg mx-auto mt-2.5 sm:mt-3 leading-relaxed">
              Ulasanmu untuk{" "}
              <span className="font-bold text-slate-800">{businessData.name}</span>{" "}
              telah berhasil dipublikasikan.
            </p>
          </div>

          {/* 2. CARD BOX DISATUKAN (Unified Card Container) */}
          <div className="w-full max-w-4xl bg-white rounded-3xl sm:rounded-[32px] border border-slate-100/90 shadow-xl shadow-slate-200/60 p-6 sm:p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 md:gap-10 items-center">
              {/* KOLOM KIRI: KOMPONEN GAMBAR */}
              <div className="md:col-span-5 flex items-center justify-center">
                <div className="w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px] flex items-center justify-center">
                  <img
                    src="/review-success.png"
                    alt="Terima Kasih Atas Ulasanmu"
                    className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-xs"
                    draggable={false}
                  />
                </div>
              </div>

              {/* KOLOM KANAN: KARTU BISNIS & TOMBOL AKSI */}
              <div className="md:col-span-7 flex flex-col justify-center space-y-4">
                {/* Kartu Review Bisnis */}
                <div className="w-full bg-[#fafcfb] rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 text-left">
                  {/* Top Business Info Row */}
                  <div className="flex items-center gap-3.5">
                    {/* Thumbnail / Avatar */}
                    <div className="w-16 h-14 sm:w-18 sm:h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                      {businessData.imageUrl ? (
                        <img
                          src={businessData.imageUrl}
                          alt={businessData.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#e6f7ef] flex items-center justify-center font-bold text-[#007052] text-lg">
                          {businessData.initials}
                        </div>
                      )}
                    </div>

                    {/* Title & Location */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                        {businessData.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{businessData.location}</span>
                      </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="bg-[#fff9e6] text-[#b45309] border border-[#fef08a] px-2.5 py-1 rounded-xl flex items-center gap-1 font-bold text-xs sm:text-sm shrink-0 shadow-2xs">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{businessData.rating > 0 ? businessData.rating.toFixed(1) : "5.0"}</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-200/70 my-3.5" />

                  {/* Bottom 2-Column Meta */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Published Date */}
                    <div>
                      <span className="block text-[11px] text-slate-400 font-medium">
                        Dipublikasikan
                      </span>
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-[#008767] shrink-0" />
                        <span>{publishedDateStr}</span>
                      </div>
                    </div>

                    {/* Author */}
                    <div className="border-l border-slate-200/70 pl-4 sm:pl-6">
                      <span className="block text-[11px] text-slate-400 font-medium">
                        Ditulis oleh
                      </span>
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 mt-1 truncate">
                        <User className="w-3.5 h-3.5 text-[#008767] shrink-0" />
                        <span className="truncate">{authorName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="w-full space-y-2.5 pt-1">
                  {/* Main CTA */}
                  <Link
                    href={`/business/${businessData.slug}`}
                    className="w-full py-3.5 px-6 rounded-full bg-[#007052] hover:bg-[#005a42] text-white font-bold text-sm sm:text-base transition-all shadow-md shadow-[#007052]/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98"
                  >
                    <Store className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span>Lihat Profil Bisnis</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  </Link>

                  {/* Secondary Buttons Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/profile"
                      className="py-2.5 sm:py-3 px-4 rounded-full border border-slate-800 hover:border-[#007052] text-slate-800 hover:text-[#007052] bg-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-2xs hover:scale-[1.01] active:scale-98"
                    >
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#007052] shrink-0" />
                      <span>Profil Saya</span>
                    </Link>
                    <Link
                      href="/businesses"
                      className="py-2.5 sm:py-3 px-4 rounded-full border border-slate-800 hover:border-[#007052] text-slate-800 hover:text-[#007052] bg-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-2xs hover:scale-[1.01] active:scale-98"
                    >
                      <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#007052] shrink-0" />
                      <span>Cari Bisnis</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="w-full pt-8 pb-6 text-center relative z-10">
        <div className="w-7 h-7 rounded-full overflow-hidden mx-auto mb-2 opacity-90 shadow-2xs bg-[#008767]">
          <img src="/logo.png" alt="Katamereka Logo" className="w-full h-full object-cover" />
        </div>
        <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mx-auto leading-relaxed px-4">
          © 2026 Katamereka. Terima kasih telah mendukung ekosistem review jujur Indonesia.
        </p>
      </footer>

      {/* DECORATIVE BOTTOM MINT WAVE */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none -z-0">
        <svg
          className="w-full h-12 sm:h-16"
          viewBox="0 0 1440 80"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0,32 C360,75 1080,5 1440,40 L1440,80 L0,80 Z"
            fill="#e2f4ea"
            fillOpacity="0.5"
          />
        </svg>
      </div>
    </div>
  );
}

export default function ReviewSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-[#008767] font-semibold text-sm">
            <div className="w-5 h-5 border-2 border-[#008767] border-t-transparent rounded-full animate-spin" />
            <span>Memuat konfirmasi...</span>
          </div>
        </div>
      }
    >
      <ReviewSuccessContent />
    </Suspense>
  );
}
