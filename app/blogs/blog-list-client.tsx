"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Lightbulb,
  Loader2Icon,
  Newspaper,
  Search,
  TrendingUp,
  X,
} from "lucide-react"

import { Reveal } from "@/components/reveal"
import { Skeleton } from "@/components/ui/skeleton"
import {
  fetchBlogPosts,
  formatBlogDate,
  type BlogCategory,
  type BlogListItem,
  type BlogPagination,
} from "@/lib/blog-api"

const PAGE_SIZE = 13

/** Soft palette so categories are tellable apart; picked by hashing the slug so it stays stable. */
const TONES = [
  { badge: "bg-emerald-100 text-emerald-700", media: "from-emerald-100 via-teal-50 to-white" },
  { badge: "bg-sky-100 text-sky-700", media: "from-sky-100 via-cyan-50 to-white" },
  { badge: "bg-amber-100 text-amber-700", media: "from-amber-100 via-orange-50 to-white" },
  { badge: "bg-violet-100 text-violet-700", media: "from-violet-100 via-fuchsia-50 to-white" },
  { badge: "bg-rose-100 text-rose-700", media: "from-rose-100 via-pink-50 to-white" },
  { badge: "bg-teal-100 text-teal-700", media: "from-teal-100 via-emerald-50 to-white" },
]

function toneFor(slug: string | undefined) {
  if (!slug) return TONES[0]
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0
  return TONES[h % TONES.length]
}

function CategoryBadge({ name, slug, overlay = false }: { name: string; slug?: string; overlay?: boolean }) {
  const tone = toneFor(slug)
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${tone.badge} ${
        overlay ? "backdrop-blur-sm shadow-sm ring-1 ring-white/60" : ""
      }`}
    >
      {name}
    </span>
  )
}

function CardMedia({ post, className = "" }: { post: BlogListItem; className?: string }) {
  if (post.featured_image?.url) {
    return (
      <img
        src={post.featured_image.url}
        alt={post.featured_image.alt || post.title}
        loading="lazy"
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }
  const tone = toneFor(post.categories?.[0]?.slug)
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${tone.media} ${className}`}>
      <BookOpen className="h-10 w-10 text-[#008767]/30" />
    </div>
  )
}

function Byline({ post, light = false }: { post: BlogListItem; light?: boolean }) {
  const name = post.author?.name
  return (
    <div className={`flex items-center gap-2 text-xs ${light ? "text-white/80" : "text-slate-500"}`}>
      {name && (
        <>
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
              light ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {name.charAt(0).toUpperCase()}
          </span>
          <span className="truncate font-medium">{name}</span>
          <span aria-hidden="true">·</span>
        </>
      )}
      {post.published_at && <span className="shrink-0">{formatBlogDate(post.published_at)}</span>}
    </div>
  )
}

function FeaturedCard({ post }: { post: BlogListItem }) {
  const category = post.categories?.[0]
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-3xl bg-slate-900 shadow-lg shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/20 active:scale-[0.99] lg:min-h-[26rem]"
    >
      <div className="absolute inset-0">
        <CardMedia post={post} className="transition-transform duration-700 group-hover:scale-105" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/5" />

      <div className="relative space-y-3 p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-3">
          {category && <CategoryBadge name={category.name} slug={category.slug} overlay />}
          {post.published_at && (
            <span className="text-xs font-semibold uppercase tracking-wide text-white/75">
              {formatBlogDate(post.published_at)}
            </span>
          )}
        </div>
        <h3 className="text-2xl font-extrabold leading-tight text-white sm:text-[1.7rem]">{post.title}</h3>
        {post.excerpt && <p className="line-clamp-2 text-sm leading-relaxed text-white/80">{post.excerpt}</p>}
        <span className="mt-1 inline-flex items-center gap-2 rounded-lg border border-white/70 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 group-hover:border-white group-hover:bg-white group-hover:text-slate-900">
          Baca Selengkapnya
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}

/** Compact numbered row for the stack beside the featured article. */
function SideRow({ post, index }: { post: BlogListItem; index: number }) {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group flex flex-1 items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/10 active:scale-[0.98]"
    >
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-36">
        <CardMedia post={post} className="transition-transform duration-500 group-hover:scale-110" />
      </div>
      <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-[#008767] transition-colors duration-300 group-hover:bg-[#008767] group-hover:text-white sm:flex">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        {post.published_at && (
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {formatBlogDate(post.published_at)}
          </span>
        )}
        <h3 className="line-clamp-3 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#008767] sm:text-[15px]">
          {post.title}
        </h3>
      </div>
      <ArrowRight className="mr-1 h-4 w-4 shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#008767]" />
    </Link>
  )
}

function GridCard({ post }: { post: BlogListItem }) {
  const category = post.categories?.[0]
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/10 active:scale-[0.98]"
    >
      <div className="relative aspect-16/10 w-full overflow-hidden">
        <CardMedia post={post} className="transition-transform duration-500 group-hover:scale-110" />
        {category && (
          <span className="absolute left-3 top-3">
            <CategoryBadge name={category.name} slug={category.slug} overlay />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#008767]">
          {post.title}
        </h3>
        {post.excerpt && <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{post.excerpt}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <Byline post={post} />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#008767] transition-all duration-300 group-hover:-rotate-45 group-hover:bg-[#008767] group-hover:text-white">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat artikel">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Skeleton className="min-h-[22rem] rounded-3xl lg:min-h-[26rem]" />
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="min-h-[7rem] flex-1 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

export default function BlogListClient({
  initialPosts,
  initialPagination,
  categories,
}: {
  initialPosts: BlogListItem[]
  initialPagination: BlogPagination
  categories: BlogCategory[]
}) {
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<string>("")
  const [posts, setPosts] = React.useState(initialPosts)
  const [pagination, setPagination] = React.useState(initialPagination)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const isFirstRun = React.useRef(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  React.useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    let cancelled = false
    setIsLoading(true)
    fetchBlogPosts({ limit: PAGE_SIZE, search: debouncedSearch || undefined, categorySlug: activeCategory || undefined })
      .then((res) => {
        if (cancelled) return
        setPosts(res.data)
        setPagination(res.pagination)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedSearch, activeCategory])

  async function loadMore() {
    setIsLoadingMore(true)
    const res = await fetchBlogPosts({
      page: pagination.page + 1,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      categorySlug: activeCategory || undefined,
    })
    setPosts((prev) => [...prev, ...res.data])
    setPagination(res.pagination)
    setIsLoadingMore(false)
  }

  function resetFilters() {
    setSearch("")
    setDebouncedSearch("")
    setActiveCategory("")
  }

  const [featured, ...rest] = posts
  const sideCards = rest.slice(0, 3)
  const gridCards = rest.slice(3)
  const isFiltered = Boolean(debouncedSearch || activeCategory)
  const activeCategoryName = categories.find((c) => c.slug === activeCategory)?.name
  const heroChips = (categories.length > 0 ? categories.slice(0, 3).map((c) => c.name) : ["Panduan", "Insight", "Cerita"]).slice(0, 3)
  const chipIcons = [BookOpen, Lightbulb, TrendingUp]

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e4f5ee] via-[#f2faf7] to-white">
        <div aria-hidden="true" className="bis-blob pointer-events-none absolute -left-32 -top-24 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl" />
        <div aria-hidden="true" className="bis-blob pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl [animation-delay:-6s]" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-6 lg:px-8 lg:pb-16">
          <div className="space-y-6">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#c4ebde] bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#008767] shadow-xs backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="bis-ring absolute inset-0 rounded-full bg-[#008767]" />
                  <span className="relative h-2 w-2 rounded-full bg-[#008767]" />
                </span>
                Blog Katamereka
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
                Insight, panduan, dan cerita{" "}
                <span className="bg-gradient-to-r from-[#008767] to-[#12b08a] bg-clip-text text-transparent">
                  seputar bisnis.
                </span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="max-w-lg text-base leading-relaxed text-slate-600">
                Temukan berbagai artikel, tips, dan kisah inspiratif untuk membantu Anda menemukan bisnis terbaik dan membuat keputusan yang lebih baik.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <label className="group relative block max-w-md">
                <span className="sr-only">Cari artikel</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#008767]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari artikel, topik, atau kategori..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-11 text-sm text-slate-700 shadow-md shadow-slate-900/5 outline-none transition-all focus:border-[#008767] focus:shadow-lg focus:ring-4 focus:ring-[#008767]/15"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Hapus pencarian"
                    className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 active:scale-90"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </label>
            </Reveal>
          </div>

          {/* Decorative panel */}
          <Reveal delay={200} className="hidden lg:block">
            <div className="relative mx-auto aspect-square w-full max-w-[28rem]">
              <div className="absolute inset-6 rounded-[2.5rem] bg-gradient-to-br from-[#006b53] via-[#008767] to-[#12b08a] shadow-2xl shadow-emerald-900/25" />
              <div className="absolute inset-6 overflow-hidden rounded-[2.5rem]">
                <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
                <div className="absolute -bottom-12 -left-8 h-56 w-56 rounded-full bg-white/10" />
              </div>
              <div className="bis-float absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl bg-white/15 text-white ring-1 ring-white/30 backdrop-blur">
                <Newspaper className="h-12 w-12" strokeWidth={1.5} />
              </div>
              {heroChips.map((label, i) => {
                const Icon = chipIcons[i % chipIcons.length]
                const positions = ["left-0 top-[14%]", "right-0 top-[38%]", "left-[6%] bottom-[10%]"]
                return (
                  <span
                    key={label + i}
                    style={{ animationDelay: `${-i * 2}s` }}
                    className={`bis-float-slow absolute ${positions[i]} inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-xl shadow-slate-900/10 ring-1 ring-slate-100`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-[#008767]">
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </span>
                )
              })}
            </div>
          </Reveal>
        </div>
      </section>

      <div className="relative mx-auto max-w-7xl space-y-10 px-4 pb-16 sm:px-6 lg:px-8">
        {/* ===== CATEGORY BAR ===== */}
        {categories.length > 0 && (
          <div className="sticky top-16 z-30 -mx-4 border-b border-slate-200/60 bg-white/80 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist" aria-label="Kategori artikel">
              {[{ id: "all", name: "Semua", slug: "" }, ...categories].map((c) => {
                const active = activeCategory === c.slug
                return (
                  <button
                    key={c.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveCategory(c.slug)}
                    className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                      active
                        ? "bg-[#008767] text-white shadow-md shadow-emerald-900/20"
                        : "border border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-[#008767]/50 hover:text-[#008767]"
                    }`}
                  >
                    {c.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ===== STATUS LINE ===== */}
        {isFiltered && !isLoading && (
          <div className="bis-pop flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>
              Menampilkan <b className="text-slate-800">{pagination.total}</b> artikel
              {activeCategoryName && <> di <b className="text-slate-800">{activeCategoryName}</b></>}
              {debouncedSearch && <> untuk “<b className="text-slate-800">{debouncedSearch}</b>”</>}
            </span>
            <button
              onClick={resetFilters}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
            >
              <X className="h-3 w-3" /> Reset
            </button>
          </div>
        )}

        {/* ===== CONTENT ===== */}
        {isLoading ? (
          <ListSkeleton />
        ) : posts.length === 0 ? (
          <div className="bis-pop flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#008767]">
              <Search className="h-6 w-6" />
            </span>
            <p className="text-base font-semibold text-slate-700">Belum ada artikel yang cocok.</p>
            <p className="text-sm text-slate-400">Coba kata kunci atau kategori lain.</p>
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="mt-2 cursor-pointer rounded-xl bg-[#008767] px-5 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#007458] active:scale-95"
              >
                Lihat semua artikel
              </button>
            )}
          </div>
        ) : (
          <>
            {featured && (
              <section className="space-y-5">
                <Reveal>
                  <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900 sm:text-2xl">
                    <span className="h-6 w-1.5 rounded-full bg-[#008767]" />
                    Sorotan Utama
                  </h2>
                </Reveal>
                <div className={`grid grid-cols-1 gap-5 ${sideCards.length > 0 ? "lg:grid-cols-2" : ""}`}>
                  <Reveal className="h-full">
                    <FeaturedCard post={featured} />
                  </Reveal>
                  {sideCards.length > 0 && (
                    <div className="flex flex-col gap-4">
                      {sideCards.map((p, i) => (
                        <Reveal key={p.id} delay={120 + i * 100} className="flex flex-1 flex-col">
                          <SideRow post={p} index={i} />
                        </Reveal>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {gridCards.length > 0 && (
              <section className="space-y-5">
                <Reveal>
                  <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900 sm:text-2xl">
                    <span className="h-6 w-1.5 rounded-full bg-[#008767]" />
                    Artikel Terbaru
                  </h2>
                </Reveal>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {gridCards.map((p, i) => (
                    <Reveal key={p.id} delay={(i % 3) * 90} className="h-full">
                      <GridCard post={p} />
                    </Reveal>
                  ))}
                </div>
              </section>
            )}

            {pagination.page < pagination.total_pages && (
              <div className="flex flex-col items-center gap-2 pt-2">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#008767] px-7 py-3 text-sm font-bold text-white shadow-md shadow-emerald-900/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#007458] hover:shadow-lg active:translate-y-0 active:scale-95 disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isLoadingMore ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 rotate-90 transition-transform group-hover:translate-y-0.5" />
                  )}
                  Muat Lebih Banyak
                </button>
                <span className="text-xs text-slate-400">
                  {posts.length} dari {pagination.total} artikel
                </span>
              </div>
            )}
          </>
        )}

        {/* ===== CTA ===== */}
        <Reveal>
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#006b53] via-[#008767] to-[#12b08a] px-6 py-10 shadow-xl shadow-emerald-900/20 sm:px-12">
            <div aria-hidden="true" className="bis-blob pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
            <div aria-hidden="true" className="bis-blob pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-emerald-300/20 blur-2xl [animation-delay:-5s]" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Siap menemukan bisnis terbaik?
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-emerald-50/90">
                  Baca ulasan nyata dari pelanggan lain dan bandingkan bisnis sebelum Anda memutuskan.
                </p>
              </div>
              <Link
                href="/businesses"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#008767] shadow-lg shadow-emerald-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 active:translate-y-0 active:scale-95"
              >
                Jelajahi Bisnis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </>
  )
}
