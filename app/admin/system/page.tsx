"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  BellIcon,
  KeyRoundIcon,
  MailIcon,
  MessageCircleIcon,
  PlugIcon,
  SettingsIcon,
  ShieldCheckIcon,
  WebhookIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const PLATFORM_ROLES = [
  { role: "USER", description: "Reviewer / pengguna platform standar." },
  { role: "SUPER_ADMIN", description: "Akses penuh ke seluruh operasi platform KataMereka." },
]

const BUSINESS_ROLES = [
  { role: "OWNER", description: "Pemilik business, akses penuh ke satu business." },
  { role: "ADMIN", description: "Mengelola review, invitations, dan tim business." },
  { role: "MEMBER", description: "Akses terbatas untuk operasional harian." },
]

function GeneralTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Configuration</CardTitle>
        <CardDescription>Pengaturan umum platform KataMereka.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="platform-name">Platform Name</FieldLabel>
          <Input id="platform-name" defaultValue="KataMereka" />
        </Field>
        <Field>
          <FieldLabel htmlFor="support-email">Support Email</FieldLabel>
          <Input id="support-email" defaultValue="support@katamereka.com" />
        </Field>
        <Field>
          <FieldLabel htmlFor="default-locale">Default Locale</FieldLabel>
          <Input id="default-locale" defaultValue="id-ID" />
        </Field>
        <div className="flex justify-end">
          <Button onClick={() => toast.success("Konfigurasi platform berhasil disimpan.")}>
            Simpan Perubahan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function RolesTab() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Platform Roles</CardTitle>
          <CardDescription>Berlaku lintas seluruh platform KataMereka.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {PLATFORM_ROLES.map((item) => (
            <div key={item.role} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
              <div>
                <StatusBadge status={item.role} />
                <p className="mt-1.5 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Role internal tambahan (mis. Moderator, Support) dapat ditambahkan tanpa merombak
            struktur permission yang ada.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Roles</CardTitle>
          <CardDescription>Berlaku dalam lingkup satu business.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {BUSINESS_ROLES.map((item) => (
            <div key={item.role} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
              <div>
                <StatusBadge status={item.role} />
                <p className="mt-1.5 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

const NOTIFICATION_GROUPS = [
  { icon: MailIcon, label: "Email Templates", description: "Template email transaksional dan marketing." },
  { icon: BellIcon, label: "System Notifications", description: "Notifikasi internal untuk tim Super Admin." },
  { icon: MessageCircleIcon, label: "Business Notifications", description: "Notifikasi untuk Business Admin." },
  { icon: ShieldCheckIcon, label: "Verification Notifications", description: "Update status pengajuan verifikasi." },
  { icon: BellIcon, label: "Moderation Notifications", description: "Update tindakan moderasi review." },
]

function NotificationsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Channels</CardTitle>
        <CardDescription>Kelola template dan pengiriman notifikasi platform.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {NOTIFICATION_GROUPS.map((group) => (
          <div
            key={group.label}
            className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <group.icon className="size-4.5" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{group.label}</p>
                <p className="text-xs text-muted-foreground">{group.description}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.info(`Membuka ${group.label}.`)}>
              Kelola
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

const INTEGRATIONS = [
  { icon: KeyRoundIcon, label: "API Keys", available: true },
  { icon: WebhookIcon, label: "Webhooks", available: true },
  { icon: MessageCircleIcon, label: "WhatsApp", available: false },
  { icon: MailIcon, label: "Email", available: true },
  { icon: PlugIcon, label: "Website Widget", available: false },
  { icon: PlugIcon, label: "External Integrations", available: false },
]

function IntegrationsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API & Integrations</CardTitle>
        <CardDescription>Hubungkan KataMereka dengan sistem eksternal.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {INTEGRATIONS.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <item.icon className="size-4.5" />
              </span>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
            </div>
            {item.available ? (
              <Button variant="outline" size="sm" onClick={() => toast.info(`Membuka ${item.label}.`)}>
                Kelola
              </Button>
            ) : (
              <StatusBadge status="gray" label="Coming Soon" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function SecurityTab() {
  const [resetOpen, setResetOpen] = React.useState(false)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Konfigurasi keamanan internal platform.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Checkbox id="require-2fa" defaultChecked />
            <Label htmlFor="require-2fa" className="text-sm font-normal">
              Wajibkan two-factor authentication untuk seluruh Super Admin
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="session-timeout" defaultChecked />
            <Label htmlFor="session-timeout" className="text-sm font-normal">
              Auto logout sesi Super Admin setelah 30 menit tidak aktif
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="ip-restriction" />
            <Label htmlFor="ip-restriction" className="text-sm font-normal">
              Batasi akses dashboard Super Admin dari IP tertentu
            </Label>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => toast.success("Pengaturan keamanan berhasil disimpan.")}>
              Simpan Perubahan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Tindakan berikut bersifat destruktif dan wajib konfirmasi.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Reset seluruh API keys</p>
              <p className="text-xs text-muted-foreground">
                Semua integrasi yang menggunakan API key lama akan berhenti berfungsi.
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setResetOpen(true)}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset seluruh API keys?"
        description="Tindakan ini tidak dapat dibatalkan. Seluruh integrasi eksternal perlu dikonfigurasi ulang."
        confirmLabel="Reset API Keys"
        variant="destructive"
        requireReason
        reasonLabel="Alasan reset"
        onConfirm={() => toast.success("Seluruh API key berhasil direset.")}
      />
    </div>
  )
}

export default function SystemPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="System"
        description="Konfigurasi internal platform: role, notifikasi, integrasi, dan keamanan."
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            <SettingsIcon className="size-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-4">
          <GeneralTab />
        </TabsContent>
        <TabsContent value="roles" className="mt-4">
          <RolesTab />
        </TabsContent>
        <TabsContent value="notifications" className="mt-4">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="integrations" className="mt-4">
          <IntegrationsTab />
        </TabsContent>
        <TabsContent value="security" className="mt-4">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
