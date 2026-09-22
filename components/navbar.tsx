"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  MessageSquare,
  Search,
  ChevronDown,
  Menu,
  X,
  User as UserIcon,
  Star,
  Settings,
  LogOut,
  Building2,
  LayoutDashboard,
  ExternalLink
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/businesses?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/70 shadow-2xs transition-all">
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
          {/* Search Button / Input */}
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="relative animate-fadeIn">
              <input
                type="text"
                placeholder="Cari bisnis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-44 sm:w-60 bg-slate-100 border border-slate-300 rounded-full px-4 py-2 text-xs outline-none focus:border-[#008767] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-slate-600 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Conditional Admin Button for Business Account */}
          {isLoggedIn && user && user.role === "bisnis" && (
            <a
              href="http://localhost:3000/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-all shadow-2xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-700" />
              <span>Dashboard Admin</span>
              <ExternalLink className="w-3 h-3 text-amber-600" />
            </a>
          )}

          {/* Conditional Profile or Login/Register */}
          {isLoggedIn && user ? (
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
                      <a
                        href="http://localhost:3000/admin"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 bg-amber-50/60 hover:bg-amber-100 text-amber-900 transition-colors font-bold"
                      >
                        <div className="flex items-center gap-2.5">
                          <LayoutDashboard className="w-4 h-4 text-amber-700" />
                          <span>Masuk Dashboard Admin</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                      </a>
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
            <>
              <Link
                href="/login"
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  isActive("/login")
                    ? "text-[#008767] font-bold"
                    : "text-slate-700 hover:text-[#008767]"
                }`}
              >
                Masuk
              </Link>

              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#008767] hover:bg-[#007458] rounded-full shadow-sm hover:shadow-md hover:shadow-[#008767]/20 transition-all active:scale-95"
              >
                Daftar
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 p-4 space-y-3 animate-fadeIn">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-[#008767]"
          >
            Utama
          </Link>
          <Link
            href="/businesses"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-[#008767]"
          >
            Jelajahi
          </Link>
          <Link
            href="/businesses"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-[#008767]"
          >
            Kategori
          </Link>
          <Link
            href="/businesses"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-[#008767]"
          >
            Untuk Bisnis
          </Link>
          <Link
            href="/tentang-kami"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-[#008767]"
          >
            Tentang Kami
          </Link>

          {isLoggedIn && user && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              {user.role === "bisnis" && (
                <a
                  href="http://localhost:3000/admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-sm font-bold text-amber-900 bg-amber-50 px-3 rounded-xl border border-amber-300"
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-700" />
                  <span>Dashboard Admin Bisnis</span>
                </a>
              )}
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm font-semibold text-[#008767]"
              >
                <UserIcon className="w-4 h-4" />
                <span>Profil Saya ({user.name})</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm font-semibold text-red-600"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
