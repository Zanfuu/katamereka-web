"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth, isKnownBusinessAccount } from "@/lib/auth-context";
import { isBusinessHost } from "@/lib/site-config";
import { getBusinessUrl } from "@/lib/domain";
import { fetchCategoryFacets, ApiCategoryFacet } from "@/lib/api-client";
import { slugify, categoryDisplayName, isRealBusinessCategory } from "@/lib/slug";
import {
  MessageSquare,
  Search,
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
  Bookmark,
  Bell,
  HelpCircle,
  MessageCircle,
  Store
} from "lucide-react";

interface NavbarProps {
  isBusinessPage?: boolean;
  floating?: boolean;
}

export default function Navbar({ isBusinessPage: forceBusinessView, floating }: NavbarProps = {}) {
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [businessUrl, setBusinessUrl] = useState("/bisnis");
  const [categoryFacets, setCategoryFacets] = useState<ApiCategoryFacet[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setBusinessUrl(getBusinessUrl());
    fetchCategoryFacets().then((facets) => {
      const real = facets.filter((f) => isRealBusinessCategory(f.category));
      setCategoryFacets(real);
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

  const isBusinessView =
    forceBusinessView ||
    pathname.startsWith("/bisnis") ||
    pathname.startsWith("/untuk-bisnis") ||
    (mounted && typeof window !== "undefined" && isBusinessHost(window.location.hostname));

  const isFloating = floating !== undefined ? floating : false;

  const isBusinessUser =
    mounted &&
    isLoggedIn &&
    user &&
    (user.role === "bisnis" ||
      (isBusinessView && isKnownBusinessAccount(user.email, user.username)));

  return (
    <header
      className={
        isFloating
          ? "fixed top-3 sm:top-4 left-0 right-0 z-50 transition-all duration-300 w-full px-3 sm:px-6 lg:px-8 pointer-events-none"
          : `sticky top-0 z-50 transition-all duration-300 border-b ${
              isScrolled
                ? "bg-white/80 backdrop-blur-md border-slate-200/80 shadow-sm"
                : "bg-white border-slate-100 shadow-2xs"
            }`
      }
      style={
        !isFloating
          ? {
              backdropFilter: isScrolled ? "blur(12px)" : "none",
              WebkitBackdropFilter: isScrolled ? "blur(12px)" : "none",
            }
          : undefined
      }
    >
      <div
        className={
          isFloating
            ? `max-w-7xl mx-auto rounded-full transition-all duration-300 px-4 sm:px-7 h-16 flex items-center justify-between gap-3 sm:gap-4 pointer-events-auto border ${
                isScrolled
                  ? "bg-white/75 backdrop-blur-xl shadow-xl shadow-slate-900/10 border-white/70"
                  : "bg-white/95 backdrop-blur-md shadow-sm border-slate-100/90"
              }`
            : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4"
        }
      >
        
        {/* Logo */}
        <Link href={isBusinessView ? "/bisnis" : "/"} className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-md shadow-[#008767]/20 group-hover:scale-105 transition-transform flex-shrink-0 bg-[#008767]">
            <img src="/logo.png" alt="Katamereka Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
            <span className="font-heading text-2xl font-bold text-slate-900 tracking-tight leading-none">
              Kata<span className="text-[#008767]">mereka</span>
            </span>
            {isBusinessView && (
              <span className="text-[11px] font-extrabold bg-[#008767] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider self-start sm:self-auto shadow-2xs">
                Untuk Bisnis
              </span>
            )}
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          {isBusinessView ? (
            /* Business Landing Header Nav Items */
            <>
              <Link
                href="/solusi"
                className={`transition-colors hover:text-[#008767] ${isActive("/solusi") ? "text-[#008767] font-bold" : ""}`}
              >
                Solusi
              </Link>

              <Link
                href="/produk"
                className={`transition-colors hover:text-[#008767] ${isActive("/produk") ? "text-[#008767] font-bold" : ""}`}
              >
                Produk
              </Link>

              <Link
                href="/harga"
                className={`transition-colors hover:text-[#008767] ${isActive("/harga") ? "text-[#008767] font-bold" : ""}`}
              >
                Harga
              </Link>

              <Link
                href="/bantuan"
                className="transition-colors hover:text-[#008767]"
              >
                Bantuan
              </Link>

              <Link
                href="/tentang-kami"
                className="transition-colors hover:text-[#008767]"
              >
                Tentang Kami
              </Link>
            </>
          ) : isBusinessUser ? (
            /* Logged in Business User Navigation */
            <>
              <Link
                href="/bisnis"
                className={`transition-colors hover:text-[#008767] ${
                  isActive("/bisnis") || isActive("/untuk-bisnis") ? "text-[#008767] font-bold" : ""
                }`}
              >
                Utama
              </Link>

              <Link
                href="/dashboard/business"
                className={`transition-colors hover:text-[#008767] ${
                  isActive("/dashboard/business") ? "text-[#008767] font-bold" : ""
                }`}
              >
                Bisnis Saya
              </Link>

              <Link
                href="/ulasan"
                className={`transition-colors hover:text-[#008767] ${
                  isActive("/ulasan") ? "text-[#008767] font-bold" : ""
                }`}
              >
                Ulasan
              </Link>

              <Link
                href="/bantuan"
                className={`transition-colors hover:text-[#008767] ${
                  isActive("/bantuan") ? "text-[#008767] font-bold" : ""
                }`}
              >
                Bantuan
              </Link>
            </>
          ) : (
            /* Standard Customer Navbar Items */
            <>
              <Link
                href="/"
                className={`relative py-1 text-sm transition-colors hover:text-[#008767] ${
                  isActive("/") && pathname === "/" ? "text-slate-900 font-bold" : "text-slate-600 font-medium"
                }`}
              >
                <span>Beranda</span>
                {isActive("/") && pathname === "/" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#008767] rounded-full" />
                )}
              </Link>

              <div className="relative group">
                <Link
                  href="/businesses"
                  className={`flex items-center gap-1 py-1 text-sm transition-colors hover:text-[#008767] ${
                    isActive("/businesses") ? "text-[#008767] font-bold" : "text-slate-600 font-medium"
                  }`}
                >
                  <span>Jelajahi</span>
                </Link>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-0 top-full pt-2 transition-all duration-150 z-50">
                  <div className="w-52 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2">
                    <Link
                      href="/businesses"
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#008767] transition-colors"
                    >
                      Semua Bisnis
                    </Link>
                    <Link
                      href="/search"
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#008767] transition-colors"
                    >
                      Pencarian Lanjutan
                    </Link>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <Link
                  href="/businesses"
                  className="flex items-center gap-1 py-1 text-sm transition-colors hover:text-[#008767] text-slate-600 font-medium"
                >
                  <span>Kategori</span>
                </Link>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-0 top-full pt-2 transition-all duration-150 z-50">
                  <div className="w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 max-h-80 overflow-y-auto">
                    {categoryFacets.map((c) => (
                      <Link
                        key={c.category}
                        href={`/kategori/${slugify(c.category)}`}
                        className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#008767] transition-colors"
                      >
                        {categoryDisplayName(c.category)}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href="/tentang-kami"
                className={`py-1 text-sm transition-colors hover:text-[#008767] ${
                  isActive("/tentang-kami") ? "text-[#008767] font-bold" : "text-slate-600 font-medium"
                }`}
              >
                Tentang Kami
              </Link>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Icon Link from mockup */}
          <Link
            href="/search"
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-[#008767] transition-colors cursor-pointer"
            aria-label="Pencarian"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          
          {/* Business Notification Bell (For Business Accounts) */}
          {isBusinessUser && (
            <button
              className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
          )}

          {/* Conditional Admin Button for Business Account */}
          {isBusinessUser && (
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-all shadow-2xs hover:scale-105"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-700" />
              <span>Dashboard</span>
            </Link>
          )}

          {/* Conditional Profile or Login/Register */}
          {mounted && isLoggedIn && user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Profile Avatar Button */}
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center p-0.5 rounded-full border border-emerald-400/80 hover:ring-2 hover:ring-[#008767]/30 transition-all cursor-pointer shadow-2xs"
                aria-label="Menu Profil"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#008767] text-white flex items-center justify-center font-bold text-sm shadow-inner">
                  {user.initials || "I"}
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 text-sm truncate">{user.name}</p>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          user.role === "bisnis" || isBusinessUser
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {user.role === "bisnis" || isBusinessUser ? "Akun Bisnis" : "Customer"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">@{user.username}</p>
                  </div>

                  <div className="py-1 text-xs font-semibold text-slate-700">
                    {/* Special Dashboard Link for Business Account */}
                    {(user.role === "bisnis" || isBusinessUser) && (
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 bg-amber-50/70 hover:bg-amber-100 text-amber-900 transition-colors font-bold"
                      >
                        <div className="flex items-center gap-2.5">
                          <LayoutDashboard className="w-4 h-4 text-amber-700" />
                          <span>Masuk Dashboard Admin</span>
                        </div>
                      </Link>
                    )}

                    {(user.role === "bisnis" || isBusinessUser) && (
                      <Link
                        href="/dashboard/business"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 hover:text-[#008767] transition-colors"
                      >
                        <Store className="w-4 h-4 text-slate-400" />
                        <span>Profil Bisnis Saya</span>
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 hover:text-[#008767] transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Profil Sesi Log</span>
                    </Link>

                    {user.role === "bisnis" && (
                      <Link
                        href="/ulasan"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 hover:text-[#008767] transition-colors"
                      >
                        <Star className="w-4 h-4 text-slate-400" />
                        <span>Kelola Ulasan</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100 space-y-0.5">
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : isBusinessView ? (
            /* Business Landing Header Buttons: Masuk | Daftar Akun Bisnis */
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/login?role=bisnis"
                className="px-4 py-2 rounded-xl text-slate-700 hover:text-[#008767] font-bold text-sm transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/signup?role=bisnis"
                className="px-5 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-sm shadow-md shadow-[#008767]/20 transition-all hover:scale-105"
              >
                Daftar Akun Bisnis
              </Link>
            </div>
          ) : (
            /* Main Customer Site Header: 2 Buttons before login */
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-slate-700 hover:text-[#008767] font-bold text-sm transition-colors hover:bg-slate-50"
              >
                Login
              </Link>
              <Link
                href={businessUrl || "/bisnis"}
                className="px-5 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-sm shadow-md shadow-[#008767]/20 transition-all hover:scale-105"
              >
                Akun Bisnis
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors flex-shrink-0"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Sheet Menu (Persistent Pre-Rendered for 60fps GPU Animation) */}
      {mounted && createPortal(
        <>
          {/* Backdrop Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
            className={`md:hidden fixed inset-0 bg-slate-900/60 z-[9999] transition-opacity duration-300 ease-out ${
              mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            style={{ touchAction: "none" }}
          />

          {/* Bottom Sheet Container */}
          <div
            className={`md:hidden fixed inset-x-0 bottom-0 z-[10000] bg-white rounded-t-3xl shadow-2xl p-5 border-t border-slate-100 max-h-[75vh] flex flex-col justify-between overflow-y-auto overscroll-contain transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu ${
              mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
            }`}
            style={{
              transform: mobileMenuOpen ? "translate3d(0, 0, 0)" : "translate3d(0, 100%, 0)",
              willChange: "transform",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div>
              {/* Drag Handle & Header */}
              <div className="flex flex-col items-center mb-3">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-3" />
                <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-[#008767]">
                      <img src="/logo.png" alt="Katamereka Logo" className="w-full h-full object-cover" />
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
                {isBusinessView && !isBusinessUser ? (
                  <>
                    <Link
                      href="/solusi"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2.5 px-4 rounded-xl text-base font-semibold transition-colors ${
                        isActive("/solusi") ? "bg-emerald-50 text-[#008767] font-bold" : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      Solusi
                    </Link>
                    <Link
                      href="/produk"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2.5 px-4 rounded-xl text-base font-semibold transition-colors ${
                        isActive("/produk") ? "bg-emerald-50 text-[#008767] font-bold" : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      Produk
                    </Link>
                    <Link
                      href="/harga"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2.5 px-4 rounded-xl text-base font-semibold transition-colors ${
                        isActive("/harga") ? "bg-emerald-50 text-[#008767] font-bold" : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      Harga
                    </Link>
                    <Link
                      href="/bantuan"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2.5 px-4 rounded-xl text-base font-semibold transition-colors ${
                        isActive("/bantuan") ? "bg-emerald-50 text-[#008767] font-bold" : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      Bantuan
                    </Link>
                    <Link
                      href="/tentang-kami"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2.5 px-4 rounded-xl text-base font-semibold transition-colors ${
                        isActive("/tentang-kami") ? "bg-emerald-50 text-[#008767] font-bold" : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      Tentang Kami
                    </Link>
                  </>
                ) : isBusinessUser ? (
                  <>
                    <Link
                      href="/bisnis"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2.5 px-4 rounded-xl text-base font-semibold transition-colors ${
                        isActive("/bisnis") || isActive("/untuk-bisnis")
                          ? "bg-emerald-50 text-[#008767] font-bold"
                          : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      Utama
                    </Link>
                    <Link
                      href="/dashboard/business"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2.5 px-4 rounded-xl text-base font-semibold transition-colors ${
                        isActive("/dashboard/business")
                          ? "bg-emerald-50 text-[#008767] font-bold"
                          : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      Bisnis Saya
                    </Link>
                    <Link
                      href="/ulasan"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2.5 px-4 rounded-xl text-base font-semibold transition-colors ${
                        isActive("/ulasan")
                          ? "bg-emerald-50 text-[#008767] font-bold"
                          : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      Ulasan
                    </Link>
                    <Link
                      href="/bantuan"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2.5 px-4 rounded-xl text-base font-semibold transition-colors ${
                        isActive("/bantuan")
                          ? "bg-emerald-50 text-[#008767] font-bold"
                          : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      Bantuan
                    </Link>
                  </>
                ) : (
                  <>
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
                      href="/blogs"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2.5 px-4 rounded-xl text-base font-semibold transition-colors ${
                        isActive("/blogs")
                          ? "bg-emerald-50 text-[#008767] font-bold"
                          : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      Blog
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
                  </>
                )}
              </div>
            </div>

            {/* Auth Actions / Profile Section */}
            {isLoggedIn && user ? (
              <div className="pt-3 border-t border-slate-100 space-y-2 mt-3">
                {(user.role === "bisnis" || isBusinessUser) && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-4 text-sm font-bold text-amber-900 bg-amber-50 rounded-xl border border-amber-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4 text-amber-700" />
                      <span>Masuk Dashboard Admin</span>
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
            ) : isBusinessView ? (
              <div className="pt-4 border-t border-slate-100 space-y-2.5 mt-3">
                <Link
                  href="/login?role=bisnis"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block text-center py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup?role=bisnis"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block text-center py-2.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-sm shadow-md shadow-[#008767]/20 transition-all"
                >
                  Create free account
                </Link>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-100 space-y-2.5 mt-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href={businessUrl || "/bisnis"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block text-center py-2.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-sm shadow-md shadow-[#008767]/20 transition-all"
                >
                  Akun Bisnis
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
