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
  ExternalLinkIcon,
  FileTextIcon,
  HomeIcon,
  MailIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  StarIcon,
  UserIcon,
  XIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { FilterDropdown } from "@/components/filter-dropdown"
import { PageHeader } from "@/components/page-header"
import { RatingDistributionBars } from "@/components/rating-distribution-bars"
import { RatingStars } from "@/components/rating-stars"
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
import { formatDate } from "@/lib/format"
import { getAdminById } from "@/lib/mock/admins"
import { getAuditLogByTarget } from "@/lib/mock/audit-log"
import { businesses as initialBusinesses } from "@/lib/mock/businesses"
import { getRatingDistribution } from "@/lib/mock/reviews"
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

const AVATAR_TONES = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-purple-100 text-purple-700",
  "bg-cyan-100 text-cyan-700",
]

function businessInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase()
}

function avatarTone(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % AVATAR_TONES.length
  return AVATAR_TONES[hash]
}

function ownerContact(business: Business) {
  return getAdminById(business.ownerId)?.email ?? business.email ?? "-"
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = React.useState<Business[]>(initialBusinesses)
  const [search, setSearch] = React.useState("")
  const [verificationFilter, setVerificationFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [locationFilter, setLocationFilter] = React.useState("all")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [confirmTarget, setConfirmTarget] = React.useState<{
    business: Business
    action: "VERIFY" | "SUSPEND" | "ACTIVATE"
  } | null>(null)
  const [formOpen, setFormOpen] = React.useState<"ADD" | "EDIT" | null>(null)
  const [form, setForm] = React.useState({ name: "", category: "", ownerName: "", city: "" })

  const selected = businesses.find((b) => b.id === selectedId) ?? null

  const categories = Array.from(new Set(businesses.map((b) => b.category)))
  const categoryOptions = [
    { value: "all", label: "Semua Kategori" },
    ...categories.map((c) => ({ value: c, label: c })),
  ]

  const locations = Array.from(new Set(businesses.map((b) => b.city)))
  const locationOptions = [
    { value: "all", label: "Semua Lokasi" },
    ...locations.map((c) => ({ value: c, label: c })),
  ]

  const counts = {
    total: businesses.length,
    verified: businesses.filter((b) => b.verificationStatus === "VERIFIED").length,
    pending: businesses.filter((b) => b.verificationStatus === "PENDING").length,
    suspended: businesses.filter((b) => b.status === "SUSPENDED").length,
  }

  const filtered = businesses.filter((business) => {
    if (verificationFilter !== "all" && business.verificationStatus !== verificationFilter)
      return false
    if (statusFilter !== "all" && business.status !== statusFilter) return false
    if (categoryFilter !== "all" && business.category !== categoryFilter) return false
    if (locationFilter !== "all" && business.city !== locationFilter) return false
    if (
      search &&
      !business.name.toLowerCase().includes(search.toLowerCase()) &&
      !business.ownerName.toLowerCase().includes(search.toLowerCase()) &&
      !business.slug.toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  function openDetail(business: Business) {
    setSelectedId(business.id)
  }

  function openAdd() {
    setForm({ name: "", category: "", ownerName: "", city: "" })
    setFormOpen("ADD")
  }

  function openEdit(business: Business) {
    setForm({
      name: business.name,
      category: business.category,
      ownerName: business.ownerName,
      city: business.city,
    })
    setFormOpen("EDIT")
  }

  function saveForm() {
    if (!form.name.trim() || !form.category.trim()) {
      toast.error("Nama dan kategori wajib diisi.")
      return
    }
    if (formOpen === "ADD") {
      const newBusiness: Business = {
        id: `b-${Date.now()}`,
        name: form.name,
        slug: form.name.toLowerCase().trim().replace(/\s+/g, "-"),
        description: "",
        category: form.category,
        address: "",
        city: form.city || "-",
        province: "-",
        ownerId: "",
        ownerName: form.ownerName || "-",
        averageRating: 0,
        totalReviews: 0,
        verifiedReviews: 0,
        responseRate: 0,
        verificationStatus: "UNVERIFIED",
        status: "ACTIVE",
        createdAt: new Date().toISOString().slice(0, 10),
      }
      setBusinesses((prev) => [newBusiness, ...prev])
      toast.success("Business berhasil ditambahkan.")
    } else if (selected) {
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === selected.id
            ? { ...b, name: form.name, category: form.category, ownerName: form.ownerName, city: form.city }
            : b
        )
      )
      toast.success("Business berhasil diperbarui.")
    }
    setFormOpen(null)
  }

  function applyStatusAction(target: Business, action: "VERIFY" | "SUSPEND" | "ACTIVATE") {
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === target.id
          ? {
              ...b,
              verificationStatus: action === "VERIFY" ? "VERIFIED" : b.verificationStatus,
              status: action === "SUSPEND" ? "SUSPENDED" : action === "ACTIVATE" ? "ACTIVE" : b.status,
            }
          : b
      )
    )
  }

  const columns: ResourceTableColumn<Business>[] = [
    {
      key: "name",
      header: "Business",
      sortValue: (b) => b.name,
      render: (business) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback className={avatarTone(business.id)}>
              {businessInitials(business.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{business.name}</p>
            <p className="text-xs text-muted-foreground">/{business.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "ownerName",
      header: "Owner / Contact",
      render: (business) => (
        <div>
          <p className="text-foreground">{business.ownerName}</p>
          <p className="text-xs text-muted-foreground">{ownerContact(business)}</p>
        </div>
      ),
    },
    { key: "category", header: "Kategori", render: (business) => business.category },
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
      header: "Verifikasi",
      render: (business) => <StatusBadge status={business.verificationStatus} />,
    },
    {
      key: "status",
      header: "Status",
      render: (business) => <StatusBadge status={business.status} />,
    },
    {
      key: "createdAt",
      header: "Bergabung",
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
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <SlidersHorizontalIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openDetail(business)}>Lihat Ringkasan</DropdownMenuItem>
              <DropdownMenuItem render={<Link href={`/admin/businesses/${business.id}`} />}>
                Buka Detail Lengkap
              </DropdownMenuItem>
              {business.verificationStatus === "PENDING" && (
                <DropdownMenuItem onClick={() => setConfirmTarget({ business, action: "VERIFY" })}>
                  Verify
                </DropdownMenuItem>
              )}
              {business.status === "SUSPENDED" ? (
                <DropdownMenuItem onClick={() => setConfirmTarget({ business, action: "ACTIVATE" })}>
                  Activate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setConfirmTarget({ business, action: "SUSPEND" })}
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
            <BreadcrumbPage>Businesses</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Businesses"
        description="Kelola seluruh bisnis yang terdaftar di platform KataMereka."
        action={
          <>
            <Button variant="outline" onClick={() => toast.success("Data business berhasil diexport.")}>
              <DownloadIcon />
              Export Data
            </Button>
            <Button onClick={openAdd}>
              <PlusIcon />
              Tambah Business
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          label="Total Businesses"
          value={counts.total}
          delta="+12%"
          hint="dari bulan lalu"
          icon={BuildingIcon}
          onClick={() => {
            setVerificationFilter("all")
            setStatusFilter("all")
          }}
        />
        <StatCard
          label="Verified Businesses"
          value={counts.verified}
          delta="+8%"
          hint="dari bulan lalu"
          icon={ShieldCheckIcon}
          onClick={() => setVerificationFilter("VERIFIED")}
        />
        <StatCard
          label="Pending Verification"
          value={counts.pending}
          delta="+5%"
          deltaTone="negative"
          hint="dari bulan lalu"
          icon={ClockIcon}
          onClick={() => setVerificationFilter("PENDING")}
        />
        <StatCard
          label="Suspended Businesses"
          value={counts.suspended}
          delta="+3%"
          deltaTone="negative"
          hint="dari bulan lalu"
          icon={BanIcon}
          onClick={() => setStatusFilter("SUSPENDED")}
        />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Cari nama business, owner, atau slug..."
            />
            <div className="flex flex-wrap items-center gap-2">
              <FilterDropdown
                label="Kategori"
                options={categoryOptions}
                value={categoryFilter}
                onChange={setCategoryFilter}
              />
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
                label="Lokasi"
                options={locationOptions}
                value={locationFilter}
                onChange={setLocationFilter}
              />
            </div>
          </div>

          <ResourceTable
            data={filtered}
            columns={columns}
            getRowId={(business) => business.id}
            onRowClick={openDetail}
            rowClassName={(business) => (business.id === selectedId ? "bg-primary/5" : undefined)}
            selectedIds={selectedIds}
            onToggleRow={(id, checked) =>
              setSelectedIds((prev) => {
                const next = new Set(prev)
                if (checked) next.add(id)
                else next.delete(id)
                return next
              })
            }
            onToggleAll={(checked) =>
              setSelectedIds(checked ? new Set(filtered.map((b) => b.id)) : new Set())
            }
            itemLabel="business"
            pageSize={10}
            emptyTitle="Tidak ada bisnis ditemukan."
          />
        </div>

        {selected && (
          <div className="w-full shrink-0 overflow-hidden rounded-xl border border-border bg-card lg:sticky lg:top-4 lg:w-[380px]">
            <div className="relative h-28 bg-muted">
              <div className="absolute inset-0 flex items-center justify-center">
                <BuildingIcon className="size-10 text-muted-foreground/30" />
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setSelectedId(null)}
              >
                <XIcon className="size-4" />
              </Button>
              <Avatar size="lg" className="absolute -bottom-6 left-4 ring-4 ring-card">
                <AvatarFallback className={avatarTone(selected.id)}>
                  {businessInitials(selected.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex items-start justify-between gap-2 px-4 pt-8 pb-3">
              <div>
                <p className="font-semibold text-foreground">{selected.name}</p>
                <p className="text-xs text-muted-foreground">/{selected.slug}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="px-4 pb-2">
              <Button variant="outline" size="sm" render={<Link href={`/business/${selected.slug}`} target="_blank" />}>
                <ExternalLinkIcon className="size-3.5" />
                Lihat Public Profile
              </Button>
            </div>

            <div className="px-4 pb-4">
              <Tabs defaultValue="informasi">
                <TabsList className="w-full">
                  <TabsTrigger value="informasi">Informasi</TabsTrigger>
                  <TabsTrigger value="statistik">Statistik</TabsTrigger>
                  <TabsTrigger value="kontak">Kontak</TabsTrigger>
                  <TabsTrigger value="aktivitas">Aktivitas</TabsTrigger>
                </TabsList>

                <TabsContent value="informasi" className="mt-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-3 text-sm">
                    <InfoRow icon={BuildingIcon} label="Nama Business" value={selected.name} />
                    <InfoRow icon={FileTextIcon} label="Kategori" value={selected.category} />
                    <InfoRow
                      icon={UserIcon}
                      label="Owner"
                      value={`${selected.ownerName} (${ownerContact(selected)})`}
                    />
                    <InfoRow icon={MapPinIcon} label="Lokasi Utama" value={`${selected.city}, ${selected.province}`} />
                    <InfoRow
                      icon={StarIcon}
                      label="Rating"
                      value={`${selected.averageRating} (${selected.totalReviews.toLocaleString("id-ID")} reviews)`}
                    />
                    <InfoRow
                      icon={ShieldCheckIcon}
                      label="Status Verifikasi"
                      value={<StatusBadge status={selected.verificationStatus} />}
                    />
                    <InfoRow icon={CalendarIcon} label="Bergabung" value={formatDate(selected.createdAt)} />
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase">
                      Deskripsi
                    </p>
                    <p className="text-sm text-foreground/90">{selected.description}</p>
                  </div>

                  <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                    <Button variant="outline" className="flex-1" onClick={() => openEdit(selected)}>
                      <PencilIcon />
                      Edit Business
                    </Button>
                    {selected.status === "SUSPENDED" ? (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setConfirmTarget({ business: selected, action: "ACTIVATE" })}
                      >
                        Activate
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmTarget({ business: selected, action: "SUSPEND" })}
                      >
                        <BanIcon />
                        Suspend
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
                        <SlidersHorizontalIcon className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem render={<Link href={`/admin/businesses/${selected.id}`} />}>
                          Buka Detail Lengkap
                        </DropdownMenuItem>
                        {selected.verificationStatus === "PENDING" && (
                          <DropdownMenuItem
                            onClick={() => setConfirmTarget({ business: selected, action: "VERIFY" })}
                          >
                            <ShieldCheckIcon />
                            Approve Verification
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TabsContent>

                <TabsContent value="statistik" className="mt-4 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Verified Reviews" value={selected.verifiedReviews.toLocaleString("id-ID")} />
                    <StatCard label="Response Rate" value={`${selected.responseRate}%`} />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                      Rating Distribution
                    </p>
                    <RatingDistributionBars distribution={getRatingDistribution(selected.id)} />
                  </div>
                </TabsContent>

                <TabsContent value="kontak" className="mt-4 flex flex-col gap-3 text-sm">
                  <InfoRow icon={PhoneIcon} label="Telepon" value={selected.phone ?? "-"} />
                  <InfoRow icon={MailIcon} label="Email" value={selected.email ?? "-"} />
                  <InfoRow icon={MapPinIcon} label="Alamat" value={selected.address} />
                  {selected.website && (
                    <InfoRow
                      icon={ExternalLinkIcon}
                      label="Website"
                      value={
                        <a
                          href={selected.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          {selected.website}
                        </a>
                      }
                    />
                  )}
                </TabsContent>

                <TabsContent value="aktivitas" className="mt-4 flex flex-col gap-3">
                  {getAuditLogByTarget(selected.name).length === 0 && (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      Belum ada aktivitas audit untuk bisnis ini.
                    </p>
                  )}
                  {getAuditLogByTarget(selected.name).map((entry) => (
                    <div key={entry.id} className="flex items-start gap-2.5 text-sm">
                      <ScrollTextIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-foreground/90">{entry.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.actorName} · {formatDate(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>

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
        onConfirm={() => {
          if (!confirmTarget) return
          applyStatusAction(confirmTarget.business, confirmTarget.action)
          toast.success(
            `${confirmTarget.business.name}: aksi ${confirmTarget.action.toLowerCase()} berhasil diterapkan.`
          )
        }}
      />

      <Dialog open={!!formOpen} onOpenChange={(open) => !open && setFormOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formOpen === "ADD" ? "Tambah Business" : "Edit Business"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="business-name">Nama Business</FieldLabel>
              <Input
                id="business-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="business-category">Kategori</FieldLabel>
              <Input
                id="business-category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="business-owner">Nama Owner</FieldLabel>
              <Input
                id="business-owner"
                value={form.ownerName}
                onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="business-city">Kota</FieldLabel>
              <Input
                id="business-city"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
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
    <div className="flex items-start justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        {label}
      </span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}
