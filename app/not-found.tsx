import Link from "next/link";
import Navbar from "@/components/navbar";
import { FileQuestion, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#008767] shadow-sm">
            <FileQuestion className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100/70 text-[#008767] text-xs font-bold tracking-wider uppercase">
              Error 404
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Halaman Tidak Tersedia
            </h1>
            <p className="text-sm sm:text-base text-slate-500 max-w-sm mx-auto leading-relaxed">
              Maaf, halaman yang Anda cari tidak ditemukan, sedang tidak tersedia, atau alamat URL telah dipindahkan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007458] text-white text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
            <Link
              href="/businesses"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-semibold transition-all shadow-xs hover:bg-slate-50"
            >
              <Search className="w-4 h-4 text-slate-400" />
              Jelajahi Bisnis
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <p>© 2025 Katamereka. Semua hak dilindungi.</p>
      </footer>
    </div>
  );
}
