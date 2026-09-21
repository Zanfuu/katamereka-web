"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

function LoginFormContent() {
  const router = Router();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username dan kata sandi wajib diisi.");
      return;
    }

    setIsLoading(true);

    // Simulate login request
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push(redirectPath);
      }, 1000);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f6f2] via-slate-50 to-[#f4faf7] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Decor Circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#008767]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#008767]/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Top Brand Link */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-[#008767] flex items-center justify-center text-white shadow-lg shadow-[#008767]/25 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6 fill-white/20" />
            </div>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Kata<span className="text-[#008767]">mereka</span>
            </span>
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Masuk ke Akun</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Masukkan username dan kata sandi Anda untuk melanjutkan.
            </p>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-[#008767] flex-shrink-0" />
              <span>Login berhasil! Mengalihkan halaman...</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Masukkan username kamu"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 focus:border-[#008767] focus:bg-white focus:ring-2 focus:ring-[#008767]/20 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Kata Sandi
                </label>
                <a href="#" className="text-xs font-semibold text-[#008767] hover:underline">
                  Lupa kata sandi?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
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

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                className="accent-[#008767] w-4 h-4 rounded cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer font-medium">
                Ingat saya di perangkat ini
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#008767] hover:bg-[#007458] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#008767]/20 active:scale-95 disabled:opacity-70 mt-2"
            >
              {isLoading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Card Footer Link */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Belum punya akun? </span>
            <Link href="/signup" className="font-bold text-[#008767] hover:underline">
              Daftar sekarang
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-[#008767] transition-colors">
            ← Kembali ke Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}

// Router helper wrapper
import { useRouter as useNextRouter } from "next/navigation";
function Router() {
  return useNextRouter();
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4faf7] flex items-center justify-center">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
