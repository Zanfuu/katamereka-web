"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  BuildingIcon,
  ClockIcon,
  HomeIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RotateCcwIcon,
  StarIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { FilterDropdown } from "@/components/filter-dropdown"
import { PageHeader } from "@/components/page-header"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { SearchInput } from "@/components/search-input"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/format"
import { slugify } from "@/lib/slug"
import {
  AdminApiError,
  createBusiness,
  deleteBusiness,
  fetchBusinesses,
  updateBusiness,
  type BusinessListItem,
  type PlatformBusinessStatus,
} from "@/lib/admin-api"

const STATUS_LABELS: Record<PlatformBusinessStatus, string> = {
  ACTIVE: "Active",
  PENDING: "Pending",
  CLAIMED: "Claimed",
  SUSPENDED: "Suspended",
  INACTIVE: "Inactive",
}

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  ...(Object.keys(STATUS_LABELS) as PlatformBusinessStatus[]).map((value) => ({
    value,
    label: STATUS_LABELS[value],
  })),
]

const PAGE_LIMIT = 10

interface BusinessForm {
  name: string
  slug: string
  category: string
  address: string
  city: string
  province: string
  phone: string
  email: string
  website: string
  description: string
  status: PlatformBusinessStatus
}

function emptyForm(): BusinessForm {
  return {
    name: "",
    slug: "",
    category: "",
    address: "",
    city: "",
    province: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    status: "ACTIVE",
  }
}

function formFromBusiness(b: BusinessListItem): BusinessForm {
  return {
    name: b.name,
    slug: b.slug,
    category: b.category ?? "",
    address: b.address ?? "",
    city: b.city ?? "",
    province: b.province ?? "",
    phone: b.phone ?? "",
    email: b.email ?? "",
    website: b.website ?? "",
    description: b.description ?? "",
    status: b.status,
  }
}

// Blank optional fields are sent as undefined so the API leaves them unset
// instead of storing empty strings.
function toPayload(form: BusinessForm) {
  const opt = (v: string) => (v.trim() ? v.trim() : undefined)
  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    category: opt(form.category),
    address: opt(form.address),
    city: opt(form.city),
    province: opt(form.province),
    phone: opt(form.phone),
    email: opt(form.email),
    website: opt(form.website),
    description: opt(form.description),
    status: form.status,
  }
}

export default function AddBusinessPage() {
  const [businesses, setBusinesses] = React.useState<BusinessListItem[]>([])
  const [stats, setStats] = React.useState({ total_business: 0, active_business: 0, pending_business: 0 })
  const [totalPages, setTotalPages] = React.useState(1)
  const [apiPage, setApiPage] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | undefined>()

  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  // Bumped after a create/update/delete to re-run the fetch effect.
  const [refreshTick, setRefreshTick] = React.useState(0)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<BusinessListItem | null>(null)
  const [form, setForm] = React.useState<BusinessForm>(emptyForm())
  const [slugTouched, setSlugTouched] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<BusinessListItem | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setApiPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  React.useEffect(() => {
    let ignore = false
    async function run() {
      try {
        const res = await fetchBusinesses({
          page: apiPage,
          limit: PAGE_LIMIT,
          search: debouncedSearch || undefined,
          status: statusFilter === "all" ? undefined : (statusFilter as PlatformBusinessStatus),
        })
        if (ignore) return
        setBusinesses(res.data)
        setStats(res.stats)
        setTotalPages(res.pagination.total_pages)
        setError(undefined)
      } catch (e) {
        if (!ignore) {
          setError(e instanceof AdminApiError ? e.message : "Gagal memuat data bisnis dari server")
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    run()
    return () => {
      ignore = true
    }
  }, [apiPage, debouncedSearch, statusFilter, refreshTick])

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value)
    setApiPage(1)
  }

  function resetFilters() {
    setSearch("")
    setDebouncedSearch("")
    setStatusFilter("all")
    setApiPage(1)
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setSlugTouched(false)
    setFormOpen(true)
  }

  function openEdit(business: BusinessListItem) {
    setEditing(business)
    setForm(formFromBusiness(business))
    setSlugTouched(true)
    setFormOpen(true)
  }

  function setField<K extends keyof BusinessForm>(key: K, value: BusinessForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleNameChange(value: string) {
    setForm((f) => ({
      ...f,
      name: value,
      slug: slugTouched ? f.slug : slugify(value),
    }))
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Nama dan slug bisnis wajib diisi.")
      return
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
      toast.error("Slug hanya boleh huruf kecil, angka, dan tanda hubung.")
      return
    }
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      toast.error("Format email tidak valid.")
      return
    }
    if (form.website.trim() && !/^https?:\/\//i.test(form.website.trim())) {
      toast.error("Website harus diawali http:// atau https://")
      return
    }

    setSubmitting(true)
    try {
      const payload = toPayload(form)
      if (editing) {
        await updateBusiness(editing.id, payload)
        toast.success("Bisnis berhasil diperbarui.")
      } else {
        await createBusiness(payload)
        toast.success("Bisnis berhasil ditambahkan.")
        setApiPage(1)
      }
      setFormOpen(false)
      setRefreshTick((t) => t + 1)
    } catch (e) {
      toast.error(e instanceof AdminApiError ? e.message : "Gagal menyimpan bisnis")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteBusiness(deleteTarget.id)
      toast.success(`${deleteTarget.name} berhasil dihapus.`)
      // Last row on the last page removed — step back so we don't land on an empty page.
      if (businesses.length === 1 && apiPage > 1) setApiPage((p) => p - 1)
      setRefreshTick((t) => t + 1)
    } catch (e) {
      toast.error(e instanceof AdminApiError ? e.message : "Gagal menghapus bisnis")
    }
  }

  const columns: ResourceTableColumn<BusinessListItem>[] = [
    {
      key: "name",
      header: "Bisnis",
      render: (b) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{b.name}</span>
          <span className="text-xs text-muted-foreground">/{b.slug}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Kategori",
      render: (b) => <span className="text-muted-foreground">{b.category || "-"}</span>,
    },
    {
      key: "city",
      header: "Kota",
      render: (b) => <span className="text-muted-foreground">{b.city || "-"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (b) => <StatusBadge status={b.status} />,
    },
    {
      key: "rating",
      header: "Rating",
      render: (b) =>
        b.review_count > 0 ? (
          <span className="text-muted-foreground">
            {Number(b.average_rating ?? 0).toFixed(1)} ({b.review_count})
          </span>
        ) : (
          "-"
        ),
    },
    {
      key: "created_at",
      header: "Dibuat",
      render: (b) => <span className="text-muted-foreground">{formatDate(b.created_at)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (b) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <MoreHorizontalIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEdit(b)}>Ubah</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(b)}>
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
            <BreadcrumbPage>Add Business</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Add Business"
        description="Tambah dan kelola data bisnis yang tampil di platform KataMereka."
        action={
          <Button onClick={openCreate}>
            <PlusIcon />
            Tambah Bisnis
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Bisnis"
          value={stats.total_business}
          icon={BuildingIcon}
          onClick={() => handleStatusFilterChange("all")}
        />
        <StatCard
          label="Active"
          value={stats.active_business}
          icon={StarIcon}
          onClick={() => handleStatusFilterChange("ACTIVE")}
        />
        <StatCard
          label="Pending"
          value={stats.pending_business}
          icon={ClockIcon}
          onClick={() => handleStatusFilterChange("PENDING")}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari nama bisnis, slug, atau kota..." />
          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              label="Status"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={handleStatusFilterChange}
            />
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RotateCcwIcon />
              Reset
            </Button>
          </div>
        </div>

        <ResourceTable
          data={businesses}
          columns={columns}
          getRowId={(b) => b.id}
          onRowClick={openEdit}
          isLoading={isLoading}
          error={error}
          itemLabel="bisnis"
          pageSize={PAGE_LIMIT}
          pageSizeOptions={[PAGE_LIMIT]}
          emptyTitle="Belum ada bisnis ditemukan."
        />

        {!isLoading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Halaman {apiPage} dari {totalPages}
            </span>
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

      <Dialog open={formOpen} onOpenChange={(open) => !submitting && setFormOpen(open)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah Bisnis" : "Tambah Bisnis"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="biz-name">Nama Bisnis</FieldLabel>
              <Input
                id="biz-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="biz-slug">Slug</FieldLabel>
              <Input
                id="biz-slug"
                placeholder="nama-bisnis"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setField("slug", e.target.value)
                }}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="biz-category">Kategori</FieldLabel>
                <Input
                  id="biz-category"
                  placeholder="Contoh: Restoran"
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="biz-status">Status</FieldLabel>
                <Select
                  value={form.status}
                  onValueChange={(value) => setField("status", value as PlatformBusinessStatus)}
                >
                  <SelectTrigger id="biz-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_LABELS) as PlatformBusinessStatus[]).map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="biz-address">Alamat</FieldLabel>
              <Textarea
                id="biz-address"
                rows={2}
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="biz-city">Kota</FieldLabel>
                <Input
                  id="biz-city"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="biz-province">Provinsi</FieldLabel>
                <Input
                  id="biz-province"
                  value={form.province}
                  onChange={(e) => setField("province", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="biz-phone">Telepon</FieldLabel>
                <Input
                  id="biz-phone"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="biz-email">Email</FieldLabel>
                <Input
                  id="biz-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="biz-website">Website</FieldLabel>
              <Input
                id="biz-website"
                placeholder="https://"
                value={form.website}
                onChange={(e) => setField("website", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="biz-description">Deskripsi</FieldLabel>
              <Textarea
                id="biz-description"
                rows={4}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Hapus ${deleteTarget?.name}?`}
        description="Bisnis akan dihapus dari platform dan tidak dapat dikembalikan."
        confirmLabel="Hapus"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
