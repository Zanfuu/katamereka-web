"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  BadgeCheckIcon,
  DownloadIcon,
  EyeOffIcon,
  FlagIcon,
  HomeIcon,
  RotateCcwIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { DateRangeSelector } from "@/components/date-range-selector"
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateTime } from "@/lib/format"
import { businesses, getBusinessById } from "@/lib/mock/businesses"
import { reviews as initialReviews } from "@/lib/mock/reviews"
import { getUserById } from "@/lib/mock/users"
import type { Review } from "@/lib/types"

const TABS = [
  { value: "all", label: "Semua" },
  { value: "PUBLISHED", label: "Published" },
  { value: "reported", label: "Reported" },
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

const VERIFICATION_OPTIONS = [
  { value: "all", label: "Semua Verifikasi" },
  { value: "VERIFIED", label: "Verified" },
  { value: "UNVERIFIED", label: "Unverified" },
]

const AVATAR_TONES = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-purple-100 text-purple-700",
  "bg-cyan-100 text-cyan-700",
]

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase()
}

function avatarTone(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % AVATAR_TONES.length
  return AVATAR_TONES[hash]
}

export default function AdminGlobalReviewsPage() {
  const [reviews, setReviews] = React.useState<Review[]>(initialReviews)
  const [search, setSearch] = React.useState("")
  const [tab, setTab] = React.useState<string>("all")
  const [businessFilter, setBusinessFilter] = React.useState("all")
  const [ratingFilter, setRatingFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [verificationFilter, setVerificationFilter] = React.useState("all")
  const [detail, setDetail] = React.useState<Review | null>(null)
  const [action, setAction] = React.useState<{
    review: Review
    type: "HIDE" | "RESTORE" | "REMOVE"
  } | null>(null)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  const businessOptions = [
    { value: "all", label: "Semua Bisnis" },
    ...businesses.map((b) => ({ value: b.id, label: b.name })),
  ]

  const counts = {
    total: reviews.length,
    published: reviews.filter((r) => r.status === "PUBLISHED").length,
    reported: reviews.filter((r) => r.reportCount > 0).length,
    hidden: reviews.filter((r) => r.status === "HIDDEN").length,
    removed: reviews.filter((r) => r.status === "REMOVED").length,
  }

  function resetFilters() {
    setSearch("")
    setBusinessFilter("all")
    setRatingFilter("all")
    setStatusFilter("all")
    setVerificationFilter("all")
  }

  const filtered = reviews.filter((review) => {
    if (tab === "reported" && review.reportCount === 0) return false
    if (tab !== "all" && tab !== "reported" && review.status !== tab) return false
    if (businessFilter !== "all" && review.businessId !== businessFilter) return false
    if (ratingFilter !== "all" && String(review.rating) !== ratingFilter) return false
    if (statusFilter !== "all" && review.status !== statusFilter) return false
    if (
      verificationFilter !== "all" &&
      (verificationFilter === "VERIFIED") !== review.isVerified
    )
      return false
    if (
      search &&
      !review.reviewerName.toLowerCase().includes(search.toLowerCase()) &&
      !review.businessName.toLowerCase().includes(search.toLowerCase()) &&
      !review.content.toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  const columns: ResourceTableColumn<Review>[] = [
    {
      key: "reviewerName",
      header: "Reviewer",
      sortValue: (r) => r.reviewerName,
      render: (review) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback className={avatarTone(review.reviewerId)}>
              {initials(review.reviewerName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{review.reviewerName}</p>
            <p className="text-xs text-muted-foreground">
              {getUserById(review.reviewerId)?.email ?? "-"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "businessName",
      header: "Bisnis",
      sortValue: (r) => r.businessName,
      render: (review) => {
        const business = getBusinessById(review.businessId)
        return (
          <div className="flex items-center gap-2.5">
            <Avatar size="sm">
              <AvatarFallback className={avatarTone(review.businessId)}>
                {initials(review.businessName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-foreground">{review.businessName}</p>
              {business && <p className="text-xs text-muted-foreground">{business.category}</p>}
            </div>
          </div>
        )
      },
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
        <span className="line-clamp-1 max-w-xs text-muted-foreground">{review.content}</span>
      ),
    },
    {
      key: "isVerified",
      header: "Verifikasi",
      render: (review) => (
        <StatusBadge status={review.isVerified ? "VERIFIED" : "UNVERIFIED"} />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (review) => <StatusBadge status={review.status} />,
    },
    {
      key: "reportCount",
      header: "Dilaporkan",
      sortValue: (r) => r.reportCount,
      render: (review) =>
        review.reportCount > 0 ? (
          <span className="font-medium text-destructive">{review.reportCount}</span>
        ) : (
          <span className="text-muted-foreground">0</span>
        ),
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
      render: (review) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <FlagIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDetail(review)}>View</DropdownMenuItem>
              {review.reportCount > 0 && (
                <DropdownMenuItem render={<Link href="/admin/trust-safety" />}>
                  View Reports
                </DropdownMenuItem>
              )}
              <DropdownMenuItem render={<Link href="/admin/evidence" />}>
                View Evidence
              </DropdownMenuItem>
              {review.status === "PUBLISHED" && (
                <DropdownMenuItem onClick={() => setAction({ review, type: "HIDE" })}>
                  <EyeOffIcon />
                  Hide
                </DropdownMenuItem>
              )}
              {review.status === "HIDDEN" && (
                <DropdownMenuItem onClick={() => setAction({ review, type: "RESTORE" })}>
                  <RotateCcwIcon />
                  Restore
                </DropdownMenuItem>
              )}
              {review.status !== "REMOVED" && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setAction({ review, type: "REMOVE" })}
                >
                  <Trash2Icon />
                  Remove
                </DropdownMenuItem>
              )}
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
        description="Kelola semua review yang ada di platform KataMereka. Pantau kualitas ulasan dan tindak konten yang tidak sesuai."
        action={
          <Button variant="outline" onClick={() => toast.success("Data review berhasil diexport.")}>
            <DownloadIcon />
            Export Data
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-5">
        <StatCard
          label="Total Review"
          value={counts.total.toLocaleString("id-ID")}
          delta="+12%"
          hint="dari bulan lalu"
          icon={StarIcon}
          onClick={() => setTab("all")}
        />
        <StatCard
          label="Published"
          value={counts.published.toLocaleString("id-ID")}
          delta="+14%"
          hint="dari bulan lalu"
          onClick={() => setTab("PUBLISHED")}
        />
        <StatCard
          label="Reported"
          value={counts.reported.toLocaleString("id-ID")}
          delta="+8%"
          deltaTone="negative"
          hint="dari bulan lalu"
          iconTone="destructive"
          icon={FlagIcon}
          onClick={() => setTab("reported")}
        />
        <StatCard
          label="Hidden"
          value={counts.hidden.toLocaleString("id-ID")}
          delta="+5%"
          deltaTone="negative"
          hint="dari bulan lalu"
          iconTone="warning"
          onClick={() => setTab("HIDDEN")}
        />
        <StatCard
          label="Removed"
          value={counts.removed.toLocaleString("id-ID")}
          delta="+3%"
          deltaTone="negative"
          hint="dari bulan lalu"
          iconTone="destructive"
          onClick={() => setTab("REMOVED")}
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => typeof v === "string" && setTab(v)}>
        <TabsList variant="line">
          {TABS.map((t) => {
            const count =
              t.value === "all"
                ? counts.total
                : t.value === "reported"
                  ? counts.reported
                  : t.value === "PUBLISHED"
                    ? counts.published
                    : t.value === "HIDDEN"
                      ? counts.hidden
                      : counts.removed
            return (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
                <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  {count.toLocaleString("id-ID")}
                </span>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari reviewer, bisnis, atau isi review..."
        />
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown label="Bisnis" options={businessOptions} value={businessFilter} onChange={setBusinessFilter} />
          <FilterDropdown label="Rating" options={RATING_OPTIONS} value={ratingFilter} onChange={setRatingFilter} />
          <FilterDropdown label="Status" options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
          <FilterDropdown label="Verifikasi" options={VERIFICATION_OPTIONS} value={verificationFilter} onChange={setVerificationFilter} />
          <DateRangeSelector />
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RotateCcwIcon />
            Reset
          </Button>
        </div>
      </div>

      <ResourceTable
        data={filtered}
        columns={columns}
        getRowId={(review) => review.id}
        selectedIds={selectedIds}
        onToggleRow={(id, checked) =>
          setSelectedIds((prev) => {
            const next = new Set(prev)
            if (checked) next.add(id)
            else next.delete(id)
            return next
          })
        }
        onToggleAll={(checked) => setSelectedIds(checked ? new Set(filtered.map((r) => r.id)) : new Set())}
        itemLabel="review"
        pageSize={10}
        emptyTitle="Tidak ada review ditemukan."
      />

      <Sheet open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{detail?.reviewerName}</SheetTitle>
            <SheetDescription>{detail?.businessName}</SheetDescription>
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
                <p className="mt-2 rounded-lg border border-border p-3 text-sm text-foreground/90">
                  {detail.content}
                </p>
              </section>

              <section className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email Reviewer</span>
                  <span className="font-medium text-foreground">
                    {getUserById(detail.reviewerId)?.email ?? "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Verifikasi</span>
                  {detail.isVerified ? (
                    <span className="flex items-center gap-1 font-medium text-info">
                      <BadgeCheckIcon className="size-3.5" />
                      Verified
                    </span>
                  ) : (
                    <StatusBadge status="UNVERIFIED" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={detail.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Dilaporkan</span>
                  <span className="font-medium text-foreground">{detail.reportCount}x</span>
                </div>
              </section>

              {detail.reply && (
                <section>
                  <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                    Balasan Bisnis
                  </h3>
                  <div className="rounded-lg bg-secondary p-3">
                    <p className="text-xs font-medium text-foreground">{detail.reply.repliedBy}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{detail.reply.content}</p>
                  </div>
                </section>
              )}

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                {detail.status === "PUBLISHED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAction({ review: detail, type: "HIDE" })
                      setDetail(null)
                    }}
                  >
                    <EyeOffIcon />
                    Hide
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
                    <RotateCcwIcon />
                    Restore
                  </Button>
                )}
                {detail.status !== "REMOVED" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setAction({ review: detail, type: "REMOVE" })
                      setDetail(null)
                    }}
                  >
                    <Trash2Icon />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!action}
        onOpenChange={(open) => !open && setAction(null)}
        title={`${
          action?.type === "HIDE" ? "Sembunyikan" : action?.type === "RESTORE" ? "Pulihkan" : "Hapus"
        } review dari ${action?.review.reviewerName}?`}
        confirmLabel={
          action?.type === "HIDE" ? "Hide" : action?.type === "RESTORE" ? "Restore" : "Remove"
        }
        variant={action?.type === "RESTORE" ? "default" : "destructive"}
        requireReason={action?.type !== "RESTORE"}
        reasonLabel="Alasan moderasi"
        onConfirm={() => {
          if (!action) return
          const nextStatus =
            action.type === "HIDE" ? "HIDDEN" : action.type === "RESTORE" ? "PUBLISHED" : "REMOVED"
          setReviews((prev) =>
            prev.map((r) => (r.id === action.review.id ? { ...r, status: nextStatus } : r))
          )
          toast.success("Tindakan moderasi berhasil dicatat di audit log.")
        }}
      />
    </div>
  )
}
