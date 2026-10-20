"use client";

import React, { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  Building2,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Store,
  ArrowRight,
  Filter,
} from "lucide-react";

import Navbar from "@/components/navbar";
import {
  fetchBusinesses,
  createBusinessClaim,
  mapApiBusinessToUiModel,
  type VerificationMethod,
} from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Business } from "@/lib/mock-data";

function KlaimBisnisContent() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const searchParams = useSearchParams();

  // ?q= comes from the search box on the /bisnis landing page
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [selectedCity, setSelectedCity] = useState("Semua Kota");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [hasClaimedMatches, setHasClaimedMatches] = useState(false);
  const [loading, setLoading] = useState(true);

  // Claim Modal State
  const [activeBiz, setActiveBiz] = useState<Business | null>(null);
  const [claimMethod, setClaimMethod] = useState<VerificationMethod>("DOCUMENT");
  const [claimProofUrl, setClaimProofUrl] = useState("");
  const [claimMessage, setClaimMessage] = useState("");
  const [claimSubmitting, setClaimSubmitting] = useState(false);

  const loadUnclaimedBusinesses = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchBusinesses({
        unclaimed: true,
        search: searchQuery.trim() || undefined,
        city: selectedCity === "Semua Kota" ? undefined : selectedCity,
        category: selectedCategory === "Semua Kategori" ? undefined : selectedCategory,
        limit: 18,
      });

      if (res && res.data) {
        const mapped = res.data.map(mapApiBusinessToUiModel);
        setBusinesses(mapped);

        // Jika 0 bisnis belum diklaim tapi ada query pencarian,
        // cek apakah bisnis tersebut sebenarnya sudah terdaftar & sudah diklaim
        if (mapped.length === 0 && searchQuery.trim()) {
          try {
            const allCheck = await fetchBusinesses({
              search: searchQuery.trim(),
              limit: 3,
            });
            setHasClaimedMatches(Boolean(allCheck?.data && allCheck.data.length > 0));
          } catch {
            setHasClaimedMatches(false);
          }
        } else {
          setHasClaimedMatches(false);
        }
      }
    } catch (err) {
      console.warn("Failed fetching unclaimed businesses:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCity, selectedCategory]);

  React.useEffect(() => {
    loadUnclaimedBusinesses();
  }, [loadUnclaimedBusinesses]);

  function handleOpenClaim(biz: Business) {
    if (!isLoggedIn) {
      toast.info("Silakan login terlebih dahulu untuk mengajukan klaim bisnis.");
      router.push(`/login?redirect=${encodeURIComponent(`/klaim-bisnis`)}`);
      return;
    }
    setActiveBiz(biz);
    setClaimMethod("DOCUMENT");
    setClaimProofUrl("");
    setClaimMessage("");
  }

  async function handleSubmitClaim() {
    if (!activeBiz?.id) return;
    setClaimSubmitting(true);
    try {
      const res = await createBusinessClaim(activeBiz.id, {
        verification_method: claimMethod,
        proof_url: claimProofUrl.trim() || undefined,
        message: claimMessage.trim() || undefined,
      });

      if (res.success) {
        toast.success(
          res.message || "Klaim berhasil dikirim! Silakan pantau statusnya di dashboard."
        );
        setActiveBiz(null);
        // Refresh directory
        loadUnclaimedBusinesses();
      } else {
        toast.error(res.message || "Gagal mengirimkan klaim bisnis.");
      }
    } catch {
      toast.error("Terjadi kendala koneksi saat mengirimkan formulir klaim.");
    } finally {
      setClaimSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans flex flex-col justify-between">
      <div>
        <Navbar />

        {/* HERO SECTION */}
        <section className="bg-gradient-to-b from-white via-emerald-50/20 to-slate-50 border-b border-slate-200/80 pt-10 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Temukan & <span className="text-[#008767]">Klaim Bisnis</span> Anda
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Bisnis atau cabang Anda mungkin sudah terdaftar oleh pengguna kami. Klaim kepemilikannya secara gratis untuk mengelola profil, memperbarui jam operasional, dan merespons ulasan pelanggan secara resmi.
              </p>
            </div>

            {/* SEARCH & FILTERS BAR */}
            <div className="max-w-4xl mx-auto bg-white p-3 sm:p-4 rounded-2xl sm:rounded-full border border-slate-200 shadow-lg shadow-slate-200/60 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 w-full px-3">
                <Search className="size-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Ketik nama bisnis Anda (misal: TransGO, Hotel Malioboro)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 py-1"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-slate-700 outline-none cursor-pointer"
                >
                  <option value="Semua Kota">Semua Kota</option>
                  <option value="Jakarta">DKI Jakarta</option>
                  <option value="Bandung">Bandung</option>
                  <option value="Surabaya">Surabaya</option>
                  <option value="Yogyakarta">Yogyakarta</option>
                  <option value="Semarang">Semarang</option>
                  <option value="Bali">Bali</option>
                  <option value="Medan">Medan</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-slate-700 outline-none cursor-pointer"
                >
                  <option value="Semua Kategori">Semua Kategori</option>
                  <option value="Transportasi">Transportasi</option>
                  <option value="Hotel">Hotel & Akomodasi</option>
                  <option value="Restoran">Makanan & Restoran</option>
                  <option value="Kafe">Kafe</option>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Jasa">Jasa & Layanan</option>
                </select>

                <Button
                  onClick={loadUnclaimedBusinesses}
                  className="bg-[#008767] hover:bg-[#007458] text-white rounded-full text-xs px-5 shrink-0"
                >
                  Cari
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* LISTING SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Bisnis Belum Diklaim</h2>
              <p className="text-xs text-slate-500">
                Pilih bisnis Anda di bawah ini dan klik tombol klaim untuk verifikasi kepemilikan.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              Ditemukan {businesses.length} bisnis
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-white border border-slate-200 animate-pulse p-4" />
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4">
              <div
                className={`size-14 rounded-2xl flex items-center justify-center mx-auto ${
                  hasClaimedMatches ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-[#008767]"
                }`}
              >
                {hasClaimedMatches ? <ShieldCheck className="size-7" /> : <Store className="size-7" />}
              </div>
              <h3 className="font-bold text-slate-800 text-base">
                {hasClaimedMatches ? "Bisnis Sudah Diklaim" : "Bisnis Anda Belum Terdaftar?"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {hasClaimedMatches ? (
                  <>
                    Bisnis dengan kata kunci <span className="font-semibold text-slate-800">"{searchQuery}"</span> sudah terdaftar dan telah diklaim oleh pemilik resminya. Bisnis yang sudah terverifikasi tidak dapat diklaim kembali melalui halaman ini.
                  </>
                ) : (
                  "Tidak menemukan bisnis yang Anda cari? Anda bisa mendaftarkan bisnis baru secara langsung ke platform KataMereka."
                )}
              </p>
              {hasClaimedMatches ? (
                <div className="flex items-center justify-center pt-1">
                  <Button
                    render={<Link href="/dashboard" />}
                    className="bg-[#008767] hover:bg-[#007458] text-white text-xs w-full sm:w-auto"
                  >
                    Buka Dashboard Bisnis
                  </Button>
                </div>
              ) : (
                <Button render={<Link href="/bisnis" />} className="bg-[#008767] hover:bg-[#007458] text-white text-xs">
                  Daftarkan Bisnis Baru
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((biz: Business) => (
                <Card
                  key={biz.id}
                  className="overflow-hidden border border-slate-200/90 hover:border-[#008767]/50 hover:shadow-lg transition-all flex flex-col justify-between group bg-white"
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="size-12 rounded-xl bg-emerald-50 border border-emerald-100 text-[#008767] font-bold text-base flex items-center justify-center shrink-0">
                        {biz.initials || "KM"}
                      </div>
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-semibold text-[10px]">
                        Belum Diklaim
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-[#008767] transition-colors line-clamp-1">
                        {biz.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {biz.category} • {biz.location}
                      </p>
                      {biz.address && biz.address !== "-" && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-1 flex items-center gap-1">
                          <MapPin className="size-3 text-slate-400 shrink-0" />
                          <span>{biz.address}</span>
                        </p>
                      )}
                    </div>

                    {biz.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {biz.description}
                      </p>
                    )}
                  </CardContent>

                  <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                    <Link
                      href={`/business/${biz.slug}`}
                      className="text-xs font-semibold text-slate-500 hover:text-[#008767] flex items-center gap-1"
                    >
                      <span>Lihat Profil</span>
                      <ExternalLink className="size-3" />
                    </Link>

                    <Button
                      size="sm"
                      onClick={() => handleOpenClaim(biz)}
                      className="bg-[#008767] hover:bg-[#007458] text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <ShieldCheck className="size-3.5" />
                      <span>Klaim Bisnis Ini</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* CLAIM SUBMISSION MODAL */}
      <Dialog open={!!activeBiz} onOpenChange={(open) => !open && setActiveBiz(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Klaim {activeBiz?.name}</DialogTitle>
            <DialogDescription className="text-xs">
              Lengkapi formulir verifikasi kepemilikan agar tim KataMereka dapat memvalidasi dan menyerahkan hak akses kelola kepada Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="method">Metode Verifikasi</Label>
              <Select
                value={claimMethod}
                onValueChange={(v) => v && setClaimMethod(v as VerificationMethod)}
              >
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOCUMENT">Dokumen Resmi (NIB / SIUP / KTP Owner)</SelectItem>
                  <SelectItem value="WEBSITE">Website Resmi Bisnis</SelectItem>
                  <SelectItem value="EMAIL">Email Resmi Domain Bisnis</SelectItem>
                  <SelectItem value="PHONE">Nomor Telepon Resmi</SelectItem>
                  <SelectItem value="OTHER">Metode Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proof-url">Link Dokumen Bukti (Google Drive / Cloud)</Label>
              <Input
                id="proof-url"
                type="url"
                placeholder="https://drive.google.com/file/d/..."
                value={claimProofUrl}
                onChange={(e) => setClaimProofUrl(e.target.value)}
              />
              <p className="text-[11px] text-slate-500">
                Unggah dokumen legalitas/surat tugas ke cloud storage dan pastikan link dapat dibuka.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="message">Pesan untuk Tim Verifikator (opsional)</Label>
              <Textarea
                id="message"
                rows={3}
                placeholder="Jelaskan jabatan Anda dan detail kepemilikan bisnis ini..."
                value={claimMessage}
                onChange={(e) => setClaimMessage(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveBiz(null)}
              disabled={claimSubmitting}
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitClaim}
              disabled={claimSubmitting}
              className="bg-[#008767] hover:bg-[#007458] text-white"
            >
              {claimSubmitting ? "Mengirim Pengajuan..." : "Kirimkan Klaim"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function KlaimBisnisPage() {
  return (
    <Suspense fallback={null}>
      <KlaimBisnisContent />
    </Suspense>
  );
}
