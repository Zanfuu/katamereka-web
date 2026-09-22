"use client"

import * as React from "react"
import { use } from "react"
import { toast } from "sonner"
import { ScaleIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format"
import { getReportsByBusiness } from "@/lib/mock/reports"
import type { Report } from "@/lib/types"

export default function BusinessDetailReportsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [action, setAction] = React.useState<{
    report: Report
    type: "KEEP" | "HIDE" | "REMOVE"
  } | null>(null)

  const reports = getReportsByBusiness(id)

  if (reports.length === 0) {
    return <EmptyState icon={ScaleIcon} title="Tidak ada laporan untuk bisnis ini." />
  }

  return (
    <div className="flex flex-col gap-3">
      {reports.map((report) => (
        <div key={report.id} className="flex flex-col gap-3 rounded-xl border border-border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">{report.reviewerName}</p>
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                {report.reviewExcerpt}
              </p>
            </div>
            <StatusBadge status={report.status} />
          </div>
          <p className="text-sm text-foreground/90">
            <span className="font-medium">Reason:</span> {report.reason}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Dilaporkan oleh {report.reporterName}</span>
            <span>{formatDate(report.createdAt)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setAction({ report, type: "KEEP" })}>
              Keep Review
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAction({ report, type: "HIDE" })}>
              Hide Review
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setAction({ report, type: "REMOVE" })}
            >
              Remove Review
            </Button>
          </div>
        </div>
      ))}

      <ConfirmDialog
        open={!!action}
        onOpenChange={(open) => !open && setAction(null)}
        title={`${action?.type === "KEEP" ? "Pertahankan" : action?.type === "HIDE" ? "Sembunyikan" : "Hapus"} review dari ${action?.report.reviewerName}?`}
        confirmLabel={
          action?.type === "KEEP" ? "Keep Review" : action?.type === "HIDE" ? "Hide Review" : "Remove Review"
        }
        variant={action?.type === "KEEP" ? "default" : "destructive"}
        requireReason={action?.type !== "KEEP"}
        reasonLabel="Alasan moderasi"
        onConfirm={() => toast.success("Keputusan moderasi berhasil disimpan.")}
      />
    </div>
  )
}
