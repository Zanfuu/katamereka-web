"use client";

import Link from "next/link";
import Navbar from "@/components/navbar";
import {
  Shield,
  TrendingUp,
  MessageSquare,
  Megaphone,
  Users,
  Star,
  BarChart3,
  Award,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Store,
  AppWindow,
  Smartphone,
  ArrowUp,
  Sparkles,
} from "lucide-react";

export default function BisnisLandingPage() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* Header / Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* ================= HERO SECTION ================= */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#e8f6f2] via-[#f4faf7] to-white pt-10 pb-16 sm:pt-16 sm:pb-24">
          {/* Background Decorative Blur Orbs */}
          <div className="absolute top-10 left-10 w-96 h-96 bg-[#008767]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#008767]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Hero Text & Actions */}
              <div className="lg:col-span-6 space-y-6 text-left">


                {/* Main Heading */}
                <h1 className="text-3xl sm:text-5xl lg:text-[2.75rem] font-extrabold text-slate-900 leading-tight sm:leading-[1.2] tracking-tight">
                  Bangun Reputasi Bisnis Anda Bersama{" "}
                  <span className="text-[#008767]">Katamereka</span>
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                  Dapatkan kepercayaan pelanggan melalui pengalaman nyata mereka. Kelola profil bisnis Anda, respons ulasan, dan tingkatkan visibilitas bisnis dengan mudah.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                  <Link
                    href="/signup?role=bisnis"
                    className="px-6 py-3.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#008767]/25 hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Daftar sebagai Bisnis</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/login?redirect=/bisnis"
                    className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm sm:text-base border border-slate-200/90 flex items-center justify-center shadow-xs transition-all hover:border-slate-300"
                  >
                    Sudah punya akun? Login
                  </Link>
                </div>
              </div>

              {/* Right Column: Hero Visual Image (ilus.webp) */}
              <div className="lg:col-span-6 flex justify-center items-center">
                <img
                  src="/ilus.webp"
                  alt="Katamereka Bisnis"
                  className="w-full max-w-2xl lg:max-w-3xl h-auto object-contain scale-105 lg:scale-110 transform transition-transform duration-300"
                />
              </div>

            </div>
          </div>
        </section>

        {/* ================= FEATURE HIGHLIGHT BAR ================= */}
        <section className="py-8 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Tingkatkan Kepercayaan",
                  desc: "Tampilkan ulasan nyata dari pelanggan.",
                },
                {
                  icon: TrendingUp,
                  title: "Pantau Performa",
                  desc: "Lihat perkembangan bisnis Anda secara real-time.",
                },
                {
                  icon: MessageSquare,
                  title: "Kelola Ulasan",
                  desc: "Respons pelanggan dan tunjukkan kepedulian Anda.",
                },
                {
                  icon: Megaphone,
                  title: "Perluas Jangkauan",
                  desc: "Jangkau lebih banyak pelanggan di berbagai kategori.",
                },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-white hover:border-[#008767]/30 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#008767]/10 text-[#008767] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= KENAPA BERGABUNG SECTION ================= */}
        <section className="py-16 sm:py-24 bg-slate-50/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Heading & Description */}
              <div className="lg:col-span-5 space-y-4">
                <p className="text-[#008767] font-bold text-xs sm:text-sm tracking-wide uppercase">
                  Kenapa Bergabung dengan Katamereka?
                </p>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                  Lebih dari Sekadar Ulasan,{" "}
                  <span className="relative inline-block text-[#008767]">
                    Ini Tentang Pertumbuhan Bisnis Anda
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-2">
                  Katamereka membantu bisnis dari berbagai industri untuk membangun reputasi, meningkatkan visibilitas, dan mendapatkan pelanggan baru melalui ulasan yang autentik.
                </p>
              </div>

              {/* Right Column: 2x2 Feature Cards */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  {
                    icon: Users,
                    title: "Kelola Profil Bisnis",
                    desc: "Lengkapi informasi bisnis Anda agar mudah ditemukan oleh calon pelanggan.",
                  },
                  {
                    icon: Star,
                    title: "Pantau & Tanggapi Ulasan",
                    desc: "Bangun hubungan yang lebih baik dengan pelanggan Anda.",
                  },
                  {
                    icon: BarChart3,
                    title: "Analitik & Insight",
                    desc: "Dapatkan data penting untuk mengembangkan bisnis Anda.",
                  },
                  {
                    icon: Award,
                    title: "Meningkatkan Kredibilitas",
                    desc: "Tunjukkan bahwa bisnis Anda dipercaya oleh banyak pelanggan.",
                  },
                ].map((card, idx) => {
                  const CardIcon = card.icon;
                  return (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-[#008767]/40 transition-all space-y-3"
                    >
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#008767] flex items-center justify-center border border-emerald-100">
                        <CardIcon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{card.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </section>

        {/* ================= CALL TO ACTION BANNER ================= */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-[#e8f6f2] via-[#ebf7f3] to-[#d8f2ea] rounded-3xl p-6 sm:p-10 border border-[#bce4d7] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#008767] text-white flex items-center justify-center shadow-md flex-shrink-0">
                  <Store className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Siap untuk membawa bisnis Anda ke level berikutnya?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Bergabunglah sekarang dan rasakan manfaatnya.
                  </p>
                </div>
              </div>

              <Link
                href="/signup?role=bisnis"
                className="px-6 py-3.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-[#008767]/20 active:scale-95 flex-shrink-0 w-full sm:w-auto justify-center"
              >
                <span>Daftar sebagai Bisnis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12 text-slate-600 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Top Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Brand Info */}
            <div className="lg:col-span-4 space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#008767] flex items-center justify-center text-white">
                  <MessageSquare className="w-4 h-4 fill-white/20" />
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  Kata<span className="text-[#008767]">mereka</span>
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
                Suara nyata, keputusan lebih baik. Platform ulasan terpercaya di Indonesia.
              </p>
              
              {/* Social Icons */}
              <div className="flex items-center gap-3 pt-2">
                {["Instagram", "TikTok", "X", "YouTube"].map((soc, idx) => (
                  <button
                    key={idx}
                    aria-label={soc}
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-[#008767] hover:text-white flex items-center justify-center text-slate-600 text-xs font-semibold transition-colors"
                  >
                    {soc[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Links Column 1: Tautan Cepat */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Tautan Cepat</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/bisnis" className="hover:text-[#008767] transition-colors font-bold text-[#008767]">Utama</Link></li>
                <li><Link href="/business/sunny-cafe" className="hover:text-[#008767] transition-colors">Bisnis Saya</Link></li>
                <li><Link href="/ulasan" className="hover:text-[#008767] transition-colors">Ulasan</Link></li>
                <li><Link href="/bantuan" className="hover:text-[#008767] transition-colors">Bantuan</Link></li>
              </ul>
            </div>

            {/* Links Column 2: Kategori */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Kategori</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Bisnis</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Produk</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Tempat</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Jasa</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Aplikasi</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Institusi</Link></li>
              </ul>
            </div>

            {/* Links Column 3: Dukungan */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Dukungan</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/bantuan" className="hover:text-[#008767] transition-colors">Pusat Bantuan</Link></li>
                <li><Link href="#" className="hover:text-[#008767] transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="#" className="hover:text-[#008767] transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link href="/bantuan" className="hover:text-[#008767] transition-colors">Hubungi Kami</Link></li>
              </ul>
            </div>

            {/* Links Column 4: Download Aplikasi */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Download Aplikasi!</h4>
              <p className="text-xs text-slate-500">
                Nikmati pengalaman lebih baik di perangkatmu.
              </p>
              <div className="space-y-2 pt-1">
                <div className="px-3.5 py-2 rounded-xl bg-slate-900 text-white flex items-center gap-2.5 cursor-pointer hover:bg-slate-800 transition-colors">
                  <AppWindow className="w-5 h-5 text-white" />
                  <div>
                    <p className="text-[10px] text-slate-300 leading-none">Download on the</p>
                    <p className="text-xs font-semibold leading-tight mt-0.5">App Store</p>
                  </div>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-slate-900 text-white flex items-center gap-2.5 cursor-pointer hover:bg-slate-800 transition-colors">
                  <Smartphone className="w-5 h-5 text-white" />
                  <div>
                    <p className="text-[10px] text-slate-300 leading-none">GET IT ON</p>
                    <p className="text-xs font-semibold leading-tight mt-0.5">Google Play</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Footer Bar */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2025 Katamereka. Semua hak dilindungi.</p>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#008767] transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Kembali ke atas</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
