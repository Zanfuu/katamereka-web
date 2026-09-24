"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import {
  Search,
  FileText,
  ShieldCheck,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  Headphones,
  MessageCircle,
  Mail,
  Lightbulb,
  ChevronDown,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default function BantuanPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Bagaimana cara membalas ulasan pelanggan?",
      a: "Anda dapat masuk ke menu 'Ulasan' di Navbar atas. Pada setiap ulasan pelanggan, klik tombol 'Balas' atau 'Lihat Balasan' untuk mengirimkan tanggapan resmi dari nama bisnis Anda."
    },
    {
      q: "Berapa lama proses verifikasi bisnis?",
      a: "Proses peninjauan dokumen verifikasi bisnis Katamereka umumnya membutuhkan waktu 1 hingga 2 hari kerja. Setelah disetujui, lencana centang hijau 'Terverifikasi' akan otomatis muncul di profil bisnis Anda."
    },
    {
      q: "Bagaimana cara memperbarui informasi bisnis?",
      a: "Klik nama profil bisnis Anda di kanan atas, lalu pilih 'Profil Bisnis Saya' atau klik tombol 'Dashboard'. Anda dapat mengubah nama toko, jam operasional, nomor telepon, alamat, dan foto tempat usaha."
    },
    {
      q: "Apakah ulasan negatif bisa dihapus?",
      a: "Ulasan negatif dari pengalaman nyata pelanggan tidak dapat dihapus. Namun, jika ulasan tersebut mengandung unsur kebencian, pencemaran nama baik, atau spam palsu, Anda dapat mengklik tombol 'Laporkan' untuk ditinjau oleh tim moderasi kami."
    },
    {
      q: "Bagaimana cara melihat laporan performa bisnis?",
      a: "Masuk ke halaman 'Ulasan' atau klik tombol 'Dashboard' emas di Navbar atas untuk melihat Ringkasan Ulasan, statistik kepuasan pelanggan, grafik tren bulanan, dan analisis kata kunci ulasan."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f4faf7] flex flex-col font-sans text-slate-800 antialiased">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* ================= HERO BANNER SECTION ================= */}
          <div className="bg-gradient-to-r from-[#e1f5ee] via-[#e8f7f2] to-[#d6f2e9] rounded-3xl p-6 sm:p-10 border border-[#bce4d7] shadow-2xs relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column Text & Search */}
              <div className="lg:col-span-7 space-y-4">
                <p className="text-xs sm:text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                  Halo, <span className="font-extrabold text-slate-900">Kedai Rasa Kita</span> 👋
                </p>

                <h1 className="text-2xl sm:text-4xl lg:text-[2.5rem] font-extrabold text-slate-900 tracking-tight leading-tight">
                  Pusat Bantuan <span className="text-[#008767]">Katamereka</span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                  Temukan jawaban untuk pertanyaan yang paling sering ditanyakan atau hubungi tim kami jika membutuhkan bantuan lebih lanjut.
                </p>

                {/* Search Bar Input Container */}
                <div className="pt-2">
                  <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-md border border-slate-200/90 max-w-xl">
                    <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari bantuan, misalnya: cara membalas ulasan, verifikasi bisnis, dll..."
                      className="w-full pl-3 pr-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                    />
                    <button className="px-5 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex-shrink-0">
                      Cari
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column Visual Illustration */}
              <div className="lg:col-span-5 relative hidden sm:flex justify-center">


                {/* Illustration Card Container */}
                <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-lg border border-white/80 bg-white relative z-10">
                  <img
                    src="/bantuan-hero.jpg"
                    alt="Kedai Rasa Kita Staff"
                    className="w-full h-56 sm:h-64 object-cover object-center"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* ================= 5 CATEGORY CARDS GRID ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                icon: FileText,
                title: "Panduan Bisnis",
                desc: "Pelajari cara mengelola profil, ulasan, dan fitur bisnis lainnya.",
              },
              {
                icon: ShieldCheck,
                title: "Verifikasi Bisnis",
                desc: "Ketahui proses dan persyaratan verifikasi bisnis Anda.",
              },
              {
                icon: MessageSquare,
                title: "Kelola Ulasan",
                desc: "Pelajari cara merespons ulasan dan meningkatkan reputasi.",
              },
              {
                icon: BarChart3,
                title: "Insight & Laporan",
                desc: "Pahami data performa bisnis Anda di Katamereka.",
              },
              {
                icon: Settings,
                title: "Pengaturan Akun",
                desc: "Kelola informasi akun dan pengaturan bisnis Anda.",
              },
            ].map((cat, idx) => {
              const CatIcon = cat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-[#008767]/40 transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
                >
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#008767] flex items-center justify-center border border-emerald-100 group-hover:bg-[#008767] group-hover:text-white transition-colors">
                      <CatIcon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#008767] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="flex justify-end pt-1">
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#008767] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= MAIN SECTION: FAQ LEFT, DIRECT HELP RIGHT ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Pertanyaan yang Sering Diajukan (FAQ) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#008767] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    ?
                  </div>
                  <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Pertanyaan yang Sering Diajukan
                  </h2>
                </div>

                <button className="text-xs font-bold text-[#008767] hover:underline flex items-center gap-1">
                  <span>Lihat semua</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Accordion Items */}
              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200/90 rounded-2xl overflow-hidden transition-all bg-white"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full p-4 sm:p-4.5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-xs sm:text-sm hover:text-[#008767] transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${
                            isOpen ? "rotate-180 text-[#008767]" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4.5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100/80 bg-slate-50/50">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Butuh Bantuan Langsung? & Tips */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Card Butuh Bantuan Langsung */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#008767] flex items-center justify-center border border-emerald-100">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Butuh Bantuan Langsung?
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Tim kami siap membantu Anda melalui berbagai saluran berikut.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  {/* Live Chat */}
                  <a
                    href="#"
                    className="p-3 rounded-xl border border-slate-200/90 hover:border-[#008767]/40 hover:bg-slate-50/80 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#008767] flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">Live Chat</p>
                        <p className="text-[11px] text-slate-500">Tersedia setiap hari, 08.00 – 22.00 WIB</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#008767] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:support@katamereka.com"
                    className="p-3 rounded-xl border border-slate-200/90 hover:border-[#008767]/40 hover:bg-slate-50/80 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#008767] flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">Email</p>
                        <p className="text-[11px] text-slate-500">support@katamereka.com</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#008767] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </a>

                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl border border-slate-200/90 hover:border-[#008767]/40 hover:bg-slate-50/80 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#008767] flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">WhatsApp</p>
                        <p className="text-[11px] text-slate-500">+62 812 3456 7890</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#008767] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </a>
                </div>
              </div>

              {/* Tips untuk Bisnis Anda Card */}
              <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/80 to-[#d8f2ea] rounded-2xl border border-emerald-200/90 p-4.5 shadow-2xs space-y-2 flex items-center justify-between gap-3 group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#008767] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Lightbulb className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs">Tips untuk Bisnis Anda</h4>
                    <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                      Jangan lupa untuk selalu merespons ulasan pelanggan agar kepercayaan dan loyalitas semakin meningkat.
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-[#008767] group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
