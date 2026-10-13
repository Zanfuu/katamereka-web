"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { GOOGLE_CLIENT_ID } from "@/lib/api-client";
import { useAuth, UserRole } from "@/lib/auth-context";

interface GoogleLoginButtonProps {
  roleHint?: UserRole;
  text?: "signin_with" | "signup_with" | "continue_with";
  onSuccess?: (user: any) => void;
  onError?: (errorMessage: string) => void;
  className?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
          prompt: (notification?: any) => void;
        };
      };
    };
  }
}

export default function GoogleLoginButton({
  roleHint = "customer",
  text = "continue_with",
  onSuccess,
  onError,
  className = "",
  disabled = false,
}: GoogleLoginButtonProps) {
  const { loginWithGoogle } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize and render Google Identity Services button
  const initializeGoogleBtn = () => {
    if (!window.google?.accounts?.id || !containerRef.current) return;

    try {
      // 1. Matikan auto-select agar Google SELALU menanyakan pilihan akun
      // dan tidak otomatis login dengan akun yang dipilih sebelumnya.
      window.google.accounts.id.disableAutoSelect();

      // 2. Inisialisasi Google Identity Services dengan auto_select: false
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        auto_select: false,
        cancel_on_tap_outside: true,
        callback: async (response: { credential?: string }) => {
          if (!response?.credential) {
            onError?.("Gagal menerima kredensial akun dari Google");
            return;
          }

          setIsProcessing(true);

          try {
            const res = await loginWithGoogle(response.credential, roleHint);
            setIsProcessing(false);

            if (res.success) {
              // Pastikan disableAutoSelect dipanggil kembali agar login berikutnya selalu menanyakan akun lagi
              if (window.google?.accounts?.id?.disableAutoSelect) {
                window.google.accounts.id.disableAutoSelect();
              }
              onSuccess?.(res.user);
            } else {
              onError?.(res.message || "Gagal masuk menggunakan akun Google");
            }
          } catch (err: any) {
            setIsProcessing(false);
            onError?.(err?.message || "Terjadi kesalahan saat memproses login Google");
          }
        },
      });

      // 3. Render tombol Google resmi
      containerRef.current.innerHTML = "";

      // Hitung lebar container (clamped between 240px and 400px per Google API specs)
      const containerWidth = containerRef.current.parentElement?.clientWidth || 360;
      const calculatedWidth = Math.min(Math.max(containerWidth, 240), 400);

      window.google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: text,
        shape: "rectangular",
        logo_alignment: "left",
        width: calculatedWidth,
        locale: "id", // Menampilkan teks dalam Bahasa Indonesia
      });
    } catch (e) {
      console.error("Gagal menginisialisasi Google Sign-In:", e);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      setIsScriptLoaded(true);
      initializeGoogleBtn();
    }
  }, [text, roleHint]);

  // Listener resize untuk menyesuaikan ukuran tombol jika layar berubah
  useEffect(() => {
    if (!isScriptLoaded) return;
    const handleResize = () => {
      initializeGoogleBtn();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isScriptLoaded]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          setIsScriptLoaded(true);
          initializeGoogleBtn();
        }}
      />

      <div className={`w-full flex flex-col items-center justify-center relative ${className}`}>
        {/* Loading overlay saat memproses verifikasi token Google ke backend */}
        {isProcessing && (
          <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-[1px] rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-slate-700 shadow-sm border border-slate-200">
            <div className="w-4 h-4 border-2 border-[#008767] border-t-transparent rounded-full animate-spin" />
            <span>Memverifikasi akun Google...</span>
          </div>
        )}

        {/* Container tempat Google me-render tombol resminya */}
        <div
          ref={containerRef}
          className={`w-full flex justify-center [&_iframe]:!w-full [&_iframe]:!max-w-[400px] [&_iframe]:!rounded-xl ${
            disabled || isProcessing ? "pointer-events-none opacity-60" : ""
          }`}
          onMouseEnter={() => {
            // Selalu panggil disableAutoSelect saat mouse mendekat untuk menjamin Google menanyakan akun
            if (window.google?.accounts?.id?.disableAutoSelect) {
              window.google.accounts.id.disableAutoSelect();
            }
          }}
        />

        {/* Fallback placeholder saat Google script masih loading */}
        {!isScriptLoaded && (
          <div className="w-full max-w-[400px] h-[44px] rounded-xl border border-slate-200/90 bg-white flex items-center justify-center gap-2.5 px-4 text-xs font-semibold text-slate-600 shadow-xs animate-pulse">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Memuat Google Sign-In...</span>
          </div>
        )}
      </div>
    </>
  );
}
