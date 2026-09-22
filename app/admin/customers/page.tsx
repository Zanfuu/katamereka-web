"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { UserCogIcon } from "lucide-react"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateTime } from "@/lib/format"
import { adminAccounts, type AdminAccount } from "@/lib/mock/admins"

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING", label: "Pending" },
  { value: "SUSPENDED", label: "Suspended" },
]

export default function AdminCustomersPage() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [detail, setDetail] = React.useState<AdminAccount | null>(null)
  const [confirmTarget, setConfirmTarget] = React.useState<{
    admin: AdminAccount
    action: "SUSPEND" | "ACTIVATE"
  } | null>(null)

  const counts = {
    total: adminAccounts.length,
    active: adminAccounts.filter((a) => a.status === "ACTIVE").length,
    pending: adminAccounts.filter((a) => a.status === "PENDING").length,
    suspended: adminAccounts.filter((a) => a.status === "SUSPENDED").length,
  }

  const filtered = adminAccounts.filter((admin) => {
    if (statusFilter !== "all" && admin.status !== statusFilter) return false
    if (
      search &&
      !admin.name.toLowerCase().includes(search.toLowerCase()) &&
      !admin.email.toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }
    return true
  })

  const columns: ResourceTableColumn<AdminAccount>[] = [
    {
      key: "name",
      header: "Admin",
      sortValue: (admin) => admin.name,
      render: (admin) => (
        <div>
          <p className="font-medium text-foreground">{admin.name}</p>
          <p className="text-xs text-muted-foreground">{admin.email}</p>
        </div>
      ),
    },
    {
      key: "businesses",
      header: "Businesses",
      render: (admin) => (
        <span className="text-sm text-muted-foreground">
          {admin.businesses.map((b) => b.businessName).join(", ")}
        </span>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (admin) => <StatusBadge status={admin.businesses[0]?.role ?? "MEMBER"} />,
    },
    {
      key: "status",
      header: "Status",
      render: (admin) => <StatusBadge status={admin.status} />,
    },
    {
      key: "joinedAt",
      header: "Joined At",
      sortValue: (admin) => admin.joinedAt,
      render: (admin) => (
        <span className="text-muted-foreground">{formatDateTime(admin.joinedAt).split(",")[0]}</span>
      ),
    },
    {
      key: "lastLoginAt",
      header: "Last Login",
      sortValue: (admin) => admin.lastLoginAt,
      render: (admin) => (
        <span className="text-muted-foreground">{formatDateTime(admin.lastLoginAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (admin) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setDetail(admin)}>
            View
          </Button>
          {admin.status === "SUSPENDED" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmTarget({ admin, action: "ACTIVATE" })}
            >
              Activate
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmTarget({ admin, action: "SUSPEND" })}
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
        title="Admin / Customer Management"
        description="Kelola Business Admin yang menjadi customer KataMereka."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard label="Total Admin" value={counts.total} icon={UserCogIcon} />
        <StatCard label="Active" value={counts.active} />
        <StatCard label="Pending" value={counts.pending} deltaTone="neutral" />
        <StatCard label="Suspended" value={counts.suspended} deltaTone="negative" />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari nama atau email admin..." />
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
        getRowId={(admin) => admin.id}
        emptyTitle="Tidak ada admin ditemukan."
      />

      <Sheet open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{detail?.name}</SheetTitle>
            <SheetDescription>{detail?.email}</SheetDescription>
          </SheetHeader>
          {detail && (
            <div className="overflow-y-auto px-4 pb-4">
              <Tabs defaultValue="account">
                <TabsList className="w-full">
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="businesses">Businesses</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="mt-4 flex flex-col gap-1.5 text-sm">
                  <Row label="Status" value={<StatusBadge status={detail.status} />} />
                  <Row label="Joined At" value={formatDateTime(detail.joinedAt)} />
                  <Row label="Last Login" value={formatDateTime(detail.lastLoginAt)} />
                </TabsContent>

                <TabsContent value="businesses" className="mt-4 flex flex-col gap-2">
                  {detail.businesses.map((business) => (
                    <Link
                      key={business.businessId}
                      href={`/admin/businesses/${business.businessId}`}
                      className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm hover:bg-muted"
                    >
                      <span className="font-medium text-foreground">{business.businessName}</span>
                      <StatusBadge status={business.role} />
                    </Link>
                  ))}
                </TabsContent>

                <TabsContent value="activity" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Login terakhir {formatDateTime(detail.lastLoginAt)} dari perangkat yang dikenal.
                  </p>
                </TabsContent>

                <TabsContent value="security" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Two-factor authentication belum diaktifkan.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title={
          confirmTarget?.action === "SUSPEND"
            ? `Suspend ${confirmTarget?.admin.name}?`
            : `Aktifkan kembali ${confirmTarget?.admin.name}?`
        }
        description={
          confirmTarget?.action === "SUSPEND"
            ? "Admin tidak akan bisa mengakses dashboard bisnis manapun selama status suspended."
            : undefined
        }
        confirmLabel={confirmTarget?.action === "SUSPEND" ? "Suspend" : "Activate"}
        variant={confirmTarget?.action === "SUSPEND" ? "destructive" : "default"}
        onConfirm={() =>
          toast.success(
            confirmTarget?.action === "SUSPEND"
              ? `${confirmTarget.admin.name} berhasil di-suspend.`
              : `${confirmTarget?.admin.name} berhasil diaktifkan kembali.`
          )
        }
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
