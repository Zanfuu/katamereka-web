"use client"

import * as React from "react"
import { toast } from "sonner"
import { UsersIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { FilterDropdown } from "@/components/filter-dropdown"
import { PageHeader } from "@/components/page-header"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { SearchInput } from "@/components/search-input"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatDate, formatDateTime } from "@/lib/format"
import { platformUsers } from "@/lib/mock/users"
import type { User } from "@/lib/types"

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "BANNED", label: "Banned" },
]

export default function AdminUsersPage() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [detail, setDetail] = React.useState<User | null>(null)
  const [confirmTarget, setConfirmTarget] = React.useState<{
    user: User
    action: "SUSPEND" | "BAN" | "RESTORE"
  } | null>(null)

  const counts = {
    total: platformUsers.length,
    active: platformUsers.filter((u) => u.status === "ACTIVE").length,
    suspended: platformUsers.filter((u) => u.status === "SUSPENDED").length,
    banned: platformUsers.filter((u) => u.status === "BANNED").length,
  }

  const filtered = platformUsers.filter((user) => {
    if (statusFilter !== "all" && user.status !== statusFilter) return false
    if (
      search &&
      !user.name.toLowerCase().includes(search.toLowerCase()) &&
      !user.email.toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  const columns: ResourceTableColumn<User>[] = [
    {
      key: "name",
      header: "User",
      sortValue: (user) => user.name,
      render: (user) => (
        <div>
          <p className="font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      ),
    },
    {
      key: "reviewCount",
      header: "Reviews",
      sortValue: (user) => user.reviewCount,
      render: (user) => user.reviewCount,
    },
    {
      key: "joinedAt",
      header: "Joined At",
      sortValue: (user) => user.joinedAt,
      render: (user) => <span className="text-muted-foreground">{formatDate(user.joinedAt)}</span>,
    },
    {
      key: "lastActiveAt",
      header: "Last Active",
      sortValue: (user) => user.lastActiveAt,
      render: (user) => (
        <span className="text-muted-foreground">{formatDateTime(user.lastActiveAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (user) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setDetail(user)}>
            View
          </Button>
          {user.status === "ACTIVE" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmTarget({ user, action: "SUSPEND" })}
            >
              Suspend
            </Button>
          )}
          {user.status !== "BANNED" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmTarget({ user, action: "BAN" })}
            >
              Ban
            </Button>
          )}
          {user.status !== "ACTIVE" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmTarget({ user, action: "RESTORE" })}
            >
              Restore
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="User Management"
        description="Kelola user platform yang menulis dan menggunakan review."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard label="Total Users" value={counts.total} icon={UsersIcon} />
        <StatCard label="Active Users" value={counts.active} />
        <StatCard label="Suspended Users" value={counts.suspended} deltaTone="neutral" />
        <StatCard label="Banned Users" value={counts.banned} deltaTone="negative" />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari nama atau email user..." />
        <FilterDropdown
          label="Status"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <ResourceTable
        data={filtered}
        columns={columns}
        getRowId={(user) => user.id}
        emptyTitle="Tidak ada user ditemukan."
      />

      <Sheet open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{detail?.name}</SheetTitle>
            <SheetDescription>{detail?.email}</SheetDescription>
          </SheetHeader>
          {detail && (
            <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">Profile</h3>
                <div className="flex flex-col gap-1.5 text-sm">
                  <Row label="Status" value={<StatusBadge status={detail.status} />} />
                  <Row label="Joined At" value={formatDate(detail.joinedAt)} />
                  <Row label="Last Active" value={formatDateTime(detail.lastActiveAt)} />
                </div>
              </section>
              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Reviews
                </h3>
                <p className="text-sm text-muted-foreground">
                  {detail.reviewCount} review ditulis di KataMereka.
                </p>
              </section>
              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Reports
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tidak ada laporan pelanggaran terhadap akun ini.
                </p>
              </section>
              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Activity
                </h3>
                <p className="text-sm text-muted-foreground">
                  Terakhir aktif {formatDateTime(detail.lastActiveAt)}.
                </p>
              </section>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title={`${
          confirmTarget?.action === "SUSPEND"
            ? "Suspend"
            : confirmTarget?.action === "BAN"
              ? "Ban"
              : "Restore"
        } ${confirmTarget?.user.name}?`}
        confirmLabel={
          confirmTarget?.action === "SUSPEND"
            ? "Suspend"
            : confirmTarget?.action === "BAN"
              ? "Ban User"
              : "Restore"
        }
        variant={confirmTarget?.action === "RESTORE" ? "default" : "destructive"}
        requireReason={confirmTarget?.action !== "RESTORE"}
        reasonLabel="Alasan tindakan"
        onConfirm={() => toast.success(`Status ${confirmTarget?.user.name} berhasil diperbarui.`)}
      />
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
