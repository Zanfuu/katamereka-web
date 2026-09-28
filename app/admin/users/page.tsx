"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  BanIcon,
  CalendarIcon,
  ClockIcon,
  DownloadIcon,
  HomeIcon,
  MailIcon,
  RotateCcwIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { DateRangeSelector, type DateRangeValue } from "@/components/date-range-selector"
import { FilterDropdown } from "@/components/filter-dropdown"
import { PageHeader } from "@/components/page-header"
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
import { formatDate, formatDateTime } from "@/lib/format"
import {
  AdminApiError,
  deleteCustomer,
  fetchCustomers,
  updateCustomerStatus,
  type CustomerListItem,
  type PlatformUserStatus,
} from "@/lib/admin-api"

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

export default function UserManagementPage() {
  const [customers, setCustomers] = React.useState<CustomerListItem[]>([])
  const [stats, setStats] = React.useState({ total_customer: 0, active_customer: 0, suspended_customer: 0 })
  const [totalPages, setTotalPages] = React.useState(1)
  const [apiPage, setApiPage] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | undefined>()

  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [dateRange, setDateRange] = React.useState<DateRangeValue>({ preset: "30d" })

  // Debounces the search box so it doesn't refetch on every keystroke. The
  // page reset lives in this same timer callback (an external-timer callback,
  // not a synchronous effect body) so changing the search term also jumps
  // back to page 1 of the API result set.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setApiPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value)
    setApiPage(1)
  }

  function handleDateRangeChange(range: DateRangeValue) {
    setDateRange(range)
    setApiPage(1)
  }

  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = React.useState<{
    customer: CustomerListItem
    action: "SUSPEND" | "BAN" | "RESTORE" | "DELETE"
  } | null>(null)

  const selected = customers.find((c) => c.id === selectedId) ?? null
  const PAGE_LIMIT = 10
  // Bumped after a status/delete mutation to re-trigger the fetch effect
  // below without duplicating its fetch logic in every handler.
  const [refreshTick, setRefreshTick] = React.useState(0)

  React.useEffect(() => {
    let ignore = false
    async function run() {
      try {
        const res = await fetchCustomers({
          page: apiPage,
          limit: PAGE_LIMIT,
          search: debouncedSearch || undefined,
          status: statusFilter === "all" ? undefined : (statusFilter as PlatformUserStatus),
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        })
        if (ignore) return
        setCustomers(res.data)
        setStats(res.stats)
        setTotalPages(res.pagination.total_pages)
        setError(undefined)
      } catch (e) {
        if (!ignore) {
          setError(e instanceof AdminApiError ? e.message : "Gagal memuat data customer dari server")
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    run()
    return () => {
      ignore = true
    }
  }, [apiPage, debouncedSearch, statusFilter, dateRange, refreshTick])

  function resetFilters() {
    setSearch("")
    setDebouncedSearch("")
    setStatusFilter("all")
    setApiPage(1)
  }

  function openDetail(customer: CustomerListItem) {
    setSelectedId(customer.id)
  }

  async function handleConfirm() {
    if (!confirmTarget) return
    const { customer, action } = confirmTarget
    try {
      if (action === "DELETE") {
        await deleteCustomer(customer.id)
        toast.success(`${customer.name} berhasil dihapus.`)
        if (selectedId === customer.id) setSelectedId(null)
      } else {
        const nextStatus: PlatformUserStatus =
          action === "SUSPEND" ? "SUSPENDED" : action === "BAN" ? "BANNED" : "ACTIVE"
        await updateCustomerStatus(customer.id, nextStatus)
        toast.success(`Status ${customer.name} berhasil diperbarui.`)
      }
      setRefreshTick((t) => t + 1)
    } catch (e) {
      toast.error(e instanceof AdminApiError ? e.message : "Aksi gagal diproses")
    }
  }

  const columns: ResourceTableColumn<CustomerListItem>[] = [
    {
      key: "name",
      header: "Nama",
      render: (customer) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback className={avatarTone(customer.id)}>{initials(customer.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{customer.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (customer) => <span className="text-muted-foreground">{customer.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (customer) => <StatusBadge status="gray" label={customer.role} />,
    },
    {
      key: "status",
      header: "Status",
      render: (customer) => <StatusBadge status={customer.status} />,
    },
    {
      key: "last_login_at",
      header: "Last Login",
      render: (customer) => (
        <span className="text-muted-foreground">
          {customer.last_login_at ? formatDateTime(customer.last_login_at) : "-"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Bergabung",
      render: (customer) => <span className="text-muted-foreground">{formatDate(customer.created_at)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (customer) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <UserIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openDetail(customer)}>View</DropdownMenuItem>
              {customer.status === "ACTIVE" && (
                <DropdownMenuItem onClick={() => setConfirmTarget({ customer, action: "SUSPEND" })}>
                  Suspend
                </DropdownMenuItem>
              )}
              {customer.status !== "BANNED" && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setConfirmTarget({ customer, action: "BAN" })}
                >
                  Ban
                </DropdownMenuItem>
              )}
              {customer.status !== "ACTIVE" && (
                <DropdownMenuItem onClick={() => setConfirmTarget({ customer, action: "RESTORE" })}>
                  Restore
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmTarget({ customer, action: "DELETE" })}
              >
                Hapus
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
            <BreadcrumbPage>User Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="User Management"
        description="Kelola akun customer/reviewer yang menulis dan menggunakan review di platform KataMereka."
        action={
          <>
            <DateRangeSelector onChange={handleDateRangeChange} />
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
          value={stats.total_customer}
          icon={UsersIcon}
          onClick={() => handleStatusFilterChange("all")}
        />
        <StatCard
          label="Active Users"
          value={stats.active_customer}
          icon={UserIcon}
          onClick={() => handleStatusFilterChange("ACTIVE")}
        />
        <StatCard
          label="Suspended Users"
          value={stats.suspended_customer}
          icon={BanIcon}
          onClick={() => handleStatusFilterChange("SUSPENDED")}
        />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput value={search} onChange={setSearch} placeholder="Cari nama atau email..." />
            <div className="flex flex-wrap items-center gap-2">
              <FilterDropdown label="Status" options={STATUS_OPTIONS} value={statusFilter} onChange={handleStatusFilterChange} />
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <RotateCcwIcon />
                Reset
              </Button>
            </div>
          </div>

          <ResourceTable
            data={customers}
            columns={columns}
            getRowId={(customer) => customer.id}
            onRowClick={openDetail}
            rowClassName={(customer) => (customer.id === selectedId ? "bg-primary/5" : undefined)}
            isLoading={isLoading}
            error={error}
            itemLabel="user"
            pageSize={PAGE_LIMIT}
            pageSizeOptions={[PAGE_LIMIT]}
            emptyTitle="Tidak ada user ditemukan."
          />

          {!isLoading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Halaman {apiPage} dari {totalPages}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={apiPage <= 1}
                  onClick={() => setApiPage((p) => Math.max(1, p - 1))}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={apiPage >= totalPages}
                  onClick={() => setApiPage((p) => Math.min(totalPages, p + 1))}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
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

            <div className="flex flex-col gap-4 p-4">
              <div className="flex flex-col gap-3 text-sm">
                <InfoRow icon={UserIcon} label="Nama Lengkap" value={selected.name} />
                <InfoRow icon={MailIcon} label="Email" value={selected.email} />
                <InfoRow icon={ShieldIcon} label="Role" value={<StatusBadge status="gray" label={selected.role} />} />
                <InfoRow icon={CalendarIcon} label="Bergabung" value={formatDate(selected.created_at)} />
                <InfoRow
                  icon={ClockIcon}
                  label="Terakhir Login"
                  value={selected.last_login_at ? formatDateTime(selected.last_login_at) : "Belum pernah login"}
                />
                <InfoRow icon={ShieldIcon} label="Status" value={<StatusBadge status={selected.status} />} />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {selected.status === "ACTIVE" && (
                  <Button
                    variant="outline"
                    onClick={() => setConfirmTarget({ customer: selected, action: "SUSPEND" })}
                  >
                    Suspend User
                  </Button>
                )}
                {selected.status !== "BANNED" && (
                  <Button
                    variant="outline"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={() => setConfirmTarget({ customer: selected, action: "BAN" })}
                  >
                    <BanIcon />
                    Ban User
                  </Button>
                )}
                {selected.status !== "ACTIVE" && (
                  <Button
                    variant="outline"
                    onClick={() => setConfirmTarget({ customer: selected, action: "RESTORE" })}
                  >
                    Restore User
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={() => setConfirmTarget({ customer: selected, action: "DELETE" })}
                >
                  Hapus User
                </Button>
              </div>
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
              : confirmTarget?.action === "DELETE"
                ? "Hapus"
                : "Restore"
        } ${confirmTarget?.customer.name}?`}
        description={confirmTarget?.action === "DELETE" ? "Akun akan dihapus permanen dan tidak dapat dikembalikan." : undefined}
        confirmLabel={
          confirmTarget?.action === "SUSPEND"
            ? "Suspend"
            : confirmTarget?.action === "BAN"
              ? "Ban User"
              : confirmTarget?.action === "DELETE"
                ? "Hapus"
                : "Restore"
        }
        variant={confirmTarget?.action === "RESTORE" ? "default" : "destructive"}
        onConfirm={handleConfirm}
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
