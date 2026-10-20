"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  ArrowUp,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Search,
  Settings,
  ShieldCheck,
  Star,
  X,
  XCircle,
} from "lucide-react";
import { useAuth, isKnownBusinessAccount } from "@/lib/auth-context";

const NAV_LINKS = [
  { label: "Solusi", href: "/solusi" },
  { label: "Produk", href: "/produk" },
  { label: "Harga", href: "/harga" },
  { label: "Bantuan", href: "/bantuan" },
  { label: "Tentang Kami", href: "/tentang-kami" },
];

const SEARCH_EXAMPLES = ["Hanz Pickup Rent Car", "Hotel Santika", "Apotek IKA", "Jakarta Selatan"];

const FAQS = [
  {
    q: "Apakah Katamereka gratis untuk digunakan?",
    a: "Ya. Mengklaim profil bisnis dan mengelola informasi dasarnya gratis, tanpa kartu kredit.",
  },
  {
    q: "Siapa yang bisa mengklaim profil bisnis?",
    a: "Pemilik atau perwakilan resmi bisnis. Kami akan meminta bukti kepemilikan saat proses verifikasi.",
  },
  {
    q: "Bagaimana cara klaim profil bisnis?",
    a: "Cari bisnis Anda, ajukan klaim lalu lakukan verifikasi kepemilikan. Setelah disetujui, Anda bisa langsung mengelola profil dari dashboard.",
  },
  {
    q: "Apakah saya bisa mengklaim lebih dari satu bisnis?",
    a: "Bisa. Setiap bisnis diajukan klaimnya satu per satu, dan semuanya dapat Anda kelola dari satu akun.",
  },
  {
    q: "Berapa lama proses verifikasi klaim?",
    a: "Lama proses bergantung pada kelengkapan bukti kepemilikan yang Anda kirim. Status klaim bisa dipantau langsung dari akun Anda.",
  },
  {
    q: "Bagaimana jika bisnis saya tidak ditemukan?",
    a: "Coba cari dengan nama lain, merek, atau lokasi. Jika tetap tidak muncul, hubungi tim kami lewat halaman Bantuan.",
  },
];

const STEPS = [
  {
    n: "01",
    icon: Search,
    title: "Cari Bisnis Anda",
    text: "Temukan profil bisnis Anda di Katamereka dengan nama atau lokasi.",
    cta: "Cari sekarang",
    href: "#cari",
    tone: { card: "from-emerald-50 border-emerald-200 hover:border-emerald-400", chip: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-100" },
  },
  {
    n: "02",
    icon: FileText,
    title: "Klaim & Verifikasi",
    text: "Pastikan Anda adalah pemilik atau perwakilan bisnis.",
    cta: "Mulai klaim",
    href: "/klaim-bisnis",
    tone: { card: "from-sky-50 border-sky-200 hover:border-sky-400", chip: "bg-sky-100 text-sky-700", bar: "bg-sky-100" },
  },
  {
    n: "03",
    icon: Settings,
    title: "Kelola Bisnis Anda",
    text: "Perbarui informasi, tanggapi ulasan, dan lihat insight bisnis.",
    cta: "Buka dashboard",
    href: "/dashboard",
    tone: { card: "from-amber-50 border-amber-200 hover:border-amber-400", chip: "bg-amber-100 text-amber-700", bar: "bg-amber-100" },
  },
];

/* --------------------------------- Helpers --------------------------------- */

/** Smooth-scrolls to in-page anchors; lets normal links through untouched. */
function handleAnchor(e: MouseEvent<HTMLElement>, href: string) {
  if (!href.startsWith("#")) return;
  e.preventDefault();
  if (href === "#") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Fades + slides children in the first time they enter the viewport. */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style: CSSProperties = { transitionDelay: `${delay}ms` };
  return (
    <div ref={ref} style={style} className={`bis-reveal ${shown ? "is-in" : ""} ${className}`}>
      {children}
    </div>
  );
}

function PrimaryButton({
  href,
  children,
  light = false,
}: {
  href: string;
  children: ReactNode;
  /** White button for use on top of the green gradient CTA. */
  light?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 ${
        light
          ? "bg-white text-[#008767] hover:bg-emerald-50 shadow-emerald-950/20"
          : "bg-[#008767] hover:bg-[#007458] text-white shadow-emerald-900/15 hover:shadow-emerald-900/25"
      }`}
    >
      {children}
      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  );
}

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <CheckCircle2 className="w-4 h-4 text-[#008767]" />
      {children}
    </span>
  );
}

/* ---------------------------------- Header --------------------------------- */

function Header() {
  const { user, isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // false during SSR/hydration so auth-dependent buttons don't mismatch
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isBusinessUser =
    mounted &&
    isLoggedIn &&
    !!user &&
    (user.role === "bisnis" || isKnownBusinessAccount(user.email, user.username));

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        scrolled ? "bg-white/85 border-slate-200 shadow-sm" : "bg-white/95 border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/bisnis" className="group flex items-center gap-2.5 shrink-0">
          <span className="w-9 h-9 rounded-xl overflow-hidden bg-[#008767] shrink-0 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
            <img src="/logo.png" alt="Katamereka" className="w-full h-full object-cover" />
          </span>
          <span className="font-heading text-xl font-bold text-slate-900 tracking-tight leading-none">
            Kata<span className="text-[#008767]">mereka</span>
          </span>
          <span className="hidden sm:inline text-[10px] font-extrabold bg-[#008767] text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
            Untuk Bisnis
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-[13px] font-medium text-slate-700">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="relative py-1 hover:text-[#008767] transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-[#008767] after:transition-transform after:duration-300 hover:after:scale-x-100"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/search"
            aria-label="Pencarian"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-[#008767] hover:text-white text-slate-700 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90"
          >
            <Search className="w-4 h-4" />
          </Link>

          {isBusinessUser ? (
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#008767] hover:bg-[#007458] text-white text-[13px] font-semibold transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login?role=bisnis"
                className="hidden sm:inline-flex px-4 py-2 rounded-lg border border-slate-200 bg-white hover:border-[#008767] hover:text-[#008767] hover:-translate-y-0.5 active:scale-95 text-slate-700 text-[13px] font-medium transition-all"
              >
                Masuk
              </Link>
              <Link
                href="/signup?role=bisnis"
                className="group hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#008767] hover:bg-[#007458] text-white text-[13px] font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                Daftar Akun Bisnis
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="lg:hidden w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-700 transition-all"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu: grid-rows trick animates height without measuring */}
      <div
        className={`lg:hidden grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 bg-white px-4 py-3 space-y-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-emerald-50 hover:text-[#008767] hover:pl-4 transition-all"
              >
                {l.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {isBusinessUser ? (
                <Link
                  href="/dashboard"
                  className="col-span-2 text-center px-3 py-2.5 rounded-lg bg-[#008767] text-white text-sm font-semibold active:scale-95 transition-transform"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login?role=bisnis"
                    className="text-center px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 active:scale-95 transition-transform"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/signup?role=bisnis"
                    className="text-center px-3 py-2.5 rounded-lg bg-[#008767] text-white text-sm font-semibold active:scale-95 transition-transform"
                  >
                    Daftar Akun Bisnis
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ----------------------------------- FAQ ----------------------------------- */

// One tint per question; the open card switches to the solid brand gradient.
const FAQ_THEMES = [
  { card: "bg-emerald-50 border-emerald-200 hover:border-emerald-400", badge: "bg-emerald-100 text-emerald-700" },
  { card: "bg-sky-50 border-sky-200 hover:border-sky-400", badge: "bg-sky-100 text-sky-700" },
  { card: "bg-amber-50 border-amber-200 hover:border-amber-400", badge: "bg-amber-100 text-amber-700" },
  { card: "bg-violet-50 border-violet-200 hover:border-violet-400", badge: "bg-violet-100 text-violet-700" },
  { card: "bg-rose-50 border-rose-200 hover:border-rose-400", badge: "bg-rose-100 text-rose-700" },
  { card: "bg-teal-50 border-teal-200 hover:border-teal-400", badge: "bg-teal-100 text-teal-700" },
];

function FaqColumn({
  items,
  idPrefix,
  themeOffset,
}: {
  items: typeof FAQS;
  idPrefix: string;
  themeOffset: number;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-3 self-start">
      {items.map((f, i) => {
        const isOpen = openIdx === i;
        const panelId = `${idPrefix}-${i}`;
        const theme = FAQ_THEMES[(themeOffset + i) % FAQ_THEMES.length];
        return (
          <div
            key={f.q}
            className={`rounded-xl border transition-all duration-300 ${
              isOpen
                ? "bg-gradient-to-br from-[#008767] to-[#10a37f] border-transparent text-white shadow-lg shadow-emerald-900/25 -translate-y-0.5"
                : `${theme.card} text-slate-800 hover:-translate-y-0.5 hover:shadow-md`
            }`}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="group w-full flex items-center gap-3 px-4 py-3.5 text-left text-[13px] font-semibold cursor-pointer active:scale-[0.98] transition-transform"
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isOpen ? "bg-white/20 text-white rotate-[360deg]" : `${theme.badge} group-hover:scale-110`
                }`}
              >
                <HelpCircle className="w-4 h-4" />
              </span>
              <span className="flex-1">{f.q}</span>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isOpen ? "bg-white text-[#008767] rotate-180" : "bg-white/80 text-slate-500 group-hover:bg-white"
                }`}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-4 pb-4 pl-[3.75rem] text-xs text-white/90 leading-relaxed">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ Edge decoration ----------------------------- */

const ORB_GRADIENT =
  "radial-gradient(circle at 35% 35%, #0b8a6a 0%, #1fa383 42%, rgba(0,135,103,0.18) 100%)";

/** Soft green orb bleeding off the page edge. Parent needs `relative overflow-hidden`. */
function Orb({
  side,
  pos,
  size,
  slow = false,
}: {
  side: "left" | "right";
  pos: string;
  size: string;
  slow?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-0 hidden lg:block ${
        side === "left" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
      } ${pos} ${size}`}
    >
      <span className={`relative block h-full w-full opacity-70 ${slow ? "bis-float-slow" : "bis-float"}`}>
        <span className="absolute inset-0 rounded-full" style={{ background: ORB_GRADIENT }} />
        <span className="absolute -inset-2 rounded-full border border-emerald-400/50" />
      </span>
    </span>
  );
}

/** Big orb on one edge, small one on the other, plus a few drifting dots. Sized from the section height so nothing gets sliced by the section edge. */
function EdgeDecor({ flip = false }: { flip?: boolean }) {
  const near = flip ? "right" : "left";
  const far = flip ? "left" : "right";
  return (
    <>
      <Orb side={near} pos="top-[62%] -translate-y-1/2" size="h-[60%] max-h-[26rem] aspect-square" />
      <Orb side={far} pos="top-[26%] -translate-y-1/2" size="h-[34%] max-h-[16rem] aspect-square" slow />
      <span aria-hidden="true" className="bis-float pointer-events-none absolute z-0 hidden md:block left-[7%] top-[14%] h-2.5 w-2.5 rounded-full bg-emerald-300/80" />
      <span aria-hidden="true" className="bis-float-slow pointer-events-none absolute z-0 hidden md:block right-[9%] bottom-[16%] h-3 w-3 rounded-full bg-teal-300/70" />
      <span aria-hidden="true" className="bis-float pointer-events-none absolute z-0 hidden md:block right-[5%] top-[40%] h-2 w-2 rounded-full bg-emerald-400/60" />
    </>
  );
}

/* ----------------------------------- Page ---------------------------------- */

export default function BisnisLandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Steps auto-advance until the visitor clicks one.
  useEffect(() => {
    if (!autoPlay) return;
    const t = setTimeout(() => setActiveStep((s) => (s + 1) % STEPS.length), 3800);
    return () => clearTimeout(t);
  }, [activeStep, autoPlay]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/klaim-bisnis?q=${encodeURIComponent(q)}` : "/klaim-bisnis");
  }

  const half = Math.ceil(FAQS.length / 2);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-800 antialiased selection:bg-[#008767] selection:text-white">
      <Header />

      <main className="flex-1">
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#eef7f3] via-white to-white pt-10 pb-14 sm:pt-14 sm:pb-20">
          <div aria-hidden="true" className="bis-blob pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl" />
          <div aria-hidden="true" className="bis-blob pointer-events-none absolute top-40 -left-32 w-80 h-80 rounded-full bg-teal-100/60 blur-3xl [animation-delay:-6s]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
              <div className="lg:col-span-6 space-y-6">
                <Reveal>
                  <h1 className="text-[2rem] sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 leading-[1.12] tracking-tight">
                    Bisnis Anda Sudah Terdaftar di Katamereka.{" "}
                    <span className="text-[#008767]">Klaim Profilnya. Kelola Reputasinya.</span>
                  </h1>
                </Reveal>
                <Reveal delay={100}>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-lg">
                    Klaim profil bisnis Anda secara gratis di Katamereka. Lengkapi informasi operasional, tanggapi
                    ulasan konsumen secara langsung, dan bangun kepercayaan reputasi bisnis Anda.
                  </p>
                </Reveal>
                <Reveal delay={200}>
                  <div className="flex flex-wrap items-center gap-3">
                    <PrimaryButton href="/dashboard">Mulai Kelola Bisnis</PrimaryButton>
                    <a
                      href="#cara-kerja"
                      onClick={(e) => handleAnchor(e, "#cara-kerja")}
                      className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-slate-50 hover:border-[#008767] hover:text-[#008767] hover:-translate-y-0.5 active:scale-95 text-slate-800 text-sm font-medium rounded-lg border border-slate-200 shadow-xs transition-all duration-200"
                    >
                      Pelajari Cara Kerja
                    </a>
                  </div>
                </Reveal>
                <Reveal delay={300}>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
                    <CheckItem>Gratis untuk diklaim</CheckItem>
                    <CheckItem>Verifikasi pemilik</CheckItem>
                    <CheckItem>Kelola profil bisnis</CheckItem>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={150} className="lg:col-span-6">
                <div className="relative flex justify-center lg:justify-end">
                  <img
                    src="/bisnis-hero.png"
                    alt="Klaim profil bisnis Anda di Katamereka"
                    className="bis-float-slow w-full max-w-xl h-auto object-contain rounded-3xl shadow-xl shadow-slate-900/10"
                    loading="eager"
                  />
                  <span className="bis-float absolute left-0 sm:-left-3 bottom-4 sm:bottom-6 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-lg shadow-slate-900/10 ring-1 ring-slate-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#008767]" /> Bisnis Terverifikasi
                  </span>
                  <span className="bis-float-slow absolute right-0 sm:-right-2 top-3 sm:top-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-lg shadow-slate-900/10 ring-1 ring-slate-100">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.7 · 128 ulasan
                  </span>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ===== SEARCH BAND ===== */}
        <section id="cari" className="bg-[#f2f9f6] border-y border-emerald-100/60 py-10 sm:py-12 scroll-mt-16">
          <Reveal>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-3">
              <p className="text-xs font-semibold tracking-wide text-[#008767]">BISNIS TERDAFTAR DI KATAMEREKA</p>
              <h2 className="text-2xl sm:text-[1.7rem] font-extrabold text-slate-900 tracking-tight leading-tight">
                Mungkin Pelanggan Anda Sudah Membicarakan Bisnis Anda
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Temukan bisnis Anda di Katamereka. Lihat bagaimana pelanggan menemukan dan menilai bisnis Anda.
              </p>
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 pt-3">
                <label className="group relative flex-1">
                  <span className="sr-only">Cari bisnis Anda</span>
                  <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#008767]" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Masukkan nama bisnis, merek, atau lokasi"
                    className="w-full h-12 pl-11 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 shadow-xs transition-all focus:outline-none focus:ring-4 focus:ring-[#008767]/15 focus:border-[#008767] focus:shadow-md"
                  />
                </label>
                <button
                  type="submit"
                  className="group h-12 inline-flex items-center justify-center gap-2 px-7 rounded-lg bg-[#008767] hover:bg-[#007458] text-white text-sm font-semibold shadow-md shadow-emerald-900/15 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  Cari Profil
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-slate-400">
                <span>Contoh:</span>
                {SEARCH_EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setQuery(ex)}
                    className={`rounded-full border px-3 py-1 font-medium transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:scale-95 ${
                      query === ex
                        ? "border-[#008767] bg-[#008767] text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:border-[#008767] hover:text-[#008767]"
                    }`}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ===== VALUE PROPS ===== */}
        <section className="py-10 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 md:divide-x divide-slate-200 gap-y-3">
            {[
              { icon: BarChart3, tone: "bg-emerald-100 text-emerald-700", title: "Lihat rating dan ulasan", text: "Ketahui bagaimana pelanggan menilai bisnis Anda." },
              { icon: Settings, tone: "bg-sky-100 text-sky-700", title: "Kelola informasi bisnis", text: "Perbarui detail operasional, foto, dan kontak." },
              { icon: ShieldCheck, tone: "bg-amber-100 text-amber-700", title: "Bangun kepercayaan", text: "Tampilkan profil yang lebih lengkap dan terpercaya." },
            ].map(({ icon: Icon, tone, title, text }, i) => (
              <Reveal key={title} delay={i * 120}>
                <div className={`group flex items-center gap-4 rounded-2xl md:rounded-none px-3 py-3 md:px-8 transition-colors hover:bg-emerald-50/50 md:hover:bg-transparent cursor-default ${i === 0 ? "md:pl-0" : ""} ${i === 2 ? "md:pr-0" : ""}`}>
                  <span className={`w-12 h-12 rounded-full ${tone.split(" ")[0]} flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-[#008767] group-hover:scale-110 group-hover:rotate-[8deg] group-hover:shadow-lg group-hover:shadow-emerald-900/20`}>
                    <Icon className={`w-5 h-5 ${tone.split(" ")[1]} transition-colors duration-300 group-hover:text-white`} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ===== CARA MENGAJUKAN KLAIM ===== */}
        <section id="cara-kerja" className="relative overflow-hidden pt-6 pb-14 sm:pb-16 scroll-mt-20">
          <EdgeDecor />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <Reveal>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#008767] mb-1">
                Cara Mengajukan Klaim
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Hanya 3 Langkah Mudah
              </h2>
              <p className="text-sm text-slate-500 mt-1">Klaim profil bisnis Anda dalam hitungan menit.</p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-stretch">
              {STEPS.flatMap(({ n, icon: Icon, title, text, cta, href, tone }, i) => {
                const active = activeStep === i;
                const card = (
                  <Reveal key={n} delay={i * 130} className="h-full">
                    <div
                      role="button"
                      tabIndex={0}
                      aria-pressed={active}
                      onClick={() => {
                        setAutoPlay(false);
                        setActiveStep(i);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setAutoPlay(false);
                          setActiveStep(i);
                        }
                      }}
                      className={`relative h-full overflow-hidden rounded-xl border bg-gradient-to-br to-white p-5 pt-6 cursor-pointer select-none transition-all duration-300 active:scale-[0.97] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#008767]/25 ${
                        active
                          ? "border-[#008767] from-emerald-100/80 shadow-xl shadow-emerald-900/15 -translate-y-1.5"
                          : `${tone.card} hover:shadow-md hover:-translate-y-0.5`
                      }`}
                    >
                      <span
                        className={`absolute top-3 left-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-colors duration-300 ${
                          active ? "bg-[#008767] text-white" : tone.chip
                        }`}
                      >
                        {n}
                      </span>
                      <div className="flex items-start gap-4 mt-3">
                        <span
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                            active ? "bg-[#008767] text-white scale-110 rotate-[-6deg]" : tone.chip
                          }`}
                        >
                          <Icon className="w-5 h-5" strokeWidth={1.9} />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                          <p className="text-xs text-slate-500 leading-relaxed mt-1">{text}</p>
                        </div>
                      </div>

                      <div
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                          active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <Link
                            href={href}
                            tabIndex={active ? 0 : -1}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAnchor(e, href);
                            }}
                            className="group mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#008767] hover:underline"
                          >
                            {cta}
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </div>
                      </div>

                      {/* progress bar: fills while auto-advancing, solid once the visitor takes over */}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-0 bottom-0 h-1 ${tone.bar}`}
                      >
                        {active && (
                          <span
                            key={`${i}-${autoPlay}`}
                            className={`block h-full bg-[#008767] ${autoPlay ? "bis-fill" : "w-full"}`}
                          />
                        )}
                      </span>
                    </div>
                  </Reveal>
                );
                return i < STEPS.length - 1
                  ? [
                      card,
                      <div key={`arrow-${n}`} className="hidden md:flex items-center justify-center" aria-hidden="true">
                        <ArrowRight
                          className={`w-5 h-5 transition-all duration-300 ${
                            activeStep === i ? "text-[#008767] translate-x-1" : "text-slate-400"
                          }`}
                        />
                      </div>,
                    ]
                  : [card];
              })}
            </div>
          </div>
        </section>

        {/* ===== KENAPA HARUS CLAIM? ===== */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-emerald-50/50 pb-14 sm:pb-20">
          <EdgeDecor flip />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <Reveal className="lg:col-span-5">
              <div className="space-y-4">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#008767]">Kenapa Harus Claim?</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                  Profil Anda Tetap Dapat Ditemukan. Tapi Setelah Diklaim, Anda Bisa Mengelolanya.
                </h2>
                <div className="pt-2">
                  <PrimaryButton href="/search">Klaim Bisnis Gratis</PrimaryButton>
                </div>
              </div>
            </Reveal>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Reveal delay={100}>
                <div className="group h-full rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/5 active:scale-[0.98]">
                  <h3 className="flex items-center gap-2.5 text-sm font-bold text-slate-800">
                    <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 transition-transform duration-300 group-hover:rotate-12">
                      <XCircle className="w-4 h-4" />
                    </span>
                    Tanpa Claim
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Informasi bisnis terbatas",
                      "Tidak bisa mengelola profil",
                      "Tidak bisa merespon ulasan",
                      "Tidak memiliki akses dashboard",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-2.5 text-xs text-slate-500 transition-transform duration-200 hover:translate-x-1">
                        <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={220}>
                <div className="group h-full rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#008767] hover:shadow-xl hover:shadow-emerald-900/10 active:scale-[0.98]">
                  <h3 className="flex items-center gap-2.5 text-sm font-bold text-[#008767]">
                    <span className="w-8 h-8 rounded-lg bg-white border border-emerald-200 flex items-center justify-center transition-all duration-300 group-hover:bg-[#008767] group-hover:text-white group-hover:-rotate-12">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    Setelah Claim
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Kelola informasi bisnis",
                      "Kelola profil sendiri",
                      "Tanggapi ulasan pelanggan",
                      "Akses dashboard bisnis",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-2.5 text-xs text-slate-800 font-medium transition-transform duration-200 hover:translate-x-1">
                        <CheckCircle2 className="w-4 h-4 text-[#008767] shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ===== DASHBOARD ===== */}
        <section id="fitur" className="bg-[#f6faf8] border-y border-slate-100 py-14 sm:py-16 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <Reveal className="lg:col-span-6 order-2 lg:order-1">
              <div className="flex justify-center lg:justify-start">
                <img
                  src="/bisnis-dashboard.png"
                  alt="Dashboard Katamereka untuk mengelola profil bisnis"
                  className="bis-float w-full max-w-xl h-auto object-contain rounded-3xl shadow-xl shadow-slate-900/10"
                  loading="lazy"
                />
              </div>
            </Reveal>
            <Reveal delay={150} className="lg:col-span-6 order-1 lg:order-2">
              <div className="space-y-4">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#008767]">
                  Setelah Bisnis Anda Diklaim
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                  Satu Dashboard untuk Mengelola Profil &amp; Reputasi Bisnis Anda.
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed max-w-md">
                  Semua yang Anda butuhkan untuk menjaga reputasi bisnis, dalam satu tempat.
                </p>
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#008767] text-[#008767] hover:bg-[#008767] hover:text-white hover:-translate-y-0.5 active:scale-95 bg-white text-[13px] font-semibold transition-all duration-200"
                >
                  Akses Dashboard Bisnis{" "}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="relative overflow-hidden py-14 sm:py-16">
          <EdgeDecor />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <Reveal>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Pertanyaan Umum</h2>
                  <p className="text-sm text-slate-500 mt-1">Berikut beberapa pertanyaan yang sering kami terima.</p>
                </div>
                <Link
                  href="/bantuan"
                  className="group hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#008767] hover:underline whitespace-nowrap"
                >
                  Lihat semua pertanyaan{" "}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              <Reveal delay={80}>
                <FaqColumn items={FAQS.slice(0, half)} idPrefix="faq-a" themeOffset={0} />
              </Reveal>
              <Reveal delay={180}>
                <FaqColumn items={FAQS.slice(half)} idPrefix="faq-b" themeOffset={half} />
              </Reveal>
            </div>
            <Link
              href="/bantuan"
              className="sm:hidden inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#008767]"
            >
              Lihat semua pertanyaan <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* ===== BOTTOM CTA ===== */}
        <section className="pb-14 sm:pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#006b53] via-[#008767] to-[#12b08a] px-6 sm:px-10 py-8 flex flex-col md:flex-row md:items-center gap-6 shadow-xl shadow-emerald-900/20 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/30 hover:-translate-y-0.5">
                <div aria-hidden="true" className="bis-blob pointer-events-none absolute -right-16 -top-20 w-72 h-72 rounded-full bg-white/15 blur-2xl" />
                <div aria-hidden="true" className="bis-blob pointer-events-none absolute -left-20 -bottom-24 w-64 h-64 rounded-full bg-emerald-300/20 blur-2xl [animation-delay:-5s]" />
                <span className="relative w-16 h-16 shrink-0">
                  <span aria-hidden="true" className="bis-ring absolute inset-0 rounded-full bg-white" />
                  <span className="relative w-16 h-16 rounded-full bg-white text-[#008767] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <MessageCircle className="w-7 h-7" />
                  </span>
                </span>
                <div className="relative flex-1 space-y-1.5">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Mulai Kelola Profil Bisnis Anda
                  </h2>
                  <p className="text-sm text-emerald-50/90 leading-relaxed max-w-2xl">
                    Profil bisnis Anda mungkin sudah ada di Katamereka. Masuk atau daftar akun bisnis untuk mulai
                    mengklaim profil Anda secara gratis.
                  </p>
                </div>
                <div className="relative shrink-0">
                  <PrimaryButton href="/dashboard" light>
                    Klaim &amp; Kelola Bisnis Sekarang
                  </PrimaryButton>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-100 bg-white pt-10 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl overflow-hidden bg-[#008767] shrink-0">
                  <img src="/logo.png" alt="Katamereka" className="w-full h-full object-cover" />
                </span>
                <span className="font-heading text-xl font-bold text-slate-900 tracking-tight">
                  Kata<span className="text-[#008767]">mereka</span>
                </span>
                <span className="text-[9px] font-extrabold bg-[#008767] text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Untuk Bisnis
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                Platform ulasan dan rekomendasi bisnis dari orang-orang seperti kamu. Temukan ulasan terpercaya dan
                layanan yang tepat.
              </p>
            </div>

            <div className="md:col-span-3 md:col-start-7">
              <p className="text-xs font-bold text-slate-900 mb-3">Tautan Cepat</p>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><a href="#cara-kerja" onClick={(e) => handleAnchor(e, "#cara-kerja")} className="inline-block hover:text-[#008767] hover:translate-x-1 transition-all">Cara Kerja</a></li>
                <li><a href="#fitur" onClick={(e) => handleAnchor(e, "#fitur")} className="inline-block hover:text-[#008767] hover:translate-x-1 transition-all">Fitur</a></li>
                <li><Link href="/bantuan" className="inline-block hover:text-[#008767] hover:translate-x-1 transition-all">Bantuan</Link></li>
                <li><Link href="/login?role=bisnis" className="inline-block hover:text-[#008767] hover:translate-x-1 transition-all">Masuk</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <p className="text-xs font-bold text-slate-900 mb-3">Legal</p>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link href="/bantuan" className="inline-block hover:text-[#008767] hover:translate-x-1 transition-all">Kebijakan Privasi</Link></li>
                <li><Link href="/bantuan" className="inline-block hover:text-[#008767] hover:translate-x-1 transition-all">Syarat &amp; Ketentuan</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} Katamereka. Semua hak dilindungi.</p>
            <a
              href="#"
              onClick={(e) => handleAnchor(e, "#")}
              className="group inline-flex items-center gap-1.5 hover:text-[#008767] transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" /> Kembali ke atas
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
