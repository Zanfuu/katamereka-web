"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  BadgeCheckIcon,
  BuildingIcon,
  DownloadIcon,
  EyeOffIcon,
  FlagIcon,
  HomeIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SearchIcon,
  StarIcon,
  ThumbsUpIcon,
  Trash2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { DateRangeSelector, type DateRangeValue } from "@/components/date-range-selector"
import { FilterDropdown } from "@/components/filter-dropdown"
import { PageHeader } from "@/components/page-header"
import { RatingStars } from "@/components/rating-stars"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { SearchInput } from "@/components/search-input"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateTime } from "@/lib/format"
import {
  fetchAdminReviews,
  updateAdminReviewStatus,
  deleteAdminReview,
  type AdminReviewItem,
} from "@/lib/admin-api"
import { resolveMediaUrl } from "@/lib/api-client"

const TABS = [
  { value: "all", label: "Semua" },
  { value: "PUBLISHED", label: "Published" },
  { value: "HIDDEN", label: "Hidden" },
  { value: "REMOVED", label: "Removed" },
] as const

const RATING_OPTIONS = [
  { value: "all", label: "Semua Rating" },
  { value: "5", label: "5 Bintang" },
  { value: "4", label: "4 Bintang" },
  { value: "3", label: "3 Bintang" },
  { value: "2", label: "2 Bintang" },
  { value: "1", label: "1 Bintang" },
]

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "PUBLISHED", label: "Published" },
  { value: "HIDDEN", label: "Hidden" },
  { value: "REMOVED", label: "Removed" },
]

const AVATAR_TONES = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-purple-100 text-purple-700",
  "bg-cyan-100 text-cyan-700",
]

function initials(name?: string | null) {
  if (!name) return "U"
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase()
}

function avatarTone(id?: string | null) {
  if (!id) return AVATAR_TONES[0]
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % AVATAR_TONES.length
  return AVATAR_TONES[hash]
}

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50]

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1])
  const sorted = Array.from(pages)
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b)

  const result: (number | "ellipsis")[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push("ellipsis")
    }
    result.push(sorted[i])
  }
  return result
}

export default function AdminGlobalReviewsPage() {
  const [reviews, setReviews] = React.useState<AdminReviewItem[]>([])
  const [meta, setMeta] = React.useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  })
  const [limit, setLimit] = React.useState(20)

  // Status breakdown across whole database
  const [statusCounts, setStatusCounts] = React.useState({
    total: 0,
    published: 0,
    hidden: 0,
    removed: 0,
  })

  // Filter states
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [businessName, setBusinessName] = React.useState("")
  const [debouncedBusinessName, setDebouncedBusinessName] = React.useState("")
  const [tab, setTab] = React.useState<string>("all")
  const [ratingFilter, setRatingFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [dateRange, setDateRange] = React.useState<DateRangeValue>({ preset: "30d" })
  const [apiPage, setApiPage] = React.useState(1)

  // Loading & refresh states
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [refreshTick, setRefreshTick] = React.useState(0)

  // Interaction states
  const [detail, setDetail] = React.useState<AdminReviewItem | null>(null)
  const [action, setAction] = React.useState<{
    review: AdminReviewItem
    type: "HIDE" | "RESTORE" | "DELETE"
  } | null>(null)
  const [isSubmittingAction, setIsSubmittingAction] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setApiPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Debounce business name filter
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusinessName(businessName)
      setApiPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [businessName])

  // Sync tab with statusFilter
  const handleTabChange = (newTab: string) => {
    setTab(newTab)
    setStatusFilter(newTab)
    setApiPage(1)
  }

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus)
    setTab(newStatus)
    setApiPage(1)
  }

  const handleRatingFilterChange = (newRating: string) => {
    setRatingFilter(newRating)
    setApiPage(1)
  }

  const handleDateRangeChange = (rangeVal: DateRangeValue) => {
    setDateRange(rangeVal)
    setApiPage(1)
  }

  function resetFilters() {
    setSearch("")
    setDebouncedSearch("")
    setBusinessName("")
    setDebouncedBusinessName("")
    setTab("all")
    setRatingFilter("all")
    setStatusFilter("all")
    setDateRange({ preset: "30d" })
    setApiPage(1)
    setLimit(20)
  }

  // Fetch reviews from API
  React.useEffect(() => {
    let active = true

    async function loadReviews() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchAdminReviews({
          page: apiPage,
          limit: limit,
          search: debouncedSearch || undefined,
          businessName: debouncedBusinessName || undefined,
          rating: ratingFilter !== "all" ? parseInt(ratingFilter, 10) : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        })

        if (!active) return

        if (res && res.data) {
          setReviews(res.data)
          if (res.meta) {
            setMeta(res.meta)
          }
        }
      } catch (err: any) {
        if (!active) return
        console.error("Gagal mengambil daftar ulasan admin:", err)
        setError(err.message || "Gagal memuat data ulasan")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadReviews()

    return () => {
      active = false
    }
  }, [
    apiPage,
    limit,
    debouncedSearch,
    debouncedBusinessName,
    ratingFilter,
    statusFilter,
    dateRange,
    refreshTick,
  ])

  // Ambil ringkasan status ulasan nasional secara akurat (PUBLISHED = Total - Hidden - Removed)
  React.useEffect(() => {
    let active = true

    async function loadStatusCounts() {
      try {
        const [allRes, hiddenRes, removedRes] = await Promise.all([
          fetchAdminReviews({
            limit: 1,
            search: debouncedSearch || undefined,
            businessName: debouncedBusinessName || undefined,
            rating: ratingFilter !== "all" ? parseInt(ratingFilter, 10) : undefined,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          }),
          fetchAdminReviews({
            status: "HIDDEN",
            limit: 1,
            search: debouncedSearch || undefined,
            businessName: debouncedBusinessName || undefined,
            rating: ratingFilter !== "all" ? parseInt(ratingFilter, 10) : undefined,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          }),
          fetchAdminReviews({
            status: "REMOVED",
            limit: 1,
            search: debouncedSearch || undefined,
            businessName: debouncedBusinessName || undefined,
            rating: ratingFilter !== "all" ? parseInt(ratingFilter, 10) : undefined,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          }),
        ])

        if (!active) return

        const total = allRes?.meta?.total ?? 0
        const hidden = hiddenRes?.meta?.total ?? 0
        const removed = removedRes?.meta?.total ?? 0
        // Published sama dengan total review, terkecuali ada yang di-hidden dan removed
        const published = Math.max(0, total - (hidden + removed))

        setStatusCounts({
          total,
          published,
          hidden,
          removed,
        })
      } catch (err) {
        console.error("Gagal memuat ringkasan status ulasan:", err)
      }
    }

    loadStatusCounts()

    return () => {
      active = false
    }
  }, [
    debouncedSearch,
    debouncedBusinessName,
    ratingFilter,
    dateRange,
    refreshTick,
  ])

  // Count helper for tabs and stat cards
  const counts = statusCounts

  // Handle moderation confirm
  async function handleConfirmAction() {
    if (!action) return
    setIsSubmittingAction(true)
    try {
      if (action.type === "DELETE") {
        const res = await deleteAdminReview(action.review.id)
        toast.success(res.message || "Ulasan berhasil dihapus secara permanen.")
      } else {
        const nextStatus = action.type === "HIDE" ? "HIDDEN" : "PUBLISHED"
        const res = await updateAdminReviewStatus(action.review.id, nextStatus)
        toast.success(
          res.message ||
            (nextStatus === "HIDDEN"
              ? "Ulasan berhasil disembunyikan."
              : "Ulasan berhasil dipulihkan.")
        )
      }
      setAction(null)
      setDetail(null)
      setRefreshTick((t) => t + 1)
    } catch (err: any) {
      toast.error(err?.message || "Gagal memproses tindakan pada ulasan")
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const columns: ResourceTableColumn<AdminReviewItem>[] = [
    {
      key: "reviewerName",
      header: "Reviewer",
      render: (review) => {
        const name = review.user?.name || "Pengguna Anonim"
        const email = review.user?.email || "-"
        return (
          <div className="flex items-center gap-2.5">
            <Avatar size="sm">
              <AvatarFallback className={avatarTone(review.user?.id || review.id)}>
                {initials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">{name}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: "businessName",
      header: "Bisnis",
      render: (review) => {
        const name = review.business?.name || "Bisnis Tidak Diketahui"
        const category = review.business?.category || null
        const city = review.business?.city || null
        return (
          <div className="flex items-center gap-2.5">
            <Avatar size="sm">
              <AvatarFallback className={avatarTone(review.business?.id || review.id)}>
                {initials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">{name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {category} {city ? `• ${city}` : ""}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: "rating",
      header: "Rating",
      render: (review) => <RatingStars rating={review.rating} size="sm" />,
    },
    {
      key: "content",
      header: "Review",
      render: (review) => (
        <div className="max-w-xs space-y-0.5">
          {review.title && (
            <p className="font-semibold text-xs text-foreground truncate">{review.title}</p>
          )}
          <p className="line-clamp-2 text-xs text-muted-foreground">{review.content}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (review) => <StatusBadge status={review.status} />,
    },
    {
      key: "helpfulCount",
      header: "Helpful",
      render: (review) => (
        <span className="text-xs font-semibold text-foreground/80 flex items-center gap-1">
          <ThumbsUpIcon className="size-3 text-[#008767]" />
          <span>{review.helpfulCount || 0}</span>
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Tanggal",
      render: (review) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDateTime(review.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (review) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <FlagIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDetail(review)}>
                Lihat Detail
              </DropdownMenuItem>
              {review.business?.slug && (
                <DropdownMenuItem
                  render={
                    <Link
                      href={`/business/${review.business.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  Buka Halaman Bisnis
                </DropdownMenuItem>
              )}
              {review.status === "PUBLISHED" && (
                <DropdownMenuItem onClick={() => setAction({ review, type: "HIDE" })}>
                  <EyeOffIcon className="size-4" />
                  Sembunyikan (Hide)
                </DropdownMenuItem>
              )}
              {review.status === "HIDDEN" && (
                <DropdownMenuItem onClick={() => setAction({ review, type: "RESTORE" })}>
                  <RotateCcwIcon className="size-4" />
                  Pulihkan (Publish)
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setAction({ review, type: "DELETE" })}
              >
                <Trash2Icon className="size-4" />
                Hapus Permanen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/admin" />}>
              <HomeIcon className="size-3.5" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Reviews</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Review Management"
        description="Kelola seluruh ulasan nasional di platform KataMereka. Pantau kualitas ulasan, cari berdasarkan filter, dan tindak lanjuti moderasi konten."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefreshTick((t) => t + 1)}
              disabled={isLoading}
            >
              <RefreshCwIcon className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
              Segarkan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Data review berhasil diexport.")}
            >
              <DownloadIcon className="size-4" />
              Export Data
            </Button>
          </div>
        }
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          label="Total Review"
          value={(counts.total || meta.total).toLocaleString("id-ID")}
          delta={`Halaman ${meta.page} dari ${meta.totalPages}`}
          hint="ulasan tersimpan"
          icon={StarIcon}
          onClick={() => handleTabChange("all")}
        />
        <StatCard
          label="Published"
          value={counts.published.toLocaleString("id-ID")}
          delta="Aktif"
          hint="tampil di publik"
          onClick={() => handleTabChange("PUBLISHED")}
        />
        <StatCard
          label="Hidden"
          value={counts.hidden.toLocaleString("id-ID")}
          deltaTone="neutral"
          hint="disembunyikan"
          iconTone="warning"
          onClick={() => handleTabChange("HIDDEN")}
        />
        <StatCard
          label="Removed"
          value={counts.removed.toLocaleString("id-ID")}
          deltaTone="negative"
          hint="dihapus / dinonaktifkan"
          iconTone="destructive"
          onClick={() => handleTabChange("REMOVED")}
        />
      </div>

      {/* Tabs Filter */}
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList variant="line">
          {TABS.map((t) => {
            const tabCount =
              t.value === "all"
                ? counts.total || meta.total
                : t.value === "PUBLISHED"
                ? counts.published
                : t.value === "HIDDEN"
                ? counts.hidden
                : counts.removed
            return (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
                <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground font-semibold">
                  {tabCount.toLocaleString("id-ID")}
                </span>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {/* Baris Kotak Pencarian & Filter Lengkap */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-2">
          {/* Cari kata kunci teks / judul */}
          <div className="w-full sm:max-w-xs">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Cari teks ulasan / judul..."
            />
          </div>
          {/* Filter nama bisnis */}
          <div className="relative w-full sm:max-w-xs">
            <BuildingIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Filter nama toko / bisnis..."
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Rating"
            options={RATING_OPTIONS}
            value={ratingFilter}
            onChange={handleRatingFilterChange}
          />
          <FilterDropdown
            label="Status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={handleStatusFilterChange}
          />
          <DateRangeSelector
            defaultValue={dateRange.preset || "30d"}
            onChange={handleDateRangeChange}
          />
          <Button variant="outline" size="sm" onClick={resetFilters} title="Reset semua filter">
            <RotateCcwIcon className="size-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => setRefreshTick((t) => t + 1)}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Tabel Ulasan Nasional */}
      <ResourceTable
        data={reviews}
        columns={columns}
        getRowId={(review) => review.id}
        onRowClick={(review) => setDetail(review)}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onToggleRow={(id, checked) =>
          setSelectedIds((prev) => {
            const next = new Set(prev)
            if (checked) next.add(id)
            else next.delete(id)
            return next
          })
        }
        onToggleAll={(checked) =>
          setSelectedIds(checked ? new Set(reviews.map((r) => r.id)) : new Set())
        }
        itemLabel="ulasan"
        hidePagination={true}
        emptyTitle="Tidak ada review ditemukan."
        emptyDescription="Coba ubah kata kunci pencarian atau sesuaikan filter rentang tanggal dan status."
      />

      {/* Paginasi & Filter Dropdown Data per Halaman */}
      {!isLoading && meta.total > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          {/* Info range ulasan yang ditampilkan */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>
              Menampilkan{" "}
              <strong className="text-foreground">
                {(meta.page - 1) * meta.limit + 1}
              </strong>
              –
              <strong className="text-foreground">
                {Math.min(meta.page * meta.limit, meta.total)}
              </strong>{" "}
              dari <strong className="text-foreground">{meta.total.toLocaleString("id-ID")}</strong> ulasan
            </span>
            <span>•</span>
            <span>
              Halaman <strong className="text-foreground">{meta.page}</strong> dari{" "}
              <strong className="text-foreground">{meta.totalPages}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Dropdown 10 20 30 40 50 */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>Tampilkan</span>
              <Select
                value={String(limit)}
                onValueChange={(val) => {
                  setLimit(Number(val))
                  setApiPage(1)
                }}
              >
                <SelectTrigger size="sm" className="w-[4.75rem] h-8 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={String(opt)}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>per halaman</span>
            </div>

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0"
                  disabled={apiPage <= 1}
                  onClick={() => setApiPage((p) => Math.max(1, p - 1))}
                  title="Halaman sebelumnya"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeftIcon className="size-4" />
                </Button>

                {getPageNumbers(meta.page, meta.totalPages).map((item, idx) =>
                  item === "ellipsis" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="flex size-8 items-center justify-center text-xs text-muted-foreground"
                    >
                      …
                    </span>
                  ) : (
                    <Button
                      key={item}
                      variant={item === meta.page ? "default" : "outline"}
                      size="sm"
                      className="size-8 p-0 text-xs font-semibold"
                      onClick={() => setApiPage(item)}
                    >
                      {item}
                    </Button>
                  )
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0"
                  disabled={apiPage >= meta.totalPages}
                  onClick={() => setApiPage((p) => Math.min(meta.totalPages, p + 1))}
                  title="Halaman selanjutnya"
                  aria-label="Halaman selanjutnya"
                >
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sheet Detail Review */}
      <Sheet open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{detail?.user?.name || "Detail Ulasan"}</SheetTitle>
            <SheetDescription>{detail?.business?.name || "Bisnis"}</SheetDescription>
          </SheetHeader>
          {detail && (
            <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
              <section>
                <div className="flex items-center justify-between">
                  <RatingStars rating={detail.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(detail.createdAt)}
                  </span>
                </div>
                {detail.title && (
                  <h4 className="mt-2 text-sm font-bold text-foreground">{detail.title}</h4>
                )}
                <p className="mt-1.5 rounded-xl border border-border bg-muted/30 p-3 text-sm text-foreground/90 leading-relaxed">
                  {detail.content}
                </p>

                {/* Review Photos */}
                {detail.photos && detail.photos.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                      Foto Lampiran ({detail.photos.length}):
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {detail.photos.map((photo, i) => (
                        <a
                          key={i}
                          href={resolveMediaUrl(photo)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="overflow-hidden rounded-lg border border-border aspect-square bg-slate-100 block"
                        >
                          <img
                            src={resolveMediaUrl(photo)}
                            alt={`Lampiran ${i + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <section className="flex flex-col gap-2 rounded-xl border border-border p-3 text-sm bg-card">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reviewer</span>
                  <span className="font-semibold text-foreground">
                    {detail.user?.name || "Pengguna"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email Reviewer</span>
                  <span className="font-medium text-foreground">{detail.user?.email || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bisnis Terkait</span>
                  <span className="font-semibold text-primary">{detail.business?.name || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Kategori & Kota</span>
                  <span className="text-foreground">
                    {detail.business?.category || "-"} • {detail.business?.city || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status Moderasi</span>
                  <StatusBadge status={detail.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ditandai Bermanfaat</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <ThumbsUpIcon className="size-3 text-[#008767]" />
                    <span>{detail.helpfulCount || 0} orang</span>
                  </span>
                </div>
              </section>

              {/* Balasan Resmi Bisnis */}
              {detail.reply && (
                <section>
                  <h3 className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Balasan Resmi Bisnis
                  </h3>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                    <p className="text-xs text-foreground/90 leading-relaxed">
                      {typeof detail.reply === "string" ? detail.reply : detail.reply.content}
                    </p>
                    {typeof detail.reply !== "string" && detail.reply.createdAt && (
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Dibalas pada: {formatDateTime(detail.reply.createdAt)}
                      </p>
                    )}
                  </div>
                </section>
              )}

              {/* Action Buttons in Sheet */}
              <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-border">
                {detail.status === "PUBLISHED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAction({ review: detail, type: "HIDE" })
                      setDetail(null)
                    }}
                  >
                    <EyeOffIcon className="size-4" />
                    Sembunyikan
                  </Button>
                )}
                {detail.status === "HIDDEN" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAction({ review: detail, type: "RESTORE" })
                      setDetail(null)
                    }}
                  >
                    <RotateCcwIcon className="size-4" />
                    Pulihkan (Publish)
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setAction({ review: detail, type: "DELETE" })
                    setDetail(null)
                  }}
                >
                  <Trash2Icon className="size-4" />
                  Hapus Permanen
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog Konfirmasi Moderasi & Hapus */}
      <ConfirmDialog
        open={!!action}
        onOpenChange={(open) => !open && !isSubmittingAction && setAction(null)}
        title={
          action?.type === "HIDE"
            ? `Sembunyikan ulasan ini?`
            : action?.type === "RESTORE"
              ? `Pulihkan ulasan ini ke Published?`
              : `Hapus permanen ulasan ini?`
        }
        description={
          action?.type === "HIDE"
            ? "Ulasan yang disembunyikan tidak akan tampil di profil bisnis publik namun tetap tersimpan di riwayat admin."
            : action?.type === "RESTORE"
              ? "Ulasan akan kembali berstatus PUBLISHED dan terlihat oleh seluruh pengunjung platform."
              : "Tindakan ini akan menghapus ulasan selamanya dari database dan tidak dapat dipulihkan."
        }
        confirmLabel={
          isSubmittingAction
            ? "Memproses..."
            : action?.type === "HIDE"
              ? "Sembunyikan"
              : action?.type === "RESTORE"
                ? "Pulihkan"
                : "Hapus Permanen"
        }
        variant={action?.type === "RESTORE" ? "default" : "destructive"}
        requireReason={action?.type === "HIDE"}
        reasonLabel="Alasan moderasi ulasan"
        onConfirm={handleConfirmAction}
      />
    </div>
  )
}
