"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { FileWarningIcon, HomeIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageHeader } from "@/components/page-header"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { StatusBadge } from "@/components/status-badge"
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatDate } from "@/lib/format"
import { evidenceSubmissions } from "@/lib/mock/evidence"
import type { Evidence } from "@/lib/types"

export default function AdminEvidencePage() {
  const [detail, setDetail] = React.useState<Evidence | null>(null)
  const [action, setAction] = React.useState<"VERIFIED" | "REJECTED" | null>(null)

  const columns: ResourceTableColumn<Evidence>[] = [
    {
      key: "review",
      header: "Review",
      render: (item) => (
        <p className="line-clamp-1 max-w-xs text-muted-foreground">{item.reviewExcerpt}</p>
      ),
    },
    { key: "userName", header: "User", render: (item) => item.userName },
    { key: "businessName", header: "Business", render: (item) => item.businessName },
    {
      key: "type",
      header: "Evidence Type",
      render: (item) => <StatusBadge status="gray" label={item.type.replace("_", " ")} />,
    },
    {
      key: "submittedAt",
      header: "Submitted At",
      sortValue: (item) => item.submittedAt,
      render: (item) => <span className="text-muted-foreground">{formatDate(item.submittedAt)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (item) => (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setDetail(item)}>
            View
          </Button>
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
            <BreadcrumbPage>Evidence</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Evidence Review"
        description="Evidence bersifat privat, hanya dapat dilihat Super Admin untuk investigasi sengketa review."
      />

      <ResourceTable
        data={evidenceSubmissions}
        columns={columns}
        getRowId={(item) => item.id}
        emptyTitle="Belum ada evidence yang diajukan."
      />

      <Sheet open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Evidence — {detail?.userName}</SheetTitle>
            <SheetDescription>{detail?.businessName}</SheetDescription>
          </SheetHeader>
          {detail && (
            <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Related Review
                </h3>
                <p className="rounded-lg border border-border p-3 text-sm text-foreground/90">
                  {detail.reviewExcerpt}
                </p>
              </section>
              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Evidence File
                </h3>
                <div className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-sm">
                  <FileWarningIcon className="size-4 text-muted-foreground" />
                  {detail.type.replace("_", " ")}.file
                </div>
              </section>
              {detail.status === "PENDING" && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => toast.success("Permintaan evidence tambahan dikirim.")}>
                    Request More Evidence
                  </Button>
                  <Button variant="destructive" onClick={() => setAction("REJECTED")}>
                    Reject
                  </Button>
                  <Button onClick={() => setAction("VERIFIED")}>Verify</Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!action}
        onOpenChange={(open) => !open && setAction(null)}
        title={action === "VERIFIED" ? "Verifikasi evidence ini?" : "Tolak evidence ini?"}
        confirmLabel={action === "VERIFIED" ? "Verify" : "Reject"}
        variant={action === "VERIFIED" ? "default" : "destructive"}
        requireReason={action === "REJECTED"}
        reasonLabel="Alasan penolakan"
        onConfirm={() => {
          toast.success("Status evidence berhasil diperbarui.")
          setDetail(null)
        }}
      />
    </div>
  )
}
