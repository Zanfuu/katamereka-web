"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { BuildingIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { FilterDropdown } from "@/components/filter-dropdown"
import { PageHeader } from "@/components/page-header"
import { RatingStars } from "@/components/rating-stars"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { SearchInput } from "@/components/search-input"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format"
import { businesses } from "@/lib/mock/businesses"
import type { Business } from "@/lib/types"

const VERIFICATION_OPTIONS = [
  { value: "all", label: "Semua Verifikasi" },
  { value: "VERIFIED", label: "Verified" },
  { value: "PENDING", label: "Pending" },
  { value: "UNVERIFIED", label: "Unverified" },
  { value: "REJECTED", label: "Rejected" },
]

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
]

export default function SuperAdminBusinessesPage() {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [verificationFilter, setVerificationFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [confirmTarget, setConfirmTarget] = React.useState<{
    business: Business
    action: "VERIFY" | "SUSPEND" | "ACTIVATE"
  } | null>(null)

  const categories = Array.from(new Set(businesses.map((b) => b.category)))
  const categoryOptions = [
    { value: "all", label: "Semua Kategori" },
    ...categories.map((c) => ({ value: c, label: c })),
  ]

  const counts = {
    total: businesses.length,
    verified: businesses.filter((b) => b.verificationStatus === "VERIFIED").length,
    pending: businesses.filter((b) => b.verificationStatus === "PENDING").length,
    unverified: businesses.filter((b) => b.verificationStatus === "UNVERIFIED").length,
    suspended: businesses.filter((b) => b.status === "SUSPENDED").length,
  }

  const filtered = businesses.filter((business) => {
    if (verificationFilter !== "all" && business.verificationStatus !== verificationFilter)
      return false
    if (statusFilter !== "all" && business.status !== statusFilter) return false
    if (categoryFilter !== "all" && business.category !== categoryFilter) return false
    if (search && !business.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const columns: ResourceTableColumn<Business>[] = [
    {
      key: "name",
      header: "Business",
      sortValue: (b) => b.name,
      render: (business) => (
        <div>
          <p className="font-medium text-foreground">{business.name}</p>
          <p className="text-xs text-muted-foreground">{business.city}</p>
        </div>
      ),
    },
    {
      key: "ownerName",
      header: "Owner",
      render: (business) => <span className="text-muted-foreground">{business.ownerName}</span>,
    },
    { key: "category", header: "Category", render: (business) => business.category },
    {
      key: "averageRating",
      header: "Rating",
      sortValue: (b) => b.averageRating,
      render: (business) => (
        <div className="flex items-center gap-1.5">
          <RatingStars rating={business.averageRating} size="sm" />
          <span className="text-xs text-muted-foreground">{business.averageRating}</span>
        </div>
      ),
    },
    {
      key: "totalReviews",
      header: "Reviews",
      sortValue: (b) => b.totalReviews,
      render: (business) => business.totalReviews.toLocaleString("id-ID"),
    },
    {
      key: "verificationStatus",
      header: "Verification",
      render: (business) => <StatusBadge status={business.verificationStatus} />,
    },
    {
      key: "status",
      header: "Status",
      render: (business) => <StatusBadge status={business.status} />,
    },
    {
      key: "createdAt",
      header: "Created At",
      sortValue: (b) => b.createdAt,
      render: (business) => (
        <span className="text-muted-foreground">{formatDate(business.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (business) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/super-admin/businesses/${business.id}`)}
          >
            View
          </Button>
          {business.verificationStatus === "PENDING" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmTarget({ business, action: "VERIFY" })}
            >
              Verify
            </Button>
          )}
          {business.status === "SUSPENDED" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmTarget({ business, action: "ACTIVATE" })}
            >
              Activate
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmTarget({ business, action: "SUSPEND" })}
            >
              Suspend
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Business Management"
        description="Kelola seluruh business yang terdaftar di KataMereka."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-5">
        <StatCard label="Total Businesses" value={counts.total} icon={BuildingIcon} />
        <StatCard label="Verified" value={counts.verified} />
        <StatCard label="Pending" value={counts.pending} deltaTone="neutral" />
        <StatCard label="Unverified" value={counts.unverified} deltaTone="neutral" />
        <StatCard label="Suspended" value={counts.suspended} deltaTone="negative" />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari nama bisnis..." />
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Verifikasi"
            options={VERIFICATION_OPTIONS}
            value={verificationFilter}
            onChange={setVerificationFilter}
          />
          <FilterDropdown
            label="Status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <FilterDropdown
            label="Kategori"
            options={categoryOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
        </div>
      </div>

      <ResourceTable
        data={filtered}
        columns={columns}
        getRowId={(business) => business.id}
        onRowClick={(business) => router.push(`/super-admin/businesses/${business.id}`)}
        emptyTitle="Tidak ada bisnis ditemukan."
      />

      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title={
          confirmTarget?.action === "VERIFY"
            ? `Verifikasi ${confirmTarget?.business.name}?`
            : confirmTarget?.action === "SUSPEND"
              ? `Suspend ${confirmTarget?.business.name}?`
              : `Aktifkan kembali ${confirmTarget?.business.name}?`
        }
        confirmLabel={
          confirmTarget?.action === "VERIFY"
            ? "Verify"
            : confirmTarget?.action === "SUSPEND"
              ? "Suspend"
              : "Activate"
        }
        variant={confirmTarget?.action === "SUSPEND" ? "destructive" : "default"}
        requireReason={confirmTarget?.action === "SUSPEND"}
        reasonLabel="Alasan suspend"
        onConfirm={() =>
          toast.success(
            `${confirmTarget?.business.name}: aksi ${confirmTarget?.action.toLowerCase()} berhasil diterapkan.`
          )
        }
      />
    </div>
  )
}
