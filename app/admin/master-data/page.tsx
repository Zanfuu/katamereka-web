"use client"

import * as React from "react"
import { toast } from "sonner"
import { MapPinIcon, PlusIcon, TagsIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageHeader } from "@/components/page-header"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { categories as initialCategories } from "@/lib/mock/categories"
import { platformLocations } from "@/lib/mock/platform-locations"
import type { Category, PlatformLocation } from "@/lib/types"

function CategoriesTab() {
  const [categories, setCategories] = React.useState<Category[]>(initialCategories)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Category | null>(null)
  const [toggleTarget, setToggleTarget] = React.useState<Category | null>(null)
  const nameRef = React.useRef<HTMLInputElement>(null)

  const columns: ResourceTableColumn<Category>[] = [
    { key: "name", header: "Category", render: (c) => <span className="font-medium text-foreground">{c.name}</span> },
    { key: "businessCount", header: "Businesses", sortValue: (c) => c.businessCount, render: (c) => c.businessCount },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (category) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditing(category)
              setDialogOpen(true)
            }}
          >
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setToggleTarget(category)}>
            {category.status === "ACTIVE" ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          <PlusIcon />
          Add Category
        </Button>
      </div>

      <ResourceTable
        data={categories}
        columns={columns}
        getRowId={(c) => c.id}
        emptyTitle="Belum ada kategori."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="category-name">Category Name</FieldLabel>
            <Input id="category-name" ref={nameRef} defaultValue={editing?.name ?? ""} />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                const name = nameRef.current?.value.trim()
                if (!name) {
                  toast.error("Nama kategori wajib diisi.")
                  return
                }
                if (editing) {
                  setCategories((prev) =>
                    prev.map((c) => (c.id === editing.id ? { ...c, name } : c))
                  )
                  toast.success("Kategori berhasil diperbarui.")
                } else {
                  setCategories((prev) => [
                    ...prev,
                    { id: `cat-${prev.length + 1}`, name, businessCount: 0, status: "ACTIVE" },
                  ])
                  toast.success("Kategori berhasil ditambahkan.")
                }
                setDialogOpen(false)
              }}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toggleTarget}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        title={
          toggleTarget?.status === "ACTIVE"
            ? `Nonaktifkan kategori ${toggleTarget?.name}?`
            : `Aktifkan kembali kategori ${toggleTarget?.name}?`
        }
        description={
          toggleTarget && toggleTarget.businessCount > 0
            ? "Kategori yang masih digunakan bisnis tidak dihapus permanen, hanya dinonaktifkan dari daftar baru."
            : undefined
        }
        confirmLabel={toggleTarget?.status === "ACTIVE" ? "Deactivate" : "Activate"}
        variant={toggleTarget?.status === "ACTIVE" ? "destructive" : "default"}
        onConfirm={() => {
          setCategories((prev) =>
            prev.map((c) =>
              c.id === toggleTarget?.id
                ? { ...c, status: c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
                : c
            )
          )
          toast.success(`Status kategori ${toggleTarget?.name} berhasil diperbarui.`)
        }}
      />
    </div>
  )
}

function LocationsTab() {
  const columns: ResourceTableColumn<PlatformLocation>[] = [
    { key: "province", header: "Province", sortValue: (l) => l.province, render: (l) => l.province },
    { key: "city", header: "City", sortValue: (l) => l.city, render: (l) => l.city },
    { key: "status", header: "Status", render: (l) => <StatusBadge status={l.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: () => (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => toast.info("Edit lokasi referensi.")}>
            Edit
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => toast.info("Tambah lokasi referensi baru.")}>
          <PlusIcon />
          Add Location
        </Button>
      </div>
      <ResourceTable
        data={platformLocations}
        columns={columns}
        getRowId={(l) => l.id}
        emptyTitle="Belum ada data lokasi referensi."
      />
    </div>
  )
}

export default function MasterDataPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Master Data"
        description="Kelola data referensi platform: kategori bisnis dan wilayah."
      />

      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">
            <TagsIcon className="size-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="locations">
            <MapPinIcon className="size-4" />
            Locations
          </TabsTrigger>
        </TabsList>
        <TabsContent value="categories" className="mt-4">
          <CategoriesTab />
        </TabsContent>
        <TabsContent value="locations" className="mt-4">
          <LocationsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
