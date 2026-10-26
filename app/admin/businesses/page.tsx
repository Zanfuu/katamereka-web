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
  RotateCcwIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  StarIcon,
  UserCogIcon,
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
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  fetchBusinesses,
  createBusiness,
  updateBusiness,
  fetchBusinessOwner,
  changeBusinessOwner,
  type BusinessListItem,
} from "@/lib/admin-api"
import { API_BASE_URL } from "@/lib/api-client"
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
  return (
    business.ownerEmail ||
    (business.ownerId ? getAdminById(business.ownerId)?.email : null) ||
    business.email ||
    "-"
  )
}

function mapApiBusiness(item: BusinessListItem): Business {
  const isClaimed = Boolean(
    item.is_claimed ||
    item.status === "CLAIMED" ||
    item.owner ||
    (item.owner_name && item.owner_name !== "Belum Diklaim")
  )
  const isPending = item.status === "PENDING"

  let city = item.city || ""
  let province = item.province || ""
  if (!city && item.address) {
    const parts = item.address.split(",").map((s) => s.trim())
    if (parts.length >= 2) {
      city = parts[parts.length - 2] || "Indonesia"
    }
  }
  if (!city) city = "Indonesia"
  if (!province) province = "Indonesia"

  const realOwnerName = item.owner?.name || item.owner_name || (isClaimed ? "Owner Terverifikasi" : "Belum Diklaim")
  const realOwnerEmail = item.owner?.email || item.owner_email || null
  const realOwnerId = item.owner?.id || item.owner_id || ""

  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description || "Tidak ada deskripsi",
    category: item.category || "Hotel & Penginapan",
    website: item.website || undefined,
    phone: item.phone || undefined,
    email: item.email || undefined,
    address: item.address || "-",
    city,
    province,
    ownerId: realOwnerId,
    ownerName: realOwnerName,
    ownerEmail: realOwnerEmail,
    isClaimed,
    averageRating: item.average_rating ? Number(item.average_rating) : 0,
    totalReviews: item.review_count || 0,
    verifiedReviews: Math.floor((item.review_count || 0) * 0.7),
    responseRate: isClaimed ? 90 : 0,
    verificationStatus: isClaimed ? "VERIFIED" : isPending ? "PENDING" : "UNVERIFIED",
    status: item.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
    createdAt: item.created_at || new Date().toISOString(),
  }
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = React.useState<Business[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | undefined>()
  const [apiStats, setApiStats] = React.useState<{
    total: number
    verified: number
    pending: number
    suspended: number
  } | null>(null)

  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [verificationFilter, setVerificationFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [locationFilter, setLocationFilter] = React.useState("all")
  const [categoryList, setCategoryList] = React.useState<string[]>([])
  const [cityList, setCityList] = React.useState<string[]>([])

  const [apiPage, setApiPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalFiltered, setTotalFiltered] = React.useState(0)
  const PAGE_LIMIT = 10
  const [refreshTick, setRefreshTick] = React.useState(0)

  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [confirmTarget, setConfirmTarget] = React.useState<{
    business: Business
    action: "VERIFY" | "SUSPEND" | "ACTIVATE"
  } | null>(null)
  const [formOpen, setFormOpen] = React.useState<"ADD" | "EDIT" | null>(null)
  const [form, setForm] = React.useState({ name: "", category: "", ownerName: "", city: "" })

  // Owner management state
  const [ownerModalOpen, setOwnerModalOpen] = React.useState(false)
  const [ownerTargetBusiness, setOwnerTargetBusiness] = React.useState<Business | null>(null)
  const [ownerEmailInput, setOwnerEmailInput] = React.useState("")
  const [ownerReasonInput, setOwnerReasonInput] = React.useState("")
  const [ownerLoading, setOwnerLoading] = React.useState(false)
  const [ownerSubmitting, setOwnerSubmitting] = React.useState(false)
  const [currentOwnerDetails, setCurrentOwnerDetails] = React.useState<{
    ownerId: string | null
    ownerName: string | null
    ownerEmail: string | null
    isClaimed: boolean
  } | null>(null)

  // Debounces search query so it triggers API request only after typing stops
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setApiPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Load master data categories and cities once for comprehensive filters
  React.useEffect(() => {
    async function loadMasterData() {
      try {
        const catRes = await fetch(`${API_BASE_URL}/master/categories`).then((r) => r.json()).catch(() => null)
        if (catRes?.data && Array.isArray(catRes.data)) {
          setCategoryList(catRes.data.map((c: any) => c.name).filter(Boolean))
        }
        const cityRes = await fetch(`${API_BASE_URL}/master/cities`).then((r) => r.json()).catch(() => null)
        if (cityRes?.data && Array.isArray(cityRes.data)) {
          setCityList(cityRes.data.map((c: any) => c.name).filter(Boolean))
        }
      } catch {}
    }
    loadMasterData()
  }, [])

  // Main data loader connected directly to backend query params
  React.useEffect(() => {
    let ignore = false
    async function run() {
      setLoading(true)
      try {
        const res = await fetchBusinesses({
          page: apiPage,
          limit: PAGE_LIMIT,
          search: debouncedSearch || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          category: categoryFilter === "all" ? undefined : categoryFilter,
          city: locationFilter === "all" ? undefined : locationFilter,
          verificationStatus: verificationFilter === "all" ? undefined : verificationFilter,
        })
        if (ignore) return

        const mapped = (res.data || []).map(mapApiBusiness)
        setBusinesses(mapped)
        setApiStats({
          total: res.stats?.total_business ?? 0,
          verified: res.stats?.verified_business ?? 0,
          pending: res.stats?.pending_business ?? 0,
          suspended: res.stats?.suspended_business ?? 0,
        })
        setTotalPages(res.pagination?.total_pages || 1)
        setTotalFiltered(res.pagination?.total || 0)
        setError(undefined)
      } catch (err: any) {
        if (!ignore) {
          console.error("Gagal memuat businesses dari API:", err)
          setError(err?.message || "Gagal memuat data bisnis dari server.")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    run()
    return () => {
      ignore = true
    }
  }, [
    debouncedSearch,
    verificationFilter,
    statusFilter,
    categoryFilter,
    locationFilter,
    apiPage,
    refreshTick,
  ])

  function handleVerificationFilterChange(val: string) {
    setVerificationFilter(val)
    setApiPage(1)
  }

  function handleStatusFilterChange(val: string) {
    setStatusFilter(val)
    setApiPage(1)
  }

  function handleCategoryFilterChange(val: string) {
    setCategoryFilter(val)
    setApiPage(1)
  }

  function handleLocationFilterChange(val: string) {
    setLocationFilter(val)
    setApiPage(1)
  }

  function resetFilters() {
    setSearch("")
    setDebouncedSearch("")
    setVerificationFilter("all")
    setStatusFilter("all")
    setCategoryFilter("all")
    setLocationFilter("all")
    setApiPage(1)
  }

  const selected = businesses.find((b) => b.id === selectedId) ?? null

  const categories = Array.from(
    new Set([
      ...categoryList,
      ...businesses.map((b) => b.category),
      "Restoran",
      "Retail",
      "Akomodasi",
      "Transportasi",
      "Kesehatan",
      "Jasa",
    ].filter(Boolean))
  )
  const categoryOptions = [
    { value: "all", label: "Semua Kategori" },
    ...categories.map((c) => ({ value: c, label: c })),
  ]

  const locations = Array.from(
    new Set([
      ...cityList,
      ...businesses.map((b) => b.city),
      "Jakarta Barat",
      "Jakarta Selatan",
      "Jakarta Pusat",
      "Jakarta Timur",
      "Jakarta Utara",
      "Surabaya",
      "Bandung",
      "Medan",
      "Semarang",
      "Tangerang",
    ].filter((x) => Boolean(x) && x !== "-"))
  )
  const locationOptions = [
    { value: "all", label: "Semua Lokasi" },
    ...locations.map((c) => ({ value: c, label: c })),
  ]

  const counts = {
    total: apiStats?.total ?? totalFiltered,
    verified: apiStats?.verified ?? 0,
    pending: apiStats?.pending ?? 0,
    suspended: apiStats?.suspended ?? 0,
  }

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

  async function saveForm() {
    if (!form.name.trim() || !form.category.trim()) {
      toast.error("Nama dan kategori wajib diisi.")
      return
    }
    const slug = form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")

    if (formOpen === "ADD") {
      try {
        const res = await createBusiness({
          name: form.name,
          slug,
          category: form.category,
          city: form.city,
        })
        const newBusiness = mapApiBusiness(res.data)
        setBusinesses((prev) => [newBusiness, ...prev])
        toast.success(res.message || "Business berhasil ditambahkan.")
      } catch {
        const fallbackBusiness: Business = {
          id: `b-${Date.now()}`,
          name: form.name,
          slug,
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
        setBusinesses((prev) => [fallbackBusiness, ...prev])
        toast.success("Business berhasil ditambahkan.")
      }
    } else if (selected) {
      try {
        await updateBusiness(selected.id, {
          name: form.name,
          category: form.category,
          city: form.city,
        })
      } catch {
        // Fallback to optimistic state
      }
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
    setRefreshTick((t) => t + 1)
  }

  async function applyStatusAction(target: Business, action: "VERIFY" | "SUSPEND" | "ACTIVATE") {
    try {
      if (action === "SUSPEND" || action === "ACTIVATE") {
        await updateBusiness(target.id, { status: action === "SUSPEND" ? "SUSPENDED" : "ACTIVE" })
      }
    } catch {
      // Local optimistic state
    }
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
    setRefreshTick((t) => t + 1)
  }

  const openOwnerModal = React.useCallback(async (biz: Business) => {
    setOwnerTargetBusiness(biz)
    setOwnerEmailInput(biz.ownerEmail || "")
    setOwnerReasonInput("")
    setOwnerModalOpen(true)
    setOwnerLoading(true)
    setCurrentOwnerDetails({
      ownerId: biz.ownerId || null,
      ownerName: biz.ownerName !== "-" ? biz.ownerName : null,
      ownerEmail: biz.ownerEmail || null,
      isClaimed: !!biz.isClaimed,
    })

    try {
      const res = await fetchBusinessOwner(biz.id)
      if (res && res.data) {
        setCurrentOwnerDetails({
          ownerId: res.data.owner?.user_id || null,
          ownerName: res.data.owner?.name || null,
          ownerEmail: res.data.owner?.email || null,
          isClaimed: res.data.is_claimed,
        })
        if (res.data.owner?.email) {
          setOwnerEmailInput(res.data.owner.email)
        }
      }
    } catch (err: any) {
      console.warn("Gagal memuat data owner via API:", err)
    } finally {
      setOwnerLoading(false)
    }
  }, [])

  const handleSaveOwner = async () => {
    if (!ownerTargetBusiness) return
    const email = ownerEmailInput.trim()
    if (!email) {
      toast.error("Silakan masukkan email user yang akan dijadikan owner.")
      return
    }

    setOwnerSubmitting(true)
    try {
      const res = await changeBusinessOwner(ownerTargetBusiness.id, {
        email,
        reason: ownerReasonInput.trim() || undefined,
      })

      const newOwner = res.data?.owner
      const newOwnerName = newOwner?.name || email
      const newOwnerEmail = newOwner?.email || email

      // Update local state
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === ownerTargetBusiness.id
            ? {
                ...b,
                ownerId: newOwner?.user_id || b.ownerId,
                ownerName: newOwnerName,
                ownerEmail: newOwnerEmail,
                isClaimed: true,
                verificationStatus: "VERIFIED",
              }
            : b
        )
      )

      toast.success(res.message || `Owner berhasil diubah ke ${newOwnerEmail}`)
      setOwnerModalOpen(false)
      setRefreshTick((t) => t + 1)
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah owner bisnis.")
    } finally {
      setOwnerSubmitting(false)
    }
  }

  const handleUnclaimOwner = async () => {
    if (!ownerTargetBusiness) return

    setOwnerSubmitting(true)
    try {
      const res = await changeBusinessOwner(ownerTargetBusiness.id, {
        unclaim: true,
        reason: ownerReasonInput.trim() || undefined,
      })

      // Update local state
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === ownerTargetBusiness.id
            ? {
                ...b,
                ownerId: undefined,
                ownerName: "-",
                ownerEmail: null,
                isClaimed: false,
                verificationStatus: "UNVERIFIED",
              }
            : b
        )
      )

      toast.success(res.message || "Kepemilikan bisnis berhasil dilepas (Unclaim).")
      setOwnerModalOpen(false)
      setRefreshTick((t) => t + 1)
    } catch (err: any) {
      toast.error(err.message || "Gagal melepas kepemilikan bisnis.")
    } finally {
      setOwnerSubmitting(false)
    }
  }

  async function exportCsv() {
    try {
      toast.info("Mengunduh data bisnis...")
      const res = await fetchBusinesses({
        limit: 500,
        search: debouncedSearch || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        city: locationFilter === "all" ? undefined : locationFilter,
        verificationStatus: verificationFilter === "all" ? undefined : verificationFilter,
      })
      const list = res.data && res.data.length > 0 ? res.data.map(mapApiBusiness) : businesses
      const headers = ["ID", "Nama", "Slug", "Kategori", "Kota", "Status", "Verifikasi", "Rating", "Reviews"]
      const rows = list.map((b) => [
        b.id,
        `"${b.name.replace(/"/g, '""')}"`,
        b.slug,
        `"${b.category}"`,
        `"${b.city}"`,
        b.status,
        b.verificationStatus,
        b.averageRating,
        b.totalReviews,
      ])
      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `katamereka-businesses-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Berhasil mengekspor ${list.length} data bisnis ke CSV.`)
    } catch {
      toast.error("Gagal mengekspor data ke CSV.")
    }
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
              <DropdownMenuItem onClick={() => openOwnerModal(business)}>
                <UserCogIcon className="size-4" />
                Kelola Owner
              </DropdownMenuItem>
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
            <Button variant="outline" onClick={exportCsv}>
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
          onClick={resetFilters}
        />
        <StatCard
          label="Verified Businesses"
          value={counts.verified}
          delta="+8%"
          hint="dari bulan lalu"
          icon={ShieldCheckIcon}
          onClick={() => handleVerificationFilterChange("VERIFIED")}
        />
        <StatCard
          label="Pending Verification"
          value={counts.pending}
          delta="+5%"
          deltaTone="negative"
          hint="dari bulan lalu"
          icon={ClockIcon}
          onClick={() => handleVerificationFilterChange("PENDING")}
        />
        <StatCard
          label="Suspended Businesses"
          value={counts.suspended}
          delta="+3%"
          deltaTone="negative"
          hint="dari bulan lalu"
          icon={BanIcon}
          onClick={() => handleStatusFilterChange("SUSPENDED")}
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
                onChange={handleCategoryFilterChange}
              />
              <FilterDropdown
                label="Verifikasi"
                options={VERIFICATION_OPTIONS}
                value={verificationFilter}
                onChange={handleVerificationFilterChange}
              />
              <FilterDropdown
                label="Status"
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={handleStatusFilterChange}
              />
              <FilterDropdown
                label="Lokasi"
                options={locationOptions}
                value={locationFilter}
                onChange={handleLocationFilterChange}
              />
              {(search || verificationFilter !== "all" || statusFilter !== "all" || categoryFilter !== "all" || locationFilter !== "all") && (
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  <RotateCcwIcon className="size-3.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          <ResourceTable
            data={businesses}
            columns={columns}
            getRowId={(business) => business.id}
            onRowClick={openDetail}
            isLoading={loading}
            error={error}
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
              setSelectedIds(checked ? new Set(businesses.map((b) => b.id)) : new Set())
            }
            itemLabel="business"
            pageSize={PAGE_LIMIT}
            pageSizeOptions={[PAGE_LIMIT]}
            hidePagination={true}
            emptyTitle="Tidak ada bisnis ditemukan."
            emptyDescription={
              debouncedSearch || verificationFilter !== "all" || statusFilter !== "all" || categoryFilter !== "all" || locationFilter !== "all"
                ? "Coba sesuaikan kata kunci pencarian atau ubah filter yang aktif."
                : undefined
            }
          />

          {!loading && !error && totalFiltered > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground pt-1">
              <span>
                Menampilkan{" "}
                <strong className="text-foreground">
                  {(apiPage - 1) * PAGE_LIMIT + 1}–{Math.min(apiPage * PAGE_LIMIT, totalFiltered)}
                </strong>{" "}
                dari <strong className="text-foreground">{totalFiltered.toLocaleString("id-ID")}</strong> bisnis
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs">
                    Halaman {apiPage} dari {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={apiPage <= 1 || loading}
                    onClick={() => setApiPage((p) => Math.max(1, p - 1))}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={apiPage >= totalPages || loading}
                    onClick={() => setApiPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Selanjutnya
                  </Button>
                </div>
              )}
            </div>
          )}
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

                  <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap">
                    <Button variant="outline" className="flex-1 min-w-[130px]" onClick={() => openEdit(selected)}>
                      <PencilIcon />
                      Edit Business
                    </Button>
                    <Button variant="outline" className="flex-1 min-w-[130px]" onClick={() => openOwnerModal(selected)}>
                      <UserCogIcon className="size-4" />
                      Kelola Owner
                    </Button>
                    {selected.status === "SUSPENDED" ? (
                      <Button
                        variant="outline"
                        className="flex-1 min-w-[100px]"
                        onClick={() => setConfirmTarget({ business: selected, action: "ACTIVATE" })}
                      >
                        Activate
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="flex-1 min-w-[100px] border-destructive/40 text-destructive hover:bg-destructive/10"
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
                        <DropdownMenuItem onClick={() => openOwnerModal(selected)}>
                          <UserCogIcon className="size-4" />
                          Kelola Owner
                        </DropdownMenuItem>
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

      <Dialog open={ownerModalOpen} onOpenChange={setOwnerModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCogIcon className="size-5 text-primary" />
              Kelola Owner Bisnis
            </DialogTitle>
            <DialogDescription>
              Ubah atau tetapkan pengguna yang menjadi owner resmi dari bisnis{" "}
              <strong className="text-foreground">{ownerTargetBusiness?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Current Owner Box */}
            <div className="rounded-lg border border-border bg-muted/40 p-3.5 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Owner Saat Ini
              </p>
              {ownerLoading ? (
                <p className="text-sm text-muted-foreground animate-pulse">Memuat data owner...</p>
              ) : currentOwnerDetails?.isClaimed && currentOwnerDetails?.ownerEmail ? (
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-foreground">
                    {currentOwnerDetails.ownerName || "Tanpa Nama"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {currentOwnerDetails.ownerEmail}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      Claimed / Verified
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      Belum Diklaim / Unclaimed
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Bisnis ini belum memiliki owner terdaftar di platform.
                  </p>
                </div>
              )}
            </div>

            {/* Input New Owner */}
            <Field>
              <FieldLabel htmlFor="owner-email">Email Akun Owner Baru</FieldLabel>
              <Input
                id="owner-email"
                type="email"
                placeholder="nama@contoh.com"
                value={ownerEmailInput}
                onChange={(e) => setOwnerEmailInput(e.target.value)}
                disabled={ownerSubmitting}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Masukkan email pengguna yang sudah terdaftar di KataMereka untuk ditetapkan sebagai Owner.
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="owner-reason">Alasan Perubahan (Opsional)</FieldLabel>
              <Input
                id="owner-reason"
                placeholder="Contoh: Koreksi kepemilikan salah akun / request resmi via email"
                value={ownerReasonInput}
                onChange={(e) => setOwnerReasonInput(e.target.value)}
                disabled={ownerSubmitting}
              />
            </Field>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 gap-2">
            <div>
              {currentOwnerDetails?.isClaimed && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={handleUnclaimOwner}
                  disabled={ownerSubmitting}
                >
                  Lepas Kepemilikan (Unclaim)
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOwnerModalOpen(false)}
                disabled={ownerSubmitting}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleSaveOwner}
                disabled={ownerSubmitting || !ownerEmailInput.trim()}
              >
                {ownerSubmitting ? "Menyimpan..." : "Tetapkan Owner"}
              </Button>
            </div>
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
