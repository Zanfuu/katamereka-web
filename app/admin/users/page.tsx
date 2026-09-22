"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  BadgeCheckIcon,
  BanIcon,
  CalendarIcon,
  ClockIcon,
  DownloadIcon,
  HomeIcon,
  MailIcon,
  RotateCcwIcon,
  ScaleIcon,
  ShieldIcon,
  StarIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { DateRangeSelector } from "@/components/date-range-selector"
import { EmptyState } from "@/components/empty-state"
import { FilterDropdown } from "@/components/filter-dropdown"
import { PageHeader } from "@/components/page-header"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { ReviewCard } from "@/components/review-card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, formatDateTime } from "@/lib/format"
import { reports } from "@/lib/mock/reports"
import { reviews } from "@/lib/mock/reviews"
import { platformUsers as initialPlatformUsers } from "@/lib/mock/users"
import type { User } from "@/lib/types"

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "BANNED", label: "Banned" },
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

function verifiedReviewCount(user: User) {
  return reviews.filter((r) => r.reviewerId === user.id && r.isVerified).length
}

function reportCount(user: User) {
  return reports.filter((r) => r.reviewerName === user.name).length
}

export default function UserManagementPage() {
  const [users, setUsers] = React.useState<User[]>(initialPlatformUsers)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [confirmTarget, setConfirmTarget] = React.useState<{
    user: User
    action: "SUSPEND" | "BAN" | "RESTORE"
  } | null>(null)

  const selected = users.find((u) => u.id === selectedId) ?? null

  const counts = {
    total: users.length,
    active: users.filter((u) => u.status === "ACTIVE").length,
    suspended: users.filter((u) => u.status === "SUSPENDED").length,
    banned: users.filter((u) => u.status === "BANNED").length,
  }

  const filtered = users.filter((user) => {
    if (statusFilter !== "all" && user.status !== statusFilter) return false
    if (
      search &&
      !user.name.toLowerCase().includes(search.toLowerCase()) &&
      !user.email.toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }
    return true
  })

  function resetFilters() {
    setSearch("")
    setStatusFilter("all")
  }

  function openDetail(user: User) {
    setSelectedId(user.id)
  }

  function applyStatus(userId: string, status: User["status"]) {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)))
  }

  const columns: ResourceTableColumn<User>[] = [
    {
      key: "name",
      header: "Nama",
      sortValue: (user) => user.name,
      render: (user) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback className={avatarTone(user.id)}>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{user.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (user) => <span className="text-muted-foreground">{user.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: () => <StatusBadge status="gray" label="Customer" />,
    },
    {
      key: "reviewCount",
      header: "Reviews",
      sortValue: (user) => user.reviewCount,
      render: (user) => user.reviewCount,
    },
    {
      key: "verifiedReviews",
      header: "Verified Reviews",
      render: (user) => verifiedReviewCount(user),
    },
    {
      key: "reports",
      header: "Reports",
      render: (user) => {
        const count = reportCount(user)
        return count > 0 ? (
          <span className="font-medium text-destructive">{count}</span>
        ) : (
          <span className="text-muted-foreground">0</span>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: "joinedAt",
      header: "Bergabung",
      sortValue: (user) => user.joinedAt,
      render: (user) => <span className="text-muted-foreground">{formatDate(user.joinedAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (user) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <UserIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openDetail(user)}>View</DropdownMenuItem>
              {user.status === "ACTIVE" && (
                <DropdownMenuItem onClick={() => setConfirmTarget({ user, action: "SUSPEND" })}>
                  Suspend
                </DropdownMenuItem>
              )}
              {user.status !== "BANNED" && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setConfirmTarget({ user, action: "BAN" })}
                >
                  Ban
                </DropdownMenuItem>
              )}
              {user.status !== "ACTIVE" && (
                <DropdownMenuItem onClick={() => setConfirmTarget({ user, action: "RESTORE" })}>
                  Restore
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  const selectedReviews = selected ? reviews.filter((r) => r.reviewerId === selected.id) : []
  const selectedReports = selected ? reports.filter((r) => r.reviewerName === selected.name) : []

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
            <BreadcrumbPage>User Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="User Management"
        description="Kelola akun customer/reviewer yang menulis dan menggunakan review di platform KataMereka."
        action={
          <>
            <DateRangeSelector />
            <Button variant="outline" onClick={() => toast.success("Data user berhasil diexport.")}>
              <DownloadIcon />
              Export Data
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Users"
          value={counts.total}
          delta="+18%"
          hint="dari bulan lalu"
          icon={UsersIcon}
          onClick={() => setStatusFilter("all")}
        />
        <StatCard
          label="Active Users"
          value={counts.active}
          delta="+16%"
          hint="dari bulan lalu"
          icon={UserIcon}
          onClick={() => setStatusFilter("ACTIVE")}
        />
        <StatCard
          label="Suspended Users"
          value={counts.suspended}
          delta="+5%"
          deltaTone="negative"
          hint="dari bulan lalu"
          icon={BanIcon}
          onClick={() => setStatusFilter("SUSPENDED")}
        />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput value={search} onChange={setSearch} placeholder="Cari nama atau email..." />
            <div className="flex flex-wrap items-center gap-2">
              <FilterDropdown label="Status" options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <RotateCcwIcon />
                Reset
              </Button>
            </div>
          </div>

          <ResourceTable
            data={filtered}
            columns={columns}
            getRowId={(user) => user.id}
            onRowClick={openDetail}
            rowClassName={(user) => (user.id === selectedId ? "bg-primary/5" : undefined)}
            selectedIds={selectedIds}
            onToggleRow={(id, checked) =>
              setSelectedIds((prev) => {
                const next = new Set(prev)
                if (checked) next.add(id)
                else next.delete(id)
                return next
              })
            }
            onToggleAll={(checked) => setSelectedIds(checked ? new Set(filtered.map((u) => u.id)) : new Set())}
            itemLabel="user"
            pageSize={10}
            emptyTitle="Tidak ada user ditemukan."
          />
        </div>

        {selected && (
          <div className="w-full shrink-0 rounded-xl border border-border bg-card lg:sticky lg:top-4 lg:w-[360px]">
            <div className="flex items-start justify-between gap-2 border-b border-border p-4">
              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarFallback className={avatarTone(selected.id)}>
                    {initials(selected.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.email}</p>
                  <div className="mt-1">
                    <StatusBadge status={selected.status} />
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setSelectedId(null)}>
                <XIcon className="size-4" />
              </Button>
            </div>

            <div className="p-4">
              <Tabs defaultValue="profile">
                <TabsList className="w-full">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-3 text-sm">
                    <InfoRow icon={UserIcon} label="Nama Lengkap" value={selected.name} />
                    <InfoRow icon={MailIcon} label="Email" value={selected.email} />
                    <InfoRow icon={ShieldIcon} label="Role" value={<StatusBadge status="gray" label="Customer" />} />
                    <InfoRow icon={StarIcon} label="Total Reviews" value={String(selected.reviewCount)} />
                    <InfoRow
                      icon={BadgeCheckIcon}
                      label="Verified Reviews"
                      value={String(verifiedReviewCount(selected))}
                    />
                    <InfoRow icon={CalendarIcon} label="Bergabung" value={formatDate(selected.joinedAt)} />
                    <InfoRow icon={ClockIcon} label="Terakhir Aktif" value={formatDateTime(selected.lastActiveAt)} />
                    <InfoRow icon={ShieldIcon} label="Status" value={<StatusBadge status={selected.status} />} />
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    {selected.status === "ACTIVE" && (
                      <Button
                        variant="outline"
                        onClick={() => setConfirmTarget({ user: selected, action: "SUSPEND" })}
                      >
                        Suspend User
                      </Button>
                    )}
                    {selected.status !== "BANNED" && (
                      <Button
                        variant="outline"
                        className="border-destructive/40 text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmTarget({ user: selected, action: "BAN" })}
                      >
                        <BanIcon />
                        Ban User
                      </Button>
                    )}
                    {selected.status !== "ACTIVE" && (
                      <Button
                        variant="outline"
                        onClick={() => setConfirmTarget({ user: selected, action: "RESTORE" })}
                      >
                        Restore User
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-4 flex flex-col gap-3">
                  {selectedReviews.length === 0 ? (
                    <EmptyState icon={StarIcon} title="Belum ada review yang ditulis user ini." />
                  ) : (
                    selectedReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} showBusiness showModerationStatus />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="reports" className="mt-4 flex flex-col gap-3">
                  {selectedReports.length === 0 ? (
                    <EmptyState icon={ScaleIcon} title="Tidak ada laporan terhadap review user ini." />
                  ) : (
                    selectedReports.map((report) => (
                      <div key={report.id} className="flex flex-col gap-1.5 rounded-lg border border-border p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{report.businessName}</span>
                          <StatusBadge status={report.status} />
                        </div>
                        <p className="text-muted-foreground">{report.reason}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(report.createdAt)}</p>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="activity" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Terakhir aktif {formatDateTime(selected.lastActiveAt)}. Total {selected.reviewCount} review
                    ditulis di KataMereka.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>

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
        onConfirm={() => {
          if (!confirmTarget) return
          applyStatus(
            confirmTarget.user.id,
            confirmTarget.action === "SUSPEND"
              ? "SUSPENDED"
              : confirmTarget.action === "BAN"
                ? "BANNED"
                : "ACTIVE"
          )
          toast.success(`Status ${confirmTarget.user.name} berhasil diperbarui.`)
        }}
      />
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
