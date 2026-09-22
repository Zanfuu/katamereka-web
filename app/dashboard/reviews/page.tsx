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

import { useBusinessContext } from "@/components/business-provider"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"
import { DateRangeSelector } from "@/components/date-range-selector"
import { FilterDropdown } from "@/components/filter-dropdown"
import { PageHeader } from "@/components/page-header"
import { RatingStars } from "@/components/rating-stars"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { ReviewDetailPanel } from "@/components/review-detail-panel"
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
import { getReviewsByBusiness } from "@/lib/mock/reviews"
import type { Review } from "@/lib/types"

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

function reviewStatus(review: Review): "Dibalas" | "Belum Dibalas" | "Dilaporkan" {
  if (review.reportCount > 0) return "Dilaporkan"
  if (review.reply) return "Dibalas"
  return "Belum Dibalas"
}

export default function DashboardReviewsPage() {
  const { selectedBusiness } = useBusinessContext()
  const [tab, setTab] = React.useState<string>("all")
  const [search, setSearch] = React.useState("")
  const [ratingFilter, setRatingFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [verifiedFilter, setVerifiedFilter] = React.useState("all")
  const [advancedOpen, setAdvancedOpen] = React.useState(false)
  const [sourceFilter, setSourceFilter] = React.useState("all")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  if (!selectedBusiness) return null

  const reviews = getReviewsByBusiness(selectedBusiness.id)
  const unrepliedCount = reviews.filter((r) => !r.reply).length
  const reportedCount = reviews.filter((r) => r.reportCount > 0).length

  const filtered = reviews.filter((review) => {
    if (tab === "unreplied" && review.reply) return false
    if (tab === "reported" && review.reportCount === 0) return false
    if (ratingFilter !== "all" && String(review.rating) !== ratingFilter) return false
    if (statusFilter !== "all" && reviewStatus(review) !== statusFilter) return false
    if (verifiedFilter === "verified" && !review.isVerified) return false
    if (verifiedFilter === "unverified" && review.isVerified) return false
    if (sourceFilter !== "all" && review.source !== sourceFilter) return false
    if (
      search &&
      !review.reviewerName.toLowerCase().includes(search.toLowerCase()) &&
      !review.content.toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const selectedReview = sorted.find((r) => r.id === selectedId) ?? sorted[0] ?? null

  const columns: ResourceTableColumn<Review>[] = [
    {
      key: "reviewerName",
      header: "Pelanggan",
      sortValue: (r) => r.reviewerName,
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
              <p className="text-xs text-muted-foreground">melalui {review.source}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortValue: (r) => r.rating,
      render: (review) => <RatingStars rating={review.rating} size="sm" />,
    },
    {
      key: "content",
      header: "Review",
      render: (review) => (
        <span className="line-clamp-1 max-w-56 text-foreground/90">{review.content}</span>
      ),
    },
    {
      key: "isVerified",
      header: "Verifikasi",
      render: (review) => <StatusBadge status={review.isVerified ? "VERIFIED" : "UNVERIFIED"} />,
    },
    {
      key: "status",
      header: "Status",
      render: (review) => <StatusBadge status={reviewStatus(review)} />,
    },
    {
      key: "createdAt",
      header: "Tanggal",
      sortValue: (r) => r.createdAt,
      render: (review) => (
        <span className="text-muted-foreground">{formatDateTime(review.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headerClassName: "text-right",
      render: (review) => (
        <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              ⋮
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedId(review.id)}>
                Lihat Detail
              </DropdownMenuItem>
              {!review.reply && (
                <DropdownMenuItem onClick={() => setSelectedId(review.id)}>
                  Balas
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => toast.info("Review dilaporkan untuk ditinjau tim KataMereka.")}
              >
                Laporkan
              </DropdownMenuItem>
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
        description={`Kelola semua review yang diterima oleh ${selectedBusiness.name}. Balas review dan jaga reputasi bisnis Anda.`}
        action={
          <Button
            onClick={() =>
              downloadCsv(
                `reviews-${selectedBusiness.slug}.csv`,
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
          value={selectedBusiness.totalReviews.toLocaleString("id-ID")}
          delta="+12% dari bulan lalu"
          icon={MessageSquareTextIcon}
        />
        <StatCard
          label="Average Rating"
          value={selectedBusiness.averageRating.toFixed(1)}
          delta="+0.2 dari bulan lalu"
          icon={StarIcon}
        />
        <StatCard
          label="Belum Dibalas"
          value={unrepliedCount}
          delta={`+${unrepliedCount} dari bulan lalu`}
          deltaTone="negative"
          icon={MessageSquareTextIcon}
          onClick={() => setTab("unreplied")}
        />
        <StatCard
          label="Dilaporkan"
          value={reportedCount}
          delta={`+${reportedCount} dari bulan lalu`}
          deltaTone="negative"
          iconTone="destructive"
          icon={FlagIcon}
          onClick={() => setTab("reported")}
        />
      </div>

      <Tabs value={tab} onValueChange={(value) => typeof value === "string" && setTab(value)}>
        <TabsList variant="line">
          {TABS.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}{" "}
              {option.value === "all"
                ? `(${reviews.length})`
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

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <ResourceTable
            data={sorted}
            columns={columns}
            getRowId={(r) => r.id}
            onRowClick={(review) => setSelectedId(review.id)}
            rowClassName={(review) =>
              selectedReview?.id === review.id ? "bg-accent/40 hover:bg-accent/50" : undefined
            }
            itemLabel="review"
            emptyTitle="Belum ada review."
            emptyDescription="Review dari pelanggan akan muncul di sini."
          />
        </div>
        {selectedReview && (
          <ReviewDetailPanel review={selectedReview} onClose={() => setSelectedId(null)} />
        )}
      </div>

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
