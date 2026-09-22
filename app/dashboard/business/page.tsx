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
} from "lucide-react"

import { useBusinessContext } from "@/components/business-provider"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"
import { PageHeader } from "@/components/page-header"
import { PlaceholderPage } from "@/components/placeholder-page"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  { value: "media", label: "Media" },
  { value: "integrasi", label: "Integrasi" },
  { value: "pengaturan", label: "Pengaturan" },
] as const

export default function DashboardBusinessPage() {
  const { selectedBusiness } = useBusinessContext()
  if (!selectedBusiness) return null

  return (
    <div className="flex flex-col gap-4">
      <DashboardBreadcrumb items={[{ label: "Business" }]} />

      <PageHeader
        title="Business"
        description="Kelola informasi bisnis Anda dan atur preferensi yang ditampilkan kepada pelanggan."
        action={
          <Button
            variant="outline"
            render={
              <a href={`/business/${selectedBusiness.slug}`} target="_blank" rel="noreferrer" />
            }
          >
            Lihat Public Profile
            <ExternalLinkIcon />
          </Button>
        }
      />

      <Tabs defaultValue="informasi">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
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
          <LocationsTab businessId={selectedBusiness.id} />
        </TabsContent>
        <TabsContent value="kategori" className="pt-4">
          <PlaceholderPage title="Kategori & Layanan" />
        </TabsContent>
        <TabsContent value="jam" className="pt-4">
          <PlaceholderPage title="Jam Operasional" />
        </TabsContent>
        <TabsContent value="media" className="pt-4">
          <PlaceholderPage title="Media" />
        </TabsContent>
        <TabsContent value="integrasi" className="pt-4">
          <PlaceholderPage title="Integrasi" />
        </TabsContent>
        <TabsContent value="pengaturan" className="pt-4">
          <PlaceholderPage title="Pengaturan" />
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

function InformasiTab({ business }: { business: Business }) {
  const [editBasicOpen, setEditBasicOpen] = React.useState(false)
  const [editDetailOpen, setEditDetailOpen] = React.useState(false)
  const [verificationOpen, setVerificationOpen] = React.useState(false)
  const [deactivateOpen, setDeactivateOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

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
          <CardHeader className="flex items-start justify-between gap-2">
            <div>
              <CardTitle>Informasi Dasar</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Informasi utama yang ditampilkan kepada pelanggan.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditBasicOpen(true)}>
              <PencilIcon />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar className="size-20 shrink-0">
              <AvatarFallback className="bg-primary text-xl font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 divide-y divide-border">
              <InfoRow icon={BuildingIcon} label="Nama Bisnis" value={business.name} />
              <InfoRow icon={FileTextIcon} label="Deskripsi" value={business.description} />
              {business.email && (
                <InfoRow icon={MailIcon} label="Email" value={business.email} />
              )}
              {business.phone && (
                <InfoRow icon={PhoneIcon} label="No. Telepon" value={business.phone} />
              )}
              {business.website && (
                <InfoRow
                  icon={GlobeIcon}
                  label="Website"
                  value={
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-info hover:underline"
                    >
                      {business.website}
                      <ExternalLinkIcon className="size-3.5" />
                    </a>
                  }
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-start justify-between gap-2">
            <div>
              <CardTitle>Detail Bisnis</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Informasi tambahan tentang bisnis Anda.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditDetailOpen(true)}>
              <PencilIcon />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <InfoRow
              icon={BriefcaseIcon}
              label="Kategori Utama"
              value={<Badge>{business.category}</Badge>}
            />
            {business.additionalCategories && (
              <InfoRow
                icon={TagsIcon}
                label="Kategori Tambahan"
                value={
                  <div className="flex flex-wrap gap-1.5">
                    {business.additionalCategories.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                }
              />
            )}
            {business.foundedYear && (
              <InfoRow icon={CalendarIcon} label="Tahun Berdiri" value={business.foundedYear} />
            )}
            {business.employeeRange && (
              <InfoRow icon={UsersIcon} label="Jumlah Karyawan" value={business.employeeRange} />
            )}
            {business.taxId && (
              <InfoRow icon={ReceiptIcon} label="NPWP" value={business.taxId} />
            )}
            <InfoRow
              icon={MapPinIcon}
              label="Alamat Kantor"
              value={
                <>
                  {business.address}
                  <br />
                  {business.city}
                  {business.postalCode ? ` ${business.postalCode}` : ""}
                </>
              }
            />
            {business.about && (
              <InfoRow icon={FileTextIcon} label="Tentang Kami" value={business.about} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Logo &amp; Cover</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Logo dan gambar cover akan ditampilkan di public profile.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="relative">
              <div className="flex aspect-video items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <ImageIcon className="size-8" />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-background"
                onClick={() => toast.success("Cover berhasil diperbarui.")}
              >
                <ImageIcon />
                Ubah Cover
              </Button>
              <Avatar className="absolute -bottom-6 left-4 size-16 ring-4 ring-card">
                <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex justify-end gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Logo berhasil diperbarui.")}
              >
                <ImageIcon />
                Ubah Logo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => toast.success("Logo berhasil dihapus.")}
              >
                <Trash2Icon />
                Hapus Logo
              </Button>
            </div>
            <p className="text-right text-xs text-muted-foreground">
              Format: PNG, JPG. Maks. 2MB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Bisnis</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Atur status visibilitas bisnis Anda.
            </p>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "flex items-start justify-between gap-3 rounded-lg p-3",
                business.status === "ACTIVE" ? "bg-accent/40" : "bg-destructive/10"
              )}
            >
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-1 size-2 shrink-0 rounded-full",
                    business.status === "ACTIVE" ? "bg-success" : "bg-destructive"
                  )}
                />
                <div>
                  <StatusBadge status={business.status} />
                  <p className="mt-1 text-xs text-foreground/80">
                    {business.status === "ACTIVE"
                      ? "Bisnis Anda sedang aktif dan dapat ditemukan oleh pelanggan di platform."
                      : "Bisnis Anda sedang dinonaktifkan dan tidak tampil di pencarian publik."}
                  </p>
                </div>
              </div>
              {business.status === "ACTIVE" ? (
                <Button variant="outline" size="sm" onClick={() => setDeactivateOpen(true)}>
                  <PauseIcon />
                  Nonaktifkan
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success(`${business.name} berhasil diaktifkan kembali.`)}
                >
                  <PlayIcon />
                  Aktifkan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verifikasi Bisnis</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Tingkatkan kepercayaan pelanggan dengan verifikasi bisnis.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-3 rounded-lg bg-accent/40 p-3">
              <div className="flex items-start gap-2">
                <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-success" />
                <div>
                  <p className="text-sm font-semibold text-success">
                    {business.verificationStatus === "VERIFIED" ? "Terverifikasi" : "Belum Terverifikasi"}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/80">
                    {business.verificationStatus === "VERIFIED"
                      ? "Bisnis Anda telah diverifikasi oleh tim KataMereka."
                      : "Ajukan verifikasi untuk meningkatkan kepercayaan pelanggan."}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setVerificationOpen(true)}>
                Lihat Detail →
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col gap-3 pt-6">
            <div className="flex items-start gap-2">
              <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Hapus Bisnis</p>
            </div>
            <p className="text-xs text-foreground/80">
              Tindakan ini tidak dapat dibatalkan. Semua data bisnis, review, dan informasi
              terkait akan dihapus secara permanen.
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="w-fit"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2Icon />
              Hapus Bisnis
            </Button>
          </CardContent>
        </Card>
      </div>

      <EditBasicInfoDialog open={editBasicOpen} onOpenChange={setEditBasicOpen} business={business} />
      <EditDetailDialog open={editDetailOpen} onOpenChange={setEditDetailOpen} business={business} />
      <VerificationDetailSheet
        open={verificationOpen}
        onOpenChange={setVerificationOpen}
        business={business}
      />

      <ConfirmDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        title={`Nonaktifkan ${business.name}?`}
        description="Profil bisnis tidak akan tampil di pencarian publik hingga Anda mengaktifkannya kembali."
        confirmLabel="Nonaktifkan"
        variant="destructive"
        requireReason
        reasonLabel="Alasan menonaktifkan bisnis"
        onConfirm={() => toast.success(`${business.name} berhasil dinonaktifkan.`)}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Hapus ${business.name} secara permanen?`}
        description="Semua data bisnis, review, dan informasi terkait akan dihapus dan tidak dapat dikembalikan."
        confirmLabel="Hapus Bisnis"
        variant="destructive"
        requireReason
        reasonLabel="Alasan menghapus bisnis"
        onConfirm={() => toast.success(`${business.name} telah dihapus.`)}
      />
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
          <DialogTitle>Edit Informasi Dasar</DialogTitle>
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
            <FieldLabel htmlFor="edit-email">Email</FieldLabel>
            <Input id="edit-email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="edit-phone">No. Telepon</FieldLabel>
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
            onClick={() => {
              toast.success("Informasi dasar berhasil disimpan.")
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
    additionalCategories: (business.additionalCategories ?? []).join(", "),
    foundedYear: business.foundedYear ? String(business.foundedYear) : "",
    employeeRange: business.employeeRange ?? "",
    taxId: business.taxId ?? "",
    address: business.address,
    about: business.about ?? "",
  })

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
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
            <FieldLabel htmlFor="edit-categories">Kategori Tambahan</FieldLabel>
            <Input
              id="edit-categories"
              value={form.additionalCategories}
              onChange={(e) => update("additionalCategories", e.target.value)}
              placeholder="Pisahkan dengan koma"
            />
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="edit-founded">Tahun Berdiri</FieldLabel>
            <Input
              id="edit-founded"
              value={form.foundedYear}
              onChange={(e) => update("foundedYear", e.target.value)}
            />
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="edit-employees">Jumlah Karyawan</FieldLabel>
            <Input
              id="edit-employees"
              value={form.employeeRange}
              onChange={(e) => update("employeeRange", e.target.value)}
            />
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="edit-taxid">NPWP</FieldLabel>
            <Input id="edit-taxid" value={form.taxId} onChange={(e) => update("taxId", e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="edit-address">Alamat Kantor</FieldLabel>
            <Textarea
              id="edit-address"
              rows={2}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="edit-about">Tentang Kami</FieldLabel>
            <Textarea
              id="edit-about"
              rows={3}
              value={form.about}
              onChange={(e) => update("about", e.target.value)}
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
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

const REQUIRED_DOCUMENTS = [
  "Nomor Induk Berusaha (NIB) atau SIUP",
  "KTP pemilik / penanggung jawab bisnis",
  "Bukti kepemilikan atau sewa lokasi usaha",
]

function VerificationDetailSheet({
  open,
  onOpenChange,
  business,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  business: Business
}) {
  const request = getVerificationByBusiness(business.id)
  const status = request?.status ?? business.verificationStatus

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Verifikasi Bisnis</SheetTitle>
          <SheetDescription>Status dan riwayat verifikasi {business.name}.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <StatusBadge status={status} />
          </div>

          <section>
            <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
              Required Documents
            </h3>
            <div className="flex flex-col gap-2">
              {REQUIRED_DOCUMENTS.map((doc) => (
                <div key={doc} className="flex items-center gap-2 text-sm text-foreground/90">
                  <ShieldCheckIcon className="size-4 text-success" />
                  {doc}
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-medium text-muted-foreground uppercase">
                Uploaded Documents
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Dokumen berhasil diunggah.")}
              >
                <UploadIcon />
                Upload
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {(!request || request.documents.length === 0) && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Belum ada dokumen yang diunggah.
                </p>
              )}
              {request?.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <FileIcon className="size-4 text-muted-foreground" />
                    {doc.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(doc.uploadedAt)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
              Verification History
            </h3>
            <div className="flex flex-col gap-2">
              {(!request || request.history.length === 0) && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Belum ada riwayat pengajuan verifikasi.
                </p>
              )}
              {request?.history.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={entry.status} />
                    <span className="text-foreground/90">{entry.note}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(entry.at)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function LocationsTab({ businessId }: { businessId: string }) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const locations = getLocationsByBusiness(businessId)

  const columns: ResourceTableColumn<Location>[] = [
    {
      key: "name",
      header: "Location",
      render: (l) => <span className="font-medium text-foreground">{l.name}</span>,
    },
    { key: "city", header: "City", render: (l) => l.city },
    {
      key: "address",
      header: "Address",
      render: (l) => <span className="text-muted-foreground">{l.address}</span>,
    },
    { key: "averageRating", header: "Rating", render: (l) => `${l.averageRating.toFixed(1)} ★` },
    { key: "reviewCount", header: "Reviews", render: (l) => l.reviewCount.toLocaleString("id-ID") },
    { key: "status", header: "Status", render: (l) => <StatusBadge status={l.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (l) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Lokasi berhasil diperbarui.")}>
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success(
                l.status === "ACTIVE"
                  ? `${l.name} berhasil dinonaktifkan.`
                  : `${l.name} berhasil diaktifkan.`
              )
            }
          >
            {l.status === "ACTIVE" ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total Locations" value={locations.length} icon={MapPinIcon} />
        <StatCard
          label="Active Locations"
          value={locations.filter((l) => l.status === "ACTIVE").length}
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <MapPinIcon />
          Add Location
        </Button>
      </div>
      <ResourceTable
        data={locations}
        columns={columns}
        getRowId={(l) => l.id}
        emptyTitle="Belum ada cabang terdaftar."
        emptyDescription="Tambahkan lokasi/cabang untuk memperluas jangkauan bisnis Anda."
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Lokasi</DialogTitle>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="loc-name">Nama Lokasi</FieldLabel>
            <Input id="loc-name" placeholder="TransGO Rental Surabaya" />
          </Field>
          <Field>
            <FieldLabel htmlFor="loc-address">Alamat</FieldLabel>
            <Input id="loc-address" placeholder="Jl. Contoh No. 1" />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                toast.success("Lokasi baru berhasil ditambahkan.")
                setDialogOpen(false)
              }}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
