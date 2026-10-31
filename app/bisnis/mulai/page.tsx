"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  PlusCircle,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth-context";
import {
  createBusinessClaim,
  createOwnBusiness,
  fetchBusinesses,
  type CreateOwnBusinessPayload,
} from "@/lib/api-client";
import { fetchMyBusinesses } from "@/lib/api-business-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

type Step = "choose" | "claim" | "create" | "done";

interface ClaimableBusiness {
  id: string;
  name: string;
  slug: string;
  address?: string | null;
  city?: string | null;
  category?: string | null;
}

const CATEGORY_SUGGESTIONS = [
  "Restoran",
  "Kafe",
  "Toko Retail",
  "Salon & Spa",
  "Bengkel",
  "Hotel & Penginapan",
  "Klinik & Kesehatan",
  "Pendidikan & Kursus",
  "Jasa Profesional",
  "Rental Kendaraan",
  "Lainnya",
];

const EMPTY_FORM = {
  name: "",
  category: "",
  address: "",
  city: "",
  province: "",
  phone: "",
  email: "",
  website: "",
  short_description: "",
};

function formatDeadline(iso?: string | null): string {
  if (!iso) return "30 hari ke depan";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "30 hari ke depan";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function StartBusinessContent() {
  const router = useRouter();
  const { isLoggedIn, isAuthReady } = useAuth();

  const [step, setStep] = useState<Step>("choose");
  const [checking, setChecking] = useState(true);

  // Klaim
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClaimableBusiness[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<ClaimableBusiness | null>(null);

  // Buat baru
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [doneInfo, setDoneInfo] = useState<{ name: string; slug: string; deadline?: string | null } | null>(
    null
  );

  // Wajib login; user yang sudah punya bisnis tidak perlu wizard lagi.
  useEffect(() => {
    if (!isAuthReady) return;
    if (!isLoggedIn) {
      router.replace(`/login?role=bisnis&redirect=${encodeURIComponent("/bisnis/mulai")}`);
      return;
    }
    let cancelled = false;
    fetchMyBusinesses().then((list) => {
      if (cancelled) return;
      if (list.length > 0) {
        router.replace("/dashboard");
      } else {
        setChecking(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthReady, isLoggedIn, router]);

  const runSearch = useCallback(async () => {
    const q = query.trim();
    if (q.length < 2) {
      toast.info("Ketik minimal 2 huruf nama bisnis.");
      return;
    }
    setSearching(true);
    setSelected(null);
    try {
      const res = await fetchBusinesses({ unclaimed: true, search: q, limit: 8 });
      setResults(((res?.data ?? []) as unknown as ClaimableBusiness[]).filter((b) => b?.id));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  }, [query]);

  async function handleClaim() {
    if (!selected) return;
    setSubmitting(true);
    const res = await createBusinessClaim(selected.id);
    setSubmitting(false);
    if (!res.success) {
      toast.error(res.message || "Gagal mengklaim bisnis");
      return;
    }
    setDoneInfo({
      name: selected.name,
      slug: selected.slug,
      deadline: res.data?.verification_deadline,
    });
    setStep("done");
  }

  function setField<K extends keyof typeof EMPTY_FORM>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const required: [keyof typeof EMPTY_FORM, string][] = [
      ["name", "Nama bisnis"],
      ["category", "Kategori"],
      ["address", "Alamat"],
      ["city", "Kota"],
      ["phone", "Nomor telepon / WhatsApp"],
    ];
    const missing = required.find(([k]) => !form[k].trim());
    if (missing) {
      setFormError(`${missing[1]} wajib diisi.`);
      return;
    }
    if (form.email.trim() && !form.email.includes("@")) {
      setFormError("Format email tidak valid.");
      return;
    }

    const payload: CreateOwnBusinessPayload = {
      name: form.name.trim(),
      category: form.category.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      phone: form.phone.trim(),
      ...(form.province.trim() ? { province: form.province.trim() } : {}),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      ...(form.website.trim() ? { website: form.website.trim() } : {}),
      ...(form.short_description.trim() ? { short_description: form.short_description.trim() } : {}),
    };

    setSubmitting(true);
    const res = await createOwnBusiness(payload);
    setSubmitting(false);
    if (!res.success || !res.data) {
      setFormError(res.message || "Gagal membuat bisnis.");
      return;
    }
    setDoneInfo({ name: res.data.name, slug: res.data.slug, deadline: res.data.verification_deadline });
    setStep("done");
  }

  if (!isAuthReady || !isLoggedIn || checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Skeleton className="w-full max-w-2xl h-[420px] rounded-3xl" />
      </div>
    );
  }

  const backToChoose = () => {
    setStep("choose");
    setFormError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f6f2] via-slate-50 to-[#f4faf7] flex items-start justify-center p-4 sm:p-6 pt-10 sm:pt-14 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-emerald-950/10 border border-slate-100 p-5 sm:p-8 space-y-6">
        <Link href="/bisnis" className="inline-flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-[#008767] overflow-hidden flex items-center justify-center">
            <img src="/logo.png" alt="Katamereka" className="w-full h-full object-cover" />
          </span>
          <span className="text-lg font-extrabold text-[#008767] tracking-tight">Katamereka Bisnis</span>
        </Link>

        {/* ===== Pilih jalur ===== */}
        {step === "choose" && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Akun siap! Sekarang daftarkan bisnis Anda</h1>
              <p className="text-sm text-slate-500">
                Bisnis Anda langsung tampil di Katamereka. Bukti kepemilikan bisa dilengkapi belakangan dalam 30 hari.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setStep("claim")}
                className="text-left rounded-2xl border border-slate-200 hover:border-[#008767] hover:bg-[#f2faf7] p-4 space-y-2 transition-colors cursor-pointer"
              >
                <Search className="w-5 h-5 text-[#008767]" />
                <p className="font-bold text-slate-900 text-sm">Klaim bisnis yang sudah ada</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bisnis Anda mungkin sudah terdaftar di Katamereka. Cari namanya lalu klaim sebagai pemilik.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setStep("create")}
                className="text-left rounded-2xl border border-slate-200 hover:border-[#008767] hover:bg-[#f2faf7] p-4 space-y-2 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-5 h-5 text-[#008767]" />
                <p className="font-bold text-slate-900 text-sm">Buat bisnis baru</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bisnis Anda belum ada di Katamereka? Isi datanya dan langsung tayang.
                </p>
              </button>
            </div>

            <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 leading-relaxed">
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Setelah terdaftar, lengkapi verifikasi dalam <strong>30 hari</strong>. Tim Katamereka akan meninjau
                bukti Anda; sebelum disetujui bisnis tampil dengan label <strong>Belum terverifikasi</strong>.
              </span>
            </div>
          </div>
        )}

        {/* ===== Klaim ===== */}
        {step === "claim" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={backToChoose}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#008767] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali
            </button>
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-slate-900">Cari bisnis Anda</h1>
              <p className="text-sm text-slate-500">Ketik nama bisnis, lalu pilih yang sesuai.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                runSearch();
              }}
              className="flex gap-2"
            >
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Contoh: Hotel Santika, Apotek IKA"
                className="h-10 text-sm"
              />
              <Button type="submit" disabled={searching} className="h-10 bg-[#008767] hover:bg-[#007055] text-white">
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari"}
              </Button>
            </form>

            {searched && results.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 space-y-2">
                <p>
                  Tidak ada bisnis yang bisa diklaim dengan nama tersebut. Bisa jadi belum terdaftar, atau sudah
                  diklaim pemiliknya.
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setField("name", query.trim());
                    setStep("create");
                  }}
                  className="bg-[#008767] hover:bg-[#007055] text-white"
                >
                  Buat bisnis baru &quot;{query.trim()}&quot;
                </Button>
              </div>
            )}

            {results.length > 0 && (
              <ul className="space-y-2 max-h-72 overflow-y-auto">
                {results.map((b) => {
                  const active = selected?.id === b.id;
                  return (
                    <li key={b.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(b)}
                        className={`w-full text-left rounded-2xl border p-3 flex items-start gap-3 transition-colors cursor-pointer ${
                          active ? "border-[#008767] bg-[#f2faf7]" : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <Building2 className="w-5 h-5 mt-0.5 text-[#008767] shrink-0" />
                        <span className="min-w-0">
                          <span className="block font-bold text-sm text-slate-900 truncate">{b.name}</span>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{[b.address, b.city].filter(Boolean).join(", ") || "Alamat belum tersedia"}</span>
                          </span>
                        </span>
                        {active && <CheckCircle2 className="w-5 h-5 text-[#008767] ml-auto shrink-0" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {selected && (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Dengan mengklaim <strong>{selected.name}</strong>, Anda langsung menjadi pemilik di Katamereka.
                  Pastikan Anda memang berhak atas bisnis ini &mdash; klaim yang tidak sah akan ditolak saat verifikasi.
                </p>
                <Button
                  type="button"
                  onClick={handleClaim}
                  disabled={submitting}
                  className="w-full h-10 bg-[#008767] hover:bg-[#007055] text-white font-bold"
                >
                  {submitting ? "Memproses..." : "Klaim bisnis ini"}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ===== Buat baru ===== */}
        {step === "create" && (
          <form onSubmit={handleCreate} className="space-y-4">
            <button
              type="button"
              onClick={backToChoose}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#008767] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali
            </button>
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-slate-900">Data bisnis Anda</h1>
              <p className="text-sm text-slate-500">
                Isi data dasar berikut. Logo, jam buka, dan foto bisa dilengkapi nanti di dashboard.
              </p>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                {formError}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="biz-name" className="text-xs">Nama bisnis *</Label>
                <Input id="biz-name" value={form.name} onChange={(e) => setField("name", e.target.value)} maxLength={255} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="biz-category" className="text-xs">Kategori *</Label>
                <Input
                  id="biz-category"
                  list="biz-category-list"
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                  placeholder="Pilih atau ketik kategori"
                />
                <datalist id="biz-category-list">
                  {CATEGORY_SUGGESTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="biz-address" className="text-xs">Alamat lengkap *</Label>
                <Textarea id="biz-address" rows={2} value={form.address} onChange={(e) => setField("address", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-city" className="text-xs">Kota / Kabupaten *</Label>
                <Input id="biz-city" value={form.city} onChange={(e) => setField("city", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-province" className="text-xs">Provinsi</Label>
                <Input id="biz-province" value={form.province} onChange={(e) => setField("province", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-phone" className="text-xs">Telepon / WhatsApp *</Label>
                <Input id="biz-phone" type="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-email" className="text-xs">Email bisnis</Label>
                <Input id="biz-email" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="biz-website" className="text-xs">Website</Label>
                <Input id="biz-website" value={form.website} onChange={(e) => setField("website", e.target.value)} placeholder="https://" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="biz-desc" className="text-xs">Deskripsi singkat</Label>
                <Textarea
                  id="biz-desc"
                  rows={2}
                  maxLength={300}
                  value={form.short_description}
                  onChange={(e) => setField("short_description", e.target.value)}
                  placeholder="Satu-dua kalimat tentang bisnis Anda"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-10 bg-[#008767] hover:bg-[#007055] text-white font-bold"
            >
              {submitting ? "Membuat bisnis..." : "Buat & tampilkan bisnis"}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
        )}

        {/* ===== Selesai ===== */}
        {step === "done" && doneInfo && (
          <div className="space-y-5 text-center py-2">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#008767]" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-slate-900">{doneInfo.name} sudah tayang!</h1>
              <p className="text-sm text-slate-500">Bisnis Anda sudah bisa ditemukan pelanggan di Katamereka.</p>
            </div>

            <div className="text-left rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 space-y-1.5 leading-relaxed">
              <p className="flex items-center gap-2 font-bold">
                <BadgeCheck className="w-4 h-4" /> Langkah berikutnya: verifikasi bisnis
              </p>
              <p>
                Kirim bukti kepemilikan (NIB, foto tempat usaha, dsb.) sebelum <strong>{formatDeadline(doneInfo.deadline)}</strong>.
                Selama belum disetujui tim Katamereka, bisnis ditampilkan sebagai &quot;Belum terverifikasi&quot;.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                type="button"
                onClick={() => {
                  // Hard navigation: token/businessRole perlu dibaca ulang dari server.
                  window.location.href = "/dashboard/business";
                }}
                className="bg-[#008767] hover:bg-[#007055] text-white font-bold"
              >
                Lengkapi verifikasi
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push(`/business/${doneInfo.slug}`)}>
                Lihat halaman bisnis
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StartBusinessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <Skeleton className="w-full max-w-2xl h-[420px] rounded-3xl" />
        </div>
      }
    >
      <StartBusinessContent />
    </Suspense>
  );
}
