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
  Zap,
  Check,
  Building2,
  Lock,
  Globe,
  HelpCircle,
  X
} from "lucide-react";

export default function BisnisLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-[#008767] selection:text-white">
      {/* Header / Navbar */}
      <Navbar isBusinessPage={true} />

      <main className="flex-1">
        {/* ================= HERO SECTION (Katamereka Emerald Signature Design) ================= */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#e8f6f2] via-[#f4faf7] to-white pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-emerald-100/60">
          {/* Background Decorative Blur Orbs */}
          <div className="absolute top-10 left-10 w-96 h-96 bg-[#008767]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#008767]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Hero Text & Actions */}
              <div className="lg:col-span-6 space-y-6 text-left">
                {/* Main Heading */}
                <h1 className="text-3xl sm:text-5xl lg:text-[2.85rem] font-extrabold text-slate-900 leading-tight sm:leading-[1.2] tracking-tight">
                  Tingkatkan Kepercayaan & Kembangkan Bisnis Anda Bersama{" "}
                  <span className="text-[#008767]">Katamereka</span>
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-medium">
                  Dapatkan ulasan nyata pelanggan, tingkatkan visibilitas usaha Anda, dan tanggapi setiap pengalaman secara profesional dari satu dashboard terpadu.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                  <Link
                    href="/signup?role=bisnis"
                    className="px-7 py-3.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#008767]/25 hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Daftar Akun Bisnis Gratis</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/signup?role=bisnis&claim=true"
                    className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm sm:text-base border border-slate-200/90 flex items-center justify-center shadow-xs transition-all hover:border-slate-300"
                  >
                    Klaim Bisnis Anda
                  </Link>
                </div>

                {/* Feature Checklist */}
                <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-semibold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#008767]" />
                    <span>Daftar Gratis 100%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#008767]" />
                    <span>Verifikasi Resmi Instan</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual Illustration */}
              <div className="lg:col-span-6 flex justify-center items-center">
                <div className="relative w-full max-w-xl">
                  <img
                    src="/ilus.webp"
                    alt="Katamereka Bisnis Illustration"
                    className="w-full h-auto object-contain scale-105 transform transition-transform duration-300 drop-shadow-xl"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ================= FEATURE HIGHLIGHT BAR ================= */}
        <section className="py-10 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Tingkatkan Kepercayaan",
                  desc: "Tampilkan ulasan asli dari pelanggan terverifikasi.",
                },
                {
                  icon: TrendingUp,
                  title: "Pantau Performa",
                  desc: "Lihat tren rating dan statistik ulasan secara real-time.",
                },
                {
                  icon: MessageSquare,
                  title: "Kelola Respons Ulasan",
                  desc: "Tanggapi saran & kesan pelanggan dengan cepat.",
                },
                {
                  icon: Megaphone,
                  title: "Perluas Jangkauan",
                  desc: "Jangkau ribuan calon pembeli baru di Katamereka.",
                },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 hover:bg-white hover:border-[#008767]/30 hover:shadow-md transition-all"
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
        <section id="solusi" className="py-16 sm:py-24 bg-slate-50/60">
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

                <div className="pt-4">
                  <Link
                    href="/signup?role=bisnis"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-sm shadow-md transition-all"
                  >
                    <span>Mulai Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
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
                    desc: "Bangun hubungan yang lebih baik dengan merespons apresiasi maupun masukan.",
                  },
                  {
                    icon: BarChart3,
                    title: "Analitik & Insight",
                    desc: "Dapatkan data penting untuk mengevaluasi kualitas produk dan layanan Anda.",
                  },
                  {
                    icon: Award,
                    title: "Meningkatkan Kredibilitas",
                    desc: "Tunjukkan bahwa bisnis Anda terverifikasi dan dipercaya oleh pelanggan.",
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

        {/* ================= PRODUK & KLAIM BISNIS SECTION ================= */}
        <section id="produk" className="py-16 sm:py-24 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <span className="text-[#008767] font-bold text-xs uppercase tracking-wider">
                  Dashboard Bisnis Terpadu
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                  Klaim Profil Bisnis Anda & Ambil Kendali Penuh
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  Banyak pelanggan mungkin sudah mengulas bisnis Anda di Katamereka. Klaim halaman bisnis Anda sekarang untuk membalas ulasan, memperbarui alamat & kontak, serta melihat analitik pengunjung.
                </p>

                <div className="space-y-3 pt-2">
                  {[
                    "Kelola halaman profil resmi bisnis Anda",
                    "Dapatkan notifikasi langsung setiap ada ulasan baru",
                    "Akses laporan analitik sentimen ulasan mingguan",
                    "Dapatkan lencana Terverifikasi Katamereka"
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-700 text-sm font-semibold">
                      <div className="w-5 h-5 rounded-full bg-[#008767]/10 text-[#008767] flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link
                    href="/signup?role=bisnis"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-base shadow-lg shadow-[#008767]/20 transition-all hover:scale-105"
                  >
                    <span>Daftar Akun Bisnis Gratis</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 flex justify-center">
                <div className="bg-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6 w-full max-w-lg">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-200/80">
                    <div className="w-12 h-12 rounded-2xl bg-[#008767] text-white font-bold text-xl flex items-center justify-center shadow-md shadow-[#008767]/20">
                      SC
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">Sunny Cafe & Bakery</h4>
                      <p className="text-xs text-slate-500">Jakarta Selatan • Kuliner & Resto</p>
                    </div>
                    <span className="ml-auto bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300">
                      Terverifikasi
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Ulasan Pelanggan</span>
                        <span className="text-[#008767] font-bold">Terbaru</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        "Pelayanan ramah banget, kopi dan suasananya oke buat kerja remote!"
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                      <p className="text-xs font-bold text-[#008767]">Tanggapan Pemilik Bisnis:</p>
                      <p className="text-xs text-slate-700">
                        "Terima kasih Kak! Kami senang bisa memberikan tempat yang nyaman untuk Anda."
                      </p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ================= BOTTOM CTA BANNER ================= */}
        <section className="py-16 sm:py-20 bg-gradient-to-r from-[#006e54] to-[#008767] text-white">
          <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Siap Kembangkan Bisnis Anda Bersama Katamereka?
            </h2>
            <p className="text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto font-medium">
              Bergabunglah dengan ribuan pemilik usaha di Indonesia yang telah mempercayakan reputasi bisnisnya kepada Katamereka.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/signup?role=bisnis"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-emerald-50 text-[#008767] font-extrabold text-base shadow-xl transition-all hover:scale-105"
              >
                Daftar Akun Bisnis Gratis
              </Link>
              <Link
                href="/login?role=bisnis&redirect=/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#005a44] hover:bg-[#004e3b] text-white font-extrabold text-base border border-emerald-400/40 transition-all"
              >
                Masuk ke Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#008767] flex items-center justify-center text-white font-bold text-xs">
              K
            </div>
            <span className="text-sm font-bold text-white">
              Kata<span className="text-[#008767]">mereka</span> <span className="text-xs font-normal text-slate-400">Untuk Bisnis</span>
            </span>
          </div>
          <p>© {new Date().getFullYear()} Katamereka. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-6 text-slate-400">
            <Link href="/tentang-kami" className="hover:text-white transition-colors">Tentang Kami</Link>
            <Link href="/bantuan" className="hover:text-white transition-colors">Bantuan</Link>
            <Link href="/" className="hover:text-white transition-colors">Halaman Utama</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
