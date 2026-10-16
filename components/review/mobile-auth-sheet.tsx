"use client";

import { useEffect } from "react";
import { AlertCircle, LogIn, Lock, UserPlus, X } from "lucide-react";
import GoogleLoginButton from "@/components/google-login-button";

export type MobileAuthMode = "login" | "register";

interface MobileAuthSheetProps {
  mode: MobileAuthMode;
  onModeChange: (mode: MobileAuthMode) => void;
  error: string;
  onError: (message: string) => void;
  onClose: () => void;
}

const tabClass = (active: boolean) =>
  `flex-1 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none ${
    active
      ? "bg-[#008767] text-white shadow-md font-extrabold ring-1 ring-[#007458]"
      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
  }`;

export default function MobileAuthSheet({
  mode,
  onModeChange,
  error,
  onError,
  onClose,
}: MobileAuthSheetProps) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const isLogin = mode === "login";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Masuk untuk memberi ulasan"
        className="relative w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 fade-in duration-200"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-3 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-[#008767] flex items-center justify-center mx-auto shadow-2xs">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {isLogin ? "Masuk untuk Memberi Ulasan" : "Daftar untuk Memberi Ulasan"}
          </h2>
        </div>

        <div className="flex rounded-2xl bg-slate-100 p-1.5 font-semibold text-xs border border-slate-200/60">
          <button
            type="button"
            onClick={() => onModeChange("login")}
            className={tabClass(isLogin)}
          >
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange("register")}
            className={tabClass(!isLogin)}
          >
            <UserPlus className="w-4 h-4" />
            <span>Daftar</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <GoogleLoginButton
            roleHint="customer"
            text={isLogin ? "signin_with" : "signup_with"}
            shape="rounded-2xl"
            onError={onError}
          />

          <div className="pt-1 text-center text-xs text-slate-500">
            <span>{isLogin ? "Belum punya akun? " : "Sudah punya akun? "}</span>
            <button
              type="button"
              onClick={() => onModeChange(isLogin ? "register" : "login")}
              className="font-bold text-[#008767] hover:underline cursor-pointer"
            >
              {isLogin ? "Daftar Akun Baru" : "Masuk di sini"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
