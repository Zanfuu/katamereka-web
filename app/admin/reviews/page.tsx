"use client"

import * as React from "react"
import { toast } from "sonner"
import { StarIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageHeader } from "@/components/page-header"
import { RatingStars } from "@/components/rating-stars"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { SearchInput } from "@/components/search-input"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/format"
import { reviews } from "@/lib/mock/reviews"
import type { Review } from "@/lib/types"

const TABS = [
  { value: "all", label: "Semua" },
  { value: "reported", label: "Reported" },
  { value: "HIDDEN", label: "Hidden" },
  { value: "REMOVED", label: "Removed" },
] as const

export default function AdminGlobalReviewsPage() {
  const [search, setSearch] = React.useState("")
  const [tab, setTab] = React.useState<string>("all")
  const [action, setAction] = React.useState<{
    review: Review
    type: "HIDE" | "RESTORE" | "REMOVE"
  } | null>(null)

  const counts = {
    total: reviews.length,
    published: reviews.filter((r) => r.status === "PUBLISHED").length,
    reported: reviews.filter((r) => r.reportCount > 0).length,
    hidden: reviews.filter((r) => r.status === "HIDDEN").length,
    removed: reviews.filter((r) => r.status === "REMOVED").length,
  }

  const filtered = reviews.filter((review) => {
    if (tab === "reported" && review.reportCount === 0) return false
    if (tab !== "all" && tab !== "reported" && review.status !== tab) return false
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
      render: (review) => <span className="font-medium text-foreground">{review.reviewerName}</span>,
    },
    { key: "businessName", header: "Business", render: (review) => review.businessName },
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
      header: "Verification",
      render: (review) => (
        <StatusBadge status={review.isVerified ? "VERIFIED" : "UNVERIFIED"} />
      ),
    },
    {
      key: "reportCount",
      header: "Reports",
      sortValue: (r) => r.reportCount,
      render: (review) =>
        review.reportCount > 0 ? (
          <span className="font-medium text-destructive">{review.reportCount}</span>
        ) : (
          <span className="text-muted-foreground">0</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (review) => <StatusBadge status={review.status} />,
    },
    {
      key: "createdAt",
      header: "Created At",
      sortValue: (r) => r.createdAt,
      render: (review) => (
        <span className="text-muted-foreground">{formatDate(review.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (review) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
              Aksi
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => toast.info(`Menampilkan detail review ${review.reviewerName}.`)}
              >
                View
              </DropdownMenuItem>
              {review.reportCount > 0 && (
                <DropdownMenuItem
                  onClick={() => toast.info(`Menampilkan ${review.reportCount} laporan terkait.`)}
                >
                  View Reports
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => toast.info("Menampilkan evidence transaksi terkait.")}
              >
                View Evidence
              </DropdownMenuItem>
              {review.status === "PUBLISHED" && (
                <DropdownMenuItem onClick={() => setAction({ review, type: "HIDE" })}>
                  Hide
                </DropdownMenuItem>
              )}
              {review.status === "HIDDEN" && (
                <DropdownMenuItem onClick={() => setAction({ review, type: "RESTORE" })}>
                  Restore
                </DropdownMenuItem>
              )}
              {review.status !== "REMOVED" && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setAction({ review, type: "REMOVE" })}
                >
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
      <PageHeader
        title="Global Review Management"
        description="Kelola seluruh review yang ada di platform KataMereka."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-5">
        <StatCard label="Total" value={counts.total} icon={StarIcon} />
        <StatCard label="Published" value={counts.published} />
        <StatCard label="Reported" value={counts.reported} deltaTone="negative" />
        <StatCard label="Hidden" value={counts.hidden} deltaTone="neutral" />
        <StatCard label="Removed" value={counts.removed} deltaTone="negative" />
      </div>

      <div className="flex flex-col gap-3">
        <Tabs value={tab} onValueChange={(v) => typeof v === "string" && setTab(v)}>
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari reviewer, bisnis, atau isi review..."
        />
      </div>

      <ResourceTable
        data={filtered}
        columns={columns}
        getRowId={(review) => review.id}
        emptyTitle="Tidak ada review ditemukan."
      />

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
          toast.success("Tindakan moderasi berhasil dicatat di audit log.")
        }}
      />
    </div>
  )
}
