"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  BellIcon,
  BuildingIcon,
  CheckCircle2Icon,
  CrownIcon,
  DatabaseIcon,
  ExternalLinkIcon,
  GlobeIcon,
  ImageIcon,
  LockIcon,
  MailIcon,
  MapPinIcon,
  MonitorIcon,
  PhoneIcon,
  PlugIcon,
  TagIcon,
  TrendingUpIcon,
  UserPlusIcon,
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
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { cn } from "cn"
import { formatDate } from "@/lib/format"
import { getMembersByBusiness } from "@/lib/mock/businesses"
import type { Business, BusinessMember } from "@/lib/types"

const SECTIONS = [
  {
    value: "profil",
    label: "Profil Bisnis",
    description: "Informasi dasar bisnis Anda",
    icon: BuildingIcon,
  },
  {
    value: "akun",
    label: "Akun & Keamanan",
    description: "Kelola akses dan keamanan",
    icon: LockIcon,
  },
  {
    value: "notifikasi",
    label: "Notifikasi",
    description: "Atur preferensi notifikasi",
    icon: BellIcon,
  },
  {
    value: "integrasi",
    label: "Integrasi",
    description: "Hubungkan dengan layanan lain",
    icon: PlugIcon,
  },
  {
    value: "tag",
    label: "Tag & Kategori",
    description: "Kelola kategori dan label",
    icon: TagIcon,
  },
  {
    value: "tampilan",
    label: "Preferensi Tampilan",
    description: "Atur tampilan platform",
    icon: MonitorIcon,
  },
  {
    value: "tim",
    label: "Kelola Tim",
    description: "Undang dan atur anggota",
    icon: UsersIcon,
  },
  {
    value: "penyimpanan",
    label: "Penyimpanan Data",
    description: "Kelola data dan privasi",
    icon: DatabaseIcon,
  },
] as const

type SectionValue = (typeof SECTIONS)[number]["value"]

export default function DashboardSettingsPage() {
  const { selectedBusiness } = useBusinessContext()
  const [section, setSection] = React.useState<SectionValue>("profil")

  if (!selectedBusiness) return null

  return (
    <div className="flex flex-col gap-4">
      <DashboardBreadcrumb items={[{ label: "Settings" }]} />

      <PageHeader
        title="Pengaturan"
        description="Kelola informasi akun, preferensi bisnis, dan pengaturan platform Anda."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[15rem_1fr]">
        <nav className="flex flex-col gap-1">
          {SECTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setSection(item.value)}
              className={cn(
                "flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                section === item.value
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="mt-0.5 size-4 shrink-0" />
              <span>
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="block text-xs opacity-70">{item.description}</span>
              </span>
            </button>
          ))}
        </nav>

        <div>
          {section === "profil" && (
            <ProfilBisnisSection
              key={selectedBusiness.id}
              business={selectedBusiness}
              onManageTeam={() => setSection("tim")}
            />
          )}
          {section === "akun" && <AkunKeamananSection />}
          {section === "notifikasi" && <NotifikasiSection />}
          {section === "integrasi" && <PlaceholderPage title="Integrasi" />}
          {section === "tag" && <PlaceholderPage title="Tag & Kategori" />}
          {section === "tampilan" && <PreferensiTampilanSection />}
          {section === "tim" && <KelolaTimSection businessId={selectedBusiness.id} />}
          {section === "penyimpanan" && <PlaceholderPage title="Penyimpanan Data" />}
        </div>
      </div>
    </div>
  )
}

function ProfilBisnisSection({
  business,
  onManageTeam,
}: {
  business: Business
  onManageTeam: () => void
}) {
  const [form, setForm] = React.useState({
    name: business.name,
    description: business.description,
    email: business.email ?? "",
    phone: business.phone ?? "",
    website: business.website ?? "",
    address: `${business.address}, ${business.city}${business.postalCode ? ` ${business.postalCode}` : ""}`,
  })
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const initials = business.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_20rem]">
      <Card>
        <CardContent className="flex flex-col gap-5 pt-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Informasi Profil Bisnis</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Informasi ini akan ditampilkan kepada pelanggan di public profile Anda.
              </p>
            </div>
            <Button onClick={() => toast.success("Perubahan profil bisnis berhasil disimpan.")}>
              Simpan Perubahan
            </Button>
          </div>

          <Field>
            <FieldLabel htmlFor="profil-name">
              Nama Bisnis <span className="text-destructive">*</span>
            </FieldLabel>
            <Input id="profil-name" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </Field>

          <Field>
            <FieldLabel htmlFor="profil-description">Deskripsi Bisnis</FieldLabel>
            <Textarea
              id="profil-description"
              rows={4}
              maxLength={500}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
            <p className="text-right text-xs text-muted-foreground">
              {form.description.length}/500
            </p>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="profil-email">
                Email Bisnis <span className="text-destructive">*</span>
              </FieldLabel>
              <Input id="profil-email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="profil-phone">
                No. Telepon <span className="text-destructive">*</span>
              </FieldLabel>
              <Input id="profil-phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="profil-website">Website</FieldLabel>
            <Input id="profil-website" value={form.website} onChange={(e) => update("website", e.target.value)} />
          </Field>

          <Field>
            <FieldLabel htmlFor="profil-address">Alamat Kantor</FieldLabel>
            <Textarea
              id="profil-address"
              rows={2}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="profil-category">Kategori Utama</FieldLabel>
              <Select defaultValue={business.category}>
                <SelectTrigger id="profil-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={business.category}>{business.category}</SelectItem>
                  <SelectItem value="Kuliner">Kuliner</SelectItem>
                  <SelectItem value="Properti">Properti</SelectItem>
                  <SelectItem value="Kesehatan">Kesehatan</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="profil-founded">Tahun Berdiri</FieldLabel>
              <Select defaultValue={business.foundedYear ? String(business.foundedYear) : undefined}>
                <SelectTrigger id="profil-founded" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 15 }).map((_, i) => {
                    const year = 2026 - i
                    return (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div>
            <FieldLabel className="mb-2">Logo Bisnis</FieldLabel>
            <div className="flex items-center gap-3">
              <Avatar className="size-16">
                <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success("Logo berhasil diperbarui.")}
                >
                  <ImageIcon />
                  Ubah Logo
                </Button>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Format: PNG, JPG (Maks. 2MB)
                </p>
                <p className="text-xs text-muted-foreground">Disarankan ukuran 512 x 512px</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="flex flex-col gap-3 pt-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Preview Public Profile</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Berikut adalah tampilan profil bisnis Anda di platform.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                render={
                  <a href={`/business/${business.slug}`} target="_blank" rel="noreferrer" />
                }
              >
                Lihat Profil
                <ExternalLinkIcon />
              </Button>
            </div>

            <div className="relative">
              <div className="flex aspect-video items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <ImageIcon className="size-6" />
              </div>
              <Avatar className="absolute -bottom-5 left-3 size-12 ring-4 ring-card">
                <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="pt-4">
              <p className="text-sm font-semibold text-foreground">{business.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BuildingIcon className="size-3" />
                  {business.category}
                </span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="size-3" />
                  {business.city.split(",").pop()?.trim()}, Indonesia
                </span>
              </div>
              <p className="mt-2 line-clamp-4 text-xs text-muted-foreground">
                {business.description}
              </p>
              <div className="mt-3 flex flex-col gap-1 text-xs text-foreground/80">
                {business.phone && (
                  <span className="flex items-center gap-1.5">
                    <PhoneIcon className="size-3 text-muted-foreground" />
                    {business.phone}
                  </span>
                )}
                {business.email && (
                  <span className="flex items-center gap-1.5">
                    <MailIcon className="size-3 text-muted-foreground" />
                    {business.email}
                  </span>
                )}
                {business.website && (
                  <span className="flex items-center gap-1.5">
                    <GlobeIcon className="size-3 text-muted-foreground" />
                    {business.website}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 pt-1">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Status Akun</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Informasi status akun dan langganan Anda.
              </p>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-accent/40 p-3">
              <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-success" />
              <div>
                <p className="text-sm font-semibold text-success">Akun Aktif</p>
                <p className="text-xs text-foreground/80">
                  Semua fitur tersedia dan berjalan normal.
                </p>
              </div>
            </div>

            <div className="flex flex-col divide-y divide-border text-sm">
              <div className="flex items-center justify-between py-2">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CrownIcon className="size-3.5" />
                  Paket Saat Ini
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Business Pro</span>
                  <Button variant="link" size="sm" onClick={() => toast.info("Fitur upgrade paket segera hadir.")}>
                    Upgrade
                  </Button>
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Berlaku Sampai</span>
                <span className="text-right">
                  <span className="font-medium text-foreground">30 Desember 2026</span>{" "}
                  <span className="text-xs text-muted-foreground">(90 hari lagi)</span>
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <UsersIcon className="size-3.5" />
                  Jumlah Anggota
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {getMembersByBusiness(business.id).length} anggota
                  </span>
                  <Button variant="link" size="sm" onClick={onManageTeam}>
                    Kelola Tim
                  </Button>
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Review Bulan Ini</span>
                <span className="flex items-center gap-1">
                  <span className="font-medium text-foreground">248 review</span>
                  <span className="flex items-center gap-0.5 text-xs font-medium text-success">
                    <TrendingUpIcon className="size-3" />
                    12%
                  </span>
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-fit border-destructive/40 text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              Hapus Akun Bisnis
            </Button>
            <p className="text-xs text-muted-foreground">
              Tindakan ini tidak dapat dibatalkan. Semua data akan dihapus secara permanen.
            </p>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Hapus akun bisnis ${business.name}?`}
        description="Semua data bisnis, review, dan informasi terkait akan dihapus dan tidak dapat dikembalikan."
        confirmLabel="Hapus Akun Bisnis"
        variant="destructive"
        requireReason
        reasonLabel="Alasan menghapus akun"
        onConfirm={() => toast.success(`Akun bisnis ${business.name} telah dihapus.`)}
      />
    </div>
  )
}

function AkunKeamananSection() {
  const [twoFactor, setTwoFactor] = React.useState(false)
  const [loginAlert, setLoginAlert] = React.useState(true)

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
        <h2 className="text-base font-semibold text-foreground">Akun & Keamanan</h2>
        <label htmlFor="settings-2fa" className="flex cursor-pointer items-start justify-between gap-4">
          <span>
            <span className="block text-sm font-medium text-foreground">
              Two-factor authentication
            </span>
            <span className="block text-xs text-muted-foreground">
              Tambahkan lapisan keamanan ekstra saat login.
            </span>
          </span>
          <Checkbox id="settings-2fa" checked={twoFactor} onCheckedChange={(c) => setTwoFactor(!!c)} />
        </label>
        <label
          htmlFor="settings-login-alert"
          className="flex cursor-pointer items-start justify-between gap-4"
        >
          <span>
            <span className="block text-sm font-medium text-foreground">Login notification</span>
            <span className="block text-xs text-muted-foreground">
              Dapatkan notifikasi saat ada login baru ke akun bisnis.
            </span>
          </span>
          <Checkbox
            id="settings-login-alert"
            checked={loginAlert}
            onCheckedChange={(c) => setLoginAlert(!!c)}
          />
        </label>
        <div className="flex justify-end">
          <Button onClick={() => toast.success("Pengaturan keamanan berhasil disimpan.")}>
            Simpan Perubahan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const NOTIFICATION_ROWS = [
  { key: "review", label: "Review Baru", description: "Dapatkan notifikasi saat ada review baru masuk." },
  { key: "reply", label: "Balasan Review", description: "Dapatkan notifikasi saat anggota tim membalas review." },
  { key: "verification", label: "Verifikasi", description: "Dapatkan notifikasi terkait status verifikasi bisnis." },
  { key: "team", label: "Aktivitas Tim", description: "Dapatkan notifikasi saat ada aktivitas anggota tim." },
] as const

function NotifikasiSection() {
  const [notifications, setNotifications] = React.useState<Record<string, boolean>>({
    review: true,
    reply: true,
    verification: true,
    team: false,
  })

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
        <h2 className="text-base font-semibold text-foreground">Preferensi Notifikasi</h2>
        {NOTIFICATION_ROWS.map((row) => (
          <label
            key={row.key}
            htmlFor={`notif-${row.key}`}
            className="flex cursor-pointer items-start justify-between gap-4"
          >
            <span>
              <span className="block text-sm font-medium text-foreground">{row.label}</span>
              <span className="block text-xs text-muted-foreground">{row.description}</span>
            </span>
            <Checkbox
              id={`notif-${row.key}`}
              checked={notifications[row.key]}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, [row.key]: !!checked }))
              }
            />
          </label>
        ))}
        <div className="flex justify-end">
          <Button onClick={() => toast.success("Preferensi notifikasi berhasil disimpan.")}>
            Simpan Perubahan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PreferensiTampilanSection() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
        <h2 className="text-base font-semibold text-foreground">Preferensi Tampilan</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="tampilan-language">Bahasa Default</FieldLabel>
            <Select defaultValue="id">
              <SelectTrigger id="tampilan-language" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="tampilan-timezone">Zona Waktu</FieldLabel>
            <Select defaultValue="wib">
              <SelectTrigger id="tampilan-timezone" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wib">WIB (GMT+7)</SelectItem>
                <SelectItem value="wita">WITA (GMT+8)</SelectItem>
                <SelectItem value="wit">WIT (GMT+9)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="tampilan-density">Kepadatan Dashboard</FieldLabel>
            <Select defaultValue="comfortable">
              <SelectTrigger id="tampilan-density" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comfortable">Nyaman</SelectItem>
                <SelectItem value="compact">Ringkas</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => toast.success("Preferensi tampilan berhasil disimpan.")}>
            Simpan Perubahan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function KelolaTimSection({ businessId }: { businessId: string }) {
  const [removeTarget, setRemoveTarget] = React.useState<BusinessMember | null>(null)
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState("MEMBER")
  const members = getMembersByBusiness(businessId)

  const columns: ResourceTableColumn<BusinessMember>[] = [
    {
      key: "name",
      header: "Member",
      render: (m) => (
        <div>
          <p className="font-medium text-foreground">{m.name}</p>
          <p className="text-xs text-muted-foreground">{m.email}</p>
        </div>
      ),
    },
    { key: "role", header: "Role", render: (m) => <StatusBadge status={m.role} /> },
    { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status} /> },
    {
      key: "joinedAt",
      header: "Joined At",
      render: (m) => <span className="text-muted-foreground">{formatDate(m.joinedAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (m) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>Kelola</DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.success(`Role ${m.name} berhasil diubah.`)}>
                Change Role
              </DropdownMenuItem>
              {m.role !== "OWNER" && (
                <DropdownMenuItem variant="destructive" onClick={() => setRemoveTarget(m)}>
                  Remove Member
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total Members" value={members.length} icon={UsersIcon} />
        <StatCard
          label="Pending Invitation"
          value={members.filter((m) => m.status === "PENDING").length}
          deltaTone="neutral"
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlusIcon />
          Invite Member
        </Button>
      </div>
      <ResourceTable
        data={members}
        columns={columns}
        getRowId={(m) => m.id}
        emptyTitle="Belum ada anggota tim."
        emptyDescription="Undang anggota tim untuk membantu mengelola bisnis."
      />

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Undang Anggota Tim</DialogTitle>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="invite-email">Email</FieldLabel>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="invite-role">Role</FieldLabel>
            <Select value={role} onValueChange={(value) => setRole(value as string)}>
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Batal
            </Button>
            <Button
              disabled={email.trim().length === 0}
              onClick={() => {
                toast.success(`Undangan berhasil dikirim ke ${email}.`)
                setEmail("")
                setInviteOpen(false)
              }}
            >
              Kirim Undangan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title={`Hapus ${removeTarget?.name} dari tim?`}
        description="Anggota yang dihapus akan langsung kehilangan akses ke dashboard bisnis ini."
        confirmLabel="Hapus Anggota"
        variant="destructive"
        onConfirm={() => toast.success(`${removeTarget?.name} berhasil dihapus dari tim.`)}
      />
    </div>
  )
}
