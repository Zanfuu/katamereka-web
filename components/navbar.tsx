"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/lib/auth-context";
import {
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  User as UserIcon,
  Star,
  Settings,
  LogOut,
  Building2,
  LayoutDashboard,
  ExternalLink,
  Bookmark
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all"
      style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#008767] flex items-center justify-center text-white shadow-md shadow-[#008767]/20 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5 fill-white/20" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            Kata<span className="text-[#008767]">mereka</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link
            href="/"
            className={`transition-colors hover:text-[#008767] ${
              isActive("/") && pathname === "/"
                ? "text-[#008767] font-bold"
                : ""
            }`}
          >
            Utama
          </Link>

          <Link
            href="/businesses"
            className={`relative group flex items-center gap-1 transition-colors hover:text-[#008767] ${
              isActive("/businesses") || isActive("/business")
                ? "text-[#008767] font-bold"
                : ""
            }`}
          >
            <span>Jelajahi</span>
            <ChevronDown className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform" />
          </Link>

          <Link
            href="/businesses"
            className="relative group flex items-center gap-1 transition-colors hover:text-[#008767]"
          >
            <span>Kategori</span>
            <ChevronDown className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform" />
          </Link>

          <Link
            href="/businesses"
            className="transition-colors hover:text-[#008767]"
          >
            Untuk Bisnis
          </Link>

          <Link
            href="/tentang-kami"
            className={`transition-colors hover:text-[#008767] ${
              isActive("/tentang-kami") ? "text-[#008767] font-bold" : ""
            }`}
          >
            Tentang Kami
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">


          {/* Conditional Admin Button for Business Account */}
          {mounted && isLoggedIn && user && user.role === "bisnis" && (
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-all shadow-2xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-700" />
              <span>Dashboard</span>
            </Link>
          )}

          {/* Conditional Profile or Login/Register */}
          {mounted && isLoggedIn && user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Profile Avatar Button (Initials) */}
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors border border-slate-200/80"
              >
                <div className="w-10 h-10 rounded-full bg-[#008767] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {user.initials}
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        user.role === "bisnis"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}>
                        {user.role === "bisnis" ? "Akun Bisnis" : "Customer"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">@{user.username}</p>
                  </div>

                  <div className="py-1 text-xs font-semibold text-slate-700">
                    {/* Special Dashboard Link for Business Account */}
                    {user.role === "bisnis" && (
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 bg-amber-50/60 hover:bg-amber-100 text-amber-900 transition-colors font-bold"
                      >
                        <div className="flex items-center gap-2.5">
                          <LayoutDashboard className="w-4 h-4 text-amber-700" />
                          <span>Masuk Dashboard</span>
                        </div>
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 hover:text-[#008767] transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Profil Saya</span>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 hover:text-[#008767] transition-colors"
                    >
                      <Star className="w-4 h-4 text-slate-400" />
                      <span>Review Saya</span>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 hover:text-[#008767] transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Pengaturan</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <Link
                href="/login"
                className={`px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive("/login")
                    ? "text-[#008767] font-bold"
                    : "text-slate-700 hover:text-[#008767]"
                }`}
              >
                Masuk
              </Link>

              <Link
                href="/signup"
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#008767] hover:bg-[#007458] rounded-full shadow-sm hover:shadow-md hover:shadow-[#008767]/20 transition-all active:scale-95 whitespace-nowrap"
              >
                Daftar
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors flex-shrink-0"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Sheet Menu (Rendered via Portal to escape header context) */}
      {mounted && mobileMenuOpen && createPortal(
        <>
          {/* Backdrop Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] animate-fadeIn"
          />

          {/* Bottom Sheet Container (Slides up from screen bottom, max height 60vh) */}
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[10000] bg-white rounded-t-3xl shadow-2xl p-5 border-t border-slate-100 max-h-[60vh] flex flex-col justify-between animate-in slide-in-from-bottom duration-300 ease-out overflow-y-auto">
            <div>
              {/* Drag Handle & Header */}
              <div className="flex flex-col items-center mb-3">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-3" />
                <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#008767] flex items-center justify-center text-white">
                      <MessageSquare className="w-4 h-4 fill-white/20" />
                    </div>
                    <span className="text-lg font-bold text-slate-900">
                      Kata<span className="text-[#008767]">mereka</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Links List */}
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2.5 px-4 rounded-xl text-base font-semibold transition-colors ${
                    isActive("/") && pathname === "/"
                      ? "bg-emerald-50 text-[#008767] font-bold"
                      : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Utama
                </Link>
                <Link
                  href="/businesses"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2.5 px-4 rounded-xl text-base font-semibold transition-colors ${
                    isActive("/businesses")
                      ? "bg-emerald-50 text-[#008767] font-bold"
                      : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Jelajahi
                </Link>
                <Link
                  href="/businesses"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-4 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Kategori
                </Link>
                <Link
                  href="/businesses"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-4 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Untuk Bisnis
                </Link>
                <Link
                  href="/tentang-kami"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2.5 px-4 rounded-xl text-base font-semibold transition-colors ${
                    isActive("/tentang-kami")
                      ? "bg-emerald-50 text-[#008767] font-bold"
                      : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Tentang Kami
                </Link>
              </div>
            </div>

            {/* Auth Actions / Profile Section */}
            {isLoggedIn && user ? (
              <div className="pt-3 border-t border-slate-100 space-y-2 mt-3">
                {user.role === "bisnis" && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-4 text-sm font-bold text-amber-900 bg-amber-50 rounded-xl border border-amber-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4 text-amber-700" />
                      <span>Masuk Dashboard</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-600" />
                  </Link>
                )}
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Profil Saya ({user.name})</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 py-2.5 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5 mt-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-[#008767] hover:bg-[#007458] text-white font-bold text-sm shadow-md shadow-[#008767]/20 transition-all"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </header>
  );
}
