"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  BanIcon,
  BuildingIcon,
  CalendarIcon,
  ClockIcon,
  DownloadIcon,
  HomeIcon,
  MailIcon,
  PlusIcon,
  RotateCcwIcon,
  ShieldIcon,
  UserCogIcon,
  UserIcon,
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
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { formatDate, formatDateTime } from "@/lib/format"
import {
  AdminApiError,
  createAdmin,
  deleteAdmin,
  fetchAdmins,
  updateAdminStatus,
  type AdminListItem,
  type PlatformUserStatus,
} from "@/lib/admin-api"

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING", label: "Pending" },
  { value: "SUSPENDED", label: "Suspended" },
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

function emptyForm() {
  return { name: "", email: "", password: "", status: "ACTIVE" as PlatformUserStatus }
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = React.useState<AdminListItem[]>([])
  const [stats, setStats] = React.useState({ total_admin: 0, active_admin: 0, suspended_admin: 0 })
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
    admin: AdminListItem
    action: "SUSPEND" | "ACTIVATE" | "DELETE"
  } | null>(null)
  const [addOpen, setAddOpen] = React.useState(false)
  const [form, setForm] = React.useState(emptyForm())
  const [submitting, setSubmitting] = React.useState(false)

  const selected = admins.find((a) => a.id === selectedId) ?? null
  const PAGE_LIMIT = 10
  // Bumped after a create/status/delete mutation to re-trigger the fetch
  // effect below without duplicating its fetch logic in every handler.
  const [refreshTick, setRefreshTick] = React.useState(0)

  React.useEffect(() => {
    let ignore = false
    async function run() {
      try {
        const res = await fetchAdmins({
          page: apiPage,
          limit: PAGE_LIMIT,
          search: debouncedSearch || undefined,
          status: statusFilter === "all" ? undefined : (statusFilter as PlatformUserStatus),
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        })
        if (ignore) return
        setAdmins(res.data)
        setStats(res.stats)
        setTotalPages(res.pagination.total_pages)
        setError(undefined)
      } catch (e) {
        if (!ignore) {
          setError(e instanceof AdminApiError ? e.message : "Gagal memuat data admin dari server")
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

  function openDetail(admin: AdminListItem) {
    setSelectedId(admin.id)
  }

  async function handleAddAdmin() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Nama, email, dan password wajib diisi.")
      return
    }
    if (form.password.length < 6) {
      toast.error("Password minimal 6 karakter.")
      return
    }
    setSubmitting(true)
    try {
      await createAdmin({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        status: form.status,
      })
      toast.success("Admin berhasil ditambahkan.")
      setAddOpen(false)
      setForm(emptyForm())
      setApiPage(1)
      setRefreshTick((t) => t + 1)
    } catch (e) {
      toast.error(e instanceof AdminApiError ? e.message : "Gagal menambahkan admin")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirm() {
    if (!confirmTarget) return
    const { admin, action } = confirmTarget
    try {
      if (action === "DELETE") {
        await deleteAdmin(admin.id)
        toast.success(`${admin.name} berhasil dihapus.`)
        if (selectedId === admin.id) setSelectedId(null)
      } else {
        const nextStatus: PlatformUserStatus = action === "SUSPEND" ? "SUSPENDED" : "ACTIVE"
        await updateAdminStatus(admin.id, nextStatus)
        toast.success(
          action === "SUSPEND"
            ? `${admin.name} berhasil di-suspend.`
            : `${admin.name} berhasil diaktifkan kembali.`
        )
      }
      setRefreshTick((t) => t + 1)
    } catch (e) {
      toast.error(e instanceof AdminApiError ? e.message : "Aksi gagal diproses")
    }
  }

  const columns: ResourceTableColumn<AdminListItem>[] = [
    {
      key: "name",
      header: "Nama",
      render: (admin) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback className={avatarTone(admin.id)}>{initials(admin.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{admin.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (admin) => <span className="text-muted-foreground">{admin.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (admin) => <StatusBadge status="ACTIVE" label={admin.role} />,
    },
    {
      key: "business_count",
      header: "Jumlah Bisnis",
      render: (admin) => (admin.business_count > 0 ? admin.business_count : "-"),
    },
    {
      key: "status",
      header: "Status",
      render: (admin) => <StatusBadge status={admin.status} />,
    },
    {
      key: "last_login_at",
      header: "Last Login",
      render: (admin) => (
        <span className="text-muted-foreground">
          {admin.last_login_at ? formatDateTime(admin.last_login_at) : "-"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Bergabung",
      render: (admin) => <span className="text-muted-foreground">{formatDate(admin.created_at)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (admin) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <UserCogIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openDetail(admin)}>View</DropdownMenuItem>
              {admin.status === "SUSPENDED" ? (
                <DropdownMenuItem onClick={() => setConfirmTarget({ admin, action: "ACTIVATE" })}>
                  Activate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setConfirmTarget({ admin, action: "SUSPEND" })}
                >
                  Suspend
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmTarget({ admin, action: "DELETE" })}
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
            <BreadcrumbPage>Admin Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Admin Management"
        description="Kelola akun admin bisnis yang menggunakan platform KataMereka."
        action={
          <>
            <DateRangeSelector onChange={handleDateRangeChange} />
            <Button variant="outline" onClick={() => toast.success("Data admin berhasil diexport.")}>
              <DownloadIcon />
              Export Data
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <PlusIcon />
              Tambah Admin
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Admin"
          value={stats.total_admin}
          icon={UserCogIcon}
          onClick={() => handleStatusFilterChange("all")}
        />
        <StatCard
          label="Active Admin"
          value={stats.active_admin}
          icon={UserIcon}
          onClick={() => handleStatusFilterChange("ACTIVE")}
        />
        <StatCard
          label="Suspended Admin"
          value={stats.suspended_admin}
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
            data={admins}
            columns={columns}
            getRowId={(admin) => admin.id}
            onRowClick={openDetail}
            rowClassName={(admin) => (admin.id === selectedId ? "bg-primary/5" : undefined)}
            isLoading={isLoading}
            error={error}
            itemLabel="admin"
            pageSize={PAGE_LIMIT}
            pageSizeOptions={[PAGE_LIMIT]}
            emptyTitle="Tidak ada admin ditemukan."
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
                <InfoRow icon={ShieldIcon} label="Role" value={<StatusBadge status="ACTIVE" label={selected.role} />} />
                <InfoRow
                  icon={BuildingIcon}
                  label="Jumlah Bisnis"
                  value={selected.business_count > 0 ? String(selected.business_count) : "-"}
                />
                <InfoRow icon={CalendarIcon} label="Tanggal Bergabung" value={formatDate(selected.created_at)} />
                <InfoRow
                  icon={ClockIcon}
                  label="Terakhir Login"
                  value={selected.last_login_at ? formatDateTime(selected.last_login_at) : "Belum pernah login"}
                />
                <InfoRow icon={ShieldIcon} label="Status" value={<StatusBadge status={selected.status} />} />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {selected.status === "SUSPENDED" ? (
                  <Button
                    variant="outline"
                    onClick={() => setConfirmTarget({ admin: selected, action: "ACTIVATE" })}
                  >
                    Activate Admin
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={() => setConfirmTarget({ admin: selected, action: "SUSPEND" })}
                  >
                    <BanIcon />
                    Suspend Admin
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={() => setConfirmTarget({ admin: selected, action: "DELETE" })}
                >
                  Hapus Admin
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={(open) => !submitting && setAddOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Admin</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="admin-name">Nama Lengkap</FieldLabel>
              <Input
                id="admin-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="admin-email">Email</FieldLabel>
              <Input
                id="admin-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="admin-password">Password</FieldLabel>
              <Input
                id="admin-password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleAddAdmin} disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title={
          confirmTarget?.action === "SUSPEND"
            ? `Suspend ${confirmTarget?.admin.name}?`
            : confirmTarget?.action === "DELETE"
              ? `Hapus ${confirmTarget?.admin.name}?`
              : `Aktifkan kembali ${confirmTarget?.admin.name}?`
        }
        description={
          confirmTarget?.action === "SUSPEND"
            ? "Admin tidak akan bisa mengakses dashboard bisnis manapun selama status suspended."
            : confirmTarget?.action === "DELETE"
              ? "Akun admin akan dihapus permanen dan tidak dapat dikembalikan."
              : undefined
        }
        confirmLabel={
          confirmTarget?.action === "SUSPEND"
            ? "Suspend"
            : confirmTarget?.action === "DELETE"
              ? "Hapus"
              : "Activate"
        }
        variant={confirmTarget?.action === "ACTIVATE" ? "default" : "destructive"}
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
