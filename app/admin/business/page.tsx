"use client"

import * as React from "react"
import { toast } from "sonner"
import { EyeIcon } from "lucide-react"

import { useBusinessContext } from "@/components/business-provider"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import type { Business } from "@/lib/types"

export default function AdminBusinessProfilePage() {
  const { selectedBusiness } = useBusinessContext()

  if (!selectedBusiness) return null

  return <BusinessProfileForm key={selectedBusiness.id} business={selectedBusiness} />
}

function BusinessProfileForm({ business }: { business: Business }) {
  const [form, setForm] = React.useState({
    name: business.name,
    slug: business.slug,
    description: business.description,
    category: business.category,
    website: business.website ?? "",
    phone: business.phone ?? "",
    email: business.email ?? "",
    address: business.address,
    city: business.city,
  })

  const fields = Object.values(form)
  const filled = fields.filter((value) => value.trim().length > 0).length
  const completeness = Math.round((filled / fields.length) * 100)

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profil Bisnis"
        description="Kelola informasi publik yang tampil di halaman bisnis kamu."
        action={
          <Button
            variant="outline"
            onClick={() => toast.info("Membuka preview halaman publik...")}
          >
            <EyeIcon />
            Preview Public Profile
          </Button>
        }
      />

      <Card>
        <CardContent className="flex items-center gap-4 pt-1">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                Business Profile {completeness}% Complete
              </span>
            </div>
            <Progress value={completeness} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Umum</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field orientation="responsive">
              <FieldLabel htmlFor="business-name">Business Name</FieldLabel>
              <Input
                id="business-name"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
              />
            </Field>
            <Field orientation="responsive">
              <FieldLabel htmlFor="business-slug">Slug</FieldLabel>
              <Input
                id="business-slug"
                value={form.slug}
                onChange={(event) => update("slug", event.target.value)}
              />
            </Field>
            <Field orientation="responsive">
              <FieldLabel htmlFor="business-category">Category</FieldLabel>
              <Input
                id="business-category"
                value={form.category}
                onChange={(event) => update("category", event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="business-description">Description</FieldLabel>
              <Textarea
                id="business-description"
                rows={4}
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kontak & Lokasi</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field orientation="responsive">
              <FieldLabel htmlFor="business-website">Website</FieldLabel>
              <Input
                id="business-website"
                value={form.website}
                onChange={(event) => update("website", event.target.value)}
              />
            </Field>
            <Field orientation="responsive">
              <FieldLabel htmlFor="business-phone">Phone</FieldLabel>
              <Input
                id="business-phone"
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
              />
            </Field>
            <Field orientation="responsive">
              <FieldLabel htmlFor="business-email">Email</FieldLabel>
              <Input
                id="business-email"
                type="email"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
              />
            </Field>
            <Field orientation="responsive">
              <FieldLabel htmlFor="business-address">Address</FieldLabel>
              <Input
                id="business-address"
                value={form.address}
                onChange={(event) => update("address", event.target.value)}
              />
            </Field>
            <Field orientation="responsive">
              <FieldLabel htmlFor="business-city">City</FieldLabel>
              <Input
                id="business-city"
                value={form.city}
                onChange={(event) => update("city", event.target.value)}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Batal</Button>
        <Button onClick={() => toast.success("Profil bisnis berhasil disimpan.")}>
          Simpan Perubahan
        </Button>
      </div>
    </div>
  )
}
