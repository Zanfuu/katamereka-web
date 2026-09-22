"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import { getBusinessBySlug } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  User,
  Building2,
  Home,
  Star,
  Share2,
  ExternalLink
} from "lucide-react";

function ReviewSuccessContent() {
  const searchParams = useSearchParams();
  const businessSlug = searchParams.get("business") || "sunny-cafe";
  const business = getBusinessBySlug(businessSlug);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm text-center space-y-8">
            
            {/* SUCCESS ICON & BADGE */}
            <div className="relative inline-block">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100/80 border-4 border-emerald-50 text-[#008767] flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold shadow-xs">
                <Sparkles className="w-4 h-4 fill-slate-900" />
              </div>
            </div>

            {/* HEADLINE & SUBTEXT */}
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008767] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
                🎉 Review Berhasil Terbit!
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
                Terima Kasih Atas Ulasanmu, {user?.name.split(" ")[0] || "Dewi"}!
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
                Ulasanmu untuk <span className="font-bold text-slate-900">{business.name}</span> telah berhasil dipublikasikan dan akan membantu ribuan pengguna Katamereka.
              </p>
            </div>

            {/* BUSINESS PREVIEW CARD */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 text-left max-w-md mx-auto space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${business.color} flex items-center justify-center font-bold text-lg shrink-0`}>
                  {business.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{business.name}</h3>
                  <p className="text-xs text-slate-500">📍 {business.location} • {business.category}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>5.0</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                <span>Status: <strong className="text-emerald-600">Terverifikasi</strong></span>
                <span>Ditulis oleh @{user?.username || "dewilestari"}</span>
              </div>
            </div>

            {/* ACTION BUTTONS GRID */}
            <div className="pt-4 space-y-3 max-w-md mx-auto">
              <Link
                href={`/business/${business.slug}`}
                className="w-full px-6 py-3.5 rounded-2xl bg-[#008767] hover:bg-[#007458] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Building2 className="w-4 h-4" />
                <span>Lihat Profil {business.name}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/profile"
                  className="px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-[#008767]" />
                  <span>Lihat Profil Saya</span>
                </Link>

                <Link
                  href="/businesses"
                  className="px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-3.5 h-3.5 text-[#008767]" />
                  <span>Cari Bisnis Lain</span>
                </Link>
              </div>
            </div>

          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Katamereka. Terima kasih telah mendukung ekosistem review jujur Indonesia.</p>
      </footer>
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
