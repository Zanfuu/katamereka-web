"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import type { ApiBusinessDetail, VerificationMethod, BusinessClaimStatus } from "@/lib/api-client";
import { CONSUMER_SITE_URL } from "@/lib/site-config";

interface BusinessTrustScoreViewProps {
  business: ApiBusinessDetail;
  actualRating?: number;
  actualReviewCount?: number;
  placeImageUrl?: string | null;
  claimStatus: BusinessClaimStatus | null;
  isBusinessMember: boolean;
  claimModalOpen: boolean;
  setClaimModalOpen: (open: boolean) => void;
  claimForm: {
    verification_method: VerificationMethod;
    proof_url: string;
    message: string;
  };
  setClaimForm: React.Dispatch<
    React.SetStateAction<{
      verification_method: VerificationMethod;
      proof_url: string;
      message: string;
    }>
  >;
  onSubmitClaim: () => void;
  claimSubmitting: boolean;
}

export default function BusinessTrustScoreView({
  business,
  actualRating,
  actualReviewCount,
  placeImageUrl,
  claimStatus,
  isBusinessMember,
  claimModalOpen,
  setClaimModalOpen,
  claimForm,
  setClaimForm,
  onSubmitClaim,
  claimSubmitting,
}: BusinessTrustScoreViewProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  // 1. Dynamic Review Count & Rating (strictly KataMereka reviews, zero out synthetic placeholders)
  const reviewCount =
    actualReviewCount !== undefined
      ? actualReviewCount
      : Number(
          (business as any)?.review_count ??
            business.reviewCount ??
            (business as any)?.reviews_count ??
            0
        );

  const rawApiRating =
    actualRating !== undefined && actualRating !== null && actualRating > 0
      ? actualRating
      : (business as any)?.average_rating ??
        (business as any)?.averageRating ??
        (business as any)?.avg ??
        (business as any)?.avg_rating ??
        business.rating ??
        0;

  let parsedRating =
    typeof rawApiRating === "number"
      ? rawApiRating
      : parseFloat(String(rawApiRating || 0));
  if (isNaN(parsedRating)) parsedRating = 0;
  if (parsedRating > 5) parsedRating = parsedRating / 2;

  const ratingScore = parsedRating > 0 ? Number(parsedRating.toFixed(1)) : 0;
  const avgRatingDisplay = ratingScore > 0 ? ratingScore.toFixed(1) : "0.0";

  // 2. Dynamic Business Name (clean, without hyphens)
  const displayName = business.name?.trim()
    ? business.name.trim()
    : business.slug
    ? business.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Bisnis";

  // 3. Dynamic Rating Headline Status
  let statusText = "No reviews yet";
  if (ratingScore > 0 || reviewCount > 0) {
    if (ratingScore >= 4.5) statusText = "Sangat Baik";
    else if (ratingScore >= 4.0) statusText = "Bagus";
    else if (ratingScore >= 3.0) statusText = "Rata-rata";
    else if (ratingScore > 0) statusText = "Cukup";
  }

  function handleClaimClick() {
    if (!isLoggedIn) {
      router.push(
        `/login?role=bisnis&redirect=${encodeURIComponent(
          `/business/${business.slug}?from=business`
        )}`
      );
      return;
    }
    setClaimModalOpen(true);
  }

  const consumerUrl = `${CONSUMER_SITE_URL}/business/${business.slug}`;

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* ── NAVBAR ── */}
      <Navbar isBusinessPage={true} />

      {/* ── MINIMAL DYNAMIC TRUSTSCORE SECTION (EXACT MATCH TO USER SCREENSHOT) ── */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center w-full">
        {/* Dynamic Business Name (no hyphens) */}
        <p className="text-base sm:text-lg font-medium text-slate-800 tracking-tight">
          {displayName}
        </p>

        {/* Dynamic Headline ("No reviews yet" or status) */}
        <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-slate-900 mt-5 tracking-tight">
          {statusText}
        </h1>

        {/* 5-STAR BOXES ROW + DYNAMIC AVG RATING BESIDE IT */}
        <div className="flex items-center justify-center gap-3.5 pt-4">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((starNum) => {
              const isFilled = ratingScore > 0 && starNum <= Math.round(ratingScore);
              return (
                <div
                  key={starNum}
                  className={`size-11 sm:size-12 rounded-[3px] flex items-center justify-center transition-colors ${
                    isFilled
                      ? "bg-[#008767] text-white shadow-xs"
                      : "bg-[#d8dce2] text-white"
                  }`}
                >
                  <Star className="size-6 sm:size-7 fill-white text-transparent" />
                </div>
              );
            })}
          </div>

          {/* Dynamic Average Rating Display */}
          <div className="flex items-baseline gap-1 text-slate-900 font-extrabold text-2xl sm:text-3xl pl-1 tracking-tight">
            <span>{avgRatingDisplay}</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-400">/ 5.0</span>
          </div>
        </div>

        {/* Review count text (dynamic) */}
        <p className="text-xs text-slate-500 pt-2 font-medium">
          {reviewCount > 0
            ? `Berdasarkan ${reviewCount} ulasan konsumen di KataMereka`
            : "Belum ada ulasan konsumen"}
        </p>

        {/* ── CARD CALL TO ACTION (VERSI KATAMEREKA) ── */}
        <section className="mt-12 sm:mt-16 w-full max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-7 sm:p-9 space-y-3 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Kelola Profil & Ulasan Bisnis Anda
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg mx-auto">
              Klaim kepemilikan profil {displayName} secara gratis untuk memperbarui informasi operasional,
              menanggapi ulasan konsumen secara langsung, dan meningkatkan reputasi bisnis Anda di KataMereka.
            </p>
          </div>

          {/* Tombol dipisahkan di bawah card */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={handleClaimClick}
              size="lg"
              className="w-full sm:w-auto bg-[#008767] hover:bg-[#007458] text-white font-bold px-7 py-3 rounded-full text-sm shadow-md shadow-emerald-900/10 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Klaim Profil Gratis
            </Button>

            <a
              href={consumerUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#008767] px-5 py-3 rounded-full border border-slate-200 hover:border-slate-300 transition-colors bg-white shadow-xs"
            >
              <span>Halaman Ulasan Publik</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-slate-100 py-8 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#008767] flex items-center justify-center text-[10px] text-white font-black">
              KM
            </div>
            <span className="font-bold text-slate-800">
              Kata<span className="text-[#008767]">mereka</span> Bisnis
            </span>
          </div>
          <p>© {new Date().getFullYear()} KataMereka. Hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-4">
            <Link href="/bisnis" className="hover:text-slate-800">
              Beranda Bisnis
            </Link>
            <Link href="/klaim-bisnis" className="hover:text-slate-800">
              Cari Bisnis
            </Link>
            <a href={consumerUrl} target="_blank" rel="noreferrer" className="hover:text-[#008767]">
              Situs Konsumen
            </a>
          </div>
        </div>
      </footer>

      {/* ── CLAIM MODAL DIALOG ── */}
      <Dialog open={claimModalOpen} onOpenChange={setClaimModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Klaim {business.name}</DialogTitle>
            <DialogDescription className="text-xs">
              Lengkapi formulir verifikasi kepemilikan agar tim KataMereka dapat memvalidasi dan
              menyerahkan hak akses kelola kepada Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="claim-method" className="text-xs font-medium">
                Metode Verifikasi
              </Label>
              <Select
                value={claimForm.verification_method}
                onValueChange={(v) =>
                  typeof v === "string" &&
                  setClaimForm((f) => ({
                    ...f,
                    verification_method: v as VerificationMethod,
                  }))
                }
              >
                <SelectTrigger id="claim-method" className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOCUMENT">Dokumen Legal (NIB / SIUP / Akta)</SelectItem>
                  <SelectItem value="EMAIL">Email Domain Resmi Bisnis</SelectItem>
                  <SelectItem value="PHONE">Nomor Telepon Tempat Usaha</SelectItem>
                  <SelectItem value="WEBSITE">Website Bisnis</SelectItem>
                  <SelectItem value="OTHER">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proof-url" className="text-xs font-medium">
                Link Bukti Dokumen / Foto Berkas
              </Label>
              <Input
                id="proof-url"
                type="url"
                placeholder="https://drive.google.com/... atau link dokumen"
                value={claimForm.proof_url}
                onChange={(e) =>
                  setClaimForm((f) => ({ ...f, proof_url: e.target.value }))
                }
                className="text-xs"
              />
              <p className="text-[10px] text-slate-400">
                Cantumkan link Google Drive/Cloud foto izin usaha atau identitas tempat kerja.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="claim-message" className="text-xs font-medium">
                Pesan / Catatan Tambahan (Opsional)
              </Label>
              <Textarea
                id="claim-message"
                placeholder="Contoh: Saya adalah pemilik sah dari bisnis ini di lokasi tersebut..."
                rows={3}
                value={claimForm.message}
                onChange={(e) =>
                  setClaimForm((f) => ({ ...f, message: e.target.value }))
                }
                className="text-xs resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClaimModalOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={onSubmitClaim}
                disabled={claimSubmitting}
                className="bg-[#008767] hover:bg-[#007458] text-white text-xs font-semibold"
              >
                {claimSubmitting ? "Mengirim Pengajuan..." : "Kirimkan Ajuan Klaim"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
