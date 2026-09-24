"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, UserRole } from "@/lib/auth-context";
import {
  MessageSquare,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Building2,
  ShieldCheck,
  LayoutDashboard
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const { signup } = useAuth();

  const [role, setRole] = useState<UserRole>("customer");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Semua bidang (Username, Email, dan Kata Sandi) wajib diisi.");
      return;
    }

    if (!email.includes("@")) {
      setError("Masukkan alamat email yang valid.");
      return;
    }

    if (password.length < 6) {
      setError("Kata sandi minimal harus 6 karakter.");
      return;
    }

    if (!agreed) {
      setError("Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi.");
      return;
    }

    setIsLoading(true);

    const res = await signup(username, email, password, role);
    if (res.success) {
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 1200);
    } else {
      setIsLoading(false);
      setError(res.message || "Gagal memproses pendaftaran. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f6f2] via-slate-50 to-[#f4faf7] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Decor Circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#008767]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#008767]/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 space-y-6">

        {/* TOP BRAND LOGO */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-full overflow-hidden shadow-lg shadow-[#008767]/25 group-hover:scale-105 transition-transform flex-shrink-0 bg-[#008767]">
              <img src="/logo.png" alt="Katamereka Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Kata<span className="text-[#008767]">mereka</span>
            </span>
          </Link>
        </div>

        {/* TWO SEPARATE CARDS ATTACHED SIDE-BY-SIDE */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 shadow-2xl rounded-3xl overflow-hidden">

          {/* LEFT CARD: FORM INPUTS (MD:COL-SPAN-6) */}
          <div className="md:col-span-6 bg-white/95 backdrop-blur-md p-6 sm:p-8 lg:p-10 border border-slate-200/80 rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl md:border-r-0 space-y-5">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Buat Akun Baru ✨</h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Isi data kredensial Anda di bawah ini.
              </p>
            </div>

            {/* Success Banner */}
            {success && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-[#008767] flex-shrink-0" />
                <span>Pendaftaran akun {role === "bisnis" ? "Bisnis" : "Customer"} berhasil! Mengalihkan ke Login...</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm font-medium">
                {error}
              </div>
            )}

            {/* Field 1: Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Username {role === "bisnis" ? "Bisnis / Toko" : ""}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder={role === "bisnis" ? "Contoh: kopi_sejahtera" : "Buat username unik kamu"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 focus:border-[#008767] focus:bg-white focus:ring-2 focus:ring-[#008767]/20 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Field 2: Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="contoh@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 focus:border-[#008767] focus:bg-white focus:ring-2 focus:ring-[#008767]/20 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Field 3: Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 focus:border-[#008767] focus:bg-white focus:ring-2 focus:ring-[#008767]/20 rounded-xl pl-10 pr-11 py-3 text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#008767] hover:bg-[#007458] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#008767]/20 active:scale-95 disabled:opacity-70 mt-2"
            >
              {isLoading ? (
                <span>Mendaftarkan...</span>
              ) : (
                <>
                  <span>Daftar Sebagai {role === "bisnis" ? "Pemilik Bisnis" : "Customer"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Card Footer Link */}
            <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
              <span>Sudah punya akun? </span>
              <Link href="/login" className="font-bold text-[#008767] hover:underline">
                Masuk di sini
              </Link>
            </div>
          </div>

          {/* RIGHT CARD: ROLE SELECTION CARDS (MD:COL-SPAN-6) ATTACHED */}
          <div className="md:col-span-6 bg-slate-50/90 backdrop-blur-md p-6 sm:p-8 lg:p-10 border border-slate-200/80 rounded-b-3xl md:rounded-bl-none md:rounded-r-3xl flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Pilih Tipe Akun <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-slate-500">
                  Pilih hak akses akun yang paling sesuai dengan kebutuhan Anda.
                </p>
              </div>

              <div className="space-y-3">
                {/* Option 1: Customer */}
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${role === "customer"
                      ? "border-[#008767] bg-white ring-2 ring-[#008767]/20 shadow-xs"
                      : "border-slate-200 bg-white/60 hover:bg-white"
                    }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${role === "customer"
                        ? "bg-[#008767] text-white"
                        : "bg-slate-200 text-slate-600"
                      }`}
                  >
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">Customer</h4>
                      {role === "customer" && (
                        <CheckCircle2 className="w-4 h-4 text-[#008767]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Menulis ulasan bisnis, memberi rating bintang, dan menyimpan bisnis favorit.
                    </p>
                  </div>
                </button>

                {/* Option 2: Bisnis (Owner) */}
                <button
                  type="button"
                  onClick={() => setRole("bisnis")}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${role === "bisnis"
                      ? "border-[#008767] bg-white ring-2 ring-[#008767]/20 shadow-xs"
                      : "border-slate-200 bg-white/60 hover:bg-white"
                    }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${role === "bisnis"
                        ? "bg-[#008767] text-white"
                        : "bg-slate-200 text-slate-600"
                      }`}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">Akun Bisnis</h4>
                      {role === "bisnis" && (
                        <CheckCircle2 className="w-4 h-4 text-[#008767]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Kelola profil bisnis, membalas ulasan, & akses tombol **Dashboard Admin**.
                    </p>
                  </div>
                </button>
              </div>

              {/* Role Info Note */}
              {role === "bisnis" && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <LayoutDashboard className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Setelah mendaftar, tombol <strong>Dashboard Admin Bisnis</strong> akan muncul otomatis di navigasi.
                  </span>
                </div>
              )}
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="flex items-start gap-2 pt-3 border-t border-slate-200/80">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="accent-[#008767] w-4 h-4 rounded cursor-pointer mt-0.5 shrink-0"
              />
              <label htmlFor="agree" className="text-xs text-slate-600 cursor-pointer leading-relaxed">
                Saya menyetujui{" "}
                <a href="#" className="font-bold text-[#008767] hover:underline">
                  Syarat & Ketentuan
                </a>{" "}
                serta{" "}
                <a href="#" className="font-bold text-[#008767] hover:underline">
                  Kebijakan Privasi
                </a>{" "}
                Katamereka.
              </label>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl p-8 border border-slate-200 space-y-6">
            <Skeleton className="w-12 h-12 rounded-2xl mx-auto" />
            <Skeleton className="w-48 h-8 rounded-xl mx-auto" />
            <Skeleton className="w-full h-12 rounded-xl" />
          </div>
        </div>
      }
    >
      <SignupFormContent />
    </Suspense>
  );
}
