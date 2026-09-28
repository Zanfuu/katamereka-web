"use client"

import * as React from "react"
import { toast } from "sonner"
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
} from "lucide-react"

import { useBusinessContext } from "@/components/business-provider"
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
  { value: "lokasi", label: "Lokasi" },
  { value: "kategori", label: "Kategori & Layanan" },
  { value: "jam", label: "Jam Operasional" },
  { value: "media", label: "Media & Sosmed" },
  { value: "pengaturan", label: "Pengaturan & Kelengkapan" },
] as const

export default function DashboardBusinessPage() {
  const { selectedBusiness } = useBusinessContext()
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
              <a href={`/business/${selectedBusiness.slug}`} target="_blank" rel="noreferrer" />
            }
          >
            Lihat Public Profile
            <ExternalLinkIcon className="ml-1 size-3.5" />
          </Button>
        }
      />

      <Tabs defaultValue="informasi">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto border-b">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="informasi" className="pt-4">
          <InformasiTab key={selectedBusiness.id} business={selectedBusiness} />
        </TabsContent>
        <TabsContent value="lokasi" className="pt-4">
          <LokasiTab key={selectedBusiness.id} business={selectedBusiness} />
        </TabsContent>
        <TabsContent value="kategori" className="pt-4">
          <KategoriTab key={selectedBusiness.id} business={selectedBusiness} />
        </TabsContent>
        <TabsContent value="jam" className="pt-4">
          <JamOperasionalTab key={selectedBusiness.id} business={selectedBusiness} />
        </TabsContent>
        <TabsContent value="media" className="pt-4">
          <MediaTab key={selectedBusiness.id} business={selectedBusiness} />
        </TabsContent>
        <TabsContent value="pengaturan" className="pt-4">
          <PengaturanTab key={selectedBusiness.id} business={selectedBusiness} />
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
 * TAB 1: INFORMASI
 * ================================================== */
function InformasiTab({ business }: { business: Business }) {
  const [editBasicOpen, setEditBasicOpen] = React.useState(false)
  const [editDetailOpen, setEditDetailOpen] = React.useState(false)

  const initials = business.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle>Informasi Utama</CardTitle>
              <CardDescription>
                Informasi utama bisnis yang ditampilkan kepada calon pelanggan.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditBasicOpen(true)}>
              <PencilIcon className="mr-1 size-3.5" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar className="size-20 shrink-0">
              <AvatarFallback className="bg-[#008767] text-xl font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 divide-y divide-border">
              <InfoRow icon={BuildingIcon} label="Nama Bisnis (Owner Managed)" value={business.name} />
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle>Detail Bisnis</CardTitle>
              <CardDescription>
                Kategori dan detail tambahan profil usaha Anda.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditDetailOpen(true)}>
              <PencilIcon className="mr-1 size-3.5" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <InfoRow
              icon={BriefcaseIcon}
              label="Kategori Utama"
              value={<Badge className="bg-[#008767] text-white">{business.category}</Badge>}
            />
            <InfoRow
              icon={MapPinIcon}
              label="Alamat Bisnis"
              value={`${business.address}, ${business.city} ${business.postalCode ?? ""}`}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        {/* Quick Logo & Cover Card */}
        <Card>
          <CardHeader>
            <CardTitle>Logo &amp; Sampul Bisnis</CardTitle>
            <CardDescription>
              Tampilkan identitas visual brand Anda di profil Katamereka.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="relative overflow-hidden rounded-xl bg-slate-100 border border-slate-200 aspect-video flex items-center justify-center">
              <ImageIcon className="size-8 text-slate-400" />
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs">
                Gambar Sampul (Cover)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="size-14 border-2 border-white shadow-md">
                <AvatarFallback className="bg-[#008767] text-white font-bold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-xs space-y-0.5">
                <p className="font-semibold text-slate-900">{business.name}</p>
                <p className="text-slate-500">Logo Bisnis Resmi</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => toast.success("Foto logo & cover dapat diperbarui di tab Media.")}
              >
                Kelola Media &rarr;
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Pemilik (Owner)</CardTitle>
            <CardDescription>
              Status verifikasi klaim kepemilikan bisnis Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="size-5 text-[#008767]" />
                <div>
                  <p className="text-xs font-bold text-[#008767]">Bisnis Terverifikasi</p>
                  <p className="text-[11px] text-slate-600">Claim ID: #CLM-{business.id.slice(0, 6)}</p>
                </div>
              </div>
              <Badge className="bg-[#008767]">Source of Truth Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <EditBasicInfoDialog open={editBasicOpen} onOpenChange={setEditBasicOpen} business={business} />
      <EditDetailDialog open={editDetailOpen} onOpenChange={setEditDetailOpen} business={business} />
    </div>
  )
}

/* ==================================================
 * TAB 2: LOKASI
 * ================================================== */
function LokasiTab({ business }: { business: Business }) {
  const [form, setForm] = React.useState({
    address: business.address || "",
    city: business.city || "",
    province: "DKI Jakarta",
    postalCode: business.postalCode || "",
    latitude: "-6.2088",
    longitude: "106.8456",
  })

  const [saving, setSaving] = React.useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success("Data lokasi berhasil diperbarui.")
    }, 600)
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
            <CardTitle>Koordinat GPS (Geoapify External Data)</CardTitle>
            <CardDescription>
              Koordinat bawaan dari penyedia peta external. Read-only untuk MVP.
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
                <Badge variant="outline" className="text-[10px]">Geoapify Synced</Badge>
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
function KategoriTab({ business }: { business: Business }) {
  const [primaryCategory, setPrimaryCategory] = React.useState(business.category || "Kuliner & Resto")
  const [categories, setCategories] = React.useState<string[]>(
    business.additionalCategories || ["Cafe", "Bakery", "Coffee Shop", "Tempat Kerja Remote"]
  )
  const [newCat, setNewCat] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  const handleAddCategory = () => {
    if (newCat.trim() && !categories.includes(newCat.trim())) {
      setCategories([...categories, newCat.trim()])
      setNewCat("")
    }
  }

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat))
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success("Kategori & Layanan berhasil diperbarui.")
    }, 600)
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kategori Bisnis Utama &amp; Tambahan</CardTitle>
          <CardDescription>
            Tentukan kategori usaha Anda agar mudah ditemukan dalam hasil pencarian pencarian dan filter platform Katamereka.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field>
            <FieldLabel htmlFor="primary-cat">Kategori Utama</FieldLabel>
            <Input
              id="primary-cat"
              value={primaryCategory}
              onChange={(e) => setPrimaryCategory(e.target.value)}
              placeholder="Contoh: Restoran & Kafe, Rental Mobil, Jasa Kebersihan"
            />
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
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </span>
              ))}
              {categories.length === 0 && (
                <span className="text-xs text-slate-400">Belum ada kategori tambahan.</span>
              )}
            </div>

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
              <Button variant="outline" type="button" onClick={handleAddCategory}>
                <PlusIcon className="mr-1 size-4" />
                Tambah
              </Button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="bg-[#008767] hover:bg-[#007055]">
              <SaveIcon className="mr-1.5 size-4" />
              {saving ? "Menyimpan..." : "Simpan Kategori"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ==================================================
 * TAB 4: JAM OPERASIONAL
 * ================================================== */
interface DaySchedule {
  day: string
  label: string
  open: string
  close: string
  closed: boolean
}

function JamOperasionalTab({ business }: { business: Business }) {
  const [schedule, setSchedule] = React.useState<DaySchedule[]>([
    { day: "monday", label: "Senin", open: "08:00", close: "21:00", closed: false },
    { day: "tuesday", label: "Selasa", open: "08:00", close: "21:00", closed: false },
    { day: "wednesday", label: "Rabu", open: "08:00", close: "21:00", closed: false },
    { day: "thursday", label: "Kamis", open: "08:00", close: "21:00", closed: false },
    { day: "friday", label: "Jumat", open: "08:00", close: "22:00", closed: false },
    { day: "saturday", label: "Sabtu", open: "09:00", close: "22:00", closed: false },
    { day: "sunday", label: "Minggu", open: "09:00", close: "18:00", closed: true },
  ])

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

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success("Jam operasional berhasil disimpan.")
    }, 600)
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
  const [social, setSocial] = React.useState({
    instagram: "https://instagram.com/transgo.id",
    facebook: "https://facebook.com/transgo.official",
    tiktok: "https://tiktok.com/@transgo.id",
    linkedin: "https://linkedin.com/company/transgo-id",
  })

  const [saving, setSaving] = React.useState(false)

  const handleSaveSocial = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success("Tautan media sosial berhasil disimpan.")
    }, 600)
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
                <AvatarFallback className="bg-[#008767] text-white font-bold text-base">
                  TG
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast.success("Logo baru berhasil diunggah.")}>
                    <UploadIcon className="mr-1 size-3.5" />
                    Upload Logo
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => toast.success("Logo berhasil dihapus.")}
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500">Rasio 1:1 direkomendasikan (e.g. 500x500px).</p>
              </div>
            </div>
          </div>

          {/* Cover Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <p className="text-xs font-bold text-slate-800">Cover Header Bisnis</p>
            <div className="relative aspect-video rounded-xl bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-300">
              <ImageIcon className="size-8 text-slate-400" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100" onClick={() => toast.success("Cover baru berhasil diunggah.")}>
                  <UploadIcon className="mr-1 size-3.5" />
                  Ganti Cover
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">Rasio 16:9 direkomendasikan untuk hasil terbaik.</p>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle>Tautan Media Sosial (JSONB)</CardTitle>
          <CardDescription>
            Hubungkan akun media sosial bisnis Anda agar calon pelanggan mudah menghubungi Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="social-ig">Instagram URL</FieldLabel>
              <Input
                id="social-ig"
                value={social.instagram}
                onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
                placeholder="https://instagram.com/nama_bisnis"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="social-fb">Facebook URL</FieldLabel>
              <Input
                id="social-fb"
                value={social.facebook}
                onChange={(e) => setSocial({ ...social, facebook: e.target.value })}
                placeholder="https://facebook.com/nama_bisnis"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="social-tt">TikTok URL</FieldLabel>
              <Input
                id="social-tt"
                value={social.tiktok}
                onChange={(e) => setSocial({ ...social, tiktok: e.target.value })}
                placeholder="https://tiktok.com/@nama_bisnis"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="social-li">LinkedIn URL</FieldLabel>
              <Input
                id="social-li"
                value={social.linkedin}
                onChange={(e) => setSocial({ ...social, linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/nama_bisnis"
              />
            </Field>
          </FieldGroup>

          <div className="pt-2 flex justify-end">
            <Button onClick={handleSaveSocial} disabled={saving} className="bg-[#008767] hover:bg-[#007055]">
              <SaveIcon className="mr-1.5 size-4" />
              {saving ? "Menyimpan..." : "Simpan Media Sosial"}
            </Button>
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

function EditBasicInfoDialog({
  open,
  onOpenChange,
  business,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  business: Business
}) {
  const [form, setForm] = React.useState({
    name: business.name,
    description: business.description,
    email: business.email ?? "",
    phone: business.phone ?? "",
    website: business.website ?? "",
  })

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Informasi Utama</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="edit-name">Nama Bisnis</FieldLabel>
            <Input id="edit-name" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="edit-description">Deskripsi</FieldLabel>
            <Textarea
              id="edit-description"
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="edit-email">Email Kontak</FieldLabel>
            <Input id="edit-email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="edit-phone">No. Telepon / WA</FieldLabel>
            <Input id="edit-phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="edit-website">Website</FieldLabel>
            <Input id="edit-website" value={form.website} onChange={(e) => update("website", e.target.value)} />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            className="bg-[#008767] hover:bg-[#007055]"
            onClick={() => {
              toast.success("Informasi utama berhasil disimpan.")
              onOpenChange(false)
            }}
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditDetailDialog({
  open,
  onOpenChange,
  business,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  business: Business
}) {
  const [form, setForm] = React.useState({
    category: business.category,
    address: business.address,
  })

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Detail Bisnis</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field orientation="responsive">
            <FieldLabel htmlFor="edit-category">Kategori Utama</FieldLabel>
            <Input
              id="edit-category"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="edit-address">Alamat Bisnis</FieldLabel>
            <Textarea
              id="edit-address"
              rows={2}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            className="bg-[#008767] hover:bg-[#007055]"
            onClick={() => {
              toast.success("Detail bisnis berhasil disimpan.")
              onOpenChange(false)
            }}
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
