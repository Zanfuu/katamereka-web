"use client"

import * as React from "react"
import {
  DownloadIcon,
  FlagIcon,
  MessageSquareTextIcon,
  SlidersHorizontalIcon,
  StarIcon,
} from "lucide-react"
import { toast } from "sonner"

import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"
import { DateRangeSelector } from "@/components/date-range-selector"
import { FilterDropdown } from "@/components/filter-dropdown"
import { PageHeader } from "@/components/page-header"
import { RatingStars } from "@/components/rating-stars"
import { ReplyDialog } from "@/components/reply-dialog"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { SearchInput } from "@/components/search-input"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { downloadCsv } from "@/lib/csv"
import { formatDateTime } from "@/lib/format"
import { useAuth } from "@/lib/auth-context"
import {
  createReviewReply,
  fetchDashboardReviews,
  fetchMyBusinessDetail,
  fetchMyBusinesses,
  fetchReviewReportsSummary,
  type ApiDashboardReview,
  type DashboardReviewSource,
  type DashboardReviewsQuery,
} from "@/lib/api-business-dashboard"
import {
  fetchBusinessReviewAiSummary,
  type ApiBusinessReviewAiSummary,
} from "@/lib/api-client"
import { AiReviewSummaryCard } from "@/components/review/ai-review-summary-card"
import { useBusinessContext } from "@/components/business-provider"
import type { ModerationStatus, Review } from "@/lib/types"

// This page is the one menu wired to the real backend — everything else in
// the dashboard still runs on the mock BusinessProvider (see business-provider.tsx),
// so it resolves its own active business via /my-businesses instead of
// useBusinessContext(), which would hand it a fake mock id like "b1".
interface ActiveBusiness {
  id: string
  name: string
  slug: string
  averageRating: number
  totalReviews: number
}

const TABS = [
  { value: "all", label: "Semua" },
  { value: "unreplied", label: "Belum Dibalas" },
  { value: "reported", label: "Dilaporkan" },
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
  { value: "Dibalas", label: "Dibalas" },
  { value: "Belum Dibalas", label: "Belum Dibalas" },
  { value: "Dilaporkan", label: "Dilaporkan" },
]

const VERIFIED_OPTIONS = [
  { value: "all", label: "Semua Verifikasi" },
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Unverified" },
]

const SOURCE_LABEL: Record<DashboardReviewSource, "Google" | "Website" | "KataMereka"> = {
  GOOGLE: "Google",
  WEBSITE: "Website",
  KATAMEREKA: "KataMereka",
}

function reviewStatus(review: Review): "Dibalas" | "Belum Dibalas" | "Dilaporkan" {
  if (review.reportCount > 0) return "Dilaporkan"
  if (review.reply) return "Dibalas"
  return "Belum Dibalas"
}

function moderationStatusOf(review: ApiDashboardReview): ModerationStatus {
  if (review.status === "HIDDEN") return "HIDDEN"
  if (review.status === "REMOVED") return "REMOVED"
  if (review.report_count > 0) return "UNDER_INVESTIGATION"
  return "KEPT"
}

function mapApiReviewToUiReview(r: ApiDashboardReview, business: ActiveBusiness): Review {
  return {
    id: r.id,
    businessId: business.id,
    businessName: business.name,
    reviewerId: r.user?.id ?? "",
    reviewerName: r.user?.name ?? "Pengguna KataMereka",
    rating: Math.min(5, Math.max(1, r.rating)) as 1 | 2 | 3 | 4 | 5,
    content: r.content,
    isVerified: r.is_verified,
    status: r.status,
    moderationStatus: moderationStatusOf(r),
    reportCount: r.report_count,
    source: SOURCE_LABEL[r.source],
    reply: r.reply
      ? {
          content: r.reply.content,
          repliedAt: r.reply.created_at,
          repliedBy: r.reply.author?.name ?? "Admin Bisnis",
        }
      : undefined,
    createdAt: r.created_at,
  }
}

export default function DashboardReviewsPage() {
  const { isLoggedIn } = useAuth()
  const { selectedBusiness, isLoading: isBusinessLoading } = useBusinessContext()

  const activeBusiness = React.useMemo<ActiveBusiness | null>(() => {
    if (!selectedBusiness) return null
    return {
      id: selectedBusiness.id,
      name: selectedBusiness.name,
      slug: selectedBusiness.slug,
      averageRating: Number(selectedBusiness.averageRating ?? 0) || 0,
      totalReviews: Number(selectedBusiness.totalReviews ?? 0) || 0,
    }
  }, [selectedBusiness])

  const [tab, setTab] = React.useState<string>("all")
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [ratingFilter, setRatingFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [verifiedFilter, setVerifiedFilter] = React.useState("all")
  const [advancedOpen, setAdvancedOpen] = React.useState(false)
  const [sourceFilter, setSourceFilter] = React.useState("all")
  const [detailReview, setDetailReview] = React.useState<Review | null>(null)

  const [apiReviews, setApiReviews] = React.useState<ApiDashboardReview[]>([])
  const [aiSummary, setAiSummary] = React.useState<ApiBusinessReviewAiSummary | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | undefined>()
  const [unrepliedCount, setUnrepliedCount] = React.useState(0)
  const [reportedCount, setReportedCount] = React.useState(0)
  const [refreshKey, setRefreshKey] = React.useState(0)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  const businessId = activeBusiness?.id

  const query = React.useMemo<DashboardReviewsQuery>(() => {
    const reported = tab === "reported" || statusFilter === "Dilaporkan"
    let reply_status: DashboardReviewsQuery["reply_status"] = "ALL"
    if (tab === "unreplied" || statusFilter === "Belum Dibalas") reply_status = "UNREPLIED"
    else if (statusFilter === "Dibalas") reply_status = "REPLIED"

    return {
      limit: 200,
      sort: "NEWEST",
      rating: ratingFilter !== "all" ? Number(ratingFilter) : undefined,
      reply_status,
      reported: reported || undefined,
      verified: verifiedFilter === "verified" ? true : verifiedFilter === "unverified" ? false : undefined,
      source: sourceFilter !== "all" ? (sourceFilter.toUpperCase() as DashboardReviewSource) : undefined,
      search: debouncedSearch || undefined,
    }
  }, [tab, ratingFilter, statusFilter, verifiedFilter, sourceFilter, debouncedSearch])

  React.useEffect(() => {
    if (!businessId) return
    let cancelled = false
    setIsLoading(true)
    setLoadError(undefined)

    fetchDashboardReviews(businessId, query)
      .then((res) => {
        if (cancelled) return
        setApiReviews(res.data)
      })
      .catch(() => {
        if (!cancelled) setLoadError("Gagal memuat review. Coba muat ulang halaman.")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [businessId, query, refreshKey])

  React.useEffect(() => {
    if (!businessId) return
    let cancelled = false

    Promise.all([
      fetchDashboardReviews(businessId, { reply_status: "UNREPLIED", limit: 1 }),
      fetchReviewReportsSummary(businessId),
      fetchBusinessReviewAiSummary(businessId),
    ]).then(([unreplied, reports, ai]) => {
      if (cancelled) return
      setUnrepliedCount(unreplied.pagination.total)
      setReportedCount(reports.pending)
      if (ai) setAiSummary(ai)
    })

    return () => {
      cancelled = true
    }
  }, [businessId, refreshKey])

  if (isBusinessLoading) return null
  if (!activeBusiness) {
    return (
      <div className="flex flex-col gap-4">
        <DashboardBreadcrumb items={[{ label: "Reviews" }]} />
        <p className="text-sm text-muted-foreground">
          Anda belum terhubung dengan bisnis mana pun. Klaim atau daftarkan bisnis Anda terlebih dahulu.
        </p>
      </div>
    )
  }

  const reviews = apiReviews.map((r) => mapApiReviewToUiReview(r, activeBusiness))
  const sorted = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  async function handleReply(reviewId: string, content: string): Promise<boolean> {
    if (!businessId) return false
    const res = await createReviewReply(businessId, reviewId, content)
    if (!res.success) {
      toast.error(res.message || "Gagal mengirim balasan.")
      return false
    }
    toast.success("Balasan berhasil dikirim.")
    setApiReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              reply: {
                id: res.data?.id || `reply-${Date.now()}`,
                content,
                created_at: new Date().toISOString(),
                author: { id: "me", name: activeBusiness?.name || "Admin Bisnis" },
              },
            }
          : r
      )
    )
    setUnrepliedCount((c) => Math.max(0, c - 1))
    setRefreshKey((k) => k + 1)
    return true
  }

  const columns: ResourceTableColumn<Review>[] = [
    {
      key: "reviewerName",
      header: "Pelanggan",
      sortValue: (r) => r.reviewerName,
      headerClassName: "w-[180px] min-w-[150px]",
      className: "w-[180px] min-w-[150px]",
      render: (review) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback>
              {review.reviewerName
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {review.reviewerName}
            </p>
            {review.source && (
              <p className="truncate text-xs text-muted-foreground">melalui {review.source}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortValue: (r) => r.rating,
      headerClassName: "w-[120px] whitespace-nowrap",
      className: "w-[120px] whitespace-nowrap",
      render: (review) => <RatingStars rating={review.rating} size="sm" />,
    },
    {
      key: "content",
      header: "Review",
      headerClassName: "min-w-[220px]",
      className: "min-w-[220px]",
      render: (review) => (
        <div className="flex flex-col gap-1 max-w-xl">
          <p className="line-clamp-2 text-sm text-foreground/90">{review.content}</p>
          {review.reply && (
            <p className="line-clamp-1 text-xs text-emerald-600 dark:text-emerald-400">
              <span className="font-semibold">Balasan Anda:</span> {review.reply.content}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "isVerified",
      header: "Verifikasi",
      headerClassName: "w-[110px] hidden sm:table-cell",
      className: "w-[110px] hidden sm:table-cell",
      render: (review) => <StatusBadge status={review.isVerified ? "VERIFIED" : "UNVERIFIED"} />,
    },
    {
      key: "status",
      header: "Status",
      headerClassName: "w-[120px] hidden md:table-cell",
      className: "w-[120px] hidden md:table-cell",
      render: (review) => <StatusBadge status={reviewStatus(review)} />,
    },
    {
      key: "createdAt",
      header: "Tanggal",
      sortValue: (r) => r.createdAt,
      headerClassName: "w-[140px] whitespace-nowrap hidden lg:table-cell",
      className: "w-[140px] whitespace-nowrap hidden lg:table-cell text-xs text-muted-foreground",
      render: (review) => formatDateTime(review.createdAt),
    },
    {
      key: "actions",
      header: "Aksi",
      className: "w-[110px] text-right whitespace-nowrap",
      headerClassName: "w-[110px] text-right whitespace-nowrap",
      render: (review) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(event) => event.stopPropagation()}>
          {!review.reply && (
            <ReplyDialog
              review={review}
              triggerLabel="Balas"
              triggerVariant="outline"
              triggerSize="sm"
              onSubmit={(content) => handleReply(review.id, content)}
            />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              ⋮
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDetailReview(review)}>
                Lihat Detail
              </DropdownMenuItem>
              {!review.reply && (
                <DropdownMenuItem onClick={() => setDetailReview(review)}>
                  Balas Review
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <DashboardBreadcrumb items={[{ label: "Reviews" }]} />

      <PageHeader
        title="Reviews"
        description={`Kelola semua review yang diterima oleh ${activeBusiness.name}. Balas review dan jaga reputasi bisnis Anda.`}
        action={
          <Button
            onClick={() =>
              downloadCsv(
                `reviews-${activeBusiness.slug}.csv`,
                sorted.map((r) => ({
                  reviewer: r.reviewerName,
                  rating: r.rating,
                  review: r.content,
                  verifikasi: r.isVerified ? "Verified" : "Unverified",
                  status: reviewStatus(r),
                  tanggal: formatDateTime(r.createdAt),
                }))
              )
            }
          >
            <DownloadIcon />
            Download Data
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          label="Total Reviews"
          value={activeBusiness.totalReviews.toLocaleString("id-ID")}
          icon={MessageSquareTextIcon}
        />
        <StatCard
          label="Average Rating"
          value={activeBusiness.averageRating.toFixed(1)}
          icon={StarIcon}
        />
        <StatCard
          label="Belum Dibalas"
          value={unrepliedCount}
          icon={MessageSquareTextIcon}
          onClick={() => setTab("unreplied")}
        />
        <StatCard
          label="Dilaporkan"
          value={reportedCount}
          iconTone="destructive"
          icon={FlagIcon}
          onClick={() => setTab("reported")}
        />
      </div>

      {/* Ringkasan AI KataMereka (didukung MAIA Router) */}
      <AiReviewSummaryCard
        summary={aiSummary}
        businessId={businessId}
        canRefresh={true}
        onSummaryUpdated={setAiSummary}
      />

      <Tabs value={tab} onValueChange={(value) => typeof value === "string" && setTab(value)}>
        <TabsList variant="line">
          {TABS.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}{" "}
              {option.value === "all"
                ? `(${activeBusiness.totalReviews.toLocaleString("id-ID")})`
                : option.value === "unreplied"
                  ? `(${unrepliedCount})`
                  : `(${reportedCount})`}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari review..."
          className="sm:max-w-56"
        />
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown label="Rating" options={RATING_OPTIONS} value={ratingFilter} onChange={setRatingFilter} />
          <FilterDropdown label="Status" options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
          <FilterDropdown
            label="Verifikasi"
            options={VERIFIED_OPTIONS}
            value={verifiedFilter}
            onChange={setVerifiedFilter}
          />
          <Button variant="outline" size="sm" onClick={() => setAdvancedOpen(true)}>
            <SlidersHorizontalIcon />
            Filter Lanjutan
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <DateRangeSelector />
      </div>

      <div className="w-full">
        <ResourceTable
          data={sorted}
          columns={columns}
          getRowId={(r) => r.id}
          onRowClick={(review) => setDetailReview(review)}
          isLoading={isLoading}
          error={loadError}
          itemLabel="review"
          emptyTitle="Belum ada review."
          emptyDescription="Review dari pelanggan akan muncul di sini."
        />
      </div>

      <Dialog open={!!detailReview} onOpenChange={(open) => !open && setDetailReview(null)}>
        <DialogContent className="max-w-lg">
          {detailReview && (
            <div className="flex flex-col gap-4">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {detailReview.reviewerName
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-base font-semibold text-foreground">
                      {detailReview.reviewerName}
                    </DialogTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      {detailReview.source && <span>melalui {detailReview.source}</span>}
                      <span>•</span>
                      <span>{formatDateTime(detailReview.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex items-center justify-between">
                <RatingStars rating={detailReview.rating} />
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={detailReview.isVerified ? "VERIFIED" : "UNVERIFIED"} />
                  <StatusBadge status={reviewStatus(detailReview)} />
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 p-3.5 border border-border/50 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {detailReview.content}
              </div>

              {detailReview.reply ? (
                <div className="flex flex-col gap-1.5 rounded-lg bg-secondary/80 p-3.5 border border-border/50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">Balasan Anda</p>
                    {detailReview.reply.repliedAt && (
                      <span className="text-[11px] text-muted-foreground">
                        {formatDateTime(detailReview.reply.repliedAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                    {detailReview.reply.content}
                  </p>
                </div>
              ) : (
                <div className="pt-1 flex justify-end">
                  <ReplyDialog
                    review={detailReview}
                    triggerLabel="Balas Review Ini"
                    onSubmit={async (content) => {
                      const success = await handleReply(detailReview.id, content)
                      if (success) {
                        setDetailReview((prev) =>
                          prev
                            ? {
                                ...prev,
                                reply: {
                                  content,
                                  repliedAt: new Date().toISOString(),
                                  repliedBy: activeBusiness?.name || "Admin Bisnis",
                                },
                              }
                            : null
                        )
                      }
                      return success
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Lanjutan</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="source-filter">
              Sumber Review
            </label>
            <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as string)}>
              <SelectTrigger id="source-filter" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Sumber</SelectItem>
                <SelectItem value="Google">Google</SelectItem>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="KataMereka">KataMereka</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSourceFilter("all")
              }}
            >
              Reset
            </Button>
            <Button onClick={() => setAdvancedOpen(false)}>Terapkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
