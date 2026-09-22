"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  BedDoubleIcon,
  BuildingIcon,
  CarIcon,
  ChevronRightIcon,
  CircleEllipsisIcon,
  DumbbellIcon,
  FactoryIcon,
  GraduationCapIcon,
  GridIcon,
  HeartPulseIcon,
  HomeIcon,
  PlusIcon,
  ScissorsIcon,
  ShoppingCartIcon,
  TagIcon,
  UtensilsIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { FilterDropdown } from "@/components/filter-dropdown"
import { PageHeader } from "@/components/page-header"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { SearchInput } from "@/components/search-input"
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
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "cn"
import { formatDate } from "@/lib/format"
import { categories as initialCategories } from "@/lib/mock/categories"
import { cities as initialCities } from "@/lib/mock/cities"
import { contentTags as initialContentTags } from "@/lib/mock/content-tags"
import { industries as initialIndustries } from "@/lib/mock/industries"
import type { Category, City, ContentTag, Industry } from "@/lib/types"

type MasterType = "categories" | "cities" | "industries" | "tags"

interface Row {
  id: string
  name: string
  description: string
  count: number
  status: "ACTIVE" | "INACTIVE"
  createdAt: string
}

const CATEGORY_ICONS: Record<string, { icon: typeof UtensilsIcon; tone: string }> = {
  Restoran: { icon: UtensilsIcon, tone: "bg-orange-100 text-orange-700" },
  Retail: { icon: ShoppingCartIcon, tone: "bg-red-100 text-red-700" },
  Akomodasi: { icon: BedDoubleIcon, tone: "bg-blue-100 text-blue-700" },
  Transportasi: { icon: CarIcon, tone: "bg-purple-100 text-purple-700" },
  Kesehatan: { icon: HeartPulseIcon, tone: "bg-pink-100 text-pink-700" },
  Olahraga: { icon: DumbbellIcon, tone: "bg-emerald-100 text-emerald-700" },
  Kecantikan: { icon: ScissorsIcon, tone: "bg-fuchsia-100 text-fuchsia-700" },
  Pendidikan: { icon: GraduationCapIcon, tone: "bg-indigo-100 text-indigo-700" },
  Properti: { icon: HomeIcon, tone: "bg-teal-100 text-teal-700" },
  Lainnya: { icon: CircleEllipsisIcon, tone: "bg-muted text-muted-foreground" },
}

const DEFAULT_ICON = { icon: CircleEllipsisIcon, tone: "bg-muted text-muted-foreground" }

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "INACTIVE", label: "Nonaktif" },
]

function emptyForm() {
  return { name: "", description: "" }
}

export default function MasterDataPage() {
  const [activeType, setActiveType] = React.useState<MasterType>("categories")
  const [categoryList, setCategoryList] = React.useState<Category[]>(initialCategories)
  const [cityList, setCityList] = React.useState<City[]>(initialCities)
  const [industryList, setIndustryList] = React.useState<Industry[]>(initialIndustries)
  const [tagList, setTagList] = React.useState<ContentTag[]>(initialContentTags)

  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [formOpen, setFormOpen] = React.useState<"ADD" | "EDIT" | null>(null)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState(emptyForm())
  const [toggleTarget, setToggleTarget] = React.useState<Row | null>(null)

  function resetFilters() {
    setSearch("")
    setStatusFilter("all")
  }

  function switchType(type: MasterType) {
    setActiveType(type)
    resetFilters()
  }

  const typeConfig: Record<
    MasterType,
    { label: string; singular: string; icon: typeof GridIcon; tone: string; countLabel: string }
  > = {
    categories: {
      label: "Kategori Bisnis",
      singular: "Kategori",
      icon: GridIcon,
      tone: "bg-primary/10 text-primary",
      countLabel: "Jumlah Bisnis",
    },
    cities: {
      label: "Kota",
      singular: "Kota",
      icon: BuildingIcon,
      tone: "bg-blue-100 text-blue-700",
      countLabel: "Jumlah Bisnis",
    },
    industries: {
      label: "Industri",
      singular: "Industri",
      icon: FactoryIcon,
      tone: "bg-purple-100 text-purple-700",
      countLabel: "Jumlah Bisnis",
    },
    tags: {
      label: "Tag Konten",
      singular: "Tag",
      icon: TagIcon,
      tone: "bg-amber-100 text-amber-700",
      countLabel: "Jumlah Review",
    },
  }

  const config = typeConfig[activeType]

  const rows: Row[] = React.useMemo(() => {
    if (activeType === "categories")
      return categoryList.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        count: c.businessCount,
        status: c.status,
        createdAt: c.createdAt,
      }))
    if (activeType === "cities")
      return cityList.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.province,
        count: c.businessCount,
        status: c.status,
        createdAt: c.createdAt,
      }))
    if (activeType === "industries")
      return industryList.map((i) => ({
        id: i.id,
        name: i.name,
        description: i.description,
        count: i.businessCount,
        status: i.status,
        createdAt: i.createdAt,
      }))
    return tagList.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      count: t.reviewCount,
      status: t.status,
      createdAt: t.createdAt,
    }))
  }, [activeType, categoryList, cityList, industryList, tagList])

  const filtered = rows.filter((row) => {
    if (statusFilter !== "all" && row.status !== statusFilter) return false
    if (search && !row.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function openAdd() {
    setForm(emptyForm())
    setEditingId(null)
    setFormOpen("ADD")
  }

  function openEdit(row: Row) {
    setForm({ name: row.name, description: row.description })
    setEditingId(row.id)
    setFormOpen("EDIT")
  }

  function saveForm() {
    if (!form.name.trim()) {
      toast.error("Nama wajib diisi.")
      return
    }
    const isEdit = formOpen === "EDIT" && editingId

    if (activeType === "categories") {
      if (isEdit) {
        setCategoryList((prev) =>
          prev.map((c) =>
            c.id === editingId ? { ...c, name: form.name, description: form.description } : c
          )
        )
      } else {
        setCategoryList((prev) => [
          {
            id: `cat-${Date.now()}`,
            name: form.name,
            description: form.description,
            businessCount: 0,
            status: "ACTIVE",
            createdAt: new Date().toISOString().slice(0, 10),
          },
          ...prev,
        ])
      }
    } else if (activeType === "cities") {
      if (isEdit) {
        setCityList((prev) =>
          prev.map((c) =>
            c.id === editingId ? { ...c, name: form.name, province: form.description } : c
          )
        )
      } else {
        setCityList((prev) => [
          {
            id: `city-${Date.now()}`,
            name: form.name,
            province: form.description,
            businessCount: 0,
            status: "ACTIVE",
            createdAt: new Date().toISOString().slice(0, 10),
          },
          ...prev,
        ])
      }
    } else if (activeType === "industries") {
      if (isEdit) {
        setIndustryList((prev) =>
          prev.map((i) =>
            i.id === editingId ? { ...i, name: form.name, description: form.description } : i
          )
        )
      } else {
        setIndustryList((prev) => [
          {
            id: `ind-${Date.now()}`,
            name: form.name,
            description: form.description,
            businessCount: 0,
            status: "ACTIVE",
            createdAt: new Date().toISOString().slice(0, 10),
          },
          ...prev,
        ])
      }
    } else {
      if (isEdit) {
        setTagList((prev) =>
          prev.map((t) =>
            t.id === editingId ? { ...t, name: form.name, description: form.description } : t
          )
        )
      } else {
        setTagList((prev) => [
          {
            id: `tag-${Date.now()}`,
            name: form.name,
            description: form.description,
            reviewCount: 0,
            status: "ACTIVE",
            createdAt: new Date().toISOString().slice(0, 10),
          },
          ...prev,
        ])
      }
    }

    toast.success(isEdit ? `${config.singular} berhasil diperbarui.` : `${config.singular} berhasil ditambahkan.`)
    setFormOpen(null)
  }

  function toggleStatus(row: Row) {
    const nextStatus = row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    if (activeType === "categories") {
      setCategoryList((prev) => prev.map((c) => (c.id === row.id ? { ...c, status: nextStatus } : c)))
    } else if (activeType === "cities") {
      setCityList((prev) => prev.map((c) => (c.id === row.id ? { ...c, status: nextStatus } : c)))
    } else if (activeType === "industries") {
      setIndustryList((prev) => prev.map((i) => (i.id === row.id ? { ...i, status: nextStatus } : i)))
    } else {
      setTagList((prev) => prev.map((t) => (t.id === row.id ? { ...t, status: nextStatus } : t)))
    }
    toast.success(`Status ${row.name} berhasil diperbarui.`)
  }

  const columns: ResourceTableColumn<Row>[] = [
    {
      key: "index",
      header: "#",
      className: "w-10 text-muted-foreground",
      render: (row) => filtered.indexOf(row) + 1,
    },
    {
      key: "name",
      header: activeType === "categories" ? "Nama Kategori" : activeType === "cities" ? "Nama Kota" : activeType === "industries" ? "Nama Industri" : "Nama Tag",
      sortValue: (row) => row.name,
      render: (row) => {
        const meta = activeType === "categories" ? (CATEGORY_ICONS[row.name] ?? DEFAULT_ICON) : { icon: config.icon, tone: config.tone }
        const Icon = meta.icon
        return (
          <div className="flex items-center gap-2.5">
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", meta.tone)}>
              <Icon className="size-4" />
            </span>
            <span className="font-medium text-foreground">{row.name}</span>
          </div>
        )
      },
    },
    {
      key: "description",
      header: activeType === "cities" ? "Provinsi" : "Deskripsi",
      render: (row) => <span className="text-muted-foreground">{row.description}</span>,
    },
    {
      key: "count",
      header: config.countLabel,
      sortValue: (row) => row.count,
      render: (row) => row.count.toLocaleString("id-ID"),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge status={row.status} label={row.status === "ACTIVE" ? "Aktif" : "Nonaktif"} />
      ),
    },
    {
      key: "createdAt",
      header: "Dibuat Pada",
      sortValue: (row) => row.createdAt,
      render: (row) => <span className="text-muted-foreground">{formatDate(row.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setToggleTarget(row)}>
            {row.status === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"}
          </Button>
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
            <BreadcrumbPage>Master Data</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Master Data"
        description="Kelola data master yang digunakan di seluruh platform KataMereka. Data ini menjadi acuan untuk bisnis, review, dan sistem."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        {(Object.keys(typeConfig) as MasterType[]).map((type) => {
          const meta = typeConfig[type]
          const Icon = meta.icon
          const count =
            type === "categories"
              ? categoryList.length
              : type === "cities"
                ? cityList.length
                : type === "industries"
                  ? industryList.length
                  : tagList.length
          const active = activeType === type
          return (
            <button
              key={type}
              type="button"
              onClick={() => switchType(type)}
              className={cn(
                "flex flex-col gap-2 rounded-xl border p-5 text-left transition-colors",
                active ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/50"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("flex size-10 items-center justify-center rounded-lg", meta.tone)}>
                  <Icon className="size-5" />
                </span>
                <ChevronRightIcon className="size-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{meta.label}</p>
              <p className="text-2xl font-semibold text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground">Daftar semua {meta.label.toLowerCase()}</p>
            </button>
          )
        })}
      </div>

      <PageHeader
        title={config.label}
        description={`Daftar ${config.label.toLowerCase()} yang dapat dipilih oleh business di platform.`}
        action={
          <Button onClick={openAdd}>
            <PlusIcon />
            Tambah {config.singular}
          </Button>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder={`Cari ${config.singular.toLowerCase()}...`} />
        <FilterDropdown label="Status" options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
      </div>

      <ResourceTable
        data={filtered}
        columns={columns}
        getRowId={(row) => row.id}
        itemLabel={config.singular.toLowerCase()}
        pageSize={10}
        emptyTitle={`Belum ada ${config.singular.toLowerCase()}.`}
      />

      <Dialog open={!!formOpen} onOpenChange={(open) => !open && setFormOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formOpen === "ADD" ? `Tambah ${config.singular}` : `Edit ${config.singular}`}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="master-name">Nama {config.singular}</FieldLabel>
              <Input
                id="master-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="master-description">
                {activeType === "cities" ? "Provinsi" : "Deskripsi"}
              </FieldLabel>
              {activeType === "cities" ? (
                <Input
                  id="master-description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              ) : (
                <Textarea
                  id="master-description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              )}
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(null)}>
              Batal
            </Button>
            <Button onClick={saveForm}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toggleTarget}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        title={
          toggleTarget?.status === "ACTIVE"
            ? `Nonaktifkan ${toggleTarget?.name}?`
            : `Aktifkan kembali ${toggleTarget?.name}?`
        }
        description={
          toggleTarget && toggleTarget.count > 0
            ? "Data yang masih digunakan tidak dihapus permanen, hanya dinonaktifkan dari daftar baru."
            : undefined
        }
        confirmLabel={toggleTarget?.status === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"}
        variant={toggleTarget?.status === "ACTIVE" ? "destructive" : "default"}
        onConfirm={() => toggleTarget && toggleStatus(toggleTarget)}
      />
    </div>
  )
}
