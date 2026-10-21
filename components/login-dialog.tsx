"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogIn, X } from "lucide-react";
import GoogleLoginButton from "@/components/google-login-button";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  onSuccess?: (user: any) => void;
}

export function LoginDialog({
  open,
  onOpenChange,
  title = "Masuk ke KataMereka",
  description = "Silakan masuk dengan akun Google untuk menandai ulasan bermanfaat dan berinteraksi di KataMereka.",
  icon,
  onSuccess,
}: LoginDialogProps) {
  const [error, setError] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Tutup"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Heading */}
        <div className="text-center space-y-1.5 pt-1">
          {icon && (
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-[#008767] flex items-center justify-center mx-auto shadow-2xs mb-3">
              {icon}
            </div>
          )}
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed px-2">
            {description}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Google Login Button */}
        <div className="space-y-3 pt-1">
          <GoogleLoginButton
            roleHint="customer"
            text="continue_with"
            shape="rounded-2xl"
            onSuccess={(user) => {
              onOpenChange(false);
              if (onSuccess) {
                onSuccess(user);
              } else {
                window.location.reload();
              }
            }}
            onError={(errMsg) => setError(errMsg)}
          />

          <div className="relative flex items-center justify-center pt-2 pb-1">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-slate-400 absolute">
              atau
            </span>
          </div>

          <Link
            href="/login"
            onClick={() => onOpenChange(false)}
            className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
          >
            <LogIn className="w-4 h-4 text-slate-500" />
            <span>Masuk dengan Email / Password</span>
          </Link>
        </div>

        <p className="text-center text-[11px] text-slate-400">
          Dengan melanjutkan, Anda menyetujui Ketentuan Layanan & Kebijakan Privasi KataMereka.
        </p>
      </div>
    </div>
  );
}
