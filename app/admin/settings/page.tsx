"use client"

import * as React from "react"
import { toast } from "sonner"

import { useBusinessContext } from "@/components/business-provider"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const NOTIFICATION_ROWS = [
  { key: "review", label: "Review notification", description: "Dapatkan notifikasi saat ada review baru masuk." },
  { key: "reply", label: "Reply notification", description: "Dapatkan notifikasi saat anggota tim membalas review." },
  { key: "verification", label: "Verification notification", description: "Dapatkan notifikasi terkait status verifikasi bisnis." },
  { key: "team", label: "Team activity notification", description: "Dapatkan notifikasi saat ada aktivitas anggota tim." },
] as const

export default function AdminSettingsPage() {
  const { selectedBusiness } = useBusinessContext()
  const [notifications, setNotifications] = React.useState<Record<string, boolean>>({
    review: true,
    reply: true,
    verification: true,
    team: false,
  })
  const [twoFactor, setTwoFactor] = React.useState(false)
  const [loginAlert, setLoginAlert] = React.useState(true)
  const [deactivateOpen, setDeactivateOpen] = React.useState(false)

  if (!selectedBusiness) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Pengaturan" description="Kelola preferensi dan keamanan bisnis kamu." />

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field orientation="responsive">
            <FieldLabel htmlFor="settings-language">Bahasa Default</FieldLabel>
            <Select defaultValue="id">
              <SelectTrigger id="settings-language" className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="settings-timezone">Zona Waktu</FieldLabel>
            <Select defaultValue="wib">
              <SelectTrigger id="settings-timezone" className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wib">WIB (GMT+7)</SelectItem>
                <SelectItem value="wita">WITA (GMT+8)</SelectItem>
                <SelectItem value="wit">WIT (GMT+9)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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
          <label htmlFor="settings-login-alert" className="flex cursor-pointer items-start justify-between gap-4">
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
            <Button onClick={() => toast.success("Pengaturan berhasil disimpan.")}>
              Simpan Perubahan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Nonaktifkan Bisnis</p>
            <p className="text-xs text-muted-foreground">
              Profil bisnis {selectedBusiness.name} tidak akan tampil di pencarian publik.
            </p>
          </div>
          <Button variant="destructive" onClick={() => setDeactivateOpen(true)}>
            Nonaktifkan Bisnis
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        title={`Nonaktifkan ${selectedBusiness.name}?`}
        description="Tindakan ini akan menyembunyikan profil bisnis dari pencarian publik hingga kamu mengaktifkannya kembali."
        confirmLabel="Nonaktifkan"
        variant="destructive"
        requireReason
        reasonLabel="Alasan menonaktifkan bisnis"
        onConfirm={() => toast.success(`${selectedBusiness.name} berhasil dinonaktifkan.`)}
      />
    </div>
  )
}
