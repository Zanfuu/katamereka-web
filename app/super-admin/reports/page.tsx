"use client"

import * as React from "react"
import { toast } from "sonner"
import { ScaleIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageHeader } from "@/components/page-header"
import { RatingStars } from "@/components/rating-stars"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatDate } from "@/lib/format"
import { reports } from "@/lib/mock/reports"
import type { Report } from "@/lib/types"

export default function SuperAdminReportsPage() {
  const [detail, setDetail] = React.useState<Report | null>(null)
  const [action, setAction] = React.useState<"KEEP" | "HIDE" | "REMOVE" | null>(null)

  const counts = {
    open: reports.filter((r) => r.status === "OPEN").length,
    investigating: reports.filter((r) => r.status === "UNDER_INVESTIGATION").length,
    resolved: reports.filter((r) => r.status === "RESOLVED").length,
  }

  const columns: ResourceTableColumn<Report>[] = [
    {
      key: "review",
      header: "Review",
      render: (report) => (
        <div className="max-w-xs">
          <div className="flex items-center gap-1.5">
            <RatingStars rating={report.reviewRating} size="sm" />
          </div>
          <p className="line-clamp-1 text-xs text-muted-foreground">{report.reviewExcerpt}</p>
        </div>
      ),
    },
    { key: "businessName", header: "Business", render: (r) => r.businessName },
    { key: "reporterName", header: "Reporter", render: (r) => r.reporterName },
    {
      key: "reason",
      header: "Reason",
      render: (report) => (
        <span className="line-clamp-1 max-w-xs text-muted-foreground">{report.reason}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      sortValue: (r) => r.createdAt,
      render: (report) => (
        <span className="text-muted-foreground">{formatDate(report.createdAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (report) => <StatusBadge status={report.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (report) => (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setDetail(report)}>
            View
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports & Disputes"
        description="Selesaikan laporan review yang masuk dari Business Admin."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Open Reports" value={counts.open} deltaTone="negative" icon={ScaleIcon} />
        <StatCard label="Under Investigation" value={counts.investigating} deltaTone="neutral" />
        <StatCard label="Resolved" value={counts.resolved} />
      </div>

      <ResourceTable
        data={reports}
        columns={columns}
        getRowId={(report) => report.id}
        emptyTitle="Tidak ada laporan review."
      />

      <Sheet open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Laporan Review</SheetTitle>
            <SheetDescription>{detail?.businessName}</SheetDescription>
          </SheetHeader>
          {detail && (
            <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Original Review
                </h3>
                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {detail.reviewerName}
                    </span>
                    <RatingStars rating={detail.reviewRating} size="sm" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{detail.reviewExcerpt}</p>
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Report Reason
                </h3>
                <p className="text-sm text-foreground/90">{detail.reason}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Dilaporkan oleh {detail.reporterName} · {formatDate(detail.createdAt)}
                </p>
              </section>

              {detail.evidence && detail.evidence.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                    Evidence
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    {detail.evidence.map((file) => (
                      <div
                        key={file}
                        className="rounded-lg border border-border p-2 text-xs text-muted-foreground"
                      >
                        {file}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Moderation Status
                </h3>
                <StatusBadge status={detail.moderationStatus} />
              </section>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAction("KEEP")}>
                  Keep Review
                </Button>
                <Button variant="outline" onClick={() => setAction("HIDE")}>
                  Hide Review
                </Button>
                <Button variant="destructive" onClick={() => setAction("REMOVE")}>
                  Remove Review
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!action}
        onOpenChange={(open) => !open && setAction(null)}
        title={`${
          action === "KEEP" ? "Pertahankan" : action === "HIDE" ? "Sembunyikan" : "Hapus"
        } review ini?`}
        confirmLabel={action === "KEEP" ? "Keep Review" : action === "HIDE" ? "Hide Review" : "Remove Review"}
        variant={action === "KEEP" ? "default" : "destructive"}
        requireReason
        reasonLabel="Alasan moderasi"
        onConfirm={() => {
          toast.success("Keputusan moderasi berhasil disimpan.")
          setDetail(null)
        }}
      />
    </div>
  )
}
