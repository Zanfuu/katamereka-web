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
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  RotateCcwIcon,
  ShieldIcon,
  UserCogIcon,
  UserIcon,
  XIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { DateRangeSelector } from "@/components/date-range-selector"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { formatDate, formatDateTime } from "@/lib/format"
import { adminAccounts as initialAdminAccounts, type AdminAccount } from "@/lib/mock/admins"

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

function accountRole(admin: AdminAccount): "ADMIN_BISNIS" | "CUSTOMER" {
  return admin.businesses.length > 0 ? "ADMIN_BISNIS" : "CUSTOMER"
}

function emptyForm() {
  return { name: "", email: "", phone: "" }
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = React.useState<AdminAccount[]>(initialAdminAccounts)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [confirmTarget, setConfirmTarget] = React.useState<{
    admin: AdminAccount
    action: "SUSPEND" | "ACTIVATE"
  } | null>(null)
  const [formDialog, setFormDialog] = React.useState<"ADD" | "EDIT" | null>(null)
  const [form, setForm] = React.useState(emptyForm())
  const [editingNote, setEditingNote] = React.useState(false)
  const [noteDraft, setNoteDraft] = React.useState("")

  const selected = admins.find((a) => a.id === selectedId) ?? null

  const counts = {
    total: admins.length,
    active: admins.filter((a) => a.status === "ACTIVE").length,
    suspended: admins.filter((a) => a.status === "SUSPENDED").length,
  }

  const filtered = admins.filter((admin) => {
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

  function resetFilters() {
    setSearch("")
    setStatusFilter("all")
  }

  function openAdd() {
    setForm(emptyForm())
    setFormDialog("ADD")
  }

  function openEdit(admin: AdminAccount) {
    setForm({ name: admin.name, email: admin.email, phone: admin.phone })
    setFormDialog("EDIT")
  }

  function openDetail(admin: AdminAccount) {
    setSelectedId(admin.id)
    setEditingNote(false)
    setNoteDraft(admin.note ?? "")
  }

  function saveNote() {
    setAdmins((prev) =>
      prev.map((a) => (a.id === selectedId ? { ...a, note: noteDraft } : a))
    )
    setEditingNote(false)
    toast.success("Catatan internal berhasil disimpan.")
  }

  const columns: ResourceTableColumn<AdminAccount>[] = [
    {
      key: "name",
      header: "Nama",
      sortValue: (admin) => admin.name,
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
      render: (admin) =>
        accountRole(admin) === "ADMIN_BISNIS" ? (
          <StatusBadge status="ACTIVE" label="Admin Bisnis" />
        ) : (
          <StatusBadge status="gray" label="Customer" />
        ),
    },
    {
      key: "businesses",
      header: "Jumlah Bisnis",
      sortValue: (admin) => admin.businesses.length,
      render: (admin) => (admin.businesses.length > 0 ? admin.businesses.length : "-"),
    },
    {
      key: "status",
      header: "Status",
      render: (admin) => <StatusBadge status={admin.status} />,
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
      key: "joinedAt",
      header: "Bergabung",
      sortValue: (admin) => admin.joinedAt,
      render: (admin) => <span className="text-muted-foreground">{formatDate(admin.joinedAt)}</span>,
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
              <DropdownMenuItem onClick={() => openEdit(admin)}>Edit Akun</DropdownMenuItem>
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
            <DateRangeSelector />
            <Button variant="outline" onClick={() => toast.success("Data admin berhasil diexport.")}>
              <DownloadIcon />
              Export Data
            </Button>
            <Button onClick={openAdd}>
              <PlusIcon />
              Tambah Admin
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Admin"
          value={counts.total}
          delta="+12%"
          hint="dari bulan lalu"
          icon={UserCogIcon}
          onClick={() => setStatusFilter("all")}
        />
        <StatCard
          label="Active Admin"
          value={counts.active}
          delta="+14%"
          hint="dari bulan lalu"
          icon={UserIcon}
          onClick={() => setStatusFilter("ACTIVE")}
        />
        <StatCard
          label="Suspended Admin"
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
            getRowId={(admin) => admin.id}
            onRowClick={openDetail}
            rowClassName={(admin) => (admin.id === selectedId ? "bg-primary/5" : undefined)}
            selectedIds={selectedIds}
            onToggleRow={(id, checked) =>
              setSelectedIds((prev) => {
                const next = new Set(prev)
                if (checked) next.add(id)
                else next.delete(id)
                return next
              })
            }
            onToggleAll={(checked) => setSelectedIds(checked ? new Set(filtered.map((a) => a.id)) : new Set())}
            itemLabel="admin"
            pageSize={10}
            emptyTitle="Tidak ada admin ditemukan."
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
              <Tabs defaultValue="informasi">
                <TabsList className="w-full">
                  <TabsTrigger value="informasi">Informasi</TabsTrigger>
                  <TabsTrigger value="bisnis">Bisnis</TabsTrigger>
                  <TabsTrigger value="aktivitas">Aktivitas</TabsTrigger>
                  <TabsTrigger value="keamanan">Keamanan</TabsTrigger>
                </TabsList>

                <TabsContent value="informasi" className="mt-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-3 text-sm">
                    <InfoRow icon={UserIcon} label="Nama Lengkap" value={selected.name} />
                    <InfoRow icon={MailIcon} label="Email" value={selected.email} />
                    <InfoRow icon={PhoneIcon} label="No. Telepon" value={selected.phone} />
                    <InfoRow
                      icon={ShieldIcon}
                      label="Role"
                      value={
                        accountRole(selected) === "ADMIN_BISNIS" ? (
                          <StatusBadge status="ACTIVE" label="Admin Bisnis" />
                        ) : (
                          <StatusBadge status="gray" label="Customer" />
                        )
                      }
                    />
                    <InfoRow
                      icon={BuildingIcon}
                      label="Jumlah Bisnis"
                      value={selected.businesses.length > 0 ? String(selected.businesses.length) : "-"}
                    />
                    <InfoRow icon={CalendarIcon} label="Tanggal Bergabung" value={formatDate(selected.joinedAt)} />
                    <InfoRow icon={ClockIcon} label="Terakhir Login" value={formatDateTime(selected.lastLoginAt)} />
                    <InfoRow icon={ShieldIcon} label="Status" value={<StatusBadge status={selected.status} />} />
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        Catatan Internal
                      </span>
                      {!editingNote && (
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditingNote(true)}>
                          <PencilIcon className="size-3.5" />
                        </Button>
                      )}
                    </div>
                    {editingNote ? (
                      <div className="flex flex-col gap-2">
                        <Textarea
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          rows={3}
                          placeholder="Tulis catatan internal tentang admin ini..."
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingNote(false)}>
                            Batal
                          </Button>
                          <Button size="sm" onClick={saveNote}>
                            Simpan
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="rounded-lg bg-secondary p-3 text-sm text-foreground/90">
                        {selected.note || "Belum ada catatan internal."}
                      </p>
                    )}
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
                    <Button variant="outline" onClick={() => openEdit(selected)}>
                      <PencilIcon />
                      Edit Akun
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="bisnis" className="mt-4 flex flex-col gap-2">
                  {selected.businesses.length === 0 && (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      Admin ini belum mengelola bisnis apa pun.
                    </p>
                  )}
                  {selected.businesses.map((business) => (
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

                <TabsContent value="aktivitas" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Login terakhir {formatDateTime(selected.lastLoginAt)} dari perangkat yang dikenal.
                  </p>
                </TabsContent>

                <TabsContent value="keamanan" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Two-factor authentication belum diaktifkan.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!formDialog} onOpenChange={(open) => !open && setFormDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formDialog === "ADD" ? "Tambah Admin" : "Edit Akun"}</DialogTitle>
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
              <FieldLabel htmlFor="admin-phone">No. Telepon</FieldLabel>
              <Input
                id="admin-phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialog(null)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                if (!form.name.trim() || !form.email.trim()) {
                  toast.error("Nama dan email wajib diisi.")
                  return
                }
                if (formDialog === "ADD") {
                  const newAdmin: AdminAccount = {
                    id: `u-admin-${Date.now()}`,
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    status: "PENDING",
                    joinedAt: new Date().toISOString().slice(0, 10),
                    lastLoginAt: new Date().toISOString(),
                    businesses: [],
                  }
                  setAdmins((prev) => [newAdmin, ...prev])
                  toast.success("Admin berhasil ditambahkan.")
                } else if (selected) {
                  setAdmins((prev) =>
                    prev.map((a) =>
                      a.id === selected.id
                        ? { ...a, name: form.name, email: form.email, phone: form.phone }
                        : a
                    )
                  )
                  toast.success("Akun admin berhasil diperbarui.")
                }
                setFormDialog(null)
              }}
            >
              Simpan
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
            : `Aktifkan kembali ${confirmTarget?.admin.name}?`
        }
        description={
          confirmTarget?.action === "SUSPEND"
            ? "Admin tidak akan bisa mengakses dashboard bisnis manapun selama status suspended."
            : undefined
        }
        confirmLabel={confirmTarget?.action === "SUSPEND" ? "Suspend" : "Activate"}
        variant={confirmTarget?.action === "SUSPEND" ? "destructive" : "default"}
        onConfirm={() => {
          setAdmins((prev) =>
            prev.map((a) =>
              a.id === confirmTarget?.admin.id
                ? { ...a, status: confirmTarget.action === "SUSPEND" ? "SUSPENDED" : "ACTIVE" }
                : a
            )
          )
          toast.success(
            confirmTarget?.action === "SUSPEND"
              ? `${confirmTarget.admin.name} berhasil di-suspend.`
              : `${confirmTarget?.admin.name} berhasil diaktifkan kembali.`
          )
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
