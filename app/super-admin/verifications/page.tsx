"use client"

import * as React from "react"
import { toast } from "sonner"
import { FileIcon, ShieldCheckIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageHeader } from "@/components/page-header"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/format"
import { verificationRequests } from "@/lib/mock/verifications"
import type { VerificationRequest } from "@/lib/types"

const TABS = [
  { value: "PENDING", label: "Pending" },
  { value: "VERIFIED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
] as const

export default function SuperAdminVerificationsPage() {
  const [tab, setTab] = React.useState<string>("PENDING")
  const [detail, setDetail] = React.useState<VerificationRequest | null>(null)
  const [dialog, setDialog] = React.useState<"APPROVE" | "REJECT" | null>(null)

  const filtered = verificationRequests.filter((request) => request.status === tab)

  const columns: ResourceTableColumn<VerificationRequest>[] = [
    {
      key: "businessName",
      header: "Business",
      sortValue: (r) => r.businessName,
      render: (request) => (
        <span className="font-medium text-foreground">{request.businessName}</span>
      ),
    },
    { key: "submittedBy", header: "Submitted By", render: (r) => r.submittedBy },
    {
      key: "documents",
      header: "Documents",
      render: (request) => `${request.documents.length} dokumen`,
    },
    {
      key: "submittedAt",
      header: "Submitted At",
      sortValue: (r) => r.submittedAt,
      render: (request) => (
        <span className="text-muted-foreground">{formatDate(request.submittedAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (request) => <StatusBadge status={request.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (request) => (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setDetail(request)}>
            View
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Verification Management"
        description="Proses pengajuan verifikasi bisnis di KataMereka."
      />

      <Tabs value={tab} onValueChange={(v) => typeof v === "string" && setTab(v)}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ResourceTable
        data={filtered}
        columns={columns}
        getRowId={(request) => request.id}
        emptyTitle="Tidak ada pengajuan pada kategori ini."
      />

      <Sheet open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{detail?.businessName}</SheetTitle>
            <SheetDescription>Diajukan oleh {detail?.submittedBy}</SheetDescription>
          </SheetHeader>
          {detail && (
            <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Business Information
                </h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={detail.status} />
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Submitted Documents
                </h3>
                <div className="flex flex-col gap-2">
                  {detail.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <FileIcon className="size-4 text-muted-foreground" />
                        {doc.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{doc.type}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Verification History
                </h3>
                <div className="flex flex-col gap-2">
                  {detail.history.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-foreground/90">{entry.note}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(entry.at)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {detail.status === "PENDING" && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.info("Permintaan dokumen tambahan telah dikirim ke admin.")
                    }
                  >
                    Request Info
                  </Button>
                  <Button variant="destructive" onClick={() => setDialog("REJECT")}>
                    Reject
                  </Button>
                  <Button onClick={() => setDialog("APPROVE")}>
                    <ShieldCheckIcon />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!dialog}
        onOpenChange={(open) => !open && setDialog(null)}
        title={
          dialog === "APPROVE"
            ? `Setujui verifikasi ${detail?.businessName}?`
            : `Tolak verifikasi ${detail?.businessName}?`
        }
        confirmLabel={dialog === "APPROVE" ? "Approve" : "Reject"}
        variant={dialog === "APPROVE" ? "default" : "destructive"}
        requireReason={dialog === "REJECT"}
        reasonLabel="Alasan penolakan"
        onConfirm={() => {
          toast.success(
            dialog === "APPROVE"
              ? `${detail?.businessName} berhasil diverifikasi.`
              : `Verifikasi ${detail?.businessName} ditolak.`
          )
          setDetail(null)
        }}
      />
    </div>
  )
}
