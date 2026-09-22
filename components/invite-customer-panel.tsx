"use client"

import * as React from "react"
import { toast } from "sonner"
import { InfoIcon, SendIcon, XIcon } from "lucide-react"

import { CHANNEL_META } from "@/lib/invitation-channels"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { InvitationChannel } from "@/lib/types"
import { cn } from "cn"

const COUNTRY_CODES = ["+62", "+65", "+60", "+1"]

export function InviteCustomerPanel({
  businessName,
  onClose,
}: {
  businessName: string
  onClose: () => void
}) {
  const [name, setName] = React.useState("")
  const [countryCode, setCountryCode] = React.useState("+62")
  const [contact, setContact] = React.useState("")
  const [reference, setReference] = React.useState("")
  const [channel, setChannel] = React.useState<InvitationChannel>("WHATSAPP")

  return (
    <Card className="sticky top-4 w-full lg:w-96 lg:shrink-0">
      <CardContent className="flex flex-col gap-4 pt-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-foreground">Undang Customer</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Kirim undangan review kepada pelanggan Anda.
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <XIcon />
          </Button>
        </div>

        <Field>
          <FieldLabel htmlFor="invite-name">
            Nama Customer <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="invite-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama customer"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="invite-contact">
            Email atau No. WhatsApp <span className="text-destructive">*</span>
          </FieldLabel>
          <div className="flex gap-2">
            <Select value={countryCode} onValueChange={(value) => setCountryCode(value as string)}>
              <SelectTrigger className="w-20 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_CODES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="invite-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Contoh: 812 3456 7890"
              className="flex-1"
            />
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="invite-reference">Reference ID (Opsional)</FieldLabel>
          <Input
            id="invite-reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Contoh: INV-2026-001"
          />
          <p className="text-xs text-muted-foreground">
            ID transaksi, nomor booking, atau referensi lain.
          </p>
        </Field>

        <div className="flex flex-col gap-2">
          <Label>
            Channel <span className="text-destructive">*</span>
          </Label>
          <RadioGroup value={channel} onValueChange={(value) => setChannel(value as InvitationChannel)}>
            {(Object.keys(CHANNEL_META) as InvitationChannel[]).map((key) => {
              const meta = CHANNEL_META[key]
              return (
                <label
                  key={key}
                  htmlFor={`channel-${key}`}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                    channel === key ? "border-primary bg-accent/40" : "border-border hover:bg-muted"
                  )}
                >
                  <RadioGroupItem id={`channel-${key}`} value={key} className="mt-0.5" />
                  <meta.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>
                    <span className="block text-sm font-medium text-foreground">{meta.label}</span>
                    <span className="block text-xs text-muted-foreground">{meta.description}</span>
                  </span>
                </label>
              )
            })}
          </RadioGroup>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-info/10 p-3 text-xs text-foreground/90">
          <InfoIcon className="mt-0.5 size-3.5 shrink-0 text-info" />
          <span>
            Customer akan menerima pesan undangan dengan link review untuk{" "}
            <span className="font-semibold">{businessName}</span>.
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            disabled={name.trim().length === 0 || contact.trim().length === 0}
            onClick={() => {
              toast.success(`Undangan berhasil dikirim ke ${name}.`)
              setName("")
              setContact("")
              setReference("")
              onClose()
            }}
          >
            <SendIcon />
            Kirim Undangan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
