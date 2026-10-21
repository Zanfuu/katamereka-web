"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { MyClaimsSection } from "@/components/my-claims-section"
import {
  fetchMyBusinessClaims,
  createBusinessClaim,
  type ApiMyBusinessClaim,
  type VerificationMethod,
} from "@/lib/api-client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  AlertTriangleIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  FileIcon,
  FileTextIcon,
  GlobeIcon,
  ImageIcon,
  MailIcon,
  MapPinIcon,
  PauseIcon,
  PencilIcon,
  PhoneIcon,
  PlayIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  TagsIcon,
  Trash2Icon,
  UploadIcon,
  UsersIcon,
  ClockIcon,
  CheckIcon,
  PlusIcon,
  XIcon,
  Share2Icon,
  SaveIcon,
  SparklesIcon,
  InfoIcon,
  CropIcon,
} from "lucide-react"

import { CoverCropDialog } from "@/components/cover-crop-dialog"
import { getConsumerSiteUrl } from "@/lib/site-config"
import { categoryDisplayName, isRealBusinessCategory } from "@/lib/slug"

import { useBusinessContext } from "@/components/business-provider"
import { resolveMediaUrl } from "@/lib/cms-api"
import {
  updateBusinessProfile,
  uploadBusinessLogo,
  uploadBusinessCover,
  deleteBusinessLogo,
  deleteBusinessCover,
} from "@/lib/api-business-dashboard"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"
import { PageHeader } from "@/components/page-header"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "cn"
import { formatDate } from "@/lib/format"
import { getLocationsByBusiness } from "@/lib/mock/businesses"
import { getVerificationByBusiness } from "@/lib/mock/verifications"
import type { Business, Location } from "@/lib/types"

const TABS = [
  { value: "informasi", label: "Informasi" },
  { value: "pengaturan", label: "Pengaturan & Kelengkapan" },
] as const

export default function DashboardBusinessPage() {
  const { selectedBusiness, isLoading, hasApprovedBusiness } = useBusinessContext()
  const [activeTab, setActiveTab] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      const urlTab = new URLSearchParams(window.location.search).get("tab")
      if (urlTab === "pengaturan" || urlTab === "informasi") return urlTab
      if (urlTab && ["lokasi", "kategori", "fasilitas", "jam", "media", "kelola"].includes(urlTab)) {
        return "pengaturan"
      }
    }
    return "informasi"
  })

  const handleTabChange = (val: string) => {
    setActiveTab(val)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("tab", val)
      window.history.replaceState({}, "", url.toString())
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 animate-pulse">
        <div className="h-8 w-60 rounded bg-muted" />
        <div className="h-4 w-96 rounded bg-muted" />
        <div className="h-96 w-full rounded-xl bg-muted/60 mt-4" />
      </div>
    )
  }

  if (!hasApprovedBusiness) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardBreadcrumb items={[{ label: "Business" }]} />

        <PageHeader
          title="Business Profile Management"
          description="Status verifikasi kepemilikan dan kelola profil bisnis Anda."
          action={
            <Button size="sm" render={<Link href="/klaim-bisnis" />} className="bg-[#008767] hover:bg-[#007458] text-white">
              <BuildingIcon className="mr-1.5 size-3.5" />
              Cari & Klaim Bisnis
            </Button>
          }
        />

        <MyClaimsSection />
      </div>
    )
  }

  if (!selectedBusiness) return null

  return (
    <div className="flex flex-col gap-4">
      <DashboardBreadcrumb items={[{ label: "Business" }]} />

      <PageHeader
        title="Business Profile Management"
        description="Kelola profil bisnis Anda. Data yang diperbarui di sini akan menjadi sumber utama tampilan publik Katamereka."
        action={
          <Button
            variant="outline"
            render={
              <a href={`${getConsumerSiteUrl()}/business/${selectedBusiness.slug}`} target="_blank" rel="noreferrer" />
            }
          >
            Lihat Public Profile
            <ExternalLinkIcon className="ml-1 size-3.5" />
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={(val) => typeof val === "string" && handleTabChange(val)}>
        <TabsList variant="line" className="w-full justify-start overflow-x-auto border-b">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-sm font-semibold">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="informasi" className="pt-4">
          <InformasiTab key={selectedBusiness.id} business={selectedBusiness} />
        </TabsContent>

        <TabsContent value="pengaturan" className="pt-4 space-y-10">
          {/* Section 1: Informasi Profil & Kontak Bisnis */}
          <div id="section-informasi-utama" className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <BuildingIcon className="size-5 text-[#008767]" />
              <h2 className="text-base font-bold text-slate-900">1. Informasi Profil &amp; Kontak Bisnis</h2>
            </div>
            <InformasiUtamaTab key={`info-${selectedBusiness.id}`} business={selectedBusiness} />
          </div>

          {/* Section 2: Lokasi */}
          <div id="section-lokasi" className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <MapPinIcon className="size-5 text-[#008767]" />
              <h2 className="text-base font-bold text-slate-900">2. Alamat &amp; Wilayah Operasional</h2>
            </div>
            <LokasiTab key={`lokasi-${selectedBusiness.id}`} business={selectedBusiness} />
          </div>

          {/* Section 3: Kategori & Layanan */}
          <div id="section-kategori" className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <TagsIcon className="size-5 text-[#008767]" />
              <h2 className="text-base font-bold text-slate-900">3. Kategori &amp; Layanan Bisnis</h2>
            </div>
            <KategoriTab key={`kategori-${selectedBusiness.id}`} business={selectedBusiness} />
          </div>

          {/* Section 4: Fasilitas */}
          <div id="section-fasilitas" className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <SparklesIcon className="size-5 text-[#008767]" />
              <h2 className="text-base font-bold text-slate-900">4. Fasilitas Usaha</h2>
            </div>
            <FasilitasTab key={`fasilitas-${selectedBusiness.id}`} business={selectedBusiness} />
          </div>

          {/* Section 5: Jam Operasional */}
          <div id="section-jam" className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <ClockIcon className="size-5 text-[#008767]" />
              <h2 className="text-base font-bold text-slate-900">5. Jam Operasional</h2>
            </div>
            <JamOperasionalTab key={`jam-${selectedBusiness.id}`} business={selectedBusiness} />
          </div>

          {/* Section 6: Media & Sosmed */}
          <div id="section-media" className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <Share2Icon className="size-5 text-[#008767]" />
              <h2 className="text-base font-bold text-slate-900">6. Media &amp; Sosial Media</h2>
            </div>
            <MediaTab key={`media-${selectedBusiness.id}`} business={selectedBusiness} />
          </div>

          {/* Section 7: Pengaturan & Kelengkapan */}
          <div id="section-pengaturan" className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <ShieldCheckIcon className="size-5 text-[#008767]" />
              <h2 className="text-base font-bold text-slate-900">7. Kelengkapan Profil &amp; Kebijakan</h2>
            </div>
            <PengaturanTab key={`pengaturan-${selectedBusiness.id}`} business={selectedBusiness} />
          </div>
        </TabsContent>
      </Tabs>
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
    <div className="flex items-start gap-3 border-b border-border py-3 last:border-0">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  )
}

/* ==================================================
 * SHARED DATA HELPERS FOR SUMMARY & EDIT TABS
 * ================================================== */
interface DaySchedule {
  day: string
  label: string
  open: string
  close: string
  closed: boolean
}

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day: "monday", label: "Senin", open: "08:00", close: "21:00", closed: false },
  { day: "tuesday", label: "Selasa", open: "08:00", close: "21:00", closed: false },
  { day: "wednesday", label: "Rabu", open: "08:00", close: "21:00", closed: false },
  { day: "thursday", label: "Kamis", open: "08:00", close: "21:00", closed: false },
  { day: "friday", label: "Jumat", open: "08:00", close: "22:00", closed: false },
  { day: "saturday", label: "Sabtu", open: "09:00", close: "22:00", closed: false },
  { day: "sunday", label: "Minggu", open: "09:00", close: "18:00", closed: true },
]

function parseOpeningHours(raw: any): DaySchedule[] {
  if (!raw || typeof raw !== "object") return DEFAULT_SCHEDULE
  return DEFAULT_SCHEDULE.map((item) => {
    const dayData = raw[item.day]
    if (dayData && typeof dayData === "object") {
      return {
        ...item,
        open: dayData.open || item.open,
        close: dayData.close || item.close,
        closed: typeof dayData.closed === "boolean" ? dayData.closed : false,
      }
    }
    return item
  })
}

function getTodayOpeningStatus(schedule: DaySchedule[]) {
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  const todayKey = dayNames[new Date().getDay()]
  const todaySched = schedule.find((s) => s.day === todayKey)
  if (!todaySched) return { isOpen: false, text: "Jadwal belum diatur" }
  if (todaySched.closed) return { isOpen: false, text: "Tutup hari ini" }
  return {
    isOpen: true,
    text: `Buka hari ini: ${todaySched.open} – ${todaySched.close}`,
  }
}

function parseInitialFacilities(raw: any): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.filter((f) => typeof f === "string" && f.trim() !== "")
  }
  if (typeof raw === "object") {
    const list: string[] = []
    if (raw.wifi || raw.internet_access) list.push("Wi-Fi Gratis")
    if (raw.ac || raw.air_conditioning) list.push("Ruangan Ber-AC")
    if (raw.parking || raw.area_parkir) list.push("Area Parkir Luas")
    if (raw.wheelchair) list.push("Akses Kursi Roda / Disabilitas")
    if (raw.musholla || raw.masjid) list.push("Musholla / Tempat Ibadah")
    if (raw.toilet) list.push("Toilet Bersih")
    if (raw.qris || raw.cashless) list.push("Pembayaran Non-Tunai / QRIS")
    if (raw.reception_24h || raw.front_desk) list.push("Resepsionis 24 Jam")
    Object.entries(raw).forEach(([k, v]) => {
      if (typeof v === "string" && !list.includes(v)) list.push(v)
    })
    return list
  }
  if (typeof raw === "string") {
    return raw.split(",").map((s) => s.trim()).filter(Boolean)
  }
  return []
}

function cleanSocialUsername(platform: string, val: string | undefined | null): string {
  if (!val) return ""
  let text = String(val).trim()
  if (!text) return ""

  try {
    if (text.startsWith("http://") || text.startsWith("https://")) {
      const parsed = new URL(text)
      const pathname = parsed.pathname.replace(/^\/+|\/+$/g, "")
      const segments = pathname.split("/").filter(Boolean)
      if (segments.length > 0) {
        if (segments[0] === "company" || segments[0] === "in") {
          return segments[1] || segments[0]
        }
        return segments[segments.length - 1].replace(/^@/, "")
      }
    }
  } catch {}

  text = text.replace(/^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|facebook\.com|tiktok\.com|linkedin\.com|youtube\.com)\/?/i, "")
  text = text.replace(/^company\//i, "")
  text = text.replace(/^in\//i, "")
  text = text.replace(/^@/, "")
  return text.trim()
}

function formatSocialToFullUrl(platform: string, usernameOrUrl: string | undefined | null): string {
  if (!usernameOrUrl) return ""
  const text = String(usernameOrUrl).trim()
  if (!text) return ""

  const cleanUser = cleanSocialUsername(platform, text)
  if (!cleanUser) return ""

  switch (platform.toLowerCase()) {
    case "instagram":
      return `https://instagram.com/${cleanUser}`
    case "facebook":
      return `https://facebook.com/${cleanUser}`
    case "tiktok":
      return `https://tiktok.com/@${cleanUser}`
    case "linkedin":
      return `https://linkedin.com/company/${cleanUser}`
    case "youtube":
      return `https://youtube.com/@${cleanUser}`
    default:
      return text
  }
}

/* ==================================================
 * TAB 1: INFORMASI (RINGKASAN LENGKAP SEMUA PENGATURAN)
 * ================================================== */
function InformasiTab({ business }: { business: Business }) {
  // Dynamic claim state
  const [claim, setClaim] = React.useState<ApiMyBusinessClaim | null>(null)
  const [loadingClaim, setLoadingClaim] = React.useState(true)
  const [reclaimOpen, setReclaimOpen] = React.useState(false)
  const [reclaimMethod, setReclaimMethod] = React.useState<VerificationMethod>("DOCUMENT")
  const [reclaimProofUrl, setReclaimProofUrl] = React.useState("")
  const [reclaimMessage, setReclaimMessage] = React.useState("")
  const [reclaimSubmitting, setReclaimSubmitting] = React.useState(false)

  const loadClaims = React.useCallback(async () => {
    try {
      setLoadingClaim(true)
      const list = await fetchMyBusinessClaims()
      const matched = list.find((c) => c.business?.id === business.id) || (list.length > 0 ? list[0] : null)
      setClaim(matched)
      if (matched) {
        setReclaimMethod((matched.verification_method as VerificationMethod) || "DOCUMENT")
        setReclaimProofUrl(matched.proof_url || "")
      }
    } catch (err) {
      console.warn("Gagal mengambil status klaim di tab informasi:", err)
    } finally {
      setLoadingClaim(false)
    }
  }, [business.id])

  React.useEffect(() => {
    loadClaims()
  }, [loadClaims])

  async function handleConfirmReclaim() {
    const targetBusinessId = claim?.business?.id || business.id
    if (!targetBusinessId) return
    setReclaimSubmitting(true)
    try {
      const res = await createBusinessClaim(targetBusinessId, {
        verification_method: reclaimMethod,
        proof_url: reclaimProofUrl.trim() || undefined,
        message: reclaimMessage.trim() || undefined,
      })
      if (res.success) {
        toast.success(res.message || "Pengajuan klaim berhasil dikirim ulang, menunggu review admin.")
        setReclaimOpen(false)
        setClaim((prev) => (prev ? { ...prev, status: "PENDING" } : null))
        loadClaims()
      } else {
        toast.error(res.message || "Gagal mengajukan ulang klaim")
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengajukan ulang klaim")
    } finally {
      setReclaimSubmitting(false)
    }
  }

  const isVerified = business.verificationStatus === "VERIFIED" || claim?.status === "APPROVED"
  const isPending = !isVerified && claim?.status === "PENDING"
  const isRejected = !isVerified && claim?.status === "REJECTED"

  const initials = business.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const coverUrl = business.cover ? resolveMediaUrl(business.cover) : ""
  const logoUrl = business.logo ? resolveMediaUrl(business.logo) : ""

  const facilities = React.useMemo(
    () => parseInitialFacilities(business.facilities),
    [business.facilities]
  )

  const schedule = React.useMemo(
    () => parseOpeningHours(business.opening_hours),
    [business.opening_hours]
  )
  const todayStatus = React.useMemo(() => getTodayOpeningStatus(schedule), [schedule])

  const socialEntries = React.useMemo(() => {
    const sm = (business.socialMedia || (business as any).social_media) as Record<string, string> | undefined
    const fromLinks = Object.fromEntries((business.socialLinks ?? []).map((l) => [l.platform, l.url]))
    const platforms = [
      { key: "instagram", name: "Instagram" },
      { key: "facebook", name: "Facebook" },
      { key: "tiktok", name: "TikTok" },
      { key: "youtube", name: "YouTube" },
      { key: "linkedin", name: "LinkedIn" },
    ]
    return platforms
      .map((p) => {
        const val = sm?.[p.key] ?? fromLinks[p.key]
        const clean = cleanSocialUsername(p.key, val)
        const fullUrl = formatSocialToFullUrl(p.key, val)
        return { ...p, username: clean, url: fullUrl }
      })
      .filter((p) => Boolean(p.username))
  }, [business.socialMedia, business.socialLinks])

  // Profile completion meter
  const completionItems = [
    { label: "Nama Bisnis", completed: Boolean(business.name) },
    { label: "Deskripsi Bisnis", completed: Boolean(business.description) },
    { label: "Nomor Telepon / WhatsApp", completed: Boolean(business.phone) },
    { label: "Alamat Lengkap", completed: Boolean(business.address) },
    { label: "Kota / Kabupaten", completed: Boolean(business.city) },
    { label: "Kategori Utama", completed: Boolean(business.category) },
    { label: "Logo Bisnis", completed: Boolean(logoUrl) },
    { label: "Cover Header", completed: Boolean(coverUrl) },
    { label: "Fasilitas Usaha", completed: facilities.length > 0 },
    { label: "Jam Operasional", completed: Boolean(business.opening_hours) },
  ]
  const completedCount = completionItems.filter((i) => i.completed).length
  const percentage = Math.round((completedCount / completionItems.length) * 100)

  return (
    <div className="flex flex-col gap-6">
      {/* Main 2-Column Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Core Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Informasi Utama & Kontak */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BuildingIcon className="size-4 text-[#008767]" />
                Informasi Kontak &amp; Deskripsi
              </CardTitle>
              <CardDescription className="text-xs">
                Data utama identitas bisnis yang ditampilkan di profil publik Katamereka.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border pt-0">
              <InfoRow icon={BuildingIcon} label="Nama Bisnis" value={business.name} />
              <InfoRow icon={FileTextIcon} label="Deskripsi Bisnis" value={business.description || "Belum ada deskripsi bisnis."} />
              <InfoRow icon={MailIcon} label="Email Kontak" value={business.email || "Belum diisi"} />
              <InfoRow icon={PhoneIcon} label="No. Telepon / WhatsApp" value={business.phone || "Belum diisi"} />
              <InfoRow
                icon={GlobeIcon}
                label="Website Resmi"
                value={
                  business.website ? (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[#008767] font-semibold hover:underline"
                    >
                      {business.website}
                      <ExternalLinkIcon className="size-3.5" />
                    </a>
                  ) : (
                    "Belum diisi"
                  )
                }
              />
            </CardContent>
          </Card>

          {/* 2. Lokasi & Alamat */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MapPinIcon className="size-4 text-[#008767]" />
                Lokasi &amp; Wilayah Operasional
              </CardTitle>
              <CardDescription className="text-xs">
                Alamat fisik dan titik koordinat tempat usaha Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border pt-0">
              <InfoRow icon={MapPinIcon} label="Alamat Lengkap" value={business.address || "Belum diisi"} />
              <InfoRow
                icon={BuildingIcon}
                label="Kota &amp; Provinsi"
                value={`${business.city || "-"}, ${business.province || "Indonesia"}`}
              />
              <InfoRow icon={FileTextIcon} label="Kode Pos" value={business.postalCode || "Belum diisi"} />
              <InfoRow
                icon={MapPinIcon}
                label="Koordinat GPS"
                value={
                  <span className="font-mono text-xs">
                    Lat: {business.latitude ?? "-6.2088"} • Lon: {business.longitude ?? "106.8456"}
                  </span>
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 col): Visuals, Medsos & Claim Status */}
        <div className="space-y-6">
          {/* Logo & Cover Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ImageIcon className="size-4 text-[#008767]" />
                Logo &amp; Cover
              </CardTitle>
              <CardDescription className="text-xs">Identitas visual brand Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              <div className="relative aspect-video rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
                {coverUrl ? (
                  <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <ImageIcon className="size-4" /> Belum ada cover
                  </span>
                )}
                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs">
                  Cover Header
                </span>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <Avatar className="size-12 border border-slate-300">
                  {logoUrl ? (
                    <img src={logoUrl} alt={business.name} className="size-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-[#008767] text-white font-bold text-sm">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-bold text-slate-900 truncate">{business.name}</p>
                  <p className="text-slate-500">{logoUrl ? "Logo resmi aktif" : "Belum ada logo resmi"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Links Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Share2Icon className="size-4 text-[#008767]" />
                Media Sosial
              </CardTitle>
              <CardDescription className="text-xs">Tautan medsos resmi bisnis.</CardDescription>
            </CardHeader>
            <CardContent className="pt-1 space-y-2">
              {socialEntries.length === 0 ? (
                <div className="p-3 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400">
                  Belum ada akun media sosial yang terhubung.
                </div>
              ) : (
                socialEntries.map((s) => (
                  <a
                    key={s.key}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-[#008767] hover:bg-emerald-50/50 transition-colors group text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{s.name}</span>
                      <span className="text-slate-500 font-mono text-[11px]">@{s.username}</span>
                    </div>
                    <ExternalLinkIcon className="size-3.5 text-slate-400 group-hover:text-[#008767]" />
                  </a>
                ))
              )}
            </CardContent>
          </Card>

          {/* Status Owner Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheckIcon className="size-4 text-[#008767]" />
                Status Pemilik (Owner)
              </CardTitle>
              <CardDescription className="text-xs">
                Verifikasi kepemilikan bisnis di platform KataMereka.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              {loadingClaim ? (
                <div className="p-4 border rounded-xl animate-pulse text-xs text-muted-foreground text-center">
                  Memeriksa status verifikasi klaim...
                </div>
              ) : isVerified ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2Icon className="size-4 text-[#008767] shrink-0" />
                      <p className="text-xs font-bold text-[#008767]">Bisnis Terverifikasi</p>
                    </div>
                    <Badge className="bg-[#008767] text-white text-[10px]">Aktif</Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Anda memiliki hak akses penuh sebagai Owner Resmi untuk mengelola profil, membalas ulasan, dan menerima notifikasi pelanggan.
                  </p>
                </div>
              ) : isPending ? (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="size-4 text-amber-600 shrink-0" />
                      <p className="text-xs font-bold text-amber-900">Menunggu Review Admin</p>
                    </div>
                    <Badge className="bg-amber-500 text-white text-[10px]">Pending</Badge>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Pengajuan klaim sedang dalam antrean verifikasi tim admin (1-2 hari kerja).
                  </p>
                </div>
              ) : isRejected ? (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangleIcon className="size-4 text-rose-600 shrink-0" />
                      <p className="text-xs font-bold text-rose-900">Klaim Ditolak</p>
                    </div>
                    <Badge variant="destructive" className="text-[10px]">Ditolak</Badge>
                  </div>
                  <p className="text-[11px] text-rose-800">
                    {claim?.admin_notes || "Dokumen bukti kepemilikan belum memenuhi syarat verifikasi."}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setReclaimOpen(true)}
                    className="w-full bg-[#008767] hover:bg-[#007055] text-white text-xs cursor-pointer"
                  >
                    Ajukan Ulang Klaim
                  </Button>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <p className="text-xs text-slate-600">Bisnis belum diklaim sebagai milik Anda.</p>
                  <Button
                    size="sm"
                    render={<Link href="/klaim-bisnis" />}
                    className="w-full bg-[#008767] hover:bg-[#007055] text-white text-xs cursor-pointer"
                  >
                    Klaim Bisnis Ini
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row Lebar Penuh: Kategori, Fasilitas & Jam Operasional (Rata Kanan Kiri) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kategori Bisnis & Layanan */}
        <Card className="flex flex-col h-[270px]">
          <CardHeader className="pb-3 shrink-0">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TagsIcon className="size-4 text-[#008767]" />
              Kategori Bisnis &amp; Layanan
            </CardTitle>
            <CardDescription className="text-xs">
              Kategori utama dan tag layanan untuk filter pencarian.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 flex-1 overflow-y-auto">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5 font-medium">Kategori Utama:</p>
              <Badge className="bg-[#008767] text-white px-3 py-1 text-xs font-semibold">
                {business.category || "Bisnis"}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1.5 font-medium">Kategori Tambahan / Tag Layanan:</p>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(business.additionalCategories) && business.additionalCategories.length > 0 ? (
                  business.additionalCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-[#008767] font-semibold text-xs border border-emerald-200"
                    >
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Belum ada tag layanan tambahan</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fasilitas Usaha */}
        <Card className="flex flex-col h-[270px]">
          <CardHeader className="pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <SparklesIcon className="size-4 text-[#008767]" />
                Fasilitas Usaha
              </CardTitle>
              <Badge className="bg-emerald-50 text-[#008767] border border-emerald-200 text-[11px] font-semibold">
                {facilities.length} Fasilitas Aktif
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Fasilitas yang tersedia untuk pengunjung/pelanggan Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex-1 overflow-y-auto">
            {facilities.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                Belum ada fasilitas usaha yang ditambahkan.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {facilities.map((fac) => (
                  <span
                    key={fac}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-[#008767] text-xs font-semibold shadow-2xs"
                  >
                    <CheckCircle2Icon className="size-3.5 text-[#008767]" />
                    {fac}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jam Operasional - Sama besar dan bisa di-scroll ke bawah */}
        <Card className="flex flex-col h-[270px]">
          <CardHeader className="pb-3 shrink-0">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ClockIcon className="size-4 text-[#008767]" />
                Jam Operasional
              </CardTitle>
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold",
                  todayStatus.isOpen
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-red-100 text-red-800 border border-red-300"
                )}
              >
                {todayStatus.text}
              </span>
            </div>
            <CardDescription className="text-xs">
              Jadwal buka dan tutup operasional toko atau kantor.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex-1 overflow-y-auto space-y-1.5 pr-1.5">
            {schedule.map((item) => (
              <div
                key={item.day}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg border text-xs",
                  item.closed
                    ? "bg-slate-50 border-slate-200 text-slate-400"
                    : "bg-white border-slate-200 text-slate-800"
                )}
              >
                <span className="font-semibold">{item.label}</span>
                {item.closed ? (
                  <span className="font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded text-[11px]">
                    Tutup
                  </span>
                ) : (
                  <span className="font-mono font-medium text-slate-700 text-xs">
                    {item.open} - {item.close}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Reclaim Dialog */}
      <Dialog open={reclaimOpen} onOpenChange={setReclaimOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Ajukan Ulang Klaim Bisnis</DialogTitle>
            <CardDescription className="text-xs">
              Perbarui berkas atau bukti kepemilikan untuk ditinjau kembali oleh tim verifikasi admin.
            </CardDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs">Metode Verifikasi</Label>
              <Select
                value={reclaimMethod}
                onValueChange={(val) => setReclaimMethod(val as VerificationMethod)}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Pilih metode verifikasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOCUMENT">Dokumen Legal / NIB / SIUP</SelectItem>
                  <SelectItem value="WEBSITE">Domain / Email Resmi Bisnis</SelectItem>
                  <SelectItem value="PHONE">Verifikasi Telepon / WhatsApp</SelectItem>
                  <SelectItem value="OTHER">Lainnya / Akun Medsos Resmi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Link Bukti Kepemilikan (Proof URL)</Label>
              <Input
                placeholder="https://drive.google.com/... atau tautan berkas resmi"
                value={reclaimProofUrl}
                onChange={(e) => setReclaimProofUrl(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Pesan / Catatan Tambahan untuk Admin</Label>
              <Textarea
                rows={3}
                placeholder="Jelaskan perbaikan dokumen atau informasi tambahan..."
                value={reclaimMessage}
                onChange={(e) => setReclaimMessage(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReclaimOpen(false)}
              disabled={reclaimSubmitting}
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmReclaim}
              disabled={reclaimSubmitting}
              className="bg-[#008767] hover:bg-[#007458] text-white cursor-pointer"
            >
              {reclaimSubmitting ? "Mengirim..." : "Kirim Pengajuan Ulang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ==================================================
 * SECTION 1 DI TAB PENGATURAN: INFORMASI UTAMA & KONTAK
 * ================================================== */
function InformasiUtamaTab({ business }: { business: Business }) {
  const { refetch } = useBusinessContext()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [form, setForm] = React.useState({
    name: business.name || "",
    description: business.description || "",
    email: business.email ?? "",
    phone: business.phone ?? "",
    website: business.website ?? "",
  })

  React.useEffect(() => {
    setForm({
      name: business.name || "",
      description: business.description || "",
      email: business.email ?? "",
      phone: business.phone ?? "",
      website: business.website ?? "",
    })
  }, [business])

  async function handleSave() {
    if (!business.id) return
    setIsSubmitting(true)
    try {
      const res = await updateBusinessProfile(business.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        website: form.website.trim() || undefined,
      })
      if (res.success) {
        toast.success(res.message || "Informasi utama berhasil disimpan.")
        await refetch()
      } else {
        toast.error(res.message || "Gagal menyimpan informasi")
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan informasi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Profil &amp; Kontak Bisnis</CardTitle>
        <CardDescription>
          Perbarui nama resmi bisnis, deskripsi profil usaha, dan kontak yang dapat dihubungi pelanggan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="info-name">Nama Bisnis</FieldLabel>
            <Input
              id="info-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nama Resmi Bisnis Anda"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="info-desc">Deskripsi Bisnis</FieldLabel>
            <Textarea
              id="info-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ceritakan tentang profil, keunggulan, atau sejarah bisnis Anda..."
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field>
              <FieldLabel htmlFor="info-email">Email Kontak</FieldLabel>
              <Input
                id="info-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="kontak@bisnis.com"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="info-phone">No. Telepon / WA</FieldLabel>
              <Input
                id="info-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="08123456789"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="info-web">Website Resmi</FieldLabel>
              <Input
                id="info-web"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://bisnisanda.com"
              />
            </Field>
          </div>
        </FieldGroup>
        <div className="pt-2 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-[#008767] hover:bg-[#007055] text-white cursor-pointer"
          >
            <SaveIcon className="mr-1.5 size-4" />
            {isSubmitting ? "Menyimpan..." : "Simpan Informasi"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ==================================================
 * TAB 2: LOKASI
 * ================================================== */
function LokasiTab({ business }: { business: Business }) {
  const { refetch } = useBusinessContext()
  const [form, setForm] = React.useState({
    address: business.address || "",
    city: business.city || "",
    province: business.province || "Indonesia",
    postalCode: business.postalCode || "",
    latitude: business.latitude ? String(business.latitude) : "-6.2088",
    longitude: business.longitude ? String(business.longitude) : "106.8456",
  })

  React.useEffect(() => {
    setForm({
      address: business.address || "",
      city: business.city || "",
      province: business.province || "Indonesia",
      postalCode: business.postalCode || "",
      latitude: business.latitude ? String(business.latitude) : "-6.2088",
      longitude: business.longitude ? String(business.longitude) : "106.8456",
    })
  }, [business])

  const [saving, setSaving] = React.useState(false)

  const handleSave = async () => {
    if (!business.id) return
    setSaving(true)
    try {
      const res = await updateBusinessProfile(business.id, {
        address: form.address.trim(),
        city: form.city.trim(),
        province: form.province.trim(),
        postal_code: form.postalCode.trim() || undefined,
      })
      if (res.success) {
        toast.success(res.message || "Data lokasi berhasil diperbarui.")
        await refetch()
      } else {
        toast.error(res.message || "Gagal memperbarui lokasi.")
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan saat menyimpan lokasi.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Alamat &amp; Wilayah Operasional</CardTitle>
            <CardDescription>
              Atur lokasi fisik toko atau kantor Anda yang akan ditampilkan di peta dan kartu bisnis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="loc-address">Alamat Lengkap</FieldLabel>
                <Textarea
                  id="loc-address"
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Jl. Raya Utama No. 123, Kel. Kebayoran"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="loc-city">Kota / Kabupaten</FieldLabel>
                  <Input
                    id="loc-city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="loc-province">Provinsi</FieldLabel>
                  <Input
                    id="loc-province"
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="loc-postal">Kode Pos</FieldLabel>
                  <Input
                    id="loc-postal"
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  />
                </Field>
              </div>
            </FieldGroup>

            <div className="pt-2 flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="bg-[#008767] hover:bg-[#007055]">
                <SaveIcon className="mr-1.5 size-4" />
                {saving ? "Menyimpan..." : "Simpan Lokasi"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Koordinat GPS</CardTitle>
            <CardDescription>
              Koordinat bawaan dari penyedia peta external atau data sync.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Latitude:</span>
                <span className="font-mono font-bold text-slate-800">{form.latitude}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Longitude:</span>
                <span className="font-mono font-bold text-slate-800">{form.longitude}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                <span className="text-slate-500">External Provider:</span>
                <Badge variant="outline" className="text-[10px]">Synced</Badge>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              *Koordinat digunakan untuk menentukan lokasi bisnis Anda pada pencarian berbasis peta Katamereka.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ==================================================
 * TAB 3: KATEGORI & LAYANAN
 * ================================================== */
const SUGGESTED_TAGS = [
  "Wi-Fi Gratis",
  "Area Parkir",
  "AC",
  "Layanan 24 Jam",
  "Cashless / QRIS",
  "Outdoor Area",
  "Akses Kursi Roda",
  "Reservasi Online",
]

const DEFAULT_BUSINESS_CATEGORIES = [
  "Hotel & Penginapan",
  "Hotel & Akomodasi",
  "Restoran & Kafe",
  "Kuliner & Makanan",
  "Apartemen & Properti",
  "Chalet",
  "Guest House",
  "Hostel",
  "Rental Kendaraan",
  "Layanan & Jasa",
  "Pusat Perbelanjaan & Retail",
  "Wisata & Rekreasi",
  "Kesehatan & Medis",
  "Pendidikan & Kursus",
  "Kecantikan & Spa",
  "Teknologi & Komputer",
  "Bisnis & Keuangan",
  "Bisnis & Makanan",
  "Home Stay",
]

function KategoriTab({ business }: { business: Business }) {
  const { refetch } = useBusinessContext()
  const [isEditing, setIsEditing] = React.useState(false)
  const [primaryCategory, setPrimaryCategory] = React.useState(business.category || "Bisnis")
  const [existingCategories, setExistingCategories] = React.useState<string[]>(DEFAULT_BUSINESS_CATEGORIES)
  const [categories, setCategories] = React.useState<string[]>(() => {
    if (Array.isArray(business.additionalCategories) && business.additionalCategories.length > 0) {
      return business.additionalCategories
    }
    if (typeof window !== "undefined" && business.id) {
      try {
        const cached = localStorage.getItem(`katamereka_business_categories_${business.id}`)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch {}
    }
    return []
  })
  const [newCat, setNewCat] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    fetch("/api/business/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.categories)) {
          const names = d.categories
            .map((c: string) => categoryDisplayName(c))
            .filter((c: string) => isRealBusinessCategory(c))
          const merged = Array.from(new Set([...DEFAULT_BUSINESS_CATEGORIES, ...names]))
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b))
          setExistingCategories(merged)
        }
      })
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    setPrimaryCategory(business.category || "Bisnis")
  }, [business.category])

  React.useEffect(() => {
    if (Array.isArray(business.additionalCategories) && business.additionalCategories.length > 0) {
      setCategories(business.additionalCategories)
    } else if (typeof window !== "undefined" && business.id) {
      try {
        const cached = localStorage.getItem(`katamereka_business_categories_${business.id}`)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategories(parsed)
            return
          }
        }
      } catch {}

      fetch(`/api/business/categories?businessId=${encodeURIComponent(business.id)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.categories) && d.categories.length > 0) {
            setCategories(d.categories)
            try {
              localStorage.setItem(
                `katamereka_business_categories_${business.id}`,
                JSON.stringify(d.categories)
              )
            } catch {}
          }
        })
        .catch(() => {})
    }
  }, [business.additionalCategories, business.id])

  const handleAddCategory = (tag?: string) => {
    const val = (tag || newCat).trim()
    if (val && !categories.includes(val)) {
      setCategories([...categories, val])
      if (!tag) setNewCat("")
    }
  }

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat))
  }

  const handleCancel = () => {
    setPrimaryCategory(business.category || "Bisnis")
    setCategories(
      Array.isArray(business.additionalCategories) ? business.additionalCategories : []
    )
    setNewCat("")
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!business.id) return
    setSaving(true)
    try {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            `katamereka_business_categories_${business.id}`,
            JSON.stringify(categories)
          )
        } catch {}
      }

      const res = await updateBusinessProfile(business.id, {
        category: primaryCategory.trim(),
        categories: categories,
      })
      if (res.success) {
        toast.success(res.message || "Kategori & Layanan berhasil diperbarui.")
        setIsEditing(false)
        await refetch()
      } else {
        toast.error(res.message || "Gagal memperbarui kategori.")
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan kategori.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kategori Bisnis Utama &amp; Tambahan</CardTitle>
          <CardDescription>
            Tentukan kategori usaha Anda agar mudah ditemukan dalam hasil pencarian dan filter platform Katamereka.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field>
            <FieldLabel htmlFor="primary-cat">Kategori Utama</FieldLabel>
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
              <div className="flex-1">
                <Input
                  id="primary-cat"
                  value={primaryCategory}
                  onChange={(e) => setPrimaryCategory(e.target.value)}
                  placeholder="Ketik kategori utama baru atau pilih dari dropdown..."
                  disabled={!isEditing}
                  className={!isEditing ? "bg-slate-50 text-slate-700 disabled:opacity-90 disabled:cursor-default" : ""}
                />
              </div>
              {isEditing && (
                <div className="w-full sm:w-72 shrink-0">
                  <Select
                    value={existingCategories.includes(primaryCategory) ? primaryCategory : ""}
                    onValueChange={(val) => {
                      if (val) setPrimaryCategory(val)
                    }}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Pilih kategori yang ada..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {existingCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {isEditing && (
              <p className="text-[11px] text-slate-500 mt-1">
                *Pilih kategori dari dropdown atau ketik nama kategori baru Anda secara bebas pada kotak di sebelah kiri.
              </p>
            )}
          </Field>

          <div className="space-y-3">
            <FieldLabel>Kategori Tambahan / Tag Layanan</FieldLabel>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[60px] items-center">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 text-[#008767] font-bold text-xs border border-emerald-200"
                >
                  {cat}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="hover:text-red-600 transition-colors cursor-pointer"
                      title={`Hapus ${cat}`}
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  )}
                </span>
              ))}
              {categories.length === 0 && (
                <span className="text-xs text-slate-400">Belum ada kategori tambahan atau tag layanan.</span>
              )}
            </div>

            {isEditing && (
              <>
                <div className="flex gap-2">
                  <Input
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    placeholder="Tambah kategori baru (contoh: Wi-Fi Gratis, Outdoor Area)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddCategory()
                      }
                    }}
                  />
                  <Button variant="outline" type="button" onClick={() => handleAddCategory()}>
                    <PlusIcon className="mr-1 size-4" />
                    Tambah
                  </Button>
                </div>

                {/* Quick Suggestions */}
                <div className="pt-1">
                  <p className="text-[11px] text-slate-500 font-medium mb-1.5">Saran Tag Populer (klik untuk menambahkan):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_TAGS.map((tag) => {
                      const isAdded = categories.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          disabled={isAdded}
                          onClick={() => handleAddCategory(tag)}
                          className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                            isAdded
                              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                              : "bg-white text-slate-700 border-slate-200 hover:border-[#008767] hover:text-[#008767] hover:bg-emerald-50/50 cursor-pointer shadow-2xs"
                          }`}
                        >
                          {isAdded ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            {!isEditing ? (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-[#008767] hover:bg-[#007055] text-white cursor-pointer"
              >
                <PencilIcon className="mr-1.5 size-4" />
                Edit
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                  className="cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#008767] hover:bg-[#007055] text-white cursor-pointer"
                >
                  <SaveIcon className="mr-1.5 size-4" />
                  {saving ? "Menyimpan..." : "Simpan Kategori"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ==================================================
 * TAB: FASILITAS
 * ================================================== */
function FasilitasTab({ business }: { business: Business }) {
  const { refetch } = useBusinessContext()
  const initialFacilities = React.useMemo(
    () => parseInitialFacilities(business.facilities),
    [business.facilities]
  )

  // Initialize from localStorage draft if available, otherwise server data
  const [facilities, setFacilities] = React.useState<string[]>(() => {
    if (typeof window !== "undefined" && business?.id) {
      try {
        const draft = localStorage.getItem(`katamereka_facilities_draft_${business.id}`)
        if (draft !== null) {
          const parsed = JSON.parse(draft)
          if (Array.isArray(parsed)) return parsed
        }
      } catch {}
    }
    return parseInitialFacilities(business?.facilities)
  })

  const [customInput, setCustomInput] = React.useState<string>(() => {
    if (typeof window !== "undefined" && business?.id) {
      try {
        const draft = localStorage.getItem(`katamereka_facilities_input_draft_${business.id}`)
        if (draft !== null) return draft
      } catch {}
    }
    return ""
  })

  const [saving, setSaving] = React.useState(false)

  const [isEditing, setIsEditing] = React.useState<boolean>(() => {
    if (typeof window !== "undefined" && business?.id) {
      try {
        const draftEditing = localStorage.getItem(`katamereka_facilities_editing_${business.id}`)
        if (draftEditing !== null) return draftEditing === "true"
      } catch {}
    }
    const init = parseInitialFacilities(business?.facilities)
    return init.length === 0
  })

  // Keep draft persisted in localStorage so switching tabs never loses work
  React.useEffect(() => {
    if (typeof window !== "undefined" && business?.id) {
      try {
        localStorage.setItem(`katamereka_facilities_draft_${business.id}`, JSON.stringify(facilities))
      } catch {}
    }
  }, [facilities, business?.id])

  React.useEffect(() => {
    if (typeof window !== "undefined" && business?.id) {
      try {
        localStorage.setItem(`katamereka_facilities_input_draft_${business.id}`, customInput)
      } catch {}
    }
  }, [customInput, business?.id])

  React.useEffect(() => {
    if (typeof window !== "undefined" && business?.id) {
      try {
        localStorage.setItem(`katamereka_facilities_editing_${business.id}`, String(isEditing))
      } catch {}
    }
  }, [isEditing, business?.id])

  // Sync with server if business changes or on initial load without draft
  React.useEffect(() => {
    if (typeof window !== "undefined" && business?.id) {
      const draft = localStorage.getItem(`katamereka_facilities_draft_${business.id}`)
      if (draft === null) {
        setFacilities(initialFacilities)
        if (initialFacilities.length > 0) setIsEditing(false)
      }
    }
  }, [initialFacilities, business?.id])

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = customInput.trim()
    if (!trimmed) return
    if (!facilities.includes(trimmed)) {
      setFacilities((prev) => [...prev, trimmed])
    }
    setCustomInput("")
  }

  const removeFacility = (label: string) => {
    setFacilities((prev) => prev.filter((f) => f !== label))
  }

  const handleCancel = () => {
    setFacilities(initialFacilities)
    setCustomInput("")
    setIsEditing(false)
    if (typeof window !== "undefined" && business?.id) {
      try {
        localStorage.setItem(`katamereka_facilities_draft_${business.id}`, JSON.stringify(initialFacilities))
        localStorage.removeItem(`katamereka_facilities_input_draft_${business.id}`)
        localStorage.setItem(`katamereka_facilities_editing_${business.id}`, "false")
      } catch {}
    }
  }

  const handleSave = async () => {
    if (!business.id) return
    setSaving(true)
    try {
      const res = await updateBusinessProfile(business.id, {
        facilities: facilities,
      })
      if (res.success) {
        toast.success(res.message || "Fasilitas bisnis berhasil disimpan.")
        setIsEditing(false)
        if (typeof window !== "undefined" && business.id) {
          try {
            localStorage.setItem(`katamereka_facilities_draft_${business.id}`, JSON.stringify(facilities))
            localStorage.removeItem(`katamereka_facilities_input_draft_${business.id}`)
            localStorage.setItem(`katamereka_facilities_editing_${business.id}`, "false")
          } catch {}
        }
        await refetch()
      } else {
        toast.error(res.message || "Gagal menyimpan fasilitas bisnis.")
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan fasilitas.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-xs border-slate-200">
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <CardTitle className="text-lg font-bold text-slate-900">
              Kelola Fasilitas Usaha
            </CardTitle>
            <Badge className="bg-emerald-50 text-[#008767] border border-emerald-200 text-xs font-semibold">
              {facilities.length} Fasilitas Aktif
            </Badge>
          </div>
          <CardDescription className="mt-1 text-xs text-slate-500">
            Kelola fasilitas usaha yang ditampilkan pada profil publik bisnis Anda.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-5">
          {/* Section 1: Fasilitas Terpasang (Chips) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <SparklesIcon className="size-3.5 text-[#008767]" />
                Daftar Fasilitas ({facilities.length})
              </span>
              {isEditing && facilities.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFacilities([])}
                  className="text-[11px] text-rose-600 hover:underline font-medium cursor-pointer"
                >
                  Hapus Semua
                </button>
              )}
            </div>

            {facilities.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 italic text-center">
                {isEditing
                  ? "Belum ada fasilitas yang ditambahkan. Silakan ketik fasilitas usaha Anda pada kolom input di bawah lalu klik Tambah."
                  : "Belum ada fasilitas yang ditambahkan. Klik tombol Edit di bawah untuk menambahkan fasilitas."}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {facilities.map((fac) => (
                  <span
                    key={fac}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-[#008767] text-xs font-semibold shadow-2xs"
                  >
                    <span>{fac}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeFacility(fac)}
                        className="size-4 rounded-full hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title={`Hapus ${fac}`}
                      >
                        <XIcon className="size-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Input Fasilitas Usaha */}
          {isEditing && (
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">
                Tambah Fasilitas Usaha
              </Label>
              <form onSubmit={handleAddCustom} className="flex gap-2">
                <Input
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Ketik fasilitas usaha Anda (misal: Wi-Fi Gratis, Area Parkir, Ruangan Ber-AC, Musholla)..."
                  className="text-xs h-10"
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-10 px-4 cursor-pointer"
                >
                  <PlusIcon className="mr-1.5 size-4" />
                  Tambah
                </Button>
              </form>
              <p className="text-[11px] text-slate-400">
                Tekan <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">Enter</kbd> atau klik tombol <strong>Tambah</strong> untuk memasukkan fasilitas ke dalam daftar.
              </p>
            </div>
          )}

          {/* Footer Action Button: Edit vs Simpan */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            {!isEditing ? (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-[#008767] hover:bg-[#007055] text-white cursor-pointer px-6"
              >
                <PencilIcon className="mr-1.5 size-4" />
                Edit
              </Button>
            ) : (
              <>
                {initialFacilities.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                    className="cursor-pointer"
                  >
                    Batal
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#008767] hover:bg-[#007055] text-white cursor-pointer px-6"
                >
                  <SaveIcon className="mr-1.5 size-4" />
                  {saving ? "Menyimpan..." : "Simpan Fasilitas"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ==================================================
 * TAB 4: JAM OPERASIONAL
 * ================================================== */
function JamOperasionalTab({ business }: { business: Business }) {
  const { refetch } = useBusinessContext()
  const [schedule, setSchedule] = React.useState<DaySchedule[]>(() =>
    parseOpeningHours(business.opening_hours)
  )

  React.useEffect(() => {
    if (business.opening_hours) {
      setSchedule(parseOpeningHours(business.opening_hours))
    }
  }, [business.opening_hours])

  const [saving, setSaving] = React.useState(false)

  const updateDay = (index: number, key: keyof DaySchedule, value: any) => {
    const updated = [...schedule]
    updated[index] = { ...updated[index], [key]: value }
    setSchedule(updated)
  }

  const applyPreset24h = () => {
    setSchedule(
      schedule.map((s) => ({ ...s, open: "00:00", close: "23:59", closed: false }))
    )
    toast.success("Preset 24 Jam diterapkan untuk semua hari.")
  }

  const applyPresetWeekday = () => {
    setSchedule(
      schedule.map((s) => {
        if (s.day === "saturday" || s.day === "sunday") {
          return { ...s, closed: true }
        }
        return { ...s, open: "08:00", close: "17:00", closed: false }
      })
    )
    toast.success("Preset Jam Kerja Kantor diterapkan.")
  }

  const handleSave = async () => {
    if (!business.id) return
    setSaving(true)
    try {
      const openingHoursMap: Record<string, any> = {}
      schedule.forEach((s) => {
        openingHoursMap[s.day] = {
          open: s.open,
          close: s.close,
          closed: s.closed,
        }
      })
      const res = await updateBusinessProfile(business.id, {
        opening_hours: openingHoursMap,
      })
      if (res.success) {
        toast.success(res.message || "Jam operasional berhasil disimpan.")
        await refetch()
      } else {
        toast.error(res.message || "Gagal menyimpan jam operasional.")
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan jam operasional.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Pengaturan Jam Operasional</CardTitle>
            <CardDescription>
              Atur waktu operasional harian bisnis Anda agar pelanggan tahu kapan toko/kantor Anda buka.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={applyPresetWeekday} className="text-xs">
              <ClockIcon className="mr-1 size-3.5" />
              Senin - Jumat (08:00-17:00)
            </Button>
            <Button variant="outline" size="sm" onClick={applyPreset24h} className="text-xs">
              24 Jam
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {schedule.map((item, idx) => (
              <div
                key={item.day}
                className={cn(
                  "p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors",
                  item.closed ? "bg-slate-50/70 opacity-75" : "hover:bg-slate-50/40"
                )}
              >
                <div className="flex items-center gap-3 sm:w-40">
                  <input
                    type="checkbox"
                    id={`toggle-${item.day}`}
                    checked={!item.closed}
                    onChange={(e) => updateDay(idx, "closed", !e.target.checked)}
                    className="size-4 text-[#008767] rounded border-slate-300 focus:ring-[#008767]"
                  />
                  <label htmlFor={`toggle-${item.day}`} className="font-bold text-slate-800 text-sm cursor-pointer">
                    {item.label}
                  </label>
                </div>

                {!item.closed ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={item.open}
                      onChange={(e) => updateDay(idx, "open", e.target.value)}
                      className="w-32 text-xs font-mono"
                    />
                    <span className="text-xs text-slate-400">s/d</span>
                    <Input
                      type="time"
                      value={item.close}
                      onChange={(e) => updateDay(idx, "close", e.target.value)}
                      className="w-32 text-xs font-mono"
                    />
                  </div>
                ) : (
                  <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                    Tutup
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="bg-[#008767] hover:bg-[#007055]">
              <SaveIcon className="mr-1.5 size-4" />
              {saving ? "Menyimpan..." : "Simpan Jam Operasional"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ==================================================
 * TAB 5: MEDIA & SOSMED
 * ================================================== */
function MediaTab({ business }: { business: Business }) {
  const { refetch } = useBusinessContext()
  const logoInputRef = React.useRef<HTMLInputElement>(null)
  const coverInputRef = React.useRef<HTMLInputElement>(null)

  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false)
  const [isUploadingCover, setIsUploadingCover] = React.useState(false)
  const [savingSocial, setSavingSocial] = React.useState(false)

  const [cropDialogOpen, setCropDialogOpen] = React.useState(false)
  const [cropImageSrc, setCropImageSrc] = React.useState<string | null>(null)
  const [isCropSaving, setIsCropSaving] = React.useState(false)

  const [coverUrl, setCoverUrl] = React.useState<string>(() => business.cover ? resolveMediaUrl(business.cover) : "")
  const [logoUrl, setLogoUrl] = React.useState<string>(() => business.logo ? resolveMediaUrl(business.logo) : "")

  React.useEffect(() => {
    if (business.cover) setCoverUrl(resolveMediaUrl(business.cover))
    else setCoverUrl("")
  }, [business.cover])

  React.useEffect(() => {
    if (business.logo) setLogoUrl(resolveMediaUrl(business.logo))
    else setLogoUrl("")
  }, [business.logo])

  const parseSocialFromBusiness = React.useCallback((b: Business) => {
    const sm = (b.socialMedia || (b as any).social_media) as Record<string, string> | undefined
    const fromLinks = Object.fromEntries((b.socialLinks ?? []).map((l) => [l.platform, l.url]))

    return {
      instagram: cleanSocialUsername("instagram", sm?.instagram ?? fromLinks.instagram),
      facebook: cleanSocialUsername("facebook", sm?.facebook ?? fromLinks.facebook),
      tiktok: cleanSocialUsername("tiktok", sm?.tiktok ?? fromLinks.tiktok),
      youtube: cleanSocialUsername("youtube", sm?.youtube ?? fromLinks.youtube),
      linkedin: cleanSocialUsername("linkedin", sm?.linkedin ?? fromLinks.linkedin),
    }
  }, [])

  const initialParsed = React.useMemo(() => parseSocialFromBusiness(business), [business, parseSocialFromBusiness])
  const [social, setSocial] = React.useState(initialParsed)
  const [isEditingSocial, setIsEditingSocial] = React.useState<boolean>(() => {
    const hasAny = Boolean(
      initialParsed.instagram || initialParsed.facebook || initialParsed.tiktok || initialParsed.youtube || initialParsed.linkedin
    )
    return !hasAny
  })

  // Sync state whenever business data updates or loads from GET, only if not actively editing
  React.useEffect(() => {
    if (!isEditingSocial) {
      setSocial(initialParsed)
    }
  }, [initialParsed, isEditingSocial])

  const initials = business.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !business.id) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file logo maksimal 5MB.")
      if (logoInputRef.current) logoInputRef.current.value = ""
      return
    }
    setIsUploadingLogo(true)
    try {
      const res = await uploadBusinessLogo(business.id, file)
      if (res.success) {
        toast.success(res.message || "Logo baru berhasil diunggah.")
        if (res.url) {
          setLogoUrl(resolveMediaUrl(res.url))
        }
        await refetch()
      } else {
        toast.error(res.message || "Gagal mengunggah logo.")
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengunggah logo.")
    } finally {
      setIsUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ""
    }
  }

  const handleDeleteLogo = async () => {
    if (!business.id) return
    setIsUploadingLogo(true)
    try {
      const res = await deleteBusinessLogo(business.id)
      if (res.success) {
        toast.success(res.message || "Logo berhasil dihapus.")
        setLogoUrl("")
        await refetch()
      } else {
        toast.error(res.message || "Gagal menghapus logo.")
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus logo.")
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !business.id) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file cover maksimal 10MB.")
      if (coverInputRef.current) coverInputRef.current.value = ""
      return
    }
    const objUrl = URL.createObjectURL(file)
    setCropImageSrc(objUrl)
    setCropDialogOpen(true)
    if (coverInputRef.current) coverInputRef.current.value = ""
  }

  const handleSaveCroppedCover = async (croppedFile: File) => {
    if (!business.id) return
    setIsCropSaving(true)
    try {
      const res = await uploadBusinessCover(business.id, croppedFile)
      if (res.success) {
        toast.success(res.message || "Cover baru berhasil disimpan dan diterapkan.")
        if (res.url) {
          setCoverUrl(resolveMediaUrl(res.url))
        }
        setCropDialogOpen(false)
        await refetch()
      } else {
        toast.error(res.message || "Gagal mengunggah cover.")
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengunggah cover.")
    } finally {
      setIsCropSaving(false)
    }
  }

  const handleOpenCropExisting = () => {
    if (!coverUrl) return
    setCropImageSrc(coverUrl)
    setCropDialogOpen(true)
  }

  const handleDeleteCover = async () => {
    if (!business.id) return
    setIsUploadingCover(true)
    try {
      const res = await deleteBusinessCover(business.id)
      if (res.success) {
        toast.success(res.message || "Cover berhasil dihapus.")
        setCoverUrl("")
        await refetch()
      } else {
        toast.error(res.message || "Gagal menghapus cover.")
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus cover.")
    } finally {
      setIsUploadingCover(false)
    }
  }

  const handleSaveSocial = async () => {
    if (!business.id) return
    setSavingSocial(true)
    try {
      const payloadSocial = {
        instagram: formatSocialToFullUrl("instagram", social.instagram),
        facebook: formatSocialToFullUrl("facebook", social.facebook),
        tiktok: formatSocialToFullUrl("tiktok", social.tiktok),
        youtube: formatSocialToFullUrl("youtube", social.youtube),
        linkedin: formatSocialToFullUrl("linkedin", social.linkedin),
      }

      const res = await updateBusinessProfile(business.id, {
        social_media: payloadSocial,
      })
      if (res.success) {
        toast.success(res.message || "Tautan media sosial berhasil disimpan.")
        setIsEditingSocial(false)
        await refetch()
      } else {
        toast.error(res.message || "Gagal menyimpan tautan media sosial.")
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan media sosial.")
    } finally {
      setSavingSocial(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upload Logo & Cover */}
      <Card>
        <CardHeader>
          <CardTitle>Logo &amp; Cover Upload</CardTitle>
          <CardDescription>
            Unggah logo dan gambar header cover resmi bisnis Anda (Maks. 5MB, JPG/PNG/WebP).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <p className="text-xs font-bold text-slate-800">Logo Bisnis</p>
            <div className="flex items-center gap-4">
              <Avatar className="size-16 border-2 border-white shadow-md">
                {logoUrl ? (
                  <img src={logoUrl} alt={business.name} className="size-full object-cover rounded-full" />
                ) : (
                  <AvatarFallback className="bg-[#008767] text-white font-bold text-base">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={logoInputRef}
                    className="hidden"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={handleLogoFileChange}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUploadingLogo}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <UploadIcon className="mr-1 size-3.5" />
                    {isUploadingLogo ? "Mengunggah..." : logoUrl ? "Ganti Logo" : "Upload Logo"}
                  </Button>
                  {logoUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isUploadingLogo}
                      className="text-red-600 hover:text-red-700"
                      onClick={handleDeleteLogo}
                    >
                      <Trash2Icon className="size-3.5" />
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">Rasio 1:1 direkomendasikan (e.g. 500x500px).</p>
              </div>
            </div>
          </div>

          {/* Cover Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-800">Cover Header Bisnis</p>
                  {coverUrl && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2Icon className="size-3 text-emerald-600" />
                      Tersimpan
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">Rasio 16:9 direkomendasikan (Maks. 10MB sebelum crop).</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={coverInputRef}
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleCoverFileChange}
                />
                {coverUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUploadingCover || isCropSaving}
                    onClick={handleOpenCropExisting}
                    title="Sesuaikan posisi atau crop gambar ini"
                  >
                    <CropIcon className="mr-1.5 size-3.5 text-[#008767]" />
                    Sesuaikan / Crop
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUploadingCover || isCropSaving}
                  onClick={() => coverInputRef.current?.click()}
                >
                  <UploadIcon className="mr-1.5 size-3.5" />
                  {isUploadingCover || isCropSaving ? "Memproses..." : coverUrl ? "Ganti Foto" : "Upload & Crop"}
                </Button>
                {coverUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUploadingCover || isCropSaving}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleDeleteCover}
                    title="Hapus Cover"
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>

            <div className="relative aspect-video rounded-xl bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-300 group">
              {coverUrl ? (
                <img src={coverUrl} alt="Cover Bisnis" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-slate-400">
                  <ImageIcon className="size-8" />
                  <span className="text-xs">Belum ada cover header</span>
                </div>
              )}
              {/* Optional overlay click on image */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {coverUrl ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenCropExisting}
                      className="text-xs font-semibold text-white bg-black/75 hover:bg-black/90 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow transition-transform hover:scale-105"
                    >
                      <CropIcon className="size-3.5 text-emerald-400" /> Sesuaikan / Crop
                    </button>
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="text-xs font-semibold text-white bg-black/75 hover:bg-black/90 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow transition-transform hover:scale-105"
                    >
                      <UploadIcon className="size-3.5" /> Ganti Gambar
                    </button>
                  </div>
                ) : (
                  <span
                    onClick={() => coverInputRef.current?.click()}
                    className="text-xs font-semibold text-white bg-black/60 px-3 py-1.5 rounded-full flex items-center gap-1.5"
                  >
                    <UploadIcon className="size-3.5" /> Klik untuk unggah gambar
                  </span>
                )}
              </div>
            </div>

            {coverUrl && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckIcon className="size-3.5" /> Cover aktif terpasang pada tampilan publik
                </span>
                <span className="font-mono text-slate-400">Format 16:9 HD</span>
              </div>
            )}
          </div>

          <CoverCropDialog
            open={cropDialogOpen}
            onOpenChange={setCropDialogOpen}
            imageSrc={cropImageSrc}
            onSave={handleSaveCroppedCover}
            isSaving={isCropSaving}
          />
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle>Tautan Media Sosial</CardTitle>
          <CardDescription>
            Cukup masukkan nama username akun media sosial bisnis Anda. Sistem akan otomatis membuatkan tautan URL lengkap.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="social-ig">Instagram</FieldLabel>
              <div className="flex rounded-md shadow-2xs">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-xs font-mono select-none">
                  instagram.com/
                </span>
                <Input
                  id="social-ig"
                  value={social.instagram}
                  onChange={(e) => setSocial({ ...social, instagram: cleanSocialUsername("instagram", e.target.value) })}
                  placeholder="username_bisnis (misal: zanfuu._)"
                  disabled={!isEditingSocial}
                  className={`rounded-l-none text-xs ${!isEditingSocial ? "bg-slate-50 text-slate-700 disabled:opacity-90 disabled:cursor-default" : ""}`}
                />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="social-fb">Facebook</FieldLabel>
              <div className="flex rounded-md shadow-2xs">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-xs font-mono select-none">
                  facebook.com/
                </span>
                <Input
                  id="social-fb"
                  value={social.facebook}
                  onChange={(e) => setSocial({ ...social, facebook: cleanSocialUsername("facebook", e.target.value) })}
                  placeholder="username_bisnis"
                  disabled={!isEditingSocial}
                  className={`rounded-l-none text-xs ${!isEditingSocial ? "bg-slate-50 text-slate-700 disabled:opacity-90 disabled:cursor-default" : ""}`}
                />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="social-tt">TikTok</FieldLabel>
              <div className="flex rounded-md shadow-2xs">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-xs font-mono select-none">
                  tiktok.com/@
                </span>
                <Input
                  id="social-tt"
                  value={social.tiktok}
                  onChange={(e) => setSocial({ ...social, tiktok: cleanSocialUsername("tiktok", e.target.value) })}
                  placeholder="username_bisnis"
                  disabled={!isEditingSocial}
                  className={`rounded-l-none text-xs ${!isEditingSocial ? "bg-slate-50 text-slate-700 disabled:opacity-90 disabled:cursor-default" : ""}`}
                />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="social-yt">YouTube</FieldLabel>
              <div className="flex rounded-md shadow-2xs">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-xs font-mono select-none">
                  youtube.com/@
                </span>
                <Input
                  id="social-yt"
                  value={social.youtube}
                  onChange={(e) => setSocial({ ...social, youtube: cleanSocialUsername("youtube", e.target.value) })}
                  placeholder="channel_bisnis"
                  disabled={!isEditingSocial}
                  className={`rounded-l-none text-xs ${!isEditingSocial ? "bg-slate-50 text-slate-700 disabled:opacity-90 disabled:cursor-default" : ""}`}
                />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="social-li">LinkedIn</FieldLabel>
              <div className="flex rounded-md shadow-2xs">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-xs font-mono select-none">
                  linkedin.com/company/
                </span>
                <Input
                  id="social-li"
                  value={social.linkedin}
                  onChange={(e) => setSocial({ ...social, linkedin: cleanSocialUsername("linkedin", e.target.value) })}
                  placeholder="nama_perusahaan"
                  disabled={!isEditingSocial}
                  className={`rounded-l-none text-xs ${!isEditingSocial ? "bg-slate-50 text-slate-700 disabled:opacity-90 disabled:cursor-default" : ""}`}
                />
              </div>
            </Field>
          </FieldGroup>

          <div className="pt-2 flex justify-end gap-2">
            {!isEditingSocial ? (
              <Button
                type="button"
                onClick={() => setIsEditingSocial(true)}
                className="bg-[#008767] hover:bg-[#007055] text-white cursor-pointer px-6"
              >
                <PencilIcon className="mr-1.5 size-4" />
                Edit
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSocial(initialParsed)
                    setIsEditingSocial(false)
                  }}
                  disabled={savingSocial}
                  className="cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveSocial}
                  disabled={savingSocial}
                  className="bg-[#008767] hover:bg-[#007055] text-white cursor-pointer px-6"
                >
                  <SaveIcon className="mr-1.5 size-4" />
                  {savingSocial ? "Menyimpan..." : "Simpan Media Sosial"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ==================================================
 * TAB 6: PENGATURAN & PROFILE COMPLETION
 * ================================================== */
function PengaturanTab({ business }: { business: Business }) {
  const completionItems = [
    { label: "Nama Bisnis", completed: Boolean(business.name) },
    { label: "Deskripsi Bisnis", completed: Boolean(business.description) },
    { label: "Nomor Telepon / WhatsApp", completed: Boolean(business.phone) },
    { label: "Alamat Lengkap", completed: Boolean(business.address) },
    { label: "Kota / Kabupaten", completed: Boolean(business.city) },
    { label: "Kategori Utama", completed: Boolean(business.category) },
    { label: "Logo Bisnis", completed: true },
    { label: "Gambar Sampul (Cover)", completed: true },
  ]

  const completedCount = completionItems.filter((i) => i.completed).length
  const percentage = Math.round((completedCount / completionItems.length) * 100)

  return (
    <div className="w-full space-y-6">
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <SparklesIcon className="size-5 text-[#008767]" />
              Kelengkapan Profil Bisnis (Profile Completion)
            </CardTitle>
            <Badge className="bg-[#008767] text-white text-xs font-bold px-3 py-1">
              {percentage}% Selesai
            </Badge>
          </div>
          <CardDescription className="text-emerald-800">
            Profil bisnis yang lengkap mendapatkan visibilitas 3x lebih tinggi pada rekomendasi publik Katamereka.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-[#008767] h-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {completionItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs p-2.5 rounded-xl bg-white border border-slate-200"
              >
                {item.completed ? (
                  <CheckCircle2Icon className="size-4 text-[#008767] shrink-0" />
                ) : (
                  <AlertTriangleIcon className="size-4 text-amber-500 shrink-0" />
                )}
                <span className={cn("font-medium", item.completed ? "text-slate-800" : "text-slate-500")}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sumber Data &amp; Source of Truth Policy</CardTitle>
          <CardDescription>
            Kebijakan pengelolaan data owner managed vs external provider (Geoapify).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <InfoIcon className="size-4 text-[#008767]" />
              Kebijakan Sinkronisasi External Data:
            </div>
            <p>
              Setelah bisnis berhasil di-claim, data yang diubah oleh Owner/Admin menjadi **Source of Truth** utama untuk Katamereka. Sinkronisasi otomatis tidak akan menimpa nama, deskripsi, kontak, atau media yang dikelola owner.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

